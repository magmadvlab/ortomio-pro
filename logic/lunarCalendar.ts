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
 * Finestra temporale lunare con date specifiche
 */
export interface LunarWindow {
  startDate: Date;
  endDate: Date;
  phase: 'waxing' | 'waning';
  phaseName: string;
  idealFor: string[];
  daysFromNow: number;
  isActive: boolean;
}

/**
 * Calcola le prossime N finestre lunari ideali per un tipo di operazione
 * Esempio: getNextLunarWindows('sowing', 'FRUITING', new Date(), 3)
 * Restituisce le prossime 3 finestre Luna Crescente per semina pomodori
 */
export const getNextLunarWindows = (
  operation: 'sowing' | 'transplant' | 'harvest' | 'pruning',
  plantCategory: 'LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME' | 'GENERIC',
  fromDate: Date = new Date(),
  count: number = 3
): LunarWindow[] => {
  const windows: LunarWindow[] = [];
  const synodicMonth = 29.53058867;

  // Determina fase ideale basata su operazione e categoria pianta
  let idealPhase: 'waxing' | 'waning';

  if (operation === 'sowing') {
    // Radici: Luna Calante | Foglie/Frutti: Luna Crescente
    idealPhase = plantCategory === 'ROOT' ? 'waning' : 'waxing';
  } else if (operation === 'transplant') {
    // Trapianto: sempre Luna Crescente
    idealPhase = 'waxing';
  } else if (operation === 'harvest') {
    // Raccolta: Foglie in Calante (più saporite) | Frutti in Crescente (più succosi)
    idealPhase = plantCategory === 'LEAFY' ? 'waning' : 'waxing';
  } else if (operation === 'pruning') {
    // Potatura: sempre Luna Calante (meno stress)
    idealPhase = 'waning';
  } else {
    idealPhase = 'waxing'; // Default
  }

  let checkDate = new Date(fromDate);
  let foundWindows = 0;
  let iterations = 0;
  const maxIterations = 120; // Max 4 mesi di ricerca

  while (foundWindows < count && iterations < maxIterations) {
    const moonInfo = calculateMoonPhase(checkDate);

    // Controlla se siamo nella fase giusta
    const inCorrectPhase =
      (idealPhase === 'waxing' && (moonInfo.isWaxing || moonInfo.phase === 'New')) ||
      (idealPhase === 'waning' && moonInfo.isWaning);

    if (inCorrectPhase) {
      // Calcola inizio e fine della finestra
      const startDate = new Date(checkDate);
      const endDate = new Date(checkDate);

      if (idealPhase === 'waxing') {
        // Luna Crescente: da New/WaxingCrescent a Full (~14 giorni)
        const daysUntilFull = daysUntilPhase('Full', checkDate);
        endDate.setDate(endDate.getDate() + daysUntilFull);
      } else {
        // Luna Calante: da Full/WaningGibbous a New (~14 giorni)
        const daysUntilNew = daysUntilPhase('New', checkDate);
        endDate.setDate(endDate.getDate() + daysUntilNew);
      }

      const daysFromNow = Math.floor(
        (startDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isActive = daysFromNow <= 0 && endDate >= fromDate;

      windows.push({
        startDate,
        endDate,
        phase: idealPhase,
        phaseName: idealPhase === 'waxing' ? 'Luna Crescente' : 'Luna Calante',
        idealFor: getIdealOperations(idealPhase, plantCategory),
        daysFromNow: Math.max(0, daysFromNow),
        isActive
      });

      foundWindows++;

      // Salta alla prossima finestra (circa metà ciclo lunare)
      checkDate.setDate(checkDate.getDate() + 14);
    } else {
      // Avanza di 1 giorno
      checkDate.setDate(checkDate.getDate() + 1);
    }

    iterations++;
  }

  return windows;
};

/**
 * Helper: Determina operazioni ideali per una fase lunare e categoria pianta
 */
const getIdealOperations = (
  phase: 'waxing' | 'waning',
  plantCategory: 'LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME' | 'GENERIC'
): string[] => {
  if (phase === 'waxing') {
    const operations = ['Trapianto', 'Innesti'];

    if (plantCategory === 'FRUITING') {
      operations.unshift('Semina frutti', 'Raccolta frutti (più succosi)');
    } else if (plantCategory === 'LEAFY') {
      operations.unshift('Semina foglie');
    } else if (plantCategory === 'LEGUME') {
      operations.unshift('Semina legumi');
    } else {
      operations.unshift('Semina foglie/frutti');
    }

    return operations;
  } else {
    // Waning
    const operations = ['Potatura', 'Concimazione di fondo'];

    if (plantCategory === 'ROOT') {
      operations.unshift('Semina radici/bulbi');
    } else if (plantCategory === 'LEAFY') {
      operations.unshift('Raccolta foglie (più saporite)');
    }

    return operations;
  }
};

/**
 * Ottiene la prossima data ideale per un'operazione specifica
 * Restituisce la data più vicina nella fase lunare corretta
 */
export const getNextIdealDate = (
  operation: 'sowing' | 'transplant' | 'harvest' | 'pruning',
  plantCategory: 'LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME' | 'GENERIC',
  fromDate: Date = new Date()
): { date: Date; reason: string; daysFromNow: number } => {
  const windows = getNextLunarWindows(operation, plantCategory, fromDate, 1);

  if (windows.length === 0) {
    return {
      date: fromDate,
      reason: 'Nessuna finestra lunare trovata',
      daysFromNow: 0
    };
  }

  const nextWindow = windows[0];

  return {
    date: nextWindow.isActive ? fromDate : nextWindow.startDate,
    reason: nextWindow.isActive
      ? `${nextWindow.phaseName} in corso (fino al ${nextWindow.endDate.toLocaleDateString('it-IT')})`
      : `Prossima ${nextWindow.phaseName} dal ${nextWindow.startDate.toLocaleDateString('it-IT')}`,
    daysFromNow: nextWindow.daysFromNow
  };
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

