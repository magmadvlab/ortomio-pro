/**
 * Utility per parsing quantità flessibili nella banca dei semi
 * Supporta: range ("10-1000"), esatti ("1000000"), approssimati ("~50"), testuali ("Molti")
 */

export interface ParsedQuantity {
  display: string; // Display originale
  min?: number; // Minimo del range (NULL se esatto)
  max?: number; // Massimo del range (NULL se esatto)
  exact?: number; // Valore esatto (NULL se range)
}

/**
 * Parsea una stringa di quantità in valori strutturati
 * 
 * Esempi:
 * - "10" → { display: "10", exact: 10 }
 * - "10-1000" → { display: "10-1000", min: 10, max: 1000 }
 * - "1000000" → { display: "1000000", exact: 1000000 }
 * - "~50" → { display: "~50", exact: 50 }
 * - "Molti" → { display: "Molti" }
 * 
 * @param input - Stringa inserita dall'utente
 * @returns Oggetto ParsedQuantity con valori parsati
 */
export function parseQuantity(input: string): ParsedQuantity {
  if (!input || !input.trim()) {
    return { display: '' };
  }

  const cleaned = input.trim();

  // Pattern 1: Range "10-1000" o "10 - 1000"
  const rangeMatch = cleaned.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    if (min <= max) {
      return {
        display: cleaned,
        min,
        max
      };
    }
  }

  // Pattern 2: Approssimato "~50" o "circa 50"
  const approxMatch = cleaned.match(/^~?\s*(?:circa|circ\.|ca\.?)?\s*(\d+)$/i);
  if (approxMatch) {
    const exact = parseInt(approxMatch[1], 10);
    return {
      display: cleaned.startsWith('~') ? cleaned : `~${exact}`,
      exact
    };
  }

  // Pattern 3: Numero esatto "1000000" o "1,000,000"
  const numberMatch = cleaned.replace(/,/g, '').match(/^(\d+)$/);
  if (numberMatch) {
    const exact = parseInt(numberMatch[1], 10);
    return {
      display: cleaned,
      exact
    };
  }

  // Pattern 4: Valore testuale (es. "Molti", "Pochi", ecc.)
  // Se non corrisponde a nessun pattern numerico, è solo display
  return {
    display: cleaned
  };
}

/**
 * Formatta una quantità parsata per visualizzazione
 * 
 * @param parsed - Quantità parsata
 * @returns Stringa formattata per display
 */
export function formatQuantity(parsed: ParsedQuantity): string {
  if (!parsed.display) {
    return '';
  }

  // Se abbiamo un range, mostra il range
  if (parsed.min !== undefined && parsed.max !== undefined) {
    return `${parsed.min}-${parsed.max}`;
  }

  // Se abbiamo un valore esatto, mostra quello (con ~ se approssimato)
  if (parsed.exact !== undefined) {
    return parsed.display;
  }

  // Altrimenti mostra solo il display originale
  return parsed.display;
}

/**
 * Calcola una quantità stimata per calcoli (usa min per range, exact per valori singoli)
 * 
 * @param parsed - Quantità parsata
 * @returns Valore numerico stimato o undefined se solo display
 */
export function getEstimatedQuantity(parsed: ParsedQuantity): number | undefined {
  if (parsed.exact !== undefined) {
    return parsed.exact;
  }
  if (parsed.min !== undefined) {
    // Per range, usa il minimo come stima conservativa
    return parsed.min;
  }
  return undefined;
}

