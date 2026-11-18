import 'server-only'
import { createDecipheriv } from 'node:crypto'

/** Read the retired browser format: IV + ciphertext/tag + embedded key, or Base64. */
export function decodeLegacyBrowserKey(stored: string): string {
  if (!stored || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(stored)) throw new Error('invalid_legacy_key')
  const bytes = Buffer.from(stored, 'base64')
  if (bytes.length > 60) {
    try {
      const ciphertext = bytes.subarray(12, -48)
      const decipher = createDecipheriv('aes-256-gcm', bytes.subarray(-32), bytes.subarray(0, 12))
      decipher.setAuthTag(bytes.subarray(-48, -32))
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
    } catch { /* Old fallback was plain Base64; accept only printable key material below. */ }
  }
  const plaintext = bytes.toString('utf8')
  if (!/^[\x20-\x7e]+$/.test(plaintext)) throw new Error('unreadable_legacy_key')
  return plaintext
}

export function legacyServiceTarget(service: string, organizationId: string | null): string | null {
  // Never silently turn an organization's credential into a personal credential.
  if (organizationId) return null
  return ({ OpenAI: 'ai_openai', Anthropic: 'ai_anthropic', GoogleAI: 'ai_gemini', WeatherAPI: 'weather_weatherapi' } as Record<string, string>)[service] ?? null
}

export function legacyPublicConfig(config: Record<string, unknown> | null): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (typeof config?.model === 'string') result.model = config.model
  if (typeof config?.temperature === 'number' && config.temperature >= 0 && config.temperature <= 2) result.temperature = config.temperature
  if (typeof config?.max_tokens === 'number' && Number.isInteger(config.max_tokens) && config.max_tokens > 0 && config.max_tokens <= 32768) result.max_tokens = config.max_tokens
  return result
}
