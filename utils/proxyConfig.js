// utils/proxyConfig.js
// 智能代理配置，自动检测和使用 ClashX 代理

import { HttpsProxyAgent } from 'https-proxy-agent';

// ClashX 默认配置
const CLASHX_CONFIG = {
  http: 'http://127.0.0.1:7890',
  https: 'http://127.0.0.1:7890',
  socks5: 'socks5://127.0.0.1:7891'
};

// 检测代理是否可用
async function checkProxy(proxyUrl) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://httpbin.org/ip', {
      signal: controller.signal,
      agent: new HttpsProxyAgent(proxyUrl)
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 自动检测可用的代理
export async function autoDetectProxy() {
  // 检查是否禁用了自动检测
  if (process.env.DISABLE_PROXY_AUTO_DETECT === 'true') {
    console.log('🚫 代理自动检测已禁用 (DISABLE_PROXY_AUTO_DETECT=true)');
    
    // 仍然检查环境变量中是否有手动设置的代理
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      console.log(`✅ 使用环境变量代理: ${proxy}`);
      return proxy;
    }
    
    return null;
  }
  
  console.log('🔍 自动检测代理配置...');
  
  // 优先使用环境变量中的代理
  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    console.log(`✅ 使用环境变量代理: ${proxy}`);
    return proxy;
  }
  
  // 检测 ClashX 代理
  for (const [type, url] of Object.entries(CLASHX_CONFIG)) {
    console.log(`🔍 检测 ${type} 代理: ${url}`);
    if (await checkProxy(url)) {
      console.log(`✅ 检测到可用代理: ${url}`);
      return url;
    }
  }
  
  console.log('❌ 未检测到可用代理');
  return null;
}

// 获取代理配置
export function getProxyConfig(proxyUrl) {
  if (!proxyUrl) return {};
  
  try {
    const agent = new HttpsProxyAgent(proxyUrl);
    return {
      httpAgent: agent,
      httpsAgent: agent
    };
  } catch (error) {
    console.error('❌ 创建代理代理失败:', error.message);
    return {};
  }
}

// 设置全局代理环境变量
export function setProxyEnv(proxyUrl) {
  console.log("🚀 ~ setProxyEnv ~ proxyUrl:", proxyUrl)
  if (!proxyUrl) return;
  
  process.env.HTTP_PROXY = proxyUrl;
  process.env.HTTPS_PROXY = proxyUrl;
  process.env.http_proxy = proxyUrl;
  process.env.https_proxy = proxyUrl;
  
  console.log(`✅ 已设置代理环境变量: ${proxyUrl}`);
}

// 初始化代理配置
export async function initProxy() {
  const proxyUrl = await autoDetectProxy();
  if (proxyUrl) {
    setProxyEnv(proxyUrl);
    return getProxyConfig(proxyUrl);
  }
  return {};
} 