# SeoMetaCard 组件

一个专业的 SEO Meta 信息展示卡片组件，提供实时字符数统计、Google 预览和编辑功能。

## 特性

- 🎯 专业的 SEO Meta 信息展示
- 📊 实时字符数统计和限制提醒
- 👁️ Google 搜索结果预览
- ✏️ 可编辑和只读两种模式
- 🔗 Canonical URL 支持
- 🎨 支持 `data-theme="dark"` 暗色模式
- 📱 响应式设计，移动端友好
- ♿ 完整的无障碍访问支持

## 使用方法

### 基本用法（只读模式）

```tsx
import SeoMetaCard from "@/components/seo-meta-card";

<SeoMetaCard
  title="Google Docs Converter"
  description="Convert Google Docs to Markdown and publish to Storyblok"
  canonical="https://www.example.com/converter"
/>
```

### 可编辑模式

```tsx
import { useState } from "react";
import SeoMetaCard from "@/components/seo-meta-card";

function EditableSeoCard() {
  const [seoData, setSeoData] = useState({
    title: "Your SEO Title",
    description: "Your SEO description",
    canonical: "https://example.com/page"
  });

  const handleEdit = (field: 'title' | 'description' | 'canonical', value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <SeoMetaCard
      title={seoData.title}
      description={seoData.description}
      canonical={seoData.canonical}
      editable={true}
      onEdit={handleEdit}
    />
  );
}
```

### 不包含 Canonical URL

```tsx
<SeoMetaCard
  title="Blog Post Title"
  description="Blog post description without canonical URL"
  editable={false}
/>
```

## Props

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `title` | `string` | ✓ | - | SEO 标题 |
| `description` | `string` | ✓ | - | SEO 描述 |
| `canonical` | `string` | ✗ | - | Canonical URL |
| `className` | `string` | ✗ | - | 自定义类名 |
| `editable` | `boolean` | ✗ | `false` | 是否启用编辑模式 |
| `onEdit` | `(field, value) => void` | ✗ | - | 编辑回调函数 |

## 字符数限制

组件内置了 SEO 最佳实践的字符数限制：

### Title（标题）
- **建议限制**: 60 字符
- **颜色提示**:
  - 🟢 绿色: ≤ 48 字符（安全范围）
  - 🟡 黄色: 49-57 字符（接近限制）
  - 🔴 红色: > 57 字符（超出建议）

### Description（描述）
- **建议限制**: 160 字符
- **颜色提示**:
  - 🟢 绿色: ≤ 128 字符（安全范围）
  - 🟡 黄色: 129-152 字符（接近限制）
  - 🔴 红色: > 152 字符（超出建议）

## Google 预览功能

组件底部提供 Google 搜索结果预览，包括：
- **蓝色标题链接**: 显示 SEO title（超出 60 字符会自动截断）
- **绿色 URL**: 显示 canonical URL 或示例 URL
- **灰色描述**: 显示 SEO description（超出 160 字符会自动截断）

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
<SeoMetaCard
  // ... other props
  className="my-custom-seo-card"
/>
```

## 编辑模式回调

当 `editable={true}` 时，可以通过 `onEdit` 回调处理字段变更：

```tsx
const handleEdit = (field: 'title' | 'description' | 'canonical', value: string) => {
  switch (field) {
    case 'title':
      // 处理标题变更
      break;
    case 'description':
      // 处理描述变更
      break;
    case 'canonical':
      // 处理 Canonical URL 变更
      break;
  }
};
```

## 无障碍支持

- 完整的键盘导航支持
- 适当的 ARIA 标签
- 高对比度支持
- 屏幕阅读器友好
- Focus 状态清晰可见
