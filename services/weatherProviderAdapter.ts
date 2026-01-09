/**
 * Weather Provider Adapter
 * Adapter per diversi provider meteo (Open-Meteo, WeatherAPI, OpenWeatherMap, etc.)
 * Usa configurazioni API personalizzate quando disponibili
 */

import { getActiveAPIConfiguration, type WeatherServiceType } from './apiConfigurationService';
import { WeatherForecast } from './weatherService';

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

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.daily || !data.daily.time) {
    return [];
  }

  return data.daily.time.map((date: string, i: number) => ({
    temp: (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2,
    tempMin: data.daily.temperature_2m_min[i],
    tempMax: data.daily.temperature_2m_max[i],
    code: data.daily.weathercode[i],
    rainForecastMm: data.daily.precipitation_sum[i] || 0,
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

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`WeatherAPI error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.forecast || !data.forecast.forecastday) {
    return [];
  }

  return data.forecast.forecastday.map((day: any) => ({
    temp: day.day.avgtemp_c,
    tempMin: day.day.mintemp_c,
    tempMax: day.day.maxtemp_c,
    code: day.day.condition.code, // WeatherAPI usa codici diversi
    rainForecastMm: day.day.totalprecip_mm || 0,
    date: day.date,
    humidity: day.day.avghumidity,
    windSpeed: day.day.maxwind_kph,
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

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.list) {
    return [];
  }

  // OpenWeatherMap restituisce dati ogni 3 ore, raggruppiamo per giorno
  const dailyData = new Map<string, { temps: number[]; min: number; max: number; rain: number; code: number }>();

  data.list.forEach((item: any) => {
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

  return Array.from(dailyData.entries()).map(([date, dayData]) => ({
    temp: dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length,
    tempMin: dayData.min,
    tempMax: dayData.max,
    code: dayData.code,
    rainForecastMm: dayData.rain,
    date,
  }));
}

/**
 * Ottiene forecast meteo usando provider configurato o default
 */
export async function getWeatherForecastWithProvider(
  lat: number,
  lng: number,
  days: number = 7
): Promise<WeatherForecast[]> {
  try {
    // Prova prima configurazione personalizzata
    const customConfig = await getActiveAPIConfiguration('weather_openmeteo');
    
    if (customConfig && customConfig.api_key) {
      switch (customConfig.service_type) {
        case 'weather_weatherapi':
          return getWeatherAPIForecast(customConfig.api_key, lat, lng, days);
        case 'weather_openweathermap':
          return getOpenWeatherMapForecast(customConfig.api_key, lat, lng, days);
        case 'weather_custom':
          // TODO: Implementare chiamata a servizio custom usando base_url da config
          if (customConfig.config?.base_url) {
            // Esempio: chiamata a servizio custom
            const url = new URL(`${customConfig.config.base_url}/forecast`);
            url.searchParams.append('lat', lat.toString());
            url.searchParams.append('lng', lng.toString());
            url.searchParams.append('days', days.toString());
            
            const response = await fetch(url.toString(), {
              headers: {
                'Authorization': `Bearer ${customConfig.api_key}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              // Converti formato custom a WeatherForecast[]
              return data.forecast || [];
            }
          }
          break;
        default:
          break;
      }
    }
  } catch (error) {
    console.warn('Errore recupero configurazione meteo personalizzata:', error);
  }

  // Fallback a Open-Meteo (default, gratuito)
  return getOpenMeteoForecast(lat, lng, days);
}

