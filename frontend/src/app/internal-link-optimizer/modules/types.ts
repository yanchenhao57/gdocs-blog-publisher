export interface LinkRow {
  id: string;
  targetUrl: string;
  anchorTexts: string[];
}
export interface MarkdownContent {
  /**
   * 在原始内容中的索引
   */
  index: number;
  /**
   * 转换后的 Markdown 内容
   */
  markdown: string;
}

export interface Suggestion {
  id: string;
  type: "add" | "replace";
  text: string;
  newLink: string;
  anchorText: string;
  position: number;
  accepted: boolean | null;
}

export type Step = "input" | "suggestions" | "optimization" | "output";

export interface OptimizationChange {
  index: number;
  original: string;
  modified: string;
}
