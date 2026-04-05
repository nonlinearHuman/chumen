// 场景数据 - Web3 风格
// src/game/config/scenes.ts

export interface GameScene {
  id: string;
  name: string;
  emoji: string;
  description: string;
  backgroundColor: string;
  accentColor: string;
  objects: SceneObject[];
  decorations: SceneDecoration[]; // 新增：装饰物
  music: string;
  ambientColor?: string; // 环境光颜色
  floorPattern?: 'grid' | 'wood' | 'marble' | 'concrete'; // 地板样式
}

export interface SceneObject {
  id: string;
  emoji: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactive?: boolean;
}

export interface SceneDecoration {
  type: 'light' | 'particle' | 'shadow' | 'glow';
  x: number;
  y: number;
  color: string;
  size?: number;
  animated?: boolean;
}

export const gameScenes: GameScene[] = [
  {
    id: 'coffee_shop',
    name: '咖啡馆',
    emoji: '☕',
    description: '城市中心的网红咖啡馆，商务会谈热门地',
    backgroundColor: '#1a1208',
    accentColor: '#d4a056',
    ambientColor: '#ffd70020',
    floorPattern: 'wood',
    music: 'lofi',
    objects: [
      { id: 'counter', emoji: '☕', x: 80, y: 80, width: 100, height: 50, interactive: true },
      { id: 'table1', emoji: '🪑', x: 200, y: 280, width: 60, height: 60 },
      { id: 'table2', emoji: '🪑', x: 400, y: 220, width: 60, height: 60 },
      { id: 'table3', emoji: '🪑', x: 600, y: 280, width: 60, height: 60 },
      { id: 'plant1', emoji: '🪴', x: 50, y: 450, width: 50, height: 50 },
      { id: 'plant2', emoji: '🪴', x: 720, y: 450, width: 50, height: 50 },
      { id: 'lamp1', emoji: '💡', x: 150, y: 150, width: 30, height: 30 },
      { id: 'lamp2', emoji: '💡', x: 650, y: 150, width: 30, height: 30 },
    ],
    decorations: [
      { type: 'light', x: 150, y: 120, color: '#ffd700', size: 40, animated: true },
      { type: 'light', x: 650, y: 120, color: '#ffd700', size: 40, animated: true },
      { type: 'glow', x: 400, y: 250, color: '#d4a05630', size: 80 },
    ],
  },
  {
    id: 'hospital',
    name: '私立医院',
    emoji: '🏥',
    description: '环境优雅的私立医院，外科主任 James 工作的地方',
    backgroundColor: '#0a1215',
    accentColor: '#4ade80',
    ambientColor: '#00ff0020',
    floorPattern: 'marble',
    music: 'ambient',
    objects: [
      { id: 'reception', emoji: '🏥', x: 350, y: 80, width: 100, height: 60 },
      { id: 'bed1', emoji: '🛏️', x: 120, y: 320, width: 70, height: 90 },
      { id: 'bed2', emoji: '🛏️', x: 600, y: 320, width: 70, height: 90 },
      { id: 'machine1', emoji: '💚', x: 200, y: 200, width: 50, height: 50, interactive: true },
      { id: 'machine2', emoji: '🔬', x: 550, y: 200, width: 50, height: 50 },
      { id: 'cart', emoji: '🧪', x: 380, y: 380, width: 40, height: 40 },
    ],
    decorations: [
      { type: 'light', x: 200, y: 100, color: '#4ade80', size: 30, animated: true },
      { type: 'light', x: 600, y: 100, color: '#4ade80', size: 30, animated: true },
      { type: 'particle', x: 400, y: 300, color: '#4ade8020', size: 5 },
    ],
  },
  {
    id: 'office',
    name: 'CBD写字楼',
    emoji: '🏢',
    description: '城市核心区，精英们的战场',
    backgroundColor: '#080a15',
    accentColor: '#60a5fa',
    ambientColor: '#0066ff20',
    floorPattern: 'concrete',
    music: 'upbeat',
    objects: [
      { id: 'desk1', emoji: '💻', x: 120, y: 220, width: 70, height: 50, interactive: true },
      { id: 'desk2', emoji: '💻', x: 300, y: 220, width: 70, height: 50, interactive: true },
      { id: 'desk3', emoji: '💻', x: 480, y: 220, width: 70, height: 50, interactive: true },
      { id: 'desk4', emoji: '💻', x: 660, y: 220, width: 70, height: 50, interactive: true },
      { id: 'window', emoji: '🪟', x: 350, y: 50, width: 120, height: 80 },
      { id: 'plant', emoji: '🪴', x: 50, y: 400, width: 40, height: 40 },
      { id: 'printer', emoji: '🖨️', x: 700, y: 400, width: 50, height: 40 },
    ],
    decorations: [
      { type: 'glow', x: 350, y: 70, color: '#60a5fa40', size: 100 },
      { type: 'light', x: 150, y: 150, color: '#ffffff', size: 25 },
      { type: 'light', x: 550, y: 150, color: '#ffffff', size: 25 },
    ],
  },
  {
    id: 'street',
    name: '城市街道',
    emoji: '🛣️',
    description: '车水马龙的城市街道，偶遇高发地',
    backgroundColor: '#121008',
    accentColor: '#fb923c',
    ambientColor: '#ff660020',
    floorPattern: 'concrete',
    music: 'street',
    objects: [
      { id: 'shop1', emoji: '🏪', x: 80, y: 120, width: 80, height: 80 },
      { id: 'shop2', emoji: '🏪', x: 250, y: 120, width: 80, height: 80 },
      { id: 'shop3', emoji: '🏪', x: 550, y: 120, width: 80, height: 80 },
      { id: 'sign1', emoji: '📺', x: 400, y: 60, width: 70, height: 50 },
      { id: 'car1', emoji: '🚗', x: 150, y: 420, width: 80, height: 50 },
      { id: 'car2', emoji: '🚕', x: 500, y: 480, width: 80, height: 50 },
      { id: 'lamp1', emoji: '💡', x: 100, y: 350, width: 30, height: 30 },
      { id: 'lamp2', emoji: '💡', x: 700, y: 350, width: 30, height: 30 },
    ],
    decorations: [
      { type: 'light', x: 100, y: 300, color: '#fb923c', size: 50, animated: true },
      { type: 'light', x: 700, y: 300, color: '#fb923c', size: 50, animated: true },
      { type: 'glow', x: 400, y: 350, color: '#fb923c30', size: 100 },
    ],
  },
  {
    id: 'media_office',
    name: '媒体公司',
    emoji: '📺',
    description: 'Emily 和小王的战场，真相挖掘地',
    backgroundColor: '#120812',
    accentColor: '#f472b6',
    ambientColor: '#ff006020',
    floorPattern: 'concrete',
    music: 'pop',
    objects: [
      { id: 'camera', emoji: '🎥', x: 150, y: 150, width: 70, height: 50, interactive: true },
      { id: 'light1', emoji: '💡', x: 350, y: 80, width: 50, height: 50 },
      { id: 'light2', emoji: '💡', x: 550, y: 80, width: 50, height: 50 },
      { id: 'screen', emoji: '📺', x: 450, y: 220, width: 120, height: 80 },
      { id: 'desk', emoji: '🪑', x: 200, y: 380, width: 80, height: 50 },
      { id: 'files', emoji: '📁', x: 650, y: 350, width: 50, height: 40 },
    ],
    decorations: [
      { type: 'light', x: 350, y: 100, color: '#f472b6', size: 60, animated: true },
      { type: 'light', x: 550, y: 100, color: '#f472b6', size: 60, animated: true },
      { type: 'glow', x: 450, y: 200, color: '#f472b640', size: 120 },
    ],
  },
  {
    id: 'court',
    name: '法院',
    emoji: '⚖️',
    description: '庄严的法律殿堂，Sophia 的主场',
    backgroundColor: '#101010',
    accentColor: '#fbbf24',
    ambientColor: '#ffd00020',
    floorPattern: 'marble',
    music: 'serious',
    objects: [
      { id: 'bench', emoji: '⚖️', x: 350, y: 80, width: 100, height: 70, interactive: true },
      { id: 'seat1', emoji: '🪑', x: 150, y: 300, width: 50, height: 50 },
      { id: 'seat2', emoji: '🪑', x: 350, y: 300, width: 50, height: 50 },
      { id: 'seat3', emoji: '🪑', x: 550, y: 300, width: 50, height: 50 },
      { id: 'flag', emoji: '🇨🇳', x: 100, y: 80, width: 50, height: 50 },
      { id: 'lamp', emoji: '💡', x: 680, y: 120, width: 40, height: 40 },
    ],
    decorations: [
      { type: 'glow', x: 350, y: 100, color: '#fbbf2430', size: 150 },
      { type: 'light', x: 200, y: 150, color: '#fbbf24', size: 30 },
      { type: 'light', x: 500, y: 150, color: '#fbbf24', size: 30 },
    ],
  },
  {
    id: 'police_station',
    name: '警局',
    emoji: '🚨',
    description: 'Robert 的地盘，失踪案的起点',
    backgroundColor: '#08080f',
    accentColor: '#ef4444',
    ambientColor: '#ff000020',
    floorPattern: 'concrete',
    music: 'tense',
    objects: [
      { id: 'desk', emoji: '🖥️', x: 150, y: 180, width: 70, height: 50, interactive: true },
      { id: 'cell', emoji: '🔒', x: 550, y: 220, width: 80, height: 100 },
      { id: 'file1', emoji: '📁', x: 300, y: 350, width: 50, height: 40 },
      { id: 'file2', emoji: '📁', x: 380, y: 350, width: 50, height: 40 },
      { id: 'board', emoji: '📋', x: 650, y: 100, width: 60, height: 50 },
      { id: 'light', emoji: '🔴', x: 100, y: 80, width: 30, height: 30 },
    ],
    decorations: [
      { type: 'light', x: 100, y: 60, color: '#ef4444', size: 30, animated: true },
      { type: 'light', x: 550, y: 150, color: '#ffffff', size: 25 },
      { type: 'shadow', x: 400, y: 300, color: '#00000060', size: 100 },
    ],
  },
  {
    id: 'park',
    name: '社区公园',
    emoji: '🌳',
    description: '张姨的据点，八卦与情报的中心',
    backgroundColor: '#081208',
    accentColor: '#a3e635',
    ambientColor: '#00ff0020',
    floorPattern: 'grid',
    music: 'dreamy',
    objects: [
      { id: 'bench1', emoji: '🪑', x: 150, y: 250, width: 70, height: 50 },
      { id: 'bench2', emoji: '🪑', x: 550, y: 300, width: 70, height: 50 },
      { id: 'tree1', emoji: '🌳', x: 100, y: 120, width: 80, height: 100 },
      { id: 'tree2', emoji: '🌳', x: 650, y: 150, width: 80, height: 100 },
      { id: 'flower1', emoji: '🌸', x: 300, y: 400, width: 40, height: 40 },
      { id: 'flower2', emoji: '🌺', x: 450, y: 420, width: 40, height: 40 },
      { id: 'fountain', emoji: '⛲', x: 350, y: 200, width: 80, height: 80, interactive: true },
    ],
    decorations: [
      { type: 'light', x: 350, y: 180, color: '#a3e635', size: 50, animated: true },
      { type: 'particle', x: 300, y: 350, color: '#a3e63520', size: 3 },
      { type: 'particle', x: 450, y: 380, color: '#a3e63520', size: 3 },
    ],
  },
];

export const getSceneById = (id: string): GameScene | undefined => {
  return gameScenes.find(s => s.id === id);
};
