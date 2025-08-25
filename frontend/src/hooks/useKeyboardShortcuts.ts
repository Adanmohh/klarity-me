import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export const useKeyboardShortcuts = () => {
  const { 
    currentArea, 
    setCurrentArea, 
    toggleArrangeMode,
    cards,
    setCurrentCard
  } = useAppStore();

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Command/Ctrl combinations
      if (e.metaKey || e.ctrlKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            // Open command palette (to be implemented)
            console.log('Command palette');
            break;
          case 'n':
            e.preventDefault();
            // New card/task
            document.querySelector<HTMLButtonElement>('[data-new-card]')?.click();
            break;
          case 's':
            e.preventDefault();
            // Save/sync
            console.log('Saving...');
            break;
          case 'e':
            e.preventDefault();
            // Export data
            const { storage } = await import('../utils/storage');
            storage.exportData();
            break;
        }
        return;
      }

      // Single key shortcuts
      switch(e.key) {
        case 'f':
          // Switch to Focus mode
          setCurrentArea('focus');
          break;
        case 'd':
          // Switch to Daily tasks
          setCurrentArea('daily');
          break;
        case 'a':
          // Toggle arrange mode
          if (currentArea === 'focus') {
            toggleArrangeMode();
          }
          break;
        case ' ':
          // Space - flip top card
          e.preventDefault();
          if (currentArea === 'focus' && !useAppStore.getState().currentCard) {
            const topCard = cards[0];
            if (topCard) {
              // Trigger flip animation
              document.querySelector<HTMLDivElement>('[data-top-card]')?.click();
            }
          }
          break;
        case 'Escape':
          // Close current card
          setCurrentCard(null);
          break;
        case '?':
          // Show help
          showShortcutsHelp();
          break;
      }

      // Number keys - jump to card
      if (e.key >= '1' && e.key <= '9') {
        const cardIndex = parseInt(e.key) - 1;
        if (cards[cardIndex] && currentArea === 'focus') {
          // Fetch full card data and open
          const { cardsAPI } = await import('../services/api');
          try {
            const cardWithTasks = await cardsAPI.getCard(cards[cardIndex].id);
            setCurrentCard(cardWithTasks);
          } catch (error) {
            console.error('Failed to load card:', error);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentArea, cards, setCurrentArea, toggleArrangeMode, setCurrentCard]);
};

function showShortcutsHelp() {
  const shortcuts = `
    ⌨️ Keyboard Shortcuts:
    
    Navigation:
    • f - Focus mode
    • d - Daily tasks
    • 1-9 - Jump to card
    • ESC - Close card
    
    Actions:
    • Space - Flip top card
    • a - Arrange mode
    • Cmd+N - New card/task
    • Cmd+K - Command palette
    • Cmd+E - Export data
    • Cmd+S - Save
    
    • ? - Show this help
  `;
  alert(shortcuts);
}