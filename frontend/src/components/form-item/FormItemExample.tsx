"use client";

import React, { useState } from "react";
import FormItem from "./index";
import Input from "../input";
import Dropdown, { DropdownOption } from "../dropdown";
import Tab, { TabItem } from "../tab";
import { Settings, Globe, FileText } from "lucide-react";

export default function FormItemExample() {
  const [title, setTitle] = useState("Sample Article Title");
  const [language, setLanguage] = useState("en");
  const [seoTitle, setSeoTitle] = useState("SEO Title Example");

  const languageOptions: DropdownOption[] = [
    { id: "en", label: "English" },
    { id: "ja", label: "日本語" },
  ];

  const tabItems: TabItem[] = [
    { id: "ai", label: "AI Generated", icon: <Settings size={16} /> },
    { id: "document", label: "Document H1", icon: <FileText size={16} /> },
    { id: "custom", label: "Custom", icon: <Globe size={16} /> },
  ];

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem" }}>
      <h2>FormItem Component Examples</h2>
      
      {/* 基础用法 - Input */}
      <FormItem label="Article Title" required>
        <Input
          value={title}
          onChange={setTitle}
          placeholder="Enter your article title"
        />
      </FormItem>

      {/* 复杂用法 - Input + Tab */}
      <FormItem label="Title Source" required>
        <Input
          value={title}
          onChange={setTitle}
          placeholder="Enter your article title"
        />
        <Tab
          items={tabItems}
          defaultActiveId="ai"
          onChange={(id) => console.log("Tab changed:", id)}
        />
      </FormItem>

      {/* Dropdown 用法 */}
      <FormItem label="Language / 言語" required>
        <Dropdown
          options={languageOptions}
          value={language}
          onChange={setLanguage}
          placeholder="Select language"
        />
      </FormItem>

      {/* 无 required 标记 */}
      <FormItem label="SEO Title">
        <Input
          value={seoTitle}
          onChange={setSeoTitle}
          placeholder="Enter SEO title"
        />
      </FormItem>

      {/* 无 label */}
      <FormItem>
        <Input
          value="Input without label"
          onChange={() => {}}
          placeholder="This input has no label"
        />
      </FormItem>

      {/* 自定义类名 */}
      <FormItem label="Custom Styled" className="custom-form-item">
        <Input
          value="Custom styled input"
          onChange={() => {}}
          placeholder="This has custom styling"
        />
      </FormItem>
    </div>
  );
}
