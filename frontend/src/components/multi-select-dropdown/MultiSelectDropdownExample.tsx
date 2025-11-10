"use client";

import React, { useState } from "react";
import MultiSelectDropdown, {
  DropdownOption,
} from "./index";

const MultiSelectDropdownExample: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const languageOptions: DropdownOption[] = [
    { id: "en", label: "English (英语)" },
    { id: "zh", label: "Chinese (中文)" },
    { id: "ja", label: "Japanese (日语)" },
    { id: "ko", label: "Korean (韩语)" },
    { id: "es", label: "Spanish (西班牙语)" },
    { id: "fr", label: "French (法语)" },
    { id: "de", label: "German (德语)" },
    { id: "pt", label: "Portuguese (葡萄牙语)" },
    { id: "ru", label: "Russian (俄语)" },
    { id: "it", label: "Italian (意大利语)" },
  ];

  const handleChange = (values: string[]) => {
    setSelectedValues(values);
    console.log("Selected languages:", values);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "32px", fontSize: "24px", fontWeight: "bold" }}>
        MultiSelectDropdown 示例
      </h1>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
          基础多选下拉框
        </h2>
        <MultiSelectDropdown
          options={languageOptions}
          value={selectedValues}
          onChange={handleChange}
          placeholder="选择语言"
          searchable={true}
        />
        <div style={{ marginTop: "16px", color: "#666", fontSize: "14px" }}>
          已选择: {selectedValues.length > 0 ? selectedValues.join(", ") : "无"}
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
          禁用状态
        </h2>
        <MultiSelectDropdown
          options={languageOptions}
          value={["en", "zh"]}
          onChange={() => {}}
          placeholder="选择语言"
          disabled={true}
        />
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
          不可搜索
        </h2>
        <MultiSelectDropdown
          options={languageOptions.slice(0, 5)}
          value={[]}
          onChange={handleChange}
          placeholder="选择语言"
          searchable={false}
        />
      </div>

      <div
        style={{
          marginTop: "48px",
          padding: "24px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>使用说明</h3>
        <ul style={{ paddingLeft: "20px", margin: 0 }}>
          <li>点击下拉框可展开选项列表</li>
          <li>点击选项可添加或移除选中项</li>
          <li>已选中的选项会以标签形式显示</li>
          <li>点击标签上的 × 可快速移除</li>
          <li>支持搜索功能，可快速筛选选项</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiSelectDropdownExample;

