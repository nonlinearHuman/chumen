// NFT 市场组件（含铸造+详情）- 楚门World 新设计
// src/components/NFTMarket.tsx
'use client';

import React, { useState } from 'react';
import { useNFTStore } from '@/store/nftStore';
import { getAgentById } from '@/config/agents';
import { NFTAgent, RARITY_CONFIG, Rarity } from '@/types/nft';
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
    alert('挂单功能开发中...');
  };

  // 稀有度徽章渲染
  const renderRarityBadge = (rarity: Rarity) => {
    const config = RARITY_CONFIG[rarity];
    return (
      <span
        className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-full border ${config.animation || ''}`}
        style={{
          background: rarity === 'mythic' ? 'linear-gradient(90deg, #f43f5e, #f59e0b, #10b981)' :
            rarity === 'legendary' ? 'linear-gradient(90deg, #eab308, #f59e0b, #eab308)' :
            'var(--bg-surface)',
          color: rarity === 'mythic' || rarity === 'legendary' ? '#000' : 'var(--text-primary)',
          borderColor: rarity === 'common' ? 'var(--border)' : config.border?.replace('border-', ''),
        }}
      >
        {config.badge}
      </span>
    );
  };

  // 辅助函数：获取稀有度边框颜色
  const getRarityBorderColor = (r: string) => {
    const colors: Record<string, string> = {
      mythic: 'rgba(244, 63, 94, 0.5)',
      legendary: 'rgba(234, 179, 8, 0.5)',
      epic: 'rgba(168, 85, 247, 0.5)',
      rare: 'rgba(59, 130, 246, 0.5)',
      uncommon: 'rgba(16, 185, 129, 0.5)',
      common: 'var(--border)',
    };
    return colors[r] || colors.common;
  };

  // NFT 卡片组件
  const NFTListItem = ({ nft, showOwner }: { nft: NFTAgent; showOwner?: boolean }) => {
    const agent = getAgentById(nft.id);
    const displayName = agent?.nameCN || nft.origin?.name || `角色 #${nft.tokenId}`;
    const displayEmoji = agent?.emoji || nft.origin?.emoji || '❓';
    const rarity = nft.rarity || 'common';
    const borderColor = getRarityBorderColor(rarity);

    return (
      <div
        className="rounded-lg p-4 border cursor-pointer group transition-all duration-300 hover:scale-[1.01]"
        style={{ background: 'var(--bg-surface)', borderColor }}
        onClick={() => handleShowDetail(nft)}
      >
        <div className="flex items-center gap-4">
          {/* 头像 */}
          <div
            className="relative w-14 h-14 rounded-lg flex items-center justify-center text-3xl border"
            style={{ background: 'var(--bg-elevated)', borderColor }}
          >
            {displayEmoji}
            {(rarity === 'legendary' || rarity === 'mythic') && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ background: rarity === 'mythic' ? 'linear-gradient(135deg, #f43f5e, #f59e0b)' : '#eab308' }}
              >
                {rarity === 'mythic' ? '👑' : '🌟'}
              </div>
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {displayName}
              </h4>
              {renderRarityBadge(rarity)}
            </div>
            <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
              {nft.origin ? nft.origin.name : agent?.role || '神秘角色'}
            </p>
            {showOwner && (
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {nft.owner ? nft.owner.slice(0, 6) + '...' + nft.owner.slice(-4) : ''}
              </p>
            )}
          </div>

          {/* 价格 & 操作 */}
          <div className="text-right flex-shrink-0">
            <p className="font-display font-bold text-lg" style={{ color: 'var(--accent-cyan)' }}>
              {nft.price} ETH
            </p>
            {activeTab === 'market' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleBuyNFT(nft); }}
                disabled={!isConnected}
                className="mt-1 px-4 py-1 rounded text-sm font-display font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent-green)', color: '#000' }}
              >
                购买
              </button>
            )}
          </div>
        </div>

        {/* 悬停显示更多信息 */}
        <div className="mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-mono">#{nft.tokenId}</span>
            <span>{nft.stats?.dramaCount || 0} 个大事件 · {nft.stats?.popularity || 0} 人气</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'px-1' : ''}`}>
      {/* 钱包连接 */}
      <div className="rounded-chumen-lg p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          {isConnected ? (
            <>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>已连接</p>
                <p className="font-mono text-sm font-medium" style={{ color: 'var(--accent-cyan)' }}>
                  {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>持有</p>
                  <p className="font-display font-bold text-xl" style={{ color: 'var(--accent-cyan)' }}>{userNFTs.length}</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1.5 rounded-churen-sm text-sm font-display"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  断开
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>连接钱包以铸造和交易 NFT</p>
              <button
                onClick={connectWallet}
                className="px-4 py-2 rounded-churen-md text-sm font-display font-bold transition-all"
                style={{
                  background: 'var(--accent-cyan)',
                  color: '#000',
                }}
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
          className="flex-1 py-2.5 rounded-churen-md text-sm font-display font-medium transition-all"
          style={{
            background: activeTab === 'mint' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-surface)',
            color: activeTab === 'mint' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: activeTab === 'mint' ? '1px solid var(--accent-cyan)' : '1px solid var(--border)',
          }}
        >
          ✨ 铸造角色
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className="flex-1 py-2.5 rounded-churen-md text-sm font-display font-medium transition-all"
          style={{
            background: activeTab === 'market' ? 'rgba(255, 45, 120, 0.15)' : 'var(--bg-surface)',
            color: activeTab === 'market' ? 'var(--accent-magenta)' : 'var(--text-secondary)',
            border: activeTab === 'market' ? '1px solid var(--accent-magenta)' : '1px solid var(--border)',
          }}
        >
          🏪 市场 ({listedNFTs.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className="flex-1 py-2.5 rounded-churen-md text-sm font-display font-medium transition-all"
          style={{
            background: activeTab === 'my' ? 'rgba(255, 184, 0, 0.15)' : 'var(--bg-surface)',
            color: activeTab === 'my' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            border: activeTab === 'my' ? '1px solid var(--accent-gold)' : '1px solid var(--border)',
          }}
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
            <div className="flex items-center gap-4 text-xs px-1" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg, #f43f5e, #f59e0b)' }} />
                神话
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                传说
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                史诗
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                稀有
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                精良
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                普通
              </span>
            </div>

            {listedNFTs.length === 0 ? (
              <div className="text-center py-12 rounded-churen-lg border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <p className="text-4xl mb-3">🛒</p>
                <p style={{ color: 'var(--text-secondary)' }}>暂无上架的 NFT</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>成为第一个铸造者吧！</p>
                <button
                  onClick={() => setActiveTab('mint')}
                  className="mt-4 px-4 py-2 rounded-churen-md text-sm font-display font-bold"
                  style={{ background: 'var(--accent-cyan)', color: '#000' }}
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
              <div className="text-center py-12 rounded-churen-lg border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <p className="text-4xl mb-3">🎭</p>
                <p style={{ color: 'var(--text-secondary)' }}>你还没有 NFT</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>铸造一个角色加入真人秀</p>
                <button
                  onClick={() => setActiveTab('mint')}
                  className="mt-4 px-4 py-2 rounded-churen-md text-sm font-display font-bold"
                  style={{ background: 'var(--accent-gold)', color: '#000' }}
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
      <div
        className="rounded-churen-lg p-4 text-center border"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.06), rgba(255, 45, 120, 0.06))',
          borderImage: 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(255, 45, 120, 0.3)) 1',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          💡 <strong style={{ color: 'var(--accent-gold)' }}>持有NFT解锁专属剧情</strong> — 只有你能看到这个角色的私密故事线
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
