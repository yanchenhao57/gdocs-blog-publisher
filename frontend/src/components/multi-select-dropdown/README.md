# MultiSelectDropdown 多选下拉框组件

一个功能完整、样式优雅的多选下拉框组件，支持搜索、标签显示和键盘导航。

## 功能特性

- ✅ 多选支持：可同时选择多个选项
- ✅ 标签显示：已选项以可移除的标签形式显示
- ✅ 搜索功能：支持实时搜索过滤选项
- ✅ 智能定位：自动检测空间，向上或向下展开
- ✅ 禁用状态：支持禁用整个组件或单个选项
- ✅ 响应式设计：适配各种屏幕尺寸
- ✅ 深色模式：内置深色模式支持

## 基本用法

```tsx
import MultiSelectDropdown from "@/components/multi-select-dropdown";
import { useState } from "react";

function MyComponent() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const languageOptions = [
    { id: "en", label: "English (英语)" },
    { id: "zh", label: "Chinese (中文)" },
    { id: "ja", label: "Japanese (日语)" },
  ];

  return (
    <MultiSelectDropdown
      options={languageOptions}
      value={selectedLanguages}
      onChange={setSelectedLanguages}
      placeholder="选择语言"
    />
  );
}
```

## API 属性

### MultiSelectDropdownProps

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `options` | `DropdownOption[]` | 必填 | 下拉选项列表 |
| `value` | `string[]` | 必填 | 当前选中的值数组 |
| `onChange` | `(values: string[]) => void` | 必填 | 值变化时的回调函数 |
| `placeholder` | `string` | `"Select options"` | 未选择时的占位文本 |
| `searchable` | `boolean` | `true` | 是否启用搜索功能 |
| `disabled` | `boolean` | `false` | 是否禁用组件 |
| `className` | `string` | - | 自定义 CSS 类名 |

### DropdownOption

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `id` | `string` | ✅ | 选项的唯一标识 |
| `label` | `string` | ✅ | 选项显示的文本 |
| `icon` | `React.ReactNode` | - | 选项的图标（可选）|
| `disabled` | `boolean` | - | 是否禁用该选项 |

## 使用示例

### 基础多选

```tsx
<MultiSelectDropdown
  options={languageOptions}
  value={selectedValues}
  onChange={setSelectedValues}
  placeholder="选择语言"
/>
```

### 禁用搜索

```tsx
<MultiSelectDropdown
  options={languageOptions}
  value={selectedValues}
  onChange={setSelectedValues}
  searchable={false}
/>
```

### 禁用状态

```tsx
<MultiSelectDropdown
  options={languageOptions}
  value={selectedValues}
  onChange={setSelectedValues}
  disabled={true}
/>
```

### 带图标的选项

```tsx
import { Globe, Flag } from "lucide-react";

const optionsWithIcons = [
  { id: "en", label: "English", icon: <Globe size={16} /> },
  { id: "zh", label: "中文", icon: <Flag size={16} /> },
];

<MultiSelectDropdown
  options={optionsWithIcons}
  value={selectedValues}
  onChange={setSelectedValues}
/>
```

## 交互说明

### 选择操作
- 点击下拉框触发按钮，展开选项列表
- 点击选项可添加或移除选中状态
- 已选中的选项会以标签形式显示在触发按钮中

### 移除操作
- 点击标签上的 × 按钮可快速移除该选项
- 再次点击已选中的选项也可移除

### 搜索功能
- 下拉菜单打开时，搜索框自动获得焦点
- 输入关键词实时过滤选项列表
- 搜索不区分大小写

### 智能定位
- 组件会自动检测可用空间
- 下方空间不足时，菜单会向上展开
- 确保菜单始终在可视区域内

## 样式定制

组件使用 CSS Modules，可通过 `className` 属性添加自定义样式：

```tsx
<MultiSelectDropdown
  className="my-custom-dropdown"
  // ... 其他属性
/>
```

或者直接修改 `index.module.css` 文件中的样式变量。

## 相关组件

- [Dropdown](../dropdown/) - 单选下拉框组件
- [Input](../input/) - 输入框组件
- [FormItem](../form-item/) - 表单项包装组件

## 注意事项

1. **性能优化**：当选项数量很多时（>100），建议使用虚拟滚动优化
2. **受控组件**：必须通过 `value` 和 `onChange` 进行状态管理
3. **唯一标识**：每个选项的 `id` 必须唯一
4. **点击外部**：点击组件外部会自动关闭下拉菜单

## 更新日志

- **v1.0.0** (2025-11-05)
  - 初始版本发布
  - 支持多选、搜索、标签显示等核心功能

