import { LinkRow, Suggestion } from '../app/internal-link-optimizer/modules/types';

/**
 * 分析文本中的关键词密度
 * @param text - 要分析的文本
 * @param keywords - 关键词数组
 * @returns 关键词密度对象
 */
export function analyzeKeywordDensity(text: string, keywords: string[]): Record<string, number> {
  const density: Record<string, number> = {};
  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const count = words.filter(word => word.includes(keywordLower)).length;
    density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
  });

  return density;
}

/**
 * 查找文本中所有匹配的锚文本位置
 * @param text - 源文本
 * @param anchorText - 锚文本
 * @returns 位置数组
 */
export function findAnchorTextPositions(text: string, anchorText: string): number[] {
  const positions: number[] = [];
  const regex = new RegExp(`\\b${escapeRegExp(anchorText)}\\b`, 'gi');
  let match;

  while ((match = regex.exec(text)) !== null) {
    positions.push(match.index);
  }

  return positions;
}

/**
 * 计算两个文本之间的相似度
 * @param text1 - 第一个文本
 * @param text2 - 第二个文本
 * @returns 相似度分数 (0-1)
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * 分析文本的可读性（简化版）
 * @param text - 要分析的文本
 * @returns 可读性指标
 */
export function analyzeReadability(text: string): {
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  readabilityScore: number;
} {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // 简化的可读性分数计算（基于平均句长）
  const readabilityScore = Math.max(0, Math.min(100, 100 - (averageWordsPerSentence - 15) * 2));
  
  return {
    wordCount,
    sentenceCount,
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 100) / 100,
    readabilityScore: Math.round(readabilityScore),
  };
}

/**
 * 检测内容中的现有链接
 * @param content - HTML 内容
 * @returns 现有链接数组
 */
export function detectExistingLinks(content: string): Array<{
  href: string;
  text: string;
  position: number;
}> {
  const links: Array<{ href: string; text: string; position: number }> = [];
  const linkRegex = /<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      href: match[1],
      text: match[2].replace(/<[^>]*>/g, ''), // 移除内部HTML标签
      position: match.index,
    });
  }

  return links;
}

/**
 * 评估内链建议的质量
 * @param suggestion - 内链建议
 * @param content - 原始内容
 * @returns 质量分数 (0-100)
 */
export function evaluateSuggestionQuality(suggestion: Suggestion, content: string): number {
  let score = 50; // 基础分数

  // 检查锚文本是否在内容中存在
  const anchorPositions = findAnchorTextPositions(content, suggestion.anchorText);
  if (anchorPositions.length === 0) {
    score -= 30; // 锚文本不存在，大幅降分
  } else if (anchorPositions.length === 1) {
    score += 20; // 唯一匹配，加分
  } else {
    score += 10; // 多个匹配，适度加分
  }

  // 检查锚文本长度
  const anchorLength = suggestion.anchorText.length;
  if (anchorLength >= 2 && anchorLength <= 5) {
    score += 15; // 理想长度
  } else if (anchorLength > 5 && anchorLength <= 10) {
    score += 10; // 可接受长度
  } else {
    score -= 10; // 过短或过长
  }

  // 检查目标URL的有效性
  if (suggestion.newLink.startsWith('/') || suggestion.newLink.startsWith('http')) {
    score += 10; // 有效的URL格式
  } else {
    score -= 20; // 无效的URL格式
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 生成内链优化报告
 * @param originalContent - 原始内容
 * @param suggestions - 建议列表
 * @param linkRows - 用户配置
 * @returns 优化报告
 */
export function generateOptimizationReport(
  originalContent: string,
  suggestions: Suggestion[],
  linkRows: LinkRow[]
): {
  summary: {
    totalSuggestions: number;
    acceptedSuggestions: number;
    rejectedSuggestions: number;
    pendingSuggestions: number;
  };
  contentAnalysis: {
    wordCount: number;
    readabilityScore: number;
    existingLinksCount: number;
  };
  suggestionQuality: {
    averageQuality: number;
    highQualitySuggestions: number;
    lowQualitySuggestions: number;
  };
} {
  const readability = analyzeReadability(originalContent);
  const existingLinks = detectExistingLinks(originalContent);
  
  const qualityScores = suggestions.map(s => evaluateSuggestionQuality(s, originalContent));
  const averageQuality = qualityScores.length > 0 
    ? Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length)
    : 0;

  return {
    summary: {
      totalSuggestions: suggestions.length,
      acceptedSuggestions: suggestions.filter(s => s.accepted === true).length,
      rejectedSuggestions: suggestions.filter(s => s.accepted === false).length,
      pendingSuggestions: suggestions.filter(s => s.accepted === null).length,
    },
    contentAnalysis: {
      wordCount: readability.wordCount,
      readabilityScore: readability.readabilityScore,
      existingLinksCount: existingLinks.length,
    },
    suggestionQuality: {
      averageQuality,
      highQualitySuggestions: qualityScores.filter(score => score >= 70).length,
      lowQualitySuggestions: qualityScores.filter(score => score < 50).length,
    },
  };
}

/**
 * 转义正则表达式特殊字符
 * @param string - 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
