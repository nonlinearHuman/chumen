'use client';

import React, { useState } from 'react';
import { ComposedSprite, Rarity, RARITY_CONFIG } from '@/types/traits';

interface SummonPanelProps {
  onSummon: (result: ComposedSprite) => void;
  isSummoning: boolean;
}

const SUMMON_COSTS = {
  normal: { tokens: 100, label: '普通召唤' },
  premium: { tokens: 500, label: '高级召唤' },
  legendary: { tokens: 2000, label: '传说召唤' },
};

export default function SummonPanel({ onSummon, isSummoning }: SummonPanelProps) {
  const [selectedType, setSelectedType] = useState<'normal' | 'premium' | 'legendary'>('normal');

  const handleSummon = async () => {
    try {
      const response = await fetch('/api/summon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType }),
      });

      const data = await response.json();
      
      if (data.success && data.agent) {
        onSummon(data.agent);
      }
    } catch (error) {
      console.error('Summon failed:', error);
    }
  };

  return (
    <div className="summon-panel">
      <h2 className="text-2xl font-bold mb-6 text-center">✨ Agent 召唤 ✨</h2>
      
      {/* 召唤类型选择 */}
      <div className="summon-types grid grid-cols-3 gap-4 mb-6">
        {(Object.keys(SUMMON_COSTS) as Array<keyof typeof SUMMON_COSTS>).map((type) => (
          <button
            key={type}
            className={`summon-type-btn p-4 rounded-lg border-2 transition-all ${
              selectedType === type
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setSelectedType(type)}
          >
            <div className="text-lg font-semibold">{SUMMON_COSTS[type].label}</div>
            <div className="text-sm text-gray-600 mt-1">
              💎 {SUMMON_COSTS[type].tokens} 代币
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {type === 'normal' && '基础概率'}
              {type === 'premium' && '+20% 稀有度'}
              {type === 'legendary' && '+50% 稀有度'}
            </div>
          </button>
        ))}
      </div>

      {/* 稀有度概率表 */}
      <div className="rarity-table mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">稀有度概率</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(RARITY_CONFIG).map(([rarity, config]) => (
            <div key={rarity} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="capitalize">{rarity}</span>
              <span className="text-gray-500 ml-auto">
                {(config.probability * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 召唤按钮 */}
      <button
        className={`summon-btn w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
          isSummoning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
        }`}
        onClick={handleSummon}
        disabled={isSummoning}
      >
        {isSummoning ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            召唤中...
          </span>
        ) : (
          `召唤 Agent 💎 ${SUMMON_COSTS[selectedType].tokens}`
        )}
      </button>

      {/* 提示信息 */}
      <p className="text-xs text-gray-500 text-center mt-4">
        召唤的Agent将永久保存在你的收藏中
      </p>
    </div>
  );
}
