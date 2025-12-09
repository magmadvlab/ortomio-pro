import { PlantMasterSheet, Garden } from '../types';

export interface NutrientAdvice {
  shouldFertilize: boolean;
  elementFocus: 'N' | 'P' | 'K' | 'Micro' | 'None'; // Azoto, Fosforo, Potassio
  adviceTitle: string;
  adviceBody: string;
  soilNote: string; // Nota specifica per il tipo di terreno
  phase: 'Establishment' | 'Vegetative' | 'Reproductive'; // Fase fenologica calcolata
}

/**
 * Calcola il fabbisogno nutrizionale basato su:
 * 1. COSA (Categoria Pianta)
 * 2. QUANDO (Giorni dal trapianto/semina)
 * 3. DOVE (Tipo di terreno dell'utente)
 */
export const calculateNutrientNeeds = (
  plant: PlantMasterSheet,
  daysActive: number, // Giorni trascorsi dalla data del task
  soilType: Garden['soilType'] = 'Loamy' // Default
): NutrientAdvice => {

  // 1. DETERMINAZIONE FASE FENOLOGICA (Algoritmo Semplificato)
  // Establishment: Radicazione (primi 20gg)
  // Vegetative: Crescita fogliare (20-50gg)
  // Reproductive: Fiori/Frutti (50gg+)
  let phase: 'Establishment' | 'Vegetative' | 'Reproductive' = 'Vegetative';
  
  if (daysActive <= 20) {
    phase = 'Establishment';
  } else if (daysActive > 20 && daysActive <= 50) {
    phase = 'Vegetative';
  } else {
    phase = 'Reproductive';
  }

  // Eccezione per colture veloci (Lattughe, Rapanelli)
  if (plant.nutrientCategory === 'LEAFY' || plant.nutrientCategory === 'ROOT') {
      if (daysActive > 40) phase = 'Reproductive'; // Maturazione finale
  }

  // 2. CALCOLO FABBISOGNO (Matrice Categoria x Fase)
  let element: NutrientAdvice['elementFocus'] = 'None';
  let title = '';
  let body = '';

  switch (plant.nutrientCategory) {
    case 'FRUITING': // Pomodori, Zucchine, Peperoni
      if (phase === 'Establishment') {
        element = 'P';
        title = 'Supporto Radicale';
        body = 'La pianta si sta stabilizzando. Se non hai concimato al trapianto, usa un fertilizzante bilanciato ricco di Fosforo.';
      } else if (phase === 'Vegetative') {
        element = 'N';
        title = 'Spinta Vegetativa';
        body = 'La pianta sta costruendo la struttura. Serve Azoto (es. macerato di ortica o sangue di bue) per sostenere foglie e fusti.';
      } else {
        element = 'K';
        title = 'Supporto Fruttificazione';
        body = 'Fase critica: riduci l\'Azoto (farebbe solo foglie) e aumenta il Potassio (es. cenere o concime specifico) per dare sapore ai frutti.';
      }
      break;

    case 'LEAFY': // Lattughe, Basilico
      if (daysActive > 60) {
        element = 'None';
        title = 'Sospensione Pre-Raccolta';
        body = 'Sospendi le concimazioni per evitare l\'accumulo di nitrati nelle foglie prima della raccolta.';
      } else {
        element = 'N';
        title = 'Mantenimento Fogliare';
        body = 'Fornisci Azoto in modo costante ma leggero per mantenere le foglie tenere e verdi.';
      }
      break;

    case 'ROOT': // Carote, Cipolle
      if (phase === 'Establishment') {
        element = 'P';
        title = 'Sviluppo Radicale';
        body = 'Il Fosforo è cruciale ora per l\'attecchimento.';
      } else {
        element = 'K';
        title = 'Ingrossamento Radice';
        body = 'Evita eccessi di Azoto che favoriscono la parte aerea. Il Potassio aiuta l\'ingrossamento del bulbo/radice.';
      }
      break;

    case 'LEGUME': // Fagioli, Piselli
      element = 'None';
      title = 'Autosufficienza';
      body = 'Le leguminose fissano l\'azoto da sole. Non concimare, o usa solo un po\' di cenere (Potassio) se il terreno è molto povero.';
      break;
      
    default:
       element = 'None';
       title = 'Monitoraggio';
       body = 'Mantieni il terreno pulito dalle infestanti.';
  }

  // 3. LOGICA TERRENO (Soil Modifier)
  let soilNote = '';
  
  if (soilType === 'Sandy') {
    // Terreno Sabbioso: Perde acqua e nutrienti velocemente
    soilNote = '⚠️ Suolo Sabbioso: I nutrienti vengono dilavati via rapidamente. Dividi la dose consigliata a metà e dalla con frequenza doppia (es. ogni settimana invece che ogni due). Usa pacciamatura per trattenere umidità.';
  } else if (soilType === 'Clay') {
    // Terreno Argilloso: Trattiene nutrienti, rischio asfissia
    soilNote = '⚠️ Suolo Argilloso: Il terreno trattiene bene i nutrienti. Puoi dare la dose piena meno frequentemente. Importante: zappa leggermente la superficie (sarchiatura) per evitare che si formi la crosta dura.';
  } else {
    // Medio impasto (Loamy) o altri
    soilNote = 'Il tuo terreno ha una buona ritenzione. Segui le dosi standard.';
  }

  return {
    shouldFertilize: element !== 'None',
    elementFocus: element,
    adviceTitle: title,
    adviceBody: body,
    soilNote,
    phase
  };
};



