// AI 对话 API - 智谱 GLM 版
// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { agents } from '@/config/agents';

// 智谱 GLM API 配置
const GLM_API_KEY = process.env.ZHIPU_API_KEY || '5da6f1a52bf94ff1b694f878fa31f316.ZL7hYwdrPcUJB4XM';
const GLM_BASE = 'https://open.bigmodel.cn/api/paas/v4';

// 对话状态
let conversationState = {
  lastSpeaker: '',
  scene: '咖啡馆',
  emotions: [] as string[],
  topic: '',
};

// 场景名称映射
const SCENE_NAMES: Record<string, string> = {
  coffee_shop: '咖啡馆',
  hospital: '私立医院',
  office: 'CBD写字楼',
  street: '城市街道',
  media_office: '媒体公司',
  court: '法院',
  police_station: '警局',
  apartment: '社区公园',
};

// 智谱 GLM 调用
async function callGLM(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GLM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('GLM API error:', response.status, text);
      throw new Error(`GLM API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || fallbackResponse();
  } catch (error) {
    console.error('GLM API call failed:', error);
    return fallbackResponse();
  }
}

// LLM 降级 fallback
function fallbackResponse(): string {
  const sceneResponses: Record<string, string[]> = {
    coffee_shop: ['这咖啡馆人真多。', '约了人谈事。', '环境不错。'],
    hospital: ['医院总是这么忙。', '走廊里都是人。', '又一台手术。'],
    office: ['CBD就是热闹。', '加班到这么晚。', '电梯太慢了。'],
    street: ['今天车特别多。', '街道真热闹。', '人来人往的。'],
    media_office: ['今天的选题定了吗？', '直播数据怎么样？', '热搜又有新料了。'],
    court: ['今天的案子不好打。', '证据链条要理清楚。', '法庭上见真章。'],
    police_station: ['又接到新案子了。', '证据不会说谎。', '跟着线索走。'],
    apartment: ['公园里人不少。', '天气真不错。', '遛弯的人多了。'],
  };

  const resps = sceneResponses[conversationState.scene] || ['今天有点累。', '大家都忙。', '事情越来越多。'];
  return resps[Math.floor(Math.random() * resps.length)];
}

// 构建 LLM prompt
function buildPrompt(agentId: string, scene: string): string {
  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return '随便说一句话。';

  const sceneName = SCENE_NAMES[scene] || scene;

  // NPC 特殊 prompt
  if (agentId === 'zhangyi') {
    return `你是"张姨"，55岁，社区居委会主任。性格：爱管闲事、八卦、热情。场景是${sceneName}。

请用张姨的口吻说一句话，要符合她爱八卦、爱撮合、热心肠的性格。不要超过30个字，用中文。`;
  }

  if (agentId === 'xiaowang') {
    return `你是"小王"，22岁，记者实习生。性格：菜鸟、充满理想、勤奋好学。场景是${sceneName}。

请用小王的口吻说一句话，要符合他年轻记者有热情但经验不足的性格。不要超过30个字，用中文。`;
  }

  if (agentId === 'laoli') {
    return `你是"老李"，50岁，出租车司机。性格：话痨、见多识广、消息灵通。场景是${sceneName}。

请用老李的口吻说一句话，要符合他开车多年见多识广、爱聊天的性格。不要超过30个字，用中文。`;
  }

  // 核心角色 prompt
  const personality = agent.personality || '';
  const background = agent.background || '';
  const lastSpeaker = conversationState.lastSpeaker;

  let context = '';
  if (lastSpeaker && lastSpeaker !== agentId) {
    const lastAgent = agents.find((a) => a.id === lastSpeaker);
    if (lastAgent) {
      context = `【对话背景】${lastAgent.nameCN || lastAgent.name}（${lastAgent.role}）刚刚在场/说了话。你有机会回应他/她，或者继续自己的话题。`;
    }
  }

  return `你是${agent.nameCN || agent.name}，${agent.role || ''}。角色设定：${personality}。背景：${background}。当前场景：${sceneName}。
${context}
请用符合角色性格的方式说一句话。不要超过40个字，要自然、真实、有角色感。用中文。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { agentId, scene } = body;

    // 更新场景
    if (scene) {
      conversationState.scene = scene;
    }

    // 构建 prompt
    const prompt = buildPrompt(agentId, scene || conversationState.scene);

    // 调用 GLM LLM
    const response = await callGLM(prompt);

    // 更新状态
    conversationState.lastSpeaker = agentId;

    return NextResponse.json({
      success: true,
      response,
      agentId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
