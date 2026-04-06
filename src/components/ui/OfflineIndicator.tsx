/**
 * OfflineIndicator - 离线提示组件
 * 检测网络状态，断网时显示顶部横幅
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  /** 自定义类名 */
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // 初始状态
    setIsOnline(navigator.onLine);

    // 监听网络状态变化
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // 3秒后隐藏恢复提示
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 在线状态不显示
  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-16 left-0 right-0 z-[100] px-4 py-3 text-center text-sm font-medium',
        'animate-slide-in-down',
        className
      )}
      style={{
        background: showReconnected
          ? 'linear-gradient(90deg, #00ff8820, #00ff8810)'
          : 'linear-gradient(90deg, #ff2d7820, #ff2d7810)',
        borderBottom: showReconnected
          ? '1px solid rgba(0, 255, 136, 0.3)'
          : '1px solid rgba(255, 45, 120, 0.3)',
        color: showReconnected ? '#00ff88' : '#ff2d78',
        boxShadow: showReconnected
          ? '0 4px 16px rgba(0, 255, 136, 0.2)'
          : '0 4px 16px rgba(255, 45, 120, 0.2)',
      }}
    >
      <span className="flex items-center justify-center gap-2">
        {showReconnected ? (
          <>
            <span>✓</span>
            <span>网络已恢复</span>
          </>
        ) : (
          <>
            <span className="animate-pulse">⚠</span>
            <span>网络连接已断开，部分功能可能不可用</span>
          </>
        )}
      </span>

      <style>{`
        @keyframes slide-in-down {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-down {
          animation: slide-in-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// 网络状态 Hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default OfflineIndicator;
