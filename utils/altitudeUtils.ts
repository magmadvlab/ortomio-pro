/**
 * Utility functions for altitude calculations
 * These are pure functions that can be used both client-side and server-side
 */

import { SeasonalSunWindow } from '../services/seasonalSunWindows';

/**
 * Calcola ritardo giorni in base all'altitudine
 * Regola: ~4-7 giorni ogni 100m di altitudine
 * 
 * **Scopo**: Calcola il ritardo in giorni per semina/trapianto basandosi sull'altitudine.
 * 
 * **Regola empirica**: 5 giorni ogni 100m di altitudine (media tra 4-7 giorni)
 * 
 * @param altitudeMeters - Altitudine in metri sul livello del mare
 * @returns Numero di giorni di ritardo consigliato (0 se altitudine <= 0)
 */
export const calculateAltitudeDelay = (altitudeMeters: number): number => {
  if (altitudeMeters <= 0) return 0;
  
  // Regola empirica: 5 giorni ogni 100m (media tra 4-7)
  const delayDays = Math.round((altitudeMeters / 100) * 5);
  
  return delayDays;
};

/**
 * Corregge date semina/trapianto in base ad altitudine
 * 
 * **Scopo**: Aggiusta una data di semina/trapianto considerando il ritardo dovuto all'altitudine
 * e il tipo di pianta (precoce, standard, tardiva).
 * 
 * **Logica**:
 * - Calcola ritardo base in base all'altitudine
 * - Applica modificatori per tipo di pianta:
 *   - Piante precoci (lattuga, ravanelli): ritardo ridotto del 50%
 *   - Piante standard: ritardo normale
 *   - Piante tardive (pomodori, peperoni): ritardo aumentato del 20%
 * 
 * @param baseDate - Data base di semina/trapianto
 * @param altitudeMeters - Altitudine in metri sul livello del mare
 * @param plantType - Tipo di pianta: 'early' (precoce), 'standard' (standard), 'late' (tardiva)
 * @returns Data corretta con ritardo applicato
 */
export const adjustPlantingDates = (
  baseDate: Date,
  altitudeMeters: number,
  plantType: 'early' | 'standard' | 'late' = 'standard'
): Date => {
  const delayDays = calculateAltitudeDelay(altitudeMeters);
  
  // Aggiungi ritardo base
  const adjustedDate = new Date(baseDate);
  adjustedDate.setDate(adjustedDate.getDate() + delayDays);
  
  // Modificatori per tipo di pianta
  // Piante precoci (lattuga, ravanelli) hanno ritardo minore
  // Piante tardive (pomodori, peperoni) hanno ritardo maggiore
  let plantModifier = 0;
  if (plantType === 'early') {
    plantModifier = Math.round(delayDays * 0.5); // Ritardo ridotto del 50%
  } else if (plantType === 'late') {
    plantModifier = Math.round(delayDays * 0.2); // Ritardo aumentato del 20%
  }
  
  adjustedDate.setDate(adjustedDate.getDate() + plantModifier);
  
  return adjustedDate;
};

/**
 * Calcola temperatura effettiva considerando l'altitudine
 * Regola: -0.6°C ogni 100m di altitudine
 * 
 * @param altitudeMeters - Altitudine in metri sul livello del mare
 * @param baseTemp - Temperatura base (es. temperatura aria a livello del mare)
 * @returns Temperatura effettiva considerando altitudine
 */
export function calculateEffectiveTemperature(
  altitudeMeters: number,
  baseTemp: number
): number {
  if (altitudeMeters <= 0) return baseTemp;
  
  // Regola: -0.6°C ogni 100m
  const tempReduction = (altitudeMeters / 100) * 0.6;
  return baseTemp - tempReduction;
}

/**
 * Ritarda finestre stagionali in base all'altitudine
 * Le finestre primaverili hanno ritardo maggiore, quelle estive minore
 * 
 * @param altitudeMeters - Altitudine in metri
 * @param windows - Finestre stagionali originali
 * @returns Finestre aggiustate con ritardi applicati
 */
export function adjustSeasonalWindows(
  altitudeMeters: number,
  windows: SeasonalSunWindow[]
): SeasonalSunWindow[] {
  if (altitudeMeters <= 200) {
    return windows; // Sotto 200m, ritardo trascurabile
  }

  // Calcola ritardi differenziati per periodo
  const delayPer100m = 5; // Giorni ogni 100m
  const baseDelay = Math.round((altitudeMeters / 100) * delayPer100m);

  return windows.map(window => {
    let delay = 0;
    
    // Feb-Mar: ritardo maggiore (primavera più fredda in quota)
    if (window.period === 'Feb-Mar') {
      delay = baseDelay;
    }
    // Apr-Mag: ritardo medio
    else if (window.period === 'Apr-Mag') {
      delay = Math.round(baseDelay * 0.8);
    }
    // Giu-Lug: ritardo minore (estate più stabile)
    else if (window.period === 'Giu-Lug') {
      delay = Math.round(baseDelay * 0.5);
    }
    // Ago-Set: ritardo medio-basso
    else if (window.period === 'Ago-Set') {
      delay = Math.round(baseDelay * 0.6);
    }

    // Le finestre vengono ritardate, quindi le ore di sole rimangono le stesse
    // ma le date effettive di utilizzo sono spostate in avanti
    return {
      ...window,
      // Nota: Le date effettive verranno aggiustate quando vengono usate le finestre
      // Qui manteniamo le ore di sole originali
    };
  });
}

/**
 * Calcola ritardo impianto considerando altitudine e tipo pianta
 * Versione estesa con ritardi più precisi
 * 
 * @param altitudeMeters - Altitudine in metri
 * @param plantType - Tipo di pianta
 * @returns Giorni di ritardo
 */
export function calculateAltitudePlantingDelay(
  altitudeMeters: number,
  plantType: 'early' | 'standard' | 'late' = 'standard'
): number {
  if (altitudeMeters <= 0) return 0;

  const baseDelay = calculateAltitudeDelay(altitudeMeters);
  
  // Modificatori per tipo pianta
  if (plantType === 'early') {
    return Math.round(baseDelay * 0.5); // Ritardo ridotto del 50%
  } else if (plantType === 'late') {
    return Math.round(baseDelay * 1.2); // Ritardo aumentato del 20%
  }
  
  return baseDelay;
}


