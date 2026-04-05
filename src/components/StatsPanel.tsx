'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';

export const StatsPanel: React.FC<{ onClose: () => void; onShare?: (type: 'stats', data: any) => void }> = ({ onClose, onShare }) => {
  const { getStats } = useGameStore();
  const stats = getStats();

  // 格式化时间显示
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📊 游戏统计</h2>
          <div className="flex items-center gap-2">
            {onShare && (
              <button
                onClick={() => {
                  const hours = Math.floor(stats.totalPlayTime / 3600000);
                  const mins = Math.floor((stats.totalPlayTime % 3600000) / 60000);
                  onShare('stats', {
                    dialogues: stats.totalDialogues,
                    events: stats.totalEvents,
                    playTime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
                    achievements: stats.achievementsUnlocked,
                  });
                }}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                📤 分享
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>

        {/* 对话统计 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">💬 对话</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="总对话数" value={stats.totalDialogues} icon="💬" />
            <StatCard label="剧情事件" value={stats.totalEvents} icon="🎭" />
          </div>
        </section>

        {/* 探索统计 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🗺️ 探索</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="访问场景" value={stats.visitedScenes.length} icon="🗺️" />
            <StatCard label="NPC触发" value={stats.npcTriggers} icon="🗣️" />
          </div>
          {/* 场景访问进度条 */}
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-1">场景完成度</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(stats.visitedScenes.length / 9) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{stats.visitedScenes.length} / 9 场景</div>
          </div>
        </section>

        {/* 时间统计 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">⏰ 时间</h3>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="总时长" value={formatTime(stats.totalPlayTime)} icon="⏱️" />
            <StatCard label="游戏次数" value={stats.sessionsCount} icon="🎮" />
            <StatCard label="最长游戏" value={formatTime(stats.longestSession)} icon="🏆" />
          </div>
        </section>

        {/* 成就统计 */}
        <section>
          <h3 className="text-lg font-semibold mb-3">🏆 成就</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="已解锁" value={`${stats.achievementsUnlocked}/16`} icon="🔓" />
            <StatCard label="成就点数" value={stats.achievementPoints} icon="⭐" />
          </div>
        </section>
      </div>
    </div>
  );
};

// 小型统计卡片组件
const StatCard: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-gray-50 rounded-xl p-3 text-center">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xl font-bold text-gray-800">{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);
