/**
 * 文档转换流程工具函数
 * 用于管理Google Docs到Storyblok的转换流程
 */

import { fetchGoogleDocAsHtml } from "./fetchHtmlFromGoogleDoc.js";
import { htmlToMarkdown } from "./htmlToMarkdown.js";
import { fetchGoogleDoc } from "./googleDocs.js";
import { convertGoogleDocsToStoryblok } from "./googleDocsToStoryblok.js";
import { generateAiStructuredData } from "./convertAiStructuredData.js";
import { sendSocketNotification } from "./socketIO.js";
import { processDocumentResult } from "./documentContentExtractor.js";

/**
 * 执行完整的文档转换流程
 * @param {string} docId - Google Docs文档ID
 * @param {Object} io - Socket.io实例
 * @returns {Promise<Object>} 转换结果
 */
export async function executeDocumentConversion(docId, io) {
  try {
    // 1. Google Docs → HTML
    await sendSocketNotification(io, "googleDocs:fetch:start", {
      docId,
      message: "开始拉取Google Docs文档信息...",
    });

    const html = await fetchGoogleDocAsHtml(docId);
    console.log("🚀 ~ HTML转换成功");

    await sendSocketNotification(io, "googleDocs:fetch:success", {
      docId,
      message: "Google Docs文档信息拉取成功",
    });

    // 2. HTML → Markdown
    const markdown = htmlToMarkdown(html);
    console.log("🚀 ~ Markdown转换成功");

    // 3. AI结构化分析
    const aiMeta = await generateAiStructuredData(markdown, io, docId);

    // 4. Google Docs → Richtext（包含图片上传）
    await sendSocketNotification(io, "storyblok:convert:start", {
      docId,
      message: "开始转换Google Docs到Storyblok格式...",
    });

    const docJson = await fetchGoogleDoc(docId);
    const richtext = await convertGoogleDocsToStoryblok(
      docJson,
      createImageUploaderWithNotifications(io, docId)
    );

    await sendSocketNotification(io, "storyblok:convert:success", {
      docId,
      message: "Google Docs到Storyblok转换完成",
    });

    // 5. 处理转换结果，提取关键信息
    const { firstH1Title, coverImage } = processDocumentResult(richtext);

    // 6. 发送完成通知
    await sendSocketNotification(io, "convert:complete", {
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

    return {
      html,
      markdown,
      richtext,
      aiMeta,
      firstH1Title,
      coverImage,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 创建带Socket通知的图片上传器
 * @param {Object} io - Socket.io实例
 * @param {string} docId - 文档ID
 * @returns {Function} 图片上传函数
 */
function createImageUploaderWithNotifications(io, docId) {
  return async (contentUri, alt) => {
    try {
      await sendSocketNotification(io, "image:process:start", {
        docId,
        imageUrl: contentUri,
        message: "开始处理图片...",
      });

      const { imageUploader } = await import("./imageUploader.js");
      const result = await imageUploader(contentUri, alt);

      await sendSocketNotification(io, "image:process:success", {
        docId,
        imageUrl: contentUri,
        resultUrl: result,
        message: "图片处理完成",
      });

      return result;
    } catch (error) {
      await sendSocketNotification(io, "image:process:error", {
        docId,
        imageUrl: contentUri,
        message: "图片处理失败",
        error: error.message,
      });
      throw error;
    }
  };
}
