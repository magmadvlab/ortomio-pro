import 'server-only'

// https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Overview/Authentication.html
export const COPERNICUS_TOKEN_URL = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token'
let cached: { clientId: string; clientSecret: string; token: string; expiresAt: number } | undefined
export async function copernicusToken(clientId: string, clientSecret: string, options: { fetcher?: typeof fetch; force?: boolean } = {}) {
  if (!options.force && cached?.clientId === clientId && cached.clientSecret === clientSecret && cached.expiresAt > Date.now() + 60_000) return cached.token
  const response = await (options.fetcher ?? fetch)(COPERNICUS_TOKEN_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error('sentinel_auth_failed')
  const data = await response.json()
  if (typeof data.access_token !== 'string' || !data.access_token || !Number.isFinite(Number(data.expires_in)) || Number(data.expires_in) <= 0) throw new Error('sentinel_auth_invalid_response')
  cached = { clientId, clientSecret, token: data.access_token, expiresAt: Date.now() + Number(data.expires_in) * 1000 }
  return data.access_token as string
}
