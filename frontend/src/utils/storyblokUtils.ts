import { LinkRow, Suggestion } from '../app/internal-link-optimizer/modules/types';

/**
 * 从 URL 中提取 full_slug
 * @param url - 完整的 blog URL
 * @returns full_slug 或 null（如果解析失败）
 */
export function extractFullSlugFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // 移除开头的斜杠并返回路径
    const fullSlug = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    
    // 移除末尾的斜杠
    return fullSlug.endsWith('/') ? fullSlug.slice(0, -1) : fullSlug;
  } catch (error) {
    console.error('URL 解析失败:', error);
    return null;
  }
}

/**
 * 从 story 数据中提取内容
 * @param storyData - Storyblok story 数据
 * @returns 提取的文本内容
 */
export function extractContentFromStory(storyData: any): string {
  try {
    const content = storyData?.content;
    if (!content) {
      throw new Error('Story 数据中没有找到 content 字段');
    }

    // 如果有 body 字段，尝试提取 richtext 内容
    if (content.body && Array.isArray(content.body)) {
      return extractTextFromRichtext(content.body);
    }

    // 如果有纯文本内容
    if (content.text) {
      return content.text;
    }

    // 如果有标题，至少返回标题
    if (content.title || content.heading_h1) {
      return content.title || content.heading_h1;
    }

    throw new Error('无法从 Story 中提取可分析的内容');
  } catch (error) {
    console.error('内容提取失败:', error);
    return `无法提取内容: ${error instanceof Error ? error.message : '未知错误'}`;
  }
}

/**
 * 从 Storyblok richtext 中提取纯文本
 * @param richtext - Storyblok richtext 数组
 * @returns 提取的纯文本
 */
export function extractTextFromRichtext(richtext: any[]): string {
  let text = '';
  
  function traverse(nodes: any[]): void {
    for (const node of nodes) {
      if (node.type === 'text' && node.text) {
        text += node.text;
      } else if (node.type === 'paragraph') {
        if (text && !text.endsWith('\n')) {
          text += '\n';
        }
        if (node.content) {
          traverse(node.content);
        }
        text += '\n';
      } else if (node.type === 'heading') {
        if (text && !text.endsWith('\n')) {
          text += '\n';
        }
        if (node.content) {
          traverse(node.content);
        }
        text += '\n\n';
      } else if (node.content) {
        traverse(node.content);
      }
    }
  }
  
  traverse(richtext);
  return text.trim();
}

/**
 * 生成基于用户配置的内链建议
 * @param linkRows - 用户配置的链接行
 * @param originalContent - 原始内容（可选，用于更智能的匹配）
 * @returns 生成的建议数组
 */
export function generateLinkSuggestions(linkRows: LinkRow[], originalContent?: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  linkRows.forEach((row, index) => {
    if (row.targetUrl && row.anchorTexts.length > 0) {
      row.anchorTexts.forEach((anchorText, anchorIndex) => {
        if (anchorText.trim()) {
          // 如果有原始内容，检查是否包含该锚文本
          let shouldInclude = true;
          let position = index * 20 + anchorIndex * 5; // 默认位置

          if (originalContent) {
            const regex = new RegExp(`\\b${escapeRegExp(anchorText)}\\b`, 'i');
            const match = originalContent.match(regex);
            
            if (match && match.index !== undefined) {
              position = match.index;
            } else {
              // 如果内容中没有找到匹配的锚文本，可以选择跳过或标记
              shouldInclude = false;
            }
          }

          if (shouldInclude) {
            suggestions.push({
              id: `${row.id}-${anchorIndex}`,
              type: 'add',
              text: originalContent 
                ? `在位置 ${position} 处添加指向 "${row.targetUrl}" 的内链`
                : `建议添加指向 "${row.targetUrl}" 的内链`,
              newLink: row.targetUrl,
              anchorText: anchorText,
              position,
              accepted: null,
            });
          }
        }
      });
    }
  });

  return suggestions;
}

/**
 * 生成优化后的内容
 * @param originalContent - 原始内容
 * @param suggestions - 建议数组
 * @returns 优化后的内容
 */
export function generateOptimizedContent(originalContent: string, suggestions: Suggestion[]): string {
  let optimizedContent = originalContent;
  
  // 按位置从后往前排序，避免位置偏移问题
  const sortedSuggestions = suggestions
    .filter(s => s.accepted !== false) // 只处理未拒绝的建议
    .sort((a, b) => (b.position || 0) - (a.position || 0));
  
  sortedSuggestions.forEach(suggestion => {
    if (suggestion.anchorText && suggestion.newLink) {
      // 查找第一个匹配的文本并替换为链接
      const regex = new RegExp(`\\b${escapeRegExp(suggestion.anchorText)}\\b`, 'i');
      if (regex.test(optimizedContent)) {
        optimizedContent = optimizedContent.replace(
          regex, 
          `<a href="${suggestion.newLink}" class="internal-link-new">${suggestion.anchorText}</a>`
        );
      }
    }
  });
  
  return optimizedContent;
}

/**
 * 转义正则表达式特殊字符
 * @param string - 需要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 验证 URL 格式
 * @param url - 需要验证的 URL
 * @returns 是否为有效的 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 从 URL 中提取域名
 * @param url - 完整的 URL
 * @returns 域名或 null
 */
export function extractDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * 检查两个 URL 是否在同一域名下
 * @param url1 - 第一个 URL
 * @param url2 - 第二个 URL
 * @returns 是否在同一域名
 */
export function isSameDomain(url1: string, url2: string): boolean {
  const domain1 = extractDomainFromUrl(url1);
  const domain2 = extractDomainFromUrl(url2);
  return domain1 !== null && domain2 !== null && domain1 === domain2;
}

/**
 * 清理和标准化 slug
 * @param slug - 原始 slug
 * @returns 清理后的 slug
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, '') // 移除开头和结尾的斜杠
    .replace(/\/+/g, '/'); // 将多个斜杠替换为单个斜杠
}
