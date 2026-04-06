// 好友系统状态管理
// src/store/friendStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastActive: number;
  achievements: number;
  score: number;
}

export interface FriendRequest {
  id: string;
  from: Friend;
  timestamp: number;
  message?: string;
}

interface FriendState {
  // 好友列表
  friends: Friend[];
  
  // 好友申请
  requests: FriendRequest[];
  
  // 搜索结果
  searchResults: Friend[];
  
  // 加载状态
  isLoading: boolean;
  
  // Actions
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  sendRequest: (toUserId: string) => Promise<boolean>;
  
  // 搜索好友
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // 更新好友状态
  updateFriendStatus: (friendId: string, status: Friend['status']) => void;
  
  // 获取在线好友
  getOnlineFriends: () => Friend[];
  
  // 模拟数据
  generateMockFriends: () => void;
}

// 模拟好友名字
const MOCK_FRIEND_NAMES = [
  '星空漫步者', '像素猎人', '时间旅人', '梦想家', '故事编织者',
  '传奇收藏家', '探索者', '戏剧之王', 'NPC之友', '像素艺术家',
];

// 生成模拟好友
const generateMockFriends = (count: number): Friend[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `friend_${i}`,
    name: MOCK_FRIEND_NAMES[i % MOCK_FRIEND_NAMES.length],
    avatar: ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🃏', '🦊', '🦄', '🐲'][i % 10],
    level: Math.floor(Math.random() * 50) + 1,
    status: ['online', 'offline', 'busy', 'away'][Math.floor(Math.random() * 4)] as Friend['status'],
    lastActive: Date.now() - Math.floor(Math.random() * 86400000 * 3),
    achievements: Math.floor(Math.random() * 10) + 1,
    score: Math.floor(Math.random() * 2000),
  }));
};

export const useFriendStore = create<FriendState>()(
  persist(
    (set, get) => ({
      // 初始状态
      friends: [],
      requests: [],
      searchResults: [],
      isLoading: false,

      // 添加好友
      addFriend: (friend) => {
        set(state => ({
          friends: [...state.friends, friend],
          requests: state.requests.filter(r => r.from.id !== friend.id),
        }));
      },

      // 删除好友
      removeFriend: (friendId) => {
        set(state => ({
          friends: state.friends.filter(f => f.id !== friendId),
        }));
      },

      // 接受好友申请
      acceptRequest: (requestId) => {
        const state = get();
        const request = state.requests.find(r => r.id === requestId);
        if (request) {
          set({
            friends: [...state.friends, request.from],
            requests: state.requests.filter(r => r.id !== requestId),
          });
        }
      },

      // 拒绝好友申请
      rejectRequest: (requestId) => {
        set(state => ({
          requests: state.requests.filter(r => r.id !== requestId),
        }));
      },

      // 发送好友申请
      sendRequest: async (toUserId) => {
        // 模拟发送申请
        await new Promise(resolve => setTimeout(resolve, 500));
        // 在实际应用中，这里会调用 API
        return true;
      },

      // 搜索用户
      searchUsers: async (query) => {
        set({ isLoading: true });
        
        // 模拟搜索延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模拟搜索结果
        const results = generateMockFriends(5).map((f, i) => ({
          ...f,
          name: query + (i > 0 ? i : ''),
        }));
        
        set({ searchResults: results, isLoading: false });
      },

      // 清空搜索
      clearSearch: () => {
        set({ searchResults: [] });
      },

      // 更新好友状态
      updateFriendStatus: (friendId, status) => {
        set(state => ({
          friends: state.friends.map(f =>
            f.id === friendId ? { ...f, status, lastActive: Date.now() } : f
          ),
        }));
      },

      // 获取在线好友
      getOnlineFriends: () => {
        return get().friends.filter(f => f.status === 'online');
      },

      // 生成模拟好友数据
      generateMockFriends: () => {
        const mockFriends = generateMockFriends(10);
        const mockRequests: FriendRequest[] = [
          {
            id: 'req_1',
            from: {
              id: 'new_friend_1',
              name: '新玩家小明',
              avatar: '🌟',
              level: 5,
              status: 'online',
              lastActive: Date.now(),
              achievements: 3,
              score: 500,
            },
            timestamp: Date.now() - 3600000,
            message: '你好，可以加个好友吗？',
          },
        ];
        
        set({ friends: mockFriends, requests: mockRequests });
      },
    }),
    {
      name: 'chumen-friends',
      partialize: (state) => ({
        friends: state.friends,
        requests: state.requests,
      }),
    }
  )
);
