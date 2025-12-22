import { Garden, GardenTask } from '../types';
import { HydroponicSystemConfig, HydroponicReading } from '../types/indoorGrowing';

/**
 * Motore logico per gestione sistemi idroponici (Pro Feature)
 * Calcola task automatici per manutenzione e monitoraggio
 */

export interface HydroponicTaskAdvice {
  taskType: 'PhCheck' | 'EcCheck' | 'SolutionChange' | 'NutrientAdd' | 'SystemClean' | 'RootCheck' | 'Alert';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  isUrgent?: boolean;
}

/**
 * Calcola task per sistema idroponico
 */
export const calculateHydroponicTasks = (
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date(),
  readings?: HydroponicReading[]
): HydroponicTaskAdvice[] => {
  const tasksAdvice: HydroponicTaskAdvice[] = [];
  if (!garden.hydroponicConfig) return tasksAdvice;

  const config = garden.hydroponicConfig;
  const lastReading = readings && readings.length > 0 ? readings[0] : null;
  const daysSinceLastReading = lastReading
    ? Math.floor((currentDate.getTime() - new Date(lastReading.readingDate).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  // 1. CONTROLLO pH/EC PROGRAMMATO
  const daysSinceLastPhCheck = config.maintenance.lastPhCheck
    ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastPhCheck).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  if (daysSinceLastPhCheck >= config.maintenance.phCheckFrequencyDays) {
    tasksAdvice.push({
      taskType: 'PhCheck',
      priority: daysSinceLastPhCheck > config.maintenance.phCheckFrequencyDays * 2 ? 'High' : 'Medium',
      message: `Controlla pH e EC della soluzione nutritiva`,
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `pH target: ${config.nutrientSolution.phTarget}`,
        `EC target: ${config.nutrientSolution.ecTarget} mS/cm`,
        'Usa un misuratore digitale calibrato',
        'Registra i valori nel sistema',
        'Se pH fuori range, aggiusta con pH Up/Down',
        'Se EC troppo bassa, aggiungi nutrienti',
        'Se EC troppo alta, diluisci con acqua'
      ]
    });
  }

  // 2. ALERT PARAMETRI FUORI RANGE
  if (lastReading) {
    const phDiff = Math.abs((lastReading.ph || 0) - config.nutrientSolution.phTarget);
    const ecDiff = Math.abs((lastReading.ec || 0) - config.nutrientSolution.ecTarget);

    if (phDiff > 0.5 || ecDiff > 0.5) {
      tasksAdvice.push({
        taskType: 'Alert',
        priority: phDiff > 1 || ecDiff > 1 ? 'Critical' : 'High',
        message: `⚠️ Parametri fuori range! pH: ${lastReading.ph?.toFixed(2) || 'N/A'}, EC: ${lastReading.ec?.toFixed(2) || 'N/A'} mS/cm`,
        dueDate: currentDate.toISOString().split('T')[0],
        instructions: [
          phDiff > 0.5 ? `pH devia di ${phDiff.toFixed(2)} dal target (${config.nutrientSolution.phTarget})` : '',
          ecDiff > 0.5 ? `EC devia di ${ecDiff.toFixed(2)} dal target (${config.nutrientSolution.ecTarget})` : '',
          'Aggiusta immediatamente i parametri',
          'Controlla che la pompa funzioni correttamente',
          'Verifica che non ci siano perdite nel sistema'
        ].filter(Boolean),
        isUrgent: phDiff > 1 || ecDiff > 1
      });
    }
  }

  // 3. CAMBIO SOLUZIONE NUTRITIVA
  const daysSinceLastChange = config.maintenance.lastReservoirChange
    ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastReservoirChange).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  if (daysSinceLastChange >= config.maintenance.changeFrequencyDays) {
    tasksAdvice.push({
      taskType: 'SolutionChange',
      priority: daysSinceLastChange > config.maintenance.changeFrequencyDays * 1.5 ? 'High' : 'Medium',
      message: `Cambia la soluzione nutritiva (${daysSinceLastChange} giorni dall'ultimo cambio)`,
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `Svuota completamente il serbatoio (${config.nutrientSolution.reservoirCapacity}L)`,
        'Pulisci il serbatoio con acqua pulita',
        'Prepara nuova soluzione con nutrienti freschi',
        `Imposta pH a ${config.nutrientSolution.phTarget}`,
        `Imposta EC a ${config.nutrientSolution.ecTarget} mS/cm`,
        'Riempi il serbatoio con la nuova soluzione',
        'Registra la data del cambio nel sistema'
      ]
    });
  }

  // 4. CONTROLLO VOLUME SOLUZIONE
  if (lastReading && lastReading.reservoirVolume) {
    const volumePercent = (lastReading.reservoirVolume / config.nutrientSolution.reservoirCapacity) * 100;
    if (volumePercent < 50) {
      tasksAdvice.push({
        taskType: 'NutrientAdd',
        priority: volumePercent < 30 ? 'High' : 'Medium',
        message: `Volume soluzione basso: ${lastReading.reservoirVolume.toFixed(1)}L (${volumePercent.toFixed(0)}%)`,
        dueDate: currentDate.toISOString().split('T')[0],
        instructions: [
          'Aggiungi acqua e nutrienti per riportare al volume target',
          `Volume target: ${config.nutrientSolution.reservoirCapacity}L`,
          'Mantieni pH e EC nei valori target',
          'Controlla che non ci siano perdite nel sistema'
        ]
      });
    }
  }

  // 5. PULIZIA SISTEMA (mensile)
  const currentMonth = currentDate.getMonth() + 1;
  if (currentMonth % 1 === 0) { // Ogni mese
    tasksAdvice.push({
      taskType: 'SystemClean',
      priority: 'Medium',
      message: 'Pulizia mensile del sistema idroponico',
      dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15).toISOString().split('T')[0],
      instructions: [
        'Svuota e pulisci il serbatoio',
        'Pulisci canali/tubi/pompe',
        'Controlla e pulisci filtri',
        'Verifica che non ci siano ostruzioni',
        'Disinfetta con perossido di idrogeno se necessario',
        'Risciacqua bene prima di riempire con nuova soluzione'
      ]
    });
  }

  // 6. CONTROLLO RADICI (per sistemi NFT/DWC)
  if (config.systemType === 'NFT' || config.systemType === 'DWC') {
    tasksAdvice.push({
      taskType: 'RootCheck',
      priority: 'Low',
      message: 'Controlla lo stato delle radici',
      dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: [
        'Verifica che le radici siano bianche e sane',
        'Controlla che non ci siano radici marce o scure',
        'Assicurati che le radici non ostruiscano i canali (NFT)',
        'Verifica che le radici siano ben ossigenate (DWC)',
        'Se necessario, taglia radici morte o malate'
      ]
    });
  }

  return tasksAdvice;
};










