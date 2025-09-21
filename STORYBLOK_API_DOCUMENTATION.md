# Storyblok API 接口文档

本文档描述了根据 `full_slug` 获取 Storyblok 数据的 API 接口。

## 基础信息

- **基础URL**: `http://localhost:3000/api/storyblok`
- **认证**: 使用环境变量中配置的 `STORYBLOK_CDN_API_TOKEN`
- **数据格式**: JSON

## 接口列表

### 1. 获取单个 Story

根据 `full_slug` 获取单个 Storyblok story 数据。

**接口地址**
```
GET /api/storyblok/story/{full_slug}
```

**路径参数**
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| full_slug | string | 是 | Storyblok story 的完整 slug 路径 |

**请求示例**
```bash
curl -X GET "http://localhost:3000/api/storyblok/story/blog/en/my-blog-post"
```

**成功响应 (200)**
```json
{
  "success": true,
  "data": {
    "story": {
      "id": 123456,
      "name": "My Blog Post",
      "slug": "my-blog-post",
      "full_slug": "blog/en/my-blog-post",
      "content": {
        "component": "blog_en",
        "title": "My Blog Post Title",
        "description": "Blog post description",
        "body": [
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Blog content here..."
              }
            ]
          }
        ]
      },
      "created_at": "2024-01-01T00:00:00.000Z",
      "published_at": "2024-01-01T00:00:00.000Z",
      "uuid": "abc123-def456-ghi789"
    }
  }
}
```

**错误响应**

**400 Bad Request** - 缺少必需参数
```json
{
  "success": false,
  "error": "full_slug 参数是必需的"
}
```

**404 Not Found** - 未找到对应的 story
```json
{
  "success": false,
  "error": "未找到 full_slug 为 \"blog/en/non-existent\" 的 story"
}
```

**500 Internal Server Error** - 服务器内部错误
```json
{
  "success": false,
  "error": "获取 Storyblok 数据失败",
  "details": "具体错误信息"
}
```

### 2. 批量获取 Stories

一次性获取多个 Storyblok stories 数据。

**接口地址**
```
POST /api/storyblok/stories
```

**请求体参数**
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| full_slugs | string[] | 是 | Storyblok stories 的完整 slug 路径数组（最多50个） |

**请求示例**
```bash
curl -X POST "http://localhost:3000/api/storyblok/stories" \
  -H "Content-Type: application/json" \
  -d '{
    "full_slugs": [
      "blog/en/post-1",
      "blog/en/post-2",
      "blog/en/post-3"
    ]
  }'
```

**成功响应 (200)**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "success_count": 2,
    "failed_count": 1,
    "stories": [
      {
        "id": 123456,
        "name": "Post 1",
        "slug": "post-1",
        "full_slug": "blog/en/post-1",
        "content": { /* story content */ }
      },
      {
        "id": 123457,
        "name": "Post 2",
        "slug": "post-2",
        "full_slug": "blog/en/post-2",
        "content": { /* story content */ }
      }
    ],
    "failed": [
      {
        "full_slug": "blog/en/post-3",
        "error": "未找到对应的 story"
      }
    ]
  }
}
```

**错误响应**

**400 Bad Request** - 参数验证失败
```json
{
  "success": false,
  "error": "full_slugs 必须是一个非空数组"
}
```

```json
{
  "success": false,
  "error": "一次最多可查询 50 个 story"
}
```

### 3. 健康检查

检查 Storyblok API 服务状态。

**接口地址**
```
GET /api/storyblok/health
```

**请求示例**
```bash
curl -X GET "http://localhost:3000/api/storyblok/health"
```

**成功响应 (200)**
```json
{
  "success": true,
  "message": "Storyblok API 服务正常",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 使用示例

### JavaScript/TypeScript

```typescript
// 获取单个 story
async function getStory(fullSlug: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/storyblok/story/${fullSlug}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Story data:', data.data.story);
      return data.data.story;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// 批量获取 stories
async function getStories(fullSlugs: string[]) {
  try {
    const response = await fetch('http://localhost:3000/api/storyblok/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ full_slugs: fullSlugs }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Stories:', data.data.stories);
      console.log('Failed:', data.data.failed);
      return data.data;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// 使用示例
const story = await getStory('blog/en/my-article');
const stories = await getStories(['blog/en/post-1', 'blog/en/post-2']);
```

### React Hook

```typescript
import { useState, useEffect } from 'react';

interface StoryblokStory {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: any;
  created_at: string;
  published_at: string;
  uuid: string;
}

function useStoryblokStory(fullSlug: string) {
  const [story, setStory] = useState<StoryblokStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fullSlug) return;

    async function fetchStory() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/api/storyblok/story/${fullSlug}`);
        const data = await response.json();

        if (data.success) {
          setStory(data.data.story);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    }

    fetchStory();
  }, [fullSlug]);

  return { story, loading, error };
}

// 使用示例
function BlogPost({ slug }: { slug: string }) {
  const { story, loading, error } = useStoryblokStory(`blog/en/${slug}`);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!story) return <div>未找到文章</div>;

  return (
    <article>
      <h1>{story.content.title}</h1>
      <div>{/* 渲染 story.content.body */}</div>
    </article>
  );
}
```

## 环境配置

确保在 `.env` 文件中配置了以下环境变量：

```env
STORYBLOK_CDN_API_TOKEN=your_storyblok_cdn_token_here
```

## 注意事项

1. **API 限制**: 批量接口一次最多支持 50 个 full_slug
2. **错误处理**: 所有接口都会返回统一的错误格式，请注意处理
3. **缓存**: CDN API 自带缓存机制，数据更新可能有延迟
4. **版本**: 默认获取 draft 版本的数据
5. **性能**: 批量接口使用并发请求，性能较好

## 更新日志

- **v1.0.0** (2024-01-01): 初始版本，支持单个和批量获取 Storyblok 数据
