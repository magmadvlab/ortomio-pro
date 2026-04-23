'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/config/supabase'

export default function SupabaseConnectionDebug() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          throw new Error('Supabase client not available')
        }
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        // Try to fetch gardens
        const { data: gardens, error } = await supabase
          .from('gardens')
          .select('*')
          .limit(5)
        
        setInfo({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasApiKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          user: user ? {
            id: user.id,
            email: user.email,
          } : null,
          gardens: gardens || [],
          error: error?.message,
        })
      } catch (err: any) {
        setInfo({
          error: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    
    checkConnection()
  }, [])

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg max-w-md z-50">
        <p className="text-sm text-gray-600">Checking connection...</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Supabase Debug</h3>
      <div className="text-xs space-y-1">
        <p><strong>URL:</strong> {info?.supabaseUrl || '❌ Missing'}</p>
        <p><strong>API Key:</strong> {info?.hasApiKey ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>User:</strong> {info?.user?.email || '❌ Not logged in'}</p>
        <p><strong>Gardens:</strong> {info?.gardens?.length || 0} found</p>
        {info?.error && <p className="text-red-600"><strong>Error:</strong> {info.error}</p>}
        {info?.gardens && info.gardens.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <p className="font-semibold">Gardens:</p>
            {info.gardens.map((g: any) => (
              <p key={g.id} className="text-xs">- {g.name}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
