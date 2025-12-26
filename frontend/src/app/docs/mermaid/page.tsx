"use client";

import { useEffect, useState } from "react";
import { useMermaidStore } from "@/stores/mermaidStore";
import { useStorageInfo } from "@/hooks/useStorageMigration";
import { MermaidEditor } from "./components/MermaidEditor";
import { MermaidRenderer } from "./components/MermaidRenderer";
import { NodeDocEditor } from "./components/NodeDocEditor";
import { ExportImportButtons } from "./components/ExportImportButtons";
import { ProjectHistory } from "./components/ProjectHistory";
import { StorageInfo } from "@/components/storage-info/StorageInfo";
import { Network, Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import styles from "./page.module.css";

/**
 * Mermaid 流程图文档工具页面
 */
export default function MermaidDocsPage() {
  const {
    loadFromLocal,
    saveToLocal,
    hasUnsavedChanges,
    currentProjectId,
    mermaidCode,
    projectHistory,
    loadProjectFromHistory,
    createNewProject,
    importData,
  } = useMermaidStore();

  // 管理面板折叠状态
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // 创建项目对话框
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // 管理面板宽度（百分比）
  const [leftWidth, setLeftWidth] = useState(25); // 默认 25%
  const [rightWidth, setRightWidth] = useState(25); // 默认 25%

  // 拖动状态
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 获取存储信息
  const { storageInfo } = useStorageInfo();
  console.log("🚀 ~ MermaidDocsPage ~ storageInfo:", storageInfo);

  // Ensure client-side only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 页面加载时从本地存储恢复数据
  useEffect(() => {
    if (isMounted) {
      loadFromLocal();
    }
  }, [isMounted, loadFromLocal]);

  // 自动保存（防抖）
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      saveToLocal();
    }, 2000); // 2秒后自动保存

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveToLocal]);

  // 页面卸载前保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        saveToLocal();
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, saveToLocal]);

  // 拖动处理函数
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft && !leftCollapsed) {
        const containerWidth = window.innerWidth;
        const newLeftWidth = (e.clientX / containerWidth) * 100;

        // 限制最小和最大宽度
        if (newLeftWidth >= 10 && newLeftWidth <= 50) {
          setLeftWidth(newLeftWidth);
        }
      }

      if (isDraggingRight && !rightCollapsed) {
        const containerWidth = window.innerWidth;
        const newRightWidth =
          ((containerWidth - e.clientX) / containerWidth) * 100;

        // 限制最小和最大宽度
        if (newRightWidth >= 10 && newRightWidth <= 50) {
          setRightWidth(newRightWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isDraggingLeft || isDraggingRight) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingLeft, isDraggingRight, leftCollapsed, rightCollapsed]);

  // 创建新项目处理
  const handleCreateNewProject = () => {
    if (projectHistory.length >= 10) {
      toast.error(
        "Maximum 10 projects reached! Please delete some projects before creating a new one."
      );
      return;
    }
    const defaultName = `mermaid-docs-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}`;
    setNewProjectName(defaultName);
    setShowCreateDialog(true);
  };

  const handleConfirmCreate = () => {
    if (!newProjectName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }
    createNewProject(newProjectName);
    setShowCreateDialog(false);
    setNewProjectName("");
    toast.success("New project created");
  };

  const handleCancelCreate = () => {
    setShowCreateDialog(false);
    setNewProjectName("");
  };

  // 检查是否有项目和当前项目
  const hasProjects = projectHistory.length > 0;
  const hasCurrentProject = currentProjectId !== null;

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Network size={28} />
            Mermaid Diagram Documentation Tool
          </h1>
          <p className={styles.subtitle}>
            Create flowcharts and document each node
          </p>
        </div>

        <div className={styles.headerRight}>
          <ProjectHistory />
          {hasCurrentProject && <ExportImportButtons showImport={false} />}
        </div>
      </header>

      {/* 三栏布局 或 项目选择 */}
      {hasCurrentProject ? (
        <main className={styles.mainContent}>
          {/* 左侧：Mermaid 源码编辑器 */}
          <div
            className={`${styles.leftPanel} ${
              leftCollapsed ? styles.collapsed : ""
            }`}
            style={{ width: leftCollapsed ? "48px" : `${leftWidth}%` }}
          >
            <MermaidEditor
              isCollapsed={leftCollapsed}
              onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
            />
          </div>

          {/* 左侧分隔条 */}
          {!leftCollapsed && (
            <div
              className={styles.resizer}
              onMouseDown={() => setIsDraggingLeft(true)}
            />
          )}

          {/* 中间：Mermaid 渲染区域 */}
          <div className={styles.centerPanel}>
            <MermaidRenderer />
          </div>

          {/* 右侧分隔条 */}
          {!rightCollapsed && (
            <div
              className={styles.resizer}
              onMouseDown={() => setIsDraggingRight(true)}
            />
          )}

          {/* 右侧：节点文档编辑器 */}
          <div
            className={`${styles.rightPanel} ${
              rightCollapsed ? styles.collapsed : ""
            }`}
            style={{ width: rightCollapsed ? "48px" : `${rightWidth}%` }}
          >
            <NodeDocEditor
              isCollapsed={rightCollapsed}
              onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
            />
          </div>
        </main>
      ) : (
        <main className={styles.projectSelectionContainer}>
          <div className={styles.projectSelection}>
            <div className={styles.projectSelectionHeader}>
              <div className={styles.projectSelectionIcon}>
                <Network size={48} strokeWidth={1.5} />
              </div>
              <h2 className={styles.projectSelectionTitle}>
                {projectHistory.length === 0
                  ? "No Projects Yet"
                  : `Select a Project (${projectHistory.length})`}
              </h2>
              <p className={styles.projectSelectionDescription}>
                {projectHistory.length === 0
                  ? "Create a new project or import an existing one to get started."
                  : "Choose a project to open or create a new one."}
              </p>
            </div>

            {projectHistory.length > 0 && (
              <div className={styles.projectList}>
                {projectHistory.map((project) => (
                  <button
                    key={project.id}
                    className={styles.projectCard}
                    onClick={() => {
                      loadProjectFromHistory(project.id);
                    }}
                  >
                    <div className={styles.projectCardHeader}>
                      <Network size={20} />
                      <span className={styles.projectCardName}>
                        {project.name}
                      </span>
                    </div>
                    <div className={styles.projectCardMeta}>
                      <span>
                        Updated: {new Date(project.updatedAt).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>{Object.keys(project.nodeDocs).length} docs</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className={styles.projectSelectionActions}>
              <div className={styles.projectSelectionButtons}>
                <button
                  className={styles.projectSelectionButton}
                  onClick={handleCreateNewProject}
                >
                  <Plus size={18} />
                  New Project
                </button>
                <button
                  className={styles.projectSelectionButton}
                  onClick={() => {
                    // Directly trigger file input for import
                    const fileInput = document.createElement("input");
                    fileInput.type = "file";
                    fileInput.accept = ".zip,.mermaid-docs.zip";
                    fileInput.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          await importData(file);
                        } catch (error) {
                          console.error("Import failed:", error);
                        }
                      }
                    };
                    fileInput.click();
                  }}
                >
                  <Upload size={18} />
                  Import Project
                </button>
              </div>

              {/* Storage Information */}
              {storageInfo && storageInfo.quota > 0 && (
                <div className={styles.storageInfoWrapper}>
                  <StorageInfo
                    usage={storageInfo.usage}
                    quota={storageInfo.quota}
                    available={storageInfo.available}
                    usagePercent={storageInfo.usagePercent}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* 创建新项目对话框 */}
      {showCreateDialog && (
        <div className={styles.modalOverlay} onClick={handleCancelCreate}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Create New Project</h3>
            <div className={styles.modalContent}>
              <label className={styles.inputLabel}>
                Project Name
                <input
                  type="text"
                  className={styles.input}
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmCreate();
                    } else if (e.key === "Escape") {
                      handleCancelCreate();
                    }
                  }}
                />
              </label>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={handleCancelCreate}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmCreate}
              >
                <Plus size={16} />
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
