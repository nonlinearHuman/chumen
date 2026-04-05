// 服装特征数据 - 24种服装
import { AgentTrait } from '@/types/traits';

// 辅助函数：创建基础服装模板
const createOutfit = (pattern: 'casual' | 'formal' | 'fantasy' | 'special'): number[][] => {
  // 基础服装模板 - 覆盖身体躯干部分
  const canvas: number[][] = Array(16).fill(null).map(() => Array(16).fill(0));
  
  // 躯干区域 (y: 4-10)
  for (let y = 4; y <= 10; y++) {
    for (let x = 4; x <= 11; x++) {
      canvas[y][x] = 1;
    }
  }
  
  return canvas;
};

// 1. T恤 (T-Shirt)
const outfitTshirt: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,2,1,1,1,1,1,1,2,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// 2. 西装 (Suit)
const outfitSuit: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,2,2,1,1,1,1,2,2,1,0,0,0],
  [0,0,0,1,2,2,1,1,1,1,2,2,1,0,0,0],
  [0,0,0,1,2,2,1,3,3,1,2,2,1,0,0,0],
  [0,0,0,1,2,2,1,3,3,1,2,2,1,0,0,0],
  [0,0,0,1,2,2,1,1,1,1,2,2,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// 3. 连衣裙 (Dress)
const outfitDress: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,1,2,1,1,1,1,2,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// 4. 卫衣 (Hoodie)
const outfitHoodie: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,2,1,1,1,1,1,1,2,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// 简化版服装数据
const outfitTank = createOutfit('casual');
const outfitPolo = createOutfit('casual');
const outfitBlouse = createOutfit('formal');
const outfitJacket = createOutfit('casual');
const outfitCoat = createOutfit('formal');
const outfitKimono = createOutfit('fantasy');
const outfitArmor = createOutfit('fantasy');
const outfitRobe = createOutfit('fantasy');
const outfitTunic = createOutfit('fantasy');
const outfitVest = createOutfit('casual');
const outfitSweater = createOutfit('casual');
const outfitBlazer = createOutfit('formal');
const outfitTankTop = createOutfit('casual');
const outfitCamisole = createOutfit('casual');
const outfitTurtleneck = createOutfit('casual');
const outfitCardigan = createOutfit('casual');
const outfitPeacoat = createOutfit('formal');
const outfitCape = createOutfit('fantasy');
const outfitCloak = createOutfit('fantasy');
const outfitBattleGear = createOutfit('special');

export const OUTFIT_TRAITS: AgentTrait[] = [
  {
    id: 'outfit_tshirt',
    category: 'outfit',
    name: 'T-Shirt',
    nameZh: 'T恤',
    rarity: 'common',
    pixels: outfitTshirt,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_suit',
    category: 'outfit',
    name: 'Suit',
    nameZh: '西装',
    rarity: 'uncommon',
    pixels: outfitSuit,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_dress',
    category: 'outfit',
    name: 'Dress',
    nameZh: '连衣裙',
    rarity: 'common',
    pixels: outfitDress,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_hoodie',
    category: 'outfit',
    name: 'Hoodie',
    nameZh: '卫衣',
    rarity: 'common',
    pixels: outfitHoodie,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_tank',
    category: 'outfit',
    name: 'Tank Top',
    nameZh: '背心',
    rarity: 'common',
    pixels: outfitTank,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_polo',
    category: 'outfit',
    name: 'Polo',
    nameZh: 'Polo衫',
    rarity: 'common',
    pixels: outfitPolo,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_blouse',
    category: 'outfit',
    name: 'Blouse',
    nameZh: '衬衫',
    rarity: 'uncommon',
    pixels: outfitBlouse,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_jacket',
    category: 'outfit',
    name: 'Jacket',
    nameZh: '夹克',
    rarity: 'common',
    pixels: outfitJacket,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_coat',
    category: 'outfit',
    name: 'Coat',
    nameZh: '大衣',
    rarity: 'uncommon',
    pixels: outfitCoat,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_kimono',
    category: 'outfit',
    name: 'Kimono',
    nameZh: '和服',
    rarity: 'rare',
    pixels: outfitKimono,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_armor',
    category: 'outfit',
    name: 'Armor',
    nameZh: '盔甲',
    rarity: 'epic',
    pixels: outfitArmor,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_robe',
    category: 'outfit',
    name: 'Robe',
    nameZh: '长袍',
    rarity: 'rare',
    pixels: outfitRobe,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_tunic',
    category: 'outfit',
    name: 'Tunic',
    nameZh: '束腰外衣',
    rarity: 'uncommon',
    pixels: outfitTunic,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_vest',
    category: 'outfit',
    name: 'Vest',
    nameZh: '马甲',
    rarity: 'common',
    pixels: outfitVest,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_sweater',
    category: 'outfit',
    name: 'Sweater',
    nameZh: '毛衣',
    rarity: 'common',
    pixels: outfitSweater,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_blazer',
    category: 'outfit',
    name: 'Blazer',
    nameZh: '运动外套',
    rarity: 'uncommon',
    pixels: outfitBlazer,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_tank_top',
    category: 'outfit',
    name: 'Tank Top',
    nameZh: '吊带背心',
    rarity: 'common',
    pixels: outfitTankTop,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_camisole',
    category: 'outfit',
    name: 'Camisole',
    nameZh: '吊带上衣',
    rarity: 'uncommon',
    pixels: outfitCamisole,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_turtleneck',
    category: 'outfit',
    name: 'Turtleneck',
    nameZh: '高领毛衣',
    rarity: 'uncommon',
    pixels: outfitTurtleneck,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_cardigan',
    category: 'outfit',
    name: 'Cardigan',
    nameZh: '开衫',
    rarity: 'common',
    pixels: outfitCardigan,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_peacoat',
    category: 'outfit',
    name: 'Peacoat',
    nameZh: '双排扣大衣',
    rarity: 'uncommon',
    pixels: outfitPeacoat,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_cape',
    category: 'outfit',
    name: 'Cape',
    nameZh: '披风',
    rarity: 'rare',
    pixels: outfitCape,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_cloak',
    category: 'outfit',
    name: 'Cloak',
    nameZh: '斗篷',
    rarity: 'rare',
    pixels: outfitCloak,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
  {
    id: 'outfit_battle_gear',
    category: 'outfit',
    name: 'Battle Gear',
    nameZh: '战袍',
    rarity: 'legendary',
    pixels: outfitBattleGear,
    offsetX: 0,
    offsetY: 0,
    colorizable: true,
    colorCategory: 'outfit',
  },
];
