import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PowerStatement } from '../types';
import { supabase } from '../services/supabase';

interface PowerStatementsStore {
  statements: PowerStatement[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSync: string | null;
  
  // Core CRUD operations
  fetchStatements: (category?: string) => Promise<void>;
  createStatement: (data: { statement: string; category?: string; strength_rating?: number }) => Promise<void>;
  updateStatement: (id: string, data: Partial<PowerStatement>) => Promise<void>;
  deleteStatement: (id: string) => Promise<void>;
  
  // Statement-specific operations
  affirmStatement: (id: string) => Promise<void>;
  updateStrengthRating: (id: string, rating: number) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  
  // Batch operations
  getStatementsByCategory: (category: string) => PowerStatement[];
  getActiveStatements: () => PowerStatement[];
  getMostAffirmed: () => PowerStatement[];
  
  // Optimistic updates
  createStatementOptimistic: (data: { statement: string; category?: string; strength_rating?: number }) => string;
  updateStatementOptimistic: (id: string, data: Partial<PowerStatement>) => void;
  deleteStatementOptimistic: (id: string) => void;
  rollbackOptimisticUpdate: (id: string, originalStatement?: PowerStatement | null) => void;
  
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

export const usePowerStatementsStore = create<PowerStatementsStore>()(
  devtools(
    (set, get) => ({
      // State
      statements: [],
      loading: false,
      error: null,
      isOnline: navigator.onLine,
      lastSync: null,

      // Core CRUD operations
      fetchStatements: async (category) => {
        set({ loading: true, error: null });
        try {
          let query = supabase
            .from('power_statements')
            .select('*')
            .order('created_at', { ascending: false });

          if (category) {
            query = query.eq('category', category);
          }

          const { data: statements, error } = await query;

          if (error) throw error;

          set({ 
            statements: statements || [], 
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

      createStatement: async (data) => {
        const { isOnline } = get();
        
        // Create optimistic update first
        const tempId = get().createStatementOptimistic(data);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { data: newStatement, error } = await supabase
            .from('power_statements')
            .insert({
              statement: data.statement,
              category: data.category || 'general',
              strength_rating: data.strength_rating || 5.0,
              affirmation_count: 0,
              is_active: true
            })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic statement with real statement
          set(state => ({
            statements: state.statements.map(s => s.id === tempId ? newStatement : s),
            error: null
          }));
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(tempId);
        }
      },

      updateStatement: async (id, data) => {
        const { isOnline, statements } = get();
        const originalStatement = statements.find(s => s.id === id);
        
        // Apply optimistic update
        get().updateStatementOptimistic(id, data);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { data: updatedStatement, error } = await supabase
            .from('power_statements')
            .update(data)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          // Update with server response
          set(state => ({
            statements: state.statements.map(s => s.id === id ? updatedStatement : s),
            error: null
          }));
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(id, originalStatement);
        }
      },

      deleteStatement: async (id) => {
        const { isOnline, statements } = get();
        const originalStatement = statements.find(s => s.id === id);
        
        // Apply optimistic update
        get().deleteStatementOptimistic(id);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { error } = await supabase
            .from('power_statements')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set({ error: null });
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(id, originalStatement);
        }
      },

      // Statement-specific operations
      affirmStatement: async (id) => {
        const statement = get().statements.find(s => s.id === id);
        if (!statement) return;

        await get().updateStatement(id, {
          affirmation_count: statement.affirmation_count + 1,
          last_affirmed: new Date().toISOString()
        });
      },

      updateStrengthRating: async (id, rating) => {
        await get().updateStatement(id, { strength_rating: rating });
      },

      toggleActive: async (id) => {
        const statement = get().statements.find(s => s.id === id);
        if (!statement) return;

        await get().updateStatement(id, { is_active: !statement.is_active });
      },

      // Batch operations
      getStatementsByCategory: (category) => {
        return get().statements.filter(s => s.category === category);
      },

      getActiveStatements: () => {
        return get().statements.filter(s => s.is_active);
      },

      getMostAffirmed: () => {
        return [...get().statements]
          .sort((a, b) => b.affirmation_count - a.affirmation_count)
          .slice(0, 10);
      },

      // Optimistic updates
      createStatementOptimistic: (data) => {
        const tempId = generateTempId();
        const newStatement: PowerStatement = {
          id: tempId,
          statement: data.statement,
          category: data.category || 'general',
          strength_rating: data.strength_rating || 5.0,
          affirmation_count: 0,
          is_active: true,
          user_id: 'temp-user',
          created_at: new Date().toISOString()
        };
        
        set(state => ({
          statements: [newStatement, ...state.statements],
          error: null
        }));
        
        return tempId;
      },

      updateStatementOptimistic: (id, data) => {
        set(state => ({
          statements: state.statements.map(s => s.id === id ? { ...s, ...data } : s),
          error: null
        }));
      },

      deleteStatementOptimistic: (id) => {
        set(state => ({
          statements: state.statements.filter(s => s.id !== id),
          error: null
        }));
      },

      rollbackOptimisticUpdate: (id, originalStatement) => {
        if (originalStatement) {
          // Restore original statement
          set(state => ({
            statements: state.statements.map(s => s.id === id ? originalStatement : s)
          }));
        } else {
          // Remove optimistic statement that failed to create
          set(state => ({
            statements: state.statements.filter(s => s.id !== id)
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
          // Refresh all statements to ensure we have the latest data
          await get().fetchStatements();
        } catch (error) {
          console.error('Sync failed:', error);
        }
      }
    }),
    {
      name: 'power-statements-store'
    }
  )
);

// Set up online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    usePowerStatementsStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    usePowerStatementsStore.getState().setOnlineStatus(false);
  });

}