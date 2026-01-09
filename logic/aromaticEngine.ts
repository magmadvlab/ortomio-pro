import { AromaticMedicinalCrop } from '../types/aromatic';

/**
 * Motore logico per gestione erbe aromatiche e officinali (Pro Feature)
 * Calcola task per raccolta, essiccazione, moltiplicazione
 */

export interface AromaticTaskAdvice {
  taskType: 'Harvest' | 'Drying' | 'Multiplication' | 'Pruning' | 'Storage';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
}

/**
 * Calcola task per gestione erbe aromatiche
 */
export const calculateAromaticTasks = (
  crop: AromaticMedicinalCrop,
  currentDate: Date = new Date()
): AromaticTaskAdvice[] => {
  const tasks: AromaticTaskAdvice[] = [];
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // 1. RACCOLTA (basata su harvestTiming)
  // Per "BeforeFlowering", monitorare fioritura e raccogliere prima
  if (crop.harvestTiming === 'BeforeFlowering') {
    tasks.push({
      taskType: 'Harvest',
      priority: 'High',
      message: 'Raccogli prima della fioritura per massimo contenuto di oli essenziali',
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `Raccogli ${crop.harvestType.toLowerCase()} quando la pianta è in pieno vigore`,
        'Monitora la fioritura: raccogli appena vedi i primi boccioli',
        'Raccogli al mattino dopo che la rugiada è evaporata',
        'Usa forbici pulite per tagliare',
        'Lascia almeno 1/3 della pianta per permettere ricrescita'
      ]
    });
  } else if (crop.harvestTiming === 'DuringFlowering') {
    tasks.push({
      taskType: 'Harvest',
      priority: 'High',
      message: 'Raccogli durante la fioritura per massimo aroma',
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        `Raccogli ${crop.harvestType.toLowerCase()} quando i fiori sono aperti`,
        'Raccogli al mattino quando gli oli essenziali sono al massimo',
        'Raccogli solo fiori completamente aperti',
        'Usa contenitori areati per evitare appassimento'
      ]
    });
  }

  // 2. ESSICCAZIONE (se richiesta, dopo raccolta)
  if (crop.dryingRequired) {
    tasks.push({
      taskType: 'Drying',
      priority: 'High',
      message: 'Essicca il raccolto per conservazione',
      dueDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Domani
      instructions: [
        `Metodo: ${crop.dryingMethod || 'Air'}`,
        'Raccogli in mazzetti e appendi a testa in giù',
        'Mantieni in ambiente buio, asciutto e areato',
        `Tempo stimato: ${crop.dryingTime || 7-14} giorni`,
        'Verifica secco quando le foglie si sbriciolano facilmente',
        'Conserva in contenitori ermetici al buio'
      ]
    });
  }

  // 3. MOLTIPLICAZIONE (Primavera per talee)
  if (crop.multiplicationMethod === 'Cutting' && (currentMonth === 3 || currentMonth === 4)) {
    tasks.push({
      taskType: 'Multiplication',
      priority: 'Medium',
      message: 'Propagazione per talea',
      dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0], // 15 marzo
      instructions: [
        'Preleva talee di 10-15cm da rami giovani e vigorosi',
        'Rimuovi foglie basali, mantieni 2-3 foglie apicali',
        'Immergi la base in ormone radicante (opzionale)',
        'Pianta in terriccio leggero e ben drenato',
        'Mantieni umidità alta con copertura trasparente',
        'Radicazione avviene in 2-4 settimane'
      ]
    });
  }

  // 4. POTATURA POST-RACCOLTA (per erbe perenni)
  if (crop.cropType === 'Aromatic' && (currentMonth === 8 || currentMonth === 9)) {
    tasks.push({
      taskType: 'Pruning',
      priority: 'Medium',
      message: 'Potatura post-raccolta per mantenere forma e vigore',
      dueDate: new Date(currentYear, 7, 15).toISOString().split('T')[0], // 15 agosto
      instructions: [
        'Taglia i rami legnosi vecchi',
        'Riduci di 1/3 per favorire nuova crescita',
        'Mantieni forma compatta e areata',
        'Rimuovi fiori appassiti per evitare auto-semina',
        'Non potare troppo tardi per permettere ripresa prima dell\'inverno'
      ]
    });
  }

  // 5. CONSERVAZIONE (dopo essiccazione)
  if (crop.dryingRequired && crop.storageMethod === 'Dried') {
    tasks.push({
      taskType: 'Storage',
      priority: 'Low',
      message: 'Conserva prodotto essiccato correttamente',
      dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tra 7 giorni
      instructions: [
        'Verifica che il prodotto sia completamente secco',
        'Rimuovi steli e parti non utilizzabili',
        'Conserva in contenitori ermetici (vetro o metallo)',
        'Etichetta con data di essiccazione',
        'Conserva al buio, in luogo fresco e asciutto',
        'Durata conservazione: 12-24 mesi se ben conservato'
      ]
    });
  }

  return tasks;
};

/**
 * Calcola tempo di essiccazione basato su metodo, umidità e temperatura
 */
export const calculateDryingTime = (
  method: 'Air' | 'Dehydrator' | 'Oven',
  humidity: number, // % umidità relativa
  temperature: number // °C
): number => {
  // Tempo base in giorni
  const baseTime: Record<string, number> = {
    'Air': 10,
    'Dehydrator': 2,
    'Oven': 1
  };

  let time = baseTime[method] || 10;

  // Modificatori per umidità
  if (humidity > 70) {
    time *= 1.5; // Umidità alta rallenta essiccazione
  } else if (humidity < 40) {
    time *= 0.8; // Umidità bassa accelera
  }

  // Modificatori per temperatura
  if (method === 'Air') {
    if (temperature > 25) {
      time *= 0.9; // Caldo accelera
    } else if (temperature < 15) {
      time *= 1.3; // Freddo rallenta
    }
  }

  return Math.ceil(time);
};

/**
 * Verifica se il prodotto è completamente essiccato
 */
export const isDryingComplete = (
  initialWeight: number,
  currentWeight: number,
  targetMoistureContent: number = 10 // % umidità target
): boolean => {
  const moistureContent = ((initialWeight - currentWeight) / initialWeight) * 100;
  return moistureContent >= (100 - targetMoistureContent);
};

