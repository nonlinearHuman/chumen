'use client';

import React, { useState } from 'react';
import SummonPanel from '@/components/SummonPanel';
import SummonResult from '@/components/SummonResult';
import AgentCollection from '@/components/AgentCollection';
import { ComposedSprite } from '@/types/traits';
import { useAgentStore } from '@/store/agentStore';

export default function AgentCreationPage() {
  const [activeTab, setActiveTab] = useState<'summon' | 'collection'>('summon');
  const [isSummoning, setIsSummoning] = useState(false);
  const [summonResult, setSummonResult] = useState<ComposedSprite | null>(null);
  
  const addAgent = useAgentStore((state) => state.addAgent);
  const stats = useAgentStore((state) => state.getStats());

  const handleSummon = async (result: ComposedSprite) => {
    setSummonResult(result);
    setIsSummoning(false);
  };

  const handleCollect = () => {
    if (summonResult) {
      addAgent(summonResult);
      setSummonResult(null);
    }
  };

  return (
    <div className="agent-creation-page min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            楚门World - Agent 创造系统
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              收藏: {stats.favorites} / {stats.total}
            </div>
          </div>
        </div>
      </header>

      {/* Tab切换 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'summon'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('summon')}
          >
            ✨ 召唤
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'collection'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('collection')}
          >
            📚 收藏 ({stats.total})
          </button>
        </div>

        {/* 内容区 */}
        <div className="content">
          {activeTab === 'summon' ? (
            <div className="max-w-md mx-auto">
              <SummonPanel
                onSummon={handleSummon}
                isSummoning={isSummoning}
              />
            </div>
          ) : (
            <AgentCollection />
          )}
        </div>
      </div>

      {/* 召唤结果弹窗 */}
      {summonResult && (
        <SummonResult
          result={summonResult}
          onClose={() => setSummonResult(null)}
          onCollect={handleCollect}
        />
      )}
    </div>
  );
}
