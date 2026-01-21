# SEO Inspector 快速测试指南

## 🚀 快速启动

### 1. 启动后端（Terminal 1）

```bash
cd /Users/johnnyyan/workspaces/code/gdocs-demo
npm run start
```

等待看到：
```
🚀 API server running at http://localhost:3000
🔌 Socket.io server ready
```

### 2. 启动前端（Terminal 2）

```bash
cd /Users/johnnyyan/workspaces/code/gdocs-demo/frontend
pnpm dev
```

等待看到：
```
▲ Next.js 15.4.4 (Turbopack)
- Local:        http://localhost:3001
✓ Ready in 761ms
```

### 3. 打开浏览器测试

访问：`http://localhost:3001/seo-inspector`

## 📋 测试用例

### 测试 1: 静态网站（预期：LOW risk）

**URL:** `https://example.com`

**预期结果：**
- ✅ HTTP Status: 200
- ✅ Risk Level: 🟢 LOW
- ✅ Content Coverage: ~100%
- ✅ Title: Found (html)
- ✅ H1: Found (html)

### 测试 2: Wikipedia（预期：LOW risk）

**URL:** `https://en.wikipedia.org/wiki/Search_engine_optimization`

**预期结果：**
- ✅ HTTP Status: 200
- ✅ Risk Level: 🟢 LOW
- ✅ Content Coverage: >80%
- ✅ 所有 SEO 元素都存在

### 测试 3: Google（预期：MEDIUM/HIGH risk）

**URL:** `https://www.google.com`

**预期结果：**
- ✅ HTTP Status: 200
- ⚠️ Risk Level: 🟡 MEDIUM 或 🔴 HIGH
- ⚠️ Content Coverage: 可能较低
- ✅ Title: Found

### 测试 4: 无效 URL（预期：错误）

**URL:** `not-a-valid-url`

**预期结果：**
- ❌ Toast 错误提示："Invalid URL"
- ❌ 停留在输入页面

### 测试 5: 不存在的域名（预期：错误）

**URL:** `https://this-domain-does-not-exist-12345.com`

**预期结果：**
- ❌ Toast 错误提示："Failed to fetch URL"
- ❌ 显示网络错误信息

## 🎯 测试检查清单

### 输入页面
- [ ] 页面标题居中显示
- [ ] Menu 按钮不遮挡标题
- [ ] URL 输入框正常工作
- [ ] "Audit Page" 按钮可点击
- [ ] 输入无效 URL 显示浏览器验证提示

### 加载页面
- [ ] 显示 3 个旋转的圆环动画
- [ ] 显示 "Analyzing Page..." 标题
- [ ] 显示正在分析的 URL
- [ ] 显示 4 个分析步骤（渐入动画）
- [ ] 步骤图标有蓝色背景

### 结果页面
- [ ] 顶部导航栏不被 Menu 遮挡
- [ ] 显示风险等级横幅（红/黄/绿）
- [ ] 显示 4 个信息卡片（URL, Status, Robots, Coverage）
- [ ] 显示 HTML 对比视图（左右分栏）
- [ ] 显示 SEO 元素可见性表格
- [ ] 显示技术说明和建议（深色/浅色卡片）
- [ ] "Analyze another URL" 按钮可返回输入页面
- [ ] "Export Report" 按钮显示提示

### Toast 通知
- [ ] 分析成功显示绿色 toast："Analysis Complete"
- [ ] 分析失败显示红色 toast："Analysis Failed"
- [ ] Toast 自动消失（3-5秒）

### Menu 导航
- [ ] 点击 Menu 按钮展开菜单
- [ ] 菜单显示 5 个选项（包括 SEO Content Inspector）
- [ ] 点击 "SEO Content Inspector" 可导航到工具
- [ ] 菜单高度足够显示所有选项（312px）

## 🐛 常见问题排查

### 问题 1: 前端无法连接后端

**症状：** Toast 显示 "Failed to analyze URL"

**检查：**
```bash
# 1. 检查后端是否运行
curl http://localhost:3000/api/analyze/health

# 预期响应：
# {"status":"ok","service":"analyze","timestamp":"..."}

# 2. 检查前端环境变量
# frontend/.env.local 应该有：
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 问题 2: 加载页面一直转圈

**症状：** 加载动画不停止

**检查：**
```bash
# 1. 打开浏览器控制台查看错误
# 2. 检查后端日志是否有错误
# 3. 测试 API 是否正常响应：
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 问题 3: 结果页面显示不正常

**症状：** 数据缺失或格式错误

**检查：**
```bash
# 1. 打开浏览器控制台
# 2. 查找 "[SEO Inspector]" 日志
# 3. 检查 auditResult 数据结构
# 4. 确认后端响应格式正确
```

## 📊 性能基准

**预期响应时间：**
- 静态网站（example.com）: ~200-500ms
- 动态网站（Wikipedia）: ~500-1500ms
- 复杂 SPA: ~1000-3000ms

**如果超过 5 秒：**
- 检查网络连接
- 检查目标网站是否可访问
- 查看后端日志中的错误

## 🎉 成功标准

测试通过条件：
- ✅ 所有 5 个测试用例都按预期工作
- ✅ 没有控制台错误
- ✅ Toast 通知正常显示
- ✅ 页面布局正常（无遮挡）
- ✅ 加载动画流畅
- ✅ 数据正确显示

## 📞 需要帮助？

查看详细文档：
- [集成总结](./INTEGRATION_SUMMARY.md)
- [API 文档](./api-server/ANALYZE_API_DOCUMENTATION.md)
- [API 实现](./api-server/README_ANALYZE.md)

或运行测试脚本：
```bash
node api-server/test-analyze.js https://example.com
```

