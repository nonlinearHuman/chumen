// 电影感头部导航栏 — Premium 升级版
// 包含: REC● 指示器 + Logo + 胶片风格场景选择器 + 浮动胶囊Tab + 快捷操作
'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  { id: 'chat'  as const, label: '会话',    emoji: '💬' },
  { id: 'pixel' as const, label: '像素世界', emoji: '🎮' },
  { id: 'nft'   as const, label: 'NFT',      emoji: '💎' },
];

// Scene atmosphere accent colors
const sceneAccents: Record<string, string> = {
  coffee_shop:    '#c4a882',
  hospital:       '#a8c4d4',
  court:          '#8b7355',
  office:         '#00d4ff',
  apartment:      '#c4a882',
  street:         '#d4b896',
  media_office:   '#ff8c00',
  police_station: '#4a90c4',
};

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
  const [showScenePicker, setShowScenePicker] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentSceneData = scenes.find(s => s.id === currentScene);
  const accentColor = sceneAccents[currentScene] ?? '#00d4ff';
  const dailyProgress = dailyChallenges > 0 ? dailyCompleted / dailyChallenges : 0;

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowScenePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSave = () => {
    onSave();
    setSaveMsg('已保存');
    setTimeout(() => setSaveMsg(null), 2000);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[64px]"
      style={{
        background: 'rgba(10, 11, 15, 0.82)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.3)`,
      }}
    >
      {/* Scene atmosphere accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
          transition: 'background 0.6s ease',
        }}
      />

      <div className={`flex items-center justify-between h-full ${isMobile ? 'px-3' : 'px-6'}`}>

        {/* ── Left: Logo + LiveIndicator + Scene Selector ── */}
        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <LiveIndicator status={liveStatus} size="sm" />

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="font-display font-bold text-lg text-chumen-text hidden sm:block tracking-wide">
              楚门
            </span>
          </div>

          {/* Scene Selector — Filmstrip style */}
          {onSceneChange && (
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowScenePicker(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-body transition-all
                  hover:brightness-110 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${accentColor}50`,
                  color: 'var(--text-primary)',
                  boxShadow: `0 0 10px ${accentColor}20`,
                }}
              >
                <span style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}>
                  {currentSceneData?.emoji}
                </span>
                <span className="hidden sm:inline">{currentSceneData?.name}</span>
                {/* Animated chevron */}
                <span
                  className="text-xs transition-transform duration-200"
                  style={{ transform: showScenePicker ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  ▼
                </span>
              </button>

              {/* Filmstrip picker panel */}
              {showScenePicker && (
                <div
                  className="absolute top-full left-0 mt-2 p-3 rounded-xl z-50 animate-fade-in-up"
                  style={{
                    background: 'rgba(18, 20, 28, 0.95)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                    minWidth: '320px',
                  }}
                >
                  <p
                    className="text-[10px] font-mono uppercase tracking-widest mb-3"
                    style={{ color: 'rgba(139,143,168,0.7)', letterSpacing: '0.15em' }}
                  >
                    ── SELECT SCENE ──
                  </p>
                  {/* Horizontal filmstrip grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {scenes.map(scene => {
                      const sc = sceneAccents[scene.id] ?? '#00d4ff';
                      const isSelected = scene.id === currentScene;
                      return (
                        <button
                          key={scene.id}
                          onClick={() => {
                            onSceneChange(scene.id);
                            setShowScenePicker(false);
                          }}
                          className="filmstrip-card text-left"
                          style={{
                            background: isSelected
                              ? `${sc}18`
                              : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isSelected ? sc : 'rgba(255,255,255,0.06)'}`,
                            boxShadow: isSelected ? `0 0 0 1px ${sc}, 0 0 16px ${sc}30` : 'none',
                          }}
                        >
                          <div className="p-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xl"
                                style={{ filter: isSelected ? `drop-shadow(0 0 6px ${sc})` : 'none' }}
                              >
                                {scene.emoji}
                              </span>
                              <div>
                                <p
                                  className="text-xs font-display font-semibold leading-tight"
                                  style={{ color: isSelected ? sc : 'var(--text-primary)' }}
                                >
                                  {scene.name}
                                </p>
                                <p
                                  className="text-[10px] mt-0.5 leading-tight"
                                  style={{ color: 'rgba(139,143,168,0.6)' }}
                                >
                                  {scene.description.slice(0, 18)}…
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Active indicator bar */}
                          {isSelected && (
                            <div
                              className="h-0.5 w-full"
                              style={{ background: `linear-gradient(90deg, ${sc}, transparent)` }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Center: Floating Capsule Tab Switcher ── */}
        <div
          className="flex items-center gap-1 p-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {tabConfig.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-display font-medium
                  transition-all duration-200 hover:brightness-110"
                style={{
                  background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                  color: isActive ? '#00d4ff' : 'rgba(139,143,168,0.8)',
                  boxShadow: isActive
                    ? '0 0 12px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : 'none',
                  textShadow: isActive ? '0 0 10px rgba(0,212,255,0.4)' : 'none',
                }}
              >
                <span>{tab.emoji}</span>
                {!isMobile && <span>{tab.label}</span>}
                {/* Active pill indicator */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      border: '1px solid rgba(0,212,255,0.4)',
                      boxShadow: '0 0 8px rgba(0,212,255,0.2)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Right: Quick Actions ── */}
        <div className="flex items-center gap-2">
          {/* Daily Challenge */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display transition-all
              hover:brightness-110 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${dailyProgress === 1 ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: dailyProgress === 1 ? '#00ff88' : 'rgba(139,143,168,0.8)',
              boxShadow: dailyProgress === 1 ? '0 0 8px rgba(0,255,136,0.2)' : 'none',
            }}
          >
            <span>🎯</span>
            <span className="font-mono">{dailyCompleted}/{dailyChallenges}</span>
            {dailyProgress === 1 && (
              <span className="text-[10px]" style={{ color: '#00ff88' }}>✓</span>
            )}
          </button>

          {/* Achievements */}
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display transition-all
              hover:brightness-110 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,184,0,0.3)',
              color: 'rgba(139,143,168,0.8)',
            }}
          >
            <span>🏆</span>
            <span style={{ color: '#ffb800' }}>{achievementsUnlocked}</span>
            <span style={{ color: 'rgba(139,143,168,0.5)' }}>/{achievementsTotal}</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Action icons */}
          {[
            { emoji: '🔗', title: '关系图谱', onClick: onOpenRelationships, sm: true },
            { emoji: '📜', title: '时间线',   onClick: onOpenTimeline,   sm: true },
            { emoji: '💾', title: '保存',     onClick: handleSave,       sm: false },
            { emoji: '⚙️', title: '设置',     onClick: onOpenSettings,   sm: false },
          ].map(({ emoji, title, onClick, sm }) => (
            sm && isMobile ? null : (
              <button
                key={title}
                onClick={onClick}
                title={title}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all
                  hover:brightness-110 active:scale-90"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(139,143,168,0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {emoji}
              </button>
            )
          ))}
        </div>
      </div>

      {/* Save toast */}
      {saveMsg && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
            px-3 py-1 rounded-full text-xs font-display animate-fade-in-up"
          style={{
            background: 'rgba(18, 20, 28, 0.95)',
            border: `1px solid ${accentColor}`,
            color: accentColor,
            boxShadow: `0 0 12px ${accentColor}30`,
          }}
        >
          💾 {saveMsg}
        </div>
      )}
    </header>
  );
};
