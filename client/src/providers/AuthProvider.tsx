import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { setAuthToken } from '../services/api'
import type { AuthSession, UserProfile } from '../types'

const STORAGE_KEY = 'techknots:session'

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (session: AuthSession) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        const parsed: AuthSession = JSON.parse(cached)
        setUser(parsed.user)
        setToken(parsed.token)
        setAuthToken(parsed.token)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    setLoading(false)
  }, [])

  const login = (session: AuthSession) => {
    setUser(session.user)
    setToken(session.token)
    setAuthToken(session.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout
    }),
    [loading, token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}

