/**
 * Database locale delle altitudini ufficiali dei comuni italiani
 * 
 * Questo database contiene le altitudini ufficiali (in metri sul livello del mare)
 * dei centri abitati dei comuni italiani, basate su dati ufficiali (ISTAT, Wikipedia, ecc.).
 * 
 * Utilizzato per migliorare l'accuratezza dell'inferenza dell'altitudine rispetto
 * alle API esterne che possono fornire valori medi della zona collinare invece
 * dell'altitudine precisa del centro abitato.
 * 
 * Il database può essere esteso con altri comuni quando necessario.
 */

export interface ComuneAltitude {
  comune: string;
  provincia: string;
  regione: string;
  altitudine: number; // Metri sul livello del mare
  coordinate?: { lat: number; lng: number; }; // Coordinate approssimative del centro abitato
}

/**
 * Database delle altitudini dei comuni italiani
 * Formato: comune, provincia, regione, altitudine (m), coordinate opzionali
 */
export const comuniAltitudeDatabase: ComuneAltitude[] = [
  // Basilicata
  { comune: 'Pisticci', provincia: 'Matera', regione: 'Basilicata', altitudine: 106, coordinate: { lat: 40.3636, lng: 16.6897 } },
  
  // Esempi di altri comuni (possono essere aggiunti quando necessario)
  // Lombardia
  { comune: 'Milano', provincia: 'Milano', regione: 'Lombardia', altitudine: 120, coordinate: { lat: 45.4642, lng: 9.1900 } },
  { comune: 'Bergamo', provincia: 'Bergamo', regione: 'Lombardia', altitudine: 249, coordinate: { lat: 45.6944, lng: 9.6770 } },
  
  // Lazio
  { comune: 'Roma', provincia: 'Roma', regione: 'Lazio', altitudine: 57, coordinate: { lat: 41.9028, lng: 12.4964 } },
  
  // Toscana
  { comune: 'Firenze', provincia: 'Firenze', regione: 'Toscana', altitudine: 50, coordinate: { lat: 43.7696, lng: 11.2558 } },
  
  // Campania
  { comune: 'Napoli', provincia: 'Napoli', regione: 'Campania', altitudine: 17, coordinate: { lat: 40.8518, lng: 14.2681 } },
  
  // Puglia
  { comune: 'Bari', provincia: 'Bari', regione: 'Puglia', altitudine: 5, coordinate: { lat: 41.1177, lng: 16.8719 } },
  
  // Sicilia
  { comune: 'Palermo', provincia: 'Palermo', regione: 'Sicilia', altitudine: 14, coordinate: { lat: 38.1157, lng: 13.3613 } },
  
  // Veneto
  { comune: 'Venezia', provincia: 'Venezia', regione: 'Veneto', altitudine: 1, coordinate: { lat: 45.4408, lng: 12.3155 } },
  
  // Piemonte
  { comune: 'Torino', provincia: 'Torino', regione: 'Piemonte', altitudine: 239, coordinate: { lat: 45.0703, lng: 7.6869 } },
  
  // Emilia-Romagna
  { comune: 'Bologna', provincia: 'Bologna', regione: 'Emilia-Romagna', altitudine: 54, coordinate: { lat: 44.4949, lng: 11.3426 } },
];

/**
 * Cerca l'altitudine di un comune nel database locale
 * 
 * @param comune - Nome del comune (case-insensitive)
 * @param provincia - Nome della provincia (opzionale, per maggiore precisione)
 * @returns Altitudine in metri o null se non trovata
 */
export const findAltitudeByComune = (
  comune: string,
  provincia?: string
): number | null => {
  const comuneLower = comune.toLowerCase().trim();
  const provinciaLower = provincia?.toLowerCase().trim();
  
  // Prima cerca con provincia se fornita
  if (provinciaLower) {
    const match = comuniAltitudeDatabase.find(
      (c) =>
        c.comune.toLowerCase() === comuneLower &&
        c.provincia.toLowerCase() === provinciaLower
    );
    if (match) return match.altitudine;
  }
  
  // Fallback: cerca solo per comune
  const match = comuniAltitudeDatabase.find(
    (c) => c.comune.toLowerCase() === comuneLower
  );
  
  return match ? match.altitudine : null;
};

/**
 * Cerca l'altitudine del comune più vicino alle coordinate fornite
 * 
 * @param lat - Latitudine
 * @param lng - Longitudine
 * @param maxDistanceKm - Distanza massima in km per considerare un comune (default: 5km)
 * @returns Altitudine in metri o null se non trovata
 */
export const findAltitudeByCoordinates = (
  lat: number,
  lng: number,
  maxDistanceKm: number = 5
): number | null => {
  let closest: ComuneAltitude | null = null;
  let minDistance = Infinity;
  
  for (const comune of comuniAltitudeDatabase) {
    if (!comune.coordinate) continue;
    
    // Calcola distanza usando formula di Haversine (approssimata)
    const dLat = (lat - comune.coordinate.lat) * Math.PI / 180;
    const dLng = (lng - comune.coordinate.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(comune.coordinate.lat * Math.PI / 180) *
        Math.cos(lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = 6371 * c; // Raggio Terra in km
    
    if (distanceKm <= maxDistanceKm && distanceKm < minDistance) {
      minDistance = distanceKm;
      closest = comune;
    }
  }
  
  return closest ? closest.altitudine : null;
};

/**
 * Aggiunge un nuovo comune al database (utile per estendere il database)
 * 
 * @param comune - Dati del comune da aggiungere
 */
export const addComuneToDatabase = (comune: ComuneAltitude): void => {
  // Evita duplicati
  const exists = comuniAltitudeDatabase.some(
    (c) =>
      c.comune.toLowerCase() === comune.comune.toLowerCase() &&
      c.provincia.toLowerCase() === comune.provincia.toLowerCase()
  );
  
  if (!exists) {
    comuniAltitudeDatabase.push(comune);
  }
};

