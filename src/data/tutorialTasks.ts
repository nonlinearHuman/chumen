// 新手任务定义
// src/data/tutorialTasks.ts

export interface TutorialTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'dialogue' | 'achievement' | 'nft' | 'explore' | 'npc' | 'play_time';
    value: number;
  };
  rewards: {
    coins: number;
    exp: number;
    items?: { id: string; name: string; icon: string }[];
  };
  completed: boolean;
}

export const TUTORIAL_TASKS: TutorialTask[] = [
  {
    id: 'tutorial_dialogue_1',
    title: '初来乍到',
    description: '观看第一条AI对话，了解这个世界',
    icon: '💬',
    requirement: { type: 'dialogue', value: 1 },
    rewards: {
      coins: 100,
      exp: 50,
    },
    completed: false,
  },
  {
    id: 'tutorial_achievement_1',
    title: '成就解锁',
    description: '解锁第一个成就，获得荣誉徽章',
    icon: '🏆',
    requirement: { type: 'achievement', value: 1 },
    rewards: {
      coins: 200,
      exp: 100,
    },
    completed: false,
  },
  {
    id: 'tutorial_nft_1',
    title: '铸造大师',
    description: '铸造第一个NFT角色，开始你的收藏',
    icon: '💎',
    requirement: { type: 'nft', value: 1 },
    rewards: {
      coins: 500,
      exp: 200,
      items: [{ id: 'rare_gem', name: '稀有宝石', icon: '💠' }],
    },
    completed: false,
  },
  {
    id: 'tutorial_explore_3',
    title: '探索者',
    description: '访问3个不同场景，发现世界的奥秘',
    icon: '🗺️',
    requirement: { type: 'explore', value: 3 },
    rewards: {
      coins: 300,
      exp: 150,
    },
    completed: false,
  },
  {
    id: 'tutorial_npc_1',
    title: '社交达人',
    description: '触发第一次NPC事件，解锁隐藏剧情',
    icon: '🎲',
    requirement: { type: 'npc', value: 1 },
    rewards: {
      coins: 250,
      exp: 120,
    },
    completed: false,
  },
  {
    id: 'tutorial_playtime_10',
    title: '忠实观众',
    description: '游戏时长达到10分钟，成为楚门世界的观众',
    icon: '⏰',
    requirement: { type: 'play_time', value: 600000 }, // 10分钟
    rewards: {
      coins: 150,
      exp: 80,
    },
    completed: false,
  },
];

// 获取任务进度
export const getTaskProgress = (
  task: TutorialTask,
  stats: {
    dialogueCount: number;
    achievementCount: number;
    nftCount: number;
    exploreCount: number;
    npcCount: number;
    playTime: number;
  }
): number => {
  let current = 0;
  switch (task.requirement.type) {
    case 'dialogue':
      current = stats.dialogueCount;
      break;
    case 'achievement':
      current = stats.achievementCount;
      break;
    case 'nft':
      current = stats.nftCount;
      break;
    case 'explore':
      current = stats.exploreCount;
      break;
    case 'npc':
      current = stats.npcCount;
      break;
    case 'play_time':
      current = stats.playTime;
      break;
  }
  return Math.min(100, (current / task.requirement.value) * 100);
};

// 检查任务是否完成
export const isTaskComplete = (
  task: TutorialTask,
  stats: {
    dialogueCount: number;
    achievementCount: number;
    nftCount: number;
    exploreCount: number;
    npcCount: number;
    playTime: number;
  }
): boolean => {
  const progress = getTaskProgress(task, stats);
  return progress >= 100;
};
