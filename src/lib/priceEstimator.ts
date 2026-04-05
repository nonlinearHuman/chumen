// 价格估算器 - 估算 Agent 的 NFT 价格
import { Rarity, NFTTradingAttrs, NFTCollectionAttrs } from '@/types/traits';

// 基础价格配置（ETH）
const BASE_PRICES: Record<Rarity, number> = {
  common: 0.01,      // 0.01 ETH
  uncommon: 0.05,    // 0.05 ETH
  rare: 0.15,        // 0.15 ETH
  epic: 0.5,         // 0.5 ETH
  legendary: 2.0,    // 2 ETH
  mythic: 10.0,      // 10 ETH
};

// 稀有度乘数
const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.5,
  mythic: 5.0,
};

// 视觉评分加成阈值
const VISUAL_SCORE_BONUSES = [
  { min: 90, bonus: 2.0 },  // 90+ 分：2倍加成
  { min: 80, bonus: 1.5 },  // 80+ 分：1.5倍加成
  { min: 70, bonus: 1.3 },  // 70+ 分：1.3倍加成
  { min: 60, bonus: 1.1 },  // 60+ 分：1.1倍加成
];

// 代数折旧（每代递减）
const GENERATION_DEPRECIATION = 0.85; // 每代保留 85% 价值

export class PriceEstimator {
  /**
   * 估算初始价格（基于稀有度）
   */
  estimateBasePrice(rarity: Rarity): number {
    return BASE_PRICES[rarity] || BASE_PRICES.common;
  }
  
  /**
   * 计算视觉评分加成
   */
  calculateVisualScoreBonus(visualScore: number): number {
    for (const { min, bonus } of VISUAL_SCORE_BONUSES) {
      if (visualScore >= min) return bonus;
    }
    return 1.0;
  }
  
  /**
   * 计算代数加成/折旧
   */
  calculateGenerationBonus(generation: number): number {
    // Gen 0 最值钱
    if (generation === 0) return 1.5;
    // 后续代数递减
    return Math.pow(GENERATION_DEPRECIATION, generation);
  }
  
  /**
   * 计算稀有度分数加成
   */
  calculateRarityScoreBonus(score: number): number {
    // 稀有度分数越高，加成越大
    if (score > 500) return 2.0;
    if (score > 300) return 1.5;
    if (score > 200) return 1.3;
    if (score > 100) return 1.2;
    if (score > 50) return 1.1;
    return 1.0;
  }
  
  /**
   * 计算排名加成
   */
  calculateRankBonus(rank: number, total: number): number {
    if (total === 0) return 1.0;
    
    const percentile = rank / total;
    
    // Top 1%
    if (percentile <= 0.01) return 3.0;
    // Top 5%
    if (percentile <= 0.05) return 2.0;
    // Top 10%
    if (percentile <= 0.10) return 1.5;
    // Top 25%
    if (percentile <= 0.25) return 1.2;
    
    return 1.0;
  }
  
  /**
   * 估算初始价格（综合计算）
   */
  estimateInitialPrice(
    rarity: Rarity,
    nftAttrs: NFTTradingAttrs,
    collectionAttrs: NFTCollectionAttrs
  ): number {
    // 基础价格
    const basePrice = this.estimateBasePrice(rarity);
    
    // 稀有度乘数
    const rarityMultiplier = RARITY_MULTIPLIERS[rarity];
    
    // 视觉评分加成
    const visualBonus = this.calculateVisualScoreBonus(collectionAttrs.visualScore);
    
    // 代数加成
    const generationBonus = this.calculateGenerationBonus(nftAttrs.generation);
    
    // 稀有度分数加成
    const scoreBonus = this.calculateRarityScoreBonus(nftAttrs.score);
    
    // 综合计算
    const price = basePrice * rarityMultiplier * visualBonus * generationBonus * scoreBonus;
    
    // 保留 4 位小数
    return Math.round(price * 10000) / 10000;
  }
  
  /**
   * 估算市值（如果 Agent 已有交易记录）
   */
  estimateMarketValue(nftAttrs: NFTTradingAttrs): number {
    // 如果有最近成交价，基于成交价估算
    if (nftAttrs.lastSoldPrice && nftAttrs.lastSoldAt) {
      const daysSinceLastSale = (Date.now() - nftAttrs.lastSoldAt) / (1000 * 60 * 60 * 24);
      
      // 时间衰减（越久远的成交价参考价值越低）
      const timeDecay = Math.max(0.7, 1 - daysSinceLastSale * 0.01);
      
      // 结合价格变化趋势
      const trendMultiplier = 1 + (nftAttrs.priceChange24h / 100);
      
      return Math.round(nftAttrs.lastSoldPrice * timeDecay * trendMultiplier * 10000) / 10000;
    }
    
    // 如果有平均成交价
    if (nftAttrs.averagePrice > 0) {
      return nftAttrs.averagePrice;
    }
    
    // 否则返回 0（需要调用 estimateInitialPrice）
    return 0;
  }
  
  /**
   * 估算建议售价范围
   */
  estimatePriceRange(
    rarity: Rarity,
    nftAttrs: NFTTradingAttrs,
    collectionAttrs: NFTCollectionAttrs
  ): { min: number; max: number; recommended: number } {
    const basePrice = this.estimateInitialPrice(rarity, nftAttrs, collectionAttrs);
    const marketValue = this.estimateMarketValue(nftAttrs);
    
    // 使用较高的价格作为基准
    const baseline = Math.max(basePrice, marketValue) || basePrice;
    
    // 价格波动范围（±20%）
    const volatility = 0.2;
    
    return {
      min: Math.round(baseline * (1 - volatility) * 10000) / 10000,
      max: Math.round(baseline * (1 + volatility) * 10000) / 10000,
      recommended: baseline,
    };
  }
  
  /**
   * 格式化价格显示
   */
  formatPrice(priceInEth: number): string {
    if (priceInEth >= 1) {
      return `${priceInEth.toFixed(2)} ETH`;
    } else if (priceInEth >= 0.01) {
      return `${(priceInEth * 1000).toFixed(2)} mETH`;
    } else {
      return `${(priceInEth * 1000000).toFixed(0)} μETH`;
    }
  }
  
  /**
   * 计算总价值统计
   */
  calculatePortfolioValue(
    agents: Array<{
      rarity: Rarity;
      nftAttrs?: NFTTradingAttrs;
      collectionAttrs?: NFTCollectionAttrs;
    }>
  ): {
    totalValue: number;
    byRarity: Record<Rarity, { count: number; value: number }>;
    averageValue: number;
  } {
    const byRarity: Record<Rarity, { count: number; value: number }> = {
      common: { count: 0, value: 0 },
      uncommon: { count: 0, value: 0 },
      rare: { count: 0, value: 0 },
      epic: { count: 0, value: 0 },
      legendary: { count: 0, value: 0 },
      mythic: { count: 0, value: 0 },
    };
    
    let totalValue = 0;
    
    agents.forEach(agent => {
      const basePrice = this.estimateBasePrice(agent.rarity);
      
      let price = basePrice;
      
      // 如果有详细属性，使用精确估算
      if (agent.nftAttrs && agent.collectionAttrs) {
        price = this.estimateInitialPrice(
          agent.rarity,
          agent.nftAttrs,
          agent.collectionAttrs
        );
      }
      
      totalValue += price;
      byRarity[agent.rarity].count++;
      byRarity[agent.rarity].value += price;
    });
    
    return {
      totalValue: Math.round(totalValue * 10000) / 10000,
      byRarity,
      averageValue: agents.length > 0 
        ? Math.round((totalValue / agents.length) * 10000) / 10000 
        : 0,
    };
  }
}

// 单例导出
export const priceEstimator = new PriceEstimator();
