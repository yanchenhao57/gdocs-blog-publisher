import { google } from "googleapis";
import { getAuthClient } from "./googleAuth.js";

/**
 * 获取 Google Docs 文档的 HTML 内容
 * @param {string} docId - 文档ID
 * @returns {Promise<string>} HTML 字符串
 */
export async function fetchGoogleDocAsHtml(docId) {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });
  try {
    const res = await drive.files.export(
      {
        fileId: docId,
        mimeType: "text/html",
      },
      { responseType: "text" }
    );
    return res.data;
  } catch (err) {
    console.error("🚀 ~ fetchGoogleDocAsHtml ~ err:", err);
    throw err;
  }
}
