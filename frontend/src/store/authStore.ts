import { create } from 'zustand';
import { User, AuthToken } from '../types';
import { authApi } from '../services/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  setAuth: (user: User, token: AuthToken, refreshToken?: string) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  
  setAuth: (user, token, refreshToken) => {
    // Store the token
    const tokenToStore = typeof token === 'string' ? token : token.access_token;
    localStorage.setItem('token', tokenToStore);
    localStorage.setItem('user', JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ 
      user, 
      token: tokenToStore, 
      refreshToken,
      isAuthenticated: true, 
      isLoading: false 
    });
  },
  
  clearAuth: async () => {
    try {
      // Call backend logout endpoint
      await authApi.logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    set({ 
      user: null, 
      token: null, 
      refreshToken: null,
      isAuthenticated: false, 
      isLoading: false 
    });
  },
  
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  initializeAuth: async () => {
    if (get().initialized) return;
    
    set({ isLoading: true });
    
    try {
      // Check for stored token
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      if (storedToken) {
        try {
          // Validate token with backend
          const userData = await authApi.getCurrentUser();
          
          set({
            user: userData,
            token: storedToken,
            refreshToken: storedRefreshToken,
            isAuthenticated: true,
            isLoading: false,
            initialized: true
          });
        } catch (error: any) {
          // Token might be expired, try to refresh
          if (storedRefreshToken && error.response?.status === 401) {
            try {
              const refreshData = await authApi.refreshToken(storedRefreshToken);
              
              set({
                user: refreshData.user,
                token: refreshData.access_token,
                refreshToken: refreshData.refresh_token,
                isAuthenticated: true,
                isLoading: false,
                initialized: true
              });
              
              localStorage.setItem('token', refreshData.access_token);
              if (refreshData.refresh_token) {
                localStorage.setItem('refresh_token', refreshData.refresh_token);
              }
            } catch (refreshError) {
              // Refresh failed, clear auth
              get().clearAuth();
              set({ initialized: true });
            }
          } else {
            // Token invalid, clear auth
            get().clearAuth();
            set({ initialized: true });
          }
        }
      } else {
        // No stored token
        set({ isLoading: false, initialized: true });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false, initialized: true });
    }
  },
  
  refreshSession: async () => {
    const refreshToken = get().refreshToken || localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      get().clearAuth();
      return;
    }
    
    try {
      const refreshData = await authApi.refreshToken(refreshToken);
      
      get().setAuth(
        refreshData.user,
        { access_token: refreshData.access_token, token_type: 'bearer' },
        refreshData.refresh_token
      );
    } catch (error) {
      console.error('Error refreshing session:', error);
      get().clearAuth();
    }
  }
}));