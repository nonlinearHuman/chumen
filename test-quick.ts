import { SpriteComposer } from './src/game/engine/SpriteComposer';
import { TRAIT_STATS } from './src/data/traits';

console.log('\n🧪 Agent 创造系统测试报告\n');
console.log('=' .repeat(50));

console.log('\n📊 特征数据统计:');
console.log('-'.repeat(30));
Object.entries(TRAIT_STATS).forEach(([category, count]) => {
  if (category !== 'total') {
    console.log(`  ${category.padEnd(12)}: ${count} 种`);
  }
});
console.log(`  ${'总计'.padEnd(12)}: ${TRAIT_STATS.total} 种特征`);

console.log('\n✨ 测试召唤:');
console.log('-'.repeat(30));

const composer = new SpriteComposer();

async function test() {
  // 测试3个普通召唤
  for (let i = 0; i < 3; i++) {
    const sprite = await composer.generate(undefined, 'normal');
    console.log(`\n  召唤 #${i + 1}:`);
    console.log(`    稀有度: ${sprite.rarity.toUpperCase()}`);
    console.log(`    DNA: ${sprite.dna}`);
    console.log(`    特征: ${sprite.traits.map(t => t.nameZh).join(', ')}`);
  }
  
  console.log('\n✅ 系统运行正常！\n');
}

test().catch(console.error);
