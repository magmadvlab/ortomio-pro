/**
 * Seasonal Adjustment Utility
 * Calcola stagioni in base a latitudine (supporto emisfero sud)
 */

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

/**
 * Determina la stagione per una data e latitudine
 * Supporta emisfero nord e sud
 */
export const getSeasonForDate = (
  date: Date,
  latitude: number
): Season => {
  const month = date.getMonth(); // 0-11
  const isNorthernHemisphere = latitude >= 0;

  if (isNorthernHemisphere) {
    // Emisfero Nord (logica esistente)
    if (month >= 2 && month <= 4) return 'Spring'; // Marzo-Maggio
    if (month >= 5 && month <= 7) return 'Summer'; // Giugno-Agosto
    if (month >= 8 && month <= 10) return 'Autumn'; // Settembre-Novembre
    return 'Winter'; // Dicembre-Febbraio
  } else {
    // Emisfero Sud (stagioni invertite)
    if (month >= 2 && month <= 4) return 'Autumn'; // Marzo-Maggio = Autunno
    if (month >= 5 && month <= 7) return 'Winter'; // Giugno-Agosto = Inverno
    if (month >= 8 && month <= 10) return 'Spring'; // Settembre-Novembre = Primavera
    return 'Summer'; // Dicembre-Febbraio = Estate
  }
};

/**
 * Determina la prossima stagione
 */
export const getNextSeason = (
  currentSeason: Season,
  latitude: number
): Season => {
  const isNorthernHemisphere = latitude >= 0;
  const seasonOrder = isNorthernHemisphere
    ? ['Spring', 'Summer', 'Autumn', 'Winter'] as const
    : ['Spring', 'Summer', 'Autumn', 'Winter'] as const; // Stesso ordine, ma date diverse

  const currentIndex = seasonOrder.indexOf(currentSeason);
  const nextIndex = (currentIndex + 1) % seasonOrder.length;
  return seasonOrder[nextIndex];
};

/**
 * Verifica se una data è in una stagione specifica
 */
export const isDateInSeason = (
  date: Date,
  season: Season,
  latitude: number
): boolean => {
  return getSeasonForDate(date, latitude) === season;
};

/**
 * Ottiene il range di date per una stagione in un anno specifico
 */
export const getSeasonDateRange = (
  season: Season,
  year: number,
  latitude: number
): { start: Date; end: Date } => {
  const isNorthernHemisphere = latitude >= 0;

  if (isNorthernHemisphere) {
    switch (season) {
      case 'Spring':
        return {
          start: new Date(year, 2, 1), // 1 Marzo
          end: new Date(year, 4, 31), // 31 Maggio
        };
      case 'Summer':
        return {
          start: new Date(year, 5, 1), // 1 Giugno
          end: new Date(year, 7, 31), // 31 Agosto
        };
      case 'Autumn':
        return {
          start: new Date(year, 8, 1), // 1 Settembre
          end: new Date(year, 10, 30), // 30 Novembre
        };
      case 'Winter':
        return {
          start: new Date(year, 11, 1), // 1 Dicembre
          end: new Date(year + 1, 1, 28), // 28 Febbraio (anno successivo)
        };
    }
  } else {
    // Emisfero Sud: stagioni invertite
    switch (season) {
      case 'Spring':
        return {
          start: new Date(year, 8, 1), // 1 Settembre
          end: new Date(year, 10, 30), // 30 Novembre
        };
      case 'Summer':
        return {
          start: new Date(year, 11, 1), // 1 Dicembre
          end: new Date(year + 1, 1, 28), // 28 Febbraio (anno successivo)
        };
      case 'Autumn':
        return {
          start: new Date(year, 2, 1), // 1 Marzo
          end: new Date(year, 4, 31), // 31 Maggio
        };
      case 'Winter':
        return {
          start: new Date(year, 5, 1), // 1 Giugno
          end: new Date(year, 7, 31), // 31 Agosto
        };
    }
  }
};

