"use client";

import React, { useState } from "react";
import NumberStepper from "./index";

const NumberStepperExample: React.FC = () => {
  const [quantity, setQuantity] = useState(3);
  const [items, setItems] = useState(5);
  const [priority, setPriority] = useState(1);

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "40px", textAlign: "center" }}>
        Number Stepper Component Demo
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* 数量调节 */}
        <div style={{ textAlign: "center" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "16px", 
            fontWeight: "500",
            fontSize: "14px",
            color: "#374151"
          }}>
            Quantity: {quantity}
          </label>
          <NumberStepper
            value={quantity}
            min={0}
            max={10}
            step={1}
            onChange={setQuantity}
          />
        </div>

        {/* 商品数量 */}
        <div style={{ textAlign: "center" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "16px", 
            fontWeight: "500",
            fontSize: "14px",
            color: "#374151"
          }}>
            Items in Cart: {items}
          </label>
          <NumberStepper
            value={items}
            min={1}
            max={99}
            step={1}
            onChange={setItems}
          />
        </div>

        {/* 优先级 */}
        <div style={{ textAlign: "center" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "16px", 
            fontWeight: "500",
            fontSize: "14px",
            color: "#374151"
          }}>
            Priority Level: {priority}
          </label>
          <NumberStepper
            value={priority}
            min={1}
            max={5}
            step={1}
            onChange={setPriority}
          />
        </div>

        {/* 禁用状态示例 */}
        <div style={{ textAlign: "center" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "16px", 
            fontWeight: "500",
            fontSize: "14px",
            color: "#9ca3af"
          }}>
            Disabled State
          </label>
          <NumberStepper
            defaultValue={3}
            disabled={true}
          />
          <div style={{ 
            marginTop: "16px",
            fontSize: "12px",
            color: "#6b7280",
            fontStyle: "italic"
          }}>
            This stepper is disabled
          </div>
        </div>
      </div>

      <div style={{ marginTop: "48px", padding: "20px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Features:</h3>
        <ul style={{ fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
          <li>✅ 简洁的白色圆角设计</li>
          <li>✅ 清晰的+/-按钮</li>
          <li>✅ 支持最小值/最大值限制</li>
          <li>✅ 自定义步长</li>
          <li>✅ 禁用状态支持</li>
          <li>✅ 响应式设计</li>
          <li>✅ 深色模式支持</li>
          <li>✅ 键盘导航友好</li>
          <li>✅ 高对比度模式支持</li>
        </ul>
      </div>
    </div>
  );
};

export default NumberStepperExample;