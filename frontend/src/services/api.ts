import axios from 'axios';
import { AuthToken, LoginRequest, RegisterRequest, User, Card, CardWithTasks, FocusTask, DailyTask } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthToken> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const cardsAPI = {
  getCards: async (): Promise<Card[]> => {
    const response = await api.get('/cards/');
    return response.data;
  },
  
  getCard: async (cardId: string): Promise<CardWithTasks> => {
    const response = await api.get(`/cards/${cardId}`);
    return response.data;
  },
  
  createCard: async (data: Partial<Card>): Promise<Card> => {
    const response = await api.post('/cards/', data);
    return response.data;
  },
  
  updateCard: async (cardId: string, data: Partial<Card>): Promise<Card> => {
    const response = await api.put(`/cards/${cardId}`, data);
    return response.data;
  },
  
  deleteCard: async (cardId: string): Promise<void> => {
    await api.delete(`/cards/${cardId}`);
  }
};

export const focusTasksAPI = {
  getAllTasks: async (): Promise<FocusTask[]> => {
    const response = await api.get('/focus-tasks/');
    return response.data;
  },
  
  getTasksByCard: async (cardId: string): Promise<FocusTask[]> => {
    const response = await api.get(`/focus-tasks/card/${cardId}`);
    return response.data;
  },
  
  createTask: async (data: Partial<FocusTask>): Promise<FocusTask> => {
    const response = await api.post('/focus-tasks/', data);
    return response.data;
  },
  
  updateTask: async (taskId: string, data: Partial<FocusTask>): Promise<FocusTask> => {
    const response = await api.put(`/focus-tasks/${taskId}`, data);
    return response.data;
  },
  
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/focus-tasks/${taskId}`);
  }
};

export const dailyTasksAPI = {
  getAllTasks: async (): Promise<DailyTask[]> => {
    const response = await api.get('/daily-tasks/');
    return response.data;
  },
  
  getTask: async (taskId: string): Promise<DailyTask> => {
    const response = await api.get(`/daily-tasks/${taskId}`);
    return response.data;
  },
  
  createTask: async (data: Partial<DailyTask>): Promise<DailyTask> => {
    const response = await api.post('/daily-tasks/', data);
    return response.data;
  },
  
  updateTask: async (taskId: string, data: Partial<DailyTask>): Promise<DailyTask> => {
    const response = await api.put(`/daily-tasks/${taskId}`, data);
    return response.data;
  },
  
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/daily-tasks/${taskId}`);
  },
  
  completeTask: async (taskId: string): Promise<DailyTask> => {
    const response = await api.post(`/daily-tasks/${taskId}/complete`);
    return response.data;
  },
  
  reopenTask: async (taskId: string): Promise<DailyTask> => {
    const response = await api.post(`/daily-tasks/${taskId}/reopen`);
    return response.data;
  },
  
  moveToMain: async (taskId: string, duration?: string): Promise<DailyTask> => {
    const response = await api.post(`/daily-tasks/${taskId}/move-to-main`, null, {
      params: duration ? { duration } : {}
    });
    return response.data;
  },
  
  moveToController: async (taskId: string): Promise<DailyTask> => {
    const response = await api.post(`/daily-tasks/${taskId}/move-to-controller`);
    return response.data;
  }
};

export const identityAPI = {
  getSettings: async (): Promise<any> => {
    const response = await api.get('/identity/');
    return response.data;
  },
  
  updateSettings: async (settings: any): Promise<any> => {
    const response = await api.put('/identity/', settings);
    return response.data;
  },
  
  addStatement: async (statement: any): Promise<any> => {
    const response = await api.post('/identity/statements', statement);
    return response.data;
  },
  
  updateStatement: async (id: string, statement: any): Promise<any> => {
    const response = await api.put(`/identity/statements/${id}`, statement);
    return response.data;
  },
  
  deleteStatement: async (id: string): Promise<void> => {
    await api.delete(`/identity/statements/${id}`);
  }
};

export const habitsAPI = {
  getAll: async (lane?: 'becoming' | 'i_am'): Promise<any[]> => {
    const response = await api.get('/habits/', {
      params: lane ? { lane } : {}
    });
    return response.data;
  },
  
  create: async (habit: any): Promise<any> => {
    const response = await api.post('/habits/', habit);
    return response.data;
  },
  
  get: async (id: string): Promise<any> => {
    const response = await api.get(`/habits/${id}`);
    return response.data;
  },
  
  update: async (id: string, habit: any): Promise<any> => {
    const response = await api.put(`/habits/${id}`, habit);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },
  
  checkIn: async (habitId: string, checkIn: any): Promise<any> => {
    const response = await api.post(`/habits/${habitId}/checkin`, checkIn);
    return response.data;
  },
  
  graduate: async (habitId: string, graduation: any): Promise<any> => {
    const response = await api.post(`/habits/${habitId}/graduate`, graduation);
    return response.data;
  },
  
  getStats: async (habitId: string): Promise<any> => {
    const response = await api.get(`/habits/${habitId}/stats`);
    return response.data;
  }
};

// Export the api instance for direct use
export { api };