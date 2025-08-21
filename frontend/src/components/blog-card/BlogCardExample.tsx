"use client";

import React, { useState, useEffect } from "react";
import BlogCard from "./index";

export default function BlogCardExample() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // 设置 data-theme 属性到 document.documentElement
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleCardClick = (title: string) => {
    console.log(`点击了文章: ${title}`);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div style={{ 
      padding: "2rem",
      background: theme === "dark" ? "#111827" : "#f8fafc",
      minHeight: "100vh",
      transition: "background-color 0.3s ease"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
      }}>
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "bold", 
          color: theme === "dark" ? "#f9fafb" : "#1f2937",
          margin: 0
        }}>
          Blog Card 组件示例
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
            transition: "all 0.2s ease"
          }}
        >
          {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* 带封面图片的卡片 */}
        <BlogCard
          title="Optimizing Business decisions with Advanced data Analytics"
          description="Discover how web solutions are reshaping the business landscape. Learn about the latest trends and technologies that are driving innovation in the digital world."
          author="William Ashford"
          readingTime="5 min read"
          publishDate="Mar 09, 2024"
          category="Data Science"
          coverImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          onClick={() => handleCardClick("Optimizing Business decisions with Advanced data Analytics")}
          showExternalIcon={true}
        />

        {/* 无封面图片的卡片 */}
        <BlogCard
          title="The Future of AI in Web Development"
          description="Explore how artificial intelligence is revolutionizing the way we build and interact with web applications. From automated testing to intelligent user interfaces."
          author="Sarah Chen"
          readingTime="8 min read"
          publishDate="Feb 28, 2024"
          category="Technology"
          onClick={() => handleCardClick("The Future of AI in Web Development")}
        />

        {/* 长标题的卡片 */}
        <BlogCard
          title="Building Scalable and Maintainable React Applications: A Comprehensive Guide to Modern Development Practices"
          description="Learn the best practices for creating React applications that can grow with your business. This comprehensive guide covers everything from project structure to performance optimization and testing strategies."
          author="Alex Rodriguez"
          readingTime="12 min read"
          publishDate="Feb 15, 2024"
          category="Frontend"
          coverImage="https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          onClick={() => handleCardClick("Building Scalable React Applications")}
          showExternalIcon={true}
        />

        {/* 简短内容的卡片 */}
        <BlogCard
          title="CSS Grid vs Flexbox"
          description="Quick comparison of two powerful layout systems."
          author="Mike Johnson"
          readingTime="3 min read"
          publishDate="Jan 30, 2024"
          category="CSS"
          onClick={() => handleCardClick("CSS Grid vs Flexbox")}
        />

        {/* 设计类文章 */}
        <BlogCard
          title="Design Systems That Scale"
          description="Creating consistent user experiences across multiple products and platforms. Learn how to build a design system that grows with your organization and maintains visual consistency."
          author="Emma Thompson"
          readingTime="10 min read"
          publishDate="Jan 18, 2024"
          category="Design"
          coverImage="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          onClick={() => handleCardClick("Design Systems That Scale")}
        />

        {/* 开发工具文章 */}
        <BlogCard
          title="Essential DevOps Tools for 2024"
          description="A curated list of the most important DevOps tools that every development team should consider. From CI/CD pipelines to monitoring and infrastructure as code."
          author="David Kumar"
          readingTime="15 min read"
          publishDate="Dec 22, 2023"
          category="DevOps"
          onClick={() => handleCardClick("Essential DevOps Tools for 2024")}
          showExternalIcon={true}
        />
      </div>

      {/* 使用说明 */}
      <div style={{
        maxWidth: "800px",
        margin: "4rem auto 0",
        padding: "2rem",
        backgroundColor: theme === "dark" ? "#1f2937" : "white",
        borderRadius: "12px",
        boxShadow: theme === "dark" 
          ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)" 
          : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        border: theme === "dark" ? "1px solid #374151" : "none"
      }}>
        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: "600", 
          marginBottom: "1rem",
          color: theme === "dark" ? "#f9fafb" : "#1f2937"
        }}>
          BlogCard 组件使用说明
        </h2>
        
        <div style={{ 
          fontSize: "14px", 
          lineHeight: "1.6", 
          color: theme === "dark" ? "#d1d5db" : "#6b7280"
        }}>
          <h3 style={{ 
            color: theme === "dark" ? "#f3f4f6" : "#374151", 
            marginTop: "1.5rem" 
          }}>主要特性：</h3>
          <ul>
            <li>✨ 现代化设计，支持悬停动画效果</li>
            <li>🖼️ 支持封面图片或占位符</li>
            <li>🎨 自动适配暗色模式</li>
            <li>📱 响应式设计，移动端友好</li>
            <li>♿ 完整的无障碍访问支持</li>
            <li>🔗 可选的外部链接图标</li>
            <li>⌨️ 键盘导航支持</li>
          </ul>

          <h3 style={{ 
            color: theme === "dark" ? "#f3f4f6" : "#374151", 
            marginTop: "1.5rem" 
          }}>Props：</h3>
          <ul>
            <li><code>title</code> - 文章标题 (必需)</li>
            <li><code>description</code> - 文章描述 (必需)</li>
            <li><code>author</code> - 作者姓名 (必需)</li>
            <li><code>readingTime</code> - 阅读时间 (必需)</li>
            <li><code>publishDate</code> - 发布日期 (必需)</li>
            <li><code>category</code> - 分类标签 (可选)</li>
            <li><code>coverImage</code> - 封面图片URL (可选)</li>
            <li><code>onClick</code> - 点击事件处理 (可选)</li>
            <li><code>showExternalIcon</code> - 显示外部链接图标 (可选)</li>
            <li><code>className</code> - 自定义类名 (可选)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
