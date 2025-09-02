import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { DailyTask, DailyTaskLane, DailyTaskStatus, TaskDuration } from '../types';
import { dailyTasksAPI } from '../services/api';

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
  syncPending: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  
  // Utility
  clearError: () => void;
  resetState: () => void;
}

interface DailyTaskStore extends DailyTaskState, DailyTaskActions {}

const initialState: DailyTaskState = {
  tasks: [],
  loading: false,
  error: null,
  isOnline: navigator.onLine,
  lastSync: null,
  pendingSyncs: []
};

// Utility function for error handling
const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.detail || error.response.data?.message || 'An error occurred',
      status: error.response.status,
      code: error.response.data?.code
    };
  }
  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      status: 0,
      code: 'NETWORK_ERROR'
    };
  }
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

export const useDailyTaskStore = create<DailyTaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        fetchTasks: async () => {
          set({ loading: true, error: null });
          try {
            const tasks = await dailyTasksAPI.getAllTasks();
            set({ 
              tasks: tasks || [], 
              loading: false, 
              lastSync: new Date().toISOString(),
              error: null 
            });
          } catch (error) {
            const apiError = handleApiError(error);
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
            const newTask = await dailyTasksAPI.createTask({
              title: data.title,
              description: data.description,
              lane: data.lane,
              duration: data.duration,
              status: DailyTaskStatus.PENDING,
              position: get().tasks.filter(t => t.lane === data.lane).length
            });

            // Replace optimistic update with real data
            set(state => ({
              tasks: state.tasks.map(t => t.id === tempId ? newTask : t),
              lastSync: new Date().toISOString()
            }));
          } catch (error) {
            // Rollback optimistic update on error
            get().rollbackOptimisticUpdate(tempId);
            const apiError = handleApiError(error);
            set({ error: apiError });
            
            // If it's a network error, add to pending syncs
            if (!navigator.onLine || apiError.code === 'NETWORK_ERROR') {
              get().addPendingSync({
                id: tempId,
                action: 'create',
                data
              });
              set({ isOnline: false });
            }
            throw error;
          }
        },

        updateTask: async (id, data) => {
          const originalTask = get().tasks.find(t => t.id === id);
          if (!originalTask) return;

          // Optimistic update
          get().updateTaskOptimistic(id, data);

          const { isOnline } = get();
          if (!isOnline) {
            get().addPendingSync({
              id,
              action: 'update',
              data
            });
            return;
          }

          try {
            const updatedTask = await dailyTasksAPI.updateTask(id, data);
            
            // Update with server response
            set(state => ({
              tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
              lastSync: new Date().toISOString()
            }));
          } catch (error) {
            // Rollback on error
            get().rollbackOptimisticUpdate(id, originalTask);
            const apiError = handleApiError(error);
            set({ error: apiError });
            
            // If it's a network error, add to pending syncs
            if (!navigator.onLine || apiError.code === 'NETWORK_ERROR') {
              get().addPendingSync({
                id,
                action: 'update',
                data
              });
              set({ isOnline: false });
            }
            throw error;
          }
        },

        deleteTask: async (id) => {
          const originalTask = get().tasks.find(t => t.id === id);
          if (!originalTask) return;

          // Optimistic delete
          get().deleteTaskOptimistic(id);

          const { isOnline } = get();
          if (!isOnline) {
            get().addPendingSync({
              id,
              action: 'delete'
            });
            return;
          }

          try {
            await dailyTasksAPI.deleteTask(id);
            set({ lastSync: new Date().toISOString() });
          } catch (error) {
            // Rollback on error
            get().rollbackOptimisticUpdate(id, originalTask);
            const apiError = handleApiError(error);
            set({ error: apiError });
            
            // If it's a network error, add to pending syncs
            if (!navigator.onLine || apiError.code === 'NETWORK_ERROR') {
              get().addPendingSync({
                id,
                action: 'delete'
              });
              set({ isOnline: false });
            }
            throw error;
          }
        },

        moveTask: async (id, toLane, duration) => {
          const task = get().tasks.find(t => t.id === id);
          if (!task) return;

          const updates: Partial<DailyTask> = { lane: toLane };
          if (toLane === DailyTaskLane.MAIN && duration) {
            updates.duration = duration;
          } else if (toLane === DailyTaskLane.CONTROLLER) {
            updates.duration = undefined;
          }

          await get().updateTask(id, updates);
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
          await get().moveTask(id, DailyTaskLane.MAIN, duration);
        },

        moveToController: async (id) => {
          await get().moveTask(id, DailyTaskLane.CONTROLLER);
        },

        createTaskOptimistic: (data) => {
          const tempId = `temp_${Date.now()}_${Math.random()}`;
          const newTask: DailyTask = {
            id: tempId,
            user_id: 'temp_user',
            title: data.title,
            description: data.description,
            lane: data.lane,
            duration: data.duration,
            status: DailyTaskStatus.PENDING,
            position: get().tasks.filter(t => t.lane === data.lane).length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          set(state => ({
            tasks: [...state.tasks, newTask]
          }));

          return tempId;
        },

        updateTaskOptimistic: (id, data) => {
          set(state => ({
            tasks: state.tasks.map(t => 
              t.id === id 
                ? { ...t, ...data, updated_at: new Date().toISOString() }
                : t
            )
          }));
        },

        deleteTaskOptimistic: (id) => {
          set(state => ({
            tasks: state.tasks.filter(t => t.id !== id)
          }));
        },

        rollbackOptimisticUpdate: (id, originalTask) => {
          if (originalTask) {
            // Restore original task
            set(state => ({
              tasks: state.tasks.map(t => t.id === id ? originalTask : t)
            }));
          } else {
            // Remove the optimistic task
            set(state => ({
              tasks: state.tasks.filter(t => t.id !== id)
            }));
          }
        },

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
            pendingSyncs: state.pendingSyncs.filter(s => s.id !== id)
          }));
        },

        syncPending: async () => {
          const { pendingSyncs, isOnline } = get();
          if (!isOnline || pendingSyncs.length === 0) return;

          const errors: string[] = [];

          for (const sync of pendingSyncs) {
            try {
              switch (sync.action) {
                case 'create':
                  if (sync.data) {
                    const newTask = await dailyTasksAPI.createTask({
                      title: sync.data.title!,
                      description: sync.data.description,
                      lane: sync.data.lane as DailyTaskLane,
                      duration: sync.data.duration as TaskDuration,
                      status: DailyTaskStatus.PENDING,
                      position: 0
                    });
                    
                    // Replace temp ID with real ID
                    set(state => ({
                      tasks: state.tasks.map(t => 
                        t.id === sync.id ? newTask : t
                      )
                    }));
                  }
                  break;

                case 'update':
                  if (sync.data) {
                    await dailyTasksAPI.updateTask(sync.id, sync.data);
                  }
                  break;

                case 'delete':
                  await dailyTasksAPI.deleteTask(sync.id);
                  break;
              }

              // Remove successful sync
              get().removePendingSync(sync.id);
            } catch (error) {
              errors.push(`Failed to sync ${sync.action} for task ${sync.id}`);
            }
          }

          if (errors.length > 0) {
            set({ error: { message: errors.join(', ') } });
          } else {
            set({ lastSync: new Date().toISOString() });
          }

          // Refresh tasks after sync
          await get().fetchTasks();
        },

        setOnlineStatus: (isOnline) => {
          set({ isOnline });
          if (isOnline) {
            // Attempt to sync when coming back online
            get().syncPending();
          }
        },

        clearError: () => set({ error: null }),

        resetState: () => set(initialState)
      }),
      {
        name: 'daily-tasks-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          tasks: state.tasks,
          pendingSyncs: state.pendingSyncs,
          lastSync: state.lastSync
        })
      }
    ),
    {
      name: 'DailyTaskStore'
    }
  )
);

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useDailyTaskStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useDailyTaskStore.getState().setOnlineStatus(false);
  });
}