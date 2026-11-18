import { getUserAPIConfigurations } from './apiConfigurationService'
import { getSupabaseClient } from '@/config/supabase'
import type { WeatherForecast } from './weatherService'
export async function getWeatherForecastWithProvider(lat: number, lng: number, days = 7): Promise<WeatherForecast[]> {
  const configurations = await getUserAPIConfigurations()
  const configuration = configurations.filter(config => config.is_active && config.service_type.startsWith('weather_')).sort((a, b) => Number(b.is_default) - Number(a.is_default))[0]
  const { data } = await getSupabaseClient()!.auth.getSession()
  const response = await fetch('/api/api-configurations/weather', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}) }, body: JSON.stringify({ id: configuration?.id, lat, lng, days }) })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Previsioni non disponibili')
  return result.forecast
}
