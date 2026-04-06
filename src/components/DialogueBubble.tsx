// 对话气泡 — 电影字幕风格 (Premium 升级版)
// src/components/DialogueBubble.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dialogue } from '@/types/agent';
import { getAgentById } from '@/config/agents';
import { moodEmojis, Mood } from '@/types/mood';

interface DialogueBubbleProps {
  dialogue: Dialogue;
  mood?: Mood['mood'];
}

// Format timestamp as cyber timecode: HH:MM:SS
function formatTimecode(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Typewriter hook — reveals text character by character
function useTypewriter(text: string, active: boolean, speed = 30) {
  const [displayed, setDisplayed] = useState(active ? '' : text);

  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);

  return displayed;
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({ dialogue, mood }) => {
  const agent = getAgentById(dialogue.agentId);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Entrance: fade + slide up when scrolled into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!agent) return null;

  const timecode = formatTimecode(dialogue.timestamp);
  const isNPC = agent.isNPC;
  const moodEmoji = mood ? moodEmojis[mood] : null;

  return (
    <div
      ref={ref}
      className="flex gap-4 mb-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s cubic-bezier(0,0,0.2,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Avatar column */}
      <div className="flex flex-col items-center flex-shrink-0 w-12">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: 'rgba(26, 29, 40, 0.9)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isNPC ? 'rgba(255,184,0,0.4)' : 'rgba(0,212,255,0.2)'}`,
            boxShadow: isNPC
              ? '0 0 14px rgba(255,184,0,0.3)'
              : '0 0 14px rgba(0,212,255,0.2)',
          }}
        >
          {agent.emoji}
        </div>
        {/* NPC golden indicator below avatar */}
        {isNPC && (
          <span
            className="mt-1 text-[8px] font-bold px-1 py-0.5 rounded-sm"
            style={{
              background: 'linear-gradient(135deg, #ffb800, #ff8c00)',
              color: '#1a1000',
              letterSpacing: '0.05em',
            }}
          >
            NFT
          </span>
        )}
        {moodEmoji && (
          <span className="mt-1 text-sm">{moodEmoji}</span>
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        {/* Header: name + timecode */}
        <div className="flex items-baseline gap-3 mb-2">
          {/* Role name with typewriter effect on first render */}
          <span
            className="font-display font-semibold text-sm"
            style={{
              color: isNPC ? '#ffb800' : '#00d4ff',
              textShadow: isNPC
                ? '0 0 10px rgba(255,184,0,0.4)'
                : '0 0 10px rgba(0,212,255,0.3)',
              letterSpacing: '0.04em',
            }}
          >
            {agent.nameCN}
          </span>
          {/* Cyber timecode */}
          <span className="cyber-time">{timecode}</span>
        </div>

        {/* Film subtitle bubble */}
        <div className="film-subtitle rounded-lg px-4 py-3" style={{ maxWidth: '85%' }}>
          <p
            className="text-sm leading-relaxed font-body"
            style={{ color: 'rgba(232, 232, 240, 0.92)' }}
          >
            {dialogue.content}
          </p>
        </div>
      </div>
    </div>
  );
};
