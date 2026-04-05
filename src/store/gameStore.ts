// 全局状态管理
// src/store/gameStore.ts

import { create } from 'zustand';
import { Agent, Dialogue, Scene, DramaEvent } from '@/types/agent';
import { agents, getAgentById, getNPCs } from '@/config/agents';
import { scenes, getSceneById } from '@/config/scenes';

// 当前存档版本
const SAVE_VERSION = '1.0.0';
const SAVE_KEY = 'chumen_save';

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
  nftProgress: {
    mintedAgents: string[];
    unlockedStories: string[];
  };
  
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
  nftProgress: {
    mintedAgents: [],
    unlockedStories: [],
  },

  // Actions
  setScene: (sceneId: string) => {
    const scene = getSceneById(sceneId);
    if (scene) {
      set({ currentScene: scene });
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
  },

  startGame: () => {
    set({ isPlaying: true, playStartTime: Date.now() });
  },

  stopGame: () => {
    set({ isPlaying: false });
  },

  setSpeed: (speed: number) => {
    set({ speed });
  },

  addDramaEvent: (event: DramaEvent) => {
    set(state => ({
      dramaEvents: [...state.dramaEvents, event]
    }));
    // 重要事件后自动存档
    if (event.urgency === 'high' || event.type === 'big') {
      get().autoSave();
    }
  },

  // 存档方法
  saveGame: () => {
    const state = get();
    const playTime = state.playStartTime 
      ? (state.playStartTime ? Date.now() - state.playStartTime : 0)
      : 0;
    
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
      });
      
      return true;
    } catch (e) {
      console.error('加载存档失败:', e);
      return false;
    }
  },

  hasSave: () => {
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
}));
