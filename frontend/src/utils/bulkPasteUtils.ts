import { LinkRow } from '../app/internal-link-optimizer/modules/types';

/**
 * 解析批量粘贴的文本为 LinkRow 数组
 * @param text - 批量粘贴的文本
 * @returns 解析后的 LinkRow 数组
 */
export function parseBulkText(text: string): LinkRow[] {
  const lines = text
    .trim()
    .split('\n')
    .filter((line) => line.trim());
  const parsedRows: LinkRow[] = [];

  lines.forEach((line, index) => {
    // 匹配 URL | anchor text 格式
    const urlMatch = line.match(/^(https?:\/\/[^\s|]+)/);
    if (urlMatch) {
      const url = urlMatch[1];
      // 提取管道符后的所有文本作为anchor texts
      const afterUrl = line.substring(url.length).replace(/^\s*\|\s*/, '');
      const anchorTexts = afterUrl
        .split('|')
        .map((text) => text.trim())
        .filter((text) => text);

      if (anchorTexts.length > 0) {
        parsedRows.push({
          id: `bulk-${Date.now()}-${index}`,
          targetUrl: url,
          anchorTexts: anchorTexts,
        });
      }
    }
  });

  return parsedRows;
}

/**
 * 验证批量粘贴文本的格式
 * @param text - 要验证的文本
 * @returns 验证结果
 */
export function validateBulkPasteFormat(text: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validLinesCount: number;
  totalLinesCount: number;
} {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const errors: string[] = [];
  const warnings: string[] = [];
  let validLinesCount = 0;

  if (lines.length === 0) {
    errors.push('输入内容为空');
    return {
      isValid: false,
      errors,
      warnings,
      validLinesCount: 0,
      totalLinesCount: 0,
    };
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // 检查是否包含 URL
    const urlMatch = line.match(/^(https?:\/\/[^\s|]+)/);
    if (!urlMatch) {
      errors.push(`第 ${lineNumber} 行：未找到有效的 URL`);
      return;
    }

    const url = urlMatch[1];
    
    // 检查 URL 格式
    try {
      new URL(url);
    } catch {
      errors.push(`第 ${lineNumber} 行：URL 格式无效`);
      return;
    }

    // 检查是否有锚文本
    const afterUrl = line.substring(url.length).replace(/^\s*\|\s*/, '');
    if (!afterUrl.trim()) {
      warnings.push(`第 ${lineNumber} 行：没有找到锚文本`);
      return;
    }

    const anchorTexts = afterUrl
      .split('|')
      .map(text => text.trim())
      .filter(text => text);

    if (anchorTexts.length === 0) {
      warnings.push(`第 ${lineNumber} 行：锚文本为空`);
      return;
    }

    // 检查锚文本长度
    anchorTexts.forEach((anchorText, anchorIndex) => {
      if (anchorText.length > 50) {
        warnings.push(`第 ${lineNumber} 行，锚文本 ${anchorIndex + 1}：长度过长（建议不超过 50 字符）`);
      }
      if (anchorText.length < 2) {
        warnings.push(`第 ${lineNumber} 行，锚文本 ${anchorIndex + 1}：长度过短（建议至少 2 个字符）`);
      }
    });

    validLinesCount++;
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validLinesCount,
    totalLinesCount: lines.length,
  };
}

/**
 * 生成批量粘贴的示例文本
 * @returns 示例文本
 */
export function generateBulkPasteExample(): string {
  return `https://example.com/design-patterns | design patterns | UI patterns | best practices
https://example.com/seo-guide | SEO optimization | search engine optimization
https://example.com/content-strategy | content marketing | content strategy | marketing tips`;
}

/**
 * 将 LinkRow 数组转换为批量粘贴格式的文本
 * @param linkRows - LinkRow 数组
 * @returns 格式化的文本
 */
export function linkRowsToBulkText(linkRows: LinkRow[]): string {
  return linkRows
    .filter(row => row.targetUrl.trim() && row.anchorTexts.some(text => text.trim()))
    .map(row => {
      const url = row.targetUrl;
      const anchors = row.anchorTexts.filter(text => text.trim()).join(' | ');
      return `${url} | ${anchors}`;
    })
    .join('\n');
}

/**
 * 预处理批量粘贴文本（清理和标准化）
 * @param text - 原始文本
 * @returns 处理后的文本
 */
export function preprocessBulkText(text: string): string {
  return text
    .split('\n')
    .map(line => {
      // 移除行首尾空格
      line = line.trim();
      
      // 标准化分隔符（将多种分隔符统一为 |）
      line = line.replace(/[，,；;]/g, ' | ');
      
      // 清理多余的空格和分隔符
      line = line.replace(/\s*\|\s*/g, ' | ');
      line = line.replace(/\s+/g, ' ');
      
      return line;
    })
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * 检测批量粘贴文本中的重复项
 * @param text - 批量粘贴文本
 * @returns 重复项信息
 */
export function detectDuplicates(text: string): {
  duplicateUrls: Array<{ url: string; lines: number[] }>;
  duplicateAnchors: Array<{ anchor: string; lines: number[] }>;
} {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const urlMap = new Map<string, number[]>();
  const anchorMap = new Map<string, number[]>();

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const urlMatch = line.match(/^(https?:\/\/[^\s|]+)/);
    
    if (urlMatch) {
      const url = urlMatch[1];
      
      // 记录 URL
      if (!urlMap.has(url)) {
        urlMap.set(url, []);
      }
      urlMap.get(url)!.push(lineNumber);

      // 记录锚文本
      const afterUrl = line.substring(url.length).replace(/^\s*\|\s*/, '');
      const anchorTexts = afterUrl
        .split('|')
        .map(text => text.trim())
        .filter(text => text);

      anchorTexts.forEach(anchor => {
        if (!anchorMap.has(anchor)) {
          anchorMap.set(anchor, []);
        }
        anchorMap.get(anchor)!.push(lineNumber);
      });
    }
  });

  const duplicateUrls = Array.from(urlMap.entries())
    .filter(([, lines]) => lines.length > 1)
    .map(([url, lines]) => ({ url, lines }));

  const duplicateAnchors = Array.from(anchorMap.entries())
    .filter(([, lines]) => lines.length > 1)
    .map(([anchor, lines]) => ({ anchor, lines }));

  return { duplicateUrls, duplicateAnchors };
}
