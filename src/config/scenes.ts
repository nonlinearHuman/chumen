// 场景配置
// src/config/scenes.ts

import { Scene } from '@/types/agent';

export const scenes: Scene[] = [
  {
    id: "coffee_shop",
    name: "咖啡馆",
    emoji: "☕",
    description: "城市中心的网红咖啡馆，人们喜欢在这里谈事情",
    background: "warm",
    characters: ["marcus", "sophia", "lisa"],
    timeOfDay: "morning"
  },
  {
    id: "hospital",
    name: "医院",
    emoji: "🏥",
    description: "私立医院，环境优雅，但气氛依然紧张",
    background: "cold",
    characters: ["james", "emily"],
    timeOfDay: "any"
  },
  {
    id: "court",
    name: "法院",
    emoji: "⚖️",
    description: "庄严的法律殿堂，每一场审判都关乎命运",
    background: "serious",
    characters: ["sophia", "robert"],
    timeOfDay: "morning"
  },
  {
    id: "office",
    name: "写字楼",
    emoji: "🏢",
    description: "CBD 核心区，高楼林立，精英们的战场",
    background: "modern",
    characters: ["marcus", "david"],
    timeOfDay: "workday"
  },
  {
    id: "apartment",
    name: "公寓",
    emoji: "🏠",
    description: "城市中的私密空间，每个人的避风港",
    background: "cozy",
    characters: ["james", "emily"],
    timeOfDay: "evening"
  },
  {
    id: "street",
    name: "街头",
    emoji: "🛣️",
    description: "城市街道，车水马龙，偶遇高发地",
    background: "urban",
    characters: ["zhangyi", "laoli", "xiaowang"],
    timeOfDay: "any"
  },
  {
    id: "media_office",
    name: "媒体公司",
    emoji: "🎬",
    description: "Emily 的调查记者工作室，凌乱但充满线索",
    background: "creative",
    characters: ["emily", "xiaowang"],
    timeOfDay: "night"
  },
  {
    id: "police_station",
    name: "警局",
    emoji: "🚨",
    description: "警察局，案件信息汇集地",
    background: "official",
    characters: ["robert"],
    timeOfDay: "workday"
  }
];

export const getSceneById = (id: string): Scene | undefined => {
  return scenes.find(s => s.id === id);
};
