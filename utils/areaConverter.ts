/**
 * Utility per conversione unità di misura superficie
 * Supporta: metri quadri (sqm), are, ettari (hectare)
 * 
 * **Scopo**: Fornisce funzioni per convertire tra diverse unità di misura della superficie,
 * permettendo all'utente di inserire la dimensione del giardino nell'unità preferita
 * (metri quadri per piccoli orti, are per terreni medi, ettari per terreni grandi).
 * 
 * **Conversioni**:
 * - 1 are = 100 m²
 * - 1 ettaro = 10.000 m² = 100 are
 * 
 * **Nota**: Internamente, il sistema usa sempre metri quadri per tutti i calcoli.
 * Le conversioni sono solo per display e input utente.
 */

export type AreaUnit = 'sqm' | 'are' | 'hectare';

/**
 * Converte un valore da qualsiasi unità a metri quadri
 * 
 * **Scopo**: Converte un valore inserito dall'utente nella sua unità preferita
 * in metri quadri per i calcoli interni del sistema.
 * 
 * **Uso**: Chiamata durante l'onboarding quando l'utente inserisce la dimensione
 * del giardino. Il valore convertito viene salvato in `Garden.sizeSqMeters`.
 * 
 * @param value - Valore da convertire (es. 2.5 se unità è 'hectare')
 * @param unit - Unità di misura originale ('sqm', 'are', 'hectare')
 * @returns Valore convertito in metri quadri (es. 25000 se input era 2.5 ettari)
 */
export function convertToSqMeters(value: number, unit: AreaUnit): number {
  switch (unit) {
    case 'sqm':
      return value;
    case 'are':
      return value * 100; // 1 are = 100 m²
    case 'hectare':
      return value * 10000; // 1 ettaro = 10.000 m²
    default:
      return value;
  }
}

/**
 * Converte un valore da metri quadri a un'altra unità
 * 
 * **Scopo**: Converte un valore interno (sempre in m²) nell'unità preferita dall'utente
 * per la visualizzazione nell'interfaccia.
 * 
 * **Uso**: Chiamata quando si visualizza la dimensione del giardino o quando l'utente
 * cambia unità di misura nell'onboarding.
 * 
 * @param value - Valore in metri quadri (es. 25000)
 * @param targetUnit - Unità di misura target ('sqm', 'are', 'hectare')
 * @returns Valore convertito (es. 2.5 se targetUnit è 'hectare')
 */
export function convertFromSqMeters(value: number, targetUnit: AreaUnit): number {
  switch (targetUnit) {
    case 'sqm':
      return value;
    case 'are':
      return value / 100; // 1 are = 100 m²
    case 'hectare':
      return value / 10000; // 1 ettaro = 10.000 m²
    default:
      return value;
  }
}

/**
 * Formatta un valore con la sua unità per display nell'interfaccia
 * 
 * **Scopo**: Crea una stringa formattata e localizzata per mostrare la dimensione
 * del giardino all'utente (es. "2,5 ettari" in formato italiano).
 * 
 * **Formattazione**:
 * - Usa formato italiano per numeri (virgola come separatore decimale)
 * - Aggiunge unità di misura appropriata
 * - Arrotonda a 2 decimali massimo
 * 
 * @param value - Valore da formattare (es. 2.5)
 * @param unit - Unità di misura ('sqm', 'are', 'hectare')
 * @returns Stringa formattata (es. "2,5 ettari", "150 m²", "3 are")
 */
export function formatArea(value: number, unit: AreaUnit): string {
  const formattedValue = value.toLocaleString('it-IT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  switch (unit) {
    case 'sqm':
      return `${formattedValue} m²`;
    case 'are':
      return `${formattedValue} are`;
    case 'hectare':
      return `${formattedValue} ettari`;
    default:
      return `${formattedValue} m²`;
  }
}

/**
 * Determina l'unità di misura più appropriata per un valore in m²
 * 
 * **Scopo**: Suggerisce automaticamente l'unità di misura più leggibile per un valore.
 * 
 * **Logica**:
 * - Terreni >= 10.000 m² (1 ettaro): Suggerisce 'hectare'
 * - Terreni >= 100 m² (1 are): Suggerisce 'are'
 * - Terreni < 100 m²: Suggerisce 'sqm'
 * 
 * **Uso**: Chiamata durante l'onboarding per suggerire l'unità più appropriata
 * in base alla dimensione inserita.
 * 
 * @param sqMeters - Valore in metri quadri
 * @returns Unità consigliata per display ('sqm', 'are', 'hectare')
 */
export function getRecommendedUnit(sqMeters: number): AreaUnit {
  if (sqMeters >= 10000) {
    return 'hectare'; // Per terreni >= 1 ettaro
  } else if (sqMeters >= 100) {
    return 'are'; // Per terreni >= 1 are
  }
  return 'sqm'; // Per terreni < 1 are
}
