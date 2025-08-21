# HorizontalBlogCard 组件

一个横向布局的博客卡片组件，专为内容丰富的文章展示而设计，支持图片左右位置切换和完全响应式布局。

## 特性

- 🔄 横向布局设计，适合内容丰富的文章展示
- 📐 支持图片左右位置切换 (`imagePosition`)
- 🖼️ 支持封面图片或占位符
- 📱 完全响应式设计，移动端自动转为垂直布局
- 🎨 支持 `data-theme="dark"` 暗色模式
- 🔗 可选的外部链接图标
- ⌨️ 键盘导航支持
- ♿ 完整的无障碍访问支持

## 使用方法

### 基本用法

```tsx
import HorizontalBlogCard from "@/components/horizontal-blog-card";

<HorizontalBlogCard
  title="Optimizing Business decisions with Advanced data Analytics"
  description="Discover how web solutions are reshaping the business landscape."
  author="William Ashford"
  readingTime="5 min read"
  publishDate="Mar 09, 2024"
  category="Data Science"
  coverImage="https://example.com/image.jpg"
  onClick={() => console.log('Card clicked')}
/>
```

### 图片右侧布局

```tsx
<HorizontalBlogCard
  title="Your Article Title"
  description="Your article description..."
  author="Author Name"
  readingTime="8 min read"
  publishDate="Feb 28, 2024"
  imagePosition="right"
  coverImage="https://example.com/image.jpg"
/>
```

### 外部链接样式

```tsx
<HorizontalBlogCard
  title="External Article Title"
  description="This article links to an external site..."
  author="Author Name"
  readingTime="5 min read"
  publishDate="Mar 09, 2024"
  showExternalIcon={true}
  onClick={() => window.open('https://external-site.com')}
/>
```

## Props

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `title` | `string` | ✓ | - | 博客文章标题 |
| `description` | `string` | ✓ | - | 博客文章描述 |
| `author` | `string` | ✓ | - | 作者姓名 |
| `readingTime` | `string` | ✓ | - | 阅读时间 |
| `publishDate` | `string` | ✓ | - | 发布日期 |
| `category` | `string` | ✗ | - | 分类标签 |
| `coverImage` | `string` | ✗ | - | 封面图片URL |
| `onClick` | `() => void` | ✗ | - | 点击事件处理 |
| `className` | `string` | ✗ | - | 自定义类名 |
| `showExternalIcon` | `boolean` | ✗ | `false` | 显示外部链接图标 |
| `imagePosition` | `"left" \| "right"` | ✗ | `"left"` | 图片位置 |

## 响应式行为

### 桌面端 (>1024px)
- 完整横向布局
- 图片宽度：320px
- 内容区域自适应剩余空间

### 平板端 (≤1024px)
- 保持横向布局
- 图片宽度：280px
- 调整字体大小和间距

### 移动端 (≤768px)
- **自动转为垂直布局**
- 图片位置设置失效，统一显示在顶部
- 图片高度：200px
- 优化移动端的触摸体验

### 小屏幕 (≤480px)
- 底部信息改为垂直排列
- 进一步缩小内边距

## 暗色模式

支持通过 `data-theme="dark"` 属性控制暗色模式：

```tsx
// 设置暗色模式
document.documentElement.setAttribute("data-theme", "dark");

// 设置亮色模式
document.documentElement.setAttribute("data-theme", "light");
```

## 样式自定义

组件使用 CSS Modules，可以通过传入 `className` 进行样式覆盖：

```tsx
<HorizontalBlogCard
  // ... other props
  className="my-custom-horizontal-card"
/>
```

或者在全局CSS中覆盖特定样式：

```css
.my-custom-horizontal-card {
  max-width: 900px;
  border-radius: 20px;
}
```

## 与 BlogCard 组件的区别

| 特性 | BlogCard | HorizontalBlogCard |
|------|----------|-------------------|
| 布局方向 | 垂直 | 横向（移动端转垂直） |
| 适用场景 | 卡片网格布局 | 文章列表展示 |
| 图片位置 | 固定顶部 | 可选左右 |
| 内容展示 | 紧凑 | 更多内容空间 |
| 最大宽度 | 400px | 800px |

## 使用建议

### 何时使用 HorizontalBlogCard
- 📝 文章列表页面
- 🔍 搜索结果展示
- 📖 相关文章推荐
- 🏠 首页特色文章

### 何时使用 BlogCard
- 📱 卡片网格布局
- 🎯 简洁的文章预览
- 📦 组件库展示
- 🔢 大量文章列表

## 无障碍支持

- 完整的键盘导航支持（Tab、Enter、Space）
- 适当的 ARIA 属性和角色
- 高对比度支持
- 屏幕阅读器友好
- Focus 状态清晰可见
