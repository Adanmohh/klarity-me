import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Manifestation } from '../types';
import { api } from '../services/api';

interface ManifestationsStore {
  manifestations: Manifestation[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSync: string | null;
  
  // Core CRUD operations
  fetchManifestations: () => Promise<void>;
  createManifestation: (data: { 
    title: string; 
    description?: string; 
    visualization_notes?: string;
    target_date?: string;
    energy_level?: number;
    belief_level?: number;
    tags?: string[];
  }) => Promise<void>;
  updateManifestation: (id: string, data: Partial<Manifestation>) => Promise<void>;
  deleteManifestation: (id: string) => Promise<void>;
  
  // Manifestation-specific operations
  achieveManifestation: (id: string, achievement_notes?: string) => Promise<void>;
  updateEnergyLevel: (id: string, level: number) => Promise<void>;
  updateBeliefLevel: (id: string, level: number) => Promise<void>;
  addTag: (id: string, tag: string) => Promise<void>;
  removeTag: (id: string, tag: string) => Promise<void>;
  
  // Filtering and sorting
  getActiveManifestations: () => Manifestation[];
  getAchievedManifestations: () => Manifestation[];
  getManifestationsByTag: (tag: string) => Manifestation[];
  getUpcomingDeadlines: (days?: number) => Manifestation[];
  getHighEnergyManifestations: () => Manifestation[];
  
  // Optimistic updates
  createManifestationOptimistic: (data: { 
    title: string; 
    description?: string; 
    visualization_notes?: string;
    target_date?: string;
    energy_level?: number;
    belief_level?: number;
    tags?: string[];
  }) => string;
  updateManifestationOptimistic: (id: string, data: Partial<Manifestation>) => void;
  deleteManifestationOptimistic: (id: string) => void;
  rollbackOptimisticUpdate: (id: string, originalManifestation?: Manifestation | null) => void;
  
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

export const useManifestationsStore = create<ManifestationsStore>()(
  devtools(
    (set, get) => ({
      // State
      manifestations: [],
      loading: false,
      error: null,
      isOnline: navigator.onLine,
      lastSync: null,

      // Core CRUD operations
      fetchManifestations: async () => {
        set({ loading: true, error: null });
        try {
          const { data: manifestations, error } = await supabase
            .from('manifestations')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ 
            manifestations: manifestations || [], 
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

      createManifestation: async (data) => {
        const { isOnline } = get();
        
        // Create optimistic update first
        const tempId = get().createManifestationOptimistic(data);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { data: newManifestation, error } = await supabase
            .from('manifestations')
            .insert({
              title: data.title,
              description: data.description,
              visualization_notes: data.visualization_notes,
              target_date: data.target_date,
              energy_level: data.energy_level || 5,
              belief_level: data.belief_level || 5,
              tags: data.tags || [],
              achieved: false
            })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic manifestation with real manifestation
          set(state => ({
            manifestations: state.manifestations.map(m => m.id === tempId ? newManifestation : m),
            error: null
          }));
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(tempId);
        }
      },

      updateManifestation: async (id, data) => {
        const { isOnline, manifestations } = get();
        const originalManifestation = manifestations.find(m => m.id === id);
        
        // Apply optimistic update
        get().updateManifestationOptimistic(id, data);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { data: updatedManifestation, error } = await supabase
            .from('manifestations')
            .update(data)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          // Update with server response
          set(state => ({
            manifestations: state.manifestations.map(m => m.id === id ? updatedManifestation : m),
            error: null
          }));
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(id, originalManifestation);
        }
      },

      deleteManifestation: async (id) => {
        const { isOnline, manifestations } = get();
        const originalManifestation = manifestations.find(m => m.id === id);
        
        // Apply optimistic update
        get().deleteManifestationOptimistic(id);
        
        if (!isOnline) {
          return; // Will sync when back online
        }

        try {
          const { error } = await supabase
            .from('manifestations')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set({ error: null });
        } catch (error) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage });
          
          // Rollback optimistic update on error
          get().rollbackOptimisticUpdate(id, originalManifestation);
        }
      },

      // Manifestation-specific operations
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

      addTag: async (id, tag) => {
        const manifestation = get().manifestations.find(m => m.id === id);
        if (!manifestation) return;

        const newTags = [...manifestation.tags];
        if (!newTags.includes(tag)) {
          newTags.push(tag);
          await get().updateManifestation(id, { tags: newTags });
        }
      },

      removeTag: async (id, tag) => {
        const manifestation = get().manifestations.find(m => m.id === id);
        if (!manifestation) return;

        const newTags = manifestation.tags.filter(t => t !== tag);
        await get().updateManifestation(id, { tags: newTags });
      },

      // Filtering and sorting
      getActiveManifestations: () => {
        return get().manifestations.filter(m => !m.achieved);
      },

      getAchievedManifestations: () => {
        return get().manifestations.filter(m => m.achieved);
      },

      getManifestationsByTag: (tag) => {
        return get().manifestations.filter(m => m.tags.includes(tag));
      },

      getUpcomingDeadlines: (days = 30) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);
        
        return get().manifestations.filter(m => {
          if (!m.target_date || m.achieved) return false;
          const targetDate = new Date(m.target_date);
          return targetDate <= cutoffDate && targetDate >= new Date();
        }).sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime());
      },

      getHighEnergyManifestations: () => {
        return get().manifestations
          .filter(m => !m.achieved && m.energy_level >= 8)
          .sort((a, b) => b.energy_level - a.energy_level);
      },

      // Optimistic updates
      createManifestationOptimistic: (data) => {
        const tempId = generateTempId();
        const newManifestation: Manifestation = {
          id: tempId,
          title: data.title,
          description: data.description,
          visualization_notes: data.visualization_notes,
          target_date: data.target_date,
          energy_level: data.energy_level || 5,
          belief_level: data.belief_level || 5,
          tags: data.tags || [],
          achieved: false,
          user_id: 'temp-user',
          created_at: new Date().toISOString()
        };
        
        set(state => ({
          manifestations: [newManifestation, ...state.manifestations],
          error: null
        }));
        
        return tempId;
      },

      updateManifestationOptimistic: (id, data) => {
        set(state => ({
          manifestations: state.manifestations.map(m => m.id === id ? { ...m, ...data } : m),
          error: null
        }));
      },

      deleteManifestationOptimistic: (id) => {
        set(state => ({
          manifestations: state.manifestations.filter(m => m.id !== id),
          error: null
        }));
      },

      rollbackOptimisticUpdate: (id, originalManifestation) => {
        if (originalManifestation) {
          // Restore original manifestation
          set(state => ({
            manifestations: state.manifestations.map(m => m.id === id ? originalManifestation : m)
          }));
        } else {
          // Remove optimistic manifestation that failed to create
          set(state => ({
            manifestations: state.manifestations.filter(m => m.id !== id)
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
          // Refresh all manifestations to ensure we have the latest data
          await get().fetchManifestations();
        } catch (error) {
          console.error('Sync failed:', error);
        }
      }
    }),
    {
      name: 'manifestations-store'
    }
  )
);

// Set up online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useManifestationsStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useManifestationsStore.getState().setOnlineStatus(false);
  });

}