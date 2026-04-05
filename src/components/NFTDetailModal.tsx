// NFT详情弹窗 - 角色故事线+关系图
// src/components/NFTDetailModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { NFTAgent, StoryEvent, Relationship, AgentStatus, STATUS_LABELS, ORIGIN_STORIES } from '@/types/nft';
import { getAgentById } from '@/config/agents';

interface NFTDetailModalProps {
  nft: NFTAgent | null;
  onClose: () => void;
  onListForSale?: (nft: NFTAgent) => void;
}

const EVENT_TYPE_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  romance: { emoji: '💕', color: 'text-pink-600', bg: 'bg-pink-50' },
  conflict: { emoji: '⚔️', color: 'text-red-600', bg: 'bg-red-50' },
  career: { emoji: '📈', color: 'text-green-600', bg: 'bg-green-50' },
  secret: { emoji: '🤫', color: 'text-purple-600', bg: 'bg-purple-50' },
  friendship: { emoji: '🤝', color: 'text-blue-600', bg: 'bg-blue-50' },
  family: { emoji: '👨‍👩‍👧', color: 'text-orange-600', bg: 'bg-orange-50' },
  adventure: { emoji: '🎢', color: 'text-yellow-600', bg: 'bg-yellow-50' },
};

const IMPORTANCE_CONFIG: Record<string, { label: string; color: string }> = {
  legendary: { label: '传说', color: 'text-yellow-600 bg-yellow-100' },
  high: { label: '重大', color: 'text-red-600 bg-red-100' },
  medium: { label: '普通', color: 'text-gray-600 bg-gray-100' },
  low: { label: '小事', color: 'text-gray-400 bg-gray-50' },
};

const RARITY_CONFIG: Record<string, { label: string; color: string; glow: string; badge: string }> = {
  legendary: { label: '传奇', color: 'text-yellow-600', glow: 'shadow-yellow-400', badge: '🌟 传奇' },
  rare: { label: '稀有', color: 'text-purple-600', glow: 'shadow-purple-400', badge: '💎 稀有' },
  common: { label: '普通', color: 'text-gray-600', glow: 'shadow-gray-400', badge: '⚪ 普通' },
};

// 模拟故事事件数据
function generateMockStoryEvents(nft: NFTAgent): StoryEvent[] {
  const events: StoryEvent[] = [
    {
      id: '1',
      title: '角色诞生',
      description: `${nft.origin?.name || '神秘身份'}的角色首次登场`,
      type: 'adventure',
      timestamp: nft.createdAt,
      emoji: '🎬',
      importance: 'medium',
    },
    {
      id: '2',
      title: '命运的邂逅',
      description: '在咖啡馆偶遇另一位角色',
      type: 'friendship',
      timestamp: nft.createdAt + 86400000,
      emoji: '☕',
      importance: 'low',
    },
    {
      id: '3',
      title: '暗流涌动',
      description: '察觉到身边有人在暗中观察',
      type: 'secret',
      timestamp: nft.createdAt + 172800000,
      emoji: '👀',
      importance: 'high',
    },
    {
      id: '4',
      title: '第一次冲突',
      description: '与其他角色发生激烈争执',
      type: 'conflict',
      timestamp: nft.createdAt + 259200000,
      emoji: '😤',
      importance: 'medium',
    },
  ];
  return events;
}

function generateMockRelationships(nft: NFTAgent): Relationship[] {
  const baseAgent = getAgentById(nft.id);
  const rels: Relationship[] = [];
  
  if (baseAgent?.relationships) {
    Object.entries(baseAgent.relationships).forEach(([agentId, relType]) => {
      const otherAgent = getAgentById(agentId);
      if (otherAgent) {
        const levels: Record<string, number> = {
          '商业对手': -30,
          '大学同学': 40,
          '暗恋': 60,
          '投资人': 20,
          '表面朋友': 10,
          '医患关系': 30,
        };
        rels.push({
          agentId,
          agentName: otherAgent.nameCN,
          agentEmoji: otherAgent.emoji,
          level: levels[relType] || 0,
          type: relType === '暗恋' ? 'romantic' : 
                relType === '商业对手' ? 'enemy' : 
                relType === '大学同学' ? 'friend' : 'professional',
          lastEvent: '命运的邂逅',
        });
      }
    });
  }
  return rels.slice(0, 4);
}

export const NFTDetailModal: React.FC<NFTDetailModalProps> = ({ nft, onClose, onListForSale }) => {
  if (!nft) return null;

  const [tab, setTab] = useState<'story' | 'relations' | 'trade'>('story');
  
  // 生成/获取模拟数据
  const storyEvents = nft.storyEvents?.length ? nft.storyEvents : generateMockStoryEvents(nft);
  const relationships = nft.relationships?.length ? nft.relationships : generateMockRelationships(nft);
  const status = nft.status || 'mysterious';
  const stats = nft.stats || { popularity: 0, exposureCount: 0, dramaCount: 0, relationshipChangeCount: 0, tradeCount: 0 };
  const origin = nft.origin;
  const rarity = nft.rarity || 'common';

  const baseAgent = getAgentById(nft.id);
  const displayName = baseAgent?.nameCN || `角色 #${nft.tokenId}`;
  const displayEmoji = baseAgent?.emoji || origin?.emoji || '❓';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative p-6 pb-8 bg-gradient-to-br ${
          rarity === 'legendary' ? 'from-yellow-50 to-orange-50' :
          rarity === 'rare' ? 'from-purple-50 to-pink-50' :
          'from-gray-50 to-slate-50'
        }`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          
          <div className="text-center">
            <div className={`inline-block text-6xl mb-3 ${RARITY_CONFIG[rarity]?.glow || ''} shadow-lg rounded-full p-4 bg-white`}>
              {displayEmoji}
            </div>
            <div className={`text-sm font-medium ${RARITY_CONFIG[rarity]?.color} mb-1`}>
              {RARITY_CONFIG[rarity]?.badge || rarity}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{displayName}</h2>
            <p className="text-sm text-gray-500 mt-1">#{nft.tokenId}</p>
            
            {/* 状态标签 */}
            <div className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-sm ${STATUS_LABELS[status as AgentStatus]?.color || 'bg-gray-100 text-gray-600'}`}>
              <span>{STATUS_LABELS[status as AgentStatus]?.emoji || '❓'}</span>
              <span>{STATUS_LABELS[status as AgentStatus]?.label || status}</span>
            </div>
          </div>

          {/* 起源剧本 */}
          {origin && (
            <div className="mt-4 p-3 bg-white/60 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">起源剧本</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{origin.emoji}</span>
                <div>
                  <p className="font-medium text-gray-700">{origin.name}</p>
                  <p className="text-xs text-gray-400">{origin.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* 铸造者印记 */}
          {nft.minterAddress && (
            <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-xs text-purple-500 mb-1">🏷️ 铸造者印记</p>
              <p className="font-mono text-sm text-purple-700">
                {nft.minterAddress.slice(0, 8)}...{nft.minterAddress.slice(-6)}
              </p>
              <p className="text-xs text-purple-400 mt-1">铸造者拥有剧情投票权</p>
            </div>
          )}
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b">
          {[
            { key: 'story', label: '📖 故事线', count: storyEvents.length },
            { key: 'relations', label: '🔗 关系', count: relationships.length },
            { key: 'trade', label: '💰 交易', count: null },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                tab === t.key 
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label} {t.count !== null && `(${t.count})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-64 overflow-y-auto">
          {tab === 'story' && (
            <div className="space-y-4">
              {/* 人气统计 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.popularity}</p>
                  <p className="text-xs text-orange-500">人气值</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.dramaCount}</p>
                  <p className="text-xs text-purple-500">大事件</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.exposureCount}</p>
                  <p className="text-xs text-blue-500">曝光次数</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.tradeCount}</p>
                  <p className="text-xs text-green-500">交易次数</p>
                </div>
              </div>

              {/* 事件时间线 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">📅 角色历程</p>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-pink-200 to-gray-200" />
                  <div className="space-y-4">
                    {storyEvents.map((event, i) => (
                      <div key={event.id} className="relative flex gap-3 pl-10">
                        <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          EVENT_TYPE_CONFIG[event.type]?.bg || 'bg-gray-100'
                        }`}>
                          {EVENT_TYPE_CONFIG[event.type]?.emoji || '📌'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800 text-sm">{event.title}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${IMPORTANCE_CONFIG[event.importance]?.color || 'bg-gray-100 text-gray-600'}`}>
                              {IMPORTANCE_CONFIG[event.importance]?.label || event.importance}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(event.timestamp).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 预设剧情线 */}
              {origin?.storyArcs && origin.storyArcs.length > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">🎭 即将发生的剧情</p>
                  <div className="space-y-2">
                    {origin.storyArcs.map((arc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-purple-400">▶</span>
                        <span className="text-gray-700">{arc}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                          i === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {i === 0 ? '即将触发' : '待解锁'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'relations' && (
            <div className="space-y-3">
              {relationships.map(rel => (
                <div key={rel.agentId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{rel.agentEmoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{rel.agentName}</p>
                    <p className="text-xs text-gray-500">
                      {rel.lastEvent && <span>最近：{rel.lastEvent}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      rel.level > 0 ? 'text-green-600' : rel.level < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {rel.level > 0 ? '+' : ''}{rel.level}
                    </div>
                    {/* 关系条 */}
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          rel.level > 0 ? 'bg-green-400' : rel.level < 0 ? 'bg-red-400' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.abs(rel.level)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {relationships.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>暂无关系数据</p>
                  <p className="text-sm">角色尚未与其他角色互动</p>
                </div>
              )}
            </div>
          )}

          {tab === 'trade' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">当前价格</p>
                  <p className="text-xl font-bold text-purple-600">{nft.price || '0'} ETH</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">地板价</p>
                  <p className="text-xl font-bold text-green-600">0.02 ETH</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  💡 <strong>交易须知</strong><br/>
                  <span className="text-xs">
                    每次交易收取5%版税，其中2%归原铸造者，3%归平台
                  </span>
                </p>
              </div>

              {onListForSale && (
                <button
                  onClick={() => onListForSale(nft)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700"
                >
                  📤 挂单出售
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
