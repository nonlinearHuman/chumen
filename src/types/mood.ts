// 角色心情状态
// src/types/mood.ts

export interface Mood {
  agentId: string;
  mood: 'happy' | 'sad' | 'angry' | 'excited' | 'neutral';
  lastUpdate: number;
}

// 随机心情变化
export const getRandomMood = (): Mood['mood'] => {
  const moods: Mood['mood'][] = ['happy', 'sad', 'angry', 'excited', 'neutral'];
  return moods[Math.floor(Math.random() * moods.length)];
};

// 心情对应的 emoji
export const moodEmojis: Record<Mood['mood'], string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  excited: '🤩',
  neutral: '😐',
};

// 心情对应的颜色
export const moodColors: Record<Mood['mood'], string> = {
  happy: 'bg-yellow-100 border-yellow-300',
  sad: 'bg-blue-100 border-blue-300',
  angry: 'bg-red-100 border-red-300',
  excited: 'bg-purple-100 border-purple-300',
  neutral: 'bg-gray-100 border-gray-300',
};
