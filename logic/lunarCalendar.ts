/**
 * Calendario Lunare Completo
 * Calcola tutte le fasi lunari basandosi su algoritmi matematici
 * Ciclo lunare: ~29.5 giorni
 */

export type MoonPhase = 
  | 'New'           // Luna Nuova
  | 'WaxingCrescent' // Crescente
  | 'FirstQuarter'   // Primo Quarto
  | 'WaxingGibbous'  // Gibbosa Crescente
  | 'Full'           // Luna Piena
  | 'WaningGibbous'  // Gibbosa Calante
  | 'LastQuarter'    // Ultimo Quarto
  | 'WaningCrescent'; // Calante

export interface MoonPhaseInfo {
  phase: MoonPhase;
  name: string; // Nome italiano
  isWaxing: boolean; // Crescente
  isWaning: boolean; // Calante
  daysInCycle: number; // Giorni nel ciclo (0-29.5)
}

/**
 * Calcola il Julian Day Number per una data
 */
const julianDay = (date: Date): number => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60;
  
  let a, b;
  if (month <= 2) {
    a = year - 1;
    b = 0;
  } else {
    a = year;
    b = Math.floor(month / 12.6);
  }
  
  const c = Math.floor(365.25 * a);
  const d = Math.floor(30.6001 * (month + 1));
  
  return c + d + day + hour / 24 + 1720994.5;
};

/**
 * Calcola la fase lunare per una data specifica
 * Basato su algoritmo di Jean Meeus
 */
export const calculateMoonPhase = (date: Date): MoonPhaseInfo => {
  const jd = julianDay(date);
  
  // Data di riferimento: Luna Nuova del 6 gennaio 2000 (JD 2451549.5)
  const knownNewMoonJD = 2451549.5;
  
  // Ciclo lunare sinodico medio: 29.53058867 giorni
  const synodicMonth = 29.53058867;
  
  // Calcola quanti cicli sono passati
  const daysSinceKnown = jd - knownNewMoonJD;
  const cyclesSinceKnown = daysSinceKnown / synodicMonth;
  
  // Calcola la posizione nel ciclo corrente (0-1)
  const positionInCycle = cyclesSinceKnown - Math.floor(cyclesSinceKnown);
  
  // Converti in giorni (0-29.5)
  const daysInCycle = positionInCycle * synodicMonth;
  
  // Determina la fase basandosi sui giorni nel ciclo
  let phase: MoonPhase;
  let name: string;
  
  if (daysInCycle < 1.84) {
    phase = 'New';
    name = 'Luna Nuova';
  } else if (daysInCycle < 5.53) {
    phase = 'WaxingCrescent';
    name = 'Crescente';
  } else if (daysInCycle < 9.23) {
    phase = 'FirstQuarter';
    name = 'Primo Quarto';
  } else if (daysInCycle < 12.93) {
    phase = 'WaxingGibbous';
    name = 'Gibbosa Crescente';
  } else if (daysInCycle < 16.61) {
    phase = 'Full';
    name = 'Luna Piena';
  } else if (daysInCycle < 20.30) {
    phase = 'WaningGibbous';
    name = 'Gibbosa Calante';
  } else if (daysInCycle < 24.00) {
    phase = 'LastQuarter';
    name = 'Ultimo Quarto';
  } else {
    phase = 'WaningCrescent';
    name = 'Calante';
  }
  
  const isWaxing = phase === 'WaxingCrescent' || 
                   phase === 'FirstQuarter' || 
                   phase === 'WaxingGibbous';
  
  const isWaning = phase === 'WaningGibbous' || 
                   phase === 'LastQuarter' || 
                   phase === 'WaningCrescent';
  
  return {
    phase,
    name,
    isWaxing,
    isWaning,
    daysInCycle
  };
};

/**
 * Verifica se la luna è crescente (fase di crescita)
 */
export const isWaxing = (date: Date = new Date()): boolean => {
  return calculateMoonPhase(date).isWaxing;
};

/**
 * Verifica se la luna è calante (fase di diminuzione)
 */
export const isWaning = (date: Date = new Date()): boolean => {
  return calculateMoonPhase(date).isWaning;
};

/**
 * Ottiene il nome italiano della fase lunare
 */
export const getMoonPhaseName = (date: Date = new Date()): string => {
  return calculateMoonPhase(date).name;
};

/**
 * Converte un valore MoonPhase enum nel nome italiano corrispondente
 */
export const getMoonPhaseNameFromPhase = (phase: MoonPhase): string => {
  const phaseNames: Record<MoonPhase, string> = {
    'New': 'Luna Nuova',
    'WaxingCrescent': 'Crescente',
    'FirstQuarter': 'Primo Quarto',
    'WaxingGibbous': 'Gibbosa Crescente',
    'Full': 'Luna Piena',
    'WaningGibbous': 'Gibbosa Calante',
    'LastQuarter': 'Ultimo Quarto',
    'WaningCrescent': 'Calante'
  };
  return phaseNames[phase] || 'Fase Sconosciuta';
};

/**
 * Ottiene l'emoji corrispondente a una fase lunare
 */
export const getMoonPhaseEmoji = (phase: MoonPhase): string => {
  if (phase === 'Full') return '🌕';
  if (phase === 'New') return '🌑';
  if (phase === 'WaxingCrescent' || phase === 'FirstQuarter' || phase === 'WaxingGibbous') return '🌒';
  if (phase === 'WaningGibbous' || phase === 'LastQuarter' || phase === 'WaningCrescent') return '🌘';
  return '🌓'; // Default fallback
};

/**
 * Calcola quanti giorni mancano alla prossima fase specifica
 */
export const daysUntilPhase = (targetPhase: MoonPhase, fromDate: Date = new Date()): number => {
  const current = calculateMoonPhase(fromDate);
  const synodicMonth = 29.53058867;
  
  // Mappa delle fasi con posizione nel ciclo (0-29.5)
  const phasePositions: Record<MoonPhase, number> = {
    'New': 0,
    'WaxingCrescent': 3.69,
    'FirstQuarter': 7.38,
    'WaxingGibbous': 11.08,
    'Full': 14.77,
    'WaningGibbous': 18.46,
    'LastQuarter': 22.15,
    'WaningCrescent': 25.85
  };
  
  const currentPos = current.daysInCycle;
  const targetPos = phasePositions[targetPhase];
  
  let daysUntil = targetPos - currentPos;
  
  // Se la fase target è già passata, calcola per il prossimo ciclo
  if (daysUntil < 0) {
    daysUntil += synodicMonth;
  }
  
  return Math.ceil(daysUntil);
};

/**
 * Verifica se una fase lunare è ideale per una specifica operazione
 */
export const isIdealPhaseFor = (
  operation: 'sowing' | 'transplant' | 'harvest',
  plantCategory: 'LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME' | 'GENERIC',
  date: Date = new Date()
): { ideal: boolean; reason: string; daysUntilIdeal?: number } => {
  const moonInfo = calculateMoonPhase(date);
  
  // Regole tradizionali:
  // - Foglie/Frutti: Luna Crescente (cresce la parte aerea)
  // - Radici: Luna Calante (cresce la parte sotterranea)
  // - Trapianto: preferibilmente Luna Crescente
  // - Raccolto: dipende dal tipo (foglie in calante, frutti in crescente)
  
  if (operation === 'sowing') {
    if (plantCategory === 'ROOT') {
      // Radici: meglio Luna Calante
      if (moonInfo.isWaning) {
        return { ideal: true, reason: 'Luna Calante ideale per semina di radici' };
      } else {
        const days = daysUntilPhase('WaningCrescent', date);
        return { 
          ideal: false, 
          reason: 'Per le radici è meglio Luna Calante. Aspetta ' + days + ' giorni.',
          daysUntilIdeal: days
        };
      }
    } else {
      // Foglie/Frutti: meglio Luna Crescente
      if (moonInfo.isWaxing || moonInfo.phase === 'New') {
        return { ideal: true, reason: 'Luna Crescente ideale per semina di foglie/frutti' };
      } else {
        const days = daysUntilPhase('WaxingCrescent', date);
        return { 
          ideal: false, 
          reason: 'Per foglie/frutti è meglio Luna Crescente. Aspetta ' + days + ' giorni.',
          daysUntilIdeal: days
        };
      }
    }
  }
  
  if (operation === 'transplant') {
    // Trapianto: preferibilmente Luna Crescente
    if (moonInfo.isWaxing || moonInfo.phase === 'New') {
      return { ideal: true, reason: 'Luna Crescente ideale per trapianto' };
    } else {
      const days = daysUntilPhase('WaxingCrescent', date);
      return { 
        ideal: false, 
        reason: 'Per il trapianto è meglio Luna Crescente. Aspetta ' + days + ' giorni.',
        daysUntilIdeal: days
      };
    }
  }
  
  if (operation === 'harvest') {
    if (plantCategory === 'LEAFY') {
      // Foglie: meglio Luna Calante (meno acqua, più sapore)
      if (moonInfo.isWaning) {
        return { ideal: true, reason: 'Luna Calante ideale per raccolta foglie' };
      } else {
        const days = daysUntilPhase('WaningCrescent', date);
        return { 
          ideal: false, 
          reason: 'Per le foglie è meglio Luna Calante. Aspetta ' + days + ' giorni.',
          daysUntilIdeal: days
        };
      }
    } else {
      // Frutti: meglio Luna Crescente (più succosi)
      if (moonInfo.isWaxing) {
        return { ideal: true, reason: 'Luna Crescente ideale per raccolta frutti' };
      } else {
        const days = daysUntilPhase('WaxingCrescent', date);
        return { 
          ideal: false, 
          reason: 'Per i frutti è meglio Luna Crescente. Aspetta ' + days + ' giorni.',
          daysUntilIdeal: days
        };
      }
    }
  }
  
  return { ideal: true, reason: 'Fase lunare accettabile' };
};

