'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Copy, Download, Share2 } from 'lucide-react';

type ShareType = 'achievement' | 'character' | 'nft' | 'stats' | 'daily';

interface ShareData {
  icon?: string;
  title: string;
  description?: string;
  rarity?: string;
  name?: string;
  stats?: {
    dialogues: number;
    events: number;
    playTime: string;
    achievements: number;
  };
  challenges?: string[];
}

interface ShareCardProps {
  type: ShareType;
  data: ShareData;
  onClose: () => void;
}

// 稀有度配置
const RARITY_CONFIG: Record<string, { color: string; gradient: string }> = {
  '普通': { color: '#9ca3af', gradient: 'from-gray-500/20 to-gray-600/10' },
  '罕见': { color: '#22c55e', gradient: 'from-green-500/20 to-green-600/10' },
  '稀有': { color: '#3b82f6', gradient: 'from-blue-500/20 to-blue-600/10' },
  '史诗': { color: '#a855f7', gradient: 'from-purple-500/20 to-purple-600/10' },
  '传奇': { color: '#f97316', gradient: 'from-orange-500/20 to-orange-600/10' },
  '神话': { color: '#fbbf24', gradient: 'from-yellow-500/20 to-yellow-600/10' },
};

export const ShareCard: React.FC<ShareCardProps> = ({ type, data, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // 绘制分享卡片
  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 400;
    const height = 500;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 背景 - 暗色电影感
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1a1d28');
    bgGradient.addColorStop(1, '#0a0b0f');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 顶部装饰线
    const topGradient = ctx.createLinearGradient(0, 0, width, 0);
    const accentColor = type === 'achievement' ? '#ffb800' : type === 'nft' ? '#a855f7' : '#00d4ff';
    topGradient.addColorStop(0, 'transparent');
    topGradient.addColorStop(0.5, accentColor);
    topGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, 2);

    // Logo
    ctx.fillStyle = '#e8e8f0';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎬 楚门 World', width / 2, 50);

    // 类型标签
    const typeLabels: Record<ShareType, string> = {
      achievement: '🏆 成就解锁',
      character: '🎭 角色卡片',
      nft: '💎 NFT 收藏',
      stats: '📊 游戏数据',
      daily: '🎯 今日挑战',
    };
    ctx.fillStyle = accentColor;
    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.fillText(typeLabels[type], width / 2, 85);

    // 根据类型绘制内容
    let yOffset = 140;

    if (type === 'achievement' || type === 'character' || type === 'nft') {
      // 图标/头像
      if (data.icon) {
        ctx.font = '64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.icon, width / 2, yOffset + 40);
        yOffset += 100;
      }

      // 标题
      ctx.fillStyle = '#ffb800';
      ctx.font = 'bold 28px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(data.title, width / 2, yOffset);
      yOffset += 40;

      // 稀有度标签
      if (data.rarity) {
        const rarityConfig = RARITY_CONFIG[data.rarity] || RARITY_CONFIG['普通'];
        ctx.fillStyle = rarityConfig.color;
        ctx.font = '16px "Space Grotesk", sans-serif';
        ctx.fillText(`✨ ${data.rarity}`, width / 2, yOffset);
        yOffset += 35;
      }

      // 描述
      if (data.description) {
        ctx.fillStyle = '#8b8fa8';
        ctx.font = '16px "IBM Plex Sans", sans-serif';
        wrapText(ctx, data.description, width / 2, yOffset, width - 80, 24);
      }
    } else if (type === 'stats' && data.stats) {
      const stats = [
        `💬 对话 ${data.stats.dialogues} 条`,
        `🎭 事件 ${data.stats.events} 次`,
        `⏰ 时长 ${data.stats.playTime}`,
        `🏆 成就 ${data.stats.achievements} 个`,
      ];
      
      stats.forEach((stat, i) => {
        ctx.fillStyle = '#e8e8f0';
        ctx.font = '20px "IBM Plex Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stat, width / 2, yOffset + i * 45);
      });
    } else if (type === 'daily' && data.challenges) {
      data.challenges.forEach((challenge, i) => {
        ctx.fillStyle = '#00ff88';
        ctx.font = '18px "IBM Plex Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`✅ ${challenge}`, width / 2, yOffset + i * 40);
      });
    }

    // 底部水印
    ctx.fillStyle = 'rgba(139,143,168,0.5)';
    ctx.font = '12px "IBM Plex Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('#楚门World #AI游戏', width / 2, height - 40);

    // 生成图片URL
    setImageUrl(canvas.toDataURL('image/png'));
  }, [type, data]);

  useEffect(() => {
    drawCard();
  }, [drawCard]);

  // 复制图片
  const handleCopyImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制图片失败:', error);
    }
  };

  // 下载图片
  const handleDownloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `chumen-${type}-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
  };

  // 复制文字
  const handleCopyText = () => {
    const text = generateShareText(type, data);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(10,11,15,0.85)' }}
        onClick={onClose}
      />

      {/* 隐藏的 Canvas */}
      <canvas ref={canvasRef} width={400} height={500} className="hidden" />

      {/* 卡片 */}
      <div 
        className="relative w-full max-w-sm overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, #1a1d28 0%, #12141c 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* 顶部装饰线 */}
        <div 
          className="h-0.5 w-full"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${
              type === 'achievement' ? '#ffb800' : type === 'nft' ? '#a855f7' : '#00d4ff'
            }, transparent)` 
          }}
        />

        {/* 头部 */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 
            className="text-lg font-bold flex items-center gap-2"
            style={{ 
              color: type === 'achievement' ? '#ffb800' : type === 'nft' ? '#a855f7' : '#00d4ff',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Share2 className="w-5 h-5" />
            分享
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-125"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#8b8fa8',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 预览图片 */}
        {imageUrl && (
          <div className="p-4">
            <img 
              src={imageUrl} 
              alt="分享卡片" 
              className="w-full rounded-xl"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleCopyImage}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:brightness-110"
            style={{
              background: 'rgba(0,212,255,0.15)',
              border: '1px solid rgba(0,212,255,0.3)',
              color: '#00d4ff',
            }}
          >
            <Copy className="w-4 h-4" />
            {copied ? '已复制图片' : '复制图片'}
          </button>

          <button
            onClick={handleDownloadImage}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:brightness-110"
            style={{
              background: 'rgba(255,184,0,0.15)',
              border: '1px solid rgba(255,184,0,0.3)',
              color: '#ffb800',
            }}
          >
            <Download className="w-4 h-4" />
            下载图片
          </button>

          <button
            onClick={handleCopyText}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:brightness-110"
            style={{
              background: 'rgba(168,85,247,0.15)',
              border: '1px solid rgba(168,85,247,0.3)',
              color: '#a855f7',
            }}
          >
            <Copy className="w-4 h-4" />
            复制文字
          </button>
        </div>

        {/* 社交平台按钮（预留） */}
        <div className="px-4 pb-4">
          <p className="text-xs text-center mb-2" style={{ color: '#4a4d5e' }}>
            分享到
          </p>
          <div className="flex justify-center gap-2">
            <button 
              className="px-4 py-2 rounded-lg text-xs"
              style={{
                background: 'rgba(7,193,96,0.15)',
                color: '#07c160',
              }}
            >
              微信
            </button>
            <button 
              className="px-4 py-2 rounded-lg text-xs"
              style={{
                background: 'rgba(230,22,45,0.15)',
                color: '#e6162d',
              }}
            >
              微博
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 生成分享文字
function generateShareText(type: ShareType, data: ShareData): string {
  const header = '🎬 楚门 World - AI真人秀世界\n\n';
  const footer = '\n\n#楚门World #AI游戏';

  switch (type) {
    case 'achievement':
      return `${header}🏆 我解锁了成就「${data.title}」！\n${data.rarity ? `✨ ${data.rarity}\n` : ''}${data.description || ''}${footer}`;
    case 'character':
      return `${header}🎭 我发现了新角色「${data.title}」！\n${data.description || ''}${footer}`;
    case 'nft':
      return `${header}💎 我获得了珍藏角色「${data.title}」！\n${data.rarity ? `✨ ${data.rarity}\n` : ''}${data.description || ''}${footer}`;
    case 'stats':
      if (data.stats) {
        return `${header}📊 我的游戏数据：\n\n💬 对话 ${data.stats.dialogues} 条\n🎭 事件 ${data.stats.events} 次\n⏰ 游戏时长 ${data.stats.playTime}\n🏆 成就 ${data.stats.achievements} 个${footer}`;
      }
      return header + footer;
    case 'daily':
      if (data.challenges) {
        return `${header}🎯 今日挑战完成：\n\n${data.challenges.map(c => `✅ ${c}`).join('\n')}${footer}`;
      }
      return header + footer;
    default:
      return header + footer;
  }
}

// 文字换行辅助函数
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split('');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
