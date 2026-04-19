/**
 * Weather Cache Service
 * Uses browser cache as a fast layer, but reads canonical persisted forecast
 * snapshots from daily_weather_log whenever local cache is missing.
 */

import { getSupabaseClient } from '@/config/supabase'
import type { PersistedForecastSnapshot } from '@/types/environmental'
import type { WeatherForecast } from './weatherService'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const LOCAL_STORAGE_KEY = 'ortoWeatherCache'
const PERSISTED_COORD_TOLERANCE = 0.2
const PERSISTED_LOOKBACK_DAYS = 2

export interface WeatherWidgetForecast {
  date: string
  temp: number
  tempMin?: number
  tempMax?: number
  code: number
  rainForecastMm: number
  windSpeed: number
  humidity: number
  condition: string
}

interface CachedForecast {
  lat: number
  lng: number
  forecast: WeatherWidgetForecast[]
  cachedAt: number
  expiresAt: number
}

const pendingRequests = new Map<string, Promise<WeatherWidgetForecast[] | null>>()

const hasLocalStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const normalizeDateOnly = (value?: string | Date | null): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return value.toISOString().split('T')[0] || null
  }
  if (typeof value === 'string') {
    return value.split('T')[0] || null
  }
  return null
}

const conditionToCode = (condition?: string | null): number => {
  const normalized = (condition || '').toLowerCase()
  if (!normalized) return 3
  if (normalized.includes('tempor') || normalized.includes('storm')) return 95
  if (normalized.includes('neve') || normalized.includes('snow')) return 71
  if (
    normalized.includes('piogg') ||
    normalized.includes('rovesc') ||
    normalized.includes('rain') ||
    normalized.includes('drizzle')
  ) {
    return 61
  }
  if (normalized.includes('nebb') || normalized.includes('fog')) return 45
  if (normalized.includes('sereno') || normalized.includes('sun') || normalized.includes('clear')) {
    return 0
  }
  return 3
}

export const normalizeForecastEntry = (entry: unknown): WeatherWidgetForecast | null => {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const candidate = entry as Record<string, unknown>
  const date = normalizeDateOnly(
    (candidate.date as string | Date | undefined) ||
      (candidate.forecastDate as string | undefined)
  )
  if (!date) {
    return null
  }

  const tempMax = Number(candidate.tempMax ?? candidate.temp_max)
  const tempMin = Number(candidate.tempMin ?? candidate.temp_min)
  const fallbackTemp = Number(candidate.temp)
  const humidity = Number(candidate.humidity ?? candidate.humidityAvg ?? candidate.humidity_avg ?? 60)
  const rainForecastMm = Number(
    candidate.rainForecastMm ?? candidate.precipitationMm ?? candidate.precipitation ?? candidate.rainMm ?? 0
  )
  const windSpeed = Number(candidate.windSpeed ?? candidate.wind_speed ?? candidate.windSpeedMax ?? 0)
  const condition = String(candidate.condition ?? 'Variabile')
  const code = Number(candidate.code ?? candidate.weathercode ?? conditionToCode(condition))

  const resolvedTempMax = Number.isFinite(tempMax) ? tempMax : undefined
  const resolvedTempMin = Number.isFinite(tempMin) ? tempMin : undefined
  const temp =
    Number.isFinite(fallbackTemp)
      ? fallbackTemp
      : Number.isFinite(tempMax) && Number.isFinite(tempMin)
        ? Number(((tempMax + tempMin) / 2).toFixed(1))
        : Number.isFinite(tempMax)
          ? tempMax
          : Number.isFinite(tempMin)
            ? tempMin
            : 20

  return {
    date,
    temp,
    tempMin: resolvedTempMin,
    tempMax: resolvedTempMax,
    code: Number.isFinite(code) ? code : 3,
    rainForecastMm: Number.isFinite(rainForecastMm) ? rainForecastMm : 0,
    windSpeed: Number.isFinite(windSpeed) ? windSpeed : 0,
    humidity: Number.isFinite(humidity) ? humidity : 60,
    condition,
  }
}

export const normalizeForecastList = (forecast: unknown[]): WeatherWidgetForecast[] =>
  forecast
    .map((entry) => normalizeForecastEntry(entry))
    .filter((entry): entry is WeatherWidgetForecast => Boolean(entry))

export const buildWidgetForecastFromPersistedSnapshots = (
  snapshots: PersistedForecastSnapshot[]
): WeatherWidgetForecast[] =>
  snapshots
    .map((snapshot) =>
      normalizeForecastEntry({
        date: snapshot.forecastDate,
        tempMin: snapshot.tempMin,
        tempMax: snapshot.tempMax,
        precipitationMm: snapshot.precipitationMm,
        humidityAvg: snapshot.humidityAvg,
        windSpeedMax: snapshot.windSpeedMax,
        condition: snapshot.condition,
      })
    )
    .filter((entry): entry is WeatherWidgetForecast => Boolean(entry))

const readLocalCache = (): CachedForecast[] => {
  if (!hasLocalStorage()) {
    return []
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!saved) {
      return []
    }

    const parsed = JSON.parse(saved) as CachedForecast[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error reading weather cache from localStorage', error)
    return []
  }
}

const writeLocalCache = (cache: CachedForecast[]) => {
  if (!hasLocalStorage()) {
    return
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Error writing weather cache to localStorage', error)
  }
}

const cacheForecastLocal = (
  lat: number,
  lng: number,
  forecast: WeatherWidgetForecast[]
): void => {
  const now = Date.now()
  const cache = readLocalCache()
    .filter((entry) => entry.expiresAt > now)
    .filter((entry) => Math.abs(entry.lat - lat) >= 0.01 || Math.abs(entry.lng - lng) >= 0.01)

  cache.push({
    lat,
    lng,
    forecast,
    cachedAt: now,
    expiresAt: now + CACHE_TTL_MS,
  })

  writeLocalCache(cache.slice(-10))
}

const getPersistedForecast = async (
  lat: number,
  lng: number
): Promise<WeatherWidgetForecast[] | null> => {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return null
  }

  const today = new Date()
  const endDate = today.toISOString().split('T')[0]
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - PERSISTED_LOOKBACK_DAYS)

  const { data, error } = await supabase
    .from('daily_weather_log')
    .select('log_date, raw_data, location_latitude, location_longitude')
    .gte('log_date', startDate.toISOString().split('T')[0])
    .lte('log_date', endDate)
    .gte('location_latitude', lat - PERSISTED_COORD_TOLERANCE)
    .lte('location_latitude', lat + PERSISTED_COORD_TOLERANCE)
    .gte('location_longitude', lng - PERSISTED_COORD_TOLERANCE)
    .lte('location_longitude', lng + PERSISTED_COORD_TOLERANCE)
    .order('log_date', { ascending: false })
    .limit(12)

  if (error || !Array.isArray(data) || data.length === 0) {
    return null
  }

  const rankedRows = data
    .map((row) => {
      const locationLat = Number((row as { location_latitude?: number | null }).location_latitude ?? lat)
      const locationLng = Number((row as { location_longitude?: number | null }).location_longitude ?? lng)
      return {
        row,
        proximity: Math.abs(locationLat - lat) + Math.abs(locationLng - lng),
      }
    })
    .sort((left, right) => {
      if (left.proximity !== right.proximity) {
        return left.proximity - right.proximity
      }

      return String((right.row as { log_date?: string }).log_date || '').localeCompare(
        String((left.row as { log_date?: string }).log_date || '')
      )
    })

  const persistedSnapshots = rankedRows
    .map(({ row }) => {
      const rawData = (row as { raw_data?: Record<string, unknown> | null }).raw_data
      return Array.isArray(rawData?.forecastSnapshots)
        ? (rawData?.forecastSnapshots as PersistedForecastSnapshot[])
        : []
    })
    .find((snapshots) => snapshots.length > 0)

  if (!persistedSnapshots || persistedSnapshots.length === 0) {
    return null
  }

  const normalized = buildWidgetForecastFromPersistedSnapshots(persistedSnapshots)
  return normalized.length > 0 ? normalized : null
}

export const getCachedForecast = async (
  lat: number,
  lng: number
): Promise<WeatherWidgetForecast[] | null> => {
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`
  const pending = pendingRequests.get(cacheKey)
  if (pending) {
    console.log('⏳ Weather cache: Reusing pending request for', cacheKey)
    return pending
  }

  const requestPromise = (async () => {
    try {
      const now = Date.now()
      const cached = readLocalCache().find(
        (entry) =>
          Math.abs(entry.lat - lat) < 0.01 &&
          Math.abs(entry.lng - lng) < 0.01 &&
          entry.expiresAt > now
      )

      if (cached && cached.forecast.length > 0) {
        console.log('✅ Weather cache: Found in localStorage for', cacheKey)
        return cached.forecast
      }

      const persisted = await getPersistedForecast(lat, lng)
      if (persisted && persisted.length > 0) {
        cacheForecastLocal(lat, lng, persisted)
        console.log('✅ Weather cache: Rehydrated from persisted daily weather log for', cacheKey)
        return persisted
      }

      return null
    } finally {
      pendingRequests.delete(cacheKey)
    }
  })()

  pendingRequests.set(cacheKey, requestPromise)
  return requestPromise
}

export const cacheForecast = async (
  lat: number,
  lng: number,
  forecast: WeatherForecast[] | WeatherWidgetForecast[]
): Promise<void> => {
  const normalized = normalizeForecastList(forecast)
  if (normalized.length === 0) {
    return
  }

  cacheForecastLocal(lat, lng, normalized)
  console.log('✅ Weather cache: Saved normalized forecast to localStorage for', `${lat.toFixed(4)}_${lng.toFixed(4)}`)
}

export const cleanupExpiredCache = async (): Promise<void> => {
  if (!hasLocalStorage()) {
    return
  }

  const now = Date.now()
  const valid = readLocalCache().filter((entry) => entry.expiresAt > now)
  writeLocalCache(valid)
}
