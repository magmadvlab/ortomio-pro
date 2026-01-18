/**
 * Weather Service - Servizio per recuperare dati meteo reali
 * Integra OpenWeatherMap e Open-Meteo per dati accurati
 */

interface WeatherData {
  temp: number
  rainMm: number
  condition: string
  humidity: number
  windSpeed: number
  pressure: number
  uvIndex: number
  forecast: WeatherForecast[]
  location: {
    name: string
    lat: number
    lon: number
  }
}

interface WeatherForecast {
  date: string
  tempMin: number
  tempMax: number
  condition: string
  rainMm: number
  windSpeed: number
  humidity: number
}

interface GardenLocation {
  lat: number
  lon: number
  name?: string
}

class WeatherService {
  private readonly OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minuti
  private cache = new Map<string, { data: WeatherData; timestamp: number }>()

  /**
   * Ottiene dati meteo per una posizione specifica
   */
  async getWeatherForLocation(location: GardenLocation): Promise<WeatherData> {
    const cacheKey = `${location.lat}_${location.lon}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Prova prima con OpenWeatherMap se disponibile
      if (this.OPENWEATHER_API_KEY) {
        const weatherData = await this.fetchFromOpenWeatherMap(location)
        this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() })
        return weatherData
      } else {
        // Fallback su Open-Meteo (gratuito)
        const weatherData = await this.fetchFromOpenMeteo(location)
        this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() })
        return weatherData
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      // Ritorna dati di fallback
      return this.getFallbackWeatherData(location)
    }
  }

  /**
   * Ottiene dati meteo dalla posizione dell'utente
   */
  async getWeatherForUserLocation(): Promise<WeatherData> {
    try {
      const position = await this.getCurrentPosition()
      const location: GardenLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: 'La tua posizione'
      }
      return await this.getWeatherForLocation(location)
    } catch (error) {
      console.error('Error getting user location:', error)
      // Fallback su Roma
      return await this.getWeatherForLocation({
        lat: 41.9028,
        lon: 12.4964,
        name: 'Roma (default)'
      })
    }
  }

  /**
   * Ottiene dati meteo per un orto specifico
   */
  async getWeatherForGarden(garden: any): Promise<WeatherData> {
    if (garden.coordinates) {
      return await this.getWeatherForLocation({
        lat: garden.coordinates.lat,
        lon: garden.coordinates.lon,
        name: garden.name
      })
    } else {
      // Se l'orto non ha coordinate, usa la posizione dell'utente
      return await this.getWeatherForUserLocation()
    }
  }

  /**
   * Fetch da OpenWeatherMap (API premium)
   */
  private async fetchFromOpenWeatherMap(location: GardenLocation): Promise<WeatherData> {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=it`
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=it`

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ])

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('OpenWeatherMap API error')
    }

    const currentData = await currentResponse.json()
    const forecastData = await forecastResponse.json()

    return {
      temp: Math.round(currentData.main.temp),
      rainMm: currentData.rain?.['1h'] || 0,
      condition: this.translateCondition(currentData.weather[0].description),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
      pressure: currentData.main.pressure,
      uvIndex: 0, // Richiede chiamata separata
      location: {
        name: location.name || currentData.name,
        lat: location.lat,
        lon: location.lon
      },
      forecast: this.processForecast(forecastData.list)
    }
  }

  /**
   * Fetch da Open-Meteo (gratuito)
   */
  private async fetchFromOpenMeteo(location: GardenLocation): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Open-Meteo API error')
    }

    const data = await response.json()

    return {
      temp: Math.round(data.current_weather.temperature),
      rainMm: data.hourly.precipitation[0] || 0,
      condition: this.getConditionFromWeatherCode(data.current_weather.weathercode),
      humidity: data.hourly.relative_humidity_2m[0] || 0,
      windSpeed: Math.round(data.current_weather.windspeed),
      pressure: 1013, // Non disponibile in Open-Meteo gratuito
      uvIndex: 0, // Non disponibile in Open-Meteo gratuito
      location: {
        name: location.name || 'Posizione corrente',
        lat: location.lat,
        lon: location.lon
      },
      forecast: this.processOpenMeteoForecast(data.daily)
    }
  }

  /**
   * Ottiene posizione corrente dell'utente
   */
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5 minuti
        }
      )
    })
  }

  /**
   * Traduce condizioni meteo in italiano
   */
  private translateCondition(condition: string): string {
    const translations: Record<string, string> = {
      'clear sky': 'Sereno',
      'few clouds': 'Poco nuvoloso',
      'scattered clouds': 'Nuvoloso',
      'broken clouds': 'Molto nuvoloso',
      'overcast clouds': 'Coperto',
      'light rain': 'Pioggia leggera',
      'moderate rain': 'Pioggia',
      'heavy rain': 'Pioggia forte',
      'thunderstorm': 'Temporale',
      'snow': 'Neve',
      'mist': 'Nebbia',
      'fog': 'Nebbia fitta'
    }
    return translations[condition.toLowerCase()] || condition
  }

  /**
   * Converte weather code di Open-Meteo in condizione
   */
  private getConditionFromWeatherCode(code: number): string {
    if (code === 0) return 'Sereno'
    if (code <= 3) return 'Poco nuvoloso'
    if (code <= 48) return 'Nuvoloso'
    if (code <= 57) return 'Pioggerella'
    if (code <= 67) return 'Pioggia'
    if (code <= 77) return 'Neve'
    if (code <= 82) return 'Rovesci'
    if (code <= 99) return 'Temporale'
    return 'Variabile'
  }

  /**
   * Processa previsioni OpenWeatherMap
   */
  private processForecast(forecastList: any[]): WeatherForecast[] {
    const dailyForecasts = new Map<string, any[]>()
    
    // Raggruppa per giorno
    forecastList.forEach(item => {
      const date = item.dt_txt.split(' ')[0]
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, [])
      }
      dailyForecasts.get(date)!.push(item)
    })

    // Crea previsioni giornaliere
    return Array.from(dailyForecasts.entries()).slice(0, 7).map(([date, items]) => {
      const temps = items.map(item => item.main.temp)
      const rains = items.map(item => item.rain?.['3h'] || 0)
      const winds = items.map(item => item.wind.speed * 3.6)
      const humidities = items.map(item => item.main.humidity)

      return {
        date,
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        condition: this.translateCondition(items[0].weather[0].description),
        rainMm: Math.max(...rains),
        windSpeed: Math.round(Math.max(...winds)),
        humidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length)
      }
    })
  }

  /**
   * Processa previsioni Open-Meteo
   */
  private processOpenMeteoForecast(daily: any): WeatherForecast[] {
    return daily.time.slice(0, 7).map((date: string, index: number) => ({
      date,
      tempMin: Math.round(daily.temperature_2m_min[index]),
      tempMax: Math.round(daily.temperature_2m_max[index]),
      condition: 'Variabile', // Open-Meteo gratuito non ha weather codes giornalieri
      rainMm: daily.precipitation_sum[index] || 0,
      windSpeed: Math.round(daily.wind_speed_10m_max[index]),
      humidity: 60 // Stima
    }))
  }

  /**
   * Dati meteo di fallback
   */
  private getFallbackWeatherData(location: GardenLocation): WeatherData {
    const now = new Date()
    const month = now.getMonth()
    
    // Dati stagionali approssimativi per l'Italia
    let temp = 15
    let condition = 'Variabile'
    
    if (month >= 5 && month <= 8) { // Estate
      temp = 25
      condition = 'Soleggiato'
    } else if (month >= 2 && month <= 4) { // Primavera
      temp = 18
      condition = 'Variabile'
    } else if (month >= 9 && month <= 11) { // Autunno
      temp = 12
      condition = 'Nuvoloso'
    } else { // Inverno
      temp = 8
      condition = 'Freddo'
    }

    return {
      temp,
      rainMm: 0,
      condition,
      humidity: 65,
      windSpeed: 10,
      pressure: 1013,
      uvIndex: 3,
      location: {
        name: location.name || 'Posizione non disponibile',
        lat: location.lat,
        lon: location.lon
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tempMin: temp - 5,
        tempMax: temp + 5,
        condition,
        rainMm: Math.random() > 0.7 ? Math.random() * 10 : 0,
        windSpeed: 8 + Math.random() * 10,
        humidity: 60 + Math.random() * 20
      }))
    }
  }

  /**
   * Genera alert meteo intelligenti per l'agricoltura
   */
  generateWeatherAlerts(weather: WeatherData): Array<{
    type: 'info' | 'warning' | 'danger'
    title: string
    message: string
    icon: string
  }> {
    const alerts = []

    // Alert pioggia
    if (weather.rainMm > 10) {
      alerts.push({
        type: 'warning' as const,
        title: 'Pioggia intensa prevista',
        message: `${weather.rainMm}mm di pioggia. Evita irrigazione, controlla drenaggio`,
        icon: '🌧️'
      })
    } else if (weather.rainMm > 2) {
      alerts.push({
        type: 'info' as const,
        title: 'Pioggia leggera',
        message: 'Riduci o sospendi l\'irrigazione oggi',
        icon: '🌦️'
      })
    }

    // Alert temperatura
    if (weather.temp > 35) {
      alerts.push({
        type: 'danger' as const,
        title: 'Caldo estremo',
        message: 'Proteggi le piante, aumenta irrigazione mattutina',
        icon: '🔥'
      })
    } else if (weather.temp > 30) {
      alerts.push({
        type: 'warning' as const,
        title: 'Temperature elevate',
        message: 'Aumenta frequenza irrigazione, ombreggia piantine',
        icon: '🌡️'
      })
    } else if (weather.temp < 0) {
      alerts.push({
        type: 'danger' as const,
        title: 'Rischio gelo',
        message: 'Proteggi piante sensibili, copri con teli',
        icon: '❄️'
      })
    } else if (weather.temp < 5) {
      alerts.push({
        type: 'warning' as const,
        title: 'Temperature basse',
        message: 'Monitora piante sensibili al freddo',
        icon: '🥶'
      })
    }

    // Alert vento
    if (weather.windSpeed > 50) {
      alerts.push({
        type: 'danger' as const,
        title: 'Vento forte',
        message: 'Proteggi piante alte, controlla tutori',
        icon: '💨'
      })
    }

    // Alert umidità
    if (weather.humidity > 85 && weather.temp > 20) {
      alerts.push({
        type: 'warning' as const,
        title: 'Alta umidità',
        message: 'Rischio malattie fungine, migliora aerazione',
        icon: '💧'
      })
    }

    return alerts
  }
}

export const weatherService = new WeatherService()
export type { WeatherData, WeatherForecast, GardenLocation }