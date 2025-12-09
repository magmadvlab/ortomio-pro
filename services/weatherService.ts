export interface WeatherForecast {
  temp: number; // Temperatura corrente
  tempMin?: number; // Temperatura minima prevista
  tempMax?: number; // Temperatura massima prevista
  code: number; // Weather code (0 = clear, etc.)
  rainForecastMm: number; // Pioggia prevista in mm
}

export interface TransplantConditions {
  isSuitable: boolean;
  reason: string;
  currentMinTemp?: number;
  requiredMinTemp: number;
}

/**
 * Recupera le previsioni meteo da Open-Meteo API
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
 * Verifica se le condizioni meteo sono adatte per il trapianto
 * Controlla che la temperatura minima notturna sia sopra la soglia richiesta
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




