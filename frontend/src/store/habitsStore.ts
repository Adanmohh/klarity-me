import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Habit, HabitCheckin, HabitLane } from '../types';
import { habitsAPI } from '../services/api';

interface HabitsStore {
  habits: Habit[];
  checkins: HabitCheckin[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  fetchHabits: () => Promise<void>;
  createHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  
  // Checkin operations
  checkIn: (habitId: string, date?: string) => Promise<void>;
  uncheckIn: (habitId: string, date: string) => Promise<void>;
  fetchCheckins: (habitId?: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

const initialState = {
  habits: [],
  checkins: [],
  loading: false,
  error: null
};

export const useHabitsStore = create<HabitsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchHabits: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement habits API
          const habits: Habit[] = [];
          set({ habits, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch habits', 
            loading: false 
          });
        }
      },

      createHabit: async (habitData) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement habits API
          const newHabit: Habit = {
            ...habitData,
            id: `habit_${Date.now()}`,
            user_id: 'current_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          set(state => ({
            habits: [...state.habits, newHabit],
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to create habit', 
            loading: false 
          });
          throw error;
        }
      },

      updateHabit: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement habits API
          set(state => ({
            habits: state.habits.map(h => 
              h.id === id 
                ? { ...h, ...updates, updated_at: new Date().toISOString() }
                : h
            ),
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update habit', 
            loading: false 
          });
          throw error;
        }
      },

      deleteHabit: async (id) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement habits API
          set(state => ({
            habits: state.habits.filter(h => h.id !== id),
            checkins: state.checkins.filter(c => c.habit_id !== id),
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to delete habit', 
            loading: false 
          });
          throw error;
        }
      },

      checkIn: async (habitId, date) => {
        const checkDate = date || new Date().toISOString().split('T')[0];
        set({ loading: true, error: null });
        
        try {
          // TODO: Implement habits API
          const newCheckin: HabitCheckin = {
            id: `checkin_${Date.now()}`,
            user_id: 'temp_user',
            habit_id: habitId,
            checkin_date: checkDate,
            created_at: new Date().toISOString()
          };
          
          set(state => ({
            checkins: [...state.checkins, newCheckin],
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to check in', 
            loading: false 
          });
          throw error;
        }
      },

      uncheckIn: async (habitId, date) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement habits API
          set(state => ({
            checkins: state.checkins.filter(
              c => !(c.habit_id === habitId && c.checkin_date === date)
            ),
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to uncheck', 
            loading: false 
          });
          throw error;
        }
      },

      fetchCheckins: async (habitId?) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement habits API
          const checkins: HabitCheckin[] = [];
          set({ checkins, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch checkins', 
            loading: false 
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'HabitsStore'
    }
  )
);