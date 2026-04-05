// 特征系统类型定义

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type TraitCategory = 
  | 'body'        // 体型
  | 'skin'        // 肤色
  | 'hair'        // 发型
  | 'hair_color'  // 发色
  | 'eyes'        // 眼型
  | 'outfit'      // 服装
  | 'accessory'   // 配件（帽子/眼镜/耳环）
  | 'marking'     // 特殊标记（伤疤/纹身）
  | 'effect';     // 特效（光环/粒子）

export interface AgentTrait {
  id: string;
  category: TraitCategory;
  name: string;
  nameZh: string; // 中文名
  rarity: Rarity;
  pixels: number[][]; // 16x16 像素数据，值为颜色索引
  offsetX: number;
  offsetY: number;
  colorizable: boolean; // 是否可变色
  colorCategory?: string; // 属于哪个颜色调色板
}

export interface ColorPalette {
  [category: string]: string[];
}

// NFT 交易属性
export interface NFTTradingAttrs {
  // 价格相关
  floorPrice?: number;      // 地板价（ETH/USDC）
  lastSoldPrice?: number;   // 最近成交价
  lastSoldAt?: number;      // 最近成交时间（timestamp）
  
  // 稀有度排名
  rank: number;             // 全局排名（1 = 最稀有）
  score: number;            // 稀有度分数（越高越稀有）
  percentile: number;       // 百分位（如 0.01 = top 1%）
  
  // 特征稀有度
  traitRarity: Record<string, number>; // 每个特征的稀有度分数
  
  // 代数与创造
  generation: number;       // 代数（Gen0最稀有）
  creator: string;          // 创造者地址/ID
  mintedAt: number;         // 铸造时间（timestamp）
  
  // 交易统计
  totalSales: number;       // 总交易次数
  averagePrice: number;     // 平均成交价
  priceChange24h: number;   // 24小时价格变化%
}

// NFT 收藏属性
export interface NFTCollectionAttrs {
  // 视觉评分
  visualScore: number;      // AI审美评分（1-100）
  visualTags: string[];     // 视觉标签（如"酷炫"、"可爱"、"神秘"）
  
  // 故事与背景
  story?: string;           // 背景故事（Legendary/Mythic专属）
  personality: string[];    // 性格标签
  keywords: string[];       // 关键词（用于搜索）
  
  // 收藏分类
  collection: string;       // 收藏品名称（如"第一代"、"霓虹系列"）
  series?: string;          // 系列（如"赛博朋克"、"复古"）
  
  // 成就系统
  milestones: string[];     // 解锁的成就
  participatedEvents: string[]; // 参与的剧情事件
  
  // 社交证明
  favoriteCount: number;    // 收藏数
  viewCount: number;        // 浏览数
  holderCount: number;      // 持有者数量（NFT场景）
}

export interface ComposedSprite {
  id: string;
  dna: string; // 唯一DNA序列
  rarity: Rarity;
  traits: AgentTrait[];
  colors: Record<string, string>;
  pixels?: number[][]; // 最终合成的16x16像素（可选，用于传输优化）
  previewUrl?: string; // 合成后的预览图（base64 data URL）
  createdAt: number;
  story?: string; // AI生成的故事（Legendary/Mythic专属）
  
  // NFT 属性
  nftAttrs?: NFTTradingAttrs;
  collectionAttrs?: NFTCollectionAttrs;
  estimatedPrice?: number; // 估算价格（ETH）
}

export interface TraitCategoryConfig {
  name: string;
  nameZh: string;
  layer: number; // 绘制层级，从小到大
  required: boolean; // 是否必须
  mutuallyExclusive?: string[]; // 互斥的其他类别
}

// 特征类别配置
export const TRAIT_CATEGORIES: Record<TraitCategory, TraitCategoryConfig> = {
  body: { name: 'Body', nameZh: '体型', layer: 0, required: true },
  skin: { name: 'Skin', nameZh: '肤色', layer: 1, required: true },
  hair: { name: 'Hair', nameZh: '发型', layer: 5, required: false },
  hair_color: { name: 'Hair Color', nameZh: '发色', layer: 5.5, required: false },
  eyes: { name: 'Eyes', nameZh: '眼型', layer: 3, required: true },
  outfit: { name: 'Outfit', nameZh: '服装', layer: 4, required: true },
  accessory: { name: 'Accessory', nameZh: '配件', layer: 6, required: false },
  marking: { name: 'Marking', nameZh: '标记', layer: 2, required: false },
  effect: { name: 'Effect', nameZh: '特效', layer: 7, required: false },
};

// 稀有度配置
export const RARITY_CONFIG: Record<Rarity, { probability: number; minTraits: number; maxTraits: number; color: string }> = {
  common: { probability: 0.50, minTraits: 2, maxTraits: 3, color: '#9ca3af' },
  uncommon: { probability: 0.30, minTraits: 3, maxTraits: 4, color: '#22c55e' },
  rare: { probability: 0.15, minTraits: 4, maxTraits: 5, color: '#3b82f6' },
  epic: { probability: 0.04, minTraits: 5, maxTraits: 6, color: '#a855f7' },
  legendary: { probability: 0.009, minTraits: 6, maxTraits: 7, color: '#f59e0b' },
  mythic: { probability: 0.001, minTraits: 7, maxTraits: 9, color: '#ef4444' },
};

// 颜色调色板
export const COLOR_PALETTES: ColorPalette = {
  skin: [
    '#f5d0c5', // 浅色
    '#e8c4a0', 
    '#d4a574', 
    '#c4a574', 
    '#8d5524', 
    '#5c3317', // 深色
  ],
  hair: [
    '#1a1a1a', // 黑色
    '#2d1f1f', // 深褐
    '#6b4423', // 棕色
    '#8b4513', // 浅棕
    '#d4a056', // 金色
    '#ffd700', // 亮金
    '#ff6b6b', // 粉红
    '#4ecdc4', // 青色
    '#9b59b6', // 紫色
    '#e74c3c', // 红色
  ],
  outfit: [
    '#4a90d9', // 蓝色
    '#27ae60', // 绿色
    '#e74c3c', // 红色
    '#9b59b6', // 紫色
    '#f39c12', // 橙色
    '#2c3e50', // 深蓝
    '#e91e8c', // 粉色
    '#1abc9c', // 青绿
    '#34495e', // 灰蓝
    '#8e44ad', // 深紫
  ],
  eyes: [
    '#8b4513', // 棕色
    '#4a90d9', // 蓝色
    '#27ae60', // 绿色
    '#2c3e50', // 深蓝
    '#9b59b6', // 紫色
    '#e74c3c', // 红色
    '#f39c12', // 琥珀色
    '#1abc9c', // 青色
  ],
  effect: [
    '#ffd700', // 金色光环
    '#ff6b6b', // 红色光环
    '#4ecdc4', // 青色光环
    '#9b59b6', // 紫色光环
    '#ffffff', // 白色光环
  ],
};
