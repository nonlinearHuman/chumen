// 全局状态管理
// src/store/gameStore.ts

import { create } from 'zustand';
import { Agent, Dialogue, Scene, DramaEvent } from '@/types/agent';
import { ACHIEVEMENTS, Achievement } from '@/data/achievements';
import { agents, getAgentById, getNPCs } from '@/config/agents';
import { scenes, getSceneById } from '@/config/scenes';
import { notificationService } from '@/lib/notificationService';

// 当前存档版本
const SAVE_VERSION = '1.0.0';
const SAVE_KEY = 'chumen_save';
const TUTORIAL_KEY = 'chumen_tutorial_completed';
const ACHIEVEMENT_KEY = 'chumen_achievements';
const SETTINGS_KEY = 'chumen_settings';
const RELATIONSHIP_KEY = 'chumen_relationships';

// 关系数据结构
export interface Relationship {
  agentId: string;
  targetId: string;
  level: number; // -100 to 100
  lastEvent: string;
}

// 初始化角色关系（基于 agents.ts 中的 relationships 配置）
const initRelationships = (): Relationship[] => {
  const rels: Relationship[] = [];
  const coreAgents = agents.filter((a) => !a.isNPC);

  for (const agent of coreAgents) {
    if (agent.relationships) {
      for (const [targetId, _] of Object.entries(agent.relationships)) {
        const target = agents.find((a) => a.id === targetId);
        if (target && !target.isNPC) {
          // 检查是否已存在反向关系
          const exists = rels.find(
            (r) =>
              (r.agentId === agent.id && r.targetId === targetId) ||
              (r.agentId === targetId && r.targetId === agent.id)
          );
          if (!exists) {
            rels.push({
              agentId: agent.id,
              targetId: targetId,
              level: 0, // 初始为中立
              lastEvent: '',
            });
          }
        }
      }
    }
  }
  return rels;
};

// 加载关系数据
const loadRelationships = (): Relationship[] => {
  if (typeof window === 'undefined') return initRelationships();
  try {
    const saved = localStorage.getItem(RELATIONSHIP_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return initRelationships();
};

// 保存关系数据
const saveRelationships = (relationships: Relationship[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RELATIONSHIP_KEY, JSON.stringify(relationships));
  } catch (e) {}
};

// ============ 游戏设置 ============

export interface GameSettings {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  ambientEnabled: boolean;
  showFPS: boolean;
  showDialogueTimestamps: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  pixelQuality: 'low' | 'medium' | 'high';
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  notificationsEnabled: boolean;
  language: 'zh' | 'en';
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  bgmVolume: 30,
  sfxVolume: 40,
  ambientEnabled: true,
  showFPS: false,
  showDialogueTimestamps: true,
  animationSpeed: 'normal',
  pixelQuality: 'medium',
  autoSaveEnabled: true,
  autoSaveInterval: 5,
  notificationsEnabled: false,
  language: 'zh',
};

const loadSettings = (): GameSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
};

const saveSettings = (settings: GameSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
};

// 成就状态数据结构
export interface AchievementState {
  unlocked: string[]; // 已解锁成就ID
  progress: Record<string, number>; // 各成就当前进度
  totalPoints: number; // 总成就点数
  visitedScenes: string[]; // 已访问的场景ID列表
  npcTriggerCount: number; // NPC触发次数
}

// 每日挑战状态
export interface DailyState {
  lastLoginDate: string; // 'YYYY-MM-DD' 格式
  loginStreak: number; // 连续登录天数
  todayProgress: {
    dialogueCount: number;
    eventCount: number;
    scenesVisited: number;
    npcTriggerCount: number;
  };
  completedChallenges: string[]; // 今日完成的挑战ID
  claimedRewards: string[]; // 已领取的奖励ID (包括 login_X 和 challenge ID)
  showDailyPanel: boolean; // 是否显示每日面板
}

const DAILY_KEY = 'chumen_daily';

// 检查是否是昨天
const isYesterday = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
};

// 获取今天的日期字符串
const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

// 加载每日状态
const loadDailyState = (): DailyState => {
  if (typeof window === 'undefined') {
    return {
      lastLoginDate: '',
      loginStreak: 0,
      todayProgress: { dialogueCount: 0, eventCount: 0, scenesVisited: 0, npcTriggerCount: 0 },
      completedChallenges: [],
      claimedRewards: [],
      showDailyPanel: false,
    };
  }
  try {
    const saved = localStorage.getItem(DAILY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return {
    lastLoginDate: '',
    loginStreak: 0,
    todayProgress: { dialogueCount: 0, eventCount: 0, scenesVisited: 0, npcTriggerCount: 0 },
    completedChallenges: [],
    claimedRewards: [],
    showDailyPanel: false,
  };
};

// 保存每日状态
const saveDailyState = (state: DailyState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('保存每日状态失败:', e);
  }
};

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

  // 游戏设置
  settings: GameSettings;
  updateSettings: (partial: Partial<GameSettings>) => void;

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

  // 每日挑战相关
  dailyState: DailyState;
  checkDailyReset: () => void;
  dismissDailyPanel: () => void;
  claimChallengeReward: (challengeId: string) => void;
  claimLoginReward: (day: number) => void;
  updateDailyProgress: (type: 'dialogue' | 'event' | 'explore' | 'social') => void;

  // 角色关系相关
  relationships: Relationship[];
  updateRelationship: (from: string, to: string, delta: number, event?: string) => void;

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

  // 角色关系
  relationships: loadRelationships(),

  // 游戏设置
  settings: loadSettings(),
  updateSettings: (partial: Partial<GameSettings>) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });
    saveSettings(newSettings);
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

    // 发送浏览器通知
    if (state.settings.notificationsEnabled) {
      notificationService.notifyAchievement(achievement.title);
    }
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

  // 每日挑战相关 - 初始状态
  dailyState: (() => {
    const state = loadDailyState();
    // 检查是否需要重置
    const today = getTodayStr();
    if (state.lastLoginDate !== today) {
      if (isYesterday(state.lastLoginDate)) {
        state.loginStreak = state.loginStreak + 1;
      } else {
        state.loginStreak = 1;
      }
      state.lastLoginDate = today;
      state.todayProgress = { dialogueCount: 0, eventCount: 0, scenesVisited: 0, npcTriggerCount: 0 };
      state.completedChallenges = [];
      state.claimedRewards = [];
      // 如果是新的一天，显示面板
      state.showDailyPanel = true;
      saveDailyState(state);
    }
    return state;
  })(),

  checkDailyReset: () => {
    const state = get();
    const today = getTodayStr();
    if (state.dailyState.lastLoginDate !== today) {
      // 日期变化，执行重置逻辑
      const newStreak = isYesterday(state.dailyState.lastLoginDate) 
        ? state.dailyState.loginStreak + 1 
        : 1;
      const newState: DailyState = {
        ...state.dailyState,
        lastLoginDate: today,
        loginStreak: newStreak,
        todayProgress: { dialogueCount: 0, eventCount: 0, scenesVisited: 0, npcTriggerCount: 0 },
        completedChallenges: [],
        claimedRewards: [],
        showDailyPanel: true,
      };
      set({ dailyState: newState });
      saveDailyState(newState);
    }
  },

  dismissDailyPanel: () => {
    const state = get();
    const newState = { ...state.dailyState, showDailyPanel: false };
    set({ dailyState: newState });
    saveDailyState(newState);
  },

  claimChallengeReward: (challengeId: string) => {
    const state = get();
    if (state.dailyState.claimedRewards.includes(challengeId)) return;
    if (!state.dailyState.completedChallenges.includes(challengeId)) return;

    const newState = {
      ...state.dailyState,
      claimedRewards: [...state.dailyState.claimedRewards, challengeId],
    };
    set({ dailyState: newState });
    saveDailyState(newState);
  },

  claimLoginReward: (day: number) => {
    const state = get();
    const rewardId = `login_${day}`;
    if (state.dailyState.claimedRewards.includes(rewardId)) return;
    if (state.dailyState.loginStreak < day) return;

    const newState = {
      ...state.dailyState,
      claimedRewards: [...state.dailyState.claimedRewards, rewardId],
    };
    set({ dailyState: newState });
    saveDailyState(newState);
  },

  updateDailyProgress: (type: 'dialogue' | 'event' | 'explore' | 'social') => {
    const state = get();
    const today = getTodayStr();
    
    // 如果日期变了，先重置
    if (state.dailyState.lastLoginDate !== today) {
      get().checkDailyReset();
      return;
    }

    let newProgress = { ...state.dailyState.todayProgress };
    let completedChallenges = [...state.dailyState.completedChallenges];

    switch (type) {
      case 'dialogue':
        newProgress.dialogueCount++;
        if (newProgress.dialogueCount >= 10 && !completedChallenges.includes('daily_dialogue_10')) {
          completedChallenges.push('daily_dialogue_10');
        }
        break;
      case 'event':
        newProgress.eventCount++;
        if (newProgress.eventCount >= 3 && !completedChallenges.includes('daily_event_3')) {
          completedChallenges.push('daily_event_3');
        }
        break;
      case 'explore':
        newProgress.scenesVisited++;
        if (newProgress.scenesVisited >= 2 && !completedChallenges.includes('daily_explore')) {
          completedChallenges.push('daily_explore');
        }
        break;
      case 'social':
        newProgress.npcTriggerCount++;
        if (newProgress.npcTriggerCount >= 5 && !completedChallenges.includes('daily_npc')) {
          completedChallenges.push('daily_npc');
        }
        break;
    }

    const newState = {
      ...state.dailyState,
      todayProgress: newProgress,
      completedChallenges,
    };
    set({ dailyState: newState });
    saveDailyState(newState);
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
      // 更新每日探索进度
      get().updateDailyProgress('explore');
      // 切换场景时自动存档
      get().autoSave();
    }
  },

  addDialogue: (agentId: string, content: string) => {
    const agent = getAgentById(agentId);
    const agentName = agent?.name || 'Unknown';
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
    // 发送浏览器通知
    const { settings } = get();
    if (settings.notificationsEnabled && document.visibilityState === 'hidden') {
      notificationService.notifyNewDialogue(agentName);
    }
    // 检查对话相关成就
    get().checkAchievements();
    // 更新每日对话进度
    get().updateDailyProgress('dialogue');
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
    // 发送浏览器通知
    const { settings } = get();
    if (settings.notificationsEnabled) {
      notificationService.notifyEvent(event.content);
    }
    // 如果是NPC触发的事件，增加NPC触发计数
    if (event.trigger === 'npc') {
      const state = get();
      const newCount = state.achievements.npcTriggerCount + 1;
      const newProgress = { ...state.achievements.progress, npc_trigger: newCount };
      const newAchievements = { ...state.achievements, npcTriggerCount: newCount, progress: newProgress };
      set({ achievements: newAchievements });
      localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(newAchievements));
      // 更新每日NPC社交进度
      get().updateDailyProgress('social');
    }
    // 更新每日剧情进度
    get().updateDailyProgress('event');
    // 重要事件后自动存档
    if (event.urgency === 'high' || event.type === 'big') {
      get().autoSave();
    }
    // 检查事件相关成就
    get().checkAchievements();
  },

  // 角色关系更新
  updateRelationship: (from: string, to: string, delta: number, event = '') => {
    const state = get();
    const newRelationships = state.relationships.map((r) => {
      if (
        (r.agentId === from && r.targetId === to) ||
        (r.agentId === to && r.targetId === from)
      ) {
        const newLevel = Math.max(-100, Math.min(100, r.level + delta));
        return { ...r, level: newLevel, lastEvent: event };
      }
      return r;
    });
    set({ relationships: newRelationships });
    saveRelationships(newRelationships);
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
