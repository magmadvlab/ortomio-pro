'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { getSupabaseClient } from '@/config/supabase'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { CULTIVATION_TYPES, readUserSettings, saveUserSettings, readNotificationPreferences, saveNotificationPreferences, changePassword, saveAppearance, type UserSettings, type AppearanceTheme } from '@/services/userSettingsService'
import type { NotificationPreferences } from '@/services/notificationService'

const inputClass = 'mt-1 block w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-gray-900'
const buttonClass = 'rounded-lg bg-green-700 px-5 py-2 text-white disabled:opacity-50'
export default function UserSettingsPanels({ section }: { section: 'profile' | 'notifications' | 'security' | 'appearance' }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [theme, setTheme] = useState<AppearanceTheme>('light')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setError(''); setMessage('')
    async function load() {
      try {
        const client = getSupabaseClient()
        if (!client) throw new Error('Connessione all’account non disponibile.')
        if (section === 'notifications') {
          const result = await readNotificationPreferences(client)
          if (active) setPreferences(result)
        } else if (section !== 'security') {
          const result = await readUserSettings(client)
          if (active) { setSettings(result); setTheme(result.theme) }
        }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : 'Caricamento non riuscito.') }
      finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [section, user?.id, retry])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget, data = new FormData(form)
    setBusy(true); setError(''); setMessage('')
    try {
      const client = getSupabaseClient()
      if (!client) throw new Error('Connessione all’account non disponibile.')
      if (section === 'profile') {
        const result = await saveUserSettings(client, { firstName: String(data.get('firstName')), lastName: String(data.get('lastName')), cultivationType: String(data.get('cultivationType')) })
        setSettings(result); setMessage('Profilo salvato e verificato.')
      } else if (section === 'notifications' && preferences) {
        setPreferences(await saveNotificationPreferences(client, preferences)); setMessage('Preferenze di notifica salvate e verificate.')
      } else if (section === 'security') {
        await changePassword(client, String(data.get('currentPassword')), String(data.get('newPassword')), String(data.get('confirmation')))
        form.reset(); setMessage('Password aggiornata.')
      } else if (section === 'appearance') {
        const savedTheme = await saveAppearance(client, theme)
        window.dispatchEvent(new CustomEvent('ortomio-theme-changed', { detail: savedTheme }))
        setMessage('Tema salvato e applicato.')
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Salvataggio non riuscito.') }
    finally { setBusy(false) }
  }
  const titles = { profile: 'Profilo utente', notifications: 'Notifiche', security: 'Cambia password', appearance: 'Aspetto' }
  if (loading) return <p role="status">Caricamento impostazioni…</p>
  return <section><h2 className="mb-4 text-lg font-semibold">{titles[section]}</h2>
    {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{error} <button onClick={() => setRetry(value => value + 1)} disabled={busy} className="underline">Ricarica</button></div>}
    {message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-green-900">{message}</p>}
    <form onSubmit={submit} className="space-y-5"><fieldset disabled={busy} className="space-y-4">
      {section === 'profile' && settings && <><label className="block">Nome<input required name="firstName" maxLength={100} defaultValue={settings.firstName} className={inputClass} /></label><label className="block">Cognome<input required name="lastName" maxLength={100} defaultValue={settings.lastName} className={inputClass} /></label><label className="block">Email di accesso<input type="email" readOnly value={user?.email ?? ''} className={inputClass} /></label><label className="block">Tipo di coltivazione<select name="cultivationType" defaultValue={settings.cultivationType} className={inputClass}>{CULTIVATION_TYPES.map(value => <option key={value}>{value}</option>)}</select></label></>}
      {section === 'notifications' && preferences && <>{(Object.entries({ email_enabled: 'Ricevi notifiche via email', task_reminders: 'Promemoria attività e suggerimenti operativi', weather_alerts: 'Allerte meteo', challenge_notifications: 'Sfide e obiettivi', harvest_notifications: 'Registrazioni di raccolta', seed_notifications: 'Scorte e scadenze semi' }) as Array<[keyof NotificationPreferences, string]>).map(([key, label]) => <label key={key} className="flex items-center gap-3"><input type="checkbox" checked={preferences[key]} onChange={event => setPreferences({ ...preferences, [key]: event.target.checked })} />{label}</label>)}</>}
      {section === 'security' && <><label className="block">Password attuale<input required name="currentPassword" type="password" autoComplete="current-password" className={inputClass} /></label><label className="block">Nuova password<input required name="newPassword" type="password" minLength={8} autoComplete="new-password" className={inputClass} /></label><label className="block">Conferma nuova password<input required name="confirmation" type="password" minLength={8} autoComplete="new-password" className={inputClass} /></label></>}
      {section === 'appearance' && settings && <label className="block">Tema<select value={theme} onChange={event => setTheme(event.target.value as AppearanceTheme)} className={inputClass}><option value="light">Chiaro</option><option value="dark">Scuro</option><option value="system">Automatico: segui il dispositivo</option></select></label>}
    </fieldset><button disabled={busy || (section === 'notifications' ? !preferences : section !== 'security' && !settings)} className={buttonClass}>{busy ? 'Salvataggio…' : section === 'security' ? 'Aggiorna password' : 'Salva modifiche'}</button></form>
  </section>
}
