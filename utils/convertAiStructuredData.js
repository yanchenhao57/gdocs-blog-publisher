import { aiStructuredRequest } from "./aiRequest.js";
import { sendSocketNotification } from "./socketIO.js";

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
 */
async function generateAiStructuredData(
  markdown,
  io,
  docId,
  eventPrefix = "ai"
) {
  // 1. 首先检测文档语言
  const detectedLanguage = detectLanguage(markdown);

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
  4. Do not output broken characters or the "�" symbol.
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
  ${markdown}
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

  // 通知：开始AI结构化分析
  sendSocketNotification(io, `${eventPrefix}:analysis:start`, {
    docId,
    message: `开始AI结构化分析 (检测语言: ${detectedLanguage})...`,
  });

  try {
    const aiMeta = await aiStructuredRequest(messages, schema, {
      max_tokens: 800, // 增加 token 数量以获得更好的结果
      temperature: 0,
      retries: 2, // 减少重试次数，因为我们有验证步骤
    });

    // 验证和修正结果
    const validatedMeta = validateAndFixResult(
      aiMeta,
      detectedLanguage,
      markdown
    );

    // 通知：AI分析完成
    sendSocketNotification(io, `${eventPrefix}:analysis:success`, {
      docId,
      message: "AI结构化分析完成",
      aiMeta: validatedMeta,
      detectedLanguage,
    });

    return validatedMeta;
  } catch (error) {
    console.error("AI 结构化分析失败:", error);

    // 如果 AI 分析失败，返回基于内容的默认值
    const fallbackMeta = generateFallbackMeta(markdown, detectedLanguage);

    sendSocketNotification(io, `${eventPrefix}:analysis:fallback`, {
      docId,
      message: "AI分析失败，使用默认值",
      aiMeta: fallbackMeta,
      error: error.message,
    });

    return fallbackMeta;
  }
}

/**
 * 生成后备的元数据（当 AI 分析失败时使用）
 * @param {string} markdown - Markdown 内容
 * @param {string} language - 检测到的语言
 * @returns {Object} 后备元数据
 */
function generateFallbackMeta(markdown, language) {
  // 提取第一个标题作为标题
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch
    ? titleMatch[1].replace(/[#*_`]/g, "").trim()
    : language === "jp"
    ? "記事タイトル"
    : "Article Title";

  // 计算阅读时间
  const wordCount = markdown.replace(
    /[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g,
    ""
  ).length;
  const readingTime = Math.max(1, Math.min(12, Math.ceil(wordCount / 200)));

  return {
    seo_title: title,
    seo_description:
      language === "jp"
        ? `${title}について詳しく解説します。`
        : `Learn more about ${title} in this comprehensive guide.`,
    heading_h1: title,
    slug: generateSlug(title, language),
    reading_time: readingTime,
    language: language,
    cover_alt:
      language === "jp"
        ? `${title}のイメージ画像`
        : `Image representing ${title}`,
  };
}

export {
  generateAiStructuredData,
  detectLanguage,
  generateSlug,
  validateAndFixResult,
};
