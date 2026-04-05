// 直播指示器组件
// 显示 REC● / LIVE / PAUSED / OFFLINE 状态
'use client';

import React from 'react';

export type LiveStatus = 'recording' | 'live' | 'paused' | 'offline';

interface LiveIndicatorProps {
  status: LiveStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<LiveStatus, { label: string; dotColor: string; bgColor: string; textColor: string; animate?: boolean }> = {
  recording: {
    label: 'REC',
    dotColor: '#ff3b3b',
    bgColor: 'rgba(255, 59, 59, 0.15)',
    textColor: '#ff3b3b',
    animate: true,
  },
  live: {
    label: 'LIVE',
    dotColor: '#ff3b3b',
    bgColor: 'rgba(255, 59, 59, 0.15)',
    textColor: '#ff3b3b',
    animate: true,
  },
  paused: {
    label: 'PAUSED',
    dotColor: '#8b8fa8',
    bgColor: 'rgba(139, 143, 168, 0.15)',
    textColor: '#8b8fa8',
  },
  offline: {
    label: 'OFFLINE',
    dotColor: '#4a4d5e',
    bgColor: 'rgba(74, 77, 94, 0.15)',
    textColor: '#4a4d5e',
  },
};

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const isSmall = size === 'sm';

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-chumen-sm font-display font-bold uppercase tracking-wider"
      style={{
        backgroundColor: config.bgColor,
        padding: isSmall ? '2px 6px' : '3px 8px',
        fontSize: isSmall ? '9px' : '11px',
        letterSpacing: '0.1em',
        color: config.textColor,
      }}
    >
      {/* Dot */}
      <span
        className={config.animate ? 'animate-recording-pulse' : ''}
        style={{
          display: 'inline-block',
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
        }}
      />
      {/* Label */}
      <span>{config.label}</span>
    </div>
  );
};
