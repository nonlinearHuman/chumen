// 故事引擎测试脚本
// 运行: npx tsx src/game/engine/story-engine.test.ts

import { agents } from '@/config/agents';
import { RelationshipEngine } from '@/lib/relationshipEngine';
import { StoryGenerator } from '@/lib/storyGenerator';
import { EventTriggerSystem } from './EventTrigger';
import { EVENT_TEMPLATES, TEMPLATE_STATS } from '@/data/storyTemplates';
import { EventType, EVENT_TYPE_DESC } from '@/types/story';

async function main() {
  console.log('========================================');
  console.log('  楚门World - 故事引擎测试');
  console.log('========================================\n');

  // ===== 1. 测试类型定义 =====
  console.log('【1】类型定义测试');
  console.log('事件类型:');
  (Object.keys(EVENT_TYPE_DESC) as EventType[]).forEach(type => {
    const info = EVENT_TYPE_DESC[type];
    console.log(`  ${info.icon} ${info.nameCN} (${type}) - ${info.color}`);
  });
  console.log('');

  // ===== 2. 测试事件模板 =====
  console.log('【2】事件模板统计');
  console.log(`总模板数: ${TEMPLATE_STATS.totalTemplates}`);
  console.log('各类型数量:');
  Object.entries(TEMPLATE_STATS.byType).forEach(([type, count]) => {
    const info = EVENT_TYPE_DESC[type as EventType];
    console.log(`  ${info.icon} ${info.nameCN}: ${count}个模板`);
  });
  console.log('');

  // ===== 3. 测试关系引擎 =====
  console.log('【3】关系引擎测试');
  const relEngine = new RelationshipEngine(agents);

  console.log('初始关系（前5个）:');
  const allRels = relEngine.getAllRelationships();
  allRels.slice(0, 5).forEach(rel => {
    console.log(`  ${rel.characterA} ↔ ${rel.characterB}`);
    console.log(`    类型: ${rel.type}`);
    console.log(`    强度: ${rel.strength}, 情感: ${rel.sentiment}`);
  });
  console.log(`总计关系数: ${allRels.length}`);
  console.log('');

  // 测试关系变化计算
  console.log('测试关系变化计算:');
  const testEvent = {
    id: 'test-event-1',
    type: 'conflict' as EventType,
    participants: ['marcus', 'sophia'],
    location: 'cafe',
    trigger: { type: 'relationship' as const, conditions: {} },
    content: 'Marcus和Sophia发生冲突',
    consequences: [],
    timestamp: Date.now(),
  };

  const testRel = relEngine.getRelationship('marcus', 'sophia');
  if (testRel) {
    const change = relEngine.calculateChange(testEvent, testRel);
    console.log(`  冲突事件对 Marcus-Sophia 关系的影响: ${change}`);
    
    // 应用后果
    const updated = relEngine.applyConsequences(testEvent);
    console.log(`  更新后的情感值: ${updated[0]?.sentiment}`);
  }
  console.log('');

  // ===== 4. 测试剧情生成器 =====
  console.log('【4】剧情生成器测试');
  const storyGen = new StoryGenerator();

  console.log('测试生成背景故事:');
  const traits = ['野心勃勃', '孤独', '理想主义'];
  try {
    const backstory = await storyGen.generateBackstory(traits);
    console.log(`  特征: ${traits.join('、')}`);
    console.log(`  故事: ${backstory}`);
  } catch (error) {
    console.log('  (背景故事生成跳过 - 需要 API 密钥)');
  }
  console.log('');

  // 测试生成对话
  console.log('测试生成事件对话:');
  const testEvent2 = {
    id: 'test-event-2',
    type: 'romance' as EventType,
    participants: ['james', 'emily'],
    location: 'hospital',
    trigger: { type: 'relationship' as const, conditions: {} },
    content: 'James和Emily深夜在医院偶遇',
    consequences: [],
    timestamp: Date.now(),
  };

  try {
    const dialogue = await storyGen.generateEventDialogue(testEvent2);
    console.log('  生成的对话:');
    dialogue.forEach(d => {
      console.log(`    ${d.characterName}: ${d.content} ${d.emotion ? `[${d.emotion}]` : ''}`);
    });
  } catch (error) {
    console.log('  (对话生成跳过 - 需要 API 密钥)');
  }
  console.log('');

  // ===== 5. 测试事件触发系统 =====
  console.log('【5】事件触发系统测试');
  const triggerSys = new EventTriggerSystem({
    baseRandomProbability: 1.0, // 提高概率便于测试
    minEventInterval: 0,
  });

  // 创建测试角色位置
  const testCharacters = [
    {
      id: 'marcus',
      name: 'Marcus',
      emoji: '🧑‍💻',
      x: 200, y: 300,
      targetX: 200, targetY: 300,
      direction: 'down' as const,
      isMoving: false,
      color: '#4a90d9',
      frameIndex: 0,
      lastFrameTime: 0,
      lastEmotionTime: 0,
      lastFootstepTime: 0,
    },
    {
      id: 'sophia',
      name: 'Sophia',
      emoji: '👩‍⚖️',
      x: 210, y: 310, // 接近 Marcus
      targetX: 210, targetY: 310,
      direction: 'down_left' as const,
      isMoving: false,
      color: '#9b59b6',
      frameIndex: 0,
      lastFrameTime: 0,
      lastEmotionTime: 0,
      lastFootstepTime: 0,
    },
  ];

  console.log('测试接近触发:');
  try {
    const event = triggerSys.checkTriggers(testCharacters, 'cafe');
    if (event) {
      const typeInfo = EVENT_TYPE_DESC[event.type];
      console.log(`  触发事件 [${typeInfo.nameCN}]: ${event.content}`);
      console.log(`  参与者: ${event.participants.join(', ')}`);
    } else {
      console.log('  (未触发事件 - 可能是随机概率)');
    }
  } catch (error: any) {
    console.log(`  触发测试出错: ${error.message}`);
  }

  console.log('\n获取最近事件:');
  const recentEvents = triggerSys.getRecentEvents(5);
  console.log(`  最近事件数: ${recentEvents.length}`);
  console.log('');

  // ===== 6. 完整流程测试 =====
  console.log('【6】完整故事流程测试');

  // 重置引擎
  const freshRelEngine = new RelationshipEngine(agents);
  const freshTriggerSys = new EventTriggerSystem();

  console.log('模拟游戏循环 (10次检查):');
  for (let i = 0; i < 10; i++) {
    // 随机移动角色
    const chars = testCharacters.map(c => ({
      ...c,
      x: c.x + (Math.random() - 0.5) * 100,
      y: c.y + (Math.random() - 0.5) * 100,
    }));
    
    const ev = freshTriggerSys.checkTriggers(chars, 'cafe');
    if (ev) {
      console.log(`  [${i + 1}] 触发: ${EVENT_TYPE_DESC[ev.type].icon} ${ev.content}`);
      
      // 应用后果
      freshRelEngine.applyConsequences(ev);
    }
  }

  console.log('\n最终关系状态:');
  const finalRels = freshRelEngine.getCharacterRelationships('marcus');
  finalRels.slice(0, 3).forEach(rel => {
    const otherId = rel.characterA === 'marcus' ? rel.characterB : rel.characterA;
    console.log(`  marcus ↔ ${otherId}: ${rel.type} (情感: ${rel.sentiment})`);
  });

  console.log('\n========================================');
  console.log('  测试完成!');
  console.log('========================================\n');

  // ===== 输出汇总 =====
  console.log('【汇总报告】\n');
  console.log('创建的文件:');
  console.log('  1. src/types/story.ts - 故事类型定义');
  console.log('  2. src/lib/relationshipEngine.ts - 关系引擎');
  console.log('  3. src/lib/storyGenerator.ts - 剧情生成器');
  console.log('  4. src/game/engine/EventTrigger.ts - 事件触发器');
  console.log('  5. src/data/storyTemplates.ts - 事件模板库');
  console.log('  6. src/components/StoryPanel.tsx - UI组件');
  console.log('  7. src/game/engine/useStoryEngine.ts - 集成Hook');
  console.log('  8. src/game/engine/StoryEngine.example.tsx - 使用示例');
  console.log('');

  console.log('事件类型和数量:');
  console.log(`  总计: ${TEMPLATE_STATS.totalTemplates} 个事件模板`);
  Object.entries(TEMPLATE_STATS.byType).forEach(([type, count]) => {
    const info = EVENT_TYPE_DESC[type as EventType];
    console.log(`  ${info.icon} ${info.nameCN}: ${count}个`);
  });
  console.log('');

  console.log('关系系统说明:');
  console.log('  - 关系强度 (strength): 0-100，表示关系的紧密程度');
  console.log('  - 情感值 (sentiment): -100 到 100，从敌对到友好');
  console.log('  - 关系类型: 12种，根据强度和情感值自动更新');
  console.log('  - 关系历史: 记录最近20次互动事件');
  console.log('');

  console.log('GLM API 调用示例:');
  console.log('  // 生成事件对话');
  console.log('  const dialogue = await storyGenerator.generateEventDialogue(event);');
  console.log('');
  console.log('  // 生成背景故事');
  console.log('  const backstory = await storyGenerator.generateBackstory(traits);');
  console.log('');

  console.log('故事生成效果:');
  console.log('  - 自动检测角色接近和关系状态');
  console.log('  - 根据事件类型生成戏剧性对话');
  console.log('  - 动态更新角色关系');
  console.log('  - 支持UI展示事件和关系图谱');
}

main().catch(console.error);
