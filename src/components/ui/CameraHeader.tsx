// 电影感头部导航栏
// 包含: REC● 指示器 + Logo + 场景选择器 + Tab切换 + 快捷操作
'use client';

import React, { useState } from 'react';
import { LiveIndicator, LiveStatus } from '@/components/ui/LiveIndicator';
import { scenes } from '@/config/scenes';

interface CameraHeaderProps {
  activeTab: 'chat' | 'pixel' | 'nft';
  onTabChange: (tab: 'chat' | 'pixel' | 'nft') => void;
  liveStatus: LiveStatus;
  currentScene?: string;
  onSceneChange?: (scene: string) => void;
  achievementsTotal: number;
  achievementsUnlocked: number;
  dailyChallenges: number;
  dailyCompleted: number;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenRelationships: () => void;
  onOpenTimeline: () => void;
  onSave: () => void;
  isMobile?: boolean;
}

const tabConfig = [
  { id: 'chat' as const, label: '会话', emoji: '💬' },
  { id: 'pixel' as const, label: '像素世界', emoji: '🎮' },
  { id: 'nft' as const, label: 'NFT', emoji: '💎' },
];

export const CameraHeader: React.FC<CameraHeaderProps> = ({
  activeTab,
  onTabChange,
  liveStatus,
  currentScene = 'cafe',
  onSceneChange,
  achievementsTotal,
  achievementsUnlocked,
  dailyChallenges,
  dailyCompleted,
  onOpenAchievements,
  onOpenSettings,
  onOpenStats,
  onOpenRelationships,
  onOpenTimeline,
  onSave,
  isMobile = false,
}) => {
  const [showSceneDropdown, setShowSceneDropdown] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const currentSceneData = scenes.find(s => s.id === currentScene);
  const dailyProgress = dailyChallenges > 0 ? dailyCompleted / dailyChallenges : 0;

  const handleSave = () => {
    onSave();
    setSaveMsg('已保存');
    setTimeout(() => setSaveMsg(null), 2000);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[64px]"
      style={{
        background: 'rgba(10, 11, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid transparent',
        backgroundImage: 'linear-gradient(var(--bg-deep), var(--bg-deep)), linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta), var(--accent-cyan))',
        backgroundOrigin: 'padding-box, border-box',
        backgroundClip: 'padding-box, border-box',
        borderImage: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta), var(--accent-cyan)) 1',
      }}
    >
      <div className={`flex items-center justify-between h-full ${isMobile ? 'px-3' : 'px-6'}`}>
        
        {/* Left: Logo + LiveIndicator + SceneSelector */}
        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <LiveIndicator status={liveStatus} size="sm" />

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="font-display font-bold text-lg text-chumen-text hidden sm:block">
              楚门
            </span>
          </div>

          {/* Scene Selector */}
          {onSceneChange && (
            <div className="relative">
              <button
                onClick={() => setShowSceneDropdown(!showSceneDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-chumen-sm text-sm font-body
                  bg-chumen-surface border border-chumen-border text-chumen-text-secondary
                  hover:border-chumen-border-active transition-colors"
              >
                <span>{currentSceneData?.emoji}</span>
                <span className="hidden sm:inline">{currentSceneData?.name}</span>
                <span className="text-xs opacity-60">▼</span>
              </button>

              {showSceneDropdown && (
                <div
                  className="absolute top-full left-0 mt-1 py-1 rounded-chumen-md z-50 animate-fade-in-up"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)',
                    minWidth: '160px',
                  }}
                >
                  {scenes.map(scene => (
                    <button
                      key={scene.id}
                      onClick={() => {
                        onSceneChange(scene.id);
                        setShowSceneDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors
                        ${currentScene === scene.id
                          ? 'text-chumen-cyan bg-chumen-cyan/10'
                          : 'text-chumen-text-secondary hover:text-chumen-text hover:bg-chumen-glass'
                        }`}
                    >
                      <span>{scene.emoji}</span>
                      <span>{scene.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-chumen-md" style={{ background: 'var(--bg-surface)' }}>
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-chumen-sm text-sm font-display font-medium transition-all
                ${activeTab === tab.id
                  ? 'text-chumen-cyan'
                  : 'text-chumen-text-secondary hover:text-chumen-text'
                }`}
              style={
                activeTab === tab.id
                  ? { background: 'rgba(0, 212, 255, 0.12)' }
                  : {}
              }
            >
              <span>{tab.emoji}</span>
              {!isMobile && <span>{tab.label}</span>}
            </button>
          ))}
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Daily Challenge Progress */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-2 py-1 rounded-chumen-sm text-xs font-display
              bg-chumen-surface border border-chumen-border
              hover:border-chumen-border-active transition-colors"
          >
            <span>🎯</span>
            <span className="text-chumen-text-secondary">
              {dailyCompleted}/{dailyChallenges}
            </span>
            {dailyProgress === 1 && (
              <span className="text-emotion-happy text-[10px]">✓</span>
            )}
          </button>

          {/* Achievements */}
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 px-2 py-1 rounded-chumen-sm text-xs font-display
              bg-chumen-surface border border-chumen-border
              hover:border-chumen-border-active transition-colors"
          >
            <span>🏆</span>
            <span className="text-chumen-gold font-bold">{achievementsTotal}</span>
            <span className="text-chumen-text-muted">({achievementsUnlocked}/{achievementsTotal})</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-chumen-border" />

          {/* More Actions */}
          <button
            onClick={onOpenRelationships}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-chumen-sm
              bg-chumen-surface border border-chumen-border text-chumen-text-secondary
              hover:border-chumen-border-active hover:text-chumen-text transition-colors"
            title="关系图谱"
          >
            🔗
          </button>

          <button
            onClick={onOpenTimeline}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-chumen-sm
              bg-chumen-surface border border-chumen-border text-chumen-text-secondary
              hover:border-chumen-border-active hover:text-chumen-text transition-colors"
            title="时间线"
          >
            📜
          </button>

          <button
            onClick={handleSave}
            className="flex items-center justify-center w-8 h-8 rounded-chumen-sm
              bg-chumen-surface border border-chumen-border text-chumen-text-secondary
              hover:border-chumen-border-active hover:text-chumen-text transition-colors"
            title="保存"
          >
            💾
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center w-8 h-8 rounded-chumen-sm
              bg-chumen-surface border border-chumen-border text-chumen-text-secondary
              hover:border-chumen-border-active hover:text-chumen-text transition-colors"
            title="设置"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Save confirmation toast */}
      {saveMsg && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
            px-3 py-1 rounded-chumen-sm text-xs font-display
            animate-fade-in-up"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent-cyan)',
            color: 'var(--accent-cyan)',
          }}
        >
          💾 {saveMsg}
        </div>
      )}
    </header>
  );
};
