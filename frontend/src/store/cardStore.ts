import { create } from 'zustand';
import { Card } from '../types';
import { cardsAPI } from '../services/api';

interface CardStore {
  cards: Card[];
  loading: boolean;
  error: string | null;
  fetchCards: () => Promise<void>;
  createCard: (data: { title: string; description?: string }) => Promise<void>;
  updateCard: (id: string, data: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  loading: false,
  error: null,

  fetchCards: async () => {
    set({ loading: true, error: null });
    try {
      const cards = await cardsAPI.getCards();
      set({ cards, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createCard: async (data) => {
    try {
      const newCard = await cardsAPI.createCard(data);
      set(state => ({ cards: [...state.cards, newCard] }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateCard: async (id, data) => {
    try {
      const updated = await cardsAPI.updateCard(id, data);
      set(state => ({
        cards: state.cards.map(c => c.id === id ? updated : c)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteCard: async (id) => {
    try {
      await cardsAPI.deleteCard(id);
      set(state => ({
        cards: state.cards.filter(c => c.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));