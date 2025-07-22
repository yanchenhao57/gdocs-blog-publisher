/**
 * AI 请求工具函数 - 封装 Inception Labs API
 * 支持配置化参数、错误处理、重试机制和结构化输出
 */

/**
 * AI 请求配置选项
 * @typedef {Object} AIRequestOptions
 * @property {string} [model='mercury-coder-small'] - AI 模型名称
 * @property {number} [max_tokens=1000] - 最大生成 token 数
 * @property {number} [temperature=0.7] - 生成温度（0-1）
 * @property {number} [timeout=30000] - 请求超时时间（毫秒）
 * @property {number} [retries=3] - 重试次数
 * @property {number} [retryDelay=1000] - 重试延迟（毫秒）
 * @property {boolean} [structuredOutput=false] - 是否启用结构化输出
 * @property {Object} [outputSchema] - 输出数据结构定义
 */

/**
 * AI 请求响应结构
 * @typedef {Object} AIResponse
 * @property {string} content - AI 生成的文本内容
 * @property {Object} raw - 原始 API 响应
 * @property {number} usage - token 使用情况
 * @property {Object} [structured] - 解析后的结构化数据（如果启用）
 */

/**
 * 发送 AI 请求到 Inception Labs API
 * @param {string|Array} messages - 消息内容，可以是字符串或消息数组
 * @param {AIRequestOptions} [options={}] - 请求配置选项
 * @returns {Promise<AIResponse>} AI 响应结果
 */
const aiRequest = async (messages, options = {}) => {
  // 默认配置
  const defaultOptions = {
    model: "mercury-coder-small",
    max_tokens: 1000,
    temperature: 0.7,
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    structuredOutput: false,
    outputSchema: null,
  };

  const config = { ...defaultOptions, ...options };

  // 获取 API Key
  const apiKey = process.env.INCEPTION_API_KEY;
  if (!apiKey) {
    throw new Error("❌ 缺少 INCEPTION_API_KEY 环境变量");
  }

  // 格式化消息
  const formattedMessages = formatMessages(messages, config);

  // 构建请求体
  const requestBody = {
    model: config.model,
    messages: formattedMessages,
    max_tokens: config.max_tokens,
    temperature: config.temperature,
  };

  // 发送请求（带重试）
  const response = await sendRequestWithRetry(requestBody, config, apiKey);

  // 如果启用结构化输出，尝试解析 JSON
  if (config.structuredOutput) {
    try {
      response.structured = parseStructuredOutput(response.content);
    } catch (error) {
      console.warn("⚠️ 结构化输出解析失败:", error.message);
      response.structured = null;
    }
  }

  return response;
};

/**
 * 格式化消息内容，支持结构化输出提示
 * @param {string|Array} messages - 消息内容
 * @param {Object} config - 配置选项
 * @returns {Array} 格式化后的消息数组
 */
const formatMessages = (messages, config) => {
  let formattedMessages;

  if (typeof messages === "string") {
    formattedMessages = [{ role: "user", content: messages }];
  } else if (Array.isArray(messages)) {
    formattedMessages = messages.map((msg, index) => {
      if (typeof msg === "string") {
        return { role: "user", content: msg };
      }
      if (typeof msg === "object" && msg.content) {
        return {
          role: msg.role || "user",
          content: msg.content,
        };
      }
      throw new Error(
        `❌ 无效的消息格式，索引 ${index}: ${JSON.stringify(msg)}`
      );
    });
  } else {
    throw new Error("❌ 消息格式错误，应为字符串或数组");
  }

  // 如果启用结构化输出，添加格式要求
  if (config.structuredOutput && config.outputSchema) {
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    const schemaPrompt = generateSchemaPrompt(config.outputSchema);
    lastMessage.content += `\n\n${schemaPrompt}`;
  }

  return formattedMessages;
};

/**
 * 生成结构化输出的提示词
 * @param {Object} schema - 输出数据结构定义
 * @returns {string} 格式化的提示词
 */
const generateSchemaPrompt = (schema) => {
  const schemaDescription = JSON.stringify(schema, null, 2);
  return `请严格按照以下 JSON 格式返回结果，不要包含任何其他文本：

${schemaDescription}

请确保：
1. 返回的是有效的 JSON 格式
2. 所有必需字段都已包含
3. 数据类型正确
4. 不要添加任何解释或额外文本`;
};

/**
 * 解析结构化输出
 * @param {string} content - AI 返回的内容
 * @returns {Object} 解析后的结构化数据
 */
const parseStructuredOutput = (content) => {
  // 尝试提取 JSON 部分
  const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("未找到有效的 JSON 格式");
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error(`JSON 解析失败: ${error.message}`);
  }
};

/**
 * 带重试机制的请求发送
 * @param {Object} requestBody - 请求体
 * @param {Object} config - 配置选项
 * @param {string} apiKey - API 密钥
 * @returns {Promise<AIResponse>} AI 响应结果
 */
const sendRequestWithRetry = async (requestBody, config, apiKey) => {
  let lastError;

  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`🚀 AI 请求尝试 ${attempt}/${config.retries}...`);

      const response = await fetch(
        "https://api.inceptionlabs.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(config.timeout),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`❌ API 请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("❌ API 响应格式错误");
      }

      console.log(`✅ AI 请求成功 (尝试 ${attempt})`);

      return {
        content: data.choices[0].message.content,
        raw: data,
        usage: data.usage || {},
      };
    } catch (error) {
      lastError = error;
      console.log(`⚠️ 请求失败 (尝试 ${attempt}): ${error.message}`);

      if (attempt < config.retries) {
        console.log(`⏳ ${config.retryDelay}ms 后重试...`);
        await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
      }
    }
  }

  throw new Error(
    `❌ AI 请求失败，已重试 ${config.retries} 次: ${lastError.message}`
  );
};

/**
 * 便捷函数：发送结构化输出请求
 * @param {string} prompt - 提示文本
 * @param {Object} schema - 输出数据结构定义
 * @param {AIRequestOptions} [options={}] - 请求配置选项
 * @returns {Promise<Object>} 解析后的结构化数据
 */
async function aiStructuredRequest(prompt, schema, options = {}) {
  const response = await aiRequest(prompt, {
    ...options,
    structuredOutput: true,
    outputSchema: schema,
  });

  if (!response.structured) {
    throw new Error("❌ 结构化输出解析失败");
  }

  return response.structured;
}

/**
 * 便捷函数：发送简单文本请求
 * @param {string} prompt - 提示文本
 * @param {AIRequestOptions} [options={}] - 请求配置选项
 * @returns {Promise<string>} AI 生成的文本内容
 */
const aiChat = async (prompt, options = {}) => {
  const response = await aiRequest(prompt, options);
  return response.content;
};

/**
 * 便捷函数：发送多轮对话请求
 * @param {Array} conversation - 对话历史，格式：[{role: 'user', content: '...'}, {role: 'assistant', content: '...'}]
 * @param {AIRequestOptions} [options={}] - 请求配置选项
 * @returns {Promise<string>} AI 生成的文本内容
 */
const aiConversation = async (conversation, options = {}) => {
  const response = await aiRequest(conversation, options);
  return response.content;
};

export { aiRequest, aiChat, aiConversation, aiStructuredRequest };
