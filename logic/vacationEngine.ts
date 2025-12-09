import { Garden, GardenTask, VacationPlan, VacationTask, PlantMasterSheet } from '../types';
import { getMasterSheet } from '../services/plantMasterService';
import { calculateDaysActive } from '../services/taskCalculationService';

/**
 * Determina la fase del ciclo vitale (versione semplificata per vacation engine)
 */
const getLifecyclePhase = (daysAlive: number, task: GardenTask): 'Sowing' | 'Germination' | 'Nursing' | 'Hardening' | 'Transplanting' | 'Production' => {
  if (task.lifecycleState) {
    return task.lifecycleState;
  }
  
  if (daysAlive === 0) return 'Sowing';
  if (daysAlive < 20) return 'Germination';
  if (daysAlive < 50) return 'Nursing';
  if (daysAlive < 65) return 'Hardening';
  if (daysAlive < 90) return 'Transplanting';
  return 'Production';
};

/**
 * Genera un piano di sopravvivenza per le vacanze
 * Basato su: tipo di terreno, fase delle piante, locationType, durata vacanza
 */
export const generateVacationPlan = (
  garden: Garden,
  tasks: GardenTask[],
  startDate: Date,
  endDate: Date
): VacationPlan => {
  const tasksList: VacationTask[] = [];
  const daysAway = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDate = new Date();
  const daysUntilDeparture = Math.ceil((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Filtra solo le piante attive (non completate)
  const activeTasks = tasks.filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant'));
  
  // Task 1: Raccolta preventiva (per piante in fruttificazione)
  activeTasks.forEach(task => {
    const masterData = getMasterSheet(task.plantName);
    if (!masterData) return;
    
    const daysAlive = calculateDaysActive(task);
    const phase = getLifecyclePhase(daysAlive, task);
    
    // Se la pianta è in produzione e ha frutti quasi maturi, raccogli tutto
    if (phase === 'Production') {
      // Per piante da frutto (pomodori, peperoncini, zucchine)
      if (masterData.nutrientCategory === 'FRUITING') {
        tasksList.push({
          id: crypto.randomUUID(),
          priority: 'Critical',
          category: 'Harvest',
          title: `Raccogli ${task.plantName} quasi maturi`,
          description: `Raccogli tutto ciò che è quasi maturo (colore che inizia a cambiare). I frutti matureranno in casa durante la tua assenza, evitando di stressare la pianta e perdere il raccolto.`,
          dueDate: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 giorno prima
          estimatedTime: '30 minuti',
        });
      }
      
      // Per piante a foglia (lattuga, spinaci)
      if (masterData.nutrientCategory === 'LEAFY') {
        tasksList.push({
          id: crypto.randomUUID(),
          priority: 'High',
          category: 'Harvest',
          title: `Raccogli ${task.plantName} prima della partenza`,
          description: `Raccogli le foglie più mature per evitare che vadano a seme durante la tua assenza.`,
          dueDate: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: '20 minuti',
        });
      }
    }
  });
  
  // Task 2: Pacciamatura (terreno sabbioso)
  if (garden.soilType === 'Sandy' && daysAway > 5) {
    tasksList.push({
      id: crypto.randomUUID(),
      priority: 'Critical',
      category: 'Soil',
      title: 'Pacciamatura urgente (terreno sabbioso)',
      description: `Il tuo terreno è sabbioso e perde umidità velocemente. Applica 5cm di paglia, corteccia o foglie secche attorno alle piante per mantenere l'umidità durante la tua assenza.`,
      dueDate: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 giorni prima
      estimatedTime: '1 ora',
    });
  }
  
  // Task 3: Spostare vasi all'ombra
  const potTasks = activeTasks.filter(t => t.locationType === 'Pot');
  if (potTasks.length > 0) {
    tasksList.push({
      id: crypto.randomUUID(),
      priority: 'High',
      category: 'Protection',
      title: 'Sposta vasi all\'ombra o raggruppali',
      description: `Hai ${potTasks.length} pianta/e in vaso. Spostale all'ombra o raggruppale per creare un microclima umido. I vasi si seccano più velocemente del terreno.`,
      dueDate: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: '20 minuti',
    });
  }
  
  // Task 4: Irrigazione straordinaria (se vacanza > 7 giorni)
  if (daysAway > 7) {
    tasksList.push({
      id: crypto.randomUUID(),
      priority: 'Critical',
      category: 'Watering',
      title: 'Irrigazione profonda prima della partenza',
      description: `Fai un'irrigazione abbondante e profonda il giorno prima della partenza. Bagna bene il terreno fino a 20-30cm di profondità. Considera di installare un sistema di irrigazione automatica se disponibile.`,
      dueDate: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: '45 minuti',
    });
  }
  
  // Task 5: Protezione da parassiti (se ci sono piante vulnerabili)
  activeTasks.forEach(task => {
    const masterData = getMasterSheet(task.plantName);
    if (!masterData || !masterData.susceptibility) return;
    
    if (masterData.susceptibility.preventiveStrategy === 'HIGH') {
      tasksList.push({
        id: crypto.randomUUID(),
        priority: 'Medium',
        category: 'Protection',
        title: `Protezione preventiva per ${task.plantName}`,
        description: `${task.plantName} è suscettibile a ${masterData.susceptibility.fungalDiseases.join(', ')}. Applica un trattamento preventivo (es. zeolite, rame) prima della partenza per proteggere durante la tua assenza.`,
        dueDate: new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 giorni prima
        estimatedTime: '30 minuti',
      });
    }
  });
  
  // Task 6: Rimuovi fiori secchi e parti malate
  if (activeTasks.length > 0) {
    tasksList.push({
      id: crypto.randomUUID(),
      priority: 'Medium',
      category: 'Protection',
      title: 'Pulizia generale: rimuovi fiori secchi e parti malate',
      description: 'Rimuovi fiori secchi, foglie gialle e parti malate per evitare che diventino fonte di malattie durante la tua assenza.',
      dueDate: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: '30 minuti',
    });
  }
  
  // Ordina i task per priorità e data
  tasksList.sort((a, b) => {
    const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  return {
    gardenId: garden.id,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    tasks: tasksList,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Calcola quanti giorni mancano alla partenza
 */
export const getDaysUntilDeparture = (startDate: Date): number => {
  const currentDate = new Date();
  const diffTime = startDate.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Verifica se c'è una vacanza programmata
 */
export const hasActiveVacation = (garden: Garden): boolean => {
  if (!garden.vacationMode) return false;
  
  const startDate = new Date(garden.vacationMode.startDate);
  const endDate = new Date(garden.vacationMode.endDate);
  const currentDate = new Date();
  
  // La vacanza è attiva se siamo tra startDate e endDate
  return currentDate >= startDate && currentDate <= endDate;
};

/**
 * Verifica se c'è una vacanza in arrivo (non ancora iniziata)
 */
export const hasUpcomingVacation = (garden: Garden): boolean => {
  if (!garden.vacationMode) return false;
  
  const startDate = new Date(garden.vacationMode.startDate);
  const currentDate = new Date();
  
  return currentDate < startDate;
};

