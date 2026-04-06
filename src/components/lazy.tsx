/**
 * 代码分割 - 动态导入重量级组件
 * 按需加载，减少首屏加载时间
 */

import dynamic from 'next/dynamic';

// 像素世界 - 大型游戏组件，按需加载
export const LazyPixelWorld = dynamic(
  () => import('@/game/components/PixelWorld').then(mod => ({ default: mod.PixelWorld })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#0f0f1a] rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-sm text-[#8b8fa8]">加载像素世界...</p>
          <div className="mt-4 w-48 h-1 bg-[#2a2d3a] rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-[#00d4ff] animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    ),
  }
);

// 关系图谱 - SVG 渲染组件，按需加载
export const LazyRelationshipGraph = dynamic(
  () => import('@/components/RelationshipGraph').then(mod => ({ default: mod.RelationshipGraph })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] flex items-center justify-center bg-[#12141c] rounded-xl border border-[#2a2d3a]">
        <div className="text-center">
          <div className="text-4xl mb-3">🔗</div>
          <p className="text-sm text-[#8b8fa8]">加载关系图谱...</p>
          <div className="mt-4 flex gap-1 justify-center">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

// 游戏时间线 - 按需加载
export const LazyGameTimeline = dynamic(
  () => import('@/components/GameTimeline').then(mod => ({ default: mod.GameTimeline })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center bg-[#12141c] rounded-xl border border-[#2a2d3a]">
        <div className="text-center">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-sm text-[#8b8fa8]">加载时间线...</p>
        </div>
      </div>
    ),
  }
);

// NFT 详情弹窗 - 按需加载
export const LazyNFTDetailModal = dynamic(
  () => import('@/components/NFTDetailModal').then(mod => ({ default: mod.NFTDetailModal })),
  {
    ssr: false,
  }
);

// 成就弹窗 - 按需加载
export const LazyAchievementPopup = dynamic(
  () => import('@/components/AchievementPopup').then(mod => ({ default: mod.AchievementPopup })),
  {
    ssr: false,
  }
);

// 设置面板 - 按需加载
export const LazySettingsPanel = dynamic(
  () => import('@/components/SettingsPanel').then(mod => ({ default: mod.SettingsPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 bg-[#12141c] rounded-xl border border-[#2a2d3a]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#2a2d3a] rounded w-1/3" />
          <div className="h-4 bg-[#2a2d3a] rounded w-2/3" />
          <div className="h-4 bg-[#2a2d3a] rounded w-1/2" />
        </div>
      </div>
    ),
  }
);

// NFT 市场 - 按需加载
export const LazyNFTMarket = dynamic(
  () => import('@/components/NFTMarket').then(mod => ({ default: mod.NFTMarket })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-[#12141c] rounded-xl border border-[#2a2d3a] animate-pulse">
            <div className="h-32 bg-[#1a1d28] rounded-lg mb-3" />
            <div className="h-4 bg-[#2a2d3a] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[#2a2d3a] rounded w-1/2" />
          </div>
        ))}
      </div>
    ),
  }
);

export default {
  LazyPixelWorld,
  LazyRelationshipGraph,
  LazyGameTimeline,
  LazyNFTDetailModal,
  LazyAchievementPopup,
  LazySettingsPanel,
  LazyNFTMarket,
};
