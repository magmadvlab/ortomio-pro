'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSupabaseClient } from '@/config/supabase'
import {
  DEFAULT_CAPABILITY_ACCESS,
  type CapabilityAccess,
} from '@/config/capabilities'
import { useAuth } from '@/packages/core/hooks/useAuth'

type CapabilityContextValue = {
  access: CapabilityAccess
  loading: boolean
}

const CapabilityContext = createContext<CapabilityContextValue>({
  access: DEFAULT_CAPABILITY_ACCESS,
  loading: true,
})

export function CapabilityProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [access, setAccess] = useState<CapabilityAccess>(DEFAULT_CAPABILITY_ACCESS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (authLoading) return
      if (!user) {
        if (active) {
          setAccess(DEFAULT_CAPABILITY_ACCESS)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      try {
        const supabase = getSupabaseClient()
        const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
        const headers: HeadersInit = {}
        if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`

        const response = await fetch('/api/auth/capabilities', { headers, cache: 'no-store' })
        if (!response.ok) throw new Error(`capability_profile_${response.status}`)
        const payload = await response.json()
        if (active) setAccess(payload as CapabilityAccess)
      } catch (error) {
        console.error('Capability profile unavailable:', error)
        if (active) setAccess(DEFAULT_CAPABILITY_ACCESS)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [authLoading, user])

  const value = useMemo(() => ({ access, loading }), [access, loading])
  return <CapabilityContext.Provider value={value}>{children}</CapabilityContext.Provider>
}

export const useCapabilities = () => useContext(CapabilityContext)
