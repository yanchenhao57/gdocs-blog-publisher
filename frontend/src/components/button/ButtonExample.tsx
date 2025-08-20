"use client";

import React, { useState } from "react";
import Button from "./index";
import { Plus, Download, Trash } from "lucide-react";

const ButtonExample: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "40px", color: "#333" }}>黑白样式按钮组件</h1>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#666" }}>按钮变体</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="primary">主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">边框按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#666" }}>按钮尺寸</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Button size="small" variant="primary">小按钮</Button>
            <Button size="medium" variant="primary">中等按钮</Button>
            <Button size="large" variant="primary">大按钮</Button>
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#666" }}>按钮状态</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="primary">正常状态</Button>
            <Button variant="primary" disabled>禁用状态</Button>
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#666" }}>带图标按钮</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="primary" icon={<Plus />} iconPosition="left">添加项目</Button>
            <Button variant="outline" icon={<Trash />} iconPosition="left">删除</Button>
            <Button variant="secondary" icon={<Download />} iconPosition="right">下载</Button>
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#666" }}>加载状态</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Button 
              variant="primary" 
              loading={loading}
              onClick={handleLoadingDemo}
            >
              点击加载
            </Button>
            <Button variant="secondary" loading>加载中...</Button>
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#666" }}>全宽按钮</h2>
          <Button variant="primary" fullWidth>全宽按钮</Button>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#666" }}>组合示例</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button 
              variant="primary" 
              size="large" 
              icon={<Plus />} 
              iconPosition="left"
            >
              创建新项目
            </Button>
            <Button 
              variant="outline" 
              size="medium" 
              icon={<Download />} 
              iconPosition="right"
            >
              导出数据
            </Button>
            <Button 
              variant="ghost" 
              size="small" 
              icon={<Trash />} 
              iconPosition="left"
            >
              删除选中
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonExample;