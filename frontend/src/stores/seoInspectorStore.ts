import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { StepType, AuditResult } from "../app/seo-inspector/modules/types";
import { apiService } from "../services/api";

interface SeoInspectorState {
  // 当前步骤
  currentStep: StepType;

  // 当前 URL
  currentUrl: string;

  // 审计结果
  auditResult: AuditResult | null;

  // 加载状态
  isAnalyzing: boolean;

  // 错误处理
  error: string | null;

  // 操作方法
  setCurrentStep: (step: StepType) => void;
  setCurrentUrl: (url: string) => void;
  setAuditResult: (result: AuditResult | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;

  // 业务逻辑方法
  startAudit: (url: string) => Promise<void>;
  goBack: () => void;
  startOver: () => void;
}

// 初始状态
const initialState = {
  currentStep: "input" as StepType,
  currentUrl: "",
  auditResult: null as AuditResult | null,
  isAnalyzing: false,
  error: null as string | null,
};

export const useSeoInspectorStore = create<SeoInspectorState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // 基础设置方法
    setCurrentStep: (step) => set({ currentStep: step }),
    setCurrentUrl: (url) => set({ currentUrl: url }),
    setAuditResult: (result) => set({ auditResult: result }),
    setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
    setError: (error) => set({ error }),

    // 业务逻辑方法
    startAudit: async (url: string) => {
      // 初始化状态
      set({
        currentUrl: url,
        isAnalyzing: true,
        error: null,
        auditResult: null,
      });

      try {
        console.log("[SEO Inspector] Starting analysis for:", url);

        // 调用 API
        const result = await apiService.analyzeSeoUrl(url);

        console.log("[SEO Inspector] Analysis complete:", result);

        // 设置结果并切换到结果页
        set({
          auditResult: result,
          isAnalyzing: false,
          currentStep: "results",
          error: null,
        });
      } catch (error) {
        console.error("[SEO Inspector] Analysis failed:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to analyze URL, please try again",
          isAnalyzing: false,
          auditResult: null,
        });
        throw error; // 重新抛出错误，让调用者处理
      }
    },

    goBack: () => {
      set({
        currentStep: "input",
        error: null,
      });
    },

    startOver: () => {
      set({
        ...initialState,
      });
    },
  }))
);

// 选择器函数 - 用于性能优化
export const selectCurrentStep = (state: SeoInspectorState) =>
  state.currentStep;
export const selectAuditResult = (state: SeoInspectorState) =>
  state.auditResult;
export const selectIsAnalyzing = (state: SeoInspectorState) =>
  state.isAnalyzing;
export const selectError = (state: SeoInspectorState) => state.error;

// 导出 store 的类型
export type { SeoInspectorState };

