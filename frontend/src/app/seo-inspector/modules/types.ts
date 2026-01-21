export type StepType = 'input' | 'results';

export interface SEOElement {
  name: string;
  initialValue: string | null;
  renderedValue: string | null;
  isVisible: boolean;
}

export interface AuditResult {
  url: string;
  timestamp: string;
  status: 'high-risk' | 'warning' | 'optimal';
  httpStatus: number;
  responseSize: string;
  robotsStatus: string;
  coverage: number;
  semanticCoverage?: number;
  htmlSemanticRatio?: number;
  renderedSemanticRatio?: number;
  htmlHiddenRatio?: number;
  renderedHiddenRatio?: number;
  htmlHiddenTextLength?: number;
  htmlHiddenElementsCount?: number;
  renderedHiddenTextLength?: number;
  renderedHiddenElementsCount?: number;
  initialHtmlText: string;
  renderedHtmlText: string;
  seoElements: SEOElement[];
}

