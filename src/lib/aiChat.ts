// AI 对话服务 - 调用 OpenClaw Agent
// src/lib/aiChat.ts

import { Agent } from '@/types/agent';
import { getAgentById } from '@/config/agents';

// 生成 Agent 的系统提示词
export const generateAgentPrompt = (agent: Agent, scene: string): string => {
  return `你是 ${agent.nameCN}，${agent.role}。

## 角色设定
- 性格：${agent.personality}
- 背景：${agent.background}
- 目标：${agent.goals.join('、')}

## 人际关系
${Object.entries(agent.relationships).map(([key, value]) => {
  const other = getAgentById(key);
  return `- ${other?.nameCN || key}: ${value}`;
}).join('\n')}

## 当前场景
${scene}

## 对话要求
1. 根据角色性格生成对话
2. 保持角色一致性
3. 每次回复 1-3 句话
4. 使用 emoji 让对话更生动
5. 可以表达情感，但不要过于夸张
6. 根据场景和互动对象调整内容

请直接输出对话内容，不要有额外说明。`;
};

// 生成 NPC 触发提示词
export const generateNPCPrompt = (
  npc: Agent,
  recentDialogues: string[],
  scene: string
): string => {
  return `你是 ${npc.nameCN}，${npc.role}。

## 角色设定
- 性格：${npc.personality}
- 背景：${npc.background}

## 你的任务
你是剧情触发器，需要观察对话并在适当时机介入，制造"爆点"。

## 当前场景
${scene}

## 最近对话
${recentDialogues.join('\n')}

## 触发策略
- 如果对话平淡，可以制造偶遇或传播谣言
- 如果有冲突风险，可以拱火或劝架
- 如果有暧昧，可以八卦或撮合
- 如果有人遇到困难，可以主动帮助

## 输出格式
如果你认为需要介入，请输出：
[介入] 你想说的话

如果不需要介入，请输出：
[观察] 不介入的原因

只输出上述格式的内容，不要有其他说明。`;
};

// 生成观察者提示词
export const generateObserverPrompt = (recentDialogues: string[]): string => {
  return `你是观察者，负责分析对话中的情感和戏剧点。

## 最近对话
${recentDialogues.join('\n')}

## 分析要求
判断以下内容：
1. 情感走向：positive（积极）/ negative（消极）/ neutral（中性）
2. 戏剧张力：0-10分
3. 是否需要 NPC 介入：true/false
4. 理由

## 输出格式（JSON）
{
  "sentiment": "positive/negative/neutral",
  "tension": 0-10,
  "should_trigger": true/false,
  "reason": "原因"
}`;
};

// 模拟 AI 调用（Demo 阶段使用）
// 实际项目中可以替换为真正的 LLM API
export const callAI = async (prompt: string): Promise<string> => {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 简单的关键词匹配回复
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('观察')) {
    // NPC 观察模式
    if (Math.random() > 0.7) {
      return `[介入] 哎，你们听说了吗？`;
    }
    return `[观察] 对话进行中...`;
  }
  
  if (lowerPrompt.includes('分析')) {
    // 观察者模式
    return JSON.stringify({
      sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
      tension: Math.floor(Math.random() * 5),
      should_trigger: Math.random() > 0.7,
      reason: '检测对话情感变化'
    });
  }
  
  // Agent 对话模式 - 返回模拟回复
  return '（思考中...）';
};
