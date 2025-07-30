# Google Docs转换API文档

## 概述

Google Docs转换API提供了将Google Docs文档转换为多种格式的功能，包括HTML、Markdown、Storyblok Richtext格式，并生成AI结构化元数据。

## 基础信息

- **基础URL**: `http://localhost:3000`
- **内容类型**: `application/json`
- **实时通知**: 支持Socket.io实时通知

## 接口列表

### 1. 文档转换接口

#### 基本信息
- **路径**: `POST /convert`
- **描述**: 将Google Docs文档转换为多种格式
- **版本**: 1.0.0

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| docId | String | 是 | Google Docs文档ID |

#### 请求示例

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"docId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"}'
```

```javascript
const response = await fetch('/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    docId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
  })
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

| 字段名 | 类型 | 描述 |
|--------|------|------|
| html | String | 转换后的HTML内容 |
| markdown | String | 转换后的Markdown内容 |
| richtext | Object | Storyblok Richtext格式的内容 |
| aiMeta | Object | AI生成的结构化元数据 |
| firstH1Title | String | 提取的第一个H1标题 |
| coverImage | String | 提取的第一个图片URL |

**aiMeta字段详情**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| seo_title | String | SEO优化的标题 |
| seo_description | String | SEO优化的描述（100字以内） |
| heading_h1 | String | 文章主标题 |
| slug | String | URL友好的slug |
| reading_time | Number | 预计阅读时间（分钟） |
| language | String | 语言标识（"en"或"jp"） |
| cover_alt | String | 封面图Alt文本 |

### 2. 重新生成AI结构化数据接口

#### 基本信息
- **路径**: `POST /convert/regenerate`
- **描述**: 使用相同的AI提示重新生成结构化元数据
- **版本**: 1.0.0

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| docId | String | 是 | Google Docs文档ID |
| markdown | String | 是 | 文档的Markdown内容 |

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
const response = await fetch('/convert/regenerate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    docId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    markdown: '# 文档标题\n\n文档内容...'
  })
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

| 事件名 | 描述 | 数据格式 |
|--------|------|----------|
| googleDocs:fetch:start | 开始拉取Google Docs | `{docId, message}` |
| googleDocs:fetch:success | Google Docs拉取成功 | `{docId, message}` |
| storyblok:convert:start | 开始Storyblok转换 | `{docId, message}` |
| storyblok:convert:success | Storyblok转换完成 | `{docId, message}` |
| ai:analysis:start | 开始AI分析 | `{docId, message}` |
| ai:analysis:success | AI分析完成 | `{docId, message, aiMeta}` |
| image:process:start | 开始处理图片 | `{docId, imageUrl, message}` |
| image:process:success | 图片处理完成 | `{docId, imageUrl, resultUrl, message}` |
| image:process:error | 图片处理失败 | `{docId, imageUrl, message, error}` |
| convert:complete | 转换流程完成 | `{docId, message, summary}` |
| convert:error | 转换过程出错 | `{docId, message, error}` |

### 重新生成接口事件

| 事件名 | 描述 | 数据格式 |
|--------|------|----------|
| ai:regenerate:analysis:start | 开始重新生成AI分析 | `{docId, message}` |
| ai:regenerate:analysis:success | 重新生成AI分析完成 | `{docId, message, aiMeta}` |
| ai:regenerate:error | 重新生成过程出错 | `{docId, message, error}` |

## Socket.io连接示例

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// 监听转换进度
socket.on('googleDocs:fetch:start', (data) => {
  console.log('开始拉取Google Docs:', data);
});

socket.on('ai:analysis:success', (data) => {
  console.log('AI分析完成:', data.aiMeta);
});

socket.on('convert:complete', (data) => {
  console.log('转换完成:', data.summary);
});

// 监听重新生成进度
socket.on('ai:regenerate:analysis:start', (data) => {
  console.log('开始重新生成AI分析:', data);
});

socket.on('ai:regenerate:analysis:success', (data) => {
  console.log('重新生成完成:', data.aiMeta);
});
```

## 错误处理

### 常见错误码

| 状态码 | 错误类型 | 描述 |
|--------|----------|------|
| 400 | Bad Request | 请求参数错误 |
| 500 | Internal Server Error | 服务器内部错误 |

### 错误处理示例

```javascript
try {
  const response = await fetch('/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ docId: 'invalid-id' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API错误:', error.error);
    return;
  }
  
  const result = await response.json();
  console.log('转换成功:', result);
} catch (error) {
  console.error('网络错误:', error);
}
```

## 注意事项

1. **文档权限**: 确保Google Docs文档具有适当的访问权限
2. **图片处理**: 文档中的图片会自动上传到CDN并替换URL
3. **AI生成**: AI结构化数据基于文档内容自动生成，可能需要人工审核
4. **实时通知**: 建议使用Socket.io监听转换进度，提供更好的用户体验
5. **错误重试**: 对于网络错误，建议实现重试机制

## 更新日志

### v1.0.0
- 初始版本发布
- 支持Google Docs到多种格式的转换
- 支持AI结构化数据生成
- 支持实时进度通知
- 支持重新生成AI结构化数据 