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
  | 'notification'      // 通知提示
  | 'npc_trigger'       // NPC触发（张姨八卦、小王打探）
  | 'emotion_change'    // 情绪变化
  | 'story_event'       // 剧情事件触发
  | 'legendary_appear'  // 传奇角色出现
  | 'item_collect'      // 收集物品
  | 'error'             // 错误提示
  | 'success'           // 成功提示
  | 'rare_appear';      // 稀有角色出现

interface SceneAudio {
  ambientFreq: number;      // 环境音频率 Hz
  ambientType: OscillatorType;
  ambientVolume: number;    // 0-1
  bgmUrl?: string;          // 背景音乐URL（可选）
}

// 免费公版BGM（Pixabay）- 可直接使用
const FREE_BGM: Record<string, string | undefined> = {
  coffee_shop: 'https://cdn.pixabay.com/audio/2022/03/15/audio_1ec46ab521.mp3', // 咖啡馆爵士
  hospital:    'https://cdn.pixabay.com/audio/2022/10/25/audio_a5167ab41b.mp3', // 医疗环境
  office:      'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', // 办公氛围
  street:      'https://cdn.pixabay.com/audio/2022/08/31/audio_419263fc32.mp3', // 城市街道
  court:       'https://cdn.pixabay.com/audio/2022/03/10/audio_6c41ba6409.mp3', // 庄严音乐
  park:        'https://cdn.pixabay.com/audio/2022/03/24/audio_944e087a4c.mp3', // 自然环境
  media_office: 'https://cdn.pixabay.com/audio/2022/03/15/audio_1ec46ab521.mp3', // 同咖啡馆
  police_station: 'https://cdn.pixabay.com/audio/2022/03/10/audio_6c41ba6409.mp3', // 庄严低沉
};

const SCENE_AUDIO: Record<string, SceneAudio> = {
  coffee_shop: {
    ambientFreq: 220,
    ambientType: 'sine',
    ambientVolume: 0.03,
    bgmUrl: FREE_BGM.coffee_shop,
  },
  hospital: {
    ambientFreq: 110,
    ambientType: 'sine',
    ambientVolume: 0.02,
    bgmUrl: FREE_BGM.hospital,
  },
  office: {
    ambientFreq: 180,
    ambientType: 'triangle',
    ambientVolume: 0.025,
    bgmUrl: FREE_BGM.office,
  },
  street: {
    ambientFreq: 130,
    ambientType: 'sawtooth',
    ambientVolume: 0.02,
    bgmUrl: FREE_BGM.street,
  },
  media_office: {
    ambientFreq: 300,
    ambientType: 'square',
    ambientVolume: 0.015,
    bgmUrl: FREE_BGM.media_office,
  },
  court: {
    ambientFreq: 80,
    ambientType: 'sine',
    ambientVolume: 0.03,
    bgmUrl: FREE_BGM.court,
  },
  police_station: {
    ambientFreq: 60,
    ambientType: 'sawtooth',
    ambientVolume: 0.02,
    bgmUrl: FREE_BGM.police_station,
  },
  park: {
    ambientFreq: 400,
    ambientType: 'sine',
    ambientVolume: 0.02,
    bgmUrl: FREE_BGM.park,
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

      case 'npc_trigger':
        // NPC触发：短促颤音 + 上扬 - 八卦/打探的感觉
        this.playTone(400, 'triangle', 0.06, 0.18, now);
        this.playTone(500, 'triangle', 0.05, 0.15, now + 0.04);
        this.playTone(600, 'triangle', 0.04, 0.12, now + 0.08);
        break;

      case 'emotion_change':
        // 情绪变化：柔和的滑音
        this.playTone(300, 'sine', 0.1, 0.12, now);
        this.playTone(450, 'sine', 0.08, 0.10, now + 0.06);
        break;

      case 'story_event':
        // 剧情事件：戏剧性的三连音
        this.playTone(250, 'sawtooth', 0.12, 0.15, now);
        this.playTone(375, 'sawtooth', 0.10, 0.12, now + 0.1);
        this.playTone(500, 'sawtooth', 0.08, 0.10, now + 0.2);
        break;

      case 'legendary_appear':
        // 传奇角色出现：金色庄严上行音阶
        this.playTone(330, 'triangle', 0.12, 0.20, now);
        this.playTone(440, 'triangle', 0.10, 0.18, now + 0.12);
        this.playTone(550, 'triangle', 0.10, 0.16, now + 0.24);
        this.playTone(660, 'triangle', 0.08, 0.14, now + 0.36);
        this.playTone(880, 'triangle', 0.06, 0.12, now + 0.48);
        break;

      case 'item_collect':
        // 收集物品：清脆叮咚音
        this.playTone(880, 'sine', 0.06, 0.18, now);
        this.playTone(1100, 'sine', 0.05, 0.15, now + 0.06);
        this.playTone(1320, 'sine', 0.04, 0.12, now + 0.12);
        break;

      case 'error':
        // 错误提示：低沉的下降音
        this.playTone(200, 'sawtooth', 0.1, 0.15, now);
        this.playTone(150, 'sawtooth', 0.08, 0.12, now + 0.08);
        break;

      case 'success':
        // 成功提示：欢快的上行三连
        this.playTone(523, 'sine', 0.08, 0.18, now);
        this.playTone(659, 'sine', 0.07, 0.16, now + 0.07);
        this.playTone(784, 'sine', 0.06, 0.14, now + 0.14);
        break;

      case 'rare_appear':
        // 稀有角色出现：神秘的下降 + 上升
        this.playTone(600, 'sine', 0.1, 0.15, now);
        this.playTone(450, 'sine', 0.08, 0.12, now + 0.08);
        this.playTone(600, 'sine', 0.06, 0.10, now + 0.16);
        this.playTone(800, 'sine', 0.05, 0.08, now + 0.24);
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
