# SEO Analyze API - Implementation Summary

## ✅ 已完成实现

### 核心功能

1. **HTML 抓取** (`services/fetchHtml.js`)
   - 使用 Googlebot User-Agent
   - 记录 HTTP 状态码、响应大小、相关 SEO 头部
   - 30秒超时设置

2. **文本提取** (`services/extractText.js`)
   - 移除 script、style、noscript 标签
   - 清理 HTML 标签和实体
   - 统计文本长度和段落数量
   - 生成预览文本（前200字符）

3. **SEO 信号分析** (`services/seoInspector.js`)
   - 检测 title、meta description、H1、canonical、hreflang
   - 判断元素来源（HTML vs 渲染后）
   - 计算内容覆盖率
   - 风险等级诊断（HIGH/MEDIUM/LOW）

4. **API 路由** (`routes/analyze.js`)
   - POST /api/analyze - 主分析端点
   - GET /api/analyze/health - 健康检查
   - 完整的错误处理
   - 详细的日志输出

### 风险诊断逻辑

| 风险等级 | 条件 |
|---------|------|
| 🔴 HIGH | • HTML文本 < 300字符 且 渲染文本 > 1000字符<br>• 缺少 title 标签 |
| 🟡 MEDIUM | • 内容覆盖率 < 30%<br>• 内容覆盖率 30-50% |
| 🟢 LOW | • 内容覆盖率 >= 50% |

### 代码结构

```
api-server/
├── routes/
│   └── analyze.js                    # API 路由处理
├── services/
│   ├── fetchHtml.js                  # HTML 抓取
│   ├── extractText.js                # 文本提取
│   ├── renderWithPlaywright.js       # 浏览器渲染（已预留）
│   └── seoInspector.js               # SEO 分析与诊断
├── types/
│   └── analyze.js                    # 类型定义（JSDoc）
├── test-analyze.js                   # 测试脚本
├── ANALYZE_API_DOCUMENTATION.md      # 完整 API 文档
└── README_ANALYZE.md                 # 本文件
```

## 🔧 使用方法

### 启动服务器

```bash
npm run start
# 或
npm run start:dev
```

服务器将在 `http://localhost:3000` 启动

### 测试 API

#### 方法 1: 使用测试脚本

```bash
# 测试默认 URL (example.com)
node api-server/test-analyze.js

# 测试自定义 URL
node api-server/test-analyze.js https://www.google.com

# 显示完整 JSON 响应
node api-server/test-analyze.js https://www.google.com --full
```

#### 方法 2: 使用 cURL

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com"}'
```

#### 方法 3: 使用 JavaScript

```javascript
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://www.example.com' })
});

const data = await response.json();
console.log('Risk Level:', data.diagnosis.riskLevel);
console.log('Coverage:', data.metrics.contentCoverage);
```

## 📊 响应示例

```json
{
  "url": "https://www.example.com",
  "fetch": {
    "status": 200,
    "htmlSize": 1256,
    "headers": {
      "content-type": "text/html; charset=UTF-8"
    }
  },
  "htmlContent": {
    "textLength": 245,
    "paragraphCount": 3,
    "previewText": "Example Domain This domain is for use...",
    "fullText": "Example Domain This domain is for use in..."
  },
  "renderedContent": {
    "enabled": false,
    "textLength": 0,
    "paragraphCount": 0,
    "previewText": "",
    "fullText": "(Playwright rendering not yet enabled)"
  },
  "metrics": {
    "contentCoverage": 1.0
  },
  "seoSignals": {
    "title": { "exists": true, "source": "html" },
    "metaDescription": { "exists": false, "source": null },
    "h1": { "exists": true, "source": "html" },
    "canonical": { "exists": false },
    "hreflangCount": 0
  },
  "diagnosis": {
    "riskLevel": "LOW",
    "issues": ["MISSING_META_DESCRIPTION"],
    "summary": "Good content coverage in initial HTML...",
    "recommendation": "Current implementation is SEO-friendly..."
  }
}
```

## ⏳ 待实现功能

### Playwright 渲染集成

当前 `renderWithPlaywright.js` 返回 mock 数据。要启用真实渲染：

1. 安装 Playwright:
```bash
npm install playwright
```

2. 取消 `renderWithPlaywright.js` 中的注释代码

3. 更新 `enabled` 标志为 `true`

### 建议的增强功能

- [ ] 缓存机制（避免重复分析同一 URL）
- [ ] 速率限制
- [ ] 截图功能
- [ ] JavaScript 错误检测
- [ ] 性能指标（LCP, FID, CLS）
- [ ] 批量分析支持
- [ ] 数据持久化（可选）

## 🎯 与前端集成

前端可以调用这个 API 来替换 mock 数据：

```typescript
// 在 SeoInspectorClient.tsx 中
const handleStartAudit = async (url: string) => {
  setCurrentUrl(url);
  setStep('results');
  setLoading(true);
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    setAuditResult(data); // 更新状态
  } catch (error) {
    console.error('Analysis failed:', error);
  } finally {
    setLoading(false);
  }
};
```

## 🧪 测试场景

### 测试 SSR 良好的网站
```bash
node api-server/test-analyze.js https://www.wikipedia.org
# 预期: LOW risk, 高内容覆盖率
```

### 测试 SPA 应用
```bash
node api-server/test-analyze.js https://react-app-example.com
# 预期: HIGH risk, 低内容覆盖率（除非使用 SSR）
```

### 测试静态网站
```bash
node api-server/test-analyze.js https://example.com
# 预期: LOW risk, 内容覆盖率接近 100%
```

## 📚 相关文档

- [完整 API 文档](./ANALYZE_API_DOCUMENTATION.md)
- [服务器配置](./server.js)
- [测试脚本](./test-analyze.js)

## 🔍 调试

启用详细日志：
```bash
DEBUG=* npm run start
```

查看请求日志（在服务器控制台）：
```
[Analyze] Starting analysis for: https://example.com
[Analyze] Fetched 1256 bytes (HTTP 200)
[Analyze] Extracted 245 characters from HTML
[Analyze] Rendered content: disabled
[Analyze] SEO signals analyzed
[Analyze] Completed in 234ms - Risk: LOW
```

## 📝 注意事项

1. **超时设置**: 默认 30 秒，可在 `fetchHtml.js` 中调整
2. **User-Agent**: 使用真实的 Googlebot UA
3. **无状态**: 每次请求都是独立的，不存储历史记录
4. **错误处理**: 所有错误都会返回诊断信息
5. **Playwright**: 当前未启用，需要手动集成

## 🚀 部署建议

生产环境考虑：
- 添加请求验证和清理
- 实施速率限制
- 添加监控和警报
- 使用进程管理器（PM2）
- 配置反向代理（Nginx）
- 启用 HTTPS

