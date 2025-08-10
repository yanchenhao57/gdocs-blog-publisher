// config.js
// 配置文件，包含代理设置和网络配置

export const config = {
  // 代理配置
  proxy: {
    // 常见的代理端口，根据你的实际情况修改
    http: process.env.HTTP_PROXY || 'http://127.0.0.1:7890',
    https: process.env.HTTPS_PROXY || 'http://127.0.0.1:7890',
    // 或者使用 SOCKS5
    // http: 'socks5://127.0.0.1:1080',
    // https: 'socks5://127.0.0.1:1080',
  },
  
  // Google API 配置
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
  
  // 网络超时配置
  network: {
    timeout: 30000, // 30秒
    retries: 3,
  }
};

// 检查是否需要代理
export const needsProxy = () => {
  return process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
};

// 获取代理配置
export const getProxyConfig = () => {
  if (needsProxy()) {
    return {
      httpAgent: new (require('https-proxy-agent').HttpsProxyAgent)(config.proxy.http),
      httpsAgent: new (require('https-proxy-agent').HttpsProxyAgent)(config.proxy.https),
    };
  }
  return {};
}; 