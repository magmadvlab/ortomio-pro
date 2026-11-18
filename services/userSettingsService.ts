import type { SupabaseClient } from '@supabase/supabase-js'
import type { NotificationPreferences } from '@/services/notificationService'

export const NOTIFICATION_DEFAULTS: NotificationPreferences = { email_enabled: true, task_reminders: true, weather_alerts: true, challenge_notifications: true, harvest_notifications: true, seed_notifications: true }
export const CULTIVATION_TYPES = ['Orto domestico', 'Agricoltura professionale', 'Vivaio', 'Ricerca'] as const
export type AppearanceTheme = 'light' | 'dark' | 'system'
export interface UserSettings { firstName: string; lastName: string; cultivationType: string; theme: AppearanceTheme; preferences: Record<string, unknown> }

async function currentUser(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('Accedi nuovamente per modificare le impostazioni.')
  return data.user
}
export async function readUserSettings(client: SupabaseClient): Promise<UserSettings> {
  const user = await currentUser(client)
  const { data, error } = await client.from('profiles').select('first_name,last_name,preferences').eq('id', user.id).single()
  if (error) throw new Error('Impossibile caricare il profilo. Riprova senza modificare i dati.')
  const preferences = data.preferences ?? {}
  return { firstName: data.first_name ?? '', lastName: data.last_name ?? '', cultivationType: preferences.cultivationType ?? CULTIVATION_TYPES[0], theme: ['light', 'dark', 'system'].includes(preferences.theme) ? preferences.theme : 'light', preferences }
}
export async function saveUserSettings(client: SupabaseClient, input: Pick<UserSettings, 'firstName' | 'lastName' | 'cultivationType'>) {
  const firstName = input.firstName.trim(), lastName = input.lastName.trim()
  if (!firstName || firstName.length > 100 || !lastName || lastName.length > 100 || !CULTIVATION_TYPES.some(value => value === input.cultivationType)) throw new Error('Controlla nome, cognome e tipo di coltivazione.')
  const user = await currentUser(client)
  const existing = await readUserSettings(client)
  const { error, data } = await client.from('profiles').update({ first_name: firstName, last_name: lastName, preferences: { ...existing.preferences, cultivationType: input.cultivationType } }).eq('id', user.id).select('id').single()
  if (error || !data) throw new Error('Profilo non salvato. Riprova.')
  return readUserSettings(client)
}
export async function readNotificationPreferences(client: SupabaseClient): Promise<NotificationPreferences> {
  const user = await currentUser(client)
  const { data, error } = await client.from('notification_preferences').select('email_enabled,task_reminders,weather_alerts,challenge_notifications,harvest_notifications,seed_notifications').eq('user_id', user.id).maybeSingle()
  if (error) throw new Error('Impossibile caricare le preferenze di notifica.')
  return { ...NOTIFICATION_DEFAULTS, ...data }
}
export async function saveNotificationPreferences(client: SupabaseClient, input: NotificationPreferences) {
  const user = await currentUser(client)
  const values: Record<string, boolean> = {}
  for (const key of Object.keys(NOTIFICATION_DEFAULTS) as Array<keyof NotificationPreferences>) {
    if (typeof input[key] !== 'boolean') throw new Error('Preferenze di notifica non valide.')
    values[key] = input[key]
  }
  const { error } = await client.from('notification_preferences').upsert({ user_id: user.id, ...values }, { onConflict: 'user_id' })
  if (error) throw new Error('Preferenze non salvate. Riprova.')
  return readNotificationPreferences(client)
}
export async function saveAppearance(client: SupabaseClient, theme: AppearanceTheme) {
  if (!['light', 'dark', 'system'].includes(theme)) throw new Error('Tema non valido.')
  const user = await currentUser(client)
  const existing = await readUserSettings(client)
  const { error, data } = await client.from('profiles').update({ preferences: { ...existing.preferences, theme } }).eq('id', user.id).select('id').single()
  if (error || !data) throw new Error('Tema non salvato. Riprova.')
  return (await readUserSettings(client)).theme
}
export async function changePassword(client: SupabaseClient, current: string, password: string, confirmation: string) {
  if (!current || password.length < 8 || password !== confirmation) throw new Error('Inserisci la password attuale e due nuove password uguali di almeno 8 caratteri.')
  const user = await currentUser(client)
  if (!user.email) throw new Error('Email dell’account non disponibile.')
  const reauth = await client.auth.signInWithPassword({ email: user.email, password: current })
  if (reauth.error || reauth.data.user?.id !== user.id) throw new Error('Password attuale non corretta.')
  const result = await client.auth.updateUser({ password })
  if (result.error) throw new Error(result.error.message)
}

export type AccountClosureRequest = { id: string; status: 'requested' | 'withdrawn'; requestedAt: string; updatedAt: string }
export function accountClosureRequest(settings: UserSettings): AccountClosureRequest | null {
  const value = settings.preferences.accountClosureRequest as Partial<AccountClosureRequest> | undefined
  return value && typeof value.id === 'string' && ['requested', 'withdrawn'].includes(value.status ?? '') && typeof value.requestedAt === 'string' && typeof value.updatedAt === 'string' ? value as AccountClosureRequest : null
}
export async function saveAccountClosureRequest(client: SupabaseClient, request: boolean) {
  const user = await currentUser(client)
  const settings = await readUserSettings(client)
  const existing = accountClosureRequest(settings)
  if (request && existing?.status === 'requested') return existing
  if (!request && !existing) throw new Error('Nessuna richiesta da ritirare.')
  const now = new Date().toISOString()
  const value: AccountClosureRequest = request
    ? { id: crypto.randomUUID(), status: 'requested', requestedAt: now, updatedAt: now }
    : { ...existing!, status: 'withdrawn', updatedAt: now }
  const { data, error } = await client.from('profiles').update({ preferences: { ...settings.preferences, accountClosureRequest: value } }).eq('id', user.id).select('id').single()
  if (error || !data) throw new Error('Richiesta non salvata. Riprova.')
  const saved = accountClosureRequest(await readUserSettings(client))
  if (saved?.id !== value.id || saved.status !== value.status) throw new Error('Richiesta non confermata dall’archivio. Ricarica lo stato.')
  return saved
}
