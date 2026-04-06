// 排行榜状态管理
// src/store/leaderboardStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  avatar: string;
  score: number;
  achievements: number;
  playTime: number; // 毫秒
  lastActive: number; // 时间戳
}

export type LeaderboardType = 'global' | 'weekly' | 'friends';

interface LeaderboardState {
  // 排行榜数据
  globalLeaderboard: LeaderboardEntry[];
  weeklyLeaderboard: LeaderboardEntry[];
  friendsLeaderboard: LeaderboardEntry[];
  
  // 当前玩家信息
  currentPlayerId: string;
  currentPlayerName: string;
  currentPlayerAvatar: string;
  
  // 加载状态
  isLoading: boolean;
  lastUpdated: number | null;
  
  // 分页
  page: number;
  hasMore: boolean;
  
  // Actions
  updateScore: (score: number, achievements: number, playTime: number) => void;
  loadLeaderboard: (type: LeaderboardType) => Promise<void>;
  loadMore: (type: LeaderboardType) => Promise<void>;
  setPlayerInfo: (id: string, name: string, avatar: string) => void;
  
  // 获取当前玩家排名
  getPlayerRank: (type: LeaderboardType) => number | null;
  
  // 模拟数据（实际应从后端获取）
  generateMockData: () => void;
}

// 模拟玩家名字
const MOCK_NAMES = [
  '星空漫步者', '像素猎人', '时间旅人', '梦想家', '故事编织者',
  '传奇收藏家', '探索者', '戏剧之王', 'NPC之友', '像素艺术家',
  '世界观察者', '剧情达人', '成就猎人', 'NFT大师', '社交达人',
  '冒险家', '故事迷', '像素精灵', '传奇英雄', '时间守护者',
];

// 生成模拟排行榜数据
const generateMockLeaderboard = (count: number, currentPlayer?: LeaderboardEntry): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];
  
  for (let i = 0; i < count; i++) {
    entries.push({
      rank: i + 1,
      playerId: `player_${i}`,
      playerName: MOCK_NAMES[i % MOCK_NAMES.length],
      avatar: ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🃏', '🎭'][i % 8],
      score: Math.floor(5000 - i * 150 + Math.random() * 100),
      achievements: Math.floor(Math.random() * 10) + 1,
      playTime: Math.floor(Math.random() * 10000000),
      lastActive: Date.now() - Math.floor(Math.random() * 86400000 * 7),
    });
  }
  
  // 如果有当前玩家，插入到合适位置
  if (currentPlayer) {
    const insertIndex = entries.findIndex(e => e.score < currentPlayer.score);
    if (insertIndex !== -1) {
      entries.splice(insertIndex, 0, currentPlayer);
      // 更新排名
      entries.forEach((e, idx) => e.rank = idx + 1);
    } else {
      entries.push({ ...currentPlayer, rank: entries.length + 1 });
    }
  }
  
  return entries;
};

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      // 初始状态
      globalLeaderboard: [],
      weeklyLeaderboard: [],
      friendsLeaderboard: [],
      currentPlayerId: 'current_player',
      currentPlayerName: '你',
      currentPlayerAvatar: '🎮',
      isLoading: false,
      lastUpdated: null,
      page: 1,
      hasMore: true,

      // 设置玩家信息
      setPlayerInfo: (id, name, avatar) => {
        set({
          currentPlayerId: id,
          currentPlayerName: name,
          currentPlayerAvatar: avatar,
        });
      },

      // 更新分数
      updateScore: (score, achievements, playTime) => {
        const state = get();
        const currentPlayer: LeaderboardEntry = {
          rank: 0,
          playerId: state.currentPlayerId,
          playerName: state.currentPlayerName,
          avatar: state.currentPlayerAvatar,
          score,
          achievements,
          playTime,
          lastActive: Date.now(),
        };

        // 更新各排行榜
        const updateLeaderboard = (leaderboard: LeaderboardEntry[]) => {
          const existingIdx = leaderboard.findIndex(e => e.playerId === state.currentPlayerId);
          if (existingIdx !== -1) {
            leaderboard[existingIdx] = { ...currentPlayer, rank: leaderboard[existingIdx].rank };
          } else {
            leaderboard.push(currentPlayer);
          }
          // 按分数排序并更新排名
          leaderboard.sort((a, b) => b.score - a.score);
          leaderboard.forEach((e, idx) => e.rank = idx + 1);
          return leaderboard;
        };

        set({
          globalLeaderboard: updateLeaderboard([...state.globalLeaderboard]),
          weeklyLeaderboard: updateLeaderboard([...state.weeklyLeaderboard]),
        });
      },

      // 加载排行榜
      loadLeaderboard: async (type) => {
        set({ isLoading: true, page: 1 });
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 生成模拟数据
        const state = get();
        const currentPlayer: LeaderboardEntry = {
          rank: 0,
          playerId: state.currentPlayerId,
          playerName: state.currentPlayerName,
          avatar: state.currentPlayerAvatar,
          score: 0,
          achievements: 0,
          playTime: 0,
          lastActive: Date.now(),
        };
        
        const data = generateMockLeaderboard(50, currentPlayer);
        
        switch (type) {
          case 'global':
            set({ globalLeaderboard: data, hasMore: data.length >= 50 });
            break;
          case 'weekly':
            set({ weeklyLeaderboard: data, hasMore: data.length >= 50 });
            break;
          case 'friends':
            set({ friendsLeaderboard: data.slice(0, 20), hasMore: false });
            break;
        }
        
        set({ isLoading: false, lastUpdated: Date.now() });
      },

      // 加载更多
      loadMore: async (type) => {
        const state = get();
        if (state.isLoading || !state.hasMore) return;
        
        set({ isLoading: true, page: state.page + 1 });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const moreData = generateMockLeaderboard(20);
        moreData.forEach((e, idx) => e.rank = state.page * 20 + idx + 1);
        
        switch (type) {
          case 'global':
            set({ 
              globalLeaderboard: [...state.globalLeaderboard, ...moreData],
              hasMore: moreData.length >= 20,
            });
            break;
          case 'weekly':
            set({ 
              weeklyLeaderboard: [...state.weeklyLeaderboard, ...moreData],
              hasMore: moreData.length >= 20,
            });
            break;
        }
        
        set({ isLoading: false });
      },

      // 获取玩家排名
      getPlayerRank: (type) => {
        const state = get();
        const leaderboard = type === 'global' 
          ? state.globalLeaderboard 
          : type === 'weekly' 
            ? state.weeklyLeaderboard 
            : state.friendsLeaderboard;
        
        const player = leaderboard.find(e => e.playerId === state.currentPlayerId);
        return player?.rank || null;
      },

      // 生成模拟数据
      generateMockData: () => {
        const state = get();
        const currentPlayer: LeaderboardEntry = {
          rank: 0,
          playerId: state.currentPlayerId,
          playerName: state.currentPlayerName,
          avatar: state.currentPlayerAvatar,
          score: 0,
          achievements: 0,
          playTime: 0,
          lastActive: Date.now(),
        };
        
        set({
          globalLeaderboard: generateMockLeaderboard(100, currentPlayer),
          weeklyLeaderboard: generateMockLeaderboard(50, currentPlayer),
          friendsLeaderboard: generateMockLeaderboard(15, currentPlayer),
          lastUpdated: Date.now(),
        });
      },
    }),
    {
      name: 'chumen-leaderboard',
      partialize: (state) => ({
        currentPlayerId: state.currentPlayerId,
        currentPlayerName: state.currentPlayerName,
        currentPlayerAvatar: state.currentPlayerAvatar,
      }),
    }
  )
);
