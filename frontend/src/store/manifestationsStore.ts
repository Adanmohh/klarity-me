import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Manifestation } from '../types';

interface ManifestationsStore {
  manifestations: Manifestation[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  fetchManifestations: () => Promise<void>;
  createManifestation: (manifestation: Omit<Manifestation, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateManifestation: (id: string, updates: Partial<Manifestation>) => Promise<void>;
  deleteManifestation: (id: string) => Promise<void>;
  
  // Specific operations
  achieveManifestation: (id: string, achievement_notes?: string) => Promise<void>;
  updateEnergyLevel: (id: string, level: number) => Promise<void>;
  updateBeliefLevel: (id: string, level: number) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

const initialState = {
  manifestations: [],
  loading: false,
  error: null
};

export const useManifestationsStore = create<ManifestationsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchManifestations: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement manifestations API
          const manifestations: Manifestation[] = [];
          set({ manifestations, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch manifestations', 
            loading: false 
          });
        }
      },

      createManifestation: async (manifestationData) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement manifestations API
          const newManifestation: Manifestation = {
            ...manifestationData,
            id: `manifestation_${Date.now()}`,
            user_id: 'current_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          set(state => ({
            manifestations: [...state.manifestations, newManifestation],
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to create manifestation', 
            loading: false 
          });
          throw error;
        }
      },

      updateManifestation: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement manifestations API
          set(state => ({
            manifestations: state.manifestations.map(m => 
              m.id === id 
                ? { ...m, ...updates, updated_at: new Date().toISOString() }
                : m
            ),
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update manifestation', 
            loading: false 
          });
          throw error;
        }
      },

      deleteManifestation: async (id) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement manifestations API
          set(state => ({
            manifestations: state.manifestations.filter(m => m.id !== id),
            loading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to delete manifestation', 
            loading: false 
          });
          throw error;
        }
      },

      achieveManifestation: async (id, achievement_notes) => {
        await get().updateManifestation(id, {
          achieved: true,
          achieved_at: new Date().toISOString(),
          achievement_notes
        });
      },

      updateEnergyLevel: async (id, level) => {
        await get().updateManifestation(id, { energy_level: level });
      },

      updateBeliefLevel: async (id, level) => {
        await get().updateManifestation(id, { belief_level: level });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'ManifestationsStore'
    }
  )
);