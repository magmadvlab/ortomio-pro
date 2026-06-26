/**
 * Operation Context Service
 * Arricchisce automaticamente le operazioni con contesto meteo e lunare
 */

import type {
  EnvironmentalWeatherSource,
  OperationContext,
  WeatherSnapshot,
} from '@/types/environmental'
import { createWeatherService } from './weatherService';
import {
  getLunarPhase as getRawLunarPhase,
  getPhaseDisplayName,
  getPhaseEmoji,
  isWaxingPhase,
  getIlluminationFraction,
  getDayInCycle,
} from './lunarPhaseService';

export type OperationContextWeatherSource = EnvironmentalWeatherSource
export type { OperationContext } from '@/types/environmental'

class OperationContextService {
  private weatherService = createWeatherService();

  private computeLunar(date: Date) {
    const phase = getRawLunarPhase(date)
    return {
      phase: getPhaseDisplayName(phase),
      phaseEmoji: getPhaseEmoji(phase),
      illumination: Math.round(getIlluminationFraction(date) * 100),
      isWaxing: isWaxingPhase(phase),
      dayInCycle: getDayInCycle(date),
    }
  }

  buildEstimatedContext(
    date: Date,
    latitude: number = 45,
    overrides?: Partial<WeatherSnapshot>
  ): OperationContext {
    return this.buildDerivedContext(date, latitude, {
      temperature: overrides?.temperature ?? 20,
      humidity: overrides?.humidity ?? 60,
      precipitation: overrides?.precipitation ?? 0,
      windSpeed: overrides?.windSpeed ?? 0,
      condition: overrides?.condition ?? 'estimated',
      pressure: overrides?.pressure ?? 1013,
      source: 'estimated',
      sourceClass: 'synthetic_fallback',
      primarySource: 'fallback_estimated',
      signalQuality: 'estimated',
      regionalConfidence: 'low',
      localConfidence: 'low',
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
      source: 'fallback',
      sourceClass: 'synthetic_fallback',
      primarySource: 'fallback_estimated',
      signalQuality: 'estimated',
      regionalConfidence: 'low',
      localConfidence: 'low',
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
      const lunar = this.computeLunar(date)

      // 3. Determina stagione
      return this.buildDerivedContext(date, latitude, {
        temperature: weather.temperature,
        humidity: weather.humidity,
        precipitation: weather.precipitation || 0,
        windSpeed: weather.windSpeed || 0,
        condition: weather.condition || 'unknown',
        pressure: weather.pressure || 1013,
        source: weather.source || 'fallback',
        sourceClass: weather.sourceClass || 'synthetic_fallback',
        primarySource: weather.primarySource || 'fallback_estimated',
        signalQuality: weather.signalQuality || 'estimated',
        regionalConfidence: weather.regionalConfidence || 'low',
        localConfidence: weather.localConfidence || 'low',
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
    weather: WeatherSnapshot,
    lunar?: ReturnType<OperationContextService['computeLunar']>
  ): OperationContext {
    const resolvedLunar = lunar ?? this.computeLunar(date)
    return {
      timestamp: date.toISOString(),
      weather,
      lunar: {
        phase: resolvedLunar.phase,
        phaseEmoji: resolvedLunar.phaseEmoji,
        illumination: resolvedLunar.illumination,
        isWaxing: resolvedLunar.isWaxing,
        dayInCycle: resolvedLunar.dayInCycle,
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

    if (operationType === 'fertilizing' && context.lunar.phase === 'Luna piena') {
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
