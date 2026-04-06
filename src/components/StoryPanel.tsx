// 楚门World — StoryPanel（电影感会话界面）
// Phase 2 重构
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dialogue } from '@/types/agent';
import { DialogueBubble } from './DialogueBubble';
import { HighlightDialogue, isHighlightDialogue } from './HighlightDialogue';

interface StoryPanelProps {
  dialogues: Dialogue[];
  isPlaying: boolean;
  maxVisible?: number;
  accentColor?: string;
}

export const StoryPanel: React.FC<StoryPanelProps> = ({
  dialogues,
  isPlaying,
  maxVisible = 20,
  accentColor = '#00d4ff',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const prevLengthRef = useRef(dialogues.length);

  // Auto-scroll to bottom when new dialogue arrives
  useEffect(() => {
    if (!isPlaying) return;
    if (dialogues.length > prevLengthRef.current && isAutoScroll) {
      const container = containerRef.current;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    prevLengthRef.current = dialogues.length;
  }, [dialogues.length, isPlaying, isAutoScroll]);

  // Detect manual scroll to pause auto-scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop - clientHeight < 80;
    setIsAutoScroll(atBottom);
  }, []);

  const visibleDialogues = dialogues.slice(-maxVisible);

  if (dialogues.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-4 px-4"
        style={{ minHeight: '300px' }}
      >
        {/* Cinematic frame decoration */}
        <div className="relative">
          {/* Corner brackets — film frame aesthetic */}
          <div
            className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2"
            style={{ borderColor: `${accentColor}60` }}
          />
          <div
            className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2"
            style={{ borderColor: `${accentColor}60` }}
          />
          <div
            className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2"
            style={{ borderColor: `${accentColor}60` }}
          />
          <div
            className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2"
            style={{ borderColor: `${accentColor}60` }}
          />

          {/* Center icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `${accentColor}10`,
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 0 30px ${accentColor}15, inset 0 0 20px ${accentColor}08`,
            }}
          >
            <span
              className="text-4xl"
              style={{ filter: `drop-shadow(0 0 8px ${accentColor})` }}
            >
              🎬
            </span>
          </div>
        </div>

        <div className="text-center">
          <p
            className="text-sm font-display mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            点击「开始」启动真人秀
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--text-muted)', maxWidth: '280px' }}
          >
            AI Agent 将在场景中自由对话
            <br />
            NPC 会在关键时刻介入制造戏剧冲突
          </p>
        </div>

        {/* Film strip decoration at bottom — subtle */}
        <div className="flex gap-1 mt-6 opacity-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-3 rounded-sm"
              style={{
                background: `${accentColor}50`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      {/* Scroll indicator when not at bottom */}
      {!isAutoScroll && (
        <button
          onClick={() => {
            const container = containerRef.current;
            if (container) {
              container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
              setIsAutoScroll(true);
            }
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display
            animate-fade-in-up transition-all hover:brightness-110 active:scale-95"
          style={{
            background: 'rgba(10,11,15,0.9)',
            border: `1px solid ${accentColor}50`,
            color: accentColor,
            boxShadow: `0 0 15px ${accentColor}30`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="text-sm">↓</span>
          <span>最新消息</span>
        </button>
      )}

      {/* Dialogue stream */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 sm:px-6 py-4 space-y-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Timeline header */}
        <div className="flex items-center gap-3 mb-4 opacity-40">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40)` }} />
          <span
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.2em' }}
          >
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${accentColor}40, transparent)` }} />
        </div>

        {/* Dialogue list */}
        {visibleDialogues.map((dialogue, index) => {
          const isNew = index === visibleDialogues.length - 1 && isPlaying;
          const isHighlight = isHighlightDialogue(dialogue.content);

          return (
            <div
              key={dialogue.id}
              className={isNew ? 'animate-fade-in-up' : ''}
              style={
                isNew
                  ? {
                      animation: 'fade-in-up 0.35s cubic-bezier(0, 0, 0.2, 1) forwards',
                    }
                  : undefined
              }
            >
              {isHighlight ? (
                <HighlightDialogue dialogue={dialogue} />
              ) : (
                <DialogueBubble dialogue={dialogue} />
              )}
            </div>
          );
        })}

        {/* End of feed marker */}
        {isPlaying && (
          <div className="flex items-center gap-3 py-3 opacity-40">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}30)` }} />
            <div className="flex items-center gap-1.5">
              <span
                className="animate-recording-pulse text-xs"
                style={{ color: '#ff2d78', fontSize: '8px' }}
              >
                ●
              </span>
              <span
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}
              >
                LIVE
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${accentColor}30, transparent)` }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryPanel;
