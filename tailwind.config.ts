/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background
        'chumen-deep': '#0a0b0f',
        'chumen-surface': '#12141c',
        'chumen-elevated': '#1a1d28',
        'chumen-glass': 'rgba(255, 255, 255, 0.05)',
        'chumen-pixel': '#0f0f1a',
        // Accent
        'chumen-cyan': '#00d4ff',
        'chumen-magenta': '#ff2d78',
        'chumen-gold': '#ffb800',
        'chumen-green': '#00ff88',
        'chumen-amber': '#ff9500',
        'chumen-purple': '#a855f7',
        // Text
        'chumen-text': '#e8e8f0',
        'chumen-text-secondary': '#8b8fa8',
        'chumen-text-muted': '#4a4d5e',
        // Border
        'chumen-border': '#2a2d3a',
        'chumen-border-active': '#3d4055',
        // Pixel world
        'pixel-cyan': '#00ffff',
        'pixel-magenta': '#ff00ff',
        'pixel-yellow': '#ffff00',
        'pixel-green': '#00ff00',
        // Rarity
        'rarity-common': '#9ca3af',
        'rarity-uncommon': '#22c55e',
        'rarity-rare': '#3b82f6',
        'rarity-epic': '#a855f7',
        'rarity-legendary': '#f97316',
        'rarity-mythic': '#fbbf24',
        // Emotion
        'emotion-neutral': '#4a4d5e',
        'emotion-happy': '#00ff88',
        'emotion-sad': '#3b82f6',
        'emotion-conflict': '#ff2d78',
        'emotion-romantic': '#ff69b4',
        'emotion-suspicious': '#ff9500',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-ibm-plex-sans)', 'IBM Plex Sans', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
        pixel: ['Press Start 2P', 'cursive'],
      },
      boxShadow: {
        'chumen-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'chumen-md': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'chumen-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-magenta': '0 0 20px rgba(255, 45, 120, 0.4)',
        'glow-gold': '0 0 20px rgba(255, 184, 0, 0.3)',
        'glow-green': '0 0 15px rgba(0, 255, 136, 0.4)',
        'glow-uncommon': '0 0 8px rgba(34, 197, 94, 0.4)',
        'glow-rare': '0 0 12px rgba(59, 130, 246, 0.5)',
        'glow-epic': '0 0 16px rgba(168, 85, 247, 0.6)',
      },
      borderRadius: {
        'chumen-sm': '4px',
        'chumen-md': '8px',
        'chumen-lg': '16px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s cubic-bezier(0, 0, 0.2, 1) forwards',
        'recording-pulse': 'recording-pulse 1s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gold-pulse': 'gold-pulse 2s ease-in-out infinite',
        'legendary-pulse': 'legendary-pulse 2s ease-in-out infinite',
        'mythic-rainbow': 'mythic-rainbow 3s ease-in-out infinite',
        'drama-pulse': 'drama-pulse 1.5s ease-in-out infinite',
        'spring-bounce': 'spring-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0, 0, 0.2, 1)',
        'shutter-flash': 'shutter-flash 0.15s ease-out',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'recording-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.7)' },
        },
        'gold-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 184, 0, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 184, 0, 0.6)' },
        },
        'legendary-pulse': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(249, 115, 22, 0.5)' },
          '50%': { boxShadow: '0 0 28px rgba(249, 115, 22, 0.9)' },
        },
        'mythic-rainbow': {
          '0%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)' },
          '33%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' },
          '66%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
          '100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)' },
        },
        'drama-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 rgba(255, 45, 120, 0)' },
          '50%': { boxShadow: '0 0 15px rgba(255, 45, 120, 0.4)' },
        },
        'spring-bounce': {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'shutter-flash': {
          '0%': { opacity: '0' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
