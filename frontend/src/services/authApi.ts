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
  async requestOtp(email: string) {
    const { data } = await api.post<{ message: string }>('/auth-v2/otp/request', {
      email
    });
    return data;
  },

  async verifyOtp(email: string, token: string) {
    const { data } = await api.post<AuthResponse>('/auth-v2/otp/verify', {
      email,
      token
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
    const { data } = await api.get('/auth-v2/me');
    return data;
  },

  async logout() {
    const { data } = await api.post('/auth-v2/logout');
    return data;
  }
};