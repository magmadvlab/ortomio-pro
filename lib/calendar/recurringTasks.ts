/**
 * Recurring Tasks Logic
 * Calcolo prossime occorrenze per task ricorrenti
 */

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // Ogni N giorni/settimane/mesi
  endDate?: string; // Data fine ricorrenza (opzionale)
}

export interface CalendarTask {
  id: string;
  title: string;
  type: string;
  start_date: string;
  recurring: boolean;
  recurring_pattern?: RecurringPattern;
  completed: boolean;
}

/**
 * Calcola prossime N occorrenze di un task ricorrente
 * @param task Task ricorrente
 * @param count Numero occorrenze da calcolare
 * @returns Array di date (ISO string)
 */
export function calculateNextOccurrences(
  task: CalendarTask,
  count: number = 10
): string[] {
  if (!task.recurring || !task.recurring_pattern) {
    return [];
  }
  
  const pattern = task.recurring_pattern;
  const startDate = new Date(task.start_date);
  const occurrences: string[] = [];
  
  let current = new Date(startDate);
  let calculated = 0;
  
  while (calculated < count) {
    // Salta la data iniziale (già presente)
    if (calculated > 0) {
      occurrences.push(current.toISOString());
    }
    
    // Incrementa in base al pattern
    if (pattern.type === 'daily') {
      current.setDate(current.getDate() + pattern.interval);
    } else if (pattern.type === 'weekly') {
      current.setDate(current.getDate() + (7 * pattern.interval));
    } else if (pattern.type === 'monthly') {
      current.setMonth(current.getMonth() + pattern.interval);
    }
    
    // Verifica endDate
    if (pattern.endDate && current > new Date(pattern.endDate)) {
      break;
    }
    
    calculated++;
  }
  
  return occurrences;
}

/**
 * Verifica se un task ricorrente è dovuto per una data specifica
 * @param task Task ricorrente
 * @param date Data da verificare
 * @returns true se task è dovuto in quella data
 */
export function isRecurringDue(
  task: CalendarTask,
  date: Date
): boolean {
  if (!task.recurring || !task.recurring_pattern) {
    return false;
  }
  
  const pattern = task.recurring_pattern;
  const startDate = new Date(task.start_date);
  const checkDate = new Date(date);
  
  // Normalizza a mezzanotte
  startDate.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  if (checkDate < startDate) {
    return false;
  }
  
  // Verifica endDate
  if (pattern.endDate && checkDate > new Date(pattern.endDate)) {
    return false;
  }
  
  // Calcola differenza giorni
  const daysDiff = Math.floor(
    (checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysDiff < 0) {
    return false;
  }
  
  // Verifica se la data corrisponde al pattern
  if (pattern.type === 'daily') {
    return daysDiff % pattern.interval === 0;
  } else if (pattern.type === 'weekly') {
    return daysDiff % (7 * pattern.interval) === 0;
  } else if (pattern.type === 'monthly') {
    // Per mensile, verifica se stesso giorno del mese
    const monthsDiff = 
      (checkDate.getFullYear() - startDate.getFullYear()) * 12 +
      (checkDate.getMonth() - startDate.getMonth());
    
    return monthsDiff >= 0 && 
           monthsDiff % pattern.interval === 0 &&
           checkDate.getDate() === startDate.getDate();
  }
  
  return false;
}

/**
 * Genera tutte le occorrenze di un task ricorrente in un range di date
 * @param task Task ricorrente
 * @param startDate Data inizio range
 * @param endDate Data fine range
 * @returns Array di date (ISO string) nel range
 */
export function getRecurringOccurrencesInRange(
  task: CalendarTask,
  startDate: Date,
  endDate: Date
): string[] {
  if (!task.recurring || !task.recurring_pattern) {
    return [];
  }
  
  const pattern = task.recurring_pattern;
  const taskStart = new Date(task.start_date);
  const occurrences: string[] = [];
  
  let current = new Date(taskStart);
  
  // Avanza fino a startDate se necessario
  while (current < startDate) {
    if (pattern.type === 'daily') {
      current.setDate(current.getDate() + pattern.interval);
    } else if (pattern.type === 'weekly') {
      current.setDate(current.getDate() + (7 * pattern.interval));
    } else if (pattern.type === 'monthly') {
      current.setMonth(current.getMonth() + pattern.interval);
    }
    
    if (pattern.endDate && current > new Date(pattern.endDate)) {
      return [];
    }
  }
  
  // Genera occorrenze nel range
  while (current <= endDate) {
    if (!pattern.endDate || current <= new Date(pattern.endDate)) {
      occurrences.push(current.toISOString());
    }
    
    if (pattern.type === 'daily') {
      current.setDate(current.getDate() + pattern.interval);
    } else if (pattern.type === 'weekly') {
      current.setDate(current.getDate() + (7 * pattern.interval));
    } else if (pattern.type === 'monthly') {
      current.setMonth(current.getMonth() + pattern.interval);
    }
    
    // Limite sicurezza
    if (occurrences.length > 365) {
      break;
    }
  }
  
  return occurrences;
}

/**
 * Crea pattern ricorrente da parametri
 */
export function createRecurringPattern(
  type: 'daily' | 'weekly' | 'monthly',
  interval: number,
  endDate?: string
): RecurringPattern {
  return {
    type,
    interval,
    endDate
  };
}
