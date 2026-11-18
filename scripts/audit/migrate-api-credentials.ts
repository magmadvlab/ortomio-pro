import { createClient } from '@supabase/supabase-js'
import { encryptAPISecret, decryptAPISecret } from '../../services/apiConfiguration.server'
import { decodeLegacyBrowserKey, legacyServiceTarget, legacyPublicConfig } from '../../services/legacyCredentialMigration.server'
// Dry-run by default. No secret or user identifier is printed.
const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Server database configuration required')
if (apply && !['localhost', '127.0.0.1'].includes(new URL(url).hostname) && !process.argv.includes('--allow-remote')) throw new Error('Remote writes require --allow-remote and an approved backup')
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
let scanned = 0, migrated = 0, pending = 0
for (let offset = 0; ; offset += 200) {
  const { data, error } = await db.from('api_configurations').select('id,user_id,api_key,api_secret,api_key_encrypted,api_secret_encrypted').order('id').range(offset, offset + 199)
  if (error) throw new Error('Credential inventory read failed')
  for (const row of data ?? []) {
    scanned++
    if (row.api_key_encrypted?.startsWith('v1.') && !row.api_key && !row.api_secret) continue
    pending++
    if (!apply) continue
    const plaintext = row.api_key_encrypted ? decryptAPISecret(row.api_key_encrypted, row.user_id) : row.api_key
    if (!plaintext) throw new Error('Missing primary key: resolve legacy configuration before migration')
    let query = db.from('api_configurations').update({ api_key_encrypted: encryptAPISecret(plaintext, row.user_id), api_secret_encrypted: row.api_secret ? encryptAPISecret(row.api_secret, row.user_id) : row.api_secret_encrypted, api_key: null, api_secret: null }).eq('id', row.id)
    query = row.api_key_encrypted === null ? query.is('api_key_encrypted', null) : query.eq('api_key_encrypted', row.api_key_encrypted)
    query = row.api_key === null ? query.is('api_key', null) : query.eq('api_key', row.api_key)
    query = row.api_secret === null ? query.is('api_secret', null) : query.eq('api_secret', row.api_secret)
    const updated = await query.select('id')
    if (updated.error || updated.data?.length !== 1) throw new Error('Concurrent credential update or write failure; retry inventory')
    migrated++
  }
  if (!data || data.length < 200) break
}
let legacyScanned = 0, legacyArchived = 0, legacyTransferred = 0, legacyNeedsReview = 0
for (let offset = 0; ; offset += 200) {
  const { data, error } = await db.from('api_keys').select('id,user_id,organization_id,service,name,key_value,config').order('id').range(offset, offset + 199)
  if (error) throw new Error('Legacy credential inventory read failed')
  for (const row of data ?? []) {
    legacyScanned++
    const target = legacyServiceTarget(row.service, row.organization_id)
    if (!apply) { if (!target) legacyNeedsReview++; continue }
    const archive = row.key_value.startsWith('v1.')
      ? JSON.parse(decryptAPISecret(row.key_value, row.user_id))
      : { keyValue: decodeLegacyBrowserKey(row.key_value), config: row.config }
    if (typeof archive.keyValue !== 'string' || !archive.keyValue) throw new Error('Invalid legacy archive')
    const result = await db.rpc('migrate_legacy_api_key', {
      p_id: row.id, p_user_id: row.user_id, p_original_key: row.key_value, p_original_config: row.config,
      p_archive: encryptAPISecret(JSON.stringify(archive), row.user_id), p_service_name: target,
      p_encrypted_key: encryptAPISecret(archive.keyValue, row.user_id), p_config: legacyPublicConfig(archive.config),
    })
    if (result.error) throw new Error('Legacy credential migration failed; no values printed')
    legacyArchived++
    if (result.data?.transferred) legacyTransferred++; else legacyNeedsReview++
  }
  if (!data || data.length < 200) break
}
console.log(JSON.stringify({ apply, scanned, pending, migrated, legacyScanned, legacyArchived, legacyTransferred, legacyNeedsReview }))
