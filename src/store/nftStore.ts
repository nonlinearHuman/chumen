// NFT 状态管理（含故事线）
// src/store/nftStore.ts

import { create } from 'zustand';
import { NFTAgent, NFTListing } from '@/types/nft';

interface NFTState {
  // NFT 列表
  listedNFTs: NFTAgent[];
  userNFTs: NFTAgent[];
  listings: NFTListing[];
  
  // 用户钱包
  walletAddress: string | null;
  isConnected: boolean;
  
  // Actions
  setWalletAddress: (address: string | null) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  mintNFT: (nft: NFTAgent) => void;
  buyNFT: (nft: NFTAgent) => Promise<void>;
  listNFT: (tokenId: string, price: string) => Promise<void>;
  delistNFT: (tokenId: string) => Promise<void>;
  updateNFTStory: (
    tokenId: string, 
    updates: Partial<Pick<NFTAgent, 'storyEvents' | 'rarity' | 'status' | 'stats' | 'relationships'>>
  ) => void;
}

// 预置市场NFT（带故事线数据）
const demoListedNFTs: NFTAgent[] = [
  {
    id: 'marcus',
    tokenId: 'T001',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    price: '0.05',
    listed: true,
    createdAt: Date.now() - 86400000 * 5,
    minterAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab01',
    rarity: 'legendary',
    origin: {
      id: 'hidden_identity',
      name: '隐藏身份的卧底',
      description: '表面身份只是伪装，背后有不为人知的秘密使命',
      emoji: '🎭',
      rarity: 'legendary',
      storyArcs: ['身份暴露危机', '双面人生', '最终抉择'],
      weight: 1,
    },
    status: 'secret_agenda',
    stats: {
      popularity: 89,
      exposureCount: 23,
      dramaCount: 7,
      relationshipChangeCount: 5,
      tradeCount: 2,
    },
    storyEvents: [
      {
        id: '1',
        title: '角色诞生',
        description: '神秘的连续创业者首次登场',
        type: 'adventure',
        timestamp: Date.now() - 86400000 * 5,
        emoji: '🎬',
        importance: 'medium',
      },
      {
        id: '2',
        title: '暗中调查',
        description: '发现公司内部有内鬼',
        type: 'secret',
        timestamp: Date.now() - 86400000 * 3,
        emoji: '🔍',
        importance: 'high',
      },
      {
        id: '3',
        title: '商战爆发',
        description: '与Sophia的商业对决正式展开',
        type: 'career',
        timestamp: Date.now() - 86400000 * 1,
        emoji: '⚔️',
        importance: 'legendary',
      },
    ],
    relationships: [
      {
        agentId: 'sophia',
        agentName: '吴Sophia',
        agentEmoji: '👩‍⚖️',
        level: -45,
        type: 'enemy',
        lastEvent: '商战爆发',
      },
      {
        agentId: 'james',
        agentName: '刘James',
        agentEmoji: '👨‍⚕️',
        level: 60,
        type: 'friend',
        lastEvent: '大学同学聚会',
      },
    ],
  },
  {
    id: 'sophia',
    tokenId: 'T002',
    owner: '0xabcd1234efgh5678ijkl9012mnop3456qrst7890',
    price: '0.08',
    listed: true,
    createdAt: Date.now() - 86400000 * 3,
    minterAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab02',
    rarity: 'legendary',
    origin: {
      id: 'rags_to_riches',
      name: '逆袭的野心家',
      description: '从社会底层爬上来，对权力和成功有强烈渴望',
      emoji: '📈',
      rarity: 'rare',
      storyArcs: ['创业与危机', '阶级跨越', '金钱与道德'],
      weight: 3,
    },
    status: 'ambitious',
    stats: {
      popularity: 75,
      exposureCount: 18,
      dramaCount: 5,
      relationshipChangeCount: 3,
      tradeCount: 1,
    },
    storyEvents: [
      {
        id: '1',
        title: '律所新星',
        description: '史上最年轻合伙人',
        type: 'career',
        timestamp: Date.now() - 86400000 * 3,
        emoji: '⚖️',
        importance: 'medium',
      },
      {
        id: '2',
        title: '商战布局',
        description: '开始对Marcus公司发起攻势',
        type: 'conflict',
        timestamp: Date.now() - 86400000 * 1,
        emoji: '🎯',
        importance: 'high',
      },
    ],
    relationships: [
      {
        agentId: 'marcus',
        agentName: '陈Marcus',
        agentEmoji: '🧑‍💻',
        level: -45,
        type: 'enemy',
        lastEvent: '商战布局',
      },
    ],
  },
  {
    id: 'james',
    tokenId: 'T003',
    owner: '0x9876wxyz5432abcd9876efgh1234ijkl5678mnop',
    price: '0.03',
    listed: true,
    createdAt: Date.now() - 86400000 * 2,
    rarity: 'rare',
    origin: {
      id: 'secret_love',
      name: '暗恋的秘密',
      description: '心中藏着一份无法说出口的感情',
      emoji: '💔',
      rarity: 'rare',
      storyArcs: ['暗恋与告白', '三角关系', '爱与放手'],
      weight: 3,
    },
    status: 'heart_broken',
    stats: {
      popularity: 62,
      exposureCount: 12,
      dramaCount: 3,
      relationshipChangeCount: 2,
      tradeCount: 0,
    },
    storyEvents: [
      {
        id: '1',
        title: '命运的邂逅',
        description: '在医院偶遇Emily',
        type: 'romance',
        timestamp: Date.now() - 86400000 * 2,
        emoji: '💕',
        importance: 'medium',
      },
    ],
    relationships: [
      {
        agentId: 'emily',
        agentName: '张Emily',
        agentEmoji: '📰',
        level: 65,
        type: 'romantic',
        lastEvent: '命运的邂逅',
      },
    ],
  },
];

export const useNFTStore = create<NFTState>((set, get) => ({
  listedNFTs: demoListedNFTs,
  userNFTs: [],
  listings: [],
  walletAddress: null,
  isConnected: false,

  setWalletAddress: (address) => {
    set({ walletAddress: address, isConnected: !!address });
  },

  connectWallet: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ 
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab12', 
      isConnected: true 
    });
  },

  disconnectWallet: () => {
    set({ walletAddress: null, isConnected: false, userNFTs: [] });
  },

  mintNFT: async (nft) => {
    const { walletAddress } = get();
    if (!walletAddress) return;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mintedNFT: NFTAgent = {
      ...nft,
      owner: walletAddress,
      createdAt: Date.now(),
    };
    
    set(state => ({
      userNFTs: [...state.userNFTs, mintedNFT],
      listedNFTs: [...state.listedNFTs, mintedNFT],
    }));
  },

  buyNFT: async (nft) => {
    const { walletAddress, listedNFTs, userNFTs } = get();
    if (!walletAddress) return;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set({
      listedNFTs: listedNFTs.filter(n => n.tokenId !== nft.tokenId),
      userNFTs: [...userNFTs, { ...nft, owner: walletAddress, listed: false }],
    });
  },

  listNFT: async (tokenId, price) => {
    const { walletAddress, listedNFTs, userNFTs } = get();
    if (!walletAddress) return;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const nft = userNFTs.find(n => n.tokenId === tokenId);
    if (nft) {
      const updated = { ...nft, price, listed: true };
      set({
        listedNFTs: [...listedNFTs.filter(n => n.tokenId !== tokenId), updated],
        userNFTs: userNFTs.map(n => n.tokenId === tokenId ? updated : n),
      });
    }
  },

  delistNFT: async (tokenId) => {
    const { listedNFTs, userNFTs } = get();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const nft = listedNFTs.find(n => n.tokenId === tokenId);
    if (nft) {
      set({
        listedNFTs: listedNFTs.filter(n => n.tokenId !== tokenId),
        userNFTs: [...userNFTs, { ...nft, listed: false }],
      });
    }
  },

  updateNFTStory: (tokenId, updates) => {
    const updateNFT = (nft: NFTAgent): NFTAgent => {
      if (nft.tokenId !== tokenId) return nft;
      return { ...nft, ...updates };
    };

    set(state => ({
      listedNFTs: state.listedNFTs.map(updateNFT),
      userNFTs: state.userNFTs.map(updateNFT),
    }));
  },
}));
