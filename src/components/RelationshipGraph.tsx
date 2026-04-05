'use client';

import React from 'react';
import { agents } from '@/config/agents';
import { useGameStore } from '@/store/gameStore';

interface RelationshipEdge {
  from: string;
  to: string;
  level: number; // -100 to 100
  type: 'friend' | 'enemy' | 'neutral' | 'love';
}

export const RelationshipGraph: React.FC = () => {
  const relationships = useGameStore((state) => state.relationships);

  // 预定义角色位置（圆形布局）
  const nodePositions: Record<string, { x: number; y: number }> = {
    marcus: { x: 200, y: 150 },
    sophia: { x: 350, y: 150 },
    james: { x: 450, y: 250 },
    emily: { x: 400, y: 380 },
    david: { x: 250, y: 380 },
    lisa: { x: 100, y: 300 },
    robert: { x: 150, y: 180 },
  };

  // 转换关系数据
  const edges: RelationshipEdge[] = relationships.map((r) => ({
    from: r.agentId,
    to: r.targetId,
    level: r.level,
    type: r.level > 30 ? 'friend' : r.level < -30 ? 'enemy' : 'neutral',
  }));

  const getEdgeColor = (level: number) => {
    if (level > 30) return '#22c55e'; // 绿色-友好
    if (level < -30) return '#ef4444'; // 红色-敌对
    return '#94a3b8'; // 灰色-中立
  };

  const getEdgeWidth = (level: number) => {
    return Math.abs(level) / 30; // 1-3px
  };

  return (
    <div className="bg-white rounded-2xl p-4">
      <h3 className="text-lg font-bold mb-4">🔗 角色关系</h3>

      <div className="relative w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
        <svg className="w-full h-full">
          {/* 绘制连线 */}
          {edges.map((edge, i) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            if (!fromPos || !toPos) return null;

            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;

            return (
              <g key={i}>
                {/* 关系线 */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={getEdgeColor(edge.level)}
                  strokeWidth={getEdgeWidth(edge.level)}
                  strokeOpacity={0.6}
                />
                {/* 关系值标签 */}
                <text
                  x={midX}
                  y={midY - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {edge.level > 0 ? '+' : ''}{edge.level}
                </text>
              </g>
            );
          })}

          {/* 绘制节点 */}
          {agents.slice(0, 7).map((agent) => {
            const pos = nodePositions[agent.id];
            if (!pos) return null;

            return (
              <g key={agent.id} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* 节点背景 */}
                <circle
                  r={30}
                  fill="white"
                  stroke="#6366f1"
                  strokeWidth={2}
                  className="drop-shadow-md"
                />
                {/* emoji */}
                <text textAnchor="middle" dy={8} fontSize={28}>
                  {agent.emoji}
                </text>
                {/* 名称 */}
                <text
                  textAnchor="middle"
                  y={50}
                  className="text-xs font-medium fill-gray-700"
                >
                  {agent.nameCN}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 图例 */}
        <div className="absolute bottom-2 right-2 flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-green-500"></span>
            友好
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-gray-400"></span>
            中立
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-red-500"></span>
            敌对
          </span>
        </div>
      </div>
    </div>
  );
};
