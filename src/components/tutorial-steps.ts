// 教程步骤定义

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'type' | 'wait' | 'dismiss';
  actionSelector?: string;
  highlightPadding?: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '欢迎来到楚门世界',
    description: '这是一个24小时运转的AI真人秀世界。你的目标是发掘角色秘密，体验精彩剧情！',
    position: 'center',
    action: 'dismiss',
  },
  {
    id: 'tabs',
    title: '三大入口',
    description: '在这里切换：会话模式 / 像素世界 / NFT市场',
    targetSelector: 'button:has-text("像素世界")',
    position: 'bottom',
    action: 'dismiss',
  },
  {
    id: 'play-button',
    title: '开始游戏',
    description: '点击播放按钮，AI角色们将开始自动对话',
    targetSelector: 'button:has-text("开始")',
    position: 'top',
    action: 'click',
    actionSelector: 'button:has-text("开始")',
  },
  {
    id: 'pixel-world',
    title: '像素世界',
    description: '在像素世界中，你可以点击角色进行互动，观察他们的行为',
    targetSelector: 'button:has-text("像素世界")',
    position: 'top',
    action: 'dismiss',
  },
  {
    id: 'nft-intro',
    title: 'NFT系统',
    description: '收集角色NFT，解锁他们的完整故事线',
    targetSelector: 'button:has-text("NFT")',
    position: 'top',
    action: 'dismiss',
  },
];
