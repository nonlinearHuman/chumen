/**
 * EmptyState - 空状态组件
 * 用于展示无数据、无内容、网络错误等空状态
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** 图标（emoji或自定义元素） */
  icon?: React.ReactNode;
  /** 标题 */
  title: string;
  /** 描述文本 */
  description?: string;
  /** 操作按钮 */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** 场景类型（预设图标和文案） */
  scenario?: 'nft' | 'chat' | 'achievement' | 'error' | 'search' | 'generic';
  /** 自定义类名 */
  className?: string;
}

const scenarioConfig = {
  nft: {
    icon: '🖼️',
    defaultTitle: '暂无 NFT 收藏',
    defaultDesc: '开始召唤你的第一个 AI 角色吧',
  },
  chat: {
    icon: '💬',
    defaultTitle: '暂无对话记录',
    defaultDesc: 'AI 角色们正在酝酿新的剧情...',
  },
  achievement: {
    icon: '🏆',
    defaultTitle: '暂无成就',
    defaultDesc: '继续探索，解锁更多成就吧',
  },
  error: {
    icon: '⚠️',
    defaultTitle: '加载失败',
    defaultDesc: '网络似乎出了点问题',
  },
  search: {
    icon: '🔍',
    defaultTitle: '未找到结果',
    defaultDesc: '换个关键词试试？',
  },
  generic: {
    icon: '📭',
    defaultTitle: '这里空空如也',
    defaultDesc: '什么都没有',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  scenario = 'generic',
  className,
}) => {
  const config = scenarioConfig[scenario];
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayDesc = description || config.defaultDesc;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        'animate-fade-in-up',
        className
      )}
      style={{ animationDuration: '0.35s' }}
    >
      {/* 图标容器 - 浮动动画 */}
      <div
        className="mb-6 text-6xl"
        style={{
          animation: 'empty-state-float 3s ease-in-out infinite',
        }}
      >
        {displayIcon}
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-medium text-[#e8e8f0] mb-2">
        {displayTitle}
      </h3>

      {/* 描述 */}
      {displayDesc && (
        <p className="text-sm text-[#8b8fa8] mb-6 max-w-xs">
          {displayDesc}
        </p>
      )}

      {/* 操作按钮 */}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary text-sm"
        >
          {action.label}
        </button>
      )}

      {/* 浮动动画样式 */}
      <style>{`
        @keyframes empty-state-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

// 预设场景组件
export const EmptyNFT: React.FC<{ onSummon?: () => void }> = ({ onSummon }) => (
  <EmptyState
    scenario="nft"
    title="暂无 NFT 收藏"
    description="开始召唤你的第一个 AI 角色"
    action={onSummon ? { label: '召唤角色', onClick: onSummon } : undefined}
  />
);

export const EmptyChat: React.FC = () => (
  <EmptyState
    scenario="chat"
    title="暂无对话记录"
    description="AI 角色们正在酝酿新的剧情..."
  />
);

export const EmptyAchievement: React.FC = () => (
  <EmptyState
    scenario="achievement"
    title="暂无成就"
    description="继续探索，解锁更多成就吧"
  />
);

export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    scenario="error"
    title="加载失败"
    description="网络似乎出了点问题"
    action={onRetry ? { label: '重试', onClick: onRetry } : undefined}
  />
);

export const NoSearchResults: React.FC<{ keyword?: string }> = ({ keyword }) => (
  <EmptyState
    scenario="search"
    title="未找到结果"
    description={keyword ? `没有找到与"${keyword}"相关的内容` : '换个关键词试试？'}
  />
);

export default EmptyState;
