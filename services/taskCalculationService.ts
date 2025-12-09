import { GardenTask } from '../types';

/**
 * Calcola i giorni trascorsi dalla data del task
 */
export const calculateDaysActive = (task: GardenTask): number => {
  const taskDate = new Date(task.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - taskDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays); // Non restituire giorni negativi
};

/**
 * Trova il task di semina/trapianto più recente per una pianta
 * Se ci sono sia Sowing che Transplant, usa il più recente
 */
export const findPlantingTask = (
  tasks: GardenTask[], 
  plantName: string, 
  variety?: string
): GardenTask | null => {
  const relevantTasks = tasks.filter(task => {
    const nameMatch = task.plantName.toLowerCase() === plantName.toLowerCase();
    const varietyMatch = !variety || !task.variety || 
      task.variety.toLowerCase() === variety.toLowerCase();
    const typeMatch = task.taskType === 'Sowing' || task.taskType === 'Transplant';
    
    return nameMatch && varietyMatch && typeMatch;
  });

  if (relevantTasks.length === 0) return null;

  // Ordina per data (più recente prima) e prendi il primo
  const sorted = relevantTasks.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Più recente prima
  });

  return sorted[0];
};

/**
 * Filtra piante attive (task di semina/trapianto non completati)
 */
export const getActivePlants = (tasks: GardenTask[]): GardenTask[] => {
  return tasks.filter(task => {
    const isPlanting = task.taskType === 'Sowing' || task.taskType === 'Transplant';
    return isPlanting && !task.completed;
  });
};

/**
 * Calcola giorni attivi per una pianta specifica
 * Cerca il task di semina/trapianto più recente e calcola i giorni da quella data
 */
export const calculatePlantDaysActive = (
  tasks: GardenTask[],
  plantName: string,
  variety?: string
): number | null => {
  const plantingTask = findPlantingTask(tasks, plantName, variety);
  if (!plantingTask) return null;
  
  return calculateDaysActive(plantingTask);
};




