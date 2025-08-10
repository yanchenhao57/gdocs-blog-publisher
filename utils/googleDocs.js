// utils/googleDocs.js
// 拉取 Google Docs 文档内容的工具函数
import { google } from "googleapis";
import { getGoogleAuthClient } from "./googleAuth.js";

/**
 * 拉取 Google Docs 文档内容
 * @param {string} documentId
 * @returns {Promise<Object>} 文档数据
 */
export async function fetchGoogleDoc(documentId) {
  const auth = await getGoogleAuthClient();
  const docs = google.docs({ version: "v1", auth });
  const res = await docs.documents.get({ documentId });
  console.log("🚀 ~ fetchGoogleDoc success");
  return res.data;
}
