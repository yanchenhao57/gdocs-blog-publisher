import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, FileText, Clock } from "lucide-react";
import { LinkRow } from "./types";
import { useInputHistory } from "../../../hooks/useInputHistory";
import { useInternalLinkOptimizerStore } from "../../../stores/internalLinkOptimizerStore";
import AnalysisProgressModal from "../../../components/analysis-progress-modal";
import styles from "./InputStep.module.css";

interface InputStepProps {
  blogUrl: string;
  setBlogUrl: (url: string) => void;
  linkRows: LinkRow[];
  setLinkRows: (rows: LinkRow[]) => void;
  onAnalyze: () => void;
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
  handleBulkPaste: (text: string) => void;
}

export default function InputStep({
  blogUrl,
  setBlogUrl,
  linkRows,
  setLinkRows,
  onAnalyze,
  addLinkRow,
  removeLinkRow,
  updateLinkRow,
  addAnchorText,
  updateAnchorText,
  removeAnchorText,
  handleBulkPaste,
}: InputStepProps) {
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null
  );
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const { history, saveToHistory, removeFromHistory } = useInputHistory();

  // 从store获取分析状态
  const {
    currentStep,
    isFetchStoryblokLoading,
    isAnalyzing,
    error,
    storyData,
    optimizationChanges,
  } = useInternalLinkOptimizerStore();

  // 当表单数据变化时，清除选中状态（表示用户已经修改了数据）
  useEffect(() => {
    if (selectedHistoryId) {
      const selectedItem = history.find(
        (item) => item.id === selectedHistoryId
      );
      if (selectedItem) {
        // 比较当前的 linkRows 和选中项的 linkRows 是否一致
        const isEqual =
          JSON.stringify(linkRows) === JSON.stringify(selectedItem.linkRows);
        if (!isEqual) {
          setSelectedHistoryId(null);
        }
      }
    }
  }, [linkRows, selectedHistoryId, history]);

  // 监听分析状态变化，控制弹窗显示
  useEffect(() => {
    if (currentStep === "suggestions" && optimizationChanges.length > 0) {
      // 分析完成，关闭弹窗
      setShowAnalysisModal(false);
    }
  }, [currentStep, optimizationChanges]);

  const handleBulkPasteClick = () => {
    if (bulkText.trim()) {
      handleBulkPaste(bulkText);
      setBulkText("");
      setShowBulkPaste(false);
    }
  };

  // 从历史记录选择配置
  const handleSelectHistory = (historyItem: any) => {
    setLinkRows(historyItem.linkRows);
    setSelectedHistoryId(historyItem.id);
  };

  // 保存当前链接配置到历史记录
  const handleSaveToHistory = () => {
    saveToHistory(linkRows);
  };

  // 增强的分析函数，在分析前保存到历史并显示弹窗
  const handleAnalyze = () => {
    handleSaveToHistory();
    setShowAnalysisModal(true);
    onAnalyze();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Internal Link Configuration
          </h2>
          <p className={styles.subtitle}>
            Enter your blog URL and configure the internal links you want to
            optimize
          </p>
        </div>

        <div className={styles.formSection}>
          <div className={styles.urlSection}>
            <label
              htmlFor="blogUrl"
              className={styles.urlLabel}
            >
              Blog URL
            </label>
            <input
              id="blogUrl"
              type="url"
              placeholder="https://yourblog.com/post-title"
              value={blogUrl}
              onChange={(e) => setBlogUrl(e.target.value)}
              className={styles.urlInput}
            />
          </div>

          <div className={styles.linksSection}>
            <div className={styles.linksHeader}>
              <label className={styles.linksLabel}>
                Internal Links Configuration
              </label>
            </div>

            {/* 历史记录横向展示 - 优先显示用户历史记录，没有时显示预设模板 */}
            {(() => {
              const userHistory = history.filter(
                (item) => !item.id.startsWith("preset-")
              );
              const displayHistory =
                userHistory.length > 0 ? userHistory : history;
              const isShowingPresets =
                userHistory.length === 0 && history.length > 0;

              return (
                displayHistory.length > 0 && (
                  <div className={styles.historySection}>
                    <div className={styles.historyHeader}>
                      <Clock size={16} className="text-gray-600" />
                      <label className={styles.historyHeaderText}>
                        {isShowingPresets
                          ? "Quick start templates"
                          : "Recent configurations"}
                      </label>
                    </div>
                    <div className={styles.historyList}>
                      {displayHistory.slice(0, 3).map((item) => {
                        const isSelected = selectedHistoryId === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`${styles.historyItem} ${
                              isSelected
                                ? styles.historyItemSelected
                                : styles.historyItemDefault
                            }`}
                          >
                            <button
                              onClick={() => handleSelectHistory(item)}
                              className={styles.historyButton}
                            >
                              <div className={styles.historyContent}>
                                <div className={styles.historyTitle}>
                                  {item.title}
                                </div>
                                <div className={styles.historySubtitle}>
                                  {
                                    item.linkRows.filter((row) =>
                                      row.targetUrl.trim()
                                    ).length
                                  }{" "}
                                  link
                                  {item.linkRows.filter((row) =>
                                    row.targetUrl.trim()
                                  ).length !== 1
                                    ? "s"
                                    : ""}
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeFromHistory(item.id);
                              }}
                              className={styles.historyDeleteButton}
                              aria-label="Delete configuration"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              );
            })()}

            <div className={styles.linksTable}>
              <div className={styles.tableHeader}>
                <div>Target URL</div>
                <div>Anchor Texts</div>
                <div>Actions</div>
              </div>
              {linkRows.map((row) => (
                <div
                  key={row.id}
                  className={styles.tableRow}
                >
                  <div className={styles.urlColumn}>
                    <input
                      placeholder="/target-page"
                      value={row.targetUrl}
                      onChange={(e) =>
                        updateLinkRow(row.id, "targetUrl", e.target.value)
                      }
                      className={styles.urlColumnInput}
                    />
                  </div>
                  <div className={styles.anchorTextsColumn}>
                    {row.anchorTexts.map((anchorText, index) => (
                      <div key={index} className={styles.anchorTextRow}>
                        <input
                          placeholder="Anchor text"
                          value={anchorText}
                          onChange={(e) =>
                            updateAnchorText(row.id, index, e.target.value)
                          }
                          className={styles.anchorTextInput}
                        />
                        {row.anchorTexts.length > 1 && (
                          <button
                            onClick={() => removeAnchorText(row.id, index)}
                            className={styles.removeAnchorButton}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addAnchorText(row.id)}
                      className={styles.addAnchorButton}
                    >
                      <Plus className={styles.addAnchorButtonIcon} />
                      Add Anchor Text
                    </button>
                  </div>
                  <div className={styles.actionsColumn}>
                    <button
                      onClick={() => removeLinkRow(row.id)}
                      disabled={linkRows.length === 1}
                      className={styles.removeRowButton}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className={styles.tableFooter}>
                <div className={styles.tableFooterActions}>
                  <button
                    onClick={addLinkRow}
                    className={styles.addRowButton}
                  >
                    <Plus className={styles.addRowButtonIcon} />
                    Add Row
                  </button>
                  <button
                    onClick={() => setShowBulkPaste(true)}
                    className={styles.bulkPasteButton}
                  >
                    <FileText className={styles.bulkPasteButtonIcon} />
                    Bulk Paste
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.analyzeSection}>
          <button
            onClick={handleAnalyze}
            disabled={!blogUrl.trim()}
            className={styles.analyzeButton}
          >
            Confirm & Analyze
          </button>
        </div>
      </div>

      {/* Bulk Paste Modal */}
      {showBulkPaste && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Bulk Paste Links
              </h3>
              <button
                onClick={() => setShowBulkPaste(false)}
                className={styles.modalCloseButton}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                Paste text in the format: URL | anchor text | anchor text | ...
              </p>
              <p className={styles.modalSubDescription}>
                Each line should start with a URL followed by anchor texts
                separated by |
              </p>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="https://www.example.com/page1 | anchor text 1 | anchor text 2&#10;https://www.example.com/page2 | anchor text 3 | anchor text 4"
                className={styles.modalTextarea}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowBulkPaste(false)}
                className={styles.modalCancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPasteClick}
                disabled={!bulkText.trim()}
                className={styles.modalConfirmButton}
              >
                Parse & Add
              </button>
            </div>
          </div>
        </div>
      )}

      <AnalysisProgressModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      />
    </div>
  );
}
