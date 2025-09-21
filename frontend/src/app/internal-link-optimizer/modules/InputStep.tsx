import React, { useState } from "react";
import { Plus, Trash2, X, FileText } from "lucide-react";
import { LinkRow } from "./types";

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

  const handleBulkPasteClick = () => {
    if (bulkText.trim()) {
      handleBulkPaste(bulkText);
      setBulkText("");
      setShowBulkPaste(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-12">
        <div>
          <h2
            className="text-lg font-medium text-gray-900 mb-6"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Internal Link Configuration
          </h2>
          <p
            className="text-sm text-gray-500 mb-8"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Enter your blog URL and configure the internal links you want to
            optimize
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <label
              htmlFor="blogUrl"
              className="block text-sm font-medium text-gray-600 mb-3"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Blog URL
            </label>
            <input
              id="blogUrl"
              type="url"
              placeholder="https://yourblog.com/post-title"
              value={blogUrl}
              onChange={(e) => setBlogUrl(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <div className="mb-6">
              <label
                className="text-sm font-medium text-gray-600"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Internal Links Configuration
              </label>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="bg-white px-6 py-4 border-b border-gray-200 grid grid-cols-12 gap-6 text-sm font-medium text-gray-600"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                <div className="col-span-5">Target URL</div>
                <div className="col-span-6">Anchor Texts</div>
                <div className="col-span-1">Actions</div>
              </div>
              {linkRows.map((row) => (
                <div
                  key={row.id}
                  className="px-6 py-6 border-b border-gray-200 last:border-b-0 grid grid-cols-12 gap-6 items-start bg-white"
                >
                  <div className="col-span-5">
                    <input
                      placeholder="/target-page"
                      value={row.targetUrl}
                      onChange={(e) =>
                        updateLinkRow(row.id, "targetUrl", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors text-sm"
                      style={{
                        fontFamily:
                          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    />
                  </div>
                  <div className="col-span-6 space-y-3">
                    {row.anchorTexts.map((anchorText, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          placeholder="Anchor text"
                          value={anchorText}
                          onChange={(e) =>
                            updateAnchorText(row.id, index, e.target.value)
                          }
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors text-sm"
                          style={{
                            fontFamily:
                              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          }}
                        />
                        {row.anchorTexts.length > 1 && (
                          <button
                            onClick={() => removeAnchorText(row.id, index)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addAnchorText(row.id)}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      style={{
                        fontFamily:
                          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Anchor Text
                    </button>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeLinkRow(row.id)}
                      disabled={linkRows.length === 1}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={addLinkRow}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
                    style={{
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
                  </button>
                  <button
                    onClick={() => setShowBulkPaste(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
                    style={{
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Bulk Paste
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={onAnalyze}
            disabled={!blogUrl.trim()}
            className="w-full px-6 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Confirm & Analyze
          </button>
        </div>
      </div>

      {/* Bulk Paste Modal */}
      {showBulkPaste && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-medium text-gray-900"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Bulk Paste Links
              </h3>
              <button
                onClick={() => setShowBulkPaste(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <p
                className="text-sm text-gray-600 mb-2"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Paste text in the format: URL | anchor text | anchor text | ...
              </p>
              <p
                className="text-xs text-gray-500 mb-4"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Each line should start with a URL followed by anchor texts
                separated by |
              </p>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="https://www.example.com/page1 | anchor text 1 | anchor text 2&#10;https://www.example.com/page2 | anchor text 3 | anchor text 4"
                className="w-full h-40 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors text-sm resize-none"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkPaste(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPasteClick}
                disabled={!bulkText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Parse & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
