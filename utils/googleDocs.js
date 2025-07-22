// utils/googleDocs.js
// 拉取 Google Docs 文档内容的工具函数
import { google } from "googleapis";
import { getAuthClient } from "./googleAuth.js";

/**
 * 拉取 Google Docs 文档内容
 * @param {string} documentId
 * @returns {Promise<Object>} 文档数据
 */
export async function fetchGoogleDoc(documentId) {
  const auth = getAuthClient();
  const docs = google.docs({ version: "v1", auth });
  const res = await docs.documents.get({ documentId });
  return res.data;
}
