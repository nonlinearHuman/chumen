// 楚门World — BottomBar（沉浸式底部控制栏）
// Phase 2 重构
'use client';

import React, { useState } from 'react';
import { Scene } from '@/types/agent';

interface BottomBarProps {
  isPlaying: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentScene: Scene;
  onSceneChange: (scene: Scene) => void;
  scenes: Scene[];
  dialogueCount: number;
  onNPCTrigger: () => void;
  accentColor?: string;
}

const SPEED_OPTIONS = [
  { label: '0.5×', value: 10000, description: '慢速' },
  { label: '1×', value: 5000, description: '标准' },
  { label: '2×', value: 2500, description: '快速' },
  { label: '3×', value: 1500, description: '极速' },
];

// Subtle accent line decoration
const BottomAccentLine: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
    style={{
      background: `linear-gradient(90deg, transparent 0%, ${color}30 30%, ${color}30 70%, transparent 100%)`,
    }}
  />
);

export const BottomBar: React.FC<BottomBarProps> = ({
  isPlaying,
  speed,
  onSpeedChange,
  currentScene,
  onSceneChange,
  scenes,
  dialogueCount,
  onNPCTrigger,
  accentColor = '#00d4ff',
}) => {
  const [showScenePicker, setShowScenePicker] = useState(false);
  const [activeSpeedIdx, setActiveSpeedIdx] = useState(1); // default 1x

  const handleSpeedChange = (val: number, idx: number) => {
    onSpeedChange(val);
    setActiveSpeedIdx(idx);
  };

  return (
    <div
      className="relative px-4 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-4"
      style={{
        background: 'rgba(8, 9, 14, 0.9)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        boxShadow: `0 -1px 0 rgba(255,255,255,0.03) inset, 0 -4px 20px rgba(0,0,0,0.35)`,
      }}
    >
      <BottomAccentLine color={accentColor} />

      {/* Scene selector — clean pill style */}
      <div className="relative">
        <button
          onClick={() => setShowScenePicker(p => !p)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{
            background: showScenePicker
              ? `${accentColor}18`
              : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showScenePicker ? `${accentColor}50` : 'rgba(255,255,255,0.07)'}`,
            color: 'var(--text-primary)',
          }}
        >
          <span
            className="text-base"
            style={{ filter: `drop-shadow(0 0 4px ${accentColor}80)` }}
          >
            {currentScene.emoji}
          </span>
          <span className="text-xs font-display font-medium hidden sm:block">
            {currentScene.name}
          </span>
          <span
            className="text-[10px] transition-transform duration-200"
            style={{ transform: showScenePicker ? 'rotate(180deg)' : 'none', color: accentColor }}
          >
            ▾
          </span>
        </button>

        {/* Scene picker dropdown */}
        {showScenePicker && (
          <div
            className="absolute bottom-full left-0 mb-2 w-52 rounded-xl overflow-hidden z-50 animate-fade-in-up"
            style={{
              background: 'rgba(18,20,28,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.2em' }}
            >
              ── SCENES ──
            </div>
            {scenes.map(scene => {
              const isActive = scene.id === currentScene.id;
              return (
                <button
                  key={scene.id}
                  onClick={() => { onSceneChange(scene); setShowScenePicker(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:brightness-110"
                  style={{
                    background: isActive ? `${accentColor}12` : 'transparent',
                    borderLeft: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                  }}
                >
                  <span className="text-base flex-shrink-0">{scene.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-display font-medium truncate"
                      style={{ color: isActive ? accentColor : 'var(--text-primary)' }}
                    >
                      {scene.name}
                    </p>
                    {!isActive && (
                      <p
                        className="text-[10px] truncate"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {scene.description}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Speed control — film reel style */}
      <div className="flex items-center gap-1">
        <span
          className="text-[10px] font-mono uppercase tracking-wider hidden sm:block"
          style={{ color: 'rgba(139,143,168,0.5)', letterSpacing: '0.1em' }}
        >
          SPD
        </span>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {SPEED_OPTIONS.map(({ label, value }, idx) => {
            const isActive = activeSpeedIdx === idx;
            return (
              <button
                key={value}
                onClick={() => handleSpeedChange(value, idx)}
                className="px-2 sm:px-3 py-1.5 text-xs font-mono font-medium transition-all relative"
                style={{
                  background: isActive
                    ? `${accentColor}20`
                    : 'transparent',
                  color: isActive ? accentColor : 'rgba(139,143,168,0.6)',
                  borderRight: idx < SPEED_OPTIONS.length - 1
                    ? '1px solid rgba(255,255,255,0.06)'
                    : 'none',
                }}
              >
                {label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status pill — center */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-display font-medium"
          style={{
            background: isPlaying
              ? 'rgba(255,45,120,0.12)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isPlaying ? 'rgba(255,45,120,0.3)' : 'rgba(255,255,255,0.07)'}`,
            color: isPlaying ? '#ff2d78' : 'rgba(139,143,168,0.5)',
            boxShadow: isPlaying ? '0 0 10px rgba(255,45,120,0.2)' : 'none',
          }}
        >
          <span
            className={isPlaying ? 'animate-recording-pulse text-sm' : 'text-sm'}
          >
            {isPlaying ? '●' : '○'}
          </span>
          <span className="hidden sm:block">
            {isPlaying ? '直播中' : '已暂停'}
          </span>
          <span
            className="font-mono text-[10px]"
            style={{ color: 'rgba(139,143,168,0.4)' }}
          >
            {dialogueCount}条
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        {/* NPC trigger — dice roll style */}
        <button
          onClick={onNPCTrigger}
          disabled={!isPlaying}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display
            disabled:opacity-30 transition-all hover:brightness-110 active:scale-95"
          style={{
            background: 'rgba(255,184,0,0.08)',
            border: '1px solid rgba(255,184,0,0.2)',
            color: '#ffb800',
          }}
        >
          {/* Dice dots decoration */}
          <div className="relative w-4 h-4">
            <span className="text-sm">🎲</span>
          </div>
          <span className="hidden sm:block">NPC介入</span>
          {!isPlaying && (
            <div
              className="absolute inset-0 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            />
          )}
        </button>

        {/* Stats shortcut */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display
            transition-all hover:brightness-110 active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'var(--text-secondary)',
          }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('chumen:toggle-stats'));
          }}
        >
          <span>📊</span>
          <span className="hidden sm:block">统计</span>
        </button>

        {/* Relationships shortcut */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display
            transition-all hover:brightness-110 active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'var(--text-secondary)',
          }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('chumen:toggle-relationships'));
          }}
        >
          <span>🤝</span>
          <span className="hidden sm:block">关系</span>
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
