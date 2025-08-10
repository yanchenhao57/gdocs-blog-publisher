/**
 * AI重新生成处理器
 * 用于处理AI结构化数据的重新生成请求
 */

import { generateAiStructuredData } from "./convertAiStructuredData.js";
import { sendSocketNotification } from "./socketIO.js";

/**
 * 处理AI结构化数据的重新生成
 * @param {string} docId - 文档ID
 * @param {string} markdown - Markdown内容
 * @param {string} userLanguage - 用户指定的语言
 * @param {Object} io - Socket.io实例
 * @returns {Promise<Object>} 重新生成的结果
 */
export async function handleAiRegeneration(docId, markdown, userLanguage, io) {
  try {
    // 使用相同的AI提示重新生成结构化数据，支持用户指定语言
    const aiMeta = await generateAiStructuredData(
      markdown,
      io,
      docId,
      "ai:regenerate",
      userLanguage // 传递用户指定的语言
    );

    return {
      aiMeta,
      message: "AI结构化数据重新生成成功",
    };
  } catch (error) {
    console.log("⚠️ AI重新生成失败:", error.message);
    
    // AI失败时使用默认空值
    const aiMeta = {
      seo_title: "",
      seo_description: "",
      heading_h1: "",
      slug: "",
      reading_time: 1,
      language: userLanguage || "en", // 使用用户指定语言或默认英文
      cover_alt: "",
    };

    // 通知AI重新生成失败
    await sendSocketNotification(io, "ai:regenerate:error", {
      docId,
      message: "AI重新生成失败，使用默认值",
      error: error.message,
    });

    return {
      aiMeta,
      message: "AI重新生成失败，使用默认值",
      error: error.message,
    };
  }
} 