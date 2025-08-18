import { aiStructuredRequest } from "./aiRequest.js";
import { sendSocketNotification } from "./socketIO.js";
import { estimateTokenCount } from "./tokenUtils.js";
import { processLargeMarkdown, extractKeyInfo } from "./markdownProcessor.js";

/**
 * 优化后的 AI 结构化数据生成函数
 * 改进了提示词精确性和结果验证
 */

/**
 * 检测文档的主要语言
 * @param {string} markdown - Markdown 内容
 * @returns {string} 语言代码 'en' 或 'jp'
 */
function detectLanguage(markdown) {
  // 移除 Markdown 语法
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, "") // 移除代码块
    .replace(/`[^`]*`/g, "") // 移除行内代码
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 移除链接，保留链接文本
    .replace(/[#*_~]/g, "") // 移除 Markdown 标记
    .replace(/\n/g, " ") // 换行符替换为空格
    .trim();

  // 日文字符正则（平假名、片假名、汉字）
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g;
  const englishRegex = /[a-zA-Z]/g;

  const japaneseMatches = plainText.match(japaneseRegex) || [];
  const englishMatches = plainText.match(englishRegex) || [];

  // 基于字符数量判断主要语言
  return japaneseMatches.length > englishMatches.length * 0.5 ? "jp" : "en";
}

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
  "language": "en" | "jp"
}

判断标准：
- 如果文档主要使用英文，返回 "en"
- 如果文档主要使用日文（包含平假名、片假名、汉字），返回 "jp"
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
      language: { type: "string", enum: ["en", "jp"] },
    },
    required: ["language"],
  };

  try {
    const result = await aiStructuredRequest(messages, schema, {
      max_tokens: 100,
      temperature: 0,
    });
    return result.language;
  } catch (error) {
    console.error("AI语言检测失败，使用传统方法:", error);
    // 如果AI检测失败，回退到传统方法
    return detectLanguage(markdown);
  }
}

/**
 * 生成英文 slug
 * @param {string} title - 标题
 * @param {string} language - 语言
 * @returns {string} slug
 */
function generateSlug(title, language) {
  if (language === "en") {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // 只保留字母、数字、空格、连字符
      .replace(/\s+/g, "-") // 空格替换为连字符
      .replace(/-+/g, "-") // 多个连字符合并为一个
      .replace(/^-|-$/g, ""); // 移除首尾连字符
  }

  // 日文内容需要生成英文 slug，这里提供一些常见的映射
  // 实际使用中可能需要更复杂的翻译逻辑
  const commonTranslations = {
    開発: "development",
    技術: "technology",
    プログラミング: "programming",
    ウェブ: "web",
    アプリ: "app",
    システム: "system",
    設計: "design",
    分析: "analysis",
    学習: "learning",
    入門: "introduction",
    基礎: "basics",
    応用: "advanced",
    実践: "practice",
    解説: "explanation",
    方法: "method",
    手順: "steps",
    使い方: "usage",
    ガイド: "guide",
    チュートリアル: "tutorial",
  };

  // 简单的日文到英文映射（这里需要根据实际需求扩展）
  let englishSlug = title;
  Object.entries(commonTranslations).forEach(([jp, en]) => {
    englishSlug = englishSlug.replace(new RegExp(jp, "g"), en);
  });

  return (
    englishSlug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "article"
  );
}

/**
 * 验证和修正 AI 生成的结果
 * @param {Object} aiResult - AI 生成的结果
 * @param {string} detectedLanguage - 检测到的语言
 * @param {string} markdown - 原始 Markdown 内容
 * @returns {Object} 修正后的结果
 */
function validateAndFixResult(aiResult, detectedLanguage, markdown) {
  const result = { ...aiResult };

  // 1. 修正语言字段
  result.language = detectedLanguage;

  // 2. 验证和修正 slug
  if (!result.slug || !/^[a-z0-9-]+$/.test(result.slug)) {
    // 如果 slug 格式不正确，根据标题重新生成
    const titleForSlug = result.seo_title || result.heading_h1 || "article";
    result.slug = generateSlug(titleForSlug, detectedLanguage);
  }

  // 3. 验证阅读时间
  if (
    !result.reading_time ||
    result.reading_time < 1 ||
    result.reading_time > 12
  ) {
    // 重新计算阅读时间（基于字数，假设每分钟读200字）
    const wordCount = markdown.replace(
      /[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g,
      ""
    ).length;
    result.reading_time = Math.max(1, Math.min(12, Math.ceil(wordCount / 200)));
  }

  // 4. 确保字符串字段不为空
  const stringFields = [
    "seo_title",
    "seo_description",
    "heading_h1",
    "cover_alt",
  ];
  stringFields.forEach((field) => {
    if (!result[field] || typeof result[field] !== "string") {
      result[field] = `默认${field}`;
    }
  });

  return result;
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
    // 使用新的智能处理系统
    const result = await processLargeMarkdown(
      markdown,
      async (content) => {
        // 这里是传递给 processLargeMarkdown 的 AI 调用函数
        return await performAiAnalysis(content, userLanguage);
      },
      {
        directProcessLimit: 10000,
        summaryProcessLimit: 100000,
        maxRetries: 2,
      }
    );

    // 通知处理完成
    sendSocketNotification(io, `${eventPrefix}:analysis:success`, {
      docId,
      message: `智能文档分析完成 (${result.processingMethod})`,
      processingMethod: result.processingMethod,
      qualityScore: result.qualityScore,
      originalLength: result.originalLength,
      processedLength: result.processedLength,
      aiMeta: result,
    });

    return result;
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
  if (userLanguage && (userLanguage === "en" || userLanguage === "jp")) {
    detectedLanguage = userLanguage;
    console.log(`使用用户指定语言: ${userLanguage}`);
  } else {
    // 提取关键信息进行语言检测
    const keyInfo = extractKeyInfo(content);
    detectedLanguage = keyInfo.language === "zh" ? "jp" : keyInfo.language; // 将中文映射为日文
    console.log(
      `🎯 基于内容检测到语言: ${keyInfo.language} → 映射为: ${detectedLanguage}`
    );
  }

  // 2. 根据检测到的语言调整提示词
  const languageInstructions =
    detectedLanguage === "jp"
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
    detectedLanguage === "jp" ? "Japanese" : "English"
  }". All text fields (except slug) MUST be in ${
        detectedLanguage === "jp" ? "Japanese" : "English"
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
    detectedLanguage === "jp" ? "Japanese" : "English"
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
    detectedLanguage === "jp" ? "Japanese" : "English"
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
      language: { type: "string", enum: ["en", "jp"] },
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
    max_tokens: 800,
    temperature: 0,
    retries: 2,
    model: "mercury-coder-small",
  });

  // 验证和修正结果
  const validatedMeta = validateAndFixResult(aiMeta, detectedLanguage, content);

  return validatedMeta;
}

/**
 * 基于关键信息生成降级元数据
 * @param {Object} keyInfo - 从文档提取的关键信息
 * @param {string} markdown - 原始 Markdown 内容
 * @returns {Object} 降级元数据
 */
function generateFallbackMetaFromKeyInfo(keyInfo, markdown) {
  const { title, language, wordCount, firstParagraph, keywords, documentType } =
    keyInfo;

  // 使用智能生成的标题或默认标题
  const fallbackTitle =
    title || (language === "jp" ? "記事タイトル" : "Article Title");

  // 生成描述
  let description = firstParagraph;
  if (!description || description.length > 150) {
    const topKeywords = Array.from(keywords).slice(0, 5).join(", ");
    switch (language) {
      case "jp":
        description = `${fallbackTitle}について詳しく解説します。主な内容: ${topKeywords}`;
        break;
      case "zh":
        description = `详细介绍${fallbackTitle}。主要内容: ${topKeywords}`;
        break;
      default:
        description = `Learn about ${fallbackTitle}. Key topics include: ${topKeywords}`;
    }
  }

  // 生成 slug
  const slug = generateSlugFromTitle(fallbackTitle, language);

  // 计算阅读时间
  const readingTime = Math.max(1, Math.min(12, Math.ceil(wordCount / 200)));

  // 生成封面 alt
  const coverAlt =
    language === "jp"
      ? `${fallbackTitle}のイメージ画像`
      : `Image representing ${fallbackTitle}`;

  return {
    seo_title: fallbackTitle.substring(0, 60), // 限制长度
    seo_description: description.substring(0, 160), // 限制长度
    heading_h1: fallbackTitle,
    slug,
    reading_time: readingTime,
    language: language === "zh" ? "jp" : language, // 将中文映射为日文
    cover_alt: coverAlt,
    // 添加额外信息用于调试
    _fallback: true,
    _documentType: documentType,
    _keywordCount: keywords.size,
  };
}

/**
 * 从标题生成 slug
 */
function generateSlugFromTitle(title, language) {
  // 常见的中日文到英文映射
  const translations = {
    開発: "development",
    技術: "technology",
    プログラミング: "programming",
    ウェブ: "web",
    アプリ: "app",
    システム: "system",
    設計: "design",
    分析: "analysis",
    学習: "learning",
    入門: "introduction",
    基礎: "basics",
    応用: "advanced",
    実践: "practice",
    解説: "explanation",
    方法: "method",
    手順: "steps",
    使い方: "usage",
    ガイド: "guide",
    チュートリアル: "tutorial",
    // 中文映射
    开发: "development",
    技术: "technology",
    编程: "programming",
    网页: "web",
    应用: "app",
    系统: "system",
    设计: "design",
    分析: "analysis",
    学习: "learning",
    入门: "introduction",
    基础: "basics",
    高级: "advanced",
    实践: "practice",
    解释: "explanation",
    方法: "method",
    步骤: "steps",
    使用: "usage",
    指南: "guide",
    教程: "tutorial",
  };

  let slug = title.toLowerCase();

  // 应用翻译映射
  Object.entries(translations).forEach(([source, target]) => {
    slug = slug.replace(new RegExp(source, "g"), target);
  });

  // 清理 slug
  slug = slug
    .replace(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, "") // 移除剩余的中日文字符
    .replace(/[^\w\s-]/g, "") // 只保留字母、数字、空格、连字符
    .replace(/\s+/g, "-") // 空格转为连字符
    .replace(/-+/g, "-") // 多个连字符合并
    .replace(/^-|-$/g, "") // 去除首尾连字符
    .substring(0, 50); // 限制长度

  // 如果结果为空，使用默认值
  return slug || "article";
}

export {
  generateAiStructuredData,
  detectLanguage,
  detectLanguageWithAI,
  generateSlug,
  validateAndFixResult,
};
