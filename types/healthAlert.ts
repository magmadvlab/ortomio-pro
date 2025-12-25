/**
 * Health Alert Types
 * Sistema di alert automatici per la salute delle piante
 */

export type AlertType = 'weather' | 'water' | 'disease' | 'pest' | 'nutrient'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertSource = 'weather_api' | 'task_overdue' | 'sensor' | 'ai' | 'seasonal'

export interface HealthAlert {
  id: string
  gardenId: string
  plantId?: string
  alertType: AlertType
  severity: AlertSeverity
  source: AlertSource
  title: string
  message: string
  recommendation?: string
  resolved: boolean
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export interface AlertCheckContext {
  garden: any // Garden type
  tasks: any[] // GardenTask[]
  weather?: WeatherData
  sensorData?: SensorReading[]
}

export interface WeatherData {
  temp: number
  humidity: number
  rainTomorrow: boolean
  forecast?: {
    date: string
    temp: number
    humidity: number
    precipitation: number
  }[]
}

export interface SensorReading {
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'light'
  value: number
  timestamp: string
  zoneId?: string
}
