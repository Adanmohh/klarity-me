import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Habit, HabitCheckin, HabitLane } from '../types';
import { supabase } from '../services/supabase';

interface HabitsStore {
  habits: Habit[];
  checkins: HabitCheckin[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSync: string | null;
  
  // Core CRUD operations for habits
  fetchHabits: (lane?: HabitLane) => Promise<void>;
  createHabit: (data: { title: string; description?: string; lane: HabitLane; target_frequency?: number }) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  graduateHabit: (id: string, graduation_data?: any) => Promise<void>;
  
  // Check-in operations
  fetchCheckins: (habitId: string) => Promise<void>;
  createCheckin: (habitId: string, data: { notes?: string; mood_rating?: number }) => Promise<void>;
  deleteCheckin: (id: string) => Promise<void>;
  
  // Streak and stats
  updateStreaks: (habitId: string) => Promise<void>;
  getHabitStats: (habitId: string) => { current_streak: number; best_streak: number; total_completions: number };
  
  // Optimistic updates
  createHabitOptimistic: (data: { title: string; description?: string; lane: HabitLane; target_frequency?: number }) => string;
  updateHabitOptimistic: (id: string, data: Partial<Habit>) => void;
  deleteHabitOptimistic: (id: string) => void;
  rollbackOptimisticUpdate: (id: string, originalHabit?: Habit | null) => void;
  
  // State management
  clearError: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  syncWithServer: () => Promise<void>;
}

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.error_description) {
    return error.error_description;
  }
  return 'An unexpected error occurred';
};

// Helper function to generate temporary IDs for optimistic updates
const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useHabitsStore = create<HabitsStore>()(
  devtools(
    (set, get) => ({
      // State
      habits: [],
      checkins: [],
      loading: false,
      error: null,
      isOnline: navigator.onLine,
      lastSync: null,

      // Core CRUD operations for habits
      fetchHabits: async (lane) => {
        set({ loading: true, error: null });
        try {
          let query = supabase
            .from('habits')
            .select('*')
            .order('created_at', { ascending: false });

          if (lane) {
            query = query.eq('lane', lane);
          }

          const { data: habits, error } = await query;

          if (error) throw error;

          set({ 
            habits: habits || [], 
            loading: false, 
            lastSync: new Date().toISOString(),
            error: null 
          });
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage, loading: false });
          
          // If offline, don't show error - use cached data
          if (!navigator.onLine) {
            set({ error: null, isOnline: false });
          }
        }
      },

      createHabit: async (data) => {
        const { isOnline } = get();
        
        // Create optimistic update first
        const tempId = get().createHabitOptimistic(data);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { data: newHabit, error } = await supabase
            .from('habits')
            .insert({
              title: data.title,
              description: data.description,
              lane: data.lane,
              target_frequency: data.target_frequency || 1,
              current_streak: 0,
              best_streak: 0,
              total_completions: 0,
              is_active: true
            })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic habit with real habit
          set(state => ({
            habits: state.habits.map(h => h.id === tempId ? newHabit : h),
            error: null
          }));
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(tempId);
        }
      },

      updateHabit: async (id, data) => {
        const { isOnline, habits } = get();
        const originalHabit = habits.find(h => h.id === id);
        
        // Apply optimistic update
        get().updateHabitOptimistic(id, data);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { data: updatedHabit, error } = await supabase
            .from('habits')
            .update(data)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          // Update with server response
          set(state => ({
            habits: state.habits.map(h => h.id === id ? updatedHabit : h),
            error: null
          }));
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(id, originalHabit);
        }
      },

      deleteHabit: async (id) => {
        const { isOnline, habits } = get();
        const originalHabit = habits.find(h => h.id === id);
        
        // Apply optimistic update
        get().deleteHabitOptimistic(id);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set({ error: null });
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(id, originalHabit);
        }
      },

      graduateHabit: async (id, graduation_data) => {
        await get().updateHabit(id, {
          lane: HabitLane.I_AM,
          graduated_at: new Date().toISOString(),
          graduation_criteria: graduation_data
        });
      },

      // Check-in operations
      fetchCheckins: async (habitId) => {
        try {
          const { data: checkins, error } = await supabase
            .from('habit_checkins')
            .select('*')
            .eq('habit_id', habitId)
            .order('checkin_date', { ascending: false });

          if (error) throw error;

          set({ checkins: checkins || [] });
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
        }
      },

      createCheckin: async (habitId, data) => {
        try {
          const { data: newCheckin, error } = await supabase
            .from('habit_checkins')
            .insert({
              habit_id: habitId,
              checkin_date: new Date().toISOString().split('T')[0], // Today's date
              notes: data.notes,
              mood_rating: data.mood_rating
            })
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            checkins: [newCheckin, ...state.checkins],
            error: null
          }));

          // Update habit streaks
          await get().updateStreaks(habitId);
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
        }
      },

      deleteCheckin: async (id) => {
        try {
          const checkin = get().checkins.find(c => c.id === id);
          
          const { error } = await supabase
            .from('habit_checkins')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            checkins: state.checkins.filter(c => c.id !== id),
            error: null
          }));

          // Update habit streaks if we have the habit_id
          if (checkin) {
            await get().updateStreaks(checkin.habit_id);
          }
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
        }
      },

      // Streak and stats
      updateStreaks: async (habitId) => {
        try {
          // Call the database function to update streaks
          const { error } = await supabase.rpc('update_habit_streak', {
            p_habit_id: habitId
          });

          if (error) throw error;

          // Refresh the habit to get updated stats
          const { data: updatedHabit, error: fetchError } = await supabase
            .from('habits')
            .select('*')
            .eq('id', habitId)
            .single();

          if (fetchError) throw fetchError;

          set(state => ({
            habits: state.habits.map(h => h.id === habitId ? updatedHabit : h),
            error: null
          }));
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
        }
      },

      getHabitStats: (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        return {
          current_streak: habit?.current_streak || 0,
          best_streak: habit?.best_streak || 0,
          total_completions: habit?.total_completions || 0
        };
      },

      // Optimistic updates
      createHabitOptimistic: (data) => {
        const tempId = generateTempId();
        const newHabit: Habit = {
          id: tempId,
          title: data.title,
          description: data.description,
          lane: data.lane,
          target_frequency: data.target_frequency || 1,
          current_streak: 0,
          best_streak: 0,
          total_completions: 0,
          is_active: true,
          user_id: 'temp-user',
          created_at: new Date().toISOString()
        };
        
        set(state => ({
          habits: [newHabit, ...state.habits],
          error: null
        }));
        
        return tempId;
      },

      updateHabitOptimistic: (id, data) => {
        set(state => ({
          habits: state.habits.map(h => h.id === id ? { ...h, ...data } : h),
          error: null
        }));
      },

      deleteHabitOptimistic: (id) => {
        set(state => ({
          habits: state.habits.filter(h => h.id !== id),
          error: null
        }));
      },

      rollbackOptimisticUpdate: (id, originalHabit) => {
        if (originalHabit) {
          // Restore original habit
          set(state => ({
            habits: state.habits.map(h => h.id === id ? originalHabit : h)
          }));
        } else {
          // Remove optimistic habit that failed to create
          set(state => ({
            habits: state.habits.filter(h => h.id !== id)
          }));
        }
      },

      // State management
      clearError: () => {
        set({ error: null });
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        if (isOnline) {
          // Sync when coming back online
          get().syncWithServer();
        }
      },

      syncWithServer: async () => {
        const { isOnline } = get();
        if (!isOnline) return;

        try {
          // Refresh all habits to ensure we have the latest data
          await get().fetchHabits();
        } catch (error) {
          console.error('Sync failed:', error);
        }
      }
    }),
    {
      name: 'habits-store'
    }
  )
);

// Set up online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useHabitsStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useHabitsStore.getState().setOnlineStatus(false);
  });

}