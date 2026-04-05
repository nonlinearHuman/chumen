// 对话气泡组件 - 带心情
// src/components/DialogueBubble.tsx

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
    <div className="flex gap-3 mb-3 animate-fade-in">
      <div className="relative">
        <span className="text-3xl">{agent.emoji}</span>
        {mood && (
          <span className="absolute -bottom-1 -right-1 text-sm">
            {moodEmojis[mood]}
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-purple-700">{agent.nameCN}</span>
          {agent.isNPC && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
              NPC
            </span>
          )}
          <span className="text-xs text-gray-400">
            {new Date(dialogue.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm mt-1 border border-gray-100">
          <p className="text-gray-700">{dialogue.content}</p>
        </div>
      </div>
    </div>
  );
};
