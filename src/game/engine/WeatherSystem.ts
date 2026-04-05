// 天气系统 - WeatherSystem.ts
// 支持9种天气类型，带粒子效果和天气过渡

export type WeatherType = 
  | 'clear'       // 晴天
  | 'cloudy'      // 多云
  | 'overcast'    // 阴天
  | 'light_rain'  // 小雨
  | 'heavy_rain'  // 大雨
  | 'thunderstorm'// 雷暴
  | 'light_snow'  // 小雪
  | 'heavy_snow'  // 大雪
  | 'fog';        // 雾天

export interface Weather {
  type: WeatherType;
  intensity: number;    // 0-1 强度
  duration: number;     // 持续时间（毫秒）
  startTime: number;    // 开始时间
  skyOverlay: string;   // 天空叠加颜色
  lightModifier: {      // 光线修正
    color: string;
    opacity: number;
  };
}

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  wobble?: number;      // 雪花摇摆
  angle?: number;       // 雨滴角度
}

// 天气配置
const WEATHER_CONFIGS: Record<WeatherType, Omit<Weather, 'startTime'>> = {
  clear: {
    type: 'clear',
    intensity: 0,
    duration: 300000,
    skyOverlay: 'transparent',
    lightModifier: { color: '#ffffff', opacity: 0 },
  },
  cloudy: {
    type: 'cloudy',
    intensity: 0.3,
    duration: 180000,
    skyOverlay: 'rgba(200, 200, 210, 0.15)',
    lightModifier: { color: '#cccccc', opacity: 0.1 },
  },
  overcast: {
    type: 'overcast',
    intensity: 0.5,
    duration: 240000,
    skyOverlay: 'rgba(150, 150, 160, 0.25)',
    lightModifier: { color: '#888888', opacity: 0.2 },
  },
  light_rain: {
    type: 'light_rain',
    intensity: 0.4,
    duration: 120000,
    skyOverlay: 'rgba(100, 100, 120, 0.3)',
    lightModifier: { color: '#666688', opacity: 0.15 },
  },
  heavy_rain: {
    type: 'heavy_rain',
    intensity: 0.8,
    duration: 90000,
    skyOverlay: 'rgba(60, 60, 80, 0.4)',
    lightModifier: { color: '#444466', opacity: 0.3 },
  },
  thunderstorm: {
    type: 'thunderstorm',
    intensity: 1.0,
    duration: 60000,
    skyOverlay: 'rgba(40, 40, 60, 0.5)',
    lightModifier: { color: '#333355', opacity: 0.4 },
  },
  light_snow: {
    type: 'light_snow',
    intensity: 0.3,
    duration: 180000,
    skyOverlay: 'rgba(220, 225, 235, 0.2)',
    lightModifier: { color: '#e0e5f0', opacity: 0.1 },
  },
  heavy_snow: {
    type: 'heavy_snow',
    intensity: 0.7,
    duration: 120000,
    skyOverlay: 'rgba(230, 235, 245, 0.35)',
    lightModifier: { color: '#d0d5e0', opacity: 0.2 },
  },
  fog: {
    type: 'fog',
    intensity: 0.6,
    duration: 150000,
    skyOverlay: 'rgba(200, 205, 210, 0.5)',
    lightModifier: { color: '#aaaaaa', opacity: 0.3 },
  },
};

// 天气概率分布
const WEATHER_PROBABILITIES: [WeatherType, number][] = [
  ['clear', 0.40],
  ['cloudy', 0.30],
  ['overcast', 0.15],
  ['light_rain', 0.06],
  ['heavy_rain', 0.03],
  ['thunderstorm', 0.01],
  ['light_snow', 0.03],
  ['heavy_snow', 0.01],
  ['fog', 0.01],
];

export class WeatherSystem {
  private currentWeather: Weather;
  private previousWeather: Weather | null = null;
  private transitionProgress: number = 1; // 0-1, 1=完成
  private transitionDuration: number = 5000; // 过渡时长 5秒
  private particles: WeatherParticle[] = [];
  private lightningTime: number = 0;
  private lightningFlash: number = 0;
  private width: number = 800;
  private height: number = 600;

  constructor() {
    this.currentWeather = {
      ...WEATHER_CONFIGS.clear,
      startTime: Date.now(),
    };
  }

  // 生成随机天气
  generateWeather(): Weather {
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, probability] of WEATHER_PROBABILITIES) {
      cumulative += probability;
      if (rand <= cumulative) {
        return {
          ...WEATHER_CONFIGS[type],
          startTime: Date.now(),
        };
      }
    }

    return {
      ...WEATHER_CONFIGS.clear,
      startTime: Date.now(),
    };
  }

  // 设置天气
  setWeather(type: WeatherType, duration?: number) {
    const config = WEATHER_CONFIGS[type];
    this.transitionTo({
      ...config,
      duration: duration || config.duration,
      startTime: Date.now(),
    });
  }

  // 天气过渡
  transitionTo(newWeather: Weather, duration: number = 5000) {
    this.previousWeather = this.currentWeather;
    this.currentWeather = newWeather;
    this.transitionProgress = 0;
    this.transitionDuration = duration;
    this.particles = []; // 重置粒子
  }

  // 更新天气状态
  update(dt: number, width: number, height: number) {
    this.width = width;
    this.height = height;

    // 更新过渡
    if (this.transitionProgress < 1) {
      this.transitionProgress += dt * 1000 / this.transitionDuration;
      if (this.transitionProgress > 1) {
        this.transitionProgress = 1;
        this.previousWeather = null;
      }
    }

    // 检查天气是否结束
    const elapsed = Date.now() - this.currentWeather.startTime;
    if (elapsed > this.currentWeather.duration && this.transitionProgress >= 1) {
      const newWeather = this.generateWeather();
      this.transitionTo(newWeather);
    }

    // 更新粒子
    this.updateParticles(dt);

    // 更新闪电
    if (this.currentWeather.type === 'thunderstorm') {
      this.updateLightning(dt);
    }
  }

  // 更新粒子
  private updateParticles(dt: number) {
    const type = this.currentWeather.type;
    const intensity = this.currentWeather.intensity;

    // 雨粒子
    if (type === 'light_rain' || type === 'heavy_rain' || type === 'thunderstorm') {
      const targetCount = type === 'light_rain' ? 100 : type === 'heavy_rain' ? 300 : 400;
      while (this.particles.length < targetCount) {
        this.particles.push(this.createRainDrop());
      }
    }

    // 雪粒子
    if (type === 'light_snow' || type === 'heavy_snow') {
      const targetCount = type === 'light_snow' ? 80 : 200;
      while (this.particles.length < targetCount) {
        this.particles.push(this.createSnowflake());
      }
    }

    // 更新现有粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life += dt * 60;

      // 雪花摇摆
      if (p.wobble !== undefined) {
        p.x += Math.sin(p.life * 0.1) * p.wobble;
      }

      // 重置出界粒子
      if (p.y > this.height + 20 || p.x < -20 || p.x > this.width + 20 || p.life > p.maxLife) {
        if (type.includes('rain')) {
          Object.assign(p, this.createRainDrop());
        } else if (type.includes('snow')) {
          Object.assign(p, this.createSnowflake());
        }
      }
    }

    // 非雨雪天气清空粒子
    if (!type.includes('rain') && !type.includes('snow')) {
      this.particles = [];
    }
  }

  // 创建雨滴
  private createRainDrop(): WeatherParticle {
    return {
      x: Math.random() * this.width,
      y: -20,
      vx: -2 + Math.random() * -2,
      vy: 15 + Math.random() * 10,
      size: 2,
      opacity: 0.4 + Math.random() * 0.3,
      life: 0,
      maxLife: 200,
      angle: Math.PI * 0.1,
    };
  }

  // 创建雪花
  private createSnowflake(): WeatherParticle {
    return {
      x: Math.random() * this.width,
      y: -20,
      vx: (Math.random() - 0.5) * 1,
      vy: 1 + Math.random() * 2,
      size: 2 + Math.random() * 3,
      opacity: 0.6 + Math.random() * 0.4,
      life: 0,
      maxLife: 300 + Math.random() * 200,
      wobble: 0.5 + Math.random() * 0.5,
    };
  }

  // 更新闪电
  private updateLightning(dt: number) {
    this.lightningTime += dt * 1000;
    
    // 随机触发闪电
    if (Math.random() < 0.003) {
      this.lightningFlash = 1;
      this.lightningTime = 0;
    }

    // 闪光衰减
    if (this.lightningFlash > 0) {
      this.lightningFlash -= dt * 5;
      if (this.lightningFlash < 0) this.lightningFlash = 0;
    }
  }

  // 获取当前天气
  getCurrentWeather(): Weather {
    if (this.transitionProgress < 1 && this.previousWeather) {
      // 过渡期间，混合两种天气
      return this.interpolateWeather(
        this.previousWeather,
        this.currentWeather,
        this.transitionProgress
      );
    }
    return this.currentWeather;
  }

  // 插值天气
  private interpolateWeather(w1: Weather, w2: Weather, t: number): Weather {
    return {
      type: t < 0.5 ? w1.type : w2.type,
      intensity: w1.intensity + (w2.intensity - w1.intensity) * t,
      duration: w2.duration,
      startTime: w2.startTime,
      skyOverlay: this.lerpColor(w1.skyOverlay, w2.skyOverlay, t),
      lightModifier: {
        color: this.lerpColor(w1.lightModifier.color, w2.lightModifier.color, t),
        opacity: w1.lightModifier.opacity + (w2.lightModifier.opacity - w1.lightModifier.opacity) * t,
      },
    };
  }

  private lerpColor(c1: string, c2: string, t: number): string {
    // 简化处理：直接返回目标颜色
    if (t >= 0.5) return c2;
    return c1;
  }

  // 渲染天气效果
  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const weather = this.getCurrentWeather();

    // 1. 天空叠加
    if (weather.skyOverlay !== 'transparent') {
      ctx.fillStyle = weather.skyOverlay;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. 雨粒子
    if (weather.type.includes('rain')) {
      this.renderRain(ctx);
    }

    // 3. 雪粒子
    if (weather.type.includes('snow')) {
      this.renderSnow(ctx);
    }

    // 4. 雾效果
    if (weather.type === 'fog') {
      this.renderFog(ctx, width, height);
    }

    // 5. 闪电
    if (weather.type === 'thunderstorm' && this.lightningFlash > 0) {
      this.renderLightning(ctx, width, height);
    }
  }

  // 渲染雨
  private renderRain(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#8899aa';
    ctx.lineWidth = 1.5;

    for (const drop of this.particles) {
      ctx.globalAlpha = drop.opacity;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(
        drop.x + Math.cos(drop.angle || 0) * 15,
        drop.y + Math.sin(drop.angle || 0.5) * 15
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // 渲染雪
  private renderSnow(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ffffff';

    for (const flake of this.particles) {
      ctx.globalAlpha = flake.opacity;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 渲染雾
  private renderFog(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(200, 205, 210, 0.3)');
    gradient.addColorStop(0.5, 'rgba(200, 205, 210, 0.5)');
    gradient.addColorStop(1, 'rgba(200, 205, 210, 0.4)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 随机雾团
    const time = Date.now() / 1000;
    for (let i = 0; i < 5; i++) {
      const x = (Math.sin(time * 0.1 + i) * 0.5 + 0.5) * width;
      const y = height * 0.3 + i * 80;
      const radius = 150 + Math.sin(time * 0.2 + i * 2) * 50;

      const fogGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      fogGrad.addColorStop(0, 'rgba(220, 225, 230, 0.4)');
      fogGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 渲染闪电
  private renderLightning(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (this.lightningFlash <= 0) return;

    ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash * 0.6})`;
    ctx.fillRect(0, 0, width, height);

    // 闪电纹路
    if (this.lightningFlash > 0.5) {
      ctx.strokeStyle = `rgba(255, 255, 200, ${this.lightningFlash})`;
      ctx.lineWidth = 3;
      ctx.beginPath();

      const startX = width * 0.3 + Math.random() * width * 0.4;
      let x = startX;
      let y = 0;

      ctx.moveTo(x, y);

      while (y < height * 0.7) {
        x += (Math.random() - 0.5) * 60;
        y += 20 + Math.random() * 30;
        ctx.lineTo(x, y);

        // 分支
        if (Math.random() > 0.7) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + (Math.random() - 0.5) * 100, y + 50);
          ctx.moveTo(x, y);
        }
      }

      ctx.stroke();
    }
  }

  // 获取天气名称
  getWeatherName(type: WeatherType): string {
    const names: Record<WeatherType, string> = {
      clear: '☀️ 晴天',
      cloudy: '⛅ 多云',
      overcast: '☁️ 阴天',
      light_rain: '🌧️ 小雨',
      heavy_rain: '🌧️ 大雨',
      thunderstorm: '⛈️ 雷暴',
      light_snow: '🌨️ 小雪',
      heavy_snow: '❄️ 大雪',
      fog: '🌫️ 雾天',
    };
    return names[type];
  }

  // 获取所有天气类型
  getAllWeatherTypes(): WeatherType[] {
    return [
      'clear', 'cloudy', 'overcast',
      'light_rain', 'heavy_rain', 'thunderstorm',
      'light_snow', 'heavy_snow', 'fog',
    ];
  }
}
