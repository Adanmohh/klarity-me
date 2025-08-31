import { create } from 'zustand';
import { User, AuthToken } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: AuthToken) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

// Check for existing auth on load
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!(storedToken && storedUser),
  isLoading: false,
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token.access_token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token: token.access_token, isAuthenticated: true, isLoading: false });
  },
  
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  }
}));