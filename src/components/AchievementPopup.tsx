'use client';

import React, { useEffect, useState } from 'react';
import { Achievement } from '@/data/achievements';

interface AchievementPopupProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    // 入场动画
    requestAnimationFrame(() => setVisible(true));

    // 生成闪光粒子
    const particles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setSparkles(particles);

    // 3秒后自动消失
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400); // 等待退出动画
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleClick = () => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        transition-opacity duration-400
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={handleClick}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* 成就卡片 */}
      <div
        className={`
          relative mx-4 max-w-sm w-full
          bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50
          border-2 border-amber-400/60 rounded-2xl
          shadow-2xl shadow-amber-500/30
          overflow-hidden
          transition-all duration-500
          ${visible ? 'scale-100 translate-y-0' : 'scale-75 translate-y-8'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* 闪光粒子 */}
        {sparkles.map(p => (
          <div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300 animate-sparkle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* 顶部装饰条 */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

        <div className="px-6 py-5">
          {/* 标题 */}
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-1">
              🏆 成就解锁
            </p>
            <div className="text-5xl mb-3 drop-shadow-lg animate-bounce-slow">
              {achievement.icon}
            </div>
            <h2 className="text-xl font-bold text-amber-900 mb-1">
              {achievement.title}
            </h2>
            <p className="text-sm text-amber-700/80">
              {achievement.description}
            </p>
          </div>

          {/* 分隔线 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-amber-300/50" />
            <span className="text-amber-500 text-xs">✨</span>
            <div className="flex-1 h-px bg-amber-300/50" />
          </div>

          {/* 成就点数 */}
          <div className="flex items-center justify-center gap-2">
            <div className="bg-amber-400/20 border border-amber-400/40 rounded-full px-4 py-1.5 flex items-center gap-1.5">
              <span className="text-amber-600 text-sm font-bold">+{achievement.points}</span>
              <span className="text-amber-500 text-xs font-medium">成就点数</span>
            </div>
          </div>

          {/* 点击提示 */}
          <p className="text-center text-xs text-amber-500/60 mt-3">
            点击任意处关闭
          </p>
        </div>

        {/* 底部装饰 */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
