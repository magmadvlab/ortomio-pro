/**
 * Weather API Service - Open-Meteo Integration
 * API completamente gratuita, no API key richiesta
 * Forecast meteo per calendario (7gg FREE, 15gg PRO)
 */

export interface WeatherData {
  date: Date;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  precipitation_probability: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  icon: string;
  wind_speed: number;
  humidity?: number;
  uv_index: number;
}

/**
 * Ottiene forecast meteo da Open-Meteo API
 * @param lat Latitudine
 * @param lng Longitudine
 * @param days Numero giorni forecast (7 FREE, 15 PRO)
 * @returns Array di WeatherData
 */
export async function getWeatherForecast(
  lat: number,
  lng: number,
  days: number = 7 // FREE: 7, PRO: 15
): Promise<WeatherData[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.append('latitude', lat.toString());
  url.searchParams.append('longitude', lng.toString());
  url.searchParams.append('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'precipitation_probability_max',
    'weathercode',
    'windspeed_10m_max',
    'uv_index_max'
  ].join(','));
  url.searchParams.append('forecast_days', days.toString());
  url.searchParams.append('timezone', 'Europe/Rome');
  
  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Cache 1 ora (Next.js)
    });
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.daily || !data.daily.time) {
      throw new Error('Invalid weather API response');
    }
    
    return data.daily.time.map((dateStr: string, idx: number) => ({
      date: new Date(dateStr),
      temp_max: Math.round(data.daily.temperature_2m_max[idx]),
      temp_min: Math.round(data.daily.temperature_2m_min[idx]),
      precipitation: data.daily.precipitation_sum[idx] || 0,
      precipitation_probability: data.daily.precipitation_probability_max[idx] || 0,
      condition: getConditionFromCode(data.daily.weathercode[idx]),
      icon: getWeatherIcon(data.daily.weathercode[idx]),
      wind_speed: data.daily.windspeed_10m_max[idx] || 0,
      uv_index: data.daily.uv_index_max[idx] || 0
    }));
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

/**
 * Converte WMO Weather Code in condition
 * WMO Weather Code: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
 */
function getConditionFromCode(code: number): WeatherData['condition'] {
  // Clear sky
  if (code === 0) return 'sunny';
  
  // Mainly clear, partly cloudy, overcast
  if (code >= 1 && code <= 3) return 'cloudy';
  
  // Fog
  if (code >= 45 && code <= 48) return 'cloudy';
  
  // Drizzle, rain, freezing rain
  if (code >= 51 && code <= 67) return 'rainy';
  
  // Snow
  if (code >= 71 && code <= 77) return 'snowy';
  
  // Rain showers, snow showers, thunderstorm
  if (code >= 80 && code <= 99) return code >= 95 ? 'stormy' : 'rainy';
  
  // Default
  return 'cloudy';
}

/**
 * Ottiene emoji icona meteo da condition
 */
function getWeatherIcon(code: number): string {
  const condition = getConditionFromCode(code);
  const icons: Record<WeatherData['condition'], string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
    snowy: '❄️'
  };
  return icons[condition] || '☁️';
}

/**
 * Ottiene forecast meteo per oggi
 */
export async function getTodayWeather(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  const forecast = await getWeatherForecast(lat, lng, 1);
  return forecast[0] || null;
}

/**
 * Ottiene forecast meteo per una data specifica
 */
export async function getWeatherForDate(
  lat: number,
  lng: number,
  date: Date,
  days: number = 7
): Promise<WeatherData | null> {
  const forecast = await getWeatherForecast(lat, lng, days);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return forecast.find(w => {
    const wDate = new Date(w.date);
    wDate.setHours(0, 0, 0, 0);
    return wDate.getTime() === targetDate.getTime();
  }) || null;
}
