/**
 * Satellite Data Service
 * Integra dati satellitari per umidità suolo, NDVI, storico meteo
 */

export interface SoilMoistureData {
  lat: number;
  lng: number;
  date: Date;
  moisture: number; // 0-100%
  depth?: number; // cm profondità
}

export interface NDVIData {
  lat: number;
  lng: number;
  date: Date;
  ndvi: number; // -1 to 1
  vegetationHealth: 'poor' | 'moderate' | 'good' | 'excellent';
}

export interface WeatherHistoryData {
  lat: number;
  lng: number;
  date: Date;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  precipitation: number; // mm
  humidity: number; // %
}

/**
 * Recupera umidità suolo da Copernicus o servizi simili
 */
export async function getSoilMoisture(
  lat: number,
  lng: number,
  date?: Date
): Promise<SoilMoistureData | null> {
  // TODO: Integrare con Copernicus Land Service o servizio equivalente
  // Per ora, mock basato su coordinate e stagione
  const targetDate = date || new Date();
  const month = targetDate.getMonth() + 1;

  // Stima semplificata basata su stagione
  let moisture = 50;
  if (month >= 4 && month <= 9) {
    // Estate: generalmente più secco
    moisture = 40 + Math.random() * 20;
  } else {
    // Inverno/primavera: generalmente più umido
    moisture = 50 + Math.random() * 30;
  }

  return {
    lat,
    lng,
    date: targetDate,
    moisture: Math.round(moisture),
    depth: 10, // cm
  };
}

/**
 * Recupera NDVI (Normalized Difference Vegetation Index)
 */
export async function getNDVI(
  lat: number,
  lng: number,
  date?: Date
): Promise<NDVIData | null> {
  // TODO: Integrare con Sentinel-2 o servizio equivalente
  // Per ora, mock
  const targetDate = date || new Date();
  const month = targetDate.getMonth() + 1;

  // Stima basata su stagione
  let ndvi = 0.3;
  if (month >= 4 && month <= 9) {
    // Estate: vegetazione più attiva
    ndvi = 0.5 + Math.random() * 0.3;
  } else {
    // Inverno: vegetazione meno attiva
    ndvi = 0.2 + Math.random() * 0.2;
  }

  let health: NDVIData['vegetationHealth'] = 'moderate';
  if (ndvi > 0.6) health = 'excellent';
  else if (ndvi > 0.4) health = 'good';
  else if (ndvi > 0.2) health = 'moderate';
  else health = 'poor';

  return {
    lat,
    lng,
    date: targetDate,
    ndvi: Math.round(ndvi * 100) / 100,
    vegetationHealth: health,
  };
}

/**
 * Recupera storico meteo dettagliato
 */
export async function getWeatherHistory(
  lat: number,
  lng: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherHistoryData[]> {
  // TODO: Integrare con Open-Meteo Historical Weather API o servizio equivalente
  // Per ora, mock
  const data: WeatherHistoryData[] = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const month = date.getMonth() + 1;

    // Stima basata su stagione
    let tempMin = 5;
    let tempMax = 15;
    if (month >= 4 && month <= 9) {
      tempMin = 15 + Math.random() * 10;
      tempMax = 25 + Math.random() * 10;
    }

    data.push({
      lat,
      lng,
      date,
      tempMin: Math.round(tempMin * 10) / 10,
      tempMax: Math.round(tempMax * 10) / 10,
      tempAvg: Math.round(((tempMin + tempMax) / 2) * 10) / 10,
      precipitation: Math.random() * 20,
      humidity: 50 + Math.random() * 30,
    });
  }

  return data;
}

