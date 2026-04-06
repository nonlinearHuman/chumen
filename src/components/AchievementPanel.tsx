'use client';

import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  ACHIEVEMENTS,
  Achievement,
  CATEGORY_NAMES,
  CATEGORY_ORDER,
} from '@/data/achievements';
import {
  MessageSquare,
  Users,
  Map,
  Diamond,
  Star,
  Trophy,
  Lock,
  Sparkles,
  Share2,
  X,
} from 'lucide-react';

type Filter = 'all' | Achievement['category'];

// 稀有度配置
const RARITY_CONFIG = {
  common: { color: '#9ca3af', glow: 'none', label: '普通' },
  uncommon: { color: '#22c55e', glow: '0 0 8px rgba(34,197,94,0.4)', label: '罕见' },
  rare: { color: '#3b82f6', glow: '0 0 12px rgba(59,130,246,0.5)', label: '稀有' },
  epic: { color: '#a855f7', glow: '0 0 16px rgba(168,85,247,0.6)', label: '史诗' },
  legendary: { color: '#f97316', glow: '0 0 20px rgba(249,115,22,0.7)', label: '传奇' },
  mythic: { color: '#fbbf24', glow: '0 0 24px rgba(251,191,36,0.8)', label: '神话' },
};

// 根据成就点数计算稀有度
const getRarity = (points: number): keyof typeof RARITY_CONFIG => {
  if (points >= 200) return 'mythic';
  if (points >= 150) return 'legendary';
  if (points >= 100) return 'epic';
  if (points >= 50) return 'rare';
  if (points >= 20) return 'uncommon';
  return 'common';
};

// 分类图标映射
const CATEGORY_ICONS: Record<Achievement['category'], React.ComponentType<{ className?: string }>> = {
  story: MessageSquare,
  social: Users,
  explore: Map,
  nft: Diamond,
  special: Star,
};

interface AchievementPanelProps {
  onClose: () => void;
  onShare?: (type: 'achievement', data: any) => void;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ onClose, onShare }) => {
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
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(10,11,15,0.85)' }}
        onClick={onClose}
      />

      {/* 面板 */}
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, #1a1d28 0%, #12141c 100%)',
          border: '1px solid rgba(255,184,0,0.2)',
          boxShadow: '0 0 40px rgba(255,184,0,0.15), 0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* 顶部装饰线 */}
        <div 
          className="h-0.5 w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #ffb800, transparent)' }}
        />

        {/* 头部 */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-xl font-bold flex items-center gap-2"
              style={{ 
                color: '#ffb800',
                fontFamily: "'Space Grotesk', sans-serif",
                textShadow: '0 0 20px rgba(255,184,0,0.3)',
              }}
            >
              <Trophy className="w-6 h-6" />
              成就中心
            </h2>
            <div className="flex items-center gap-2">
              {onShare && (
                <button
                  onClick={() => {
                    const unlockedAchievements = ACHIEVEMENTS.filter(a => achievements.unlocked.includes(a.id));
                    onShare('achievement', {
                      icon: '🏆',
                      title: `已解锁 ${unlockedAchievements.length} 个成就`,
                      description: unlockedAchievements.map(a => `${a.icon} ${a.title}`).join(' | ') || '暂无成就',
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    color: '#a855f7',
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  分享全部
                </button>
              )}
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
          </div>

          {/* 总体统计 */}
          <div className="grid grid-cols-3 gap-3">
            <div 
              className="rounded-xl px-3 py-3 text-center"
              style={{
                background: 'rgba(255,184,0,0.08)',
                border: '1px solid rgba(255,184,0,0.2)',
              }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: '#ffb800', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {unlockedCount}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,184,0,0.7)' }}>已解锁</div>
            </div>
            <div 
              className="rounded-xl px-3 py-3 text-center"
              style={{
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.2)',
              }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: '#a855f7', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {totalPoints}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(168,85,247,0.7)' }}>成就点数</div>
            </div>
            <div 
              className="rounded-xl px-3 py-3 text-center"
              style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
              }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: '#3b82f6', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {unlockedCount}/{totalAchievements}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(59,130,246,0.7)' }}>收集进度</div>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('all')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: filter === 'all' ? 'rgba(255,184,0,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === 'all' ? 'rgba(255,184,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === 'all' ? '#ffb800' : '#8b8fa8',
              }}
            >
              全部 ({totalAchievements})
            </button>
            {CATEGORY_ORDER.map(cat => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                  style={{
                    background: filter === cat ? 'rgba(255,184,0,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${filter === cat ? 'rgba(255,184,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: filter === cat ? '#ffb800' : '#8b8fa8',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {CATEGORY_NAMES[cat]} ({ACHIEVEMENTS.filter(a => a.category === cat).length})
                </button>
              );
            })}
          </div>
        </div>

        {/* 成就列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAchievements.map(achievement => {
            const unlocked = isUnlocked(achievement.id);
            const progress = getProgress(achievement);
            const isSecret = achievement.secret && !unlocked;
            const rarity = getRarity(achievement.points);
            const rarityConfig = RARITY_CONFIG[rarity];

            return (
              <div
                key={achievement.id}
                className="relative rounded-xl p-4 transition-all duration-300"
                style={{
                  background: unlocked 
                    ? `linear-gradient(135deg, rgba(255,184,0,0.08) 0%, rgba(18,20,28,0.95) 100%)`
                    : 'rgba(18,20,28,0.6)',
                  border: `1px solid ${unlocked ? `${rarityConfig.color}40` : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: unlocked ? rarityConfig.glow : 'none',
                  opacity: isSecret ? 0.7 : 1,
                }}
              >
                {/* 已解锁标签 */}
                {unlocked && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span 
                      className="text-xs rounded-full px-2 py-0.5 font-medium"
                      style={{
                        background: `${rarityConfig.color}20`,
                        color: rarityConfig.color,
                        border: `1px solid ${rarityConfig.color}40`,
                      }}
                    >
                      +{achievement.points}pt
                    </span>
                    {onShare && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare('achievement', {
                            icon: achievement.icon,
                            title: achievement.title,
                            description: achievement.description,
                            rarity: rarityConfig.label,
                          });
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:brightness-125"
                        style={{
                          background: 'rgba(168,85,247,0.15)',
                          color: '#a855f7',
                        }}
                        title="分享成就"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* 图标徽章 */}
                  <div 
                    className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl relative"
                    style={{
                      background: unlocked ? `${rarityConfig.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${unlocked ? `${rarityConfig.color}30` : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: unlocked ? rarityConfig.glow : 'none',
                    }}
                  >
                    {isSecret ? (
                      <Lock className="w-6 h-6" style={{ color: '#4a4d5e' }} />
                    ) : (
                      <>
                        <span style={{ filter: unlocked ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                          {achievement.icon}
                        </span>
                        {unlocked && rarity !== 'common' && (
                          <Sparkles 
                            className="absolute -top-1 -right-1 w-4 h-4 animate-pulse motion-reduce:animate-none"
                            style={{ color: rarityConfig.color }}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 
                        className="font-bold text-sm"
                        style={{ color: unlocked ? rarityConfig.color : '#8b8fa8' }}
                      >
                        {isSecret ? '???' : achievement.title}
                      </h3>
                      {unlocked && (
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: `${rarityConfig.color}20`,
                            color: rarityConfig.color,
                          }}
                        >
                          {rarityConfig.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-2" style={{ color: unlocked ? '#e8e8f0' : '#4a4d5e' }}>
                      {isSecret ? '隐藏成就' : achievement.description}
                    </p>

                    {/* 进度条（未解锁时显示） */}
                    {!unlocked && !isSecret && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs" style={{ color: '#8b8fa8' }}>
                          <span>进度</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div 
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${progress}%`,
                              background: `linear-gradient(90deg, ${rarityConfig.color}80, ${rarityConfig.color})`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-right" style={{ color: '#4a4d5e' }}>
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
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,184,0,0.7)' }}>
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
