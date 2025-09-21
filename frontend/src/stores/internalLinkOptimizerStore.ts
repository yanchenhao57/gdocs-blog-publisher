import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Step, LinkRow } from "../app/internal-link-optimizer/modules/types";
import { apiService } from "../services/api";
import {
  extractFullSlugFromUrl,
  extractContentFromStory,
  generateLinkSuggestions,
  generateOptimizedContent,
} from "../utils/storyblokUtils";
import { parseBulkText } from "../utils/bulkPasteUtils";

interface InternalLinkOptimizerState {
  // 当前步骤
  currentStep: Step;

  // 表单数据
  blogUrl: string;
  linkRows: LinkRow[];

  // 分析结果
  originalContent: string;
  analysisProgress: number;

  // 错误处理
  error: string | null;

  // 获取到的 story 数据
  storyData: any;

  // 操作方法
  setCurrentStep: (step: Step) => void;
  setBlogUrl: (url: string) => void;
  setLinkRows: (rows: LinkRow[] | ((prev: LinkRow[]) => LinkRow[])) => void;
  setOriginalContent: (content: string) => void;
  setAnalysisProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setStoryData: (data: any) => void;

  // 业务逻辑方法
  startAnalysis: () => void;
  goBackToInput: () => void;
  startOver: () => void;

  // LinkRow 操作方法
  addLinkRow: () => void;
  removeLinkRow: (id: string) => void;
  updateLinkRow: (
    id: string,
    field: "targetUrl" | "anchorTexts",
    value: string | string[]
  ) => void;
  addAnchorText: (rowId: string) => void;
  updateAnchorText: (rowId: string, index: number, value: string) => void;
  removeAnchorText: (rowId: string, index: number) => void;

  // 批量粘贴功能
  handleBulkPaste: (text: string) => void;
}

// 初始状态
const initialState = {
  currentStep: "input" as Step,
  blogUrl: "",
  linkRows: [{ id: "1", targetUrl: "", anchorTexts: [""] }] as LinkRow[],
  originalContent: "",
  analysisProgress: 0,
  error: null as string | null,
  storyData: null as any,
};

export const useInternalLinkOptimizerStore =
  create<InternalLinkOptimizerState>()(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // 基础设置方法
      setCurrentStep: (step) => set({ currentStep: step }),
      setBlogUrl: (url) => set({ blogUrl: url }),
      setLinkRows: (rows) =>
        set((state) => ({
          linkRows: typeof rows === "function" ? rows(state.linkRows) : rows,
        })),
      setOriginalContent: (content) => set({ originalContent: content }),
      setAnalysisProgress: (progress) => set({ analysisProgress: progress }),
      setError: (error) => set({ error }),
      setStoryData: (data) => set({ storyData: data }),

      // 业务逻辑方法
      startAnalysis: async () => {
        const state = get();
        const { blogUrl } = state;

        // 清除之前的错误
        set({
          currentStep: "analysis",
          analysisProgress: 0,
          error: null,
          storyData: null,
        });

        try {
          // 验证 URL
          if (!blogUrl.trim()) {
            throw new Error("Please enter a blog URL");
          }

          // 从 URL 解析出 full_slug
          const fullSlug = extractFullSlugFromUrl(blogUrl);
          if (!fullSlug) {
            throw new Error(
              "Unable to parse valid slug from URL, please check URL format"
            );
          }

          // 更新进度：开始获取数据
          set({ analysisProgress: 20 });

          console.log(`🔍 开始分析 URL: ${blogUrl}`);
          console.log(`📝 解析出的 full_slug: ${fullSlug}`);

          // 调用 Storyblok API 获取 story 数据
          const storyData = await apiService.getStoryblokStory(fullSlug);
          const originalContent = extractContentFromStory(storyData);

          // 更新进度：数据获取完成
          set({ analysisProgress: 60, storyData });

          console.log("✅ 成功获取 story 数据:", storyData);

          // 更新进度：内容提取完成
          set({ analysisProgress: 100, originalContent });

          // TODO: Implement new analysis logic here
          // 分析完成，跳转到下一步
          set({
            currentStep: "suggestions",
            error: null,
          });

          console.log("🎉 分析完成");
        } catch (error) {
          console.error("❌ 分析失败:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Analysis failed, please try again",
            currentStep: "input",
            analysisProgress: 0,
          });
        }
      },

      goBackToInput: () => {
        set({ currentStep: "input", analysisProgress: 0 });
      },

      startOver: () => {
        set(initialState);
      },

      // LinkRow 操作方法
      addLinkRow: () => {
        const newRow: LinkRow = {
          id: Date.now().toString(),
          targetUrl: "",
          anchorTexts: [""],
        };
        set((state) => ({
          linkRows: [...state.linkRows, newRow],
        }));
      },

      removeLinkRow: (id) => {
        set((state) => ({
          linkRows:
            state.linkRows.length > 1
              ? state.linkRows.filter((row) => row.id !== id)
              : state.linkRows,
        }));
      },

      updateLinkRow: (id, field, value) => {
        set((state) => ({
          linkRows: state.linkRows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
          ),
        }));
      },

      addAnchorText: (rowId) => {
        set((state) => ({
          linkRows: state.linkRows.map((row) =>
            row.id === rowId
              ? { ...row, anchorTexts: [...row.anchorTexts, ""] }
              : row
          ),
        }));
      },

      updateAnchorText: (rowId, index, value) => {
        set((state) => ({
          linkRows: state.linkRows.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  anchorTexts: row.anchorTexts.map((text, i) =>
                    i === index ? value : text
                  ),
                }
              : row
          ),
        }));
      },

      removeAnchorText: (rowId, index) => {
        set((state) => ({
          linkRows: state.linkRows.map((row) =>
            row.id === rowId && row.anchorTexts.length > 1
              ? {
                  ...row,
                  anchorTexts: row.anchorTexts.filter((_, i) => i !== index),
                }
              : row
          ),
        }));
      },

      // 批量粘贴功能
      handleBulkPaste: (text: string) => {
        const state = get();
        const parsedRows = parseBulkText(text);

        if (parsedRows.length > 0) {
          // 如果当前只有一个空行，替换它；否则追加
          if (
            state.linkRows.length === 1 &&
            state.linkRows[0].targetUrl === "" &&
            state.linkRows[0].anchorTexts.length === 1 &&
            state.linkRows[0].anchorTexts[0] === ""
          ) {
            set({ linkRows: parsedRows });
          } else {
            set({ linkRows: [...state.linkRows, ...parsedRows] });
          }
        }
      },
    }))
  );

// 选择器函数 - 用于性能优化
export const selectCurrentStep = (state: InternalLinkOptimizerState) =>
  state.currentStep;
export const selectFormData = (state: InternalLinkOptimizerState) => ({
  blogUrl: state.blogUrl,
  linkRows: state.linkRows,
});
export const selectAnalysisData = (state: InternalLinkOptimizerState) => ({
  originalContent: state.originalContent,
  analysisProgress: state.analysisProgress,
});

// 导出 store 的类型
export type { InternalLinkOptimizerState };
