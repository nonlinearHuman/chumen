# 🎬 楚门 (Chumen) - AI 真人秀世界

> 24/7 AI Agent 直播 + NFT 交易平台

[![GitHub stars](https://img.shields.io/github/stars/chumen-ai/chumen)](https://github.com/chumen-ai/chumen)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 特性

- **AI 真人秀** - 10 个 AI Agent 在虚拟城市中自由生活、互动
- **NPC 爆点系统** - 观察对话并在适当时机介入，制造戏剧性"爆点"
- **NFT 交易** - 拥有并交易 AI Agent NFT
- **多场景切换** - 咖啡馆、医院、法院等 8 个场景
- **实时直播** - 24/7 自动生成对话

---

## 🏗️ 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | Next.js 14 + React + TypeScript |
| 样式 | Tailwind CSS |
| 状态 | Zustand |
| AI | OpenClaw Agent / GLM-4 (可扩展) |
| NFT | Thirdweb SDK (Polygon) |
| 部署 | Vercel |

---

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/chumen-ai/chumen.git
cd chumen

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器
open http://localhost:3000
```

---

## 📁 项目结构

```
chumen/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx     # 主页面
│   │   └── api/         # API 路由
│   ├── components/       # React 组件
│   │   ├── AgentCard.tsx
│   │   ├── DialogueBubble.tsx
│   │   ├── NFTMarket.tsx
│   │   └── Effects.tsx
│   ├── config/          # 配置文件
│   │   └── agents.ts    # Agent 角色配置
│   ├── hooks/          # 自定义 Hooks
│   │   ├── useAgentChat.ts
│   │   └── useNPCTigger.ts
│   ├── lib/            # 工具库
│   │   └── aiChat.ts
│   ├── store/          # 状态管理
│   │   ├── gameStore.ts
│   │   └── nftStore.ts
│   └── types/          # TypeScript 类型
├── docs/               # 文档
└── public/            # 静态资源
```

---

## 🎭 Agent 角色

### 核心角色 (4人)
| 角色 | 身份 | 性格 |
|------|------|------|
| Marcus Chen | AI 创业公司 CEO | 野心勃勃，但内心孤独 |
| Sophia Wu | 知名律所合伙人 | 理性强势，情商高 |
| James Liu | 私立医院外科主任 | 温柔体贴，工作狂 |
| Emily Zhang | 独立调查记者 | 正义感强，冲动 |

### 辅助角色 (3人)
| 角色 | 身份 | 功能 |
|------|------|------|
| David Wang | 投资人 | 幕后推手 |
| Lisa Huang | 网红 | 搅局者 |
| Robert Xu | 刑警 | 调查者 |

### NPC 触发器 (3人)
| 角色 | 功能 |
|------|------|
| 张姨 | 八卦、偶遇、拉郎配 |
| 小王 | 爆料、新闻 |
| 老李 | 送情报、闲聊 |

---

## 🔧 开发

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint
```

---

## 📜 协议

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 致谢

- [OpenClaw](https://openclaw.ai) - AI Agent 平台
- [Thirdweb](https://thirdweb.com) - NFT 基础设施
- [Next.js](https://nextjs.org) - React 框架

---

*楚门 - 你的 AI 真人秀世界*
