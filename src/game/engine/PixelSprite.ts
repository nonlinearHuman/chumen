// 像素精灵系统 - 16x16 像素角色 + 8方向动画
// src/game/engine/PixelSprite.ts

export interface PixelFrame {
  pixels: number[][]; // 16x16 矩阵，0=透明，1-9=颜色索引
}

export interface PixelCharacter {
  id: string;
  name: string;
  color: string;
  secondaryColor: string; // 服装第二色
  skinTone: string;
  hairColor: string;
  outfit: 'suit' | 'casual' | 'doctor' | 'reporter' | 'police';
  frames: {
    idle: PixelFrame[];
    walk_down: PixelFrame[];
    walk_up: PixelFrame[];
    walk_left: PixelFrame[];
    walk_right: PixelFrame[];
    walk_up_left: PixelFrame[];
    walk_up_right: PixelFrame[];
    walk_down_left: PixelFrame[];
    walk_down_right: PixelFrame[];
  };
}

// 颜色映射
const COLORS: Record<number, string> = {
  0: 'transparent',
  1: '#ffffff', // 白色（眼睛、衬衫）
  2: '#1a1a1a', // 黑色（轮廓、头发）
  3: '#f5d0c5', // 肤色
  4: '#4a90d9', // 服装主色
  5: '#2d5a8a', // 深色（轮廓强化）
  6: '#d4a056', // 棕色（头发）
  7: '#9b59b6', // 紫色
  8: '#27ae60', // 绿色
  9: '#e74c3c', // 红色
};

// 头部像素（2-7行）- 标准头
const HEAD_PIXELS: number[][] = [
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 3, 1, 3, 3, 1, 3, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
];

// 正面身体像素（8-13行）
const BODY_DOWN: number[][] = [
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0],  // row 8 肩膀
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],  // row 9 胸口
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],  // row 10 腰
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],  // row 11 臀
  [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],  // row 12 腿缝
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],  // row 13 腿分叉
];

// 背面身体像素（8-13行）
const BODY_UP: number[][] = [
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0],
];

// 左侧面身体
const BODY_LEFT: number[][] = [
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
];

// 右侧面身体（镜像左侧面）
const BODY_RIGHT: number[][] = [
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2, 2, 0, 0, 0, 0],
];

// 腿站立帧
const LEGS_STAND: number[][] = [
  [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
];

// 行走帧1 - 左腿前
const LEGS_WALK_1: number[][] = [
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
];

// 行走帧2 - 右腿前
const LEGS_WALK_2: number[][] = [
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
];

// 斜向左行走帧1
const LEGS_WALK_L1: number[][] = [
  [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
  [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
];

// 斜向右行走帧1
const LEGS_WALK_R1: number[][] = [
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
];

// 拼接完整帧
function makeFrame(head: number[][], body: number[][], legs: number[][]): PixelFrame {
  // 空白行补齐到16行
  const blankRow = Array(16).fill(0);
  const paddingTop = Array(2).fill(blankRow);      // 头顶上留白
  const paddingBetween = Array(1).fill(blankRow);   // 头和身之间

  const rows = [
    ...paddingTop,
    ...head,
    ...paddingBetween,
    ...body,
    ...legs,
  ];

  // 确保16行
  while (rows.length < 16) rows.push(blankRow);
  return { pixels: rows.slice(0, 16) };
}

// 生成角色像素精灵（支持8方向）
export function createPixelCharacter(
  id: string,
  name: string,
  outfitColor: string,
  hairColor: string = '#6b4423',
  skinTone: string = '#f5d0c5',
  outfit: 'suit' | 'casual' | 'doctor' | 'reporter' | 'police' = 'suit'
): PixelCharacter {
  // 副色（深一号）
  const secondary = darkenColor(outfitColor, 0.7);

  // 正面头（眼睛在下方=朝下）
  const headDown = HEAD_PIXELS.map(row => [...row]);
  // 背面头（无眼睛=朝上）
  const headUp = HEAD_PIXELS.map((row, i) => {
    if (i === 2) return row.map(() => 3); // 全部肤色，无眼睛
    return [...row];
  });
  // 左面头（单眼）
  const headLeft = HEAD_PIXELS.map((row, i) => {
    if (i === 2) {
      // 左眼保留，右眼抹掉
      return row.map((v, j) => (j < 8 ? 1 : 3));
    }
    return [...row];
  });
  // 右面头（单眼）
  const headRight = HEAD_PIXELS.map((row, i) => {
    if (i === 2) {
      return row.map((v, j) => (j >= 8 ? 1 : 3));
    }
    return [...row];
  });

  // 服装颜色替换（4→主色, 5→副色）
  const applyColors = (frame: PixelFrame): PixelFrame => ({
    pixels: frame.pixels.map(row =>
      row.map(v => {
        if (v === 4) return parseInt(outfitColor.replace('#', ''), 16) % 100 !== 0 ? 4 : 4;
        if (v === 5) return parseInt(secondary.replace('#', ''), 16) % 100;
        return v;
      })
    ),
  });

  // 站立帧
  const idleDown = makeFrame(headDown, BODY_DOWN, LEGS_STAND);
  const idleUp = makeFrame(headUp, BODY_UP, LEGS_STAND);
  const idleLeft = makeFrame(headLeft, BODY_LEFT, LEGS_STAND);
  const idleRight = makeFrame(headRight, BODY_RIGHT, LEGS_STAND);

  // 行走帧
  const walkDown1 = makeFrame(headDown, BODY_DOWN, LEGS_WALK_1);
  const walkDown2 = makeFrame(headDown, BODY_DOWN, LEGS_WALK_2);
  const walkUp1 = makeFrame(headUp, BODY_UP, LEGS_WALK_1);
  const walkUp2 = makeFrame(headUp, BODY_UP, LEGS_WALK_2);
  const walkLeft1 = makeFrame(headLeft, BODY_LEFT, LEGS_WALK_L1);
  const walkLeft2 = makeFrame(headLeft, BODY_LEFT, LEGS_WALK_R1);
  const walkRight1 = makeFrame(headRight, BODY_RIGHT, LEGS_WALK_R1);
  const walkRight2 = makeFrame(headRight, BODY_RIGHT, LEGS_WALK_L1);

  // 斜向行走（借用侧面的身体 + 斜的腿）
  const walkUL1 = makeFrame(headLeft, BODY_LEFT, LEGS_WALK_1);
  const walkUL2 = makeFrame(headLeft, BODY_LEFT, LEGS_WALK_2);
  const walkUR1 = makeFrame(headRight, BODY_RIGHT, LEGS_WALK_1);
  const walkUR2 = makeFrame(headRight, BODY_RIGHT, LEGS_WALK_2);
  const walkDL1 = makeFrame(headLeft, BODY_LEFT, LEGS_WALK_L1);
  const walkDL2 = makeFrame(headLeft, BODY_LEFT, LEGS_WALK_R1);
  const walkDR1 = makeFrame(headRight, BODY_RIGHT, LEGS_WALK_R1);
  const walkDR2 = makeFrame(headRight, BODY_RIGHT, LEGS_WALK_L1);

  return {
    id,
    name,
    color: outfitColor,
    secondaryColor: secondary,
    skinTone,
    hairColor,
    outfit,
    frames: {
      idle: [idleDown, idleDown, idleDown, idleDown],
      walk_down: [idleDown, walkDown1, idleDown, walkDown2],
      walk_up: [idleUp, walkUp1, idleUp, walkUp2],
      walk_left: [idleLeft, walkLeft1, idleLeft, walkLeft2],
      walk_right: [idleRight, walkRight1, idleRight, walkRight2],
      walk_up_left: [idleLeft, walkUL1, idleLeft, walkUL2],
      walk_up_right: [idleRight, walkUR1, idleRight, walkUR2],
      walk_down_left: [idleLeft, walkDL1, idleLeft, walkDL2],
      walk_down_right: [idleRight, walkDR1, idleRight, walkDR2],
    },
  };
}

// 颜色加深辅助
function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * factor);
  const dg = Math.round(g * factor);
  const db = Math.round(b * factor);
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

// 绘制像素精灵到Canvas（支持idle/移动动画）
export function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  sprite: PixelCharacter,
  x: number,
  y: number,
  direction: string,
  frameIndex: number,
  isMoving: boolean,
  scale: number = 3
) {
  const frame = getFrame(sprite, direction, frameIndex, isMoving);
  const pixelSize = scale;
  const halfW = (16 * pixelSize) / 2;
  const halfH = (16 * pixelSize) / 2;

  frame.pixels.forEach((row, py) => {
    row.forEach((colorIndex, px) => {
      if (colorIndex === 0) return;

      let color: string;
      switch (colorIndex) {
        case 1: color = '#ffffff'; break;
        case 2: color = sprite.hairColor; break; // 用头发色当轮廓
        case 3: color = sprite.skinTone; break;
        case 4: color = sprite.color; break;
        case 5: color = sprite.secondaryColor; break;
        default: color = COLORS[colorIndex] || '#888';
      }

      ctx.fillStyle = color;
      ctx.fillRect(
        x + px * pixelSize - halfW,
        y + py * pixelSize - halfH,
        pixelSize,
        pixelSize
      );
    });
  });
}

// 获取当前帧（支持idle/移动8方向）
function getFrame(sprite: PixelCharacter, direction: string, frameIndex: number, isMoving: boolean): PixelFrame {
  let frames: PixelFrame[];

  if (isMoving) {
    // 行走动画：walk_{direction}
    const walkKey = `walk_${direction}` as keyof typeof sprite.frames;
    frames = sprite.frames[walkKey] || sprite.frames.walk_down;
  } else {
    // 站立动画：idle_{primaryDirection}
    // 斜向idle复用侧面帧
    const primaryDir = getPrimaryDirection(direction);
    const idleKey = `idle_${primaryDir}` as keyof typeof sprite.frames;
    frames = sprite.frames[idleKey] || sprite.frames.idle;
  }

  return frames[frameIndex % frames.length];
}

// 获取4方向主方向（斜向映射到侧面）
function getPrimaryDirection(direction: string): string {
  switch (direction) {
    case 'up_left':
    case 'down_left':
    case 'left':
      return 'left';
    case 'up_right':
    case 'down_right':
    case 'right':
      return 'right';
    case 'up':
    case 'down':
    default:
      return direction;
  }
}

// 8方向计算：从(fromX,fromY)到(toX,toY)计算方向
export function getDirection8(fromX: number, fromY: number, toX: number, toY: number): Direction8 {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  if (angle >= -22.5 && angle < 22.5) return 'right';
  if (angle >= 22.5 && angle < 67.5) return 'down_right';
  if (angle >= 67.5 && angle < 112.5) return 'down';
  if (angle >= 112.5 && angle < 157.5) return 'down_left';
  if (angle >= 157.5 || angle < -157.5) return 'left';
  if (angle >= -157.5 && angle < -112.5) return 'up_left';
  if (angle >= -112.5 && angle < -67.5) return 'up';
  if (angle >= -67.5 && angle < -22.5) return 'up_right';
  return 'down';
}

export type Direction8 = 'up' | 'down' | 'left' | 'right' | 'up_left' | 'up_right' | 'down_left' | 'down_right';

// 预定义角色
export const DEFAULT_CHARACTERS: PixelCharacter[] = [
  createPixelCharacter('marcus', 'Marcus', '#4a90d9', '#2d2d2d', '#f5d0c5', 'suit'),
  createPixelCharacter('sophia', 'Sophia', '#9b59b6', '#6b4423', '#f5d0c5', 'suit'),
  createPixelCharacter('james', 'James', '#27ae60', '#1a7a3a', '#f5d0c5', 'doctor'),
  createPixelCharacter('emily', 'Emily', '#e74c3c', '#8b2500', '#f5d0c5', 'reporter'),
  createPixelCharacter('david', 'David', '#2c3e50', '#1a1a1a', '#e8c4a0', 'suit'),
  createPixelCharacter('lisa', 'Lisa', '#e91e8c', '#b3005c', '#ffe4c4', 'casual'),
  createPixelCharacter('robert', 'Robert', '#1a5276', '#0d2d47', '#c4a574', 'police'),
  createPixelCharacter('zhangyi', '张姨', '#d35400', '#7a3000', '#ffe4c4', 'casual'),
  createPixelCharacter('xiaowang', '小王', '#16a085', '#0d5249', '#f5d0c5', 'casual'),
  createPixelCharacter('laoli', '老李', '#7f8c8d', '#4a5254', '#c4a574', 'casual'),
];
