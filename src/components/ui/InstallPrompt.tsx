/**
 * InstallPrompt - PWA 安装引导组件
 * 检测 beforeinstallprompt 事件，引导用户添加到主屏幕
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  /** 自定义类名 */
  className?: string;
  /** 延迟显示（毫秒） */
  delay?: number;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  className,
  delay = 3000,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 检查是否已安装或已关闭
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 延迟显示，避免打扰用户
      setTimeout(() => {
        setShowPrompt(true);
      }, delay);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 检查是否已作为 PWA 运行
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsDismissed(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [delay]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      // 显示安装提示
      await deferredPrompt.prompt();
      
      // 等待用户选择
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // 用户接受安装
        setShowPrompt(false);
      } else {
        // 用户拒绝
        setIsInstalling(false);
      }
    } catch (error) {
      console.error('安装失败:', error);
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setIsDismissed(true);
    // 记住用户选择，7天内不再提示
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  // 不显示的条件
  if (!showPrompt || isDismissed || !deferredPrompt) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      aria-describedby="install-desc"
      className={cn(
        'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96',
        'z-[100] animate-slide-in-up',
        className
      )}
    >
      <div
        className="p-4 rounded-xl border"
        style={{
          background: 'rgba(18, 20, 28, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 184, 0, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 184, 0, 0.15)',
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          aria-label="关闭"
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[#8b8fa8] hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* 内容 */}
        <div className="flex items-start gap-3">
          <div className="text-3xl">📱</div>
          <div className="flex-1">
            <h3 id="install-title" className="text-sm font-semibold text-[#ffb800] mb-1">
              添加到主屏幕
            </h3>
            <p id="install-desc" className="text-xs text-[#8b8fa8] mb-3">
              安装楚门World，获得更好的体验和离线访问能力
            </p>

            {/* 按钮 */}
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="btn-gold text-xs flex-1"
              >
                {isInstalling ? '安装中...' : '立即安装'}
              </button>
              <button
                onClick={handleDismiss}
                className="btn-ghost text-xs"
              >
                暂不
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

// iOS Safari 安装提示（手动）
export const IOSInstallHint: React.FC<{ className?: string }> = ({ className }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 检测 iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    
    // 检测是否已安装
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
  }, []);

  if (!isIOS || isStandalone) return null;

  return (
    <div
      className={cn(
        'p-3 rounded-lg border border-[#2a2d3a] bg-[#12141c]',
        className
      )}
    >
      <p className="text-xs text-[#8b8fa8]">
        <span className="text-[#ffb800]">💡 提示：</span>
        点击 Safari 分享按钮 
        <span className="inline-block mx-1">⬆️</span>
        然后选择"添加到主屏幕"
      </p>
    </div>
  );
};

export default InstallPrompt;
