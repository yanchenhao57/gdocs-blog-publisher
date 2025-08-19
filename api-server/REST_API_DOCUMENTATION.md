# Google Docs 转换 REST API 文档

## 概述

Google Docs 转换 REST API 提供了将 Google Docs 文档转换为多种格式的功能，包括 HTML、Markdown、Storyblok Richtext 格式，并生成 AI 结构化元数据。

**执行顺序优化**：先进行 AI 结构化分析，再进行图片上传，避免 AI 失败时造成资源浪费。

**容错处理**：AI 分析失败时不影响整个流程，使用默认空值继续执行。

## 基础信息

- **基础 URL**: `http://localhost:3000`
- **内容类型**: `application/json`
- **请求大小限制**: 50MB（支持大型文档转换）

## 接口列表

### 1. 文档转换接口

#### 基本信息

- **路径**: `POST /api/convert`
- **描述**: 将 Google Docs 文档转换为多种格式
- **版本**: 1.0.0

#### 请求参数

| 参数名 | 类型   | 必需 | 描述                |
| ------ | ------ | ---- | ------------------- |
| docId  | String | 是   | Google Docs 文档 ID |

#### 请求示例

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"docId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"}'
```

```javascript
const response = await fetch("/api/convert", {
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

**错误响应 (404)**

```json
{
  "error": "{\n  \"error\": {\n    \"code\": 404,\n    \"message\": \"File not found: document-id\",\n    \"errors\": [\n      {\n        \"message\": \"File not found: document-id\",\n        \"domain\": \"global\",\n        \"reason\": \"notFound\",\n        \"location\": \"fileId\",\n        \"locationType\": \"parameter\"\n      }\n    ]\n  }\n}\n"
}
```

**错误响应 (500)**

```json
{
  "error": "详细的错误信息"
}
```

**注意**: 错误响应会返回具体的错误信息，可能包含来自Google API的详细错误描述。

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

- **路径**: `POST /api/convert/regenerate`
- **描述**: 使用相同的 AI 提示重新生成结构化元数据
- **版本**: 1.0.0

#### 请求参数

| 参数名       | 类型   | 必需 | 描述                       |
| ------------ | ------ | ---- | -------------------------- |
| docId        | String | 是   | Google Docs 文档 ID        |
| markdown     | String | 是   | 文档的 Markdown 内容       |
| userLanguage | String | 否   | 用户指定的语言（可选参数） |

#### 请求示例

```bash
curl -X POST http://localhost:3000/api/convert/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "docId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "markdown": "# 文档标题\n\n文档内容...",
    "userLanguage": "en"
  }'
```

```javascript
const response = await fetch("/api/convert/regenerate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    docId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    markdown: "# 文档标题\n\n文档内容...",
    userLanguage: "en",
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

**AI失败时的响应 (200)**

```json
{
  "aiMeta": {
    "seo_title": "",
    "seo_description": "",
    "heading_h1": "",
    "slug": "",
    "reading_time": 1,
    "language": "en",
    "cover_alt": ""
  },
  "message": "AI重新生成失败，使用默认值",
  "error": "具体的错误信息"
}
```

**注意**: 即使AI分析失败，接口仍然返回200状态码和默认的aiMeta结构，确保流程不被中断。

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

**注意**: 500错误通常发生在系统级别错误，如网络问题、服务不可用等。AI分析失败不会触发500错误。

### 3. 发布到 Storyblok 接口

#### 基本信息

- **路径**: `POST /api/publish`
- **描述**: 将转换后的内容发布到 Storyblok CMS
- **版本**: 1.0.0

#### 请求参数

| 参数名                     | 类型    | 必需 | 描述                        |
| -------------------------- | ------- | ---- | --------------------------- |
| seo_title                  | String  | 是   | SEO 标题                    |
| seo_description            | String  | 是   | SEO 描述                    |
| heading_h1                 | String  | 是   | 文章主标题                  |
| slug                       | String  | 是   | URL slug                    |
| body                       | Object  | 是   | Storyblok richtext 内容     |
| coverUrl                   | String  | 否   | 封面图片 URL                |
| coverAlt                   | String  | 否   | 封面图片 Alt 文本           |
| date                       | String  | 否   | 发布日期                    |
| canonical                  | String  | 否   | 规范 URL                    |
| author_id                  | String  | 否   | 作者 ID                     |
| reading_time               | Number  | 是   | 预计阅读时间（分钟）        |
| language                   | String  | 是   | 语言标识                    |
| is_show_newsletter_dialog  | Boolean | 否   | 是否显示新闻订阅对话框      |

#### 请求示例

```javascript
const response = await fetch("/api/publish", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    seo_title: "文章标题",
    seo_description: "文章描述",
    heading_h1: "主标题",
    slug: "article-slug",
    body: { type: "doc", content: [...] },
    reading_time: 5,
    language: "en",
  }),
});
```

#### 响应格式

**成功响应 (200)**

```json
{
  "success": true,
  "slug": "article-slug",
  "spaceId": "159374",
  "storyId": "78910",
  "fullSlug": "blog/en/article-slug"
}
```

**错误响应 (400) - 缺少必填字段**

```json
{
  "error": "slug、正文、SEO描述、标题和SEO标题为必填字段"
}
```

**错误响应 (400) - 无效语言参数**

```json
{
  "error": "无效的语言参数（必须是 en 或 jp）"
}
```

**错误响应 (413) - 请求过大**

如果请求数据超过5MB，服务器会在日志中显示警告，可能导致请求失败。

**错误响应 (500)**

```json
{
  "error": "具体的发布错误信息"
}
```

## 错误处理

### 常见错误码

| 状态码 | 错误类型              | 描述                     |
| ------ | --------------------- | ------------------------ |
| 400    | Bad Request           | 请求参数错误             |
| 404    | Not Found             | 文档未找到或无访问权限   |
| 500    | Internal Server Error | 服务器内部错误           |

### 错误格式

错误响应可能包含嵌套的 JSON 字符串，特别是来自 Google API 的错误：

```json
{
  "error": "{\n  \"error\": {\n    \"code\": 404,\n    \"message\": \"File not found: document-id\"\n  }\n}"
}
```

### 错误处理示例

```javascript
try {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ docId: "invalid-id" }),
  });

  if (!response.ok) {
    const error = await response.json();
    
    // 解析可能的嵌套错误
    let errorMessage = error.error;
    if (typeof errorMessage === 'string') {
      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.error && parsedError.error.message) {
          errorMessage = parsedError.error.message;
        }
      } catch (e) {
        // 使用原始错误消息
      }
    }
    
    console.error("API错误:", errorMessage);
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
6. **错误重试**: 对于网络错误，建议实现重试机制
7. **错误解析**: 注意处理嵌套的错误响应格式

## 更新日志

### v1.0.0

- 初始版本发布
- 支持 Google Docs 到多种格式的转换
- 支持 AI 结构化数据生成
- 支持重新生成 AI 结构化数据
- 支持发布到 Storyblok CMS
