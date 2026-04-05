// 故事引擎集成 Hook
// src/game/engine/useStoryEngine.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StoryEvent, 
  Relationship, 
  StoryState 
} from '@/types/story';
import { RelationshipEngine, getRelationshipEngine, resetRelationshipEngine } from '@/lib/relationshipEngine';
import { StoryGenerator, getStoryGenerator, resetStoryGenerator } from '@/lib/storyGenerator';
import { EventTriggerSystem, getEventTriggerSystem, resetEventTriggerSystem } from './EventTrigger';
import { Character } from './GameEngine';
import { agents } from '@/config/agents';

// ===== Hook 返回值 =====
interface UseStoryEngineResult {
  // 状态
  currentEvent: StoryEvent | null;
  recentEvents: StoryEvent[];
  relationships: Relationship[];
  isProcessing: boolean;
  
  // 操作
  checkForEvents: (characters: Character[], location: string) => Promise<StoryEvent | null>;
  processEvent: (event: StoryEvent) => Promise<void>;
  dismissEvent: () => void;
  
  // 关系操作
  getCharacterRelationships: (charId: string) => Relationship[];
  getRelationship: (charA: string, charB: string) => Relationship | undefined;
  
  // 故事生成
  generateDialogue: (event: StoryEvent) => Promise<void>;
  generateBackstory: (traits: string[]) => Promise<string>;
  
  // 状态管理
  reset: () => void;
  exportState: () => StoryState;
  importState: (state: StoryState) => void;
}

// ===== 主 Hook =====
export function useStoryEngine(): UseStoryEngineResult {
  // 状态
  const [currentEvent, setCurrentEvent] = useState<StoryEvent | null>(null);
  const [recentEvents, setRecentEvents] = useState<StoryEvent[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 引擎实例
  const relationshipEngineRef = useRef<RelationshipEngine | null>(null);
  const triggerSystemRef = useRef<EventTriggerSystem | null>(null);
  const storyGeneratorRef = useRef<StoryGenerator | null>(null);

  // 初始化引擎
  useEffect(() => {
    try {
      relationshipEngineRef.current = getRelationshipEngine(agents);
      triggerSystemRef.current = getEventTriggerSystem();
      storyGeneratorRef.current = getStoryGenerator();

      // 同步关系状态
      setRelationships(relationshipEngineRef.current.getAllRelationships());
    } catch (error) {
      console.error('Failed to initialize story engine:', error);
    }

    return () => {
      // 清理（可选）
    };
  }, []);

  // 检查事件触发
  const checkForEvents = useCallback(async (
    characters: Character[], 
    location: string
  ): Promise<StoryEvent | null> => {
    if (!triggerSystemRef.current || isProcessing) {
      return null;
    }

    const event = triggerSystemRef.current.checkTriggers(characters, location);
    
    if (event) {
      setCurrentEvent(event);
      
      // 更新最近事件列表
      setRecentEvents(prev => {
        const updated = [event, ...prev.filter(e => e.id !== event.id)];
        return updated.slice(0, 20);
      });

      // 生成对话（如果还没有）
      if (!event.dialogue || event.dialogue.length === 0) {
        await generateDialogue(event);
      }
    }

    return event;
  }, [isProcessing]);

  // 处理事件（应用后果）
  const processEvent = useCallback(async (event: StoryEvent): Promise<void> => {
    if (!relationshipEngineRef.current || !triggerSystemRef.current) {
      return;
    }

    setIsProcessing(true);

    try {
      // 应用后果
      const updatedRelations = relationshipEngineRef.current.applyConsequences(event);
      
      // 更新关系状态
      setRelationships(relationshipEngineRef.current.getAllRelationships());

      // 标记事件为已解决
      event.resolved = true;

      // 更新最近事件列表
      setRecentEvents(prev => 
        prev.map(e => e.id === event.id ? event : e)
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 关闭当前事件
  const dismissEvent = useCallback(() => {
    if (currentEvent) {
      // 如果事件还没处理，先处理
      if (!currentEvent.resolved) {
        processEvent(currentEvent);
      }
    }
    setCurrentEvent(null);
  }, [currentEvent, processEvent]);

  // 获取角色的所有关系
  const getCharacterRelationships = useCallback((charId: string): Relationship[] => {
    return relationshipEngineRef.current?.getCharacterRelationships(charId) || [];
  }, []);

  // 获取两个角色之间的关系
  const getRelationship = useCallback((charA: string, charB: string): Relationship | undefined => {
    return relationshipEngineRef.current?.getRelationship(charA, charB);
  }, []);

  // 生成对话
  const generateDialogue = useCallback(async (event: StoryEvent): Promise<void> => {
    if (!storyGeneratorRef.current) return;

    try {
      const dialogue = await storyGeneratorRef.current.generateEventDialogue(event);
      event.dialogue = dialogue;

      // 更新当前事件
      if (currentEvent?.id === event.id) {
        setCurrentEvent({ ...event });
      }

      // 更新最近事件列表
      setRecentEvents(prev =>
        prev.map(e => e.id === event.id ? event : e)
      );
    } catch (error) {
      console.error('Failed to generate dialogue:', error);
    }
  }, [currentEvent]);

  // 生成背景故事
  const generateBackstory = useCallback(async (traits: string[]): Promise<string> => {
    if (!storyGeneratorRef.current) {
      return '一个神秘的陌生人，背后隐藏着不为人知的秘密。';
    }

    return await storyGeneratorRef.current.generateBackstory(traits);
  }, []);

  // 重置引擎
  const reset = useCallback(() => {
    resetRelationshipEngine();
    resetStoryGenerator();
    resetEventTriggerSystem();
    
    setCurrentEvent(null);
    setRecentEvents([]);
    setRelationships([]);
    setIsProcessing(false);

    // 重新初始化
    relationshipEngineRef.current = getRelationshipEngine(agents);
    triggerSystemRef.current = getEventTriggerSystem();
    storyGeneratorRef.current = getStoryGenerator();

    setRelationships(relationshipEngineRef.current.getAllRelationships());
  }, []);

  // 导出状态
  const exportState = useCallback((): StoryState => {
    return {
      currentEvent,
      recentEvents,
      relationships,
      eventQueue: triggerSystemRef.current?.getEventQueue() || [],
      lastEventTime: recentEvents[0]?.timestamp || 0,
      totalEvents: recentEvents.length,
    };
  }, [currentEvent, recentEvents, relationships]);

  // 导入状态
  const importState = useCallback((state: StoryState) => {
    if (state.relationships && relationshipEngineRef.current) {
      relationshipEngineRef.current.importState(state.relationships);
      setRelationships(relationshipEngineRef.current.getAllRelationships());
    }

    setCurrentEvent(state.currentEvent);
    setRecentEvents(state.recentEvents);
  }, []);

  return {
    currentEvent,
    recentEvents,
    relationships,
    isProcessing,
    checkForEvents,
    processEvent,
    dismissEvent,
    getCharacterRelationships,
    getRelationship,
    generateDialogue,
    generateBackstory,
    reset,
    exportState,
    importState,
  };
}

// ===== 辅助函数：格式化事件摘要 =====
export function formatEventSummary(event: StoryEvent): string {
  const participants = event.participants
    .map(id => {
      const agent = agents.find(a => a.id === id);
      return agent?.nameCN || id;
    })
    .join('、');

  return `【${event.type}】${participants}：${event.content}`;
}

// ===== 辅助函数：获取事件颜色 =====
export function getEventColor(event: StoryEvent): string {
  const colors: Record<string, string> = {
    conflict: '#e74c3c',
    reconciliation: '#3498db',
    romance: '#e91e8c',
    betrayal: '#8e44ad',
    surprise: '#f39c12',
    tragedy: '#2c3e50',
    victory: '#27ae60',
  };

  return colors[event.type] || '#95a5a6';
}
