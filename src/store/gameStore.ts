// 全局状态管理
// src/store/gameStore.ts

import { create } from 'zustand';
import { Agent, Dialogue, Scene, DramaEvent } from '@/types/agent';
import { agents, getAgentById, getNPCs } from '@/config/agents';
import { scenes, getSceneById } from '@/config/scenes';

interface GameState {
  // 当前状态
  currentScene: Scene;
  dialogues: Dialogue[];
  activeAgents: Agent[];
  dramaEvents: DramaEvent[];
  
  // 控制
  isPlaying: boolean;
  speed: number; // 对话速度 (ms)
  
  // Actions
  setScene: (sceneId: string) => void;
  addDialogue: (agentId: string, content: string) => void;
  startGame: () => void;
  stopGame: () => void;
  setSpeed: (speed: number) => void;
  addDramaEvent: (event: DramaEvent) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // 初始状态
  currentScene: scenes[0],
  dialogues: [],
  activeAgents: agents.slice(0, 4), // 默认显示前4个核心角色
  dramaEvents: [],
  isPlaying: false,
  speed: 5000, // 默认 5 秒发言一次

  // Actions
  setScene: (sceneId: string) => {
    const scene = getSceneById(sceneId);
    if (scene) {
      set({ currentScene: scene });
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
    set({ isPlaying: true });
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
  }
}));
