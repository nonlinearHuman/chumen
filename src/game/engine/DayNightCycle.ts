// 昼夜循环系统 - DayNightCycle.ts
// 真实时间1小时 = 游戏时间1天
// 每2.5分钟 = 游戏时间1小时

export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface TimeOfDay {
  hour: number;           // 0-23 游戏时间小时
  minute: number;         // 0-59 游戏时间分钟
  phase: TimePhase;       // 时段
  lightColor: string;     // 环境光颜色
  skyGradient: string[];  // 天空渐变（从上到下）
  ambientOpacity: number; // 环境粒子透明度 0-1
  sunPosition: { x: number; y: number }; // 太阳/月亮位置
  starOpacity: number;    // 星空透明度 0-1
}

// 四个时段的视觉配置
const TIME_PHASES: Record<TimePhase, Omit<TimeOfDay, 'hour' | 'minute' | 'sunPosition'>> = {
  dawn: {
    phase: 'dawn',
    lightColor: '#ff9966',
    skyGradient: ['#1a1a3a', '#3d2852', '#ff7b54', '#ffb347'],
    ambientOpacity: 0.6,
    starOpacity: 0.2,
  },
  day: {
    phase: 'day',
    lightColor: '#ffffff',
    skyGradient: ['#1e3a5f', '#3d6a8a', '#87ceeb', '#b0e0e6'],
    ambientOpacity: 0.3,
    starOpacity: 0,
  },
  dusk: {
    phase: 'dusk',
    lightColor: '#ff6b35',
    skyGradient: ['#2d1b4e', '#4a2c6a', '#ff6b35', '#ff8c42'],
    ambientOpacity: 0.5,
    starOpacity: 0.4,
  },
  night: {
    phase: 'night',
    lightColor: '#1a1a4a',
    skyGradient: ['#0a0a1a', '#151530', '#1a1a3a', '#252550'],
    ambientOpacity: 0.8,
    starOpacity: 1,
  },
};

// 星星数据
interface Star {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export class DayNightCycle {
  private startTime: number;
  private speed: number = 60 * 60 * 1000; // 1真实小时 = 1游戏天
  private manualHour: number | null = null;
  private autoMode: boolean = true;
  private stars: Star[] = [];

  constructor() {
    this.startTime = Date.now();
    this.generateStars(100);
  }

  // 生成星空
  private generateStars(count: number) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        size: Math.random() * 2 + 0.5,
        twinkleSpeed: 1000 + Math.random() * 2000,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  // 获取当前游戏时间
  getCurrentTime(): TimeOfDay {
    let gameHour: number;
    
    if (this.manualHour !== null && !this.autoMode) {
      gameHour = this.manualHour;
    } else {
      const elapsed = Date.now() - this.startTime;
      gameHour = (elapsed / this.speed * 24) % 24;
    }

    const hour = Math.floor(gameHour);
    const minute = Math.floor((gameHour % 1) * 60);
    const phase = this.getPhase(gameHour);
    const baseTime = TIME_PHASES[phase];

    // 计算太阳/月亮位置
    const sunPosition = this.calculateSunPosition(gameHour);

    // 插值计算光照（平滑过渡）
    const lightColor = this.interpolateLight(gameHour);
    const skyGradient = this.interpolateSky(gameHour);

    return {
      ...baseTime,
      hour,
      minute,
      lightColor,
      skyGradient,
      sunPosition,
    };
  }

  // 判断时段
  private getPhase(hour: number): TimePhase {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 18) return 'day';
    if (hour >= 18 && hour < 20) return 'dusk';
    return 'night';
  }

  // 计算太阳/月亮位置
  private calculateSunPosition(hour: number): { x: number; y: number } {
    // 太阳：5:00 升起，18:00 落下
    // 月亮：20:00 升起，5:00 落下
    
    const width = 800;
    const height = 600;
    
    if (hour >= 5 && hour < 18) {
      // 白天 - 太阳轨迹（抛物线）
      const progress = (hour - 5) / 13; // 5:00-18:00
      const x = progress * width;
      const y = height * 0.15 - Math.sin(progress * Math.PI) * 120;
      return { x, y };
    } else {
      // 夜晚 - 月亮轨迹
      let nightHour = hour >= 20 ? hour - 20 : hour + 4; // 20:00-5:00 → 0-9
      const progress = nightHour / 9;
      const x = progress * width;
      const y = height * 0.2 - Math.sin(progress * Math.PI) * 100;
      return { x, y };
    }
  }

  // 插值光照颜色
  private interpolateLight(hour: number): string {
    // 关键帧
    const keyframes: [number, string][] = [
      [0, '#1a1a4a'],   // 午夜
      [5, '#1a1a4a'],   // 黎明前
      [6, '#ff9966'],   // 黎明
      [8, '#ffffff'],   // 早晨
      [12, '#ffffff'],  // 正午
      [17, '#ffffff'],  // 下午
      [19, '#ff6b35'],  // 黄昏
      [21, '#1a1a4a'],  // 夜晚
      [24, '#1a1a4a'],  // 午夜
    ];

    return this.interpolateColor(hour, keyframes);
  }

  // 插值天空渐变
  private interpolateSky(hour: number): string[] {
    // 为每个渐变位置插值
    const keyframes: [number, string[]][] = [
      [0, ['#0a0a1a', '#151530', '#1a1a3a', '#252550']],
      [5, ['#0a0a1a', '#151530', '#1a1a3a', '#252550']],
      [6, ['#1a1a3a', '#3d2852', '#ff7b54', '#ffb347']],
      [8, ['#1e3a5f', '#3d6a8a', '#87ceeb', '#b0e0e6']],
      [12, ['#1e3a5f', '#3d6a8a', '#87ceeb', '#b0e0e6']],
      [17, ['#1e3a5f', '#3d6a8a', '#87ceeb', '#b0e0e6']],
      [19, ['#2d1b4e', '#4a2c6a', '#ff6b35', '#ff8c42']],
      [21, ['#0a0a1a', '#151530', '#1a1a3a', '#252550']],
      [24, ['#0a0a1a', '#151530', '#1a1a3a', '#252550']],
    ];

    const result: string[] = [];
    for (let i = 0; i < 4; i++) {
      const colorKeyframes: [number, string][] = keyframes.map(([h, colors]) => [h, colors[i]]);
      result.push(this.interpolateColor(hour, colorKeyframes));
    }
    return result;
  }

  // 颜色插值
  private interpolateColor(hour: number, keyframes: [number, string][]): string {
    // 找到当前时间所在的区间
    let prev = keyframes[0];
    let next = keyframes[1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (hour >= keyframes[i][0] && hour < keyframes[i + 1][0]) {
        prev = keyframes[i];
        next = keyframes[i + 1];
        break;
      }
    }

    const t = (hour - prev[0]) / (next[0] - prev[0]);
    return this.lerpColor(prev[1], next[1], t);
  }

  // 线性插值两个颜色
  private lerpColor(color1: string, color2: string, t: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }

  // 手动设置时间
  setHour(hour: number) {
    this.manualHour = hour % 24;
    this.autoMode = false;
  }

  // 启用自动模式
  setAutoMode(enabled: boolean) {
    this.autoMode = enabled;
    if (enabled) {
      this.manualHour = null;
    }
  }

  // 是否自动模式
  isAutoMode(): boolean {
    return this.autoMode;
  }

  // 获取星星数据
  getStars(): Star[] {
    return this.stars;
  }

  // 格式化时间显示
  formatTime(time: TimeOfDay): string {
    const h = time.hour.toString().padStart(2, '0');
    const m = time.minute.toString().padStart(2, '0');
    const phaseNames: Record<TimePhase, string> = {
      dawn: '黎明',
      day: '白天',
      dusk: '黄昏',
      night: '夜晚',
    };
    return `${h}:${m} ${phaseNames[time.phase]}`;
  }

  // 应用光照效果到场景
  applyLighting(ctx: CanvasRenderingContext2D, time: TimeOfDay, width: number, height: number) {
    // 环境光叠加
    const ambientAlpha = time.phase === 'day' ? 0 : 0.15;
    if (ambientAlpha > 0) {
      ctx.fillStyle = time.lightColor;
      ctx.globalAlpha = ambientAlpha;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }
  }

  // 渲染太阳/月亮
  renderSunMoon(ctx: CanvasRenderingContext2D, time: TimeOfDay) {
    const { x, y } = time.sunPosition;

    if (time.phase === 'day' || time.phase === 'dawn' || time.phase === 'dusk') {
      // 太阳
      const sunRadius = time.phase === 'day' ? 30 : 25;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, sunRadius * 2);
      gradient.addColorStop(0, '#ffee00');
      gradient.addColorStop(0.5, '#ffa50080');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, sunRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 太阳核心
      ctx.fillStyle = '#fff5cc';
      ctx.beginPath();
      ctx.arc(x, y, sunRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 月亮
      const moonRadius = 20;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, moonRadius * 1.5);
      gradient.addColorStop(0, '#e8e8ff');
      gradient.addColorStop(0.8, '#aaaacc80');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, moonRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 月亮主体
      ctx.fillStyle = '#e8e8ff';
      ctx.beginPath();
      ctx.arc(x, y, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // 月球阴影（月牙效果）
      ctx.fillStyle = '#151530';
      ctx.beginPath();
      ctx.arc(x + 8, y - 2, moonRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 渲染星空
  renderStars(ctx: CanvasRenderingContext2D, time: TimeOfDay, currentTime: number) {
    if (time.starOpacity <= 0) return;

    ctx.globalAlpha = time.starOpacity;
    
    for (const star of this.stars) {
      // 闪烁效果
      const twinkle = (Math.sin(currentTime / star.twinkleSpeed + star.twinklePhase) + 1) / 2;
      const alpha = 0.5 + twinkle * 0.5;

      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = time.starOpacity * alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
