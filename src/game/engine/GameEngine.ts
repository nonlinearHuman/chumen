// 像素世界游戏引擎 - v5 昼夜循环+天气系统版
// src/game/engine/GameEngine.ts

import { useRef, useEffect, useCallback, useState } from 'react';
import { gameScenes, getSceneById, GameScene } from '../config/scenes';
import {
  PixelCharacter,
  DEFAULT_CHARACTERS,
  drawPixelSprite,
  createPixelCharacter
} from './PixelSprite';
import { audioEngine } from './AudioEngine';
import { PostProcessor, PIXEL_RETRO_CONFIG } from './PostProcessing';
import { ParticleSystem } from './ParticleSystem';
import { SceneRenderer } from './SceneRenderer';
import { TimeOfDay } from './DayNightCycle';
import { Weather, WeatherType } from './WeatherSystem';

export interface Position {
  x: number;
  y: number;
}

export type Direction8 = 'up' | 'down' | 'left' | 'right' | 'up_left' | 'up_right' | 'down_left' | 'down_right';

export interface Character {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: Direction8;
  isMoving: boolean;
  color: string;
  skills?: string[];
  frameIndex: number;
  lastFrameTime: number;
  emotion?: 'happy' | 'angry' | 'love' | 'neutral';
  lastEmotionTime: number;
}

export interface Dialogue {
  id: string;
  characterId: string;
  content: string;
  timestamp: number;
  x: number;
  y: number;
  opacity: number;
}

// 创建角色
export const createDefaultCharacters = (): Character[] => [
  {
    id: 'marcus', name: 'Marcus', emoji: '🧑‍💻',
    x: 200, y: 300, targetX: 200, targetY: 300,
    direction: 'down', isMoving: false, color: '#4a90d9',
    skills: ['谈判', '编程', '领导'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'sophia', name: 'Sophia', emoji: '👩‍⚖️',
    x: 400, y: 300, targetX: 400, targetY: 300,
    direction: 'down_left', isMoving: false, color: '#9b59b6',
    skills: ['法律', '谈判', '社交'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'james', name: 'James', emoji: '👨‍⚕️',
    x: 600, y: 300, targetX: 600, targetY: 300,
    direction: 'down_right', isMoving: false, color: '#27ae60',
    skills: ['医疗', '科研', '同理心'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'emily', name: 'Emily', emoji: '📰',
    x: 200, y: 450, targetX: 200, targetY: 450,
    direction: 'up', isMoving: false, color: '#e74c3c',
    skills: ['调查', '写作', '社交'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'david', name: 'David', emoji: '🕴️',
    x: 500, y: 450, targetX: 500, targetY: 450,
    direction: 'up_right', isMoving: false, color: '#2c3e50',
    skills: ['投资', '博弈', '布局'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'lisa', name: 'Lisa', emoji: '📱',
    x: 350, y: 200, targetX: 350, targetY: 200,
    direction: 'down_left', isMoving: false, color: '#e91e8c',
    skills: ['表演', '社交', '运营'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'robert', name: 'Robert', emoji: '👮',
    x: 650, y: 200, targetX: 650, targetY: 200,
    direction: 'down', isMoving: false, color: '#1a5276',
    skills: ['侦查', '审讯', '推理'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'zhangyi', name: '张姨', emoji: '👵',
    x: 100, y: 350, targetX: 100, targetY: 350,
    direction: 'right', isMoving: false, color: '#d35400',
    skills: ['八卦', '社交', '撮合'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'xiaowang', name: '小王', emoji: '🎓',
    x: 450, y: 450, targetX: 450, targetY: 450,
    direction: 'up_left', isMoving: false, color: '#16a085',
    skills: ['写作', '调查', '学习'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
  {
    id: 'laoli', name: '老李', emoji: '🚕',
    x: 600, y: 450, targetX: 600, targetY: 450,
    direction: 'up', isMoving: false, color: '#7f8c8d',
    skills: ['驾驶', '聊天', '情报'], frameIndex: 0, lastFrameTime: 0, lastEmotionTime: 0
  },
];

// 楚门剧本风格对话
const web3Dialogues: Record<string, string[]> = {
  marcus: [
    "这笔融资太难了，David给的压力不小...",
    "Sophia那边条件苛刻，但我们需要这笔钱。",
    "我的投资人总在催数据，我却觉得产品更重要。",
    "Emily又在查我的底细，当CEO真累。",
    "公司估值能不能再往上走走？",
  ],
  sophia: [
    "Marcus还是太嫩了，商业谈判不是靠激情。",
    "这份合同有几个漏洞，得让他们重新改。",
    "David那边的尽调我全程盯着，谁都别想糊弄我。",
    "律师的职业病——什么事都要留证据。",
    "商场如战场，细节决定成败。",
  ],
  james: [
    "今天又做了三台手术，累但值得。",
    "Marcus是我大学同学，关系一直很好。",
    "Emily今天怎么约我喝咖啡？有点反常。",
    "医院的工作太忙了，根本没时间社交。",
    "当医生久了，看人反而更准。",
  ],
  emily: [
    "David的项目有问题，我得深入查一下。",
    "匿名信说Marcus和David有内幕交易...",
    "James今天表情有点奇怪，是不是知道什么？",
    "做调查记者这些年，真相越来越难挖。",
    "小王那边有新线索了吗？",
  ],
  david: [
    "Marcus想要更多估值？得让他听话才行。",
    "这笔投资回报周期太长了，不划算。",
    "Sophia那个律师不好对付，得换个策略。",
    "商场上没有永远的朋友，只有永远的利益。",
    "我的下一步棋，Marcus不会想到的。",
  ],
  lisa: [
    "今天发了条动态，没想到引发这么大风波...",
    "James医生人挺好的呀，怎么会有人黑他？",
    "涨粉了涨粉了！终于上热搜了！",
    "我就随手一发，谁知道会这样啊 😅",
    "小王记者约我采访？去听听看。",
  ],
  robert: [
    "最近接了个失踪案，报案人是Lisa。",
    "失踪者背景不简单，事情蹊跷得很。",
    "Evidence不会说谎，跟着证据走。",
    "David那边有人在暗中操作？",
    "有案子就会有破绽，我等着。",
  ],
  zhangyi: [
    "哎你们知道不，Marcus和Sophia在咖啡馆碰到了！",
    "老李家儿子刚从国外回来，可出息了！",
    "社区活动赶紧报名啊，名额有限！",
    "Lisa那姑娘我看着不靠谱，天天就知道玩手机。",
    "我跟你们说，这事儿我门儿清！",
  ],
  xiaowang: [
    "Emily姐让我查David的背景，有线索了！",
    "老师说要独立思考，但我还是经常踩坑。",
    "做记者真不容易，每天都有新挑战。",
    "这条新闻要是发出去，绝对炸裂！",
    "老李叔开车拉过好多人，情报可多了。",
  ],
  laoli: [
    "我跟你说，Marcus那天在咖啡馆接了个电话，脸色可难看了。",
    "开车这么多年，什么人都见过。",
    "David那天包了我车，一路上电话没停过，好像在谈什么交易。",
    "做我们这行的，见多识广！",
    "有一次拉到Emily，那姑娘一直在记东西。",
  ],
};

// 像素精灵映射
const PIXEL_SPRITES: Record<string, PixelCharacter> = {
  marcus: createPixelCharacter('marcus', 'Marcus', '#4a90d9', '#2d2d2d', '#f5d0c5', 'suit'),
  sophia: createPixelCharacter('sophia', 'Sophia', '#9b59b6', '#6b4423', '#f5d0c5', 'suit'),
  james: createPixelCharacter('james', 'James', '#27ae60', '#1a7a3a', '#f5d0c5', 'doctor'),
  emily: createPixelCharacter('emily', 'Emily', '#e74c3c', '#8b2500', '#f5d0c5', 'reporter'),
  david: createPixelCharacter('david', 'David', '#2c3e50', '#1a1a1a', '#e8c4a0', 'suit'),
  lisa: createPixelCharacter('lisa', 'Lisa', '#e91e8c', '#b3005c', '#ffe4c4', 'casual'),
  robert: createPixelCharacter('robert', 'Robert', '#1a5276', '#0d2d47', '#c4a574', 'police'),
  zhangyi: createPixelCharacter('zhangyi', '张姨', '#d35400', '#888888', '#ffe4c4', 'casual'),
  xiaowang: createPixelCharacter('xiaowang', '小王', '#16a085', '#0d5249', '#f5d0c5', 'casual'),
  laoli: createPixelCharacter('laoli', '老李', '#7f8c8d', '#4a5254', '#c4a574', 'casual'),
};

// 情绪→预设粒子
const EMOTION_PRESETS: Record<string, string> = {
  happy: 'emotion_happy',
  angry: 'emotion_angry',
  love: 'emotion_love',
  neutral: 'emotion_happy',
};

export const useGameEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [characters, setCharacters] = useState<Character[]>(createDefaultCharacters());
  const [scene, setSceneState] = useState<GameScene>(gameScenes[0]);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  // 后处理 + 粒子系统 + 场景渲染器
  const postProcessorRef = useRef<PostProcessor | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const sceneRendererRef = useRef<SceneRenderer | null>(null);

  // 场景氛围预设
  const sceneEmitters: Record<string, string> = {
    cafe: 'dust_coffee',
    hospital: 'dust_office',
    court: 'dust_office',
    office: 'dust_office',
  };

  // 切换场景
  const setScene = useCallback((sceneId: string) => {
    const newScene = getSceneById(sceneId);
    if (newScene) {
      setSceneState(newScene);
      setCharacters(prev => prev.map((char, i) => ({
        ...char,
        x: 150 + (i % 5) * 130,
        y: 250 + Math.floor(i / 5) * 150,
        targetX: 150 + (i % 5) * 130,
        targetY: 250 + Math.floor(i / 5) * 150,
        frameIndex: 0,
      })));

      // 更新区域粒子发射器
      const ps = particleSystemRef.current;
      if (ps) {
        // 清除旧发射器
        const oldPreset = sceneEmitters[scene.id] || 'dust_office';
        ps.removeAreaEmitter(oldPreset);
        // 添加新发射器
        const newPreset = sceneEmitters[sceneId] || 'dust_office';
        ps.addAreaEmitter(0, 0, 800, 600, newPreset);
      }

      audioEngine.switchScene(sceneId);
      sceneRendererRef.current?.setScene(sceneId);
    }
  }, [scene.id]);

  // 随机移动角色
  const randomMove = useCallback(() => {
    const dirs: Direction8[] = ['up', 'down', 'left', 'right', 'up_left', 'up_right', 'down_left', 'down_right'];
    setCharacters(prev => prev.map(char => {
      if (Math.random() > 0.35) return char;

      const dx = (Math.random() - 0.5) * 200;
      const dy = (Math.random() - 0.5) * 200;
      const newX = Math.max(80, Math.min(720, char.x + dx));
      const newY = Math.max(100, Math.min(500, char.y + dy));

      let direction: Direction8 = 'down';
      const adx = newX - char.x;
      const ady = newY - char.y;
      if (Math.abs(adx) > Math.abs(ady) * 1.5) {
        direction = adx > 0 ? 'right' : 'left';
      } else if (Math.abs(ady) > Math.abs(adx) * 1.5) {
        direction = ady > 0 ? 'down' : 'up';
      } else {
        if (adx > 0 && ady < 0) direction = 'up_right';
        else if (adx < 0 && ady < 0) direction = 'up_left';
        else if (adx > 0 && ady > 0) direction = 'down_right';
        else if (adx < 0 && ady > 0) direction = 'down_left';
        else if (adx > 0) direction = 'right';
        else if (adx < 0) direction = 'left';
        else if (ady < 0) direction = 'up';
        else direction = 'down';
      }

      // 走路粒子（脚印）
      particleSystemRef.current?.burst(char.x, char.y + 20, 'footstep', 1);

      audioEngine.playSound('footstep');
      return {
        ...char,
        targetX: newX,
        targetY: newY,
        isMoving: true,
        direction,
      };
    }));
  }, []);

  // 触发对话
  const triggerDialogue = useCallback((characterId: string) => {
    const char = characters.find(c => c.id === characterId);
    if (!char) return;

    const charDialogues = web3Dialogues[characterId] || ['...'];
    const content = charDialogues[Math.floor(Math.random() * charDialogues.length)];

    const dialogue: Dialogue = {
      id: `d-${Date.now()}`,
      characterId,
      content,
      timestamp: Date.now(),
      x: char.x,
      y: char.y - 50,
      opacity: 1,
    };

    setDialogues(prev => [...prev.slice(-8), dialogue]);

    // 情绪粒子
    const emotion = char.emotion || 'neutral';
    particleSystemRef.current?.burst(char.x, char.y - 30, EMOTION_PRESETS[emotion] || 'emotion_happy', 6);

    // 随机触发爆点特效（5%概率）
    if (Math.random() < 0.05) {
      particleSystemRef.current?.burst(char.x, char.y, 'burst_explosion');
      postProcessorRef.current?.shake(10, 400);
    }

    audioEngine.playSound('dialogue_pop');
    setTimeout(() => {
      setDialogues(prev => prev.filter(d => d.id !== dialogue.id));
    }, 4000);
  }, [characters]);

  // 绘制圆角矩形
  const roundRect = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }, []);

  // 初始化后处理 + 粒子
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pp = new PostProcessor(canvas, PIXEL_RETRO_CONFIG);
    postProcessorRef.current = pp;

    const ps = new ParticleSystem();
    particleSystemRef.current = ps;

    const sr = new SceneRenderer(canvas);
    sceneRendererRef.current = sr;
    sr.setScene(scene.id);

    // 添加初始区域粒子
    const preset = sceneEmitters[scene.id] || 'dust_office';
    ps.addAreaEmitter(0, 0, 800, 600, preset);

    return () => {
      pp.destroy();
      ps.clear();
    };
  }, []);

  // 绘制游戏主循环
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pp = postProcessorRef.current;
    const ps = particleSystemRef.current;
    if (!pp || !ps) return;

    frameCountRef.current++;
    const now = Date.now();

    // 获取离屏ctx，先画场景
    const drawCtx = pp.getDrawContext();
    drawCtx.clearRect(0, 0, canvas.width, canvas.height);

    // --- 场景背景（由SceneRenderer渲染） ---
    sceneRendererRef.current?.renderBackground(
      drawCtx,
      scene.id,
      scene.objects,
      scene.floorPattern
    );

    // 额外装饰效果叠加（在SceneRenderer背景之上）
    if (scene.decorations) {
      scene.decorations.forEach(dec => {
        const pulse = Math.sin(now / 500) * 0.3 + 0.7;

        if (dec.type === 'light') {
          const grad = drawCtx.createRadialGradient(dec.x, dec.y, 0, dec.x, dec.y, dec.size || 40);
          grad.addColorStop(0, dec.color + '80');
          grad.addColorStop(0.5, dec.color + '40');
          grad.addColorStop(1, 'transparent');
          drawCtx.fillStyle = grad;
          drawCtx.globalAlpha = dec.animated ? pulse : 0.8;
          drawCtx.beginPath();
          drawCtx.arc(dec.x, dec.y, dec.size || 40, 0, Math.PI * 2);
          drawCtx.fill();
          drawCtx.globalAlpha = 1;
        }

        if (dec.type === 'glow') {
          const grad = drawCtx.createRadialGradient(dec.x, dec.y, 0, dec.x, dec.y, dec.size || 80);
          grad.addColorStop(0, dec.color);
          grad.addColorStop(1, 'transparent');
          drawCtx.fillStyle = grad;
          drawCtx.globalAlpha = 0.5;
          drawCtx.beginPath();
          drawCtx.arc(dec.x, dec.y, dec.size || 80, 0, Math.PI * 2);
          drawCtx.fill();
          drawCtx.globalAlpha = 1;
        }

        if (dec.type === 'particle') {
          drawCtx.fillStyle = dec.color;
          for (let i = 0; i < 5; i++) {
            const px = dec.x + Math.sin(now / 1000 + i) * 30;
            const py = dec.y + Math.cos(now / 800 + i) * 20;
            drawCtx.beginPath();
            drawCtx.arc(px, py, dec.size || 3, 0, Math.PI * 2);
            drawCtx.fill();
          }
        }

        if (dec.type === 'shadow') {
          const grad = drawCtx.createRadialGradient(dec.x, dec.y, 0, dec.x, dec.y, dec.size || 100);
          grad.addColorStop(0, dec.color);
          grad.addColorStop(1, 'transparent');
          drawCtx.fillStyle = grad;
          drawCtx.beginPath();
          drawCtx.arc(dec.x, dec.y, dec.size || 100, 0, Math.PI * 2);
          drawCtx.fill();
        }
      });
    }

    // 更新角色位置
    setCharacters(prev => prev.map(char => {
      const speed = 1.5;
      const dx = char.targetX - char.x;
      const dy = char.targetY - char.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let newFrameIndex = char.frameIndex;
      if (char.isMoving && now - char.lastFrameTime > 150) {
        newFrameIndex = (char.frameIndex + 1) % 4;
        char.lastFrameTime = now;
      }

      if (distance < speed) {
        return { ...char, x: char.targetX, y: char.targetY, isMoving: false, frameIndex: 0 };
      }

      return {
        ...char,
        x: char.x + (dx / distance) * speed,
        y: char.y + (dy / distance) * speed,
        frameIndex: newFrameIndex,
        lastFrameTime: char.lastFrameTime,
      };
    }));

    // 按Y排序
    const sortedChars = [...characters].sort((a, b) => a.y - b.y);

    // 绘制角色
    sortedChars.forEach(char => {
      const sprite = PIXEL_SPRITES[char.id];

      // 阴影
      drawCtx.fillStyle = 'rgba(0,0,0,0.25)';
      drawCtx.beginPath();
      drawCtx.ellipse(char.x, char.y + 22, 22, 12, 0, 0, Math.PI * 2);
      drawCtx.fill();

      if (sprite) {
        drawCtx.imageSmoothingEnabled = false;
        drawPixelSprite(drawCtx, sprite, char.x, char.y, char.direction, char.frameIndex, 3);
      } else {
        drawCtx.font = '40px Arial';
        drawCtx.textAlign = 'center';
        drawCtx.fillText(char.emoji, char.x, char.y);
      }

      // 角色增强渲染（环境光遮蔽 + 选中/对话高亮）
      const isSpeaking = dialogues.some(d => d.characterId === char.id);
      const sr = sceneRendererRef.current;
      if (sr) {
        sr.drawCharacterHighlight(
          drawCtx,
          char.x,
          char.y,
          char.id === selectedCharacter,
          isSpeaking,
          sr.getStyle(scene.id)
        );
      }

      // 名字标签
      drawCtx.fillStyle = char.color + 'DD';
      roundRect(drawCtx, char.x - 32, char.y + 28, 64, 18, 4);
      drawCtx.fill();
      drawCtx.fillStyle = '#fff';
      drawCtx.font = 'bold 11px Arial';
      drawCtx.textAlign = 'center';
      drawCtx.fillText(char.name, char.x, char.y + 41);

      // 技能徽章
      if (char.skills && char.skills.length > 0) {
        drawCtx.font = '12px Arial';
        const skillEmojis: Record<string, string> = {
          '谈判': '🤝', '编程': '💻', '领导': '👑',
          '法律': '⚖️', '社交': '💬', '医疗': '💚',
          '科研': '🔬', '同理心': '❤️', '调查': '🔍',
          '写作': '✍️', '表演': '🎭', '投资': '💰',
          '博弈': '🎲', '布局': '🎯', '侦查': '🔎',
          '审讯': '🗣️', '推理': '🧠', '八卦': '👂',
          '撮合': '💑', '学习': '📚', '驾驶': '🚗',
          '聊天': '💬', '情报': '🕵️', '运营': '📱',
        };
        const skills = char.skills.slice(0, 2).map(s => skillEmojis[s] || '⭐').join('');
        drawCtx.fillText(skills, char.x, char.y - 30);
      }
    });

    // 对话气泡
    dialogues.forEach(dialogue => {
      const char = characters.find(c => c.id === dialogue.characterId);
      if (!char) return;

      const x = char.x;
      const y = char.y - 60;
      const maxWidth = 200;
      const padding = 12;
      const lineHeight = 16;

      drawCtx.font = '13px Arial';
      const lines = wrapText(drawCtx, dialogue.content, maxWidth - padding * 2);
      const height = lines.length * lineHeight + padding * 2;
      const width = Math.min(maxWidth, Math.max(...lines.map(l => drawCtx.measureText(l).width)) + padding * 2);

      drawCtx.fillStyle = '#1a1a2e';
      drawCtx.strokeStyle = scene.accentColor;
      drawCtx.lineWidth = 2;

      roundRect(drawCtx, x - width / 2, y - height, width, height, 8);
      drawCtx.fill();
      drawCtx.stroke();

      drawCtx.beginPath();
      drawCtx.moveTo(x - 8, y);
      drawCtx.lineTo(x, y + 10);
      drawCtx.lineTo(x + 8, y);
      drawCtx.closePath();
      drawCtx.fill();
      drawCtx.stroke();

      drawCtx.fillStyle = '#fff';
      drawCtx.font = '13px Arial';
      drawCtx.textAlign = 'center';
      lines.forEach((line, i) => {
        drawCtx.fillText(line, x, y - height + padding + 13 + i * lineHeight);
      });
    });

    // 选中指示
    if (selectedCharacter) {
      const char = characters.find(c => c.id === selectedCharacter);
      if (char) {
        drawCtx.strokeStyle = '#FFD700';
        drawCtx.lineWidth = 2;
        drawCtx.setLineDash([4, 4]);
        drawCtx.beginPath();
        drawCtx.arc(char.x, char.y, 38, 0, Math.PI * 2);
        drawCtx.stroke();
        drawCtx.setLineDash([]);
      }
    }

    // --- 粒子系统 ---
    ps.draw(drawCtx);

    // --- 应用后处理 → 绘制到主画布 ---
    pp.render();

    animationRef.current = requestAnimationFrame(draw);
  }, [characters, scene, dialogues, selectedCharacter, roundRect]);

  // 文字换行
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    let currentLine = '';
    for (const char of text) {
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // 启动游戏循环
  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    let lastTime = Date.now();

    const updateLoop = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      particleSystemRef.current?.update(dt);
      sceneRendererRef.current?.tick(dt);
    }, 16);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(updateLoop);
    };
  }, [draw]);

  // 定时随机移动 + 对话
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      randomMove();

      if (Math.random() > 0.45) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        triggerDialogue(char.id);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPlaying, randomMove, triggerDialogue, characters]);

  return {
    canvasRef,
    characters,
    scene,
    dialogues,
    selectedCharacter,
    setSelectedCharacter,
    setScene,
    triggerDialogue,
    scenes: gameScenes,
    isPlaying,
    setIsPlaying,
    // v5: 昼夜和天气控制
    currentTime: sceneRendererRef.current?.getCurrentTime() || null,
    currentWeather: sceneRendererRef.current?.getCurrentWeather() || null,
    onTimeChange: (hour: number) => {
      const dnc = sceneRendererRef.current?.getDayNightCycle();
      if (dnc) {
        dnc.setHour(hour);
      }
    },
    onWeatherChange: (type: WeatherType) => {
      const ws = sceneRendererRef.current?.getWeatherSystem();
      if (ws) {
        ws.setWeather(type);
      }
    },
    autoMode: sceneRendererRef.current?.getDayNightCycle()?.isAutoMode() ?? true,
    onAutoModeChange: (enabled: boolean) => {
      const dnc = sceneRendererRef.current?.getDayNightCycle();
      if (dnc) {
        dnc.setAutoMode(enabled);
      }
    },
  };
};
