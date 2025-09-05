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
    // Store both 'token' and 'access_token' for compatibility
    localStorage.setItem('token', tokenToStore);
    localStorage.setItem('access_token', tokenToStore);
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
    localStorage.removeItem('access_token');
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
      // Check if we're in development mode (can be configured via env variable)
      const isDemoMode = process.env.NODE_ENV === 'development' && 
                        !localStorage.getItem('disable_demo_mode');
      
      // Check for stored token (check both keys for compatibility)
      const storedToken = localStorage.getItem('access_token') || localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');
      
      if (isDemoMode && !storedToken) {
        // Auto-login with demo user in development mode
        try {
          const demoResponse = await authApi.demoLogin();
          get().setAuth(
            demoResponse.user,
            { access_token: demoResponse.access_token, token_type: 'bearer' },
            demoResponse.refresh_token
          );
          set({ initialized: true });
          console.log('Auto-logged in with demo user');
          return;
        } catch (error) {
          console.error('Demo login failed:', error);
          // Fall through to normal auth flow
        }
      }
      
      if (storedToken && storedUser) {
        try {
          // Parse stored user
          const user = JSON.parse(storedUser);
          
          // First set the auth state from localStorage (optimistic)
          set({
            user: user,
            token: storedToken,
            refreshToken: storedRefreshToken,
            isAuthenticated: true,
            isLoading: false,
            initialized: true
          });
          
          // Then validate token with backend (async verification)
          authApi.getCurrentUser().then(
            (userData) => {
              // Update with fresh user data from backend
              set({ user: userData });
              localStorage.setItem('user', JSON.stringify(userData));
            },
            (error) => {
              // Token is invalid or expired
              if (error.response?.status === 401) {
                console.log('Token expired, clearing auth');
                get().clearAuth();
              }
            }
          );
        } catch (error) {
          console.error('Error parsing stored user:', error);
          // Clear invalid data
          get().clearAuth();
          set({ initialized: true });
        }
      } else {
        // No stored token or user
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