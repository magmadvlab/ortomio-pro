'use client';

import type {
  Garden,
  GardenTask,
  DirectorPrompt,
  UrgentAlert
} from '../types';
import { format, differenceInDays, addDays } from 'date-fns';

/**
 * Director specializzato per sistemi aeroponici
 * Genera suggerimenti specifici per HighPressure, LowPressure, Ultrasonic
 */

export interface AeroponicTaskAdvice {
  urgentAlerts: UrgentAlert[];
  prompts: DirectorPrompt[];
}

/**
 * Genera suggerimenti per sistemi aeroponici
 */
export function generateAeroponicSuggestions(
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date
): AeroponicTaskAdvice {
  const urgentAlerts: UrgentAlert[] = [];
  const prompts: DirectorPrompt[] = [];
  
  if (!garden.aeroponicConfig) {
    return { urgentAlerts, prompts };
  }
  
  const config = garden.aeroponicConfig;
  const todayIso = format(currentDate, 'yyyy-MM-dd');
  
  // 1. Promemoria pulizia ugelli - CRITICO (ostruzioni = piante morte)
  const lastNozzleClean = config.maintenance.lastNozzleClean 
    ? new Date(config.maintenance.lastNozzleClean)
    : null;
  
  const daysSinceNozzleClean = lastNozzleClean 
    ? differenceInDays(currentDate, lastNozzleClean)
    : 999;
  
  const nozzleCleanFrequency = config.maintenance.cleanFrequencyDays;
  
  if (daysSinceNozzleClean >= nozzleCleanFrequency) {
    const hasOpenNozzleTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'AeroponicNozzleClean' && 
      !t.completed
    );
    
    if (!hasOpenNozzleTask) {
      const priority: DirectorPrompt['priority'] = daysSinceNozzleClean > nozzleCleanFrequency + 3 ? 'High' : 'Medium';
      
      prompts.push({
        id: `aero_nozzle_clean_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority,
        title: '💧 Pulizia Ugelli Aeroponica',
        body: `È passato ${daysSinceNozzleClean} giorni dall'ultima pulizia ugelli. Frequenza consigliata: ogni ${nozzleCleanFrequency} giorni. Ugelli ostruiti = radici secche = piante morte!`,
        options: [{
          id: 'create_task',
          label: 'Pulisci Ugelli',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Pulizia Ugelli Nebulizzazione',
            taskType: 'AeroponicNozzleClean',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'aeroponic_director',
            notes: `Smonta e pulisci tutti i ${config.misting.nozzleCount} ugelli. Usa aceto o acido citrico per rimuovere depositi minerali. Verifica spray pattern uniforme. Sostituisci ugelli danneggiati.`
          }
        }]
      });
    }
  }
  
  // 2. Controllo pressione (per high pressure)
  if (config.systemType === 'HighPressure' && config.misting.pressure) {
    const hasOpenPressureTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'AeroponicPressureCheck' && 
      !t.completed
    );
    
    if (!hasOpenPressureTask && daysSinceNozzleClean >= 7) {
      prompts.push({
        id: `aero_pressure_check_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'Medium',
        title: '⚙️ Controllo Pressione Sistema',
        body: `Verifica pressione sistema high-pressure (target: ${config.misting.pressure} PSI). Pressione bassa = gocce grosse invece di nebbia fine = radici bagnate invece di umide.`,
        options: [{
          id: 'create_task',
          label: 'Controlla Pressione',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: `Controllo Pressione (target: ${config.misting.pressure} PSI)`,
            taskType: 'AeroponicPressureCheck',
            date: format(addDays(currentDate, 7), 'yyyy-MM-dd'),
            completed: false,
            isSuggested: true,
            suggestedBy: 'aeroponic_director',
            notes: `Verifica manometro: pressione deve essere ${config.misting.pressure} PSI. Se bassa: controlla pompa, filtri, perdite. Se alta: regola valvola pressione. Osserva nebulizzazione: deve essere nebbia fine, non gocce.`
          }
        }]
      });
    }
  }
  
  // 3. Promemoria cambio soluzione
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
        id: `aero_change_reminder_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'High',
        title: '🔄 Cambio Soluzione Nutritiva',
        body: `È passato ${daysSinceChange} giorni dall'ultimo cambio soluzione. Frequenza consigliata: ogni ${changeFrequency} giorni. Cambia soluzione per prevenire accumulo sali e squilibri nutrienti.`,
        options: [{
          id: 'create_task',
          label: 'Programma Cambio',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Cambio Soluzione Nutritiva Aeroponica',
            taskType: 'HydroSolutionChange',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'aeroponic_director',
            notes: `Svuota serbatoio (${config.nutrientSolution.reservoirCapacity}L), pulisci pareti. Prepara nuova soluzione: regola pH a ${config.nutrientSolution.phTarget} ed EC a ${config.nutrientSolution.ecTarget} mS/cm. Verifica ugelli dopo cambio.`
          }
        }]
      });
    }
  }
  
  // 4. Verifica ventilazione camera radici
  if (config.rootChamber.hasVentilation) {
    const hasOpenVentTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.taskType === 'HydroEquipmentCheck' && 
      !t.completed &&
      t.plantName?.includes('Ventilazione')
    );
    
    if (!hasOpenVentTask && daysSinceNozzleClean >= 14) {
      prompts.push({
        id: `aero_ventilation_check_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'Low',
        title: '🌬️ Controllo Ventilazione Camera Radici',
        body: `Verifica ventilazione camera radici. Umidità troppo alta = muffe e marciumi radicali. Ventilazione previene ristagno umidità.`,
        options: [{
          id: 'create_task',
          label: 'Controlla Ventilazione',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Controllo Ventilazione Camera Radici',
            taskType: 'HydroEquipmentCheck',
            date: format(addDays(currentDate, 14), 'yyyy-MM-dd'),
            completed: false,
            isSuggested: true,
            suggestedBy: 'aeroponic_director',
            notes: `Verifica ventilatori funzionanti. Controlla umidità camera radici (ideale: 80-90%). Se troppo umida: aumenta ventilazione. Se troppo secca: riduci ventilazione o aumenta frequenza nebulizzazione.`
          }
        }]
      });
    }
  }
  
  // 5. Suggerimenti specifici per tipo sistema
  switch (config.systemType) {
    case 'HighPressure':
      // High pressure richiede manutenzione più frequente
      if (daysSinceNozzleClean >= nozzleCleanFrequency - 2) {
        const hasOpenMaintenanceReminder = tasks.some(t => 
          t.gardenId === garden.id &&
          t.taskType === 'HydroEquipmentCheck' && 
          !t.completed &&
          t.plantName?.includes('High Pressure')
        );
        
        if (!hasOpenMaintenanceReminder) {
          prompts.push({
            id: `aero_hp_maintenance_${garden.id}_${todayIso}`,
            category: 'seasonal_baseline',
            priority: 'Low',
            title: '⚠️ Manutenzione High Pressure',
            body: `Sistema high-pressure richiede manutenzione frequente. Controlla: pompa, filtri, manometro, ugelli. Depositi minerali si accumulano rapidamente ad alta pressione.`,
            options: [{
              id: 'create_task',
              label: 'Manutenzione Sistema',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Manutenzione Sistema High Pressure',
                taskType: 'HydroEquipmentCheck',
                date: format(addDays(currentDate, 3), 'yyyy-MM-dd'),
                completed: false,
                isSuggested: true,
                suggestedBy: 'aeroponic_director',
                notes: `Controlla: 1) Pompa high-pressure funzionante. 2) Filtri puliti. 3) Manometro preciso. 4) Ugelli non ostruiti. 5) Tubazioni senza perdite. 6) Valvola pressione regolata (${config.misting.pressure} PSI).`
              }
            }]
          });
        }
      }
      break;
      
    case 'Ultrasonic':
      // Ultrasonic richiede pulizia dischi ultrasonici
      const hasOpenUltrasonicTask = tasks.some(t => 
        t.gardenId === garden.id &&
        t.taskType === 'AeroponicNozzleClean' && 
        !t.completed &&
        t.plantName?.includes('Ultrasonici')
      );
      
      if (!hasOpenUltrasonicTask && daysSinceNozzleClean >= 7) {
        prompts.push({
          id: `aero_ultrasonic_clean_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'Medium',
          title: '🔊 Pulizia Dischi Ultrasonici',
          body: `Pulisci dischi ultrasonici per mantenere nebulizzazione efficace. Depositi minerali riducono efficienza ultrasuoni.`,
          options: [{
            id: 'create_task',
            label: 'Pulisci Dischi',
            actionType: 'create_task',
            createTask: {
              gardenId: garden.id,
              plantName: 'Pulizia Dischi Ultrasonici',
              taskType: 'AeroponicNozzleClean',
              date: format(addDays(currentDate, 7), 'yyyy-MM-dd'),
              completed: false,
              isSuggested: true,
              suggestedBy: 'aeroponic_director',
              notes: `Smonta dischi ultrasonici. Pulisci con aceto o acido citrico per rimuovere depositi. Risciacqua bene. Verifica funzionamento: deve produrre nebbia fine e uniforme.`
            }
          }]
        });
      }
      break;
  }
  
  return { urgentAlerts, prompts };
}
