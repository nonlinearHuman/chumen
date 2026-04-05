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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className={`${isMobile ? 'px-2 py-2' : 'max-w-7xl mx-auto px-4 py-4'} flex items-center justify-between flex-wrap gap-2`}>
          {/* 标题 - 始终显示 */}
          <div>
            <h1 className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              🎬 楚门
            </h1>
            {!isMobile && (
              <p className="text-sm text-gray-500">AI 真人秀世界 + NFT 市场</p>
            )}
          </div>

          {/* 桌面端：功能按钮横排 */}
          {!isMobile && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {/* 成就按钮 */}
                <button
                  onClick={() => setShowAchievementPanel(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  title="查看成就"
                >
                  <span className="text-sm">🏆</span>
                  <span className="text-sm font-bold text-amber-600">{achievements.totalPoints}</span>
                  <span className="text-xs text-amber-500/70">
                    ({achievements.unlocked.length}/{ACHIEVEMENTS.length})
                  </span>
                </button>

                {/* 每日挑战按钮 */}
                <button
                  onClick={() => checkDailyReset()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  title="每日挑战"
                >
                  <span className="text-sm">🎯</span>
                  <span className="text-sm font-bold text-purple-600">
                    {dailyState.completedChallenges.length}/4
                  </span>
                  {dailyState.showDailyPanel && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* 统计按钮 */}
                <button
                  onClick={() => setShowStats(true)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  📊 统计
                </button>

                {/* 关系图谱按钮 */}
                <button
                  onClick={() => setShowRelationshipGraph(true)}
                  className="px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200"
                >
                  🔗 关系图谱
                </button>

                {/* 日志按钮 */}
                <button
                  onClick={() => setShowTimeline(true)}
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                >
                  📜 日志
                </button>

                {/* 分享按钮 */}
                <button
                  onClick={() => {
                    const stats = getStats();
                    const hours = Math.floor(stats.totalPlayTime / 3600000);
                    const mins = Math.floor((stats.totalPlayTime % 3600000) / 60000);
                    setShareData({
                      type: 'stats',
                      data: {
                        dialogues: stats.totalDialogues,
                        events: stats.totalEvents,
                        playTime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
                        achievements: stats.achievementsUnlocked,
                      },
                    });
                  }}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  📤 分享
                </button>

                {/* 设置按钮 */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  ⚙️ 设置
                </button>

                {/* 存档按钮 */}
                <div className="flex items-center gap-2">
                  {saveMessage && (
                    <span className="text-sm text-purple-600 font-medium">{saveMessage}</span>
                  )}
                  {lastSaveTime && (
                    <span className="text-xs text-gray-400">
                      💾 {new Date(lastSaveTime).toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    📁 保存
                  </button>
                  {hasSave() && (
                    <button
                      onClick={handleLoad}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      📂 加载
                    </button>
                  )}
                  {hasSave() && (
                    <button
                      onClick={handleDeleteSave}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="删除存档"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Tab 切换 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'chat'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  💬 会话
                </button>
                <button
                  onClick={() => setActiveTab('pixel')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'pixel'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🎮 像素世界
                </button>
                <button
                  onClick={() => setActiveTab('nft')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'nft'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  💎 NFT
                </button>
              </div>

              {/* 播放控制 */}
              <div className="flex items-center gap-4">
                {/* 场景选择 */}
                <select
                  value={currentScene.id}
                  onChange={(e) => setScene(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  {scenes.map(scene => (
                    <option key={scene.id} value={scene.id}>
                      {scene.emoji} {scene.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handlePlay}
                  className={`
                    px-6 py-2 rounded-lg font-bold transition-all
                    ${isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                    }
                  `}
                >
                  {isPlaying ? '⏹ 停止' : '▶️ 开始'}
                </button>
              </div>
            </>
          )}

          {/* 移动端：汉堡菜单按钮 */}
          {isMobile && (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-gray-100 rounded-lg"
            >
              {showMobileMenu ? '✕' : '☰'}
            </button>
          )}
        </div>

        {/* 移动端：下拉菜单 */}
        {isMobile && showMobileMenu && (
          <div className="border-t px-2 pb-2 space-y-2">
            {/* 快捷操作按钮 */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setShowAchievementPanel(true); setShowMobileMenu(false); }}
                className="flex-1 min-h-[44px] px-2 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-700 flex items-center justify-center gap-1"
              >
                🏆 {achievements.totalPoints}
              </button>
              <button
                onClick={() => { checkDailyReset(); setShowMobileMenu(false); }}
                className="flex-1 min-h-[44px] px-2 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 flex items-center justify-center gap-1"
              >
                🎯 {dailyState.completedChallenges.length}/4
              </button>
              <button
                onClick={() => { setShowStats(true); setShowMobileMenu(false); }}
                className="flex-1 min-h-[44px] px-2 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
              >
                📊 统计
              </button>
              <button
                onClick={() => { setShowRelationshipGraph(true); setShowMobileMenu(false); }}
                className="flex-1 min-h-[44px] px-2 py-2 bg-pink-100 text-pink-700 rounded-lg text-xs font-medium"
              >
                🔗 关系
              </button>
              <button
                onClick={() => { setShowTimeline(true); setShowMobileMenu(false); }}
                className="flex-1 min-h-[44px] px-2 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium"
              >
                📜 日志
              </button>
              <button
                onClick={() => { setShowSettings(true); setShowMobileMenu(false); }}
                className="flex-1 min-h-[44px] px-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
              >
                ⚙️ 设置
              </button>
              <button
                onClick={handleSave}
                className="flex-1 min-h-[44px] px-2 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium"
              >
                📁 保存
              </button>
            </div>

            {/* Tab 切换 */}
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab('chat'); setShowMobileMenu(false); }}
                className={`flex-1 min-h-[44px] py-2 rounded-lg font-medium ${
                  activeTab === 'chat'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                💬 会话
              </button>
              <button
                onClick={() => { setActiveTab('pixel'); setShowMobileMenu(false); }}
                className={`flex-1 min-h-[44px] py-2 rounded-lg font-medium ${
                  activeTab === 'pixel'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                🎮 像素
              </button>
              <button
                onClick={() => { setActiveTab('nft'); setShowMobileMenu(false); }}
                className={`flex-1 min-h-[44px] py-2 rounded-lg font-medium ${
                  activeTab === 'nft'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                💎 NFT
              </button>
            </div>

            {/* 播放控制 */}
            <div className="flex gap-2 items-center">
              <select
                value={currentScene.id}
                onChange={(e) => setScene(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              >
                {scenes.map(scene => (
                  <option key={scene.id} value={scene.id}>
                    {scene.emoji} {scene.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => { handlePlay(); setShowMobileMenu(false); }}
                className={`
                  px-4 py-2 rounded-lg font-bold min-h-[44px]
                  ${isPlaying
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
                  }
                `}
              >
                {isPlaying ? '⏹ 停止' : '▶️ 开始'}
              </button>
            </div>
          </div>
        )}
      </header>

      {activeTab === 'chat' ? (
        /* 会话视图 */
        <main className={`${isMobile ? 'px-1 py-3' : 'max-w-7xl mx-auto px-4 py-6'}`}>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
            {/* 左侧：角色列表 */}
            <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-1'} space-y-4`}>
              <h2 className="font-bold text-gray-700 px-2">👥 角色 ({agents.length})</h2>
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
              <div className={`bg-white rounded-xl shadow-lg p-3 ${isMobile ? 'h-[calc(100vh-280px)]' : 'h-[70vh]'} flex flex-col`}>
                {/* 当前场景 */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                  <span className="text-xl">{currentScene.emoji}</span>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">{currentScene.name}</h2>
                    {!isMobile && (
                      <p className="text-xs text-gray-500">{currentScene.description}</p>
                    )}
                  </div>
                </div>

                {/* 对话流 */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {dialogues.length === 0 ? (
                    <div className="text-center text-gray-400 py-6 sm:py-10">
                      <p>👆 点击"开始"启动真人秀</p>
                      <p className="text-xs sm:text-sm mt-2">AI Agent 将自动产生对话</p>
                      <p className="text-xs sm:text-sm mt-1">NPC 会观察并在适当时机介入！</p>
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
                <div className="mt-3 pt-3 border-t flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs text-gray-500">速度:</span>
                    <input
                      type="range"
                      min="2000"
                      max="15000"
                      step="500"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-16 sm:w-24"
                    />
                    <span className="text-xs text-gray-500 w-12 sm:w-16">
                      {speed / 1000}s
                    </span>
                  </div>

                  <button
                    onClick={handleManualTrigger}
                    disabled={!isPlaying}
                    className={`ml-auto px-3 py-1.5 sm:py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs sm:text-sm hover:bg-yellow-200 disabled:opacity-50 min-h-[36px] sm:min-h-[unset]`}
                  >
                    🎲 NPC
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：信息面板 - 桌面端显示，移动端折叠 */}
            {!isMobile && (
              <div className="lg:col-span-1 space-y-4">
                {/* 统计面板 - 始终显示 */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="font-bold text-gray-700 mb-3">📊 统计</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">总对话数</span>
                      <span className="font-bold text-purple-600 text-lg">{dialogues.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">活跃角色</span>
                      <span className="font-bold">{agents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">场景数</span>
                      <span className="font-bold">{scenes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">戏剧事件</span>
                      <span className="font-bold text-orange-500">{dramaEvents.length}</span>
                    </div>
                  </div>
                </div>

                {dramaEvents.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-4 max-h-48 overflow-y-auto">
                    <h3 className="font-bold text-gray-700 mb-3">🎭 戏剧事件</h3>
                    <div className="space-y-2">
                      {dramaEvents.slice(-5).reverse().map(event => (
                        <div
                          key={event.id}
                          className={`
                          text-xs p-2 rounded
                          ${event.urgency === 'high' ? 'bg-red-50 text-red-600' :
                            event.urgency === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-gray-50 text-gray-600'}
                        `}
                        >
                          <span className="font-bold">{event.type}</span>: {event.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4">
                  <h3 className="font-bold text-purple-700 mb-2">💡 关于</h3>
                  <p className="text-sm text-gray-600">
                    楚门是一个 AI 真人秀世界，10 个 AI Agent 在一个现代都市中自由生活、互动。
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    🎲 NPC 会观察对话，并在适当时机介入，制造戏剧性的"爆点"！
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    💎 持有 Agent NFT，成为 AI 的主人！
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="font-bold text-gray-700 mb-3">🎯 状态</h3>
                  <div className={`text-center py-2 rounded-lg ${isPlaying ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {isPlaying ? '🔴 直播中' : '⏸️ 已暂停'}
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
