'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { audioEngine } from '@/game/engine/AudioEngine';
import { notificationService } from '@/lib/notificationService';

// ============ 类型定义 ============

export interface GameSettings {
  // 音频
  masterVolume: number;    // 0-100
  bgmVolume: number;       // 0-100
  sfxVolume: number;       // 0-100
  ambientEnabled: boolean;
  // 显示
  showFPS: boolean;
  showDialogueTimestamps: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  pixelQuality: 'low' | 'medium' | 'high';
  // 游戏
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // 分钟
  notificationsEnabled: boolean;
  // 语言
  language: 'zh' | 'en';
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  bgmVolume: 30,
  sfxVolume: 40,
  ambientEnabled: true,
  showFPS: false,
  showDialogueTimestamps: true,
  animationSpeed: 'normal',
  pixelQuality: 'medium',
  autoSaveEnabled: true,
  autoSaveInterval: 5,
  notificationsEnabled: false,
  language: 'zh',
};

// ============ 小组件 ============

const VolumeSlider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-purple-500"
    />
  </div>
);

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span>{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="toggle toggle-primary"
    />
  </label>
);

const Select: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="flex justify-between items-center">
    <span>{label}</span>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-1 border rounded-lg"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ============ 主组件 ============

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);

  const handleVolumeChange = (key: keyof GameSettings, value: number) => {
    updateSettings({ [key]: value } as Partial<GameSettings>);
    if (key === 'masterVolume') audioEngine.setMasterVolume(value / 100);
    if (key === 'bgmVolume') audioEngine.setBGMVolume(value / 100);
    if (key === 'sfxVolume') audioEngine.setSFXVolume(value / 100);
  };

  const handleExportSave = () => {
    const saveData = localStorage.getItem('chumen_save');
    if (!saveData) {
      alert('没有可导出的存档');
      return;
    }
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chumen-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSave = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.version) {
          localStorage.setItem('chumen_save', JSON.stringify(data));
          alert('存档导入成功，页面将刷新');
          window.location.reload();
        } else {
          alert('无效的存档文件');
        }
      } catch {
        alert('读取文件失败');
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">⚙️ 设置</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            ✕
          </button>
        </div>

        {/* 音量设置 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🔊 音量</h3>
          <div className="space-y-3">
            <VolumeSlider
              label="主音量"
              value={settings.masterVolume}
              onChange={v => handleVolumeChange('masterVolume', v)}
            />
            <VolumeSlider
              label="背景音乐"
              value={settings.bgmVolume}
              onChange={v => handleVolumeChange('bgmVolume', v)}
            />
            <VolumeSlider
              label="音效"
              value={settings.sfxVolume}
              onChange={v => handleVolumeChange('sfxVolume', v)}
            />
            <Toggle
              label="环境音"
              checked={settings.ambientEnabled}
              onChange={v => updateSettings({ ambientEnabled: v })}
            />
          </div>
        </section>

        {/* 显示设置 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🖥️ 显示</h3>
          <div className="space-y-3">
            <Toggle
              label="显示帧率 (FPS)"
              checked={settings.showFPS}
              onChange={v => updateSettings({ showFPS: v })}
            />
            <Toggle
              label="显示对话时间戳"
              checked={settings.showDialogueTimestamps}
              onChange={v => updateSettings({ showDialogueTimestamps: v })}
            />
            <Select
              label="动画速度"
              value={settings.animationSpeed}
              options={[
                { value: 'slow', label: '慢' },
                { value: 'normal', label: '正常' },
                { value: 'fast', label: '快' },
              ]}
              onChange={v => updateSettings({ animationSpeed: v as GameSettings['animationSpeed'] })}
            />
            <Select
              label="像素质量"
              value={settings.pixelQuality}
              options={[
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
              ]}
              onChange={v => updateSettings({ pixelQuality: v as GameSettings['pixelQuality'] })}
            />
          </div>
        </section>

        {/* 游戏设置 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🎮 游戏</h3>
          <div className="space-y-3">
            <Toggle
              label="自动存档"
              checked={settings.autoSaveEnabled}
              onChange={v => updateSettings({ autoSaveEnabled: v })}
            />
            <Toggle
              label="浏览器通知"
              checked={settings.notificationsEnabled}
              onChange={v => updateSettings({ notificationsEnabled: v })}
            />
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">浏览器通知权限</div>
                  <div className="text-xs text-gray-500">
                    {typeof Notification !== 'undefined' && Notification.permission === 'granted'
                      ? '已授权'
                      : typeof Notification !== 'undefined' && Notification.permission === 'denied'
                        ? '已拒绝，请在浏览器设置中开启'
                        : '点击授权通知权限'}
                  </div>
                </div>
                {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
                  <button
                    onClick={async () => {
                      const granted = await notificationService.requestPermission();
                      if (granted) {
                        updateSettings({ notificationsEnabled: true });
                      }
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
                  >
                    授权
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 语言 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🌐 语言</h3>
          <div className="space-y-3">
            <Select
              label="界面语言"
              value={settings.language}
              options={[
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' },
              ]}
              onChange={v => updateSettings({ language: v as GameSettings['language'] })}
            />
          </div>
        </section>

        {/* 快捷键帮助 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">⌨️ 快捷键</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Space</kbd>
              <span>开始 / 暂停</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd>
              <span>关闭弹窗</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+1</kbd>
              <span>切换到会话</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+2</kbd>
              <span>切换到像素世界</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+3</kbd>
              <span>切换到NFT</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+A</kbd>
              <span>成就面板</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+S</kbd>
              <span>统计面板</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+Shift+S</kbd>
              <span>保存游戏</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+D</kbd>
              <span>每日挑战</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+T</kbd>
              <span>时间线</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+R</kbd>
              <span>关系图谱</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+,</kbd>
              <span>设置</span>
            </div>
          </div>
        </section>

        {/* 数据管理 */}
        <section>
          <h3 className="text-lg font-semibold mb-3">💾 数据</h3>
          <div className="space-y-2">
            <button
              onClick={handleExportSave}
              className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              📤 导出存档
            </button>
            <button
              onClick={handleImportSave}
              className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              📥 导入存档
            </button>
            <button
              onClick={() => {
                if (confirm('⚠️ 确定要重置所有数据吗？\n这将清除所有存档、成就和设置，此操作不可恢复。')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              🗑️ 重置所有数据
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
