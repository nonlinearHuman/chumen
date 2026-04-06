'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TutorialStep, TUTORIAL_STEPS } from './tutorial-steps';
import { TUTORIAL_TASKS, TutorialTask, getTaskProgress, isTaskComplete } from '@/data/tutorialTasks';
import { useGameStore } from '@/store/gameStore';
import { Gift, Check, X } from 'lucide-react';

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
  const [showTasks, setShowTasks] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(currentStep);
  
  const { achievements, dialogues, nftProgress, cumulativePlayTime, playStartTime } = useGameStore();

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (isLastStep) {
      // 完成教程后显示新手任务面板
      setShowTasks(true);
      setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, 300);
    } else {
      setCurrentStep((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isAnimating, isLastStep, onComplete]);

  // 获取任务统计
  const getTaskStats = useCallback(() => {
    return {
      dialogueCount: dialogues.length,
      achievementCount: achievements.unlocked.length,
      nftCount: nftProgress.mintedAgents.length,
      exploreCount: achievements.visitedScenes.length,
      npcCount: achievements.npcTriggerCount,
      playTime: cumulativePlayTime + (playStartTime ? Date.now() - playStartTime : 0),
    };
  }, [dialogues, achievements, nftProgress, cumulativePlayTime, playStartTime]);

  // 领取任务奖励
  const claimReward = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };

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
      {/* 新手任务面板 */}
      {showTasks && (
        <div 
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,11,15,0.85)', backdropFilter: 'blur(16px)' }}
        >
          <div 
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a1d28 0%, #12141c 100%)',
              border: '1px solid rgba(255,184,0,0.2)',
              boxShadow: '0 0 40px rgba(255,184,0,0.15), 0 16px 48px rgba(0,0,0,0.6)',
            }}
          >
            {/* 顶部装饰线 */}
            <div 
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, transparent, #ffb800, transparent)' }}
            />
            
            {/* 头部 */}
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <h2 
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ 
                    color: '#ffb800',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <Gift className="w-6 h-6" />
                  新手任务
                </h2>
                <button
                  onClick={() => setShowTasks(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-125"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: '#8b8fa8',
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm" style={{ color: '#8b8fa8' }}>
                完成任务获得丰厚奖励！
              </p>
            </div>

            {/* 任务列表 */}
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {TUTORIAL_TASKS.map(task => {
                const stats = getTaskStats();
                const progress = getTaskProgress(task, stats);
                const complete = isTaskComplete(task, stats);
                const claimed = completedTasks.includes(task.id);
                
                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl"
                    style={{
                      background: complete ? 'rgba(255,184,0,0.08)' : 'rgba(18,20,28,0.6)',
                      border: `1px solid ${complete ? 'rgba(255,184,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{
                          background: complete ? 'rgba(255,184,0,0.15)' : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {complete && claimed ? '✅' : task.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium" style={{ color: '#e8e8f0' }}>
                          {task.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: '#8b8fa8' }}>
                          {task.description}
                        </p>
                        {!complete && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1" style={{ color: '#4a4d5e' }}>
                              <span>进度</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${progress}%`,
                                  background: 'linear-gradient(90deg, #ffb800, #ffd700)',
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,184,0,0.15)', color: '#ffb800' }}>
                            💰 {task.rewards.coins}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                            ⭐ {task.rewards.exp}
                          </span>
                          {task.rewards.items && task.rewards.items.map(item => (
                            <span key={item.id} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>
                              {item.icon} {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      {complete && !claimed && (
                        <button
                          onClick={() => claimReward(task.id)}
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                          style={{
                            background: 'rgba(255,184,0,0.2)',
                            border: '1px solid rgba(255,184,0,0.4)',
                            color: '#ffb800',
                          }}
                        >
                          领取
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 底部 */}
            <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-center" style={{ color: '#4a4d5e' }}>
                任务完成后可随时在菜单中查看
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 教程遮罩（非任务面板时显示） */}
      {!showTasks && (
        <>
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
        </>
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
