// 剧情 → NFT故事线同步服务
// 当游戏中发生戏剧事件时，自动写入对应NFT的故事时间线
// 并根据事件数量更新稀有度和角色状态

import { DramaEvent } from '@/types/agent';
import { NFTAgent, StoryEvent, AgentStatus, Rarity } from '@/types/nft';
import { agents as allAgents } from '@/config/agents';

// 剧情事件类型 → NFT故事事件类型映射
const DRAMA_TO_STORY_TYPE: Record<DramaEvent['type'], StoryEvent['type']> = {
  emotion: 'family',
  conflict: 'conflict',
  romance: 'romance',
  secret: 'secret',
  relationship: 'friendship',
  silence: 'adventure',
  random: 'adventure',
  big: 'adventure',
};

// 剧情类型 → 角色状态映射
const DRAMA_TO_STATUS: Record<DramaEvent['type'], AgentStatus> = {
  emotion: 'heart_broken',
  conflict: 'in_trouble',
  romance: 'rising_star',
  secret: 'secret_agenda',
  relationship: 'stable',
  silence: 'stable',
  random: 'mysterious',
  big: 'chaos',
};

// 根据故事事件数量计算稀有度
function calculateRarity(eventCount: number, currentRarity: Rarity): Rarity {
  // 传奇：≥5个大事件，且当前已经是稀有/传奇
  if (eventCount >= 5 && (currentRarity === 'rare' || currentRarity === 'legendary')) {
    return 'legendary';
  }
  // 稀有：≥2个大事件
  if (eventCount >= 2) {
    return 'rare';
  }
  return 'common';
}

// 根据剧情类型生成故事事件描述
function generateEventDescription(event: DramaEvent, involvedAgentIds: string[]): string {
  const agentNames = involvedAgentIds
    .map(id => allAgents.find(a => a.id === id)?.nameCN || id)
    .join('、');

  const templates: Record<string, string[]> = {
    emotion: [
      `${agentNames}之间产生了强烈的情感波动`,
      `有人注意到了${agentNames}的异常情绪`,
      `${agentNames}的情感纠葛浮出水面`,
    ],
    conflict: [
      `${agentNames}之间爆发了激烈的冲突`,
      `${agentNames}的对立正式公开化`,
      `一场关于${agentNames}的较量正在进行`,
    ],
    romance: [
      `${agentNames}之间的感情出现了微妙变化`,
      `有人撞见了${agentNames}的私密时刻`,
      `${agentNames}的关系正在升温`,
    ],
    secret: [
      `关于${agentNames}的秘密开始流传`,
      `${agentNames}的隐藏身份受到质疑`,
      `${agentNames}暗中进行着不可告人的计划`,
    ],
    relationship: [
      `${agentNames}的友谊面临考验`,
      `${agentNames}之间的关系发生了转变`,
    ],
    big: [
      `震惊！${agentNames}之间发生了重大事件`,
      `${agentNames}的命运在此交汇`,
      `改变一切的时刻来临了——${agentNames}`,
    ],
    random: [
      `${agentNames}在不经意间制造了一个名场面`,
      `看似平常的一天，${agentNames}却留下了难忘的记忆`,
    ],
    silence: [
      `${agentNames}之间陷入了微妙的沉默`,
      `空气中弥漫着尴尬——${agentNames}都不知道该说什么`,
    ],
  };

  const options = templates[event.type] || templates.random;
  return options[Math.floor(Math.random() * options.length)];
}

// 根据故事事件更新角色状态
function updateAgentStatus(currentStatus: AgentStatus, event: DramaEvent): AgentStatus {
  // 连续冲突 → 身陷困境
  if (event.type === 'conflict') {
    return 'in_trouble';
  }
  // 浪漫事件 → 春风得意或情感受挫（随机）
  if (event.type === 'romance') {
    return Math.random() > 0.5 ? 'rising_star' : 'heart_broken';
  }
  // 秘密被揭露 → 神秘莫测
  if (event.type === 'secret') {
    return 'mysterious';
  }
  // 大事件 → 多事之秋
  if (event.type === 'big') {
    return 'chaos';
  }
  // 其他 → 根据当前状态和事件综合判断
  return DRAMA_TO_STATUS[event.type] || currentStatus;
}

export interface DramaStorySyncResult {
  affectedNFTs: string[]; // 受影响的NFT tokenId列表
  newStoryEvents: Map<string, StoryEvent>; // tokenId → 新增的故事事件
  rarityUpdates: Map<string, { old: Rarity; new: Rarity }>; // 稀有度变化
  statusUpdates: Map<string, { old: AgentStatus; new: AgentStatus }>; // 状态变化
}

// 同步戏剧事件到NFT故事线
export function syncDramaToNFTStory(
  dramaEvent: DramaEvent,
  allNFTs: NFTAgent[],
  agentId: string // 参与事件的Agent ID
): DramaStorySyncResult {
  const result: DramaStorySyncResult = {
    affectedNFTs: [],
    newStoryEvents: new Map(),
    rarityUpdates: new Map(),
    statusUpdates: new Map(),
  };

  // 找到所有涉及该Agent的NFT（包括核心角色和用户铸造的）
  const affectedNFTs = allNFTs.filter(nft => {
    // 直接匹配Agent ID
    if (nft.id === agentId) return true;
    // 检查关系中是否涉及该Agent
    if (nft.relationships?.some(r => r.agentId === agentId)) return true;
    return false;
  });

  for (const nft of affectedNFTs) {
    result.affectedNFTs.push(nft.tokenId);

    // 构建故事事件
    const storyEvent: StoryEvent = {
      id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: formatEventTitle(dramaEvent),
      description: generateEventDescription(dramaEvent, [agentId]),
      type: DRAMA_TO_STORY_TYPE[dramaEvent.type] || 'adventure',
      timestamp: Date.now(),
      emoji: getEventEmoji(dramaEvent.type),
      importance: dramaEvent.urgency === 'high' ? 'high' : 
                  dramaEvent.type === 'big' ? 'legendary' : 'medium',
      involvedAgents: [agentId],
    };

    result.newStoryEvents.set(nft.tokenId, storyEvent);

    // 更新故事事件列表
    const existingEvents = nft.storyEvents || [];
    const newEvents = [...existingEvents, storyEvent];

    // 更新稀有度
    const oldRarity = nft.rarity || 'common';
    const newRarity = calculateRarity(newEvents.filter(e => e.importance !== 'low').length, oldRarity);
    if (oldRarity !== newRarity) {
      result.rarityUpdates.set(nft.tokenId, { old: oldRarity, new: newRarity });
    }

    // 更新状态
    const oldStatus = nft.status || 'stable';
    const newStatus = updateAgentStatus(oldStatus, dramaEvent);
    if (oldStatus !== newStatus) {
      result.statusUpdates.set(nft.tokenId, { old: oldStatus, new: newStatus });
    }

    // 更新统计
    const currentStats = nft.stats || { popularity: 0, exposureCount: 0, dramaCount: 0, relationshipChangeCount: 0, tradeCount: 0 };
    const updatedStats = {
      ...currentStats,
      popularity: Math.min(100, currentStats.popularity + (dramaEvent.urgency === 'high' ? 15 : 5)),
      exposureCount: currentStats.exposureCount + 1,
      dramaCount: newEvents.filter(e => e.importance !== 'low').length,
    };

    // 应用更新到NFT对象
    Object.assign(nft, {
      storyEvents: newEvents,
      rarity: newRarity,
      status: newStatus,
      stats: updatedStats,
    });
  }

  return result;
}

// 格式化事件标题
function formatEventTitle(event: DramaEvent): string {
  const titles: Record<string, string> = {
    emotion: '情感波动',
    conflict: '激烈冲突',
    romance: '感情升温',
    secret: '秘密浮现',
    relationship: '关系转变',
    big: '重大事件',
    random: '意外插曲',
    silence: '沉默时刻',
  };
  return titles[event.type] || '事件发生';
}

// 获取事件emoji
function getEventEmoji(type: DramaEvent['type']): string {
  const emojis: Record<string, string> = {
    emotion: '💓',
    conflict: '⚔️',
    romance: '💕',
    secret: '🤫',
    relationship: '🤝',
    big: '🌟',
    random: '✨',
    silence: '😶',
  };
  return emojis[type] || '📌';
}

// 获取剧情的戏剧性评分（用于判断是否值得写入NFT）
export function getDramaIntensity(event: DramaEvent): number {
  const baseScores: Record<string, number> = {
    emotion: 6,
    conflict: 8,
    romance: 7,
    secret: 9,
    relationship: 5,
    big: 10,
    random: 3,
    silence: 2,
  };
  const base = baseScores[event.type] || 5;
  const urgencyBonus = event.urgency === 'high' ? 2 : event.urgency === 'medium' ? 1 : 0;
  return Math.min(10, base + urgencyBonus);
}

// 判断事件是否应该写入NFT故事线（过滤低价值事件）
export function shouldRecordToNFT(event: DramaEvent): boolean {
  // 高强度事件必记录
  if (getDramaIntensity(event) >= 6) return true;
  // 大事件必记录
  if (event.type === 'big') return true;
  // 沉默事件通常不记录（除非连续）
  if (event.type === 'silence') return false;
  // 随机事件概率记录（30%）
  if (event.type === 'random') return Math.random() < 0.3;
  return true;
}
