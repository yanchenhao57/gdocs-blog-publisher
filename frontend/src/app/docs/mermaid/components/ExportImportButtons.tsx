"use client";

import { useState, useRef } from "react";
import { useMermaidStore } from "@/stores/mermaidStore";
import { toast } from "sonner";
import { Download, Upload, FileText, Image, AlertTriangle, X as XCircle } from "lucide-react";
import styles from "./export-import.module.css";

/**
 * Export/Import Buttons Component
 */
interface ExportImportButtonsProps {
  showImport?: boolean;
}

export const ExportImportButtons = ({ showImport = true }: ExportImportButtonsProps) => {
  const { exportData, importData, mermaidCode, nodeDocs, currentProjectId, projectHistory } = useMermaidStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [exportProjectName, setExportProjectName] = useState("");
  const [importProjectName, setImportProjectName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle export
  const handleExport = () => {
    // Check if there's data to export
    if (!mermaidCode || mermaidCode === "") {
      toast.warning("No data to export");
      return;
    }

    // Pre-fill with current project name if available
    if (currentProjectId) {
      const currentProject = projectHistory.find(p => p.id === currentProjectId);
      if (currentProject) {
        setExportProjectName(currentProject.name);
      }
    }

    setShowExportDialog(true);
  };

  const confirmExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await exportData(exportProjectName || undefined);
      setShowExportDialog(false);
      setExportProjectName("");
      toast.success("Export successful! Project saved to history.");
    } catch (err) {
      console.error("Export failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Export failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 从文件名提取默认项目名称
      const defaultName = file.name.replace(/\.(zip|mermaid-docs\.zip)$/, '');
      setImportProjectName(defaultName);
      setShowImportConfirm(true);
    }
  };

  // Confirm import
  const confirmImport = async () => {
    if (!selectedFile) return;

    if (!importProjectName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      await importData(selectedFile, importProjectName);
      setShowImportConfirm(false);
      setSelectedFile(null);
      setImportProjectName("");
      toast.success(`Import successful! Project "${importProjectName}" added to history.`);
    } catch (err) {
      console.error("Import failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Import failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Cancel import
  const cancelImport = () => {
    setShowImportConfirm(false);
    setSelectedFile(null);
    setImportProjectName("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const nodeCount = Object.keys(nodeDocs).length;
  const imageCount = Object.values(nodeDocs).reduce((count, doc) => {
    const matches = doc.content.match(/<img/g);
    return count + (matches ? matches.length : 0);
  }, 0);

  return (
    <>
      <div className={styles.buttonGroup}>
        {showImport && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.mermaid-docs.zip"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={styles.importButton}
              disabled={isImporting}
              title="Import Mermaid Documentation"
            >
              <Download size={16} />
              {isImporting ? "Importing..." : "Import"}
            </button>
          </>
        )}

        <button
          onClick={handleExport}
          className={styles.exportButton}
          disabled={isExporting}
          title="Export Mermaid Documentation"
        >
          <Upload size={16} />
          {isExporting ? "Exporting..." : "Export"}
        </button>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className={styles.modalOverlay} onClick={() => setShowExportDialog(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>
              <Upload size={20} />
              Export Mermaid Documentation
            </h3>

            <div className={styles.modalContent}>
              <div className={styles.info}>
                <p>
                  <strong>Data Summary:</strong>
                </p>
                <ul>
                  <li><FileText size={14} />{nodeCount} node documents</li>
                  <li><Image size={14} />{imageCount} images</li>
                </ul>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="exportProjectName">Project Name (Optional):</label>
                <input
                  id="exportProjectName"
                  type="text"
                  value={exportProjectName}
                  onChange={(e) => setExportProjectName(e.target.value)}
                  placeholder="e.g., My Flowchart Project"
                  className={styles.input}
                  autoFocus
                />
                <p className={styles.hint}>
                  Leave empty to use timestamp as filename
                </p>
              </div>

              {error && <div className={styles.error}>❌ {error}</div>}
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowExportDialog(false)}
                className={styles.cancelButton}
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={confirmExport}
                className={styles.confirmButton}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Confirm Export"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Confirmation Dialog */}
      {showImportConfirm && selectedFile && (
        <div className={styles.modalOverlay} onClick={cancelImport}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>
              <Download size={20} />
              Import Mermaid Documentation
            </h3>

            <div className={styles.modalContent}>
              <div className={styles.warning}>
                <p>
                  <AlertTriangle size={16} />
                  <strong>Important Notice:</strong>
                </p>
                <ul>
                  <li>Importing will <strong>overwrite</strong> all current data</li>
                  <li>Current data has been automatically backed up in the browser</li>
                  <li>Please confirm you want to import the following file:</li>
                </ul>
              </div>

              <div className={styles.fileInfo}>
                <p>
                  <strong>File Name:</strong> {selectedFile.name}
                </p>
                <p>
                  <strong>Size:</strong>{" "}
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="importProjectName">
                  Project Name (will be added to history):
                </label>
                <input
                  id="importProjectName"
                  type="text"
                  value={importProjectName}
                  onChange={(e) => setImportProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className={styles.input}
                  autoFocus
                />
                <p className={styles.hint}>
                  This name will be used to identify the project in your history.
                </p>
              </div>

              {error && (
                <div className={styles.error}>
                  <XCircle size={16} />
                  {error}
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={cancelImport}
                className={styles.cancelButton}
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className={styles.confirmButton}
                disabled={isImporting}
              >
                {isImporting ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

