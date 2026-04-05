// 故事事件模板库
// src/data/storyTemplates.ts

import { EventType, EventTemplate, Consequence } from '@/types/story';

// ===== 冲突事件模板 =====
const conflictTemplates: EventTemplate[] = [
  {
    id: 'conflict_negotiation',
    type: 'conflict',
    content: '{A}和{B}在谈判中产生分歧',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -15 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 10,
  },
  {
    id: 'conflict_secret_reveal',
    type: 'conflict',
    content: '{A}揭穿了{B}的秘密',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -25 },
      { type: 'secret_reveal', target: '{B}', value: true },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minStrength: 20 },
    weight: 5,
  },
  {
    id: 'conflict_betrayal_suspect',
    type: 'conflict',
    content: '{A}怀疑{B}在背后捅刀子',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -20 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 7,
  },
  {
    id: 'conflict_money',
    type: 'conflict',
    content: '{A}和{B}因为钱的问题吵了起来',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -18 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 8,
  },
  {
    id: 'conflict_power',
    type: 'conflict',
    content: '{A}和{B}为了权力明争暗斗',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -22 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minStrength: 15 },
    weight: 6,
  },
  {
    id: 'conflict_misunderstanding',
    type: 'conflict',
    content: '{A}误会了{B}的意思',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -12 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 12,
  },
  {
    id: 'conflict_jealousy',
    type: 'conflict',
    content: '{A}对{B}心生嫉妒',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -15 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 8,
  },
  {
    id: 'conflict_public_argue',
    type: 'conflict',
    content: '{A}和{B}在公开场合大吵一架',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -25 },
      { type: 'status_change', target: 'both', value: 'embarrassed' },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 4,
  },
];

// ===== 和解事件模板 =====
const reconciliationTemplates: EventTemplate[] = [
  {
    id: 'reconciliation_third_party',
    type: 'reconciliation',
    content: '{C}撮合{A}和{B}和解',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 20 },
    ],
    minParticipants: 2,
    maxParticipants: 3,
    requiredRelationships: { maxSentiment: -10 },
    weight: 8,
  },
  {
    id: 'reconciliation_apology',
    type: 'reconciliation',
    content: '{A}主动向{B}道歉',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 15 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { maxSentiment: 0 },
    weight: 10,
  },
  {
    id: 'reconciliation_crisis',
    type: 'reconciliation',
    content: '危机中{A}和{B}放下分歧',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 25 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 6,
  },
  {
    id: 'reconciliation_mutual_understanding',
    type: 'reconciliation',
    content: '{A}和{B}冰释前嫌',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 18 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { maxSentiment: 10 },
    weight: 9,
  },
  {
    id: 'reconciliation_old_friend',
    type: 'reconciliation',
    content: '{A}想起和{B}的旧情',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 12 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minStrength: 30 },
    weight: 7,
  },
];

// ===== 暧昧事件模板 =====
const romanceTemplates: EventTemplate[] = [
  {
    id: 'romance_coffee',
    type: 'romance',
    content: '{A}和{B}深夜在咖啡馆偶遇',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 20 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minSentiment: 20 },
    weight: 10,
  },
  {
    id: 'romance_gaze',
    type: 'romance',
    content: '{A}和{B}目光相遇，有瞬间的火花',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 15 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minSentiment: 10 },
    weight: 12,
  },
  {
    id: 'romance_help',
    type: 'romance',
    content: '{A}在困境中被{B}帮助，心生感激',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 22 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 8,
  },
  {
    id: 'romance_confession',
    type: 'romance',
    content: '{A}鼓起勇气向{B}表白',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 30 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minSentiment: 50, minStrength: 40 },
    weight: 3,
  },
  {
    id: 'romance_date',
    type: 'romance',
    content: '{A}约{B}一起吃饭',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 18 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minSentiment: 30 },
    weight: 9,
  },
  {
    id: 'romance_secret_meeting',
    type: 'romance',
    content: '{A}和{B}秘密约会',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 25 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minSentiment: 40, minStrength: 30 },
    weight: 5,
  },
];

// ===== 背叛事件模板 =====
const betrayalTemplates: EventTemplate[] = [
  {
    id: 'betrayal_sell_out',
    type: 'betrayal',
    content: '{A}出卖了{B}的秘密',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -35 },
      { type: 'secret_reveal', target: '{B}', value: true },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minStrength: 30, minSentiment: 20 },
    weight: 4,
  },
  {
    id: 'betrayal_behind_back',
    type: 'betrayal',
    content: '{A}在背后捅了{B}一刀',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -40 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minStrength: 25 },
    weight: 3,
  },
  {
    id: 'betrayal_double_agent',
    type: 'betrayal',
    content: '{A}发现{B}是双面间谍',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -45 },
      { type: 'secret_reveal', target: '{B}', value: true },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 2,
  },
  {
    id: 'betrayal_leak_info',
    type: 'betrayal',
    content: '{A}泄露了{B}的重要信息',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -30 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minStrength: 20 },
    weight: 5,
  },
];

// ===== 惊喜事件模板 =====
const surpriseTemplates: EventTemplate[] = [
  {
    id: 'surprise_good_news',
    type: 'surprise',
    content: '{A}收到了意想不到的好消息',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: 10 },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 15,
  },
  {
    id: 'surprise_visitor',
    type: 'surprise',
    content: '{A}遇到了重要人物',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: 8 },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 12,
  },
  {
    id: 'surprise_gift',
    type: 'surprise',
    content: '{A}收到了{B}的神秘礼物',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 12 },
      { type: 'item_transfer', target: '{A}', value: 'mystery_gift' },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 10,
  },
  {
    id: 'surprise_coincidence',
    type: 'surprise',
    content: '{A}和{B}意外发现彼此的联系',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 15 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    weight: 8,
  },
  {
    id: 'surprise_inheritance',
    type: 'surprise',
    content: '{A}意外获得一笔遗产',
    consequences: [
      { type: 'status_change', target: '{A}', value: 'wealthy' },
    ],
    minParticipants: 1,
    maxParticipants: 1,
    weight: 3,
  },
];

// ===== 悲剧事件模板 =====
const tragedyTemplates: EventTemplate[] = [
  {
    id: 'tragedy_failure',
    type: 'tragedy',
    content: '{A}经历了一次重大失败',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: -10 },
      { type: 'status_change', target: '{A}', value: 'depressed' },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 8,
  },
  {
    id: 'tragedy_loss',
    type: 'tragedy',
    content: '{A}失去了重要的东西',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: -15 },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 6,
  },
  {
    id: 'tragedy_rejection',
    type: 'tragedy',
    content: '{A}被{B}拒绝了',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -20 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minSentiment: 30 },
    weight: 7,
  },
  {
    id: 'tragedy_scandal',
    type: 'tragedy',
    content: '{A}陷入丑闻风波',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: -20 },
      { type: 'status_change', target: '{A}', value: 'scandal' },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 5,
  },
  {
    id: 'tragedy_missed_chance',
    type: 'tragedy',
    content: '{A}错过了和{B}在一起的机会',
    consequences: [
      { type: 'relationship_change', target: 'both', value: -15 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minSentiment: 40 },
    weight: 6,
  },
];

// ===== 胜利事件模板 =====
const victoryTemplates: EventTemplate[] = [
  {
    id: 'victory_deal',
    type: 'victory',
    content: '{A}谈成了一笔大生意',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: 15 },
      { type: 'status_change', target: '{A}', value: 'successful' },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 10,
  },
  {
    id: 'victory_case',
    type: 'victory',
    content: '{A}赢得了重要案件',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: 18 },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 8,
  },
  {
    id: 'victory_truth',
    type: 'victory',
    content: '{A}揭露了真相',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: 12 },
      { type: 'secret_reveal', target: 'public', value: true },
    ],
    minParticipants: 1,
    maxParticipants: 3,
    weight: 7,
  },
  {
    id: 'victory_overcome',
    type: 'victory',
    content: '{A}克服了困难',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: 10 },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 12,
  },
  {
    id: 'victory_recognition',
    type: 'victory',
    content: '{A}的努力得到了认可',
    consequences: [
      { type: 'relationship_change', target: '{A}', value: 12 },
      { type: 'status_change', target: '{A}', value: 'recognized' },
    ],
    minParticipants: 1,
    maxParticipants: 2,
    weight: 10,
  },
  {
    id: 'victory_together',
    type: 'victory',
    content: '{A}和{B}合作取得成功',
    consequences: [
      { type: 'relationship_change', target: 'both', value: 20 },
    ],
    minParticipants: 2,
    maxParticipants: 2,
    requiredRelationships: { minStrength: 20 },
    weight: 9,
  },
];

// ===== 导出所有模板 =====
export const EVENT_TEMPLATES: Record<EventType, EventTemplate[]> = {
  conflict: conflictTemplates,
  reconciliation: reconciliationTemplates,
  romance: romanceTemplates,
  betrayal: betrayalTemplates,
  surprise: surpriseTemplates,
  tragedy: tragedyTemplates,
  victory: victoryTemplates,
};

// ===== 工具函数 =====

// 获取随机模板
export function getRandomTemplate(type: EventType): EventTemplate {
  const templates = EVENT_TEMPLATES[type];
  const totalWeight = templates.reduce((sum, t) => sum + (t.weight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const template of templates) {
    random -= (template.weight || 1);
    if (random <= 0) {
      return template;
    }
  }
  
  return templates[0];
}

// 获取所有模板数量
export function getTemplateCount(): Record<EventType, number> {
  const count: Record<string, number> = {};
  
  (Object.keys(EVENT_TEMPLATES) as EventType[]).forEach(type => {
    count[type] = EVENT_TEMPLATES[type].length;
  });
  
  return count;
}

// 根据条件筛选模板
export function filterTemplates(
  type: EventType,
  participants: number,
  minSentiment?: number,
  minStrength?: number
): EventTemplate[] {
  return EVENT_TEMPLATES[type].filter(template => {
    // 检查参与者数量
    if (template.minParticipants && participants < template.minParticipants) return false;
    if (template.maxParticipants && participants > template.maxParticipants) return false;
    
    // 检查关系条件
    if (template.requiredRelationships) {
      const req = template.requiredRelationships;
      if (minSentiment !== undefined && req.minSentiment !== undefined && minSentiment < req.minSentiment) {
        return false;
      }
      if (minStrength !== undefined && req.minStrength !== undefined && minStrength < req.minStrength) {
        return false;
      }
    }
    
    return true;
  });
}

// 统计
export const TEMPLATE_STATS = {
  totalTemplates: Object.values(EVENT_TEMPLATES).reduce((sum, arr) => sum + arr.length, 0),
  byType: getTemplateCount(),
};
