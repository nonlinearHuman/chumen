// NFT 相关类型（含故事线）
// src/types/nft.ts

export interface NFTAgent {
  id: string;
  tokenId: string;
  owner: string;
  price: string;
  listed: boolean;
  createdAt: number;
  // ===== 新增：故事线相关 =====
  minterAddress?: string;   // 铸造者钱包地址
  origin?: OriginStory;      // 起源剧本
  rarity?: Rarity;          // 稀有度
  storyEvents?: StoryEvent[]; // 角色经历的大事件
  relationships?: Relationship[]; // 角色关系
  status?: AgentStatus;     // 当前状态
  stats?: AgentStats;        // 人气值/曝光统计
}

export interface NFTListing {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  seller: string;
  price: string;
  timestamp: number;
  rarity?: Rarity;
}

// ===== 起源剧本 =====
export type Rarity = 'common' | 'rare' | 'legendary';

export interface OriginStory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: Rarity;
  // 该起源绑定的预设剧情线
  storyArcs: string[];
  // 稀有度概率权重
  weight: number;
}

export const ORIGIN_STORIES: OriginStory[] = [
  {
    id: 'fallen_angel',
    name: '失落的复仇者',
    description: '曾经辉煌，因背叛跌入谷底，如今隐忍蛰伏，只为一朝复仇',
    emoji: '😈',
    rarity: 'legendary',
    storyArcs: ['背叛与信任', '东山再起', '真相揭露'],
    weight: 1,
  },
  {
    id: 'hidden_identity',
    name: '隐藏身份的卧底',
    description: '表面身份只是伪装，背后有不为人知的秘密使命',
    emoji: '🎭',
    rarity: 'legendary',
    storyArcs: ['身份暴露危机', '双面人生', '最终抉择'],
    weight: 1,
  },
  {
    id: 'rags_to_riches',
    name: '逆袭的野心家',
    description: '从社会底层爬上来，对权力和成功有强烈渴望',
    emoji: '📈',
    rarity: 'rare',
    storyArcs: ['创业与危机', '阶级跨越', '金钱与道德'],
    weight: 3,
  },
  {
    id: 'secret_love',
    name: '暗恋的秘密',
    description: '心中藏着一份无法说出口的感情，在日常中默默守护',
    emoji: '💔',
    rarity: 'rare',
    storyArcs: ['暗恋与告白', '三角关系', '爱与放手'],
    weight: 3,
  },
  {
    id: 'betrayal_victim',
    name: '被背叛的受害者',
    description: '曾经信任的人给了致命一击，从此对人心存戒备',
    emoji: '🩸',
    rarity: 'rare',
    storyArcs: ['背叛的阴影', '重建信任', '原谅或复仇'],
    weight: 3,
  },
  {
    id: 'idealist',
    name: '天真的理想主义者',
    description: '相信真善美，在现实中屡屡碰壁但依然坚持',
    emoji: '🌟',
    rarity: 'common',
    storyArcs: ['现实打击', '坚守与妥协', '成长或沉沦'],
    weight: 5,
  },
  {
    id: 'opportunist',
    name: '精明的机会主义者',
    description: '永远在寻找下一个机会，善于利用一切资源',
    emoji: '🦊',
    rarity: 'common',
    storyArcs: ['利益交换', '风险博弈', '成败论英雄'],
    weight: 5,
  },
  {
    id: 'mysterious_stranger',
    name: '神秘的陌生人',
    description: '突然出现在城市，带着不为人知的过去和目的',
    emoji: '🌫️',
    rarity: 'legendary',
    storyArcs: ['身世之谜', '融入或离去', '命运的交汇'],
    weight: 1,
  },
];

// ===== 故事事件 =====
export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  type: 'romance' | 'conflict' | 'career' | 'secret' | 'friendship' | 'family' | 'adventure';
  timestamp: number;
  emoji: string;
  importance: 'low' | 'medium' | 'high' | 'legendary';
  // 涉及的其他角色
  involvedAgents?: string[];
  // 是否铸造了关系NFT
  hasRelationNFT?: boolean;
}

// ===== 角色关系 =====
export interface Relationship {
  agentId: string;
  agentName: string;
  agentEmoji: string;
  level: number; // -100 到 100，负数为敌对
  type: 'friend' | 'enemy' | 'romantic' | 'family' | 'professional' | 'stranger';
  lastEvent?: string; // 最近一次关系变化的事件
}

// ===== 角色状态 =====
export type AgentStatus = 
  | 'rising_star'    // 春风得意
  | 'in_trouble'     // 身陷困境
  | 'secret_agenda'  // 暗中调查
  | 'heart_broken'   // 情感受挫
  | 'ambitious'      // 野心勃勃
  | 'mysterious'     // 神秘莫测
  | 'stable'         // 平稳生活
  | 'chaos';         // 多事之秋

export const STATUS_LABELS: Record<AgentStatus, { label: string; color: string; emoji: string }> = {
  'rising_star': { label: '春风得意', color: 'text-green-600 bg-green-50', emoji: '🌟' },
  'in_trouble': { label: '身陷困境', color: 'text-red-600 bg-red-50', emoji: '😰' },
  'secret_agenda': { label: '暗中调查', color: 'text-purple-600 bg-purple-50', emoji: '🔍' },
  'heart_broken': { label: '情感受挫', color: 'text-pink-600 bg-pink-50', emoji: '💔' },
  'ambitious': { label: '野心勃勃', color: 'text-orange-600 bg-orange-50', emoji: '🔥' },
  'mysterious': { label: '神秘莫测', color: 'text-gray-600 bg-gray-50', emoji: '🌫️' },
  'stable': { label: '平稳生活', color: 'text-blue-600 bg-blue-50', emoji: '☀️' },
  'chaos': { label: '多事之秋', color: 'text-yellow-600 bg-yellow-50', emoji: '🌪️' },
};

// ===== 角色统计 =====
export interface AgentStats {
  popularity: number;      // 人气值（影响交易需求）
  exposureCount: number;   // 剧情曝光次数
  dramaCount: number;      // 参演大事件次数
  relationshipChangeCount: number; // 关系变化次数
  tradeCount: number;      // 被交易次数
}

// ===== 稀有度配置 =====
export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; glow: string; badge: string }> = {
  legendary: { label: '传奇', color: 'text-yellow-600', glow: 'shadow-yellow-400', badge: '🌟 传奇' },
  rare: { label: '稀有', color: 'text-purple-600', glow: 'shadow-purple-400', badge: '💎 稀有' },
  common: { label: '普通', color: 'text-gray-600', glow: 'shadow-gray-400', badge: '⚪ 普通' },
};
