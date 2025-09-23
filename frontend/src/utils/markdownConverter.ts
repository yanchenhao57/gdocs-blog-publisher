// 导入 Storyblok 类型定义
import { StoryblokRichtext, StoryblokRichtextNode } from "../services/api";

// 类型别名以保持代码兼容性
type Mark = { type: string; attrs?: Record<string, any> };

interface ParagraphWithIndex {
  index: number;
  markdown: string;
}

interface MatchResult {
  start: number;
  end: number;
  type: string;
  content: string;
  url?: string;
  fullMatch: string;
}

interface FormatPattern {
  regex: RegExp;
  type: string;
}

/**
 * Markdown 和 Paragraph 格式双向转换器
 */
export class MarkdownConverter {
  private static readonly LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

  private static readonly FORMAT_PATTERNS: FormatPattern[] = [
    { regex: /\*\*([^*]+)\*\*/g, type: "bold" }, // 粗体
    { regex: /~~([^~]+)~~/g, type: "strike" }, // 删除线
    { regex: /<u>([^<]+)<\/u>/g, type: "underline" }, // 下划线
    { regex: /<sup>([^<]+)<\/sup>/g, type: "superscript" }, // 上标
    { regex: /<sub>([^<]+)<\/sub>/g, type: "subscript" }, // 下标
    { regex: /<mark>([^<]+)<\/mark>/g, type: "highlight" }, // 高亮
    { regex: /`([^`]+)`/g, type: "code" }, // 代码
    { regex: /\*([^*]+)\*/g, type: "italic" }, // 斜体（最后处理）
  ];

  /**
   * 将文档中的段落提取为 Markdown 格式
   * @param doc 文档节点
   * @returns 包含索引和 Markdown 内容的段落数组
   */
  public static extractParagraphsToMarkdown(
    doc: StoryblokRichtext
  ): ParagraphWithIndex[] {
    if (!doc || !doc.content) {
      return [];
    }

    const paragraphs: ParagraphWithIndex[] = [];

    doc.content.forEach((node, index) => {
      if (node.type === "paragraph") {
        const md = this.nodeToMarkdown(node);
        paragraphs.push({
          index, // 标识在原始JSON中的位置
          markdown: md,
        });
      }
    });

    return paragraphs;
  }

  /**
   * 将单个节点转换为 Markdown
   * @param node 段落节点
   * @returns Markdown 字符串
   */
  public static nodeToMarkdown(node: StoryblokRichtextNode): string {
    if (!node.content) {
      return "";
    }

    return node.content
      .map((child) => {
        if (child.type === "text") {
          let text = child.text || "";

          if (child.marks) {
            child.marks.forEach((mark) => {
              switch (mark.type) {
                case "bold":
                  text = `**${text}**`;
                  break;
                case "italic":
                  text = `*${text}*`;
                  break;
                case "code":
                  text = `\`${text}\``;
                  break;
                case "strike":
                  text = `~~${text}~~`;
                  break;
                case "underline":
                  text = `<u>${text}</u>`;
                  break;
                case "link":
                  if (mark.attrs?.href) {
                    text = `[${text}](${mark.attrs.href})`;
                  }
                  break;
                case "superscript":
                  text = `<sup>${text}</sup>`;
                  break;
                case "subscript":
                  text = `<sub>${text}</sub>`;
                  break;
                case "highlight":
                  text = `<mark>${text}</mark>`;
                  break;
                default:
                  break;
              }
            });
          }

          return text;
        }
        return "";
      })
      .join("");
  }

  /**
   * 将 Markdown 转换为段落格式
   * @param markdown Markdown 字符串
   * @returns 段落节点或 null
   */
  public static markdownToParagraph(
    markdown: string
  ): StoryblokRichtextNode | null {
    if (!markdown || typeof markdown !== "string") {
      return null;
    }

    const content = this.parseMarkdownText(markdown);

    return {
      type: "paragraph",
      content: content,
    };
  }

  /**
   * 将 Markdown 数组转换为文档格式
   * @param markdownArray Markdown 字符串数组
   * @returns 文档节点或 null
   */
  public static markdownArrayToDoc(
    markdownArray: string[]
  ): StoryblokRichtext | null {
    if (!Array.isArray(markdownArray)) {
      return null;
    }

    const content = markdownArray
      .map((md) => this.markdownToParagraph(md))
      .filter(
        (paragraph): paragraph is StoryblokRichtextNode => paragraph !== null
      );

    return {
      type: "doc",
      content: content,
    };
  }

  /**
   * 解析 Markdown 文本为内容数组 - 使用递归处理嵌套格式
   * @param text Markdown 文本
   * @returns 文本节点数组
   */
  private static parseMarkdownText(text: string): StoryblokRichtextNode[] {
    // 首先处理链接，因为它们的优先级最高
    const linkMatches: MatchResult[] = [];
    let linkMatch: RegExpExecArray | null;
    const linkRegex = new RegExp(this.LINK_REGEX);

    while ((linkMatch = linkRegex.exec(text)) !== null) {
      linkMatches.push({
        start: linkMatch.index,
        end: linkMatch.index + linkMatch[0].length,
        type: "link",
        content: linkMatch[1],
        url: linkMatch[2],
        fullMatch: linkMatch[0],
      });
    }

    // 如果有链接，先处理链接
    if (linkMatches.length > 0) {
      const content: StoryblokRichtextNode[] = [];
      let currentPos = 0;

      linkMatches.forEach((linkMatch) => {
        // 处理链接前的文本
        if (linkMatch.start > currentPos) {
          const beforeText = text.slice(currentPos, linkMatch.start);
          content.push(...this.parseMarkdownTextSimple(beforeText));
        }

        // 添加链接
        content.push({
          type: "text",
          text: linkMatch.content,
          marks: [
            {
              type: "link",
              attrs: {
                href: linkMatch.url,
                target: "_self",
                linktype: "url",
              },
            },
          ],
        });

        currentPos = linkMatch.end;
      });

      // 处理最后剩余的文本
      if (currentPos < text.length) {
        const afterText = text.slice(currentPos);
        content.push(...this.parseMarkdownTextSimple(afterText));
      }

      return content;
    }

    // 如果没有链接，直接处理其他格式
    return this.parseMarkdownTextSimple(text);
  }

  /**
   * 处理简单的 Markdown 格式（不包括链接）
   * @param text 文本内容
   * @returns 文本节点数组
   */
  private static parseMarkdownTextSimple(
    text: string
  ): StoryblokRichtextNode[] {
    if (!text) {
      return [];
    }

    const content: StoryblokRichtextNode[] = [];
    let currentPos = 0;

    // 找到所有匹配
    const allMatches: MatchResult[] = [];
    this.FORMAT_PATTERNS.forEach((pattern) => {
      let match: RegExpExecArray | null;
      pattern.regex.lastIndex = 0;
      while ((match = pattern.regex.exec(text)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: pattern.type,
          content: match[1],
          fullMatch: match[0],
        });
      }
    });

    // 按位置排序
    allMatches.sort((a, b) => a.start - b.start);

    // 移除重叠的匹配（保留先出现的）
    const validMatches: MatchResult[] = [];
    allMatches.forEach((match) => {
      const hasOverlap = validMatches.some(
        (existing) => match.start < existing.end && match.end > existing.start
      );
      if (!hasOverlap) {
        validMatches.push(match);
      }
    });

    // 构建内容
    validMatches.forEach((match) => {
      // 添加前面的普通文本
      if (match.start > currentPos) {
        const plainText = text.slice(currentPos, match.start);
        if (plainText) {
          content.push({
            type: "text",
            text: plainText,
          });
        }
      }

      // 添加格式化文本
      content.push({
        type: "text",
        text: match.content,
        marks: [{ type: match.type }],
      });

      currentPos = match.end;
    });

    // 添加剩余文本
    if (currentPos < text.length) {
      const remainingText = text.slice(currentPos);
      if (remainingText) {
        content.push({
          type: "text",
          text: remainingText,
        });
      }
    }

    // 如果没有任何格式，返回纯文本
    if (content.length === 0 && text) {
      content.push({
        type: "text",
        text: text,
      });
    }

    return content;
  }

  /**
   * 创建转换器实例
   * @returns MarkdownConverter 实例
   */
  public static create(): MarkdownConverter {
    return new MarkdownConverter();
  }

  // 实例方法（如果需要状态管理或配置）

  /**
   * 实例方法：将文档转换为 Markdown
   */
  public extractParagraphsToMarkdown(
    doc: StoryblokRichtext
  ): ParagraphWithIndex[] {
    return MarkdownConverter.extractParagraphsToMarkdown(doc);
  }

  /**
   * 实例方法：将 Markdown 转换为段落
   */
  public markdownToParagraph(markdown: string): StoryblokRichtextNode | null {
    return MarkdownConverter.markdownToParagraph(markdown);
  }

  /**
   * 实例方法：将 Markdown 数组转换为文档
   */
  public markdownArrayToDoc(markdownArray: string[]): StoryblokRichtext | null {
    return MarkdownConverter.markdownArrayToDoc(markdownArray);
  }
}

// 导出类型 (重新导出 Storyblok 类型以保持兼容性)
export type { Mark, ParagraphWithIndex, MatchResult, FormatPattern };

// 重新导出 Storyblok 类型
export type { StoryblokRichtext, StoryblokRichtextNode } from "../services/api";

// 默认导出
export default MarkdownConverter;
