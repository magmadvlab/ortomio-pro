import type { WeatherData } from '@/types/fieldAlerts';

const OPENMETEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherForecast(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'sunshine_duration',
      'precipitation_probability_max',
      'windspeed_10m_max',
    ].join(','),
    timezone: 'Europe/Rome',
    past_days: '7',
    forecast_days: '1',
  });

  const res = await fetch(`${OPENMETEO_BASE}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`OpenMeteo error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json as WeatherData;
}
