# 代码重构说明

## 重构概述

本次重构将 `api-server/routes/convert.js` 文件中的复杂逻辑提取到了多个专门的工具函数中，提高了代码的可维护性、可读性和可复用性。

## 新增的工具文件

### 1. `utils/documentContentExtractor.js`
专门处理文档内容的提取和处理逻辑：

- **`extractTextFromNode(node)`**: 递归提取节点中的纯文本
- **`extractAndRemoveFirstH1(content)`**: 提取并移除第一个H1标题
- **`extractFirstImageSrc(content)`**: 提取第一个图片的src作为封面图
- **`createImageUploaderWithNotifications(io, docId)`**: 创建带Socket通知的图片上传器
- **`processDocumentResult(richtext)`**: 处理文档转换结果，提取关键信息

### 2. `utils/documentConversionPipeline.js`
管理整个文档转换流程：

- **`executeDocumentConversion(docId, io)`**: 执行完整的文档转换流程
  - Google Docs → HTML
  - HTML → Markdown
  - AI结构化分析
  - Google Docs → Richtext（包含图片上传）
  - 处理转换结果
  - 发送完成通知

### 3. `utils/aiRegenerationHandler.js`
专门处理AI结构化数据的重新生成：

- **`handleAiRegeneration(docId, markdown, userLanguage, io)`**: 处理AI重新生成请求，包含错误处理和默认值回退

## 重构后的好处

### 1. **代码结构更清晰**
- 每个工具文件都有明确的职责
- 主路由文件变得简洁易读
- 逻辑分层更清晰

### 2. **可维护性提升**
- 单个功能修改时只需要修改对应的工具文件
- 减少了代码重复
- 更容易进行单元测试

### 3. **可复用性增强**
- 工具函数可以在其他路由或模块中复用
- 便于扩展新功能
- 代码模块化程度更高

### 4. **错误处理更统一**
- 每个工具函数都有统一的错误处理模式
- Socket通知逻辑集中管理
- 错误信息更一致

## 重构后的文件结构

```
utils/
├── documentContentExtractor.js    # 文档内容提取工具
├── documentConversionPipeline.js  # 文档转换流程管理
├── aiRegenerationHandler.js      # AI重新生成处理
└── ... (其他现有工具文件)

api-server/routes/
└── convert.js                     # 重构后的路由文件（更简洁）
```

## 使用方式

重构后的代码使用方式保持不变，API接口的行为完全一致，但内部实现更加模块化和可维护。

## 注意事项

1. 确保所有工具文件都正确导入了依赖
2. 工具函数之间的调用关系清晰明确
3. 错误处理和Socket通知保持一致
4. 新添加的工具函数都有完整的JSDoc注释 