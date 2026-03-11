/**
 * Operation Context Service
 * Arricchisce automaticamente le operazioni con contesto meteo e lunare
 */

import { createWeatherService } from './weatherService';
import { createLunarService } from './lunarService';

export type OperationContextWeatherSource =
  | 'current'
  | 'forecast'
  | 'historical'
  | 'estimated'
  | 'fallback';

export interface OperationContext {
  timestamp: string;
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
    pressure: number;
    source?: OperationContextWeatherSource;
  };
  lunar: {
    phase: string;
    phaseEmoji: string;
    illumination: number;
    isWaxing: boolean;
    dayInCycle: number;
  };
  season: string;
  daylight: {
    sunrise: string;
    sunset: string;
    hoursOfLight: number;
  };
}

class OperationContextService {
  private weatherService = createWeatherService();
  private lunarService = createLunarService();

  buildEstimatedContext(
    date: Date,
    latitude: number = 45,
    overrides?: Partial<OperationContext['weather']>
  ): OperationContext {
    return this.buildDerivedContext(date, latitude, {
      temperature: overrides?.temperature ?? 20,
      humidity: overrides?.humidity ?? 60,
      precipitation: overrides?.precipitation ?? 0,
      windSpeed: overrides?.windSpeed ?? 0,
      condition: overrides?.condition ?? 'estimated',
      pressure: overrides?.pressure ?? 1013,
      source: 'estimated'
    })
  }

  buildFallbackContext(date: Date, latitude: number = 45): OperationContext {
    return this.buildDerivedContext(date, latitude, {
      temperature: 20,
      humidity: 60,
      precipitation: 0,
      windSpeed: 0,
      condition: 'unknown',
      pressure: 1013,
      source: 'fallback'
    })
  }

  /**
   * Ottiene il contesto completo per un'operazione
   */
  async getOperationContext(
    latitude: number,
    longitude: number,
    timestamp?: Date
  ): Promise<OperationContext> {
    const date = timestamp || new Date();

    try {
      // 1. Ottieni dati meteo riferiti alla data reale dell'evento
      const weather = this.weatherService.getWeatherForDate
        ? await this.weatherService.getWeatherForDate(latitude, longitude, date)
        : await this.weatherService.getCurrentWeather(latitude, longitude);

      // 2. Calcola fase lunare
      const lunar = this.lunarService.getLunarPhase(date);

      // 3. Determina stagione
      return this.buildDerivedContext(date, latitude, {
        temperature: weather.temperature,
        humidity: weather.humidity,
        precipitation: weather.precipitation || 0,
        windSpeed: weather.windSpeed || 0,
        condition: weather.condition || 'unknown',
        pressure: weather.pressure || 1013,
        source: weather.source || 'fallback',
      }, lunar);
    } catch (error) {
      console.error('Error getting operation context:', error);
      
      // Fallback con dati minimi
      return this.buildFallbackContext(date, latitude);
    }
  }

  private buildDerivedContext(
    date: Date,
    latitude: number,
    weather: OperationContext['weather'],
    lunar = this.lunarService.getLunarPhase(date)
  ): OperationContext {
    return {
      timestamp: date.toISOString(),
      weather,
      lunar: {
        phase: lunar.phase,
        phaseEmoji: lunar.phaseEmoji,
        illumination: lunar.illumination,
        isWaxing: lunar.isWaxing,
        dayInCycle: lunar.dayInCycle,
      },
      season: this.getSeason(date),
      daylight: this.calculateDaylight(latitude, date),
    };
  }

  /**
   * Determina la stagione
   */
  private getSeason(date: Date): string {
    const month = date.getMonth() + 1;
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  /**
   * Calcola ore di luce approssimative
   */
  private calculateDaylight(latitude: number, date: Date): {
    sunrise: string;
    sunset: string;
    hoursOfLight: number;
  } {
    // Calcolo semplificato basato su latitudine e giorno dell'anno
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Variazione ore di luce in base alla latitudine e stagione
    const baseHours = 12;
    const variation = Math.sin((dayOfYear - 80) * 2 * Math.PI / 365) * (latitude / 90) * 6;
    const hoursOfLight = Math.max(8, Math.min(16, baseHours + variation));
    
    const sunriseHour = 12 - hoursOfLight / 2;
    const sunsetHour = 12 + hoursOfLight / 2;
    
    return {
      sunrise: `${Math.floor(sunriseHour).toString().padStart(2, '0')}:${Math.floor((sunriseHour % 1) * 60).toString().padStart(2, '0')}`,
      sunset: `${Math.floor(sunsetHour).toString().padStart(2, '0')}:${Math.floor((sunsetHour % 1) * 60).toString().padStart(2, '0')}`,
      hoursOfLight: Math.round(hoursOfLight * 10) / 10,
    };
  }

  /**
   * Formatta il contesto per la visualizzazione
   */
  formatContext(context: OperationContext): string {
    return `
📅 ${new Date(context.timestamp).toLocaleString('it-IT')}
🌡️ ${context.weather.temperature}°C, ${context.weather.humidity}% umidità
${context.lunar.phaseEmoji} ${context.lunar.phase} (${context.lunar.illumination}%)
🌍 Stagione: ${context.season}
☀️ Luce: ${context.daylight.hoursOfLight}h (${context.daylight.sunrise} - ${context.daylight.sunset})
    `.trim();
  }

  /**
   * Verifica se le condizioni sono favorevoli per un'operazione
   */
  isConditionsFavorable(
    context: OperationContext,
    operationType: 'watering' | 'fertilizing' | 'treatment' | 'planting'
  ): {
    favorable: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Controlli temperatura
    if (context.weather.temperature < 5) {
      warnings.push('Temperatura troppo bassa - rischio di danni da gelo');
    }
    if (context.weather.temperature > 35) {
      warnings.push('Temperatura troppo alta - stress termico per le piante');
    }

    // Controlli pioggia
    if (context.weather.precipitation > 5 && operationType === 'watering') {
      warnings.push('Pioggia prevista - irrigazione non necessaria');
    }

    // Controlli vento
    if (context.weather.windSpeed > 20 && operationType === 'treatment') {
      warnings.push('Vento forte - trattamenti potrebbero disperdersi');
    }

    // Raccomandazioni lunari
    if (operationType === 'planting') {
      if (context.lunar.isWaxing) {
        recommendations.push('Luna crescente - favorevole per piante da frutto');
      } else {
        recommendations.push('Luna calante - favorevole per piante da radice');
      }
    }

    if (operationType === 'fertilizing' && context.lunar.phase === 'Full Moon') {
      recommendations.push('Luna piena - momento ottimale per fertilizzazione');
    }

    return {
      favorable: warnings.length === 0,
      warnings,
      recommendations,
    };
  }
}

export const createOperationContextService = () => new OperationContextService();
export default createOperationContextService;
