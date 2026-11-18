'use client'

import { useEffect } from 'react'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { getSupabaseClient } from '@/config/supabase'
import { readUserSettings, type AppearanceTheme } from '@/services/userSettingsService'

export default function ThemePreference() {
  const { user } = useAuth()
  useEffect(() => {
    let active = true
    let theme: AppearanceTheme = 'light'
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => { document.documentElement.dataset.ortomioTheme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme }
    const change = (event: Event) => { theme = (event as CustomEvent<AppearanceTheme>).detail; apply() }
    const client = getSupabaseClient()
    if (client && user) void readUserSettings(client).then(settings => { if (active) { theme = settings.theme; apply() } }).catch(() => { /* Keep the existing appearance if profile cannot be loaded. */ })
    else delete document.documentElement.dataset.ortomioTheme
    media.addEventListener('change', apply)
    window.addEventListener('ortomio-theme-changed', change)
    return () => { active = false; media.removeEventListener('change', apply); window.removeEventListener('ortomio-theme-changed', change); delete document.documentElement.dataset.ortomioTheme }
  }, [user])
  return null
}
