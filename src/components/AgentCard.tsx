// Agent 卡片组件
// src/components/AgentCard.tsx

import React from 'react';
import { Agent } from '@/types/agent';

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
  onClick?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        p-4 rounded-lg cursor-pointer transition-all
        ${isActive 
          ? 'bg-purple-100 border-2 border-purple-500 shadow-lg' 
          : 'bg-gray-50 border border-gray-200 hover:border-purple-300'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl">{agent.emoji}</span>
        <div>
          <h3 className="font-bold text-gray-800">{agent.nameCN}</h3>
          <p className="text-sm text-gray-500">{agent.role}</p>
          {agent.isNPC && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
              NPC
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
        {agent.personality}
      </p>
    </div>
  );
};
