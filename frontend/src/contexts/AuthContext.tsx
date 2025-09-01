import React, { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/authApi'

interface AuthContextType {
  user: any | null
  session: any | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any | null }>
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signOut: () => Promise<{ error: any | null }>
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: any | null }>
  resetPassword: (email: string) => Promise<{ error: any | null }>
  updatePassword: (password: string) => Promise<{ error: any | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    user, 
    token, 
    isLoading: loading, 
    setAuth, 
    clearAuth, 
    initializeAuth 
  } = useAuthStore()

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth()
  }, [initializeAuth])

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const response = await authApi.signUpWithEmail(
        email, 
        password, 
        metadata?.full_name || ''
      )
      
      if (response.access_token) {
        setAuth(
          response.user, 
          { access_token: response.access_token, token_type: 'bearer' },
          response.refresh_token
        )
        return { error: null }
      }
      
      return { error: { message: 'Signup failed' } }
    } catch (error: any) {
      return { error: { message: error.response?.data?.detail || error.message } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.signInWithEmail(email, password)
      
      if (response.access_token) {
        setAuth(
          response.user, 
          { access_token: response.access_token, token_type: 'bearer' },
          response.refresh_token
        )
        return { error: null }
      }
      
      return { error: { message: 'Login failed' } }
    } catch (error: any) {
      return { error: { message: error.response?.data?.detail || error.message } }
    }
  }

  const signOut = async () => {
    try {
      await clearAuth()
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    // OAuth providers would need to be implemented through backend
    return { error: { message: 'OAuth providers not yet implemented' } }
  }

  const resetPassword = async (email: string) => {
    // Password reset would need to be implemented through backend
    return { error: { message: 'Password reset not yet implemented' } }
  }

  const updatePassword = async (password: string) => {
    // Password update would need to be implemented through backend
    return { error: { message: 'Password update not yet implemented' } }
  }

  const value: AuthContextType = {
    user,
    session: token ? { access_token: token } : null,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    resetPassword,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}