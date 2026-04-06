// 角色卡片 — 悬浮人物卡风格 (Premium 升级版)
// src/components/AgentCard.tsx
'use client';

import React from 'react';
import { Agent } from '@/types/agent';

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
  isSpeaking?: boolean;
  emotion?: 'neutral' | 'happy' | 'sad' | 'conflict' | 'romantic' | 'suspicious';
  onClick?: () => void;
  compact?: boolean;
}

const emotionColors = {
  neutral:    { color: '#4a4d5e', label: '平静' },
  happy:      { color: '#00ff88', label: '开心' },
  sad:        { color: '#3b82f6', label: '难过' },
  conflict:   { color: '#ff2d78', label: '冲突' },
  romantic:   { color: '#ff69b4', label: '暧昧' },
  suspicious: { color: '#ff9500', label: '怀疑' },
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isActive = false,
  isSpeaking = false,
  emotion = 'neutral',
  onClick,
  compact = false,
}) => {
  const { color, label } = emotionColors[emotion];

  // ── Compact sidebar mode ────────────────────────────────────────────
  if (compact) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`${agent.nameCN}，${agent.role}，${label}`}
        aria-pressed={isActive}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        className="relative floating-card rounded-chumen-lg cursor-pointer select-none"
        style={{
          padding: '10px 12px',
          transform: isActive ? 'scale(1.02)' : 'scale(1)',
          borderColor: isActive ? color : 'var(--border)',
          border: `1px solid ${isActive ? color : 'var(--border)'}`,
        }}
      >
        {/* Speaking pulse ring */}
        {isSpeaking && (
          <span
            className="absolute inset-0 rounded-chumen-lg pointer-events-none"
            style={{
              border: `2px solid ${color}`,
              opacity: 0.5,
              animation: 'glow-pulse 1.5s ease-in-out infinite',
            }}
          />
        )}

        <div className="flex items-center gap-3">
          {/* Avatar with emotion aura */}
          <div
            className={`relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-2xl
              transition-all duration-300 emotion-aura-${emotion}`}
            style={{
              background: 'var(--bg-elevated)',
              boxShadow: isSpeaking
                ? `0 0 0 2px ${color}40, 0 0 20px ${color}60`
                : `0 0 14px ${color}30`,
            }}
          >
            {agent.emoji}
            {/* NPC gold badge */}
            {agent.isNPC && (
              <span
                className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ffb800, #ff8c00)',
                  color: '#1a1000',
                  boxShadow: '0 0 8px rgba(255, 184, 0, 0.6)',
                  letterSpacing: '0.02em',
                }}
              >
                <span>★</span>
                <span>NFT</span>
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="text-sm font-display font-semibold text-chumen-text truncate"
                style={{ color: isActive ? color : undefined }}
              >
                {agent.nameCN}
              </span>
              {/* Emotion indicator — outer glow dot */}
              <span
                className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}`,
                }}
              />
            </div>
            <p className="text-xs text-chumen-text-muted truncate mt-0.5">{agent.role}</p>
          </div>
        </div>

        {/* Emotion tag strip at bottom */}
        {emotion !== 'neutral' && (
          <div
            className="mt-2 text-[9px] px-2 py-0.5 rounded-full font-mono font-medium text-center"
            style={{
              background: `${color}12`,
              color: color,
              border: `1px solid ${color}30`,
              letterSpacing: '0.08em',
            }}
          >
            {label.toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  // ── Expanded mode ─────────────────────────────────────────────────────
  return (
    <div
      onClick={onClick}
      className="floating-card rounded-chumen-lg cursor-pointer select-none"
      style={{
        borderColor: isActive ? color : 'var(--border)',
        border: `1px solid ${isActive ? color : 'var(--border)'}`,
      }}
    >
      {/* Emotion bar at top */}
      <div
        className="h-1 rounded-t-chumen-lg"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}60)`,
          boxShadow: `0 0 12px ${color}60`,
        }}
      />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-4xl flex-shrink-0
              emotion-aura-${emotion}`}
            style={{
              background: 'var(--bg-elevated)',
              boxShadow: `0 0 20px ${color}50, 0 0 40px ${color}20`,
            }}
          >
            {agent.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="font-display font-bold text-chumen-text"
                style={{ color: isActive ? color : undefined }}
              >
                {agent.nameCN}
              </h3>
              {agent.isNPC && (
                <span
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #ffb800, #ff8c00)',
                    color: '#1a1000',
                    boxShadow: '0 0 8px rgba(255, 184, 0, 0.5)',
                  }}
                >
                  <span>★</span>
                  <span>NFT</span>
                </span>
              )}
            </div>
            <p className="text-xs text-chumen-text-secondary mt-0.5">{agent.role}</p>

            {/* Emotion + Status */}
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `${color}15`,
                  color: color,
                  border: `1px solid ${color}35`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                />
                {label}
              </div>
              {isSpeaking && (
                <span
                  className="text-xs font-mono animate-pulse"
                  style={{ color, letterSpacing: '0.05em' }}
                >
                  ● SPEAKING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personality */}
        <p className="mt-3 text-sm text-chumen-text-secondary leading-relaxed">
          {agent.personality}
        </p>

        {/* Goals */}
        {agent.goals && agent.goals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {agent.goals.slice(0, 2).map((goal, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                🎯 {goal}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
