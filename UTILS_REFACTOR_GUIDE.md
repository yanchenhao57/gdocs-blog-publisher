# Utils 重构指南

## 🎯 重构目标

将 Internal Link Optimizer store 中的工具属性函数提取到专门的 utils 文件中，以提高代码的可维护性、可测试性和可复用性。

## 📁 文件组织

### 1. `utils/storyblokUtils.ts` - Storyblok 相关工具

专门处理 Storyblok 数据的工具函数：

```typescript
// URL 和 slug 处理
- extractFullSlugFromUrl(url: string): string | null
- isValidUrl(url: string): boolean
- extractDomainFromUrl(url: string): string | null
- isSameDomain(url1: string, url2: string): boolean
- normalizeSlug(slug: string): string

// 内容提取和处理
- extractContentFromStory(storyData: any): string
- extractTextFromRichtext(richtext: any[]): string

// 建议生成
- generateLinkSuggestions(linkRows: LinkRow[], originalContent?: string): Suggestion[]
- generateOptimizedContent(originalContent: string, suggestions: Suggestion[]): string

// 正则表达式工具
- escapeRegExp(string: string): string
```

### 2. `utils/analysisUtils.ts` - 分析工具

专门用于内容分析和质量评估：

```typescript
// 内容分析
- analyzeKeywordDensity(text: string, keywords: string[]): Record<string, number>
- analyzeReadability(text: string): ReadabilityMetrics
- findAnchorTextPositions(text: string, anchorText: string): number[]
- calculateTextSimilarity(text1: string, text2: string): number

// 链接分析
- detectExistingLinks(content: string): ExistingLink[]
- evaluateSuggestionQuality(suggestion: Suggestion, content: string): number

// 报告生成
- generateOptimizationReport(originalContent: string, suggestions: Suggestion[], linkRows: LinkRow[]): OptimizationReport
```

### 3. `utils/bulkPasteUtils.ts` - 批量粘贴工具

专门处理批量粘贴功能：

```typescript
// 解析和验证
- parseBulkText(text: string): LinkRow[]
- validateBulkPasteFormat(text: string): ValidationResult
- preprocessBulkText(text: string): string

// 格式转换
- linkRowsToBulkText(linkRows: LinkRow[]): string
- generateBulkPasteExample(): string

// 重复检测
- detectDuplicates(text: string): DuplicateInfo
```

## 🔄 重构前后对比

### 重构前 (Store 中包含工具函数)
```typescript
// store 文件 450+ 行，包含：
- 业务逻辑
- UI 状态管理  
- 工具函数 (URL解析、内容提取、文本解析等)
- 数据处理逻辑

// 问题：
- 单一文件过大，难以维护
- 工具函数无法复用
- 测试困难
- 职责不清晰
```

### 重构后 (职责分离)
```typescript
// internalLinkOptimizerStore.ts (~300 行)
- 纯粹的状态管理
- 业务逻辑协调
- UI 交互处理

// utils/storyblokUtils.ts (~200 行)
- Storyblok 数据处理
- URL 和 slug 工具
- 内容提取逻辑

// utils/analysisUtils.ts (~250 行)  
- 内容分析算法
- 质量评估工具
- 报告生成逻辑

// utils/bulkPasteUtils.ts (~200 行)
- 批量粘贴解析
- 格式验证
- 数据转换工具
```

## ✅ 重构收益

### 1. **代码组织改善**
- **职责分离**: 每个文件有明确的职责
- **文件大小**: 单文件从 450+ 行降到 200-300 行
- **查找效率**: 功能按类型分组，易于定位

### 2. **可维护性提升**
- **模块化**: 工具函数独立，易于修改
- **版本控制**: 变更影响范围更小
- **代码审查**: 更容易 review 特定功能

### 3. **可测试性增强**
```typescript
// 重构前：测试需要 mock 整个 store
const store = createMockStore();
const result = store.parseBulkText(testData);

// 重构后：直接测试纯函数
import { parseBulkText } from '../utils/bulkPasteUtils';
const result = parseBulkText(testData);
```

### 4. **可复用性提高**
```typescript
// 其他组件也可以使用相同的工具函数
import { extractFullSlugFromUrl } from '../utils/storyblokUtils';
import { validateBulkPasteFormat } from '../utils/bulkPasteUtils';

// 在不同的上下文中复用
const slug = extractFullSlugFromUrl(userInput);
const validation = validateBulkPasteFormat(pastedText);
```

### 5. **性能优化潜力**
```typescript
// 工具函数可以独立优化和缓存
const memoizedExtractor = useMemo(() => 
  extractContentFromStory(storyData), [storyData]
);

// 可以单独进行性能分析
console.time('URL extraction');
const slug = extractFullSlugFromUrl(url);
console.timeEnd('URL extraction');
```

## 🚀 使用示例

### Store 中使用工具函数
```typescript
// 重构后的 store 使用
import { parseBulkText } from '../utils/bulkPasteUtils';
import { generateLinkSuggestions } from '../utils/storyblokUtils';

// 在 store action 中使用
handleBulkPaste: (text: string) => {
  const parsedRows = parseBulkText(text); // 来自 utils
  // ... 业务逻辑
},

startAnalysis: async () => {
  const suggestions = generateLinkSuggestions(linkRows, content); // 来自 utils
  // ... 业务逻辑
}
```

### 组件中直接使用工具函数
```typescript
import { validateBulkPasteFormat } from '../utils/bulkPasteUtils';
import { isValidUrl } from '../utils/storyblokUtils';

function BulkPasteComponent() {
  const [text, setText] = useState('');
  const [validation, setValidation] = useState(null);

  const handleTextChange = (newText: string) => {
    setText(newText);
    const result = validateBulkPasteFormat(newText);
    setValidation(result);
  };

  // ...
}
```

## 🧪 测试策略

### 单元测试示例
```typescript
// utils/storyblokUtils.test.ts
describe('extractFullSlugFromUrl', () => {
  it('should extract slug from standard URL', () => {
    expect(extractFullSlugFromUrl('https://blog.com/posts/my-article'))
      .toBe('posts/my-article');
  });

  it('should handle trailing slashes', () => {
    expect(extractFullSlugFromUrl('https://blog.com/posts/my-article/'))
      .toBe('posts/my-article');
  });
});

// utils/bulkPasteUtils.test.ts  
describe('parseBulkText', () => {
  it('should parse valid bulk text format', () => {
    const input = 'https://example.com/page | anchor 1 | anchor 2';
    const result = parseBulkText(input);
    expect(result).toHaveLength(1);
    expect(result[0].anchorTexts).toEqual(['anchor 1', 'anchor 2']);
  });
});
```

## 📚 最佳实践

### 1. **函数设计原则**
- **纯函数**: 无副作用，相同输入产生相同输出
- **单一职责**: 每个函数只做一件事
- **参数验证**: 对输入进行适当的验证
- **错误处理**: 优雅地处理异常情况

### 2. **命名约定**
- **动词开头**: `extract`, `generate`, `validate`, `analyze`
- **清晰描述**: 函数名准确描述功能
- **一致性**: 相似功能使用相似的命名模式

### 3. **文档和类型**
- **JSDoc 注释**: 描述参数、返回值和用途
- **TypeScript 类型**: 完整的类型定义
- **使用示例**: 在注释中提供使用示例

### 4. **依赖管理**
- **最小依赖**: 工具函数尽量减少外部依赖
- **循环依赖**: 避免 utils 文件之间的循环引用
- **树摇优化**: 支持按需导入，减少打包体积

这种重构大大提高了代码的质量和可维护性，为后续功能开发提供了更好的基础！
