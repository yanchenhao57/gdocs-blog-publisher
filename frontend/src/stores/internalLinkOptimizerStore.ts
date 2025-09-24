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

  // 加载状态
  isFetchStoryblokLoading: boolean;
  isAnalyzing: boolean;

  isFetchStoryblokError: boolean;
  isAnalyzingError: boolean;

  // 错误处理
  error: string | null;

  // 获取到的 story 数据
  storyData: IBlogStory | null;

  // 转换后的 Markdown 内容
  markdownContent: MarkdownContent[];

  // 优化结果
  optimizationChanges: OptimizationChange[];

  // 优化状态（用户决策）
  optimizationStatus: Record<number, "pending" | "accepted" | "rejected">;

  // 发布状态
  isPublishing: boolean;
  publishSuccess: boolean;
  publishError: string | null;
  publishResult: { previewLink: string } | null;

  // 操作方法
  setCurrentStep: (step: Step) => void;
  setCompletedSteps: (steps: Set<Step>) => void;
  setBlogUrl: (url: string) => void;
  setLinkRows: (rows: LinkRow[] | ((prev: LinkRow[]) => LinkRow[])) => void;
  setIsFetchStoryblokLoading: (loading: boolean) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setIsFetchStoryblokError: (error: boolean) => void;
  setIsAnalyzingError: (error: boolean) => void;
  setError: (error: string | null) => void;
  setStoryData: (data: any) => void;
  setMarkdownContent: (content: MarkdownContent[]) => void;
  setOptimizationChanges: (changes: OptimizationChange[]) => void;
  setOptimizationStatus: (
    status: Record<number, "pending" | "accepted" | "rejected">
  ) => void;
  updateOptimizationStatus: (
    index: number,
    status: "pending" | "accepted" | "rejected" | "undo"
  ) => void;

  // 发布方法
  setIsPublishing: (publishing: boolean) => void;
  setPublishSuccess: (success: boolean) => void;
  setPublishError: (error: string | null) => void;
  setPublishResult: (result: { previewLink: string } | null) => void;
  publishToStoryblok: () => Promise<void>;

  // 业务逻辑方法
  startAnalysis: () => void;
  fetchStoryblokData: () => Promise<void>;
  runAIAnalysis: () => Promise<void>;
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
  isFetchStoryblokLoading: false,
  isAnalyzing: false,
  isFetchStoryblokError: false,
  isAnalyzingError: false,
  isPublishing: false,
  publishSuccess: false,
  publishError: null as string | null,
  publishResult: null as { previewLink: string } | null,
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
      setIsFetchStoryblokLoading: (loading) =>
        set({ isFetchStoryblokLoading: loading }),
      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      setIsFetchStoryblokError: (error) =>
        set({ isFetchStoryblokError: error }),
      setIsAnalyzingError: (error) => set({ isAnalyzingError: error }),
      setIsPublishing: (publishing) => set({ isPublishing: publishing }),
      setPublishSuccess: (success) => set({ publishSuccess: success }),
      setPublishError: (error) => set({ publishError: error }),
      setPublishResult: (result) => set({ publishResult: result }),
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
      fetchStoryblokData: async () => {
        const state = get();
        const { blogUrl } = state;

        // 清除之前的 Storyblok 相关错误和数据
        set({
          isFetchStoryblokLoading: true,
          isFetchStoryblokError: false,
          isAnalyzingError: false,
          error: null,
          storyData: null,
          markdownContent: [],
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

          console.log(`🔍 开始获取 Storyblok 数据: ${blogUrl}`);
          console.log(`📝 解析出的 full_slug: ${fullSlug}`);

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

          // Storyblok 数据获取完成
          set({
            isFetchStoryblokLoading: false,
            isFetchStoryblokError: false,
            storyData,
            markdownContent,
            error: null,
          });

          console.log("✅ 成功获取 story 数据:", storyData);
        } catch (error) {
          console.error("❌ Storyblok 数据获取失败:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch Storyblok data, please try again",
            isFetchStoryblokLoading: false,
            isFetchStoryblokError: true,
            storyData: null,
            markdownContent: [],
          });
          throw error; // 重新抛出错误，让调用者处理
        }
      },

      runAIAnalysis: async () => {
        const state = get();
        const { markdownContent, linkRows, storyData } = state;

        // 验证是否有 Storyblok 数据
        if (!storyData || !markdownContent || markdownContent.length === 0) {
          const error = new Error(
            "No Storyblok data available. Please fetch data first."
          );
          set({ error: error.message });
          throw error;
        }

        // 清除之前的 AI 相关错误
        set({
          isAnalyzing: true,
          isAnalyzingError: false,
          error: null,
          optimizationChanges: [],
        });

        try {
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

          console.log("🔗 开始 AI 内部链接分析...");
          console.log("📄 内容段落数:", markdownContent.length);
          console.log("🔗 链接数:", validLinks.length);

          // 调用API进行优化
          const optimizationRequest = {
            paragraphs: markdownContent,
            links: validLinks,
          };

          console.log("🚀 发送 AI 优化请求:", optimizationRequest);

          const result = await apiService.optimizeInternalLinks(
            optimizationRequest
          );

          console.log("✅ AI 分析完成:", result);

          // AI 分析完成
          set({
            isAnalyzing: false,
            isAnalyzingError: false,
            optimizationChanges: result.changes,
            error: null,
          });

          console.log(
            "🎉 AI 内部链接分析完成，共生成",
            result.changes.length,
            "个优化建议"
          );
        } catch (error) {
          console.error("❌ AI 分析失败:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "AI analysis failed, please try again",
            isAnalyzing: false,
            isAnalyzingError: true,
          });
          throw error; // 重新抛出错误，让调用者处理
        }
      },

      startAnalysis: async () => {
        // 初始化状态
        set({
          isFetchStoryblokLoading: false,
          isAnalyzing: false,
          isAnalyzingError: false,
          isFetchStoryblokError: false,
          error: null,
          storyData: null,
          markdownContent: [],
          optimizationChanges: [],
        });

        try {
          console.log("🚀 开始完整分析流程...");

          // 第一步：获取 Storyblok 数据
          await get().fetchStoryblokData();

          // 第二步：运行 AI 分析
          await get().runAIAnalysis();

          // 如果到这里说明分析完成，可以跳转到 suggestions
          const currentState = get();
          if (currentState.optimizationChanges.length > 0) {
            set((state) => ({
              currentStep: "suggestions",
              completedSteps: new Set([
                ...state.completedSteps,
                "suggestions",
                "output",
              ]),
              error: null,
            }));
            console.log(
              "🎉 完整分析完成，生成了",
              currentState.optimizationChanges.length,
              "个优化建议"
            );
          }
        } catch (error) {
          console.error("❌ 分析流程失败:", error);
          // 错误已经在各个子方法中处理，这里不需要额外设置
        }
      },

      goBackToInput: () => {
        set({
          currentStep: "input",
          isFetchStoryblokLoading: false,
          isAnalyzing: false,
          isAnalyzingError: false,
          isFetchStoryblokError: false,
        });
      },

      goToStep: (step: Step) => {
        const state = get();
        // 只允许导航到已完成的步骤
        if (state.completedSteps.has(step)) {
          set({ currentStep: step });
        } else {
          console.log(
            "Available completed steps:",
            Array.from(state.completedSteps)
          );
        }
      },

      retryStoryblokFetch: async () => {
        console.log("🔄 重试获取 Storyblok 数据...");

        // 清除之前的 AI 相关状态，但保留 optimizationChanges 状态
        set({
          isAnalyzing: false,
          isAnalyzingError: false,
          isFetchStoryblokError: false,
          isFetchStoryblokLoading: true,
        });

        try {
          await get().fetchStoryblokData();
          console.log("✅ 重试获取 Storyblok 数据成功");

          // 自动继续执行 AI 分析
          await get().runAIAnalysis();

          // 如果分析完成，跳转到 suggestions
          const currentState = get();
          if (currentState.optimizationChanges.length > 0) {
            set((state) => ({
              currentStep: "suggestions",
              completedSteps: new Set([
                ...state.completedSteps,
                "suggestions",
                "output",
              ]),
              error: null,
            }));
            console.log("🎉 重试分析完成");
          }
        } catch (error) {
          console.error("❌ 重试获取 Storyblok 数据失败:", error);
          // 错误已经在子方法中处理
        }
      },

      retryAIAnalysis: async () => {
        console.log("🔄 重试 AI 分析...");

        try {
          await get().runAIAnalysis();
          console.log("✅ 重试 AI 分析成功");

          // 如果分析完成，跳转到 suggestions
          const currentState = get();
          if (currentState.optimizationChanges.length > 0) {
            set((state) => ({
              currentStep: "suggestions",
              completedSteps: new Set([
                ...state.completedSteps,
                "suggestions",
                "output",
              ]),
              error: null,
            }));
            console.log("🎉 重试 AI 分析完成");
          }
        } catch (error) {
          console.error("❌ 重试 AI 分析失败:", error);
          // 错误已经在 runAIAnalysis 中处理
        }
      },

      startOver: () => {
        set({
          ...initialState,
          isPublishing: false,
          publishSuccess: false,
          publishError: null,
          publishResult: null,
        });
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

      // 发布到 Storyblok
      publishToStoryblok: async () => {
        const state = get();
        const {
          storyData,
          optimizationChanges,
          optimizationStatus,
          markdownContent,
        } = state;

        if (!storyData) {
          set({ publishError: "No story data available" });
          return;
        }

        // 计算接受的修改
        const acceptedChanges = optimizationChanges.filter(
          (change) => optimizationStatus[change.index] === "accepted"
        );

        // 计算最终优化内容
        const finalOptimizedContent = (() => {
          // 深拷贝原始的 storyData.content
          const optimizedContent = JSON.parse(
            JSON.stringify(storyData.content)
          );

          // 如果没有接受的修改，直接返回原始内容
          if (acceptedChanges.length === 0) {
            return optimizedContent;
          }

          // 获取 body 中的 content 数组（paragraph 列表）
          if (!optimizedContent.body || !optimizedContent.body.content) {
            console.error("Invalid story content structure");
            return optimizedContent;
          }

          const paragraphs = optimizedContent.body.content;

          // 应用用户接受的修改
          acceptedChanges.forEach((change) => {
            // change.index 对应 paragraph 在 content 数组中的位置
            if (change.index >= 0 && change.index < paragraphs.length) {
              const paragraph = paragraphs[change.index];

              // 确保是 paragraph 类型
              if (paragraph && paragraph.type === "paragraph") {
                try {
                  // 将修改后的 markdown 转换为 ProseMirror paragraph 节点
                  const newParagraphNode =
                    MarkdownConverter.markdownToParagraph(change.modified);
                  if (newParagraphNode) {
                    // 替换原始的 paragraph 内容
                    paragraphs[change.index] = newParagraphNode;
                  }
                } catch (error) {
                  console.error(
                    `Error converting modified content at index ${change.index}:`,
                    error
                  );
                }
              }
            }
          });

          return optimizedContent;
        })();

        set({
          isPublishing: true,
          publishError: null,
          publishSuccess: false,
          publishResult: null,
        });

        try {
          // 构造发布请求数据
          const publishRequest = {
            seo_title: storyData.content.title || storyData.name,
            seo_description: storyData.content.description || "",
            heading_h1: storyData.content.heading_h1 || storyData.name,
            slug: storyData.slug,
            body: finalOptimizedContent.body,
            coverUrl: storyData.content.cover?.filename,
            coverAlt: storyData.content.cover?.alt,
            date: storyData.content.date,
            canonical: storyData.content.canonical,
            author_id: storyData.content.author_id,
            reading_time:
              typeof storyData.content.reading_time === "string"
                ? parseInt(storyData.content.reading_time) || 5
                : storyData.content.reading_time || 5,
            language: storyData?.full_slug?.startsWith("en") ? "en" : "ja",
            is_show_newsletter_dialog:
              storyData.content.is_show_newsletter_dialog,
          };

          console.log("🚀 Publishing to Storyblok:", {
            storyId: storyData.id,
            storyName: storyData.name,
            acceptedChangesCount: acceptedChanges.length,
            totalSuggestions: optimizationChanges.length,
          });

          // 调用真实的 API
          const response = await apiService.publishToStoryblok(publishRequest);

          console.log("✅ Successfully published to Storyblok:", response);
          set({
            isPublishing: false,
            publishSuccess: true,
            publishError: null,
            publishResult: { previewLink: response.previewLink },
          });
        } catch (error) {
          console.error("❌ Failed to publish to Storyblok:", error);
          set({
            isPublishing: false,
            publishSuccess: false,
            publishError:
              error instanceof Error ? error.message : "Publication failed",
          });
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
  isFetchStoryblokLoading: state.isFetchStoryblokLoading,
  isAnalyzing: state.isAnalyzing,
});

// 导出 store 的类型
export type { InternalLinkOptimizerState };
