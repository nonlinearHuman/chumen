/**
 * Skeleton - 骨架屏加载组件
 * 支持多种形状：text/circle/rect/card
 * 使用 shimmer 动画效果
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  /** 骨架形状 */
  variant?: 'text' | 'circle' | 'rect' | 'card';
  /** 数量（用于重复渲染） */
  count?: number;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 圆角 */
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  /** 自定义类名 */
  className?: string;
  /** 子元素间距 */
  gap?: number;
}

const variantStyles = {
  text: 'h-4 w-full rounded',
  circle: 'rounded-full aspect-square',
  rect: 'rounded-md',
  card: 'rounded-xl',
};

const roundedStyles = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

const defaultSizes = {
  text: { width: '100%', height: '16px' },
  circle: { width: '48px', height: '48px' },
  rect: { width: '100%', height: '120px' },
  card: { width: '100%', height: '180px' },
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  count = 1,
  width,
  height,
  rounded,
  className,
  gap = 12,
}) => {
  const size = defaultSizes[variant];
  const finalWidth = width || size.width;
  const finalHeight = height || size.height;
  const finalRounded = rounded || (variant === 'circle' ? 'full' : variant === 'card' ? 'lg' : 'md');

  const skeletonStyle: React.CSSProperties = {
    width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
    height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
  };

  const skeletonClass = cn(
    'relative overflow-hidden',
    'bg-[#12141c]', // 深色背景
    roundedStyles[finalRounded],
    className
  );

  // Shimmer 动画样式
  const shimmerStyle = `
    @keyframes skeleton-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;

  if (count === 1) {
    return (
      <>
        <style>{shimmerStyle}</style>
        <div className={skeletonClass} style={skeletonStyle}>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
              animation: 'skeleton-shimmer 2s infinite',
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClass} style={skeletonStyle}>
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                animation: 'skeleton-shimmer 2s infinite',
                animationDelay: `${index * 0.15}s`,
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

// 预设骨架屏组件
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton variant="card" className={className} />
);

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 48, 
  className 
}) => (
  <Skeleton variant="circle" width={size} height={size} className={className} />
);

export const SkeletonText: React.FC<{ 
  lines?: number; 
  lastLineWidth?: string;
  className?: string 
}> = ({ 
  lines = 3, 
  lastLineWidth = '60%',
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        width={i === lines - 1 ? lastLineWidth : '100%'} 
      />
    ))}
  </div>
);

export const SkeletonNFTCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 bg-[#12141c] rounded-xl border border-[#2a2d3a]', className)}>
    <Skeleton variant="rect" height={160} className="mb-3" />
    <Skeleton variant="text" width="70%" height={20} className="mb-2" />
    <Skeleton variant="text" width="50%" height={16} />
  </div>
);

export const SkeletonAgentCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-start gap-3 p-3 bg-[#12141c] rounded-xl border border-[#2a2d3a]', className)}>
    <Skeleton variant="circle" width={48} height={48} />
    <div className="flex-1">
      <Skeleton variant="text" width="60%" height={18} className="mb-2" />
      <Skeleton variant="text" width="80%" height={14} />
    </div>
  </div>
);

export default Skeleton;
