import { StrawberryCrop, StrawberryTask } from '../types/strawberry';
import { GardenTask } from '../types';

/**
 * Motore logico per gestione fragole (Pro Feature)
 * Calcola task automatici basati su varietà, stagione e fase
 */

export interface StrawberryTaskAdvice {
  taskType: 'RunnerManagement' | 'Mulching' | 'Renovation' | 'Harvest' | 'Fertilization';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
}

/**
 * Calcola task per gestione fragole
 */
export const calculateStrawberryTasks = (
  crop: StrawberryCrop,
  currentDate: Date = new Date()
): StrawberryTaskAdvice[] => {
  const tasks: StrawberryTaskAdvice[] = [];
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // 1. RUNNER MANAGEMENT (Giugno-Luglio per June-bearing)
  if (crop.varietyType === 'June-bearing' && (currentMonth === 6 || currentMonth === 7)) {
    tasks.push({
      taskType: 'RunnerManagement',
      priority: 'High',
      message: 'Rimuovi stoloni per concentrare energia sui frutti',
      dueDate: new Date(currentYear, currentMonth - 1, 15).toISOString().split('T')[0],
      instructions: [
        'Taglia gli stoloni alla base con cesoie pulite',
        'Rimuovi stoloni ogni 7-10 giorni durante il periodo di produzione',
        'Se vuoi propagare, mantieni solo 2-3 stoloni per pianta madre',
        'Elimina stoloni deboli o malati'
      ]
    });
  }

  // 2. MULCHING INVERNALE (Ottobre-Novembre)
  if (currentMonth === 10 || currentMonth === 11) {
    tasks.push({
      taskType: 'Mulching',
      priority: 'High',
      message: 'Applica pacciamatura invernale per proteggere le piante',
      dueDate: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
      instructions: [
        `Usa ${crop.mulching.material} con spessore di ${crop.mulching.thickness}cm`,
        'Applica pacciamatura dopo il primo gelo leggero',
        'Mantieni la corona della pianta scoperta per evitare marciumi',
        'Rimuovi pacciamatura in primavera quando le temperature si stabilizzano'
      ]
    });
  }

  // 3. RINNOVO IMPIANTO (Luglio per June-bearing)
  if (crop.varietyType === 'June-bearing' && crop.renovationRequired && currentMonth === 7) {
    tasks.push({
      taskType: 'Renovation',
      priority: 'High',
      message: 'Rinnova l\'impianto per mantenere la produttività',
      dueDate: new Date(currentYear, 6, 1).toISOString().split('T')[0], // 1 luglio
      instructions: [
        'Taglia le foglie a 5cm dal suolo dopo l\'ultima raccolta',
        'Rimuovi le piante vecchie o deboli',
        'Dirada le piante mantenendo 20-30cm tra loro',
        'Fertilizza con concime ricco di azoto per stimolare nuova crescita',
        'Irriga abbondantemente per favorire la ripresa'
      ]
    });
  }

  // 4. RACCOLTA (Durante harvestWindow)
  const isInHarvestWindow = 
    (currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth) ||
    (crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && 
     (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth));

  if (isInHarvestWindow) {
    tasks.push({
      taskType: 'Harvest',
      priority: 'High',
      message: 'Raccogli fragole mature ogni 2-3 giorni',
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        'Raccogli al mattino quando le fragole sono fresche',
        'Taglia il picciolo con le unghie o forbici, non tirare',
        'Raccogli solo fragole completamente rosse',
        'Rimuovi fragole marce o danneggiate per prevenire malattie',
        'Conserva in contenitori bassi per evitare schiacciamenti'
      ]
    });
  }

  // 5. CONCIMAZIONE PRE-FIORITURA (Marzo-Aprile)
  if (currentMonth === 3 || currentMonth === 4) {
    tasks.push({
      taskType: 'Fertilization',
      priority: 'Medium',
      message: 'Concimazione pre-fioritura per supportare la produzione',
      dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0], // 15 marzo
      instructions: [
        'Usa concime ricco di potassio (K) per favorire fioritura e fruttificazione',
        'Applica 50-80g per mq di concime organico',
        'Evita concimi ad alto contenuto di azoto che favoriscono solo foglie',
        'Irriga dopo la concimazione per favorire l\'assorbimento'
      ]
    });
  }

  return tasks;
};

/**
 * Verifica se è il momento ottimale per la raccolta
 */
export const isOptimalHarvestTime = (
  crop: StrawberryCrop,
  currentDate: Date = new Date()
): boolean => {
  const currentMonth = currentDate.getMonth() + 1;
  return (
    (currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth) ||
    (crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && 
     (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth))
  );
};

/**
 * Calcola prossima data di rinnovo
 */
export const calculateNextRenovationDate = (
  crop: StrawberryCrop,
  lastRenovationDate?: string
): string | null => {
  if (!crop.renovationRequired || crop.varietyType !== 'June-bearing') {
    return null;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const renovationMonth = crop.renovationMonth || 7; // Default luglio

  // Se abbiamo una data di rinnovo precedente, calcola il prossimo anno
  if (lastRenovationDate) {
    const lastRenovation = new Date(lastRenovationDate);
    const nextRenovation = new Date(lastRenovation.getFullYear() + 1, renovationMonth - 1, 1);
    return nextRenovation.toISOString().split('T')[0];
  }

  // Altrimenti, calcola per l'anno corrente o prossimo
  const thisYearRenovation = new Date(currentYear, renovationMonth - 1, 1);
  if (currentDate < thisYearRenovation) {
    return thisYearRenovation.toISOString().split('T')[0];
  } else {
    return new Date(currentYear + 1, renovationMonth - 1, 1).toISOString().split('T')[0];
  }
};

