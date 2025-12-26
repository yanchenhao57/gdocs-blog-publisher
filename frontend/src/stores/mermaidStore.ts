import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import {
  exportMermaidDocs,
  importMermaidDocs,
  backupCurrentData,
} from "@/utils/exportImportUtils";
import {
  saveToIndexedDB,
  loadFromIndexedDB,
  saveHistoryToIndexedDB,
  loadHistoryFromIndexedDB,
} from "@/utils/indexedDBStorage";

/**
 * 节点文档数据结构
 */
export interface NodeDoc {
  id: string;
  content: string; // HTML 字符串
}

/**
 * 项目历史记录
 */
export interface ProjectHistory {
  id: string;
  name: string;
  mermaidCode: string;
  nodeDocs: Record<string, NodeDoc>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Mermaid 状态
 */
export interface MermaidState {
  // 当前项目 ID
  currentProjectId: string | null;

  // Mermaid 源码
  mermaidCode: string;

  // 当前选中的节点 ID
  selectedNodeId: string | null;

  // 节点文档映射表 (nodeId -> NodeDoc)
  nodeDocs: Record<string, NodeDoc>;

  // 最后保存时间
  lastSavedAt: number | null;

  // 是否有未保存的更改
  hasUnsavedChanges: boolean;

  // 项目历史记录（最多10个）
  projectHistory: ProjectHistory[];
}

/**
 * Mermaid Actions
 */
export interface MermaidActions {
  // 更新 Mermaid 源码
  updateMermaidCode: (code: string) => void;

  // 选择节点
  selectNode: (nodeId: string | null) => void;

  // 更新节点文档
  updateNodeDoc: (nodeId: string, content: string) => void;

  // 删除节点文档
  deleteNodeDoc: (nodeId: string) => void;

  // 批量设置节点文档
  setNodeDocs: (docs: Record<string, NodeDoc>) => void;

  // 保存到本地存储
  saveToLocal: () => void;

  // 从本地存储加载
  loadFromLocal: () => void;

  // 重置状态
  reset: () => void;

  // 标记为已保存
  markAsSaved: () => void;

  // 导出数据
  exportData: (projectName?: string) => Promise<void>;

  // 导入数据
  importData: (file: File, projectName?: string) => Promise<void>;

  // 项目历史记录相关
  saveCurrentAsHistory: (name?: string) => void;
  loadProjectFromHistory: (projectId: string) => void;
  deleteProjectFromHistory: (projectId: string) => void;
  updateProjectName: (projectId: string, newName: string) => void;
  createNewProject: (name?: string) => void;
}

export type MermaidStore = MermaidState & MermaidActions;

/**
 * 默认的 Mermaid 示例代码
 */
const DEFAULT_MERMAID_CODE = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`;

/**
 * 初始状态
 */
const initialState: MermaidState = {
  currentProjectId: null,
  mermaidCode: DEFAULT_MERMAID_CODE,
  selectedNodeId: null,
  nodeDocs: {},
  lastSavedAt: null,
  hasUnsavedChanges: false,
  projectHistory: [],
};

/**
 * 从 IndexedDB 加载数据
 */
const loadFromStorage = async (): Promise<Partial<MermaidState> | null> => {
  try {
    const data = await loadFromIndexedDB();
    if (data) {
      return {
        currentProjectId: data.currentProjectId || null,
        mermaidCode: data.mermaidCode || initialState.mermaidCode,
        nodeDocs: data.nodeDocs || {},
        lastSavedAt: data.lastSavedAt || null,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to load from IndexedDB:", error);
    return null;
  }
};

/**
 * 从 IndexedDB 加载项目历史记录
 */
const loadHistoryFromStorage = async (): Promise<ProjectHistory[]> => {
  try {
    const history = await loadHistoryFromIndexedDB();
    return history || [];
  } catch (error) {
    console.error("Failed to load history from IndexedDB:", error);
    return [];
  }
};

/**
 * 保存到 IndexedDB
 */
const saveToStorage = async (state: MermaidState): Promise<boolean> => {
  try {
    const dataToSave = {
      currentProjectId: state.currentProjectId,
      mermaidCode: state.mermaidCode,
      nodeDocs: state.nodeDocs,
    };
    
    const success = await saveToIndexedDB(dataToSave);
    return success;
  } catch (error) {
    console.error("Failed to save to IndexedDB:", error);
    return false;
  }
};

/**
 * 保存项目历史记录到 IndexedDB
 */
const saveHistoryToStorage = async (history: ProjectHistory[]): Promise<boolean> => {
  try {
    const success = await saveHistoryToIndexedDB(history);
    return success;
  } catch (error) {
    console.error("Failed to save history to IndexedDB:", error);
    return false;
  }
};

/**
 * 创建 Mermaid Store
 */
export const useMermaidStore = create<MermaidStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        ...initialState,

        // 更新 Mermaid 源码
        updateMermaidCode: (code: string) => {
          set(
            {
              mermaidCode: code,
              hasUnsavedChanges: true,
            },
            false,
            "updateMermaidCode"
          );
        },

        // 选择节点
        selectNode: (nodeId: string | null) => {
          set(
            {
              selectedNodeId: nodeId,
            },
            false,
            "selectNode"
          );
        },

        // 更新节点文档
        updateNodeDoc: (nodeId: string, content: string) => {
          set(
            (state) => ({
              nodeDocs: {
                ...state.nodeDocs,
                [nodeId]: {
                  id: nodeId,
                  content,
                },
              },
              hasUnsavedChanges: true,
            }),
            false,
            "updateNodeDoc"
          );
        },

        // 删除节点文档
        deleteNodeDoc: (nodeId: string) => {
          set(
            (state) => {
              const newDocs = { ...state.nodeDocs };
              delete newDocs[nodeId];

              return {
                nodeDocs: newDocs,
                selectedNodeId:
                  state.selectedNodeId === nodeId ? null : state.selectedNodeId,
                hasUnsavedChanges: true,
              };
            },
            false,
            "deleteNodeDoc"
          );
        },

        // 批量设置节点文档
        setNodeDocs: (docs: Record<string, NodeDoc>) => {
          set(
            {
              nodeDocs: docs,
              hasUnsavedChanges: true,
            },
            false,
            "setNodeDocs"
          );
        },

        // 保存到本地存储
        saveToLocal: async () => {
          const state = get();
          
          try {
            const success = await saveToStorage(state);

            if (success) {
              set(
                {
                  lastSavedAt: Date.now(),
                  hasUnsavedChanges: false,
                },
                false,
                "saveToLocal"
              );
            } else {
              console.error("Failed to save data");
              // Keep hasUnsavedChanges as true if save failed
            }
          } catch (error) {
            console.error("Save to local error:", error);
          }
        },

        // 从本地存储加载
        loadFromLocal: async () => {
          try {
            const loaded = await loadFromStorage();
            const history = await loadHistoryFromStorage();

            if (loaded) {
              set(
                {
                  ...loaded,
                  selectedNodeId: null,
                  hasUnsavedChanges: false,
                  projectHistory: history,
                },
                false,
                "loadFromLocal"
              );
            } else {
              set(
                {
                  projectHistory: history,
                },
                false,
                "loadFromLocal"
              );
            }
          } catch (error) {
            console.error("Load from local error:", error);
          }
        },

        // 重置状态
        reset: () => {
          set(
            {
              ...initialState,
            },
            false,
            "reset"
          );
        },

        // 标记为已保存
        markAsSaved: () => {
          set(
            {
              hasUnsavedChanges: false,
            },
            false,
            "markAsSaved"
          );
        },

        // 导出数据
        exportData: async (projectName?: string) => {
          const state = get();
          
          // 如果有项目名称，先保存当前项目到历史记录
          if (projectName) {
            get().saveCurrentAsHistory(projectName);
          }
          
          // 执行导出
          await exportMermaidDocs(
            state.mermaidCode,
            state.nodeDocs,
            projectName || state.currentProjectId || undefined
          );
        },

        // 导入数据
        importData: async (file: File, projectName?: string) => {
          const state = get();

          // 导入前先保存当前项目（如果有内容的话）
          if (state.currentProjectId && (state.mermaidCode !== DEFAULT_MERMAID_CODE || Object.keys(state.nodeDocs).length > 0)) {
            // 保存当前项目到历史记录
            get().saveCurrentAsHistory();
          }

          // 导入新数据
          const { mermaidCode, nodeDocs } = await importMermaidDocs(file);

          // 生成新的项目 ID（确保不覆盖现有项目）
          const now = Date.now();
          const newProjectId = `project-${now}`;
          const importedProjectName = projectName || file.name.replace(/\.(zip|mermaid-docs\.zip)$/, '');

          // 更新状态
          set(
            {
              currentProjectId: newProjectId,
              mermaidCode,
              nodeDocs,
              selectedNodeId: null,
              hasUnsavedChanges: false,
            },
            false,
            "importData"
          );

          // 立即保存到 localStorage
          get().saveToLocal();

          // 自动创建项目历史记录
          get().saveCurrentAsHistory(importedProjectName);
        },

        // 将当前项目保存为历史记录
        saveCurrentAsHistory: (name?: string) => {
          const state = get();
          
          const projectName = name || `Project ${new Date().toLocaleString()}`;
          const now = Date.now();
          
          const newProject: ProjectHistory = {
            id: state.currentProjectId || `project-${now}`,
            name: projectName,
            mermaidCode: state.mermaidCode,
            nodeDocs: { ...state.nodeDocs },
            createdAt: now,
            updatedAt: now,
          };

          // 如果已存在相同 ID 的项目，更新它
          const existingIndex = state.projectHistory.findIndex(
            (p) => p.id === newProject.id
          );

          let newHistory: ProjectHistory[];
          if (existingIndex >= 0) {
            // 更新现有项目
            newHistory = [...state.projectHistory];
            newHistory[existingIndex] = {
              ...newHistory[existingIndex],
              ...newProject,
              createdAt: newHistory[existingIndex].createdAt, // 保持原创建时间
            };
          } else {
            // 添加新项目
            newHistory = [newProject, ...state.projectHistory];
          }

          set(
            {
              currentProjectId: newProject.id,
              projectHistory: newHistory,
              hasUnsavedChanges: false,
            },
            false,
            "saveCurrentAsHistory"
          );

          // Save asynchronously (don't block UI)
          saveHistoryToStorage(newHistory);
          saveToStorage({ ...state, currentProjectId: newProject.id });
        },

        // 从历史记录加载项目
        loadProjectFromHistory: async (projectId: string) => {
          const state = get();
          const project = state.projectHistory.find((p) => p.id === projectId);

          if (project) {
            set(
              {
                currentProjectId: project.id,
                mermaidCode: project.mermaidCode,
                nodeDocs: { ...project.nodeDocs },
                selectedNodeId: null,
                hasUnsavedChanges: false,
              },
              false,
              "loadProjectFromHistory"
            );

            // Save asynchronously
            await saveToStorage(get());
          }
        },

        // 从历史记录删除项目
        deleteProjectFromHistory: (projectId: string) => {
          const state = get();
          const newHistory = state.projectHistory.filter((p) => p.id !== projectId);

          set(
            {
              projectHistory: newHistory,
            },
            false,
            "deleteProjectFromHistory"
          );

          // Save asynchronously
          saveHistoryToStorage(newHistory);

          // 如果删除的是当前项目
          if (state.currentProjectId === projectId) {
            // 重置为默认状态，让用户选择要打开的项目
            set(
              {
                currentProjectId: null,
                mermaidCode: DEFAULT_MERMAID_CODE,
                nodeDocs: {},
                selectedNodeId: null,
                hasUnsavedChanges: false,
              },
              false,
              "deleteProjectFromHistory"
            );
            // Save asynchronously
            saveToStorage(get());
          }
        },

        // 更新项目名称
        updateProjectName: (projectId: string, newName: string) => {
          const state = get();
          const newHistory = state.projectHistory.map((p) =>
            p.id === projectId ? { ...p, name: newName, updatedAt: Date.now() } : p
          );

          set(
            {
              projectHistory: newHistory,
            },
            false,
            "updateProjectName"
          );

          // Save asynchronously
          saveHistoryToStorage(newHistory);
        },

        // 创建新项目
        createNewProject: (name?: string) => {
          const projectName = name || `New Project ${new Date().toLocaleString()}`;
          const now = Date.now();
          const newProjectId = `project-${now}`;

          set(
            {
              currentProjectId: newProjectId,
              mermaidCode: DEFAULT_MERMAID_CODE,
              nodeDocs: {},
              selectedNodeId: null,
              hasUnsavedChanges: false,
            },
            false,
            "createNewProject"
          );

          // 自动保存为历史记录
          get().saveCurrentAsHistory(projectName);
        },
      }),
      {
        name: "mermaid-store",
      }
    )
  )
);

/**
 * Selectors
 */
export const mermaidSelectors = {
  // 获取选中节点的文档
  getSelectedNodeDoc: (state: MermaidStore): NodeDoc | null => {
    if (!state.selectedNodeId) return null;
    return state.nodeDocs[state.selectedNodeId] || null;
  },

  // 获取节点文档数量
  getDocCount: (state: MermaidStore): number => {
    return Object.keys(state.nodeDocs).length;
  },

  // 检查节点是否有文档
  hasNodeDoc: (state: MermaidStore, nodeId: string): boolean => {
    return !!state.nodeDocs[nodeId];
  },

  // 获取所有节点 ID
  getAllNodeIds: (state: MermaidStore): string[] => {
    return Object.keys(state.nodeDocs);
  },
};

