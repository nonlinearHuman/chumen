// NPC 爆点触发系统
// src/hooks/useNPCTigger.ts

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getNPCs } from '@/config/agents';
import { DramaEvent } from '@/types/agent';

// 爆点关键词检测
const DRAMA_KEYWORDS = {
  emotion: ['生气', '愤怒', '开心', '难过', '喜欢', '爱', '讨厌', '恨', '怕', '担心', '害怕', '紧张', '尴尬'],
  conflict: ['争吵', '打架', '对峙', '冲突', '矛盾', '不同意', '反对', '质疑', '骗', '背叛'],
  romance: ['喜欢', '爱', '心动', '脸红', '暗恋', '表白', '约会', '想见', '思念'],
  secret: ['秘密', '不能说', '别告诉', '被发现', '真相', '隐瞒', '欺骗'],
};

// 检测对话中的情感
export const detectEmotion = (content: string): string => {
  const lower = content.toLowerCase();
  
  if (DRAMA_KEYWORDS.emotion.some(k => lower.includes(k))) return 'emotion';
  if (DRAMA_KEYWORDS.conflict.some(k => lower.includes(k))) return 'conflict';
  if (DRAMA_KEYWORDS.romance.some(k => lower.includes(k))) return 'romance';
  if (DRAMA_KEYWORDS.secret.some(k => lower.includes(k))) return 'secret';
  
  return 'normal';
};

// NPC 爆点模板
const NPC_TRIGGERS: Record<string, Record<string, string[]>> = {
  zhangyi: {
    intro: ["哎，你们都在呢！", "我刚从那边过来", "哟，这么巧！"],
    gossip: ["我听说啊，", "你们知道么，", "我跟你们说啊，"],
    match: ["你俩挺合适的呀！", "我给你俩介绍一下？", "年轻人，多交流交流！"],
    rumor: ["我听别人说，", "好像有人看到", "内部消息，"]
  },
  xiaowang: {
    intro: ["各位！", "哎哎！", "重大消息！"],
    news: ["我收到一条爆料！", "刚刚得到的消息！", "Emily姐让我查的..."],
    clue: ["我发现了重要线索！", "这边有情况！", "大家快来看！"]
  },
  laoli: {
    intro: ["哎，", "我刚才", "说起来"],
    taxi: ["我刚拉了个活儿，", "刚才那客人，", "我开出租车30年了，"],
    story: ["我跟你讲，", "这种事我见多了，", "你们是不知道，"]
  }
};

export const useNPCTigger = () => {
  const { dialogues, addDialogue, addDramaEvent, isPlaying } = useGameStore();
  const lastTriggerTime = useRef<number>(0);
  const silenceCount = useRef<number>(0);
  
  // 触发 NPC 介入
  const triggerNPC = useCallback(async () => {
    const npcs = getNPCs();
    if (npcs.length === 0) return;
    
    const now = Date.now();
    // 至少间隔 60 秒触发一次（增加间隔）
    if (now - lastTriggerTime.current < 60000) return;
    
    // 随机选择 NPC
    const npc = npcs[Math.floor(Math.random() * npcs.length)];
    
    // 获取最近对话
    const recentDialogues = dialogues.slice(-5);
    const lastContent = recentDialogues[recentDialogues.length - 1]?.content || '';
    
    // 检测情感
    const emotion = detectEmotion(lastContent);
    
    // 根据情感选择触发内容
    let triggerType = 'intro';
    let content = '';
    
    const templates = NPC_TRIGGERS[npc.id];
    if (!templates) return;
    
    switch (emotion) {
      case 'emotion':
        triggerType = 'gossip';
        content = templates.gossip?.[Math.floor(Math.random() * templates.gossip.length)] || templates.intro?.[0] || '哎！';
        break;
      case 'conflict':
        triggerType = 'rumor';
        content = templates.rumor?.[Math.floor(Math.random() * templates.rumor.length)] || templates.intro?.[0] || '哎！';
        break;
      case 'romance':
        triggerType = 'match';
        content = templates.match?.[Math.floor(Math.random() * templates.match.length)] || templates.intro?.[0] || '哎！';
        break;
      case 'secret':
        triggerType = 'story';
        content = templates.story?.[Math.floor(Math.random() * templates.story.length)] || templates.intro?.[0] || '哎！';
        break;
      default:
        // 随机触发
        if (Math.random() > 0.7) {
          triggerType = 'intro';
          content = templates.intro?.[Math.floor(Math.random() * templates.intro.length)] || '哎！';
        } else {
          return; // 不触发
        }
    }
    
    // 添加 NPC 对话
    addDialogue(npc.id, content);
    lastTriggerTime.current = now;
    
    // 记录戏剧事件
    const event: DramaEvent = {
      id: `event-${Date.now()}`,
      type: emotion === 'normal' ? 'random' : emotion as 'emotion' | 'conflict' | 'romance' | 'secret',
      trigger: 'npc',
      npcId: npc.id,
      content,
      urgency: emotion === 'conflict' ? 'high' : 'medium'
    };
    addDramaEvent(event);
    
    console.log(`[NPC Trigger] ${npc.nameCN}: ${content}`);
    
  }, [dialogues, addDialogue, addDramaEvent]);
  
  // 监听对话变化，决定是否触发 NPC
  useEffect(() => {
    if (!isPlaying) return;
    
    const recentDialogues = dialogues.slice(-3);
    if (recentDialogues.length < 1) return;
    
    // 检查沉默时间
    const lastTime = recentDialogues[recentDialogues.length - 1]?.timestamp || 0;
    const now = Date.now();
    
    // 如果超过 2 分钟没有对话，触发 NPC
    if (now - lastTime > 120000) {
      silenceCount.current++;
      if (silenceCount.current >= 2) {
        triggerNPC();
        silenceCount.current = 0;
      }
      return;
    }
    
    // 随机触发（概率 10%，降低频率）
    if (Math.random() < 0.1) {
      triggerNPC();
    }
    
  }, [dialogues, isPlaying, triggerNPC]);
  
  return {
    triggerNPC
  };
};
