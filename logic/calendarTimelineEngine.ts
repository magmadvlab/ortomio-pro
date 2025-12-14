/**
 * Calendar Timeline Engine
 * Genera timeline automatica delle fasi successive quando viene completata una semina
 * Integrato nell'orchestrator per generare suggerimenti automatici
 */

import { GardenTask, PlantMasterSheet, Garden } from '../types';
import { getMasterSheet } from '../services/plantMasterService';
import { calculateMoonPhase, isIdealPhaseFor } from './lunarCalendar';

export interface CalendarTimeline {
  sowingDate: Date;
  plantName: string;
  suggestedTasks: SuggestedCalendarTask[];
}

export interface SuggestedCalendarTask {
  taskType: 'Transplant' | 'Fertilize' | 'Treatment' | 'Harvest';
  suggestedDate: string; // ISO date string
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  plantName: string;
  gardenId: string;
  isSuggested: true; // Sempre true per task generati
  suggestedBy: string; // ID del task di semina che ha generato questo suggerimento
}

/**
 * Genera timeline automatica completa delle fasi successive quando viene completata una semina
 * 
 * **Scopo**: Quando l'utente completa una semina (es. peperoncino il 1° marzo), il sistema
 * calcola automaticamente tutte le fasi successive e genera suggerimenti per:
 * - Germinazione (monitoraggio)
 * - Trapianto (se applicabile, dopo sviluppo piantine)
 * - Concimazioni periodiche (ogni 20-30 giorni)
 * - Trattamenti preventivi (ogni 15 giorni durante crescita)
 * - Raccolta prevista (basata su giorni dalla semina)
 * 
 * **Quando viene chiamato**: 
 * - Automaticamente dall'orchestrator (`director.ts`) quando:
 *   - `taskType === 'Sowing'`
 *   - `completed === true`
 *   - `isSuggested === false` (solo semine manuali, non suggerite)
 * 
 * **Cosa genera**:
 * - Array di `SuggestedCalendarTask` con tutte le fasi successive
 * - Ogni task ha `isSuggested: true` e `suggestedDate` calcolata automaticamente
 * - I task sono linkati al task di semina originale tramite `suggestedBy`
 * 
 * **Tracking e sincronizzazione**:
 * - Tutti i task generati hanno `isSuggested: true` per distinguerli da task manuali
 * - La `suggestedDate` viene calcolata basandosi sulla data di semina e giorni attesi per ogni fase
 * - Se un task viene completato in data diversa da quella suggerita, viene tracciato con `actualCompletedDate`
 * - L'orchestrator usa la data effettiva (non quella suggerita) per ricalcolare i prossimi suggerimenti
 * 
 * **Integrazione**:
 * - Integra con `seedlingTimelineEngine.ts` per calcoli germinazione/trapianto
 * - Considera fasi lunari per ottimizzare date trapianto
 * - Usa dati da `PlantMasterSheet` per calcolare giorni attesi per ogni fase
 * 
 * @param sowingTask - Task di semina completato
 * @param masterData - Scheda master della pianta con dati fenologici
 * @param garden - Giardino dove è stata effettuata la semina
 * @returns CalendarTimeline - Timeline completa con tutti i task suggeriti
 */
export function generateTimelineFromSowing(
  sowingTask: GardenTask,
  masterData: PlantMasterSheet,
  garden: Garden
): CalendarTimeline {
  const sowingDate = new Date(sowingTask.date);
  const suggestedTasks: SuggestedCalendarTask[] = [];

  // Calcola giorni per fase
  const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
  const nursingDays = 30;
  const hardeningDays = 10;
  const transplantDays = avgGerminationDays + nursingDays + hardeningDays;

  // 1. TRAPIANTO (se applicabile)
  if (sowingTask.plantingMethod === 'Seed' && masterData.transplanting) {
    const transplantDate = new Date(sowingDate);
    transplantDate.setDate(transplantDate.getDate() + transplantDays);

    // Verifica fase lunare ideale per trapianto
    const moonCheck = isIdealPhaseFor('transplant', masterData.nutrientCategory, transplantDate);
    if (!moonCheck.ideal && moonCheck.daysUntilIdeal) {
      transplantDate.setDate(transplantDate.getDate() + moonCheck.daysUntilIdeal);
    }

    suggestedTasks.push({
      taskType: 'Transplant',
      suggestedDate: transplantDate.toISOString().split('T')[0],
      title: `Trapianto ${sowingTask.plantName}`,
      description: `Trapianto previsto dopo ${transplantDays} giorni dalla semina. Verifica che le piantine abbiano almeno 4-6 foglie vere.`,
      priority: 'High',
      plantName: sowingTask.plantName,
      gardenId: sowingTask.gardenId,
      isSuggested: true,
      suggestedBy: sowingTask.id
    });
  }

  // 2. CONCIMAZIONI (ogni 20-30 giorni dopo trapianto o 40 giorni dopo semina)
  const firstFertilizationDays = sowingTask.plantingMethod === 'Seed' ? transplantDays + 20 : 40;
  const fertilizationInterval = 25; // giorni tra una concimazione e l'altra

  for (let i = 0; i < 4; i++) { // 4 concimazioni previste
    const fertDate = new Date(sowingDate);
    fertDate.setDate(fertDate.getDate() + firstFertilizationDays + (i * fertilizationInterval));

    // Non suggerire concimazioni oltre la fine del ciclo
    const daysToHarvest = masterData.harvestWindow?.daysToFirstHarvest || 90;
    if (fertDate.getTime() > sowingDate.getTime() + daysToHarvest * 24 * 60 * 60 * 1000) {
      break;
    }

    suggestedTasks.push({
      taskType: 'Fertilize',
      suggestedDate: fertDate.toISOString().split('T')[0],
      title: `Concimazione ${sowingTask.plantName} - ${i + 1}° applicazione`,
      description: i === 0 
        ? 'Prima concimazione dopo trapianto/sviluppo iniziale'
        : `Concimazione di mantenimento (${i + 1}° applicazione)`,
      priority: i === 0 ? 'High' : 'Medium',
      plantName: sowingTask.plantName,
      gardenId: sowingTask.gardenId,
      isSuggested: true,
      suggestedBy: sowingTask.id
    });
  }

  // 3. TRATTAMENTI PREVENTIVI (ogni 15 giorni durante crescita)
  const firstTreatmentDays = sowingTask.plantingMethod === 'Seed' ? transplantDays + 10 : 30;
  const treatmentInterval = 15;

  for (let i = 0; i < 3; i++) { // 3 trattamenti preventivi
    const treatmentDate = new Date(sowingDate);
    treatmentDate.setDate(treatmentDate.getDate() + firstTreatmentDays + (i * treatmentInterval));

    const daysToHarvest = masterData.harvestWindow?.daysToFirstHarvest || 90;
    if (treatmentDate.getTime() > sowingDate.getTime() + daysToHarvest * 24 * 60 * 60 * 1000) {
      break;
    }

    suggestedTasks.push({
      taskType: 'Treatment',
      suggestedDate: treatmentDate.toISOString().split('T')[0],
      title: `Trattamento preventivo ${sowingTask.plantName} - ${i + 1}° applicazione`,
      description: 'Trattamento preventivo per malattie e parassiti comuni',
      priority: 'Medium',
      plantName: sowingTask.plantName,
      gardenId: sowingTask.gardenId,
      isSuggested: true,
      suggestedBy: sowingTask.id
    });
  }

  // 4. RACCOLTA PREVISTA
  const daysToHarvest = masterData.harvestWindow?.daysToFirstHarvest || 90;
  const harvestDate = new Date(sowingDate);
  harvestDate.setDate(harvestDate.getDate() + daysToHarvest);

  suggestedTasks.push({
    taskType: 'Harvest',
    suggestedDate: harvestDate.toISOString().split('T')[0],
    title: `Raccolta prevista ${sowingTask.plantName}`,
    description: `Raccolta prevista dopo ${daysToHarvest} giorni dalla semina. Verifica maturazione prima di raccogliere.`,
    priority: 'High',
    plantName: sowingTask.plantName,
    gardenId: sowingTask.gardenId,
    isSuggested: true,
    suggestedBy: sowingTask.id
  });

  return {
    sowingDate,
    plantName: sowingTask.plantName,
    suggestedTasks
  };
}

/**
 * Converte un SuggestedCalendarTask in un GardenTask completo per aggiunta al calendario
 * 
 * **Scopo**: Trasforma un suggerimento generato dalla timeline in un task completo
 * che può essere salvato nel sistema e visualizzato nel calendario.
 * 
 * **Cosa fa**:
 * - Crea un nuovo `GardenTask` con ID univoco
 * - Imposta `isSuggested: true` e `suggestedDate` dal suggerimento
 * - Linka al task di semina originale tramite `suggestedBy`
 * - Mantiene informazioni pianta e giardino dal task originale
 * 
 * @param suggested - Task suggerito dalla timeline
 * @param originalSowingTask - Task di semina originale che ha generato questo suggerimento
 * @returns GardenTask - Task completo pronto per essere salvato
 */
export function convertToGardenTask(
  suggested: SuggestedCalendarTask,
  originalSowingTask: GardenTask
): GardenTask {
  return {
    id: crypto.randomUUID(),
    gardenId: suggested.gardenId,
    plantName: suggested.plantName,
    variety: originalSowingTask.variety,
    plantingMethod: originalSowingTask.plantingMethod,
    taskType: suggested.taskType,
    date: suggested.suggestedDate,
    suggestedDate: suggested.suggestedDate,
    isSuggested: true,
    suggestedBy: suggested.suggestedBy,
    completed: false,
    notes: suggested.description,
    lifecycleState: suggested.taskType === 'Transplant' ? 'Transplanting' : 
                     suggested.taskType === 'Harvest' ? 'Production' : undefined
  };
}
