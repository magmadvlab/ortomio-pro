/**
 * Weather Service - Servizio per recuperare dati meteo reali
 * Integra OpenWeatherMap e Open-Meteo per dati accurati
 */
import { getSupabaseClient } from '@/config/supabase'
import type { Garden } from '@/types';
import type { WeatherSnapshot } from '@/types/environmental'
import type { HealthAlert as AgronomicHealthAlert } from '@/logic/healthAlertEngine';
import {
  evaluateWeatherRisks,
  type WeatherDecision,
  type WeatherHazard,
} from '@/logic/weatherDecisionEngine'
import {
  buildWeatherSnapshotFromPersistedLog,
  resolvePersistedWeatherLogForDate,
  type PersistedDailyWeatherLike,
} from '@/services/environmentalMonitoringService'
import { normalizeGeoCoordinates } from '../utils/coordinates';

interface WeatherData {
  temp: number
  rainMm: number
  condition: string
  humidity: number
  windSpeed: number
  pressure: number
  uvIndex: number
  forecast: WeatherForecast[]
  location: {
    name: string
    lat: number
    lon: number
  }
}

export interface WeatherForecast {
  date: string
  tempMin: number
  tempMax: number
  temp?: number
  condition: string
  rainMm: number
  rainForecastMm?: number
  precipitation?: number
  windSpeed: number
  wind?: number
  code?: number
  weathercode?: number
  temp_min?: number
  temp_max?: number
  wind_speed?: number
  humidity: number
  snowfall?: number
  snowForecastMm?: number
  precipitation_probability?: number
  showers?: number
  max_hourly_precipitation?: number
  max_hourly_showers?: number
  wind_gusts?: number
  cape_max?: number
  hourly_weather_codes?: number[]
}

export interface WeatherAlert extends WeatherDecision {
  type: 'temperature' | 'rain' | 'wind' | 'humidity'
  forecastDate?: string
  dayOffset?: number
}

interface GardenLocation {
  lat: number
  lon: number
  name?: string
}
export type { WeatherSnapshot } from '@/types/environmental'

// Export standalone functions for compatibility
export async function getWeatherForecast(lat: number, lng: number, days: number = 7): Promise<any[]> {
  console.log('🌤️ API METEO: Richiesta per coordinate:', { lat, lng, days });
  
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.append('latitude', lat.toString());
    url.searchParams.append('longitude', lng.toString());
    url.searchParams.append('daily', [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'weather_code',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'showers_sum',
      'precipitation_hours',
      'uv_index_max',
      'snowfall_sum'
    ].join(','));
    url.searchParams.append('hourly', [
      'precipitation',
      'showers',
      'weather_code',
      'wind_gusts_10m',
      'cape',
      'precipitation_probability'
    ].join(','));
    url.searchParams.append('forecast_days', days.toString());
    url.searchParams.append('timezone', 'Europe/Rome');
    
    console.log('🌤️ API METEO URL:', url.toString());
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🌤️ API METEO Risposta:', {
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
      firstDate: data.daily?.time?.[0],
      firstTempMax: data.daily?.temperature_2m_max?.[0]
    });
    
    if (!data.daily || !data.daily.time) {
      throw new Error('Invalid weather API response');
    }
    
    const hourlyTimes: string[] = data.hourly?.time || []
    const hourlyIndexesByDay = new Map<string, number[]>()
    hourlyTimes.forEach((time, index) => {
      const day = String(time).slice(0, 10)
      hourlyIndexesByDay.set(day, [...(hourlyIndexesByDay.get(day) || []), index])
    })
    const maxAtIndexes = (values: unknown[] | undefined, indexes: number[]): number =>
      indexes.reduce((maximum, index) => {
        const value = Number(values?.[index])
        return Number.isFinite(value) ? Math.max(maximum, value) : maximum
      }, 0)

    return data.daily.time.map((dateStr: string, idx: number) => {
      const hourlyIndexes = hourlyIndexesByDay.get(dateStr) || []
      const weatherCode = Number(data.daily.weather_code?.[idx] ?? data.daily.weathercode?.[idx] ?? 0)
      const hourlyWeatherCodes = hourlyIndexes
        .map((index) => Number(data.hourly?.weather_code?.[index] ?? data.hourly?.weathercode?.[index]))
        .filter(Number.isFinite)

      return {
        date: new Date(dateStr),
        temp_max: Math.round(data.daily.temperature_2m_max[idx]),
        temp_min: Math.round(data.daily.temperature_2m_min[idx]),
        precipitation: data.daily.precipitation_sum[idx] || 0,
        precipitation_probability: data.daily.precipitation_probability_max[idx] || 0,
        precipitation_hours: data.daily.precipitation_hours?.[idx] || 0,
        showers: data.daily.showers_sum?.[idx] || 0,
        max_hourly_precipitation: maxAtIndexes(data.hourly?.precipitation, hourlyIndexes),
        max_hourly_showers: maxAtIndexes(data.hourly?.showers, hourlyIndexes),
        condition: getConditionFromCode(weatherCode),
        weathercode: weatherCode,
        hourly_weather_codes: hourlyWeatherCodes,
        wind_speed: data.daily.wind_speed_10m_max[idx] || 0,
        wind_gusts: Math.max(
          Number(data.daily.wind_gusts_10m_max?.[idx] || 0),
          maxAtIndexes(data.hourly?.wind_gusts_10m, hourlyIndexes)
        ),
        cape_max: maxAtIndexes(data.hourly?.cape, hourlyIndexes),
        uv_index: data.daily.uv_index_max[idx] || 0,
        snowfall: data.daily.snowfall_sum?.[idx] || 0
      }
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return [];
  }
}

export async function getWeatherForecast7Days(lat: number, lng: number): Promise<any[]> {
  return getWeatherForecast(lat, lng, 7);
}

export function generateWeatherAlerts(
  forecast: any[], 
  activePlants: Array<{ plantName: string; minTemp?: number }> = []
): WeatherAlert[] {
  if (!forecast || forecast.length === 0) return []

  const hazardType: Record<WeatherHazard, WeatherAlert['type']> = {
    heat: 'temperature',
    frost: 'temperature',
    heavy_rain: 'rain',
    flash_flood: 'rain',
    strong_wind: 'wind',
    violent_wind: 'wind',
    severe_thunderstorm: 'wind',
    hail: 'rain',
    snow: 'temperature',
  }

  const horizonAlerts = forecast.slice(0, 3).flatMap((day, dayOffset) => {
    const weatherCodes = [
      day.weathercode,
      day.code,
      ...(Array.isArray(day.hourly_weather_codes) ? day.hourly_weather_codes : []),
    ].map(Number).filter(Number.isFinite)
    const dayLabel = dayOffset === 0 ? '' : dayOffset === 1 ? 'Domani: ' : `Tra ${dayOffset} giorni: `

    return evaluateWeatherRisks({
      tempMax: day.temp_max ?? day.tempMax ?? day.temp,
      tempMin: day.temp_min ?? day.tempMin ?? day.temp,
      precipitationTotalMm: day.precipitation ?? day.rainMm ?? day.rainForecastMm,
      precipitationProbabilityMax: day.precipitation_probability,
      maxHourlyPrecipitationMm: day.max_hourly_precipitation,
      showersTotalMm: day.showers,
      maxHourlyShowersMm: day.max_hourly_showers,
      windSpeedMaxKmh: day.wind_speed ?? day.windSpeed ?? day.wind,
      windGustMaxKmh: day.wind_gusts,
      capeMaxJkg: day.cape_max,
      snowfallCm: day.snowfall,
      weatherCodes,
    }).map((decision) => ({
      ...decision,
      message: `${dayLabel}${decision.message}`,
      type: hazardType[decision.hazard],
      forecastDate: day.date instanceof Date ? day.date.toISOString() : day.date,
      dayOffset,
    }))
  })

  const severityRank = { HIGH: 3, MEDIUM: 2, LOW: 1 }
  const urgencyRank = { immediate: 3, today: 2, monitor: 1 }
  const bestByHazard = new Map<WeatherHazard, WeatherAlert>()
  horizonAlerts.forEach((alert) => {
    const previous = bestByHazard.get(alert.hazard)
    const alertRank = severityRank[alert.severity] * 10 + urgencyRank[alert.urgency]
    const previousRank = previous
      ? severityRank[previous.severity] * 10 + urgencyRank[previous.urgency]
      : -1
    if (!previous || alertRank > previousRank || (alertRank === previousRank && (alert.dayOffset || 0) < (previous.dayOffset || 0))) {
      bestByHazard.set(alert.hazard, alert)
    }
  })

  return [...bestByHazard.values()].sort((left, right) =>
    severityRank[right.severity] - severityRank[left.severity] ||
    urgencyRank[right.urgency] - urgencyRank[left.urgency] ||
    (left.dayOffset || 0) - (right.dayOffset || 0)
  )
}

export interface CriticalWeatherAlert {
  type: WeatherHazard
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  message: string
  action: string
  steps: string[]
  forecastDate?: string
}

/**
 * Verifica allarmi meteo critici per il cron notifiche.
 * Usa il primo giorno disponibile del forecast (oggi).
 */
export function checkCriticalWeatherAlerts(forecast: any[]): CriticalWeatherAlert[] {
  return generateWeatherAlerts(forecast)
    .filter((alert) => alert.severity === 'HIGH')
    .map((alert) => ({
      type: alert.hazard,
      severity: alert.severity,
      message: `${alert.message}. ${alert.action}`,
      action: alert.action,
      steps: alert.steps,
      forecastDate: alert.forecastDate,
    }))
}

/**
 * Adapter legacy usato dall'health system.
 * Traduce gli alert meteo generici nel formato del motore salute.
 */
export async function checkWeatherHealthRisks(garden: Garden): Promise<AgronomicHealthAlert[]> {
  if (!garden.coordinates) return []

  try {
    const normalized = normalizeGeoCoordinates({
      latitude: garden.coordinates.latitude,
      longitude: garden.coordinates.longitude
    })
    const latitude = normalized?.latitude ?? garden.coordinates.latitude
    const longitude = normalized?.longitude ?? garden.coordinates.longitude

    const forecast = await getWeatherForecast(latitude, longitude, 1)
    const alerts = generateWeatherAlerts(forecast)

    return alerts.map((alert) => ({
      type: 'weather',
      severity:
        alert.severity === 'HIGH'
          ? 'high'
          : alert.severity === 'MEDIUM'
            ? 'medium'
            : 'low',
      message: alert.message,
      action: alert.action,
      urgency:
        alert.severity === 'HIGH'
          ? 'immediate'
          : alert.severity === 'MEDIUM'
            ? 'soon'
            : 'monitor',
      confidence:
        alert.severity === 'HIGH'
          ? 90
          : alert.severity === 'MEDIUM'
            ? 80
            : 70
    }))
  } catch (error) {
    console.error('Error checking weather health risks:', error)
    return []
  }
}

function getConditionFromCode(code: number): string {
  if (code <= 3) return 'sunny';
  if (code <= 48) return 'cloudy';
  if (code <= 67) return 'rainy';
  if (code <= 77) return 'snowy';
  return 'stormy';
}

class WeatherService {
  private readonly OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minuti
  private readonly PERSISTED_COORD_TOLERANCE = 0.2
  private readonly PERSISTED_LOOKBACK_DAYS = 7
  private cache = new Map<string, { data: WeatherData; timestamp: number }>()

  private readSavedUserLocation(): GardenLocation | null {
    try {
      const savedLocation = localStorage.getItem('userLocation')
      if (!savedLocation) return null

      const parsed = JSON.parse(savedLocation)
      const lat = Number(parsed?.lat)
      const lon = Number(parsed?.lon)
      const timestamp = Number(parsed?.timestamp || 0)
      const isFresh = Date.now() - timestamp < 24 * 60 * 60 * 1000

      if (!Number.isFinite(lat) || !Number.isFinite(lon) || !isFresh) {
        return null
      }

      return {
        lat,
        lon,
        name: parsed?.name || 'Posizione salvata'
      }
    } catch {
      return null
    }
  }

  /**
   * Ottiene dati meteo per una posizione specifica
   */
  async getWeatherForLocation(location: GardenLocation): Promise<WeatherData> {
    const cacheKey = `${location.lat}_${location.lon}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Prova prima con OpenWeatherMap se disponibile
      if (this.OPENWEATHER_API_KEY) {
        const weatherData = await this.fetchFromOpenWeatherMap(location)
        this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() })
        return weatherData
      } else {
        // Fallback su Open-Meteo (gratuito)
        const weatherData = await this.fetchFromOpenMeteo(location)
        this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() })
        return weatherData
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      // Ritorna dati di fallback
      return this.getFallbackWeatherData(location)
    }
  }

  /**
   * Ottiene dati meteo dalla posizione dell'utente
   */
  async getWeatherForUserLocation(): Promise<WeatherData> {
    try {
      // Prima prova a usare la posizione salvata nel localStorage
      const saved = this.readSavedUserLocation()
      if (saved) {
        return await this.getWeatherForLocation(saved)
      }

      // Se non c'è posizione salvata o è scaduta, richiedi nuova posizione
      const position = await this.getCurrentPosition()
      const location: GardenLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: 'La tua posizione'
      }

      // Salva la posizione per uso futuro
      localStorage.setItem('userLocation', JSON.stringify({
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        timestamp: Date.now()
      }))

      return await this.getWeatherForLocation(location)
    } catch (error) {
      console.error('Error getting user location:', error)
      const saved = this.readSavedUserLocation()
      if (saved) {
        try {
          return await this.getWeatherForLocation(saved)
        } catch (savedError) {
          console.error('Error using saved user location fallback:', savedError)
        }
      }

      // Fallback neutro: evita coordinate fisse hardcoded
      return this.getFallbackWeatherData({
        lat: 0,
        lon: 0,
        name: 'Posizione non disponibile'
      })
    }
  }

  /**
   * Ottiene dati meteo per un orto specifico
   */
  async getWeatherForGarden(garden: any): Promise<WeatherData> {
    const coordinates =
      normalizeGeoCoordinates(garden?.coordinates) ??
      normalizeGeoCoordinates(garden?.location?.coordinates) ??
      normalizeGeoCoordinates(garden?.location) ??
      normalizeGeoCoordinates(garden);

    if (coordinates) {
      return await this.getWeatherForLocation({
        lat: coordinates.latitude,
        lon: coordinates.longitude,
        name: garden?.name
      });
    }

    // Se l'orto non ha coordinate valide, usa la posizione dell'utente
    console.log('Garden has no valid coordinates, using user location for weather');
    return await this.getWeatherForUserLocation();
  }

  /**
   * Snapshot meteo compatto per contesto operazioni.
   * Usa la data richiesta invece del meteo "di oggi" per mantenere coerenza storica.
   */
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherSnapshot> {
    return this.getWeatherForDate(latitude, longitude, new Date())
  }

  private async getPersistedWeatherForDate(
    latitude: number,
    longitude: number,
    date: Date
  ): Promise<WeatherSnapshot | null> {
    const supabase = getSupabaseClient()
    if (!supabase || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null
    }

    const targetDate = this.formatWeatherDate(date)
    const lookupStart = new Date(`${targetDate}T12:00:00.000Z`)
    lookupStart.setDate(lookupStart.getDate() - this.PERSISTED_LOOKBACK_DAYS)
    const lookupStartDate = this.formatWeatherDate(lookupStart)
    const tolerance = this.PERSISTED_COORD_TOLERANCE

    const { data, error } = await supabase
      .from('daily_weather_log')
      .select(
        'log_date,temp_min,temp_max,temp_avg,precipitation_mm,humidity_avg,weather_conditions,data_source,raw_data,location_latitude,location_longitude'
      )
      .gte('log_date', lookupStartDate)
      .lte('log_date', targetDate)
      .gte('location_latitude', latitude - tolerance)
      .lte('location_latitude', latitude + tolerance)
      .gte('location_longitude', longitude - tolerance)
      .lte('location_longitude', longitude + tolerance)
      .order('log_date', { ascending: false })
      .limit(24)

    if (error || !Array.isArray(data) || data.length === 0) {
      return null
    }

    const rankedLogs = (
      data as Array<
        PersistedDailyWeatherLike & {
          location_latitude?: number | null
          location_longitude?: number | null
        }
      >
    )
      .map((log) => ({
        ...log,
        proximity:
          Math.abs(Number(log.location_latitude ?? latitude) - latitude) +
          Math.abs(Number(log.location_longitude ?? longitude) - longitude),
      }))
      .sort((left, right) => {
        if (left.proximity !== right.proximity) {
          return left.proximity - right.proximity
        }

        return right.log_date.localeCompare(left.log_date)
      })

    const resolvedLog = resolvePersistedWeatherLogForDate(
      rankedLogs.map(({ proximity, location_latitude, location_longitude, ...log }) => log),
      targetDate,
      { now: new Date() }
    )

    if (!resolvedLog) {
      return null
    }

    return buildWeatherSnapshotFromPersistedLog(resolvedLog, {
      targetDate,
      now: new Date(),
    })
  }

  async getWeatherForDate(latitude: number, longitude: number, date: Date): Promise<WeatherSnapshot> {
    const targetDate = this.formatWeatherDate(date)
    const today = this.formatWeatherDate(new Date())

    try {
      const persistedSnapshot = await this.getPersistedWeatherForDate(latitude, longitude, date)
      if (persistedSnapshot) {
        return persistedSnapshot
      }
    } catch (persistedError) {
      console.warn(`Persisted weather lookup failed for ${targetDate}:`, persistedError)
    }

    const source: WeatherSnapshot['source'] =
      targetDate < today ? 'historical' : targetDate === today ? 'current' : 'forecast'

    try {
      const url = new URL(
        source === 'historical'
          ? 'https://archive-api.open-meteo.com/v1/archive'
          : 'https://api.open-meteo.com/v1/forecast'
      )

      url.searchParams.append('latitude', latitude.toString())
      url.searchParams.append('longitude', longitude.toString())
      url.searchParams.append('start_date', targetDate)
      url.searchParams.append('end_date', targetDate)
      url.searchParams.append(
        'daily',
        [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'weathercode',
          'wind_speed_10m_max'
        ].join(',')
      )
      url.searchParams.append(
        'hourly',
        [
          'relative_humidity_2m',
          'wind_speed_10m',
          'precipitation'
        ].join(',')
      )
      url.searchParams.append('timezone', 'Europe/Rome')

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Open-Meteo date weather error: ${response.status}`)
      }

      const data = await response.json()
      const daily = data?.daily
      if (!daily?.time?.length) {
        throw new Error('Open-Meteo date weather returned no daily data')
      }

      const humidityAvg = this.averageNumbers(data?.hourly?.relative_humidity_2m)
      const windMaxHourly = this.maxNumbers(data?.hourly?.wind_speed_10m)
      const precipitationHourly = this.maxNumbers(data?.hourly?.precipitation)
      const tempMax = Number(daily.temperature_2m_max?.[0])
      const tempMin = Number(daily.temperature_2m_min?.[0])
      const precipitationDaily = Number(daily.precipitation_sum?.[0] ?? 0)
      const windDaily = Number(daily.wind_speed_10m_max?.[0] ?? 0)
      const weatherCode = Number(daily.weathercode?.[0] ?? 0)

      return {
        temperature: Math.round((((tempMax || 20) + (tempMin || 20)) / 2) * 10) / 10,
        humidity: humidityAvg || 60,
        precipitation: precipitationDaily || precipitationHourly || 0,
        windSpeed: windMaxHourly || windDaily || 0,
        condition: getConditionFromCode(weatherCode),
        pressure: 1013,
        source,
        sourceClass:
          source === 'historical'
            ? 'historical_archive'
            : source === 'forecast'
              ? 'forecast'
              : 'current_runtime',
        primarySource: source === 'historical' ? 'open_meteo_archive' : 'open_meteo_forecast',
        signalQuality: source === 'historical' ? 'mixed' : 'mixed',
        regionalConfidence: source === 'historical' ? 'high' : source === 'forecast' ? 'medium' : 'medium',
        localConfidence: 'low',
      }
    } catch (error) {
      console.error(`Error getting weather for ${targetDate}:`, error)
      return {
        temperature: 20,
        humidity: 60,
        precipitation: 0,
        windSpeed: 0,
        condition: 'unknown',
        pressure: 1013,
        source: 'fallback',
        sourceClass: 'synthetic_fallback',
        primarySource: 'fallback_estimated',
        signalQuality: 'estimated',
        regionalConfidence: 'low',
        localConfidence: 'low',
      }
    }
  }

  /**
   * Fetch da OpenWeatherMap (API premium)
   */
  private async fetchFromOpenWeatherMap(location: GardenLocation): Promise<WeatherData> {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=it`
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=it`

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ])

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('OpenWeatherMap API error')
    }

    const currentData = await currentResponse.json()
    const forecastData = await forecastResponse.json()

    return {
      temp: Math.round(currentData.main.temp),
      rainMm: currentData.rain?.['1h'] || 0,
      condition: this.translateCondition(currentData.weather[0].description),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
      pressure: currentData.main.pressure,
      uvIndex: 0, // Richiede chiamata separata
      location: {
        name: location.name || currentData.name,
        lat: location.lat,
        lon: location.lon
      },
      forecast: this.processForecast(forecastData.list)
    }
  }

  /**
   * Fetch da Open-Meteo (gratuito)
   */
  private async fetchFromOpenMeteo(location: GardenLocation): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Open-Meteo API error')
    }

    const data = await response.json()

    return {
      temp: Math.round(data.current_weather.temperature),
      rainMm: data.hourly.precipitation[0] || 0,
      condition: this.getConditionFromWeatherCode(data.current_weather.weathercode),
      humidity: data.hourly.relative_humidity_2m[0] || 0,
      windSpeed: Math.round(data.current_weather.windspeed),
      pressure: 1013, // Non disponibile in Open-Meteo gratuito
      uvIndex: 0, // Non disponibile in Open-Meteo gratuito
      location: {
        name: location.name || 'Posizione corrente',
        lat: location.lat,
        lon: location.lon
      },
      forecast: this.processOpenMeteoForecast(data.daily)
    }
  }

  /**
   * Ottiene posizione corrente dell'utente
   */
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5 minuti
        }
      )
    })
  }

  /**
   * Traduce condizioni meteo in italiano
   */
  private translateCondition(condition: string): string {
    const translations: Record<string, string> = {
      'clear sky': 'Sereno',
      'few clouds': 'Poco nuvoloso',
      'scattered clouds': 'Nuvoloso',
      'broken clouds': 'Molto nuvoloso',
      'overcast clouds': 'Coperto',
      'light rain': 'Pioggia leggera',
      'moderate rain': 'Pioggia',
      'heavy rain': 'Pioggia forte',
      'thunderstorm': 'Temporale',
      'snow': 'Neve',
      'mist': 'Nebbia',
      'fog': 'Nebbia fitta'
    }
    return translations[condition.toLowerCase()] || condition
  }

  /**
   * Converte weather code di Open-Meteo in condizione
   */
  private getConditionFromWeatherCode(code: number): string {
    if (code === 0) return 'Sereno'
    if (code <= 3) return 'Poco nuvoloso'
    if (code <= 48) return 'Nuvoloso'
    if (code <= 57) return 'Pioggerella'
    if (code <= 67) return 'Pioggia'
    if (code <= 77) return 'Neve'
    if (code <= 82) return 'Rovesci'
    if (code <= 99) return 'Temporale'
    return 'Variabile'
  }

  private formatWeatherDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  private averageNumbers(values: unknown): number {
    if (!Array.isArray(values) || values.length === 0) return 0
    const numeric = values
      .map(value => Number(value))
      .filter(value => Number.isFinite(value))
    if (numeric.length === 0) return 0
    return Math.round((numeric.reduce((sum, value) => sum + value, 0) / numeric.length) * 10) / 10
  }

  private maxNumbers(values: unknown): number {
    if (!Array.isArray(values) || values.length === 0) return 0
    const numeric = values
      .map(value => Number(value))
      .filter(value => Number.isFinite(value))
    if (numeric.length === 0) return 0
    return Math.round(Math.max(...numeric) * 10) / 10
  }

  /**
   * Processa previsioni OpenWeatherMap
   */
  private processForecast(forecastList: any[]): WeatherForecast[] {
    const dailyForecasts = new Map<string, any[]>()
    
    // Raggruppa per giorno
    forecastList.forEach(item => {
      const date = item.dt_txt.split(' ')[0]
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, [])
      }
      dailyForecasts.get(date)!.push(item)
    })

    // Crea previsioni giornaliere
    return Array.from(dailyForecasts.entries()).slice(0, 7).map(([date, items]) => {
      const temps = items.map(item => item.main.temp)
      const rains = items.map(item => item.rain?.['3h'] || 0)
      const winds = items.map(item => item.wind.speed * 3.6)
      const humidities = items.map(item => item.main.humidity)

      return {
        date,
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        condition: this.translateCondition(items[0].weather[0].description),
        rainMm: Math.max(...rains),
        windSpeed: Math.round(Math.max(...winds)),
        humidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length)
      }
    })
  }

  /**
   * Processa previsioni Open-Meteo
   */
  private processOpenMeteoForecast(daily: any): WeatherForecast[] {
    return daily.time.slice(0, 7).map((date: string, index: number) => ({
      date,
      tempMin: Math.round(daily.temperature_2m_min[index]),
      tempMax: Math.round(daily.temperature_2m_max[index]),
      condition: 'Variabile', // Open-Meteo gratuito non ha weather codes giornalieri
      rainMm: daily.precipitation_sum[index] || 0,
      windSpeed: Math.round(daily.wind_speed_10m_max[index]),
      humidity: 60 // Stima
    }))
  }

  /**
   * Dati meteo di fallback
   */
  private getFallbackWeatherData(location: GardenLocation): WeatherData {
    const now = new Date()
    const month = now.getMonth()
    
    // Dati stagionali approssimativi per l'Italia
    let temp = 15
    let condition = 'Variabile'
    
    if (month >= 5 && month <= 8) { // Estate
      temp = 25
      condition = 'Soleggiato'
    } else if (month >= 2 && month <= 4) { // Primavera
      temp = 18
      condition = 'Variabile'
    } else if (month >= 9 && month <= 11) { // Autunno
      temp = 12
      condition = 'Nuvoloso'
    } else { // Inverno
      temp = 8
      condition = 'Freddo'
    }

    return {
      temp,
      rainMm: 0,
      condition,
      humidity: 65,
      windSpeed: 10,
      pressure: 1013,
      uvIndex: 3,
      location: {
        name: location.name || 'Posizione non disponibile',
        lat: location.lat,
        lon: location.lon
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tempMin: temp - 5,
        tempMax: temp + 5,
        condition,
        rainMm: Math.random() > 0.7 ? Math.random() * 10 : 0,
        windSpeed: 8 + Math.random() * 10,
        humidity: 60 + Math.random() * 20
      }))
    }
  }

  /**
   * Genera alert meteo intelligenti per l'agricoltura
   */
  generateWeatherAlerts(weather: WeatherData): Array<{
    type: 'info' | 'warning' | 'danger'
    title: string
    message: string
    icon: string
  }> {
    const iconByHazard: Record<WeatherHazard, string> = {
      heat: '🔥',
      frost: '❄️',
      heavy_rain: '🌧️',
      flash_flood: '🌊',
      strong_wind: '💨',
      violent_wind: '🌪️',
      severe_thunderstorm: '⛈️',
      hail: '🧊',
      snow: '🌨️',
    }
    const forecast = weather.forecast?.length > 0
      ? weather.forecast
      : [{
          temp_max: weather.temp,
          temp_min: weather.temp,
          precipitation: weather.rainMm,
          wind_speed: weather.windSpeed,
        }]

    return generateWeatherAlerts(forecast).map((alert) => ({
      type: alert.severity === 'HIGH'
        ? 'danger' as const
        : alert.severity === 'MEDIUM'
          ? 'warning' as const
          : 'info' as const,
      title: alert.message,
      message: alert.action,
      icon: iconByHazard[alert.hazard],
    }))
  }
}

// Interface for transplant conditions check
export interface TransplantConditions {
  isSuitable: boolean;
  reason: string;
  currentMinTemp?: number;
  requiredMinTemp: number;
}

/**
 * Verifica se le condizioni meteo sono adatte per il trapianto
 */
export async function checkTransplantConditions(
  lat: number,
  lng: number,
  minTemp: number
): Promise<TransplantConditions> {
  try {
    const forecast = await getWeatherForecast(lat, lng, 3); // 3 giorni di previsioni
    
    if (!forecast || forecast.length === 0) {
      return {
        isSuitable: false,
        reason: "Impossibile recuperare le previsioni meteo. Verifica la connessione.",
        requiredMinTemp: minTemp,
      };
    }
    
    // Usa la temperatura minima del primo giorno (oggi)
    const today = forecast[0];
    const currentMinTemp = today.temp_min ?? today.temp_max - 10; // Fallback estimate
    
    if (currentMinTemp < minTemp) {
      return {
        isSuitable: false,
        reason: `La temperatura minima prevista (${currentMinTemp.toFixed(1)}°C) è inferiore a quella richiesta (${minTemp}°C). Aspetta che le notti si riscaldino.`,
        currentMinTemp,
        requiredMinTemp: minTemp,
      };
    }
    
    return {
      isSuitable: true,
      reason: `Le condizioni sono adatte: temperatura minima prevista ${currentMinTemp.toFixed(1)}°C (richiesta: ${minTemp}°C).`,
      currentMinTemp,
      requiredMinTemp: minTemp,
    };
  } catch (error) {
    console.error('Error checking transplant conditions:', error);
    return {
      isSuitable: false,
      reason: "Errore nel controllo delle condizioni meteo. Riprova più tardi.",
      requiredMinTemp: minTemp,
    };
  }
}

/**
 * Ottiene dati meteo correnti per coordinate specifiche
 * Funzione helper per operationContextService
 */
export async function getCurrentWeather(latitude: number, longitude: number): Promise<WeatherSnapshot> {
  return weatherService.getCurrentWeather(latitude, longitude)
}

export async function getWeatherForDate(latitude: number, longitude: number, date: Date): Promise<WeatherSnapshot> {
  return weatherService.getWeatherForDate(latitude, longitude, date)
}

export const weatherService = new WeatherService()
export const createWeatherService = () => ({
  getCurrentWeather: weatherService.getCurrentWeather.bind(weatherService),
  getWeatherForDate: weatherService.getWeatherForDate.bind(weatherService)
});

export type { WeatherData, GardenLocation }
