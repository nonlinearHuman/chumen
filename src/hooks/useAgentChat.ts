// AI 对话引擎 - 修复版
// src/hooks/useAgentChat.ts

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { agents } from '@/config/agents';

export const useAgentChat = () => { 
  const { 
    dialogues, 
    addDialogue, 
    currentScene, 
    isPlaying, 
    speed,
    activeAgents 
  } = useGameStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false); // 用 ref 跟踪播放状态

  // 调用 API 获取对话
  const fetchDialogue = useCallback(async (agentId: string): Promise<string | null> => {
    // 防止并发请求
    if (isFetchingRef.current) return null;
    if (!isPlayingRef.current) return null; // 如果已经暂停，不再获取
    
    isFetchingRef.current = true;
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          scene: currentScene.id,
          context: dialogues.slice(-3).map(d => d.content),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.response;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch dialogue:', error);
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  }, [currentScene, dialogues]);

  // 开始对话循环
  const startChatLoop = useCallback(async () => {
    // 清除之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 更新 ref
    isPlayingRef.current = true;

    // 立即触发一次对话
    const agentIds = activeAgents.map(a => a.id);
    const randomAgentId = agentIds[Math.floor(Math.random() * agentIds.length)];
    const content = await fetchDialogue(randomAgentId);
    if (content && isPlayingRef.current) {
      addDialogue(randomAgentId, content);
    }

    // 设置定时器 - 使用当前 speed 值
    const currentSpeed = useGameStore.getState().speed;
    
    intervalRef.current = setInterval(async () => {
      if (!isPlayingRef.current) {
        // 如果已暂停，清除定时器
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      
      // 随机选择一个 Agent 发言
      const newAgentIds = activeAgents.map(a => a.id);
      const newRandomAgentId = newAgentIds[Math.floor(Math.random() * newAgentIds.length)];
      const newContent = await fetchDialogue(newRandomAgentId);
      
      if (newContent && isPlayingRef.current) {
        addDialogue(newRandomAgentId, newContent);
      }
    }, currentSpeed);
  }, [activeAgents, fetchDialogue, addDialogue]);

  // 停止对话
  const stopChatLoop = useCallback(() => {
    isPlayingRef.current = false;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 监听播放状态 - 使用 ref 来确保正确停止
  useEffect(() => {
    if (isPlaying) {
      startChatLoop();
    } else {
      stopChatLoop();
    }
    
    return () => {
      stopChatLoop();
    };
  }, [isPlaying]); // 只监听 isPlaying 变化

  // 监听速度变化 - 重新启动循环
  useEffect(() => {
    if (isPlaying && isPlayingRef.current) {
      // 先停止
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // 重新开始
      startChatLoop();
    }
  }, [speed]); // 只在 speed 变化时重启

  return {
    dialogues,
    startChat: startChatLoop,
    stopChat: stopChatLoop,
  };
};
