// 精灵合成器 - 核心引擎
import { 
  AgentTrait, 
  ComposedSprite, 
  Rarity, 
  TraitCategory,
  RARITY_CONFIG,
  TRAIT_CATEGORIES,
  COLOR_PALETTES,
} from '@/types/traits';
import { TRAITS, getTraitsByRarity } from '@/data/traits';
import crypto from 'crypto';

export class SpriteComposer {
  private existingDNAs: Set<string> = new Set();

  /**
   * 根据稀有度生成特征组合
   */
  generateTraits(rarity: Rarity): AgentTrait[] {
    const config = RARITY_CONFIG[rarity];
    const traitCount = this.randomInRange(config.minTraits, config.maxTraits);
    const selectedTraits: AgentTrait[] = [];

    // 必须特征
    const requiredCategories = Object.entries(TRAIT_CATEGORIES)
      .filter(([_, cfg]) => cfg.required)
      .map(([cat]) => cat as TraitCategory);

    for (const category of requiredCategories) {
      const trait = this.selectTraitByCategory(category, rarity);
      if (trait) selectedTraits.push(trait);
    }

    // 可选特征
    const optionalCategories = Object.entries(TRAIT_CATEGORIES)
      .filter(([_, cfg]) => !cfg.required)
      .map(([cat]) => cat as TraitCategory);

    // 根据稀有度增加可选特征
    const optionalCount = Math.max(0, traitCount - requiredCategories.length);
    const shuffled = this.shuffleArray(optionalCategories);
    
    for (let i = 0; i < Math.min(optionalCount, shuffled.length); i++) {
      const category = shuffled[i];
      const trait = this.selectTraitByCategory(category, rarity);
      if (trait) selectedTraits.push(trait);
    }

    return selectedTraits;
  }

  /**
   * 合成像素精灵
   */
  compose(traits: AgentTrait[], colors: Record<string, string>): number[][] {
    // 创建16x16画布
    const canvas: number[][] = Array(16).fill(null).map(() => Array(16).fill(0));

    // 按层级排序特征
    const sortedTraits = [...traits].sort((a, b) => {
      const layerA = TRAIT_CATEGORIES[a.category]?.layer || 0;
      const layerB = TRAIT_CATEGORIES[b.category]?.layer || 0;
      return layerA - layerB;
    });

    // 依次绘制每个特征
    for (const trait of sortedTraits) {
      this.drawTrait(canvas, trait, colors);
    }

    return canvas;
  }

  /**
   * 生成DNA
   */
  generateDNA(traits: AgentTrait[], colors: Record<string, string>): string {
    const traitIds = traits.map(t => t.id).sort().join(',');
    const colorValues = Object.entries(colors).sort().map(([k, v]) => `${k}:${v}`).join(',');
    const timestamp = Date.now();
    const data = `${traitIds}|${colorValues}|${timestamp}`;
    
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * 检查独特性
   */
  checkUniqueness(dna: string): boolean {
    return !this.existingDNAs.has(dna);
  }

  /**
   * 注册DNA
   */
  registerDNA(dna: string): void {
    this.existingDNAs.add(dna);
  }

  /**
   * 生成随机颜色组合
   */
  generateColors(traits: AgentTrait[]): Record<string, string> {
    const colors: Record<string, string> = {};

    for (const trait of traits) {
      if (trait.colorizable && trait.colorCategory) {
        const palette = COLOR_PALETTES[trait.colorCategory];
        if (palette && palette.length > 0) {
          colors[trait.colorCategory] = palette[Math.floor(Math.random() * palette.length)];
        }
      }
    }

    return colors;
  }

  /**
   * 完整生成流程
   */
  async generate(rarity?: Rarity, summonType: 'normal' | 'premium' | 'legendary' = 'normal'): Promise<ComposedSprite> {
    // 1. 确定稀有度（如果未指定）
    const finalRarity = rarity || this.rollRarity(summonType);
    
    // 2. 生成特征
    const traits = this.generateTraits(finalRarity);
    
    // 3. 生成颜色
    const colors = this.generateColors(traits);
    
    // 4. 合成像素
    const pixels = this.compose(traits, colors);
    
    // 5. 生成DNA
    let dna = this.generateDNA(traits, colors);
    
    // 确保独特性（最多尝试10次）
    let attempts = 0;
    while (!this.checkUniqueness(dna) && attempts < 10) {
      const newColors = this.generateColors(traits);
      dna = this.generateDNA(traits, newColors);
      attempts++;
    }
    
    // 6. 注册DNA
    this.registerDNA(dna);

    // 7. 创建精灵对象
    const sprite: ComposedSprite = {
      id: crypto.randomUUID(),
      dna,
      rarity: finalRarity,
      traits,
      colors,
      pixels,
      createdAt: Date.now(),
    };

    return sprite;
  }

  /**
   * 将像素数据转换为Data URL
   * 注意：此方法只能在浏览器端调用
   */
  pixelsToDataURL(pixels: number[][], colors: Record<string, string>, scale: number = 10): string {
    // 服务端检查
    if (typeof document === 'undefined') {
      // 返回占位符或抛出错误
      console.warn('pixelsToDataURL called on server side - returning empty string');
      return '';
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 16 * scale;
    canvas.height = 16 * scale;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // 颜色映射
    const colorMap: Record<number, string> = {
      0: 'transparent',
      1: colors.skin || '#f5d0c5',
      2: colors.skin ? this.darkenColor(colors.skin, 0.2) : '#d4a574',
      3: colors.skin ? this.lightenColor(colors.skin, 0.2) : '#fff',
      4: colors.skin ? this.darkenColor(colors.skin, 0.4) : '#8d5524',
    };

    // 绘制像素
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const colorIndex = pixels[y][x];
        if (colorIndex > 0) {
          ctx.fillStyle = colorMap[colorIndex] || colors.skin || '#f5d0c5';
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    return canvas.toDataURL('image/png');
  }

  // 私有方法

  private rollRarity(type: 'normal' | 'premium' | 'legendary'): Rarity {
    const baseRates = {
      common: 0.50,
      uncommon: 0.30,
      rare: 0.15,
      epic: 0.04,
      legendary: 0.009,
      mythic: 0.001,
    };

    // 高级召唤提升稀有度
    const boost = type === 'premium' ? 0.2 : type === 'legendary' ? 0.5 : 0;
    
    // 应用boost
    const adjustedRates = { ...baseRates };
    if (boost > 0) {
      adjustedRates.rare += boost * 0.3;
      adjustedRates.epic += boost * 0.4;
      adjustedRates.legendary += boost * 0.2;
      adjustedRates.mythic += boost * 0.1;
      adjustedRates.common = Math.max(0.1, adjustedRates.common - boost);
      adjustedRates.uncommon = Math.max(0.1, adjustedRates.uncommon - boost * 0.5);
    }

    // 随机抽取
    const roll = Math.random();
    let cumulative = 0;
    
    const rarities: Rarity[] = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
    
    for (const rarity of rarities) {
      cumulative += adjustedRates[rarity];
      if (roll < cumulative) {
        return rarity;
      }
    }
    
    return 'common';
  }

  private selectTraitByCategory(category: TraitCategory, targetRarity: Rarity): AgentTrait | null {
    const traits = TRAITS[category];
    if (!traits || traits.length === 0) return null;

    // 根据目标稀有度选择特征
    const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
    const targetIndex = rarityOrder.indexOf(targetRarity);
    
    // 高稀有度可以包含低稀有度特征，反之不行
    const eligibleTraits = traits.filter(trait => {
      const traitIndex = rarityOrder.indexOf(trait.rarity);
      return traitIndex <= targetIndex;
    });

    if (eligibleTraits.length === 0) return null;

    // 加权随机选择（高稀有度特征权重更低）
    const weighted = eligibleTraits.map(trait => {
      const traitIndex = rarityOrder.indexOf(trait.rarity);
      const weight = Math.pow(2, traitIndex); // 低稀有度权重更高
      return { trait, weight };
    });

    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weighted) {
      random -= item.weight;
      if (random <= 0) return item.trait;
    }

    return eligibleTraits[0];
  }

  private drawTrait(canvas: number[][], trait: AgentTrait, colors: Record<string, string>): void {
    const { pixels, offsetX, offsetY } = trait;
    const color = trait.colorizable && trait.colorCategory ? colors[trait.colorCategory] : null;

    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        const canvasY = y + offsetY;
        const canvasX = x + offsetX;
        
        if (canvasY >= 0 && canvasY < 16 && canvasX >= 0 && canvasX < 16) {
          const pixelValue = pixels[y][x];
          if (pixelValue > 0) {
            canvas[canvasY][canvasX] = pixelValue;
          }
        }
      }
    }
  }

  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private darkenColor(hex: string, amount: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (num >> 16) - Math.floor(255 * amount));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.floor(255 * amount));
    const b = Math.max(0, (num & 0x0000FF) - Math.floor(255 * amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  private lightenColor(hex: string, amount: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (num >> 16) + Math.floor(255 * amount));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.floor(255 * amount));
    const b = Math.min(255, (num & 0x0000FF) + Math.floor(255 * amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}

// 导出单例
export const spriteComposer = new SpriteComposer();
