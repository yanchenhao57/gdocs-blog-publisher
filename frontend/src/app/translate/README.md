# Storyblok 多语言翻译工具

这是一个用于将 Storyblok 页面翻译为多语言版本并上传的工具页面。

## 📁 项目结构

```
translate/
├── page.tsx                          # 主页面，状态管理
├── components/
│   └── TranslateInitialForm.tsx      # 初始表单组件
└── README.md                         # 本文档
```

## 🎯 当前实现状态

### ✅ 已完成功能

1. **多选下拉框组件 (MultiSelectDropdown)**
   - 位置: `/frontend/src/components/multi-select-dropdown/`
   - 功能: 支持多选、标签显示、搜索过滤
   - 特性: 智能定位、响应式设计、深色模式支持

2. **语言配置常量**
   - 位置: `/frontend/src/constants/languages.ts`
   - 包含常用语言选项（可扩展）

3. **初始表单组件 (TranslateInitialForm)**
   - Storyblok 页面链接输入（带验证）
   - 目标语言多选下拉框
   - 表单验证和错误提示
   - 提交按钮

4. **页面状态管理**
   - 工作流状态枚举 (TranslateWorkflowStage)
   - 当前仅实现 INITIAL_FORM 状态
   - 状态驱动的组件渲染

## 🚧 待实现功能 (TODO)

### 1. 翻译处理逻辑
```typescript
// TODO: 实现实际的翻译处理逻辑
// 1. 调用 API 开始翻译任务
// 2. 切换到 PROCESSING 状态显示进度
// 3. 使用 Socket 监听翻译进度事件
// 4. 翻译完成后切换到 REVIEW 状态
// 5. 确认后上传，切换到 RESULT 状态
```

### 2. 处理中状态 (PROCESSING)
- 显示翻译进度条
- 实时更新翻译状态
- Socket 事件监听
- 支持取消操作

### 3. 审核状态 (REVIEW)
- 预览翻译结果
- 对比原文和译文
- 编辑修改翻译内容
- 确认上传按钮

### 4. 结果状态 (RESULT)
- 显示上传成功/失败结果
- 展示已翻译的语言列表
- 提供返回初始页面的选项
- 错误信息和重试机制

### 5. 其他功能
- Socket 实时通信集成
- 错误处理与重试机制
- 批量翻译支持
- 翻译历史记录
- 进度保存和恢复

## 🎨 设计特点

- **一致的设计风格**: 复用项目现有组件和样式
- **响应式布局**: 适配各种屏幕尺寸
- **友好的用户体验**: 清晰的表单验证和错误提示
- **状态驱动**: 清晰的工作流状态管理

## 📦 使用的组件

- `Input` - 输入框组件
- `FormItem` - 表单项包装组件
- `Button` - 按钮组件
- `MultiSelectDropdown` - 多选下拉框组件（新建）

## 🔧 如何使用

1. 访问 `/translate` 路由
2. 输入 Storyblok 页面链接
3. 选择要翻译的目标语言
4. 点击"开始翻译"按钮

当前点击提交会显示一个 alert 对话框，实际翻译功能需要后续实现。

## 🔄 工作流状态

```typescript
enum TranslateWorkflowStage {
  INITIAL_FORM = 'initial_form',    // ✅ 已实现
  // PROCESSING = 'processing',      // ⏳ 待实现
  // REVIEW = 'review',               // ⏳ 待实现
  // RESULT = 'result',               // ⏳ 待实现
}
```

## 📝 表单验证规则

### Storyblok 链接
- 必填
- 必须是有效的 URL 格式
- 必须包含 "storyblok.com"

### 目标语言
- 至少选择一种语言
- 支持多选

## 🎯 后续开发建议

1. **优先级高**
   - 实现翻译 API 调用
   - 添加 PROCESSING 状态和进度显示
   - 集成 Socket 实时通信

2. **优先级中**
   - 实现 REVIEW 状态和内容预览
   - 添加翻译内容编辑功能
   - 实现 RESULT 状态和结果展示

3. **优先级低**
   - 添加翻译历史记录
   - 支持批量翻译
   - 优化性能和用户体验

## 🐛 已知问题

暂无

## 📅 更新日志

- **2025-11-05**: 初始版本，实现基础表单和状态管理

## 👨‍💻 开发者注意事项

1. 所有 TODO 项已在代码中标注
2. 状态管理遵循与主页面相同的模式
3. 样式保持与项目整体风格一致
4. 新增的 MultiSelectDropdown 组件可复用于其他页面

