'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ShareCardProps {
  type: 'achievement' | 'stats' | 'daily' | 'nft';
  data: any;
  onClose: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({ type, data, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 400, 500);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 500);

    // 绘制标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎬 楚门 World', 200, 60);

    // 根据类型绘制不同内容
    if (type === 'achievement') {
      ctx.font = '40px sans-serif';
      ctx.fillText(data.icon, 200, 150);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(data.title, 200, 220);
      ctx.font = '16px sans-serif';
      // 换行处理描述
      wrapText(ctx, data.description, 200, 260, 360, 22);
    } else if (type === 'stats') {
      ctx.font = '18px sans-serif';
      const stats = [
        `💬 对话: ${data.dialogues}`,
        `🎭 事件: ${data.events}`,
        `⏰ 时长: ${data.playTime}`,
        `🏆 成就: ${data.achievements}/16`,
      ];
      stats.forEach((stat, i) => {
        ctx.fillText(stat, 200, 150 + i * 40);
      });
    } else if (type === 'daily') {
      ctx.font = '16px sans-serif';
      const challenges = data.challenges || [];
      challenges.forEach((c: string, i: number) => {
        ctx.fillText(`✅ ${c}`, 200, 150 + i * 36);
      });
    } else if (type === 'nft') {
      ctx.font = '40px sans-serif';
      ctx.fillText(data.icon || '💎', 200, 150);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(data.name || 'NFT', 200, 220);
      ctx.font = '16px sans-serif';
      ctx.fillText(data.description || '珍藏角色', 200, 260);
    }

    // 底部水印
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('#楚门World #AI游戏', 200, 470);

    setImageUrl(canvas.toDataURL('image/png'));
  }, [type, data]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">📤 分享</h2>

        {/* 预览画布 */}
        <canvas ref={canvasRef} width={400} height={500} className="hidden" />

        {imageUrl && (
          <div className="mb-4">
            <img src={imageUrl} alt="分享卡片" className="w-full rounded-xl" />
          </div>
        )}

        {/* 分享按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (imageUrl) {
                fetch(imageUrl)
                  .then((res) => res.blob())
                  .then((blob) => {
                    navigator.clipboard.write([
                      new ClipboardItem({ 'image/png': blob }),
                    ]);
                    alert('图片已复制到剪贴板！');
                  })
                  .catch(() => alert('复制失败，请尝试复制文字'));
              }
            }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            📋 复制图片
          </button>
          <button
            onClick={() => {
              const text = generateShareText(type, data);
              navigator.clipboard.writeText(text);
              alert('文字已复制到剪贴板！');
            }}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            📝 复制文字
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  );
};

function generateShareText(type: string, data: any): string {
  switch (type) {
    case 'achievement':
      return `🏆 我在《楚门 World》解锁了成就「${data.title}」！\n\n${data.description}\n\n🎬 楚门 World - AI真人秀世界\n#楚门World #AI游戏`;
    case 'stats':
      return `📊 我的《楚门 World》数据：\n\n💬 对话: ${data.dialogues}条\n🎭 事件: ${data.events}次\n⏰ 游戏时长: ${data.playTime}\n🏆 成就: ${data.achievements}/16\n\n🎬 楚门 World - AI真人秀世界\n#楚门World #AI游戏`;
    case 'daily':
      const challenges = data.challenges || [];
      return `🎯 我完成了《楚门 World》今日挑战：\n\n${challenges.map((c: string) => `✅ ${c}`).join('\n')}\n\n🎬 楚门 World - AI真人秀世界\n#楚门World`;
    case 'nft':
      return `💎 我获得了《楚门 World》珍藏角色「${data.name}」！\n\n${data.description || '独一无二的存在'}\n\n🎬 楚门 World - AI真人秀世界\n#楚门World #NFT`;
    default:
      return `🎬 楚门 World - AI真人秀世界\n#楚门World`;
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
