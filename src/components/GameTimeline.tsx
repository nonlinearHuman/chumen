'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';

interface TimelineEvent {
  id: string;
  type: 'dialogue' | 'event' | 'achievement' | 'scene_change' | 'nft' | 'system';
  title: string;
  description: string;
  timestamp: number;
  icon: string;
}

export const GameTimeline: React.FC = () => {
  const { dramaEvents, dialogues, achievements } = useGameStore();

  // 合并所有事件并按时间排序
  const allEvents: TimelineEvent[] = [
    ...dramaEvents.map(e => ({
      id: `drama-${e.id}`,
      type: 'event' as const,
      title: e.type,
      description: e.content,
      timestamp: Date.now(), // dramaEvents 没有 timestamp，用当前时间
      icon: '🎭',
    })),
    ...dialogues.slice(-50).map(d => ({
      id: `dialogue-${d.id}`,
      type: 'dialogue' as const,
      title: '新对话',
      description: d.content.slice(0, 50) + (d.content.length > 50 ? '...' : ''),
      timestamp: d.timestamp,
      icon: '💬',
    })),
  ].sort((a, b) => b.timestamp - a.timestamp); // 最新在前

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'dialogue': return 'bg-blue-100 border-blue-300';
      case 'event': return 'bg-purple-100 border-purple-300';
      case 'achievement': return 'bg-yellow-100 border-yellow-300';
      case 'scene_change': return 'bg-green-100 border-green-300';
      case 'nft': return 'bg-pink-100 border-pink-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // 按日期分组
  const groupedByDate = allEvents.reduce((acc, event) => {
    const dateKey = formatDate(event.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="bg-white rounded-2xl p-4 max-h-[60vh] overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">📜 事件日志</h3>

      {allEvents.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          暂无事件记录
        </div>
      ) : (
        <div className="relative">
          {/* 时间线竖线 */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {Object.entries(groupedByDate).map(([date, events]) => (
            <div key={date} className="mb-6">
              {/* 日期标签 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-6 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center z-10">
                  {date}
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* 事件列表 */}
              <div className="space-y-3 ml-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`relative p-3 rounded-xl border ${getEventColor(event.type)}`}
                  >
                    {/* 时间线节点 */}
                    <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xs">
                      {event.icon}
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(event.timestamp)}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full">
                            {event.icon}
                          </span>
                        </div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{event.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
