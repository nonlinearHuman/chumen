// 楚门 - AI 真人秀世界 (整合 NFT 市场 + 像素世界)
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  // 检查是否需要显示教程（首次访问）
  useEffect(() => {
    const tutorialDone = localStorage.getItem('chumen_tutorial_completed');
    if (tutorialDone !== 'true') {
      setShowTutorialOverlay(true);
    }
    // 检查每日重置
    checkDailyReset();
  }, []);

  // 移动端检测
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
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

  // 剧情 → NFT故事线自动同步
  useDramaStorySync();

  // 定期检查成就（每30秒检查一次，主要用于 play_time 成就）
  useEffect(() => {
    const interval = setInterval(() => {
      checkAchievements();
    }, 30000);
    return () => clearInterval(interval);
  }, [checkAchievements]);

  // NFT铸造后检查成就
  useEffect(() => {
    if (nftProgress.mintedAgents.length > 0) {
      checkAchievements();
    }
  }, [nftProgress.mintedAgents.length, checkAchievements]);

  // 注册键盘快捷键
  useKeyboardShortcuts({
    onSetTab: (tab) => setActiveTab(tab),
  });

  // 监听键盘快捷键派发的自定义事件
  useEffect(() => {
    const handleCloseAll = () => {
      setShowAchievementPanel(false);
      setShowStats(false);
      setShowSettings(false);
      setShowRelationshipGraph(false);
      setShowTimeline(false);
    };
    const handleToggleAchievements = () => setShowAchievementPanel(prev => !prev);
    const handleToggleStats = () => setShowStats(prev => !prev);
    const handleToggleDaily = () => {
      const current = useGameStore.getState();
      if (current.dailyState.showDailyPanel) {
        current.dismissDailyPanel();
      } else {
        useGameStore.setState({
          dailyState: { ...current.dailyState, showDailyPanel: true },
        });
      }
    };
    const handleToggleTimeline = () => setShowTimeline(prev => !prev);
    const handleToggleRelationships = () => setShowRelationshipGraph(prev => !prev);
    const handleToggleSettings = () => setShowSettings(prev => !prev);
    const handleSaveSuccess = () => {
      setSaveMessage('💾 已保存');
      setTimeout(() => setSaveMessage(null), 2000);
    };

    const events: [string, () => void][] = [
      ['chumen:close-all-modals', handleCloseAll],
      ['chumen:toggle-achievements', handleToggleAchievements],
      ['chumen:toggle-stats', handleToggleStats],
      ['chumen:toggle-daily', handleToggleDaily],
      ['chumen:toggle-timeline', handleToggleTimeline],
      ['chumen:toggle-relationships', handleToggleRelationships],
      ['chumen:toggle-settings', handleToggleSettings],
      ['chumen:save-success', handleSaveSuccess],
    ];
    events.forEach(([type, handler]) => window.addEventListener(type, handler));
    return () => events.forEach(([type, handler]) => window.removeEventListener(type, handler));
  }, []);

  const { 
    currentScene, 
    setScene, 
    isPlaying, 
    startGame, 
    stopGame,
    speed,
    setSpeed,
    dialogues,
    dramaEvents,
    saveGame,
    loadGame,
    hasSave,
    deleteSave,
    lastSaveTime,
  } = useGameStore();
  
  const { startChat, stopChat } = useAgentChat();
  const { triggerNPC } = useNPCTigger();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 自动存档：每5分钟
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      saveGame();
      setSaveMessage('💾 自动存档完成');
      setTimeout(() => setSaveMessage(null), 2000);
    }, 5 * 60 * 1000); // 5分钟
    
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
          setSaveMessage('⚠️ 存档版本不匹配，建议重新开始');
          setTimeout(() => setSaveMessage(null), 3000);
          return;
        }
        const success = loadGame(saveData);
        if (success) {
          setSaveMessage('📂 读档成功');
        } else {
          setSaveMessage('❌ 读档失败');
        }
        setTimeout(() => setSaveMessage(null), 2000);
      }
    } catch (e) {
      setSaveMessage('❌ 存档损坏，无法加载');
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
    if (!isPlaying) {
      startGame();
      startChat();
    } else {
      stopGame();
      stopChat();
    }
  };

  const handleManualTrigger = () => {
    if (isPlaying) {
      triggerNPC();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-deep)' }}>
      {/* CameraHeader - 固定顶部 */}
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

      {/* 占位顶部空间（header高度64px） */}
      <div className="h-[64px]" />

      {activeTab === 'chat' ? (
        /* 会话视图 */
        <main className={`${isMobile ? 'px-1 py-3' : 'max-w-7xl mx-auto px-4 py-6'}`}>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
            {/* 左侧：角色列表 */}
            <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-1'} space-y-4`}>
              <h2 className="font-display font-bold px-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                👥 角色 ({agents.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-3 max-h-[30vh] sm:max-h-[50vh] overflow-y-auto px-1">
                {agents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isActive={selectedAgent === agent.id}
                    onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  />
                ))}
              </div>
            </div>

            {/* 中间：对话区域 */}
            <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-2'}`}>
              <div
                className={`rounded-chumen-lg p-4 ${isMobile ? 'h-[calc(100vh-280px)]' : 'h-[70vh]'} flex flex-col border`}
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border)',
                }}
              >
                {/* 当前场景 + 播放控制栏 */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentScene.emoji}</span>
                    <div>
                      <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {currentScene.name}
                      </h2>
                      {!isMobile && (
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {currentScene.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* 播放控制 */}
                  <button
                    onClick={handlePlay}
                    className="px-4 py-1.5 rounded-chumen-md font-display font-bold text-sm transition-all"
                    style={{
                      background: isPlaying ? 'var(--accent-magenta)' : 'var(--accent-green)',
                      color: isPlaying ? '#fff' : '#000',
                      boxShadow: isPlaying ? 'var(--glow-magenta)' : 'var(--glow-green)',
                    }}
                  >
                    {isPlaying ? '⏹ 停止' : '▶ 开始'}
                  </button>
                </div>

                {/* 对话流 */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {dialogues.length === 0 ? (
                    <div className="text-center py-6 sm:py-10" style={{ color: 'var(--text-muted)' }}>
                      <p className="text-3xl mb-3">🎬</p>
                      <p className="text-sm">点击"开始"启动真人秀</p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                        AI Agent 将自动产生对话
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        NPC 会观察并在适当时机介入！
                      </p>
                    </div>
                  ) : (
                    dialogues.slice(-20).map(dialogue =>
                      isHighlightDialogue(dialogue.content) ? (
                        <HighlightDialogue key={dialogue.id} dialogue={dialogue} />
                      ) : (
                        <DialogueBubble key={dialogue.id} dialogue={dialogue} />
                      )
                    )
                  )}
                </div>

                {/* 控制栏 */}
                <div className="mt-3 pt-3 flex items-center gap-2 sm:gap-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  {/* 速度控制 */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>速度:</span>
                    <input
                      type="range"
                      min="2000"
                      max="15000"
                      step="500"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-16 sm:w-24 accent-cyan-400"
                      style={{ accentColor: 'var(--accent-cyan)' }}
                    />
                    <span className="text-xs font-mono w-12 sm:w-16" style={{ color: 'var(--text-secondary)' }}>
                      {speed / 1000}s
                    </span>
                  </div>

                  {/* NPC 触发 */}
                  <button
                    onClick={handleManualTrigger}
                    disabled={!isPlaying}
                    className="ml-auto px-3 py-1.5 rounded-chumen-sm text-xs font-display
                      disabled:opacity-40 min-h-[36px]"
                    style={{
                      background: 'rgba(255, 184, 0, 0.15)',
                      color: 'var(--accent-gold)',
                      border: '1px solid rgba(255, 184, 0, 0.3)',
                    }}
                  >
                    🎲 NPC 介入
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：信息面板 - 桌面端显示，移动端折叠 */}
            {!isMobile && (
              <div className="lg:col-span-1 space-y-4">
                {/* 统计面板 */}
                <div className="rounded-chumen-lg p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                  <h3 className="font-display font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>📊 统计</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-secondary)' }}>总对话数</span>
                      <span className="font-display font-bold text-lg" style={{ color: 'var(--accent-cyan)' }}>{dialogues.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>活跃角色</span>
                      <span className="font-display font-bold">{agents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>场景数</span>
                      <span className="font-display font-bold">{scenes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>戏剧事件</span>
                      <span className="font-display font-bold" style={{ color: 'var(--accent-magenta)' }}>{dramaEvents.length}</span>
                    </div>
                  </div>
                </div>

                {/* 戏剧事件 */}
                {dramaEvents.length > 0 && (
                  <div className="rounded-chumen-lg p-4 border max-h-48 overflow-y-auto" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <h3 className="font-display font-bold mb-3 text-sm" style={{ color: 'var(--accent-magenta)' }}>🎭 戏剧事件</h3>
                    <div className="space-y-2">
                      {dramaEvents.slice(-5).reverse().map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-2 rounded"
                          style={{
                            background: event.urgency === 'high' ? 'rgba(255,45,120,0.1)' :
                              event.urgency === 'medium' ? 'rgba(255,184,0,0.1)' :
                              'var(--bg-elevated)',
                            color: event.urgency === 'high' ? 'var(--accent-magenta)' :
                              event.urgency === 'medium' ? 'var(--accent-amber)' :
                              'var(--text-secondary)',
                            border: `1px solid ${event.urgency === 'high' ? 'rgba(255,45,120,0.2)' : 'var(--border)'}`,
                          }}
                        >
                          <span className="font-bold">{event.type}</span>: {event.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 关于 */}
                <div className="rounded-chumen-lg p-4 border" style={{
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(255,45,120,0.06))',
                  borderImage: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(255,45,120,0.3)) 1',
                }}>
                  <h3 className="font-display font-bold mb-2 text-sm" style={{ color: 'var(--accent-cyan)' }}>💡 关于</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    楚门是一个 AI 真人秀世界，10 个 AI Agent 在一个现代都市中自由生活、互动。
                  </p>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    🎲 NPC 会观察对话，并在适当时机介入，制造戏剧性的"爆点"！
                  </p>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--accent-gold)' }}>
                    💎 持有 Agent NFT，成为 AI 的主人！
                  </p>
                </div>

                {/* 状态 */}
                <div className="rounded-chumen-lg p-4 border text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                  <div
                    className="px-3 py-2 rounded-chumen-md text-sm font-display font-bold inline-flex items-center gap-2"
                    style={{
                      background: isPlaying ? 'rgba(255,45,120,0.15)' : 'var(--bg-elevated)',
                      color: isPlaying ? 'var(--accent-magenta)' : 'var(--text-muted)',
                    }}
                  >
                    <span className={isPlaying ? 'animate-recording-pulse' : ''}>🔴</span>
                    {isPlaying ? '直播中' : '已暂停'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      ) : activeTab === 'pixel' ? (
        /* 像素世界视图 */
        <main className={`${isMobile ? 'px-1 py-3' : 'max-w-5xl mx-auto px-4 py-6'}`}>
          <div className={`bg-gray-900 ${isMobile ? 'rounded-none p-0' : 'rounded-xl p-4'}`}>
            <PixelWorld isMobile={isMobile} />
          </div>
        </main>
      ) : (
        /* NFT 市场视图 */
        <main className={`${isMobile ? 'px-1 py-3' : 'max-w-4xl mx-auto px-4 py-6'}`}>
          <NFTMarket isMobile={isMobile} />
        </main>
      )}

      {/* 教程浮层 */}
      {showTutorialOverlay && (
        <TutorialOverlay
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

      {/* 成就弹窗 */}
      {pendingAchievement && (
        <AchievementPopup
          achievement={pendingAchievement}
          onDismiss={dismissPendingAchievement}
        />
      )}

      {/* 成就面板 */}
      {showAchievementPanel && (
        <AchievementPanel onClose={() => setShowAchievementPanel(false)} onShare={(type, data) => setShareData({ type, data })} />
      )}

      {/* 统计面板 */}
      {showStats && (
        <StatsPanel onClose={() => setShowStats(false)} onShare={(type, data) => setShareData({ type, data })} />
      )}

      {/* 每日挑战面板 */}
      {dailyState.showDailyPanel && (
        <DailyPanel onClose={dismissDailyPanel} onShare={(type, data) => setShareData({ type, data })} />
      )}

      {/* 关系图谱弹窗 */}
      {showRelationshipGraph && (
        <div className={`fixed inset-0 bg-black/50 z-50 ${isMobile ? '' : 'flex items-center justify-center'}`}>
          <div className={`bg-white ${isMobile ? 'w-full h-full' : 'rounded-2xl p-6 max-w-2xl w-full mx-4'}`}>
            <RelationshipGraph />
            <button
              onClick={() => setShowRelationshipGraph(false)}
              className={`w-full px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 ${isMobile ? 'min-h-[44px]' : 'py-2'}`}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 时间线弹窗 */}
      {showTimeline && (
        <div className={`fixed inset-0 bg-black/50 z-50 ${isMobile ? '' : 'flex items-center justify-center'}`}>
          <div className={`bg-white ${isMobile ? 'w-full h-full' : 'rounded-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden'}`}>
            <GameTimeline />
            <button
              onClick={() => setShowTimeline(false)}
              className={`w-full p-3 bg-gray-100 hover:bg-gray-200 ${isMobile ? 'min-h-[44px]' : ''}`}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* 分享卡片 */}
      {shareData && (
        <ShareCard
          type={shareData.type}
          data={shareData.data}
          onClose={() => setShareData(null)}
        />
      )}
    </div>
  );
}
