/**
 * Proactive Alert Engine
 * Genera alert proattivi combinando memoria, pattern e condizioni correnti
 */

import { Garden, GardenTask, UrgentAlert } from '../types';
import { ZoneMemory, LocalPattern } from '../types/memory';
import { getZoneMemory } from '../services/gardenMemoryService';
import { detectPatternFromZoneMemory } from './patternRecognitionEngine';
import { getWeatherForecast } from '../services/weatherService';

/**
 * Analizza situazione corrente e genera alert proattivi
 */
export async function generateProactiveAlerts(
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date()
): Promise<UrgentAlert[]> {
  const alerts: UrgentAlert[] = [];

  // Analizza ogni task attivo
  for (const task of tasks) {
    if (task.completed || !task.bedId) continue;

    // Recupera memoria zona
    const zoneMemory = await getZoneMemory(task.bedId, garden.id);
    if (!zoneMemory) continue;

    // Genera alert basati su memoria e pattern
    const memoryAlerts = await generateMemoryBasedAlerts(
      task,
      zoneMemory,
      garden,
      currentDate
    );
    alerts.push(...memoryAlerts);

    // Genera alert basati su pattern riconosciuti
    const patternAlerts = await generatePatternBasedAlerts(
      task,
      task.bedId,
      garden,
      currentDate
    );
    alerts.push(...patternAlerts);
  }

  // Genera alert meteo proattivi
  const weatherAlerts = await generateWeatherProactiveAlerts(garden, tasks, currentDate);
  alerts.push(...weatherAlerts);

  // Prioritizza e filtra alert
  return prioritizeAlerts(alerts);
}

/**
 * Genera alert basati su memoria zona
 */
async function generateMemoryBasedAlerts(
  task: GardenTask,
  zoneMemory: ZoneMemory,
  garden: Garden,
  currentDate: Date
): Promise<UrgentAlert[]> {
  const alerts: UrgentAlert[] = [];

  // Controlla problemi ricorrenti nella zona per questo periodo
  const currentMonth = currentDate.getMonth() + 1;
  const recurringProblems = zoneMemory.patterns.recurringProblems.filter((p) =>
    p.months.includes(currentMonth)
  );

  if (recurringProblems.length > 0) {
    const problem = recurringProblems[0];
    const successfulTreatment = zoneMemory.patterns.successfulTreatments.find(
      (t) => t.problem === problem.problem
    );

    alerts.push({
      type: 'Planning',
      message: `⚠️ PROBLEMA RICORRENTE: ${problem.problem} si verifica spesso in questa zona a ${currentMonth}`,
      action: successfulTreatment
        ? `Trattamento efficace in passato: ${successfulTreatment.treatment} (${Math.round(successfulTreatment.successRate * 100)}% successo)`
        : `Considera trattamenti preventivi o varietà resistenti`,
      blockOperations: false,
      proactiveContext: {
        historicalPattern: `Problema osservato ${problem.frequency} volte negli anni precedenti`,
        currentConditions: `Pianta ${task.plantName} nella zona ${zoneMemory.zoneName || task.bedId}`,
        confidence: Math.min(0.8, problem.frequency / 5),
      },
      timing: 'this_week',
    });
  }

  return alerts;
}

/**
 * Genera alert basati su pattern riconosciuti
 */
async function generatePatternBasedAlerts(
  task: GardenTask,
  zoneId: string,
  garden: Garden,
  currentDate: Date
): Promise<UrgentAlert[]> {
  const alerts: UrgentAlert[] = [];

  // Rileva pattern timing per questa zona
  const timingPattern = await detectPatternFromZoneMemory(zoneId, garden.id, 'timing');
  if (timingPattern && timingPattern.prediction) {
    const daysUntilPredicted = Math.floor(
      (timingPattern.prediction.nextLikelyDate!.getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Se siamo vicini alla data predetta
    if (daysUntilPredicted >= 0 && daysUntilPredicted <= 7) {
      alerts.push({
        type: 'Planning',
        message: `📅 PATTERN LOCALE: Data migliore storica per questa zona tra ${daysUntilPredicted} giorni`,
        action: `Considera di pianificare piantagioni per ${timingPattern.prediction.nextLikelyDate!.toLocaleDateString('it-IT')}`,
        blockOperations: false,
        proactiveContext: {
          historicalPattern: timingPattern.patternDescription || 'Pattern basato su storia zona',
          currentConditions: `Zona ${zoneId}`,
          confidence: timingPattern.prediction.probability,
        },
        timing: daysUntilPredicted <= 3 ? 'now' : 'this_week',
      });
    }
  }

  // Rileva pattern malattie
  const diseasePattern = await detectPatternFromZoneMemory(zoneId, garden.id, 'disease');
  if (diseasePattern && diseasePattern.prediction) {
    const daysUntilPredicted = Math.floor(
      (diseasePattern.prediction.nextLikelyDate!.getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Alert preventivo 1 settimana prima
    if (daysUntilPredicted >= 0 && daysUntilPredicted <= 14) {
      alerts.push({
        type: 'Planning',
        message: `🦠 PATTERN MALATTIA: ${diseasePattern.patternDescription} previsto tra ${daysUntilPredicted} giorni`,
        action: `Considera trattamento preventivo una settimana prima della data prevista`,
        blockOperations: false,
        proactiveContext: {
          historicalPattern: `Pattern osservato ${diseasePattern.patternData.occurrences} volte`,
          currentConditions: `Zona ${zoneId}`,
          confidence: diseasePattern.prediction.probability,
        },
        timing: daysUntilPredicted <= 7 ? 'now' : 'this_week',
      });
    }
  }

  return alerts;
}

/**
 * Genera alert meteo proattivi combinando previsioni e pattern storici
 */
async function generateWeatherProactiveAlerts(
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date
): Promise<UrgentAlert[]> {
  const alerts: UrgentAlert[] = [];

  if (!garden.coordinates) return alerts;

  try {
    const forecast = await getWeatherForecast(
      garden.coordinates.latitude,
      garden.coordinates.longitude
    );
	    const currentForecast = Array.isArray(forecast) ? forecast[0] : forecast;
	    if (!currentForecast) return alerts;

    // Cerca task di trapianto recenti (ultimi 7 giorni)
    const recentTransplants = tasks.filter((t) => {
      if (t.taskType !== 'Transplant' || t.completed) return false;
      const taskDate = new Date(t.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff >= 0 && daysDiff <= 7;
    });

    // Se gelo previsto e ci sono trapianti recenti
	    const tempMin = currentForecast.tempMin ?? currentForecast.temp_min;
	    if (tempMin !== undefined && tempMin < 2 && recentTransplants.length > 0) {
	      const plants = recentTransplants.map((t) => t.plantName).join(', ');

	      alerts.push({
	        type: 'Frost',
	        message: `⚠️ GELATA PREVISTA + TRAPIANTI RECENTI: ${tempMin.toFixed(1)}°C previsto`,
	        action: `Copri immediatamente: ${plants}. Usa TNT o sposta vasi al riparo.`,
	        blockOperations: true,
	        proactiveContext: {
	          historicalPattern: 'Gelo previsto con piantine ancora fragili',
	          currentConditions: `Trapianti effettuati ${recentTransplants.length} giorni fa`,
	          predictedRisk: `Gelo ${tempMin.toFixed(1)}°C previsto`,
	          confidence: 0.9,
	        },
	        timing: 'now',
      });
    }
  } catch (error) {
    console.error('Error generating weather proactive alerts:', error);
  }

  return alerts;
}

/**
 * Prioritizza alert per importanza
 */
function prioritizeAlerts(alerts: UrgentAlert[]): UrgentAlert[] {
  // Ordina per:
  // 1. blockOperations (true prima)
  // 2. timing (now prima di tomorrow prima di this_week)
  // 3. confidence (più alta prima)
  return alerts.sort((a, b) => {
    if (a.blockOperations !== b.blockOperations) {
      return a.blockOperations ? -1 : 1;
    }

    const timingOrder = { now: 0, tomorrow: 1, this_week: 2 };
    const aTiming = a.timing || 'this_week';
    const bTiming = b.timing || 'this_week';
    if (timingOrder[aTiming] !== timingOrder[bTiming]) {
      return timingOrder[aTiming] - timingOrder[bTiming];
    }

    const aConfidence = a.proactiveContext?.confidence || 0;
    const bConfidence = b.proactiveContext?.confidence || 0;
    return bConfidence - aConfidence;
  });
}

/**
 * Determina timing ottimale per un alert
 */
export function determineAlertTiming(
  alert: UrgentAlert,
  currentDate: Date = new Date()
): 'now' | 'tomorrow' | 'this_week' {
  if (alert.blockOperations) return 'now';

  // Se c'è una data predetta nel contesto
  if (alert.proactiveContext?.predictedRisk) {
    // Estrai data se possibile (esempio semplificato)
    // In produzione, parseresti meglio il predictedRisk
    return 'this_week';
  }

  return alert.timing || 'this_week';
}
