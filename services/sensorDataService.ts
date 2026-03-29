/**
 * Sensor Data Service
 * Gestisce letture sensori IoT e stazioni meteo
 * Integra dati sensori con dati meteo API per calcolo temperatura effettiva
 */

import { getSupabaseClient } from '../config/supabase';
import { Garden } from '../types';
import { getWeatherForecast } from './weatherService';
import { calculateEffectiveTemperature } from '../utils/altitudeUtils';

export type SensorType =
  | 'moisture'
  | 'temperature_soil'
  | 'temperature_air'
  | 'temperature_water'
  | 'humidity_air'
  | 'leaf_wetness'
  | 'dew_point'
  | 'vpd'
  | 'soil_moisture_10cm'
  | 'soil_moisture_30cm'
  | 'soil_moisture_60cm'
  | 'soil_tension_kpa'
  | 'canopy_temperature'
  | 'ph'
  | 'ec'
  | 'flow_rate_actual'
  | 'line_pressure'
  | 'dissolved_oxygen'
  | 'reservoir_level'
  | 'salinity'
  | 'water_salinity'
  | 'water_ph'
  | 'water_bicarbonates'
  | 'orp'
  | 'ammonia'
  | 'nitrite'
  | 'nitrate'
  | 'light'
  | 'wind'
  | 'rain_gauge_local'
  | 'solar_radiation'
  | 'par';

export const SUPPORTED_SENSOR_TYPES: SensorType[] = [
  'moisture',
  'temperature_soil',
  'temperature_air',
  'temperature_water',
  'humidity_air',
  'leaf_wetness',
  'dew_point',
  'vpd',
  'soil_moisture_10cm',
  'soil_moisture_30cm',
  'soil_moisture_60cm',
  'soil_tension_kpa',
  'canopy_temperature',
  'ph',
  'ec',
  'flow_rate_actual',
  'line_pressure',
  'dissolved_oxygen',
  'reservoir_level',
  'salinity',
  'water_salinity',
  'water_ph',
  'water_bicarbonates',
  'orp',
  'ammonia',
  'nitrite',
  'nitrate',
  'light',
  'wind',
  'rain_gauge_local',
  'solar_radiation',
  'par',
];

export type SensorCalibrationStatus = 'calibrated' | 'needs_calibration' | 'unknown';

export const SUPPORTED_SENSOR_CALIBRATION_STATUSES: SensorCalibrationStatus[] = [
  'calibrated',
  'needs_calibration',
  'unknown',
];

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
  provider?: string;
  data_quality_score?: number; // 0-1
  calibration_status?: SensorCalibrationStatus;
  battery_level_percentage?: number;
  signal_strength?: number;
}

export interface EffectiveTemperatureResult {
  temperature: number;
  source: 'sensor' | 'weather_api' | 'estimated';
  sensorType?: 'soil' | 'air';
  confidence: number; // 0-1
  sensorReading?: SensorReading;
}

export interface ControlledEnvironmentSensorSnapshot {
  ph?: SensorReading;
  ec?: SensorReading;
  dissolvedOxygen?: SensorReading;
  reservoirLevel?: SensorReading;
  waterTemperature?: SensorReading;
  salinity?: SensorReading;
  orp?: SensorReading;
  ammonia?: SensorReading;
  nitrite?: SensorReading;
  nitrate?: SensorReading;
  airTemperature?: SensorReading;
  airHumidity?: SensorReading;
  light?: SensorReading;
}

/**
 * Valida range valori per tipo sensore
 */
export function validateSensorValue(sensorType: SensorType, value: number): boolean {
  const ranges: Record<SensorType, { min: number; max: number }> = {
    moisture: { min: 0, max: 100 },
    temperature_soil: { min: -20, max: 50 },
    temperature_air: { min: -30, max: 60 },
    temperature_water: { min: 0, max: 50 },
    humidity_air: { min: 0, max: 100 },
    leaf_wetness: { min: 0, max: 100 },
    dew_point: { min: -40, max: 60 },
    vpd: { min: 0, max: 10 },
    soil_moisture_10cm: { min: 0, max: 100 },
    soil_moisture_30cm: { min: 0, max: 100 },
    soil_moisture_60cm: { min: 0, max: 100 },
    soil_tension_kpa: { min: 0, max: 2000 },
    canopy_temperature: { min: -20, max: 70 },
    ph: { min: 0, max: 14 },
    ec: { min: 0, max: 10 }, // mS/cm
    flow_rate_actual: { min: 0, max: 100000 }, // L/h
    line_pressure: { min: 0, max: 25 }, // bar
    dissolved_oxygen: { min: 0, max: 30 }, // mg/L
    reservoir_level: { min: 0, max: 100000 }, // litri o mm in base all'unita'
    salinity: { min: 0, max: 70 }, // ppt
    water_salinity: { min: 0, max: 70 }, // ppt
    water_ph: { min: 0, max: 14 },
    water_bicarbonates: { min: 0, max: 2000 }, // mg/L
    orp: { min: -2000, max: 2000 }, // mV
    ammonia: { min: 0, max: 100 }, // mg/L
    nitrite: { min: 0, max: 100 }, // mg/L
    nitrate: { min: 0, max: 1000 }, // mg/L
    light: { min: 0, max: 200000 }, // lux
    wind: { min: 0, max: 200 }, // km/h
    rain_gauge_local: { min: 0, max: 1000 }, // mm
    solar_radiation: { min: 0, max: 2000 }, // W/m2 or equivalent normalized unit
    par: { min: 0, max: 3000 }, // umol/m2/s
  };

  const range = ranges[sensorType];
  return value >= range.min && value <= range.max;
}

export function validateDataQualityScore(score?: number): boolean {
  if (score === undefined || score === null) return true;
  return score >= 0 && score <= 1;
}

export function validateCalibrationStatus(status?: string): status is SensorCalibrationStatus {
  if (!status) return true;
  return SUPPORTED_SENSOR_CALIBRATION_STATUSES.includes(status as SensorCalibrationStatus);
}

function normalizeCalibrationStatus(status?: string | null): SensorCalibrationStatus | undefined {
  return validateCalibrationStatus(status || undefined) ? (status || undefined) as SensorCalibrationStatus | undefined : undefined
}

function getForecastMinTemperature(forecast: unknown): number | undefined {
  if (!forecast || typeof forecast !== 'object') {
    return undefined
  }

  const candidate = forecast as {
    tempMin?: number
    temp_min?: number
  }

  const value = candidate.tempMin ?? candidate.temp_min
  return typeof value === 'number' ? value : undefined
}

export function validatePercentageMetric(value?: number): boolean {
  if (value === undefined || value === null) return true;
  return value >= 0 && value <= 100;
}

function mapSensorReadingFromDb(data: {
  id: string;
  garden_id: string;
  zone_id?: string | null;
  irrigation_zone_id?: string | null;
  sensor_type: string;
  value: number | string;
  unit: string;
  reading_date: string;
  sensor_id?: string | null;
  is_simulated?: boolean | null;
  provider?: string | null;
  data_quality_score?: number | string | null;
  calibration_status?: string | null;
  battery_level_percentage?: number | string | null;
  signal_strength?: number | string | null;
}): SensorReading {
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
    provider: data.provider || undefined,
    data_quality_score:
      data.data_quality_score !== null && data.data_quality_score !== undefined
        ? Number(data.data_quality_score)
        : undefined,
    calibration_status: normalizeCalibrationStatus(data.calibration_status),
    battery_level_percentage:
      data.battery_level_percentage !== null && data.battery_level_percentage !== undefined
        ? Number(data.battery_level_percentage)
        : undefined,
    signal_strength:
      data.signal_strength !== null && data.signal_strength !== undefined
        ? Number(data.signal_strength)
        : undefined,
  };
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

  if (!validateDataQualityScore(reading.data_quality_score)) {
    throw new Error(`data_quality_score fuori range: ${reading.data_quality_score}`);
  }

  if (!validateCalibrationStatus(reading.calibration_status)) {
    throw new Error(`calibration_status non valido: ${reading.calibration_status}`);
  }

  if (!validatePercentageMetric(reading.battery_level_percentage)) {
    throw new Error(`battery_level_percentage fuori range: ${reading.battery_level_percentage}`);
  }

  if (!validatePercentageMetric(reading.signal_strength)) {
    throw new Error(`signal_strength fuori range: ${reading.signal_strength}`);
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
      provider: reading.provider || null,
      data_quality_score: reading.data_quality_score ?? null,
      calibration_status: reading.calibration_status || null,
      battery_level_percentage: reading.battery_level_percentage ?? null,
      signal_strength: reading.signal_strength ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Errore salvataggio lettura sensore: ${error.message}`);
  }

  return mapSensorReadingFromDb(data);
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

  return mapSensorReadingFromDb(data);
}

export async function getLatestSensorReadingBySensorId(
  gardenId: string,
  sensorType: SensorType,
  sensorId: string,
  maxAgeHours: number = 24
): Promise<SensorReading | null> {
  const supabase = getSupabaseClient();

  if (!supabase || !sensorId) {
    return null;
  }

  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - maxAgeHours);

  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('garden_id', gardenId)
    .eq('sensor_type', sensorType)
    .eq('sensor_id', sensorId)
    .eq('is_simulated', false)
    .gte('reading_date', cutoffDate.toISOString())
    .order('reading_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return mapSensorReadingFromDb(data);
}

export async function getLatestSensorReadingForSensorIds(
  gardenId: string,
  sensorType: SensorType,
  sensorIds: string[],
  maxAgeHours: number = 24
): Promise<SensorReading | null> {
  const uniqueSensorIds = Array.from(new Set(sensorIds.filter(Boolean)));

  if (uniqueSensorIds.length === 0) {
    return null;
  }

  const readings = await Promise.all(
    uniqueSensorIds.map((sensorId) =>
      getLatestSensorReadingBySensorId(gardenId, sensorType, sensorId, maxAgeHours)
    )
  );

  const latestReading = readings
    .filter((reading): reading is SensorReading => Boolean(reading))
    .sort(
      (left, right) =>
        new Date(right.reading_date).getTime() - new Date(left.reading_date).getTime()
    )[0];

  return latestReading || null;
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

  return data.map((row) => mapSensorReadingFromDb(row));
}

export async function getLatestControlledEnvironmentSensorSnapshot(
  gardenId: string,
  zoneId?: string,
  maxAgeHours: number = 24
): Promise<ControlledEnvironmentSensorSnapshot> {
  const [
    ph,
    ec,
    dissolvedOxygen,
    reservoirLevel,
    waterTemperature,
    salinity,
    orp,
    ammonia,
    nitrite,
    nitrate,
    airTemperature,
    airHumidity,
    light,
  ] = await Promise.all([
    getLatestSensorReading(gardenId, 'ph', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'ec', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'dissolved_oxygen', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'reservoir_level', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'temperature_water', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'salinity', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'orp', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'ammonia', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'nitrite', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'nitrate', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'temperature_air', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'humidity_air', zoneId, maxAgeHours),
    getLatestSensorReading(gardenId, 'light', zoneId, maxAgeHours),
  ]);

  return {
    ph: ph || undefined,
    ec: ec || undefined,
    dissolvedOxygen: dissolvedOxygen || undefined,
    reservoirLevel: reservoirLevel || undefined,
    waterTemperature: waterTemperature || undefined,
    salinity: salinity || undefined,
    orp: orp || undefined,
    ammonia: ammonia || undefined,
    nitrite: nitrite || undefined,
    nitrate: nitrate || undefined,
    airTemperature: airTemperature || undefined,
    airHumidity: airHumidity || undefined,
    light: light || undefined,
  };
}

/**
 * Applica modificatori microclima alla temperatura base
 */
function applyMicroclimateModifiers(
  baseTemp: number,
  garden: Garden,
  _zoneId?: string
): number {
  void _zoneId;
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
      const [forecastDay] = await getWeatherForecast(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      );

      const forecastMinTemp = getForecastMinTemperature(forecastDay)
      if (forecastMinTemp !== undefined) {
        // Applica modificatori altitudine
        let effectiveTemp = garden.altitudeMeters
          ? calculateEffectiveTemperature(garden.altitudeMeters, forecastMinTemp)
          : forecastMinTemp;

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
      const [forecastDay] = await getWeatherForecast(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      );

      const forecastMinTemp = getForecastMinTemperature(forecastDay)
      if (forecastMinTemp !== undefined) {
        let effectiveTemp = garden.altitudeMeters
          ? calculateEffectiveTemperature(garden.altitudeMeters, forecastMinTemp)
          : forecastMinTemp;

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
