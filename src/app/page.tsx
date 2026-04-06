// 楚门 - AI 真人秀世界 (Premium 沉浸式布局)
// src/app/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAgentChat } from '@/hooks/useAgentChat';
import { useNPCTigger } from '@/hooks/useNPCTigger';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { AgentCard } from '@/components/AgentCard';
import { DialogueBubble } from '@/components/DialogueBubble';
import { HighlightDialogue, isHighlightDialogue } from '@/components/HighlightDialogue';
import { NFTMarket } from '@/components/NFTMarket';
import { PixelWorld } from '@/game/components/PixelWorld';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { AchievementPopup } from '@/components/AchievementPopup';
import { AchievementPanel } from '@/components/AchievementPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { DailyPanel } from '@/components/DailyPanel';
import { SettingsPanel } from '@/components/SettingsPanel';
import { RelationshipGraph } from '@/components/RelationshipGraph';
import { ShareCard } from '@/components/ShareCard';
import { GameTimeline } from '@/components/GameTimeline';
import { CameraHeader } from '@/components/ui/CameraHeader';
import { ACHIEVEMENTS } from '@/data/achievements';
import { useDramaStorySync } from '@/hooks/useDramaStorySync';
import { agents } from '@/config/agents';
import { scenes } from '@/config/scenes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'pixel' | 'nft'>('chat');
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);
  const [showAchievementPanel, setShowAchievementPanel] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRelationshipGraph, setShowRelationshipGraph] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [shareData, setShareData] = useState<{ type: 'achievement' | 'stats' | 'daily' | 'nft'; data: any } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const {
    tutorialCompleted,
    hideTutorial,
    showTutorial,
    achievements,
    pendingAchievement,
    dismissPendingAchievement,
    checkAchievements,
    nftProgress,
    dailyState,
    checkDailyReset,
    dismissDailyPanel,
    getStats,
  } = useGameStore();

  useEffect(() => {
    const tutorialDone = localStorage.getItem('chumen_tutorial_completed');
    if (tutorialDone !== 'true') {
      setShowTutorialOverlay(true);
    }
    checkDailyReset();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTutorialComplete = useCallback(() => {
    hideTutorial();
    setShowTutorialOverlay(false);
  }, [hideTutorial]);

  const handleTutorialSkip = useCallback(() => {
    hideTutorial();
    setShowTutorialOverlay(false);
  }, [hideTutorial]);

  useDramaStorySync();

  useEffect(() => {
    const interval = setInterval(() => checkAchievements(), 30000);
    return () => clearInterval(interval);
  }, [checkAchievements]);

  useEffect(() => {
    if (nftProgress.mintedAgents.length > 0) checkAchievements();
  }, [nftProgress.mintedAgents.length, checkAchievements]);

  useKeyboardShortcuts({ onSetTab: (tab) => setActiveTab(tab) });

  useEffect(() => {
    const events: [string, () => void][] = [
      ['chumen:close-all-modals', () => {
        setShowAchievementPanel(false); setShowStats(false); setShowSettings(false);
        setShowRelationshipGraph(false); setShowTimeline(false);
      }],
      ['chumen:toggle-achievements', () => setShowAchievementPanel(p => !p)],
      ['chumen:toggle-stats',         () => setShowStats(p => !p)],
      ['chumen:toggle-daily', () => {
        const cur = useGameStore.getState();
        if (cur.dailyState.showDailyPanel) cur.dismissDailyPanel();
        else useGameStore.setState({ dailyState: { ...cur.dailyState, showDailyPanel: true } });
      }],
      ['chumen:toggle-timeline',       () => setShowTimeline(p => !p)],
      ['chumen:toggle-relationships', () => setShowRelationshipGraph(p => !p)],
      ['chumen:toggle-settings',      () => setShowSettings(p => !p)],
    ];
    events.forEach(([type, handler]) => window.addEventListener(type, handler));
    return () => events.forEach(([type, handler]) => window.removeEventListener(type, handler));
  }, []);

  const {
    currentScene, setScene, isPlaying, startGame, stopGame,
    speed, setSpeed, dialogues, dramaEvents, saveGame, loadGame,
    hasSave, deleteSave,
  } = useGameStore();

  const { startChat, stopChat } = useAgentChat();
  const { triggerNPC } = useNPCTigger();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      saveGame();
      setSaveMessage('💾 自动存档完成');
      setTimeout(() => setSaveMessage(null), 2000);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isPlaying, saveGame]);

  const handleSave = useCallback(() => {
    saveGame();
    setSaveMessage('📁 存档成功');
    setTimeout(() => setSaveMessage(null), 2000);
  }, [saveGame]);

  const handleLoad = useCallback(() => {
    if (!hasSave()) return;
    try {
      const saved = localStorage.getItem('chumen_save');
      if (saved) {
        const saveData = JSON.parse(saved);
        if (saveData.version !== '1.0.0') {
          setSaveMessage('⚠️ 存档版本不匹配');
          setTimeout(() => setSaveMessage(null), 3000);
          return;
        }
        const ok = loadGame(saveData);
        setSaveMessage(ok ? '📂 读档成功' : '❌ 读档失败');
        setTimeout(() => setSaveMessage(null), 2000);
      }
    } catch {
      setSaveMessage('❌ 存档损坏');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [hasSave, loadGame]);

  const handleDeleteSave = useCallback(() => {
    if (confirm('确定要删除存档吗？此操作不可恢复。')) {
      deleteSave();
      setSaveMessage('🗑️ 存档已删除');
      setTimeout(() => setSaveMessage(null), 2000);
    }
  }, [deleteSave]);

  const handlePlay = () => {
    if (!isPlaying) { startGame(); startChat(); }
    else { stopGame(); stopChat(); }
  };

  const handleManualTrigger = () => { if (isPlaying) triggerNPC(); };

  // ── Scene accent color for atmospheric glow ───────────────────────
  const sceneAccents: Record<string, string> = {
    coffee_shop:   '#c4a882', hospital:     '#a8c4d4',
    court:         '#8b7355', office:       '#00d4ff',
    apartment:     '#c4a882', street:       '#d4b896',
    media_office:  '#ff8c00', police_station:'#4a90c4',
  };
  const accentColor = sceneAccents[currentScene.id] ?? '#00d4ff';

  // ─────────────────────────────────────────────────────────────────────
  // CHAT TAB — Immersive 3-zone layout
  // ─────────────────────────────────────────────────────────────────────
  if (activeTab === 'chat') {
    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-deep)' }}
      >
        {/* Ambient atmosphere orbs */}
        <div
          className="ambient-orb w-96 h-96 -top-20 -left-20"
          style={{ background: accentColor, animationDelay: '0s' }}
        />
        <div
          className="ambient-orb w-80 h-80 top-1/2 -right-20"
          style={{ background: '#ff2d78', animationDelay: '-7s' }}
        />
        <div
          className="ambient-orb w-64 h-64 bottom-10 left-1/3"
          style={{ background: '#00d4ff', animationDelay: '-14s' }}
        />

        {/* Fixed header */}
        <CameraHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          liveStatus={isPlaying ? 'live' : 'paused'}
          currentScene={currentScene.id}
          onSceneChange={(sceneId) => {
            const scene = scenes.find(s => s.id === sceneId);
            if (scene) setScene(scene.id);
          }}
          achievementsTotal={ACHIEVEMENTS.length}
          achievementsUnlocked={achievements.unlocked.length}
          dailyChallenges={4}
          dailyCompleted={dailyState.completedChallenges.length}
          onOpenAchievements={() => setShowAchievementPanel(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenStats={() => setShowStats(true)}
          onOpenRelationships={() => setShowRelationshipGraph(true)}
          onOpenTimeline={() => setShowTimeline(true)}
          onSave={handleSave}
          isMobile={isMobile}
        />

        {/* Main layout — full viewport below header */}
        <div className={`${isMobile ? 'flex flex-col h-[calc(100vh-64px)]' : 'flex h-[calc(100vh-64px)]'}`}>

          {/* ══════════════════════════════════════════════════════════
              LEFT — Floating Agent Sidebar
          ══════════════════════════════════════════════════════════ */}
          {isMobile ? (
            /* Mobile: compact horizontal scroll strip at top */
            <div className="flex-none border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
                {agents.map(agent => (
                  <div key={agent.id} className="flex-none w-36 animate-stagger-in">
                    <AgentCard
                      agent={agent}
                      compact
                      isActive={selectedAgent === agent.id}
                      onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Desktop: floating glass sidebar */
            <aside
              className="flex-none w-64 flex flex-col gap-3 overflow-y-auto p-4"
              style={{
                background: 'rgba(10,11,15,0.5)',
                backdropFilter: 'blur(16px)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Section label */}
              <div className="flex items-center gap-2 px-1 mb-1">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: 'rgba(139,143,168,0.5)', letterSpacing: '0.2em' }}
                >
                  ── CAST ──
                </span>
                <span className="ml-auto text-xs font-display" style={{ color: accentColor }}>
                  {agents.length}
                </span>
              </div>

              {agents.map((agent, i) => (
                <div key={agent.id} className="animate-stagger-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <AgentCard
                    agent={agent}
                    compact
                    isActive={selectedAgent === agent.id}
                    onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  />
                </div>
              ))}
            </aside>
          )}

          {/* ══════════════════════════════════════════════════════════
              CENTER — Immersive Dialogue Stage
          ══════════════════════════════════════════════════════════ */}
          <main className={`flex-1 flex flex-col ${isMobile ? '' : 'min-w-0'}`}>

            {/* Scene banner */}
            <div
              className="relative px-4 sm:px-6 py-3 flex items-center gap-3 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(10,11,15,0.9), rgba(18,20,28,0.8))`,
                borderBottom: `1px solid rgba(255,255,255,0.05)`,
              }}
            >
              {/* Atmospheric glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 20% 50%, ${accentColor}15, transparent 60%)`,
                }}
              />
              <div
                className="text-2xl flex-shrink-0"
                style={{ filter: `drop-shadow(0 0 8px ${accentColor})` }}
              >
                {currentScene.emoji}
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <h2
                  className="font-display font-bold text-sm truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {currentScene.name}
                </h2>
                {!isMobile && (
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: 'rgba(139,143,168,0.6)' }}
                  >
                    {currentScene.description}
                  </p>
                )}
              </div>

              {/* Cinematic Play/Stop button */}
              <button
                onClick={handlePlay}
                className={`relative flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-full font-display font-bold text-sm
                  transition-all duration-300 btn-spotlight overflow-hidden
                  ${isPlaying ? 'animate-fade-curtain' : ''}`}
                style={{
                  background: isPlaying
                    ? 'rgba(255,45,120,0.15)'
                    : `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
                  border: `1px solid ${isPlaying ? 'rgba(255,45,120,0.5)' : `${accentColor}50`}`,
                  color: isPlaying ? '#ff2d78' : accentColor,
                  boxShadow: isPlaying
                    ? '0 0 20px rgba(255,45,120,0.3)'
                    : `0 0 20px ${accentColor}30, radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12), transparent 70%)`,
                  letterSpacing: '0.08em',
                }}
              >
                <span
                  className={isPlaying ? 'animate-recording-pulse' : ''}
                  style={{ fontSize: '10px' }}
                >
                  {isPlaying ? '■' : '▶'}
                </span>
                <span>{isPlaying ? '停止' : '开始'}</span>
              </button>
            </div>

            {/* Dialogue stream */}
            <div
              className={`flex-1 overflow-y-auto px-4 sm:px-6 py-4 ${isMobile ? 'h-[calc(100vh-220px)]' : ''}`}
              style={{ scrollBehavior: 'smooth' }}
            >
              {dialogues.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full text-center gap-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {/* Cinematic frame */}
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center mb-2"
                    style={{
                      background: `radial-gradient(circle, ${accentColor}20, transparent)`,
                      border: `1px solid ${accentColor}30`,
                    }}
                  >
                    <span className="text-4xl" style={{ filter: `drop-shadow(0 0 8px ${accentColor})` }}>
                      🎬
                    </span>
                  </div>
                  <p className="text-sm font-display" style={{ color: 'var(--text-secondary)' }}>
                    点击「开始」启动真人秀
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', maxWidth: '280px' }}>
                    AI Agent 将在场景中自由对话<br />
                    NPC 会在关键时刻介入制造戏剧冲突
                  </p>
                </div>
              ) : (
                dialogues.slice(-20).map(dialogue =>
                  isHighlightDialogue(dialogue.content)
                    ? <HighlightDialogue key={dialogue.id} dialogue={dialogue} />
                    : <DialogueBubble key={dialogue.id} dialogue={dialogue} />
                )
              )}
            </div>

            {/* Control bar */}
            <div
              className="px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6"
              style={{
                background: 'rgba(10,11,15,0.7)',
                backdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Speed */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: 'rgba(139,143,168,0.6)', letterSpacing: '0.05em' }}>
                  SPEED
                </span>
                <input
                  type="range" min="2000" max="15000" step="500" value={speed}
                  onChange={e => setSpeed(Number(e.target.value))}
                  className="w-16 sm:w-24 accent-cyan-400"
                  style={{ accentColor: accentColor }}
                />
                <span className="text-xs font-mono w-10 text-right" style={{ color: 'rgba(139,143,168,0.6)' }}>
                  {speed / 1000}s
                </span>
              </div>

              {/* Status pill */}
              <div
                className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-display font-medium"
                style={{
                  background: isPlaying ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isPlaying ? 'rgba(255,45,120,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  color: isPlaying ? '#ff2d78' : 'rgba(139,143,168,0.5)',
                  boxShadow: isPlaying ? '0 0 10px rgba(255,45,120,0.2)' : 'none',
                }}
              >
                <span className={isPlaying ? 'animate-recording-pulse text-sm' : 'text-sm'}>
                  {isPlaying ? '●' : '○'}
                </span>
                <span>{isPlaying ? '直播中' : '已暂停'}</span>
                <span className="font-mono text-[10px]" style={{ color: 'rgba(139,143,168,0.4)' }}>
                  {dialogues.length} 条
                </span>
              </div>

              {/* NPC trigger */}
              <button
                onClick={handleManualTrigger}
                disabled={!isPlaying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display
                  disabled:opacity-30 transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: 'rgba(255,184,0,0.1)',
                  border: '1px solid rgba(255,184,0,0.25)',
                  color: '#ffb800',
                }}
              >
                <span>🎲</span>
                <span>NPC介入</span>
              </button>
            </div>
          </main>

          {/* ══════════════════════════════════════════════════════════
              RIGHT — Glass Dashboard Widget (desktop only)
          ══════════════════════════════════════════════════════════ */}
          {!isMobile && (
            <aside
              className="flex-none w-72 flex flex-col gap-3 overflow-y-auto p-4"
              style={{
                background: 'rgba(10,11,15,0.5)',
                backdropFilter: 'blur(16px)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Section label */}
              <div
                className="text-[10px] font-mono uppercase tracking-widest px-1"
                style={{ color: 'rgba(139,143,168,0.5)', letterSpacing: '0.2em' }}
              >
                ── DASHBOARD ──
              </div>

              {/* Stats — big number style */}
              <div className="glass-panel rounded-xl p-4 space-y-3">
                {[
                  { label: '总对话',   value: dialogues.length,    color: accentColor },
                  { label: '戏剧事件', value: dramaEvents.length,   color: '#ff2d78' },
                  { label: '活跃角色', value: agents.length,         color: '#00d4ff' },
                  { label: '场景数',   value: scenes.length,         color: '#a855f7' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(139,143,168,0.7)' }}>{label}</span>
                    <span
                      className="font-display font-bold text-2xl"
                      style={{ color, textShadow: `0 0 12px ${color}50` }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Drama events — stacked card effect */}
              {dramaEvents.length > 0 && (
                <div className="glass-panel rounded-xl p-4">
                  <p
                    className="text-[10px] font-mono uppercase tracking-widest mb-3"
                    style={{ color: '#ff2d78', letterSpacing: '0.15em' }}
                  >
                    ── DRAMA ──
                  </p>
                  <div className="space-y-2">
                    {dramaEvents.slice(-4).reverse().map(event => {
                      const urgencyColor = event.urgency === 'high'
                        ? '#ff2d78' : event.urgency === 'medium' ? '#ffb800' : 'rgba(139,143,168,0.5)';
                      return (
                        <div
                          key={event.id}
                          className="rounded-lg p-2.5 relative overflow-hidden"
                          style={{
                            background: `${urgencyColor}10`,
                            border: `1px solid ${urgencyColor}25`,
                          }}
                        >
                          {/* Urgency glow */}
                          {event.urgency === 'high' && (
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{ background: `radial-gradient(circle at 0% 50%, ${urgencyColor}20, transparent 60%)` }}
                            />
                          )}
                          <div className="relative">
                            <p
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: urgencyColor, letterSpacing: '0.1em' }}
                            >
                              {event.type}
                            </p>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              {event.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* About card */}
              <div
                className="rounded-xl p-4 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(0,212,255,0.06), rgba(255,45,120,0.06))`,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 80% 20%, ${accentColor}10, transparent 50%)` }}
                />
                <div className="relative">
                  <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#00d4ff', letterSpacing: '0.15em' }}>
                    ── ABOUT ──
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    楚门是一个 AI 真人秀世界，10 个 AI Agent 在现代都市中自由生活与互动。
                  </p>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(139,143,168,0.6)' }}>
                    🎲 NPC 观察对话，在关键时刻介入制造戏剧性"爆点"！
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#ffb800' }}>
                    💎 持有 Agent NFT，成为 AI 的主人！
                  </p>
                </div>
              </div>

              {/* Save/load controls */}
              <div className="glass-panel rounded-xl p-3 flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 rounded-lg text-xs font-display transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: `${accentColor}15`,
                    border: `1px solid ${accentColor}35`,
                    color: accentColor,
                  }}
                >
                  💾 存档
                </button>
                {hasSave() && (
                  <>
                    <button
                      onClick={handleLoad}
                      className="flex-1 py-2 rounded-lg text-xs font-display transition-all hover:brightness-110 active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      📂 读档
                    </button>
                    <button
                      onClick={handleDeleteSave}
                      className="px-3 py-2 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
                      style={{
                        background: 'rgba(255,59,59,0.1)',
                        border: '1px solid rgba(255,59,59,0.2)',
                        color: '#ff3b3b',
                      }}
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className={isPlaying ? 'animate-recording-pulse' : ''} style={{ color: isPlaying ? '#ff2d78' : 'rgba(139,143,168,0.4)', fontSize: '12px' }}>
                  ●
                </span>
                <span className="text-xs font-display" style={{ color: isPlaying ? '#ff2d78' : 'rgba(139,143,168,0.4)' }}>
                  {isPlaying ? 'LIVE BROADCAST' : 'PAUSED'}
                </span>
              </div>
            </aside>
          )}
        </div>

        {/* Save toast */}
        {saveMessage && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-display
              animate-fade-in-up z-50"
            style={{
              background: 'rgba(18,20,28,0.95)',
              border: `1px solid ${accentColor}`,
              color: accentColor,
              boxShadow: `0 0 20px ${accentColor}40`,
              backdropFilter: 'blur(12px)',
            }}
          >
            {saveMessage}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // PIXEL WORLD TAB
  // ─────────────────────────────────────────────────────────────────────
  if (activeTab === 'pixel') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
        <CameraHeader
          activeTab={activeTab} onTabChange={setActiveTab}
          liveStatus={isPlaying ? 'live' : 'paused'}
          currentScene={currentScene.id}
          onSceneChange={sceneId => { const s = scenes.find(x => x.id === sceneId); if (s) setScene(s.id); }}
          achievementsTotal={ACHIEVEMENTS.length} achievementsUnlocked={achievements.unlocked.length}
          dailyChallenges={4} dailyCompleted={dailyState.completedChallenges.length}
          onOpenAchievements={() => setShowAchievementPanel(true)} onOpenSettings={() => setShowSettings(true)}
          onOpenStats={() => setShowStats(true)} onOpenRelationships={() => setShowRelationshipGraph(true)}
          onOpenTimeline={() => setShowTimeline(true)} onSave={handleSave}
          isMobile={isMobile}
        />
        <div className={`${isMobile ? 'px-1 py-3' : 'max-w-5xl mx-auto px-4 py-6'}`}>
          <div className={`bg-gray-900 ${isMobile ? 'rounded-none p-0' : 'rounded-xl p-4'}`}>
            <PixelWorld isMobile={isMobile} />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // NFT MARKET TAB
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <CameraHeader
        activeTab={activeTab} onTabChange={setActiveTab}
        liveStatus={isPlaying ? 'live' : 'paused'}
        currentScene={currentScene.id}
        onSceneChange={sceneId => { const s = scenes.find(x => x.id === sceneId); if (s) setScene(s.id); }}
        achievementsTotal={ACHIEVEMENTS.length} achievementsUnlocked={achievements.unlocked.length}
        dailyChallenges={4} dailyCompleted={dailyState.completedChallenges.length}
        onOpenAchievements={() => setShowAchievementPanel(true)} onOpenSettings={() => setShowSettings(true)}
        onOpenStats={() => setShowStats(true)} onOpenRelationships={() => setShowRelationshipGraph(true)}
        onOpenTimeline={() => setShowTimeline(true)} onSave={handleSave}
        isMobile={isMobile}
      />
      <main className={`${isMobile ? 'px-1 py-3' : 'max-w-4xl mx-auto px-4 py-6'}`}>
        <NFTMarket isMobile={isMobile} />
      </main>
      {showTutorialOverlay && (
        <TutorialOverlay onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
      )}
      {pendingAchievement && (
        <AchievementPopup achievement={pendingAchievement} onDismiss={dismissPendingAchievement} />
      )}
      {showAchievementPanel && (
        <AchievementPanel onClose={() => setShowAchievementPanel(false)} onShare={(t, d) => setShareData({ type: t, data: d })} />
      )}
      {showStats && (
        <StatsPanel onClose={() => setShowStats(false)} onShare={(t, d) => setShareData({ type: t, data: d })} />
      )}
      {dailyState.showDailyPanel && (
        <DailyPanel onClose={dismissDailyPanel} onShare={(t, d) => setShareData({ type: t, data: d })} />
      )}
      {showRelationshipGraph && (
        <div className={`fixed inset-0 z-50 ${isMobile ? '' : 'flex items-center justify-center'}`}
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className={`bg-white ${isMobile ? 'w-full h-full' : 'rounded-2xl p-6 max-w-2xl w-full mx-4'}`}>
            <RelationshipGraph />
            <button onClick={() => setShowRelationshipGraph(false)}
              className={`w-full px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 ${isMobile ? 'min-h-[44px]' : 'py-2'}`}>
              关闭
            </button>
          </div>
        </div>
      )}
      {showTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className={`bg-white ${isMobile ? 'w-full h-full' : 'rounded-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden'}`}>
            <GameTimeline />
            <button onClick={() => setShowTimeline(false)} className={`w-full p-3 bg-gray-100 hover:bg-gray-200 ${isMobile ? 'min-h-[44px]' : ''}`}>
              关闭
            </button>
          </div>
        </div>
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {shareData && <ShareCard type={shareData.type} data={shareData.data} onClose={() => setShareData(null)} />}
    </div>
  );
}
