import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主背景色 - 纯净的白色和黑色
        background: "#ffffff",
        backgroundDark: "#000000",
        backgroundSecondary: "#fafafa",
        backgroundSecondaryDark: "#111111",
        
        // 文字颜色 - 高对比度
        text: "#000000",
        textLight: "#ffffff",
        textSecondary: "#666666",
        textSecondaryLight: "#cccccc",
        textMuted: "#999999",
        textMutedLight: "#888888",
        
        // 主色调 - 红色系
        primary: "#ff0000",
        primaryHover: "#cc0000",
        primaryActive: "#990000",
        primaryLight: "#ff3333",
        primaryDark: "#b30000",
        
        // 强调色 - 红色变体
        accent: "#ff0033",
        accentHover: "#cc0029",
        accentLight: "#ff1a4d",
        accentDark: "#b30026",
        
        // 边框颜色 - 极简设计
        border: "#e5e5e5",
        borderDark: "#333333",
        borderLight: "#f0f0f0",
        borderStrong: "#d0d0d0",
        borderStrongDark: "#444444",
        
        // 状态颜色
        success: "#00ff00",
        successHover: "#00cc00",
        error: "#ff0000",
        errorHover: "#cc0000",
        warning: "#ff6600",
        warningHover: "#cc5200",
        
        // 交互状态
        hover: "#f5f5f5",
        hoverDark: "#1a1a1a",
        active: "#e0e0e0",
        activeDark: "#2a2a2a",
        
        // 阴影和覆盖层
        overlay: "rgba(0, 0, 0, 0.5)",
        overlayLight: "rgba(0, 0, 0, 0.1)",
        shadow: "rgba(0, 0, 0, 0.1)",
        shadowDark: "rgba(255, 255, 255, 0.1)",
      },
      
      // 字体配置
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "monospace"],
      },
      
      // 间距和尺寸
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      
      // 圆角
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      
      // 阴影
      boxShadow: {
        sharp:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "sharp-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        glow: "0 0 20px rgba(255, 0, 0, 0.3)",
        "glow-lg": "0 0 40px rgba(255, 0, 0, 0.4)",
      },
      
      // 动画
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(255, 0, 0, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(255, 0, 0, 0.6)" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
