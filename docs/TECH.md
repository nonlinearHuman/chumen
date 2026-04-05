# 楚门 (Chumen) - 项目技术方案

> AI 真人秀世界 + NFT 交易平台

---

## 📁 项目目录结构

```
chumen/
├── src/
│   ├── agents/              # Agent 配置
│   │   ├── core/           # 核心角色（4人）
│   │   ├── support/       # 辅助角色（3人）
│   │   ├── npc/           # NPC 触发器（3人）
│   │   └── index.ts       # Agent 导出
│   ├── prompts/            # 对话模板
│   │   ├── system/        # 系统提示词
│   │   ├── scene/         # 场景模板
│   │   └── drama/         # 剧情触发
│   ├── components/         # React 组件
│   │   ├── World/         # 世界视图
│   │   ├── Agent/         # Agent 卡片
│   │   ├── Chat/          # 对话界面
│   │   └── NFT/           # NFT 交易
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useAgent.ts    # Agent 对话
│   │   ├── useDrama.ts    # 剧情管理
│   │   └── useNFT.ts      # NFT 交互
│   ├── utils/              # 工具函数
│   ├── nft/                # NFT 配置
│   │   └── contracts/     # 智能合约（如需要）
│   └── styles/             # 样式文件
├── docs/                   # 文档
│   ├── PRD.md             # 产品需求文档
│   ├── API.md             # 接口文档
│   └── CHANGELOG.md       # 变更记录
├── scripts/                # 脚本
│   ├── deploy.ts          # 部署脚本
│   └── generate.ts        # 生成脚本
├── config/                 # 配置文件
│   ├── agents.json        # Agent 角色配置
│   ├── scenes.json        # 场景配置
│   └── nft.json           # NFT 配置
└── package.json
```

---

## 🤖 多 Agent 架构设计

### Agent 角色划分

| Agent | 角色 | 职责 | 技能 |
|-------|------|------|------|
| **narrator** | 旁白/导演 | 控制剧情走向，触发事件 | 场景调度 |
| **observer** | 观察者 | 监控对话，发现戏剧点 | 情感分析 |
| **trigger** | 触发器 | NPC 行动，主动介入 | 事件生成 |
| **actor** | 演员 | 执行对话，生成内容 | 对话生成 |
| **evaluator** | 评估师 | 判断剧情张力，决定是否触发 | 质量评估 |

### Agent 协作流程

```
1. narrator 发起场景
      ↓
2. actor 生成对话
      ↓
3. observer 观察，评估戏剧点
      ↓
4. evaluator 判断是否触发
      ↓
5. trigger 决定如何干预
      ↓
6. narrator 推进剧情
      ↓
7. 循环...
```

---

## 🎭 Agent 详细配置

### narrator (旁白)

```json
{
  "name": "narrator",
  "role": "导演",
  "goal": "控制剧情节奏，制造戏剧张力",
  "tools": ["scene_control", "event_trigger"]
}
```

### observer (观察者)

```json
{
  "name": "observer", 
  "role": "观察者",
  "goal": "监控 Agent 对话，识别戏剧点",
  "tools": ["sentiment_analysis", "plot_detection"]
}
```

### trigger (触发器)

```json
{
  "name": "trigger",
  "role": "NPC 控制器",
  "goal": "让 NPC 主动介入，推进剧情",
  "tools": ["npc_action", "event_injection"]
}
```

### actor (演员)

```json
{
  "name": "actor",
  "role": "对话生成器",
  "goal": "根据角色设定生成自然对话",
  "tools": ["dialogue_generation"]
}
```

---

## 🛠️ 技术架构

### 技术栈

| 模块 | 技术 | 说明 |
|------|------|------|
| 前端 | React + TypeScript | UI 框架 |
| 状态管理 | Zustand | 轻量级状态 |
| AI 对话 | OpenClaw Agent (GLM-4) | 对话生成 |
| NFT | Thirdweb (Polygon) | 铸造 + 交易 |
| 部署 | 本地 (demo) / Vercel (prod) | 混合部署 |
| 内网穿透 | Cloudflare Tunnel | 外部访问 |

### API 设计

```
GET  /api/world          # 获取世界状态
GET  /api/agents         # 获取所有 Agent
GET  /api/agents/:id     # 获取单个 Agent
GET  /api/drama          # 获取当前剧情
POST /api/dialogue       # 生成对话
POST /api/nft/mint       # 铸造 NFT
POST /api/nft/transfer  # 转让 NFT
```

---

## 📅 开发计划（2周）

### Week 1: 核心功能

| Day | 任务 | 交付物 |
|-----|------|--------|
| 1 | 项目搭建 + Agent 架构 | 目录结构 + 5 个 Agent 配置 |
| 2 | 对话生成 demo | 2 个 Agent 自由对话 |
| 3 | 场景系统 | 咖啡馆/医院/商场 场景 |
| 4 | NPC 触发机制 | 张姨/小王/老李 触发逻辑 |
| 5 | 前端界面 MVP | Emoji + 动态背景 |

### Week 2: NFT + 上线

| Day | 任务 | 交付物 |
|-----|------|--------|
| 6 | Thirdweb 集成 | NFT 铸造 |
| 7 | 交易市场 | 买卖界面 |
| 8-9 | 打磨 + 测试 | Bug 修复 |
| 10 | 内网穿透 + 上线 | 外部可访问 |
| 11-14 | 缓冲 + 发布 | 正式上线 |

---

## 🔧 关键配置

### 场景配置 (scenes.json)

```json
{
  "coffee_shop": {
    "name": "咖啡馆",
    "emoji": "☕",
    "background": "warm",
    "characters": ["Marcus", "Sophia", "Lisa"]
  },
  "hospital": {
    "name": "医院",
    "emoji": "🏥",
    "background": "cold",
    "characters": ["James", "Emily"]
  },
  "court": {
    "name": "法院",
    "emoji": "⚖️",
    "background": "serious",
    "characters": ["Sophia", "Robert"]
  }
}
```

### NFT 配置 (nft.json)

```json
{
  "chain": "polygon",
  "royalty": 5,
  "max_supply": 1000,
  "price": "0.01"
}
```

---

## 📝 记录规范

- 每日更新 `docs/CHANGELOG.md`
- 重要决策记在 `docs/DECISIONS.md`
- 代码规范见 `.eslintrc.json`

---

*最后更新: 2026-03-18*
*状态: 框架搭建中*
