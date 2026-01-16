'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/config/supabase'
import { User, LogOut, LogIn, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'

export default function AuthStatus() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Ascolta cambiamenti autenticazione
    const supabase = getSupabaseClient()
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        await supabase.auth.signOut()
      }
      setUser(null)
      router.push('/app')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoggingOut(false)
      setShowMenu(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 sm:px-4 py-2">
        <Loader2 size={16} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          title="Account"
        >
          <Wifi size={16} className="text-green-600" />
          <span className="hidden sm:inline text-sm font-medium text-green-800">Online</span>
          <User size={16} className="text-green-600" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="p-3 border-b border-gray-200">
                <p className="text-xs text-gray-500">Account</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user.email || 'Utente'}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Disconnessione...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Logout
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <WifiOff size={16} className="text-gray-400" />
        <span className="hidden sm:inline text-sm text-gray-600">Offline</span>
      </div>
      <button
        onClick={() => router.push('/register')}
        className="px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
      >
        Registrati
      </button>
      <button
        onClick={() => router.push('/login')}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
        title="Login"
      >
        <LogIn size={16} />
        <span className="hidden sm:inline">Login</span>
      </button>
    </div>
  )
}

