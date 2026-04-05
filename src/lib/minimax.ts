// MiniMax AI 对话服务
// src/lib/minimax.ts

// MiniMax API 配置
const MINIMAX_CONFIG = {
  apiKey: process.env.MINIMAX_API_KEY || '',
  baseUrl: 'https://api.minimax.chat/v1',
  model: 'MiniMax-M2.5',
};

// 生成 Agent 系统提示词
export const generateSystemPrompt = (agentId: string, scene: string): string => {
  const agentPrompts: Record<string, string> = {
    marcus: `你是 Marcus Chen，25岁，AI 创业公司 CEO。MIT 毕业，野心勃勃但内心孤独。外表自信，内心敏感。你正在为融资发愁，投资人 David 给你很大压力。`,
    sophia: `你是 Sophia Wu，28岁，知名律所合伙人。哈佛法学院毕业，理性强势，情商高。你正在处理一个重要案件。`,
    james: `你是 James Liu，35岁，私立医院外科主任。医学博士，技术精湛但太忙导致单身。你暗恋 Emily。`,
    emily: `你是 Emily Zhang，26岁，独立调查记者。正义感强，冲动。你正在调查 David 的可疑行为。`,
    david: `你是 David Wang，45岁，资深投资人。老谋深算，利益至上。你在打 Marcus 公司 的主意。`,
    lisa: `你是 Lisa Huang，23岁，网红/博主。绿茶属性，爱炒作。你想傍大款。`,
    robert: `你是 Robert Xu，38岁，刑警。正直固执，正在调查一起失踪案。`,
    zhangyi: `你是张姨，55岁，社区居委会主任。爱管闲事，八卦，但热心肠。`,
    xiaowang: `你是小王，22岁，记者实习生。菜鸟，充满理想，想找到大新闻。`,
    laoli: `你是老李，50岁，出租车司机。话痨，见多识广，喜欢讲故事。`,
  };

  const prompt = agentPrompts[agentId] || `你是 ${agentId}。`;
  
  return `${prompt}

当前场景：${scene}

要求：
1. 根据角色性格生成对话
2. 保持角色一致性
3. 每次回复 1-2 句话
4. 使用 emoji 让对话更生动
5. 可以表达情感

直接输出对话内容，不要有其他说明。`;
};

// 调用 MiniMax API
export const callMiniMax = async (prompt: string): Promise<string | null> => {
  if (!MINIMAX_CONFIG.apiKey) {
    console.warn('MINIMAX_API_KEY not set, using fallback');
    return null;
  }

  try {
    const response = await fetch(`${MINIMAX_CONFIG.baseUrl}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MINIMAX_CONFIG.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MiniMax API error:', error);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('MiniMax call error:', error);
    return null;
  }
};
