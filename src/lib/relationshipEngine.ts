// 关系引擎 - 管理角色之间的关系变化
// src/lib/relationshipEngine.ts

import { 
  Relationship, 
  RelationType, 
  StoryEvent, 
  EventType,
  EVENT_IMPACT,
  RELATION_THRESHOLDS,
  RelationEvent
} from '@/types/story';
import { Agent } from '@/types/agent';

// 性格兼容性矩阵（简化版）
const PERSONALITY_COMPATIBILITY: Record<string, Record<string, number>> = {
  '野心勃勃': { '理性强势': 0.8, '温柔体贴': 0.6, '正义感强': 0.5 },
  '理性强势': { '野心勃勃': 0.8, '老谋深算': 0.7, '温柔体贴': 0.5 },
  '温柔体贴': { '正义感强': 0.9, '野心勃勃': 0.6, '冲动': 0.4 },
  '正义感强': { '温柔体贴': 0.9, '理性强势': 0.6, '老谋深算': 0.2 },
  '老谋深算': { '理性强势': 0.7, '野心勃勃': 0.8, '正义感强': 0.2 },
  '冲动': { '野心勃勃': 0.5, '温柔体贴': 0.7, '理性强势': 0.4 },
};

export class RelationshipEngine {
  private relationships: Map<string, Relationship> = new Map();
  private agents: Map<string, Agent> = new Map();

  constructor(agents: Agent[]) {
    // 初始化 agents
    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });

    // 从 agent.relationships 初始化关系
    agents.forEach(agent => {
      if (agent.relationships) {
        Object.entries(agent.relationships).forEach(([targetId, relationDesc]) => {
          const relationId = this.getRelationId(agent.id, targetId);
          if (!this.relationships.has(relationId)) {
            const initialRel = this.createInitialRelationship(agent.id, targetId, relationDesc);
            this.relationships.set(relationId, initialRel);
          }
        });
      }
    });
  }

  // 生成关系ID
  private getRelationId(a: string, b: string): string {
    return [a, b].sort().join('-');
  }

  // 创建初始关系
  private createInitialRelationship(charA: string, charB: string, description: string): Relationship {
    // 根据描述推断初始情感值
    const sentiment = this.inferSentimentFromDesc(description);
    const type = this.inferRelationType(description);
    
    return {
      id: this.getRelationId(charA, charB),
      characterA: charA,
      characterB: charB,
      type,
      strength: 20, // 初始强度
      sentiment,
      history: [],
      secrets: [],
      lastInteraction: Date.now(),
    };
  }

  // 从描述推断情感值
  private inferSentimentFromDesc(desc: string): number {
    const negativeKeywords = ['对手', '敌人', '竞争', '被调查', '想调查'];
    const positiveKeywords = ['朋友', '暗恋', '同学', '同事', '徒弟', '线人'];
    const neutralKeywords = ['投资人', '被包养', '医患', '表面朋友'];

    for (const keyword of negativeKeywords) {
      if (desc.includes(keyword)) return -30;
    }
    for (const keyword of positiveKeywords) {
      if (desc.includes(keyword)) return 40;
    }
    for (const keyword of neutralKeywords) {
      if (desc.includes(keyword)) return 10;
    }

    return 0; // 默认中立
  }

  // 从描述推断关系类型
  private inferRelationType(desc: string): RelationType {
    if (desc.includes('对手') || desc.includes('竞争')) return 'competitor';
    if (desc.includes('敌人')) return 'enemy';
    if (desc.includes('暗恋')) return 'love_interest';
    if (desc.includes('朋友')) return 'friend';
    if (desc.includes('同学') || desc.includes('同事')) return 'colleague';
    if (desc.includes('投资人') || desc.includes('被包养')) return 'acquaintance';
    return 'stranger';
  }

  // 获取两个角色之间的关系
  getRelationship(charA: string, charB: string): Relationship | undefined {
    return this.relationships.get(this.getRelationId(charA, charB));
  }

  // 获取所有关系
  getAllRelationships(): Relationship[] {
    return Array.from(this.relationships.values());
  }

  // 获取角色的所有关系
  getCharacterRelationships(charId: string): Relationship[] {
    return this.getAllRelationships().filter(
      rel => rel.characterA === charId || rel.characterB === charId
    );
  }

  // 获取性格兼容性
  private getCompatibility(charA: string, charB: string): number {
    const agentA = this.agents.get(charA);
    const agentB = this.agents.get(charB);
    
    if (!agentA || !agentB) return 1;

    const personalityA = agentA.personality?.split('，')[0] || '';
    const personalityB = agentB.personality?.split('，')[0] || '';

    const compat = PERSONALITY_COMPATIBILITY[personalityA]?.[personalityB] || 0.7;
    return compat;
  }

  // 计算关系变化
  calculateChange(event: StoryEvent, relationship: Relationship): number {
    // 1. 根据事件类型确定基础变化
    const baseChange = EVENT_IMPACT[event.type];
    
    // 2. 考虑角色性格兼容性
    const compatibility = this.getCompatibility(
      event.participants[0],
      event.participants[1]
    );
    
    // 3. 考虑当前关系状态（边际效应递减）
    const currentStrength = relationship.strength;
    const diminishingFactor = 1 - currentStrength / 200;
    
    // 4. 添加随机波动
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2
    
    // 5. 计算最终变化
    const change = Math.round(baseChange * compatibility * diminishingFactor * randomFactor);
    
    return Math.max(-50, Math.min(50, change)); // 限制在 -50 到 50
  }

  // 应用事件后果
  applyConsequences(event: StoryEvent): Relationship[] {
    const updatedRelationships: Relationship[] = [];

    event.participants.forEach((charId, index) => {
      const otherParticipants = event.participants.filter(id => id !== charId);
      
      otherParticipants.forEach(otherId => {
        const relation = this.getRelationship(charId, otherId);
        if (relation) {
          const change = this.calculateChange(event, relation);
          
          // 更新关系
          relation.sentiment = Math.max(-100, Math.min(100, relation.sentiment + change));
          relation.strength = Math.min(100, relation.strength + Math.abs(change) * 0.5);
          relation.type = this.updateRelationType(relation);
          relation.lastInteraction = Date.now();

          // 添加历史记录
          relation.history.push({
            eventId: event.id,
            type: event.type,
            timestamp: Date.now(),
            change,
            description: event.content,
          });

          // 只保留最近20条历史
          if (relation.history.length > 20) {
            relation.history = relation.history.slice(-20);
          }

          updatedRelationships.push(relation);
        }
      });
    });

    return updatedRelationships;
  }

  // 更新关系类型
  updateRelationType(relationship: Relationship): RelationType {
    const { strength, sentiment } = relationship;

    // 敌对关系优先判断
    if (sentiment < -50) return 'enemy';
    if (sentiment < -20) return 'rival';
    if (sentiment < 0) return 'competitor';

    // 友好关系判断
    if (strength > 80 && sentiment > 70) return 'lover';
    if (strength > 60 && sentiment > 50) return 'love_interest';
    if (strength > 50 && sentiment > 30) return 'close_friend';
    if (strength > 30 && sentiment > 0) return 'friend';
    if (strength > 15 && sentiment >= 0) return 'colleague';
    if (strength > 10) return 'acquaintance';
    
    return 'stranger';
  }

  // 检查是否可以触发特定事件
  canTriggerEvent(type: EventType, participants: string[]): boolean {
    if (participants.length < 2) return false;

    const relation = this.getRelationship(participants[0], participants[1]);
    if (!relation) return true; // 没有关系记录时可以触发

    const now = Date.now();
    const cooldown = 60000; // 1分钟冷却
    if (now - relation.lastInteraction < cooldown) return false;

    // 根据事件类型检查条件
    switch (type) {
      case 'conflict':
        return relation.sentiment < 30; // 关系不好时容易冲突
      
      case 'romance':
        return relation.sentiment > 20 && this.isOppositeSex(participants[0], participants[1]);
      
      case 'reconciliation':
        return relation.sentiment < 0 && relation.history.some(h => h.type === 'conflict');
      
      case 'betrayal':
        return relation.strength > 30 && relation.sentiment > 20; // 有关系基础才能背叛
      
      default:
        return true;
    }
  }

  // 检查是否异性
  private isOppositeSex(charA: string, charB: string): boolean {
    // 简化判断：根据角色ID
    const females = ['sophia', 'emily', 'lisa', 'zhangyi'];
    const aIsFemale = females.includes(charA);
    const bIsFemale = females.includes(charB);
    return aIsFemale !== bIsFemale;
  }

  // 获取角色倾向互动的对象
  getPreferredInteractionTarget(charId: string): string | null {
    const relations = this.getCharacterRelationships(charId);
    
    if (relations.length === 0) return null;

    // 根据关系强度和情感值排序
    const sorted = relations.sort((a, b) => {
      const scoreA = a.strength * 0.3 + (a.sentiment + 100) * 0.35;
      const scoreB = b.strength * 0.3 + (b.sentiment + 100) * 0.35;
      return scoreB - scoreA;
    });

    // 返回关系最紧密的角色
    const topRelation = sorted[0];
    return topRelation.characterA === charId 
      ? topRelation.characterB 
      : topRelation.characterA;
  }

  // 导出状态
  exportState(): Relationship[] {
    return this.getAllRelationships();
  }

  // 导入状态
  importState(relationships: Relationship[]): void {
    this.relationships.clear();
    relationships.forEach(rel => {
      this.relationships.set(rel.id, rel);
    });
  }
}

// 单例实例
let engineInstance: RelationshipEngine | null = null;

export function getRelationshipEngine(agents?: Agent[]): RelationshipEngine {
  if (!engineInstance && agents) {
    engineInstance = new RelationshipEngine(agents);
  }
  if (!engineInstance) {
    throw new Error('RelationshipEngine not initialized. Call with agents first.');
  }
  return engineInstance;
}

export function resetRelationshipEngine(): void {
  engineInstance = null;
}
