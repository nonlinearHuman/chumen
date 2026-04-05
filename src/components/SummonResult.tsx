'use client';

import React, { useState, useEffect } from 'react';
import { ComposedSprite, RARITY_CONFIG } from '@/types/traits';

interface SummonResultProps {
  result: ComposedSprite;
  onClose: () => void;
  onCollect: () => void;
}

// 格式化价格
function formatPrice(price: number | undefined): string {
  if (!price) return '0.00 ETH';
  if (price >= 1) return `${price.toFixed(2)} ETH`;
  if (price >= 0.01) return `${(price * 1000).toFixed(2)} mETH`;
  return `${(price * 1000000).toFixed(0)} μETH`;
}

// 格式化百分位
function formatPercentile(percentile: number): string {
  const pct = percentile * 100;
  if (pct <= 1) return `Top 1%`;
  if (pct <= 5) return `Top 5%`;
  if (pct <= 10) return `Top 10%`;
  if (pct <= 25) return `Top 25%`;
  return `Top ${Math.ceil(pct)}%`;
}

export default function SummonResult({ result, onClose, onCollect }: SummonResultProps) {
  const [showContent, setShowContent] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // 延迟显示动画
    const timer = setTimeout(() => {
      setShowContent(true);
      setTimeout(() => setIsFlipped(true), 500);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const rarityConfig = RARITY_CONFIG[result.rarity];
  const rarityColor = rarityConfig?.color || '#9ca3af';

  return (
    <div className="summon-result fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* 背景特效 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 光环效果 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle, ${rarityColor}40 0%, transparent 70%)`,
          }}
        />
        
        {/* 粒子效果 */}
        {result.rarity !== 'common' && (
          <div className="particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle absolute w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: rarityColor,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 卡片 */}
      <div
        className={`result-card relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${
          showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{
          maxWidth: '400px',
          width: '90%',
          border: `4px solid ${rarityColor}`,
        }}
      >
        {/* 顶部稀有度标签 */}
        <div
          className="rarity-badge px-4 py-2 text-center font-bold text-white uppercase tracking-wider"
          style={{ backgroundColor: rarityColor }}
        >
          {result.rarity}
        </div>

        {/* Agent预览 */}
        <div className="preview p-8 flex justify-center">
          <div
            className={`relative transition-transform duration-1000 ${
              isFlipped ? 'rotateY-0' : 'rotateY-180'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {result.previewUrl ? (
              <img
                src={result.previewUrl}
                alt="Summoned Agent"
                className="w-40 h-40 rounded-lg shadow-lg"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">加载中...</span>
              </div>
            )}
            
            {/* 闪烁效果（Epic+） */}
            {result.rarity === 'epic' && (
              <div className="absolute inset-0 rounded-lg animate-pulse bg-white/20" />
            )}
            
            {/* 光环效果（Legendary+） */}
            {(result.rarity === 'legendary' || result.rarity === 'mythic') && (
              <div
                className="absolute inset-0 rounded-lg animate-pulse"
                style={{
                  boxShadow: `0 0 30px ${rarityColor}, 0 0 60px ${rarityColor}`,
                }}
              />
            )}
          </div>
        </div>

        {/* DNA标识 */}
        <div className="dna text-center px-4 py-2 bg-gray-50 border-y border-gray-200">
          <span className="text-xs text-gray-500">DNA: </span>
          <span className="font-mono text-sm font-semibold">{result.dna}</span>
        </div>

        {/* NFT 属性展示 */}
        {result.nftAttrs && (
          <div className="nft-attrs p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
            {/* 稀有度排名和分数 */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">稀有度排名</span>
                <span className="font-bold text-lg text-purple-600">
                  #{result.nftAttrs.rank}
                </span>
                <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded">
                  {formatPercentile(result.nftAttrs.percentile)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">分数</span>
                <span className="font-bold text-purple-600">
                  {result.nftAttrs.score.toFixed(1)}
                </span>
              </div>
            </div>

            {/* 价格估算 */}
            {result.estimatedPrice && (
              <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg mb-3">
                <span className="text-sm text-gray-600">估算价格</span>
                <span className="font-bold text-lg text-green-600">
                  {formatPrice(result.estimatedPrice)}
                </span>
              </div>
            )}

            {/* 视觉评分和标签 */}
            {result.collectionAttrs && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">视觉评分</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        style={{ width: `${result.collectionAttrs.visualScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-orange-600">
                      {result.collectionAttrs.visualScore}
                    </span>
                  </div>
                </div>
                
                {result.collectionAttrs.visualTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.collectionAttrs.visualTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white/70 text-xs rounded-full text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 特征稀有度列表 */}
            <div className="trait-rarity">
              <span className="text-xs text-gray-500 mb-1 block">特征稀有度</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(result.nftAttrs.traitRarity).map(([traitId, score]) => {
                  const trait = result.traits.find(t => t.id === traitId);
                  if (!trait) return null;
                  return (
                    <div
                      key={traitId}
                      className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded text-xs"
                      title={`稀有度分数: ${score.toFixed(1)}`}
                    >
                      <span>{trait.nameZh}</span>
                      <span className="text-purple-500 font-mono">
                        {score.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 特征列表 */}
        <div className="traits p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">特征</h3>
          <div className="flex flex-wrap gap-2">
            {result.traits.map((trait) => (
              <span
                key={trait.id}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {trait.nameZh}
              </span>
            ))}
          </div>
        </div>

        {/* AI故事（Legendary/Mythic专属） */}
        {result.story && (
          <div className="story p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">📖 故事</h3>
            <p className="text-sm text-gray-600 italic">{result.story}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="actions p-4 flex gap-3 bg-gray-50">
          <button
            className="flex-1 py-3 rounded-lg border-2 border-gray-300 font-semibold hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            放弃
          </button>
          <button
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
            onClick={() => {
              onCollect();
              onClose();
            }}
          >
            收藏
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .particle {
          animation: float 2s ease-in-out infinite;
        }
        
        .result-card {
          animation: cardAppear 0.5s ease-out;
        }
        
        @keyframes cardAppear {
          from {
            transform: scale(0.5) rotateY(180deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
