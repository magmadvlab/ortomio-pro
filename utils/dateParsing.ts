/**
 * Converte una stringa come "7-14 giorni" o "7-10 giorni" in un oggetto con min e max
 * Gestisce anche casi come "10 giorni" (singolo numero) o "circa 7-10 giorni"
 */
export const parseDaysRange = (str: string): { min: number; max: number } => {
  // Rimuovi spazi extra e converti in minuscolo
  const cleaned = str.trim().toLowerCase();
  
  // Cerca pattern come "7-14", "7 - 14", "7/14", "circa 7-10"
  const rangeMatch = cleaned.match(/(\d+)\s*[-/–]\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return { min, max };
  }
  
  // Cerca un singolo numero (es. "10 giorni")
  const singleMatch = cleaned.match(/(\d+)/);
  if (singleMatch) {
    const value = parseInt(singleMatch[1], 10);
    return { min: value, max: value };
  }
  
  // Fallback: se non trova nulla, restituisce valori di default
  console.warn(`Impossibile parsare il range di giorni: "${str}". Uso valori di default 7-14.`);
  return { min: 7, max: 14 };
};




