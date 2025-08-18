/**
 * 简化版 Markdown 处理器
 * 基于清理后的HTML转换而来的干净markdown
 */

import { estimateTokenCount } from './tokenUtils.js';

/**
 * 文档类型识别
 */
const DOCUMENT_TYPES = {
  TECHNICAL: 'technical',
  BUSINESS: 'business', 
  NEWS: 'news',
  TUTORIAL: 'tutorial',
  BLOG: 'blog',
  OTHER: 'other'
};

/**
 * 提取文档关键信息（简化版）
 */
export function extractKeyInfo(content) {
  const lines = content.split('\n');
  const keyInfo = {
    title: '',
    headings: [],
    firstParagraph: '',
    keywords: new Set(),
    imageCount: 0,
    linkCount: 0,
    codeBlockCount: 0,
    wordCount: 0,
    language: 'unknown',
    documentType: DOCUMENT_TYPES.BLOG, // 默认为blog
    structure: {
      hasH1: false,
      sectionCount: 0,
      paragraphCount: 0
    }
  };

  let firstParagraphFound = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 标题提取
    const headerMatch = trimmed.match(/^(#{1,6})\s(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();
      
      keyInfo.headings.push({ level, text });
      
      if (level === 1) {
        keyInfo.structure.hasH1 = true;
        if (!keyInfo.title) keyInfo.title = text;
      }
      
      keyInfo.structure.sectionCount++;
      continue;
    }

    // 图片计数
    if (trimmed.includes('![')) {
      keyInfo.imageCount += (trimmed.match(/!\[/g) || []).length;
    }

    // 链接计数
    if (trimmed.includes('](')) {
      keyInfo.linkCount += (trimmed.match(/\]\(/g) || []).length;
    }

    // 代码块计数
    if (trimmed.startsWith('```')) {
      keyInfo.codeBlockCount++;
    }

    // 第一段落
    if (!firstParagraphFound && !headerMatch && !trimmed.match(/^[-*+]\s/) && trimmed.length > 20) {
      keyInfo.firstParagraph = trimmed;
      firstParagraphFound = true;
      keyInfo.structure.paragraphCount++;
    } else if (!headerMatch && trimmed.length > 20) {
      keyInfo.structure.paragraphCount++;
    }

    // 简化的关键词提取
    extractSimpleKeywords(trimmed, keyInfo.keywords);
  }

  // 语言检测（简化版）
  keyInfo.language = detectLanguageSimple(keyInfo.title, keyInfo.firstParagraph);
  
  // 文档类型识别（简化版）
  keyInfo.documentType = identifyDocumentTypeSimple(keyInfo);
  
  // 词数统计
  keyInfo.wordCount = estimateWordCount(content, keyInfo.language);

  return keyInfo;
}

/**
 * 简化的关键词提取
 */
function extractSimpleKeywords(text, keywordsSet) {
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, ' ');

  const words = cleanText.split(/\s+/).filter(word => {
    if (word.length < 2) return false;
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return !stopWords.includes(word);
  });

  words.forEach(word => keywordsSet.add(word));
}

/**
 * 简化的语言检测
 */
function detectLanguageSimple(title, firstParagraph) {
  const text = (title + ' ' + firstParagraph).substring(0, 500);
  
  const hiragana = (text.match(/[\u3040-\u309f]/g) || []).length;
  const katakana = (text.match(/[\u30a0-\u30ff]/g) || []).length;
  const kanji = (text.match(/[\u4e00-\u9faf]/g) || []).length;
  const english = (text.match(/[a-zA-Z]/g) || []).length;
  
  const totalChars = text.replace(/\s/g, '').length;
  
  if (totalChars === 0) return 'en';
  
  const japaneseRatio = (hiragana + katakana) / totalChars;
  const kanjiRatio = kanji / totalChars;
  const englishRatio = english / totalChars;

  console.log(`🔍 语言检测: 日文特征=${(japaneseRatio*100).toFixed(1)}%, 汉字=${(kanjiRatio*100).toFixed(1)}%, 英文=${(englishRatio*100).toFixed(1)}%`);

  // 简化的判断逻辑
  if (japaneseRatio > 0.01 || (kanjiRatio > 0.1 && text.includes('です'))) {
    console.log('✅ 检测为日文');
    return 'jp';
  } else if (kanjiRatio > 0.3 && (text.includes('的') || text.includes('了'))) {
    console.log('✅ 检测为中文');
    return 'zh';
  } else {
    console.log('✅ 检测为英文');
    return 'en';
  }
}

/**
 * 简化的文档类型识别
 */
function identifyDocumentTypeSimple(keyInfo) {
  const content = (keyInfo.title + ' ' + keyInfo.headings.map(h => h.text).join(' ')).toLowerCase();
  
  console.log(`🔍 文档类型识别 - 标题: ${keyInfo.title}`);

  // 技术文档特征
  if (keyInfo.codeBlockCount >= 2 || /api|function|programming|code/.test(content)) {
    console.log('✅ 识别为技术文档');
    return DOCUMENT_TYPES.TECHNICAL;
  }
  
  // 教程特征
  if (/tutorial|step|guide|how to|教程|步骤/.test(content) && keyInfo.structure.sectionCount >= 5) {
    console.log('✅ 识别为教程');
    return DOCUMENT_TYPES.TUTORIAL;
  }
  
  // 新闻特征
  if (/news|breaking|announcement|新闻|发布/.test(content) && keyInfo.wordCount < 2000) {
    console.log('✅ 识别为新闻');
    return DOCUMENT_TYPES.NEWS;
  }
  
  // 默认为blog
  console.log('✅ 识别为博客');
  return DOCUMENT_TYPES.BLOG;
}

/**
 * 估算词数
 */
function estimateWordCount(content, language) {
  if (language === 'jp' || language === 'zh') {
    return content.replace(/\s/g, '').length;
  } else {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }
}

/**
 * 创建智能摘要（简化版）
 */
export function createIntelligentSummary(content, keyInfo, targetTokens = 45000) {
  let summary = '';
  
  // 1. 基本信息
  if (keyInfo.title) {
    summary += `# ${keyInfo.title}\n\n`;
  }

  // 2. 文档信息
  summary += `## 文档信息\n`;
  summary += `- 类型: ${keyInfo.documentType}\n`;
  summary += `- 语言: ${keyInfo.language}\n`;
  summary += `- 词数: ${keyInfo.wordCount}\n`;
  summary += `- 章节数: ${keyInfo.structure.sectionCount}\n\n`;

  // 3. 文档结构
  if (keyInfo.headings.length > 0) {
    summary += `## 文档结构\n`;
    keyInfo.headings.slice(0, 15).forEach(heading => {
      const indent = '  '.repeat(Math.max(0, heading.level - 1));
      summary += `${indent}- ${heading.text}\n`;
    });
    summary += '\n';
  }

  // 4. 开头内容
  if (keyInfo.firstParagraph) {
    summary += `## 开头内容\n${keyInfo.firstParagraph}\n\n`;
  }

  // 5. 关键词
  const topKeywords = Array.from(keyInfo.keywords)
    .filter(kw => kw.length > 2)
    .slice(0, 20);
  if (topKeywords.length > 0) {
    summary += `## 主要关键词\n${topKeywords.join(', ')}\n\n`;
  }

  // 6. 核心内容（简化提取）
  const remainingTokens = targetTokens - estimateTokenCount(summary);
  if (remainingTokens > 1000) {
    summary += extractCoreContent(content, keyInfo, remainingTokens);
  }

  return summary;
}

/**
 * 提取核心内容（简化版）
 */
function extractCoreContent(content, keyInfo, maxTokens) {
  const lines = content.split('\n');
  let coreContent = '\n## 核心内容\n';
  let currentTokens = estimateTokenCount(coreContent);

  // 根据文档类型提取不同的内容
  const patterns = getContentPatterns(keyInfo.documentType, keyInfo.language);
  
  for (const line of lines) {
    if (currentTokens >= maxTokens * 0.8) break;
    
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 20) continue;

    // 检查是否匹配重要内容模式
    const isImportant = patterns.some(pattern => pattern.test(trimmed));
    
    if (isImportant) {
      const lineTokens = estimateTokenCount(trimmed + '\n');
      if (currentTokens + lineTokens <= maxTokens) {
        coreContent += `${trimmed}\n\n`;
        currentTokens += lineTokens;
      }
    }
  }

  return coreContent;
}

/**
 * 获取内容模式（根据文档类型和语言）
 */
function getContentPatterns(documentType, language) {
  const patterns = [];
  
  if (language === 'jp') {
    patterns.push(
      /について|とは|メリット|デメリット|おすすめ|使い方|まとめ/,
      /^#{1,6}\s.*(紹介|解説|方法|比較|選択|活用)/
    );
  } else if (language === 'zh') {
    patterns.push(
      /介绍|推荐|比较|方法|总结|指南/,
      /^#{1,6}\s.*(介绍|方法|比较|选择|使用)/
    );
  } else {
    patterns.push(
      /introduction|benefits|how to|summary|guide|comparison/i,
      /^#{1,6}\s.*(guide|tutorial|method|comparison)/i
    );
  }

  // 通用模式
  patterns.push(
    /^#{1,6}\s/, // 所有标题
    /^[-*+]\s/, // 列表项
    /^\d+\.\s/ // 编号列表
  );

  return patterns;
}

/**
 * 主处理函数（简化版）
 */
export async function processLargeMarkdown(content, aiApiCall, options = {}) {
  const {
    directProcessLimit = 15000,    // 提高直接处理限制
    summaryProcessLimit = 150000,  // 提高摘要处理限制
    maxRetries = 2
  } = options;

  console.log(`📊 开始处理文档: ${content.length} 字符`);

  // 策略1: 直接处理（适用于大部分清理后的文档）
  if (content.length <= directProcessLimit) {
    console.log('📝 使用直接处理策略');
    try {
      const result = await aiApiCall(content);
      return {
        ...result,
        processingMethod: 'direct',
        originalLength: content.length,
        processedLength: content.length,
        qualityScore: 1.0
      };
    } catch (error) {
      console.warn('直接处理失败，尝试摘要策略:', error.message);
    }
  }

  // 策略2: 智能摘要（适用于大文档）
  console.log('📋 使用智能摘要策略');
  const keyInfo = extractKeyInfo(content);
  
  try {
    const summary = createIntelligentSummary(content, keyInfo, 45000);
    console.log(`📊 摘要生成完成: ${content.length} → ${summary.length} 字符`);
    
    const result = await aiApiCall(summary);
    
    // 使用原文信息优化结果
    const optimizedResult = optimizeWithKeyInfo(result, keyInfo, content);
    
    return {
      ...optimizedResult,
      processingMethod: 'summary',
      originalLength: content.length,
      processedLength: summary.length,
      compressionRatio: summary.length / content.length,
      qualityScore: 0.9,
      keyInfo
    };
  } catch (error) {
    console.error('摘要处理失败:', error.message);
    throw error;
  }
}

/**
 * 使用关键信息优化结果
 */
function optimizeWithKeyInfo(aiResult, keyInfo, originalContent) {
  const optimized = { ...aiResult };
  
  // 修正语言
  if (optimized.language !== keyInfo.language) {
    console.log(`🔧 修正语言: ${optimized.language} → ${keyInfo.language}`);
    optimized.language = keyInfo.language === 'zh' ? 'jp' : keyInfo.language;
  }
  
  // 优化标题
  if (keyInfo.title && keyInfo.title.length > optimized.seo_title.length) {
    optimized.seo_title = keyInfo.title.substring(0, 60);
    optimized.heading_h1 = keyInfo.title;
  }
  
  // 修正阅读时间
  const accurateReadingTime = Math.max(1, Math.ceil(keyInfo.wordCount / 200));
  optimized.reading_time = Math.min(12, accurateReadingTime);
  
  // 改进slug
  if (keyInfo.title) {
    const slug = generateSlug(keyInfo.title);
    if (slug !== 'article') {
      optimized.slug = slug;
    }
  }
  
  return optimized;
}

/**
 * 生成slug（简化版）
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '') // 移除中日文
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) || 'article';
}

// 导出常量
export { DOCUMENT_TYPES };
