"use client";

import React, { useState, useEffect } from "react";
import SeoMetaCard from "./index";

export default function SeoMetaCardExample() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [editableData, setEditableData] = useState({
    title: "Optimizing Business decisions with Advanced data Analytics",
    description:
      "Discover how web solutions are reshaping the business landscape. Learn about the latest trends and technologies that are driving innovation in the digital world.",
    canonical: "https://www.example.com/business-analytics-optimization",
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleEdit = (
    field: "title" | "description" | "canonical",
    value: string
  ) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sampleData = [
    {
      title: "Google Docs Converter",
      description: "Convert Google Docs to Markdown and publish to Storyblok",
      canonical: "https://www.notta.ai/tools/google-docs-converter",
    },
    {
      title: "Advanced SEO Optimization Techniques for Modern Websites",
      description:
        "Master the art of search engine optimization with our comprehensive guide covering technical SEO, content strategy, and performance metrics.",
      canonical: "https://www.example.com/seo-optimization-guide",
    },
    {
      title: "React Component Library Design System Best Practices",
      description:
        "Build scalable and maintainable component libraries using React, TypeScript, and modern design patterns for enterprise applications.",
      canonical: "https://www.example.com/react-design-system",
    },
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
          SEO Meta Card 组件示例
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "2rem",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* 可编辑的卡片 */}
        <div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: theme === "dark" ? "#f3f4f6" : "#374151",
              marginBottom: "1rem",
            }}
          >
            可编辑模式
          </h2>
          <SeoMetaCard
            title={editableData.title}
            description={editableData.description}
            canonical={editableData.canonical}
            editable={true}
            onEdit={handleEdit}
          />
        </div>

        {/* 只读卡片示例 */}
        {sampleData.map((data, index) => (
          <div key={index}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: theme === "dark" ? "#f3f4f6" : "#374151",
                marginBottom: "1rem",
              }}
            >
              示例 {index + 1}
            </h2>
            <SeoMetaCard
              title={data.title}
              description={data.description}
              canonical={data.canonical}
              editable={false}
            />
          </div>
        ))}

        {/* 无 Canonical 的示例 */}
        <div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: theme === "dark" ? "#f3f4f6" : "#374151",
              marginBottom: "1rem",
            }}
          >
            无 Canonical URL
          </h2>
          <SeoMetaCard
            title="AI-Powered Content Generation Tools"
            description="Explore the latest artificial intelligence tools that can help you create engaging content faster and more efficiently."
            editable={false}
          />
        </div>
      </div>

      {/* 使用说明 */}
      <div
        style={{
          maxWidth: "800px",
          margin: "4rem auto 0",
          padding: "2rem",
          backgroundColor: theme === "dark" ? "#1f2937" : "white",
          borderRadius: "12px",
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
          SeoMetaCard 组件使用说明
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
            <li>🎯 专业的 SEO Meta 信息展示</li>
            <li>📊 实时字符数统计和限制提醒</li>
            <li>👁️ Google 搜索结果预览</li>
            <li>✏️ 可编辑和只读两种模式</li>
            <li>🔗 Canonical URL 支持</li>
            <li>🎨 支持暗色模式</li>
            <li>📱 响应式设计</li>
            <li>♿ 完整的无障碍访问支持</li>
          </ul>

          <h3
            style={{
              color: theme === "dark" ? "#f3f4f6" : "#374151",
              marginTop: "1.5rem",
            }}
          >
            字符数限制：
          </h3>
          <ul>
            <li>
              <strong>Title:</strong> 建议 60 字符以内（绿色 ≤ 48，黄色 ≤
              57，红色 &gt; 57）
            </li>
            <li>
              <strong>Description:</strong> 建议 160 字符以内（绿色 ≤ 128，黄色
              ≤ 152，红色 &gt; 152）
            </li>
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
            {`<SeoMetaCard
  title="Your SEO Title"
  description="Your SEO description"
  canonical="https://example.com/page"
  editable={true}
  onEdit={(field, value) => {
    console.log(field, value);
  }}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
