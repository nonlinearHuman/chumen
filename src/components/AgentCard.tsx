// AI 角色卡片组件 - 楚门World 新设计
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
  neutral: '#4a4d5e',
  happy: '#00ff88',
  sad: '#3b82f6',
  conflict: '#ff2d78',
  romantic: '#ff69b4',
  suspicious: '#ff9500',
};

const emotionLabels = {
  neutral: '平静',
  happy: '开心',
  sad: '难过',
  conflict: '冲突中',
  romantic: '暧昧',
  suspicious: '怀疑',
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isActive = false,
  isSpeaking = false,
  emotion = 'neutral',
  onClick,
  compact = false,
}) => {
  const emotionColor = emotionColors[emotion];

  if (compact) {
    // Compact mode for sidebar list
    return (
      <div
        onClick={onClick}
        className="relative flex items-center gap-3 p-3 rounded-chumen-lg cursor-pointer transition-all duration-200"
        style={{
          background: isActive ? 'var(--bg-elevated)' : 'var(--bg-surface)',
          border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border)'}`,
          boxShadow: isActive ? 'var(--glow-cyan)' : 'none',
          transform: isActive ? 'none' : 'none',
        }}
      >
        {/* Speaking indicator ring */}
        {isSpeaking && (
          <div
            className="absolute inset-0 rounded-chumen-lg animate-glow-pulse pointer-events-none"
            style={{ border: `2px solid ${emotionColor}`, opacity: 0.4 }}
          />
        )}

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
            style={{
              boxShadow: `0 0 12px ${emotionColor}40`,
            }}
          >
            {agent.emoji}
          </div>
          {/* NPC badge */}
          {agent.isNPC && (
            <div
              className="absolute -top-1 -right-1 px-1 py-0.5 rounded text-[8px] font-bold text-black"
              style={{ background: 'var(--accent-gold)' }}
            >
              NPC
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-display font-semibold text-chumen-text truncate">
              {agent.nameCN}
            </span>
            {/* Emotion indicator */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: emotionColor }}
              title={emotionLabels[emotion]}
            />
          </div>
          <p className="text-xs text-chumen-text-muted truncate">{agent.role}</p>
        </div>

        {/* Emotion label */}
        {emotion !== 'neutral' && (
          <div
            className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
            style={{
              background: `${emotionColor}15`,
              color: emotionColor,
              border: `1px solid ${emotionColor}40`,
            }}
          >
            {emotionLabels[emotion]}
          </div>
        )}
      </div>
    );
  }

  // Expanded mode
  return (
    <div
      onClick={onClick}
      className="rounded-chumen-lg cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border)'}`,
        boxShadow: isActive ? 'var(--glow-cyan)' : 'var(--shadow-sm)',
      }}
    >
      {/* Emotion bar at top */}
      <div className="h-1 rounded-t-chumen-lg" style={{ backgroundColor: emotionColor }} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-4xl flex-shrink-0"
            style={{
              boxShadow: `0 0 16px ${emotionColor}50`,
              background: 'var(--bg-elevated)',
            }}
          >
            {agent.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-chumen-text">{agent.nameCN}</h3>
              {agent.isNPC && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{ background: 'var(--accent-gold)', color: '#000' }}
                >
                  NPC
                </span>
              )}
            </div>
            <p className="text-xs text-chumen-text-secondary mt-0.5">{agent.role}</p>

            {/* Emotion + Status */}
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: `${emotionColor}15`,
                  color: emotionColor,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: emotionColor }}
                />
                {emotionLabels[emotion]}
              </div>
              {isSpeaking && (
                <span className="text-xs text-chumen-cyan animate-pulse">说话中...</span>
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
          <div className="flex flex-wrap gap-1 mt-3">
            {agent.goals.slice(0, 2).map((goal, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs"
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
