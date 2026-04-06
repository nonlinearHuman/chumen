'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export interface TimelineEvent {
  id: string;
  type: 'dialogue' | 'conflict' | 'romance' | 'investigation' | 'npc' | 'major';
  title: string;
  description: string;
  timestamp: number;
  agents?: string[]; // agent IDs involved
  relationshipChange?: { agentA: string; agentB: string; delta: number };
}

interface StoryTimelineProps {
  events?: TimelineEvent[];
  maxHeight?: string;
}

const EVENT_TYPE_CONFIG = {
  dialogue: {
    icon: '💬',
    label: '对话',
    color: '#00d4ff',
    bgColor: 'rgba(0,212,255,0.08)',
    borderColor: 'rgba(0,212,255,0.3)',
  },
  conflict: {
    icon: '🔥',
    label: '冲突',
    color: '#ff2d78',
    bgColor: 'rgba(255,45,120,0.08)',
    borderColor: 'rgba(255,45,120,0.4)',
  },
  romance: {
    icon: '💕',
    label: '浪漫',
    color: '#ff69b4',
    bgColor: 'rgba(255,105,180,0.08)',
    borderColor: 'rgba(255,105,180,0.4)',
  },
  investigation: {
    icon: '🔍',
    label: '调查',
    color: '#ffb800',
    bgColor: 'rgba(255,184,0,0.08)',
    borderColor: 'rgba(255,184,0,0.3)',
  },
  npc: {
    icon: '👵',
    label: 'NPC',
    color: '#ffb800',
    bgColor: 'rgba(255,184,0,0.08)',
    borderColor: 'rgba(255,184,0,0.4)',
  },
  major: {
    icon: '⚡',
    label: '重大',
    color: '#ffffff',
    bgColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
};

export const StoryTimeline: React.FC<StoryTimelineProps> = ({
  events,
  maxHeight = '60vh',
}) => {
  const storeEvents = useGameStore((state) => state.dramaEvents);
  const dialogues = useGameStore((state) => state.dialogues);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Build timeline events from store
  const timelineEvents: TimelineEvent[] = events ?? [
    // Convert dramaEvents
    ...storeEvents.map(e => ({
      id: `drama-${e.id}`,
      type: (e.type === 'conflict' ? 'conflict' : 'major') as TimelineEvent['type'],
      title: e.trigger || e.type,
      description: e.content,
      timestamp: Date.now(),
    })),
    // Convert recent dialogues
    ...dialogues.slice(-30).map(d => ({
      id: `dialogue-${d.id}`,
      type: 'dialogue' as const,
      title: '新对话',
      description: d.content,
      timestamp: d.timestamp,
      agents: d.agentId ? [d.agentId] : undefined,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return '今天';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return '昨天';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // Group by date
  const grouped = timelineEvents.reduce((acc, event) => {
    const dateKey = formatDate(event.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const isMajor = (type: TimelineEvent['type']) => type === 'major';
  const config = (type: TimelineEvent['type']) => EVENT_TYPE_CONFIG[type];

  if (timelineEvents.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12"
        style={{ maxHeight }}
      >
        <span className="text-4xl mb-3 opacity-30">📜</span>
        <p className="text-sm" style={{ color: '#4a4d5e' }}>
          暂无剧情记录
        </p>
        <p className="text-xs mt-1" style={{ color: '#2a2d3a' }}>
          故事即将开始...
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-y-auto scrollbar-hide"
      style={{
        maxHeight,
        padding: '4px 0',
      }}
    >
      {Object.entries(grouped).map(([date, dayEvents]) => (
        <div key={date} className="mb-6">
          {/* Date separator */}
          <div className="flex items-center gap-3 mb-4 px-2">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.2)',
                color: '#00d4ff',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {date}
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Events */}
          <div className="relative px-2">
            {/* Vertical timeline line */}
            <div
              className="absolute left-[19px] top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, transparent, var(--border) 10%, var(--border) 90%, transparent)' }}
            />

            <div className="space-y-3">
              {dayEvents.map((event, idx) => {
                const typeConfig = config(event.type);
                const isExpanded = expandedId === event.id;
                const isEventMajor = isMajor(event.type);

                return (
                  <div
                    key={event.id}
                    className={`
                      relative flex gap-4
                      animate-fade-in-up
                    `}
                    style={{
                      animationDelay: `${idx * 0.04}s`,
                      opacity: 0,
                    }}
                  >
                    {/* Timeline node */}
                    <div className="flex-shrink-0 relative z-10">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          text-lg
                          ${isEventMajor ? 'animate-major-pulse' : ''}
                        `}
                        style={{
                          background: typeConfig.bgColor,
                          border: `2px solid ${typeConfig.borderColor}`,
                          boxShadow: isEventMajor
                            ? `0 0 0 4px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.3)`
                            : `0 0 12px ${typeConfig.color}30`,
                        }}
                      >
                        {typeConfig.icon}
                      </div>
                    </div>

                    {/* Event card */}
                    <div
                      className={`
                        flex-1 rounded-xl p-4 cursor-pointer
                        transition-all duration-250
                        hover:translate-x-1
                      `}
                      style={{
                        background: typeConfig.bgColor,
                        border: `1px solid ${typeConfig.borderColor}`,
                        boxShadow: isEventMajor
                          ? '0 0 20px rgba(255,255,255,0.15)'
                          : 'var(--shadow-sm)',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {/* Type badge */}
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: `${typeConfig.color}20`,
                              color: typeConfig.color,
                              fontFamily: "'Space Grotesk', sans-serif",
                              border: `1px solid ${typeConfig.color}40`,
                            }}
                          >
                            {typeConfig.label}
                          </span>

                          {/* Major event pulse indicator */}
                          {isEventMajor && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full animate-pulse"
                              style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: '#ffffff',
                                border: '1px solid rgba(255,255,255,0.3)',
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              ⚡ 重大事件
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span
                          className="text-xs flex-shrink-0"
                          style={{
                            color: '#4a4d5e',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {formatTime(event.timestamp)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        className="font-semibold mb-1"
                        style={{
                          color: '#e8e8f0',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {event.title}
                      </h4>

                      {/* Description */}
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: '#8b8fa8',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical' as const,
                        }}
                      >
                        {event.description}
                      </p>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div
                          className="mt-3 pt-3 animate-fade-in"
                          style={{ borderTop: `1px solid ${typeConfig.borderColor}` }}
                        >
                          {event.relationshipChange && (
                            <div
                              className="flex items-center gap-2 text-xs"
                              style={{ color: '#8b8fa8' }}
                            >
                              <span>关系变化:</span>
                              <span
                                style={{
                                  color: event.relationshipChange.delta > 0 ? '#00ff88' : '#ff2d78',
                                }}
                              >
                                {event.relationshipChange.delta > 0 ? '+' : ''}
                                {event.relationshipChange.delta}
                              </span>
                            </div>
                          )}
                          {event.agents && event.agents.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs" style={{ color: '#4a4d5e' }}>
                                涉及角色:
                              </span>
                              <div className="flex gap-1">
                                {event.agents.map(agentId => (
                                  <span
                                    key={agentId}
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      background: 'rgba(0,212,255,0.1)',
                                      color: '#00d4ff',
                                      border: '1px solid rgba(0,212,255,0.2)',
                                    }}
                                  >
                                    {agentId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p
                            className="text-xs mt-2 cursor-pointer"
                            style={{ color: '#4a4d5e' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(null);
                            }}
                          >
                            点击收起 ↑
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.35s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease forwards;
        }
        @keyframes major-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0.05), 0 0 30px rgba(255,255,255,0.5); }
        }
        .animate-major-pulse {
          animation: major-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
