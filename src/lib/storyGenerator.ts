// 剧情生成器 - 使用 GLM API 生成剧情对话
// src/lib/storyGenerator.ts

import { 
  StoryEvent, 
  Dialogue, 
  EventType,
  EVENT_TYPE_DESC
} from '@/types/story';
import { Agent } from '@/types/agent';
import { agents, getAgentById } from '@/config/agents';
import { scenes } from '@/config/scenes';

// GLM API 配置
const GLM_API_KEY = process.env.ZHIPU_API_KEY || '5da6f1a52bf94ff1b694f878fa31f316.ZL7hYwdrPcUJB4XM';
const GLM_BASE = 'https://open.bigmodel.cn/api/paas/v4';

// 场景名称映射
const SCENE_NAMES: Record<string, string> = {
  cafe: '咖啡馆',
  hospital: '私立医院',
  office: 'CBD写字楼',
  street: '城市街道',
  court: '法院',
  police_station: '警局',
  apartment: '社区公园',
  media_office: '媒体公司',
};

export class StoryGenerator {
  private apiKey: string;
  private useCache: boolean = true;
  private cache: Map<string, Dialogue[]> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GLM_API_KEY;
  }

  // 调用 GLM API
  private async callGLM(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GLM_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.85,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('GLM API error:', response.status, text);
        throw new Error(`GLM API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('GLM API call failed:', error);
      throw error;
    }
  }

  // 生成事件对话
  async generateEventDialogue(event: StoryEvent): Promise<Dialogue[]> {
    // 检查缓存
    const cacheKey = `${event.id}-${event.type}`;
    if (this.useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const prompt = this.buildEventPrompt(event);
      const response = await this.callGLM(prompt);
      const dialogue = this.parseDialogue(response, event.participants);
      
      // 缓存结果
      if (this.useCache) {
        this.cache.set(cacheKey, dialogue);
      }
      
      return dialogue;
    } catch (error) {
      console.error('Failed to generate dialogue:', error);
      // 返回降级对话
      return this.generateFallbackDialogue(event);
    }
  }

  // 构建事件 prompt
  private buildEventPrompt(event: StoryEvent): string {
    const participants = event.participants
      .map(id => getAgentById(id))
      .filter(Boolean) as Agent[];
    
    const eventTypeDesc = EVENT_TYPE_DESC[event.type];
    const sceneName = this.getSceneName(event.location);
    
    const charactersDesc = participants.map(p => 
      `- ${p.nameCN}（${p.role}）：${p.personality}`
    ).join('\n');

    const relationshipContext = this.buildRelationshipContext(participants);

    return `你是楚门世界的编剧，正在编写一场【${eventTypeDesc.nameCN}】事件。

【参与角色】
${charactersDesc}

【角色关系】
${relationshipContext}

【场景】${sceneName}

【事件】${event.content}

【任务】
生成3-5句对话，展现这场${eventTypeDesc.nameCN}事件的戏剧张力。

【格式要求】
每句对话格式：
角色名: 对话内容

【对话要求】
1. 保持角色性格一致
2. 对话自然流畅，像真人对话
3. 体现${eventTypeDesc.nameCN}的情感张力
4. 每句不超过30字
5. 用中文

【示例】
Marcus: 我不明白，为什么会变成这样？
Sophia: 商场如战场，你应该早就知道的。`;
  }

  // 构建关系上下文
  private buildRelationshipContext(participants: Agent[]): string {
    const contexts: string[] = [];
    
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const a = participants[i];
        const b = participants[j];
        
        const relA = a.relationships?.[b.id];
        const relB = b.relationships?.[a.id];
        
        if (relA || relB) {
          contexts.push(`${a.nameCN}与${b.nameCN}：${relA || relB}`);
        }
      }
    }
    
    return contexts.length > 0 ? contexts.join('\n') : '陌生人关系';
  }

  // 解析对话
  private parseDialogue(text: string, participants: string[]): Dialogue[] {
    const dialogues: Dialogue[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // 匹配格式: "角色名: 对话内容" 或 "角色名：对话内容"
      const match = line.match(/^(.+?)[:：]\s*(.+)$/);
      if (match) {
        const [, name, content] = match;
        
        // 找到对应的角色ID
        const agent = agents.find(a => 
          a.name === name.trim() || 
          a.nameCN === name.trim() ||
          a.id === name.trim().toLowerCase()
        );
        
        if (agent && content.trim()) {
          dialogues.push({
            characterId: agent.id,
            characterName: agent.nameCN || agent.name,
            content: content.trim().slice(0, 50), // 限制长度
            emotion: this.inferEmotion(content),
          });
        }
      }
    }
    
    // 如果解析失败，生成降级对话
    if (dialogues.length === 0) {
      return this.generateSimpleDialogue(participants);
    }
    
    return dialogues;
  }

  // 推断情绪
  private inferEmotion(text: string): 'happy' | 'angry' | 'sad' | 'love' | 'neutral' | 'surprise' {
    if (/[！!]{2,}|气死|混蛋|滚|讨厌/.test(text)) return 'angry';
    if (/爱|喜欢|心动|甜蜜|亲爱/.test(text)) return 'love';
    if (/哈哈|开心|太好了|棒|赞/.test(text)) return 'happy';
    if (/唉|难过|悲伤|哭|失败/.test(text)) return 'sad';
    if (/什么|？！|真的吗|不会吧|天哪/.test(text)) return 'surprise';
    return 'neutral';
  }

  // 生成简单对话（降级）
  private generateSimpleDialogue(participants: string[]): Dialogue[] {
    const dialogues: Dialogue[] = [];
    const templates = [
      '这事你怎么看？',
      '我也不太确定。',
      '听你的吧。',
      '那就这样吧。',
      '好，我知道了。',
    ];

    participants.slice(0, 3).forEach((id, index) => {
      const agent = getAgentById(id);
      if (agent) {
        dialogues.push({
          characterId: id,
          characterName: agent.nameCN || agent.name,
          content: templates[index % templates.length],
          emotion: 'neutral',
        });
      }
    });

    return dialogues;
  }

  // 生成降级对话
  private generateFallbackDialogue(event: StoryEvent): Dialogue[] {
    return this.generateSimpleDialogue(event.participants);
  }

  // 生成背景故事（Legendary Agent专属）
  async generateBackstory(traits: string[]): Promise<string> {
    const prompt = `为以下特征的Agent生成一个简短背景故事（50字以内）：

特征：${traits.join('、')}

要求：
1. 故事要有戏剧性和记忆点
2. 要有反转或悬念
3. 用中文
4. 不超过50字

直接输出故事内容，不要其他说明。`;

    try {
      const response = await this.callGLM(prompt);
      return response.slice(0, 100); // 限制长度
    } catch (error) {
      return '一个神秘的陌生人，背后隐藏着不为人知的秘密。';
    }
  }

  // 生成随机事件描述
  async generateRandomEvent(type: EventType, participants: string[]): Promise<string> {
    const chars = participants
      .map(id => getAgentById(id))
      .filter(Boolean) as Agent[];
    
    const typeDesc = EVENT_TYPE_DESC[type];
    
    const prompt = `你是楚门世界的编剧，请为一个【${typeDesc.nameCN}】事件生成简短描述。

参与角色：${chars.map(c => c.nameCN).join('、')}

要求：
1. 一句话描述事件
2. 体现${typeDesc.nameCN}的特点
3. 有戏剧张力
4. 20字以内
5. 用中文

直接输出描述，不要其他内容。`;

    try {
      const response = await this.callGLM(prompt);
      return response.slice(0, 50);
    } catch (error) {
      return `${chars[0]?.nameCN || '角色'}遇到了意外情况。`;
    }
  }

  // 生成角色内心独白
  async generateInnerMonologue(agentId: string, context: string): Promise<string> {
    const agent = getAgentById(agentId);
    if (!agent) return '...';

    const prompt = `你是${agent.nameCN}，${agent.role}。

性格：${agent.personality}
背景：${agent.background}

当前情境：${context}

请用内心独白的方式表达你此刻的想法（30字以内，用中文）。`;

    try {
      const response = await this.callGLM(prompt);
      return response.slice(0, 50);
    } catch (error) {
      return '（沉默）';
    }
  }

  // 获取场景名称
  private getSceneName(sceneId: string): string {
    return SCENE_NAMES[sceneId] || sceneId;
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 设置是否使用缓存
  setUseCache(use: boolean): void {
    this.useCache = use;
  }
}

// 单例实例
let generatorInstance: StoryGenerator | null = null;

export function getStoryGenerator(): StoryGenerator {
  if (!generatorInstance) {
    generatorInstance = new StoryGenerator();
  }
  return generatorInstance;
}

export function resetStoryGenerator(): void {
  generatorInstance = null;
}
