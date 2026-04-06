'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { agents } from '@/config/agents';
import { useGameStore } from '@/store/gameStore';

interface GraphNode {
  id: string;
  name: string;
  nameCN: string;
  emoji: string;
  x: number;
  y: number;
  isNPC?: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  level: number; // -100 to 100
}

type RelationType = 'friendly' | 'hostile' | 'romantic' | 'neutral';

const RELATION_COLORS: Record<RelationType, string> = {
  friendly: '#00ff88',
  hostile: '#ff2d78',
  romantic: '#ff69b4',
  neutral: '#4a4d5e',
};

const RELATION_LABELS: Record<RelationType, string> = {
  friendly: '友好',
  hostile: '敌对',
  romantic: '浪漫',
  neutral: '中立',
};

export const RelationshipGraph: React.FC = () => {
  const relationships = useGameStore((state) => state.relationships);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Predefined circular layout
  const getNodePosition = (id: string, index: number, total: number): { x: number; y: number } => {
    const cx = 400;
    const cy = 300;
    const radius = 220;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const displayAgents = agents.slice(0, 7);

  const nodes: GraphNode[] = displayAgents.map((agent, i) => {
    const pos = getNodePosition(agent.id, i, displayAgents.length);
    return {
      id: agent.id,
      name: agent.name,
      nameCN: agent.nameCN || agent.name,
      emoji: agent.emoji,
      x: pos.x,
      y: pos.y,
      isNPC: agent.isNPC,
    };
  });

  const getRelationType = (level: number): RelationType => {
    if (level > 50) return 'romantic';
    if (level > 20) return 'friendly';
    if (level < -20) return 'hostile';
    return 'neutral';
  };

  // Build edges from store
  const edges: GraphEdge[] = relationships.slice(0, 20).map(r => ({
    from: r.agentId,
    to: r.targetId,
    level: r.level,
  }));

  // If no edges, create some demo edges
  const displayEdges = edges.length > 0 ? edges : displayAgents.slice(0, 5).map((a, i) => ({
    from: a.id,
    to: displayAgents[(i + 1) % 5].id,
    level: Math.floor(Math.random() * 100) - 30,
  }));

  const getEdgeKey = (edge: GraphEdge) => `${edge.from}-${edge.to}`;

  const getEdgeColor = (level: number, isHovered: boolean) => {
    const type = getRelationType(level);
    const base = RELATION_COLORS[type];
    if (isHovered) {
      return base.replace(')', ',1)').replace('rgb', 'rgba');
    }
    return base;
  };

  // Mouse handlers for pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) * (viewBox.width / (containerRef.current?.clientWidth || 800));
    const dy = (e.clientY - dragStart.y) * (viewBox.height / (containerRef.current?.clientHeight || 600));
    setViewBox(v => ({ ...v, x: v.x - dx, y: v.y - dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, viewBox]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.5, Math.min(3, scale * zoomFactor));

    // Zoom towards mouse position
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const svgMouseX = viewBox.x + (mouseX / rect.width) * viewBox.width;
    const svgMouseY = viewBox.y + (mouseY / rect.height) * viewBox.height;

    const newWidth = viewBox.width * zoomFactor;
    const newHeight = viewBox.height * zoomFactor;

    setViewBox({
      x: svgMouseX - (mouseX / rect.width) * newWidth,
      y: svgMouseY - (mouseY / rect.height) * newHeight,
      width: newWidth,
      height: newHeight,
    });
    setScale(newScale);
  }, [scale, viewBox]);

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  const selectedNodeEdges = displayEdges.filter(
    e => e.from === selectedNode || e.to === selectedNode
  );

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-base font-semibold flex items-center gap-2"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#e8e8f0',
          }}
        >
          <span style={{ color: '#00d4ff' }}>🔗</span>
          角色关系图
        </h3>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: '#8b8fa8',
            }}
            onClick={() => {
              const newScale = Math.min(3, scale * 1.2);
              setViewBox(v => ({
                ...v,
                width: v.width / 1.2,
                height: v.height / 1.2,
              }));
              setScale(newScale);
            }}
          >
            +
          </button>
          <span
            className="text-xs px-2"
            style={{ color: '#4a4d5e', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {Math.round(scale * 100)}%
          </span>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: '#8b8fa8',
            }}
            onClick={() => {
              const newScale = Math.max(0.5, scale * 0.8);
              setViewBox(v => ({
                ...v,
                width: v.width / 0.8,
                height: v.height / 0.8,
              }));
              setScale(newScale);
            }}
          >
            −
          </button>
        </div>
      </div>

      {/* Graph container */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          background: 'radial-gradient(ellipse at center, #12141c 0%, #0a0b0f 100%)',
          border: '1px solid var(--border)',
          height: '400px',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.03) 0%, transparent 70%)',
          }}
        />

        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Glow filters */}
            {Object.entries(RELATION_COLORS).map(([type, color]) => (
              <filter key={type} id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}

            {/* Arrow marker for hostile edges */}
            <marker
              id="arrow-hostile"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={RELATION_COLORS.hostile} opacity="0.6" />
            </marker>
          </defs>

          {/* Edges */}
          {displayEdges.map((edge, i) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const edgeKey = getEdgeKey(edge);
            const isHovered = hoveredEdge === edgeKey;
            const isRelated = selectedNode && (edge.from === selectedNode || edge.to === selectedNode);
            const relationType = getRelationType(edge.level);
            const color = getEdgeColor(edge.level, isHovered);

            // Bezier control points for curved lines
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const curvature = Math.min(dist * 0.15, 50);
            const ctrlX = midX - (dy / dist) * curvature * (relationType === 'romantic' ? -1 : 1);
            const ctrlY = midY + (dx / dist) * curvature * (relationType === 'romantic' ? -1 : 1);

            const strokeWidth = isHovered ? 3 : isRelated ? 2.5 : 1.5;
            const opacity = isRelated || !selectedNode ? (isHovered ? 1 : 0.7) : 0.2;

            return (
              <g
                key={edgeKey}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEdge(edgeKey)}
                onMouseLeave={() => setHoveredEdge(null)}
                onClick={() => {
                  setSelectedNode(null);
                }}
              >
                {/* Edge line */}
                <path
                  d={`M ${fromNode.x} ${fromNode.y} Q ${ctrlX} ${ctrlY} ${toNode.x} ${toNode.y}`}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  fill="none"
                  strokeLinecap="round"
                  markerEnd={
                    relationType === 'hostile' && isHovered
                      ? 'url(#arrow-hostile)'
                      : undefined
                  }
                  style={{
                    filter: isHovered ? `url(#glow-${relationType})` : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />

                {/* Animated dash for hostile */}
                {relationType === 'hostile' && (
                  <path
                    d={`M ${fromNode.x} ${fromNode.y} Q ${ctrlX} ${ctrlY} ${toNode.x} ${toNode.y}`}
                    stroke={color}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                    fill="none"
                    strokeDasharray="4 4"
                    style={{ animation: 'dash-flow 1s linear infinite' }}
                  />
                )}

                {/* Romance double line */}
                {relationType === 'romantic' && (
                  <path
                    d={`M ${fromNode.x} ${fromNode.y} Q ${ctrlX - 3} ${ctrlY - 3} ${toNode.x} ${toNode.y}`}
                    stroke={color}
                    strokeWidth={1}
                    strokeOpacity={opacity * 0.6}
                    fill="none"
                    strokeLinecap="round"
                  />
                )}

                {/* Edge label on hover */}
                {isHovered && (
                  <g transform={`translate(${ctrlX}, ${ctrlY - 10})`}>
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="20"
                      rx="4"
                      fill="#1a1d28"
                      stroke={color}
                      strokeWidth="1"
                      strokeOpacity="0.8"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={color}
                      fontSize="10"
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight="600"
                    >
                      {edge.level > 0 ? '+' : ''}{edge.level}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const relatedEdges = selectedNodeEdges.filter(
              e => e.from === node.id || e.to === node.id
            );
            const hasRelation = relatedEdges.length > 0;
            const radius = isHovered || isSelected ? 36 : 32;

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  setSelectedNode(isSelected ? null : node.id);
                }}
                style={{ transition: 'all 0.2s ease' }}
              >
                {/* Outer glow ring */}
                {(isHovered || hasRelation) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 8}
                    fill="none"
                    stroke={hasRelation ? '#00d4ff' : '#00d4ff'}
                    strokeWidth="1"
                    strokeOpacity={isHovered ? 0.4 : 0.2}
                    style={{
                      filter: 'blur(4px)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 12}
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    strokeDasharray="4 2"
                    style={{ animation: 'selection-spin 8s linear infinite' }}
                  />
                )}

                {/* Node background */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill="#12141c"
                  stroke={isSelected ? '#00d4ff' : isHovered ? '#3d4055' : '#2a2d3a'}
                  strokeWidth={isSelected ? 2 : 1.5}
                  style={{
                    boxShadow: isSelected
                      ? '0 0 20px rgba(0,212,255,0.4)'
                      : isHovered
                      ? '0 0 12px rgba(255,255,255,0.1)'
                      : 'none',
                    transition: 'all 0.2s ease',
                    filter: selectedNode && !hasRelation ? 'opacity(0.3)' : 'none',
                  }}
                />

                {/* NPC indicator */}
                {node.isNPC && (
                  <circle
                    cx={node.x + 20}
                    cy={node.y - 20}
                    r="8"
                    fill="#ffb800"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255,184,0,0.6))' }}
                  />
                )}

                {/* Emoji */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="28"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
                    transition: 'filter 0.2s ease',
                  }}
                >
                  {node.emoji}
                </text>

                {/* Name label */}
                <text
                  x={node.x}
                  y={node.y + radius + 18}
                  textAnchor="middle"
                  fill={isSelected ? '#00d4ff' : '#8b8fa8'}
                  fontSize="11"
                  fontFamily="'Space Grotesk', sans-serif"
                  fontWeight={isSelected ? '600' : '400'}
                  style={{ transition: 'fill 0.2s ease' }}
                >
                  {node.nameCN}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div
          className="absolute bottom-3 right-3 flex flex-col gap-1.5 p-3 rounded-lg"
          style={{
            background: 'rgba(10,11,15,0.8)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {Object.entries(RELATION_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-5 h-0.5 rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                }}
              />
              <span
                className="text-xs"
                style={{ color: '#8b8fa8', fontFamily: "'IBM Plex Sans', sans-serif" }}
              >
                {RELATION_LABELS[type as RelationType]}
              </span>
            </div>
          ))}
        </div>

        {/* Node detail panel */}
        {selectedNodeData && (
          <div
            className="absolute top-3 left-3 p-4 rounded-xl animate-fade-in"
            style={{
              background: 'rgba(10,11,15,0.9)',
              border: '1px solid #00d4ff',
              boxShadow: '0 0 20px rgba(0,212,255,0.2)',
              backdropFilter: 'blur(12px)',
              maxWidth: '200px',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{selectedNodeData.emoji}</span>
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: '#e8e8f0', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {selectedNodeData.nameCN}
                </p>
                {selectedNodeData.isNPC && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(255,184,0,0.2)',
                      color: '#ffb800',
                      border: '1px solid rgba(255,184,0,0.3)',
                    }}
                  >
                    NPC
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              {selectedNodeEdges.map(edge => {
                const otherId = edge.from === selectedNode ? edge.to : edge.from;
                const other = nodes.find(n => n.id === otherId);
                const type = getRelationType(edge.level);
                if (!other) return null;
                return (
                  <div key={getEdgeKey(edge)} className="flex items-center gap-2 text-xs">
                    <span>{other.emoji}</span>
                    <span style={{ color: '#8b8fa8' }}>{other.nameCN}</span>
                    <span
                      style={{
                        color: RELATION_COLORS[type],
                        fontFamily: "'JetBrains Mono', monospace",
                        marginLeft: 'auto',
                      }}
                    >
                      {edge.level > 0 ? '+' : ''}{edge.level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hint */}
        <div
          className="absolute bottom-3 left-3 text-xs"
          style={{ color: '#4a4d5e', fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          拖拽移动 · 滚轮缩放 · 点击节点查看关系
        </div>
      </div>

      <style jsx>{`
        @keyframes dash-flow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -8; }
        }
        @keyframes selection-spin {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -24; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease forwards;
        }
      `}</style>
    </div>
  );
};
