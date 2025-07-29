import express from "express";
import { fetchGoogleDocAsHtml } from "../../utils/fetchHtmlFromGoogleDoc.js";
import { htmlToMarkdown } from "../../utils/htmlToMarkdown.js";
import { fetchGoogleDoc } from "../../utils/googleDocs.js";
import { convertGoogleDocsToStoryblok } from "../../utils/googleDocsToStoryblok.js";
import { imageUploader } from "../../utils/imageUploader.js";
import { aiStructuredRequest } from "../../utils/aiRequest.js";

const router = express.Router();

// 辅助函数：递归提取节点中的纯文本
function extractTextFromNode(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text") return node.text || "";
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromNode).join("");
  }
  return "";
}

// 一次递归同时提取并移除第一个H1
function extractAndRemoveFirstH1(content) {
  let firstH1Title = "";
  let removed = false;
  function helper(arr) {
    if (removed) return arr;
    return arr.filter((node) => {
      if (!removed && node.type === "heading" && node.attrs?.level === 1) {
        firstH1Title = extractTextFromNode(node);
        removed = true;
        return false;
      }
      if (Array.isArray(node.content)) {
        node.content = helper(node.content);
      }
      return true;
    });
  }
  const newContent = helper(content);
  return { firstH1Title, newContent };
}

// 提取第一个图片的 src
function extractFirstImageSrc(content) {
  for (const node of content) {
    if (node.type === "image" && node.attrs?.src) {
      return node.attrs.src;
    }
    if (Array.isArray(node.content)) {
      const found = extractFirstImageSrc(node.content);
      if (found) return found;
    }
  }
  return "";
}

// Socket通知辅助函数
function sendSocketNotification(io, event, data) {
  if (io) {
    io.emit(event, {
      timestamp: new Date().toISOString(),
      ...data,
    });
    console.log(`🔌 Socket通知: ${event}`, data);
  }
}

// 创建带Socket通知的图片上传器
function createImageUploaderWithNotifications(io, docId) {
  return async (contentUri, alt) => {
    try {
      // 通知：开始处理图片
      sendSocketNotification(io, "image:process:start", {
        docId,
        imageUrl: contentUri,
        message: "开始处理图片..."
      });
      
      // 导入原始图片上传器
      const { imageUploader } = await import("../../utils/imageUploader.js");
      
      // 调用原始上传器
      const result = await imageUploader(contentUri, alt);
      
      // 通知：图片处理完成
      sendSocketNotification(io, "image:process:success", {
        docId,
        imageUrl: contentUri,
        resultUrl: result,
        message: "图片处理完成"
      });
      
      return result;
    } catch (error) {
      // 通知：图片处理失败
      sendSocketNotification(io, "image:process:error", {
        docId,
        imageUrl: contentUri,
        message: "图片处理失败",
        error: error.message
      });
      throw error;
    }
  };
}

router.post("/", async (req, res) => {
  console.log("🚀 ~ router.post ~ e:", req.body);

  // 获取Socket.io实例
  const io = req.app.get("io");

  try {
    const { docId } = req.body;
    if (!docId) return res.status(400).json({ error: "docId is required" });

    // 通知：开始拉取Google Docs信息
    sendSocketNotification(io, "googleDocs:fetch:start", {
      docId,
      message: "开始拉取Google Docs文档信息...",
    });

    // 1. Google Docs → HTML
    const html = await fetchGoogleDocAsHtml(docId);
    console.log("🚀 ~ router.post ~ html: success");

    // 通知：Google Docs信息拉取成功
    sendSocketNotification(io, "googleDocs:fetch:success", {
      docId,
      message: "Google Docs文档信息拉取成功",
    });

    // 2. HTML → Markdown
    const markdown = htmlToMarkdown(html);
    console.log("🚀 ~ router.post ~ markdown: success");

    // 通知：开始转换Google Docs到Storyblok
    sendSocketNotification(io, "storyblok:convert:start", {
      docId,
      message: "开始转换Google Docs到Storyblok格式...",
    });

    // 3. Google Docs → Richtext
    const docJson = await fetchGoogleDoc(docId);
    const richtext = await convertGoogleDocsToStoryblok(docJson, createImageUploaderWithNotifications(io, docId));

    // 通知：Storyblok转换完成
    sendSocketNotification(io, "storyblok:convert:success", {
      docId,
      message: "Google Docs到Storyblok转换完成",
    });

    // 新实现：一次递归提取并移除第一个H1
    const result = extractAndRemoveFirstH1(richtext.content || []);
    richtext.content = result.newContent;
    const firstH1Title = result.firstH1Title;
    // 新增：提取第一个图片src作为封面图
    const coverImage = extractFirstImageSrc(richtext.content || []);

    // 通知：开始AI结构化分析
    sendSocketNotification(io, "ai:analysis:start", {
      docId,
      message: "开始AI结构化分析...",
    });

    // 4. AI结构化元数据
    const messages = [
      {
        role: "system",
        content: `你是一个内容分析助手。请从用户提供的 Markdown 文档中提取以下字段，并返回 JSON 格式：
                    {
                        "seo_title": string,          // SEO 优化的标题，简短有力，包含关键词，用于 meta title
                        "seo_description": string,    // SEO 优化的描述，100字以内，包含关键词，用于 meta description
                        "heading_h1": string,         // 文章页面显示的主标题，可以更具描述性和吸引力
                        "slug": string,               // 用于URL的路径，比如 "my-blog-post"，要求小写字母，单词用连字符连接，请你根据文章内容，用简洁、清晰、SEO 友好的英文单词来生成一个 URL slug，不要音译日文内容，不要使用中文
                        "reading_time": number,       // 阅读时间，单位为分钟，必须是数字类型，不要超过12分钟
                        "language": string,           // 根据文章内容判断语言，返回 "en" 或 "jp"。如果主要是日文返回"jp"，否则返回"en"
                        "cover_alt": string           // 封面图 Alt text，描述图片内容，有助于 SEO 和无障碍访问
                    }
                    请只返回纯 JSON（不要有额外说明或代码块）。`,
      },
      {
        role: "user",
        content: `以下是 Markdown 文档内容：\n\n${markdown}`,
      },
    ];

    const schema = {
      type: "object",
      properties: {
        seo_title: { type: "string" },
        seo_description: { type: "string" },
        heading_h1: { type: "string" },
        slug: { type: "string" },
        reading_time: { type: "number" },
        language: { type: "string", enum: ["en", "jp"] },
        cover_alt: { type: "string" },
      },
      required: [
        "seo_title",
        "seo_description",
        "heading_h1",
        "slug",
        "reading_time",
        "language",
        "cover_alt",
      ],
    };

    const aiMeta = await aiStructuredRequest(messages, schema, {
      max_tokens: 500,
      temperature: 0.8,
    });

    // 通知：AI分析完成
    sendSocketNotification(io, "ai:analysis:success", {
      docId,
      message: "AI结构化分析完成",
      aiMeta,
    });

    // 通知：整个转换流程完成
    sendSocketNotification(io, "convert:complete", {
      docId,
      message: "文档转换流程全部完成",
      summary: {
        hasHtml: !!html,
        hasMarkdown: !!markdown,
        hasRichtext: !!richtext,
        hasAiMeta: !!aiMeta,
        firstH1Title,
        coverImage,
      },
    });

    res.json({
      html,
      markdown,
      richtext,
      aiMeta,
      firstH1Title, // 新增字段
      coverImage, // 新增字段
    });
  } catch (err) {
    // 通知：转换过程中出现错误
    sendSocketNotification(io, "convert:error", {
      docId: req.body.docId,
      message: "转换过程中出现错误",
      error: err.message,
    });

    res.status(500).json({ error: err.message });
  }
});

export default router;
