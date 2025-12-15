'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { getSupabaseClient } from '@/config/supabase'
import { useTier } from '@/packages/core/hooks/useTier'
import { User, Crown, CreditCard, RefreshCw, Loader2, AlertCircle } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  tier: string
  credits_total: number
  credits_used: number
  created_at: string
}

export default function AdminPage() {
  const { storageProvider } = useStorage()
  const { tier, isProfessional } = useTier()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadCurrentUser()
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (currentUser && isAdmin) {
      loadUsers()
    }
  }, [currentUser, isAdmin])

  const checkAdminAccess = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setIsAdmin(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsAdmin(false)
      return
    }

    // Check if user is PRO_PROFESSIONAL (admin access)
    // In production, you might want to add an is_admin column
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    // Allow access if:
    // 1. User is PRO_PROFESSIONAL
    // 2. Or in development mode
    const isDev = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    )
    
    setIsAdmin(profile?.tier === 'PRO_PROFESSIONAL' || isDev)
  }

  const loadCurrentUser = async () => {
    const supabase = getSupabaseClient()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.error('Supabase not available')
        return
      }

      // Call admin function to list users
      const { data, error } = await supabase.rpc('list_all_users')

      if (error) {
        console.error('Error loading users:', error)
        // Fallback: try direct query (will only show current user due to RLS)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setUsers([{
              id: user.id,
              email: user.email || '',
              tier: profile.tier || 'FREE',
              credits_total: profile.ai_credits_total || 0,
              credits_used: profile.ai_credits_used || 0,
              created_at: user.created_at || '',
            }])
          }
        }
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const setUserTier = async (userId: string, tier: string) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { error } = await supabase.rpc('set_user_tier', {
        p_user_id: userId,
        p_tier: tier,
      })

      if (error) {
        alert(`Error: ${error.message}`)
        return
      }

      alert(`Tier updated to ${tier}`)
      loadUsers()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const grantCredits = async (userId: string, amount: number) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { error } = await supabase.rpc('admin_grant_credits', {
        p_user_id: userId,
        p_amount: amount,
      })

      if (error) {
        alert(`Error: ${error.message}`)
        return
      }

      alert(`Granted ${amount} credits`)
      loadUsers()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const setMyTierToPro = async () => {
    if (!currentUser) {
      alert('Please log in first')
      return
    }

    await setUserTier(currentUser.id, 'PRO_PROFESSIONAL')
    await grantCredits(currentUser.id, 999999)
    
    // Reload page to apply changes
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    )
  }

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accesso Negato</h1>
          <p className="text-gray-600 mb-4">
            Questa pagina è riservata agli amministratori.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Devi essere un utente PRO_PROFESSIONAL per accedere al pannello admin.
          </p>
          <button
            onClick={() => window.location.href = '/app'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Crown className="text-yellow-500" size={32} />
                Admin Panel
              </h1>
              <p className="text-gray-600 mt-2">Manage users and tiers</p>
            </div>
            <button
              onClick={setMyTierToPro}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Crown size={20} />
              Set My Tier to PRO
            </button>
          </div>

          {currentUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>Current User:</strong> {currentUser.email}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Users</h2>
            <button
              onClick={loadUsers}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tier</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Credits</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.tier === 'PRO_PROFESSIONAL' ? 'bg-purple-100 text-purple-800' :
                        user.tier === 'PRO_CONSUMER' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" />
                        {user.credits_used} / {user.credits_total}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={user.tier}
                          onChange={(e) => setUserTier(user.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO_CONSUMER">PRO_CONSUMER</option>
                          <option value="PRO_PROFESSIONAL">PRO_PROFESSIONAL</option>
                        </select>
                        <button
                          onClick={() => grantCredits(user.id, 100)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          +100 Credits
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
