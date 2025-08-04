import express from "express";
import { fetchGoogleDocAsHtml } from "../../utils/fetchHtmlFromGoogleDoc.js";
import { htmlToMarkdown } from "../../utils/htmlToMarkdown.js";
import { fetchGoogleDoc } from "../../utils/googleDocs.js";
import { convertGoogleDocsToStoryblok } from "../../utils/googleDocsToStoryblok.js";
import { aiStructuredRequest } from "../../utils/aiRequest.js";
import { generateAiStructuredData } from "../../utils/convertAiStructuredData.js";
import { sendSocketNotification } from "../../utils/socketIO.js";

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

// 封装AI结构化分析函数
// async function generateAiStructuredData(
//   markdown,
//   io,
//   docId,
//   eventPrefix = "ai"
// ) {
//   const messages = [
//     {
//       role: "system",
//       content: `You are a content analysis assistant. Analyze the provided Markdown document and extract the following fields.
//   Return the result as **valid raw JSON only** — without explanations, comments, or code blocks.

//   {
//     "seo_title": string,       // SEO-optimized title. Short, impactful, contains relevant keywords, matches the article's language. Used for the meta title.
//     "seo_description": string, // SEO-optimized description. Under 100 characters, contains relevant keywords, matches the article's language. Used for the meta description.
//     "heading_h1": string,      // Main heading (H1) for the article page. Can be longer/more descriptive than seo_title. Must match the article's language.
//     "slug": string,            // URL-friendly path in lowercase English only. Use a–z, 0–9, and hyphens (-) only.
//                                // No spaces, underscores, or non-English characters.
//                                // If the article is in Japanese, generate a concise English slug that reflects the topic.
//     "reading_time": number,    // Estimated reading time in minutes. Integer value, maximum 12.
//     "language": string,        // Main language of the article: "en" for English, "jp" for Japanese.
//     "cover_alt": string        // Alt text for the cover image. Describe the image for SEO and accessibility. Must match the article's language.
//   }

//   Formatting rules:
//   1. Return only valid JSON, with double quotes around all keys and string values.
//   2. Do not include trailing commas.
//   3. Do not add any extra fields.
//   4. Do not output broken characters or the "�" symbol.
//   5. All values must match the specified type.
//   6. If unsure about a value, return an empty string "".
//   `,
//     },
//     {
//       role: "user",
//       content: `Here is the Markdown document content:\n\n${markdown}`,
//     },
//   ];

//   const schema = {
//     type: "object",
//     properties: {
//       seo_title: { type: "string" },
//       seo_description: { type: "string" },
//       heading_h1: { type: "string" },
//       slug: { type: "string" },
//       reading_time: { type: "number" },
//       language: { type: "string", enum: ["en", "jp"] },
//       cover_alt: { type: "string" },
//     },
//     required: [
//       "seo_title",
//       "seo_description",
//       "heading_h1",
//       "slug",
//       "reading_time",
//       "language",
//       "cover_alt",
//     ],
//   };

//   // 通知：开始AI结构化分析
//   sendSocketNotification(io, `${eventPrefix}:analysis:start`, {
//     docId,
//     message: "开始AI结构化分析...",
//   });

//   const aiMeta = await aiStructuredRequest(messages, schema, {
//     max_tokens: 500,
//     temperature: 0,
//   });

//   // 通知：AI分析完成
//   sendSocketNotification(io, `${eventPrefix}:analysis:success`, {
//     docId,
//     message: "AI结构化分析完成",
//     aiMeta,
//   });

//   return aiMeta;
// }

// 创建带Socket通知的图片上传器
function createImageUploaderWithNotifications(io, docId) {
  return async (contentUri, alt) => {
    try {
      // 通知：开始处理图片
      sendSocketNotification(io, "image:process:start", {
        docId,
        imageUrl: contentUri,
        message: "开始处理图片...",
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
        message: "图片处理完成",
      });

      return result;
    } catch (error) {
      // 通知：图片处理失败
      sendSocketNotification(io, "image:process:error", {
        docId,
        imageUrl: contentUri,
        message: "图片处理失败",
        error: error.message,
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

    // 3. AI结构化分析（先进行，避免图片上传后AI失败）
    const aiMeta = await generateAiStructuredData(markdown, io, docId);
    // let aiMeta;
    // try {
    //   aiMeta = await generateAiStructuredData(markdown, io, docId);
    // } catch (error) {
    //   console.log("⚠️ AI分析失败，使用默认值:", error.message);
    //   // AI失败时使用默认空值
    //   aiMeta = {
    //     seo_title: "",
    //     seo_description: "",
    //     heading_h1: "",
    //     slug: "",
    //     reading_time: 1,
    //     language: "en",
    //     cover_alt: "",
    //   };

    //   // 通知AI分析失败
    //   sendSocketNotification(io, "ai:analysis:error", {
    //     docId,
    //     message: "AI分析失败，使用默认值",
    //     error: error.message,
    //   });
    // }

    // 通知：开始转换Google Docs到Storyblok
    sendSocketNotification(io, "storyblok:convert:start", {
      docId,
      message: "开始转换Google Docs到Storyblok格式...",
    });

    // 4. Google Docs → Richtext（包含图片上传）
    const docJson = await fetchGoogleDoc(docId);
    const richtext = await convertGoogleDocsToStoryblok(
      docJson,
      createImageUploaderWithNotifications(io, docId)
    );

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

// 新增：regenerate接口 - 重新生成AI结构化数据
router.post("/regenerate", async (req, res) => {
  console.log("🔄 ~ router.post /regenerate ~ req.body:", req.body);

  // 获取Socket.io实例
  const io = req.app.get("io");

  try {
    const { docId, markdown } = req.body;
    if (!docId) return res.status(400).json({ error: "docId is required" });
    if (!markdown)
      return res.status(400).json({ error: "markdown is required" });

    // 使用相同的AI提示重新生成结构化数据
    let aiMeta;
    try {
      aiMeta = await generateAiStructuredData(
        markdown,
        io,
        docId,
        "ai:regenerate"
      );

      res.json({
        aiMeta,
        message: "AI结构化数据重新生成成功",
      });
    } catch (error) {
      console.log("⚠️ AI重新生成失败:", error.message);
      // AI失败时使用默认空值
      aiMeta = {
        seo_title: "",
        seo_description: "",
        heading_h1: "",
        slug: "",
        reading_time: 1,
        language: "en",
        cover_alt: "",
      };

      // 通知AI重新生成失败
      sendSocketNotification(io, "ai:regenerate:error", {
        docId,
        message: "AI重新生成失败，使用默认值",
        error: error.message,
      });

      res.json({
        aiMeta,
        message: "AI重新生成失败，使用默认值",
        error: error.message,
      });
    }
  } catch (err) {
    // 通知：重新生成过程中出现错误
    sendSocketNotification(io, "ai:regenerate:error", {
      docId: req.body.docId,
      message: "重新生成AI结构化数据时出现错误",
      error: err.message,
    });

    res.status(500).json({ error: err.message });
  }
});

export default router;
