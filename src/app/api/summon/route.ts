// 召唤API路由
import { NextRequest, NextResponse } from 'next/server';
import { SpriteComposer } from '@/game/engine/SpriteComposer';
import { Rarity } from '@/types/traits';
import { rarityCalculator } from '@/lib/rarityCalculator';
import { visualScorer } from '@/lib/visualScorer';
import { priceEstimator } from '@/lib/priceEstimator';

const composer = new SpriteComposer();

// AI故事生成（简化版，实际项目可接入LLM）
async function generateBackstory(traits: any[], rarity: Rarity): Promise<string> {
  const traitNames = traits.map(t => t.nameZh).join('、');
  
  const storyTemplates: Record<string, string[]> = {
    legendary: [
      `传说中的存在，拥有${traitNames}等稀有特征。在楚门世界的远古时代，他们是守护者，见证了世界的诞生与变迁。`,
      `世人传说中的英雄，${traitNames}的完美结合。他们的出现总是伴随着命运的转折，是改变世界格局的关键人物。`,
      `身负特殊使命的神秘角色，${traitNames}让他们与众不同。古老的预言中曾提到过他们的到来。`,
    ],
    mythic: [
      `独一无二的存在，${traitNames}的组合前所未有的神秘。他们似乎是楚门世界本源力量的化身，拥有改变现实的能力。`,
      `跨越时空的旅者，${traitNames}是他们在无数世界中历练的证明。每一个特征都蕴含着宇宙的奥秘。`,
      `世界意识的投影，${traitNames}象征着楚门世界的本质。他们的存在本身就是一种奇迹。`,
    ],
  };

  const templates = storyTemplates[rarity] || storyTemplates.legendary;
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'normal' } = body as { type: 'normal' | 'premium' | 'legendary' };

    // 验证召唤类型
    if (!['normal', 'premium', 'legendary'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid summon type' },
        { status: 400 }
      );
    }

    // 生成精灵
    const sprite = await composer.generate(undefined, type);

    // 为Legendary和Mythic生成AI故事
    let story: string | undefined;
    if (sprite.rarity === 'legendary' || sprite.rarity === 'mythic') {
      story = await generateBackstory(sprite.traits, sprite.rarity);
    }

    // 计算 NFT 属性
    // 注意：这里用空数组作为全局统计，实际生产环境应该从数据库读取所有 Agent
    const { nftAttrs } = rarityCalculator.generateTradingAttrs(
      { ...sprite, story },
      [],
      0,
      'chumen-system'
    );

    const { collectionAttrs } = visualScorer.generateCollectionAttrs(
      { ...sprite, story },
      0
    );

    // 估算价格
    const estimatedPrice = priceEstimator.estimateInitialPrice(
      sprite.rarity,
      nftAttrs,
      collectionAttrs
    );

    // 返回结果（预览图在客户端生成）
    return NextResponse.json({
      success: true,
      agent: {
        ...sprite,
        story,
        nftAttrs,
        collectionAttrs,
        estimatedPrice,
        // 不在服务端生成预览图，由客户端处理
        previewUrl: undefined,
      },
    });
  } catch (error) {
    console.error('Summon error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to summon agent' },
      { status: 500 }
    );
  }
}

// 批量召唤
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { count = 1, type = 'normal' } = body as { count: number; type: 'normal' | 'premium' | 'legendary' };

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 10' },
        { status: 400 }
      );
    }

    const sprites = [];
    for (let i = 0; i < count; i++) {
      const sprite = await composer.generate(undefined, type);
      
      let story: string | undefined;
      if (sprite.rarity === 'legendary' || sprite.rarity === 'mythic') {
        story = await generateBackstory(sprite.traits, sprite.rarity);
      }

      // 计算 NFT 属性
      const { nftAttrs } = rarityCalculator.generateTradingAttrs(
        { ...sprite, story },
        sprites, // 使用已生成的作为参考
        0,
        'chumen-system'
      );

      const { collectionAttrs } = visualScorer.generateCollectionAttrs(
        { ...sprite, story },
        0
      );

      const estimatedPrice = priceEstimator.estimateInitialPrice(
        sprite.rarity,
        nftAttrs,
        collectionAttrs
      );

      sprites.push({
        ...sprite,
        story,
        nftAttrs,
        collectionAttrs,
        estimatedPrice,
        previewUrl: sprite.pixels 
          ? composer.pixelsToDataURL(sprite.pixels, sprite.colors, 10)
          : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      agents: sprites,
    });
  } catch (error) {
    console.error('Batch summon error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to summon agents' },
      { status: 500 }
    );
  }
}
