import React, { createContext, useState, useEffect, ReactNode } from 'react'
import authService, { User, AuthResponse } from '@/services/authServices'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (data: {
    companyName: string
    industry?: string
    managerName: string
    managerEmail: string
    managerPassword: string
  }) => Promise<AuthResponse>
  logout: () => void
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('Failed to parse stored user:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })

      // Store token and user
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      setToken(response.token)
      setUser(response.user)

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    companyName: string
    industry?: string
    managerName: string
    managerEmail: string
    managerPassword: string
  }): Promise<AuthResponse> => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await authService.registerCompany(data)

      // Store token and user
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      setToken(response.token)
      setUser(response.user)

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
    setError(null)
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}