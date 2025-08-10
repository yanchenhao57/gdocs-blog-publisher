// utils/googleAuth.js
// 获取 Google OAuth2 客户端的工具函数
import { google } from "googleapis";
import { initProxy } from './proxyConfig.js';

/**
 * 获取 Google OAuth2 认证客户端
 * @returns {OAuth2Client} Google OAuth2 客户端实例
 */
export async function getGoogleAuthClient() {
  // 自动初始化代理配置
  const proxyConfig = await initProxy();
  
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  // 如果检测到代理，配置 Google API 使用代理
  if (proxyConfig.httpAgent || proxyConfig.httpsAgent) {
    console.log('🌐 使用代理配置 Google API 客户端');
    google.options({
      ...proxyConfig
    });
  }

  return auth;
}
