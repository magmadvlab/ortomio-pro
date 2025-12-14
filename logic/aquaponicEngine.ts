import { Garden, GardenTask } from '../types';
import { AquaponicSystemConfig, AquaponicReading } from '../types/indoorGrowing';

/**
 * Motore logico per gestione sistemi acquaponici (Pro Feature)
 * Calcola task automatici per manutenzione e monitoraggio
 */

export interface AquaponicTaskAdvice {
  taskType: 'WaterTest' | 'FishFeed' | 'FilterMaintenance' | 'Alert' | 'NitrogenCycleCheck';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  isUrgent?: boolean;
}

/**
 * Calcola task per sistema acquaponico
 */
export const calculateAquaponicTasks = (
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date(),
  readings?: AquaponicReading[]
): AquaponicTaskAdvice[] => {
  const tasksAdvice: AquaponicTaskAdvice[] = [];
  if (!garden.aquaponicConfig) return tasksAdvice;

  const config = garden.aquaponicConfig;
  const lastReading = readings && readings.length > 0 ? readings[0] : null;
  const daysSinceLastReading = lastReading
    ? Math.floor((currentDate.getTime() - new Date(lastReading.readingDate).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  // 1. TEST QUALITÀ ACQUA PROGRAMMATO
  const daysSinceLastTest = config.maintenance.lastWaterTest
    ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastWaterTest).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  if (daysSinceLastTest >= config.maintenance.testFrequencyDays) {
    tasksAdvice.push({
      taskType: 'WaterTest',
      priority: daysSinceLastTest > config.maintenance.testFrequencyDays * 2 ? 'High' : 'Medium',
      message: `Test qualità acqua (${daysSinceLastTest} giorni dall'ultimo test)`,
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `pH target: ${config.waterQuality.phTarget}`,
        `Ammoniaca target: < ${config.waterQuality.ammoniaTarget} mg/L`,
        `Nitriti target: < ${config.waterQuality.nitriteTarget} mg/L`,
        `Nitrati target: ${config.waterQuality.nitrateTarget} mg/L`,
        'Usa kit di test per acquariofilia',
        'Registra tutti i valori nel sistema',
        'Se valori fuori range, prendi azioni correttive'
      ]
    });
  }

  // 2. ALERT CRITICI PER SALUTE PESCI
  if (lastReading) {
    const criticalAlerts: string[] = [];

    if (lastReading.ammonia && lastReading.ammonia > config.waterQuality.ammoniaTarget * 2) {
      criticalAlerts.push(`⚠️ AMMONIACA CRITICA: ${lastReading.ammonia.toFixed(2)} mg/L (target: < ${config.waterQuality.ammoniaTarget})`);
    }

    if (lastReading.nitrite && lastReading.nitrite > config.waterQuality.nitriteTarget * 2) {
      criticalAlerts.push(`⚠️ NITRITI CRITICI: ${lastReading.nitrite.toFixed(2)} mg/L (target: < ${config.waterQuality.nitriteTarget})`);
    }

    if (lastReading.ph && (lastReading.ph < 6.5 || lastReading.ph > 7.5)) {
      criticalAlerts.push(`⚠️ pH FUORI RANGE: ${lastReading.ph.toFixed(2)} (target: ${config.waterQuality.phTarget})`);
    }

    if (criticalAlerts.length > 0) {
      tasksAdvice.push({
        taskType: 'Alert',
        priority: 'Critical',
        message: criticalAlerts.join(' | '),
        dueDate: currentDate.toISOString().split('T')[0],
        instructions: [
          'AZIONE IMMEDIATA RICHIESTA per salvare i pesci!',
          'Fai cambio parziale acqua (20-30%)',
          'Aggiungi batteri benefici se necessario',
          'Verifica che il filtro biologico funzioni',
          'Riduci alimentazione pesci temporaneamente',
          'Monitora ogni 12-24 ore fino a normalizzazione'
        ],
        isUrgent: true
      });
    }
  }

  // 3. ALIMENTAZIONE PESCI
  const lastFeedDate = config.maintenance.lastFishFeed
    ? new Date(config.maintenance.lastFishFeed)
    : null;
  const hoursSinceLastFeed = lastFeedDate
    ? Math.floor((currentDate.getTime() - lastFeedDate.getTime()) / (1000 * 60 * 60))
    : Infinity;

  const hoursBetweenFeeds = 24 / config.maintenance.feedFrequency;
  if (hoursSinceLastFeed >= hoursBetweenFeeds) {
    tasksAdvice.push({
      taskType: 'FishFeed',
      priority: 'Medium',
      message: `Alimenta i pesci (${config.maintenance.feedFrequency} volte al giorno)`,
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `Quantità: ${config.maintenance.feedAmount ? `${config.maintenance.feedAmount}g` : 'quantità appropriata per numero pesci'}`,
        'Usa mangime di qualità per acquaponica',
        'Non sovralimentare (i pesci dovrebbero finire il cibo in 5 minuti)',
        'Rimuovi cibo non consumato dopo 10 minuti',
        'Registra la data dell\'alimentazione'
      ]
    });
  }

  // 4. MANUTENZIONE FILTRI
  if (config.filtration.hasMechanicalFilter || config.filtration.hasBiologicalFilter) {
    tasksAdvice.push({
      taskType: 'FilterMaintenance',
      priority: 'Medium',
      message: 'Manutenzione filtri sistema acquaponico',
      dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: [
        config.filtration.hasMechanicalFilter ? 'Pulisci filtro meccanico (rimuovi detriti)' : '',
        config.filtration.hasBiologicalFilter ? 'Controlla filtro biologico (non pulire troppo aggressivamente)' : '',
        'Lava solo con acqua del sistema (non acqua di rubinetto clorata)',
        'Mantieni batteri benefici nel filtro biologico',
        'Verifica che la pompa funzioni correttamente'
      ].filter(Boolean)
    });
  }

  // 5. CONTROLLO CICLO AZOTO
  if (lastReading) {
    const hasAmmonia = lastReading.ammonia && lastReading.ammonia > 0;
    const hasNitrite = lastReading.nitrite && lastReading.nitrite > 0;
    const hasNitrate = lastReading.nitrate && lastReading.nitrate > 0;

    if (!hasNitrate && (hasAmmonia || hasNitrite)) {
      tasksAdvice.push({
        taskType: 'NitrogenCycleCheck',
        priority: 'High',
        message: 'Ciclo azoto non completo - sistema in maturazione',
        dueDate: currentDate.toISOString().split('T')[0],
        instructions: [
          'Il sistema è ancora in fase di maturazione',
          'Aggiungi batteri benefici per accelerare il ciclo',
          'Riduci alimentazione pesci fino a completamento ciclo',
          'Monitora ammoniaca e nitriti giornalmente',
          'Il ciclo sarà completo quando avrai nitrati e zero ammoniaca/nitriti'
        ]
      });
    }
  }

  return tasksAdvice;
};


