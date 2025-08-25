import { create } from 'zustand';
import { DailyTask, TaskLane } from '../types';

interface DailyTaskStore {
  tasks: DailyTask[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<DailyTask, 'id'>) => void;
  updateTask: (id: string, data: Partial<DailyTask>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, toLane: TaskLane) => void;
}

export const useDailyTaskStore = create<DailyTaskStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  addTask: (task) => {
    const newTask: DailyTask = {
      ...task,
      id: Date.now().toString(),
    };
    set(state => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: (id, data) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, ...data } : t)
    }));
  },

  deleteTask: (id) => {
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id)
    }));
  },

  moveTask: (id, toLane) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, lane: toLane } : t)
    }));
  },
}));