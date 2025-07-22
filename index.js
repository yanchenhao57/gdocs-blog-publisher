import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { fetchGoogleDocAsHtml } from "./utils/fetchHtmlFromGoogleDoc.js";
import { imageUploader } from "./utils/imageUploader.js";
import { htmlToMarkdown } from "./utils/htmlToMarkdown.js";
import { publishBlogToStoryblok } from "./utils/publishBlogToStoryblok.js";
import { BLOG_EN_PARENT_ID } from "./constant/parentIds.js";
import { BLOG_EN_COMPONENT_TYPE } from "./constant/componentType.js";
import { BLOG_EN_SLUG_PREFIX } from "./constant/slugPrefix.js";
import { fetchGoogleDoc } from "./utils/googleDocs.js";
import { logFile } from "./utils/logFile.js";
import { aiStructuredRequest } from "./utils/aiRequest.js";
import { convertGoogleDocsToStoryblok } from "./utils/googleDocsToStoryblok.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 示例调用
 */
(async () => {
  const logDir = path.join(__dirname, "log");
  const documentId = "1HBWkPDoWzQdQ7wU7hooLGgoVK5SEYWl5xvX_3s_2RzM";

  try {
    /**
     * Google Docs 转 html 转 markdown
     */
    const docHtml = await fetchGoogleDocAsHtml(documentId);
    const markdown = htmlToMarkdown(docHtml);

    /**
     * Google Docs 转 storyblok richtext（支持图片上传）
     */
    const docJson = await fetchGoogleDoc(documentId);
    logFile(`${documentId}-gdocs`, "json", logDir, docJson);
    const storyblokRichtext = await convertGoogleDocsToStoryblok(
      docJson,
      imageUploader
    );
    logFile(documentId, "json", logDir, storyblokRichtext);

    // 构造AI消息
    const messages = [
      {
        role: "system",
        content: `你是一个内容提取助手。请从用户提供的 Markdown 文档中提取以下字段，并返回 JSON 格式：\n{
                  "title": string,               // 用一句话总结这篇文章的核心标题
                  "slug": string,                // 用于URL的路径，比如 "my-blog-post"，要求小写字母，单词用连字符连接
                  "description": string,         // 100字以内的简洁摘要，用于页面描述
                  "reading_time": string         // 阅读时间，单位为分钟
                }\n请只返回纯 JSON（不要有额外说明或代码块）。`,
      },
      {
        role: "user",
        content: `以下是 Markdown 文档内容：\n\n${markdown}`,
      },
    ];

    // 定义结构化schema
    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        slug: { type: "string" },
        description: { type: "string" },
        reading_time: { type: "string" },
      },
      required: ["title", "slug", "description"],
    };

    // 使用结构化AI请求
    const aiResult = await aiStructuredRequest(messages, schema, {
      max_tokens: 500,
      temperature: 0.8,
    });
    console.log("🚀 ~ aiResult:", aiResult);

    const blogData = {
      slug: "test-blog-from-sdk-3",
      title: aiResult.title,
      body: storyblokRichtext,
      coverUrl:
        "https://www.notta.ai/pictures/03bd0da9-ff60-4a4c-a96f-26694c7be9e5-jp-aichat.png",
      date: "2025-07-15 00:00",
      description: aiResult.description,
      canonical: "https://www.notta.ai/blog/test-blog-from-sdk",
      author_id: "ranee-zhang",
      reading_time: aiResult.reading_time,
      parent_id: BLOG_EN_PARENT_ID,
      is_show_newsletter_dialog: false,
      component: BLOG_EN_COMPONENT_TYPE,
      slug_prefix: BLOG_EN_SLUG_PREFIX,
    };
    await publishBlogToStoryblok(blogData);
  } catch (err) {
    console.error("❌ 拉取文档失败:", err.message);
  }
})();
