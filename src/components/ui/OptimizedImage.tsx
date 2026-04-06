/**
 * OptimizedImage - 优化图片组件
 * 支持懒加载、占位符、模糊预览
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps {
  /** 图片源 */
  src: string;
  /** 替代文本（必需） */
  alt: string;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 是否填充容器 */
  fill?: boolean;
  /** 占位符类型 */
  placeholder?: 'blur' | 'empty' | 'skeleton';
  /** 模糊占位符数据URL */
  blurDataURL?: string;
  /** 优先加载 */
  priority?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 图片适应方式 */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  /** 圆角 */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** 加载完成回调 */
  onLoad?: () => void;
  /** 加载失败回调 */
  onError?: () => void;
}

// 默认模糊占位符（1x1 灰色像素）
const defaultBlurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  placeholder = 'blur',
  blurDataURL = defaultBlurDataURL,
  priority = false,
  className,
  objectFit = 'cover',
  rounded = 'md',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const objectFitClass = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
  }[objectFit];

  return (
    <div className={cn('relative overflow-hidden', roundedClasses[rounded], className)}>
      {/* 占位符 */}
      {isLoading && placeholder === 'skeleton' && (
        <div className="absolute inset-0 bg-[#12141c] animate-pulse">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
      )}

      {/* 图片 */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          objectFitClass,
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        placeholder={placeholder === 'blur' ? 'blur' : 'empty'}
        blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
          onError?.();
        }}
      />

      {/* 错误状态 */}
      {hasError && (
        <div className="absolute inset-0 bg-[#12141c] flex items-center justify-center">
          <span className="text-2xl opacity-50">🖼️</span>
        </div>
      )}

      {/* Shimmer 动画 */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

// 预设组件 - NFT 头像
export const NFTAvatar: React.FC<{
  src?: string;
  emoji: string;
  rarity?: string;
  size?: number;
}> = ({ src, emoji, rarity, size = 64 }) => {
  const rarityGlow: Record<string, string> = {
    uncommon: '0 0 12px rgba(34,197,94,0.4)',
    rare: '0 0 16px rgba(59,130,246,0.5)',
    epic: '0 0 20px rgba(168,85,247,0.6)',
    legendary: '0 0 24px rgba(249,115,22,0.7)',
    mythic: '0 0 28px rgba(251,191,36,0.8)',
  };

  if (!src) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-[#1a1d28]"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.6,
          boxShadow: rarity ? rarityGlow[rarity] || 'none' : 'none',
        }}
      >
        {emoji}
      </div>
    );
  }

  return (
    <div
      className="rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        boxShadow: rarity ? rarityGlow[rarity] || 'none' : 'none',
      }}
    >
      <OptimizedImage
        src={src}
        alt={`${emoji} avatar`}
        width={size}
        height={size}
        rounded="full"
      />
    </div>
  );
};

// 预设组件 - 场景图片
export const SceneImage: React.FC<{
  src: string;
  name: string;
}> = ({ src, name }) => (
  <OptimizedImage
    src={src}
    alt={name}
    fill
    objectFit="cover"
    placeholder="skeleton"
    className="aspect-video"
  />
);

export default OptimizedImage;
