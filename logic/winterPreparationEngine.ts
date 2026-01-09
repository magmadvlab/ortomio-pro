import { Garden, WinterPreparationTask } from '../types';

/**
 * Genera un piano di lavori preparatori per la stagione target
 * @param garden Il giardino per cui generare il piano
 * @param targetSeason La stagione per cui prepararsi ('Summer' o 'Winter')
 * @returns Array di task preparatori
 */
export const generateWinterPreparationPlan = (
  garden: Garden,
  targetSeason: 'Summer' | 'Winter'
): WinterPreparationTask[] => {
  const tasks: WinterPreparationTask[] = [];
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Determina se siamo nella stagione di preparazione
  const isPreparationSeason = 
    (targetSeason === 'Summer' && (currentMonth >= 11 || currentMonth <= 2)) || // Novembre-Febbraio per estate
    (targetSeason === 'Winter' && (currentMonth >= 6 && currentMonth <= 8)); // Giugno-Agosto per inverno
  
  if (!isPreparationSeason) {
    return tasks; // Non è il momento per lavori preparatori
  }
  
  const soilType = garden.soilType || 'Loamy';
  const sizeSqM = garden.sizeSqMeters;
  
  // Genera task basati su tipo terreno e stagione target
  if (targetSeason === 'Summer') {
    // Preparazione per orto estivo (inverno)
    generateSummerPreparationTasks(tasks, soilType, sizeSqM, currentMonth);
  } else {
    // Preparazione per orto invernale (estate)
    generateWinterPreparationTasks(tasks, soilType, sizeSqM, currentMonth);
  }
  
  return tasks;
};

/**
 * Genera task per preparazione orto estivo (da fare in inverno)
 */
function generateSummerPreparationTasks(
  tasks: WinterPreparationTask[],
  soilType: Garden['soilType'],
  sizeSqM: number,
  currentMonth: number
): void {
  // Task comuni per tutti i terreni
  tasks.push({
    id: 'winter-cleanup',
    category: 'Structure',
    title: 'Pulizia residui colture precedenti',
    description: 'Rimuovi tutte le piante secche, radici e residui dell\'orto invernale per evitare malattie e parassiti.',
    priority: 'High',
    dueMonth: currentMonth <= 2 ? currentMonth : 1, // Gennaio-Febbraio
    estimatedTime: '1-2 ore',
    materials: ['Sacco per rifiuti', 'Forbici', 'Zappa'],
    instructions: [
      'Rimuovi tutte le piante secche e i residui',
      'Taglia le radici grosse con le forbici',
      'Raccogli tutto in sacchi per compost o smaltimento',
      'Pulisci gli attrezzi dopo l\'uso'
    ]
  });
  
  // Task specifici per tipo terreno
  if (soilType === 'Sandy') {
    // Terreno sabbioso: migliorare struttura e ritenzione
    tasks.push({
      id: 'sandy-organic',
      category: 'Fertilization',
      title: 'Miglioramento struttura con materia organica',
      description: `Aggiungi compost o letame maturo per migliorare la ritenzione idrica del terreno sabbioso.`,
      priority: 'Critical',
      dueMonth: 1, // Gennaio
      estimatedTime: '2-3 ore',
      materials: [
        `Compost: ${Math.ceil(sizeSqM * 1.5)}kg (1.5kg/m²)`,
        `Letame maturo: ${Math.ceil(sizeSqM * 2)}kg (2kg/m²) - opzionale`
      ],
      instructions: [
        `Distribuisci ${Math.ceil(sizeSqM * 1.5)}kg di compost su tutta la superficie`,
        'Lavora il terreno con la vanga o motozappa per incorporare il compost',
        'Se usi letame, assicurati che sia ben maturo (almeno 6 mesi)',
        'Lascia riposare il terreno per 2-3 settimane prima di trapiantare'
      ]
    });
    
    tasks.push({
      id: 'sandy-mulch',
      category: 'Soil',
      title: 'Pacciamatura preventiva',
      description: 'Prepara la pacciamatura per ridurre l\'evaporazione estiva.',
      priority: 'Medium',
      dueMonth: 2, // Febbraio
      estimatedTime: '1 ora',
      materials: ['Paglia o teli pacciamanti', 'Pietre o picchetti'],
      instructions: [
        'Acquista o prepara materiale per pacciamatura (paglia, teli, corteccia)',
        'Conservalo in luogo asciutto fino al trapianto',
        'Dopo il trapianto, applica 5-7cm di pacciamatura attorno alle piante'
      ]
    });
  } else if (soilType === 'Clay') {
    // Terreno argilloso: migliorare drenaggio e struttura
    tasks.push({
      id: 'clay-deep-tilling',
      category: 'Soil',
      title: 'Lavorazione profonda del terreno',
      description: 'Vanga o ara il terreno in profondità per migliorare il drenaggio e la struttura.',
      priority: 'Critical',
      dueMonth: currentMonth <= 2 ? currentMonth : 1, // Gennaio-Febbraio
      estimatedTime: '3-4 ore',
      materials: ['Vanga', 'Zappa', 'Eventuale motozappa'],
      instructions: [
        'Lavora il terreno quando è leggermente umido (non bagnato)',
        'Vanga a 30-40cm di profondità',
        'Rompere le zolle grosse con la zappa',
        'Non lavorare se il terreno è troppo bagnato (si compatta)'
      ]
    });
    
    tasks.push({
      id: 'clay-drainage',
      category: 'Soil',
      title: 'Miglioramento drenaggio',
      description: 'Aggiungi sabbia o ghiaia fine per migliorare il drenaggio del terreno argilloso.',
      priority: 'High',
      dueMonth: 1, // Gennaio
      estimatedTime: '2-3 ore',
      materials: [
        `Sabbia di fiume: ${Math.ceil(sizeSqM * 0.1)}m³ (10cm di spessore su 10% superficie)`,
        'Compost: per migliorare struttura'
      ],
      instructions: [
        'Identifica le zone più problematiche (ristagni d\'acqua)',
        `Distribuisci sabbia nelle zone problematiche (circa ${Math.ceil(sizeSqM * 0.1)}m³)`,
        'Miscela sabbia e compost con il terreno esistente',
        'Lavora in profondità per incorporare bene'
      ]
    });
    
    tasks.push({
      id: 'clay-fertilization',
      category: 'Fertilization',
      title: 'Concimazione di fondo',
      description: `Aggiungi letame o compost maturo per nutrire il terreno argilloso.`,
      priority: 'High',
      dueMonth: 1, // Gennaio
      estimatedTime: '2 ore',
      materials: [
        `Letame maturo: ${Math.ceil(sizeSqM * 2.5)}kg (2.5kg/m²)`,
        `Compost: ${Math.ceil(sizeSqM * 2)}kg (2kg/m²) - alternativa`
      ],
      instructions: [
        `Distribuisci ${Math.ceil(sizeSqM * 2.5)}kg di letame maturo su tutta la superficie`,
        'Lavora il terreno per incorporare il letame a 20-30cm di profondità',
        'Se usi compost, usa la stessa quantità',
        'Lascia maturare per almeno 3-4 settimane prima di trapiantare'
      ]
    });
  } else {
    // Terreno medio impasto (Loamy) o altri
    tasks.push({
      id: 'loamy-fertilization',
      category: 'Fertilization',
      title: 'Concimazione di fondo',
      description: `Aggiungi compost o letame per arricchire il terreno prima della stagione estiva.`,
      priority: 'High',
      dueMonth: 1, // Gennaio
      estimatedTime: '2 ore',
      materials: [
        `Compost: ${Math.ceil(sizeSqM * 2)}kg (2kg/m²)`,
        `Letame maturo: ${Math.ceil(sizeSqM * 2)}kg (2kg/m²) - opzionale`
      ],
      instructions: [
        `Distribuisci ${Math.ceil(sizeSqM * 2)}kg di compost su tutta la superficie`,
        'Lavora il terreno con la vanga per incorporare',
        'Lascia riposare per 2-3 settimane'
      ]
    });
  }
  
  // Task strutturali comuni
  tasks.push({
    id: 'structure-trellis',
    category: 'Structure',
    title: 'Preparazione tutori e supporti',
    description: 'Prepara tutori, pali e reti per piante rampicanti (pomodori, fagioli, zucchine).',
    priority: 'Medium',
    dueMonth: 2, // Febbraio
    estimatedTime: '1-2 ore',
    materials: ['Pali in legno o metallo', 'Filo o rete', 'Martello', 'Cesoie'],
    instructions: [
      'Controlla i tutori dell\'anno precedente, sostituisci quelli rotti',
      'Prepara nuovi tutori se necessario',
      'Prepara reti per fagioli rampicanti',
      'Conserva tutto in luogo asciutto fino al trapianto'
    ]
  });
  
  tasks.push({
    id: 'structure-irrigation',
    category: 'Structure',
    title: 'Preparazione sistema irrigazione',
    description: 'Controlla e prepara il sistema di irrigazione per l\'estate.',
    priority: 'Medium',
    dueMonth: 2, // Febbraio
    estimatedTime: '1 ora',
    materials: ['Tubi irrigazione', 'Gocciolatori', 'Raccordi'],
    instructions: [
      'Controlla i tubi per perdite o ostruzioni',
      'Sostituisci gocciolatori rotti o intasati',
      'Pulisci i filtri',
      'Testa il sistema prima dell\'uso estivo'
    ]
  });
  
  tasks.push({
    id: 'planning-seeds',
    category: 'Planning',
    title: 'Pianificazione semine indoor',
    description: 'Prepara il semenzaio e pianifica le semine indoor per trapianti primaverili.',
    priority: 'High',
    dueMonth: 2, // Febbraio
    estimatedTime: '30 minuti',
    materials: ['Semenzaio alveolato', 'Terriccio da semina', 'Etichette'],
    instructions: [
      'Controlla l\'inventario semi (vedi Banca Semi)',
      'Acquista semi mancanti per le varietà estive',
      'Prepara il semenzaio e il terriccio',
      'Pianifica le date di semina in base alle varietà scelte'
    ]
  });
}

/**
 * Genera task per preparazione orto invernale (da fare in estate)
 */
function generateWinterPreparationTasks(
  tasks: WinterPreparationTask[],
  soilType: Garden['soilType'],
  sizeSqM: number,
  currentMonth: number
): void {
  // Pulizia residui estivi
  tasks.push({
    id: 'summer-cleanup',
    category: 'Structure',
    title: 'Pulizia residui colture estive',
    description: 'Rimuovi piante secche e residui dell\'orto estivo.',
    priority: 'High',
    dueMonth: currentMonth,
    estimatedTime: '1-2 ore',
    materials: ['Sacco per rifiuti', 'Forbici', 'Zappa'],
    instructions: [
      'Rimuovi tutte le piante secche',
      'Taglia le radici grosse',
      'Raccogli in sacchi per compost'
    ]
  });
  
  if (soilType === 'Clay') {
    // Terreno argilloso: baulatura per drenaggio invernale
    tasks.push({
      id: 'clay-ridging',
      category: 'Soil',
      title: 'Baulatura per orto invernale',
      description: 'Crea collinette (bauli) per evitare ristagni d\'acqua in inverno.',
      priority: 'Critical',
      dueMonth: currentMonth,
      estimatedTime: '3-4 ore',
      materials: ['Vanga', 'Zappa'],
      instructions: [
        'Crea collinette alte 15-20cm',
        'Larghezza collinette: 60-80cm',
        'Distanza tra collinette: 40-50cm (per i solchi)',
        'Pianta le colture invernali sulle collinette, non nei solchi'
      ]
    });
  }
  
  // Concimazione per inverno
  tasks.push({
    id: 'winter-fertilization',
    category: 'Fertilization',
    title: 'Concimazione per orto invernale',
    description: `Aggiungi compost per nutrire le colture invernali.`,
    priority: 'High',
    dueMonth: currentMonth,
    estimatedTime: '1-2 ore',
    materials: [`Compost: ${Math.ceil(sizeSqM * 1.5)}kg (1.5kg/m²)`],
    instructions: [
      `Distribuisci ${Math.ceil(sizeSqM * 1.5)}kg di compost`,
      'Lavora superficialmente (10-15cm)',
      'Non troppo profondo per non disturbare le radici'
    ]
  });
}

