export interface LinkRow {
  id: string;
  targetUrl: string;
  anchorTexts: string[];
}

export interface Suggestion {
  id: string;
  type: 'add' | 'replace';
  text: string;
  newLink: string;
  anchorText: string;
  position: number;
  accepted: boolean | null;
}

export type Step = 'input' | 'analysis' | 'suggestions' | 'output';