import { create } from 'zustand';
import { Card, CardWithTasks } from '../types';

interface AppState {
  // Card management
  cards: Card[];
  currentCard: CardWithTasks | null;
  arrangeMode: boolean;
  
  // UI state
  currentArea: 'focus' | 'daily';
  
  // Actions
  setCards: (cards: Card[]) => void;
  setCurrentCard: (card: CardWithTasks | null) => void;
  toggleArrangeMode: () => void;
  setCurrentArea: (area: 'focus' | 'daily') => void;
  updateCardPosition: (cardId: string, newPosition: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  cards: [],
  currentCard: null,
  arrangeMode: false,
  currentArea: 'focus',
  
  setCards: (cards) => set({ cards }),
  
  setCurrentCard: (card) => set({ currentCard: card }),
  
  toggleArrangeMode: () => set((state) => ({ arrangeMode: !state.arrangeMode })),
  
  setCurrentArea: (area) => set({ currentArea: area }),
  
  updateCardPosition: (cardId, newPosition) => {
    const { cards } = get();
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, position: newPosition } : card
    ).sort((a, b) => a.position - b.position);
    set({ cards: updatedCards });
  }
}));