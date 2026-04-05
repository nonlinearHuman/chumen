'use client';

// 故事面板 UI 组件
// src/components/StoryPanel.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
  StoryEvent, 
  Relationship, 
  EVENT_TYPE_DESC,
  EVENT_IMPACT 
} from '@/types/story';
import { getAgentById } from '@/config/agents';

// ===== 事件卡片 =====
interface EventCardProps {
  event: StoryEvent;
  isActive?: boolean;
  onClose?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isActive, onClose }) => {
  const typeInfo = EVENT_TYPE_DESC[event.type];
  const participants = event.participants
    .map(id => getAgentById(id))
    .filter(Boolean);

  return (
    <div
      className={`
        relative rounded-xl p-4 mb-3
        transition-all duration-500 ease-out
        ${isActive 
          ? 'bg-gradient-to-r from-gray-900/95 to-gray-800/95 border-2 border-opacity-50 scale-105 shadow-2xl' 
          : 'bg-gray-900/80 border border-gray-700/50'
        }
      `}
      style={{
        borderColor: isActive ? typeInfo.color : undefined,
        borderLeftColor: typeInfo.color,
        borderLeftWidth: '4px',
      }}
    >
      {/* 事件类型标签 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{typeInfo.icon}</span>
        <span 
          className="text-sm font-bold px-2 py-1 rounded"
          style={{ backgroundColor: typeInfo.color + '30', color: typeInfo.color }}
        >
          {typeInfo.nameCN}
        </span>
        <span className="text-xs text-gray-500 ml-auto">
          {new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* 参与者 */}
      <div className="flex items-center gap-2 mb-2">
        {participants.map((agent, index) => (
          <React.Fragment key={agent!.id}>
            <span className="text-lg">{agent!.emoji}</span>
            <span className="text-white font-medium">{agent!.nameCN}</span>
            {index < participants.length - 1 && (
              <span className="text-gray-500 mx-1">
                {event.type === 'romance' ? '💕' : event.type === 'conflict' ? '⚔️' : '&'}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 事件描述 */}
      <p className="text-gray-300 text-sm mb-3">{event.content}</p>

      {/* 对话展示 */}
      {event.dialogue && event.dialogue.length > 0 && (
        <div className="space-y-2 mb-3">
          {event.dialogue.map((d, i) => {
            const agent = getAgentById(d.characterId);
            return (
              <div 
                key={i}
                className="flex items-start gap-2 bg-gray-800/50 rounded-lg p-2"
              >
                <span>{agent?.emoji || '💬'}</span>
                <div className="flex-1">
                  <span className="text-xs text-gray-500 mr-2">{d.characterName}</span>
                  <span className="text-white text-sm">{d.content}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 关闭按钮 */}
      {isActive && onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ===== 关系图谱 =====
interface RelationshipGraphProps {
  relationships: Relationship[];
  onRelationshipClick?: (rel: Relationship) => void;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ relationships, onRelationshipClick }) => {
  const nodes = useMemo(() => {
    const nodeSet = new Set<string>();
    relationships.forEach(rel => {
      nodeSet.add(rel.characterA);
      nodeSet.add(rel.characterB);
    });
    return Array.from(nodeSet).map(id => getAgentById(id)).filter(Boolean);
  }, [relationships]);

  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 80;
    const centerX = 120;
    const centerY = 120;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-700/50">
      <h3 className="text-white font-bold mb-3 text-sm">🤝 关系网络</h3>
      <svg width="240" height="240" className="mx-auto">
        {/* 关系连线 */}
        {relationships.map((rel, index) => {
          const aIndex = nodes.findIndex(n => n?.id === rel.characterA);
          const bIndex = nodes.findIndex(n => n?.id === rel.characterB);
          if (aIndex === -1 || bIndex === -1) return null;

          const posA = getNodePosition(aIndex, nodes.length);
          const posB = getNodePosition(bIndex, nodes.length);

          const color = rel.sentiment > 30 ? '#27ae60' : rel.sentiment < -30 ? '#e74c3c' : '#95a5a6';
          const width = Math.max(1, rel.strength / 30);

          return (
            <line
              key={rel.id}
              x1={posA.x}
              y1={posA.y}
              x2={posB.x}
              y2={posB.y}
              stroke={color}
              strokeWidth={width}
              opacity={0.6}
              onClick={() => onRelationshipClick?.(rel)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}

        {/* 角色节点 */}
        {nodes.map((node, index) => {
          const pos = getNodePosition(index, nodes.length);
          return (
            <g key={node!.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={16}
                fill="#1a1a2e"
                stroke="#4a90d9"
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fontSize="14"
              >
                {node!.emoji}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 图例 */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span className="text-gray-400">友好</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-500"></div>
          <span className="text-gray-400">敌对</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-gray-500"></div>
          <span className="text-gray-400">中立</span>
        </div>
      </div>
    </div>
  );
};

// ===== 事件时间线 =====
interface EventTimelineProps {
  events: StoryEvent[];
  onEventClick?: (event: StoryEvent) => void;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events, onEventClick }) => {
  return (
    <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-700/50 max-h-80 overflow-y-auto">
      <h3 className="text-white font-bold mb-3 text-sm">📜 事件时间线</h3>
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">暂无事件</p>
        ) : (
          events.map(event => {
            const typeInfo = EVENT_TYPE_DESC[event.type];
            return (
              <div
                key={event.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => onEventClick?.(event)}
              >
                <span>{typeInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{event.content}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(event.timestamp).toLocaleTimeString('zh-CN')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ===== 关系详情面板 =====
interface RelationshipDetailProps {
  relationship: Relationship;
  onClose: () => void;
}

const RelationshipDetail: React.FC<RelationshipDetailProps> = ({ relationship, onClose }) => {
  const agentA = getAgentById(relationship.characterA);
  const agentB = getAgentById(relationship.characterB);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">关系详情</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl mb-1">{agentA?.emoji}</div>
            <div className="text-white font-medium">{agentA?.nameCN}</div>
          </div>
          <div className="text-2xl">
            {relationship.sentiment > 30 ? '❤️' : relationship.sentiment < -30 ? '💔' : '🤝'}
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">{agentB?.emoji}</div>
            <div className="text-white font-medium">{agentB?.nameCN}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">关系类型</span>
              <span className="text-white font-medium">{relationship.type}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">情感值</span>
              <span className="text-white font-medium">{relationship.sentiment}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${(relationship.sentiment + 100) / 2}%`,
                  backgroundColor: relationship.sentiment > 30 ? '#27ae60' : relationship.sentiment < -30 ? '#e74c3c' : '#95a5a6'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">关系强度</span>
              <span className="text-white font-medium">{relationship.strength}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${relationship.strength}%` }}
              />
            </div>
          </div>

          {relationship.history.length > 0 && (
            <div>
              <div className="text-gray-400 text-sm mb-2">最近互动</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {relationship.history.slice(-5).reverse().map((h, i) => {
                  const typeInfo = EVENT_TYPE_DESC[h.type];
                  return (
                    <div key={i} className="text-xs flex items-center gap-2">
                      <span>{typeInfo.icon}</span>
                      <span className="text-gray-300 flex-1">{h.description}</span>
                      <span className={h.change > 0 ? 'text-green-500' : 'text-red-500'}>
                        {h.change > 0 ? '+' : ''}{h.change}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== 主面板 =====
interface StoryPanelProps {
  currentEvent: StoryEvent | null;
  recentEvents: StoryEvent[];
  relationships: Relationship[];
  onEventClose?: () => void;
}

const StoryPanel: React.FC<StoryPanelProps> = ({
  currentEvent,
  recentEvents,
  relationships,
  onEventClose,
}) => {
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'relations'>('events');

  return (
    <div className="w-80 flex flex-col gap-4">
      {/* 当前事件 */}
      {currentEvent && (
        <EventCard
          event={currentEvent}
          isActive
          onClose={onEventClose}
        />
      )}

      {/* 标签切换 */}
      <div className="flex gap-2">
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('events')}
        >
          📜 事件
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'relations'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('relations')}
        >
          🤝 关系
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === 'events' ? (
        <EventTimeline
          events={recentEvents}
          onEventClick={(event) => console.log('Event clicked:', event)}
        />
      ) : (
        <RelationshipGraph
          relationships={relationships}
          onRelationshipClick={setSelectedRelationship}
        />
      )}

      {/* 关系详情弹窗 */}
      {selectedRelationship && (
        <RelationshipDetail
          relationship={selectedRelationship}
          onClose={() => setSelectedRelationship(null)}
        />
      )}
    </div>
  );
};

export default StoryPanel;

// 导出子组件供单独使用
export { EventCard, RelationshipGraph, EventTimeline, RelationshipDetail };
