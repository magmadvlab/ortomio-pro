import 'server-only'
import type { APIConfiguration } from './apiConfigurationService'
import type { WeatherForecast } from './weatherService'
interface OpenMeteoProviderResponse {
  daily?: {
    time?: string[]
    temperature_2m_min?: number[]
    temperature_2m_max?: number[]
    precipitation_sum?: number[]
    weathercode?: number[]
  }
}

interface WeatherAPIForecastDay {
  date: string
  day: {
    mintemp_c: number
    maxtemp_c: number
    totalprecip_mm?: number
    avghumidity?: number
    maxwind_kph?: number
    condition?: { text?: string; code?: number }
  }
}

interface OpenWeatherProviderItem {
  dt_txt: string
  main: { temp: number; temp_min: number; temp_max: number }
  weather: Array<{ id: number }>
  rain?: { '3h'?: number }
}

function getConditionFromCode(code: number): string {
  if (code === 0) return 'Sereno';
  if ([1, 2, 3].includes(code)) return 'Parzialmente nuvoloso';
  if ([45, 48].includes(code)) return 'Nebbia';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Pioggia';
  if ([71, 73, 75, 85, 86].includes(code)) return 'Neve';
  if ([95, 96, 99].includes(code)) return 'Temporale';
  return 'Variabile';
}

/**
 * Provider Open-Meteo (default, gratuito, no API key)
 */
async function getOpenMeteoForecast(
  lat: number,
  lng: number,
  days: number = 7
): Promise<WeatherForecast[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.append('latitude', lat.toString());
  url.searchParams.append('longitude', lng.toString());
  url.searchParams.append('daily', [
    'temperature_2m_min',
    'temperature_2m_max',
    'precipitation_sum',
    'weathercode',
  ].join(','));
  url.searchParams.append('forecast_days', days.toString());
  url.searchParams.append('timezone', 'auto');

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.statusText}`);
  }

  const data = await response.json() as OpenMeteoProviderResponse;
  if (!data.daily?.time) {
    return [];
  }

  return data.daily.time.map((date, i) => ({
    tempMin: data.daily?.temperature_2m_min?.[i] ?? 0,
    tempMax: data.daily?.temperature_2m_max?.[i] ?? 0,
    condition: getConditionFromCode(data.daily?.weathercode?.[i] || 0),
    rainMm: data.daily?.precipitation_sum?.[i] || 0,
    rainForecastMm: data.daily?.precipitation_sum?.[i] || 0,
    windSpeed: 0,
    humidity: 0,
    date,
  }));
}

/**
 * Provider WeatherAPI.com
 */
async function getWeatherAPIForecast(
  apiKey: string,
  lat: number,
  lng: number,
  days: number = 7
): Promise<WeatherForecast[]> {
  const url = new URL('https://api.weatherapi.com/v1/forecast.json');
  url.searchParams.append('key', apiKey);
  url.searchParams.append('q', `${lat},${lng}`);
  url.searchParams.append('days', days.toString());
  url.searchParams.append('lang', 'it');

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!response.ok) {
    throw new Error(`WeatherAPI error: ${response.statusText}`);
  }

  const data = await response.json() as { forecast?: { forecastday?: WeatherAPIForecastDay[] } };
  if (!data.forecast?.forecastday) {
    return [];
  }

  return data.forecast.forecastday.map((day) => ({
    tempMin: day.day.mintemp_c,
    tempMax: day.day.maxtemp_c,
    condition: day.day.condition?.text || getConditionFromCode(day.day.condition?.code || 0),
    rainMm: day.day.totalprecip_mm || 0,
    rainForecastMm: day.day.totalprecip_mm || 0,
    date: day.date,
    humidity: day.day.avghumidity ?? 0,
    windSpeed: day.day.maxwind_kph ?? 0,
  }));
}

/**
 * Provider OpenWeatherMap
 */
async function getOpenWeatherMapForecast(
  apiKey: string,
  lat: number,
  lng: number,
  days: number = 7
): Promise<WeatherForecast[]> {
  const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
  url.searchParams.append('lat', lat.toString());
  url.searchParams.append('lon', lng.toString());
  url.searchParams.append('appid', apiKey);
  url.searchParams.append('units', 'metric');
  url.searchParams.append('lang', 'it');

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error: ${response.statusText}`);
  }

  const data = await response.json() as { list?: OpenWeatherProviderItem[] };
  if (!data.list) {
    return [];
  }

  // OpenWeatherMap restituisce dati ogni 3 ore, raggruppiamo per giorno
  const dailyData = new Map<string, { temps: number[]; min: number; max: number; rain: number; code: number }>();

  data.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, {
        temps: [],
        min: item.main.temp_min,
        max: item.main.temp_max,
        rain: 0,
        code: item.weather[0].id,
      });
    }

    const dayData = dailyData.get(date)!;
    dayData.temps.push(item.main.temp);
    dayData.min = Math.min(dayData.min, item.main.temp_min);
    dayData.max = Math.max(dayData.max, item.main.temp_max);
    if (item.rain && item.rain['3h']) {
      dayData.rain += item.rain['3h'];
    }
  });

  return Array.from(dailyData.entries()).slice(0, days).map(([date, dayData]) => ({
    tempMin: dayData.min,
    tempMax: dayData.max,
    condition: getConditionFromCode(dayData.code),
    rainMm: dayData.rain,
    rainForecastMm: dayData.rain,
    windSpeed: 0,
    humidity: 0,
    date,
  }));
}


export async function configuredWeatherForecast(config: APIConfiguration | null, lat: number, lng: number, days: number) {
  if (!config || config.service_type === 'weather_openmeteo') return getOpenMeteoForecast(lat, lng, days)
  if (config.service_type === 'weather_weatherapi') return getWeatherAPIForecast(config.api_key, lat, lng, days)
  if (config.service_type === 'weather_openweathermap') return getOpenWeatherMapForecast(config.api_key, lat, lng, days)
  throw new Error('weather_provider_not_supported')
}
