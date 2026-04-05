# NFT 交易属性系统

为 Agent Creation System 添加的 NFT 交易和收藏属性功能。

## 创建/修改的文件

### 新建文件
1. `src/lib/rarityCalculator.ts` - 稀有度计算器
2. `src/lib/visualScorer.ts` - 视觉评分器
3. `src/lib/priceEstimator.ts` - 价格估算器
4. `src/lib/nft-attrs.example.ts` - 使用示例

### 修改文件
1. `src/types/traits.ts` - 扩展类型定义
2. `src/app/api/summon/route.ts` - 更新召唤 API
3. `src/store/agentStore.ts` - 更新状态管理
4. `src/components/SummonResult.tsx` - 更新召唤结果展示
5. `src/components/AgentCollection.tsx` - 更新收藏展示

---

## 稀有度计算示例

```typescript
import { rarityCalculator } from '@/lib/rarityCalculator';

// 生成 NFT 交易属性
const { nftAttrs, traitRarity } = rarityCalculator.generateTradingAttrs(
  agent,
  allAgents,  // 用于计算全局排名
  0,          // 代数
  'system'    // 创造者
);

// 稀有度分数: 156.78 (越高越稀有)
// 排名: #42 (1 = 最稀有)
// 百分位: top 5% (0.05)
// 特征稀有度: { 'body-01': 12.5, 'effect-01': 45.2, ... }
```

### 稀有度计算逻辑

1. **基础分数** = 稀有度权重 × 类别权重 × 全局稀有度
   - 稀有度权重: common=1, uncommon=2, rare=5, epic=20, legendary=100, mythic=500
   - 类别权重: effect=3.0 (最高), body=0.5 (最低)
   - 全局稀有度: -log10(出现频率) × 10

2. **特征数量加成**: score × 1.1^特征数量

3. **特殊组合加分**:
   - 全稀有特征组合: ×1.5
   - 特效+标记: ×1.3
   - Mythic 特征: ×2.0
   - Legendary 特征: ×1.5

---

## 视觉评分示例

```typescript
import { visualScorer } from '@/lib/visualScorer';

// 生成收藏属性
const { collectionAttrs, visualScore, visualTags } = visualScorer.generateCollectionAttrs(
  agent,
  0  // 代数
);

// 视觉评分: 85/100
// 视觉标签: ['传说', '神秘', '发光', '紫色系']
// 性格标签: ['神秘', '深沉', '优雅']
```

### 视觉评分逻辑

1. **配色和谐度** (35%): 基于色相标准差，匹配预定义和谐组合加分

2. **构图平衡度** (30%): 核心特征覆盖率 + 可选特征加分

3. **独特性** (25%): 基于稀有度直接映射
   - mythic: 100, legendary: 90, epic: 80, rare: 60, uncommon: 40, common: 20

4. **特殊效果加分** (10%): 特效+15分，标记+10分，多配件+5分

---

## 价格估算示例

```typescript
import { priceEstimator } from '@/lib/priceEstimator';

// 估算初始价格
const estimatedPrice = priceEstimator.estimateInitialPrice(
  agent.rarity,
  nftAttrs,
  collectionAttrs
);

// 估算价格: 2.35 ETH
// 价格范围: 1.88 - 2.82 ETH
const range = priceEstimator.estimatePriceRange(rarity, nftAttrs, collectionAttrs);
console.log(priceEstimator.formatPrice(range.recommended)); // "2.35 ETH"
```

### 价格估算逻辑

1. **基础价格** (ETH):
   - common: 0.01, uncommon: 0.05, rare: 0.15
   - epic: 0.5, legendary: 2.0, mythic: 10.0

2. **乘数计算**:
   - 稀有度乘数: common=1.0, mythic=5.0
   - 视觉评分加成: 90+分=×2.0, 80+分=×1.5
   - 代数加成: Gen0=×1.5, 后续每代×0.85
   - 稀有度分数加成: score>500=×2.0

3. **综合价格** = 基础价格 × 稀有度乘数 × 视觉加成 × 代数加成 × 分数加成

---

## API 响应格式

召唤 API (`POST /api/summon`) 现在返回:

```json
{
  "success": true,
  "agent": {
    "id": "agent-xxx",
    "dna": "0x...",
    "rarity": "legendary",
    "traits": [...],
    "colors": {...},
    "createdAt": 1712345678901,
    "story": "传说中的存在...",
    "previewUrl": "data:image/png;base64,...",
    
    "nftAttrs": {
      "rank": 42,
      "score": 156.78,
      "percentile": 0.05,
      "traitRarity": { "body-01": 12.5, ... },
      "generation": 0,
      "creator": "chumen-system",
      "mintedAt": 1712345678901,
      "totalSales": 0,
      "averagePrice": 0,
      "priceChange24h": 0
    },
    
    "collectionAttrs": {
      "visualScore": 85,
      "visualTags": ["传说", "神秘", "发光"],
      "story": "传说中的存在...",
      "personality": ["神秘", "深沉", "优雅"],
      "keywords": ["legendary", "传说", "神秘", ...],
      "collection": "创世系列",
      "series": undefined,
      "milestones": [],
      "participatedEvents": [],
      "favoriteCount": 0,
      "viewCount": 0,
      "holderCount": 1
    },
    
    "estimatedPrice": 2.35
  }
}
```

---

## UI 更新

### SummonResult 组件
- 显示稀有度排名和分数
- 显示估算价格
- 显示视觉评分和标签
- 显示每个特征的稀有度分数

### AgentCollection 组件
- 新增排序: 按稀有度/价格/视觉评分/时间
- 新增筛选: 按稀有度/价格范围/标签
- 新增统计: 总数量、总价值、平均稀有度

---

## 使用方式

```typescript
// 在召唤时自动计算 NFT 属性
const response = await fetch('/api/summon', {
  method: 'POST',
  body: JSON.stringify({ type: 'normal' })
});
const { agent } = await response.json();

// 访问 NFT 属性
console.log(agent.nftAttrs.score);      // 稀有度分数
console.log(agent.estimatedPrice);       // 估算价格
console.log(agent.collectionAttrs?.visualTags);  // 视觉标签
```

---

## 后续优化建议

1. **持久化统计**: 将全局 Agent 统计存储到数据库，用于精确计算稀有度排名

2. **交易历史**: 记录 Agent 的交易历史，用于更新 lastSoldPrice、averagePrice 等

3. **动态价格**: 根据市场供需动态调整价格估算

4. **AI 故事生成**: 接入 LLM 生成更丰富的背景故事

5. **成就系统**: 实现 milestones 和 participatedEvents 功能
