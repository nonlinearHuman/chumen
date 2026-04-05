// 精彩对话高亮组件
// src/components/HighlightDialogue.tsx

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
    <div className="flex gap-3 mb-3 animate-fade-in bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
      <div className="text-3xl">⭐</div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-yellow-700">{agent.nameCN}</span>
          <span className="text-xs text-yellow-500">精彩片段</span>
          <span className="text-xs text-gray-400">
            {new Date(dialogue.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-gray-700 mt-1">{dialogue.content}</p>
      </div>
    </div>
  );
};
