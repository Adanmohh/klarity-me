import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth/login' 
}) => {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // User is authenticated, render children
  return <>{children}</>
}

// Component for routes that should only be accessible when NOT authenticated (like login, signup)
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { user, isAuthenticated } = useAuthStore()

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    return <Navigate to={redirectTo} replace />
  }

  // User is not authenticated, render children
  return <>{children}</>
}