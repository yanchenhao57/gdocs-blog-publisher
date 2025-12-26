"use client";

import { useState, useRef, useEffect } from "react";
import { useMermaidStore, ProjectHistory as ProjectHistoryType } from "@/stores/mermaidStore";
import { History, Plus, Trash2, Edit2, Check, X, Download } from "lucide-react";
import { toast } from "sonner";
import styles from "./project-history.module.css";

/**
 * Project History Component
 * Manages multiple Mermaid project history records
 */
export const ProjectHistory = () => {
  const {
    currentProjectId,
    projectHistory,
    loadProjectFromHistory,
    deleteProjectFromHistory,
    updateProjectName,
    createNewProject,
    importData,
  } = useMermaidStore();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProjectName, setImportProjectName] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleImportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const defaultName = file.name.replace(/\.(zip|mermaid-docs\.zip)$/, '');
      setImportProjectName(defaultName);
      setShowImportDialog(true);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile || !importProjectName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    setIsImporting(true);
    try {
      await importData(selectedFile, importProjectName);
      setShowImportDialog(false);
      setSelectedFile(null);
      setImportProjectName("");
      setIsOpen(false);
      toast.success(`Project "${importProjectName}" imported successfully!`);
    } catch (err) {
      console.error("Import failed:", err);
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancelImport = () => {
    setShowImportDialog(false);
    setSelectedFile(null);
    setImportProjectName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadProject = (project: ProjectHistoryType) => {
    loadProjectFromHistory(project.id);
    setIsOpen(false);
    toast.success(`Loaded project: ${project.name}`);
  };

  const handleDeleteProject = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id: projectId, name: projectName });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      const isCurrentProject = currentProjectId === deleteConfirm.id;
      const remainingCount = projectHistory.length - 1;
      
      deleteProjectFromHistory(deleteConfirm.id);
      
      if (isCurrentProject) {
        toast.success(`Project "${deleteConfirm.name}" deleted. Please select a project to open.`);
        // 删除当前项目后，保持下拉菜单打开，让用户选择
        // 不关闭 setIsOpen
      } else {
        toast.success(`Project "${deleteConfirm.name}" deleted`);
      }
      
      setDeleteConfirm(null);
      
      // 如果删除后没有项目了，关闭下拉菜单
      if (remainingCount === 0) {
        setIsOpen(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleStartEditing = (project: ProjectHistoryType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleSaveEdit = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!editingName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    updateProjectName(projectId, editingName);
    setEditingId(null);
    toast.success("Project name updated");
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName("");
  };

  const handleCreateNew = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 生成默认名称
    const defaultName = `mermaid-docs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    setNewProjectName(defaultName);
    setShowCreateDialog(true);
    setIsOpen(false); // 关闭下拉菜单
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

  const currentProject = projectHistory.find((p) => p.id === currentProjectId);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.triggerButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Project History"
      >
        <History size={20} />
        <span>Projects</span>
        {currentProject && (
          <span className={styles.currentProjectName}>
            {currentProject.name}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Project History</h3>
            <p className={styles.subtitle}>Manage your projects ({projectHistory.length})</p>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={handleCreateNew}
              title="Create new project"
            >
              <Plus size={16} />
              New Project
            </button>
            <span className={styles.orDivider}>or</span>
            <button
              className={styles.actionButton}
              onClick={handleImportClick}
              title="Import project from file"
            >
              <Download size={16} />
              Import Project
            </button>
          </div>

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.mermaid-docs.zip"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {showImportDialog && selectedFile && (
            <div className={styles.importDialog}>
              <h4>Import Project</h4>
              <p className={styles.fileName}>File: {selectedFile.name}</p>
              <input
                type="text"
                value={importProjectName}
                onChange={(e) => setImportProjectName(e.target.value)}
                placeholder="Enter project name..."
                className={styles.input}
                autoFocus
              />
              <div className={styles.dialogActions}>
                <button
                  className={styles.confirmButton}
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                >
                  <Check size={16} />
                  {isImporting ? "Importing..." : "Import"}
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelImport}
                  disabled={isImporting}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className={styles.projectList}>
            {projectHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <History size={48} />
                <p>No projects yet</p>
                <p className={styles.emptyHint}>
                  Create or save a project to get started
                </p>
              </div>
            ) : (
              projectHistory.map((project) => (
                <div
                  key={project.id}
                  className={`${styles.projectItem} ${
                    currentProjectId === project.id ? styles.active : ""
                  }`}
                  onClick={() => handleLoadProject(project)}
                >
                  {editingId === project.id ? (
                    <div className={styles.editMode} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className={styles.input}
                        autoFocus
                      />
                      <div className={styles.editActions}>
                        <button
                          className={styles.iconButton}
                          onClick={(e) => handleSaveEdit(project.id, e)}
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className={styles.iconButton}
                          onClick={handleCancelEdit}
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.projectInfo}>
                        <div className={styles.projectName}>{project.name}</div>
                        <div className={styles.projectMeta}>
                          <span>
                            Updated: {new Date(project.updatedAt).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>
                            {Object.keys(project.nodeDocs).length} docs
                          </span>
                        </div>
                      </div>
                      <div className={styles.projectActions}>
                        <button
                          className={styles.iconButton}
                          onClick={(e) => handleStartEditing(project, e)}
                          title="Rename"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className={`${styles.iconButton} ${styles.deleteButton}`}
                          onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className={styles.dropdownFooter}>
            <span>
              {projectHistory.length} {projectHistory.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
        </div>
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
                    if (e.key === 'Enter') {
                      handleConfirmCreate();
                    } else if (e.key === 'Escape') {
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

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={handleCancelDelete}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Project</h3>
            <div className={styles.modalContent}>
              <p>Are you sure you want to delete project:</p>
              <p className={styles.projectNameHighlight}>"{deleteConfirm.name}"</p>
              <p className={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={handleCancelDelete}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

