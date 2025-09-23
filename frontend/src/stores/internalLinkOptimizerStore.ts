import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  Step,
  LinkRow,
  MarkdownContent,
  OptimizationChange,
} from "../app/internal-link-optimizer/modules/types";
import { apiService, StoryblokRichtext } from "../services/api";
import type { IBlogStory } from "../types/storyblok";
import { extractFullSlugFromUrl } from "../utils/storyblokUtils";
import { parseBulkText } from "../utils/bulkPasteUtils";
import MarkdownConverter from "@/utils/markdownConverter";

interface InternalLinkOptimizerState {
  // 当前步骤
  currentStep: Step;

  // 已完成的步骤
  completedSteps: Set<Step>;

  // 表单数据
  blogUrl: string;
  linkRows: LinkRow[];
  analysisProgress: number;
  
  // 独立的进度状态
  storyblokProgress: number;
  aiProgress: number;

  // 错误处理
  error: string | null;

  // 获取到的 story 数据
  storyData: IBlogStory | null;

  // 转换后的 Markdown 内容
  markdownContent: MarkdownContent[];

  // 优化结果
  optimizationChanges: OptimizationChange[];
  optimizationProgress: number;

  // 优化状态（用户决策）
  optimizationStatus: Record<number, "pending" | "accepted" | "rejected">;

  // 操作方法
  setCurrentStep: (step: Step) => void;
  setCompletedSteps: (steps: Set<Step>) => void;
  setBlogUrl: (url: string) => void;
  setLinkRows: (rows: LinkRow[] | ((prev: LinkRow[]) => LinkRow[])) => void;
  setAnalysisProgress: (progress: number) => void;
  setStoryblokProgress: (progress: number) => void;
  setAIProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setStoryData: (data: any) => void;
  setMarkdownContent: (content: MarkdownContent[]) => void;
  setOptimizationChanges: (changes: OptimizationChange[]) => void;
  setOptimizationProgress: (progress: number) => void;
  setOptimizationStatus: (
    status: Record<number, "pending" | "accepted" | "rejected">
  ) => void;
  updateOptimizationStatus: (
    index: number,
    status: "pending" | "accepted" | "rejected" | "undo"
  ) => void;

  // 业务逻辑方法
  startAnalysis: () => void;
  startOptimization: () => void;
  retryStoryblokFetch: () => void;
  retryAIAnalysis: () => void;
  goBackToInput: () => void;
  goToStep: (step: Step) => void;
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
  completedSteps: new Set(["input"]) as Set<Step>,
  blogUrl: "",
  linkRows: [{ id: "1", targetUrl: "", anchorTexts: [""] }] as LinkRow[],
  markdownContent: [],
  optimizationChanges: [],
  optimizationStatus: {},
  analysisProgress: 0,
  storyblokProgress: 0,
  aiProgress: 0,
  optimizationProgress: 0,
  error: null as string | null,
  storyData: null as any,
};

export const useInternalLinkOptimizerStore =
  create<InternalLinkOptimizerState>()(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // 基础设置方法
      setCurrentStep: (step) => set({ currentStep: step }),
      setCompletedSteps: (steps) => set({ completedSteps: steps }),
      setBlogUrl: (url) => set({ blogUrl: url }),
      setLinkRows: (rows) =>
        set((state) => ({
          linkRows: typeof rows === "function" ? rows(state.linkRows) : rows,
        })),
      setAnalysisProgress: (progress) => set({ analysisProgress: progress }),
      setStoryblokProgress: (progress) => set({ storyblokProgress: progress }),
      setAIProgress: (progress) => set({ aiProgress: progress }),
      setOptimizationProgress: (progress) =>
        set({ optimizationProgress: progress }),
      setError: (error) => set({ error }),
      setStoryData: (data) => set({ storyData: data }),
      setMarkdownContent: (content) => set({ markdownContent: content }),
      setOptimizationChanges: (changes) =>
        set({ optimizationChanges: changes }),
      setOptimizationStatus: (status) => set({ optimizationStatus: status }),
      updateOptimizationStatus: (index, status) =>
        set((state) => {
          const newStatus = { ...state.optimizationStatus };
          if (status === "undo") {
            delete newStatus[index];
          } else {
            newStatus[index] = status;
          }
          return { optimizationStatus: newStatus };
        }),
      // 业务逻辑方法
      startAnalysis: async () => {
        const state = get();
        const { blogUrl } = state;

        // 清除之前的错误
        set({
          currentStep: "analysis",
          analysisProgress: 0,
          storyblokProgress: 0,
          aiProgress: 0,
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
          set({ 
            analysisProgress: 10, 
            storyblokProgress: 20 
          });

          console.log(`🔍 开始分析 URL: ${blogUrl}`);
          console.log(`📝 解析出的 full_slug: ${fullSlug}`);

          // 更新 Storyblok 进度
          set({ storyblokProgress: 50 });

          // 调用 Storyblok API 获取 story 数据
          const storyData = await apiService.getStoryblokStory(fullSlug);
          /**
           * 将 Storyblok Richtext 的 Paragraph 转换为 Markdown
           */
          const markdownContent =
            MarkdownConverter.create().extractParagraphsToMarkdown(
              storyData.content?.body as StoryblokRichtext
            );
          console.log("🚀 ~ markdownContent:", markdownContent);

          // 更新进度：Storyblok 数据获取完成
          set({ 
            analysisProgress: 50, 
            storyblokProgress: 100, 
            storyData, 
            markdownContent 
          });

          console.log("✅ 成功获取 story 数据:", storyData);

          await get().startOptimization();

          // 更新进度：内容提取完成
          set({ analysisProgress: 100 });

          // 分析完成，跳转到下一步
          set((state) => ({
            currentStep: "suggestions",
            completedSteps: new Set([
              ...state.completedSteps,
              "analysis",
              "suggestions",
              "output",
            ]),
            error: null,
          }));

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
              storyblokProgress: 0,
              aiProgress: 0,
            });
        }
      },

      startOptimization: async () => {
        const state = get();
        const { markdownContent, linkRows } = state;

        // 开始 AI 分析阶段
        set({
          aiProgress: 0,
          error: null,
          optimizationChanges: [],
        });

        try {
          // 验证输入数据
          if (!markdownContent || markdownContent.length === 0) {
            throw new Error("No content available for optimization");
          }

          // 过滤有效的链接行（有URL和锚文本的）
          const validLinks = linkRows
            .filter(
              (row) =>
                row.targetUrl.trim() &&
                row.anchorTexts.some((text) => text.trim())
            )
            .map((row) => ({
              targetUrl: row.targetUrl.trim(),
              anchorTexts: row.anchorTexts.filter((text) => text.trim()),
            }));

          if (validLinks.length === 0) {
            throw new Error(
              "Please add at least one valid link with anchor text"
            );
          }

          console.log("🔗 开始内部链接优化...");
          console.log("📄 内容段落数:", markdownContent.length);
          console.log("🔗 链接数:", validLinks.length);

          // 更新进度：开始 AI 分析
          set({ 
            analysisProgress: 60,
            aiProgress: 20 
          });

          // 调用API进行优化
          const optimizationRequest = {
            paragraphs: markdownContent,
            links: validLinks,
          };

          console.log("🚀 发送优化请求:", optimizationRequest);

          set({ 
            analysisProgress: 80,
            aiProgress: 60 
          });

          const result = await apiService.optimizeInternalLinks(
            optimizationRequest
          );

          console.log("✅ 优化完成:", result);

          // 更新进度：AI 分析完成
          set({
            analysisProgress: 100,
            aiProgress: 100,
            optimizationChanges: result.changes,
          });

          // 跳转到输出步骤
          // set({
          //   currentStep: "output",
          //   error: null,
          // });

          console.log(
            "🎉 内部链接优化完成，共生成",
            result.changes.length,
            "个修改"
          );
        } catch (error) {
          console.error("❌ 优化失败:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Optimization failed, please try again",
              currentStep: "suggestions",
              aiProgress: 0,
            });
        }
      },

      goBackToInput: () => {
        set({ currentStep: "input", analysisProgress: 0 });
      },

      goToStep: (step: Step) => {
        const state = get();
        console.log(
          "🚀 ~ goToStep: (step: Step) => {",
          step,
          "completedSteps:",
          Array.from(state.completedSteps)
        );
        // 只允许导航到已完成的步骤
        if (state.completedSteps.has(step)) {
          console.log("✅ Step is completed, navigating to:", step);
          set({ currentStep: step });
        } else {
          console.warn("❌ Step is not completed, cannot navigate to:", step);
          console.log("Available completed steps:", Array.from(state.completedSteps));
        }
      },

      retryStoryblokFetch: async () => {
        const state = get();
        const { blogUrl } = state;

        // 清除之前的错误，重置相关状态
        set({
          currentStep: "analysis",
          analysisProgress: 0,
          storyblokProgress: 0,
          aiProgress: 0,
          error: null,
          storyData: null,
          markdownContent: [],
          optimizationChanges: [],
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
          set({ 
            analysisProgress: 10, 
            storyblokProgress: 20 
          });

          console.log(`🔍 重新获取 Storyblok 数据: ${blogUrl}`);
          console.log(`📝 解析出的 full_slug: ${fullSlug}`);

          // 更新 Storyblok 进度
          set({ storyblokProgress: 50 });

          // 调用 Storyblok API 获取 story 数据
          const storyData = await apiService.getStoryblokStory(fullSlug);
          const markdownContent =
            MarkdownConverter.create().extractParagraphsToMarkdown(
              storyData.content?.body as StoryblokRichtext
            );

          // 更新进度：Storyblok 数据获取完成
          set({ 
            analysisProgress: 50, 
            storyblokProgress: 100, 
            storyData, 
            markdownContent 
          });

          console.log("✅ 重新获取 Storyblok 数据成功:", storyData);

          // 继续执行 AI 分析
          await get().startOptimization();

          // 更新进度：完成
          set({ analysisProgress: 100 });

          // 分析完成，跳转到下一步
          set((state) => ({
            currentStep: "suggestions",
            completedSteps: new Set([
              ...state.completedSteps,
              "analysis",
              "suggestions",
              "output",
            ]),
            error: null,
          }));

          console.log("🎉 重新分析完成");
        } catch (error) {
          console.error("❌ 重新获取 Storyblok 数据失败:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch Storyblok data, please try again",
              currentStep: "input",
              analysisProgress: 0,
              storyblokProgress: 0,
              aiProgress: 0,
            });
        }
      },

      retryAIAnalysis: async () => {
        const state = get();
        const { markdownContent, linkRows, storyData } = state;

        // 验证前置条件
        if (!storyData) {
          set({
            error: "No Storyblok data available. Please fetch data first.",
            currentStep: "input",
          });
          return;
        }

        if (!markdownContent || markdownContent.length === 0) {
          set({
            error:
              "No content available for analysis. Please fetch data first.",
            currentStep: "input",
          });
          return;
        }

        // 重置 AI 分析相关状态
        set({
          analysisProgress: 50, // 保持 Storyblok 阶段完成状态
          aiProgress: 0, // 重置 AI 进度
          optimizationChanges: [],
          error: null,
          currentStep: "analysis",
        });

        try {
          console.log("🤖 重新执行 AI 分析...");

          // 执行优化分析
          await get().startOptimization();

          // 更新进度：完成
          set({ analysisProgress: 100 });

          // 分析完成，跳转到下一步
          set((state) => ({
            currentStep: "suggestions",
            completedSteps: new Set([
              ...state.completedSteps,
              "analysis",
              "suggestions",
              "output",
            ]),
            error: null,
          }));

          console.log("🎉 AI 重新分析完成");
        } catch (error) {
          console.error("❌ AI 重新分析失败:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "AI analysis failed, please try again",
              analysisProgress: 50, // 保持 Storyblok 阶段完成状态
              aiProgress: 0, // 重置 AI 进度
              currentStep: "analysis",
            });
        }
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
  analysisProgress: state.analysisProgress,
});

// 导出 store 的类型
export type { InternalLinkOptimizerState };
