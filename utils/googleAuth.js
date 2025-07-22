// utils/googleAuth.js
// 获取 Google OAuth2 客户端的工具函数
import { google } from "googleapis";

/**
 * 初始化 OAuth2 客户端
 * @returns {OAuth2Client} 已认证的 OAuth2 客户端
 */
function getAuthClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return auth;
}

export { getAuthClient };
