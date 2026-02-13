'use client';

import type {
  Garden,
  GardenTask,
  DirectorPrompt,
  UrgentAlert
} from '../types';
import type { AquaponicReading } from '../types/indoorGrowing';
import { format, differenceInDays, addDays } from 'date-fns';

/**
 * Director specializzato per sistemi acquaponici
 * Genera suggerimenti specifici per MediaBed, NFT, DWC, Hybrid
 */

export interface AquaponicTaskAdvice {
  urgentAlerts: UrgentAlert[];
  prompts: DirectorPrompt[];
}

/**
 * Genera suggerimenti per sistemi acquaponici
 */
export function generateAquaponicSuggestions(
  garden: Garden,
  tasks: GardenTask[],
  readings: AquaponicReading[],
  currentDate: Date
): AquaponicTaskAdvice {
  const urgentAlerts: UrgentAlert[] = [];
  const prompts: DirectorPrompt[] = [];
  
  if (!garden.aquaponicConfig) {
    return { urgentAlerts, prompts };
  }
  
  const config = garden.aquaponicConfig;
  const lastReading = readings[0]; // Assume sorted by date desc
  const todayIso = format(currentDate, 'yyyy-MM-dd');
  
  // 1. Controllo ammoniaca - CRITICO (tossica per pesci)
  if (lastReading?.ammonia && lastReading.ammonia > config.waterQuality.ammoniaTarget) {
    urgentAlerts.push({
      type: 'Safety',
      message: `⚠️ AMMONIACA ALTA: ${lastReading.ammonia.toFixed(2)} mg/L (target: <${config.waterQuality.ammoniaTarget})`,
      action: 'Riduci alimentazione pesci, aumenta aerazione, verifica biofilter. Ammoniaca tossica per pesci!',
      blockOperations: true,
      timing: 'now'
    });
    
    const hasOpenWaterTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'AquaponicWaterTest' && 
      !t.completed
    );
    
    if (!hasOpenWaterTask) {
      prompts.push({
        id: `aqua_ammonia_alert_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'High',
        title: '⚠️ Ammoniaca Alta - Pericolo Pesci',
        body: `Ammoniaca: ${lastReading.ammonia.toFixed(2)} mg/L (target: <${config.waterQuality.ammoniaTarget}). Tossica per pesci! Possibili cause: sovralimentazione, biofilter non maturo, pesci morti non rimossi.`,
        options: [{
          id: 'create_task',
          label: 'Intervento Urgente',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: `Correzione Ammoniaca (${lastReading.ammonia.toFixed(2)} mg/L)`,
            taskType: 'AquaponicWaterTest',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'aquaponic_director',
            notes: 'AZIONI: 1) Sospendi alimentazione pesci per 24h. 2) Aumenta aerazione. 3) Verifica biofilter funzionante. 4) Rimuovi pesci morti/cibo non consumato. 5) Cambio parziale acqua (10-20%) se critico.'
          }
        }]
      });
    }
  }
  
  // 2. Controllo nitriti - ALTO (tossici per pesci)
  if (lastReading?.nitrite && lastReading.nitrite > config.waterQuality.nitriteTarget) {
    const hasOpenNitriteTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'AquaponicWaterTest' && 
      !t.completed &&
      t.plantName?.includes('Nitriti')
    );
    
    if (!hasOpenNitriteTask) {
      prompts.push({
        id: `aqua_nitrite_alert_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'High',
        title: '⚠️ Nitriti Alti',
        body: `Nitriti: ${lastReading.nitrite.toFixed(2)} mg/L (target: <${config.waterQuality.nitriteTarget}). Tossici per pesci! Biofilter non completamente ciclato o sovraccarico.`,
        options: [{
          id: 'create_task',
          label: 'Correggi Nitriti',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: `Correzione Nitriti (${lastReading.nitrite.toFixed(2)} mg/L)`,
            taskType: 'AquaponicWaterTest',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'aquaponic_director',
            notes: 'Riduci alimentazione pesci. Aumenta aerazione. Verifica biofilter. Aggiungi sale (1-3 g/L) per ridurre tossicità. Monitora giornalmente.'
          }
        }]
      });
    }
  }
  
  // 3. Controllo nitrati - BASSO (nutrienti per piante)
  if (lastReading?.nitrate && lastReading.nitrate < config.waterQuality.nitrateTarget * 0.5) {
    const hasOpenNitrateTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'AquaponicFishFeed' && 
      !t.completed &&
      t.plantName?.includes('Aumenta')
    );
    
    if (!hasOpenNitrateTask) {
      prompts.push({
        id: `aqua_nitrate_low_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'Medium',
        title: '📉 Nitrati Bassi - Piante Sottonutrite',
        body: `Nitrati: ${lastReading.nitrate.toFixed(1)} mg/L (target: ${config.waterQuality.nitrateTarget}). Piante sottonutrite. Aumenta gradualmente alimentazione pesci.`,
        options: [{
          id: 'create_task',
          label: 'Aumenta Alimentazione',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Aumenta Alimentazione Pesci (nitrati bassi)',
            taskType: 'AquaponicFishFeed',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'aquaponic_director',
            notes: `Aumenta gradualmente alimentazione pesci del 10-20%. Monitora ammoniaca/nitriti per evitare sovraccarico biofilter. Target nitrati: ${config.waterQuality.nitrateTarget} mg/L.`
          }
        }]
      });
    }
  }
  
  // 4. Promemoria test acqua periodico
  const daysSinceLastTest = lastReading 
    ? differenceInDays(currentDate, new Date(lastReading.readingDate))
    : 999;
  
  const testFrequency = config.maintenance.testFrequencyDays;
  
  if (daysSinceLastTest >= testFrequency) {
    const hasOpenTestTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'AquaponicWaterTest' && 
      !t.completed
    );
    
    if (!hasOpenTestTask) {
      prompts.push({
        id: `aqua_test_reminder_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'Medium',
        title: '🧪 Test Acqua Programmato',
        body: `È passato ${daysSinceLastTest} giorni dall'ultimo test. Frequenza consigliata: ogni ${testFrequency} giorni. Testa ammoniaca, nitriti, nitrati, pH e temperatura.`,
        options: [{
          id: 'create_task',
          label: 'Registra Test',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Test Completo Acqua Acquaponica',
            taskType: 'AquaponicWaterTest',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'aquaponic_director',
            notes: `Misura: Ammoniaca (<${config.waterQuality.ammoniaTarget} mg/L), Nitriti (<${config.waterQuality.nitriteTarget} mg/L), Nitrati (${config.waterQuality.nitrateTarget} mg/L), pH (${config.waterQuality.phTarget}), Temperatura (${config.waterQuality.temperature.min}-${config.waterQuality.temperature.max}°C).`
          }
        }]
      });
    }
  }
  
  // 5. Promemoria alimentazione pesci
  const lastFeed = config.maintenance.lastFishFeed 
    ? new Date(config.maintenance.lastFishFeed)
    : null;
  
  const hoursSinceLastFeed = lastFeed 
    ? differenceInDays(currentDate, lastFeed) * 24
    : 999;
  
  const feedFrequencyHours = 24 / config.maintenance.feedFrequency;
  
  if (hoursSinceLastFeed >= feedFrequencyHours) {
    const hasOpenFeedTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'AquaponicFishFeed' && 
      !t.completed &&
      !t.plantName?.includes('Aumenta')
    );
    
    if (!hasOpenFeedTask) {
      prompts.push({
        id: `aqua_feed_reminder_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'Medium',
        title: '🐟 Alimentazione Pesci',
        body: `Alimenta i pesci (${config.maintenance.feedFrequency} volte/giorno). Dose: ${config.maintenance.feedAmount || 'n/d'} grammi. Rimuovi cibo non consumato dopo 5 minuti.`,
        options: [{
          id: 'create_task',
          label: 'Alimenta Pesci',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: `Alimentazione Pesci (${config.fishTank.fishSpecies?.join(', ') || 'n/d'})`,
            taskType: 'AquaponicFishFeed',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'aquaponic_director',
            notes: `Dose: ${config.maintenance.feedAmount || 'n/d'}g. Osserva comportamento pesci. Rimuovi cibo non consumato dopo 5 min per evitare ammoniaca. Biomassa pesci: ${config.fishTank.fishBiomass || 'n/d'} kg.`
          }
        }]
      });
    }
  }
  
  // 6. Promemoria pulizia filtri
  const hasOpenFilterTask = tasks.some(t => 
    t.gardenId === garden.id &&
    t.taskType === 'AquaponicFilterClean' && 
    !t.completed
  );
  
  if (!hasOpenFilterTask && daysSinceLastTest >= 14) {
    prompts.push({
      id: `aqua_filter_clean_${garden.id}_${todayIso}`,
      category: 'seasonal_baseline',
      priority: 'Low',
      title: '🧹 Pulizia Filtri',
      body: `Pulisci filtro meccanico e verifica biofilter. Non pulire troppo il biofilter (perdi batteri nitrificanti)!`,
      options: [{
        id: 'create_task',
        label: 'Programma Pulizia',
        actionType: 'create_task',
        createTask: {
          gardenId: garden.id,
          plantName: 'Pulizia Filtri Acquaponici',
          taskType: 'AquaponicFilterClean',
          date: format(addDays(currentDate, 7), 'yyyy-MM-dd'),
          completed: false,
          isSuggested: true,
          suggestedBy: 'aquaponic_director',
          notes: `Pulisci filtro meccanico con acqua del sistema (non cloro!). Verifica biofilter (${config.filtration.biofilterMedia || 'n/d'}, ${config.filtration.biofilterVolume || 'n/d'}L): sciacqua LEGGERMENTE solo se molto sporco.`
        }
      }]
    });
  }
  
  return { urgentAlerts, prompts };
}
