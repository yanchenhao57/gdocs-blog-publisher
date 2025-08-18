import TurndownService from "turndown";

// 配置 TurndownService
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-'
});

// 添加规则来移除不需要的元素
turndownService.addRule('removeStyles', {
  filter: ['style'],
  replacement: function () {
    return '';
  }
});

turndownService.addRule('removeScripts', {
  filter: ['script'],
  replacement: function () {
    return '';
  }
});

/**
 * 清理HTML中的CSS和不必要的内容
 * @param {string} html - 原始HTML
 * @returns {string} 清理后的HTML
 */
function cleanHtml(html) {
  // 移除 <style> 标签及其内容
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // 移除 <script> 标签及其内容
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // 移除内联样式属性
  html = html.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
  
  // 移除class属性（Google Docs生成的CSS类名）
  html = html.replace(/\s*class\s*=\s*["'][^"']*["']/gi, '');
  
  // 移除其他不必要的属性
  html = html.replace(/\s*id\s*=\s*["'][^"']*["']/gi, '');
  html = html.replace(/\s*data-[^=]*\s*=\s*["'][^"']*["']/gi, '');
  
  // 移除空的div和span标签
  html = html.replace(/<div[^>]*>\s*<\/div>/gi, '');
  html = html.replace(/<span[^>]*>\s*<\/span>/gi, '');
  
  // 清理多余的空白行
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return html;
}

/**
 * 将 HTML 字符串转换为 Markdown
 * @param {string} html - 原始HTML字符串
 * @returns {string} 转换后的Markdown
 */
export function htmlToMarkdown(html) {
  console.log('🧹 开始清理HTML（移除CSS和不必要内容）...');
  console.log(`📊 原始HTML长度: ${html.length} 字符`);
  
  // 先清理HTML
  const cleanedHtml = cleanHtml(html);
  console.log(`📊 清理后HTML长度: ${cleanedHtml.length} 字符 (减少 ${html.length - cleanedHtml.length} 字符)`);
  
  // 转换为Markdown
  const markdown = turndownService.turndown(cleanedHtml);
  console.log(`📊 最终Markdown长度: ${markdown.length} 字符`);
  
  return markdown;
}
