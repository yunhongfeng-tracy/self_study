# AI学习路径规划器

一个基于AI的个性化物理学习路径规划工具。通过简单的问卷和AI对话，生成专属的学习计划和资源推荐。

## 功能特点

- 📋 **引导式问卷** - 3个问题快速了解学习需求
- 🤖 **AI智能规划** - 基于GPT生成个性化学习路径
- 📚 **精选资源推荐** - 推荐优质教材、视频和互动工具
- ✅ **进度跟踪** - 记录学习进度，随时继续
- 💾 **本地存储** - 数据保存在浏览器，保护隐私
- 🎯 **纯前端** - 零后端成本，一键部署

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: OpenAI API (GPT-3.5/4)
- **存储**: LocalStorage
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 3. 使用说明

1. 点击"开始定制我的学习计划"
2. 填写3个问题的问卷
3. 输入你的OpenAI API Key
4. 等待AI生成学习路径
5. 开始学习，打勾记录进度

### 获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 注册并登录
3. 创建新的API Key
4. 复制并保存（只显示一次）

## 项目结构

```
ai-study-path/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── chat/            # AI API路由
│   ├── questionnaire/       # 问卷页面
│   ├── generate/            # 生成路径页面
│   ├── path/                # 学习路径展示
│   ├── layout.tsx           # 全局布局
│   └── page.tsx             # 首页
├── components/              # React组件
├── lib/                     # 工具库
│   ├── storage.ts          # 本地存储
│   └── physics-resources.json  # 物理资源库
├── types/                   # TypeScript类型
└── public/                  # 静态资源
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动构建和部署
4. 完成！获得免费的生产环境URL

## 功能路线图

- [x] 引导式问卷
- [x] AI生成学习路径
- [x] 资源推荐
- [x] 进度跟踪
- [ ] AI水平测试
- [ ] 学习笔记功能
- [ ] 导出学习路径
- [ ] 多学科支持

## 常见问题

**Q: 为什么需要API Key？**
A: 纯前端架构，AI调用由用户自己的API Key完成，保护隐私且无运营成本。

**Q: API Key安全吗？**
A: 存储在浏览器本地，仅在你的设备上，不会上传到服务器。

**Q: 数据会丢失吗？**
A: 数据存储在浏览器LocalStorage，清除浏览器数据会丢失。建议定期导出（未来功能）。

**Q: 支持哪些学科？**
A: 目前只支持物理，未来会扩展到数学、编程等。

## 开源协议

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系

如有问题，请提交 [Issue](https://github.com/yourusername/ai-study-path/issues)
