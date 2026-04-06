'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Achievement } from '@/data/achievements';
import { Share2, X } from 'lucide-react';

// 稀有度配置
const RARITY_CONFIG = {
  common: { color: '#9ca3af', glow: 'none', label: '普通' },
  uncommon: { color: '#22c55e', glow: '0 0 8px rgba(34,197,94,0.4)', label: '罕见' },
  rare: { color: '#3b82f6', glow: '0 0 12px rgba(59,130,246,0.5)', label: '稀有' },
  epic: { color: '#a855f7', glow: '0 0 16px rgba(168,85,247,0.6)', label: '史诗' },
  legendary: { color: '#f97316', glow: '0 0 20px rgba(249,115,22,0.7)', label: '传奇' },
  mythic: { color: '#fbbf24', glow: '0 0 24px rgba(251,191,36,0.8)', label: '神话' },
};

// 根据成就点数计算稀有度
const getRarity = (points: number): keyof typeof RARITY_CONFIG => {
  if (points >= 200) return 'mythic';
  if (points >= 150) return 'legendary';
  if (points >= 100) return 'epic';
  if (points >= 50) return 'rare';
  if (points >= 20) return 'uncommon';
  return 'common';
};

interface AchievementPopupProps {
  achievement: Achievement;
  onDismiss: () => void;
  onShare?: (achievement: Achievement) => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  onDismiss,
  onShare,
}) => {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting'>('entering');
  const [badgeColor, setBadgeColor] = useState<'gray' | 'color'>('gray');
  const [glowVisible, setGlowVisible] = useState(false);
  const [newTagVisible, setNewTagVisible] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  
  const rarity = getRarity(achievement.points);
  const rarityConfig = RARITY_CONFIG[rarity];

  const playSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not available
    }
  }, []);

  useEffect(() => {
    // Phase 1: Enter (0ms)
    requestAnimationFrame(() => setPhase('visible'));

    // Phase 2: Badge color reveal (100ms delay)
    const t1 = setTimeout(() => setBadgeColor('color'), 100);

    // Phase 3: Gold glow expansion (200ms delay)
    const t2 = setTimeout(() => setGlowVisible(true), 200);

    // Phase 4: NEW! tag spring in (400ms delay)
    const t3 = setTimeout(() => setNewTagVisible(true), 400);

    // Phase 5: Generate sparkles (300ms delay)
    const t4 = setTimeout(() => {
      const particles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        delay: Math.random() * 0.6,
      }));
      setSparkles(particles);
      playSound();
    }, 300);

    // Auto dismiss after 3s visible
    const dismissTimer = setTimeout(() => {
      setPhase('exiting');
      setTimeout(onDismiss, 400);
    }, 3000);

    return () => {
      [t1, t2, t3, t4, dismissTimer].forEach(clearTimeout);
    };
  }, [onDismiss, playSound]);

  const handleDismiss = () => {
    setPhase('exiting');
    setTimeout(onDismiss, 400);
  };

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        transition-all duration-400
        ${phase === 'entering' ? 'opacity-0' : phase === 'visible' ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleDismiss}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      {/* Ambient glow behind card */}
      <div
        className={`
          absolute w-96 h-96 rounded-full
          bg-gradient-to-br from-amber-500/20 via-yellow-400/10 to-transparent
          transition-all duration-700
          ${glowVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        `}
        style={{ filter: 'blur(40px)' }}
      />

      {/* Main popup card */}
      <div
        className={`
          relative mx-4 max-w-sm w-full
          rounded-2xl overflow-hidden
          transition-all duration-500
          ${phase === 'entering' ? 'scale-75 translate-y-8' : phase === 'visible' ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}
        `}
        style={{
          background: 'linear-gradient(145deg, #1a1d28 0%, #12141c 100%)',
          border: '1px solid rgba(255,184,0,0.3)',
          boxShadow: glowVisible
            ? '0 0 60px rgba(255,184,0,0.3), 0 0 120px rgba(255,184,0,0.1), 0 25px 80px rgba(0,0,0,0.8)'
            : '0 16px 48px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div
          className="h-0.5 w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #ffb800, transparent)',
          }}
        />

        {/* Sparkle particles */}
        {sparkles.map(p => (
          <div
            key={p.id}
            className="absolute w-1 h-1 rounded-full animate-achievement-sparkle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: ['#ffb800', '#ffd700', '#fff7a0'][p.id % 3],
              animationDelay: `${p.delay}s`,
              boxShadow: '0 0 6px currentColor',
            }}
          />
        ))}

        {/* NEW! tag */}
        <div
          className={`
            absolute top-3 right-3
            px-2.5 py-1 rounded-full text-xs font-bold
            transition-all duration-400
            ${newTagVisible
              ? 'opacity-100 scale-100 translate-x-0'
              : 'opacity-0 scale-0 -translate-x-4'
            }
          `}
          style={{
            background: 'linear-gradient(135deg, #ffb800, #ff8c00)',
            color: '#0a0b0f',
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: '0 0 12px rgba(255,184,0,0.6)',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          NEW!
        </div>

        <div className="px-6 py-5">
          {/* Achievement header */}
          <div className="text-center mb-5">
            <p
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{
                color: '#ffb800',
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '0.15em',
                textShadow: '0 0 20px rgba(255,184,0,0.5)',
              }}
            >
              🏆 Achievement Unlocked
            </p>

            {/* Badge icon */}
            <div
              className={`
                relative inline-flex items-center justify-center
                w-20 h-20 rounded-full mb-4
                transition-all duration-500
                ${badgeColor === 'gray' ? 'grayscale opacity-50' : ''}
              `}
              style={
                badgeColor === 'color'
                  ? {
                      background: 'radial-gradient(circle, rgba(255,184,0,0.2) 0%, transparent 70%)',
                      boxShadow: '0 0 40px rgba(255,184,0,0.4), 0 0 80px rgba(255,184,0,0.2)',
                    }
                  : {}
              }
            >
              {/* Outer pulse ring */}
              {glowVisible && (
                <div
                  className="absolute inset-0 rounded-full animate-achievement-ring motion-reduce:animate-none"
                  style={{
                    border: '2px solid rgba(255,184,0,0.5)',
                    animation: 'achievement-ring-expand 1.5s ease-out infinite',
                  }}
                />
              )}

              {/* Badge icon */}
              <span
                className="text-4xl animate-spring-bounce"
                style={{
                  filter: badgeColor === 'color'
                    ? 'drop-shadow(0 0 12px rgba(255,184,0,0.8))'
                    : 'grayscale',
                  transition: 'filter 0.5s ease',
                }}
              >
                {achievement.icon}
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-xl font-bold mb-2 animate-fade-in-up"
              style={{
                color: badgeColor === 'color' ? '#ffb800' : '#4a4d5e',
                fontFamily: "'Space Grotesk', sans-serif",
                textShadow: badgeColor === 'color' ? '0 0 20px rgba(255,184,0,0.3)' : 'none',
                transition: 'color 0.5s ease, text-shadow 0.5s ease',
                animationDelay: '0.1s',
              }}
            >
              {achievement.title}
            </h2>

            {/* Description */}
            <p
              className="text-sm animate-fade-in-up"
              style={{
                color: '#8b8fa8',
                animationDelay: '0.2s',
              }}
            >
              {achievement.description}
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,184,0,0.3), transparent)' }} />
            <span style={{ color: 'rgba(255,184,0,0.5)' }}>✨</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,184,0,0.3), transparent)' }} />
          </div>

          {/* Points & Rarity */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: `${rarityConfig.color}15`,
                border: `1px solid ${rarityConfig.color}30`,
              }}
            >
              <span style={{ color: rarityConfig.color, fontSize: '18px' }}>⭐</span>
              <span
                className="font-bold"
                style={{
                  color: rarityConfig.color,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                }}
              >
                +{achievement.points}
              </span>
              <span style={{ color: '#8b8fa8', fontSize: '12px' }}>成就积分</span>
            </div>
            
            {/* 稀有度标签 */}
            <div
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: `${rarityConfig.color}20`,
                border: `1px solid ${rarityConfig.color}40`,
                color: rarityConfig.color,
                boxShadow: rarityConfig.glow,
              }}
            >
              {rarityConfig.label}
            </div>
          </div>

          {/* 解锁条件说明 */}
          <div 
            className="px-3 py-2 rounded-lg text-xs mb-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#8b8fa8',
            }}
          >
            <span style={{ color: '#4a4d5e' }}>解锁条件：</span>
            {achievement.description}
          </div>

          {/* 分享按钮 */}
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(achievement);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:brightness-110"
              style={{
                background: `${rarityConfig.color}15`,
                border: `1px solid ${rarityConfig.color}30`,
                color: rarityConfig.color,
              }}
            >
              <Share2 className="w-4 h-4" />
              分享成就
            </button>
          )}

          {/* Dismiss hint */}
          <p
            className="text-center text-xs mt-4"
            style={{ color: 'rgba(139,143,168,0.5)' }}
          >
            点击任意处关闭
          </p>
        </div>

        {/* Bottom accent line */}
        <div
          className="h-0.5 w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #ffb800, transparent)',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes achievement-sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          25% { opacity: 1; transform: scale(1.2) rotate(90deg); }
          50% { opacity: 0.6; transform: scale(0.8) rotate(180deg); }
          75% { opacity: 1; transform: scale(1.1) rotate(270deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
        .animate-achievement-sparkle {
          animation: achievement-sparkle 2s ease-in-out infinite;
        }

        @keyframes achievement-ring-expand {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-achievement-ring {
          animation: achievement-ring-expand 1.5s ease-out infinite;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.35s cubic-bezier(0, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        @keyframes spring-bounce {
          0% { transform: scale(0.5); }
          60% { transform: scale(1.15); }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .animate-spring-bounce {
          animation: spring-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};
