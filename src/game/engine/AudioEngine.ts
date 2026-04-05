// 像素世界音效引擎 - Web Audio API
// src/game/engine/AudioEngine.ts

export type SoundType = 
  | 'dialogue_pop'      // 对话气泡弹出
  | 'dialogue_close'    // 对话气泡关闭
  | 'character_select'  // 角色选中
  | 'scene_change'      // 场景切换
  | 'ui_click'          // UI点击
  | 'ambient'           // 环境音
  | 'footstep'          // 脚步声
  | 'notification';     // 通知提示

interface SceneAudio {
  ambientFreq: number;      // 环境音频率 Hz
  ambientType: OscillatorType;
  ambientVolume: number;    // 0-1
  bgmUrl?: string;          // 背景音乐URL（可选）
}

const SCENE_AUDIO: Record<string, SceneAudio> = {
  coffee_shop: {
    ambientFreq: 220,
    ambientType: 'sine',
    ambientVolume: 0.03,
    bgmUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  hospital: {
    ambientFreq: 110,
    ambientType: 'sine',
    ambientVolume: 0.02,
  },
  office: {
    ambientFreq: 180,
    ambientType: 'triangle',
    ambientVolume: 0.025,
  },
  street: {
    ambientFreq: 130,
    ambientType: 'sawtooth',
    ambientVolume: 0.02,
  },
  media_office: {
    ambientFreq: 300,
    ambientType: 'square',
    ambientVolume: 0.015,
  },
  court: {
    ambientFreq: 80,
    ambientType: 'sine',
    ambientVolume: 0.03,
  },
  police_station: {
    ambientFreq: 60,
    ambientType: 'sawtooth',
    ambientVolume: 0.02,
  },
  park: {
    ambientFreq: 400,
    ambientType: 'sine',
    ambientVolume: 0.02,
  },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;
  private currentScene = 'coffee_shop';
  private bgmVolume = 0.15;
  private sfxVolume = 0.4;

  // 初始化音频上下文（需要用户交互触发）
  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
      
      this.isInitialized = true;
      console.log('[AudioEngine] Initialized');
    } catch (e) {
      console.warn('[AudioEngine] Failed to init:', e);
    }
  }

  // 确保上下文在运行（处理浏览器自动播放策略）
  private async ensureContext(): Promise<boolean> {
    if (!this.ctx || !this.masterGain) {
      await this.init();
    }
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
    return !!this.ctx && !!this.masterGain;
  }

  // 播放音效
  async playSound(type: SoundType): Promise<void> {
    const ok = await this.ensureContext();
    if (!ok || !this.ctx) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'dialogue_pop':
        this.playTone(600, 'sine', 0.08, 0.15, now);
        this.playTone(800, 'sine', 0.05, 0.12, now + 0.03);
        break;

      case 'dialogue_close':
        this.playTone(400, 'sine', 0.06, 0.1, now);
        break;

      case 'character_select':
        this.playTone(523, 'triangle', 0.08, 0.2, now);
        this.playTone(659, 'triangle', 0.06, 0.18, now + 0.05);
        this.playTone(784, 'triangle', 0.05, 0.15, now + 0.1);
        break;

      case 'scene_change':
        this.playTone(200, 'sine', 0.1, 0.3, now);
        this.playTone(300, 'sine', 0.08, 0.25, now + 0.08);
        this.playTone(400, 'sine', 0.06, 0.2, now + 0.16);
        break;

      case 'ui_click':
        this.playTone(1000, 'square', 0.03, 0.05, now);
        break;

      case 'footstep':
        this.playTone(80 + Math.random() * 40, 'triangle', 0.04, 0.05, now);
        break;

      case 'notification':
        this.playTone(880, 'sine', 0.1, 0.15, now);
        this.playTone(1100, 'sine', 0.08, 0.12, now + 0.12);
        break;
    }
  }

  // 切换场景环境音
  async switchScene(sceneId: string): Promise<void> {
    const ok = await this.ensureContext();
    if (!ok || !this.ctx || !this.masterGain) return;

    this.currentScene = sceneId;
    const config = SCENE_AUDIO[sceneId] || SCENE_AUDIO.coffee_shop;

    // 停止旧环境音
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {}
      this.ambientOsc = null;
    }

    // 创建新环境音（低频振荡器模拟氛围）
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0;
    this.ambientGain.connect(this.masterGain);

    this.ambientOsc = this.ctx.createOscillator();
    this.ambientOsc.type = config.ambientType;
    this.ambientOsc.frequency.value = config.ambientFreq;
    this.ambientOsc.connect(this.ambientGain);
    this.ambientOsc.start();

    // 淡入环境音
    this.ambientGain.gain.setTargetAtTime(
      config.ambientVolume,
      this.ctx.currentTime,
      1.0
    );

    // 播放BGM（如果配置了）
    if (config.bgmUrl) {
      this.playBGM(config.bgmUrl);
    } else {
      this.stopBGM();
    }

    await this.playSound('scene_change');
  }

  // 播放背景音乐
  private playBGM(url: string): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }

    try {
      this.bgmAudio = new Audio(url);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.bgmVolume;

      // 通过 GainNode 控制音量
      if (this.ctx && this.masterGain) {
        const source = this.ctx.createMediaElementSource(this.bgmAudio);
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.3;
        source.connect(this.bgmGain);
        this.bgmGain.connect(this.masterGain);
      }

      this.bgmAudio.play().catch(() => {
        // 用户未交互时自动播放会被阻止，静默忽略
      });
    } catch (e) {
      console.warn('[AudioEngine] BGM failed:', e);
    }
  }

  // 停止背景音乐
  private stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }
  }

  // 播放一个纯音
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number,
    startTime: number
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * this.sfxVolume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  // 设置音量
  setMasterVolume(v: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
    }
  }

  setBGMVolume(v: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, v));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
  }

  setSFXVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  // 静音
  mute(): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  // 取消静音
  unmute(): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.1);
    }
  }

  dispose(): void {
    this.stopBGM();
    if (this.ambientOsc) {
      try { this.ambientOsc.stop(); } catch {}
      this.ambientOsc.disconnect();
    }
    if (this.ctx) {
      this.ctx.close();
    }
    this.isInitialized = false;
  }
}

// 单例
export const audioEngine = new AudioEngine();
