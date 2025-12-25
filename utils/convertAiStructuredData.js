import { aiStructuredRequest } from "./aiRequest.js";
import { sendSocketNotification } from "./socketIO.js";
import {
  estimateTokenCount,
  intelligentTruncateText,
  optimizeForModel,
} from "./tokenUtils.js";
import {
  extractKeyInfo,
  detectLanguage,
  generateSlug,
  generateFallbackMetaFromKeyInfo,
  generateSimpleFallbackMeta,
  validateAndFixResult,
} from "./documentUtils.js";

/**
 * 优化后的 AI 结构化数据生成函数
 * 改进了提示词精确性和结果验证
 */

/**
 * 使用AI检测文档语言
 * @param {string} markdown - Markdown 内容
 * @returns {Promise<string>} 语言代码 'en' 或 'jp'
 */
async function detectLanguageWithAI(markdown) {
  // 对于语言检测，只使用前2000字符就足够了
  const sampleText = markdown.substring(0, 2000);

  const messages = [
    {
      role: "system",
      content: `你是一个语言检测专家。分析提供的Markdown文档内容，判断其主要语言。

请只返回以下JSON格式的结果，不要包含任何其他内容：

{
  "language": "en" | "ja"
}

判断标准：
- 如果文档主要使用英文，返回 "en"
- 如果文档主要使用日文（包含平假名、片假名、汉字），返回 "ja"
- 如果文档包含多种语言，以主要语言为准

只返回JSON，不要解释。`,
    },
    {
      role: "user",
      content: `请分析以下文档的语言：

\`\`\`
${sampleText}${markdown.length > 2000 ? "..." : ""}
\`\`\``,
    },
  ];

  const schema = {
    type: "object",
    properties: {
      language: { type: "string", enum: ["en", "ja"] },
    },
    required: ["language"],
  };

  try {
    const result = await aiStructuredRequest(messages, schema, {
      max_tokens: 100,
      temperature: 0,
      provider: "openai",
      model: "gcp-claude-sonnet-4",
    });
    return result.language;
  } catch (error) {
    console.error("AI语言检测失败，使用传统方法:", error);
    // 如果AI检测失败，回退到传统方法
    return detectLanguage(markdown);
  }
}

/**
 * 优化后的 AI 结构化数据生成函数
 * @param {string} markdown - Markdown 内容
 * @param {Object} io - Socket.io 实例
 * @param {string} docId - 文档ID
 * @param {string} eventPrefix - 事件前缀
 * @param {string} userLanguage - 用户指定的语言（可选）
 * @returns {Promise<Object>} AI生成的结构化数据
 */
async function generateAiStructuredData(
  markdown,
  io,
  docId,
  eventPrefix = "ai",
  userLanguage = null
) {
  console.log(`🚀 开始智能处理文档: ${markdown.length} 字符`);

  // 通知开始处理
  sendSocketNotification(io, `${eventPrefix}:analysis:start`, {
    docId,
    message: `开始智能文档分析...`,
    originalLength: markdown.length,
  });

  try {
    // 检查 token 限制并截取内容
    // 保守设置为 50000 tokens，为系统提示词和响应预留足够空间
    // Claude Sonnet 4 的上下文限制是 200k tokens，但我们需要预留空间
    const maxTokens = 50000; // 为 AI 请求预留的最大 token 数
    const tokenEstimate = estimateTokenCount(markdown);

    let processedContent = markdown;
    let truncated = false;

    if (tokenEstimate > maxTokens) {
      console.log(
        `📏 内容过长 (${tokenEstimate} tokens)，开始截取到 ${maxTokens} tokens`
      );
      const truncateResult = intelligentTruncateText(markdown, maxTokens, {
        preserveStructure: true,
        preferStart: true,
      });
      processedContent = truncateResult.text;
      truncated = truncateResult.truncated;

      sendSocketNotification(io, `${eventPrefix}:analysis:truncated`, {
        docId,
        message: `内容已截取: ${tokenEstimate} → ${truncateResult.newTokens} tokens`,
        originalTokens: tokenEstimate,
        newTokens: truncateResult.newTokens,
        compressionRatio: truncateResult.compressionRatio,
      });
    }

    // 执行 AI 分析
    const aiMeta = await performAiAnalysis(processedContent, userLanguage);

    // 通知处理完成
    sendSocketNotification(io, `${eventPrefix}:analysis:success`, {
      docId,
      message: `智能文档分析完成${truncated ? " (内容已截取)" : ""}`,
      originalLength: markdown.length,
      processedLength: processedContent.length,
      truncated,
      aiMeta,
    });

    return aiMeta;
  } catch (error) {
    console.error("🔥 智能文档分析失败:", error);

    // 降级处理：使用基于关键信息的默认值
    const keyInfo = extractKeyInfo(markdown);
    const fallbackMeta = generateFallbackMetaFromKeyInfo(keyInfo, markdown);

    sendSocketNotification(io, `${eventPrefix}:analysis:fallback`, {
      docId,
      message: "智能分析失败，使用基于文档结构的默认值",
      aiMeta: fallbackMeta,
      error: error.message,
    });

    return fallbackMeta;
  }
}

/**
 * 执行 AI 分析（核心分析函数）
 * @param {string} content - 要分析的内容
 * @param {string} userLanguage - 用户指定的语言
 * @returns {Promise<Object>} AI 分析结果
 */
async function performAiAnalysis(content, userLanguage = null) {
  // 1. 语言检测：优先使用用户指定语言，否则基于内容检测
  let detectedLanguage;
  if (userLanguage && (userLanguage === "en" || userLanguage === "ja")) {
    detectedLanguage = userLanguage;
    console.log(`使用用户指定语言: ${userLanguage}`);
  } else {
    // 提取关键信息进行语言检测
    const keyInfo = extractKeyInfo(content);
    detectedLanguage = keyInfo.language === "zh" ? "ja" : keyInfo.language; // 将中文映射为日文
    console.log(
      `🎯 基于内容检测到语言: ${keyInfo.language} → 映射为: ${detectedLanguage}`
    );
  }

  // 2. 根据检测到的语言调整提示词
  const languageInstructions =
    detectedLanguage === "ja"
      ? {
          seoTitleInstruction:
            "SEO优化的日文标题。简洁有力，包含相关关键词，用于meta title。",
          seoDescInstruction:
            "SEO优化的日文描述。100字符以内，包含相关关键词，用于meta description。",
          headingInstruction: "日文主标题(H1)。可以比seo_title更长更描述性。",
          slugInstruction:
            "URL友好的英文路径，只使用小写字母a-z、数字0-9和连字符(-)。不要使用空格、下划线或非英文字符。即使文章是日文的，也要生成简洁的英文slug来反映主题。",
          coverAltInstruction:
            "日文的封面图片替代文本。为SEO和无障碍访问描述图片。",
        }
      : {
          seoTitleInstruction:
            "SEO-optimized English title. Short, impactful, contains relevant keywords, used for meta title.",
          seoDescInstruction:
            "SEO-optimized English description. Under 100 characters, contains relevant keywords, used for meta description.",
          headingInstruction:
            "English main heading (H1). Can be longer/more descriptive than seo_title.",
          slugInstruction:
            "URL-friendly English path in lowercase only. Use a–z, 0–9, and hyphens (-) only. No spaces, underscores, or non-English characters.",
          coverAltInstruction:
            "English alt text for the cover image. Describe the image for SEO and accessibility.",
        };

  const messages = [
    {
      role: "system",
      content: `You are a content analysis assistant. Analyze the provided Markdown document and extract the following fields.
  
  IMPORTANT: The document language is detected as "${
    detectedLanguage === "ja" ? "Japanese" : "English"
  }". All text fields (except slug) MUST be in ${
        detectedLanguage === "ja" ? "Japanese" : "English"
      }.
  
  Return the result as **valid raw JSON only** — without explanations, comments, or code blocks.
  
  {
    "seo_title": string,       // ${languageInstructions.seoTitleInstruction}
    "seo_description": string, // ${languageInstructions.seoDescInstruction}
    "heading_h1": string,      // ${languageInstructions.headingInstruction}
    "slug": string,            // ${languageInstructions.slugInstruction}
    "reading_time": number,    // Estimated reading time in minutes. Integer value, maximum 12.
    "language": string,        // MUST be "${detectedLanguage}"
    "cover_alt": string        // ${languageInstructions.coverAltInstruction}
  }
  
  CRITICAL FORMATTING RULES:
  1. Return only valid JSON, with double quotes around all keys and string values.
  2. Do not include trailing commas.
  3. Do not add any extra fields.
  4. Do not output broken characters or the "" symbol.
  5. All text fields MUST be in ${
    detectedLanguage === "ja" ? "Japanese" : "English"
  } (except slug which is always English lowercase).
  6. The "slug" field MUST only contain: lowercase letters (a-z), numbers (0-9), and hyphens (-). No other characters allowed.
  7. The "language" field MUST be exactly "${detectedLanguage}".
  8. If unsure about a value, return a meaningful default in the correct language.
  
  Example slug formats:
  - Good: "web-development-guide", "javascript-tutorial", "api-design-basics"
  - Bad: "Web_Development", "javascript-チュートリアル", "API Design"`,
    },
    {
      role: "user",
      content: `Here is the Markdown document content to analyze:
  
  \`\`\`
  ${content}
  \`\`\`
  
  Remember: All text fields must be in ${
    detectedLanguage === "ja" ? "Japanese" : "English"
  }, and the slug must be lowercase English only.`,
    },
  ];

  const schema = {
    type: "object",
    properties: {
      seo_title: { type: "string" },
      seo_description: { type: "string" },
      heading_h1: { type: "string" },
      slug: { type: "string", pattern: "^[a-z0-9-]+$" },
      reading_time: { type: "number", minimum: 1, maximum: 12 },
      language: { type: "string", enum: ["en", "ja"] },
      cover_alt: { type: "string" },
    },
    required: [
      "seo_title",
      "seo_description",
      "heading_h1",
      "slug",
      "reading_time",
      "language",
      "cover_alt",
    ],
  };
  console.log("🚀 ~ messages:", messages);

  // 执行AI分析
  const aiMeta = await aiStructuredRequest(messages, schema, {
    max_tokens: 2000,
    temperature: 0,
    retries: 1, // 减少重试次数，失败更快进入fallback
    model: "gcp-claude-sonnet-4",
    provider: "openai",
    autoOptimize: true, // 启用自动优化内容长度
  });

  // 验证和修正结果
  const validatedMeta = validateAndFixResult(aiMeta, detectedLanguage, content);

  return validatedMeta;
}

export { generateAiStructuredData, detectLanguageWithAI };
