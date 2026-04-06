# 楚门World — DESIGN.md
> AI 真人秀世界 + 像素世界 + NFT 市场
> Version 1.0 | 2026-04-06

---

## Overview

**一句话定位**: 一个 7x24 小时运转的 AI 真人秀世界，用户是观众也是参与者。

**设计调性**: 电影感 + 游戏感 + Web3 氛围。三重身份的融合：
- 作为**真人秀**: 沉浸式电影感，大量留白，戏剧性光影，暗色调
- 作为**像素世界**: 复古游戏美学，8-bit 字体，像素角色，霓虹色彩
- 作为**NFT 市场**: Web3 原生，深色界面，发光边框，稀有度色彩系统

**用户感受关键词**: 窥探感、戏剧性、收藏欲望、探索惊喜、真实感

**Accessibility**: 高对比度，支持暗色主题，触摸目标 ≥ 44px。

---

## Design Principles

1. **Camera Eye** — 每个界面角落都透露着"被观看"的气息。镜头光晕、录制指示灯、边框取景器元素
2. **Drama First** — 冲突、浪漫、秘密是视觉核心。情绪色彩（红=冲突/粉=浪漫/金=秘密）贯穿全站
3. **Two Worlds** — AI 真人秀（精致电影感）和像素世界（复古游戏感）视觉上截然不同，但通过共享配色连接
4. **Collectible Instinct** — NFT 卡片始终有"稀有度光晕"，成就徽章始终有"收集进度感"

---

## Colors

### 主题色板（AI 真人秀 - 电影感）

```markdown
## Colors

### Primary Palette（主色板）
- **Background Deep** (#0a0b0f): 全局背景，深邃的演播厅黑
- **Background Surface** (#12141c): 卡片/面板背景
- **Background Elevated** (#1a1d28): 浮层/Modal 背景
- **Background Glass** (#ffffff08): 毛玻璃背景（叠加层用）

### Accent Colors（功能色）
- **Primary Cyan** (#00d4ff): 主交互、关键 CTA、"录制中"指示、链接
- **Secondary Magenta** (#ff2d78): 戏剧冲突、浪漫事件、警示
- **Tertiary Gold** (#ffb800): 成就、NFT 稀有度、奖励、积分
- **Success Green** (#00ff88): 正向事件、关系改善、NPC 介入
- **Warning Amber** (#ff9500): 剧情转折、紧张时刻

### Neutral Palette（中性色）
- **Text Primary** (#e8e8f0): 主要文本
- **Text Secondary** (#8b8fa8): 次要文本、标签
- **Text Muted** (#4a4d5e): 占位符、禁用文本
- **Border** (#2a2d3a): 边框、分隔线
- **Border Active** (#3d4055): 聚焦边框

### Pixel World Palette（像素世界 - 复古游戏）
- **Pixel Background** (#0f0f1a): 像素世界专用背景
- **Pixel Cyan** (#00ffff): 像素世界主色
- **Pixel Magenta** (#ff00ff): 像素世界强调
- **Pixel Yellow** (#ffff00): 像素世界高亮
- **Pixel Green** (#00ff00): 像素世界成功
```

### NFT 稀有度色

```markdown
| Rarity     | Color     | Hex       | 光晕效果 |
|------------|-----------|-----------|----------|
| Common     | Gray      | #9ca3af   | 无        |
| Uncommon   | Green     | #22c55e   | 微发光   |
| Rare       | Blue      | #3b82f6   | 发光      |
| Epic       | Purple    | #a855f7   | 强发光   |
| Legendary  | Orange    | #f97316   | 脉冲发光  |
| Mythic     | Gold      | #fbbf24   | 彩虹脉冲  |
```

---

## Typography

```markdown
## Typography

### Font Families
- **Display Font**: "Space Grotesk" (Google Fonts) — 用于标题、数字、关键 UI
- **Body Font**: "IBM Plex Sans" (Google Fonts) — 正文、对话、描述
- **Mono Font**: "JetBrains Mono" (Google Fonts) — 代码、数据、标签
- **Pixel Font**: "Press Start 2P" (Google Fonts) — 像素世界专用，游戏元素

### Type Scale
- **Display XL**: Space Grotesk, 48px, 700 weight — Hero 标题，数字展示
- **Display L**: Space Grotesk, 36px, 600 weight — 页面大标题
- **Heading 1**: Space Grotesk, 28px, 600 weight — 区块标题
- **Heading 2**: Space Grotesk, 22px, 600 weight — 卡片标题
- **Heading 3**: Space Grotesk, 18px, 500 weight — 子标题
- **Body Large**: IBM Plex Sans, 16px, 400 weight — 对话内容
- **Body**: IBM Plex Sans, 14px, 400 weight — 正文
- **Body Small**: IBM Plex Sans, 12px, 400 weight — 标签、备注
- **Caption**: IBM Plex Sans, 11px, 400 weight — 底部说明
- **Pixel**: Press Start 2P, 10px — 像素世界 HUD 文字

### Line Height & Letter Spacing
- Display: 1.1 line-height, -0.02em letter-spacing
- Headings: 1.2 line-height, -0.01em letter-spacing
- Body: 1.6 line-height, 0em letter-spacing
- Labels: 1.4 line-height, 0.02em letter-spacing
```

---

## Elevation & Shadows

```markdown
## Elevation

This design uses a combination of:

### Shadows
- **Elevation 1** (cards): `0 2px 8px rgba(0,0,0,0.3)` — 默认卡片
- **Elevation 2** (dropdowns): `0 8px 24px rgba(0,0,0,0.4)` — 下拉/浮层
- **Elevation 3** (modals): `0 16px 48px rgba(0,0,0,0.5)` — 弹窗

### Glassmorphism（毛玻璃）
- **Glass Surface**: `background: rgba(255,255,255,0.05); backdrop-filter: blur(20px);`
- 用于：侧边栏、覆盖层、导航栏背景

### Glow Effects（发光效果）
- **Cyan Glow**: `0 0 20px rgba(0,212,255,0.4)` — Primary CTA
- **Magenta Glow**: `0 0 20px rgba(255,45,120,0.4)` — 冲突事件
- **Gold Glow**: `0 0 20px rgba(255,184,0,0.3)` — 稀有 NFT
- **Pulse Glow**: CSS animation, 2s infinite — Mythic 级别

### Borders
- **Default Border**: 1px solid #2a2d3a
- **Hover Border**: 1px solid #3d4055
- **Active Border**: 1px solid #00d4ff (cyan glow)
- **Card Border Radius**: 12px
- **Button Border Radius**: 8px
- **Input Border Radius**: 8px
- **Pill Border Radius**: 9999px
```

---

## Spatial System

```markdown
## Spacing System

### Base Unit: 4px

- **xs**: 4px   — 紧凑间距
- **sm**: 8px   — 元素内间距
- **md**: 16px  — 组件间距
- **lg**: 24px  — 区块内间距
- **xl**: 32px  — 区块间距
- **2xl**: 48px — 大区块间距
- **3xl**: 64px — 页面边距

### Layout Grid
- **Desktop**: 12-column grid, 24px gutter, max-width 1440px
- **Tablet**: 8-column grid, 20px gutter, max-width 1024px
- **Mobile**: 4-column grid, 16px gutter, full-width
- **Content Max Width**: 1200px

### Safe Areas
- **Page Padding**: 24px desktop / 16px mobile
- **Card Padding**: 20px desktop / 16px mobile
- **Section Gap**: 48px between major sections
```

---

## Components

### 1. CameraHeader（电影感头部）

电影风格顶部导航。

```markdown
## CameraHeader

**视觉**: 深色背景 + 毛玻璃 + 左侧"REC●"录制指示灯 + 右侧功能按钮

**Layout**:
- 左：Logo + "REC●" 录制动画（红点闪烁）+ 场景选择器
- 中：Tab 切换（会话/像素世界/NFT）
- 右：成就积分 + 快捷操作按钮

**背景**: `background: rgba(10,11,15,0.8); backdrop-filter: blur(20px)`
**底部边框**: 1px gradient border（cyan → magenta → transparent）

**States**:
- Recording: 红点 + "LIVE" 标签持续显示
- Paused: 灰色 REC + "PAUSED"
- Idle: Logo + Tab 栏
```

### 2. AgentCard（AI 角色卡片）

展示单个 AI 角色的核心组件。

```markdown
## AgentCard

**Size Variants**: compact（角色列表）/ expanded（详情）

**Visual**: 深色卡片 + 左侧头像/像素头像 + 右侧信息 + 底部情绪状态条

**Layout（Compact）**:
┌─────────────────────────────────┐
│ [头像64px] 名字CN          [情绪]│
│           角色                 │
│ [性格标签] [关系标签]          │
└─────────────────────────────────┘

**Border**: 1px solid #2a2d3a, hover时 → 1px solid #00d4ff + cyan glow
**Background**: #12141c, hover → #1a1d28
**Corner Radius**: 12px

**情绪状态条（底部4px色条）**:
- Neutral: #4a4d5e
- Happy: #00ff88
- Sad: #3b82f6
- Angry/Conflict: #ff2d78
- Romantic: #ff2d78
- Suspicious: #ff9500

**NPC 标识**: 左上角黄色 "NPC" 标签

**States**:
- Default: 标准样式
- Hover: 边框发光 + 微微上浮 translateY(-2px)
- Active/Selected: Cyan 边框 + 更强发光
- Speaking: 头像外圈脉冲动画（模拟说话）
```

### 3. DialogueBubble（对话气泡）

AI 对话消息展示。

```markdown
## DialogueBubble

**角色对话**:
┌────────────────────────────────────────┐
│ [头像]  名字                    时间    │
│         ┌──────────────────────────┐   │
│         │ 对话内容文字              │   │
│         │                          │   │
│         │ [情绪图标] [关系变化标签] │   │
│         └──────────────────────────┘   │
│                        [关系: 陌生人]  │
└────────────────────────────────────────┘

**气泡背景**: 对方 → #1a1d28 / 自己 → #00d4ff15（半透明cyan）
**气泡圆角**: 12px，左圆角尖角（模拟聊天气泡）
**头像**: 40px 圆形，头像外发光表示情绪
**时间戳**: 右下角，Text Muted 颜色，12px
**关系标签**: 气泡下方，箭头指向两人

**Highlight 对话（爆点事件）**:
- 背景: #ff2d7810（微红）
- 边框: 左侧 3px solid #ff2d78
- 气泡上方: 🔥 火焰图标 + "DRAMA!" 标签
- 整条消息: 轻微 pulse glow 动画

**NPC 介入（特殊）**:
- 气泡顶部: "张姨介入了！" 标签
- 背景: #ffb80008（微金）
- 边框: 左侧 3px solid #ffb800
```

### 4. PixelWorldView（像素世界视图）

像素游戏风格的场景渲染区。

```markdown
## PixelWorldView

**视觉**: 像素风格 Canvas 渲染区，充满游戏感

**设计要求**:
- 背景: #0f0f1a（像素世界专属深色）
- 像素比例: 每个"像素" = 4x4 CSS 像素
- 网格线: 可选显示（调试模式）
- 角色: 像素精灵，8方向动画
- 物体: 像素风格建筑物/道具

**HUD 叠加层**:
- 左上角: 场景名 + 时间（Press Start 2P 字体，#00ffff）
- 右上角: 天气图标 + 温度（如果实现）
- 底部: 迷你地图（64x64px，右下角）

**边框**: 像素化边框（用 CSS box-shadow 画像素线）
**角落装饰**: 取景器风格角落标记（#00d4ff）
```

### 5. NFTGallery（NFT 画廊）

展示收藏的角色 NFT。

```markdown
## NFTGallery

**布局**: 网格布局，3列 desktop / 2列 tablet / 1列 mobile

**NFT 卡片**:
┌─────────────────────┐
│    [像素头像]       │  ← 头像带稀有度光晕
│  ────────────────  │
│  名字               │
│  [稀有度标签]       │
│  [属性标签] [属性]  │
│  ────────────────  │
│  稀有度: ★★★☆☆    │
│  DNA: #a3f8c2       │
└─────────────────────┘

**稀有度光晕**:
- Common: 无光晕
- Uncommon: 微光 `box-shadow: 0 0 8px #22c55e40`
- Rare: 发光 `box-shadow: 0 0 12px #3b82f680`
- Epic: 强发光 `box-shadow: 0 0 16px #a855f7`
- Legendary: 脉冲 `animation: legendary-pulse 2s infinite`
- Mythic: 彩虹脉冲 `animation: mythic-rainbow 3s infinite`

**交互**:
- Hover: 卡片放大 1.02x + 光晕增强
- Click: 打开 NFTDetailModal

**空状态**: 像素风格空箱子图标 + "你的收藏是空的"
```

### 6. StoryTimeline（剧情时间线）

展示 AI 世界中发生的事件。

```markdown
## StoryTimeline

**视觉**: 时间线形式，垂直排列，左侧时间戳右侧事件

**事件卡片**:
┌──────────────────────────────────────┐
│ [时间]  [类型图标]  事件标题          │
│         事件描述...                  │
│         [角色A] → [角色B] [关系变化] │
└──────────────────────────────────────┘

**类型图标**:
- 💬 对话: Cyan
- 🔥 冲突: Magenta
- 💕 浪漫: Pink (#ff69b4)
- 🔍 调查: Amber
- 👵 NPC 介入: Gold
- ⚡ 重大事件: White + pulse

**时间戳**: Mono 字体，Text Muted，左对齐
**连接线**: 1px #2a2d3a 垂直线，事件节点为 8px 圆点
```

### 7. SceneSelector（场景选择器）

选择 AI 角色活动的场景。

```markdown
## SceneSelector

**视觉**: 水平滚动的场景缩略图列表

**场景缩略图卡片**:
┌─────────────┐
│  [场景图]   │  ← 64x64 像素风格预览图
│  ────────  │
│  咖啡馆 ☕  │  ← 场景名 + emoji
│  3人正在这里 │
└─────────────┘

**当前选中**: Cyan 边框 + glow，缩放 1.05x
**Hover**: 边框 + glow
**活跃人数标签**: 右下角，深色背景 pill
```

### 8. AchievementBadge（成就徽章）

成就解锁展示。

```markdown
## AchievementBadge

**视觉**: 圆形徽章 + 标题 + 描述 + 积分

**样式**:
- 未解锁: 灰度 + 锁定图标
- 已解锁: 彩色 + 金色边框
- 新解锁: Gold glow pulse + "NEW!" 标签

**Sizes**:
- Small（列表）: 32px 圆形
- Medium（面板）: 48px 圆形
- Large（弹窗展示）: 80px 圆形 + 详情

**布局（Large 弹窗）**:
┌─────────────────────────────────┐
│         [大图标 80px]           │
│         🏆 成就解锁！            │
│         成就名称                │
│         成就描述                 │
│         ⭐ +10 积分              │
│         [分享] [查看详情]        │
└─────────────────────────────────┘
```

### 9. SummonPanel（召唤面板）

铸造新 NFT 角色的界面。

```markdown
## SummonPanel

**视觉**: 深色面板 + 稀有度概率展示 + 召唤动画

**布局**:
┌────────────────────────────────────────┐
│  🎲 召唤新角色                         │
│  ──────────────────────────────────── │
│  [起源剧本选择器]                      │
│  ┌────────┐┌────────┐┌────────┐       │
│  │ 传奇   ││ 稀有   ││ 普通   │       │
│  │ 14%   ││ 26%   ││ 60%   │       │
│  └────────┘└────────┘└────────┘       │
│                                        │
│  [████████████████████] 60% Common    │
│                                        │
│  [  ✨ 开始召唤  ]                     │
│  ──────────────────────────────────── │
│  每次召唤消耗 0.001 ETH                │
└────────────────────────────────────────┘

**召唤动画**: 像素碎片聚合 → 角色出现 → 稀有度揭晓（光效）
**稀有度选择器**: Radio pill 样式，选中项带稀有度对应色 glow
**概率条**: 渐变色（Common绿→Rare蓝→Epic紫→Legendary橙→Mythic金）
```

### 10. LiveIndicator（直播指示器）

表示系统当前状态的组件。

```markdown
## LiveIndicator

**视觉**: "REC●" 或 "LIVE" 标签，模拟录制状态

**变体**:
- **Recording**: 红点 + "REC" + 红点脉冲动画，持续
- **Live**: 红点 + "LIVE" + pulse，持续（用于表示真人秀进行中）
- **Paused**: 灰点 + "PAUSED"，无动画
- **Offline**: 灰点 + "OFFLINE"

**样式**:
- 字体: Space Grotesk, 11px, bold, uppercase
- 颜色: #ff3b3b（红）/ #8b8fa8（灰）
- 圆角: 4px pill
- 背景: rgba(255,59,59,0.15)（红）/ rgba(139,143,168,0.15)（灰）
- 附加: 字间距 0.1em
```

---

## Page Architecture（页面架构）

### 主页面 Layout

```
┌──────────────────────────────────────────────────────┐
│  CameraHeader（固定顶部，毛玻璃，72px高）             │
│  [REC●] [Logo] [场景选择器]    [Tab]   [成就][设置] │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  AgentList │         MainPanel                       │
│  (角色列表) │  ┌─────────────────────────────────┐   │
│  240px宽   │  │ StoryPanel / PixelWorld / NFT   │   │
│            │  │ (根据Tab切换)                    │   │
│  可折叠    │  │                                   │   │
│            │  │ 动态高度，填满剩余空间            │   │
│            │  └─────────────────────────────────┘   │
│            │                                         │
│            ├─────────────────────────────────────────┤
│            │  BottomBar（场景控制 + 速度 + 快捷操作）│
└────────────┴─────────────────────────────────────────┘
```

### Tab 页面说明

#### Tab 1: 会话（Chat）

**核心体验**: 观看 AI 角色之间的对话，像追剧一样。

**Panel 布局**:
```
┌────────────────────────────────────┐
│ [AgentList 可折叠侧边栏 240px]      │
│ ┌────────────────────────────────┐ │
│ │  对话列表（StoryPanel）          │ │
│ │  - 按时间排列的 DialogueBubble  │ │
│ │  - Highlight 对话特殊样式        │ │
│ │  - 自动滚动到底部               │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │  QuickActions: [新场景][统计]   │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

#### Tab 2: 像素世界（Pixel World）

**核心体验**: 俯瞰 AI 角色的像素世界地图，实时观察。

**Panel 布局**:
```
┌────────────────────────────────────┐
│  PixelWorldView（Canvas 渲染）     │
│  - 全屏渲染                        │
│  - HUD 叠加层（时间/天气/地图）    │
│                                    │
│  ┌──────────────────────┐          │
│  │ MiniMap（右下角64px） │          │
│  └──────────────────────┘          │
│                                    │
│  [场景缩略图快捷切换]               │
└────────────────────────────────────┘
```

#### Tab 3: NFT 市场

**核心体验**: 铸造、收藏、交易 AI 角色 NFT。

**Panel 布局**:
```
┌────────────────────────────────────┐
│ [子Tab: 召唤 | 市场 | 我的收藏]    │
│ ┌────────────────────────────────┐ │
│ │  内容区                         │ │
│ │  - 召唤: SummonPanel            │ │
│ │  - 市场: NFTMarket（购买/出售）  │ │
│ │  - 收藏: NFTGallery（网格）     │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Agent 详情页（/agent/[id]）

访问路径: 点击任意 AgentCard。

```
┌─────────────────────────────────────────────────────┐
│ CameraHeader                                         │
├──────────┬──────────────────────────────────────────┤
│          │  ┌────────────────────────────────────┐ │
│          │  │  Hero区域:                           │ │
│          │  │  [大像素头像]  名字 + 角色            │ │
│          │  │  [性格标签] [目标标签]               │ │
│          │  │  [关系网络预览]                      │ │
│          │  └────────────────────────────────────┘ │
│          │  ┌────────────────────────────────────┐ │
│          │  │  Tab: 档案 | 关系 | 故事 | NFT      │ │
│          │  │  ┌────────────────────────────────┐ │ │
│          │  │  │  档案: 背景/目标/性格详情       │ │ │
│          │  │  │  关系: RelationshipGraph        │ │ │
│          │  │  │  故事: 该角色历史对话/事件      │ │ │
│          │  │  │  NFT: 该角色铸造的 NFT 详情     │ │ │
│          │  │  └────────────────────────────────┘ │ │
│          │  └────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────┘
```

---

## Motion & Animation

```markdown
## Motion Design

### Timing
- **Micro**: 150ms — 按钮 hover、tooltip
- **Standard**: 250ms — 面板展开、tab 切换
- **Enter**: 350ms — 页面进入、新元素出现
- **Drama**: 500ms — 剧情事件、成就解锁

### Easing
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` — 通用
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)` — 元素进入
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)` — 元素退出
- **Spring**: `cubic-bezier(0.34, 1.56, 0.64, 1)` — 弹性效果（卡片 hover、成就）

### Key Animations

**1. Dialogue Appear**（对话出现）:
- 新消息从底部 fade-in + translateY(20px → 0)
- 持续 350ms，stagger 50ms（连续消息）
- Highlight 对话额外：scale(0.98 → 1) + 边框脉冲

**2. Recording Pulse**（录制脉冲）:
- 红点 `opacity: 1 → 0.3`，持续 1s，infinite
- "DRAMA!" 标签 scale(0.9 → 1.05 → 1) bounce

**3. Achievement Unlock**（成就解锁）:
- 徽章从灰色 → 彩色，500ms
- 金色光晕从中心扩散，400ms
- "NEW!" 标签从右上角弹入，spring easing

**4. NFT Rarity Reveal**（NFT 稀有度揭晓）:
- 召唤动画：像素碎片从四角聚合，800ms
- 角色像素精灵从碎片中拼合，600ms
- 稀有度等级文字：scale(0 → 1.2 → 1)，500ms，delay 200ms
- 稀有度对应光效：渐入，400ms

**5. Camera Shutter**（镜头快门）:
- 用于重大事件发生时
- 效果：白色闪光 + shutter sound
- 持续 150ms，快速

**6. Pixel World Ambient**（像素世界环境）:
- 像素角色：每 200ms 切换行走帧
- 像素物体：呼吸动画（轻微 scale 变化）
- 天气粒子：持续飘落/飘动

**7. Tab Switch**（Tab 切换）:
- 当前内容 fade-out 200ms
- 新内容 fade-in + slide-up 250ms

**8. Agent Speak**（角色说话）:
- 头像外圈：脉冲光晕动画（对应情绪色）
- 持续：对话期间，结束即停止
```

---

## Do's and Don'ts

```markdown
## Do's and Don'ts

### DO

✅ **始终使用深色背景** — 所有面板/卡片使用 #0a0b0f 或 #12141c 背景色
✅ **情绪色彩要准确** — 冲突用 Magenta，浪漫用 Pink，秘密用 Gold
✅ **关键 UI 要发光** — Primary CTA、Recording 状态、稀有 NFT 必须带 glow
✅ **保留窥探感** — "REC●"、"LIVE"、时间戳让用户感受到"被直播"
✅ **像素世界要像素化** — Canvas 内只用像素字体，像素角色
✅ **成就解锁要有仪式感** — 动画 + 音效 + 光效，缺一不可
✅ **NFT 稀有度要直观** — 卡片光晕强度直接对应稀有度

### DON'T

❌ **不要用浅色背景** — 不要在主界面用白色/浅色背景（像素世界除外）
❌ **不要所有事件同色** — 普通对话/冲突/浪漫/秘密必须用不同色彩区分
❌ **不要没有层次** — 所有元素同一个深度感会让界面失去吸引力
❌ **不要忽视移动端** — 底部 Tab 栏、触摸友好、响应式一个不能少
❌ **不要过度动画** — 微交互要有，但不能每一步都动画（会疲劳）
❌ **不要混合字体** — Display 用 Space Grotesk，Body 用 IBM Plex Sans，不要混用衬线字体
❌ **不要硬编码颜色** — 所有颜色通过 CSS 变量定义，便于主题切换
```

---

## Component Priority（实施优先级）

### Phase 1: 设计系统基础（P0）
- [ ] 定义 CSS 变量（颜色/字体/间距/阴影）
- [ ] 更新 Tailwind Config
- [ ] 更新全局样式（layout.tsx）
- [ ] 创建 CameraHeader 组件
- [ ] 重构 AgentCard 组件
- [ ] 创建 DialogueBubble 组件
- [ ] 创建 LiveIndicator 组件

### Phase 2: 核心页面（P1）
- [ ] 重构主页面 Layout（新架构）
- [ ] Tab 1: StoryPanel（会话界面）
- [ ] Tab 2: PixelWorldView 增强
- [ ] Tab 3: NFTGallery 重构
- [ ] 重构 BottomBar

### Phase 3: 体验升级（P2）
- [ ] AchievementBadge + AchievementPopup 动画
- [ ] SummonPanel 召唤动画
- [ ] StoryTimeline 组件
- [ ] RelationshipGraph 重构（SVG 暗色风格）
- [ ] 过渡动画系统

### Phase 4: 打磨（P3）
- [ ] 全局音效集成（Web Audio API）
- [ ] 像素世界粒子/天气效果
- [ ] Camera Shutter 效果
- [ ] Dark/Light 主题切换
```

---

## CSS Variables（设计 Token）

```css
/* ===== 楚门World Design Tokens ===== */

:root {
  /* Colors - Background */
  --bg-deep: #0a0b0f;
  --bg-surface: #12141c;
  --bg-elevated: #1a1d28;
  --bg-glass: rgba(255, 255, 255, 0.05);
  --bg-pixel: #0f0f1a;

  /* Colors - Accent */
  --accent-cyan: #00d4ff;
  --accent-magenta: #ff2d78;
  --accent-gold: #ffb800;
  --accent-green: #00ff88;
  --accent-amber: #ff9500;

  /* Colors - Text */
  --text-primary: #e8e8f0;
  --text-secondary: #8b8fa8;
  --text-muted: #4a4d5e;

  /* Colors - Border */
  --border: #2a2d3a;
  --border-active: #3d4055;
  --border-focus: #00d4ff;

  /* Colors - Pixel World */
  --pixel-cyan: #00ffff;
  --pixel-magenta: #ff00ff;
  --pixel-yellow: #ffff00;
  --pixel-green: #00ff00;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
  --glow-cyan: 0 0 20px rgba(0, 212, 255, 0.4);
  --glow-magenta: 0 0 20px rgba(255, 45, 120, 0.4);
  --glow-gold: 0 0 20px rgba(255, 184, 0, 0.3);

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-pixel: 'Press Start 2P', cursive;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;

  /* Animation */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## Agent Prompt Guide（第9部分 - AI工具快速调用）

当你让 AI 编码工具（Claude Code、Cursor、Vercel v0 等）按此设计生成 UI 时，使用以下快捷参考。

### 快速颜色变量

```markdown
## 颜色变量（直接复制使用）

**背景色**
- 主背景（深邃黑）: #0a0b0f
- 卡片背景: #12141c
- 浮层/Modal背景: #1a1d28
- 毛玻璃: rgba(255,255,255,0.05) + blur(20px)
- 像素世界背景: #0f0f1a

**主色调**
- 主交互/LIVE指示: #00d4ff（cyan）
- 冲突/浪漫/警示: #ff2d78（magenta）
- 成就/稀有NFT: #ffb800（gold）
- 正向事件: #00ff88（green）
- 剧情转折: #ff9500（amber）

**文本色**
- 主要文本: #e8e8f0
- 次要文本: #8b8fa8
- 占位符/禁用: #4a4d5e

**边框色**
- 默认边框: #2a2d3a
- 聚焦边框: #00d4ff（带glow）

**NFT稀有度**
- Common: #9ca3af（无光晕）
- Uncommon: #22c55e（微光）
- Rare: #3b82f6（发光）
- Epic: #a855f7（强发光）
- Legendary: #f97316（脉冲）
- Mythic: #fbbf24（彩虹脉冲）
```

### 组件风格速查

```markdown
## 组件规范

**按钮**
- 背景: #12141c
- 边框: 1px solid #2a2d3a
- 圆角: 8px
- Hover: 边框变#00d4ff + box-shadow glow
- 主按钮: 背景#00d4ff + 白色文字 + cyan glow

**卡片**
- 背景: #12141c
- 边框: 1px solid #2a2d3a
- 圆角: 12px
- 内边距: 20px
- Hover: 上浮2px + 边框发光
- 阴影: 0 2px 8px rgba(0,0,0,0.3)

**输入框**
- 背景: #0a0b0f
- 边框: 1px solid #2a2d3a
- 圆角: 8px
- 聚焦: 边框变#00d4ff + glow

**胶囊标签/Pill**
- 背景: rgba(255,255,255,0.08)
- 圆角: 9999px
- 内边距: 4px 12px
```

### 字体速查

```markdown
## 字体使用

**导入**
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Press+Start+2P&display=swap');
```

**使用场景**
- 标题/Display: font-family: 'Space Grotesk', sans-serif
- 正文/对话: font-family: 'IBM Plex Sans', sans-serif
- 代码/标签: font-family: 'JetBrains Mono', monospace
- 像素世界: font-family: 'Press Start 2P', cursive（仅10px）

**字号层级**
- Hero: 48px / 700 / letter-spacing -2.4px
- 大标题: 36px / 600
- 区块标题: 28px / 600
- 卡片标题: 22px / 600
- 正文: 16px / 400
- 标签: 12px / 400
```

### Tailwind Classes 速查

```markdown
## 常用 Tailwind 类

**背景**
- bg-chumen-deep: #0a0b0f
- bg-chumen-surface: #12141c
- bg-chumen-elevated: #1a1d28

**文字**
- text-chumen-text: #e8e8f0
- text-chumen-text-secondary: #8b8fa8

**边框**
- border-chumen-border: #2a2d3a
- border-chumen-cyan: #00d4ff

**阴影/Glow**
- shadow-chumen-sm/md/lg
- shadow-glow-cyan/magenta/gold

**动画**
- animate-fade-in-up
- animate-recording-pulse
- animate-glow-pulse
```

### AI Prompt 模板

```markdown
## Prompt 模板

**基础UI组件**
"创建一个[组件名]，风格是楚门World的暗色电影感设计。
主要颜色是#00d4ff（cyan），背景#12141c，使用毛玻璃效果。"

**NFT相关**
"创建一个NFT卡片，展示角色信息。
稀有度光晕效果：Epic用紫色#a855f7强发光，Legendary用橙色#f97316脉冲。"

**像素世界**
"创建一个像素风格的HUD界面，字体用Press Start 2P，
颜色用#00ffff（cyan）和#ff00ff（magenta）。"

**对话界面**
"创建一个Chat UI，气泡背景#1a1d28，
冲突事件用#ff2d78边框高亮，浪漫事件用粉色。"
```

### 设计原则提醒

```markdown
## AI生成时必须遵守

✅ DO:
- 始终使用深色背景（#0a0b0f 或 #12141c）
- 情绪色彩必须准确：冲突=#ff2d78，浪漫=#ff69b4
- 主交互元素带glow效果
- 保留"LIVE"/"REC●"等窥探感元素

❌ DON'T:
- 不要用浅色/白色背景
- 不要所有元素同一深度
- 不要混用衬线字体
- 颜色必须通过CSS变量定义
```

---

*DESIGN.md 是活文档，随着产品迭代持续更新。*
*最后更新：2026-04-06*
