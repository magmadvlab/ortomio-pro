import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { APIConfiguration } from './apiConfigurationService'

export const configurationSchema = z.object({
  id: z.string().uuid().optional(), user_id: z.string().optional(),
  service_type: z.enum(['ai_gemini', 'ai_openai', 'ai_anthropic', 'ai_ollama', 'ai_local', 'weather_openmeteo', 'weather_weatherapi', 'weather_openweathermap', 'weather_custom']),
  provider_name: z.string().trim().min(1).max(200), api_key: z.string().max(4096).optional(),
  config: z.object({ model: z.string().max(200).optional(), base_url: z.string().url().max(2048).optional(), temperature: z.number().min(0).max(2).optional(), max_tokens: z.number().int().min(1).max(32768).optional() }).strict().optional(),
  is_active: z.boolean().optional(), is_default: z.boolean().optional(),
})
function encryptionKey() {
  const encoded = process.env.API_CONFIGURATION_ENCRYPTION_KEY || ''
  if (!/^[a-fA-F0-9]{64}$/.test(encoded)) throw new Error('api_encryption_not_configured')
  return Buffer.from(encoded, 'hex')
}
export function encryptAPISecret(secret: string, userId: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  cipher.setAAD(Buffer.from(userId))
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.')
}
export function decryptAPISecret(stored: string, userId: string) {
  // Legacy records are read only on the server; the rotation script upgrades them.
  if (!stored.startsWith('v1.')) {
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(stored)) throw new Error('invalid_legacy_secret')
    return Buffer.from(stored, 'base64').toString('utf8')
  }
  const parts = stored.split('.')
  if (parts.length !== 4) throw new Error('invalid_encrypted_secret')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(parts[1], 'base64url'))
  decipher.setAAD(Buffer.from(userId)); decipher.setAuthTag(Buffer.from(parts[2], 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(parts[3], 'base64url')), decipher.final()]).toString('utf8')
}
export type ConfigurationRow = Record<string, unknown> & { id: string; user_id: string; service_name: APIConfiguration['service_type']; api_key_encrypted: string; provider_name: string; config: APIConfiguration['config']; is_active: boolean; is_default: boolean }
export function publicConfiguration(row: ConfigurationRow) {
  return { id: row.id, user_id: row.user_id, service_type: row.service_name, provider_name: row.provider_name, config: Object.fromEntries(Object.entries(row.config ?? {}).filter(([key]) => ['model', 'base_url', 'temperature', 'max_tokens'].includes(key))), is_active: row.is_active, is_default: row.is_default, api_key: '', has_api_key: Boolean(row.api_key_encrypted) }
}
export async function ownedConfiguration(db: SupabaseClient, userId: string, id: string): Promise<APIConfiguration | null> {
  const { data, error } = await db.from('api_configurations').select('*').eq('id', id).eq('user_id', userId).eq('is_active', true).maybeSingle()
  if (error) throw new Error('configuration_read_failed')
  if (!data) return null
  if (!data.api_key_encrypted) throw new Error('credential_migration_required')
  return { ...publicConfiguration(data), api_key: decryptAPISecret(data.api_key_encrypted, userId) }
}
