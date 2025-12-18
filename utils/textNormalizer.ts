/**
 * Utility per normalizzazione testo e calcolo similarità fuzzy
 * Usato per ricerca fuzzy su nomi colture e aliases
 */

/**
 * Normalizza testo per ricerca: lowercase, rimozione accenti, punteggiatura, spazi multipli
 * 
 * Esempi:
 * - "Lattuga" → "lattuga"
 * - "Lattùga" → "lattuga"
 * - "Lattuga!" → "lattuga"
 * - "Lattuga  Romana" → "lattuga romana"
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Rimuove accenti usando decomposizione Unicode
    .normalize('NFD') // Decomposizione Unicode (è → e + ̀)
    .replace(/[\u0300-\u036f]/g, '') // Rimuove diacritici (accenti)
    // Rimuove punteggiatura (mantiene solo lettere, numeri, spazi)
    .replace(/[^\w\s]/g, '')
    // Normalizza spazi multipli a singolo spazio
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Calcola distanza Levenshtein tra due stringhe
 * La distanza è il numero minimo di modifiche (inserimenti, cancellazioni, sostituzioni)
 * necessarie per trasformare str1 in str2
 * 
 * @param str1 Prima stringa
 * @param str2 Seconda stringa
 * @returns Distanza Levenshtein (0 = identiche, maggiore = più diverse)
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Caso base: se una stringa è vuota, distanza = lunghezza dell'altra
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;
  
  const matrix: number[][] = [];
  
  // Inizializza prima riga e colonna
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Calcola distanza usando programmazione dinamica
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion (rimuovi carattere da str1)
        matrix[i][j - 1] + 1,      // insertion (aggiungi carattere a str1)
        matrix[i - 1][j - 1] + cost // substitution (sostituisci carattere)
      );
    }
  }
  
  return matrix[len1][len2];
};

/**
 * Calcola similarità tra due stringhe basata su distanza Levenshtein
 * 
 * @param str1 Prima stringa
 * @param str2 Seconda stringa
 * @returns Similarità tra 0 e 1 (1 = identiche, 0 = completamente diverse)
 */
export const similarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1.0;
  
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLen);
};

/**
 * Determina soglia fuzzy in base alla lunghezza della query
 * Query più corte richiedono match più stretti per evitare falsi positivi
 * 
 * @param queryLength Lunghezza della query normalizzata
 * @returns Soglia di similarità (0-1)
 */
export const getFuzzyThreshold = (queryLength: number): number => {
  if (queryLength <= 3) {
    return 0.9; // Match molto stretto per query corte (es. "lat" → "lattuga" non matcha)
  }
  if (queryLength <= 5) {
    return 0.8; // Match moderato (es. "lattig" → "lattuga" matcha)
  }
  return 0.7; // Più permissivo per query lunghe (es. "baratiere" → "barattiere" matcha)
};

/**
 * Verifica se due stringhe normalizzate sono simili secondo la soglia
 * 
 * @param str1 Prima stringa (già normalizzata)
 * @param str2 Seconda stringa (già normalizzata)
 * @param threshold Soglia di similarità (default: calcolata automaticamente)
 * @returns true se similarità >= threshold
 */
export const isSimilar = (
  str1: string,
  str2: string,
  threshold?: number
): boolean => {
  const sim = similarity(str1, str2);
  const thresh = threshold ?? getFuzzyThreshold(str1.length);
  return sim >= thresh;
};

/**
 * Normalizza nomi di alberi da frutto per ricerca migliorata
 * Rimuove prefissi comuni e normalizza varianti dialettali
 * 
 * Esempi:
 * - "mela golden" → "golden"
 * - "pesco" → "pesca"
 * - "melo renetta" → "renetta"
 * - "limone siciliano" → "limone siciliano" (mantiene aggettivi descrittivi)
 */
export const normalizeFruitTreeName = (query: string): {
  normalized: string;
  possibleVarieties: string[];
  removedPrefix?: string;
} => {
  const normalized = normalizeText(query);
  
  // Prefissi comuni da rimuovere
  const prefixes = [
    'mela', 'melo',
    'pera', 'pero',
    'pesca', 'pesco',
    'albicocca', 'albicocco',
    'ciliegia', 'ciliegio',
    'prugna', 'susina', 'susino',
    'limone', 'limono',
    'arancia', 'arancio',
    'mandarino', 'mandarino',
    'noce', 'nocciola', 'nocciolo',
    'mandorla', 'mandorlo',
    'fico', 'fico',
    'melograno', 'melagrana',
    'caco', 'cachi',
    'kiwi', 'actinidia',
    'avocado', 'mango', 'papaya'
  ];
  
  let cleaned = normalized;
  let removedPrefix: string | undefined;
  
  // Rimuovi prefisso se presente
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix + ' ')) {
      cleaned = cleaned.substring(prefix.length + 1).trim();
      removedPrefix = prefix;
      break;
    } else if (cleaned === prefix) {
      // Se è solo il prefisso, mantieni tutto
      cleaned = normalized;
      break;
    }
  }
  
  // Normalizza varianti comuni
  const variants: Record<string, string> = {
    'pesco': 'pesca',
    'melo': 'mela',
    'pero': 'pera',
    'albicocco': 'albicocca',
    'ciliegio': 'ciliegia',
    'susino': 'susina',
    'cotogno': 'cotogna',
    'nespolo': 'nespola',
    'mandorlo': 'mandorla',
    'nocciolo': 'nocciola',
    'giuggiolo': 'giuggiola'
  };
  
  // Se il nome normalizzato è una variante, sostituisci
  for (const [variant, standard] of Object.entries(variants)) {
    if (cleaned === variant) {
      cleaned = standard;
      break;
    }
  }
  
  // Genera possibili varietà cercando nel nome normalizzato
  const possibleVarieties: string[] = [];
  
  // Se contiene solo il prefisso, aggiungi varietà comuni
  if (removedPrefix) {
    // Questo sarà usato per suggerire varietà nella ricerca fuzzy
    possibleVarieties.push(cleaned);
  } else {
    possibleVarieties.push(cleaned);
  }
  
  return {
    normalized: cleaned || normalized, // Fallback al nome originale se vuoto dopo pulizia
    possibleVarieties,
    removedPrefix
  };
};

/**
 * Normalizza nomi di vitigni e cultivar olivo per ricerca migliorata
 * Gestisce varianti comuni e nomi composti
 * 
 * Esempi:
 * - "nero d'avola" → "nerodavola"
 * - "nocellara del belice" → "nocellaradelbelice"
 * - "greco di tufo" → "grecoditufo"
 */
export const normalizeVineOliveName = (query: string): {
  normalized: string;
  possibleVarieties: string[];
} => {
  const normalized = normalizeText(query);
  
  // Rimuovi articoli e preposizioni comuni
  const articles = ['del', 'della', 'di', 'da', 'd', 'degli', 'delle', 'de'];
  let cleaned = normalized;
  
  // Rimuovi articoli/preposizioni
  for (const article of articles) {
    const regex = new RegExp(`\\b${article}\\s+`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }
  
  // Rimuovi spazi per nomi composti (es. "nero d'avola" → "nerodavola")
  cleaned = cleaned.replace(/\s+/g, '');
  
  // Normalizza varianti comuni
  const variants: Record<string, string> = {
    'nerodavola': 'nerodavola',
    'nocellaradelbelice': 'nocellaradelbelice',
    'grecoditufo': 'grecoditufo',
    'ogliarolabarese': 'ogliarolabarese',
    'cimadibitonto': 'cimadibitonto',
    'ascolanatenera': 'ascolanatenera',
    'grossadicassano': 'grossadicassano',
    'belladicerignola': 'belladicerignola',
    'nocellaraetnea': 'nocellaraetnea',
  };
  
  // Se il nome normalizzato è una variante nota, usa quella
  if (variants[cleaned]) {
    cleaned = variants[cleaned];
  }
  
  // Genera possibili varietà cercando nel nome normalizzato
  const possibleVarieties: string[] = [cleaned];
  
  // Se contiene spazi o apostrofi rimossi, aggiungi anche versione con spazi
  if (cleaned !== normalized.replace(/\s+/g, '')) {
    possibleVarieties.push(normalized);
  }
  
  return {
    normalized: cleaned || normalized,
    possibleVarieties
  };
};

