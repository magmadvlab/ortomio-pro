export type AlertSeverity = 'ok' | 'warning' | 'critical'
export type AlertCategory = 'water' | 'treatment' | 'heat' | 'disease' | 'harvest'

export interface FieldAlert {
  id?: string
  gardenId: string
  category: AlertCategory
  severity: AlertSeverity
  message: string
  computedAt: string   // ISO timestamp
  expiresAt: string    // computedAt + 30min
  meta?: Record<string, unknown>
}

export interface WeatherData {
  daily: {
    time: string[]                        // YYYY-MM-DD per 7 giorni
    temperature_2m_max: number[]          // °C
    temperature_2m_min: number[]          // °C
    precipitation_sum: number[]           // mm
    sunshine_duration: number[]           // secondi
    precipitation_probability_max: number[] // 0-100
    windspeed_10m_max: number[]           // km/h
  }
}

export interface FieldAlertsResult {
  alerts: FieldAlert[]
  fromCache: boolean
  computedAt: string
}
