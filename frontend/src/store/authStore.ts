import { create } from 'zustand';
import { User, AuthToken } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: AuthToken) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: 'dev-user', email: 'dev@example.com', full_name: 'Dev User', is_active: true, created_at: new Date().toISOString() },
  token: 'dev-token',
  isAuthenticated: true, // Always authenticated in dev mode
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token.access_token);
    set({ user, token: token.access_token, isAuthenticated: true });
  },
  
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  updateUser: (user) => {
    set({ user });
  }
}));