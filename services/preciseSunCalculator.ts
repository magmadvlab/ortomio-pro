/**
 * Precise Sun Calculator
 * Calcola la posizione del sole e l'esposizione solare precisa giorno-per-giorno
 * considerando ostacoli 3D (palazzi, alberi, montagne)
 */

export interface Obstacle3D {
  azimuth: number;        // Direzione ostacolo (0-360°, 0=Nord, 90=Est, 180=Sud, 270=Ovest)
  height: number;         // Altezza ostacolo in metri
  distance: number;       // Distanza orizzontale in metri
  widthDegrees: number;  // Larghezza angolare in gradi (default: 30)
  type?: 'Building' | 'Tree' | 'Mountain' | 'Other';
}

export interface SunPosition {
  azimuth: number;    // Direzione (0-360°, 0=Nord, 90=Est, 180=Sud, 270=Ovest)
  elevation: number;  // Altezza sopra l'orizzonte (0-90°)
  hour: number;       // Ora del giorno (0-23.99)
}

export interface MonthlySunHours {
  month: number;      // 1-12
  avgHours: number;  // Ore medie di sole
  minHours: number;  // Ore minime nel mese
  maxHours: number;  // Ore massime nel mese
}

export interface OptimalPeriod {
  start: Date;
  end: Date;
  durationMonths: number;
  avgSunHours: number;
}

/**
 * Calcola il giorno dell'anno (1-365/366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calcola la posizione del sole per una data e ora specifica
 * 
 * @param lat Latitudine in gradi (-90 a 90)
 * @param lng Longitudine in gradi (-180 a 180)
 * @param date Data per cui calcolare
 * @param hour Ora del giorno (0-23.99)
 * @returns Posizione del sole (azimut ed elevazione)
 */
export function calculateSunPosition(
  lat: number,
  lng: number,
  date: Date,
  hour: number
): SunPosition {
  const dayOfYear = getDayOfYear(date);
  
  // Declinazione solare (angolo del sole rispetto all'equatore)
  // Formula: 23.45 * sin(360 * (284 + dayOfYear) / 365)
  const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
  
  // Equazione del tempo (correzione per longitudine)
  const timeCorrection = 4 * lng + (date.getTimezoneOffset() * -1); // minuti
  const solarTime = hour + timeCorrection / 60;
  
  // Angolo orario (15° per ora)
  const hourAngle = 15 * (solarTime - 12); // Gradi
  
  // Converti in radianti
  const latRad = lat * Math.PI / 180;
  const declRad = declination * Math.PI / 180;
  const hourRad = hourAngle * Math.PI / 180;
  
  // Elevazione solare (altezza sopra l'orizzonte)
  const elevation = Math.asin(
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourRad)
  ) * 180 / Math.PI;
  
  // Azimut solare (direzione)
  const azimuth = Math.atan2(
    Math.sin(hourRad),
    Math.cos(hourRad) * Math.sin(latRad) - Math.tan(declRad) * Math.cos(latRad)
  ) * 180 / Math.PI + 180;
  
  return {
    azimuth: azimuth < 0 ? azimuth + 360 : azimuth,
    elevation: Math.max(0, elevation), // Non può essere negativo
    hour
  };
}

/**
 * Verifica se il sole è bloccato da un ostacolo
 */
function isSunBlockedByObstacle(
  sunPos: SunPosition,
  obstacle: Obstacle3D
): boolean {
  // Calcola angolo di elevazione dell'ostacolo
  // arctan(height / distance) = angolo sopra l'orizzonte
  const obstacleElevation = Math.atan2(obstacle.height, obstacle.distance) * 180 / Math.PI;
  
  // Verifica se il sole è nella direzione dell'ostacolo
  const azimuthDiff = Math.abs(sunPos.azimuth - obstacle.azimuth);
  const minAzimuthDiff = Math.min(azimuthDiff, 360 - azimuthDiff);
  
  // Se il sole è nella direzione dell'ostacolo (entro widthDegrees/2)
  // E l'elevazione del sole è più bassa dell'ostacolo
  if (minAzimuthDiff <= obstacle.widthDegrees / 2) {
    return sunPos.elevation < obstacleElevation;
  }
  
  return false;
}

/**
 * Calcola le ore di sole diretto per un giorno specifico
 * considerando ostacoli 3D
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @param date Data per cui calcolare
 * @param obstacles Array di ostacoli che possono bloccare il sole
 * @param timeStep Minuti tra ogni calcolo (default: 10)
 * @returns Ore di sole diretto (0-12)
 */
export function calculateDailySunHours(
  lat: number,
  lng: number,
  date: Date,
  obstacles: Obstacle3D[] = [],
  timeStep: number = 10
): number {
  let sunMinutes = 0;
  
  // Calcola posizione sole ogni timeStep minuti dalle 6:00 alle 18:00
  const startHour = 6;
  const endHour = 18;
  const stepsPerHour = 60 / timeStep;
  
  for (let hour = startHour; hour <= endHour; hour += timeStep / 60) {
    const sunPos = calculateSunPosition(lat, lng, date, hour);
    
    // Se il sole è sotto l'orizzonte, salta
    if (sunPos.elevation <= 0) continue;
    
    // Verifica se il sole è bloccato da qualche ostacolo
    const isBlocked = obstacles.some(obstacle => 
      isSunBlockedByObstacle(sunPos, obstacle)
    );
    
    if (!isBlocked) {
      sunMinutes += timeStep;
    }
  }
  
  return Math.round((sunMinutes / 60) * 10) / 10; // Arrotonda a 1 decimale
}

/**
 * Calcola le ore medie di sole per un mese specifico
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @param year Anno
 * @param month Mese (1-12)
 * @param obstacles Array di ostacoli
 * @returns Ore medie, minime e massime del mese
 */
export function calculateMonthlySunHours(
  lat: number,
  lng: number,
  year: number,
  month: number,
  obstacles: Obstacle3D[] = []
): MonthlySunHours {
  const daysInMonth = new Date(year, month, 0).getDate();
  const hours: number[] = [];
  
  // Campiona alcuni giorni rappresentativi del mese
  const sampleDays = [
    Math.floor(daysInMonth * 0.1),  // ~10% del mese
    Math.floor(daysInMonth * 0.3),  // ~30% del mese
    Math.floor(daysInMonth * 0.5),  // Metà mese
    Math.floor(daysInMonth * 0.7),  // ~70% del mese
    Math.floor(daysInMonth * 0.9),  // ~90% del mese
  ].filter(day => day >= 1 && day <= daysInMonth);
  
  // Se non ci sono giorni validi, usa il 15 del mese
  if (sampleDays.length === 0) {
    sampleDays.push(15);
  }
  
  for (const day of sampleDays) {
    const date = new Date(year, month - 1, day);
    const hoursForDay = calculateDailySunHours(lat, lng, date, obstacles);
    hours.push(hoursForDay);
  }
  
  const avgHours = hours.reduce((sum, h) => sum + h, 0) / hours.length;
  const minHours = Math.min(...hours);
  const maxHours = Math.max(...hours);
  
  return {
    month,
    avgHours: Math.round(avgHours * 10) / 10,
    minHours: Math.round(minHours * 10) / 10,
    maxHours: Math.round(maxHours * 10) / 10,
  };
}

/**
 * Calcola il periodo ottimale dell'anno per coltivare
 * basato su ore di sole disponibili
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @param obstacles Array di ostacoli
 * @param minSunHours Ore minime richieste (default: 6)
 * @param year Anno per cui calcolare (default: anno corrente)
 * @returns Periodo ottimale con dettagli
 */
export function calculateOptimalPeriod(
  lat: number,
  lng: number,
  obstacles: Obstacle3D[] = [],
  minSunHours: number = 6,
  year: number = new Date().getFullYear()
): {
  bestPeriod: OptimalPeriod | null;
  monthlySunHours: MonthlySunHours[];
  recommendations: string[];
} {
  const monthlyHours: MonthlySunHours[] = [];
  
  // Calcola per ogni mese
  for (let month = 1; month <= 12; month++) {
    const monthly = calculateMonthlySunHours(lat, lng, year, month, obstacles);
    monthlyHours.push(monthly);
  }
  
  // Trova periodo migliore (mesi consecutivi con >= minSunHours)
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;
  
  for (let i = 0; i < 12; i++) {
    if (monthlyHours[i].avgHours >= minSunHours) {
      if (currentStart === -1) {
        currentStart = i;
      }
      currentLength++;
      
      if (currentLength > bestLength) {
        bestLength = currentLength;
        bestStart = currentStart;
      }
    } else {
      currentStart = -1;
      currentLength = 0;
    }
  }
  
  // Gestisci periodo che attraversa l'anno (dicembre-gennaio)
  if (monthlyHours[11].avgHours >= minSunHours && monthlyHours[0].avgHours >= minSunHours) {
    // Controlla se dicembre e gennaio sono collegati
    let decemberStart = -1;
    if (monthlyHours[11].avgHours >= minSunHours) {
      decemberStart = 11;
      let decemberLength = 1;
      for (let i = 0; i < 12 && monthlyHours[i].avgHours >= minSunHours; i++) {
        decemberLength++;
      }
      if (decemberLength > bestLength) {
        bestLength = decemberLength;
        bestStart = 11; // Dicembre
      }
    }
  }
  
  let bestPeriod: OptimalPeriod | null = null;
  if (bestStart >= 0 && bestLength > 0) {
    const startMonth = bestStart + 1; // 1-12
    const endMonth = bestStart + bestLength;
    const actualEndMonth = endMonth > 12 ? endMonth - 12 : endMonth;
    
    const avgSunHours = monthlyHours
      .slice(bestStart, bestStart + bestLength)
      .reduce((sum, m) => sum + m.avgHours, 0) / bestLength;
    
    bestPeriod = {
      start: new Date(year, bestStart, 1),
      end: new Date(year, actualEndMonth - 1, new Date(year, actualEndMonth, 0).getDate()),
      durationMonths: bestLength,
      avgSunHours: Math.round(avgSunHours * 10) / 10,
    };
  }
  
  // Genera raccomandazioni
  const recommendations: string[] = [];
  const maxHours = Math.max(...monthlyHours.map(m => m.avgHours));
  const minHours = Math.min(...monthlyHours.map(m => m.avgHours));
  
  if (maxHours >= 8) {
    recommendations.push('Ottimo per pomodori, peperoni, zucchine (pieno sole - 8+ ore)');
  }
  if (maxHours >= 6 && maxHours < 8) {
    recommendations.push('Buono per molte verdure (sole parziale - 6-8 ore)');
  }
  if (minHours >= 4) {
    recommendations.push('Adatto tutto l\'anno per insalate e verdure a foglia (minimo 4 ore)');
  }
  if (bestPeriod) {
    const startMonthName = bestPeriod.start.toLocaleDateString('it-IT', { month: 'long' });
    const endMonthName = bestPeriod.end.toLocaleDateString('it-IT', { month: 'long' });
    recommendations.push(
      `Periodo ottimale: ${bestPeriod.durationMonths} mesi consecutivi ` +
      `(${startMonthName} - ${endMonthName}) con media ${bestPeriod.avgSunHours} ore/giorno`
    );
  } else {
    recommendations.push('Nessun periodo con sufficiente sole diretto. Considera piante da ombra o spostare l\'orto.');
  }
  
  return {
    bestPeriod,
    monthlySunHours: monthlyHours,
    recommendations,
  };
}

/**
 * Determina il tipo di esposizione basato su ore di sole
 */
export function getExposureType(sunHours: number): 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade' {
  if (sunHours >= 8) return 'FullSun';
  if (sunHours >= 5) return 'PartialSun';
  if (sunHours >= 3) return 'PartialShade';
  return 'FullShade';
}

/**
 * Ottiene suggerimento colture basato su tipo esposizione
 */
export function getCropRecommendation(exposureType: string): string {
  const recommendations: Record<string, string> = {
    'FullSun': 'Ideale per pomodori, peperoni, zucchine, melanzane, cetrioli e piante che amano il sole diretto.',
    'PartialSun': 'Buona esposizione. Adatta a molte verdure: fagiolini, piselli, carote, cipolle. Alcune piante potrebbero beneficiare di ombreggiamento nelle ore più calde.',
    'PartialShade': 'Esposizione parziale. Ideale per lattughe, spinaci, rucola, bietole, cavoli e piante che preferiscono ombra parziale.',
    'FullShade': 'Poca esposizione diretta. Considera piante da ombra (lattughe, spinaci, erbe aromatiche) o valuta di spostare l\'orto in una zona più soleggiata.',
  };
  
  return recommendations[exposureType] || recommendations['PartialSun'];
}

/**
 * Calcola ore di sole in un range orario specifico (es. 9:30-16:30)
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @param date Data per cui calcolare
 * @param obstacles Array di ostacoli
 * @param startHour Ora di inizio (es. 9.5 per 9:30)
 * @param endHour Ora di fine (es. 16.5 per 16:30)
 * @param timeStep Minuti tra ogni calcolo (default: 10)
 * @returns Ore di sole nel range specificato
 */
export function calculateSunHoursInTimeRange(
  lat: number,
  lng: number,
  date: Date,
  obstacles: Obstacle3D[],
  startHour: number,
  endHour: number,
  timeStep: number = 10
): number {
  let sunMinutes = 0;
  const stepsPerHour = 60 / timeStep;
  
  for (let hour = startHour; hour <= endHour; hour += timeStep / 60) {
    const sunPos = calculateSunPosition(lat, lng, date, hour);
    
    // Se il sole è sotto l'orizzonte, salta
    if (sunPos.elevation <= 0) continue;
    
    // Verifica se il sole è bloccato da qualche ostacolo
    const isBlocked = obstacles.some(obstacle => 
      isSunBlockedByObstacle(sunPos, obstacle)
    );
    
    if (!isBlocked) {
      sunMinutes += timeStep;
    }
  }
  
  return Math.round((sunMinutes / 60) * 10) / 10; // Arrotonda a 1 decimale
}

/**
 * Identifica quando arriva il sole (mattino/mezzogiorno/pomeriggio)
 * Restituisce l'intervallo orario principale con più sole
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @param date Data per cui calcolare
 * @param obstacles Array di ostacoli
 * @returns Intervallo orario principale { start, end } in ore (es. { start: 9.5, end: 16.5 })
 */
export function calculatePeakSunHours(
  lat: number,
  lng: number,
  date: Date,
  obstacles: Obstacle3D[]
): { start: number; end: number } {
  // Calcola presenza sole per ogni ora del giorno
  const hourPresence: number[] = new Array(24).fill(0);
  const timeStep = 0.5; // Ogni 30 minuti
  
  for (let hour = 6; hour < 18; hour += timeStep) {
    const sunPos = calculateSunPosition(lat, lng, date, hour);
    
    if (sunPos.elevation > 0) {
      const isBlocked = obstacles.some(obstacle => 
        isSunBlockedByObstacle(sunPos, obstacle)
      );
      
      if (!isBlocked) {
        const hourIndex = Math.floor(hour);
        hourPresence[hourIndex] += timeStep;
      }
    }
  }
  
  // Trova l'intervallo con più presenza di sole (minimo 3 ore)
  let maxStart = 9;
  let maxEnd = 16;
  let maxPresence = 0;
  
  for (let start = 6; start <= 12; start += 0.5) {
    for (let end = start + 3; end <= 18; end += 0.5) {
      let presence = 0;
      for (let h = Math.floor(start); h < Math.ceil(end); h++) {
        presence += hourPresence[h] || 0;
      }
      
      if (presence > maxPresence) {
        maxPresence = presence;
        maxStart = start;
        maxEnd = end;
      }
    }
  }
  
  return {
    start: Math.round(maxStart * 10) / 10,
    end: Math.round(maxEnd * 10) / 10,
  };
}

