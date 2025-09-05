import { useEffect, useRef, useState, useCallback } from 'react';
import { useCardStore } from '../store/cardStore';

interface UseCardKeyboardNavigationOptions {
  onActivateCard?: (cardId: string) => void;
  onDeactivateCard?: (cardId: string) => void;
  onSelectCard?: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onReorderCard?: (cardId: string, direction: 'up' | 'down') => void;
  enabled?: boolean;
}

export function useCardKeyboardNavigation(options: UseCardKeyboardNavigationOptions = {}) {
  const {
    onActivateCard,
    onDeactivateCard,
    onSelectCard,
    onDeleteCard,
    onReorderCard,
    enabled = true,
  } = options;

  const { cards, updateCard } = useCardStore();
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus management
  const focusCard = useCallback((index: number) => {
    const cardElements = containerRef.current?.querySelectorAll('[role="article"]');
    if (cardElements && cardElements[index]) {
      (cardElements[index] as HTMLElement).focus();
    }
  }, []);

  // Navigate between cards
  const navigateCards = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      setIsNavigating(true);
      setSelectedCardIndex((prev) => {
        let newIndex = prev;
        
        switch (direction) {
          case 'up':
          case 'left':
            newIndex = Math.max(0, prev - 1);
            break;
          case 'down':
          case 'right':
            newIndex = Math.min(cards.length - 1, prev + 1);
            break;
        }
        
        focusCard(newIndex);
        return newIndex;
      });
    },
    [cards.length, focusCard]
  );

  // Reorder cards
  const reorderSelectedCard = useCallback(
    (direction: 'up' | 'down') => {
      if (selectedCardIndex < 0 || selectedCardIndex >= cards.length) return;
      
      const card = cards[selectedCardIndex];
      if (!card) return;

      if (onReorderCard) {
        onReorderCard(card.id, direction);
      } else {
        // Default reorder implementation
        const newIndex = direction === 'up' 
          ? Math.max(0, selectedCardIndex - 1)
          : Math.min(cards.length - 1, selectedCardIndex + 1);
        
        if (newIndex !== selectedCardIndex) {
          // Update card positions in store
          const updatedCards = [...cards];
          const [movedCard] = updatedCards.splice(selectedCardIndex, 1);
          updatedCards.splice(newIndex, 0, movedCard);
          
          // Update positions in store
          updatedCards.forEach((card, index) => {
            updateCard(card.id, { position: index });
          });
          
          setSelectedCardIndex(newIndex);
          focusCard(newIndex);
        }
      }
    },
    [selectedCardIndex, cards, onReorderCard, updateCard, focusCard]
  );

  // Toggle card activation
  const toggleCardActivation = useCallback(() => {
    if (selectedCardIndex < 0 || selectedCardIndex >= cards.length) return;
    
    const card = cards[selectedCardIndex];
    if (!card) return;

    if (card.status === 'active') {
      if (onDeactivateCard) {
        onDeactivateCard(card.id);
      } else {
        updateCard(card.id, { status: 'queued' });
      }
    } else {
      if (onActivateCard) {
        onActivateCard(card.id);
      } else {
        updateCard(card.id, { status: 'active' });
      }
    }
  }, [selectedCardIndex, cards, onActivateCard, onDeactivateCard, updateCard]);

  // Select card (open details)
  const selectCurrentCard = useCallback(() => {
    if (selectedCardIndex < 0 || selectedCardIndex >= cards.length) return;
    
    const card = cards[selectedCardIndex];
    if (card && onSelectCard) {
      onSelectCard(card.id);
    }
  }, [selectedCardIndex, cards, onSelectCard]);

  // Delete card
  const deleteCurrentCard = useCallback(() => {
    if (selectedCardIndex < 0 || selectedCardIndex >= cards.length) return;
    
    const card = cards[selectedCardIndex];
    if (!card) return;

    if (onDeleteCard) {
      onDeleteCard(card.id);
    }
    
    // Move focus to next card or previous if last
    const nextIndex = selectedCardIndex === cards.length - 1 
      ? Math.max(0, selectedCardIndex - 1)
      : selectedCardIndex;
    
    setSelectedCardIndex(nextIndex);
    setTimeout(() => focusCard(nextIndex), 100);
  }, [selectedCardIndex, cards, onDeleteCard, focusCard]);

  // Keyboard event handler
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      let handled = true;

      // Navigation keys
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          navigateCards('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigateCards('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigateCards('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateCards('right');
          break;
        case ' ': // Spacebar
        case 'Enter':
          if (!event.shiftKey && !event.ctrlKey) {
            event.preventDefault();
            toggleCardActivation();
          }
          break;
        case 'Enter':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            selectCurrentCard();
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (event.shiftKey) {
            event.preventDefault();
            deleteCurrentCard();
          }
          break;
        case 'Tab':
          // Let Tab work normally but track navigation
          setIsNavigating(true);
          break;
        default:
          handled = false;
      }

      // Reordering with Shift + Arrow keys
      if (event.shiftKey) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            reorderSelectedCard('up');
            handled = true;
            break;
          case 'ArrowDown':
            event.preventDefault();
            reorderSelectedCard('down');
            handled = true;
            break;
        }
      }

      // Keyboard shortcuts with numbers (1-9 to jump to card)
      if (event.key >= '1' && event.key <= '9' && !event.ctrlKey && !event.metaKey) {
        const index = parseInt(event.key) - 1;
        if (index < cards.length) {
          event.preventDefault();
          setSelectedCardIndex(index);
          focusCard(index);
          handled = true;
        }
      }

      if (handled) {
        // Announce action to screen readers
        announceAction(event.key, cards[selectedCardIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    navigateCards,
    toggleCardActivation,
    selectCurrentCard,
    deleteCurrentCard,
    reorderSelectedCard,
    cards,
    selectedCardIndex,
    focusCard,
  ]);

  // Screen reader announcements
  const announceAction = (key: string, card: any) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    
    let message = '';
    
    switch (key) {
      case ' ':
      case 'Enter':
        message = card ? `${card.title} ${card.status === 'active' ? 'deactivated' : 'activated'}` : '';
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        message = card ? `Navigated to ${card.title}` : 'No more cards in this direction';
        break;
      case 'Delete':
      case 'Backspace':
        message = card ? `${card.title} deleted` : '';
        break;
    }
    
    if (message) {
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  return {
    containerRef,
    selectedCardIndex,
    isNavigating,
    navigateCards,
    toggleCardActivation,
    selectCurrentCard,
    deleteCurrentCard,
    reorderSelectedCard,
    focusCard,
  };
}

// Export keyboard shortcut documentation
export const CARD_KEYBOARD_SHORTCUTS = [
  { key: '↑/↓/←/→', description: 'Navigate between cards' },
  { key: 'Space/Enter', description: 'Activate/deactivate card' },
  { key: 'Ctrl+Enter', description: 'Open card details' },
  { key: 'Shift+Delete', description: 'Delete card' },
  { key: 'Shift+↑/↓', description: 'Reorder cards' },
  { key: '1-9', description: 'Jump to card by number' },
  { key: 'Tab', description: 'Navigate through interactive elements' },
  { key: 'Escape', description: 'Exit focus mode' },
];