import { SpriteComposer } from './src/game/engine/SpriteComposer';
import { RARITY_CONFIG } from './src/types/traits';

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║    🎮 楚门World - Agent 召唤演示系统 🎮          ║');
console.log('╚══════════════════════════════════════════════════╝\n');

const composer = new SpriteComposer();

async function demo() {
  // 模拟3种召唤类型
  const summonTypes = [
    { type: 'normal' as const, label: '普通召唤', icon: '🟢' },
    { type: 'premium' as const, label: '高级召唤', icon: '🟡' },
    { type: 'legendary' as const, label: '传说召唤', icon: '🟣' },
  ];

  for (const summon of summonTypes) {
    console.log(`\n${summon.icon} ${summon.label}`);
    console.log('━'.repeat(50));
    
    const sprite = await composer.generate(undefined, summon.type);
    const rarityConfig = RARITY_CONFIG[sprite.rarity];
    
    console.log(`\n  ┌─────────────────────────────────────────┐`);
    console.log(`  │ 稀有度: ${sprite.rarity.toUpperCase().padEnd(32)}│`);
    console.log(`  │ DNA:    ${sprite.dna}              │`);
    console.log(`  │ 特征数: ${sprite.traits.length.toString().padEnd(32)}│`);
    console.log(`  └─────────────────────────────────────────┘`);
    console.log(`\n  特征列表:`);
    sprite.traits.forEach((trait, i) => {
      console.log(`    ${i + 1}. ${trait.nameZh} (${trait.category})`);
    });
    
    if (sprite.story) {
      console.log(`\n  📖 故事: ${sprite.story}`);
    }
    
    console.log();
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║          ✨ 召唤演示完成！感谢体验 ✨            ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
}

demo().catch(console.error);
