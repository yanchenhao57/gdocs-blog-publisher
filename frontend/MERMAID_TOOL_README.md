# Mermaid 流程图文档工具

## 功能概述

一个纯前端的 Mermaid 流程图编辑和文档管理工具，支持：
- 📝 编辑 Mermaid 源码，实时预览，语法高亮
- 🎨 渲染流程图，支持 10 倍缩放和平移
- 📄 为每个节点添加富文本文档
- 🖼️ 支持插入图片（本地上传/URL）
- 💾 自动保存到浏览器本地
- 🔄 面板折叠/展开，可拖拽调整宽度
- 📁 项目历史记录管理（最多 10 个项目）
- 📦 导出/导入功能，支持跨设备迁移

## 快速开始

```bash
# 安装依赖
cd frontend
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev

# 访问页面
open http://localhost:3001/docs/mermaid
```

## 主要功能

### 1. 项目历史记录管理 🆕
- **多项目管理**：同时管理最多 10 个不同的 Mermaid 项目
- **快速切换**：一键在不同项目之间切换
- **项目命名**：为每个项目设置自定义名称
- **自动保存**：每次保存时自动更新项目历史
- **项目信息**：显示更新时间和文档数量
- **编辑/删除**：支持重命名和删除历史项目
- **与导入/导出联动**：导入项目自动添加到历史，导出时可自动保存到历史

### 2. 导出/导入功能
- **导出流程**：
  - 输入项目名称（可选）
  - 自动保存到项目历史记录
  - 导出为 ZIP 文件供下载
- **导入流程**：
  - 选择 ZIP 文件
  - 自定义项目名称
  - 自动添加到项目历史记录
  - 支持跨设备迁移
- **自动备份**：导入前自动备份当前数据
- **智能压缩**：图片独立存储，文件体积更小

### 3. 三栏布局
- **左侧**：Mermaid 源码编辑器（支持语法高亮）
- **中间**：流程图渲染预览区（支持 10 倍缩放）
- **右侧**：节点文档编辑器（支持富文本 + 图片）

### 4. 图表操作
- **缩放**：Ctrl/Cmd + 滚轮 或 点击 ➕/➖ 按钮（10% - 1000%）
- **平移**：鼠标拖拽移动
- **重置**：点击 🔄 按钮恢复默认视图
- **适应屏幕**：点击 🔲 按钮自动调整大小
- **高清渲染**：优化的 SVG 渲染，文字和线条清晰锐利

### 5. 节点文档
- 点击流程图中的节点
- 在右侧编辑器输入文档内容
- 支持富文本格式（粗体、斜体、列表等）
- 支持插入图片

### 6. 图片插入
- **📤 上传本地图片**：转为 base64 存储（限 5MB）
- **🔗 插入图片 URL**：引用在线图片

### 7. 面板折叠与调整
- 点击 ◀/▶ 按钮折叠/展开面板
- 拖拽分隔条调整面板宽度
- 自动调整布局，最大化工作区
- 流畅的线性过渡动画

### 8. 自动保存
- 编辑后 2 秒自动保存
- 页面刷新前自动保存
- 数据保存在 localStorage

## 文件结构

```
frontend/src/app/docs/mermaid/
├── page.tsx                      # 页面入口
├── page.module.css              # 页面样式
└── components/
    ├── MermaidEditor.tsx        # 源码编辑器
    ├── MermaidRenderer.tsx      # 渲染区域
    ├── NodeDocEditor.tsx        # 文档编辑器
    ├── ProjectHistory.tsx       # 项目历史记录管理 🆕
    ├── ExportImportButtons.tsx  # 导出/导入按钮
    └── index.module.css         # 组件样式

frontend/src/stores/
└── mermaidStore.ts              # Zustand 状态管理

frontend/src/utils/
├── mermaidUtils.ts              # Mermaid 工具函数
└── exportImportUtils.ts         # 导出/导入工具函数
```

## 技术栈

- **框架**：Next.js 15 (App Router)
- **状态管理**：Zustand 5.0
- **图表渲染**：Mermaid 11.4
- **样式**：CSS Modules
- **持久化**：localStorage

## 核心技术

### 状态管理（Zustand）
```typescript
interface MermaidState {
  currentProjectId: string | null;   // 当前项目 ID 🆕
  mermaidCode: string;               // Mermaid 源码
  selectedNodeId: string | null;     // 选中的节点
  nodeDocs: Record<string, NodeDoc>; // 节点文档
  hasUnsavedChanges: boolean;        // 未保存标识
  projectHistory: ProjectHistory[];  // 项目历史记录（最多 10 个）🆕
}

interface ProjectHistory {
  id: string;
  name: string;
  mermaidCode: string;
  nodeDocs: Record<string, NodeDoc>;
  createdAt: number;
  updatedAt: number;
}
```

### Mermaid 渲染
```typescript
// 1. 渲染图表
const svg = await renderMermaid(code, "main");

// 2. 绑定点击事件
bindNodeClickEvents(svgElement, (nodeId) => {
  selectNode(nodeId);
});

// 3. 高亮选中节点
highlightSelectedNode(svgElement, selectedNodeId);
```

### 本地存储
```typescript
localStorage.setItem('mermaid-docs-tool', JSON.stringify({
  mermaidCode: "graph TD...",
  nodeDocs: { A: { id: "A", content: "..." } },
  lastSavedAt: Date.now()
}));
```

## 使用技巧

### 高效工作流
1. **创建/切换项目**：点击"Projects"按钮管理多个项目
2. **创建图表**：左侧编辑 Mermaid 代码
3. **折叠左侧**：专注查看和点击节点
4. **编辑文档**：右侧为节点添加说明
5. **查看全局**：双侧折叠，最大化图表
6. **保存项目**：给项目命名并保存到历史记录

### 图片使用建议
- 小图片（< 500KB）：使用本地上传
- 大图片（> 1MB）：使用 URL 引用
- 避免过多图片导致存储超限

### 性能优化
- 图表节点 < 50 个为佳
- 定期清理不需要的节点文档
- 使用 Ctrl+滚轮 快速缩放

## 注意事项

1. **数据存储**：所有数据保存在 localStorage（5-10MB 限制）
2. **浏览器支持**：Chrome/Firefox/Safari 现代版本
3. **离线使用**：无需网络连接（除非使用 URL 图片）
4. **数据备份**：建议定期导出重要数据

## 导出/导入使用指南

### 完整工作流程（Projects + Export + Import）

#### 方式一：本地项目管理
1. 点击 **📁 Projects** 按钮
2. **创建新项目**：点击"New Project"
3. **保存当前项目**：点击"Save Current"并输入项目名称
4. **切换项目**：点击列表中的项目加载
5. **管理项目**：重命名（✏️）或删除（🗑️）项目

**特点：**
- ✅ 快速切换，无需导出/导入
- ✅ 最多保存 10 个项目
- ✅ 数据保存在浏览器本地
- ✅ 自动记录更新时间和文档数量

#### 方式二：导出并分享/备份
1. 点击 **📦 Export** 按钮
2. 输入项目名称（可选）
   - 如果输入名称，会自动保存到项目历史
   - 如果不输入，仅导出文件
3. 点击"确认导出"
4. 文件自动下载为 `.mermaid-docs.zip`

**导出内容：**
- ✅ Mermaid 源码
- ✅ 所有节点文档
- ✅ 所有图片（独立存储，非 base64）
- ✅ 元数据（节点数、图片数等）

**适用场景：**
- 📤 分享项目给其他人
- 💾 永久备份到云盘/U盘
- 🔄 跨设备迁移

#### 方式三：导入已有项目
1. 点击 **📥 Import** 按钮
2. 选择 `.zip` 或 `.mermaid-docs.zip` 文件
3. **编辑项目名称**（必填）
   - 默认使用文件名
   - 可自定义名称
4. 点击"确认导入"
5. **自动添加到项目历史**

**重要说明：**
- ⚠️ 导入会覆盖当前数据
- ✅ 当前数据会自动备份（保留最近 3 个）
- ✅ 导入的项目自动添加到历史记录
- ✅ 可立即在 Projects 中找到导入的项目

#### 三者关系图
```
Projects (本地历史)
    ↓ Save Current
    ├─→ 保存到历史记录 (最多10个)
    ↓ Export
    └─→ 导出为 ZIP 文件 (可选保存到历史)
    
ZIP 文件
    ↓ Import
    └─→ 自动添加到 Projects 历史
```

### 文件结构
```
my-diagram.mermaid-docs.zip
├── data.json          # 主数据
├── images/            # 图片文件
│   ├── node_A_0.png
│   └── node_B_1.jpg
└── metadata.json      # 元数据
```

## 快捷操作

| 操作 | 方式 |
|------|------|
| 管理项目 | 点击 📁 Projects 按钮 |
| 导出数据 | 点击 📦 Export 按钮 |
| 导入数据 | 点击 📥 Import 按钮 |
| 缩放 | Ctrl/Cmd + 滚轮 或 ➕/➖ 按钮 |
| 平移 | 鼠标拖拽 |
| 折叠面板 | 点击 ◀/▶ 按钮 |
| 调整宽度 | 拖拽面板之间的分隔条 |
| 选择节点 | 点击图表节点 |
| 保存 | 自动保存（2秒） |

## 故障排查

**Q: 图表不显示？**  
A: 检查 Mermaid 语法是否正确，查看控制台错误

**Q: 节点点击无响应？**  
A: 确认图表已渲染完成，尝试刷新页面

**Q: 存储空间不足？**  
A: 删除不需要的图片和文档，或使用 URL 图片

**Q: 折叠后布局异常？**  
A: 刷新页面重置布局

## 更新日志

**v1.0.0** - 基础功能
- Mermaid 编辑和渲染
- 节点文档编辑
- 本地存储

**v1.1.0** - 图片功能
- 支持本地图片上传
- 支持 URL 图片插入

**v1.2.0** - 交互增强
- 缩放和平移功能（最高 1000%）
- 控制按钮面板
- 高清渲染优化

**v1.3.0** - 布局优化
- 面板折叠功能
- 流畅线性过渡动画
- 代码编辑器语法高亮

**v1.4.0** - 导出/导入
- ZIP 格式导出/导入
- 智能图片提取和压缩
- 自动备份机制
- 跨设备数据迁移

**v1.5.0** - 项目历史记录管理 🆕
- 多项目管理（最多 10 个）
- 项目快速切换
- 项目重命名和删除
- 统一图标系统（lucide-react）
- 可拖拽调整面板宽度

**v1.5.1** - Import/Export/Projects 三合一 🆕
- 导入时自动添加到项目历史
- 导出时可选保存到项目历史
- 导入文件时可自定义项目名称
- 三个功能无缝联动

---

**项目地址**：`/docs/mermaid`  
**技术支持**：查看项目源码或联系开发团队

