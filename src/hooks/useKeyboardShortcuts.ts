'use client';

import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';

interface UseKeyboardShortcutsProps {
  onSetTab?: (tab: 'chat' | 'pixel' | 'nft') => void;
}

export function useKeyboardShortcuts({ onSetTab }: UseKeyboardShortcutsProps = {}) {
  const {
    isPlaying,
    startGame,
    stopGame,
    saveGame,
  } = useGameStore();

  const togglePlay = useCallback(() => {
    if (isPlaying) stopGame();
    else startGame();
  }, [isPlaying, startGame, stopGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore keys when focused in input/textarea
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Space - Play/Pause (no modifier)
    if (e.code === 'Space' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      togglePlay();
      return;
    }

    // ESC - Close modals (handled by each panel's close button through a custom event)
    if (e.code === 'Escape') {
      window.dispatchEvent(new CustomEvent('chumen:close-all-modals'));
      return;
    }

    // Ctrl/Cmd + key
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();

      switch (key) {
        case '1':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chumen:close-all-modals'));
          onSetTab?.('chat');
          break;
        case '2':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chumen:close-all-modals'));
          onSetTab?.('pixel');
          break;
        case '3':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chumen:close-all-modals'));
          onSetTab?.('nft');
          break;
        case 'a':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chumen:toggle-achievements'));
          break;
        case 's':
          e.preventDefault();
          if (e.shiftKey) {
            saveGame();
            window.dispatchEvent(new CustomEvent('chumen:save-success'));
          } else {
            window.dispatchEvent(new CustomEvent('chumen:toggle-stats'));
          }
          break;
        case 'd':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chumen:toggle-daily'));
          break;
        case 't':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chumen:toggle-timeline'));
          break;
        case 'r':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chumen:toggle-relationships'));
          break;
        case ',':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chumen:toggle-settings'));
          break;
      }
    }
  }, [togglePlay, saveGame, onSetTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
