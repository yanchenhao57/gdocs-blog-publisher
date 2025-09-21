# Internal Link Optimizer Store 使用指南

## 概述

我已经将 Internal Link Optimizer 的状态管理重构为基于 Zustand 的 store 模式，这样可以更好地组织和管理应用状态。

## Store 特性

### 🏪 集中化状态管理

- 所有组件状态都集中在一个 store 中
- 支持订阅机制，状态变化自动更新 UI
- 使用 TypeScript 提供完整的类型安全

### 🔄 业务逻辑封装

- 将复杂的业务逻辑从组件中抽离到 store
- 提供语义化的方法名，易于理解和维护
- 支持异步操作（如分析进度模拟）

### ⚡ 性能优化

- 使用选择器函数避免不必要的重渲染
- 支持细粒度的状态订阅
- 批量更新机制

## 使用示例

### 基础使用

```typescript
import { useInternalLinkOptimizerStore } from "../stores/internalLinkOptimizerStore";

function MyComponent() {
  const {
    currentStep,
    blogUrl,
    linkRows,
    setBlogUrl,
    addLinkRow,
    startAnalysis,
  } = useInternalLinkOptimizerStore();

  return (
    <div>
      <input value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)} />
      <button onClick={addLinkRow}>Add Row</button>
      <button onClick={startAnalysis}>Start Analysis</button>
    </div>
  );
}
```

### 使用选择器优化性能

```typescript
import {
  useInternalLinkOptimizerStore,
  selectCurrentStep,
  selectFormData,
} from "../stores/internalLinkOptimizerStore";

// 只订阅当前步骤，避免其他状态变化时重渲染
function StepIndicator() {
  const currentStep = useInternalLinkOptimizerStore(selectCurrentStep);
  return <div>Current Step: {currentStep}</div>;
}

// 只订阅表单数据
function FormComponent() {
  const { blogUrl, linkRows } = useInternalLinkOptimizerStore(selectFormData);
  const setBlogUrl = useInternalLinkOptimizerStore((state) => state.setBlogUrl);

  return (
    <div>
      <input value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)} />
      <div>Links: {linkRows.length}</div>
    </div>
  );
}
```

### 批量粘贴功能

```typescript
function BulkPasteDemo() {
  const { handleBulkPaste } = useInternalLinkOptimizerStore();

  const handlePaste = () => {
    const text = `
https://example.com/page1 | anchor text 1 | anchor text 2
https://example.com/page2 | anchor text 3 | anchor text 4
    `;
    handleBulkPaste(text);
  };

  return <button onClick={handlePaste}>Paste Example Data</button>;
}
```

## Store 结构

### State

```typescript
{
  // 流程控制
  currentStep: 'input' | 'analysis' | 'suggestions' | 'output',
  analysisProgress: number,

  // 表单数据
  blogUrl: string,
  linkRows: LinkRow[],

  // 分析结果
  originalContent: string,
  optimizedContent: string,
  suggestions: Suggestion[],
}
```

### Actions

```typescript
{
  // 基础设置
  setCurrentStep,
    setBlogUrl,
    setLinkRows,
    // 业务逻辑
    etc.startAnalysis,
    handleSuggestionAction,
    acceptAllSuggestions,
    goBackToInput,
    goBackToSuggestions,
    proceedToOutput,
    startOver,
    // LinkRow 操作
    addLinkRow,
    removeLinkRow,
    updateLinkRow,
    addAnchorText,
    updateAnchorText,
    removeAnchorText,
    // 批量操作
    parseBulkText,
    handleBulkPaste;
}
```

## 重构收益

### ✅ 代码组织

- **之前**: 主组件包含 200+ 行状态逻辑
- **现在**: 主组件只有 60+ 行，专注于 UI 渲染

### ✅ 可维护性

- **之前**: 业务逻辑分散在各个组件中
- **现在**: 集中管理，易于测试和修改

### ✅ 类型安全

- **之前**: 手动管理 prop drilling 和类型
- **现在**: TypeScript 自动推导，减少错误

### ✅ 性能优化

- **之前**: 父组件状态变化导致所有子组件重渲染
- **现在**: 精确订阅，只有相关状态变化时才重渲染

## 扩展性

### 添加新功能

```typescript
// 在 store 中添加新的状态和方法
interface InternalLinkOptimizerState {
  // 新增状态
  isLoading: boolean;
  errorMessage: string | null;

  // 新增方法
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

### 持久化存储

```typescript
import { persist } from "zustand/middleware";

export const useInternalLinkOptimizerStore =
  create<InternalLinkOptimizerState>()(
    persist(
      subscribeWithSelector((set, get) => ({
        // store implementation
      })),
      {
        name: "internal-link-optimizer", // 存储键名
        partialize: (state) => ({
          blogUrl: state.blogUrl,
          linkRows: state.linkRows,
        }), // 只持久化部分状态
      }
    )
  );
```

### 中间件集成

```typescript
import { devtools } from "zustand/middleware";

export const useInternalLinkOptimizerStore =
  create<InternalLinkOptimizerState>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        // store implementation
      })),
      { name: "internal-link-optimizer" }
    )
  );
```

## 最佳实践

1. **使用选择器**: 避免订阅整个 store，只订阅需要的部分
2. **方法语义化**: 使用清晰的方法名，如 `startAnalysis` 而不是 `setStep('analysis')`
3. **状态最小化**: 只存储必要的状态，计算属性通过 getter 实现
4. **类型安全**: 充分利用 TypeScript，避免运行时错误
5. **测试友好**: store 是纯函数，易于单元测试

这种重构大大提高了代码的可维护性和可扩展性，为后续功能开发奠定了良好的基础。
