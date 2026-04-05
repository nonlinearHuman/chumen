# 楚门 (Chumen) - 开发日志

## 2026-03-18

### ✅ 已完成

- [x] 项目框架搭建
- [x] 目录结构设计
- [x] 10 个 Agent 角色配置
- [x] 系统提示词模板
- [x] 场景配置（8 个场景）
- [x] 第一周剧情脚本

### 📁 文件清单

```
chumen/
├── src/
│   ├── config/
│   │   ├── agents.ts      # Agent 角色配置
│   │   ├── scenes.ts      # 场景配置
│   │   └── drama.ts       # 剧情配置
│   └── prompts/
│       └── system/
│           └── index.ts   # 系统提示词
└── docs/
    └── TECH.md            # 技术方案
```

### 🔜 待办

- [ ] 初始化 React 项目
- [ ] 配置 OpenClaw Agent 调用
- [ ] 实现对话生成 demo
- [ ] 实现 NPC 触发机制
- [ ] 前端界面开发
- [ ] Thirdweb NFT 集成
- [ ] 部署上线

### ✅ Day 1 完成 (2026-03-18)

- [x] 项目初始化 (Next.js + TypeScript)
- [x] Tailwind CSS 配置
- [x] Agent 角色配置 (10人)
- [x] 场景配置 (8个)
- [x] Zustand 状态管理
- [x] Agent 卡片组件
- [x] 对话气泡组件
- [x] AI 对话引擎 (Demo版)
- [x] 主页面 (世界视图)
- [x] 开发服务器启动 (http://localhost:3000)

### ✅ Day 2 完成 (2026-03-18)

- [x] AI 对话服务 (aiChat.ts)
- [x] NPC 爆点触发系统
- [x] 情感检测 (emotion/conflict/romance/secret)
- [x] 手动触发 NPC 按钮
- [x] 戏剧事件统计面板
- [x] 优化主页面 UI

### ✅ Day 3 完成 (2026-03-18)

- [x] AI 对话 API (/api/chat)
- [x] NFT 状态管理 (nftStore.ts)
- [x] NFT 市场组件
- [x] 钱包连接 (Demo)
- [x] NFT 购买/上架功能
- [x] Tab 切换 (世界/NFT)

### ✅ Day 4 完成 (2026-03-18)

- [x] 视觉特效组件 (Effects.tsx)
- [x] README 文档完善
- [x] 项目结构优化
- [x] Build 测试通过

### ✅ Day 5 完成 (2026-03-18)

- [x] 修复暂停后继续发言问题
- [x] 调整对话速度 (默认5秒)
- [x] 改进对话逻辑 - 关系感知 + 场景相关
- [x] 集成 MiniMax API (可选)
- [x] 添加精彩对话高亮功能
- [x] 添加心情状态类型
- [x] **像素世界游戏引擎**
- [x] **像素角色移动 + 动画**
- [x] **点击角色触发对话**
- [x] **3个视图选项卡: 会话/像素世界/NFT**

### ✅ Day 6 完成 (2026-03-18)

- [x] **Web3 风格场景设计** (8个场景)
- [x] **场景配置系统**
- [x] **技能显示** (角色头顶)
- [x] **Web3 对话语境** (WAGMI, HODL, Mint等)
- [x] **场景切换功能**
- [x] **霓虹配色风格**

### 📝 决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-03-18 | 技术栈选 OpenClaw | 快速验证，降低开发成本 |
| 2026-03-18 | 区块链选 Polygon | 低 Gas 费，用户体验好 |
| 2026-03-18 | NFT 用 Thirdweb | 快速接入，无需智能合约开发 |
| 2026-03-18 | 视觉先用 Emoji | 验证优先，后期升级二次元 |
| 2026-03-18 | 多 Agent 架构 | narrator/observer/trigger/actor/evaluator |
| 2026-03-18 | 无剧本，AI 自主产生剧情 | 真正的真人秀 |
| 2026-03-18 | NPC 爆点机制 | 张姨/小王/老李 主动制造冲突 |

### ✅ Day 7 完成 (2026-03-30)

- [x] **音效引擎 (AudioEngine)** — Web Audio API 实现，无需 npm 依赖
  - 场景环境音（8个场景各有独特频率/波形）
  - 对话气泡音效 (dialogue_pop)
  - 角色选中音效 (character_select)
  - 场景切换音效 (scene_change)
  - 脚步声 (footstep)
  - UI点击/通知音效
  - 静音控制
- [x] **8方向行走动画** — 上/下/左/右 + 4个斜向 (up_left/up_right/down_left/down_right)
  - 像素精灵正面/侧面/背面/斜向帧组
  - 方向判断逻辑（斜向阈值1.5x）
- [x] **地板纹理渲染** — floorPattern 字段终于落地
  - wood（木纹斜线）
  - marble（大理石渐变）
  - concrete（随机斑点）
- [x] **音效UI控制** — 🔊静音按钮 + 首次交互自动初始化
