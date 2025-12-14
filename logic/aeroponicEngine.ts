import { Garden, GardenTask } from '../types';
import { AeroponicSystemConfig } from '../types/indoorGrowing';

/**
 * Motore logico per gestione sistemi aeroponici (Pro Feature)
 * Calcola task automatici per manutenzione e monitoraggio
 */

export interface AeroponicTaskAdvice {
  taskType: 'NozzleClean' | 'MistingCheck' | 'SolutionChange' | 'RootChamberMaintenance' | 'Alert';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  isUrgent?: boolean;
}

/**
 * Calcola task per sistema aeroponico
 */
export const calculateAeroponicTasks = (
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date()
): AeroponicTaskAdvice[] => {
  const tasksAdvice: AeroponicTaskAdvice[] = [];
  if (!garden.aeroponicConfig) return tasksAdvice;

  const config = garden.aeroponicConfig;

  // 1. PULIZIA UGelli PROGRAMMATA
  const daysSinceLastClean = config.maintenance.lastNozzleClean
    ? Math.floor((currentDate.getTime() - new Date(config.maintenance.lastNozzleClean).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  if (daysSinceLastClean >= config.maintenance.cleanFrequencyDays) {
    tasksAdvice.push({
      taskType: 'NozzleClean',
      priority: daysSinceLastClean > config.maintenance.cleanFrequencyDays * 1.5 ? 'High' : 'Medium',
      message: `Pulisci gli ugelli di nebulizzazione (${daysSinceLastClean} giorni dall'ultima pulizia)`,
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `Pulisci tutti i ${config.misting.nozzleCount} ugelli`,
        'Rimuovi depositi di sali minerali',
        'Usa spazzolino o ago per sbloccare ostruzioni',
        'Verifica che ogni ugello nebulizzi correttamente',
        'Controlla pressione sistema (se High Pressure)',
        'Registra la data della pulizia'
      ]
    });
  }

  // 2. CONTROLLO NEBULIZZAZIONE
  tasksAdvice.push({
    taskType: 'MistingCheck',
    priority: 'Medium',
    message: 'Verifica funzionamento sistema nebulizzazione',
    dueDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    instructions: [
      `Verifica che tutti i ${config.misting.nozzleCount} ugelli nebulizzino correttamente`,
      `Frequenza: ${config.misting.mistFrequency} volte al giorno`,
      `Durata ciclo: ${config.misting.mistDuration} secondi`,
      `Intervallo: ${config.misting.mistInterval} minuti`,
      'Controlla che non ci siano perdite',
      'Verifica che le radici ricevano umidità uniforme',
      'Se sistema non nebulizza correttamente, pulisci immediatamente'
    ]
  });

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
        `Svuota serbatoio (${config.nutrientSolution.reservoirCapacity}L)`,
        'Pulisci serbatoio e sistema di nebulizzazione',
        'Prepara nuova soluzione con nutrienti freschi',
        `pH target: ${config.nutrientSolution.phTarget}`,
        `EC target: ${config.nutrientSolution.ecTarget} mS/cm`,
        'Riempi serbatoio e testa sistema nebulizzazione',
        'Registra la data del cambio'
      ]
    });
  }

  // 4. MANUTENZIONE CAMERA RADICI
  tasksAdvice.push({
    taskType: 'RootChamberMaintenance',
    priority: 'Low',
    message: 'Manutenzione camera radici',
    dueDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    instructions: [
      `Volume camera: ${config.rootChamber.volume}L`,
      config.rootChamber.hasDrainage ? 'Verifica che il drenaggio funzioni correttamente' : '',
      config.rootChamber.hasVentilation ? 'Controlla ventilazione camera radici' : '',
      'Ispeziona radici per segni di malattia',
      'Rimuovi radici morte o marce',
      'Verifica che le radici non ostruiscano gli ugelli',
      'Mantieni ambiente pulito e ben ventilato'
    ].filter(Boolean)
  });

  // 5. ALERT SE SISTEMA NON NEBULIZZA
  // Questo sarebbe meglio verificato con sensori, ma per ora è un reminder
  tasksAdvice.push({
    taskType: 'Alert',
    priority: 'Critical',
    message: '⚠️ Verifica che il sistema nebulizzi correttamente - CRITICO per sopravvivenza piante',
    dueDate: currentDate.toISOString().split('T')[0],
    instructions: [
      'Le radici devono essere costantemente umide',
      'Se sistema non nebulizza per più di 30 minuti, le radici si seccano',
      'Controlla immediatamente se noti radici secche',
      'Verifica pressione sistema (se High Pressure)',
      'Pulisci ugelli se necessario',
      'Testa sistema prima di lasciarlo incustodito'
    ],
    isUrgent: true
  });

  return tasksAdvice;
};

