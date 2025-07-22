import TurndownService from "turndown";
const turndownService = new TurndownService();

/**
 * 将 HTML 字符串转换为 Markdown
 */
export function htmlToMarkdown(html) {
  return turndownService.turndown(html);
}
