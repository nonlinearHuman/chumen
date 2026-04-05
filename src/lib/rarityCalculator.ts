// 稀有度计算器 - 计算 Agent 的稀有度分数和排名
import { AgentTrait, Rarity, ComposedSprite, RARITY_CONFIG } from '@/types/traits';

// 稀有度权重
const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 5,
  epic: 20,
  legendary: 100,
  mythic: 500,
};

// 特征类别权重（某些类别更稀有）
const CATEGORY_WEIGHTS: Record<string, number> = {
  body: 0.5,
  skin: 0.3,
  hair: 1.0,
  hair_color: 1.2,
  eyes: 0.8,
  outfit: 1.0,
  accessory: 1.5,
  marking: 2.0,
  effect: 3.0, // 特效最稀有
};

export class RarityCalculator {
  private globalTraitStats: Map<string, number> = new Map();
  private totalAgents: number = 0;
  
  /**
   * 更新全局统计（用于计算稀有度）
   */
  updateStats(agents: ComposedSprite[]) {
    this.totalAgents = agents.length;
    this.globalTraitStats.clear();
    
    agents.forEach(agent => {
      agent.traits.forEach(trait => {
        const count = this.globalTraitStats.get(trait.id) || 0;
        this.globalTraitStats.set(trait.id, count + 1);
      });
    });
  }
  
  /**
   * 计算单个特征的稀有度分数
   * 越罕见的特征分数越高
   */
  calculateTraitRarity(traitId: string): number {
    if (this.totalAgents === 0) return 1;
    
    const occurrenceCount = this.globalTraitStats.get(traitId) || 1;
    const frequency = occurrenceCount / this.totalAgents;
    
    // 使用逆频率对数计算
    // 频率越低，分数越高
    return Math.max(1, -Math.log10(frequency + 0.001) * 10);
  }
  
  /**
   * 计算组合稀有度
   */
  calculateCombinationRarity(traits: AgentTrait[]): number {
    // 1. 基础分数 = 稀有度权重 × 特征数量加成
    let score = 0;
    
    traits.forEach(trait => {
      // 特征基础稀有度
      const rarityWeight = RARITY_WEIGHTS[trait.rarity];
      
      // 类别权重
      const categoryWeight = CATEGORY_WEIGHTS[trait.category] || 1;
      
      // 全局稀有度（基于实际出现频率）
      const globalRarity = this.calculateTraitRarity(trait.id);
      
      score += rarityWeight * categoryWeight * globalRarity;
    });
    
    // 2. 特征数量加成
    const traitCountBonus = Math.pow(1.1, traits.length);
    score *= traitCountBonus;
    
    // 3. 特殊组合加分
    const specialComboBonus = this.calculateSpecialComboBonus(traits);
    score *= specialComboBonus;
    
    return Math.round(score * 100) / 100;
  }
  
  /**
   * 计算特殊组合加分
   */
  private calculateSpecialComboBonus(traits: AgentTrait[]): number {
    let bonus = 1;
    
    const categories = traits.map(t => t.category);
    const rarities = traits.map(t => t.rarity);
    
    // 全稀有特征组合（所有特征都是 rare+）
    if (rarities.every(r => ['rare', 'epic', 'legendary', 'mythic'].includes(r))) {
      bonus *= 1.5;
    }
    
    // 特效 + 标记组合
    if (categories.includes('effect') && categories.includes('marking')) {
      bonus *= 1.3;
    }
    
    // 三个以上配件
    const accessoryCount = categories.filter(c => c === 'accessory').length;
    if (accessoryCount >= 3) {
      bonus *= 1.2;
    }
    
    // Mythic 特征
    if (rarities.includes('mythic')) {
      bonus *= 2.0;
    }
    
    // Legendary 特征
    if (rarities.includes('legendary')) {
      bonus *= 1.5;
    }
    
    return bonus;
  }
  
  /**
   * 计算全局排名
   */
  calculateGlobalRank(score: number, allScores: number[]): number {
    // 降序排序
    const sorted = [...allScores].sort((a, b) => b - a);
    const rank = sorted.findIndex(s => s <= score);
    return rank === -1 ? sorted.length + 1 : rank + 1;
  }
  
  /**
   * 计算百分位
   */
  calculatePercentile(rank: number, total: number): number {
    if (total === 0) return 1;
    return rank / total;
  }
  
  /**
   * 生成完整的 NFT 交易属性
   */
  generateTradingAttrs(
    agent: ComposedSprite,
    allAgents: ComposedSprite[],
    generation: number = 0,
    creator: string = 'system'
  ): {
    nftAttrs: {
      rank: number;
      score: number;
      percentile: number;
      traitRarity: Record<string, number>;
      generation: number;
      creator: string;
      mintedAt: number;
      totalSales: number;
      averagePrice: number;
      priceChange24h: number;
    };
    traitRarity: Record<string, number>;
  } {
    // 更新统计
    this.updateStats(allAgents);
    
    // 计算每个特征的稀有度
    const traitRarity: Record<string, number> = {};
    agent.traits.forEach(trait => {
      traitRarity[trait.id] = this.calculateTraitRarity(trait.id);
    });
    
    // 计算组合分数
    const score = this.calculateCombinationRarity(agent.traits);
    
    // 计算所有 Agent 的分数用于排名
    const allScores = allAgents.map(a => this.calculateCombinationRarity(a.traits));
    allScores.push(score); // 包含自己
    
    // 计算排名
    const rank = this.calculateGlobalRank(score, allScores);
    const percentile = this.calculatePercentile(rank, allScores.length);
    
    const nftAttrs = {
      rank,
      score,
      percentile,
      traitRarity,
      generation,
      creator,
      mintedAt: agent.createdAt,
      totalSales: 0,
      averagePrice: 0,
      priceChange24h: 0,
    };
    
    return { nftAttrs, traitRarity };
  }
}

// 单例导出
export const rarityCalculator = new RarityCalculator();
