/**
 * 文档处理工具函数
 * 用于提取文档信息、语言检测、降级处理等
 */

/**
 * 提取文档关键信息
 * @param {string} markdown - Markdown 内容
 * @returns {Object} 关键信息对象
 */
export function extractKeyInfo(markdown) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, "") // 移除代码块
    .replace(/`[^`]*`/g, "") // 移除行内代码
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 移除链接，保留链接文本
    .replace(/[#*_~]/g, "") // 移除 Markdown 标记
    .replace(/\n/g, " ") // 换行符替换为空格
    .trim();

  // 提取标题（第一个 # 开头的行）
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // 语言检测
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g;
  const chineseRegex = /[\u4E00-\u9FAF]/g;
  const englishRegex = /[a-zA-Z]/g;

  const japaneseMatches = plainText.match(japaneseRegex) || [];
  const chineseMatches = plainText.match(chineseRegex) || [];
  const englishMatches = plainText.match(englishRegex) || [];

  let language = "en";
  if (japaneseMatches.length > englishMatches.length * 0.3) {
    language = "jp";
  } else if (chineseMatches.length > englishMatches.length * 0.3) {
    language = "zh";
  }

  // 提取第一段内容作为描述
  const firstParagraph = markdown
    .split('\n')
    .find(line => line.trim() && !line.startsWith('#') && !line.startsWith('```'))
    ?.trim() || "";

  // 简单的关键词提取
  const words = plainText.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  const keywords = new Set(words.slice(0, 20)); // 取前20个词作为关键词

  // 字数统计
  const wordCount = plainText.length;

  return {
    title,
    language,
    firstParagraph: firstParagraph.substring(0, 200),
    keywords,
    wordCount,
    documentType: titleMatch ? "article" : "document"
  };
}

/**
 * 检测文档的主要语言
 * @param {string} markdown - Markdown 内容
 * @returns {string} 语言代码 'en' 或 'jp'
 */
export function detectLanguage(markdown) {
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
 * 生成简单的 slug
 * @param {string} title - 标题
 * @returns {string} slug
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, "") // 移除中日文字符
    .replace(/[^\w\s-]/g, "") // 只保留字母、数字、空格、连字符
    .replace(/\s+/g, "-") // 空格转为连字符
    .replace(/-+/g, "-") // 多个连字符合并
    .replace(/^-|-$/g, "") // 去除首尾连字符
    .substring(0, 50) || "article"; // 限制长度
}

/**
 * 基于关键信息生成降级元数据
 * @param {Object} keyInfo - 从文档提取的关键信息
 * @param {string} markdown - 原始 Markdown 内容
 * @returns {Object} 降级元数据
 */
export function generateFallbackMetaFromKeyInfo(keyInfo, markdown) {
  const { title, language, wordCount, firstParagraph, keywords, documentType } = keyInfo;

  // 使用智能生成的标题或默认标题
  const fallbackTitle = title || (language === "jp" ? "記事タイトル" : "Article Title");

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
  const slug = generateSlug(fallbackTitle);

  // 计算阅读时间
  const readingTime = Math.max(1, Math.min(12, Math.ceil(wordCount / 200)));

  // 生成封面 alt
  const coverAlt = language === "jp" 
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
    _fallback: true,
    _documentType: documentType,
    _keywordCount: keywords.size,
  };
}

/**
 * 生成简单的降级元数据（不依赖关键信息提取）
 * @param {string} markdown - Markdown 内容
 * @returns {Object} 降级元数据
 */
export function generateSimpleFallbackMeta(markdown) {
  // 简单提取标题
  const firstLine = markdown.split('\n')[0];
  const title = firstLine.startsWith('#') ? firstLine.replace(/^#\s*/, '') : '文章标题';
  
  // 简单语言检测
  const language = detectLanguage(markdown);
  
  // 估算阅读时间
  const wordCount = markdown.length / 4; // 粗略估算
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  
  // 生成slug
  const slug = generateSlug(title);
  
  // 生成默认描述
  const description = language === 'jp' ? 
    `${title}について詳しく解説します。` : 
    `Learn about ${title}.`;

  return {
    seo_title: title.substring(0, 60),
    seo_description: description.substring(0, 160),
    heading_h1: title,
    slug,
    reading_time: readingTime,
    language,
    cover_alt: language === 'jp' ? `${title}のイメージ画像` : `Image for ${title}`,
    _fallback: true,
  };
}

/**
 * 验证和修复AI返回的结果
 * @param {Object} aiResult - AI返回的结果
 * @param {string} detectedLanguage - 检测到的语言
 * @param {string} content - 原始内容
 * @returns {Object} 修复后的结果
 */
export function validateAndFixResult(aiResult, detectedLanguage, content) {
  const result = { ...aiResult };

  // 确保必填字段存在
  if (!result.seo_title) {
    result.seo_title = detectedLanguage === "jp" ? "記事タイトル" : "Article Title";
  }
  
  if (!result.seo_description) {
    result.seo_description = detectedLanguage === "jp" ? 
      "この記事について詳しく解説します。" : 
      "Learn more about this article.";
  }
  
  if (!result.heading_h1) {
    result.heading_h1 = result.seo_title;
  }
  
  if (!result.slug) {
    result.slug = generateSlug(result.seo_title);
  }
  
  if (!result.reading_time || result.reading_time < 1) {
    result.reading_time = Math.max(1, Math.ceil(content.length / 800));
  }
  
  if (!result.language) {
    result.language = detectedLanguage;
  }
  
  if (!result.cover_alt) {
    result.cover_alt = detectedLanguage === "jp" ? 
      `${result.seo_title}のイメージ画像` : 
      `Image for ${result.seo_title}`;
  }

  return result;
}
