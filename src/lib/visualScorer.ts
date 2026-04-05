// 视觉评分器 - AI 审美评分和标签生成
import { ComposedSprite, AgentTrait, Rarity } from '@/types/traits';

// 颜色和谐度参考
const COLOR_HARMONY_PATTERNS = {
  // 互补色组合
  complementary: [
    ['#4a90d9', '#f39c12'], // 蓝-橙
    ['#e74c3c', '#27ae60'], // 红-绿
    ['#9b59b6', '#ffd700'], // 紫-金
  ],
  // 相似色组合
  analogous: [
    ['#4a90d9', '#1abc9c'], // 蓝色系
    ['#e74c3c', '#ff6b6b'], // 红色系
    ['#9b59b6', '#8e44ad'], // 紫色系
  ],
  // 三色组合
  triadic: [
    ['#e74c3c', '#27ae60', '#4a90d9'], // RGB
    ['#f39c12', '#9b59b6', '#1abc9c'], // YPB
  ],
};

// 视觉标签关键词映射
const VISUAL_TAG_KEYWORDS: Record<string, string[]> = {
  '酷炫': ['effect', 'marking'],
  '可爱': ['pink', 'cute', 'round'],
  '神秘': ['purple', 'dark', 'mythic'],
  '优雅': ['gold', 'white', 'legendary'],
  '复古': ['brown', 'vintage', 'retro'],
  '赛博朋克': ['cyber', 'neon', 'glow'],
  '发光': ['glow', 'halo', 'effect'],
  '暗黑': ['dark', 'black', 'shadow'],
  '炫彩': ['rainbow', 'multi', 'colorful'],
  '极简': ['simple', 'minimal', 'clean'],
};

export class VisualScorer {
  /**
   * 提取颜色的色相
   */
  private hexToHue(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    
    if (d === 0) return 0;
    
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    
    return h * 360;
  }
  
  /**
   * 计算配色和谐度（1-100）
   */
  private calculateColorHarmony(colors: Record<string, string>): number {
    const colorValues = Object.values(colors);
    if (colorValues.length < 2) return 50;
    
    // 计算色相差异
    const hues = colorValues.map(c => this.hexToHue(c));
    
    // 计算色相标准差（越小说明越和谐）
    const meanHue = hues.reduce((a, b) => a + b, 0) / hues.length;
    const variance = hues.reduce((sum, h) => sum + Math.pow(h - meanHue, 2), 0) / hues.length;
    const stdDev = Math.sqrt(variance);
    
    // 标准差越小，分数越高（0-180度范围）
    const harmonyScore = Math.max(0, 100 - (stdDev / 180) * 100);
    
    // 检查是否匹配预定义的和谐组合
    const colorSet = new Set(colorValues.map(c => c.toLowerCase()));
    for (const patterns of Object.values(COLOR_HARMONY_PATTERNS)) {
      for (const pattern of patterns) {
        const patternSet = new Set(pattern.map(c => c.toLowerCase()));
        // 如果有 2 个以上颜色匹配
        const matches = [...colorSet].filter(c => patternSet.has(c)).length;
        if (matches >= 2) {
          return Math.min(100, harmonyScore + 20); // 加分
        }
      }
    }
    
    return harmonyScore;
  }
  
  /**
   * 计算构图平衡度（1-100）
   */
  private calculateCompositionBalance(traits: AgentTrait[]): number {
    // 基于特征类别分布
    const categories = traits.map(t => t.category);
    
    // 核心特征（body, skin, eyes, outfit）应该都存在
    const coreCategories = ['body', 'skin', 'eyes', 'outfit'];
    const hasCoreCount = coreCategories.filter(c => categories.includes(c as any)).length;
    const coreScore = (hasCoreCount / coreCategories.length) * 60;
    
    // 可选特征增加分数
    const optionalCategories = ['hair', 'accessory', 'marking', 'effect'];
    const hasOptionalCount = optionalCategories.filter(c => categories.includes(c as any)).length;
    const optionalScore = (hasOptionalCount / optionalCategories.length) * 40;
    
    return coreScore + optionalScore;
  }
  
  /**
   * 计算独特性（1-100）
   */
  private calculateUniqueness(rarity: Rarity): number {
    // 基于稀有度直接映射
    const rarityUniqueness: Record<Rarity, number> = {
      common: 20,
      uncommon: 40,
      rare: 60,
      epic: 80,
      legendary: 90,
      mythic: 100,
    };
    return rarityUniqueness[rarity] || 20;
  }
  
  /**
   * 计算特殊效果加分
   */
  private calculateSpecialEffectsBonus(traits: AgentTrait[]): number {
    let bonus = 0;
    
    // 有特效特征
    const hasEffect = traits.some(t => t.category === 'effect');
    if (hasEffect) bonus += 15;
    
    // 有标记特征
    const hasMarking = traits.some(t => t.category === 'marking');
    if (hasMarking) bonus += 10;
    
    // 有多个配件
    const accessoryCount = traits.filter(t => t.category === 'accessory').length;
    if (accessoryCount >= 2) bonus += 5;
    
    // 稀有度加成
    const rareCount = traits.filter(t => 
      ['rare', 'epic', 'legendary', 'mythic'].includes(t.rarity)
    ).length;
    bonus += rareCount * 3;
    
    return Math.min(30, bonus); // 最高 30 分加成
  }
  
  /**
   * AI 审美评分（1-100）
   */
  scoreVisual(sprite: ComposedSprite): number {
    // 1. 配色和谐度（权重 35%）
    const colorHarmony = this.calculateColorHarmony(sprite.colors);
    
    // 2. 构图平衡度（权重 30%）
    const composition = this.calculateCompositionBalance(sprite.traits);
    
    // 3. 独特性（权重 25%）
    const uniqueness = this.calculateUniqueness(sprite.rarity);
    
    // 4. 特殊效果加分（权重 10%）
    const specialEffects = this.calculateSpecialEffectsBonus(sprite.traits);
    
    // 综合评分
    const score = 
      colorHarmony * 0.35 +
      composition * 0.30 +
      uniqueness * 0.25 +
      specialEffects;
    
    return Math.round(Math.min(100, Math.max(1, score)));
  }
  
  /**
   * 生成视觉标签
   */
  generateTags(sprite: ComposedSprite): string[] {
    const tags: Set<string> = new Set();
    
    // 基于特征类别生成标签
    const categories = sprite.traits.map(t => t.category);
    const traitNames = sprite.traits.map(t => t.nameZh.toLowerCase());
    
    // 检查每个标签关键词
    Object.entries(VISUAL_TAG_KEYWORDS).forEach(([tag, keywords]) => {
      const matches = keywords.some(keyword => 
        categories.includes(keyword as any) ||
        traitNames.some(name => name.includes(keyword))
      );
      if (matches) tags.add(tag);
    });
    
    // 基于稀有度添加标签
    if (sprite.rarity === 'legendary') tags.add('传说');
    if (sprite.rarity === 'mythic') tags.add('神话');
    if (sprite.rarity === 'epic') tags.add('史诗');
    
    // 基于颜色生成标签
    const colors = Object.values(sprite.colors);
    if (colors.some(c => {
      const hue = this.hexToHue(c);
      return hue >= 270 && hue <= 330; // 紫色范围
    })) {
      tags.add('紫色系');
    }
    if (colors.some(c => {
      const hue = this.hexToHue(c);
      return hue >= 40 && hue <= 60; // 金色范围
    })) {
      tags.add('金色系');
    }
    
    // 特征数量标签
    if (sprite.traits.length >= 8) tags.add('复杂');
    if (sprite.traits.length <= 4) tags.add('简约');
    
    return Array.from(tags).slice(0, 5); // 最多返回 5 个标签
  }
  
  /**
   * 生成性格标签
   */
  generatePersonality(sprite: ComposedSprite): string[] {
    const personalities: string[] = [];
    const visualTags = this.generateTags(sprite);
    
    // 基于视觉标签推断性格
    if (visualTags.includes('神秘') || visualTags.includes('暗黑')) {
      personalities.push('神秘', '深沉');
    }
    if (visualTags.includes('可爱')) {
      personalities.push('活泼', '友善');
    }
    if (visualTags.includes('酷炫') || visualTags.includes('赛博朋克')) {
      personalities.push('酷', '独立');
    }
    if (visualTags.includes('优雅') || visualTags.includes('传说')) {
      personalities.push('优雅', '高贵');
    }
    
    // 默认性格
    if (personalities.length === 0) {
      personalities.push('友善', '平凡');
    }
    
    return personalities;
  }
  
  /**
   * 生成完整的收藏属性
   */
  generateCollectionAttrs(sprite: ComposedSprite, generation: number = 0): {
    collectionAttrs: {
      visualScore: number;
      visualTags: string[];
      story: string | undefined;
      personality: string[];
      keywords: string[];
      collection: string;
      series: string | undefined;
      milestones: string[];
      participatedEvents: string[];
      favoriteCount: number;
      viewCount: number;
      holderCount: number;
    };
    visualScore: number;
    visualTags: string[];
  } {
    const visualScore = this.scoreVisual(sprite);
    const visualTags = this.generateTags(sprite);
    const personality = this.generatePersonality(sprite);
    
    // 关键词（用于搜索）
    const keywords = [
      sprite.rarity,
      ...visualTags,
      ...sprite.traits.map(t => t.nameZh),
      ...personality,
    ];
    
    // 收藏品名称
    const collection = generation === 0 
      ? '创世系列' 
      : `第${generation}代`;
    
    // 系列
    let series: string | undefined;
    if (visualTags.includes('赛博朋克')) series = '赛博朋克';
    else if (visualTags.includes('暗黑')) series = '暗黑风格';
    else if (visualTags.includes('可爱')) series = '萌系';
    
    const collectionAttrs = {
      visualScore,
      visualTags,
      story: sprite.story,
      personality,
      keywords,
      collection,
      series,
      milestones: [],
      participatedEvents: [],
      favoriteCount: 0,
      viewCount: 0,
      holderCount: 1,
    };
    
    return { collectionAttrs, visualScore, visualTags };
  }
}

// 单例导出
export const visualScorer = new VisualScorer();
