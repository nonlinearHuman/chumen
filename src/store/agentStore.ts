// Agent存储 - 管理已召唤的Agent
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComposedSprite, NFTTradingAttrs, NFTCollectionAttrs } from '@/types/traits';

interface AgentStore {
  // 状态
  agents: ComposedSprite[];
  favorites: string[]; // 收藏的Agent ID
  
  // 操作
  addAgent: (agent: ComposedSprite) => void;
  removeAgent: (agentId: string) => void;
  toggleFavorite: (agentId: string) => void;
  getAgentById: (agentId: string) => ComposedSprite | undefined;
  getAgentsByRarity: (rarity: string) => ComposedSprite[];
  getFavorites: () => ComposedSprite[];
  clearAll: () => void;
  
  // 排序和筛选
  getAgentsSortedBy: (sortBy: 'rarity' | 'price' | 'visualScore' | 'createdAt', order?: 'asc' | 'desc') => ComposedSprite[];
  getAgentsFiltered: (filters: {
    rarity?: string[];
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
  }) => ComposedSprite[];
  
  // 统计
  getStats: () => {
    total: number;
    byRarity: Record<string, number>;
    favorites: number;
    totalValue: number;
    averageRarity: number;
  };
}

// 稀有度排序权重
const RARITY_ORDER = {
  mythic: 6,
  legendary: 5,
  epic: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: [],
      favorites: [],

      addAgent: (agent) =>
        set((state) => ({
          agents: [agent, ...state.agents],
        })),

      removeAgent: (agentId) =>
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== agentId),
          favorites: state.favorites.filter((id) => id !== agentId),
        })),

      toggleFavorite: (agentId) =>
        set((state) => ({
          favorites: state.favorites.includes(agentId)
            ? state.favorites.filter((id) => id !== agentId)
            : [...state.favorites, agentId],
        })),

      getAgentById: (agentId) => {
        return get().agents.find((a) => a.id === agentId);
      },

      getAgentsByRarity: (rarity) => {
        return get().agents.filter((a) => a.rarity === rarity);
      },

      getFavorites: () => {
        const state = get();
        return state.agents.filter((a) => state.favorites.includes(a.id));
      },

      clearAll: () =>
        set({
          agents: [],
          favorites: [],
        }),

      getAgentsSortedBy: (sortBy, order = 'desc') => {
        const agents = [...get().agents];
        
        return agents.sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'rarity':
              comparison = (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
              break;
            case 'price':
              comparison = (a.estimatedPrice || 0) - (b.estimatedPrice || 0);
              break;
            case 'visualScore':
              comparison = (a.collectionAttrs?.visualScore || 0) - (b.collectionAttrs?.visualScore || 0);
              break;
            case 'createdAt':
              comparison = a.createdAt - b.createdAt;
              break;
          }
          
          return order === 'desc' ? -comparison : comparison;
        });
      },

      getAgentsFiltered: (filters) => {
        let agents = [...get().agents];
        
        // 按稀有度筛选
        if (filters.rarity && filters.rarity.length > 0) {
          agents = agents.filter(a => filters.rarity!.includes(a.rarity));
        }
        
        // 按价格范围筛选
        if (filters.minPrice !== undefined) {
          agents = agents.filter(a => (a.estimatedPrice || 0) >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
          agents = agents.filter(a => (a.estimatedPrice || 0) <= filters.maxPrice!);
        }
        
        // 按标签筛选
        if (filters.tags && filters.tags.length > 0) {
          agents = agents.filter(a => {
            const agentTags = a.collectionAttrs?.visualTags || [];
            return filters.tags!.some(tag => agentTags.includes(tag));
          });
        }
        
        return agents;
      },

      getStats: () => {
        const state = get();
        const byRarity: Record<string, number> = {};
        
        state.agents.forEach((agent) => {
          byRarity[agent.rarity] = (byRarity[agent.rarity] || 0) + 1;
        });

        // 计算总价值
        const totalValue = state.agents.reduce((sum, a) => sum + (a.estimatedPrice || 0), 0);
        
        // 计算平均稀有度分数
        const averageRarity = state.agents.length > 0
          ? state.agents.reduce((sum, a) => sum + (a.nftAttrs?.score || 0), 0) / state.agents.length
          : 0;

        return {
          total: state.agents.length,
          byRarity,
          favorites: state.favorites.length,
          totalValue,
          averageRarity,
        };
      },
    }),
    {
      name: 'chumen-agents', // localStorage key
      version: 1,
    }
  )
);

// 导出简化操作
export const agentStore = {
  add: (agent: ComposedSprite) => useAgentStore.getState().addAgent(agent),
  remove: (agentId: string) => useAgentStore.getState().removeAgent(agentId),
  toggleFavorite: (agentId: string) => useAgentStore.getState().toggleFavorite(agentId),
  getStats: () => useAgentStore.getState().getStats(),
};
