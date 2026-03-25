const DEFAULT_AUTH_SITE_URL = 'https://www.ortomioapp.it'

const normalizeAuthSiteUrl = (value?: string | null): string | null => {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const withProtocol =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`
    return new URL(withProtocol).origin
  } catch {
    return null
  }
}

export const resolveAuthSiteUrl = (...candidates: Array<string | null | undefined>): string => {
  for (const candidate of candidates) {
    const normalized = normalizeAuthSiteUrl(candidate)
    if (normalized) {
      return normalized
    }
  }

  return DEFAULT_AUTH_SITE_URL
}

export const getDefaultAuthSiteUrl = (): string => DEFAULT_AUTH_SITE_URL
