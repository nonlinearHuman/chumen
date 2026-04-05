// 像素世界粒子系统 v2
// ParticleSystem.ts - 对象池 + 像素风粒子
// 效果：情绪粒子、场景粒子、爆点特效

export type ParticleType = 
  | 'emotion'      // 情绪图标（像素方块组合）
  | 'dust'         // 场景尘埃
  | 'steam'        // 蒸汽/咖啡
  | 'sparkle'      // 星星火花
  | 'heart'        // 爱心
  | 'burst'        // 爆点炸裂
  | 'footstep'     // 脚印
  | 'rain'         // 雨滴
  | 'snow'         // 雪花
  | 'fog';         // 雾气

export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // 剩余生命（0-1）
  maxLife: number;    // 最大生命
  size: number;       // 像素尺寸
  color: string;
  secondaryColor?: string;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  alpha: number;
  fadeIn: number;     // 淡入时间比例
  fadeOut: number;    // 淡出时间比例
  pixelated: boolean; // 是否像素风格
  char?: string;      // 可选的单字符emoji或符号
  data?: Record<string, number>; // 扩展数据（帧索引等）
}

// 粒子配置
export interface ParticleEmitter {
  type: ParticleType;
  emitRate: number;       // 每秒发射数量
  burstCount: number;      // 爆发时发射数量
  sizeMin: number;
  sizeMax: number;
  speedMin: number;
  speedMax: number;
  lifeMin: number;          // 生命时间（秒）
  lifeMax: number;
  gravity: number;
  colors: string[];
  spread: number;          // 发射角度扩散
  angle: number;           // 主发射方向（弧度）
}

// 预设发射器
export const PRESET_EMITTERS: Record<string, Partial<ParticleEmitter>> = {
  emotion_happy: {
    type: 'emotion',
    emitRate: 0,
    burstCount: 8,
    sizeMin: 6,
    sizeMax: 10,
    speedMin: 1,
    speedMax: 3,
    lifeMin: 1.5,
    lifeMax: 2.5,
    gravity: -0.05,
    colors: ['#FFD700', '#FFA500', '#FF69B4'],
    spread: Math.PI * 2,
    angle: -Math.PI / 2,
  },
  emotion_angry: {
    type: 'burst',
    emitRate: 0,
    burstCount: 12,
    sizeMin: 4,
    sizeMax: 8,
    speedMin: 2,
    speedMax: 6,
    lifeMin: 0.5,
    lifeMax: 1.2,
    gravity: 0.1,
    colors: ['#FF4444', '#FF0000', '#FF8800'],
    spread: Math.PI * 2,
    angle: -Math.PI / 2,
  },
  emotion_love: {
    type: 'heart',
    emitRate: 0,
    burstCount: 6,
    sizeMin: 8,
    sizeMax: 14,
    speedMin: 0.5,
    speedMax: 2,
    lifeMin: 2,
    lifeMax: 3,
    gravity: -0.03,
    colors: ['#FF69B4', '#FF1493', '#FF6B9D'],
    spread: Math.PI,
    angle: -Math.PI / 2,
  },
  dust_coffee: {
    type: 'steam',
    emitRate: 3,
    burstCount: 0,
    sizeMin: 3,
    sizeMax: 6,
    speedMin: 0.2,
    speedMax: 0.8,
    lifeMin: 2,
    lifeMax: 4,
    gravity: -0.04,
    colors: ['#D2B48C', '#C4A57B', '#E8D5B7'],
    spread: Math.PI * 0.5,
    angle: -Math.PI / 2,
  },
  dust_office: {
    type: 'dust',
    emitRate: 2,
    burstCount: 0,
    sizeMin: 2,
    sizeMax: 5,
    speedMin: 0.1,
    speedMax: 0.4,
    lifeMin: 3,
    lifeMax: 6,
    gravity: 0.005,
    colors: ['#C0C0C0', '#A0A0A0', '#D0D0D0'],
    spread: Math.PI * 2,
    angle: 0,
  },
  sparkle_magic: {
    type: 'sparkle',
    emitRate: 5,
    burstCount: 0,
    sizeMin: 2,
    sizeMax: 5,
    speedMin: 0.3,
    speedMax: 1.2,
    lifeMin: 1,
    lifeMax: 2,
    gravity: -0.02,
    colors: ['#FFD700', '#FFFFFF', '#87CEEB'],
    spread: Math.PI * 2,
    angle: 0,
  },
  footstep: {
    type: 'footstep',
    emitRate: 0,
    burstCount: 1,
    sizeMin: 4,
    sizeMax: 6,
    speedMin: 0,
    speedMax: 0.1,
    lifeMin: 0.8,
    lifeMax: 1.2,
    gravity: 0,
    colors: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'],
    spread: 0,
    angle: 0,
  },
  burst_explosion: {
    type: 'burst',
    emitRate: 0,
    burstCount: 30,
    sizeMin: 3,
    sizeMax: 8,
    speedMin: 3,
    speedMax: 8,
    lifeMin: 0.6,
    lifeMax: 1.5,
    gravity: 0.15,
    colors: ['#FFD700', '#FF4500', '#FF6347', '#FFFFFF'],
    spread: Math.PI * 2,
    angle: 0,
  },
  rain: {
    type: 'rain',
    emitRate: 50,
    burstCount: 0,
    sizeMin: 1,
    sizeMax: 2,
    speedMin: 8,
    speedMax: 12,
    lifeMin: 1,
    lifeMax: 2,
    gravity: 0,
    colors: ['rgba(150,200,255,0.5)', 'rgba(180,220,255,0.3)'],
    spread: 0.2,
    angle: Math.PI * 0.45,
  },
  snow: {
    type: 'snow',
    emitRate: 30,
    burstCount: 0,
    sizeMin: 2,
    sizeMax: 5,
    speedMin: 0.5,
    speedMax: 1.5,
    lifeMin: 4,
    lifeMax: 8,
    gravity: 0.02,
    colors: ['#FFFFFF', '#F0F8FF', '#E6E6FA'],
    spread: Math.PI * 2,
    angle: 0,
  },
  fog: {
    type: 'fog',
    emitRate: 2,
    burstCount: 0,
    sizeMin: 20,
    sizeMax: 40,
    speedMin: 0.1,
    speedMax: 0.3,
    lifeMin: 5,
    lifeMax: 10,
    gravity: 0,
    colors: ['rgba(200,200,210,0.08)', 'rgba(180,190,200,0.06)'],
    spread: Math.PI,
    angle: 0,
  },
};

export class ParticleSystem {
  // 对象池
  private pool: Particle[] = [];
  private active: Particle[] = [];
  private maxParticles = 500;

  // 发射器配置
  private emitters: Map<string, Partial<ParticleEmitter>> = new Map();

  // 临时发射（爆发）
  private pendingBursts: { pos: { x: number; y: number }; preset: string; count?: number }[] = [];

  // 持续发射器（区域）
  private areaEmitters: {
    x: number; y: number; w: number; h: number;
    preset: string;
    timer: number;
  }[] = [];

  private time = 0;

  constructor() {
    // 预热对象池
    for (let i = 0; i < 100; i++) {
      this.pool.push(this.createEmpty());
    }
    // 注册预设
    Object.entries(PRESET_EMITTERS).forEach(([k, v]) => {
      this.emitters.set(k, v as Partial<ParticleEmitter>);
    });
  }

  private createEmpty(): Particle {
    return {
      id: '',
      type: 'dust',
      x: 0, y: 0,
      vx: 0, vy: 0,
      life: 0, maxLife: 1,
      size: 4, color: '#fff',
      rotation: 0, rotationSpeed: 0,
      gravity: 0, alpha: 1,
      fadeIn: 0.1, fadeOut: 0.3,
      pixelated: true,
    };
  }

  private acquire(): Particle {
    const p = this.pool.pop() || this.createEmpty();
    return p;
  }

  private release(p: Particle) {
    if (this.pool.length < this.maxParticles) {
      this.pool.push(p);
    }
  }

  // 从对象池取出
  private spawn(p: Partial<Particle>): Particle {
    const particle = this.acquire();
    Object.assign(particle, p, { id: `p-${Date.now()}-${Math.random()}` });
    this.active.push(particle);
    return particle;
  }

  // 在位置触发预设爆发
  burst(x: number, y: number, preset: string, count?: number) {
    this.pendingBursts.push({ pos: { x, y }, preset, count });
  }

  // 在区域内持续发射
  addAreaEmitter(x: number, y: number, w: number, h: number, preset: string) {
    this.areaEmitters.push({ x, y, w, h, preset, timer: 0 });
  }

  removeAreaEmitter(preset: string) {
    this.areaEmitters = this.areaEmitters.filter(e => e.preset !== preset);
  }

  // 更新
  update(dt: number) {
    this.time += dt * 1000;

    // 处理爆发
    for (const burst of this.pendingBursts) {
      const cfg = this.emitters.get(burst.preset);
      if (!cfg) continue;
      const count = burst.count || cfg.burstCount || 5;

      for (let i = 0; i < count; i++) {
        const angle = (cfg.angle || 0) + (Math.random() - 0.5) * (cfg.spread || Math.PI * 2);
        const speed = this.rand(cfg.speedMin || 0, cfg.speedMax || 1);
        const life = this.rand(cfg.lifeMin || 1, cfg.lifeMax || 2);
        const size = this.rand(cfg.sizeMin || 3, cfg.sizeMax || 6);
        const color = cfg.colors ? cfg.colors[Math.floor(Math.random() * cfg.colors.length)] : '#fff';

        this.spawn({
          type: cfg.type || 'dust',
          x: burst.pos.x + (Math.random() - 0.5) * 10,
          y: burst.pos.y + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: life,
          maxLife: life,
          size,
          color,
          secondaryColor: color,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          gravity: cfg.gravity || 0,
          alpha: 1,
          fadeIn: 0.1,
          fadeOut: 0.4,
          pixelated: true,
        });
      }
    }
    this.pendingBursts = [];

    // 持续区域发射
    for (const emitter of this.areaEmitters) {
      const cfg = this.emitters.get(emitter.preset);
      if (!cfg || !cfg.emitRate) continue;

      emitter.timer += dt;
      const interval = 1 / (cfg.emitRate || 1);
      while (emitter.timer >= interval) {
        emitter.timer -= interval;

        const x = emitter.x + Math.random() * emitter.w;
        const y = emitter.y + Math.random() * emitter.h;
        const angle = (cfg.angle || 0) + (Math.random() - 0.5) * (cfg.spread || Math.PI * 2);
        const speed = this.rand(cfg.speedMin || 0, cfg.speedMax || 1);
        const life = this.rand(cfg.lifeMin || 1, cfg.lifeMax || 2);
        const size = this.rand(cfg.sizeMin || 3, cfg.sizeMax || 6);
        const color = cfg.colors ? cfg.colors[Math.floor(Math.random() * cfg.colors.length)] : '#fff';

        this.spawn({
          type: cfg.type || 'dust',
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life, maxLife: life,
          size,
          color,
          secondaryColor: color,
          rotation: 0,
          rotationSpeed: 0,
          gravity: cfg.gravity || 0,
          alpha: 1,
          fadeIn: 0.15,
          fadeOut: 0.5,
          pixelated: true,
        });
      }
    }

    // 更新活跃粒子
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.active.splice(i, 1);
        this.release(p);
        continue;
      }

      // 物理
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // alpha生命周期
      const t = 1 - p.life / p.maxLife; // 0→刚发射, 1→将消亡
      if (t < p.fadeIn) {
        p.alpha = t / p.fadeIn;
      } else if (t > 1 - p.fadeOut) {
        p.alpha = (1 - t) / p.fadeOut;
      } else {
        p.alpha = 1;
      }
    }
  }

  // 绘制粒子
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // 像素风格
    ctx.imageSmoothingEnabled = false;

    for (const p of this.active) {
      if (p.alpha <= 0) continue;

      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      switch (p.type) {
        case 'emotion':
          this.drawEmotion(ctx, p);
          break;
        case 'heart':
          this.drawHeart(ctx, p);
          break;
        case 'sparkle':
          this.drawSparkle(ctx, p);
          break;
        case 'burst':
          this.drawBurst(ctx, p);
          break;
        case 'steam':
        case 'dust':
        case 'fog':
          this.drawSoftCircle(ctx, p);
          break;
        case 'rain':
          this.drawRain(ctx, p);
          break;
        case 'snow':
          this.drawSnow(ctx, p);
          break;
        case 'footstep':
          this.drawFootstep(ctx, p);
          break;
        default:
          this.drawPixelDot(ctx, p);
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 像素情绪图标（用小方块拼出表情）
  private drawEmotion(ctx: CanvasRenderingContext2D, p: Particle) {
    const s = p.size;
    const t = 1 - p.life / p.maxLife;
    const bounce = Math.sin(t * Math.PI * 4) * 2;
    const x = Math.round(p.x);
    const y = Math.round(p.y + bounce);

    ctx.fillStyle = p.color;
    // 4x4 像素表情
    const face: number[][] = [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 0, 1, 0],
      [0, 1, 1, 0],
    ];
    face.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          ctx.fillRect(x + rx * s - 2 * s, y + ry * s - 2 * s, s, s);
        }
      });
    });
  }

  // 像素爱心
  private drawHeart(ctx: CanvasRenderingContext2D, p: Particle) {
    const s = Math.max(2, Math.floor(p.size / 3));
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const t = 1 - p.life / p.maxLife;
    const pulse = 1 + Math.sin(t * Math.PI * 6) * 0.15;

    ctx.fillStyle = p.color;
    // 像素爱心形状
    const heart: number[][] = [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ];
    const scale = Math.floor(s * pulse);
    heart.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          ctx.fillRect(x + rx * scale - 2.5 * scale, y + ry * scale - 2 * scale, scale, scale);
        }
      });
    });
  }

  // 像素火花（十字星）
  private drawSparkle(ctx: CanvasRenderingContext2D, p: Particle) {
    const s = p.size;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const t = 1 - p.life / p.maxLife;
    const twinkle = p.alpha;

    ctx.fillStyle = p.color;
    ctx.globalAlpha *= twinkle;
    // 十字形
    ctx.fillRect(x - s / 2, y - s * 1.5, s, s * 3);
    ctx.fillRect(x - s * 1.5, y - s / 2, s * 3, s);
    // 角落点
    ctx.fillRect(x - s * 2, y - s * 2, s, s);
    ctx.fillRect(x + s, y - s * 2, s, s);
    ctx.fillRect(x - s * 2, y + s, s, s);
    ctx.fillRect(x + s, y + s, s, s);
  }

  // 炸裂粒子（像素碎片）
  private drawBurst(ctx: CanvasRenderingContext2D, p: Particle) {
    const s = p.size;
    const x = Math.round(p.x);
    const y = Math.round(p.y);

    ctx.fillStyle = p.color;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
    // 拖尾
    const trailX = x - p.vx * 2;
    const trailY = y - p.vy * 2;
    ctx.globalAlpha *= 0.4;
    ctx.fillRect(Math.round(trailX) - s / 2, Math.round(trailY) - s / 2, s, s);
    ctx.globalAlpha *= 0.2;
    ctx.fillRect(Math.round(trailX - p.vx), Math.round(trailY - p.vy), s, s);
  }

  // 柔边圆形（蒸汽/尘埃）
  private drawSoftCircle(ctx: CanvasRenderingContext2D, p: Particle) {
    const s = p.size;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    // 像素风：多个半透明方块堆叠
    ctx.globalAlpha *= 0.6;
    ctx.fillRect(x - s, y - s, s * 2, s * 2);
    ctx.globalAlpha *= 0.5;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }

  // 雨滴
  private drawRain(ctx: CanvasRenderingContext2D, p: Particle) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha *= 0.6;
    ctx.fillRect(x, y, 1, p.size * 3);
  }

  // 雪花
  private drawSnow(ctx: CanvasRenderingContext2D, p: Particle) {
    const s = Math.max(2, p.size >> 1);
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha *= 0.8;
    ctx.fillRect(x - 1, y - 1, 3, 3);
    ctx.fillRect(x, y, 1, 1);
  }

  // 脚印
  private drawFootstep(ctx: CanvasRenderingContext2D, p: Particle) {
    const s = p.size;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha *= 0.3;
    // 简单椭圆脚印
    ctx.beginPath();
    ctx.ellipse(x, y, s / 2, s / 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 像素点
  private drawPixelDot(ctx: CanvasRenderingContext2D, p: Particle) {
    const s = p.size;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }

  private rand(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }

  get activeCount() {
    return this.active.length;
  }

  clear() {
    while (this.active.length) {
      this.release(this.active.pop()!);
    }
  }
}
