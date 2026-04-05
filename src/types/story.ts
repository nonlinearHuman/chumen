// 故事系统类型定义
// src/types/story.ts

import { Agent } from './agent';

// ===== 事件类型 =====
export type EventType = 
  | 'conflict'      // 冲突
  | 'reconciliation' // 和解
  | 'romance'       // 暧昧/浪漫
  | 'betrayal'      // 背叛
  | 'surprise'      // 惊喜
  | 'tragedy'       // 悲剧
  | 'victory';      // 胜利

// ===== 触发类型 =====
export type TriggerType = 
  | 'proximity'     // 角色接近
  | 'relationship'  // 关系状态
  | 'random'        // 随机事件
  | 'time';         // 时间触发

// ===== 后果类型 =====
export type ConsequenceType = 
  | 'relationship_change' // 关系变化
  | 'secret_reveal'       // 秘密揭露
  | 'item_transfer'       // 物品转移
  | 'status_change';      // 状态变化

// ===== 关系类型 =====
export type RelationType = 
  | 'stranger'       // 陌生人
  | 'acquaintance'   // 熟人
  | 'friend'         // 朋友
  | 'close_friend'   // 密友
  | 'rival'          // 对手
  | 'enemy'          // 敌人
  | 'love_interest'  // 暗恋对象
  | 'lover'          // 恋人
  | 'ex'             // 前任
  | 'family'         // 家人
  | 'colleague'      // 同事
  | 'competitor';    // 竞争对手

// ===== 事件触发条件 =====
export interface EventTrigger {
  type: TriggerType;
  conditions: Record<string, any>;
  probability?: number; // 触发概率 0-1
  cooldown?: number;    // 冷却时间（秒）
}

// ===== 事件后果 =====
export interface Consequence {
  type: ConsequenceType;
  target: string;  // 'both' | characterId
  value: any;
  description?: string;
}

// ===== 故事事件 =====
export interface StoryEvent {
  id: string;
  type: EventType;
  participants: string[];     // 参与角色ID
  location: string;           // 场景ID
  trigger: EventTrigger;      // 触发条件
  content: string;            // 事件描述
  consequences: Consequence[]; // 后果
  timestamp: number;
  dialogue?: Dialogue[];      // 生成的对话
  resolved?: boolean;         // 是否已解决
}

// ===== 对话 =====
export interface Dialogue {
  characterId: string;
  characterName: string;
  content: string;
  emotion?: 'happy' | 'angry' | 'sad' | 'love' | 'neutral' | 'surprise';
}

// ===== 关系事件历史 =====
export interface RelationEvent {
  eventId: string;
  type: EventType;
  timestamp: number;
  change: number;  // sentiment 变化值
  description: string;
}

// ===== 角色关系 =====
export interface Relationship {
  id: string;                   // `${characterA}-${characterB}`
  characterA: string;           // 角色A ID
  characterB: string;           // 角色B ID
  type: RelationType;           // 关系类型
  strength: number;             // 强度 0-100
  sentiment: number;            // 情感 -100 到 100（敌对到友好）
  history: RelationEvent[];     // 关系历史事件
  secrets: string[];            // 共同秘密
  lastInteraction: number;      // 最后互动时间
}

// ===== 事件模板 =====
export interface EventTemplate {
  id: string;
  type: EventType;
  content: string;              // 事件描述模板，支持 {A}, {B} 占位符
  consequences: Consequence[];
  minParticipants?: number;
  maxParticipants?: number;
  requiredRelationships?: {     // 必需的关系条件
    minSentiment?: number;
    maxSentiment?: number;
    minStrength?: number;
    types?: RelationType[];
  };
  weight?: number;              // 权重，用于随机选择
}

// ===== 故事状态 =====
export interface StoryState {
  currentEvent: StoryEvent | null;
  recentEvents: StoryEvent[];
  relationships: Relationship[];
  eventQueue: StoryEvent[];
  lastEventTime: number;
  totalEvents: number;
}

// ===== 事件影响配置 =====
export const EVENT_IMPACT: Record<EventType, number> = {
  conflict: -15,
  reconciliation: +15,
  romance: +20,
  betrayal: -30,
  surprise: +5,
  tragedy: -20,
  victory: +10,
};

// ===== 关系类型阈值 =====
export const RELATION_THRESHOLDS = {
  enemy: { maxSentiment: -50 },
  rival: { minSentiment: -50, maxSentiment: -20 },
  competitor: { minSentiment: -20, maxSentiment: 0 },
  stranger: { minSentiment: 0, maxSentiment: 10, maxStrength: 10 },
  acquaintance: { minStrength: 10, maxStrength: 30 },
  colleague: { minStrength: 15, minSentiment: 0 },
  friend: { minStrength: 30, minSentiment: 0, maxSentiment: 50 },
  close_friend: { minStrength: 50, minSentiment: 30 },
  love_interest: { minStrength: 60, minSentiment: 50, maxSentiment: 70 },
  lover: { minStrength: 80, minSentiment: 70 },
  ex: { minStrength: 30 }, // 特殊标记
  family: { minStrength: 50 }, // 特殊标记
};

// ===== 事件类型描述 =====
export const EVENT_TYPE_DESC: Record<EventType, { name: string; nameCN: string; color: string; icon: string }> = {
  conflict: { name: 'Conflict', nameCN: '冲突', color: '#e74c3c', icon: '⚔️' },
  reconciliation: { name: 'Reconciliation', nameCN: '和解', color: '#3498db', icon: '🤝' },
  romance: { name: 'Romance', nameCN: '暧昧', color: '#e91e8c', icon: '💕' },
  betrayal: { name: 'Betrayal', nameCN: '背叛', color: '#8e44ad', icon: '🗡️' },
  surprise: { name: 'Surprise', nameCN: '惊喜', color: '#f39c12', icon: '🎉' },
  tragedy: { name: 'Tragedy', nameCN: '悲剧', color: '#2c3e50', icon: '💔' },
  victory: { name: 'Victory', nameCN: '胜利', color: '#27ae60', icon: '🏆' },
};
