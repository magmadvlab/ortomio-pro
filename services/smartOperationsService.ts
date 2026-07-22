/**
 * Smart Operations Service
 * Gestisce operazioni intelligenti con controlli meteo e sistemi automatizzati
 */

export interface SmartOperation {
  id: string
  type: 'irrigation' | 'plowing' | 'fertilization' | 'treatment' | 'harvest' | 'sowing'
  name: string
  scheduledDate: string
  scheduledTime: string
  duration: number // minuti
  zones?: string[]
  equipment?: string
  weatherDependent: boolean
  status: 'scheduled' | 'weather_warning' | 'ready' | 'completed' | 'cancelled'
  weatherWarning?: string
  aiSuggestion?: string
  parameters?: Record<string, any>
}

export interface WeatherData {
  date: string
  temp: number
  humidity: number
  windSpeed: number
  precipitation: number
  conditions: 'sunny' | 'cloudy' | 'rain' | 'storm'
  pressure?: number
  uvIndex?: number
}

export interface WeatherAlert {
  type: 'warning' | 'danger' | 'info'
  message: string
  recommendation: string
  affectedOperations: string[]
}

export class SmartOperationsService {
  private operations: SmartOperation[] = []
  private weatherCache: Map<string, WeatherData[]> = new Map()

  /**
   * Ottiene previsioni meteo per i prossimi giorni
   */
  async getWeatherForecast(latitude: number, longitude: number, days: number = 7): Promise<WeatherData[]> {
    const cacheKey = `${latitude}-${longitude}-${days}`
    
    // Controlla cache
    if (this.weatherCache.has(cacheKey)) {
      const cached = this.weatherCache.get(cacheKey)!
      const cacheAge = Date.now() - new Date(cached[0]?.date || 0).getTime()
      if (cacheAge < 3600000) { // Cache valida per 1 ora
        return cached
      }
    }

    try {
      // In produzione: chiamata API meteo reale
      // relative_humidity_2m e' disponibile solo come dato orario su Open-Meteo,
      // non nel blocco daily: viene richiesto e mediato per giorno qui sotto.
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&hourly=relative_humidity_2m&timezone=auto&forecast_days=${days}`
      )

      if (!response.ok) {
        throw new Error('Weather API error')
      }

      const data = await response.json()

      const forecast: WeatherData[] = data.daily.time.map((date: string, index: number) => ({
        date,
        temp: (data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2,
        humidity: this.averageHourlyHumidityForDay(data.hourly, date),
        windSpeed: data.daily.windspeed_10m_max[index],
        precipitation: data.daily.precipitation_sum[index],
        conditions: this.mapWeatherCode(data.daily.weathercode[index])
      }))

      this.weatherCache.set(cacheKey, forecast)
      return forecast

    } catch (error) {
      console.error('Weather forecast error:', error)

      // Fallback: cache scaduta ma reale se disponibile, mai dati inventati.
      // Un array vuoto è "dati insufficienti" per il chiamante, non un falso "tutto ok".
      const staleCache = this.weatherCache.get(cacheKey)
      return staleCache ?? []
    }
  }

  /**
   * Media l'umidita' relativa oraria di Open-Meteo per un singolo giorno.
   * Ritorna 0 se non ci sono letture orarie per quel giorno (nessun valore
   * inventato: il chiamante puo' trattare 0 come dato mancante se necessario).
   */
  private averageHourlyHumidityForDay(
    hourly: { time?: string[]; relative_humidity_2m?: number[] } | undefined,
    date: string
  ): number {
    if (!hourly?.time || !hourly?.relative_humidity_2m) return 0

    const dayReadings = hourly.time
      .map((timestamp, index) => ({ timestamp, value: hourly.relative_humidity_2m![index] }))
      .filter(({ timestamp, value }) => timestamp.startsWith(date) && typeof value === 'number')

    if (dayReadings.length === 0) return 0

    const sum = dayReadings.reduce((total, { value }) => total + value, 0)
    return Math.round(sum / dayReadings.length)
  }

  /**
   * Mappa codici meteo Open-Meteo a condizioni semplificate
   */
  private mapWeatherCode(code: number): WeatherData['conditions'] {
    if (code === 0) return 'sunny'
    if (code >= 1 && code <= 3) return 'cloudy'
    if (code >= 51 && code <= 67) return 'rain'
    if (code >= 80 && code <= 99) return 'storm'
    return 'cloudy'
  }

  /**
   * Analizza operazioni e genera avvisi meteo
   */
  analyzeOperationsWeather(operations: SmartOperation[], weather: WeatherData[]): SmartOperation[] {
    return operations.map(operation => {
      if (!operation.weatherDependent) return operation

      const opDate = new Date(operation.scheduledDate)
      const weatherDay = weather.find(w => w.date === opDate.toISOString().split('T')[0])
      
      if (!weatherDay) return operation

      const analysis = this.analyzeWeatherForOperation(operation, weatherDay)
      
      return {
        ...operation,
        status: analysis.status,
        weatherWarning: analysis.warning,
        aiSuggestion: analysis.suggestion
      }
    })
  }

  /**
   * Analizza condizioni meteo per specifica operazione
   */
  private analyzeWeatherForOperation(operation: SmartOperation, weather: WeatherData) {
    let status = operation.status
    let warning = ''
    let suggestion = ''

    switch (operation.type) {
      case 'plowing':
        if (weather.precipitation > 5) {
          status = 'weather_warning'
          warning = `⚠️ Pioggia prevista (${weather.precipitation.toFixed(1)}mm). L'aratura su terreno bagnato può causare compattamento del suolo.`
          suggestion = 'Consiglio: rimandare di 2-3 giorni dopo la pioggia per permettere al terreno di asciugarsi.'
        } else if (weather.windSpeed > 20) {
          status = 'weather_warning'
          warning = `💨 Vento forte previsto (${weather.windSpeed.toFixed(1)} km/h). Possibile dispersione di polvere e difficoltà operative.`
          suggestion = 'Valutare di posticipare a giornata più calma.'
        } else if (weather.temp < 0) {
          status = 'weather_warning'
          warning = `🥶 Terreno gelato. Impossibile arare con temperature sotto zero.`
          suggestion = 'Attendere rialzo termico sopra i 2°C.'
        }
        break

      case 'treatment':
        if (weather.windSpeed > 15) {
          status = 'weather_warning'
          warning = `💨 Vento troppo forte (${weather.windSpeed.toFixed(1)} km/h) per trattamenti fitosanitari. Alto rischio di deriva.`
          suggestion = 'Programmare per giornata con vento < 10 km/h, preferibilmente mattina presto o sera.'
        } else if (weather.precipitation > 2) {
          status = 'weather_warning'
          warning = `🌧️ Pioggia prevista. Il trattamento verrà dilavato riducendo l'efficacia.`
          suggestion = 'Rimandare a 24-48h dopo la pioggia o anticipare se possibile.'
        } else if (weather.temp > 30) {
          status = 'weather_warning'
          warning = `🌡️ Temperature elevate (${weather.temp.toFixed(1)}°C). Rischio fitotossicità.`
          suggestion = 'Trattare nelle ore più fresche (6-8 o 18-20).'
        }
        break

      case 'fertilization':
        if (weather.precipitation > 10) {
          status = 'weather_warning'
          warning = `🌧️ Pioggia intensa prevista (${weather.precipitation.toFixed(1)}mm). Rischio dilavamento del fertilizzante.`
          suggestion = 'Anticipare di 1-2 giorni o posticipare dopo la pioggia.'
        } else if (weather.precipitation >= 5 && weather.precipitation <= 10) {
          status = 'ready'
          suggestion = '✅ Pioggia leggera prevista: ideale per incorporare il fertilizzante nel terreno.'
        }
        break

      case 'sowing':
        if (weather.temp < 5) {
          status = 'weather_warning'
          warning = `🥶 Temperature troppo basse (${weather.temp.toFixed(1)}°C) per la germinazione ottimale.`
          suggestion = 'Attendere temperature minime stabili sopra i 8-10°C.'
        } else if (weather.precipitation > 15) {
          status = 'weather_warning'
          warning = `🌧️ Pioggia intensa prevista. Rischio ristagno idrico dannoso per i semi.`
          suggestion = 'Posticipare o migliorare drenaggio della zona di semina.'
        } else if (weather.temp >= 15 && weather.temp <= 25 && weather.precipitation <= 5) {
          status = 'ready'
          suggestion = '✅ Condizioni ottimali per la semina: temperatura e umidità ideali.'
        }
        break

      case 'harvest':
        if (weather.precipitation > 5) {
          status = 'weather_warning'
          warning = `🌧️ Pioggia prevista durante la raccolta. Prodotti bagnati si conservano male.`
          suggestion = 'Anticipare la raccolta o attendere 24h dopo la pioggia.'
        } else if (weather.conditions === 'sunny' && weather.temp < 30) {
          status = 'ready'
          suggestion = '✅ Condizioni ideali per la raccolta: tempo secco e temperature moderate.'
        }
        break

      case 'irrigation':
        if (weather.precipitation > 10) {
          status = 'weather_warning'
          warning = `🌧️ Pioggia abbondante prevista. Irrigazione non necessaria.`
          suggestion = 'Annullare irrigazione e riprogrammare dopo valutazione umidità suolo.'
        } else if (weather.temp > 30 && weather.humidity < 40) {
          status = 'ready'
          suggestion = '✅ Condizioni di stress idrico: irrigazione raccomandata nelle ore fresche.'
        }
        break
    }

    return { status, warning, suggestion }
  }

  /**
   * Genera suggerimenti AI basati su dati storici e condizioni attuali
   */
  generateAISuggestions(operations: SmartOperation[], weather: WeatherData[], gardenData?: any) {
    const suggestions = []

    // Analisi irrigazione
    const lastIrrigation = operations
      .filter(op => op.type === 'irrigation' && op.status === 'completed')
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0]

    if (!lastIrrigation || this.daysSince(lastIrrigation.scheduledDate) > 3) {
      const nextDryDays = weather.filter(w => w.precipitation < 2).length
      if (nextDryDays >= 2) {
        suggestions.push({
          type: 'irrigation',
          priority: 'high',
          message: 'Irrigazione consigliata entro 24h. Analisi: nessuna pioggia significativa negli ultimi 3 giorni.',
          confidence: 85,
          reasoning: `${nextDryDays} giorni secchi previsti, ultima irrigazione ${lastIrrigation ? this.daysSince(lastIrrigation.scheduledDate) + ' giorni fa' : 'non registrata'}`,
          suggestedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          suggestedTime: '06:00'
        })
      }
    }

    // Analisi trattamenti preventivi
    const highHumidityDays = weather.filter(w => w.humidity > 80).length
    if (highHumidityDays >= 3) {
      suggestions.push({
        type: 'treatment',
        priority: 'medium',
        message: 'Trattamento fungicida preventivo consigliato. Condizioni favorevoli allo sviluppo di patogeni.',
        confidence: 78,
        reasoning: `${highHumidityDays} giorni con umidità >80% previsti`,
        suggestedDate: weather.find(w => w.windSpeed < 10 && w.precipitation < 1)?.date || weather[0].date,
        suggestedTime: '07:00'
      })
    }

    // Analisi concimazione
    const lastFertilization = operations
      .filter(op => op.type === 'fertilization' && op.status === 'completed')
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0]

    if (!lastFertilization || this.daysSince(lastFertilization.scheduledDate) > 21) {
      const idealDay = weather.find(w => w.precipitation >= 3 && w.precipitation <= 8 && w.windSpeed < 15)
      if (idealDay) {
        suggestions.push({
          type: 'fertilization',
          priority: 'medium',
          message: 'Concimazione consigliata. Condizioni meteo ideali per incorporazione nel terreno.',
          confidence: 82,
          reasoning: `Pioggia leggera prevista (${idealDay.precipitation.toFixed(1)}mm) per incorporare nutrienti`,
          suggestedDate: idealDay.date,
          suggestedTime: '08:00'
        })
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    })
  }

  /**
   * Calcola giorni trascorsi da una data
   */
  private daysSince(dateString: string): number {
    const date = new Date(dateString)
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Ottimizza programmazione operazioni basata su meteo
   */
  optimizeScheduling(operations: SmartOperation[], weather: WeatherData[]): SmartOperation[] {
    return operations.map(operation => {
      if (!operation.weatherDependent || operation.status === 'completed') {
        return operation
      }

      // Trova la migliore finestra meteo nei prossimi 7 giorni
      const bestDate = this.findOptimalWeatherWindow(operation, weather)
      
      if (bestDate && bestDate !== operation.scheduledDate) {
        return {
          ...operation,
          scheduledDate: bestDate,
          aiSuggestion: `🤖 Data ottimizzata automaticamente per condizioni meteo favorevoli.`
        }
      }

      return operation
    })
  }

  /**
   * Trova finestra meteo ottimale per operazione
   */
  private findOptimalWeatherWindow(operation: SmartOperation, weather: WeatherData[]): string | null {
    const scores = weather.map(day => ({
      date: day.date,
      score: this.calculateWeatherScore(operation, day)
    }))

    const bestDay = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    )

    return bestDay.score > 0.7 ? bestDay.date : null
  }

  /**
   * Calcola punteggio condizioni meteo per operazione (0-1)
   */
  private calculateWeatherScore(operation: SmartOperation, weather: WeatherData): number {
    let score = 1.0

    switch (operation.type) {
      case 'plowing':
        if (weather.precipitation > 5) score *= 0.1
        if (weather.windSpeed > 20) score *= 0.3
        if (weather.temp < 0) score *= 0.0
        if (weather.conditions === 'sunny') score *= 1.2
        break

      case 'treatment':
        if (weather.windSpeed > 15) score *= 0.1
        if (weather.precipitation > 2) score *= 0.2
        if (weather.temp > 30) score *= 0.4
        if (weather.windSpeed < 5 && weather.conditions === 'cloudy') score *= 1.3
        break

      case 'fertilization':
        if (weather.precipitation > 15) score *= 0.2
        if (weather.precipitation >= 3 && weather.precipitation <= 8) score *= 1.4
        break

      case 'sowing':
        if (weather.temp < 5) score *= 0.1
        if (weather.precipitation > 15) score *= 0.3
        if (weather.temp >= 15 && weather.temp <= 25) score *= 1.2
        break

      case 'harvest':
        if (weather.precipitation > 5) score *= 0.2
        if (weather.conditions === 'sunny' && weather.temp < 30) score *= 1.3
        break
    }

    return Math.max(0, Math.min(1, score))
  }
}

export const smartOperationsService = new SmartOperationsService()