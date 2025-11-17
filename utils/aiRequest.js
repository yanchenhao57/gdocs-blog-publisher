/**
 * AI 请求工具函数 - 封装 Inception Labs API
 * 支持配置化参数、错误处理、重试机制和结构化输出
 * 包含内容长度检查和自动优化功能
 */

import {
  validateRequestSize,
  optimizeForModel,
  estimateTokenCount,
} from "./tokenUtils.js";
import { logFile } from "./logFile.js";

/**
 * AI 请求配置选项
 * @typedef {Object} AIRequestOptions
 * @property {string} [provider='inception'] - AI 服务提供商 ('inception' 或 'openai')
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
    provider: "inception", // 默认使用 Inception Labs
    model: "mercury-coder-small",
    max_tokens: 1000,
    temperature: 0,
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    structuredOutput: false,
    outputSchema: null,
    autoOptimize: true, // 是否自动优化内容长度
  };

  const config = { ...defaultOptions, ...options };

  // 获取 API Key 根据提供商
  let apiKey, apiUrl;
  if (config.provider === "openai") {
    apiKey = process.env.OPENAI_API_KEY;
    apiUrl = "http://litellm-dev.mc-k8s-apn1.notta.io/v1/chat/completions";
    if (!apiKey) {
      throw new Error("❌ 缺少 OPENAI_API_KEY 环境变量");
    }
  } else {
    apiKey = process.env.INCEPTION_API_KEY;
    apiUrl = "https://api.inceptionlabs.ai/v1/chat/completions";
    if (!apiKey) {
      throw new Error("❌ 缺少 INCEPTION_API_KEY 环境变量");
    }
  }

  // 格式化消息
  let formattedMessages = formatMessages(messages, config);

  // 检查并优化内容长度
  if (config.autoOptimize) {
    const optimization = optimizeForModel(
      formattedMessages,
      config.model,
      config.max_tokens + 1000
    );

    if (optimization.optimized) {
      console.log(
        `🔧 内容已自动优化: ${optimization.originalTokens} -> ${
          optimization.estimatedTokens
        } tokens (${(
          (optimization.estimatedTokens / optimization.originalTokens) *
          100
        ).toFixed(1)}%)`
      );
      formattedMessages = optimization.messages;
    } else {
      console.log(
        `✅ 内容长度验证通过: ${optimization.estimatedTokens} tokens (${optimization.utilization}% 使用率)`
      );
    }
  }

  // 构建请求体
  const requestBody = {
    model: config.model,
    messages: formattedMessages,
    max_tokens: config.max_tokens,
    temperature: config.temperature,
    response_format: { type: "json_object" },
  };

  // 发送请求（带重试）
  const response = await sendRequestWithRetry(
    requestBody,
    config,
    apiKey,
    apiUrl
  );
  console.log("🚀 ~ aiRequest ~ response:", response);
  logFile("aiRequest", "json", "log", response);

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
 * Generates a prompt for structured JSON output
 * @param {Object} schema - The definition of the output data structure
 * @returns {string} The formatted prompt string
 */
const generateSchemaPrompt = (schema) => {
  const schemaDescription = JSON.stringify(schema, null, 2);
  return `Please strictly return the result in the following JSON format without including any other text:

${schemaDescription}

Formatting rules:
1. Return only valid JSON.
2. Do not add any other text, comments, explanations, or notes.
3. Do not insert unrelated words or broken characters inside string values.
4. Do not output the "�" character or any mojibake (garbled text).
5. All text must be valid UTF-8 characters.
6. For Japanese content:
   - Keep text in correct Japanese characters only.
   - Do not mix romaji, Chinese, or other languages unless required by the schema.
   - Do not insert symbols or invisible characters.
7. For the "slug" field:
   - Always output in **lowercase English letters, numbers, and hyphens only**.
   - Do not include Japanese characters, spaces, or underscores.
   - If the title is in Japanese, generate an SEO-friendly slug in **English** that describes the topic.
8. All string values must be enclosed in double quotes.
9. Do not insert any keys or values that are not in the schema.
10. If you are unsure about a value, use an empty string "" or null.

Make sure that:
- All required fields are included.
- Data types are correct.
- No trailing commas in the JSON.
- Output must be a valid JSON object.`;
};

/**
 * 安全解析 JSON 字符串，自动修复常见格式错误
 * @param {string} str - JSON 字符串
 * @returns {Object|null}
 */
function safeJsonParse(str) {
  try {
    // 1. 去除多余的逗号（如最后一个键值对后面多了逗号）
    let fixed = str.replace(/,([\s\n\r]*[}\]])/g, "$1");

    // 2. 清理字符串值中的特殊字符
    // 处理字符串值中的日文字符和其他特殊字符
    fixed = fixed.replace(/"([^"]*[^\x00-\x7F][^"]*)"/g, (match, content) => {
      // 清理内容中的特殊字符，但保留基本的日文字符
      const cleaned = content
        .replace(
          /[^\x00-\x7F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF]/g,
          ""
        ) // 保留ASCII、平假名、片假名、汉字、全角字符
        .replace(/[。、，；：！？]/g, "") // 移除中文标点
        .replace(
          /[^\x00-\x7F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF\s\-_]/g,
          ""
        ) // 最终清理
        .trim();
      return `"${cleaned}"`;
    });

    // 3. 解析
    return JSON.parse(fixed);
  } catch (e) {
    // 如果第一次解析失败，尝试更激进的清理
    try {
      let aggressiveFixed = str.replace(/,([\s\n\r]*[}\]])/g, "$1");

      // 更激进的字符清理
      aggressiveFixed = aggressiveFixed.replace(
        /"([^"]*)"/g,
        (match, content) => {
          const cleaned = content
            .replace(
              /[^\x00-\x7F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s\-_]/g,
              ""
            ) // 只保留ASCII、日文字符、汉字、空格、连字符、下划线
            .replace(/[。、，；：！？]/g, "") // 移除中文标点
            .trim();
          return `"${cleaned}"`;
        }
      );

      return JSON.parse(aggressiveFixed);
    } catch (e2) {
      throw new Error(
        "JSON 解析失败: " + e.message + " (清理后: " + e2.message + ")"
      );
    }
  }
}

function cleanInvalidChars(str) {
  // 删除 JSON 中无法显示或无效的字符，包括 U+0000-U+001F 控制符 和 U+FFFD
  return str
    .replace(/[\u0000-\u001F\uFFFD]/g, "") // 删除控制符和 replacement char
    .replace(/\s+$/g, ""); // 去掉尾部空白
}

/**
 * 解析结构化输出
 * @param {string} content - AI 返回的内容
 * @returns {Object} 解析后的结构化数据
 */
const parseStructuredOutput = (content) => {
  // 清理无效字符
  const cleanedContent = cleanInvalidChars(content);

  // 尝试提取 JSON 部分
  const jsonMatch = cleanedContent.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("未找到有效的 JSON 格式");
  }

  // 使用安全解析
  return safeJsonParse(jsonMatch[0]);
};

/**
 * 带重试机制的请求发送
 * @param {Object} requestBody - 请求体
 * @param {Object} config - 配置选项
 * @param {string} apiKey - API 密钥
 * @param {string} apiUrl - API 地址
 * @returns {Promise<AIResponse>} AI 响应结果
 */
const sendRequestWithRetry = async (requestBody, config, apiKey, apiUrl) => {
  let lastError;

  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`🚀 AI 请求尝试 ${attempt}/${config.retries}...`);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(config.timeout),
      });
      console.log("🚀 ~ sendRequestWithRetry ~ response:", response);

      if (!response.ok) {
        const errorText = await response.text();

        // 特殊处理上下文长度超限错误
        if (
          response.status === 400 &&
          (errorText.includes("context_length_exceeded") ||
            errorText.includes("Prompt is too long") ||
            errorText.includes("Prompt too long"))
        ) {
          throw new Error(
            `❌ 请求内容过长，超出模型上下文限制 (${response.status}): ${errorText}`
          );
        }

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
      console.log(`⚠️ 请求失败 (尝试 ${attempt}): ${error}`);

      // 如果是内容过长的错误，不需要重试
      if (
        error.message.includes("内容过长") ||
        error.message.includes("Prompt is too long") ||
        error.message.includes("Prompt too long")
      ) {
        console.log("❌ 内容过长错误，不进行重试");
        throw error;
      }

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
