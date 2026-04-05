// 对话气泡组件 - 楚门World 新设计
// src/components/DialogueBubble.tsx
'use client';

import React from 'react';
import { Dialogue } from '@/types/agent';
import { getAgentById } from '@/config/agents';
import { moodEmojis, Mood } from '@/types/mood';

interface DialogueBubbleProps {
  dialogue: Dialogue;
  mood?: Mood['mood'];
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({ dialogue, mood }) => {
  const agent = getAgentById(dialogue.agentId);

  if (!agent) return null;

  return (
    <div className="flex gap-3 mb-3 animate-fade-in-up">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: '0 0 12px rgba(0, 212, 255, 0.2)',
          }}
        >
          {agent.emoji}
        </div>
        {mood && (
          <span className="absolute -bottom-1 -right-1 text-sm">
            {moodEmojis[mood]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display font-semibold text-chumen-text">{agent.nameCN}</span>
          {agent.isNPC && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--accent-gold)', color: '#000' }}
            >
              NPC
            </span>
          )}
          <span className="text-xs font-mono text-chumen-text-muted">
            {new Date(dialogue.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Bubble */}
        <div
          className="rounded-chumen-lg p-3 border"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border)',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {dialogue.content}
          </p>
        </div>
      </div>
    </div>
  );
};
