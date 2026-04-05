// NFT 市场组件（含铸造+详情）
// src/components/NFTMarket.tsx

'use client';

import React, { useState } from 'react';
import { useNFTStore } from '@/store/nftStore';
import { getAgentById } from '@/config/agents';
import { NFTAgent, RARITY_CONFIG } from '@/types/nft';
import { NFTDetailModal } from './NFTDetailModal';
import { MintCharacter } from './MintCharacter';

type TabType = 'market' | 'my' | 'mint';

type NFTMarketProps = {
  isMobile?: boolean;
};

export const NFTMarket: React.FC<NFTMarketProps> = ({ isMobile = false }) => {
  const {
    listedNFTs,
    userNFTs,
    walletAddress,
    isConnected,
    connectWallet, 
    disconnectWallet,
    buyNFT,
  } = useNFTStore();

  const [activeTab, setActiveTab] = useState<TabType>('mint');
  const [selectedNFT, setSelectedNFT] = useState<NFTAgent | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleBuyNFT = async (nft: NFTAgent) => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    await buyNFT(nft);
    alert(`🎉 购买成功！你现在是 ${nft.id} 的主人了！`);
  };

  const handleShowDetail = (nft: NFTAgent) => {
    setSelectedNFT(nft);
    setShowDetail(true);
  };

  const handleListForSale = (nft: NFTAgent) => {
    setShowDetail(false);
    // TODO: 实现挂单功能
    alert('挂单功能开发中...');
  };

  const renderRarity = (nft: NFTAgent) => {
    const rarity = nft.rarity || 'common';
    const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color} ${config.color.replace('text-', 'bg-').replace('600', '100')}`}>
        {config.badge}
      </span>
    );
  };

  const NFTListItem = ({ nft, showOwner }: { nft: NFTAgent; showOwner?: boolean }) => {
    const agent = getAgentById(nft.id);
    const displayName = agent?.nameCN || nft.origin?.name || `角色 #${nft.tokenId}`;
    const displayEmoji = agent?.emoji || nft.origin?.emoji || '❓';
    
    return (
      <div 
        className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer group"
        onClick={() => handleShowDetail(nft)}
      >
        <div className="flex items-center gap-3">
          <div className={`relative text-4xl ${nft.rarity ? (RARITY_CONFIG[nft.rarity]?.glow || '') : ''} shadow-md rounded-xl p-2 bg-gray-50`}>
            {displayEmoji}
            {nft.rarity === 'legendary' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs animate-pulse">
                🌟
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-800 truncate">{displayName}</h4>
              {renderRarity(nft)}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {nft.origin ? nft.origin.name : agent?.role || '神秘角色'}
            </p>
            {showOwner && (
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {nft.owner ? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}` : ''}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-purple-600 text-lg">{nft.price} ETH</p>
            {activeTab === 'market' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNFT(nft);
                }}
                disabled={!isConnected}
                className="mt-1 px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                购买
              </button>
            )}
          </div>
        </div>
        
        {/* 悬停显示更多信息 */}
        <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>#{nft.tokenId}</span>
            <span>{nft.stats?.dramaCount || 0}个大事件 · {nft.stats?.popularity || 0}人气</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'px-1' : ''}`}>
      {/* 钱包连接 */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          {isConnected ? (
            <>
              <div>
                <p className="text-sm text-gray-500">已连接</p>
                <p className="font-mono text-sm font-medium text-purple-600">
                  {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500">持有</p>
                  <p className="font-bold text-lg text-purple-600">{userNFTs.length}</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                >
                  断开
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">连接钱包以铸造和交易 NFT</p>
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                连接钱包
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('mint')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'mint' 
              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ✨ 铸造角色
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'market' 
              ? 'bg-green-100 text-green-700 border-2 border-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🏪 市场 ({listedNFTs.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'my' 
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎁 我的 ({userNFTs.length})
        </button>
      </div>

      {/* 内容区 */}
      <div className="min-h-96">
        {activeTab === 'mint' && (
          <MintCharacter onMintComplete={() => setActiveTab('my')} />
        )}

        {activeTab === 'market' && (
          <div className="space-y-3">
            {/* 稀有度筛选提示 */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400" /> 传奇
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> 稀有
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300" /> 普通
              </span>
            </div>

            {listedNFTs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-gray-500">暂无上架的 NFT</p>
                <p className="text-sm text-gray-400 mt-1">成为第一个铸造者吧！</p>
                <button
                  onClick={() => setActiveTab('mint')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                  铸造角色
                </button>
              </div>
            ) : (
              listedNFTs.map((nft) => (
                <NFTListItem key={nft.tokenId} nft={nft} showOwner />
              ))
            )}
          </div>
        )}

        {activeTab === 'my' && (
          <div className="space-y-3">
            {userNFTs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-4xl mb-3">🎭</p>
                <p className="text-gray-500">你还没有 NFT</p>
                <p className="text-sm text-gray-400 mt-1">铸造一个角色加入真人秀</p>
                <button
                  onClick={() => setActiveTab('mint')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                  铸造角色
                </button>
              </div>
            ) : (
              userNFTs.map((nft) => (
                <NFTListItem key={nft.tokenId} nft={nft} />
              ))
            )}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          💡 <strong>持有NFT解锁专属剧情</strong> — 只有你能看到这个角色的私密故事线
        </p>
      </div>

      {/* 详情弹窗 */}
      {showDetail && selectedNFT && (
        <NFTDetailModal 
          nft={selectedNFT} 
          onClose={() => setShowDetail(false)}
          onListForSale={handleListForSale}
        />
      )}
    </div>
  );
};
