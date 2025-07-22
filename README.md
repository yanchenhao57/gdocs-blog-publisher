# Google Docs to Storyblok Converter

一个用于将 Google Docs 文档转换并发布到 Storyblok 的工具。支持将 Google Docs 文档转换为 Storyblok 的富文本格式，并自动处理图片上传、SEO 信息设置等功能。

## 功能特点

- 🔄 从 Google Docs 自动拉取文档内容
- 📝 自动转换为 Storyblok 支持的富文本格式
- 🖼️ 自动处理文档中的图片
- 🔍 支持 SEO 信息设置
- 🌐 支持多语言（英文/日文）博客发布
- 🔗 自动生成规范的 URL 和 canonical 链接
- 📊 自动计算阅读时间
- 👥 支持多作者管理

## 快速开始

### 环境要求

- Node.js >= 14
- npm 或 pnpm
- Google Docs API 凭证
- Storyblok API Token

### 安装

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 配置

1. 创建 `.env` 文件并设置以下环境变量：

```env
# Google API 配置
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri

# Storyblok API 配置
STORYBLOK_OAUTH_TOKEN=your_oauth_token
STORYBLOK_PREVIEW_TOKEN=your_preview_token
STORYBLOK_SPACE_ID=your_space_id
```

2. 确保有正确的 Google Docs API 权限和 Storyblok 访问权限

### 运行

```bash
# 启动开发服务器
npm run dev

# 或使用 pnpm
pnpm dev
```

访问 `http://localhost:3000` 即可使用工具。

## 使用说明

1. 在工具页面输入 Google Docs 文档链接
2. 点击"拉取并转换"按钮
3. 在表单中填写或确认以下信息：
   - SEO 标题
   - SEO 描述
   - 文章标题
   - Slug
   - 阅读时间
   - 封面图
   - 作者信息
4. 预览转换后的内容
5. 点击"保存草稿"发布到 Storyblok

## 项目结构

```
.
├── api-server/          # API 服务器代码
│   ├── routes/         # API 路由
│   └── server.js       # 服务器入口
├── constant/           # 常量定义
├── public/            # 静态文件
├── utils/             # 工具函数
└── package.json
```

## 主要依赖

- Express.js - Web 服务器框架
- Google Docs API - 获取文档内容
- Storyblok API - 发布博客内容

## 开发说明

### API 端点

- `POST /api/convert-doc` - 转换 Google Docs 文档
- `POST /api/publish` - 发布到 Storyblok

### 本地开发

1. 克隆仓库
2. 安装依赖
3. 配置环境变量
4. 运行开发服务器

## 贡献指南

欢迎提交 Issue 和 Pull Request。在提交 PR 之前，请确保：

1. 代码符合项目的编码规范
2. 添加了必要的测试
3. 更新了相关文档

## License

MIT

## 联系方式

如有问题或建议，请提交 Issue 或联系项目维护者。 