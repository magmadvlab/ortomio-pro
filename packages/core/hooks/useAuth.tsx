/**
 * useAuth Hook
 * Gestisce stato autenticazione e integrazione con Supabase Auth
 * Supporta bypass completo per sviluppo locale
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { getSupabaseClient } from '@/config/supabase'
import { User } from '@supabase/supabase-js'
import { isBypassActive, getMockUser, logBypassStatus } from '@/lib/auth-bypass'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, additionalData?: any) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verifica sessione esistente al mount
  useEffect(() => {
    // Se bypass attivo, usa mock user
    if (isBypassActive()) {
      logBypassStatus()
      const mockUser = getMockUser() as User
      setUser(mockUser)
      setLoading(false)
      setError(null)
      return
    }

    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          setLoading(false)
          return
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err: any) {
        console.error('Error checking session:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Ascolta cambiamenti autenticazione (solo se bypass non attivo)
    const supabase = getSupabaseClient()
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            setUser(session?.user ?? null)

            if (event === 'SIGNED_OUT') {
              setError(null)
            }
          } catch (err) {
            console.error('onAuthStateChange handler error (useAuth):', err)
          } finally {
            setLoading(false)
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Se bypass attivo, simula login immediato
    if (isBypassActive()) {
      const mockUser = getMockUser() as User
      setUser(mockUser)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase non configurato')
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      setUser(data.user)
    } catch (err: any) {
      setError(err.message || 'Errore durante il login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    // Se bypass attivo, simula logout
    if (isBypassActive()) {
      setUser(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        await supabase.auth.signOut()
      }
      setUser(null)
    } catch (err: any) {
      setError(err.message || 'Errore durante il logout')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, additionalData?: any) => {
    // Se bypass attivo, simula registrazione immediata
    if (isBypassActive()) {
      const mockUser = getMockUser() as User
      setUser(mockUser)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Se additionalData è fornito, usa l'API endpoint
      if (additionalData) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(additionalData),
        })

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Errore durante la registrazione')
        }

        setUser(result.user)
        return
      }

      // Fallback per registrazione semplice (compatibilità)
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase non configurato')
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      })

      if (authError) {
        throw authError
      }

      setUser(data.user ?? null)
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    // Se bypass attivo, mantieni mock user
    if (isBypassActive()) {
      const mockUser = getMockUser() as User
      setUser(mockUser)
      return
    }

    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (err: any) {
      console.error('Error refreshing user:', err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

