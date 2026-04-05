// 像素世界场景大气渲染器 v3
// SceneRenderer.ts - 每个场景独特的氛围感渲染
// 包含：天空渐变、体积光、粒子效果、地板纹理、物体阴影
// v3 新增：昼夜循环、天气系统

import { DayNightCycle, TimeOfDay } from './DayNightCycle';
import { WeatherSystem, Weather } from './WeatherSystem';

export interface LightRay {
  x: number;           // 起始X（顶部为0）
  y: number;           // 起始Y
  width: number;       // 光柱宽度
  angle: number;       // 倾斜角度（弧度）
  color: string;       // 颜色+透明度
  pulse?: boolean;     // 是否脉冲动画
  pulseSpeed?: number; // 脉冲速度
}

export interface ParticleConfig {
  type: 'dust' | 'sparkle' | 'neon' | 'firefly';
  count: number;
  color: string;
  size: number;
}

export interface SceneStyle {
  skyGradient: string[];    // 天空渐变从上到下
  ambientColor: string;     // 环境光颜色
  lightRays: LightRay[];    // 体积光线
  particles: ParticleConfig;
  floorTint: string;        // 地板主色调
  vignette: string;        // 暗角颜色
  floorNoise?: boolean;     // 地板噪声纹理
}

// 8个场景的大气风格定义
export const SCENE_STYLES: Record<string, SceneStyle> = {
  coffee_shop: {
    skyGradient: ['#1a0f05', '#2d1810', '#4a2515', '#6b3520'],
    ambientColor: '#d4a056',
    lightRays: [
      { x: 400, y: 0, width: 120, angle: 0.15, color: '#ffd70060' },
      { x: 150, y: 0, width: 80, angle: 0.2, color: '#ffd70030' },
      { x: 650, y: 0, width: 60, angle: -0.2, color: '#ffd70025' },
    ],
    particles: { type: 'dust', count: 30, color: '#d4a056', size: 1.5 },
    floorTint: '#3d1f0a',
    vignette: '#1a0f05',
    floorNoise: true,
  },
  hospital: {
    skyGradient: ['#051015', '#0a1a25', '#0f2540', '#1a3550'],
    ambientColor: '#4ade80',
    lightRays: [
      { x: 200, y: 0, width: 60, angle: 0.05, color: '#4ade8030' },
      { x: 600, y: 0, width: 60, angle: 0.05, color: '#4ade8030' },
    ],
    particles: { type: 'dust', count: 15, color: '#ffffff', size: 1 },
    floorTint: '#0a1520',
    vignette: '#051015',
    floorNoise: false,
  },
  office: {
    skyGradient: ['#050510', '#0a0a20', '#101030', '#1a1a40'],
    ambientColor: '#60a5fa',
    lightRays: [
      { x: 350, y: 0, width: 200, angle: 0, color: '#60a5fa20' },
      { x: 500, y: 0, width: 150, angle: 0, color: '#ff00ff15' },
    ],
    particles: { type: 'sparkle', count: 20, color: '#60a5fa', size: 1 },
    floorTint: '#0a0a1a',
    vignette: '#050510',
    floorNoise: false,
  },
  street: {
    skyGradient: ['#08060a', '#151020', '#1f1530', '#2a1a40'],
    ambientColor: '#fb923c',
    lightRays: [
      { x: 100, y: 350, width: 40, angle: -0.3, color: '#fb923c50' },
      { x: 700, y: 350, width: 40, angle: 0.3, color: '#fb923c50' },
    ],
    particles: { type: 'neon', count: 25, color: '#fb923c', size: 2 },
    floorTint: '#0f0a15',
    vignette: '#08060a',
    floorNoise: true,
  },
  media_office: {
    skyGradient: ['#08050f', '#120815', '#1a0a25', '#250a35'],
    ambientColor: '#f472b6',
    lightRays: [
      { x: 350, y: 80, width: 100, angle: 0.8, color: '#f472b640' },
      { x: 550, y: 80, width: 100, angle: -0.8, color: '#f472b640' },
    ],
    particles: { type: 'sparkle', count: 35, color: '#f472b6', size: 1.5 },
    floorTint: '#0f051a',
    vignette: '#08050f',
    floorNoise: false,
  },
  court: {
    skyGradient: ['#0a0a0a', '#151515', '#1f1f1f', '#282828'],
    ambientColor: '#fbbf24',
    lightRays: [
      { x: 350, y: 0, width: 80, angle: 0, color: '#fbbf2440' },
    ],
    particles: { type: 'dust', count: 10, color: '#fbbf24', size: 1 },
    floorTint: '#151515',
    vignette: '#0a0a0a',
    floorNoise: false,
  },
  police_station: {
    skyGradient: ['#050508', '#0a0a10', '#0f0f18', '#141420'],
    ambientColor: '#ef4444',
    lightRays: [
      { x: 100, y: 80, width: 30, angle: 0, color: '#ef444460', pulse: true, pulseSpeed: 800 },
    ],
    particles: { type: 'dust', count: 12, color: '#ef4444', size: 1 },
    floorTint: '#0a0a10',
    vignette: '#050508',
    floorNoise: false,
  },
  park: {
    skyGradient: ['#050f05', '#0a1f0a', '#102510', '#153015'],
    ambientColor: '#a3e635',
    lightRays: [
      { x: 350, y: 180, width: 60, angle: 0, color: '#a3e63540', pulse: true, pulseSpeed: 1200 },
    ],
    particles: { type: 'firefly', count: 40, color: '#a3e635', size: 2 },
    floorTint: '#0a1a0a',
    vignette: '#050f05',
    floorNoise: true,
  },
};

// 内部粒子状态
interface AtmosphereParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  phase: number;  // 漂浮动画相位
  type: 'dust' | 'sparkle' | 'neon' | 'firefly';
}

export class SceneRenderer {
  private canvas: HTMLCanvasElement;
  private width: number;
  private height: number;
  private particles: AtmosphereParticle[] = [];
  private currentScene: string = 'coffee_shop';
  private time: number = 0;
  
  // v3: 昼夜和天气系统
  private dayNightCycle: DayNightCycle;
  private weatherSystem: WeatherSystem;
  private currentTime: TimeOfDay | null = null;
  private currentWeather: Weather | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.dayNightCycle = new DayNightCycle();
    this.weatherSystem = new WeatherSystem();
  }

  // 切换场景时调用
  setScene(sceneId: string) {
    this.currentScene = sceneId;
    const style = SCENE_STYLES[sceneId] || SCENE_STYLES['coffee_shop'];
    this.spawnAtmosphereParticles(style);
  }

  // 生成大气粒子
  private spawnAtmosphereParticles(style: SceneStyle) {
    this.particles = [];
    if (style.particles.count === 0) return;

    const count = style.particles.count;
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(style.particles, true));
    }
  }

  private createParticle(config: ParticleConfig, randomLife = false): AtmosphereParticle {
    const life = randomLife ? Math.random() : 0;
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.2 - 0.05,
      life,
      maxLife: 200 + Math.random() * 200,
      size: config.size * (0.5 + Math.random() * 0.5),
      color: config.color,
      phase: Math.random() * Math.PI * 2,
      type: config.type,
    };
  }

  // 更新粒子状态
  update(dt: number) {
    this.time += dt * 1000;
    const style = SCENE_STYLES[this.currentScene] || SCENE_STYLES['coffee_shop'];
    const config = style.particles;

    for (const p of this.particles) {
      // 漂浮动画
      const float = Math.sin(this.time / 1000 + p.phase) * 0.5;
      p.x += p.vx + (config.type === 'firefly' ? Math.sin(this.time / 800 + p.phase) * 0.3 : 0);
      p.y += p.vy + float * 0.1;

      if (config.type === 'firefly') {
        // 萤火虫：上下随机漂浮
        p.vy = Math.sin(this.time / 600 + p.phase * 2) * 0.3;
      }

      p.life += dt * 60;

      // 边界重置
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.y > this.height + 10) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }
    }

    // 保持粒子数量
    if (config.count === 0) return;
    while (this.particles.length < config.count) {
      this.particles.push(this.createParticle(config));
    }
    while (this.particles.length > config.count * 1.5) {
      this.particles.pop();
    }
  }

  // 渲染天空渐变
  drawSkyGradient(ctx: CanvasRenderingContext2D, style: SceneStyle) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    const stops = style.skyGradient.length;
    style.skyGradient.forEach((color, i) => {
      gradient.addColorStop(i / (stops - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // 渲染体积光
  drawLightRays(ctx: CanvasRenderingContext2D, style: SceneStyle) {
    for (const ray of style.lightRays) {
      const pulseSpeed = ray.pulseSpeed || 1000;
      const pulse = ray.pulse
        ? (Math.sin(this.time / pulseSpeed * Math.PI * 2) * 0.3 + 0.7)
        : 1;

      ctx.save();
      ctx.translate(ray.x, ray.y);
      ctx.rotate(ray.angle);

      // 光柱渐变
      const rayGradient = ctx.createLinearGradient(0, 0, 0, this.height);
      rayGradient.addColorStop(0, this.hexToRgba(ray.color, pulse));
      rayGradient.addColorStop(0.4, this.hexToRgba(ray.color, pulse * 0.5));
      rayGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = rayGradient;
      ctx.beginPath();
      ctx.moveTo(-ray.width / 2, 0);
      ctx.lineTo(ray.width / 2, 0);
      ctx.lineTo(ray.width * 0.8, this.height);
      ctx.lineTo(-ray.width * 0.8, this.height);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // 渲染大气粒子
  drawParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const lifeRatio = p.life / p.maxLife;
      // 淡入淡出
      let alpha = 1;
      if (lifeRatio < 0.1) alpha = lifeRatio / 0.1;
      else if (lifeRatio > 0.8) alpha = (1 - lifeRatio) / 0.2;

      const pulse = p.type === 'sparkle' || p.type === 'neon'
        ? (Math.sin(this.time / 300 + p.phase) * 0.4 + 0.6)
        : 1;

      ctx.globalAlpha = alpha * pulse * 0.7;

      if (p.type === 'sparkle' || p.type === 'neon') {
        // 菱形光点
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.type === 'firefly') {
        // 萤火虫：发光圆形
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        glow.addColorStop(0, p.color + 'cc');
        glow.addColorStop(0.5, p.color + '40');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 尘埃：柔和圆点
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // 渲染地板（带纹理）
  drawFloor(ctx: CanvasRenderingContext2D, style: SceneStyle, sceneFloorPattern?: string) {
    const floorY = this.height * 0.65;

    // 地板渐变底色
    const floorGradient = ctx.createLinearGradient(0, floorY, 0, this.height);
    floorGradient.addColorStop(0, style.floorTint + 'dd');
    floorGradient.addColorStop(1, style.floorTint + 'ff');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, floorY, this.width, this.height - floorY);

    // 网格线
    ctx.strokeStyle = style.ambientColor + '12';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let i = 0; i < this.width / gridSize + 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, floorY);
      ctx.lineTo(i * gridSize, this.height);
      ctx.stroke();
    }
    for (let j = 0; j < (this.height - floorY) / gridSize + 1; j++) {
      ctx.beginPath();
      ctx.moveTo(0, floorY + j * gridSize);
      ctx.lineTo(this.width, floorY + j * gridSize);
      ctx.stroke();
    }

    // 地板纹理噪声
    if (style.floorNoise) {
      ctx.fillStyle = style.ambientColor + '08';
      for (let i = 0; i < 60; i++) {
        const bx = Math.sin(i * 137.5) * 0.5 + 0.5;
        const by = Math.sin(i * 73.13) * 0.5 + 0.5;
        const x = bx * this.width;
        const y = floorY + by * (this.height - floorY);
        const size = (Math.sin(i * 91.31) * 0.5 + 0.5) * 6 + 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 木地板纹理
    if (sceneFloorPattern === 'wood') {
      ctx.strokeStyle = style.ambientColor + '10';
      ctx.lineWidth = 1;
      for (let y = Math.floor(floorY); y < this.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
        for (let x = 0; x < this.width; x += 80) {
          const offset = (y % 60 === 0) ? 0 : 40;
          ctx.beginPath();
          ctx.moveTo(x + offset, y);
          ctx.lineTo(x + offset + 40, y + 30);
          ctx.stroke();
        }
      }
    }

    // 大理石纹理
    if (sceneFloorPattern === 'marble') {
      for (let y = floorY; y < this.height; y += 60) {
        const grad = ctx.createLinearGradient(0, y, this.width, y + 60);
        grad.addColorStop(0, style.ambientColor + '05');
        grad.addColorStop(0.5, style.ambientColor + '10');
        grad.addColorStop(1, style.ambientColor + '05');
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, this.width, 60);
      }
    }
  }

  // 渲染暗角
  drawVignette(ctx: CanvasRenderingContext2D, style: SceneStyle) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const gradient = ctx.createRadialGradient(cx, cy, maxR * 0.4, cx, cy, maxR);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.6, style.vignette + '30');
    gradient.addColorStop(1, style.vignette + 'cc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // 渲染场景物体（带阴影）
  drawObjects(
    ctx: CanvasRenderingContext2D,
    objects: Array<{ emoji: string; x: number; y: number; width: number; height: number }>,
    style: SceneStyle
  ) {
    for (const obj of objects) {
      // 物体阴影
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(obj.x + obj.width / 2, obj.y + obj.height + 5, obj.width * 0.4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 物体高光（顶部）
      const highlightGrad = ctx.createLinearGradient(
        obj.x, obj.y,
        obj.x, obj.y + obj.height * 0.3
      );
      highlightGrad.addColorStop(0, style.ambientColor + '30');
      highlightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = highlightGrad;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height * 0.3);

      // emoji
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.9;
      ctx.fillText(obj.emoji, obj.x + obj.width / 2, obj.y + obj.height / 2 + 12);
      ctx.globalAlpha = 1;
    }
  }

  // 渲染角色（增强版：环境光遮蔽 + 选中效果）
  drawCharacterHighlight(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isSelected: boolean,
    isSpeaking: boolean,
    style: SceneStyle
  ) {
    // 环境光遮蔽（底部稍暗）
    const aoGradient = ctx.createLinearGradient(x, y, x, y + 30);
    aoGradient.addColorStop(0, 'transparent');
    aoGradient.addColorStop(1, style.vignette + '40');
    ctx.fillStyle = aoGradient;
    ctx.beginPath();
    ctx.ellipse(x, y + 25, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 选中金色边框
    if (isSelected) {
      const pulse = Math.sin(this.time / 400) * 0.2 + 0.8;
      ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 金色高光
      ctx.strokeStyle = `rgba(255, 215, 0, ${pulse * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 对话中高亮（柔和光晕）
    if (isSpeaking) {
      const speakingPulse = Math.sin(this.time / 300) * 0.2 + 0.8;
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
      glowGradient.addColorStop(0, style.ambientColor + Math.floor(speakingPulse * 60).toString(16).padStart(2, '0'));
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 主渲染入口（场景背景）- v3 支持昼夜和天气
  renderBackground(
    ctx: CanvasRenderingContext2D,
    sceneId: string,
    objects: Array<{ emoji: string; x: number; y: number; width: number; height: number }>,
    floorPattern?: string
  ) {
    const style = SCENE_STYLES[sceneId] || SCENE_STYLES['coffee_shop'];

    // 获取昼夜时间
    this.currentTime = this.dayNightCycle.getCurrentTime();
    this.currentWeather = this.weatherSystem.getCurrentWeather();

    // 1. 天空渐变（昼夜版本）
    this.drawTimeBasedSky(ctx, this.currentTime);

    // 2. 星空（夜晚）
    this.dayNightCycle.renderStars(ctx, this.currentTime, this.time);

    // 3. 太阳/月亮
    this.dayNightCycle.renderSunMoon(ctx, this.currentTime);

    // 4. 体积光（白天更明显）
    const lightIntensity = this.currentTime.phase === 'day' ? 1 : 
                          this.currentTime.phase === 'night' ? 0.2 : 0.6;
    ctx.globalAlpha = lightIntensity;
    this.drawLightRays(ctx, style);
    ctx.globalAlpha = 1;

    // 5. 地板
    this.drawFloor(ctx, style, floorPattern);

    // 6. 场景物体
    this.drawObjects(ctx, objects, style);

    // 7. 大气粒子（根据时间调整透明度）
    this.drawTimeBasedParticles(ctx, this.currentTime);

    // 8. 天气效果
    this.weatherSystem.render(ctx, this.width, this.height);

    // 9. 时间光照叠加
    this.dayNightCycle.applyLighting(ctx, this.currentTime, this.width, this.height);

    // 10. 暗角
    this.drawVignette(ctx, style);
  }

  // 绘制基于时间的天空
  private drawTimeBasedSky(ctx: CanvasRenderingContext2D, time: TimeOfDay) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    const stops = time.skyGradient.length;
    time.skyGradient.forEach((color, i) => {
      gradient.addColorStop(i / (stops - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // 绘制基于时间的大气粒子
  private drawTimeBasedParticles(ctx: CanvasRenderingContext2D, time: TimeOfDay) {
    // 根据时段调整粒子透明度
    const baseOpacity = time.ambientOpacity;
    
    for (const p of this.particles) {
      const lifeRatio = p.life / p.maxLife;
      // 淡入淡出
      let alpha = 1;
      if (lifeRatio < 0.1) alpha = lifeRatio / 0.1;
      else if (lifeRatio > 0.8) alpha = (1 - lifeRatio) / 0.2;

      const pulse = p.type === 'sparkle' || p.type === 'neon'
        ? (Math.sin(this.time / 300 + p.phase) * 0.4 + 0.6)
        : 1;

      // 夜晚萤火虫更亮
      const nightBoost = time.phase === 'night' && p.type === 'firefly' ? 1.5 : 1;
      ctx.globalAlpha = alpha * pulse * baseOpacity * nightBoost * 0.7;

      if (p.type === 'sparkle' || p.type === 'neon') {
        // 菱形光点
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.type === 'firefly') {
        // 萤火虫：发光圆形
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        glow.addColorStop(0, p.color + 'cc');
        glow.addColorStop(0.5, p.color + '40');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 尘埃：柔和圆点
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // 获取昼夜系统（供外部访问）
  getDayNightCycle(): DayNightCycle {
    return this.dayNightCycle;
  }

  // 获取天气系统（供外部访问）
  getWeatherSystem(): WeatherSystem {
    return this.weatherSystem;
  }

  // 获取当前时间
  getCurrentTime(): TimeOfDay | null {
    return this.currentTime;
  }

  // 获取当前天气
  getCurrentWeather(): Weather | null {
    return this.currentWeather;
  }

  // 获取当前场景风格
  getStyle(sceneId: string): SceneStyle {
    return SCENE_STYLES[sceneId] || SCENE_STYLES['coffee_shop'];
  }

  // 工具：hex颜色转rgba
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // 时间更新
  tick(dt: number) {
    this.time += dt * 1000;
    this.update(dt);
    // 更新天气系统
    this.weatherSystem.update(dt, this.width, this.height);
  }
}
