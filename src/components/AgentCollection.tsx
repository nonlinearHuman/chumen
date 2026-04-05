'use client';

import React, { useState, useMemo } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { RARITY_CONFIG, Rarity } from '@/types/traits';

// 格式化价格
function formatPrice(price: number | undefined): string {
  if (!price) return '0.00 ETH';
  if (price >= 1) return `${price.toFixed(2)} ETH`;
  if (price >= 0.01) return `${(price * 1000).toFixed(2)} mETH`;
  return `${(price * 1000000).toFixed(0)} μETH`;
}

type SortBy = 'createdAt' | 'rarity' | 'price' | 'visualScore';

export default function AgentCollection() {
  const agents = useAgentStore((state) => state.agents);
  const favorites = useAgentStore((state) => state.favorites);
  const toggleFavorite = useAgentStore((state) => state.toggleFavorite);
  const removeAgent = useAgentStore((state) => state.removeAgent);
  
  // 筛选状态
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // 获取所有可用标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    agents.forEach(agent => {
      agent.collectionAttrs?.visualTags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [agents]);

  // 稀有度排序权重
  const rarityOrder: Record<Rarity, number> = {
    mythic: 6,
    legendary: 5,
    epic: 4,
    rare: 3,
    uncommon: 2,
    common: 1,
  };

  // 排序和筛选
  const filteredAgents = useMemo(() => {
    let result = [...agents];
    
    // 筛选收藏
    if (showFavorites) {
      result = result.filter(a => favorites.includes(a.id));
    }
    
    // 筛选稀有度
    if (filterRarity !== 'all') {
      result = result.filter(a => a.rarity === filterRarity);
    }
    
    // 筛选价格
    if (minPrice) {
      result = result.filter(a => (a.estimatedPrice || 0) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter(a => (a.estimatedPrice || 0) <= parseFloat(maxPrice));
    }
    
    // 筛选标签
    if (filterTags.length > 0) {
      result = result.filter(a => {
        const agentTags = a.collectionAttrs?.visualTags || [];
        return filterTags.some(tag => agentTags.includes(tag));
      });
    }
    
    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        case 'price':
          return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
        case 'visualScore':
          return (b.collectionAttrs?.visualScore || 0) - (a.collectionAttrs?.visualScore || 0);
        case 'createdAt':
        default:
          return b.createdAt - a.createdAt;
      }
    });
    
    return result;
  }, [agents, showFavorites, filterRarity, sortBy, minPrice, maxPrice, filterTags, favorites, rarityOrder]);

  // 统计
  const stats = useMemo(() => {
    const total = filteredAgents.length;
    const totalValue = filteredAgents.reduce((sum, a) => sum + (a.estimatedPrice || 0), 0);
    const avgRarity = total > 0
      ? filteredAgents.reduce((sum, a) => sum + (a.nftAttrs?.score || 0), 0) / total
      : 0;
    
    return { total, totalValue, avgRarity };
  }, [filteredAgents]);

  if (agents.length === 0) {
    return (
      <div className="empty-state text-center py-20">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有Agent</h3>
        <p className="text-gray-500">去召唤你的第一个Agent吧！</p>
      </div>
    );
  }

  return (
    <div className="agent-collection">
      {/* 统计面板 */}
      <div className="stats-panel grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
          <div className="text-sm opacity-80">总数量</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg">
          <div className="text-sm opacity-80">总价值</div>
          <div className="text-2xl font-bold">{formatPrice(stats.totalValue)}</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-lg">
          <div className="text-sm opacity-80">平均稀有度</div>
          <div className="text-2xl font-bold">{stats.avgRarity.toFixed(1)}</div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="filters flex gap-4 mb-6 flex-wrap items-center">
        {/* 收藏切换 */}
        <button
          className={`px-4 py-2 rounded-lg ${
            !showFavorites ? 'bg-purple-600 text-white' : 'bg-white'
          }`}
          onClick={() => setShowFavorites(false)}
        >
          全部 ({agents.length})
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            showFavorites ? 'bg-purple-600 text-white' : 'bg-white'
          }`}
          onClick={() => setShowFavorites(true)}
        >
          收藏 ({favorites.length})
        </button>
        
        {/* 稀有度筛选 */}
        <select
          className="px-4 py-2 rounded-lg bg-white border border-gray-300"
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
        >
          <option value="all">所有稀有度</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
          <option value="mythic">Mythic</option>
        </select>

        {/* 排序 */}
        <select
          className="px-4 py-2 rounded-lg bg-white border border-gray-300"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
        >
          <option value="createdAt">最新</option>
          <option value="rarity">稀有度</option>
          <option value="price">价格</option>
          <option value="visualScore">视觉评分</option>
        </select>

        {/* 价格范围 */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="最低价"
            className="w-24 px-2 py-2 rounded-lg bg-white border border-gray-300 text-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            step="0.01"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="最高价"
            className="w-24 px-2 py-2 rounded-lg bg-white border border-gray-300 text-sm"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            step="0.01"
          />
          <span className="text-sm text-gray-500">ETH</span>
        </div>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {allTags.slice(0, 5).map(tag => (
              <button
                key={tag}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterTags.includes(tag)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setFilterTags(prev => 
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Agent网格 */}
      <div className="agents-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredAgents.map((agent) => {
          const rarityConfig = RARITY_CONFIG[agent.rarity];
          const isFavorite = favorites.includes(agent.id);

          return (
            <div
              key={agent.id}
              className="agent-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              style={{ borderLeft: `4px solid ${rarityConfig?.color}` }}
            >
              {/* 预览图 */}
              <div className="preview relative p-4 bg-gray-50">
                {agent.previewUrl ? (
                  <img
                    src={agent.previewUrl}
                    alt={agent.dna}
                    className="w-full h-24 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">无预览</span>
                  </div>
                )}
                
                {/* 收藏按钮 */}
                <button
                  className="absolute top-2 right-2 text-2xl"
                  onClick={() => toggleFavorite(agent.id)}
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
              </div>

              {/* 信息 */}
              <div className="info p-3">
                <div
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: rarityConfig?.color }}
                >
                  {agent.rarity}
                </div>
                <div className="text-xs font-mono text-gray-500 truncate">
                  {agent.dna}
                </div>
                
                {/* NFT 属性展示 */}
                {agent.estimatedPrice && (
                  <div className="text-sm font-semibold text-green-600 mt-1">
                    {formatPrice(agent.estimatedPrice)}
                  </div>
                )}
                
                {agent.nftAttrs && (
                  <div className="text-xs text-gray-400 mt-1">
                    排名 #{agent.nftAttrs.rank} · 分数 {agent.nftAttrs.score.toFixed(0)}
                  </div>
                )}
                
                {agent.collectionAttrs && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-400"
                        style={{ width: `${agent.collectionAttrs.visualScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {agent.collectionAttrs.visualScore}
                    </span>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-1">
                  {agent.traits.length} 个特征
                </div>
              </div>

              {/* 操作 */}
              <div className="actions p-2 bg-gray-50 border-t border-gray-100">
                <button
                  className="w-full text-xs text-red-500 hover:text-red-700"
                  onClick={() => {
                    if (confirm('确定要删除这个Agent吗？')) {
                      removeAgent(agent.id);
                    }
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          没有符合条件的Agent
        </div>
      )}
    </div>
  );
}
