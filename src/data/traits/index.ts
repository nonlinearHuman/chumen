// 特征数据汇总导出
import { AgentTrait, TraitCategory } from '@/types/traits';
import { BODY_TRAITS } from './body';
import { HAIR_TRAITS } from './hair';
import { EYES_TRAITS } from './eyes';
import { OUTFIT_TRAITS } from './outfit';
import { ACCESSORY_TRAITS } from './accessory';
import { EFFECT_TRAITS } from './effect';

// 导出所有特征数据
export const TRAITS: Record<TraitCategory, AgentTrait[]> = {
  body: BODY_TRAITS,
  skin: [], // 肤色通过颜色调色板实现，不是独立特征
  hair: HAIR_TRAITS,
  hair_color: [], // 发色通过颜色调色板实现
  eyes: EYES_TRAITS,
  outfit: OUTFIT_TRAITS,
  accessory: ACCESSORY_TRAITS,
  marking: [], // 标记特征待实现
  effect: EFFECT_TRAITS,
};

// 统计信息
export const TRAIT_STATS = {
  body: BODY_TRAITS.length,
  hair: HAIR_TRAITS.length,
  eyes: EYES_TRAITS.length,
  outfit: OUTFIT_TRAITS.length,
  accessory: ACCESSORY_TRAITS.length,
  effect: EFFECT_TRAITS.length,
  total: BODY_TRAITS.length + HAIR_TRAITS.length + EYES_TRAITS.length + 
         OUTFIT_TRAITS.length + ACCESSORY_TRAITS.length + EFFECT_TRAITS.length,
};

// 按稀有度统计
export const getTraitsByRarity = (rarity: string): AgentTrait[] => {
  const allTraits: AgentTrait[] = [
    ...BODY_TRAITS,
    ...HAIR_TRAITS,
    ...EYES_TRAITS,
    ...OUTFIT_TRAITS,
    ...ACCESSORY_TRAITS,
    ...EFFECT_TRAITS,
  ];
  return allTraits.filter(trait => trait.rarity === rarity);
};

// 获取指定类别的特征
export const getTraitsByCategory = (category: TraitCategory): AgentTrait[] => {
  return TRAITS[category] || [];
};

// 随机选择特征（根据稀有度权重）
export const selectRandomTrait = (
  category: TraitCategory, 
  rarityWeight?: Record<string, number>
): AgentTrait | null => {
  const traits = TRAITS[category];
  if (traits.length === 0) return null;
  
  if (rarityWeight) {
    // 根据稀有度权重选择
    const weighted = traits.map(trait => ({
      trait,
      weight: rarityWeight[trait.rarity] || 1,
    }));
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of weighted) {
      random -= item.weight;
      if (random <= 0) return item.trait;
    }
  }
  
  // 简单随机
  return traits[Math.floor(Math.random() * traits.length)];
};
