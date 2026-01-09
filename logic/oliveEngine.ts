import { OliveCrop } from '../types/olive';
import { WeatherForecast } from '../services/weatherService';

/**
 * Motore logico per gestione olivo (Pro Feature)
 * Calcola task per potatura, raccolta, frangitura
 */

export interface OliveTaskAdvice {
  taskType: 'Pruning' | 'Fertilization' | 'Harvest' | 'Milling' | 'SummerPruning';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  isUrgent?: boolean; // Per task critici come frangitura
}

/**
 * Calcola task per gestione olivo
 */
export const calculateOliveTasks = (
  grove: OliveCrop,
  currentDate: Date = new Date(),
  weather?: WeatherForecast
): OliveTaskAdvice[] => {
  const tasks: OliveTaskAdvice[] = [];
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // 1. POTATURA INVERNALE (Febbraio-Marzo)
  if (currentMonth === 2 || currentMonth === 3) {
    tasks.push({
      taskType: 'Pruning',
      priority: 'High',
      message: 'Potatura invernale olivo',
      dueDate: new Date(currentYear, 1, 15).toISOString().split('T')[0], // 15 febbraio
      instructions: [
        'Rimuovi rami secchi, malati o danneggiati',
        'Elimina succhioni e polloni',
        'Apri la chioma per favorire penetrazione luce e aereazione',
        'Mantieni forma a vaso per facilitare raccolta',
        'Riduci altezza se necessario (max 4-5m)',
        'Taglia sopra gemma esterna per favorire crescita verso l\'esterno',
        'Disinfetta attrezzi tra un albero e l\'altro'
      ]
    });
  }

  // 2. CONCIMAZIONE PRE-FIORITURA (Marzo)
  if (currentMonth === 3) {
    tasks.push({
      taskType: 'Fertilization',
      priority: 'Medium',
      message: 'Concimazione pre-fioritura',
      dueDate: new Date(currentYear, 2, 1).toISOString().split('T')[0], // 1 marzo
      instructions: [
        'Usa concime organico maturo o NPK bilanciato',
        'Applica 2-3kg per albero adulto',
        'Distribuisci uniformemente sotto la chioma',
        'Lavora leggermente nel terreno',
        'Irriga dopo la concimazione se possibile'
      ]
    });
  }

  // 3. POTATURA VERDE ESTIVA (Giugno-Luglio)
  if (currentMonth === 6 || currentMonth === 7) {
    tasks.push({
      taskType: 'SummerPruning',
      priority: 'Medium',
      message: 'Potatura verde: rimozione succhioni',
      dueDate: new Date(currentYear, 5, 15).toISOString().split('T')[0], // 15 giugno
      instructions: [
        'Rimuovi succhioni vigorosi che crescono dal tronco',
        'Elimina polloni basali',
        'Taglia rami che competono con struttura principale',
        'Mantieni operazione leggera, non invasiva',
        'Favorisci aereazione della chioma'
      ]
    });
  }

  // 4. RACCOLTA OLIVE (Ottobre-Dicembre)
  const isInHarvestWindow = 
    (currentMonth >= grove.harvestWindow.startMonth && currentMonth <= grove.harvestWindow.endMonth) ||
    (grove.harvestWindow.startMonth > grove.harvestWindow.endMonth && 
     (currentMonth >= grove.harvestWindow.startMonth || currentMonth <= grove.harvestWindow.endMonth));

  if (isInHarvestWindow) {
    const optimalHarvestDate = calculateOptimalHarvestDate(grove, currentDate, weather);
    
    tasks.push({
      taskType: 'Harvest',
      priority: 'High',
      message: 'Raccolta olive',
      dueDate: optimalHarvestDate.toISOString().split('T')[0],
      instructions: [
        `Metodo: ${grove.harvestMethod}`,
        'Raccogli quando le olive sono invaiate (50-70% nere)',
        'Evita raccolta con pioggia o umidità elevata',
        'Usa contenitori areati per evitare fermentazione',
        'Raccogli delicatamente per evitare ammaccature',
        'Trasporta rapidamente al frantoio (entro 24-48h)',
        'Non conservare olive in sacchi chiusi per più di 1 giorno'
      ]
    });
  }

  return tasks;
};

/**
 * Calcola data ottimale per raccolta basata su invaiatura e meteo
 */
export const calculateOptimalHarvestDate = (
  grove: OliveCrop,
  currentDate: Date = new Date(),
  weather?: WeatherForecast
): Date => {
  const currentMonth = currentDate.getMonth() + 1;
  
  // Data base: metà del periodo di raccolta
  const harvestStartMonth = grove.harvestWindow.startMonth;
  const harvestEndMonth = grove.harvestWindow.endMonth;
  
  let optimalMonth: number;
  if (harvestStartMonth <= harvestEndMonth) {
    optimalMonth = Math.floor((harvestStartMonth + harvestEndMonth) / 2);
  } else {
    // Periodo che attraversa l'anno (es. ottobre-dicembre)
    optimalMonth = harvestStartMonth;
  }

  // Se siamo già nel periodo di raccolta, usa data corrente o prossima settimana
  if (currentMonth >= harvestStartMonth || currentMonth <= harvestEndMonth) {
    if (weather) {
      // Evita giorni di pioggia
      const daysToAdd = weather.rainForecastMm > 5 ? 3 : 0;
      return new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }
    return currentDate;
  }

  // Altrimenti, calcola per il prossimo periodo di raccolta
  const currentYear = currentDate.getFullYear();
  if (currentMonth < harvestStartMonth) {
    return new Date(currentYear, optimalMonth - 1, 15);
  } else {
    return new Date(currentYear + 1, optimalMonth - 1, 15);
  }
};

/**
 * Calcola resa olio attesa basata su quantità olive
 */
export const calculateExpectedOilYield = (
  oliveQuantity: number, // kg
  oilYieldExpected: number // kg olio/100kg olive
): number => {
  return (oliveQuantity * oilYieldExpected) / 100;
};

/**
 * Verifica urgenza frangitura (deve essere entro 24-48h)
 */
export const isMillingUrgent = (
  harvestDate: string,
  currentDate: Date = new Date()
): boolean => {
  const harvest = new Date(harvestDate);
  const hoursSinceHarvest = (currentDate.getTime() - harvest.getTime()) / (1000 * 60 * 60);
  
  // Urgente se passate più di 24h
  return hoursSinceHarvest > 24;
};

