// 每日挑战面板
// src/components/DailyPanel.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'dialogue' | 'event' | 'explore' | 'social' | 'nft';
  target: number;
  reward: {
    type: 'badge' | 'title' | 'points';
    value: number | string;
  };
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily_dialogue_10',
    title: '今日对话',
    description: '观看10条AI对话',
    icon: '💬',
    type: 'dialogue',
    target: 10,
    reward: { type: 'points', value: 10 },
  },
  {
    id: 'daily_event_3',
    title: '今日剧情',
    description: '触发3次剧情事件',
    icon: '🎭',
    type: 'event',
    target: 3,
    reward: { type: 'points', value: 20 },
  },
  {
    id: 'daily_explore',
    title: '探索者',
    description: '访问2个不同场景',
    icon: '🗺️',
    type: 'explore',
    target: 2,
    reward: { type: 'points', value: 15 },
  },
  {
    id: 'daily_npc',
    title: '社交达人',
    description: '触发5次NPC事件',
    icon: '🗣️',
    type: 'social',
    target: 5,
    reward: { type: 'points', value: 25 },
  },
];

export interface LoginReward {
  day: number;
  reward: {
    type: 'badge' | 'title' | 'points';
    value: number | string;
  };
}

export const LOGIN_REWARDS: LoginReward[] = [
  { day: 1, reward: { type: 'points', value: 5 } },
  { day: 3, reward: { type: 'badge', value: '三日老兵' } },
  { day: 7, reward: { type: 'points', value: 50 } },
  { day: 14, reward: { type: 'badge', value: '双周玩家' } },
  { day: 30, reward: { type: 'title', value: '铁杆粉丝' } },
];

interface DailyPanelProps {
  onClose: () => void;
}

export function DailyPanel({ onClose }: DailyPanelProps) {
  const {
    dailyState,
    claimChallengeReward,
    claimLoginReward,
    dismissDailyPanel,
  } = useGameStore();

  const [showRewardAnimation, setShowRewardAnimation] = useState<string | null>(null);

  // 获取今日挑战进度
  const getProgress = (challenge: DailyChallenge) => {
    switch (challenge.type) {
      case 'dialogue':
        return dailyState.todayProgress.dialogueCount;
      case 'event':
        return dailyState.todayProgress.eventCount;
      case 'explore':
        return dailyState.todayProgress.scenesVisited;
      case 'social':
        return dailyState.todayProgress.npcTriggerCount;
      default:
        return 0;
    }
  };

  // 检查挑战是否完成
  const isChallengeCompleted = (challenge: DailyChallenge) => {
    return dailyState.completedChallenges.includes(challenge.id);
  };

  // 检查奖励是否已领取
  const isRewardClaimed = (challengeId: string) => {
    return dailyState.claimedRewards.includes(challengeId);
  };

  // 领取挑战奖励
  const handleClaimChallenge = (challenge: DailyChallenge) => {
    claimChallengeReward(challenge.id);
    setShowRewardAnimation(challenge.id);
    setTimeout(() => setShowRewardAnimation(null), 1500);
  };

  // 领取登录奖励
  const handleClaimLogin = (day: number) => {
    claimLoginReward(day);
  };

  // 检查是否可领取登录奖励
  const canClaimLoginReward = (day: number) => {
    return dailyState.loginStreak >= day && !dailyState.claimedRewards.includes(`login_${day}`);
  };

  // 渲染奖励图标
  const renderRewardIcon = (reward: { type: string; value: string | number }) => {
    switch (reward.type) {
      case 'points':
        return <span className="text-yellow-500">⭐ {reward.value}</span>;
      case 'badge':
        return <span className="text-purple-500">🏅 {reward.value}</span>;
      case 'title':
        return <span className="text-blue-500">👑 {reward.value}</span>;
      default:
        return null;
    }
  };

  // 获取连续登录徽章
  const getLoginStreakBadge = () => {
    const streak = dailyState.loginStreak;
    if (streak >= 30) return { emoji: '💎', label: '铁杆粉丝', color: 'bg-blue-100 text-blue-700' };
    if (streak >= 14) return { emoji: '🥇', label: '双周玩家', color: 'bg-yellow-100 text-yellow-700' };
    if (streak >= 7) return { emoji: '🏆', label: '周冠军', color: 'bg-orange-100 text-orange-700' };
    if (streak >= 3) return { emoji: '🎖️', label: '三日老兵', color: 'bg-green-100 text-green-700' };
    return { emoji: '📅', label: `${streak}天`, color: 'bg-gray-100 text-gray-700' };
  };

  const badge = getLoginStreakBadge();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">🎯 每日挑战</h2>
              <p className="text-sm opacity-80 mt-1">
                {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* 连续登录徽章 */}
          <div className="mt-4 flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full ${badge.color}`}>
              <span className="text-lg mr-1">{badge.emoji}</span>
              <span className="font-bold text-sm">{badge.label}</span>
            </div>
            <div className="text-sm">
              <span className="opacity-80">连续登录</span>
              <span className="font-bold ml-1">{dailyState.loginStreak}</span>
              <span className="opacity-80">天</span>
            </div>
          </div>
        </div>

        {/* 登录奖励 */}
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            🎁 登录奖励
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {LOGIN_REWARDS.map((loginReward) => {
              const claimed = dailyState.claimedRewards.includes(`login_${loginReward.day}`);
              const canClaim = canClaimLoginReward(loginReward.day);
              return (
                <div
                  key={loginReward.day}
                  className={`
                    relative p-2 rounded-lg text-center cursor-pointer transition-all
                    ${claimed ? 'bg-green-100 border-2 border-green-300' : 
                      canClaim ? 'bg-yellow-100 border-2 border-yellow-300 hover:bg-yellow-200 animate-pulse' : 
                      'bg-gray-50 border border-gray-200'}
                  `}
                  onClick={() => canClaim && !claimed && handleClaimLogin(loginReward.day)}
                >
                  <div className="text-xs text-gray-500">第{loginReward.day}天</div>
                  <div className="text-sm mt-1">
                    {renderRewardIcon(loginReward.reward)}
                  </div>
                  {claimed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {canClaim && !claimed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-white text-xs">!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 每日挑战列表 */}
        <div className="p-4">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            📋 今日挑战
          </h3>
          <div className="space-y-3">
            {DAILY_CHALLENGES.map((challenge) => {
              const progress = getProgress(challenge);
              const completed = isChallengeCompleted(challenge);
              const claimed = isRewardClaimed(challenge.id);
              const percent = Math.min((progress / challenge.target) * 100, 100);

              return (
                <div
                  key={challenge.id}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${completed && claimed ? 'bg-gray-50 border-gray-200' : 
                      completed ? 'bg-green-50 border-green-300' : 
                      'bg-white border-gray-200'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{challenge.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-800">{challenge.title}</h4>
                        {renderRewardIcon(challenge.reward)}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{challenge.description}</p>
                      
                      {/* 进度条 */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{progress}/{challenge.target}</span>
                          <span>{Math.round(percent)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`
                              h-full rounded-full transition-all duration-500
                              ${completed ? 'bg-green-500' : 'bg-purple-500'}
                            `}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* 领取按钮 */}
                      {completed && !claimed && (
                        <button
                          onClick={() => handleClaimChallenge(challenge)}
                          className={`
                            mt-3 w-full py-2 rounded-lg font-bold transition-all
                            ${showRewardAnimation === challenge.id 
                              ? 'bg-green-500 text-white scale-95' 
                              : 'bg-purple-500 hover:bg-purple-600 text-white'}
                          `}
                        >
                          {showRewardAnimation === challenge.id ? '✓ 已领取!' : '🎁 领取奖励'}
                        </button>
                      )}
                      
                      {claimed && (
                        <div className="mt-3 py-2 rounded-lg bg-green-100 text-green-600 text-center font-bold text-sm">
                          ✓ 已完成
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400 text-center">
            💡 挑战进度将在每日凌晨重置
          </p>
        </div>
      </div>
    </div>
  );
}
