/**
 * Historical Weather Service
 * Recupera dati meteo storici per calcolare temperature medie per periodo stagionale
 * Usa Open-Meteo Historical Weather API
 */

export interface HistoricalWeatherData {
  period: 'Feb-Mar' | 'Apr-Mag' | 'Giu-Lug' | 'Ago-Set';
  avgTemp: number; // Temperatura media
  minTemp: number; // Temperatura minima
  maxTemp: number; // Temperatura massima
  tempRange: number; // Escursione termica (max - min)
  year?: number; // Anno di riferimento (default: anno corrente)
}

/**
 * Cache locale per evitare troppe chiamate API
 */
const weatherCache = new Map<string, HistoricalWeatherData>();

/**
 * Genera chiave cache per coordinate e periodo
 */
function getCacheKey(lat: number, lng: number, period: HistoricalWeatherData['period'], year?: number): string {
  const y = year || new Date().getFullYear();
  return `${lat.toFixed(2)}_${lng.toFixed(2)}_${period}_${y}`;
}

/**
 * Converte periodo stagionale in range di date per API
 */
function periodToDateRange(period: HistoricalWeatherData['period'], year: number): { start: string; end: string } {
  const ranges: Record<HistoricalWeatherData['period'], { startMonth: number; endMonth: number }> = {
    'Feb-Mar': { startMonth: 2, endMonth: 3 },
    'Apr-Mag': { startMonth: 4, endMonth: 5 },
    'Giu-Lug': { startMonth: 6, endMonth: 7 },
    'Ago-Set': { startMonth: 8, endMonth: 9 },
  };

  const { startMonth, endMonth } = ranges[period];
  const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(endMonth).padStart(2, '0')}-${new Date(year, endMonth, 0).getDate()}`;

  return { start: startDate, end: endDate };
}

/**
 * Recupera dati meteo storici per un periodo specifico
 *
 * @param lat Latitudine
 * @param lng Longitudine
 * @param period Periodo stagionale
 * @param year Anno (default: anno precedente se periodo futuro, altrimenti anno corrente)
 * @returns Dati meteo storici o null se errore
 */
export async function getHistoricalWeatherForPeriod(
  lat: number,
  lng: number,
  period: HistoricalWeatherData['period'],
  year?: number
): Promise<HistoricalWeatherData | null> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Se l'anno non è specificato, usa l'anno corrente
  let targetYear = year || currentYear;

  // Se il periodo richiesto è nel futuro, usa l'anno precedente
  // (Archive API supporta solo dati storici)
  const { start } = periodToDateRange(period, targetYear);
  const periodStartDate = new Date(start);

  if (periodStartDate > currentDate) {
    console.log(`Requested period ${period} ${targetYear} is in the future, using previous year data`);
    targetYear = currentYear - 1;
  }

  const cacheKey = getCacheKey(lat, lng, period, targetYear);

  // Controlla cache
  if (weatherCache.has(cacheKey)) {
    return weatherCache.get(cacheKey)!;
  }

  try {
    const { start: adjustedStart, end } = periodToDateRange(period, targetYear);

    // Open-Meteo Historical Weather API
    // Endpoint: https://archive-api.open-meteo.com/v1/archive
    // NOTA: Questo endpoint supporta SOLO dati storici (passato)
    // Per previsioni future usare: https://api.open-meteo.com/v1/forecast
    const url = new URL('https://archive-api.open-meteo.com/v1/archive');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lng.toString());
    url.searchParams.set('start_date', adjustedStart);
    url.searchParams.set('end_date', end);
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min');
    url.searchParams.set('timezone', 'Europe/Rome');

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn(`Historical weather API error: ${response.status} for period ${period} ${targetYear} (${adjustedStart} to ${end})`);
      return null;
    }

    const data = await response.json();

    if (!data.daily || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min) {
      return null;
    }

    const maxTemps = data.daily.temperature_2m_max.filter((t: number | null) => t !== null) as number[];
    const minTemps = data.daily.temperature_2m_min.filter((t: number | null) => t !== null) as number[];

    if (maxTemps.length === 0 || minTemps.length === 0) {
      return null;
    }

    // Calcola statistiche
    const avgMax = maxTemps.reduce((sum, t) => sum + t, 0) / maxTemps.length;
    const avgMin = minTemps.reduce((sum, t) => sum + t, 0) / minTemps.length;
    const avgTemp = (avgMax + avgMin) / 2;
    const maxTemp = Math.max(...maxTemps);
    const minTemp = Math.min(...minTemps);
    const tempRange = maxTemp - minTemp;

    const result: HistoricalWeatherData = {
      period,
      avgTemp: Math.round(avgTemp * 10) / 10,
      minTemp: Math.round(minTemp * 10) / 10,
      maxTemp: Math.round(maxTemp * 10) / 10,
      tempRange: Math.round(tempRange * 10) / 10,
      year: targetYear,
    };

    // Salva in cache
    weatherCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    return null;
  }
}

/**
 * Recupera dati meteo storici per tutti i 4 periodi stagionali
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @param year Anno (default: anno corrente)
 * @returns Array di dati meteo storici (può contenere null per periodi non disponibili)
 */
export async function getAllHistoricalWeather(
  lat: number,
  lng: number,
  year?: number
): Promise<(HistoricalWeatherData | null)[]> {
  const periods: HistoricalWeatherData['period'][] = ['Feb-Mar', 'Apr-Mag', 'Giu-Lug', 'Ago-Set'];
  
  const results = await Promise.all(
    periods.map((period) => getHistoricalWeatherForPeriod(lat, lng, period, year))
  );

  return results;
}

/**
 * Stima dati meteo storici basandosi su latitudine e altitudine
 * Fallback quando API non disponibile
 */
export function estimateHistoricalWeather(
  lat: number,
  lng: number,
  period: HistoricalWeatherData['period'],
  altitudeMeters: number = 0
): HistoricalWeatherData {
  // Stime basate su latitudine Italia (36-47°N)
  // Temperature medie approssimative per periodo
  
  const baseTemps: Record<HistoricalWeatherData['period'], { avg: number; range: number }> = {
    'Feb-Mar': { avg: 8, range: 8 }, // 4-12°C
    'Apr-Mag': { avg: 15, range: 10 }, // 10-20°C
    'Giu-Lug': { avg: 24, range: 12 }, // 18-30°C
    'Ago-Set': { avg: 22, range: 10 }, // 17-27°C
  };

  const base = baseTemps[period];
  
  // Correzione per latitudine (Nord più freddo)
  const latCorrection = (lat - 41.5) * -0.5; // -0.5°C per grado più a nord
  
  // Correzione per altitudine (-0.6°C ogni 100m)
  const altCorrection = (altitudeMeters / 100) * -0.6;
  
  const avgTemp = base.avg + latCorrection + altCorrection;
  const minTemp = avgTemp - base.range / 2;
  const maxTemp = avgTemp + base.range / 2;

  return {
    period,
    avgTemp: Math.round(avgTemp * 10) / 10,
    minTemp: Math.round(minTemp * 10) / 10,
    maxTemp: Math.round(maxTemp * 10) / 10,
    tempRange: base.range,
  };
}

