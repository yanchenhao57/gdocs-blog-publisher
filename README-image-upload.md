# Google Docs 图片上传功能说明

## 功能概述

现在 `GoogleDocsToStoryblokConverter` 支持将 Google Docs 中的图片自动上传到您自己的服务器，而不是直接使用 Google 的 URL。

## 主要改进

### 1. 异步图片上传支持
- 所有转换方法现在都支持异步操作
- 图片会在转换过程中自动上传到自定义服务器
- 支持错误处理，上传失败时保持原始URL

### 2. 修改的方法

#### 主要转换方法
- `googleDocJsonToRichtext(docJson, imageUploader)` - 现在接受可选的 `imageUploader` 参数
- `convertElement(element, imageUploader)` - 支持图片上传
- `convertParagraph(paragraph, imageUploader)` - 支持图片上传
- `convertInlineObject(inlineObject, imageUploader)` - 核心图片处理逻辑

#### 辅助方法
- `convertParagraphElements(elements, imageUploader)` - 段落元素转换
- `convertListItem(paragraph, imageUploader)` - 列表项转换
- `createListStructure(listType, nestingLevel, paragraph, imageUploader)` - 列表结构创建
- `convertTable(table, imageUploader)` - 表格转换（支持表格中的图片）

### 3. 使用方式

#### 基本使用
```javascript
const { convertGoogleDocsToStoryblok } = require('./utils/googleDocsToStoryblok');
const { imageUploader } = require('./utils/imageUploader');

// 使用图片上传功能
const storyblokRichtext = await convertGoogleDocsToStoryblok(docJson, imageUploader);
```

#### 直接使用转换器
```javascript
const { GoogleDocsToStoryblokConverter } = require('./utils/googleDocsToStoryblok');
const { imageUploader } = require('./utils/imageUploader');

const converter = new GoogleDocsToStoryblokConverter();
const storyblokRichtext = await converter.googleDocJsonToRichtext(docJson, imageUploader);
```

#### 不使用图片上传（向后兼容）
```javascript
// 不传递 imageUploader 参数，图片将保持原始 Google URL
const storyblokRichtext = await convertGoogleDocsToStoryblok(docJson);
```

## 图片上传流程

1. **检测图片**: 在转换过程中检测到内联图片对象
2. **提取URL**: 从 Google Docs 中提取图片的原始 URL
3. **上传图片**: 调用 `imageUploader` 函数将图片上传到自定义服务器
4. **更新引用**: 将转换结果中的图片 URL 替换为上传后的 URL
5. **错误处理**: 如果上传失败，保持原始 URL 并记录错误

## 错误处理

- 如果 `imageUploader` 函数抛出异常，会捕获错误并记录日志
- 上传失败时，图片会保持原始的 Google URL
- 转换过程不会因为单个图片上传失败而中断

## 日志输出

转换过程中会输出以下日志：
- `🔼 开始上传图片: [原始URL]` - 开始上传图片
- `✅ 图片上传成功: [新URL]` - 图片上传成功
- `❌ 图片上传失败: [错误信息]` - 图片上传失败

## 配置要求

确保您的 `imageUploader` 函数：
- 接受两个参数：
  - `contentUri`：Google 图片的原始 URL
  - `alt`：图片的 alt 文本（来自 Google Docs 的 description 字段）
- 返回一个 Promise，解析为上传后的图片 URL
- 处理各种图片格式和大小
- 实现适当的错误处理

## 示例 imageUploader 实现

```javascript
async function imageUploader(contentUri, alt) {
  try {
    // 下载图片
    const response = await fetch(contentUri);
    const buffer = await response.buffer();
    
    // 上传到您的服务器，同时传递 alt 信息
    const uploadResponse = await uploadToYourServer(buffer, {
      alt: alt,
      originalUrl: contentUri
    });
    
    return uploadResponse.url;
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
}
```

## 向后兼容性

- 所有现有代码仍然可以正常工作
- 如果不传递 `imageUploader` 参数，图片将保持原始 URL
- 现有的同步调用需要改为异步调用（添加 `await`）

## 性能考虑

- 图片上传会增加转换时间
- 建议实现图片缓存机制避免重复上传
- 考虑并行上传多个图片以提高性能 