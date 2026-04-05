'use client';

import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  ACHIEVEMENTS,
  Achievement,
  CATEGORY_NAMES,
  CATEGORY_ORDER,
} from '@/data/achievements';

type Filter = 'all' | Achievement['category'];

interface AchievementPanelProps {
  onClose: () => void;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const { achievements, dialogues, dramaEvents, nftProgress, playStartTime, cumulativePlayTime } = useGameStore();

  const filteredAchievements = useMemo(() => {
    if (filter === 'all') return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(a => a.category === filter);
  }, [filter]);

  const unlockedCount = achievements.unlocked.length;
  const totalPoints = achievements.totalPoints;
  const totalAchievements = ACHIEVEMENTS.length;

  const getProgress = (achievement: Achievement): number => {
    if (achievements.unlocked.includes(achievement.id)) return 100;

    let current = 0;
    switch (achievement.requirement.type) {
      case 'dialogue_count':
        current = dialogues.length;
        break;
      case 'npc_trigger':
        current = achievements.npcTriggerCount;
        break;
      case 'scene_visit':
        current = achievements.visitedScenes.length;
        break;
      case 'event_count':
        current = dramaEvents.length;
        break;
      case 'nft_mint':
        current = nftProgress.mintedAgents.length;
        break;
      case 'play_time':
        current = cumulativePlayTime + (playStartTime ? Date.now() - playStartTime : 0);
        break;
      case 'legendary_spawn':
        current = achievements.progress.legendary_spawn || 0;
        break;
      default:
        current = achievements.progress[achievement.requirement.type] || 0;
    }

    return Math.min(100, (current / achievement.requirement.value) * 100);
  };

  const isUnlocked = (id: string) => achievements.unlocked.includes(id);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* 顶部装饰 */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 h-1.5" />

        {/* 头部 */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🏆 成就中心
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 总体统计 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-center">
              <div className="text-2xl font-bold text-amber-600">{unlockedCount}</div>
              <div className="text-xs text-amber-600/70">已解锁</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
              <div className="text-xs text-purple-600/70">成就点数</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalAchievements - unlockedCount}
              </div>
              <div className="text-xs text-blue-600/70">待解锁</div>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部 ({totalAchievements})
            </button>
            {CATEGORY_ORDER.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === cat
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {CATEGORY_NAMES[cat]} ({ACHIEVEMENTS.filter(a => a.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* 成就列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAchievements.map(achievement => {
            const unlocked = isUnlocked(achievement.id);
            const progress = getProgress(achievement);
            const isSecret = achievement.secret && !unlocked;

            return (
              <div
                key={achievement.id}
                className={`
                  relative rounded-xl border p-4 transition-all
                  ${unlocked
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                  }
                  ${isSecret ? 'opacity-80' : ''}
                `}
              >
                {/* 已解锁标签 */}
                {unlocked && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-amber-400 text-white rounded-full px-2 py-0.5 font-medium">
                      +{achievement.points}pt
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* 图标 */}
                  <div
                    className={`
                      flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                      ${unlocked ? 'bg-white shadow-sm' : 'bg-gray-200 grayscale opacity-50'}
                    `}
                  >
                    {isSecret ? '❓' : achievement.icon}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm mb-0.5 ${unlocked ? 'text-amber-900' : 'text-gray-500'}`}>
                      {isSecret ? '???' : achievement.title}
                    </h3>
                    <p className={`text-xs mb-2 ${unlocked ? 'text-amber-700' : 'text-gray-400'}`}>
                      {isSecret ? '隐藏成就' : achievement.description}
                    </p>

                    {/* 进度条（未解锁时显示） */}
                    {!unlocked && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>进度</span>
                          <span>
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 text-right">
                          {(() => {
                            let current = 0;
                            switch (achievement.requirement.type) {
                              case 'dialogue_count': current = dialogues.length; break;
                              case 'npc_trigger': current = achievements.npcTriggerCount; break;
                              case 'scene_visit': current = achievements.visitedScenes.length; break;
                              case 'event_count': current = dramaEvents.length; break;
                              case 'nft_mint': current = nftProgress.mintedAgents.length; break;
                              case 'play_time': current = cumulativePlayTime + (playStartTime ? Date.now() - playStartTime : 0); break;
                              default: current = achievements.progress[achievement.requirement.type] || 0;
                            }
                            if (achievement.requirement.value > 1000) {
                              return `${Math.floor(current / 60000)}min / ${Math.floor(achievement.requirement.value / 60000)}min`;
                            }
                            return `${Math.round(current)} / ${achievement.requirement.value}`;
                          })()}
                        </p>
                      </div>
                    )}

                    {/* 已解锁显示奖励 */}
                    {unlocked && achievement.reward && (
                      <p className="text-xs text-amber-600/80 italic">
                        奖励: {achievement.reward.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
