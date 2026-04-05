// 角色铸造组件 - 起源剧本选择
// src/components/MintCharacter.tsx

'use client';

import React, { useState } from 'react';
import { ORIGIN_STORIES, Rarity, OriginStory } from '@/types/nft';
import { useNFTStore } from '@/store/nftStore';
import { agents } from '@/config/agents';

interface MintCharacterProps {
  onMintComplete?: () => void;
}

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; glow: string; badge: string }> = {
  legendary: { 
    label: '传奇', 
    color: 'text-yellow-600', 
    glow: 'shadow-yellow-400',
    badge: '🌟 传奇'
  },
  rare: { 
    label: '稀有', 
    color: 'text-purple-600', 
    glow: 'shadow-purple-400',
    badge: '💎 稀有'
  },
  common: { 
    label: '普通', 
    color: 'text-gray-600', 
    glow: 'shadow-gray-400',
    badge: '⚪ 普通'
  },
};

const RARITY_WEIGHTS = ORIGIN_STORIES.reduce((acc, story) => {
  acc[story.rarity] = (acc[story.rarity] || 0) + story.weight;
  return acc;
}, {} as Record<Rarity, number>);

const TOTAL_WEIGHT = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);

function rollRarity(): Rarity {
  const roll = Math.random() * TOTAL_WEIGHT;
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulative += weight;
    if (roll <= cumulative) return rarity as Rarity;
  }
  return 'common';
}

export const MintCharacter: React.FC<MintCharacterProps> = ({ onMintComplete }) => {
  const { connectWallet, walletAddress, isConnected, mintNFT } = useNFTStore();
  
  const [step, setStep] = useState<'origin' | 'name' | 'confirm'>('origin');
  const [selectedOrigin, setSelectedOrigin] = useState<OriginStory | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [selectedBase, setSelectedBase] = useState<string>('custom');
  const [rolling, setRolling] = useState(false);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState<{ name: string; origin: OriginStory; rarity: Rarity; tokenId: string } | null>(null);

  // 预定义基础角色（用户可以选择一个作为模板）
  const baseCharacters = agents.filter(a => !a.isNPC);

  const handleRollRarity = () => {
    setRolling(true);
    setTimeout(() => {
      const rarity = rollRarity();
      // 根据稀有度筛选可用的起源剧本
      const availableOrigins = ORIGIN_STORIES.filter(o => o.rarity === rarity);
      const randomOrigin = availableOrigins[Math.floor(Math.random() * availableOrigins.length)];
      setSelectedOrigin(randomOrigin);
      setRolling(false);
      setStep('name');
    }, 1500);
  };

  const handleSelectOrigin = (origin: OriginStory) => {
    setSelectedOrigin(origin);
    setStep('name');
  };

  const handleMint = async () => {
    if (!characterName.trim() || !selectedOrigin) return;
    setMinting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const tokenId = `T${Date.now()}`;
    mintNFT({
      id: `user_${Date.now()}`,
      tokenId,
      owner: walletAddress || '',
      price: '0',
      listed: false,
      createdAt: Date.now(),
      minterAddress: walletAddress || '',
      origin: selectedOrigin,
      rarity: selectedOrigin.rarity,
      storyEvents: [],
      relationships: [],
      status: 'mysterious',
      stats: {
        popularity: Math.floor(Math.random() * 100),
        exposureCount: 0,
        dramaCount: 0,
        relationshipChangeCount: 0,
        tradeCount: 0,
      },
    });
    
    setMinted({
      name: characterName,
      origin: selectedOrigin,
      rarity: selectedOrigin.rarity,
      tokenId,
    });
    setMinting(false);
  };

  const handleReset = () => {
    setStep('origin');
    setSelectedOrigin(null);
    setCharacterName('');
    setMinted(null);
  };

  if (minted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">铸造成功！</h2>
          <p className="text-gray-500 mb-6">你的角色已加入楚门世界</p>
          
          <div className={`bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border-2 ${RARITY_CONFIG[minted.rarity].glow} shadow-lg`}>
            <div className="text-5xl mb-3">{minted.origin.emoji}</div>
            <div className={`text-sm font-medium ${RARITY_CONFIG[minted.rarity].color} mb-2`}>
              {RARITY_CONFIG[minted.rarity].badge}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{minted.name}</h3>
            <p className="text-sm text-gray-500 mt-1">#{minted.tokenId}</p>
            <div className="mt-4 text-left bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">起源剧本</p>
              <p className="font-medium text-gray-700">{minted.origin.name}</p>
              <p className="text-xs text-gray-400 mt-1">{minted.origin.description}</p>
            </div>
            <div className="mt-3 text-left bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">铸造者印记</p>
              <p className="font-mono text-xs text-purple-600">
                {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : '匿名'}
              </p>
              <p className="text-xs text-gray-400 mt-1">铸造者永久记录，可参与角色剧情投票</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">
              🌟 <strong>你的角色已准备就绪</strong><br/>
              <span className="text-xs">明天会有专属剧情线触发，届时你会收到通知</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
            >
              再铸造一个
            </button>
            {onMintComplete && (
              <button
                onClick={onMintComplete}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
              >
                查看角色
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'origin') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🎬 铸造你的角色</h2>
          <p className="text-gray-500 mt-1">为角色选择起源剧本，决定命运的开端</p>
        </div>

        {/* 稀有度说明 */}
        <div className="flex justify-center gap-6 mb-6">
          {(['legendary', 'rare', 'common'] as Rarity[]).map(r => (
            <div key={r} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full ${r === 'legendary' ? 'bg-yellow-400' : r === 'rare' ? 'bg-purple-400' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500">{RARITY_CONFIG[r].label}</span>
              <span className="text-xs text-gray-400">
                ({Math.round((RARITY_WEIGHTS[r] / TOTAL_WEIGHT) * 100)}%)
              </span>
            </div>
          ))}
        </div>

        {/* 自动抽取按钮 */}
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">连接钱包后即可铸造</p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
            >
              连接钱包
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleRollRarity}
              disabled={rolling}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
            >
              {rolling ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🎲</span> 抽取命运中...
                </span>
              ) : (
                '🎲 抽取命运（随机稀有度）'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">或者</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">直接选择起源剧本</p>

            {/* 起源剧本列表 */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(['legendary', 'rare', 'common'] as Rarity[]).map(rarity => (
                <div key={rarity}>
                  <p className={`text-xs font-medium ${RARITY_CONFIG[rarity].color} mb-2`}>
                    {RARITY_CONFIG[rarity].badge}
                  </p>
                  {ORIGIN_STORIES.filter(o => o.rarity === rarity).map(origin => (
                    <button
                      key={origin.id}
                      onClick={() => handleSelectOrigin(origin)}
                      className={`w-full text-left p-3 rounded-xl mb-2 border-2 transition-all hover:scale-[1.02] ${
                        rarity === 'legendary' ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-400' :
                        rarity === 'rare' ? 'border-purple-200 bg-purple-50 hover:border-purple-400' :
                        'border-gray-200 bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{origin.emoji}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{origin.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{origin.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          铸造者钱包地址将永久记录在 NFT 元数据中
        </p>
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <button 
          onClick={() => setStep('origin')}
          className="text-sm text-purple-600 hover:text-purple-700 mb-4"
        >
          ← 返回选择起源
        </button>

        <div className="text-center mb-6">
          <div className={`inline-block text-5xl mb-3 ${RARITY_CONFIG[selectedOrigin!.rarity].glow} shadow-lg rounded-full p-3`}>
            {selectedOrigin!.emoji}
          </div>
          <div className={`text-sm font-medium ${RARITY_CONFIG[selectedOrigin!.rarity].color}`}>
            {RARITY_CONFIG[selectedOrigin!.rarity].badge}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedOrigin!.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{selectedOrigin!.description}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              为角色取个名字
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="输入角色名字..."
              maxLength={20}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-lg"
            />
          </div>

          {/* 预选角色模板 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">或选择预设角色作为模板</p>
            <div className="grid grid-cols-4 gap-2">
              {baseCharacters.slice(0, 4).map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setCharacterName(agent.nameCN)}
                  className={`p-2 rounded-lg border-2 text-center transition-all ${
                    selectedBase === agent.id 
                      ? 'border-purple-400 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{agent.emoji}</span>
                  <p className="text-xs mt-1 truncate">{agent.nameCN}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 铸造预览 */}
          <div className={`p-4 rounded-xl border-2 ${RARITY_CONFIG[selectedOrigin!.rarity].glow}`}>
            <p className="text-xs text-gray-500 mb-2">铸造预览</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedOrigin!.emoji}</span>
              <div>
                <p className="font-bold text-lg">{characterName || '未命名角色'}</p>
                <p className="text-sm text-gray-500">{selectedOrigin!.name}</p>
              </div>
            </div>
            {selectedOrigin!.storyArcs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">预设剧情线</p>
                <div className="flex flex-wrap gap-1">
                  {selectedOrigin!.storyArcs.map((arc, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                      {arc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleMint}
            disabled={!characterName.trim() || minting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {minting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span> 铸造中...
              </span>
            ) : (
              `🚀 铸造 ${RARITY_CONFIG[selectedOrigin!.rarity].badge} 角色`
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
