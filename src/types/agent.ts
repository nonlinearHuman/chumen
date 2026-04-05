// Agent 类型定义
// src/types/agent.ts

export interface Agent {
  id: string;
  name: string;
  nameCN: string;
  age: number;
  role: string;
  personality: string;
  goals: string[];
  background: string;
  relationships: Record<string, string>;
  emoji: string;
  isNPC: boolean;
}

export interface Scene {
  id: string;
  name: string;
  emoji: string;
  description: string;
  background: string;
  characters: string[];
  timeOfDay: string;
}

export interface Dialogue {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  scene: string;
}

export interface DramaEvent {
  id: string;
  type: 'emotion' | 'relationship' | 'silence' | 'random' | 'big' | 'conflict' | 'romance' | 'secret';
  trigger: string;
  npcId: string;
  content: string;
  urgency: 'low' | 'medium' | 'high';
}
