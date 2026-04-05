// 故事引擎 React Hook
// src/game/engine/useStoryEngine.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { StoryEvent, Relationship, EVENT_TYPE_DESC } from '@/types/story';
import { EventTrigger } from './EventTrigger';
import { StoryGenerator } from '@/lib/storyGenerator';
import { RelationshipEngine } from '@/lib/relationshipEngine';
import { agents } from '@/config/agents';

export interface UseStoryEngineReturn {
  currentEvent: StoryEvent | null;
  recentEvents: StoryEvent[];
  relationships: Relationship[];
  checkForEvents: (characters: any[], location: string) => Promise<void>;
  dismissEvent: () => void;
  updateRelationship: (charA: string, charB: string, change: number) => void;
}

export function useStoryEngine(): UseStoryEngineReturn {
  const [currentEvent, setCurrentEvent] = useState<StoryEvent | null>(null);
  const [recentEvents, setRecentEvents] = useState<StoryEvent[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  
  const eventTriggerRef = useRef<EventTrigger | null>(null);
  const storyGeneratorRef = useRef<StoryGenerator | null>(null);
  const relationshipEngineRef = useRef<RelationshipEngine | null>(null);

  // 初始化
  useEffect(() => {
    eventTriggerRef.current = new EventTrigger();
    storyGeneratorRef.current = new StoryGenerator();
    relationshipEngineRef.current = new RelationshipEngine(agents);
  }, []);

  // 检查事件触发
  const checkForEvents = useCallback(async (characters: any[], location: string) => {
    if (!eventTriggerRef.current) return;

    const event = eventTriggerRef.current.checkTriggers(characters, location);
    if (event) {
      // 生成对话
      if (storyGeneratorRef.current) {
        event.dialogue = await storyGeneratorRef.current.generateEventDialogue(event);
      }
      
      setCurrentEvent(event);
      setRecentEvents(prev => [event, ...prev].slice(0, 20));
      
      // 更新关系
      if (relationshipEngineRef.current) {
        relationshipEngineRef.current.applyConsequences(event);
        setRelationships(relationshipEngineRef.current.getAllRelationships());
      }
    }
  }, [relationships]);

  // 关闭当前事件
  const dismissEvent = useCallback(() => {
    setCurrentEvent(null);
  }, []);

  // 更新关系
  const updateRelationship = useCallback((charA: string, charB: string, change: number) => {
    if (relationshipEngineRef.current) {
      const relation = relationshipEngineRef.current.getRelationship(charA, charB);
      if (relation) {
        relation.sentiment = Math.max(-100, Math.min(100, relation.sentiment + change));
        relation.strength = Math.min(100, relation.strength + Math.abs(change) * 0.5);
        setRelationships(relationshipEngineRef.current.getAllRelationships());
      }
    }
  }, []);

  return {
    currentEvent,
    recentEvents,
    relationships,
    checkForEvents,
    dismissEvent,
    updateRelationship,
  };
}

// 辅助函数：格式化事件摘要
export function formatEventSummary(event: StoryEvent): string {
  const typeDesc = EVENT_TYPE_DESC[event.type] || event.type;
  const participants = event.participants.join(' & ');
  return `${typeDesc}: ${participants} - ${event.content}`;
}

// 辅助函数：获取事件颜色
export function getEventColor(type: string): string {
  const colors: Record<string, string> = {
    conflict: 'text-red-500',
    reconciliation: 'text-green-500',
    romance: 'text-pink-500',
    betrayal: 'text-purple-500',
    surprise: 'text-yellow-500',
    tragedy: 'text-gray-500',
    victory: 'text-blue-500',
  };
  return colors[type] || 'text-gray-400';
}

export default useStoryEngine;
