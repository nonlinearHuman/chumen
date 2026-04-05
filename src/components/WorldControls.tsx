'use client';

import { useState, useEffect, useRef } from 'react';
import { TimeOfDay, TimePhase } from '../game/engine/DayNightCycle';
import { Weather, WeatherType } from '../game/engine/WeatherSystem';
import { audioEngine } from '../game/engine/AudioEngine';

interface WorldControlsProps {
  currentTime: TimeOfDay | null;
  currentWeather: Weather | null;
  onTimeChange: (hour: number) => void;
  onWeatherChange: (type: WeatherType) => void;
  autoMode: boolean;
  onAutoModeChange: (enabled: boolean) => void;
}

const PHASE_ICONS: Record<TimePhase, string> = {
  dawn: '🌅',
  day: '☀️',
  dusk: '🌇',
  night: '🌙',
};

const WEATHER_OPTIONS: { type: WeatherType; name: string }[] = [
  { type: 'clear', name: '☀️ 晴天' },
  { type: 'cloudy', name: '⛅ 多云' },
  { type: 'overcast', name: '☁️ 阴天' },
  { type: 'light_rain', name: '🌧️ 小雨' },
  { type: 'heavy_rain', name: '🌧️ 大雨' },
  { type: 'thunderstorm', name: '⛈️ 雷暴' },
  { type: 'light_snow', name: '🌨️ 小雪' },
  { type: 'heavy_snow', name: '❄️ 大雪' },
  { type: 'fog', name: '🌫️ 雾天' },
];

export default function WorldControls({
  currentTime,
  currentWeather,
  onTimeChange,
  onWeatherChange,
  autoMode,
  onAutoModeChange,
}: WorldControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(30); // 0-100
  const [sfxVolume, setSfxVolume] = useState(40); // 0-100
  const [audioInitialized, setAudioInitialized] = useState(false);

  // 初始化音频上下文
  const initAudio = async () => {
    await audioEngine.init();
    setAudioInitialized(true);
  };

  // 静音切换
  const toggleMute = () => {
    if (!audioInitialized) {
      initAudio();
      setIsMuted(false);
      return;
    }
    if (isMuted) {
      audioEngine.unmute();
      audioEngine.setBGMVolume(bgmVolume / 100);
      audioEngine.setSFXVolume(sfxVolume / 100);
    } else {
      audioEngine.mute();
    }
    setIsMuted(!isMuted);
  };

  // BGM 音量变化
  const handleBgmVolume = (v: number) => {
    setBgmVolume(v);
    if (audioInitialized && !isMuted) {
      audioEngine.setBGMVolume(v / 100);
    }
  };

  // SFX 音量变化
  const handleSfxVolume = (v: number) => {
    setSfxVolume(v);
    if (audioInitialized && !isMuted) {
      audioEngine.setSFXVolume(v / 100);
    }
  };

  // 测试音效
  const testSfx = () => {
    if (!audioInitialized) initAudio();
    setTimeout(() => audioEngine.playSound('ui_click'), 50);
  };

  if (!currentTime || !currentWeather) return null;

  const formatTime = (time: TimeOfDay) => {
    const h = time.hour.toString().padStart(2, '0');
    const m = time.minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const getPhaseName = (phase: TimePhase) => {
    const names: Record<TimePhase, string> = {
      dawn: '黎明',
      day: '白天',
      dusk: '黄昏',
      night: '夜晚',
    };
    return names[phase];
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* 收起状态 - 小图标 */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-black/60 backdrop-blur-sm rounded-xl p-3 hover:bg-black/70 transition-all border border-white/10"
        >
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">{PHASE_ICONS[currentTime.phase]}</span>
            <span className="text-lg font-mono">{formatTime(currentTime)}</span>
          </div>
        </button>
      )}

      {/* 展开状态 - 控制面板 */}
      {isExpanded && (
        <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4 min-w-[280px] border border-white/10 shadow-xl">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              🌍 世界控制
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 时间显示 */}
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs">当前时间</span>
              <span className="text-white/60 text-xs">自动模式</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{PHASE_ICONS[currentTime.phase]}</span>
                <div>
                  <div className="text-white font-mono text-xl">{formatTime(currentTime)}</div>
                  <div className="text-white/50 text-xs">{getPhaseName(currentTime.phase)}</div>
                </div>
              </div>
              <button
                onClick={() => onAutoModeChange(!autoMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoMode ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    autoMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 时间滑块（手动模式时可用） */}
          {!autoMode && (
            <div className="mb-4">
              <label className="text-white/60 text-xs block mb-2">
                手动调整时间
              </label>
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs">00:00</span>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={currentTime.hour}
                  onChange={(e) => onTimeChange(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-yellow-400
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-white/40 text-xs">23:00</span>
              </div>
              <div className="flex justify-between mt-1 text-white/30 text-xs">
                <span>🌅 黎明 5-7</span>
                <span>☀️ 白天 7-18</span>
                <span>🌙 夜晚</span>
              </div>
            </div>
          )}

          {/* 天气选择 */}
          <div>
            <label className="text-white/60 text-xs block mb-2">
              当前天气
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WEATHER_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => onWeatherChange(option.type)}
                  className={`px-2 py-2 rounded-lg text-xs transition-all ${
                    currentWeather.type === option.type
                      ? 'bg-blue-500/50 text-white border border-blue-400'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          {/* 音效控制 */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-xs">🔊 音效控制</span>
              <button
                onClick={testSfx}
                className="text-white/40 hover:text-white text-xs transition-colors"
              >
                测试
              </button>
            </div>

            {/* 总静音开关 */}
            <div className="flex items-center justify-between mb-3 bg-white/5 rounded-lg p-2">
              <span className="text-white/70 text-xs">音效 {isMuted ? '🔇 静音' : '🔉 开启'}</span>
              <button
                onClick={toggleMute}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isMuted ? 'bg-red-500/60' : 'bg-green-500/60'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isMuted ? 'left-1' : 'left-7'
                  }`}
                />
              </button>
            </div>

            {/* BGM 音量 */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/50 text-xs">🎵 BGM 音量</span>
                <span className="text-white/40 text-xs font-mono">{bgmVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVolume}
                onChange={(e) => handleBgmVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-pink-400
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* SFX 音量 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/50 text-xs">🔔 SFX 音量</span>
                <span className="text-white/40 text-xs font-mono">{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => handleSfxVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-cyan-400
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>

          {/* 环境信息 */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40 mb-1">光照颜色</div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-white/20"
                    style={{ backgroundColor: currentTime.lightColor }}
                  />
                  <span className="text-white/70 font-mono text-xs">
                    {currentTime.lightColor}
                  </span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40 mb-1">天气强度</div>
                <div className="text-white/70">
                  {Math.round(currentWeather.intensity * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
