// 楚门 - AI 真人秀世界 (整合 NFT 市场 + 像素世界)
// src/app/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAgentChat } from '@/hooks/useAgentChat';
import { useNPCTigger } from '@/hooks/useNPCTigger';
import { AgentCard } from '@/components/AgentCard';
import { DialogueBubble } from '@/components/DialogueBubble';
import { HighlightDialogue, isHighlightDialogue } from '@/components/HighlightDialogue';
import { NFTMarket } from '@/components/NFTMarket';
import { PixelWorld } from '@/game/components/PixelWorld';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { useDramaStorySync } from '@/hooks/useDramaStorySync';
import { agents } from '@/config/agents';
import { scenes } from '@/config/scenes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'pixel' | 'nft'>('chat');
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);

  const {
    tutorialCompleted,
    hideTutorial,
    showTutorial,
  } = useGameStore();

  // 检查是否需要显示教程（首次访问）
  useEffect(() => {
    const tutorialDone = localStorage.getItem('chumen_tutorial_completed');
    if (tutorialDone !== 'true') {
      setShowTutorialOverlay(true);
    }
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎬 楚门 Chumen
            </h1>
            <p className="text-sm text-gray-500">AI 真人秀世界 + NFT 市场</p>
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
            
            {/* 播放控制 */}
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
        </div>
      </header>

      {activeTab === 'chat' ? (
        /* 会话视图 */
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 左侧：角色列表 */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-bold text-gray-700">👥 角色 ({agents.length})</h2>
              <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto">
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
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-4 h-[70vh] flex flex-col">
                {/* 当前场景 */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                  <span className="text-2xl">{currentScene.emoji}</span>
                  <div>
                    <h2 className="font-bold text-gray-800">{currentScene.name}</h2>
                    <p className="text-sm text-gray-500">{currentScene.description}</p>
                  </div>
                </div>

                {/* 对话流 */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {dialogues.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                      <p>👆 点击"开始"启动真人秀</p>
                      <p className="text-sm mt-2">AI Agent 将自动产生对话</p>
                      <p className="text-sm mt-1">NPC 会观察并在适当时机介入，制造爆点！</p>
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
                <div className="mt-4 pt-4 border-t flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">速度:</span>
                    <input 
                      type="range" 
                      min="2000" 
                      max="15000" 
                      step="500"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500 w-16">
                      {speed / 1000}s
                    </span>
                  </div>
                  
                  <button
                    onClick={handleManualTrigger}
                    disabled={!isPlaying}
                    className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 disabled:opacity-50"
                  >
                    🎲 触发 NPC
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：信息面板 */}
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
          </div>
        </main>
      ) : activeTab === 'pixel' ? (
        /* 像素世界视图 */
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <PixelWorld />
          </div>
        </main>
      ) : (
        /* NFT 市场视图 */
        <main className="max-w-4xl mx-auto px-4 py-6">
          <NFTMarket />
        </main>
      )}

      {/* 教程浮层 */}
      {showTutorialOverlay && (
        <TutorialOverlay
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </div>
  );
}
