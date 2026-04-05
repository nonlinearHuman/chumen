// 像素世界游戏组件 - Web3 风格 + 昼夜天气控制
// src/game/components/PixelWorld.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { useGameEngine, Character } from '../engine/GameEngine';
import { audioEngine } from '../engine/AudioEngine';
import WorldControls from '../../components/WorldControls';
import { WeatherType } from '../engine/WeatherSystem';

interface PixelWorldProps {
  onDialogueStart?: () => void;
  onDialogueEnd?: () => void;
  isMobile?: boolean;
}

export const PixelWorld: React.FC<PixelWorldProps> = ({ onDialogueStart, onDialogueEnd, isMobile = false }) => {
  const {
    canvasRef,
    characters,
    scene,
    selectedCharacter,
    setSelectedCharacter,
    setScene,
    triggerDialogue,
    scenes,
    isPlaying,
    setIsPlaying,
    // v5: 昼夜和天气控制
    currentTime,
    currentWeather,
    onTimeChange,
    onWeatherChange,
    autoMode,
    onAutoModeChange,
  } = useGameEngine();

  const [isMuted, setIsMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // 初始化音频（用户首次交互）
  const initAudio = useCallback(async () => {
    if (!audioReady) {
      await audioEngine.init();
      await audioEngine.switchScene(scene.id);
      setAudioReady(true);
    }
  }, [audioReady, scene.id]);

  // 处理点击角色
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    initAudio();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击了角色
    for (const char of characters) {
      const distance = Math.sqrt((char.x - x) ** 2 + (char.y - y) ** 2);
      if (distance < 35) {
        audioEngine.playSound('character_select');
        setSelectedCharacter(char.id);
        setSelectedCharacter(char.id);
        
        // 移动到点击位置
        const moveX = Math.max(50, Math.min(750, x));
        const moveY = Math.max(50, Math.min(550, y));
        
        // 更新位置（通过重新设置目标）
        triggerDialogue(char.id);
        onDialogueStart?.();
        
        setTimeout(() => {
          onDialogueEnd?.();
        }, 3000);
        return;
      }
    }
    
    // 点击空白处取消选择
    setSelectedCharacter(null);
  };

  // 场景切换
  const handleSceneChange = async (sceneId: string) => {
    await initAudio();
    setScene(sceneId);
  };

  // 静音切换
  const toggleMute = async () => {
    await initAudio();
    if (isMuted) {
      audioEngine.unmute();
    } else {
      audioEngine.mute();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="space-y-4">
      {/* 世界控制面板 */}
      <WorldControls
        currentTime={currentTime}
        currentWeather={currentWeather}
        onTimeChange={onTimeChange}
        onWeatherChange={onWeatherChange}
        autoMode={autoMode}
        onAutoModeChange={onAutoModeChange}
      />
      
      {/* 游戏画布 */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl border-4" style={{ borderColor: scene.accentColor }}>
        <canvas
          ref={canvasRef}
          width={isMobile ? 360 : 800}
          height={isMobile ? 300 : 600}
          onClick={handleCanvasClick}
          onTouchStart={(e) => {
            initAudio();
            const touch = e.touches[0];
            const canvas = canvasRef.current;
            if (!canvas || !touch) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (touch.clientX - rect.left) * scaleX;
            const y = (touch.clientY - rect.top) * scaleY;
            for (const char of characters) {
              const distance = Math.sqrt((char.x - x) ** 2 + (char.y - y) ** 2);
              if (distance < 35) {
                audioEngine.playSound('character_select');
                setSelectedCharacter(char.id);
                triggerDialogue(char.id);
                onDialogueStart?.();
                setTimeout(() => onDialogueEnd?.(), 3000);
                break;
              }
            }
          }}
          className="cursor-pointer bg-gray-900"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* 场景名称 */}
        <div 
          className="absolute top-4 left-4 px-4 py-2 rounded-lg font-bold text-white"
          style={{ backgroundColor: scene.accentColor }}
        >
          {scene.emoji} {scene.name}
        </div>
        
        {/* 控制按钮 */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* 音效按钮 */}
          <button
            onClick={toggleMute}
            className="px-4 py-2 rounded-lg font-bold bg-gray-700 hover:bg-gray-600 text-white shadow-lg"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          {/* 播放/暂停 */}
          <button
            onClick={() => {
              initAudio();
              setIsPlaying(!isPlaying);
            }}
            className={`px-4 py-2 rounded-lg font-bold ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white shadow-lg`}
          >
            {isPlaying ? '⏹ Pause' : '▶ Play'}
          </button>
        </div>
        
        {/* 角色信息 */}
        {selectedCharacter && (
          <div 
            className="absolute bottom-4 left-4 p-4 rounded-lg text-white"
            style={{ backgroundColor: '#1a1a2e', border: `2px solid ${scene.accentColor}` }}
          >
            {characters.filter(c => c.id === selectedCharacter).map(char => (
              <div key={char.id}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{char.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg">{char.name}</h3>
                    <p className="text-xs opacity-70">{scene.name} 常驻</p>
                  </div>
                </div>
                {char.skills && (
                  <div className="flex gap-2 mt-2">
                    {char.skills.map(skill => (
                      <span 
                        key={skill}
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ backgroundColor: scene.accentColor + '40' }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* 底部提示 */}
        <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
          💡 Click character to interact
        </div>
      </div>
      
      {/* 场景切换 */}
      <div className="flex gap-2 justify-center flex-wrap">
        {scenes.map(s => (
          <button 
            key={s.id}
            onClick={() => handleSceneChange(s.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              scene.id === s.id 
                ? 'text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            style={scene.id === s.id ? { backgroundColor: s.accentColor } : {}}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>
      
      {/* 快捷操作 */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            initAudio();
            characters.forEach(c => triggerDialogue(c.id));
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:opacity-90"
        >
          🎲 Trigger All
        </button>
      </div>
    </div>
  );
};

export default PixelWorld;
