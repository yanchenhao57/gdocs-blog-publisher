"use client";

import React, { useState, useEffect } from "react";
import PrePublishCheck from "./index";

export default function PrePublishCheckExample() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [slug, setSlug] = useState("optimizing-business-decisions-analytics");
  const [language, setLanguage] = useState<"en" | "ja">("en");
  const [checkResult, setCheckResult] = useState<{
    exists: boolean;
    fullSlug: string;
  } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleCheckResult = (exists: boolean, fullSlug: string) => {
    setCheckResult({ exists, fullSlug });
  };

  const sampleSlugs = [
    "optimizing-business-decisions-analytics",
    "future-of-ai-web-development", 
    "react-component-design-systems",
    "modern-devops-practices-2024",
    "existing-article-slug", // 这个可能已存在
  ];

  return (
    <div
      style={{
        padding: "2rem",
        background: theme === "dark" ? "#111827" : "#f8fafc",
        minHeight: "100vh",
        transition: "background-color 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: theme === "dark" ? "#f9fafb" : "#1f2937",
            margin: 0,
          }}
        >
          Pre-publish Check 组件示例
        </h1>

        <button
          onClick={toggleTheme}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
            color: theme === "dark" ? "#f9fafb" : "#1f2937",
            border: `1px solid ${theme === "dark" ? "#4b5563" : "#e5e7eb"}`,
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: "500",
            transition: "all 0.2s ease",
          }}
        >
          {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* 控制面板 */}
        <div
          style={{
            backgroundColor: theme === "dark" ? "#1f2937" : "white",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow:
              theme === "dark"
                ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            border: theme === "dark" ? "1px solid #374151" : "none",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: theme === "dark" ? "#f9fafb" : "#1f2937",
            }}
          >
            配置参数
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {/* Slug输入 */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: theme === "dark" ? "#f3f4f6" : "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Slug:
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: `1px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
                  borderRadius: "0.375rem",
                  backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
                  color: theme === "dark" ? "#f9fafb" : "#1f2937",
                  fontSize: "14px",
                }}
                placeholder="输入文章slug"
              />
            </div>

            {/* 语言选择 */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: theme === "dark" ? "#f3f4f6" : "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                语言:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "ja")}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: `1px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
                  borderRadius: "0.375rem",
                  backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
                  color: theme === "dark" ? "#f9fafb" : "#1f2937",
                  fontSize: "14px",
                }}
              >
                <option value="en">English (en)</option>
                <option value="ja">Japanese (ja)</option>
              </select>
            </div>
          </div>

          {/* 快速选择 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: theme === "dark" ? "#f3f4f6" : "#374151",
                marginBottom: "0.5rem",
              }}
            >
              快速选择:
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              {sampleSlugs.map((sampleSlug, index) => (
                <button
                  key={index}
                  onClick={() => setSlug(sampleSlug)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    fontSize: "12px",
                    backgroundColor: theme === "dark" ? "#4b5563" : "#f3f4f6",
                    color: theme === "dark" ? "#d1d5db" : "#374151",
                    border: "none",
                    borderRadius: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {sampleSlug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PrePublishCheck 组件展示 */}
        <div
          style={{
            backgroundColor: theme === "dark" ? "#1f2937" : "white",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow:
              theme === "dark"
                ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            border: theme === "dark" ? "1px solid #374151" : "none",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: theme === "dark" ? "#f9fafb" : "#1f2937",
            }}
          >
            Pre-publish 检查
          </h2>

          <PrePublishCheck
            slug={slug}
            language={language}
            onCheckResult={handleCheckResult}
          />

          {/* 检查结果反馈 */}
          {checkResult && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                borderRadius: "8px",
                border: `1px solid ${theme === "dark" ? "#4b5563" : "#e5e7eb"}`,
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme === "dark" ? "#f3f4f6" : "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                回调结果:
              </h3>
              <pre
                style={{
                  fontSize: "12px",
                  color: theme === "dark" ? "#d1d5db" : "#6b7280",
                  margin: 0,
                  fontFamily: "Monaco, Menlo, Ubuntu Mono, monospace",
                }}
              >
                {JSON.stringify(checkResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div
          style={{
            backgroundColor: theme === "dark" ? "#1f2937" : "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow:
              theme === "dark"
                ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            border: theme === "dark" ? "1px solid #374151" : "none",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: theme === "dark" ? "#f9fafb" : "#1f2937",
            }}
          >
            PrePublishCheck 组件使用说明
          </h2>

          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              color: theme === "dark" ? "#d1d5db" : "#6b7280",
            }}
          >
            <h3
              style={{
                color: theme === "dark" ? "#f3f4f6" : "#374151",
                marginTop: "1.5rem",
              }}
            >
              主要特性：
            </h3>
            <ul>
              <li>🔍 自动检查 Storyblok 中是否已存在相同的 full_slug</li>
              <li>⚡ 支持自动检查和手动检查两种模式</li>
              <li>🎯 根据语言自动构建正确的 full_slug 格式</li>
              <li>🔄 500ms 防抖，避免频繁请求</li>
              <li>✅ 清晰的存在/可用状态显示</li>
              <li>📱 完全响应式设计</li>
              <li>🎨 支持暗色模式</li>
            </ul>

            <h3
              style={{
                color: theme === "dark" ? "#f3f4f6" : "#374151",
                marginTop: "1.5rem",
              }}
            >
              使用示例：
            </h3>
            <pre
              style={{
                backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
                padding: "1rem",
                borderRadius: "6px",
                fontSize: "12px",
                overflow: "auto",
                color: theme === "dark" ? "#f9fafb" : "#1f2937",
              }}
            >
              {`<PrePublishCheck
  slug="your-article-slug"
  language="en"
  onCheckResult={(exists, fullSlug) => {
    console.log('URL exists:', exists);
    console.log('Full slug:', fullSlug);
  }}
/>`}
            </pre>

            <h3
              style={{
                color: theme === "dark" ? "#f3f4f6" : "#374151",
                marginTop: "1.5rem",
              }}
            >
              Full Slug 格式：
            </h3>
            <ul>
              <li>
                <strong>英文:</strong> <code>blog/en/your-slug</code>
              </li>
              <li>
                <strong>日文:</strong> <code>blog/ja/your-slug</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
