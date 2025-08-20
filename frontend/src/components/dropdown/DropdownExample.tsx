"use client";

import React, { useState } from "react";
import Dropdown, { DropdownOption } from "./index";
import { 
  GraduationCap, 
  FlaskConical, 
  Palette, 
  Trophy, 
  Gamepad2, 
  Heart 
} from "lucide-react";

const DropdownExample: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const options: DropdownOption[] = [
    {
      id: "education",
      label: "Education",
      icon: <GraduationCap size={16} />,
    },
    {
      id: "science",
      label: "Yeeeah, science!",
      icon: <FlaskConical size={16} />,
    },
    {
      id: "art",
      label: "Art",
      icon: <Palette size={16} />,
    },
    {
      id: "sport",
      label: "Sport",
      icon: <Trophy size={16} />,
    },
    {
      id: "games",
      label: "Games",
      icon: <Gamepad2 size={16} />,
    },
    {
      id: "health",
      label: "Health",
      icon: <Heart size={16} />,
    },
  ];

  const handleChange = (value: string, option: DropdownOption) => {
    setSelectedValue(value);
    console.log("Selected:", value, option);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h2>Dropdown Component Demo</h2>
      
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
          Choose a category:
        </label>
        <Dropdown
          options={options}
          placeholder="Science"
          defaultValue="science"
          searchable={true}
          onChange={handleChange}
        />
      </div>

      {selectedValue && (
        <div style={{ 
          padding: "12px", 
          backgroundColor: "#f3f4f6", 
          borderRadius: "8px",
          fontSize: "14px" 
        }}>
          Selected: {options.find(opt => opt.id === selectedValue)?.label}
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h3>Features:</h3>
        <ul style={{ fontSize: "14px", lineHeight: "1.6" }}>
          <li>✅ 搜索过滤功能</li>
          <li>✅ 图标支持</li>
          <li>✅ 选中状态显示</li>
          <li>✅ 键盘导航支持</li>
          <li>✅ 点击外部自动关闭</li>
          <li>✅ 深色模式支持</li>
          <li>✅ 禁用状态支持</li>
          <li>✅ 流畅的动画效果</li>
        </ul>
      </div>
    </div>
  );
};

export default DropdownExample;