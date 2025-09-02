import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PowerStatement } from '../types';

interface PowerStatementsStore {
  statements: PowerStatement[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  fetchStatements: () => Promise<void>;
  createStatement: (statement: Omit<PowerStatement, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateStatement: (id: string, updates: Partial<PowerStatement>) => Promise<void>;
  deleteStatement: (id: string) => Promise<void>;
  
  // Affirmation operations
  affirmStatement: (id: string) => Promise<void>;
  updateStrengthRating: (id: string, rating: number) => Promise<void>;
  toggleActiveStatus: (id: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

const initialState = {
  statements: [],
  loading: false,
  error: null
};

export const usePowerStatementsStore = create<PowerStatementsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchStatements: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement power statements API
          const statements: PowerStatement[] = [];
          set({ statements, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch power statements', 
            loading: false 
          });
        }
      },

      createStatement: async (statementData) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement power statements API
          const newStatement: PowerStatement = {
            ...statementData,
            id: `statement_${Date.now()}`,
            user_id: 'current_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          set(state => ({
            statements: [...state.statements, newStatement],
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to create power statement', 
            loading: false 
          });
          throw error;
        }
      },

      updateStatement: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement power statements API
          set(state => ({
            statements: state.statements.map(s => 
              s.id === id 
                ? { ...s, ...updates, updated_at: new Date().toISOString() }
                : s
            ),
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update power statement', 
            loading: false 
          });
          throw error;
        }
      },

      deleteStatement: async (id) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement power statements API
          set(state => ({
            statements: state.statements.filter(s => s.id !== id),
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to delete power statement', 
            loading: false 
          });
          throw error;
        }
      },

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

      toggleActiveStatus: async (id) => {
        const statement = get().statements.find(s => s.id === id);
        if (!statement) return;
        
        await get().updateStatement(id, { is_active: !statement.is_active });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'PowerStatementsStore'
    }
  )
);