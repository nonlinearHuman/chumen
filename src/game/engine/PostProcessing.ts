// 像素世界后处理管线
// PostProcessing.ts - Canvas 2D 像素风后处理效果
// 效果：CRT扫描线、色差、泛光、暗角、屏幕震动

export interface PostProcessingConfig {
  scanlines: boolean;
  scanlineOpacity: number;
  bloom: boolean;
  bloomStrength: number;
  aberration: boolean;
  aberrationStrength: number;
  vignette: boolean;
  vignetteStrength: number;
  crtCurve: boolean;      // CRT曲面效果
  flicker: boolean;       // 屏幕闪烁
  grain: boolean;        // 胶片颗粒
}

export const DEFAULT_CONFIG: PostProcessingConfig = {
  scanlines: true,
  scanlineOpacity: 0.08,
  bloom: true,
  bloomStrength: 1.5,
  aberration: true,
  aberrationStrength: 2.5,
  vignette: true,
  vignetteStrength: 0.4,
  crtCurve: false,
  flicker: false,
  grain: false,
};

// 粒子效果（用于bloom）
interface BloomParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
}

export class PostProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreen: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D;
  private bloomCanvas: HTMLCanvasElement;
  private bloomCtx: CanvasRenderingContext2D;
  private config: PostProcessingConfig;
  private shakeX = 0;
  private shakeY = 0;
  private shakeIntensity = 0;
  private time = 0;

  // 扫描线 pattern
  private scanlinePattern: CanvasPattern | null = null;
  // 胶片颗粒数据
  private grainData: ImageData | null = null;
  private grainCanvas: HTMLCanvasElement;
  private grainCtx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, config: Partial<PostProcessingConfig> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 离屏canvas（用于绘制场景）
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = canvas.width;
    this.offscreen.height = canvas.height;
    this.offCtx = this.offscreen.getContext('2d')!;

    // Bloom专用canvas
    this.bloomCanvas = document.createElement('canvas');
    this.bloomCanvas.width = canvas.width;
    this.bloomCanvas.height = canvas.height;
    this.bloomCtx = this.bloomCanvas.getContext('2d')!;

    // 胶片颗粒canvas
    this.grainCanvas = document.createElement('canvas');
    this.grainCanvas.width = canvas.width;
    this.grainCanvas.height = canvas.height;
    this.grainCtx = this.grainCanvas.getContext('2d')!;

    this.buildScanlinePattern();
    this.buildGrain();
  }

  // 创建扫描线pattern（像素风——粗实线）
  private buildScanlinePattern() {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 4;
    patternCanvas.height = 4;
    const pCtx = patternCanvas.getContext('2d')!;
    // 每4px一条扫描线，像素风格
    pCtx.fillStyle = 'rgba(0,0,0,0.12)';
    pCtx.fillRect(0, 0, 4, 1);   // 第1行有扫描线（占25%）
    pCtx.fillRect(0, 2, 4, 1);   // 第3行有扫描线
    this.scanlinePattern = this.offCtx.createPattern(patternCanvas, 'repeat')!;
  }

  // 预先生成胶片颗粒
  private buildGrain() {
    const w = this.grainCanvas.width;
    const h = this.grainCanvas.height;
    const imageData = this.grainCtx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 30;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 8; // 透明度很低
    }
    this.grainCtx.putImageData(imageData, 0, 0);
    this.grainData = imageData;
  }

  // 获取离屏ctx（场景绘制到这个ctx）
  getDrawContext(): CanvasRenderingContext2D {
    return this.offCtx;
  }

  // 触发屏幕震动
  shake(intensity: number = 8, durationMs: number = 300) {
    this.shakeIntensity = intensity;
    setTimeout(() => {
      this.shakeIntensity = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }, durationMs);
  }

  // 更新震动
  private updateShake() {
    if (this.shakeIntensity > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    }
  }

  // 渲染完整后处理
  render(targetCtx?: CanvasRenderingContext2D) {
    const ctx = targetCtx || this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.time += 16;

    this.updateShake();

    // --- 1. 清空主画布 ---
    ctx.clearRect(0, 0, w, h);

    // 应用震动偏移
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    // --- 2. 绘制原始场景 ---
    ctx.drawImage(this.offscreen, 0, 0);

    // --- 3. Bloom（泛光）---
    if (this.config.bloom) {
      this.drawBloom(ctx, w, h);
    }

    // --- 4. 色差（Chromatic Aberration）---
    if (this.config.aberration) {
      this.drawAberration(ctx, w, h);
    }

    // --- 5. 暗角（Vignette）---
    if (this.config.vignette) {
      this.drawVignette(ctx, w, h);
    }

    // --- 6. 扫描线 ---
    if (this.config.scanlines && this.scanlinePattern) {
      ctx.fillStyle = this.scanlinePattern;
      ctx.fillRect(0, 0, w, h);
    }

    // --- 7. CRT曲面遮罩 ---
    if (this.config.crtCurve) {
      this.drawCRTCurve(ctx, w, h);
    }

    // --- 8. 屏幕闪烁 ---
    if (this.config.flicker) {
      this.drawFlicker(ctx, w, h);
    }

    // --- 9. 胶片颗粒 ---
    if (this.config.grain) {
      ctx.drawImage(this.grainCanvas, 0, 0);
    }

    // --- 10. 顶部边框线条（复古CRT效果）---
    this.drawCRTBorder(ctx, w, h);

    ctx.restore();
  }

  // 泛光效果 - 提取亮部，模糊后叠加
  private drawBloom(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // 清空bloom canvas
    this.bloomCtx.clearRect(0, 0, w, h);
    // 缩小绘制（加速模糊）
    const scale = 0.25;
    this.bloomCtx.drawImage(this.offscreen, 0, 0, w * scale, h * scale);
    // 多次模糊叠加（像素风不需要太柔和）
    for (let i = 0; i < 2; i++) {
      this.bloomCtx.filter = `blur(${2 + i * 2}px)`;
      this.bloomCtx.drawImage(this.bloomCanvas, 0, 0, w, h);
    }
    this.bloomCtx.filter = 'none';
    // 叠加到主画布
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.3 * this.config.bloomStrength;
    ctx.drawImage(this.bloomCanvas, 0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // 色差效果 - RGB通道分离
  private drawAberration(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const s = this.config.aberrationStrength;
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.015;

    // 红色通道右偏
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(this.offscreen, s, 0, w, h, 0, 0, w, h);
    // 蓝色通道左偏
    ctx.drawImage(this.offscreen, -s, 0, w, h, 0, 0, w, h);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // 暗角效果
  private drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const gradient = ctx.createRadialGradient(cx, cy, maxR * 0.3, cx, cy, maxR);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    gradient.addColorStop(1, `rgba(0,0,0,${this.config.vignetteStrength})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  // CRT曲面效果（遮罩）
  private drawCRTCurve(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.7, 'transparent');
    gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  // 屏幕闪烁
  private drawFlicker(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const flicker = Math.sin(this.time * 0.003) * 0.5 + 0.5;
    if (flicker > 0.95) {
      ctx.fillStyle = `rgba(255,255,255,${(flicker - 0.95) * 0.3})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // CRT边框（像素复古风）
  private drawCRTBorder(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    // 顶部细线
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(w, 2);
    ctx.stroke();
    // 底部细线
    ctx.beginPath();
    ctx.moveTo(0, h - 2);
    ctx.lineTo(w, h - 2);
    ctx.stroke();
  }

  // 更新配置
  setConfig(config: Partial<PostProcessingConfig>) {
    this.config = { ...this.config, ...config };
  }

  // 销毁
  destroy() {
    // nothing special
  }
}

// 预设：超强像素复古感
export const PIXEL_RETRO_CONFIG: PostProcessingConfig = {
  scanlines: true,
  scanlineOpacity: 0.12,
  bloom: true,
  bloomStrength: 1.2,
  aberration: true,
  aberrationStrength: 2,
  vignette: true,
  vignetteStrength: 0.5,
  crtCurve: false,
  flicker: false,
  grain: false,
};

// 预设：赛博朋克（霓虹泛光）
export const CYBER_PUNK_CONFIG: PostProcessingConfig = {
  scanlines: false,
  scanlineOpacity: 0.05,
  bloom: true,
  bloomStrength: 2.0,
  aberration: true,
  aberrationStrength: 4,
  vignette: true,
  vignetteStrength: 0.3,
  crtCurve: false,
  flicker: false,
  grain: false,
};
