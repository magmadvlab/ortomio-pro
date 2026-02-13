'use client';

import type {
  Garden,
  GardenTask,
  DirectorPrompt,
  UrgentAlert
} from '../types';
import type { HydroponicReading } from '../types/indoorGrowing';
import { format, differenceInDays, addDays } from 'date-fns';

/**
 * Director specializzato per sistemi idroponici
 * Genera suggerimenti specifici per NFT, DWC, Ebb&Flow, Drip, Wick, Kratky
 */

export interface HydroponicTaskAdvice {
  urgentAlerts: UrgentAlert[];
  prompts: DirectorPrompt[];
}

/**
 * Genera suggerimenti per sistemi idroponici
 */
export function generateHydroponicSuggestions(
  garden: Garden,
  tasks: GardenTask[],
  readings: HydroponicReading[],
  currentDate: Date
): HydroponicTaskAdvice {
  const urgentAlerts: UrgentAlert[] = [];
  const prompts: DirectorPrompt[] = [];
  
  if (!garden.hydroponicConfig) {
    return { urgentAlerts, prompts };
  }
  
  const config = garden.hydroponicConfig;
  const lastReading = readings[0]; // Assume sorted by date desc
  const todayIso = format(currentDate, 'yyyy-MM-dd');
  
  // 1. Controllo pH fuori range - CRITICO
  if (lastReading?.ph) {
    const phTarget = config.nutrientSolution.phTarget;
    const phDiff = Math.abs(lastReading.ph - phTarget);
    
    if (phDiff > 0.5) {
      const isHigh = lastReading.ph > phTarget;
      urgentAlerts.push({
        type: 'Safety',
        message: `⚠️ pH FUORI RANGE: ${lastReading.ph.toFixed(1)} (target: ${phTarget})`,
        action: `Correggi immediatamente: ${isHigh ? 'aggiungi pH Down (acido)' : 'aggiungi pH Up (basico)'}. Blocco nutrienti in corso!`,
        blockOperations: true,
        timing: 'now'
      });
      
      const hasOpenPhTask = tasks.some(t => 
        t.gardenId === garden.id &&
        t.taskType === 'HydroPhAdjust' && 
        !t.completed
      );
      
      if (!hasOpenPhTask) {
        prompts.push({
          id: `hydro_ph_alert_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'High',
          title: '⚠️ pH Fuori Range - Azione Immediata',
          body: `Il pH attuale (${lastReading.ph.toFixed(1)}) è ${isHigh ? 'troppo alto' : 'troppo basso'}. Target: ${phTarget}. ${isHigh ? 'Le piante non riescono ad assorbire micronutrienti (ferro, manganese)' : 'Rischio tossicità da alluminio e manganese'}. Correggi subito!`,
          options: [{
            id: 'create_task',
            label: 'Correggi pH Ora',
            actionType: 'create_task',
            createTask: {
              gardenId: garden.id,
              plantName: `Correzione pH (attuale: ${lastReading.ph.toFixed(1)}, target: ${phTarget})`,
              taskType: 'HydroPhAdjust',
              date: todayIso,
              completed: false,
              isSuggested: true,
              suggestedBy: 'hydroponic_director',
              notes: `${isHigh ? 'Aggiungi pH Down (acido fosforico o citrico) gradualmente' : 'Aggiungi pH Up (idrossido di potassio) gradualmente'}. Mescola bene e ricontrolla dopo 15 minuti. Non correggere più di 0.5 punti per volta.`
            }
          }]
        });
      }
    }
  }
  
  // 2. Controllo EC fuori range - ALTO
  if (lastReading?.ec) {
    const ecTarget = config.nutrientSolution.ecTarget;
    const ecDiff = Math.abs(lastReading.ec - ecTarget);
    
    if (ecDiff > 0.3) {
      const isHigh = lastReading.ec > ecTarget;
      
      const hasOpenEcTask = tasks.some(t => 
        t.gardenId === garden.id &&
        t.taskType === 'HydroEcAdjust' && 
        !t.completed
      );
      
      if (!hasOpenEcTask) {
        prompts.push({
          id: `hydro_ec_alert_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'High',
          title: '⚠️ EC Fuori Range',
          body: `L'EC attuale (${lastReading.ec.toFixed(2)} mS/cm) è ${isHigh ? 'troppo alta' : 'troppo bassa'}. Target: ${ecTarget.toFixed(2)}. ${isHigh ? 'Rischio bruciature da eccesso nutrienti - diluisci con acqua' : 'Piante sottonutrite - aggiungi soluzione nutritiva'}.`,
          options: [{
            id: 'create_task',
            label: 'Correggi EC',
            actionType: 'create_task',
            createTask: {
              gardenId: garden.id,
              plantName: `Correzione EC (attuale: ${lastReading.ec.toFixed(2)}, target: ${ecTarget.toFixed(2)})`,
              taskType: 'HydroEcAdjust',
              date: todayIso,
              completed: false,
              isSuggested: true,
              suggestedBy: 'hydroponic_director',
              notes: isHigh 
                ? `Diluisci con acqua: aggiungi ${Math.round(config.nutrientSolution.reservoirCapacity * 0.1)}L di acqua pulita (10% volume). Mescola e ricontrolla.`
                : `Aggiungi soluzione nutritiva concentrata gradualmente. Mescola bene e ricontrolla dopo 10 minuti.`
            }
          }]
        });
      }
    }
  }
  
  // 3. Promemoria controllo periodico pH/EC
  const daysSinceLastCheck = lastReading 
    ? differenceInDays(currentDate, new Date(lastReading.readingDate))
    : 999;
  
  const checkFrequency = config.maintenance.phCheckFrequencyDays;
  
  if (daysSinceLastCheck >= checkFrequency) {
    const hasOpenCheckTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'HydroNutrientCheck' && 
      !t.completed
    );
    
    if (!hasOpenCheckTask) {
      prompts.push({
        id: `hydro_check_reminder_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'Medium',
        title: '📊 Controllo Nutrienti Programmato',
        body: `È passato ${daysSinceLastCheck} giorni dall'ultimo controllo. Frequenza consigliata: ogni ${checkFrequency} giorni. Controlla pH, EC e temperatura della soluzione nutritiva.`,
        options: [{
          id: 'create_task',
          label: 'Registra Controllo',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Controllo pH/EC/Temperatura',
            taskType: 'HydroNutrientCheck',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'hydroponic_director',
            notes: `Misura pH (target: ${config.nutrientSolution.phTarget}), EC (target: ${config.nutrientSolution.ecTarget} mS/cm) e temperatura. Registra i valori per monitorare trend.`
          }
        }]
      });
    }
  }
  
  // 4. Promemoria cambio soluzione
  const lastChange = config.maintenance.lastReservoirChange 
    ? new Date(config.maintenance.lastReservoirChange)
    : null;
  
  const daysSinceChange = lastChange 
    ? differenceInDays(currentDate, lastChange)
    : 999;
  
  const changeFrequency = config.maintenance.changeFrequencyDays;
  
  if (daysSinceChange >= changeFrequency) {
    const hasOpenChangeTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'HydroSolutionChange' && 
      !t.completed
    );
    
    if (!hasOpenChangeTask) {
      prompts.push({
        id: `hydro_change_reminder_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'High',
        title: '🔄 Cambio Soluzione Programmato',
        body: `È passato ${daysSinceChange} giorni dall'ultimo cambio soluzione. Frequenza consigliata: ogni ${changeFrequency} giorni. Cambia completamente la soluzione e pulisci il serbatoio per prevenire accumulo sali e alghe.`,
        options: [{
          id: 'create_task',
          label: 'Programma Cambio',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Cambio Soluzione Nutritiva',
            taskType: 'HydroSolutionChange',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'hydroponic_director',
            notes: `Svuota serbatoio (${config.nutrientSolution.reservoirCapacity}L), pulisci pareti, risciacqua. Prepara nuova soluzione: ${config.nutrientSolution.nutrientBrand || 'nutrienti'} secondo dosaggio. Regola pH a ${config.nutrientSolution.phTarget} ed EC a ${config.nutrientSolution.ecTarget} mS/cm.`
          }
        }]
      });
    }
  }
  
  // 5. Suggerimenti specifici per tipo sistema
  switch (config.systemType) {
    case 'NFT':
      if (config.nftConfig) {
        const hasOpenFlowCheck = tasks.some(t => 
          t.gardenId === garden.id &&
          t.taskType === 'HydroEquipmentCheck' && 
          !t.completed &&
          t.plantName?.includes('Flusso')
        );
        
        if (!hasOpenFlowCheck && daysSinceLastCheck >= 7) {
          prompts.push({
            id: `nft_flow_check_${garden.id}_${todayIso}`,
            category: 'seasonal_baseline',
            priority: 'Low',
            title: '🌊 Controllo Flusso NFT',
            body: `Verifica che il flusso nei canali sia costante (${config.nftConfig.flowRate} L/min). Controlla che non ci siano ostruzioni, accumuli di alghe o radici che bloccano il flusso.`,
            options: [{
              id: 'create_task',
              label: 'Registra Controllo',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Controllo Flusso Canali NFT',
                taskType: 'HydroEquipmentCheck',
                date: format(addDays(currentDate, 7), 'yyyy-MM-dd'),
                completed: false,
                isSuggested: true,
                suggestedBy: 'hydroponic_director',
                notes: `Verifica flusso uniforme in tutti i ${config.nftConfig.channelCount} canali. Pulisci eventuali ostruzioni. Controlla pompa e tubazioni.`
              }
            }]
          });
        }
      }
      break;
      
    case 'DWC':
      if (config.dwcConfig) {
        const hasOpenOxygenCheck = tasks.some(t => 
          t.gardenId === garden.id &&
          t.taskType === 'HydroEquipmentCheck' && 
          !t.completed &&
          t.plantName?.includes('Ossigenazione')
        );
        
        if (!hasOpenOxygenCheck && daysSinceLastCheck >= 3) {
          prompts.push({
            id: `dwc_oxygen_check_${garden.id}_${todayIso}`,
            category: 'seasonal_baseline',
            priority: 'Medium',
            title: '💨 Controllo Ossigenazione DWC',
            body: `Verifica che la pompa aria funzioni correttamente e che le pietre porose producano bolle fini. L'ossigenazione è CRITICA per DWC - senza ossigeno le radici marciscono in poche ore!`,
            options: [{
              id: 'create_task',
              label: 'Registra Controllo',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Controllo Pompa Aria e Pietre Porose',
                taskType: 'HydroEquipmentCheck',
                date: format(addDays(currentDate, 3), 'yyyy-MM-dd'),
                completed: false,
                isSuggested: true,
                suggestedBy: 'hydroponic_director',
                notes: `Verifica bolle fini e costanti in tutti i ${config.dwcConfig.bucketCount} secchi. Pulisci pietre porose se ostruite. Controlla pompa aria (${config.dwcConfig.airPumpPower || 'n/d'}W).`
              }
            }]
          });
        }
      }
      break;
      
    case 'EbbFlow':
      if (config.ebbFlowConfig) {
        const hasOpenCycleCheck = tasks.some(t => 
          t.gardenId === garden.id &&
          t.taskType === 'HydroEquipmentCheck' && 
          !t.completed &&
          t.plantName?.includes('Cicli')
        );
        
        if (!hasOpenCycleCheck && daysSinceLastCheck >= 7) {
          prompts.push({
            id: `ebbflow_cycle_check_${garden.id}_${todayIso}`,
            category: 'seasonal_baseline',
            priority: 'Medium',
            title: '⏱️ Controllo Cicli Ebb&Flow',
            body: `Verifica che i cicli di allagamento/scolo funzionino correttamente (${config.ebbFlowConfig.floodFrequency} volte/giorno, ${config.ebbFlowConfig.floodDuration} min). Controlla timer, pompa e valvole di drenaggio.`,
            options: [{
              id: 'create_task',
              label: 'Registra Controllo',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Controllo Timer e Cicli Allagamento',
                taskType: 'HydroEquipmentCheck',
                date: format(addDays(currentDate, 7), 'yyyy-MM-dd'),
                completed: false,
                isSuggested: true,
                suggestedBy: 'hydroponic_director',
                notes: `Verifica timer programmato correttamente. Osserva un ciclo completo: allagamento (${config.ebbFlowConfig.floodDuration} min) e scolo (${config.ebbFlowConfig.drainDuration} min). Controlla che non ci siano perdite.`
              }
            }]
          });
        }
      }
      break;
  }
  
  return { urgentAlerts, prompts };
}
