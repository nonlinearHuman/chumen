// 排行榜组件
// src/components/Leaderboard.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLeaderboardStore, LeaderboardType, LeaderboardEntry } from '@/store/leaderboardStore';
import { useGameStore } from '@/store/gameStore';
import { Trophy, Crown, Medal, X, ChevronDown, Users, Globe, Calendar } from 'lucide-react';

interface LeaderboardProps {
  onClose: () => void;
}

const TABS: { type: LeaderboardType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'global', label: '总榜', icon: Globe },
  { type: 'weekly', label: '周榜', icon: Calendar },
  { type: 'friends', label: '好友榜', icon: Users },
];

// 格式化游戏时长
const formatPlayTime = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  if (hours >= 24) {
    return `${Math.floor(hours / 24)}天${hours % 24}h`;
  }
  return `${hours}h`;
};

// 排名图标
const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return <Crown className="w-5 h-5" style={{ color: '#fbbf24' }} />;
  }
  if (rank === 2) {
    return <Medal className="w-5 h-5" style={{ color: '#9ca3af' }} />;
  }
  if (rank === 3) {
    return <Medal className="w-5 h-5" style={{ color: '#f97316' }} />;
  }
  return (
    <span 
      className="text-sm font-mono"
      style={{ color: rank <= 10 ? '#00d4ff' : '#8b8fa8' }}
    >
      {rank}
    </span>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global');
  const listRef = useRef<HTMLDivElement>(null);
  
  const {
    globalLeaderboard,
    weeklyLeaderboard,
    friendsLeaderboard,
    isLoading,
    hasMore,
    currentPlayerId,
    loadLeaderboard,
    loadMore,
    generateMockData,
  } = useLeaderboardStore();
  
  const { achievements, cumulativePlayTime, playStartTime } = useGameStore();

  // 获取当前激活的排行榜数据
  const getActiveLeaderboard = useCallback((): LeaderboardEntry[] => {
    switch (activeTab) {
      case 'global':
        return globalLeaderboard;
      case 'weekly':
        return weeklyLeaderboard;
      case 'friends':
        return friendsLeaderboard;
    }
  }, [activeTab, globalLeaderboard, weeklyLeaderboard, friendsLeaderboard]);

  // 初始化加载数据
  useEffect(() => {
    if (getActiveLeaderboard().length === 0) {
      generateMockData();
    }
  }, []);

  // 更新当前玩家分数
  useEffect(() => {
    const currentPlayTime = cumulativePlayTime + (playStartTime ? Date.now() - playStartTime : 0);
    useLeaderboardStore.getState().updateScore(
      achievements.totalPoints,
      achievements.unlocked.length,
      currentPlayTime
    );
  }, [achievements.totalPoints, achievements.unlocked.length, cumulativePlayTime, playStartTime]);

  // 滚动加载更多
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl || activeTab === 'friends') return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listEl;
      if (scrollHeight - scrollTop - clientHeight < 200 && !isLoading && hasMore) {
        loadMore(activeTab);
      }
    };

    listEl.addEventListener('scroll', handleScroll);
    return () => listEl.removeEventListener('scroll', handleScroll);
  }, [activeTab, isLoading, hasMore, loadMore]);

  const leaderboard = getActiveLeaderboard();
  const playerRank = useLeaderboardStore.getState().getPlayerRank(activeTab);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(10,11,15,0.85)' }}
        onClick={onClose}
      />

      {/* 面板 */}
      <div 
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, #1a1d28 0%, #12141c 100%)',
          border: '1px solid rgba(0,212,255,0.2)',
          boxShadow: '0 0 40px rgba(0,212,255,0.15), 0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* 顶部装饰线 */}
        <div 
          className="h-0.5 w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)' }}
        />

        {/* 头部 */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-xl font-bold flex items-center gap-2"
              style={{ 
                color: '#00d4ff',
                fontFamily: "'Space Grotesk', sans-serif",
                textShadow: '0 0 20px rgba(0,212,255,0.3)',
              }}
            >
              <Trophy className="w-6 h-6" />
              排行榜
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-125"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#8b8fa8',
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 标签切换 */}
          <div className="flex gap-2">
            {TABS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeTab === type ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeTab === type ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: activeTab === type ? '#00d4ff' : '#8b8fa8',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 排行榜列表 */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {leaderboard.length === 0 && !isLoading && (
            <div className="text-center py-12" style={{ color: '#8b8fa8' }}>
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无排行数据</p>
            </div>
          )}

          {leaderboard.map((entry) => {
            const isCurrentPlayer = entry.playerId === currentPlayerId;
            return (
              <div
                key={entry.playerId}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  background: isCurrentPlayer 
                    ? 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 100%)'
                    : 'rgba(18,20,28,0.6)',
                  border: `1px solid ${isCurrentPlayer ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isCurrentPlayer ? '0 0 16px rgba(0,212,255,0.2)' : 'none',
                }}
              >
                {/* 排名 */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <RankBadge rank={entry.rank} />
                </div>

                {/* 头像 */}
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isCurrentPlayer ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {entry.avatar}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p 
                      className="text-sm font-medium truncate"
                      style={{ color: isCurrentPlayer ? '#00d4ff' : '#e8e8f0' }}
                    >
                      {entry.playerName}
                    </p>
                    {isCurrentPlayer && (
                      <span 
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(0,212,255,0.2)',
                          color: '#00d4ff',
                        }}
                      >
                        你
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#8b8fa8' }}>
                    <span>🏆 {entry.achievements}</span>
                    <span>⏰ {formatPlayTime(entry.playTime)}</span>
                  </div>
                </div>

                {/* 分数 */}
                <div className="flex-shrink-0 text-right">
                  <p 
                    className="text-sm font-bold"
                    style={{ 
                      color: entry.rank <= 3 ? '#fbbf24' : '#e8e8f0',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {entry.score.toLocaleString()}
                  </p>
                  <p className="text-[10px]" style={{ color: '#4a4d5e' }}>积分</p>
                </div>
              </div>
            );
          })}

          {/* 加载更多提示 */}
          {isLoading && (
            <div className="text-center py-4" style={{ color: '#8b8fa8' }}>
              <ChevronDown className="w-5 h-5 mx-auto animate-bounce" />
            </div>
          )}

          {/* 自己的排名（如果在列表外） */}
          {playerRank && playerRank > 50 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 100%)',
                  border: '1px solid rgba(0,212,255,0.4)',
                }}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-mono" style={{ color: '#00d4ff' }}>{playerRank}</span>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(0,212,255,0.3)',
                  }}
                >
                  {useLeaderboardStore.getState().currentPlayerAvatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#00d4ff' }}>你的排名</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
