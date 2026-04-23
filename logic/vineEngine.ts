import { VineCrop } from '../types/vine';
import { WeatherForecast } from '../services/weatherService';

/**
 * Motore logico per gestione vite (Pro Feature)
 * Calcola task per potatura, legatura, sfemminellatura, vendemmia, vinificazione
 */

export interface VineTaskAdvice {
  taskType: 'Pruning' | 'Tying' | 'ShootThinning' | 'LeafRemoval' | 'Harvest' | 'Winemaking';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  isUrgent?: boolean; // Per task critici come vinificazione
}

/**
 * Calcola task per gestione vite
 */
export const calculateVineTasks = (
  vineyard: VineCrop,
  currentDate: Date = new Date(),
  weather?: WeatherForecast
): VineTaskAdvice[] => {
  const tasks: VineTaskAdvice[] = [];
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // 1. POTATURA INVERNALE (Dicembre-Febbraio)
  if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
    tasks.push({
      taskType: 'Pruning',
      priority: 'High',
      message: `Potatura invernale (${vineyard.trainingSystem})`,
      dueDate: new Date(currentYear, 0, 15).toISOString().split('T')[0], // 15 gennaio
      instructions: getPruningInstructions(vineyard.trainingSystem)
    });
  }

  // 2. LEGATURA TRALCI (Marzo)
  if (currentMonth === 3) {
    tasks.push({
      taskType: 'Tying',
      priority: 'High',
      message: 'Legatura tralci al filo',
      dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0], // 15 marzo
      instructions: [
        'Lega i tralci principali al filo portante',
        'Usa legacci morbidi (rafia, filo plastificato)',
        'Non stringere troppo per evitare strozzature',
        'Mantieni forma secondo sistema di allevamento',
        'Lega prima che i tralci diventino troppo rigidi'
      ]
    });
  }

  // 3. SFEMMINELLATURA (Maggio)
  if (currentMonth === 5) {
    tasks.push({
      taskType: 'ShootThinning',
      priority: 'High',
      message: 'Sfemminellatura: rimozione getti ascellari',
      dueDate: new Date(currentYear, 4, 15).toISOString().split('T')[0], // 15 maggio
      instructions: [
        'Rimuovi getti ascellari (femminelle) che competono con tralci principali',
        'Lascia solo i getti necessari per produzione',
        'Rimuovi getti deboli, malati o mal posizionati',
        'Opera quando i getti sono ancora teneri (5-10cm)',
        'Mantieni 1-2 getti per nodo principale',
        'Favorisci aereazione e penetrazione luce'
      ]
    });
  }

  // 4. DEFOGLIAZIONE (Luglio-Agosto)
  if (currentMonth === 7 || currentMonth === 8) {
    tasks.push({
      taskType: 'LeafRemoval',
      priority: 'Medium',
      message: 'Defogliazione zona grappoli',
      dueDate: new Date(currentYear, 6, 15).toISOString().split('T')[0], // 15 luglio
      instructions: [
        'Rimuovi foglie che coprono i grappoli',
        'Favorisci esposizione diretta al sole per maturazione',
        'Rimuovi solo foglie basali, mantieni foglie apicali',
        'Opera gradualmente per evitare scottature',
        'Mantieni 12-15 foglie per tralcio per fotosintesi',
        'Favorisci aereazione per prevenire malattie fungine'
      ]
    });
  }

  // 5. VENDEMMIA (Monitoraggio Brix)
  const isInHarvestWindow = 
    (currentMonth >= vineyard.harvestWindow.startMonth && currentMonth <= vineyard.harvestWindow.endMonth) ||
    (vineyard.harvestWindow.startMonth > vineyard.harvestWindow.endMonth && 
     (currentMonth >= vineyard.harvestWindow.startMonth || currentMonth <= vineyard.harvestWindow.endMonth));

  if (isInHarvestWindow) {
    const brixProgress = calculateBrixProgress(vineyard, currentDate, weather);
    const isReadyForHarvest = brixProgress >= vineyard.brixTarget;

    tasks.push({
      taskType: 'Harvest',
      priority: isReadyForHarvest ? 'High' : 'Medium',
      message: isReadyForHarvest 
        ? `Vendemmia: Brix target raggiunto (${brixProgress.toFixed(1)}°)`
        : `Monitoraggio Brix: ${brixProgress.toFixed(1)}° / ${vineyard.brixTarget}° target`,
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `Brix attuale: ${brixProgress.toFixed(1)}° (target: ${vineyard.brixTarget}°)`,
        isReadyForHarvest 
          ? 'Raccogli immediatamente per qualità ottimale'
          : 'Continua monitoraggio, raccogli quando raggiungi target',
        `Metodo: ${vineyard.harvestMethod}`,
        'Raccogli al mattino quando le uve sono fresche',
        'Evita raccolta con pioggia o umidità elevata',
        'Usa contenitori areati per evitare schiacciamenti',
        'Trasporta rapidamente per vinificazione (entro 24h per uve bianche)'
      ]
    });
  }

  return tasks;
};

/**
 * Istruzioni di potatura per sistema di allevamento
 */
function getPruningInstructions(trainingSystem: string): string[] {
  const instructions: Record<string, string[]> = {
    'Guyot': [
      'Sistema Guyot: mantieni 1-2 tralci fruttiferi',
      'Taglia tralci dell\'anno precedente, mantieni solo sperone',
      'Lascia 6-8 gemme per tralcio fruttifero',
      'Mantieni sperone con 2-3 gemme per rinnovo',
      'Elimina tralci deboli, malati o mal posizionati',
      'Mantieni forma a cordone semplice o doppio'
    ],
    'Cordon': [
      'Sistema Cordon: potatura a speroni',
      'Mantieni cordone permanente con speroni di 2-3 gemme',
      'Rinnova speroni ogni 2-3 anni',
      'Elimina tralci che escono dal cordone',
      'Mantieni distanza di 20-30cm tra speroni',
      'Favorisci equilibrio vegetazione/produzione'
    ],
    'Pergola': [
      'Sistema Pergola: potatura a rinnovo',
      'Mantieni struttura permanente della pergola',
      'Rinnova tralci fruttiferi ogni anno',
      'Lascia 8-12 gemme per tralcio',
      'Elimina tralci vecchi o deboli',
      'Mantieni copertura uniforme della pergola'
    ],
    'Alberello': [
      'Sistema Alberello: potatura a vaso',
      'Mantieni forma a vaso basso',
      'Lascia 2-3 tralci principali con 4-6 gemme',
      'Rinnova tralci ogni anno',
      'Elimina succhioni e polloni',
      'Mantieni altezza contenuta (max 1.5m)'
    ]
  };

  return instructions[trainingSystem] || instructions['Guyot'];
}

/**
 * Calcola progresso Brix basato su data, meteo e trend stagionale
 */
export const calculateBrixProgress = (
  vineyard: VineCrop,
  currentDate: Date = new Date(),
  weather?: WeatherForecast
): number => {
  const currentMonth = currentDate.getMonth() + 1;
  const harvestStartMonth = vineyard.harvestWindow.startMonth;
  
  // Stima Brix basata su progressione stagionale
  // Assumiamo che Brix parta da ~15° a inizio agosto e raggiunga target a fine settembre
  let baseBrix = 15; // Brix iniziale stimato

  if (currentMonth >= harvestStartMonth) {
    // Calcolo giorni dall'inizio periodo raccolta
    const harvestStartDate = new Date(currentDate.getFullYear(), harvestStartMonth - 1, 1);
    const daysSinceStart = Math.floor((currentDate.getTime() - harvestStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Incremento Brix: ~0.2-0.3 gradi al giorno in condizioni normali
    const dailyBrixIncrease = 0.25;
    baseBrix += daysSinceStart * dailyBrixIncrease;

    // Modificatori meteo
    if (weather) {
      // Caldo accelera maturazione
      if (weather.tempMax && weather.tempMax > 25) {
        baseBrix += 0.5;
      }
      // Pioggia può rallentare
      const rainForecastMm = weather.rainForecastMm ?? weather.precipitation ?? 0;
      if (rainForecastMm > 10) {
        baseBrix -= 0.3;
      }
    }
  }

  // Limita al target massimo
  return Math.min(baseBrix, vineyard.brixTarget + 2);
};

/**
 * Verifica se è il momento ottimale per vendemmia
 */
export const isOptimalHarvestTime = (
  vineyard: VineCrop,
  currentBrix: number,
  currentDate: Date = new Date()
): boolean => {
  const currentMonth = currentDate.getMonth() + 1;
  const isInHarvestWindow = 
    (currentMonth >= vineyard.harvestWindow.startMonth && currentMonth <= vineyard.harvestWindow.endMonth) ||
    (vineyard.harvestWindow.startMonth > vineyard.harvestWindow.endMonth && 
     (currentMonth >= vineyard.harvestWindow.startMonth || currentMonth <= vineyard.harvestWindow.endMonth));

  return isInHarvestWindow && currentBrix >= vineyard.brixTarget;
};

/**
 * Verifica urgenza vinificazione (entro 24h per uve bianche)
 */
export const isWinemakingUrgent = (
  harvestDate: string,
  wineType: 'Red' | 'White' | 'Rosé' | 'Sparkling',
  currentDate: Date = new Date()
): boolean => {
  if (wineType === 'White' || wineType === 'Rosé' || wineType === 'Sparkling') {
    const harvest = new Date(harvestDate);
    const hoursSinceHarvest = (currentDate.getTime() - harvest.getTime()) / (1000 * 60 * 60);
    
    // Urgente se passate più di 12h per uve bianche
    return hoursSinceHarvest > 12;
  }
  
  // Per uve rosse, meno urgente (entro 48h)
  return false;
};

/**
 * Stima giorni alla vendemmia basata su trend Brix
 */
export const estimateDaysToHarvest = (
  vineyard: VineCrop,
  currentBrix: number,
  currentDate: Date = new Date()
): number | null => {
  if (currentBrix >= vineyard.brixTarget) {
    return 0; // Pronto ora
  }

  const brixRemaining = vineyard.brixTarget - currentBrix;
  const dailyBrixIncrease = 0.25; // Gradi Brix al giorno in condizioni normali
  
  return Math.ceil(brixRemaining / dailyBrixIncrease);
};
