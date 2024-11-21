// src/lib/auth/auth-context.tsx
import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Profile } from '@/lib/services/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  profile: Profile | null
  accessJwt: string | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  if (auth.loading) {
    return <div>Loading...</div> // Or your loading component
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
