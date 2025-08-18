/**
 * Token 计算和内容管理工具
 * 用于处理AI请求中的token限制问题
 */

/**
 * 计算文本的大概token数量（粗略估算）
 * @param {string} text - 要计算的文本
 * @returns {number} 估算的token数量
 */
export function estimateTokenCount(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // 粗略估算：英文平均1个token约4个字符，中日文平均1个token约1-2个字符
  const englishChars = text.match(/[a-zA-Z0-9\s]/g)?.length || 0;
  const cjkChars = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g)?.length || 0;
  const otherChars = text.length - englishChars - cjkChars;
  
  return Math.ceil(englishChars / 4 + cjkChars * 1.5 + otherChars / 3);
}

/**
 * 估算消息数组的总token数
 * @param {Array} messages - 消息数组
 * @returns {number} 估算的总token数
 */
export function estimateMessagesTokenCount(messages) {
  if (!Array.isArray(messages)) return 0;
  
  return messages.reduce((total, message) => {
    if (typeof message === 'string') {
      return total + estimateTokenCount(message);
    }
    if (message && message.content) {
      return total + estimateTokenCount(message.content);
    }
    return total;
  }, 0);
}

/**
 * 检查请求是否会超出token限制
 * @param {Array|string} messages - 消息内容
 * @param {number} maxTokens - 最大token限制（默认120000，留足余量）
 * @returns {Object} 包含isValid和estimatedTokens的对象
 */
export function validateRequestSize(messages, maxTokens = 120000) {
  const estimatedTokens = Array.isArray(messages) 
    ? estimateMessagesTokenCount(messages)
    : estimateTokenCount(messages);
    
  return {
    isValid: estimatedTokens <= maxTokens,
    estimatedTokens,
    maxTokens,
    utilization: (estimatedTokens / maxTokens * 100).toFixed(1)
  };
}

/**
 * 智能截取文本内容，保持结构完整性
 * @param {string} text - 原始文本内容
 * @param {number} maxTokens - 最大token数限制
 * @param {Object} options - 截取选项
 * @returns {Object} 包含truncated text和元信息的对象
 */
export function intelligentTruncateText(text, maxTokens = 100000, options = {}) {
  const {
    preserveStructure = true,
    preferStart = true,
    minRetainRatio = 0.3
  } = options;
  
  if (!text || typeof text !== 'string') {
    return { text: '', truncated: false, originalTokens: 0, newTokens: 0 };
  }
  
  const originalTokens = estimateTokenCount(text);
  
  if (originalTokens <= maxTokens) {
    return { 
      text, 
      truncated: false, 
      originalTokens, 
      newTokens: originalTokens 
    };
  }
  
  console.log(`正在截取内容: ${originalTokens} tokens -> ${maxTokens} tokens (${(maxTokens/originalTokens*100).toFixed(1)}%)`);
  
  let result = text;
  
  if (preserveStructure) {
    // 优先保留结构的智能截取
    result = truncateWithStructure(text, maxTokens, preferStart);
  } else {
    // 简单按比例截取
    const targetLength = Math.floor(text.length * (maxTokens / originalTokens));
    result = preferStart ? text.substring(0, targetLength) : text.substring(text.length - targetLength);
  }
  
  // 确保截取结果不会太短
  const finalTokens = estimateTokenCount(result);
  if (finalTokens < maxTokens * minRetainRatio) {
    console.warn(`截取结果过短 (${finalTokens} tokens)，使用简单截取`);
    const targetLength = Math.floor(text.length * minRetainRatio);
    result = text.substring(0, targetLength);
  }
  
  const newTokens = estimateTokenCount(result);
  
  return {
    text: result,
    truncated: true,
    originalTokens,
    newTokens,
    compressionRatio: (newTokens / originalTokens).toFixed(3)
  };
}

/**
 * 保持结构的智能截取
 * @param {string} text - 原始文本
 * @param {number} maxTokens - 最大token数
 * @param {boolean} preferStart - 是否优先保留开头
 * @returns {string} 截取后的文本
 */
function truncateWithStructure(text, maxTokens, preferStart = true) {
  const lines = text.split('\n');
  let result = '';
  let currentTokens = 0;
  
  if (preferStart) {
    // 从开头截取，优先保留标题和重要内容
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineTokens = estimateTokenCount(line + '\n');
      
      if (currentTokens + lineTokens > maxTokens) {
        // 如果是标题，尝试保留（允许轻微超出）
        if (line.startsWith('#') && currentTokens + lineTokens < maxTokens * 1.1) {
          result += line + '\n';
          currentTokens += lineTokens;
        }
        break;
      }
      
      result += line + '\n';
      currentTokens += lineTokens;
    }
  } else {
    // 从结尾截取
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const lineTokens = estimateTokenCount(line + '\n');
      
      if (currentTokens + lineTokens > maxTokens) {
        break;
      }
      
      result = line + '\n' + result;
      currentTokens += lineTokens;
    }
  }
  
  return result.trim();
}

/**
 * 模型的上下文限制配置
 */
export const MODEL_LIMITS = {
  'mercury-coder-small': 128000,
  'mercury-coder-large': 128000,
  'gpt-4': 8192,
  'gpt-4-32k': 32768,
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-16k': 16384
};

/**
 * 获取模型的上下文限制
 * @param {string} modelName - 模型名称
 * @returns {number} 上下文限制token数
 */
export function getModelLimit(modelName) {
  return MODEL_LIMITS[modelName] || 4096; // 默认值
}

/**
 * 为特定模型优化请求大小
 * @param {Array|string} messages - 消息内容
 * @param {string} modelName - 模型名称
 * @param {number} reservedTokens - 为响应预留的token数
 * @returns {Object} 优化后的消息和元信息
 */
export function optimizeForModel(messages, modelName = 'mercury-coder-small', reservedTokens = 2000) {
  const modelLimit = getModelLimit(modelName);
  const maxInputTokens = modelLimit - reservedTokens;
  
  const validation = validateRequestSize(messages, maxInputTokens);
  
  if (validation.isValid) {
    return {
      messages,
      optimized: false,
      ...validation
    };
  }
  
  // 需要优化
  if (typeof messages === 'string') {
    const result = intelligentTruncateText(messages, maxInputTokens);
    return {
      messages: result.text,
      optimized: true,
      truncated: result.truncated,
      originalTokens: result.originalTokens,
      estimatedTokens: result.newTokens,
      compressionRatio: result.compressionRatio
    };
  }
  
  if (Array.isArray(messages)) {
    // 对消息数组进行优化（优先截取最长的消息）
    const optimizedMessages = messages.map(msg => {
      if (typeof msg === 'string') {
        const result = intelligentTruncateText(msg, maxInputTokens * 0.8);
        return result.text;
      }
      if (msg && msg.content) {
        const result = intelligentTruncateText(msg.content, maxInputTokens * 0.8);
        return { ...msg, content: result.text };
      }
      return msg;
    });
    
    const finalValidation = validateRequestSize(optimizedMessages, maxInputTokens);
    
    return {
      messages: optimizedMessages,
      optimized: true,
      ...finalValidation
    };
  }
  
  return {
    messages,
    optimized: false,
    ...validation
  };
}
