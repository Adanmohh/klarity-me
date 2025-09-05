import { api } from './api';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  user: {
    id: string;
    email: string;
    full_name?: string;
    created_at?: string;
    is_active?: boolean;
  };
}

export const authApi = {
  // Email/Password Authentication
  async signUpWithEmail(email: string, password: string, fullName?: string) {
    const { data } = await api.post<AuthResponse>('/auth-v2/signup', {
      email,
      password,
      full_name: fullName
    });
    return data;
  },

  async signInWithEmail(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth-v2/login', {
      email,
      password
    });
    return data;
  },

  // OTP Authentication
  async requestOtp(email: string, fullName?: string) {
    const { data } = await api.post<{ 
      message: string; 
      is_new_user?: boolean;
      needs_activation?: boolean;
      email?: string;
    }>('/auth-otp/request-otp', {
      email,
      full_name: fullName || ''
    });
    return data;
  },

  async verifyOtp(email: string, otp: string) {
    const { data } = await api.post<AuthResponse>('/auth-otp/verify-otp', {
      email,
      otp
    });
    return data;
  },
  
  async resendOtp(email: string) {
    const { data } = await api.post<{ message: string; purpose?: string }>('/auth-otp/resend-otp', {
      email
    });
    return data;
  },

  // Token Management
  async refreshToken(refreshToken: string) {
    const { data } = await api.post<AuthResponse>('/auth-v2/refresh', {
      refresh_token: refreshToken
    });
    return data;
  },

  // User Management
  async getCurrentUser() {
    // Try OTP endpoint first, fallback to auth-v2
    try {
      const { data } = await api.get('/auth-otp/me');
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Fallback to auth-v2 endpoint
        const { data } = await api.get('/auth-v2/me');
        return data;
      }
      throw error;
    }
  },

  async logout() {
    const { data } = await api.post('/auth-v2/logout');
    return data;
  },

  // Demo login for development
  async demoLogin() {
    const { data } = await api.get<AuthResponse>('/auth-otp/demo-login');
    return data;
  }
};