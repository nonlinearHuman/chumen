// 成就定义
// src/data/achievements.ts

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji图标
  category: 'story' | 'social' | 'nft' | 'explore' | 'special';
  requirement: {
    type: 'dialogue_count' | 'event_count' | 'npc_trigger' | 'scene_visit' |
          'relationship_level' | 'nft_mint' | 'legendary_spawn' | 'play_time';
    value: number;
  };
  reward?: {
    type: 'badge' | 'title' | 'unlock';
    description: string;
  };
  secret?: boolean; // 隐藏成就
  points: number; // 成就点数
}

export const ACHIEVEMENTS: Achievement[] = [
  // 故事类
  {
    id: 'first_dialogue',
    title: '初来乍到',
    description: '观看了第一条AI对话',
    icon: '👋',
    category: 'story',
    requirement: { type: 'dialogue_count', value: 1 },
    points: 10,
  },
  {
    id: 'story_lover',
    title: '剧情达人',
    description: '观看了100条对话',
    icon: '📖',
    category: 'story',
    requirement: { type: 'dialogue_count', value: 100 },
    points: 50,
  },
  {
    id: 'dialogue_500',
    title: '沉浸观众',
    description: '观看了500条对话',
    icon: '🎬',
    category: 'story',
    requirement: { type: 'dialogue_count', value: 500 },
    points: 100,
  },

  // 社交类
  {
    id: 'first_trigger',
    title: '八卦之魂',
    description: '触发了第一次NPC事件',
    icon: '🗣️',
    category: 'social',
    requirement: { type: 'npc_trigger', value: 1 },
    points: 10,
  },
  {
    id: 'gossip_master',
    title: '情报大师',
    description: '触发了10次NPC事件',
    icon: '🐦',
    category: 'social',
    requirement: { type: 'npc_trigger', value: 10 },
    points: 50,
  },
  {
    id: 'drama_king',
    title: '戏剧之王',
    description: '触发了50次NPC事件',
    icon: '👑',
    category: 'social',
    requirement: { type: 'npc_trigger', value: 50 },
    points: 100,
  },

  // 探索类
  {
    id: 'scene_explorer',
    title: '场景探索者',
    description: '访问了3个不同场景',
    icon: '🗺️',
    category: 'explore',
    requirement: { type: 'scene_visit', value: 3 },
    points: 20,
  },
  {
    id: 'world_traveler',
    title: '环球旅行家',
    description: '访问了全部9个场景',
    icon: '✈️',
    category: 'explore',
    requirement: { type: 'scene_visit', value: 9 },
    points: 100,
  },

  // NFT类
  {
    id: 'first_mint',
    title: '铸造新手',
    description: '铸造了第一个NFT角色',
    icon: '🏭',
    category: 'nft',
    requirement: { type: 'nft_mint', value: 1 },
    points: 30,
  },
  {
    id: 'nft_collector',
    title: 'NFT收藏家',
    description: '铸造了5个NFT角色',
    icon: '🖼️',
    category: 'nft',
    requirement: { type: 'nft_mint', value: 5 },
    points: 80,
  },

  // 稀有类
  {
    id: 'legendary_finder',
    title: '传奇猎人',
    description: '发现了传奇角色',
    icon: '⭐',
    category: 'special',
    requirement: { type: 'legendary_spawn', value: 1 },
    points: 200,
    secret: true,
  },

  // 时长类
  {
    id: 'dedicated_fan',
    title: '忠实粉丝',
    description: '游戏时长超过1小时',
    icon: '⏰',
    category: 'special',
    requirement: { type: 'play_time', value: 3600000 },
    points: 50,
  },
  {
    id: 'super_fan',
    title: '超级粉丝',
    description: '游戏时长超过10小时',
    icon: '🏆',
    category: 'special',
    requirement: { type: 'play_time', value: 36000000 },
    points: 150,
  },

  // 事件类
  {
    id: 'event_witness',
    title: '事件见证者',
    description: '见证了10个戏剧事件',
    icon: '🎭',
    category: 'story',
    requirement: { type: 'event_count', value: 10 },
    points: 30,
  },
];

// 根据ID快速查找
export const getAchievementById = (id: string): Achievement | undefined =>
  ACHIEVEMENTS.find(a => a.id === id);

// 根据分类获取成就
export const getAchievementsByCategory = (category: Achievement['category']) =>
  ACHIEVEMENTS.filter(a => a.category === category);

// 成就分类名称
export const CATEGORY_NAMES: Record<Achievement['category'], string> = {
  story: '📜 剧情',
  social: '💬 社交',
  nft: '💎 NFT',
  explore: '🧭 探索',
  special: '🌟 特殊',
};

export const CATEGORY_ORDER: Achievement['category'][] = [
  'story', 'social', 'explore', 'nft', 'special'
];
