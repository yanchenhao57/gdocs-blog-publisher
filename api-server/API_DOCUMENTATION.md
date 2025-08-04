# Google Docs 转换 API 文档

## 概述

Google Docs 转换 API 提供了将 Google Docs 文档转换为多种格式的功能，包括 HTML、Markdown、Storyblok Richtext 格式，并生成 AI 结构化元数据。

**执行顺序优化**：先进行 AI 结构化分析，再进行图片上传，避免 AI 失败时造成资源浪费。

**容错处理**：AI 分析失败时不影响整个流程，使用默认空值继续执行。

## 基础信息

- **基础 URL**: `http://localhost:3000`
- **内容类型**: `application/json`
- **请求大小限制**: 50MB（支持大型文档转换）
- **实时通知**: 支持 Socket.io 实时通知

## 接口列表

### 1. 文档转换接口

#### 基本信息

- **路径**: `POST /convert`
- **描述**: 将 Google Docs 文档转换为多种格式
- **版本**: 1.0.0

#### 请求参数

| 参数名 | 类型   | 必需 | 描述                |
| ------ | ------ | ---- | ------------------- |
| docId  | String | 是   | Google Docs 文档 ID |

#### 请求示例

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"docId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"}'
```

```javascript
const response = await fetch("/convert", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    docId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  }),
});
```

#### 响应格式

**成功响应 (200)**

```json
{
  "html": "<h1>文档标题</h1><p>文档内容...</p>",
  "markdown": "# 文档标题\n\n文档内容...",
  "richtext": {
    "type": "doc",
    "content": [...]
  },
  "aiMeta": {
    "seo_title": "SEO优化标题",
    "seo_description": "SEO优化描述",
    "heading_h1": "文章主标题",
    "slug": "article-slug",
    "reading_time": 5,
    "language": "en",
    "cover_alt": "封面图描述"
  },
  "firstH1Title": "文档标题",
  "coverImage": "https://example.com/image.jpg"
}
```

**错误响应 (400)**

```json
{
  "error": "docId is required"
}
```

**错误响应 (500)**

```json
{
  "error": "转换过程中出现错误"
}
```

#### 响应字段说明

| 字段名       | 类型   | 描述                          |
| ------------ | ------ | ----------------------------- |
| html         | String | 转换后的 HTML 内容            |
| markdown     | String | 转换后的 Markdown 内容        |
| richtext     | Object | Storyblok Richtext 格式的内容 |
| aiMeta       | Object | AI 生成的结构化元数据         |
| firstH1Title | String | 提取的第一个 H1 标题          |
| coverImage   | String | 提取的第一个图片 URL          |

**aiMeta 字段详情**

| 字段名          | 类型   | 描述                         |
| --------------- | ------ | ---------------------------- |
| seo_title       | String | SEO 优化的标题               |
| seo_description | String | SEO 优化的描述（100 字以内） |
| heading_h1      | String | 文章主标题                   |
| slug            | String | URL 友好的 slug              |
| reading_time    | Number | 预计阅读时间（分钟）         |
| language        | String | 语言标识（"en"或"jp"）       |
| cover_alt       | String | 封面图 Alt 文本              |

### 2. 重新生成 AI 结构化数据接口

#### 基本信息

- **路径**: `POST /convert/regenerate`
- **描述**: 使用相同的 AI 提示重新生成结构化元数据
- **版本**: 1.0.0

#### 请求参数

| 参数名   | 类型   | 必需 | 描述                 |
| -------- | ------ | ---- | -------------------- |
| docId    | String | 是   | Google Docs 文档 ID  |
| markdown | String | 是   | 文档的 Markdown 内容 |

#### 请求示例

```bash
curl -X POST http://localhost:3000/convert/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "docId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "markdown": "# 文档标题\n\n文档内容..."
  }'
```

```javascript
const response = await fetch("/convert/regenerate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    docId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    markdown: "# 文档标题\n\n文档内容...",
  }),
});
```

#### 响应格式

**成功响应 (200)**

```json
{
  "aiMeta": {
    "seo_title": "重新生成的SEO标题",
    "seo_description": "重新生成的SEO描述",
    "heading_h1": "重新生成的文章标题",
    "slug": "new-article-slug",
    "reading_time": 6,
    "language": "en",
    "cover_alt": "重新生成的封面图描述"
  },
  "message": "AI结构化数据重新生成成功"
}
```

**错误响应 (400)**

```json
{
  "error": "docId is required"
}
```

**错误响应 (500)**

```json
{
  "error": "重新生成AI结构化数据时出现错误"
}
```

## 实时通知事件

### 文档转换接口事件

| 事件名                    | 描述                 | 数据格式                                |
| ------------------------- | -------------------- | --------------------------------------- |
| googleDocs:fetch:start    | 开始拉取 Google Docs | `{docId, message}`                      |
| googleDocs:fetch:success  | Google Docs 拉取成功 | `{docId, message}`                      |
| ai:analysis:start         | 开始 AI 分析         | `{docId, message}`                      |
| ai:analysis:success       | AI 分析完成          | `{docId, message, aiMeta}`              |
| ai:analysis:error         | AI 分析失败          | `{docId, message, error}`               |
| storyblok:convert:start   | 开始 Storyblok 转换  | `{docId, message}`                      |
| storyblok:convert:success | Storyblok 转换完成   | `{docId, message}`                      |
| image:process:start       | 开始处理图片         | `{docId, imageUrl, message}`            |
| image:process:success     | 图片处理完成         | `{docId, imageUrl, resultUrl, message}` |
| image:process:error       | 图片处理失败         | `{docId, imageUrl, message, error}`     |
| convert:complete          | 转换流程完成         | `{docId, message, summary}`             |
| convert:error             | 转换过程出错         | `{docId, message, error}`               |

### 重新生成接口事件

| 事件名                         | 描述                 | 数据格式                   |
| ------------------------------ | -------------------- | -------------------------- |
| ai:regenerate:analysis:start   | 开始重新生成 AI 分析 | `{docId, message}`         |
| ai:regenerate:analysis:success | 重新生成 AI 分析完成 | `{docId, message, aiMeta}` |
| ai:regenerate:error            | 重新生成过程出错     | `{docId, message, error}`  |

## Socket.io 连接示例

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3000");

// 监听转换进度
socket.on("googleDocs:fetch:start", (data) => {
  console.log("开始拉取Google Docs:", data);
});

socket.on("ai:analysis:success", (data) => {
  console.log("AI分析完成:", data.aiMeta);
});

socket.on("ai:analysis:error", (data) => {
  console.log("AI分析失败:", data.error);
});

socket.on("storyblok:convert:start", (data) => {
  console.log("开始Storyblok转换:", data);
});

socket.on("convert:complete", (data) => {
  console.log("转换完成:", data.summary);
});

// 监听重新生成进度
socket.on("ai:regenerate:analysis:start", (data) => {
  console.log("开始重新生成AI分析:", data);
});

socket.on("ai:regenerate:analysis:success", (data) => {
  console.log("重新生成完成:", data.aiMeta);
});
```

## 错误处理

### 常见错误码

| 状态码 | 错误类型              | 描述           |
| ------ | --------------------- | -------------- |
| 400    | Bad Request           | 请求参数错误   |
| 500    | Internal Server Error | 服务器内部错误 |

### 错误处理示例

```javascript
try {
  const response = await fetch("/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ docId: "invalid-id" }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("API错误:", error.error);
    return;
  }

  const result = await response.json();
  console.log("转换成功:", result);
} catch (error) {
  console.error("网络错误:", error);
}
```

## 注意事项

1. **文档权限**: 确保 Google Docs 文档具有适当的访问权限
2. **图片处理**: 文档中的图片会自动上传到 CDN 并替换 URL
3. **AI 生成**: AI 结构化数据基于文档内容自动生成，可能需要人工审核
4. **AI 容错**: AI 分析失败时不影响整个流程，会使用默认空值继续执行
5. **请求大小**: 支持最大 50MB 的请求，适合大型文档转换
6. **实时通知**: 建议使用 Socket.io 监听转换进度，提供更好的用户体验
7. **错误重试**: 对于网络错误，建议实现重试机制

## 更新日志

### v1.0.0

- 初始版本发布
- 支持 Google Docs 到多种格式的转换
- 支持 AI 结构化数据生成
- 支持实时进度通知
- 支持重新生成 AI 结构化数据
