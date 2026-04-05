// 全局状态管理
// src/store/gameStore.ts

import { create } from 'zustand';
import { Agent, Dialogue, Scene, DramaEvent } from '@/types/agent';
import { ACHIEVEMENTS, Achievement } from '@/data/achievements';
import { agents, getAgentById, getNPCs } from '@/config/agents';
import { scenes, getSceneById } from '@/config/scenes';

// 当前存档版本
const SAVE_VERSION = '1.0.0';
const SAVE_KEY = 'chumen_save';
const TUTORIAL_KEY = 'chumen_tutorial_completed';
const ACHIEVEMENT_KEY = 'chumen_achievements';

// 成就状态数据结构
export interface AchievementState {
  unlocked: string[]; // 已解锁成就ID
  progress: Record<string, number>; // 各成就当前进度
  totalPoints: number; // 总成就点数
  visitedScenes: string[]; // 已访问的场景ID列表
  npcTriggerCount: number; // NPC触发次数
}

// 游戏统计数据接口
export interface GameStats {
  // 对话统计
  totalDialogues: number;
  dialoguesPerScene: Record<string, number>;
  // 剧情统计
  totalEvents: number;
  eventsByType: Record<string, number>;
  // NPC触发统计
  npcTriggers: number;
  mostActiveNPC: string;
  // 探索统计
  visitedScenes: string[];
  sceneVisits: Record<string, number>;
  // 时间统计
  totalPlayTime: number; // ms
  sessionsCount: number;
  longestSession: number; // ms
  // NFT统计
  mintedNFTs: number;
  legendaryNFTs: number;
  // 成就统计
  achievementsUnlocked: number;
  achievementPoints: number;
}

// 存档数据结构
export interface SaveData {
  version: string;
  timestamp: number;
  currentSceneId: string;
  activeAgentIds: string[];
  dramaEvents: DramaEvent[];
  dialogues: Dialogue[];
  nftProgress: {
    mintedAgents: string[];
    unlockedStories: string[];
  };
  stats: {
    totalEvents: number;
    totalDialogues: number;
    playTime: number; // 毫秒
    cumulativePlayTime: number; // 累计游玩时长（毫秒）
  };
}

interface GameState {
  // 当前状态
  currentScene: Scene;
  dialogues: Dialogue[];
  activeAgents: Agent[];
  dramaEvents: DramaEvent[];

  // 控制
  isPlaying: boolean;
  speed: number; // 对话速度 (ms)

  // 存档相关
  lastSaveTime: number | null;
  playStartTime: number | null;
  cumulativePlayTime: number; // 累计游玩时长（毫秒）
  sessionsCount: number; // 游戏次数
  longestSession: number; // 最长单次游戏时长（毫秒）
  nftProgress: {
    mintedAgents: string[];
    unlockedStories: string[];
  };

  // 教程相关
  tutorialCompleted: boolean;
  showTutorial: () => void;
  hideTutorial: () => void;

  // 成就相关
  achievements: AchievementState;
  pendingAchievement: Achievement | null; // 待显示的成就（弹窗用）
  unlockAchievement: (id: string) => void;
  updateProgress: (type: string, value: number) => void;
  checkAchievements: () => void;
  dismissPendingAchievement: () => void;

  // Actions
  setScene: (sceneId: string) => void;
  addDialogue: (agentId: string, content: string) => void;
  startGame: () => void;
  stopGame: () => void;
  setSpeed: (speed: number) => void;
  addDramaEvent: (event: DramaEvent) => void;

  // 存档方法
  saveGame: () => SaveData;
  loadGame: (save: SaveData) => boolean;
  hasSave: () => boolean;
  deleteSave: () => void;
  autoSave: () => void;

  // 统计方法
  getStats: () => GameStats;
}

export const useGameStore = create<GameState>((set, get) => ({
  // 初始状态
  currentScene: scenes[0],
  dialogues: [],
  activeAgents: agents.slice(0, 4), // 默认显示前4个核心角色
  dramaEvents: [],
  isPlaying: false,
  speed: 5000, // 默认 5 秒发言一次
  lastSaveTime: null,
  playStartTime: null,
  cumulativePlayTime: 0,
  sessionsCount: 0,
  longestSession: 0,
  nftProgress: {
    mintedAgents: [],
    unlockedStories: [],
  },

  // 教程相关 - 初始值由 page.tsx 的 useEffect 设置
  tutorialCompleted: false,
  showTutorial: () => {
    useGameStore.setState({ tutorialCompleted: false });
  },
  hideTutorial: () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    useGameStore.setState({ tutorialCompleted: true });
  },

  // 成就相关 - 初始状态（从localStorage恢复）
  achievements: (() => {
    try {
      const saved = localStorage.getItem(ACHIEVEMENT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      unlocked: [],
      progress: {},
      totalPoints: 0,
      visitedScenes: [],
      npcTriggerCount: 0,
    };
  })(),
  pendingAchievement: null,

  // 成就方法
  unlockAchievement: (id: string) => {
    const state = get();
    if (state.achievements.unlocked.includes(id)) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;

    const newState = {
      unlocked: [...state.achievements.unlocked, id],
      totalPoints: state.achievements.totalPoints + achievement.points,
    };

    const newAchievements = { ...state.achievements, ...newState };
    set({ achievements: newAchievements, pendingAchievement: achievement });
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(newAchievements));
  },

  updateProgress: (type: string, value: number) => {
    const state = get();
    const newProgress = { ...state.achievements.progress, [type]: value };

    // 特殊处理：记录已访问场景
    if (type === 'scene_visit') {
      const sceneId = typeof value === 'string' ? value : '';
      if (sceneId && !state.achievements.visitedScenes.includes(sceneId)) {
        const newVisited = [...state.achievements.visitedScenes, sceneId];
        set({
          achievements: {
            ...state.achievements,
            progress: newProgress,
            visitedScenes: newVisited,
          }
        });
        localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify({
          ...state.achievements,
          progress: newProgress,
          visitedScenes: newVisited,
        }));
        return;
      }
    }

    set({ achievements: { ...state.achievements, progress: newProgress } });
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify({
      ...state.achievements,
      progress: newProgress,
    }));
  },

  checkAchievements: () => {
    const state = get();
    const { achievements } = state;

    for (const achievement of ACHIEVEMENTS) {
      if (achievements.unlocked.includes(achievement.id)) continue;

      let currentValue = 0;

      switch (achievement.requirement.type) {
        case 'dialogue_count':
          currentValue = state.dialogues.length;
          break;
        case 'npc_trigger':
          currentValue = achievements.npcTriggerCount;
          break;
        case 'scene_visit':
          currentValue = achievements.visitedScenes.length;
          break;
        case 'event_count':
          currentValue = state.dramaEvents.length;
          break;
        case 'play_time':
          currentValue = state.cumulativePlayTime + (state.playStartTime ? Date.now() - state.playStartTime : 0);
          break;
        case 'nft_mint':
          currentValue = state.nftProgress.mintedAgents.length;
          break;
        case 'legendary_spawn':
          currentValue = achievements.progress.legendary_spawn || 0;
          break;
        default:
          currentValue = achievements.progress[achievement.requirement.type] || 0;
      }

      if (currentValue >= achievement.requirement.value) {
        state.unlockAchievement(achievement.id);
      }
    }
  },

  dismissPendingAchievement: () => {
    set({ pendingAchievement: null });
  },

  // Actions
  setScene: (sceneId: string) => {
    const scene = getSceneById(sceneId);
    if (scene) {
      // 记录已访问场景
      const state = get();
      if (!state.achievements.visitedScenes.includes(sceneId)) {
        const newVisited = [...state.achievements.visitedScenes, sceneId];
        const newProgress = { ...state.achievements.progress, scene_visit: newVisited.length };
        const newAchievements = { ...state.achievements, visitedScenes: newVisited, progress: newProgress };
        set({ currentScene: scene, achievements: newAchievements });
        localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(newAchievements));
        // 检查成就
        get().checkAchievements();
      } else {
        set({ currentScene: scene });
      }
      // 切换场景时自动存档
      get().autoSave();
    }
  },

  addDialogue: (agentId: string, content: string) => {
    const newDialogue: Dialogue = {
      id: `d-${Date.now()}`,
      agentId,
      content,
      timestamp: Date.now(),
      scene: get().currentScene.id
    };
    set(state => ({
      dialogues: [...state.dialogues.slice(-50), newDialogue] // 保留最近50条
    }));
    // 检查对话相关成就
    get().checkAchievements();
  },

  startGame: () => {
    set(state => ({
      isPlaying: true,
      playStartTime: Date.now(),
      sessionsCount: state.sessionsCount + 1,
    }));
  },

  stopGame: () => {
    // 停止时累加游玩时长
    const state = get();
    if (state.playStartTime) {
      const elapsed = Date.now() - state.playStartTime;
      const newLongest = Math.max(state.longestSession, elapsed);
      set({
        isPlaying: false,
        playStartTime: null,
        cumulativePlayTime: state.cumulativePlayTime + elapsed,
        longestSession: newLongest,
      });
    } else {
      set({ isPlaying: false });
    }
  },

  setSpeed: (speed: number) => {
    set({ speed });
  },

  addDramaEvent: (event: DramaEvent) => {
    set(state => ({
      dramaEvents: [...state.dramaEvents, event]
    }));
    // 如果是NPC触发的事件，增加NPC触发计数
    if (event.trigger === 'npc') {
      const state = get();
      const newCount = state.achievements.npcTriggerCount + 1;
      const newProgress = { ...state.achievements.progress, npc_trigger: newCount };
      const newAchievements = { ...state.achievements, npcTriggerCount: newCount, progress: newProgress };
      set({ achievements: newAchievements });
      localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(newAchievements));
    }
    // 重要事件后自动存档
    if (event.urgency === 'high' || event.type === 'big') {
      get().autoSave();
    }
    // 检查事件相关成就
    get().checkAchievements();
  },

  // 存档方法
  saveGame: () => {
    const state = get();
    const playTime = state.playStartTime ? Date.now() - state.playStartTime : 0;
    const cumulativePlayTime = state.cumulativePlayTime + playTime;

    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      currentSceneId: state.currentScene.id,
      activeAgentIds: state.activeAgents.map(a => a.id),
      dramaEvents: state.dramaEvents.slice(-100), // 保留最近100个事件
      dialogues: state.dialogues.slice(-100), // 保留最近100条对话
      nftProgress: state.nftProgress,
      stats: {
        totalEvents: state.dramaEvents.length,
        totalDialogues: state.dialogues.length,
        playTime,
        cumulativePlayTime,
      },
    };
    
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      set({ lastSaveTime: Date.now() });
    } catch (e) {
      console.error('存档失败:', e);
    }
    
    return saveData;
  },

  loadGame: (save: SaveData) => {
    // 版本检查
    if (save.version !== SAVE_VERSION) {
      console.warn(`存档版本不匹配: ${save.version} vs ${SAVE_VERSION}`);
      // 可以选择拒绝加载或尝试兼容
    }
    
    try {
      const scene = getSceneById(save.currentSceneId);
      const activeAgents = save.activeAgentIds
        .map(id => agents.find(a => a.id === id))
        .filter((a): a is Agent => a !== undefined);
      
      set({
        currentScene: scene || scenes[0],
        activeAgents: activeAgents.length > 0 ? activeAgents : agents.slice(0, 4),
        dramaEvents: save.dramaEvents || [],
        dialogues: save.dialogues || [],
        nftProgress: save.nftProgress || { mintedAgents: [], unlockedStories: [] },
        lastSaveTime: save.timestamp,
        playStartTime: null, // 重置游玩计时
        cumulativePlayTime: save.stats?.cumulativePlayTime || 0,
      });
      
      return true;
    } catch (e) {
      console.error('加载存档失败:', e);
      return false;
    }
  },

  hasSave: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SAVE_KEY) !== null;
  },

  deleteSave: () => {
    localStorage.removeItem(SAVE_KEY);
    set({ lastSaveTime: null });
  },

  autoSave: () => {
    if (get().isPlaying) {
      get().saveGame();
    }
  },

  getStats: (): GameStats => {
    const state = get();

    // 计算对话按场景分布
    const dialoguesPerScene: Record<string, number> = {};
    state.dialogues.forEach(d => {
      dialoguesPerScene[d.scene] = (dialoguesPerScene[d.scene] || 0) + 1;
    });

    // 计算事件按类型分布
    const eventsByType: Record<string, number> = {};
    state.dramaEvents.forEach(e => {
      eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
    });

    // 计算场景访问次数
    const sceneVisits: Record<string, number> = {};
    state.dialogues.forEach(d => {
      sceneVisits[d.scene] = (sceneVisits[d.scene] || 0) + 1;
    });

    // 计算当前总游玩时长（包括正在进行的）
    const currentPlayTime = state.playStartTime
      ? state.cumulativePlayTime + (Date.now() - state.playStartTime)
      : state.cumulativePlayTime;

    return {
      totalDialogues: state.dialogues.length,
      dialoguesPerScene,
      totalEvents: state.dramaEvents.length,
      eventsByType,
      npcTriggers: state.achievements.npcTriggerCount,
      mostActiveNPC: '', // TODO: 需要NPC触发追踪
      visitedScenes: state.achievements.visitedScenes,
      sceneVisits,
      totalPlayTime: currentPlayTime,
      sessionsCount: state.sessionsCount,
      longestSession: state.longestSession,
      mintedNFTs: state.nftProgress.mintedAgents.length,
      legendaryNFTs: 0, // TODO: 需要NFT稀有度追踪
      achievementsUnlocked: state.achievements.unlocked.length,
      achievementPoints: state.achievements.totalPoints,
    };
  },
}));
