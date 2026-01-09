/**
 * Sensor Data Service
 * Gestisce letture sensori IoT e stazioni meteo
 * Integra dati sensori con dati meteo API per calcolo temperatura effettiva
 */

import { getSupabaseClient } from '../config/supabase';
import { Garden } from '../types';
import { getWeatherForecast, getWeatherForecast7Days } from './weatherService';
import { calculateEffectiveTemperature } from '../utils/altitudeUtils';
import { calculateSoilHeatingRate } from '../utils/soilTemperatureUtils';

export type SensorType =
  | 'moisture'
  | 'temperature_soil'
  | 'temperature_air'
  | 'humidity_air'
  | 'ph'
  | 'ec'
  | 'light'
  | 'wind';

export interface SensorReading {
  id?: string;
  garden_id: string;
  zone_id?: string;
  irrigation_zone_id?: string;
  sensor_type: SensorType;
  value: number;
  unit: string;
  reading_date: string; // ISO timestamp
  sensor_id?: string;
  is_simulated?: boolean;
}

export interface EffectiveTemperatureResult {
  temperature: number;
  source: 'sensor' | 'weather_api' | 'estimated';
  sensorType?: 'soil' | 'air';
  confidence: number; // 0-1
  sensorReading?: SensorReading;
}

/**
 * Valida range valori per tipo sensore
 */
export function validateSensorValue(sensorType: SensorType, value: number): boolean {
  const ranges: Record<SensorType, { min: number; max: number }> = {
    moisture: { min: 0, max: 100 },
    temperature_soil: { min: -20, max: 50 },
    temperature_air: { min: -30, max: 60 },
    humidity_air: { min: 0, max: 100 },
    ph: { min: 0, max: 14 },
    ec: { min: 0, max: 10 }, // mS/cm
    light: { min: 0, max: 200000 }, // lux
    wind: { min: 0, max: 200 }, // km/h
  };

  const range = ranges[sensorType];
  return value >= range.min && value <= range.max;
}

/**
 * Salva lettura sensore nel database
 */
export async function saveSensorReading(
  reading: Omit<SensorReading, 'id'>
): Promise<SensorReading> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase non disponibile. Impossibile salvare lettura sensore.');
  }

  // Valida valore
  if (!validateSensorValue(reading.sensor_type, reading.value)) {
    throw new Error(
      `Valore ${reading.value} fuori range per sensore ${reading.sensor_type}`
    );
  }

  // Verifica che garden_id esista (verifica autorizzazione verrà fatta nell'API endpoint)
  const { data: garden, error: gardenError } = await supabase
    .from('gardens')
    .select('id')
    .eq('id', reading.garden_id)
    .single();

  if (gardenError || !garden) {
    throw new Error(`Garden ${reading.garden_id} non trovato`);
  }

  // Verifica zone_id se fornito
  if (reading.zone_id) {
    const { data: zone, error: zoneError } = await supabase
      .from('garden_zones')
      .select('id, garden_id')
      .eq('id', reading.zone_id)
      .single();

    if (zoneError || !zone || zone.garden_id !== reading.garden_id) {
      throw new Error(`Zone ${reading.zone_id} non trovata o non appartiene al garden`);
    }
  }

  // Salva lettura
  const { data, error } = await supabase
    .from('sensor_readings')
    .insert({
      garden_id: reading.garden_id,
      zone_id: reading.zone_id || null,
      irrigation_zone_id: reading.irrigation_zone_id || null,
      sensor_type: reading.sensor_type,
      value: reading.value,
      unit: reading.unit,
      reading_date: reading.reading_date || new Date().toISOString(),
      sensor_id: reading.sensor_id || null,
      is_simulated: reading.is_simulated ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Errore salvataggio lettura sensore: ${error.message}`);
  }

  return {
    id: data.id,
    garden_id: data.garden_id,
    zone_id: data.zone_id || undefined,
    irrigation_zone_id: data.irrigation_zone_id || undefined,
    sensor_type: data.sensor_type as SensorType,
    value: parseFloat(data.value.toString()),
    unit: data.unit,
    reading_date: data.reading_date,
    sensor_id: data.sensor_id || undefined,
    is_simulated: data.is_simulated || false,
  };
}

/**
 * Recupera ultima lettura sensore per tipo/garden/zone
 */
export async function getLatestSensorReading(
  gardenId: string,
  sensorType: SensorType,
  zoneId?: string,
  maxAgeHours: number = 24
): Promise<SensorReading | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - maxAgeHours);

  let query = supabase
    .from('sensor_readings')
    .select('*')
    .eq('garden_id', gardenId)
    .eq('sensor_type', sensorType)
    .eq('is_simulated', false) // Solo sensori reali
    .gte('reading_date', cutoffDate.toISOString())
    .order('reading_date', { ascending: false })
    .limit(1);

  if (zoneId) {
    query = query.eq('zone_id', zoneId);
  } else {
    // Se non specificata zona, preferisci letture senza zona (garden-wide)
    query = query.is('zone_id', null);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    garden_id: data.garden_id,
    zone_id: data.zone_id || undefined,
    irrigation_zone_id: data.irrigation_zone_id || undefined,
    sensor_type: data.sensor_type as SensorType,
    value: parseFloat(data.value.toString()),
    unit: data.unit,
    reading_date: data.reading_date,
    sensor_id: data.sensor_id || undefined,
    is_simulated: data.is_simulated || false,
  };
}

/**
 * Recupera letture sensori per periodo
 */
export async function getSensorReadings(
  gardenId: string,
  sensorType: SensorType,
  period: '24h' | '7d' | '30d',
  zoneId?: string
): Promise<SensorReading[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const cutoffDate = new Date();
  const hoursMap = { '24h': 24, '7d': 168, '30d': 720 };
  cutoffDate.setHours(cutoffDate.getHours() - hoursMap[period]);

  let query = supabase
    .from('sensor_readings')
    .select('*')
    .eq('garden_id', gardenId)
    .eq('sensor_type', sensorType)
    .eq('is_simulated', false)
    .gte('reading_date', cutoffDate.toISOString())
    .order('reading_date', { ascending: false });

  if (zoneId) {
    query = query.eq('zone_id', zoneId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    garden_id: row.garden_id,
    zone_id: row.zone_id || undefined,
    irrigation_zone_id: row.irrigation_zone_id || undefined,
    sensor_type: row.sensor_type as SensorType,
    value: parseFloat(row.value.toString()),
    unit: row.unit,
    reading_date: row.reading_date,
    sensor_id: row.sensor_id || undefined,
    is_simulated: row.is_simulated || false,
  }));
}

/**
 * Applica modificatori microclima alla temperatura base
 */
function applyMicroclimateModifiers(
  baseTemp: number,
  garden: Garden,
  zoneId?: string
): number {
  let temp = baseTemp;

  // Modificatore SERRA: +5-10°C se riscaldata
  if (garden.gardenType === 'Greenhouse' && garden.greenhouseConfig) {
    const config = garden.greenhouseConfig;
    // Gestisce sia configurazione singola che multipla
    const hasHeating = Array.isArray(config)
      ? config.some((s: any) => s.hasHeating)
      : config.hasHeating;

    if (hasHeating) {
      // Serra riscaldata: +5-10°C rispetto esterno
      temp += 7.5; // Media tra 5 e 10
    } else {
      // Serra non riscaldata: +2-5°C (effetto serra passivo)
      temp += 3.5;
    }
  }

  // Modificatore INDOOR: usa temperatura target se configurata
  if (garden.gardenType === 'Indoor' && garden.indoorConfig?.climate?.temperature) {
    const targetTemp = garden.indoorConfig.climate.temperature.target;
    // Se abbiamo temperatura target, usala direttamente (è controllata)
    return targetTemp;
  }

  // Modificatore ZONA OMBREGGIATA: -2-3°C
  if (garden.sunExposure === 'Shade') {
    temp -= 2.5; // Media tra 2 e 3
  } else if (garden.sunExposure === 'PartSun') {
    temp -= 1; // Leggermente più fresco
  }

  return temp;
}

/**
 * Calcola temperatura effettiva combinando sensori + meteo API
 * Priorità: sensori reali > API meteo > stima
 */
export async function getEffectiveTemperature(
  garden: Garden,
  zoneId?: string,
  date?: Date
): Promise<EffectiveTemperatureResult> {
  const targetDate = date || new Date();

  // PRIORITÀ 1: Cerca sensori reali per zona specifica
  if (zoneId) {
    // Temperatura suolo per zona
    const soilTemp = await getLatestSensorReading(
      garden.id,
      'temperature_soil',
      zoneId,
      24
    );
    if (soilTemp) {
      let temp = soilTemp.value;
      // Applica modificatori microclima anche ai sensori (es. serra)
      temp = applyMicroclimateModifiers(temp, garden, zoneId);
      return {
        temperature: temp,
        source: 'sensor',
        sensorType: 'soil',
        confidence: 0.9,
        sensorReading: soilTemp,
      };
    }

    // Temperatura aria per zona
    const airTemp = await getLatestSensorReading(
      garden.id,
      'temperature_air',
      zoneId,
      24
    );
    if (airTemp) {
      let temp = airTemp.value;
      temp = applyMicroclimateModifiers(temp, garden, zoneId);
      return {
        temperature: temp,
        source: 'sensor',
        sensorType: 'air',
        confidence: 0.9,
        sensorReading: airTemp,
      };
    }
  }

  // PRIORITÀ 2: Cerca sensori reali per garden (senza zona)
  const gardenAirTemp = await getLatestSensorReading(
    garden.id,
    'temperature_air',
    undefined,
    24
  );
  if (gardenAirTemp) {
    let temp = gardenAirTemp.value;
    temp = applyMicroclimateModifiers(temp, garden);
    return {
      temperature: temp,
      source: 'sensor',
      sensorType: 'air',
      confidence: 0.85,
      sensorReading: gardenAirTemp,
    };
  }

  const gardenSoilTemp = await getLatestSensorReading(
    garden.id,
    'temperature_soil',
    undefined,
    24
  );
  if (gardenSoilTemp) {
    let temp = gardenSoilTemp.value;
    temp = applyMicroclimateModifiers(temp, garden);
    return {
      temperature: temp,
      source: 'sensor',
      sensorType: 'soil',
      confidence: 0.85,
      sensorReading: gardenSoilTemp,
    };
  }

  // PRIORITÀ 3: Usa dati meteo API con modificatori microclima
  if (garden.coordinates) {
    try {
      const forecast = await getWeatherForecast(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      );

      if (forecast && forecast.tempMin !== undefined) {
        // Applica modificatori altitudine
        let effectiveTemp = garden.altitudeMeters
          ? calculateEffectiveTemperature(garden.altitudeMeters, forecast.tempMin)
          : forecast.tempMin;

        // Applica modificatori microclima (serra, indoor, ombreggiata)
        effectiveTemp = applyMicroclimateModifiers(effectiveTemp, garden, zoneId);

        return {
          temperature: effectiveTemp,
          source: 'weather_api',
          confidence: 0.7,
        };
      }
    } catch (error) {
      console.warn('Errore recupero dati meteo API:', error);
    }
  }

  // PRIORITÀ 4: Stima basata su dati storici + modificatori
  // Fallback: temperatura stimata basata su stagione e modificatori
  const month = targetDate.getMonth() + 1;
  let estimatedTemp = 15; // Temperatura media Italia

  // Stima stagionale approssimativa
  if (month >= 6 && month <= 8) {
    estimatedTemp = 25; // Estate
  } else if (month >= 3 && month <= 5) {
    estimatedTemp = 15; // Primavera
  } else if (month >= 9 && month <= 11) {
    estimatedTemp = 18; // Autunno
  } else {
    estimatedTemp = 8; // Inverno
  }

  // Applica modificatori altitudine
  if (garden.altitudeMeters) {
    estimatedTemp = calculateEffectiveTemperature(garden.altitudeMeters, estimatedTemp);
  }

  // Applica modificatori microclima
  estimatedTemp = applyMicroclimateModifiers(estimatedTemp, garden, zoneId);

  return {
    temperature: estimatedTemp,
    source: 'estimated',
    confidence: 0.5,
  };
}

/**
 * Recupera temperatura minima effettiva per verifica trapianto
 * Usa sensori se disponibili, altrimenti API meteo
 */
export async function getEffectiveMinTemperature(
  garden: Garden,
  zoneId?: string
): Promise<EffectiveTemperatureResult> {
  // Cerca sensori temperatura aria (minima notturna)
  const airTemp = zoneId
    ? await getLatestSensorReading(garden.id, 'temperature_air', zoneId, 24)
    : await getLatestSensorReading(garden.id, 'temperature_air', undefined, 24);

  if (airTemp) {
    let temp = airTemp.value;
    // Applica modificatori microclima
    temp = applyMicroclimateModifiers(temp, garden, zoneId);
    return {
      temperature: temp,
      source: 'sensor',
      sensorType: 'air',
      confidence: 0.9,
      sensorReading: airTemp,
    };
  }

  // Usa API meteo
  if (garden.coordinates) {
    try {
      const forecast = await getWeatherForecast(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      );

      if (forecast && forecast.tempMin !== undefined) {
        let effectiveTemp = garden.altitudeMeters
          ? calculateEffectiveTemperature(garden.altitudeMeters, forecast.tempMin)
          : forecast.tempMin;

        // Applica modificatori microclima
        effectiveTemp = applyMicroclimateModifiers(effectiveTemp, garden, zoneId);

        return {
          temperature: effectiveTemp,
          source: 'weather_api',
          confidence: 0.7,
        };
      }
    } catch (error) {
      console.warn('Errore recupero temperatura minima:', error);
    }
  }

  // Fallback
  let fallbackTemp = 10;
  fallbackTemp = applyMicroclimateModifiers(fallbackTemp, garden, zoneId);
  return {
    temperature: fallbackTemp,
    source: 'estimated',
    confidence: 0.5,
  };
}

