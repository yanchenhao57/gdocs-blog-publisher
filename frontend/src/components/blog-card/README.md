# BlogCard 组件

一个现代化的博客卡片预览组件，支持亮色/暗色主题切换。

## 特性

- ✨ 现代化设计，支持悬停动画效果
- 🖼️ 支持封面图片或占位符
- 🎨 支持 `data-theme="dark"` 暗色模式
- 📱 响应式设计，移动端友好
- ♿ 完整的无障碍访问支持
- 🔗 可选的外部链接图标
- ⌨️ 键盘导航支持

## 使用方法

### 基本用法

```tsx
import BlogCard from "@/components/blog-card";

<BlogCard
  title="Optimizing Business decisions with Advanced data Analytics"
  description="Discover how web solutions are reshaping the business landscape."
  author="William Ashford"
  readingTime="5 min read"
  publishDate="Mar 09, 2024"
  category="Data Science"
  coverImage="https://example.com/image.jpg"
  onClick={() => console.log('Card clicked')}
  showExternalIcon={true}
/>
```

### 暗色模式

暗色模式通过 `data-theme="dark"` 属性控制，通常设置在 `document.documentElement` 上：

```tsx
// 设置暗色模式
document.documentElement.setAttribute("data-theme", "dark");

// 设置亮色模式
document.documentElement.setAttribute("data-theme", "light");
```

### 主题切换示例

```tsx
import { useState, useEffect } from "react";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div>
      <button onClick={toggleTheme}>
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>
      
      <BlogCard
        title="Your Article Title"
        description="Your article description..."
        author="Author Name"
        readingTime="5 min read"
        publishDate="Mar 09, 2024"
      />
    </div>
  );
}
```

## Props

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `title` | `string` | ✓ | - | 文章标题 |
| `description` | `string` | ✓ | - | 文章描述 |
| `author` | `string` | ✓ | - | 作者姓名 |
| `readingTime` | `string` | ✓ | - | 阅读时间 |
| `publishDate` | `string` | ✓ | - | 发布日期 |
| `category` | `string` | ✗ | - | 分类标签 |
| `coverImage` | `string` | ✗ | - | 封面图片URL |
| `onClick` | `() => void` | ✗ | - | 点击事件处理 |
| `showExternalIcon` | `boolean` | ✗ | `false` | 显示外部链接图标 |
| `className` | `string` | ✗ | - | 自定义类名 |

## 样式自定义

组件使用 CSS Modules，可以通过传入 `className` 进行样式覆盖：

```tsx
<BlogCard
  // ... other props
  className="my-custom-card"
/>
```

或者在全局CSS中覆盖特定样式：

```css
.my-custom-card {
  max-width: 500px;
  border-radius: 20px;
}
```

## 无障碍支持

- 支持键盘导航（Tab、Enter、Space）
- 适当的 ARIA 属性
- 高对比度支持
- 屏幕阅读器友好
