import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { cardsAPI } from '../services/api';
import { Card, CardStatus } from '../types';

// Export Card type from types/index.ts
export type { Card } from '../types';

interface CardStore {
  cards: Card[];
  loading: boolean;
  error: string | null;
  
  fetchCards: () => Promise<void>;
  createCard: (data: Partial<Card>) => Promise<void>;
  updateCard: (id: string, data: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  reorderCards: (startIndex: number, endIndex: number) => Promise<void>;
  clearError: () => void;
}

export const useCardStore = create<CardStore>()(
  devtools(
    (set, get) => ({
      cards: [],
      loading: false,
      error: null,

      fetchCards: async () => {
        set({ loading: true, error: null });
        try {
          const cards = await cardsAPI.getCards();
          set({ cards: cards || [], loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to fetch cards', 
            loading: false 
          });
        }
      },

      createCard: async (data) => {
        try {
          const newCard = await cardsAPI.createCard(data);
          set(state => ({
            cards: [...state.cards, newCard]
          }));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to create card'
          });
        }
      },

      updateCard: async (id, data) => {
        try {
          const updatedCard = await cardsAPI.updateCard(id, data);
          set(state => ({
            cards: state.cards.map(c => c.id === id ? updatedCard : c)
          }));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to update card'
          });
        }
      },

      deleteCard: async (id) => {
        try {
          await cardsAPI.deleteCard(id);
          set(state => ({
            cards: state.cards.filter(c => c.id !== id)
          }));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to delete card'
          });
        }
      },

      reorderCards: async (startIndex, endIndex) => {
        const { cards } = get();
        const result = Array.from(cards);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        // Update positions
        const updatedCards = result.map((card, index) => ({
          ...card,
          position: index
        }));
        
        set({ cards: updatedCards });
        
        // Update positions in backend
        try {
          await Promise.all(
            updatedCards.map(card => 
              cardsAPI.updateCard(card.id, { position: card.position })
            )
          );
        } catch (error: any) {
          // Revert on error
          await get().fetchCards();
          set({ 
            error: error.response?.data?.detail || 'Failed to reorder cards'
          });
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'card-store'
    }
  )
);