# 真实分析功能实现指南

## 🎯 功能概述

我已经成功实现了 Internal Link Optimizer 的真实分析功能，现在可以：

1. **解析用户输入的 URL** - 自动提取 `full_slug`
2. **调用 Storyblok API** - 获取真实的 blog story 数据
3. **提取内容** - 从 Storyblok richtext 中提取可分析的文本
4. **生成建议** - 基于用户配置的内链生成优化建议
5. **错误处理** - 完整的错误处理和用户反馈

## 🔧 实现细节

### 1. URL 解析功能

```typescript
function extractFullSlugFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // 移除开头和末尾的斜杠
    const fullSlug = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    return fullSlug.endsWith('/') ? fullSlug.slice(0, -1) : fullSlug;
  } catch (error) {
    return null;
  }
}
```

**支持的 URL 格式**:
- `https://yourblog.com/blog/en/my-post` → `blog/en/my-post`
- `https://yourblog.com/blog/en/my-post/` → `blog/en/my-post`
- `https://yourblog.com/my-post` → `my-post`

### 2. Storyblok 数据获取

```typescript
// 调用我们创建的 Storyblok API
const storyData = await apiService.getStoryblokStory(fullSlug);
```

**API 集成**:
- 使用前端 `apiService.getStoryblokStory()` 方法
- 自动处理 URL 编码
- 完整的错误处理

### 3. 内容提取

```typescript
function extractContentFromStory(storyData: any): string {
  const content = storyData?.content;
  
  // 优先级：body richtext > text > title
  if (content.body && Array.isArray(content.body)) {
    return extractTextFromRichtext(content.body);
  }
  
  if (content.text) return content.text;
  if (content.title || content.heading_h1) return content.title || content.heading_h1;
  
  throw new Error('无法从 Story 中提取可分析的内容');
}
```

**Richtext 解析**:
- 递归遍历 Storyblok richtext 结构
- 提取纯文本内容
- 保持段落结构

### 4. 智能建议生成

```typescript
function generateMockSuggestions(linkRows: LinkRow[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  linkRows.forEach((row, index) => {
    if (row.targetUrl && row.anchorTexts.length > 0) {
      row.anchorTexts.forEach((anchorText, anchorIndex) => {
        if (anchorText.trim()) {
          suggestions.push({
            id: `${row.id}-${anchorIndex}`,
            type: 'add',
            text: `建议在适当位置添加指向 "${row.targetUrl}" 的内链`,
            newLink: row.targetUrl,
            anchorText: anchorText,
            position: index * 20 + anchorIndex * 5,
            accepted: null,
          });
        }
      });
    }
  });

  return suggestions;
}
```

**建议特性**:
- 基于用户配置的内链生成建议
- 每个 anchor text 生成一个建议
- 包含目标 URL 和锚文本信息

## 🚀 使用流程

### 1. 用户输入配置
```
Blog URL: https://yourblog.com/blog/en/my-article
Internal Links:
- Target: /design-patterns, Anchors: ["design patterns", "UI patterns"]
- Target: /seo-guide, Anchors: ["SEO optimization"]
```

### 2. 系统处理流程
```
1. 解析 URL → full_slug: "blog/en/my-article"
2. 调用 API → getStoryblokStory("blog/en/my-article")
3. 提取内容 → 从 story.content.body 提取文本
4. 生成建议 → 基于配置的内链生成 3 个建议
5. 显示结果 → 原始内容 + 优化建议 + 预览
```

### 3. 错误处理
```
- URL 格式错误 → "无法从 URL 中解析出有效的 slug"
- Story 不存在 → API 返回 404 错误
- 内容提取失败 → "无法从 Story 中提取可分析的内容"
- 网络错误 → "获取数据失败，请重试"
```

## 📊 进度指示

```typescript
分析进度显示：
0%   → 开始分析
20%  → URL 解析完成
60%  → Story 数据获取完成
80%  → 内容提取完成
100% → 分析完成，显示建议
```

## 🎨 用户界面增强

### 错误显示
- 红色警告框显示错误信息
- 可关闭的错误提示
- 自动回到输入步骤

### 数据展示
- 实时进度条
- 清晰的状态反馈
- 详细的 console 日志

## 🔮 后续扩展点

### 1. AI 分析集成
```typescript
// 将来可以替换 generateMockSuggestions
const suggestions = await analyzeContentWithAI(originalContent, linkRows);
```

### 2. 内容智能匹配
```typescript
// 更精确的锚文本匹配和位置计算
const optimizedSuggestions = await findBestInsertionPoints(content, suggestions);
```

### 3. 批量分析
```typescript
// 支持同时分析多个 URL
const results = await analyzeBatch(urls);
```

## 🧪 测试示例

### 有效测试 URL
```
https://yourblog.com/blog/en/sample-post
https://yourblog.com/articles/how-to-seo
https://yourblog.com/guides/internal-linking
```

### 测试配置
```
Internal Links:
1. Target: /about, Anchors: ["about us", "our company"]
2. Target: /contact, Anchors: ["contact", "get in touch"]
3. Target: /services, Anchors: ["our services", "what we do"]
```

### 预期结果
- 获取真实的 blog 内容
- 生成基于配置的内链建议
- 显示优化后的内容预览

## ⚡ 性能优化

1. **缓存策略**: 相同 URL 的结果可以缓存
2. **并发处理**: 多个 API 调用可以并行
3. **错误重试**: 网络失败时自动重试
4. **进度反馈**: 用户体验更流畅

现在 Internal Link Optimizer 具备了真实的数据分析能力，可以处理实际的 Storyblok blog 内容并生成有价值的内链优化建议！
