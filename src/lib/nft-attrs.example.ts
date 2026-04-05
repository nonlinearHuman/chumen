// NFT 属性系统测试示例

import { RarityCalculator, rarityCalculator } from './rarityCalculator';
import { VisualScorer, visualScorer } from './visualScorer';
import { PriceEstimator, priceEstimator } from './priceEstimator';
import { Rarity, ComposedSprite } from '@/types/traits';

// 示例 Agent
const exampleAgent: ComposedSprite = {
  id: 'example-001',
  dna: '0x1234567890abcdef',
  rarity: 'legendary',
  traits: [
    { id: 'body-01', category: 'body', name: 'Athletic', nameZh: '健壮', rarity: 'common', pixels: [], offsetX: 0, offsetY: 0, colorizable: false },
    { id: 'skin-03', category: 'skin', name: 'Tan', nameZh: '古铜', rarity: 'uncommon', pixels: [], offsetX: 0, offsetY: 0, colorizable: true },
    { id: 'hair-05', category: 'hair', name: 'Wild', nameZh: '狂野', rarity: 'rare', pixels: [], offsetX: 0, offsetY: 0, colorizable: true },
    { id: 'eyes-07', category: 'eyes', name: 'Mystic', nameZh: '神秘', rarity: 'epic', pixels: [], offsetX: 0, offsetY: 0, colorizable: true },
    { id: 'outfit-09', category: 'outfit', name: 'Cyber', nameZh: '赛博', rarity: 'legendary', pixels: [], offsetX: 0, offsetY: 0, colorizable: true },
    { id: 'effect-01', category: 'effect', name: 'Halo', nameZh: '光环', rarity: 'mythic', pixels: [], offsetX: 0, offsetY: 0, colorizable: true },
  ],
  colors: {
    skin: '#d4a574',
    hair: '#ffd700',
    outfit: '#4a90d9',
    eyes: '#9b59b6',
    effect: '#ffffff',
  },
  createdAt: Date.now(),
  story: '传说中的存在，拥有神秘光环等稀有特征...',
};

console.log('=== NFT 属性系统测试 ===\n');

// 1. 稀有度计算
console.log('1. 稀有度计算示例');
const { nftAttrs, traitRarity } = rarityCalculator.generateTradingAttrs(
  exampleAgent,
  [],
  0,
  'chumen-system'
);

console.log('稀有度分数:', nftAttrs.score.toFixed(2));
console.log('排名:', nftAttrs.rank);
console.log('百分位:', (nftAttrs.percentile * 100).toFixed(2) + '%');
console.log('特征稀有度:');
Object.entries(traitRarity).forEach(([id, score]) => {
  console.log(`  - ${id}: ${score.toFixed(2)}`);
});

// 2. 视觉评分
console.log('\n2. 视觉评分示例');
const { collectionAttrs, visualScore, visualTags } = visualScorer.generateCollectionAttrs(
  exampleAgent,
  0
);

console.log('视觉评分:', visualScore);
console.log('视觉标签:', visualTags.join(', '));
console.log('性格标签:', collectionAttrs.personality.join(', '));
console.log('收藏品:', collectionAttrs.collection);

// 3. 价格估算
console.log('\n3. 价格估算示例');
const estimatedPrice = priceEstimator.estimateInitialPrice(
  exampleAgent.rarity,
  nftAttrs,
  collectionAttrs
);

console.log('基础价格:', priceEstimator.estimateBasePrice(exampleAgent.rarity), 'ETH');
console.log('估算价格:', priceEstimator.formatPrice(estimatedPrice));

const priceRange = priceEstimator.estimatePriceRange(
  exampleAgent.rarity,
  nftAttrs,
  collectionAttrs
);
console.log('价格范围:', priceEstimator.formatPrice(priceRange.min), '-', priceEstimator.formatPrice(priceRange.max));

// 4. 组合示例
console.log('\n4. 完整 NFT 属性');
const fullAgent: ComposedSprite = {
  ...exampleAgent,
  nftAttrs,
  collectionAttrs,
  estimatedPrice,
};

console.log('Agent ID:', fullAgent.id);
console.log('稀有度:', fullAgent.rarity);
console.log('分数:', fullAgent.nftAttrs?.score.toFixed(2));
console.log('视觉评分:', fullAgent.collectionAttrs?.visualScore);
console.log('估算价格:', priceEstimator.formatPrice(fullAgent.estimatedPrice || 0));

console.log('\n=== 测试完成 ===');
