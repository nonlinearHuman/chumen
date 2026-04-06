'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ComposedSprite, Rarity, RARITY_CONFIG } from '@/types/traits';

interface SummonPanelProps {
  onSummon: (result: ComposedSprite) => void;
  isSummoning: boolean;
}

type SummonType = 'normal' | 'premium' | 'legendary';

const SUMMON_COSTS: Record<SummonType, { tokens: number; label: string; bonus: string }> = {
  normal: { tokens: 100, label: '普通召唤', bonus: '基础概率' },
  premium: { tokens: 500, label: '高级召唤', bonus: '+20% 稀有度' },
  legendary: { tokens: 2000, label: '传说召唤', bonus: '+50% 稀有度' },
};

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

// Pixel fragment positions (start from 4 corners + edges)
const FRAGMENT_SOURCES = [
  { id: 0, startX: -200, startY: -200, endX: 0, endY: 0 },      // top-left
  { id: 1, startX: 200, startY: -200, endX: 0, endY: 0 },       // top-right
  { id: 2, startX: -200, startY: 200, endX: 0, endY: 0 },       // bottom-left
  { id: 3, startX: 200, startY: 200, endX: 0, endY: 0 },       // bottom-right
  { id: 4, startX: -300, startY: 0, endX: 0, endY: 0 },        // left
  { id: 5, startX: 300, startY: 0, endX: 0, endY: 0 },         // right
  { id: 6, startX: 0, startY: -250, endX: 0, endY: 0 },        // top
  { id: 7, startX: 0, startY: 250, endX: 0, endY: 0 },         // bottom
];

// Generate pseudo-random pixels for sprite assembly
function generatePixelData(): { x: number; y: number; color: string }[] {
  const colors = ['#00d4ff', '#ff2d78', '#ffb800', '#00ff88', '#a855f7', '#e8e8f0', '#ff69b4'];
  const pixels: { x: number; y: number; color: string }[] = [];
  const gridSize = 12;
  const centerX = 6;
  const centerY = 6;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Create a roughly humanoid pixel sprite shape
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isBody = dist < 5;
      const isHead = dy < -2 && dist < 3;
      const isEdge = dist >= 4 && dist < 6;

      if (isBody || isHead || (isEdge && Math.random() > 0.3)) {
        const colorIdx = Math.floor(Math.random() * colors.length);
        pixels.push({
          x: (x - centerX) * 8,
          y: (y - centerY) * 8,
          color: colors[colorIdx],
        });
      }
    }
  }
  return pixels;
}

export default function SummonPanel({ onSummon, isSummoning }: SummonPanelProps) {
  const [selectedType, setSelectedType] = useState<SummonType>('normal');
  const [animPhase, setAnimPhase] = useState<'idle' | 'summoning' | 'fragments' | 'assembling' | 'reveal' | 'done'>('idle');
  const [revealedRarity, setRevealedRarity] = useState<Rarity>('common');
  const [revealedSprite, setRevealedSprite] = useState<ComposedSprite | null>(null);
  const [fragmentProgress, setFragmentProgress] = useState(0);
  const [assembleProgress, setAssembleProgress] = useState(0);
  const [revealScale, setRevealScale] = useState(0);
  const [pixelGlow, setPixelGlow] = useState<Rarity>('common');
  const animationRef = useRef<number | null>(null);

  const pixels = useRef(generatePixelData());

  const getRarityColor = (rarity: Rarity) => RARITY_CONFIG[rarity].color;

  const getRarityGlowStyle = (rarity: Rarity): React.CSSProperties => {
    const color = getRarityColor(rarity);
    switch (rarity) {
      case 'mythic':
        return {
          boxShadow: `
            0 0 30px rgba(251,191,36,0.6),
            0 0 60px rgba(168,85,247,0.4),
            0 0 90px rgba(59,130,246,0.3),
            inset 0 0 30px rgba(255,255,255,0.1)
          `,
        };
      case 'legendary':
        return {
          boxShadow: `
            0 0 25px rgba(249,115,22,0.7),
            0 0 50px rgba(249,115,22,0.4),
            inset 0 0 20px rgba(249,115,22,0.2)
          `,
        };
      case 'epic':
        return {
          boxShadow: `0 0 20px rgba(168,85,247,0.6), inset 0 0 20px rgba(168,85,247,0.2)`,
        };
      case 'rare':
        return {
          boxShadow: `0 0 15px rgba(59,130,246,0.5), inset 0 0 15px rgba(59,130,246,0.15)`,
        };
      case 'uncommon':
        return {
          boxShadow: `0 0 10px rgba(34,197,94,0.4)`,
        };
      default:
        return {
          boxShadow: `0 0 8px rgba(156,163,175,0.3)`,
        };
    }
  };

  const runSummonAnimation = useCallback(async () => {
    // Reset
    setAnimPhase('idle');
    setFragmentProgress(0);
    setAssembleProgress(0);
    setRevealScale(0);

    // Phase 1: Transition to fullscreen overlay
    setAnimPhase('summoning');
    await new Promise(r => setTimeout(r, 800));

    // Phase 2: Fragments flying from corners
    setAnimPhase('fragments');
    pixels.current = generatePixelData();

    // Animate fragment progress
    const fragStart = Date.now();
    const FRAG_DURATION = 1200;
    const animateFrag = () => {
      const elapsed = Date.now() - fragStart;
      const progress = Math.min(elapsed / FRAG_DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setFragmentProgress(eased);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrag);
      } else {
        // Phase 3: Assembling
        setAnimPhase('assembling');
        setTimeout(() => {
          setAnimPhase('reveal');
          // Reveal sequence
          let scale = 0;
          const revealInterval = setInterval(() => {
            scale += 0.08;
            setRevealScale(Math.min(scale, 1.15));
            if (scale >= 1.15) {
              clearInterval(revealInterval);
              setTimeout(() => setRevealScale(1), 150);
            }
          }, 16);

          // Generate actual sprite after animation
          setTimeout(async () => {
            try {
              const response = await fetch('/api/summon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: selectedType }),
              });
              const data = await response.json();
              if (data.success && data.agent) {
                setRevealedRarity(data.agent.rarity);
                setPixelGlow(data.agent.rarity);
                setRevealedSprite(data.agent);
                setAnimPhase('done');
                setTimeout(() => onSummon(data.agent), 2000);
              }
            } catch (error) {
              console.error('Summon failed:', error);
              setAnimPhase('idle');
            }
          }, 800);
        }, 600);
      }
    };
    animationRef.current = requestAnimationFrame(animateFrag);
  }, [selectedType, onSummon]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleSummon = async () => {
    if (isSummoning || animPhase !== 'idle') return;
    await runSummonAnimation();
  };

  const handleClose = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setAnimPhase('idle');
    setRevealedSprite(null);
    setRevealedRarity('common');
  };

  const showOverlay = animPhase !== 'idle';

  return (
    <div className="summon-panel relative">
      {/* ===== SUMMON ANIMATION OVERLAY ===== */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center"
          style={{
            background: 'rgba(10,11,15,0.95)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={animPhase === 'done' ? handleClose : undefined}
        >
          {/* Corner pixel decorations */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
            <div
              key={corner}
              className="absolute w-16 h-16 opacity-20"
              style={{
                [corner === 'top-left' ? 'top' : 'bottom']: 0,
                [corner === 'top-left' || corner === 'bottom-left' ? 'left' : 'right']: 0,
                borderImage: 'linear-gradient(135deg, #00d4ff 50%, transparent 50%) 1',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'transparent transparent #00d4ff #00d4ff',
              }}
            />
          ))}

          {/* Phase: Summoning (dark with pulsing text) */}
          {animPhase === 'summoning' && (
            <div className="text-center">
              <p
                className="text-6xl mb-4 animate-pulse"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.8))' }}
              >
                ✨
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: '#00d4ff',
                  textShadow: '0 0 30px rgba(0,212,255,0.6)',
                  letterSpacing: '0.1em',
                }}
              >
                召唤中...
              </p>
            </div>
          )}

          {/* Phase: Fragments flying in */}
          {animPhase === 'fragments' && (
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Fragment particles */}
              {FRAGMENT_SOURCES.map((frag, i) => {
                const x = frag.startX + (frag.endX - frag.startX) * fragmentProgress;
                const y = frag.startY + (frag.endY - frag.startY) * fragmentProgress;
                const opacity = Math.min(fragmentProgress * 2, 1);
                return (
                  <div
                    key={frag.id}
                    className="absolute"
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#00d4ff',
                      borderRadius: '2px',
                      boxShadow: '0 0 10px rgba(0,212,255,0.8), 0 0 20px rgba(0,212,255,0.4)',
                      transform: `translate(${x}px, ${y}px)`,
                      opacity,
                      transition: 'none',
                    }}
                  />
                );
              })}

              {/* Additional pixel particles from sources */}
              {pixels.current.slice(0, Math.floor(pixels.current.length * fragmentProgress)).map((px, i) => {
                const sourceFrag = FRAGMENT_SOURCES[i % FRAGMENT_SOURCES.length];
                const progress = Math.min(fragmentProgress * 1.2, 1);
                const x = (sourceFrag.startX) + (0 - sourceFrag.startX) * progress;
                const y = (sourceFrag.startY) + (0 - sourceFrag.startY) * progress;
                return (
                  <div
                    key={`px-${i}`}
                    className="absolute"
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: px.color,
                      boxShadow: `0 0 6px ${px.color}`,
                      transform: `translate(${x + px.x * 0.5}px, ${y + px.y * 0.5}px)`,
                      opacity: Math.min(progress * 2, 1),
                    }}
                  />
                );
              })}

              {/* Center convergence point */}
              <div
                className="absolute w-4 h-4 rounded-full animate-ping"
                style={{
                  backgroundColor: '#00d4ff',
                  boxShadow: '0 0 30px rgba(0,212,255,0.8)',
                }}
              />
            </div>
          )}

          {/* Phase: Assembling */}
          {animPhase === 'assembling' && (
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Pixel sprite being assembled */}
              {pixels.current.map((px, i) => {
                const delay = (i / pixels.current.length) * 0.5;
                const assembleComplete = Math.min(assembleProgress * 2, 1);
                return (
                  <div
                    key={`assemble-${i}`}
                    className="absolute transition-all"
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: px.color,
                      boxShadow: `0 0 4px ${px.color}`,
                      left: `calc(50% + ${px.x}px)`,
                      top: `calc(50% + ${px.y}px)`,
                      transform: `translate(-50%, -50%) scale(${assembleComplete})`,
                      opacity: assembleComplete,
                      transitionDelay: `${delay}s`,
                    }}
                  />
                );
              })}
              <p
                className="absolute bottom-0 text-sm"
                style={{ color: '#8b8fa8', fontFamily: "'JetBrains Mono', monospace" }}
              >
                拼合中...
              </p>
            </div>
          )}

          {/* Phase: Reveal */}
          {(animPhase === 'reveal' || animPhase === 'done') && (
            <div className="text-center">
              {/* Sprite display */}
              <div
                className="relative inline-flex items-center justify-center mb-6"
                style={{
                  width: '160px',
                  height: '160px',
                  transform: `scale(${revealScale})`,
                  transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* Rarity glow ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    ...getRarityGlowStyle(revealedRarity),
                    background: 'radial-gradient(circle, rgba(26,29,40,0.8) 40%, transparent 70%)',
                    animation: revealedRarity === 'legendary' || revealedRarity === 'mythic'
                      ? 'legendary-pulse 2s ease-in-out infinite'
                      : revealedRarity === 'epic'
                      ? 'none'
                      : 'none',
                  }}
                />

                {/* Rainbow ring for mythic */}
                {revealedRarity === 'mythic' && (
                  <div
                    className="absolute inset-0 rounded-full animate-mythic-rainbow"
                    style={{
                      background: 'conic-gradient(from 0deg, #fbbf24, #a855f7, #3b82f6, #22c55e, #fbbf24)',
                      padding: '3px',
                      animation: 'mythic-rotate 3s linear infinite',
                    }}
                  >
                    <div className="w-full h-full rounded-full" style={{ background: '#12141c' }} />
                  </div>
                )}

                {/* Character sprite */}
                <div className="relative w-32 h-32" style={{ imageRendering: 'pixelated' }}>
                  {pixels.current.map((px, i) => (
                    <div
                      key={`reveal-${i}`}
                      className="absolute"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: px.color,
                        boxShadow: `0 0 3px ${px.color}`,
                        left: `calc(50% + ${px.x}px)`,
                        top: `calc(50% + ${px.y}px)`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Rarity name reveal */}
              <div
                className="mb-4"
                style={{
                  transform: `scale(${revealScale})`,
                  transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: '0.1s',
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-1"
                  style={{ color: '#8b8fa8', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  稀有度
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: getRarityColor(revealedRarity),
                    textShadow: `0 0 30px ${getRarityColor(revealedRarity)}60`,
                  }}
                >
                  {RARITY_ORDER.indexOf(revealedRarity) >= RARITY_ORDER.indexOf('rare') ? (
                    <span className="uppercase">{revealedRarity}</span>
                  ) : (
                    <span className="capitalize">{revealedRarity}</span>
                  )}
                </p>
              </div>

              {/* Star rating */}
              <div className="flex items-center justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => {
                  const rarityIdx = RARITY_ORDER.indexOf(revealedRarity);
                  const filled = i < Math.ceil((rarityIdx + 1) / 1.2);
                  return (
                    <span
                      key={i}
                      className="text-xl transition-all"
                      style={{
                        opacity: filled ? 1 : 0.2,
                        color: filled ? getRarityColor(revealedRarity) : '#4a4d5e',
                        transform: filled && animPhase === 'done' ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                        transitionDelay: `${i * 0.1}s`,
                      }}
                    >
                      ★
                    </span>
                  );
                })}
              </div>

              {/* Result info */}
              {revealedSprite && (
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  <p
                    className="text-lg font-semibold mb-1"
                    style={{ color: '#e8e8f0', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    新角色
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: '#8b8fa8', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    DNA: {revealedSprite.dna?.slice(0, 12)}...
                  </p>
                </div>
              )}

              {/* Done state hint */}
              {animPhase === 'done' && (
                <p className="text-xs mt-6 animate-pulse" style={{ color: '#4a4d5e' }}>
                  点击任意处继续
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== REGULAR SUMMON PANEL (below overlay) ===== */}
      <div className="p-6">
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#e8e8f0',
          }}
        >
          🎲 召唤新角色
        </h2>

        {/* Summon type selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(Object.keys(SUMMON_COSTS) as SummonType[]).map((type) => {
            const isSelected = selectedType === type;
            const typeColors: Record<SummonType, string> = {
              normal: '#9ca3af',
              premium: '#a855f7',
              legendary: '#f97316',
            };
            return (
              <button
                key={type}
                className={`
                  relative p-4 rounded-xl border transition-all
                  cursor-pointer overflow-hidden
                  ${isSelected ? 'border-current' : 'border-[var(--border)]'}
                `}
                style={{
                  borderColor: isSelected ? typeColors[type] : undefined,
                  background: isSelected
                    ? `linear-gradient(135deg, ${typeColors[type]}15, ${typeColors[type]}08)`
                    : 'var(--bg-surface)',
                  boxShadow: isSelected
                    ? `0 0 16px ${typeColors[type]}40`
                    : undefined,
                }}
                onClick={() => setSelectedType(type)}
              >
                {/* Glow on selected */}
                {isSelected && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(ellipse at center, ${typeColors[type]}, transparent)`,
                    }}
                  />
                )}
                <div className="relative z-10">
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{
                      color: isSelected ? typeColors[type] : '#e8e8f0',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {SUMMON_COSTS[type].label}
                  </div>
                  <div
                    className="text-lg font-bold mb-1"
                    style={{ color: isSelected ? typeColors[type] : '#8b8fa8' }}
                  >
                    💎 {SUMMON_COSTS[type].tokens}
                  </div>
                  <div className="text-xs" style={{ color: '#4a4d5e' }}>
                    {SUMMON_COSTS[type].bonus}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Probability bar */}
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs"
              style={{ color: '#8b8fa8', fontFamily: "'JetBrains Mono', monospace" }}
            >
              稀有度概率
            </span>
          </div>

          {/* Visual probability bar */}
          <div className="relative h-3 rounded-full overflow-hidden flex">
            {Object.entries(RARITY_CONFIG).map(([rarity, config], idx, arr) => {
              const pct = config.probability * 100;
              const prevSum = arr.slice(0, idx).reduce((s, [, c]) => s + c.probability * 100, 0);
              return (
                <div
                  key={rarity}
                  className="relative group"
                  style={{
                    width: `${pct}%`,
                    background: config.color,
                    opacity: 0.7,
                  }}
                >
                  <div className="absolute inset-0 hover:opacity-100 opacity-80 transition-opacity" />
                </div>
              );
            })}
          </div>

          {/* Labels */}
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(RARITY_CONFIG).map(([rarity, config]) => (
              <div key={rarity} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: config.color,
                    boxShadow: config.probability >= 0.04
                      ? `0 0 6px ${config.color}`
                      : 'none',
                  }}
                />
                <span
                  className="text-xs capitalize"
                  style={{ color: '#8b8fa8', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {rarity}: {(config.probability * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summon button */}
        <button
          className={`
            w-full py-4 rounded-xl font-bold text-lg
            transition-all relative overflow-hidden
            ${isSummoning || animPhase !== 'idle'
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer'
            }
          `}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #00d4ff20, #00d4ff08)',
            border: '1px solid rgba(0,212,255,0.4)',
            color: '#00d4ff',
            boxShadow: '0 0 20px rgba(0,212,255,0.15)',
          }}
          onClick={handleSummon}
          disabled={isSummoning || animPhase !== 'idle'}
        >
          {isSummoning || animPhase !== 'idle' ? (
            <span className="flex items-center justify-center gap-2">
              <div
                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
              />
              召唤中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>✨</span>
              <span>开始召唤</span>
              <span>💎 {SUMMON_COSTS[selectedType].tokens}</span>
            </span>
          )}
        </button>

        {/* Disclaimer */}
        <p
          className="text-xs text-center mt-3"
          style={{ color: '#4a4d5e' }}
        >
          每次召唤消耗 {SUMMON_COSTS[selectedType].tokens} 代币
        </p>
      </div>

      <style jsx>{`
        @keyframes legendary-pulse {
          0%, 100% { box-shadow: 0 0 25px rgba(249,115,22,0.7), 0 0 50px rgba(249,115,22,0.4); }
          50% { box-shadow: 0 0 40px rgba(249,115,22,0.9), 0 0 80px rgba(249,115,22,0.6); }
        }
        @keyframes mythic-rainbow {
          0% { box-shadow: 0 0 30px rgba(251,191,36,0.6); }
          33% { box-shadow: 0 0 30px rgba(168,85,247,0.6); }
          66% { box-shadow: 0 0 30px rgba(59,130,246,0.6); }
          100% { box-shadow: 0 0 30px rgba(251,191,36,0.6); }
        }
        @keyframes mythic-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-mythic-rainbow {
          animation: mythic-rainbow 3s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0, 0, 0.2, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
