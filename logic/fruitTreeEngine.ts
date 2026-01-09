import { FruitTreeCrop, FruitTreeTask } from '../types/fruitTree';
import { GeoLocation } from '../types';

/**
 * Motore logico per gestione frutteti (Pro Feature)
 * Calcola task automatici per potatura, diradamento, raccolta, etc.
 */

export interface FruitTreeTaskAdvice {
  taskType: 'Pruning' | 'Thinning' | 'Harvest' | 'Fertilization' | 'PollinationCheck';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  season?: 'Winter' | 'Summer';
  pruningType?: 'Formative' | 'Maintenance' | 'Rejuvenation';
}

/**
 * Calcola task per gestione frutteti
 */
export const calculateFruitTreeTasks = (
  tree: FruitTreeCrop,
  treeAge: number,
  currentDate: Date = new Date()
): FruitTreeTaskAdvice[] => {
  const tasks: FruitTreeTaskAdvice[] = [];
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // 1. POTATURA INVERNALE (Dicembre-Febbraio)
  if (tree.pruningSeasons.includes('Winter') && 
      (currentMonth === 12 || currentMonth === 1 || currentMonth === 2)) {
    const pruningType = treeAge < 3 ? 'Formative' : treeAge > 15 ? 'Rejuvenation' : 'Maintenance';
    
    tasks.push({
      taskType: 'Pruning',
      priority: 'High',
      message: `Potatura invernale (${pruningType})`,
      dueDate: new Date(currentYear, 0, 15).toISOString().split('T')[0], // 15 gennaio
      instructions: getPruningInstructions(tree.treeType, pruningType, 'Winter'),
      season: 'Winter',
      pruningType
    });
  }

  // 2. POTATURA ESTIVA (Giugno-Luglio)
  if (tree.pruningSeasons.includes('Summer') && 
      (currentMonth === 6 || currentMonth === 7)) {
    tasks.push({
      taskType: 'Pruning',
      priority: 'Medium',
      message: 'Potatura estiva (controllo vegetazione)',
      dueDate: new Date(currentYear, 5, 15).toISOString().split('T')[0], // 15 giugno
      instructions: getPruningInstructions(tree.treeType, 'Maintenance', 'Summer'),
      season: 'Summer',
      pruningType: 'Maintenance'
    });
  }

  // 3. DIradamento FRUTTI (Maggio-Giugno, solo per alberi maturi)
  if (treeAge >= 3 && (currentMonth === 5 || currentMonth === 6)) {
    tasks.push({
      taskType: 'Thinning',
      priority: 'High',
      message: 'Diradamento frutti per migliorare qualità e dimensione',
      dueDate: new Date(currentYear, 4, 20).toISOString().split('T')[0], // 20 maggio
      instructions: [
        'Rimuovi frutti piccoli, deformi o danneggiati',
        `Per ${tree.treeType}: mantieni 1 frutto ogni 15-20cm`,
        'Lascia i frutti più grandi e ben formati',
        'Dirada quando i frutti hanno raggiunto 1-2cm di diametro',
        'Questo migliorerà la dimensione e qualità dei frutti rimanenti'
      ]
    });
  }

  // 4. RACCOLTA (Durante harvestWindow)
  const isInHarvestWindow = 
    (currentMonth >= tree.harvestWindow.startMonth && currentMonth <= tree.harvestWindow.endMonth) ||
    (tree.harvestWindow.startMonth > tree.harvestWindow.endMonth && 
     (currentMonth >= tree.harvestWindow.startMonth || currentMonth <= tree.harvestWindow.endMonth));

  if (isInHarvestWindow) {
    tasks.push({
      taskType: 'Harvest',
      priority: 'High',
      message: 'Raccolta frutti maturi',
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        'Raccogli al mattino quando i frutti sono freschi',
        'Verifica maturazione: colore, consistenza, sapore',
        'Usa forbici o raccoglitore per evitare danni',
        'Conserva in contenitori puliti e areati',
        'Raccogli regolarmente per evitare sovramaturazione'
      ]
    });
  }

  // 5. CONCIMAZIONE PRIMAVERILE (Marzo)
  if (currentMonth === 3) {
    tasks.push({
      taskType: 'Fertilization',
      priority: 'Medium',
      message: 'Concimazione primaverile per supportare crescita e fioritura',
      dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0], // 15 marzo
      instructions: [
        'Usa concime bilanciato NPK o organico maturo',
        'Applica 100-150g per mq di proiezione chioma',
        'Distribuisci uniformemente sotto la chioma',
        'Irriga dopo la concimazione',
        'Evita concimazioni tardive che possono ritardare la dormienza invernale'
      ]
    });
  }

  // 6. VERIFICA IMPOLLINAZIONE (Aprile-Maggio, per self-sterile)
  if (tree.pollinationType === 'Self-sterile' && (currentMonth === 4 || currentMonth === 5)) {
    tasks.push({
      taskType: 'PollinationCheck',
      priority: 'High',
      message: 'Verifica presenza impollinatori necessari',
      dueDate: new Date(currentYear, 3, 15).toISOString().split('T')[0], // 15 aprile
      instructions: [
        `Questa varietà richiede impollinatori: ${tree.pollinatorVarieties?.join(', ') || 'varietà compatibili'}`,
        'Verifica che gli impollinatori siano in fioritura contemporaneamente',
        'Se mancano impollinatori, pianta varietà compatibili entro 50m',
        'Considera l\'uso di api o altri impollinatori per migliorare la produzione'
      ]
    });
  }

  return tasks;
};

/**
 * Istruzioni di potatura per tipo di albero
 */
function getPruningInstructions(
  treeType: string,
  pruningType: 'Formative' | 'Maintenance' | 'Rejuvenation',
  season: 'Winter' | 'Summer'
): string[] {
  const baseInstructions: Record<string, string[]> = {
    'Pome': [
      'Rimuovi rami morti, malati o danneggiati',
      'Elimina rami che si incrociano o competono',
      'Apri la chioma per favorire penetrazione luce',
      'Mantieni forma a vaso o piramide',
      'Taglia sopra gemma esterna per favorire crescita verso l\'esterno'
    ],
    'Stone': [
      'Potatura più leggera rispetto ai pomacee',
      'Rimuovi rami che producono frutti piccoli',
      'Favorisci rinnovo di rami fruttiferi',
      'Elimina succhioni vigorosi',
      'Mantieni equilibrio tra vegetazione e produzione'
    ],
    'Citrus': [
      'Potatura leggera, principalmente rimozione rami secchi',
      'Elimina rami che toccano il suolo',
      'Apri la chioma per favorire aereazione',
      'Rimuovi rami interni che non ricevono luce',
      'Mantieni forma naturale arrotondata'
    ]
  };

  const instructions = baseInstructions[treeType] || baseInstructions['Pome'];

  if (pruningType === 'Formative') {
    return [
      ...instructions,
      'Fase formativa: stabilisci struttura principale',
      'Scegli 3-5 rami principali ben distribuiti',
      'Elimina rami troppo bassi (sotto 50cm)',
      'Mantieni angolo di inserzione ampio (45-60°)'
    ];
  }

  if (pruningType === 'Rejuvenation') {
    return [
      ...instructions,
      'Potatura di ringiovanimento: rimuovi 1/3 dei rami vecchi',
      'Favorisci crescita di nuovi rami fruttiferi',
      'Riduci altezza se necessario',
      'Potatura distribuita su 2-3 anni per evitare stress eccessivo'
    ];
  }

  return instructions;
}

/**
 * Calcola ore di freddo (chill hours) per una località
 * Stima basata su latitudine e altitudine
 */
export const calculateChillHours = (
  location: GeoLocation,
  altitudeMeters: number = 0,
  season: string = 'winter'
): number => {
  // Stima approssimativa basata su latitudine e altitudine
  // In Italia, le ore di freddo variano da 200-300 (Sud) a 800-1200 (Nord/Alpi)
  
  const baseChillHours = 
    location.latitude > 45 ? 800 : // Nord Italia
    location.latitude > 43 ? 500 : // Centro Italia
    300; // Sud Italia

  // Aggiungi ore per altitudine (circa 50 ore ogni 100m)
  const altitudeBonus = Math.floor(altitudeMeters / 100) * 50;

  return baseChillHours + altitudeBonus;
};

/**
 * Verifica se il fabbisogno di freddo è soddisfatto
 */
export const isChillRequirementMet = (
  tree: FruitTreeCrop,
  location: GeoLocation,
  altitudeMeters: number = 0
): boolean => {
  if (!tree.chillHours) {
    return true; // Nessun requisito specificato
  }

  const estimatedChillHours = calculateChillHours(location, altitudeMeters);
  return estimatedChillHours >= tree.chillHours;
};

