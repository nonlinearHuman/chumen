// 剧情 → NFT故事线同步 Hook
// 监听游戏中的戏剧事件，自动写入对应NFT的故事时间线
// 同时更新稀有度和角色状态

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNFTStore } from '@/store/nftStore';
import { DramaEvent } from '@/types/agent';
import { syncDramaToNFTStory, shouldRecordToNFT } from '@/lib/dramaStorySync';

export const useDramaStorySync = () => {
  const dramaEvents = useGameStore(state => state.dramaEvents);
  const { listedNFTs, userNFTs, updateNFTStory } = useNFTStore();
  const lastProcessedEventRef = useRef<string | null>(null);

  useEffect(() => {
    // 获取最新的戏剧事件
    const latestEvent = dramaEvents[dramaEvents.length - 1];
    if (!latestEvent) return;

    // 避免重复处理同一个事件
    if (lastProcessedEventRef.current === latestEvent.id) return;

    // 检查是否应该记录到NFT
    if (!shouldRecordToNFT(latestEvent)) {
      lastProcessedEventRef.current = latestEvent.id;
      return;
    }

    // 获取所有NFT
    const allNFTs = [...listedNFTs, ...userNFTs];

    // 确定参与事件的Agent
    const involvedAgentId = getInvolvedAgentId(latestEvent);
    if (!involvedAgentId) {
      lastProcessedEventRef.current = latestEvent.id;
      return;
    }

    // 同步到NFT故事线
    const result = syncDramaToNFTStory(latestEvent, allNFTs, involvedAgentId);

    // 应用更新到NFT Store
    for (const [tokenId, storyEvent] of result.newStoryEvents) {
      // 找到对应的NFT
      const nft = allNFTs.find(n => n.tokenId === tokenId);
      if (!nft) continue;

      // 更新NFT
      updateNFTStory(tokenId, {
        storyEvents: [...(nft.storyEvents || []), storyEvent],
        rarity: result.rarityUpdates.get(tokenId)?.new || nft.rarity,
        status: result.statusUpdates.get(tokenId)?.new || nft.status,
        stats: nft.stats,
      });
    }

    // 记录已处理
    lastProcessedEventRef.current = latestEvent.id;

    // 打印同步结果（开发调试）
    if (result.affectedNFTs.length > 0) {
      console.log(
        `[DramaStorySync] 📖 剧情已写入NFT`,
        `事件: ${latestEvent.type}`,
        `涉及角色: ${involvedAgentId}`,
        `受影响NFT: ${result.affectedNFTs.join(', ')}`,
        result.rarityUpdates.size > 0 ? `稀有度变化: ${JSON.stringify([...result.rarityUpdates])}` : '',
        result.statusUpdates.size > 0 ? `状态变化: ${JSON.stringify([...result.statusUpdates])}` : '',
      );
    }
  }, [dramaEvents, listedNFTs, userNFTs]);
};

// 从戏剧事件中提取参与的Agent ID
function getInvolvedAgentId(event: DramaEvent): string | null {
  // NPC触发的戏剧事件，通过最近的对话确定参与角色
  if (event.npcId) {
    // NPC事件通常涉及最近的对话角色
    // 这里返回一个随机的主要角色作为示例
    // 实际应该从对话历史中分析
    const mainAgents = ['marcus', 'sophia', 'james', 'emily', 'david', 'lisa'];
    return mainAgents[Math.floor(Math.random() * mainAgents.length)];
  }
  return null;
}
