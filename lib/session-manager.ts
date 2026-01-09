/**
 * Session Manager per gestire errori di refresh token e sessioni scadute
 */

import { getSupabaseClient } from '@/config/supabase'

export class SessionManager {
  private static instance: SessionManager
  
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  /**
   * Pulisce sessioni scadute o corrotte
   */
  public async clearInvalidSession(): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      // Verifica se c'è una sessione corrente
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // Pulisci completamente la sessione
        await supabase.auth.signOut()
        
        // Pulisci anche il localStorage se siamo nel browser
        if (typeof window !== 'undefined') {
          const keys = Object.keys(localStorage)
          keys.forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error clearing invalid session:', error)
    }
  }

  /**
   * Verifica se la sessione è valida
   */
  public async isSessionValid(): Promise<boolean> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return false

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session validation error:', error)
        return false
      }

      return !!session && !!session.access_token
    } catch (error) {
      console.error('Error validating session:', error)
      return false
    }
  }

  /**
   * Refresh della sessione con gestione errori
   */
  public async refreshSession(): Promise<boolean> {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return false

      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        await this.clearInvalidSession()
        return false
      }

      return !!data.session
    } catch (error) {
      console.error('Error refreshing session:', error)
      await this.clearInvalidSession()
      return false
    }
  }

  /**
   * Setup listener per gestire automaticamente gli errori di sessione
   */
  public setupSessionListener(): void {
    const supabase = getSupabaseClient()
    if (!supabase || typeof window === 'undefined') return

    supabase.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case 'SIGNED_OUT':
          // Pulisci completamente quando l'utente si disconnette
          await this.clearInvalidSession()
          break
          
        case 'TOKEN_REFRESHED':
          if (!session) {
            // Se il refresh fallisce, pulisci la sessione
            await this.clearInvalidSession()
          }
          break
          
        case 'SIGNED_IN':
          console.log('User signed in successfully')
          break
      }
    })
  }
}

// Export delle funzioni di utilità
export const sessionManager = SessionManager.getInstance()

export const clearInvalidSession = () => sessionManager.clearInvalidSession()
export const isSessionValid = () => sessionManager.isSessionValid()
export const refreshSession = () => sessionManager.refreshSession()
export const setupSessionListener = () => sessionManager.setupSessionListener()