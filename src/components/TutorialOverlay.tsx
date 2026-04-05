'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TutorialStep, TUTORIAL_STEPS } from './tutorial-steps';

interface TutorialOverlayProps {
  steps?: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps = TUTORIAL_STEPS,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(currentStep);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isAnimating, isLastStep, onComplete]);

  // 查找目标元素并计算位置
  const updateTargetPosition = useCallback(() => {
    if (!step.targetSelector) {
      setTargetRect(null);
      return;
    }
    try {
      const selector = step.targetSelector;
      let element: Element | null = null;
      if (selector.includes(':has-text(')) {
        const match = selector.match(/^(.+):has-text\("(.+)"\)$/);
        if (match) {
          const baseSelector = match[1];
          const text = match[2];
          const allElements = document.querySelectorAll(baseSelector);
          for (const el of allElements) {
            if (el.textContent?.includes(text)) {
              element = el;
              break;
            }
          }
        }
      } else {
        element = document.querySelector(selector);
      }
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } catch {
      setTargetRect(null);
    }
  }, [step.targetSelector]);

  // 重置动画状态当步骤变化
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      setIsAnimating(false);
    }
  }, [currentStep]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [updateTargetPosition]);

  // 点击遮罩区域
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (step.action === 'click' && step.actionSelector) return;
      nextStep();
    },
    [step, nextStep]
  );

  // 点击操作按钮
  const handleActionClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (step.action === 'click' && step.actionSelector) {
        const selector = step.actionSelector;
        try {
          let element: Element | null = null;
          if (selector.includes(':has-text(')) {
            const match = selector.match(/^(.+):has-text\("(.+)"\)$/);
            if (match) {
              const baseSelector = match[1];
              const text = match[2];
              const allElements = document.querySelectorAll(baseSelector);
              for (const el of allElements) {
                if (el.textContent?.includes(text)) {
                  element = el;
                  break;
                }
              }
            }
          } else {
            element = document.querySelector(selector);
          }
          if (element instanceof HTMLElement) {
            element.click();
          }
        } catch { /* ignore */ }
      }
      nextStep();
    },
    [step, nextStep]
  );

  // 计算气泡位置
  const getBubbleStyle = (): React.CSSProperties => {
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      };
    }
    const padding = step.highlightPadding ?? 8;
    const bubbleWidth = 320;
    const bubbleHeight = 180;
    let style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: bubbleWidth,
      transition: 'all 0.3s ease',
    };
    switch (step.position) {
      case 'top':
        style.left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;
        style.top = targetRect.top - bubbleHeight - padding - 12;
        if (style.left < 16) style.left = 16;
        if (style.left + bubbleWidth > window.innerWidth - 16)
          style.left = window.innerWidth - bubbleWidth - 16;
        break;
      case 'bottom':
        style.left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;
        style.top = targetRect.bottom + padding + 12;
        if (style.left < 16) style.left = 16;
        if (style.left + bubbleWidth > window.innerWidth - 16)
          style.left = window.innerWidth - bubbleWidth - 16;
        break;
      case 'left':
        style.left = targetRect.left - bubbleWidth - padding - 12;
        style.top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2;
        break;
      case 'right':
        style.left = targetRect.right + padding + 12;
        style.top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2;
        break;
    }
    return style;
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] pointer-events-auto"
      style={{ cursor: step.action === 'click' ? 'pointer' : 'default' }}
    >
      {/* SVG 遮罩 */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - (step.highlightPadding ?? 8)}
                y={targetRect.top - (step.highlightPadding ?? 8)}
                width={targetRect.width + ((step.highlightPadding ?? 8) * 2)}
                height={targetRect.height + ((step.highlightPadding ?? 8) * 2)}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* 高亮边框 */}
      {targetRect && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: targetRect.left - (step.highlightPadding ?? 8),
            top: targetRect.top - (step.highlightPadding ?? 8),
            width: targetRect.width + ((step.highlightPadding ?? 8) * 2),
            height: targetRect.height + ((step.highlightPadding ?? 8) * 2),
            border: '2px solid #8b5cf6',
            borderRadius: 8,
            boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.4)',
            animation: 'tutorial-pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* 气泡 */}
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-80"
        style={{
          ...getBubbleStyle(),
          opacity: isAnimating ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
        onClick={handleOverlayClick}
      >
        {/* 箭头 */}
        {targetRect && step.position !== 'center' && (
          <div
            className="absolute w-4 h-4 bg-white transform rotate-45"
            style={{
              ...(step.position === 'top' && {
                bottom: -7,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
              }),
              ...(step.position === 'bottom' && {
                top: -7,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
              }),
              ...(step.position === 'left' && {
                right: -7,
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
              }),
              ...(step.position === 'right' && {
                left: -7,
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
              }),
            }}
          />
        )}

        {/* 进度指示 */}
        <div className="flex items-center gap-1 mb-3">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-6 bg-purple-500'
                  : idx < currentStep
                  ? 'w-1.5 bg-purple-300'
                  : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* 标题 */}
        <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>

        {/* 描述 */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {step.description}
        </p>

        {/* 按钮 */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            跳过教程
          </button>

          <button
            onClick={handleActionClick}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isLastStep ? '🎮 开始游戏' : step.action === 'click' ? '点击体验' : '下一步'}
          </button>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes tutorial-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.2), 0 0 30px rgba(139, 92, 246, 0.6); }
        }
      `}</style>
    </div>
  );
};
