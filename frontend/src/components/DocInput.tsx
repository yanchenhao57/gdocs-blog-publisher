"use client";

import { useState } from "react";
import {
  FileText,
  Link,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Rocket,
  Copy,
  Check,
} from "lucide-react";

interface DocInputProps {
  onConvert: (docId: string) => void;
}

const DocInput: React.FC<DocInputProps> = ({ onConvert }) => {
  const [docLink, setDocLink] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 从链接中提取 Google Docs ID
  const extractDocId = (link: string): string | null => {
    if (!link) return null;

    // 尝试匹配不同格式的Google Docs链接
    const patterns = [
      /\/document\/d\/([a-zA-Z0-9-_]+)/, // 标准格式
      /\/document\/u\/\d+\/d\/([a-zA-Z0-9-_]+)/, // 带用户ID的格式
      /^([a-zA-Z0-9-_]+)$/, // 直接输入ID的格式
    ];

    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  // 验证输入
  const validateInput = (value: string) => {
    if (!value.trim()) {
      setError("");
      setIsValid(false);
      return false;
    }

    // 检查是否是有效的URL格式
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(value) && !/^[a-zA-Z0-9-_]+$/.test(value)) {
      setError("Please enter a valid Google Docs URL or document ID");
      setIsValid(false);
      return false;
    }

    // 检查是否是Google Docs链接
    if (value.includes("docs.google.com")) {
      if (!value.includes("/document/")) {
        setError("Please enter a valid Google Docs document link");
        setIsValid(false);
        return false;
      }
    }

    // 尝试提取文档ID
    const docId = extractDocId(value);
    if (!docId) {
      setError("Could not extract document ID from the provided link");
      setIsValid(false);
      return false;
    }

    // 验证文档ID格式
    if (docId.length < 10 || docId.length > 50) {
      setError("Document ID appears to be invalid");
      setIsValid(false);
      return false;
    }

    setError("");
    setIsValid(true);
    return true;
  };

  // 处理转换按钮点击
  const handleConvert = async () => {
    if (!isValid) {
      setError("Please enter a valid Google Docs document link");
      return;
    }

    const docId = extractDocId(docLink);
    if (docId) {
      setDocId(docId);
      setIsLoading(true);
      await onConvert(docId);
      setIsLoading(false);
    }
  };

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDocLink(value);

    // 清除之前的错误
    setError("");

    // 如果是直接粘贴的ID，转换为完整链接格式
    const docId = extractDocId(value);
    if (docId && value === docId) {
      const fullLink = `https://docs.google.com/document/d/${docId}`;
      setDocLink(fullLink);
      validateInput(fullLink);
    } else {
      validateInput(value);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid && !isLoading) {
      handleConvert();
    }
  };

  // 复制邮箱地址
  const handleCopyEmail = async () => {
    const email = "yanchenhao057@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); // 3秒后重置状态
    } catch (err) {
      console.error("Failed to copy email:", err);
      // 如果复制失败，也显示成功状态，因为用户已经点击了
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="w-full max-w-2xl"
      style={{
        width: "100%",
        maxWidth: "42rem",
      }}
    >
      <h1
        className="text-4xl font-bold text-center mb-8"
        style={{
          fontSize: "2.25rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "2rem",
          color: "#000000",
        }}
      >
        📄 Google Docs Converter
      </h1>

      <div className="space-y-6" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="doc-link"
              className="block text-sm font-medium mb-2"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
                color: "#000000",
              }}
            >
              <Link size={16} />
              <span>Enter Google Docs Document Link</span>
            </label>

            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "400",
                color: "#666666",
                marginBottom: "0.5rem",
                padding: "0.75rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "0.5rem",
                border: "1px solid #e9ecef",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "500", color: "#495057" }}>
                  📧 Before converting, please share your Google Docs document
                  with:
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    backgroundColor: "#ffffff",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.375rem",
                    border: copied ? "1px solid #10b981" : "1px solid #dee2e6",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    transition: "all 0.3s ease",
                    boxShadow: copied
                      ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                      : "none",
                  }}
                >
                  <strong style={{ color: copied ? "#10b981" : "#495057" }}>
                    yanchenhao057@gmail.com
                  </strong>
                  <button
                    onClick={handleCopyEmail}
                    style={{
                      background: copied ? "#10b981" : "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.25rem",
                      borderRadius: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      minWidth: "20px",
                      minHeight: "20px",
                    }}
                    onMouseEnter={(e) => {
                      if (!copied) {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copied) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                    title={
                      copied
                        ? "Email copied to clipboard!"
                        : "Click to copy email address"
                    }
                  >
                    {copied ? (
                      <Check
                        size={14}
                        style={{
                          color: "#ffffff",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ) : (
                      <Copy
                        size={14}
                        style={{
                          color: "#666666",
                          transition: "all 0.3s ease",
                        }}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <input
            id="doc-link"
            type="text"
            value={docLink}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g., https://docs.google.com/document/d/1HBWkPDoWzQdQ7wU7hooLGgoVK5SEYWl5xvX_3s_2RzM/edit"
            className={`input-field ${error ? "error-border" : ""} ${
              isValid ? "valid-border" : ""
            }`}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "1rem 1.25rem",
              border: error
                ? "2px solid #ff0000"
                : isValid
                ? "2px solid #10b981"
                : "2px solid #e5e5e5",
              borderRadius: "0.75rem",
              backgroundColor: "#ffffff",
              color: "#000000",
              fontSize: "1rem",
              transition: "all 0.2s",
            }}
          />

          {/* 错误提示 */}
          {error && (
            <div
              className="error-message"
              style={{
                color: "#ff0000",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {isValid && !error && (
            <div
              className="success-message"
              style={{
                color: "#10b981",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle size={16} />
              Valid Google Docs link detected
            </div>
          )}
        </div>

        <button
          onClick={handleConvert}
          disabled={!isValid || isLoading}
          className="btn-primary w-full"
          style={{
            width: "100%",
            padding: "1rem 1.5rem",
            backgroundColor: isValid ? "#000000" : "#cccccc",
            color: "#ffffff",
            border: "none",
            borderRadius: "0.75rem",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: isValid && !isLoading ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Rocket size={20} />
              Convert Document
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocInput;
