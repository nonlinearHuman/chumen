// 动画增强组件
// src/components/Effects.tsx

'use client';

import React, { useEffect, useState } from 'react';

// 场景背景效果
export const SceneBackground: React.FC<{ scene: string }> = ({ scene }) => {
  const backgrounds: Record<string, string> = {
    coffee_shop: 'from-amber-50 to-orange-100',
    hospital: 'from-blue-50 to-cyan-100',
    court: 'from-gray-100 to-slate-200',
    office: 'from-slate-100 to-zinc-200',
    apartment: 'from-rose-50 to-pink-100',
    street: 'from-stone-100 to-stone-200',
    media_office: 'from-violet-50 to-purple-100',
    police_station: 'from-blue-50 to-indigo-100',
  };

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${backgrounds[scene] || 'from-gray-50 to-gray-100'} opacity-50`} />
  );
};

// 对话气泡动画
export const DialogueAnimation: React.FC<{ children: React.ReactNode; keyProp: string }> = ({ children, keyProp }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, [keyProp]);

  return (
    <div
      className={`
        transition-all duration-500 ease-out transform
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {children}
    </div>
  );
};

// 角色激活效果
export const ActiveIndicator: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <div className="relative">
      {active && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

// 心情状态指示器
export const MoodIndicator: React.FC<{ mood: string }> = ({ mood }) => {
  const moods: Record<string, { emoji: string; color: string }> = {
    happy: { emoji: '😊', color: 'bg-yellow-100' },
    sad: { emoji: '😢', color: 'bg-blue-100' },
    angry: { emoji: '😠', color: 'bg-red-100' },
    excited: { emoji: '🤩', color: 'bg-purple-100' },
    neutral: { emoji: '😐', color: 'bg-gray-100' },
  };

  const current = moods[mood] || moods.neutral;

  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${current.color} text-sm`}>
      {current.emoji}
    </span>
  );
};

// 直播指示器
export const LiveIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
      LIVE
    </div>
  );
};

// 戏剧事件提示
export const DramaAlert: React.FC<{ type: string; message: string }> = ({ type, message }) => {
  const colors: Record<string, string> = {
    emotion: 'bg-yellow-500',
    conflict: 'bg-red-500',
    romance: 'bg-pink-500',
    secret: 'bg-purple-500',
    random: 'bg-blue-500',
  };

  return (
    <div className={`
      ${colors[type] || 'bg-gray-500'} 
      text-white px-4 py-2 rounded-lg shadow-lg 
      animate-bounce-once
      font-medium
    `}>
      🎭 {message}
    </div>
  );
};

// 加载动画
export const LoadingDots: React.FC = () => {
  return (
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};
