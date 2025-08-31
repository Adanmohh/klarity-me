import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { DailyTask, DailyTaskLane, DailyTaskStatus, TaskDuration } from '../types';
import { supabase } from '../services/supabase';

// Types for API responses and errors
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface PendingSync {
  id: string;
  action: 'create' | 'update' | 'delete';
  data?: Partial<DailyTask>;
  timestamp: string;
}

interface DailyTaskState {
  tasks: DailyTask[];
  loading: boolean;
  error: ApiError | null;
  isOnline: boolean;
  lastSync: string | null;
  pendingSyncs: PendingSync[];
}

interface DailyTaskActions {
  // Core CRUD operations
  fetchTasks: () => Promise<void>;
  createTask: (data: { title: string; description?: string; lane: DailyTaskLane; duration?: TaskDuration }) => Promise<void>;
  updateTask: (id: string, data: Partial<DailyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Convenience methods
  moveTask: (id: string, toLane: DailyTaskLane, duration?: TaskDuration) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  reopenTask: (id: string) => Promise<void>;
  moveToMain: (id: string, duration?: TaskDuration) => Promise<void>;
  moveToController: (id: string) => Promise<void>;
  
  // Optimistic updates
  createTaskOptimistic: (data: { title: string; description?: string; lane: DailyTaskLane; duration?: TaskDuration }) => string;
  updateTaskOptimistic: (id: string, data: Partial<DailyTask>) => void;
  deleteTaskOptimistic: (id: string) => void;
  rollbackOptimisticUpdate: (id: string, originalTask?: DailyTask | null) => void;
  
  // Offline support
  addPendingSync: (sync: Omit<PendingSync, 'timestamp'>) => void;
  removePendingSync: (id: string) => void;
  processPendingSyncs: () => Promise<void>;
  
  // State management
  clearError: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  syncWithServer: () => Promise<void>;
}

type DailyTaskStore = DailyTaskState & DailyTaskActions;

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any): ApiError => {
  if (error?.message) {
    return { message: error.message };
  }
  if (error?.error_description) {
    return { message: error.error_description };
  }
  return { message: 'An unexpected error occurred' };
};

// Helper function to generate local IDs for offline tasks
const generateLocalId = () => `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useDailyTaskStore = create<DailyTaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        tasks: [],
        loading: false,
        error: null,
        isOnline: navigator.onLine,
        lastSync: null,
        pendingSyncs: [],

        // Core CRUD operations
        fetchTasks: async () => {
          set({ loading: true, error: null });
          try {
            const { data: tasks, error } = await supabase
              .from('daily_tasks')
              .select('*')
              .order('position', { ascending: true });

            if (error) throw error;

            set({ 
              tasks: tasks || [], 
              loading: false, 
              lastSync: new Date().toISOString(),
              error: null 
            });
          } catch (error) {
            const apiError = handleSupabaseError(error);
            set({ error: apiError, loading: false });
            
            // If offline, don't show error - use cached data
            if (!navigator.onLine) {
              set({ error: null, isOnline: false });
            }
          }
        },

        createTask: async (data) => {
          const { isOnline } = get();
          
          // Create optimistic update first
          const tempId = get().createTaskOptimistic(data);
          
          if (!isOnline) {
            // Add to pending syncs
            get().addPendingSync({
              id: tempId,
              action: 'create',
              data
            });
            return;
          }

          try {
            const { data: newTask, error } = await supabase
              .from('daily_tasks')
              .insert({
                title: data.title,
                description: data.description,
                lane: data.lane,
                duration: data.duration,
                position: get().tasks.length,
                status: 'pending'
              })
              .select()
              .single();

            if (error) throw error;

            // Replace optimistic task with real task
            set(state => ({
              tasks: state.tasks.map(t => t.id === tempId ? newTask : t),
              error: null
            }));
          } catch (error) {
            const apiError = handleSupabaseError(error);
            set({ error: apiError });
            
            // Add to pending syncs for retry
            get().addPendingSync({
              id: tempId,
              action: 'create',
              data
            });
          }
        },

        updateTask: async (id, data) => {
          const { isOnline, tasks } = get();
          const originalTask = tasks.find(t => t.id === id);
          
          // Apply optimistic update
          get().updateTaskOptimistic(id, data);
          
          if (!isOnline) {
            // Add to pending syncs
            get().addPendingSync({
              id,
              action: 'update',
              data
            });
            return;
          }

          try {
            const { data: updatedTask, error } = await supabase
              .from('daily_tasks')
              .update(data)
              .eq('id', id)
              .select()
              .single();

            if (error) throw error;

            // Update with server response
            set(state => ({
              tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
              error: null
            }));
          } catch (error) {
            const apiError = handleSupabaseError(error);
            set({ error: apiError });
            
            // Add to pending syncs for retry
            get().addPendingSync({
              id,
              action: 'update',
              data
            });
            
            // Rollback optimistic update on error
            get().rollbackOptimisticUpdate(id, originalTask);
          }
        },

        deleteTask: async (id) => {
          const { isOnline, tasks } = get();
          const originalTask = tasks.find(t => t.id === id);
          
          // Apply optimistic update
          get().deleteTaskOptimistic(id);
          
          if (!isOnline) {
            // Add to pending syncs
            get().addPendingSync({
              id,
              action: 'delete'
            });
            return;
          }

          try {
            const { error } = await supabase
              .from('daily_tasks')
              .delete()
              .eq('id', id);

            if (error) throw error;

            set({ error: null });
          } catch (error) {
            const apiError = handleSupabaseError(error);
            set({ error: apiError });
            
            // Add to pending syncs for retry
            get().addPendingSync({
              id,
              action: 'delete'
            });
            
            // Rollback optimistic update on error
            get().rollbackOptimisticUpdate(id, originalTask);
          }
        },

        // Convenience methods
        moveTask: async (id, toLane, duration) => {
          await get().updateTask(id, { lane: toLane, duration });
        },

        completeTask: async (id) => {
          await get().updateTask(id, { 
            status: DailyTaskStatus.COMPLETED, 
            completed_at: new Date().toISOString() 
          });
        },

        reopenTask: async (id) => {
          await get().updateTask(id, { 
            status: DailyTaskStatus.PENDING, 
            completed_at: undefined 
          });
        },

        moveToMain: async (id, duration) => {
          await get().updateTask(id, { lane: DailyTaskLane.MAIN, duration });
        },

        moveToController: async (id) => {
          await get().updateTask(id, { lane: DailyTaskLane.CONTROLLER, duration: undefined });
        },

        // Optimistic updates
        createTaskOptimistic: (data) => {
          const tempId = generateLocalId();
          const newTask: DailyTask = {
            id: tempId,
            title: data.title,
            description: data.description,
            lane: data.lane,
            duration: data.duration,
            status: DailyTaskStatus.PENDING,
            position: get().tasks.length,
            user_id: 'temp-user',
            created_at: new Date().toISOString()
          };
          
          set(state => ({ 
            tasks: [...state.tasks, newTask],
            error: null
          }));
          
          return tempId;
        },

        updateTaskOptimistic: (id, data) => {
          set(state => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, ...data } : t),
            error: null
          }));
        },

        deleteTaskOptimistic: (id) => {
          set(state => ({
            tasks: state.tasks.filter(t => t.id !== id),
            error: null
          }));
        },

        rollbackOptimisticUpdate: (id, originalTask) => {
          if (originalTask) {
            // Restore original task
            set(state => ({
              tasks: state.tasks.map(t => t.id === id ? originalTask : t)
            }));
          } else {
            // Remove optimistic task that failed to create
            set(state => ({
              tasks: state.tasks.filter(t => t.id !== id)
            }));
          }
        },

        // Offline support
        addPendingSync: (sync) => {
          set(state => ({
            pendingSyncs: [...state.pendingSyncs, {
              ...sync,
              timestamp: new Date().toISOString()
            }]
          }));
        },

        removePendingSync: (id) => {
          set(state => ({
            pendingSyncs: state.pendingSyncs.filter(sync => sync.id !== id)
          }));
        },

        processPendingSyncs: async () => {
          const { pendingSyncs, isOnline } = get();
          if (!isOnline || pendingSyncs.length === 0) return;

          // Process syncs in chronological order
          const sortedSyncs = [...pendingSyncs].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          for (const sync of sortedSyncs) {
            try {
              switch (sync.action) {
                case 'create':
                  if (sync.data) {
                    const { data: newTask, error } = await supabase
                      .from('daily_tasks')
                      .insert({
                        title: sync.data.title,
                        description: sync.data.description,
                        lane: sync.data.lane,
                        duration: sync.data.duration,
                        position: get().tasks.length,
                        status: 'pending'
                      })
                      .select()
                      .single();

                    if (error) throw error;

                    // Replace temp task with real task
                    set(state => ({
                      tasks: state.tasks.map(t => t.id === sync.id ? newTask : t)
                    }));
                  }
                  break;

                case 'update':
                  if (sync.data) {
                    const { error } = await supabase
                      .from('daily_tasks')
                      .update(sync.data)
                      .eq('id', sync.id);

                    if (error) throw error;
                  }
                  break;

                case 'delete':
                  const { error } = await supabase
                    .from('daily_tasks')
                    .delete()
                    .eq('id', sync.id);

                  if (error) throw error;
                  break;
              }

              // Remove successfully processed sync
              get().removePendingSync(sync.id);
            } catch (error) {
              console.warn(`Failed to sync ${sync.action} for task ${sync.id}:`, error);
              // Keep the sync for retry later
            }
          }
        },

        // State management
        clearError: () => {
          set({ error: null });
        },

        setOnlineStatus: (isOnline) => {
          set({ isOnline });
          if (isOnline) {
            // Process pending syncs and sync when coming back online
            get().processPendingSyncs();
            get().syncWithServer();
          }
        },

        syncWithServer: async () => {
          const { isOnline } = get();
          if (!isOnline) return;

          try {
            // Process any pending syncs first
            await get().processPendingSyncs();
            
            // Then refresh all tasks to ensure we have the latest data
            await get().fetchTasks();
          } catch (error) {
            console.error('Sync failed:', error);
          }
        }
      }),
      {
        name: 'daily-task-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          tasks: state.tasks,
          lastSync: state.lastSync,
          pendingSyncs: state.pendingSyncs
        })
      }
    ),
    {
      name: 'daily-task-store'
    }
  )
);

// Set up online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useDailyTaskStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useDailyTaskStore.getState().setOnlineStatus(false);
  });

  // Realtime disabled - using backend API
  // setTimeout(() => {
  //   useDailyTaskStore.getState().subscribeToRealtime();
  // }, 100);
}

// Realtime disabled - using backend API
// if (typeof window !== 'undefined') {
//   window.addEventListener('beforeunload', () => {
//     useDailyTaskStore.getState().unsubscribeFromRealtime();
//   });
// }