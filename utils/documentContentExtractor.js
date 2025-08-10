/**
 * 文档内容提取工具函数
 * 用于从Google Docs转换结果中提取和处理各种内容
 */

/**
 * 递归提取节点中的纯文本
 * @param {any} node - 要提取文本的节点
 * @returns {string} 提取的纯文本
 */
export function extractTextFromNode(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text") return node.text || "";
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromNode).join("");
  }
  return "";
}

/**
 * 一次递归同时提取并移除第一个H1标题
 * @param {Array} content - 文档内容数组
 * @returns {Object} 包含firstH1Title和newContent的对象
 */
export function extractAndRemoveFirstH1(content) {
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

/**
 * 提取第一个图片的src作为封面图
 * @param {Array} content - 文档内容数组
 * @returns {string} 第一个图片的src，如果没有则返回空字符串
 */
export function extractFirstImageSrc(content) {
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

/**
 * 创建带Socket通知的图片上传器
 * @param {Object} io - Socket.io实例
 * @param {string} docId - 文档ID
 * @returns {Function} 图片上传函数
 */
export function createImageUploaderWithNotifications(io, docId) {
  return async (contentUri, alt) => {
    try {
      // 通知：开始处理图片
      sendSocketNotification(io, "image:process:start", {
        docId,
        imageUrl: contentUri,
        message: "开始处理图片...",
      });

      // 导入原始图片上传器
      const { imageUploader } = await import("./imageUploader.js");

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

/**
 * 处理文档转换结果，提取关键信息
 * @param {Object} richtext - 转换后的富文本对象
 * @returns {Object} 包含firstH1Title和coverImage的对象
 */
export function processDocumentResult(richtext) {
  const result = extractAndRemoveFirstH1(richtext.content || []);
  richtext.content = result.newContent;
  const firstH1Title = result.firstH1Title;
  const coverImage = extractFirstImageSrc(richtext.content || []);
  
  return { firstH1Title, coverImage };
} 