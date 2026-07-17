import { evaluateWeatherRisks, type WeatherDecision } from './weatherDecisionEngine'

export type PlantingOperation = 'direct_sowing' | 'transplant'

export interface PlantingForecastDay {
  date: string | Date
  tempMin?: number
  tempMax?: number
  temp_min?: number
  temp_max?: number
  precipitation?: number
  rainMm?: number
  rainForecastMm?: number
  max_hourly_precipitation?: number
  windSpeed?: number
  wind_speed?: number
  wind_gusts?: number
  snowfall?: number
  weathercode?: number
  code?: number
  hourly_weather_codes?: number[]
  cape_max?: number
}

export interface PlantingWindowAssessment {
  status: 'GO' | 'POSTPONE' | 'UNVERIFIED'
  requestedDate: string
  recommendedDate?: string
  operation: PlantingOperation
  headline: string
  reasons: string[]
  actions: string[]
  blockingHazards: WeatherDecision['hazard'][]
  evaluatedDates: string[]
}

interface PlantingWindowOptions {
  operation: PlantingOperation
  requestedDate: string
  forecast: PlantingForecastDay[]
  cropMinTemperature?: number
  cropMaxTemperature?: number
  establishmentDays?: number
}

const isoDate = (value: string | Date): string => {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

const numberValue = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const assessDay = (
  day: PlantingForecastDay,
  operation: PlantingOperation,
  cropMinTemperature?: number,
  cropMaxTemperature?: number,
): { suitable: boolean; reasons: string[]; hazards: WeatherDecision['hazard'][] } => {
  const tempMin = numberValue(day.tempMin, day.temp_min)
  const tempMax = numberValue(day.tempMax, day.temp_max)
  const rain = numberValue(day.precipitation, day.rainMm, day.rainForecastMm) ?? 0
  const maxHourlyRain = numberValue(day.max_hourly_precipitation) ?? 0
  const windSpeed = numberValue(day.windSpeed, day.wind_speed) ?? 0
  const windGust = numberValue(day.wind_gusts) ?? windSpeed
  const weatherCodes = [
    day.weathercode,
    day.code,
    ...(day.hourly_weather_codes || []),
  ].map(Number).filter(Number.isFinite)
  const decisions = evaluateWeatherRisks({
    tempMin,
    tempMax,
    precipitationTotalMm: rain,
    maxHourlyPrecipitationMm: maxHourlyRain,
    windSpeedMaxKmh: windSpeed,
    windGustMaxKmh: windGust,
    capeMaxJkg: day.cape_max,
    snowfallCm: day.snowfall,
    weatherCodes,
  })
  const blocking = new Set<WeatherDecision['hazard']>([
    'flash_flood', 'heavy_rain', 'hail', 'severe_thunderstorm', 'violent_wind', 'frost', 'snow',
  ])
  if (operation === 'transplant') blocking.add('strong_wind')
  const hazards = decisions.filter((decision) => blocking.has(decision.hazard)).map((decision) => decision.hazard)
  const reasons = decisions
    .filter((decision) => blocking.has(decision.hazard))
    .map((decision) => decision.message)

  if (cropMinTemperature !== undefined && tempMin !== undefined && tempMin < cropMinTemperature) {
    reasons.push(`Minima ${tempMin.toFixed(1)}°C sotto la soglia della coltura (${cropMinTemperature}°C)`)
  }
  if (cropMaxTemperature !== undefined && tempMax !== undefined && tempMax > cropMaxTemperature) {
    reasons.push(`Massima ${tempMax.toFixed(1)}°C sopra la soglia della coltura (${cropMaxTemperature}°C)`)
  }
  if (operation === 'direct_sowing' && (rain >= 20 || maxHourlyRain >= 10)) {
    reasons.push(`Pioggia eccessiva per il letto di semina (${rain.toFixed(1)} mm, picco ${maxHourlyRain.toFixed(1)} mm/h)`)
  }
  if (operation === 'transplant' && windGust >= 50) {
    reasons.push(`Raffiche ${windGust.toFixed(0)} km/h: rischio di disidratazione e danni alle piantine appena trapiantate`)
  }

  return { suitable: reasons.length === 0, reasons: [...new Set(reasons)], hazards: [...new Set(hazards)] }
}

export function assessPlantingWeatherWindow(options: PlantingWindowOptions): PlantingWindowAssessment {
  const establishmentDays = Math.max(1, options.establishmentDays ?? 3)
  const forecast = [...options.forecast]
    .map((day) => ({ ...day, normalizedDate: isoDate(day.date) }))
    .sort((left, right) => left.normalizedDate.localeCompare(right.normalizedDate))
  const requestedIndex = forecast.findIndex((day) => day.normalizedDate === options.requestedDate)

  if (requestedIndex < 0 || requestedIndex + establishmentDays > forecast.length) {
    return {
      status: 'UNVERIFIED',
      requestedDate: options.requestedDate,
      operation: options.operation,
      headline: 'Data salvabile, ma non ancora verificabile con il meteo a 7 giorni',
      reasons: ['La finestra completa del giorno programmato e dei due giorni successivi non è ancora disponibile.'],
      actions: ['OrtoMio rivaluterà la data quando entrerà nell’orizzonte meteo di sette giorni.'],
      blockingHazards: [],
      evaluatedDates: [],
    }
  }

  const evaluateWindowAt = (startIndex: number) => {
    const days = forecast.slice(startIndex, startIndex + establishmentDays)
    const assessments = days.map((day) => assessDay(
      day,
      options.operation,
      options.cropMinTemperature,
      options.cropMaxTemperature,
    ))
    return {
      suitable: assessments.every((assessment) => assessment.suitable),
      reasons: assessments.flatMap((assessment, index) =>
        assessment.reasons.map((reason) => `${days[index].normalizedDate}: ${reason}`)
      ),
      hazards: [...new Set(assessments.flatMap((assessment) => assessment.hazards))],
      dates: days.map((day) => day.normalizedDate),
    }
  }

  const requestedWindow = evaluateWindowAt(requestedIndex)
  if (requestedWindow.suitable) {
    return {
      status: 'GO',
      requestedDate: options.requestedDate,
      recommendedDate: options.requestedDate,
      operation: options.operation,
      headline: 'Finestra meteo favorevole per la messa in campo',
      reasons: ['Condizioni compatibili nel giorno programmato e nei due giorni di attecchimento successivi.'],
      actions: options.operation === 'transplant'
        ? ['Trapianta nelle ore fresche e irriga al colletto subito dopo la messa a dimora.']
        : ['Prepara un letto di semina fine e mantieni umido, non saturo, fino all’emergenza.'],
      blockingHazards: [],
      evaluatedDates: requestedWindow.dates,
    }
  }

  let recommendedDate: string | undefined
  for (let index = requestedIndex + 1; index + establishmentDays <= forecast.length; index += 1) {
    if (evaluateWindowAt(index).suitable) {
      recommendedDate = forecast[index].normalizedDate
      break
    }
  }

  return {
    status: 'POSTPONE',
    requestedDate: options.requestedDate,
    recommendedDate,
    operation: options.operation,
    headline: recommendedDate
      ? `Rimanda al ${new Date(`${recommendedDate}T12:00:00`).toLocaleDateString('it-IT')}`
      : 'Rimanda: nessuna finestra sicura completa nei prossimi sette giorni',
    reasons: requestedWindow.reasons,
    actions: [
      'Non preparare piantine o semi per l’uscita finché la nuova finestra non è confermata.',
      recommendedDate
        ? 'Sposta la task alla data consigliata e ricontrolla il meteo il giorno precedente.'
        : 'Mantieni le piantine protette o conserva i semi e attendi il prossimo aggiornamento meteo.',
    ],
    blockingHazards: requestedWindow.hazards,
    evaluatedDates: requestedWindow.dates,
  }
}
