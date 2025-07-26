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

router.post("/", async (req, res) => {
  console.log("🚀 ~ router.post ~ e:", req.body);
  try {
    const { docId } = req.body;
    if (!docId) return res.status(400).json({ error: "docId is required" });

    // 1. Google Docs → HTML
    const html = await fetchGoogleDocAsHtml(docId);
    console.log("🚀 ~ router.post ~ html: success");

    // 2. HTML → Markdown
    const markdown = htmlToMarkdown(html);
    console.log("🚀 ~ router.post ~ markdown: success");

    // 3. Google Docs → Richtext
    const docJson = await fetchGoogleDoc(docId);
    const richtext = await convertGoogleDocsToStoryblok(docJson, imageUploader);

    // 新实现：一次递归提取并移除第一个H1
    const result = extractAndRemoveFirstH1(richtext.content || []);
    richtext.content = result.newContent;
    const firstH1Title = result.firstH1Title;
    // 新增：提取第一个图片src作为封面图
    const coverImage = extractFirstImageSrc(richtext.content || []);

    // 4. AI结构化元数据
    const messages = [
      {
        role: "system",
        content: `你是一个内容分析助手。请从用户提供的 Markdown 文档中提取以下字段，并返回 JSON 格式：
                    {
                        "seo_title": string,          // SEO 优化的标题，简短有力，包含关键词，用于 meta title
                        "seo_description": string,    // SEO 优化的描述，100字以内，包含关键词，用于 meta description
                        "heading_h1": string,         // 文章页面显示的主标题，可以更具描述性和吸引力
                        "slug": string,               // 用于URL的路径，比如 "my-blog-post"，要求小写字母，单词用连字符连接
                        "reading_time": number,       // 阅读时间，单位为分钟，必须是数字类型
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

    res.json({
      html,
      markdown,
      richtext,
      aiMeta,
      firstH1Title, // 新增字段
      coverImage, // 新增字段
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
