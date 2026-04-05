// 精彩对话高亮组件 - 楚门World 新设计
// src/components/HighlightDialogue.tsx
'use client';

import React from 'react';
import { Dialogue } from '@/types/agent';
import { getAgentById } from '@/config/agents';

interface HighlightDialogueProps {
  dialogue: Dialogue;
}

// 精彩对话关键词
const HIGHLIGHT_KEYWORDS = [
  '喜欢', '爱', '暗恋', '表白', '告白',
  '生气', '愤怒', '讨厌', '恨', '滚',
  '秘密', '真相', '调查', '证据', '线索',
  '融资', '投资', '钱', '交易',
  '失踪', '死亡', '案件', '警察',
];

export const isHighlightDialogue = (content: string): boolean => {
  return HIGHLIGHT_KEYWORDS.some(keyword => content.includes(keyword));
};

export const HighlightDialogue: React.FC<HighlightDialogueProps> = ({ dialogue }) => {
  const agent = getAgentById(dialogue.agentId);

  if (!agent) return null;

  return (
    <div
      className="flex gap-3 mb-3 animate-fade-in-up rounded-chumen-lg p-3 border-l-4 animate-drama-pulse"
      style={{
        background: 'rgba(255, 45, 120, 0.06)',
        borderLeftColor: 'var(--accent-magenta)',
        borderTopColor: 'var(--border)',
        borderRightColor: 'var(--border)',
        borderBottomColor: 'var(--border)',
      }}
    >
      {/* Drama icon */}
      <div className="text-2xl flex-shrink-0">🔥</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display font-bold" style={{ color: 'var(--accent-magenta)' }}>
            {agent.nameCN}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{
              background: 'rgba(255, 45, 120, 0.15)',
              color: 'var(--accent-magenta)',
            }}
          >
            DRAMA!
          </span>
          <span className="text-xs font-mono text-chumen-text-muted">
            {new Date(dialogue.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Bubble */}
        <div
          className="rounded-chumen-md p-3 border"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'rgba(255, 45, 120, 0.3)',
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
