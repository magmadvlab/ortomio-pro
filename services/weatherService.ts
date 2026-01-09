import { Garden } from '../types';
import { getEffectiveTemperature, getEffectiveMinTemperature } from './sensorDataService';
import { getWeatherForecastWithProvider } from './weatherProviderAdapter';

export interface WeatherForecast {
  temp: number; // Temperatura corrente
  tempMin?: number; // Temperatura minima prevista
  tempMax?: number; // Temperatura massima prevista
  code: number; // Weather code (0 = clear, etc.)
  rainForecastMm: number; // Pioggia prevista in mm
  date?: string; // Date for multi-day forecasts
  humidity?: number; // Humidity percentage
  windSpeed?: number; // Wind speed in km/h
}

export interface WeatherAlert {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'FROST' | 'HEATWAVE' | 'HEAVYRAIN' | 'DROUGHT';
  message: string;
  actionRequired: string[];
  date?: string;
}

export interface TransplantConditions {
  isSuitable: boolean;
  reason: string;
  currentMinTemp?: number;
  requiredMinTemp: number;
}

/**
 * Recupera le previsioni meteo da Open-Meteo API (singolo giorno)
 */
export const getWeatherForecast = async (
  lat: number,
  lng: number
): Promise<WeatherForecast | null> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weathercode&timezone=auto`
    );
    const data = await response.json();
    
    if (data.current_weather && data.daily) {
      return {
        temp: data.current_weather.temperature,
        tempMin: data.daily.temperature_2m_min?.[0],
        tempMax: data.daily.temperature_2m_max?.[0],
        code: data.current_weather.weathercode,
        rainForecastMm: data.daily.precipitation_sum?.[0] || 0,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Weather fetch failed", error);
    return null;
  }
};

/**
 * Recupera previsioni meteo per 7 giorni
 * Usa provider configurato personalizzato se disponibile, altrimenti Open-Meteo (default)
 */
export const getWeatherForecast7Days = async (
  lat: number,
  lng: number
): Promise<WeatherForecast[]> => {
  try {
    // Prova prima provider personalizzato
    const customForecast = await getWeatherForecastWithProvider(lat, lng, 7);
    if (customForecast && customForecast.length > 0) {
      return customForecast;
    }
  } catch (error) {
    console.warn('Errore recupero forecast da provider personalizzato, uso default:', error);
  }

  // Fallback a Open-Meteo (default)
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weathercode&timezone=auto&forecast_days=7`
    );
    
    if (!response.ok) {
      console.error(`Weather API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    if (data.daily && data.daily.time) {
      return data.daily.time.map((date: string, i: number) => ({
        temp: (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2,
        tempMin: data.daily.temperature_2m_min[i],
        tempMax: data.daily.temperature_2m_max[i],
        code: data.daily.weathercode[i],
        rainForecastMm: data.daily.precipitation_sum[i] || 0,
        date,
        humidity: undefined,
        windSpeed: undefined,
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Weather forecast 7 days failed", error);
    return [];
  }
};

/**
 * Generate weather alerts based on forecast
 */
export const generateWeatherAlerts = (
  forecast: WeatherForecast[],
  activePlants?: Array<{ plantName: string; minTemp?: number }>
): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];

  // Check for frost
  const frostDays = forecast.filter(f => f.tempMin !== undefined && f.tempMin < 2);
  if (frostDays.length > 0) {
    const sensitivePlants = activePlants?.filter(p => (p.minTemp || 10) > 10) || [];
    
    if (sensitivePlants.length > 0) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'FROST',
        message: `⚠️ GELATA PREVISTA: ${frostDays[0].date || 'Oggi'} (Min: ${frostDays[0].tempMin?.toFixed(1)}°C)`,
        actionRequired: [
          `Copri immediatamente: ${sensitivePlants.map(p => p.plantName).join(', ')}`,
          'Usa teli TNT o campane di plastica',
          'Se in vaso, sposta al riparo',
          'Annaffia leggermente al mattino (acqua rilascia calore)',
        ],
        date: frostDays[0].date,
      });
    }
  }

  // Check for heatwave (3+ days >35°C)
  const heatDays = forecast.filter(f => f.tempMax !== undefined && f.tempMax > 35);
  if (heatDays.length >= 3) {
    alerts.push({
      severity: 'HIGH',
      type: 'HEATWAVE',
      message: `🔥 ONDATA DI CALORE: ${heatDays.length} giorni > 35°C`,
      actionRequired: [
        'Installa teli ombreggianti (50%) su Lattughe, Spinaci',
        'Sposta irrigazione a prima mattina (5-7am) per evitare evaporazione',
        'Aumenta frequenza irrigazione Pomodori/Peperoni',
        'Pacciamatura d\'emergenza se non fatta',
      ],
    });
  }

  // Check for heavy rain (2+ days >20mm)
  const rainDays = forecast.filter(f => f.rainForecastMm > 20);
  if (rainDays.length >= 2) {
    alerts.push({
      severity: 'MEDIUM',
      type: 'HEAVYRAIN',
      message: `☔ PIOGGE INTENSE PREVISTE: ${rainDays.length} giorni con >20mm`,
      actionRequired: [
        'Sospendi irrigazione per i prossimi giorni',
        'Se terreno argilloso: verifica che non ci siano ristagni',
        'Zappa leggermente dopo pioggia per arieggiare',
      ],
    });
  }

  // Check for drought (7+ days without rain, low humidity)
  const dryDays = forecast.filter(f => f.rainForecastMm === 0);
  if (dryDays.length >= 7 && forecast[0]?.humidity && forecast[0].humidity < 40) {
    alerts.push({
      severity: 'MEDIUM',
      type: 'DROUGHT',
      message: `🏜️ SICCITÀ: 7+ giorni senza pioggia, umidità <40%`,
      actionRequired: [
        'Verifica che pacciamatura sia intatta',
        'Controlla impianto irrigazione',
        'Aumenta frequenza per terreni sabbiosi',
        'Nebulizza foglie di Lattughe/Spinaci alla sera',
      ],
    });
  }

  return alerts;
};

/**
 * Verifica se le condizioni meteo sono adatte per il trapianto
 * Controlla che la temperatura minima notturna sia sopra la soglia richiesta
 * Versione legacy: usa solo lat/lng (per retrocompatibilità)
 */
export const checkTransplantConditions = async (
  lat: number,
  lng: number,
  minTemp: number
): Promise<TransplantConditions> => {
  const forecast = await getWeatherForecast(lat, lng);
  
  if (!forecast) {
    return {
      isSuitable: false,
      reason: "Impossibile recuperare le previsioni meteo. Verifica la connessione.",
      requiredMinTemp: minTemp,
    };
  }
  
  // Usa la temperatura minima prevista (notturna) se disponibile, altrimenti usa la corrente
  const currentMinTemp = forecast.tempMin ?? forecast.temp;
  
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
};

/**
 * Verifica se le condizioni sono adatte per il trapianto usando sensori + meteo
 * Versione avanzata: usa sensori IoT se disponibili, altrimenti API meteo
 */
export const checkTransplantConditionsWithSensors = async (
  garden: Garden,
  minTemp: number,
  zoneId?: string
): Promise<TransplantConditions> => {
  try {
    // Usa temperatura effettiva da sensori o API
    const tempResult = await getEffectiveMinTemperature(garden, zoneId);
    const currentMinTemp = tempResult.temperature;
    
    const sourceInfo = tempResult.source === 'sensor' 
      ? `sensore ${tempResult.sensorType} (${tempResult.confidence * 100}% confidenza)`
      : tempResult.source === 'weather_api'
      ? 'previsioni meteo'
      : 'stima';

    if (currentMinTemp < minTemp) {
      return {
        isSuitable: false,
        reason: `La temperatura minima attuale (${currentMinTemp.toFixed(1)}°C da ${sourceInfo}) è inferiore a quella richiesta (${minTemp}°C). Aspetta che le notti si riscaldino.`,
        currentMinTemp,
        requiredMinTemp: minTemp,
      };
    }
    
    return {
      isSuitable: true,
      reason: `Le condizioni sono adatte: temperatura minima attuale ${currentMinTemp.toFixed(1)}°C da ${sourceInfo} (richiesta: ${minTemp}°C).`,
      currentMinTemp,
      requiredMinTemp: minTemp,
    };
  } catch (error) {
    console.error('Errore verifica condizioni trapianto:', error);
    // Fallback a versione legacy
    if (garden.coordinates) {
      return checkTransplantConditions(
        garden.coordinates.latitude,
        garden.coordinates.longitude,
        minTemp
      );
    }
    
    return {
      isSuitable: false,
      reason: "Impossibile verificare le condizioni meteo. Verifica la connessione.",
      requiredMinTemp: minTemp,
    };
  }
};

export interface CriticalWeatherAlert {
  type: 'frost' | 'heat' | 'heavy_rain';
  severity: 'Critical' | 'High' | 'Medium';
  message: string;
  icon: string; // Nome icona per lucide-react
}

/**
 * Verifica condizioni meteo critiche e genera alert
 */
export const checkCriticalWeatherAlerts = (
  forecast: WeatherForecast
): CriticalWeatherAlert[] => {
  const alerts: CriticalWeatherAlert[] = [];
  
  // Alert gelata tardiva (minime < 0°C)
  if (forecast.tempMin !== undefined && forecast.tempMin < 0) {
    alerts.push({
      type: 'frost',
      severity: 'Critical',
      message: `⚠️ GELATA IN ARRIVO! Stanotte previsti ${forecast.tempMin.toFixed(1)}°C. Copri le piante sensibili!`,
      icon: 'Snowflake'
    });
  }
  
  // Alert ondata di calore (massime > 35°C)
  if (forecast.tempMax !== undefined && forecast.tempMax > 35) {
    alerts.push({
      type: 'heat',
      severity: 'High',
      message: `🌡️ CALDO ESTREMO! ${forecast.tempMax.toFixed(1)}°C previsti. Aumenta irrigazione e ombreggia!`,
      icon: 'ThermometerSun'
    });
  }
  
  // Alert pioggia intensa (> 20mm)
  if (forecast.rainForecastMm > 20) {
    alerts.push({
      type: 'heavy_rain',
      severity: 'Medium',
      message: `🌧️ PIOGGIA INTENSA! ${forecast.rainForecastMm.toFixed(1)}mm previsti. Sospendi irrigazione!`,
      icon: 'CloudRain'
    });
  }
  
  return alerts;
};

/**
 * Controlla rischi sanitari basati su meteo
 * Converte alert meteo in formato HealthAlert per HealthDashboard
 */
export async function checkWeatherHealthRisks(garden: Garden): Promise<Array<{
  type: 'weather' | 'disease' | 'pest' | 'nutrient'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  affectedPlants?: string[]
  action?: string
}>> {
  const alerts: Array<{
    type: 'weather' | 'disease' | 'pest' | 'nutrient'
    severity: 'critical' | 'high' | 'medium' | 'low'
    message: string
    affectedPlants?: string[]
    action?: string
  }> = []
  
  if (!garden.coordinates) {
    return alerts
  }
  
  try {
    const forecast = await getWeatherForecast(
      garden.coordinates.latitude,
      garden.coordinates.longitude
    )
    
    if (!forecast) {
      return alerts
    }
    
    // Alert pioggia eccessiva → rischio peronospora
    if (forecast.rainForecastMm > 10) {
      alerts.push({
        type: 'disease',
        severity: forecast.rainForecastMm > 20 ? 'high' : 'medium',
        message: `Pioggia prevista domani (${forecast.rainForecastMm.toFixed(1)}mm). Rischio peronospora per pomodori e zucchine.`,
        affectedPlants: ['Pomodoro', 'Zucchina', 'Patata'],
        action: 'Proteggi con coperture o anticipa trattamenti preventivi'
      })
    }
    
    // Alert gelata
    if (forecast.tempMin !== undefined && forecast.tempMin < 2) {
      alerts.push({
        type: 'weather',
        severity: 'critical',
        message: `Gelata prevista stanotte (${forecast.tempMin.toFixed(1)}°C). Proteggi le piante sensibili!`,
        action: 'Copri con teli TNT o sposta al riparo se in vaso'
      })
    }
    
    // Alert caldo estremo
    if (forecast.tempMax !== undefined && forecast.tempMax > 35) {
      alerts.push({
        type: 'nutrient',
        severity: 'high',
        message: `Caldo estremo previsto (${forecast.tempMax.toFixed(1)}°C). Aumenta irrigazione e ombreggia.`,
        action: 'Irriga al mattino presto e installa teli ombreggianti'
      })
    }
    
    // Alert siccità
    if (forecast.rainForecastMm === 0 && forecast.tempMax !== undefined && forecast.tempMax > 25) {
      alerts.push({
        type: 'nutrient',
        severity: 'medium',
        message: 'Nessuna pioggia prevista con temperature elevate. Aumenta frequenza irrigazione.',
        action: 'Verifica pacciamatura e aumenta irrigazione per terreni sabbiosi'
      })
    }
  } catch (error) {
    console.error('Error checking weather health risks:', error)
  }
  
  return alerts
}




