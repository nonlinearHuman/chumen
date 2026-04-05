// 事件触发系统 - 检测并触发故事事件
// src/game/engine/EventTrigger.ts

import { 
  StoryEvent, 
  EventType, 
  EventTrigger as IEventTrigger,
  Relationship,
  EVENT_IMPACT
} from '@/types/story';
import { RelationshipEngine, getRelationshipEngine } from '@/lib/relationshipEngine';
import { StoryGenerator, getStoryGenerator } from '@/lib/storyGenerator';
import { EVENT_TEMPLATES, getRandomTemplate, filterTemplates } from '@/data/storyTemplates';
import { getAgentById, agents } from '@/config/agents';
import { Character } from './GameEngine';

// 触发器配置
interface TriggerConfig {
  proximityThreshold: number;    // 角色接近距离阈值
  baseRandomProbability: number; // 基础随机事件概率
  minEventInterval: number;      // 最小事件间隔（毫秒）
  maxQueueSize: number;          // 最大事件队列长度
}

const DEFAULT_CONFIG: TriggerConfig = {
  proximityThreshold: 150,       // 像素距离
  baseRandomProbability: 0.03,   // 3%
  minEventInterval: 15000,       // 15秒
  maxQueueSize: 10,
};

export class EventTriggerSystem {
  private relationshipEngine: RelationshipEngine;
  private storyGenerator: StoryGenerator;
  private config: TriggerConfig;
  
  private lastEventTime: Map<string, number> = new Map();
  private eventQueue: StoryEvent[] = [];
  private recentEvents: StoryEvent[] = [];
  private isProcessing: boolean = false;

  constructor(config: Partial<TriggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.relationshipEngine = getRelationshipEngine(agents);
    this.storyGenerator = getStoryGenerator();
  }

  // 主检查函数（同步版本）
  checkTriggers(characters: Character[], currentLocation: string): StoryEvent | null {
    // 如果正在处理事件，跳过
    if (this.isProcessing) return null;

    // 检查冷却时间
    const now = Date.now();
    const lastGlobalEvent = Math.max(...Array.from(this.lastEventTime.values()), 0);
    if (now - lastGlobalEvent < this.config.minEventInterval) {
      return null;
    }

    // 1. 检查角色接近触发
    const proximityEvent = this.checkProximityTriggers(characters, currentLocation);
    if (proximityEvent) return proximityEvent;

    // 2. 检查关系状态触发
    const relationshipEvent = this.checkRelationshipTriggers(characters, currentLocation);
    if (relationshipEvent) return relationshipEvent;

    // 3. 随机事件
    const randomEvent = this.checkRandomTrigger(characters, currentLocation);
    if (randomEvent) return randomEvent;

    return null;
  }

  // 异步版本（包含对话生成）
  async checkTriggersAsync(characters: Character[], currentLocation: string): Promise<StoryEvent | null> {
    const event = this.checkTriggers(characters, currentLocation);
    if (event && (!event.dialogue || event.dialogue.length === 0)) {
      try {
        event.dialogue = await this.storyGenerator.generateEventDialogue(event);
      } catch (error) {
        console.error('Failed to generate dialogue:', error);
      }
    }
    return event;
  }

  // 检查角色接近触发
  private checkProximityTriggers(characters: Character[], location: string): StoryEvent | null {
    const nearbyPairs = this.findNearbyCharacters(characters);

    for (const [charA, charB, distance] of nearbyPairs) {
      const relation = this.relationshipEngine.getRelationship(charA.id, charB.id);
      
      if (!relation) continue;

      // 冲突触发：敌对角色接近
      if (relation.sentiment < -30 && Math.random() < 0.25) {
        return this.createEvent('conflict', [charA.id, charB.id], location);
      }

      // 暧昧触发：异性+友好关系
      if (this.isOppositeSex(charA.id, charB.id)) {
        if (relation.sentiment > 30 && Math.random() < 0.2) {
          return this.createEvent('romance', [charA.id, charB.id], location);
        }
      }

      // 和解触发：曾经的敌人关系改善
      if (relation.sentiment > -10 && relation.sentiment < 30) {
        const hasConflict = relation.history.some(h => h.type === 'conflict');
        if (hasConflict && Math.random() < 0.15) {
          return this.createEvent('reconciliation', [charA.id, charB.id], location);
        }
      }

      // 背叛触发：亲密关系+利益诱惑
      if (relation.strength > 40 && relation.sentiment > 40 && Math.random() < 0.08) {
        return this.createEvent('betrayal', [charA.id, charB.id], location);
      }
    }

    return null;
  }

  // 检查关系状态触发
  private checkRelationshipTriggers(characters: Character[], location: string): StoryEvent | null {
    for (const char of characters) {
      const relations = this.relationshipEngine.getCharacterRelationships(char.id);
      
      for (const relation of relations) {
        // 检查时间冷却
        const lastInteraction = this.lastEventTime.get(relation.id) || 0;
        if (Date.now() - lastInteraction < this.config.minEventInterval * 2) {
          continue;
        }

        // 极端关系触发事件
        if (relation.sentiment < -50) {
          // 敌对关系，可能触发冲突
          if (Math.random() < 0.15) {
            const otherId = relation.characterA === char.id 
              ? relation.characterB 
              : relation.characterA;
            return this.createEvent('conflict', [char.id, otherId], location);
          }
        }

        if (relation.sentiment > 70 && relation.strength > 60) {
          // 亲密关系，可能触发浪漫
          if (Math.random() < 0.12 && this.isOppositeSex(char.id, relation.characterA === char.id ? relation.characterB : relation.characterA)) {
            const otherId = relation.characterA === char.id 
              ? relation.characterB 
              : relation.characterA;
            return this.createEvent('romance', [char.id, otherId], location);
          }
        }
      }
    }

    return null;
  }

  // 随机事件触发
  private checkRandomTrigger(characters: Character[], location: string): StoryEvent | null {
    if (Math.random() > this.config.baseRandomProbability) {
      return null;
    }

    // 随机选择事件类型（权重）
    const eventTypes: EventType[] = ['surprise', 'tragedy', 'victory'];
    const weights = [5, 2, 3];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedType: EventType = 'surprise';
    for (let i = 0; i < eventTypes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedType = eventTypes[i];
        break;
      }
    }

    // 随机选择角色
    const shuffled = [...characters].sort(() => Math.random() - 0.5);
    const participants = shuffled.slice(0, Math.random() > 0.5 ? 2 : 1).map(c => c.id);

    return this.createEvent(selectedType, participants, location);
  }

  // 创建事件（同步版本）
  private createEvent(type: EventType, participants: string[], location: string): StoryEvent {
    // 筛选合适的模板
    const relation = participants.length > 1 
      ? this.relationshipEngine.getRelationship(participants[0], participants[1])
      : undefined;

    const templates = filterTemplates(
      type,
      participants.length,
      relation?.sentiment,
      relation?.strength
    );

    const template = templates.length > 0 
      ? templates[Math.floor(Math.random() * templates.length)]
      : getRandomTemplate(type);

    // 替换模板中的占位符
    let content = template.content;
    if (participants.length >= 1) {
      const agentA = getAgentById(participants[0]);
      content = content.replace(/{A}/g, agentA?.nameCN || '某人');
    }
    if (participants.length >= 2) {
      const agentB = getAgentById(participants[1]);
      content = content.replace(/{B}/g, agentB?.nameCN || '某人');
    }
    if (participants.length >= 3) {
      const agentC = getAgentById(participants[2]);
      content = content.replace(/{C}/g, agentC?.nameCN || '某人');
    }

    const event: StoryEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      participants,
      location,
      trigger: { type: 'relationship', conditions: {} },
      content,
      consequences: template.consequences,
      timestamp: Date.now(),
      resolved: false,
    };

    // 对话生成延迟到 checkTriggersAsync 或手动调用

    // 记录触发时间
    const relationId = participants.length > 1 
      ? `${participants[0]}-${participants[1]}`
      : participants[0];
    this.lastEventTime.set(relationId, Date.now());

    // 添加到最近事件列表
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 20) {
      this.recentEvents = this.recentEvents.slice(0, 20);
    }

    return event;
  }

  // 处理事件（应用后果）
  async processEvent(event: StoryEvent): Promise<void> {
    this.isProcessing = true;

    try {
      // 应用关系后果
      this.relationshipEngine.applyConsequences(event);

      // 标记为已解决
      event.resolved = true;

      // 更新最近事件列表
      const index = this.recentEvents.findIndex(e => e.id === event.id);
      if (index >= 0) {
        this.recentEvents[index] = event;
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // 找到接近的角色对
  private findNearbyCharacters(characters: Character[]): [Character, Character, number][] {
    const pairs: [Character, Character, number][] = [];
    
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        const a = characters[i];
        const b = characters[j];
        
        const distance = Math.sqrt(
          Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
        );

        if (distance < this.config.proximityThreshold) {
          pairs.push([a, b, distance]);
        }
      }
    }

    // 按距离排序
    return pairs.sort((a, b) => a[2] - b[2]);
  }

  // 检查是否异性
  private isOppositeSex(charA: string, charB: string): boolean {
    const females = ['sophia', 'emily', 'lisa', 'zhangyi'];
    const aIsFemale = females.includes(charA);
    const bIsFemale = females.includes(charB);
    return aIsFemale !== bIsFemale;
  }

  // 获取最近事件
  getRecentEvents(limit: number = 10): StoryEvent[] {
    return this.recentEvents.slice(0, limit);
  }

  // 获取事件队列
  getEventQueue(): StoryEvent[] {
    return this.eventQueue;
  }

  // 添加事件到队列
  queueEvent(event: StoryEvent): void {
    if (this.eventQueue.length < this.config.maxQueueSize) {
      this.eventQueue.push(event);
    }
  }

  // 清除事件队列
  clearQueue(): void {
    this.eventQueue = [];
  }

  // 重置系统
  reset(): void {
    this.lastEventTime.clear();
    this.eventQueue = [];
    this.recentEvents = [];
    this.isProcessing = false;
  }
}

// 单例
let triggerInstance: EventTriggerSystem | null = null;

export function getEventTriggerSystem(config?: Partial<TriggerConfig>): EventTriggerSystem {
  if (!triggerInstance) {
    triggerInstance = new EventTriggerSystem(config);
  }
  return triggerInstance;
}

export function resetEventTriggerSystem(): void {
  triggerInstance = null;
}

// 别名导出，保持向后兼容
export { EventTriggerSystem as EventTrigger };
