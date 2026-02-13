/**
 * Greenhouse Reading Types
 * Letture parametri ambientali serra
 */

export interface GreenhouseReading {
  id: string;
  gardenId: string;
  greenhouseId?: string; // Se serra multipla (future-proof)
  
  // Timestamp
  readingDate: string; // ISO date
  readingTime: string; // HH:MM
  timestamp: string; // ISO datetime completo
  
  // Parametri ambientali interni
  internalTemperature: number; // °C
  internalHumidity: number; // %
  co2Level?: number; // ppm (parts per million)
  lightIntensity?: number; // lux
  
  // Parametri esterni (per confronto)
  externalTemperature?: number; // °C
  externalHumidity?: number; // %
  
  // Differenziali (calcolati automaticamente)
  temperatureDelta?: number; // Interno - Esterno
  humidityDelta?: number; // Interno - Esterno
  
  // Sistemi attivi al momento lettura
  ventilationActive: boolean;
  heatingActive: boolean;
  shadingActive: boolean;
  irrigationActive?: boolean;
  
  // Posizione lettura (se sensori multipli)
  benchId?: string; // Lettura specifica per bancale
  position?: 'north' | 'center' | 'south' | 'east' | 'west';
  heightCm?: number; // Altezza sensore da terra
  
  // Qualità aria
  airQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Note e osservazioni
  notes?: string;
  observations?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

/**
 * Statistiche parametri serra per periodo
 */
export interface GreenhouseReadingStats {
  gardenId: string;
  period: {
    from: string;
    to: string;
  };
  
  // Temperatura
  temperature: {
    min: number;
    max: number;
    avg: number;
    median: number;
    stdDev: number;
    readings: number;
  };
  
  // Umidità
  humidity: {
    min: number;
    max: number;
    avg: number;
    median: number;
    stdDev: number;
    readings: number;
  };
  
  // CO2
  co2?: {
    min: number;
    max: number;
    avg: number;
    median: number;
    stdDev: number;
    readings: number;
  };
  
  // Luce
  light?: {
    min: number;
    max: number;
    avg: number;
    median: number;
    readings: number;
  };
  
  // Differenziali medi
  avgTemperatureDelta?: number;
  avgHumidityDelta?: number;
  
  // Tempo sistemi attivi (%)
  ventilationActivePercent: number;
  heatingActivePercent: number;
  shadingActivePercent: number;
  
  // Giorni con condizioni ottimali
  daysOptimalTemp: number;
  daysOptimalHumidity: number;
  daysOptimalCo2: number;
  
  // Alert
  daysAboveMaxTemp: number;
  daysBelowMinTemp: number;
  daysAboveMaxHumidity: number;
  daysBelowMinHumidity: number;
}

/**
 * Range ottimali per coltura
 */
export interface OptimalRanges {
  plantName: string;
  variety?: string;
  
  // Temperature
  temperature: {
    min: number; // °C
    optimal: number; // °C
    max: number; // °C
  };
  
  // Umidità
  humidity: {
    min: number; // %
    optimal: number; // %
    max: number; // %
  };
  
  // CO2
  co2?: {
    min: number; // ppm
    optimal: number; // ppm
    max: number; // ppm
  };
  
  // Luce
  light?: {
    min: number; // lux
    optimal: number; // lux
    max: number; // lux
  };
  
  // Note
  notes?: string;
  source?: 'database' | 'learned' | 'manual';
}

/**
 * Alert parametri fuori range
 */
export interface GreenhouseAlert {
  id: string;
  gardenId: string;
  readingId: string;
  
  // Tipo alert
  type: 'temperature' | 'humidity' | 'co2' | 'light';
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  // Dettagli
  parameter: string;
  currentValue: number;
  optimalValue: number;
  threshold: number;
  deviation: number; // Quanto si discosta dall'ottimale
  
  // Messaggio
  message: string;
  action: string;
  
  // Stato
  status: 'active' | 'resolved' | 'ignored';
  resolvedAt?: string;
  
  // Metadata
  createdAt: string;
}

/**
 * Trend parametri
 */
export interface GreenhouseTrend {
  gardenId: string;
  parameter: 'temperature' | 'humidity' | 'co2' | 'light';
  
  // Periodo
  period: {
    from: string;
    to: string;
  };
  
  // Trend
  trend: 'increasing' | 'stable' | 'decreasing';
  trendStrength: number; // 0-100 (quanto è forte il trend)
  
  // Valori
  startValue: number;
  endValue: number;
  change: number;
  changePercent: number;
  
  // Predizione
  predictedValue?: number; // Valore previsto tra 7 giorni
  confidence?: number; // 0-100
  
  // Grafico
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
}

/**
 * Correlazione parametri → performance
 */
export interface ParameterCorrelation {
  gardenId: string;
  period: {
    from: string;
    to: string;
  };
  
  // Correlazioni temperatura
  temperature: {
    vs_yield: number; // -1 to 1
    vs_quality: number;
    vs_health: number;
    vs_growth_rate: number;
  };
  
  // Correlazioni umidità
  humidity: {
    vs_yield: number;
    vs_quality: number;
    vs_health: number;
    vs_disease_rate: number;
  };
  
  // Correlazioni CO2
  co2?: {
    vs_yield: number;
    vs_quality: number;
    vs_growth_rate: number;
  };
  
  // Correlazioni luce
  light?: {
    vs_yield: number;
    vs_quality: number;
    vs_growth_rate: number;
  };
  
  // Range ottimali identificati
  optimalRanges: {
    temperature: { min: number; max: number; avg: number };
    humidity: { min: number; max: number; avg: number };
    co2?: { min: number; max: number; avg: number };
    light?: { min: number; max: number; avg: number };
  };
  
  // Confidence
  sampleSize: number;
  confidence: number; // 0-100
  
  // Suggerimenti
  recommendations: Array<{
    parameter: string;
    currentAvg: number;
    suggestedRange: { min: number; max: number };
    expectedImprovement: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Form registrazione lettura
 */
export interface ReadingFormData {
  // Timestamp (auto-popolato)
  readingDate: string;
  readingTime: string;
  
  // Parametri obbligatori
  internalTemperature: number;
  internalHumidity: number;
  
  // Parametri opzionali
  co2Level?: number;
  lightIntensity?: number;
  externalTemperature?: number;
  externalHumidity?: number;
  
  // Sistemi attivi
  ventilationActive: boolean;
  heatingActive: boolean;
  shadingActive: boolean;
  
  // Posizione (opzionale)
  benchId?: string;
  position?: 'north' | 'center' | 'south' | 'east' | 'west';
  
  // Note
  notes?: string;
}

/**
 * Configurazione sensori serra
 */
export interface GreenhouseSensorConfig {
  gardenId: string;
  
  // Sensori disponibili
  hasTemperatureSensor: boolean;
  hasHumiditySensor: boolean;
  hasCo2Sensor: boolean;
  hasLightSensor: boolean;
  
  // Posizioni sensori
  sensors: Array<{
    id: string;
    type: 'temperature' | 'humidity' | 'co2' | 'light' | 'combined';
    position: 'north' | 'center' | 'south' | 'east' | 'west';
    heightCm: number;
    benchId?: string;
    isActive: boolean;
  }>;
  
  // Frequenza letture
  readingFrequencyMinutes: number; // Ogni quanti minuti leggere
  
  // Alert automatici
  enableAlerts: boolean;
  alertThresholds: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
    co2Min?: number;
    co2Max?: number;
  };
  
  // Integrazione
  isAutomated: boolean; // Letture automatiche da sensori IoT
  apiEndpoint?: string;
  apiKey?: string;
}
