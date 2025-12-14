/**
 * Eventi Stagionali - Calcolo Equinozi, Solstizi, Candelora
 * Calcola eventi astronomici e tradizionali per ogni anno
 */

export interface SeasonalEvent {
  type: 'equinox' | 'solstice' | 'candelora' | 'giorni-merla' | 'san-giuseppe' | 'san-martino';
  name: string;
  date: Date;
  emoji: string;
  description: string;
  consiglioOrto?: string;
  proverbio?: string;
}

/**
 * Calcola il Julian Day Number per una data
 */
const julianDay = (date: Date): number => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60;
  
  let a, b;
  if (month <= 2) {
    a = year - 1;
    b = 0;
  } else {
    a = year;
    b = Math.floor(month / 12.6);
  }
  
  const c = Math.floor(365.25 * a);
  const d = Math.floor(30.6001 * (month + 1));
  
  return c + d + day + hour / 24 + 1720994.5;
};

/**
 * Calcola l'equinozio di primavera (marzo) per un anno
 * Algoritmo di Meeus
 */
export function calculateSpringEquinox(year: number): Date {
  const Y = year;
  const JDE0 = 2451623.80984 + 365242.37404 + 0.05169 * (Y - 2000) - 0.00411 * (Y - 2000) * (Y - 2000) / 100;
  
  const T = (JDE0 - 2451545.0) / 36525.0;
  const W = 35999.373 * T - 2.47;
  const deltaL = 1 + 0.0334 * Math.cos(W * Math.PI / 180) + 0.0007 * Math.cos(2 * W * Math.PI / 180);
  
  const S = 485 * Math.cos((324.96 + 1934.136 * T) * Math.PI / 180) +
            203 * Math.cos((337.23 + 32964.467 * T) * Math.PI / 180) +
            199 * Math.cos((342.08 + 20.186 * T) * Math.PI / 180) +
            182 * Math.cos((27.8 + 445267.112 * T) * Math.PI / 180) +
            156 * Math.cos((73.14 + 450368.886 * T) * Math.PI / 180) +
            136 * Math.cos((171.52 + 22518.443 * T) * Math.PI / 180) +
            77 * Math.cos((222.54 + 65928.934 * T) * Math.PI / 180) +
            74 * Math.cos((296.72 + 3034.906 * T) * Math.PI / 180) +
            70 * Math.cos((243.58 + 9037.513 * T) * Math.PI / 180) +
            58 * Math.cos((119.81 + 33718.147 * T) * Math.PI / 180) +
            52 * Math.cos((297.17 + 150.266 * T) * Math.PI / 180) +
            50 * Math.cos((21.02 + 2281.226 * T) * Math.PI / 180) +
            45 * Math.cos((247.54 + 29929.562 * T) * Math.PI / 180) +
            44 * Math.cos((325.15 + 31555.956 * T) * Math.PI / 180) +
            29 * Math.cos((60.93 + 4443.417 * T) * Math.PI / 180) +
            18 * Math.cos((155.12 + 67555.328 * T) * Math.PI / 180) +
            17 * Math.cos((288.79 + 4562.047 * T) * Math.PI / 180) +
            16 * Math.cos((198.04 + 62894.029 * T) * Math.PI / 180) +
            14 * Math.cos((199.76 + 31436.921 * T) * Math.PI / 180) +
            12 * Math.cos((95.19 + 14577.848 * T) * Math.PI / 180) +
            12 * Math.cos((287.11 + 31931.756 * T) * Math.PI / 180) +
            12 * Math.cos((320.81 + 34777.259 * T) * Math.PI / 180) +
            9 * Math.cos((227.73 + 1222.114 * T) * Math.PI / 180) +
            8 * Math.cos((15.45 + 16859.074 * T) * Math.PI / 180);
  
  const JDE = JDE0 + 0.00001 * S / deltaL;
  
  // Converti JDE a Date
  const T2 = (JDE - 2451545.0) / 36525.0;
  const JD = JDE + 0.00001 * S / deltaL;
  
  const Z = Math.floor(JD + 0.5);
  const F = JD + 0.5 - Z;
  
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year2 = month > 2 ? C - 4716 : C - 4715;
  
  const hour = (day - Math.floor(day)) * 24;
  const minute = (hour - Math.floor(hour)) * 60;
  const second = (minute - Math.floor(minute)) * 60;
  
  return new Date(year2, month - 1, Math.floor(day), Math.floor(hour), Math.floor(minute), Math.floor(second));
}

/**
 * Calcola l'equinozio d'autunno (settembre) per un anno
 */
export function calculateAutumnEquinox(year: number): Date {
  const Y = year;
  const JDE0 = 2451810.21715 + 365242.01767 + 0.11575 * (Y - 2000) - 0.00337 * (Y - 2000) * (Y - 2000) / 100;
  
  const T = (JDE0 - 2451545.0) / 36525.0;
  const W = 35999.373 * T - 2.47;
  const deltaL = 1 + 0.0334 * Math.cos(W * Math.PI / 180) + 0.0007 * Math.cos(2 * W * Math.PI / 180);
  
  const S = 485 * Math.cos((324.96 + 1934.136 * T) * Math.PI / 180) +
            203 * Math.cos((337.23 + 32964.467 * T) * Math.PI / 180) +
            199 * Math.cos((342.08 + 20.186 * T) * Math.PI / 180) +
            182 * Math.cos((27.8 + 445267.112 * T) * Math.PI / 180) +
            156 * Math.cos((73.14 + 450368.886 * T) * Math.PI / 180) +
            136 * Math.cos((171.52 + 22518.443 * T) * Math.PI / 180) +
            77 * Math.cos((222.54 + 65928.934 * T) * Math.PI / 180) +
            74 * Math.cos((296.72 + 3034.906 * T) * Math.PI / 180) +
            70 * Math.cos((243.58 + 9037.513 * T) * Math.PI / 180) +
            58 * Math.cos((119.81 + 33718.147 * T) * Math.PI / 180) +
            52 * Math.cos((297.17 + 150.266 * T) * Math.PI / 180) +
            50 * Math.cos((21.02 + 2281.226 * T) * Math.PI / 180) +
            45 * Math.cos((247.54 + 29929.562 * T) * Math.PI / 180) +
            44 * Math.cos((325.15 + 31555.956 * T) * Math.PI / 180) +
            29 * Math.cos((60.93 + 4443.417 * T) * Math.PI / 180) +
            18 * Math.cos((155.12 + 67555.328 * T) * Math.PI / 180) +
            17 * Math.cos((288.79 + 4562.047 * T) * Math.PI / 180) +
            16 * Math.cos((198.04 + 62894.029 * T) * Math.PI / 180) +
            14 * Math.cos((199.76 + 31436.921 * T) * Math.PI / 180) +
            12 * Math.cos((95.19 + 14577.848 * T) * Math.PI / 180) +
            12 * Math.cos((287.11 + 31931.756 * T) * Math.PI / 180) +
            12 * Math.cos((320.81 + 34777.259 * T) * Math.PI / 180) +
            9 * Math.cos((227.73 + 1222.114 * T) * Math.PI / 180) +
            8 * Math.cos((15.45 + 16859.074 * T) * Math.PI / 180);
  
  const JDE = JDE0 + 0.00001 * S / deltaL;
  
  // Converti JDE a Date (stesso algoritmo di sopra)
  const T2 = (JDE - 2451545.0) / 36525.0;
  const JD = JDE + 0.00001 * S / deltaL;
  
  const Z = Math.floor(JD + 0.5);
  const F = JD + 0.5 - Z;
  
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year2 = month > 2 ? C - 4716 : C - 4715;
  
  const hour = (day - Math.floor(day)) * 24;
  const minute = (hour - Math.floor(hour)) * 60;
  const second = (minute - Math.floor(minute)) * 60;
  
  return new Date(year2, month - 1, Math.floor(day), Math.floor(hour), Math.floor(minute), Math.floor(second));
}

/**
 * Calcola il solstizio d'estate (giugno) per un anno
 */
export function calculateSummerSolstice(year: number): Date {
  const Y = year;
  const JDE0 = 2451716.56767 + 365241.62603 + 0.00325 * (Y - 2000) + 0.00889 * (Y - 2000) * (Y - 2000) / 100;
  
  const T = (JDE0 - 2451545.0) / 36525.0;
  const W = 35999.373 * T - 2.47;
  const deltaL = 1 + 0.0334 * Math.cos(W * Math.PI / 180) + 0.0007 * Math.cos(2 * W * Math.PI / 180);
  
  const S = 485 * Math.cos((324.96 + 1934.136 * T) * Math.PI / 180) +
            203 * Math.cos((337.23 + 32964.467 * T) * Math.PI / 180) +
            199 * Math.cos((342.08 + 20.186 * T) * Math.PI / 180) +
            182 * Math.cos((27.8 + 445267.112 * T) * Math.PI / 180) +
            156 * Math.cos((73.14 + 450368.886 * T) * Math.PI / 180) +
            136 * Math.cos((171.52 + 22518.443 * T) * Math.PI / 180) +
            77 * Math.cos((222.54 + 65928.934 * T) * Math.PI / 180) +
            74 * Math.cos((296.72 + 3034.906 * T) * Math.PI / 180) +
            70 * Math.cos((243.58 + 9037.513 * T) * Math.PI / 180) +
            58 * Math.cos((119.81 + 33718.147 * T) * Math.PI / 180) +
            52 * Math.cos((297.17 + 150.266 * T) * Math.PI / 180) +
            50 * Math.cos((21.02 + 2281.226 * T) * Math.PI / 180) +
            45 * Math.cos((247.54 + 29929.562 * T) * Math.PI / 180) +
            44 * Math.cos((325.15 + 31555.956 * T) * Math.PI / 180) +
            29 * Math.cos((60.93 + 4443.417 * T) * Math.PI / 180) +
            18 * Math.cos((155.12 + 67555.328 * T) * Math.PI / 180) +
            17 * Math.cos((288.79 + 4562.047 * T) * Math.PI / 180) +
            16 * Math.cos((198.04 + 62894.029 * T) * Math.PI / 180) +
            14 * Math.cos((199.76 + 31436.921 * T) * Math.PI / 180) +
            12 * Math.cos((95.19 + 14577.848 * T) * Math.PI / 180) +
            12 * Math.cos((287.11 + 31931.756 * T) * Math.PI / 180) +
            12 * Math.cos((320.81 + 34777.259 * T) * Math.PI / 180) +
            9 * Math.cos((227.73 + 1222.114 * T) * Math.PI / 180) +
            8 * Math.cos((15.45 + 16859.074 * T) * Math.PI / 180);
  
  const JDE = JDE0 + 0.00001 * S / deltaL;
  
  const Z = Math.floor(JDE + 0.5);
  const F = JDE + 0.5 - Z;
  
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year2 = month > 2 ? C - 4716 : C - 4715;
  
  const hour = (day - Math.floor(day)) * 24;
  const minute = (hour - Math.floor(hour)) * 60;
  const second = (minute - Math.floor(minute)) * 60;
  
  return new Date(year2, month - 1, Math.floor(day), Math.floor(hour), Math.floor(minute), Math.floor(second));
}

/**
 * Calcola il solstizio d'inverno (dicembre) per un anno
 */
export function calculateWinterSolstice(year: number): Date {
  const Y = year;
  const JDE0 = 2451900.05952 + 365242.74049 + 0.06223 * (Y - 2000) - 0.00823 * (Y - 2000) * (Y - 2000) / 100;
  
  const T = (JDE0 - 2451545.0) / 36525.0;
  const W = 35999.373 * T - 2.47;
  const deltaL = 1 + 0.0334 * Math.cos(W * Math.PI / 180) + 0.0007 * Math.cos(2 * W * Math.PI / 180);
  
  const S = 485 * Math.cos((324.96 + 1934.136 * T) * Math.PI / 180) +
            203 * Math.cos((337.23 + 32964.467 * T) * Math.PI / 180) +
            199 * Math.cos((342.08 + 20.186 * T) * Math.PI / 180) +
            182 * Math.cos((27.8 + 445267.112 * T) * Math.PI / 180) +
            156 * Math.cos((73.14 + 450368.886 * T) * Math.PI / 180) +
            136 * Math.cos((171.52 + 22518.443 * T) * Math.PI / 180) +
            77 * Math.cos((222.54 + 65928.934 * T) * Math.PI / 180) +
            74 * Math.cos((296.72 + 3034.906 * T) * Math.PI / 180) +
            70 * Math.cos((243.58 + 9037.513 * T) * Math.PI / 180) +
            58 * Math.cos((119.81 + 33718.147 * T) * Math.PI / 180) +
            52 * Math.cos((297.17 + 150.266 * T) * Math.PI / 180) +
            50 * Math.cos((21.02 + 2281.226 * T) * Math.PI / 180) +
            45 * Math.cos((247.54 + 29929.562 * T) * Math.PI / 180) +
            44 * Math.cos((325.15 + 31555.956 * T) * Math.PI / 180) +
            29 * Math.cos((60.93 + 4443.417 * T) * Math.PI / 180) +
            18 * Math.cos((155.12 + 67555.328 * T) * Math.PI / 180) +
            17 * Math.cos((288.79 + 4562.047 * T) * Math.PI / 180) +
            16 * Math.cos((198.04 + 62894.029 * T) * Math.PI / 180) +
            14 * Math.cos((199.76 + 31436.921 * T) * Math.PI / 180) +
            12 * Math.cos((95.19 + 14577.848 * T) * Math.PI / 180) +
            12 * Math.cos((287.11 + 31931.756 * T) * Math.PI / 180) +
            12 * Math.cos((320.81 + 34777.259 * T) * Math.PI / 180) +
            9 * Math.cos((227.73 + 1222.114 * T) * Math.PI / 180) +
            8 * Math.cos((15.45 + 16859.074 * T) * Math.PI / 180);
  
  const JDE = JDE0 + 0.00001 * S / deltaL;
  
  const Z = Math.floor(JDE + 0.5);
  const F = JDE + 0.5 - Z;
  
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year2 = month > 2 ? C - 4716 : C - 4715;
  
  const hour = (day - Math.floor(day)) * 24;
  const minute = (hour - Math.floor(hour)) * 60;
  const second = (minute - Math.floor(minute)) * 60;
  
  return new Date(year2, month - 1, Math.floor(day), Math.floor(hour), Math.floor(minute), Math.floor(second));
}

/**
 * Calcola la Candelora (2 febbraio) - data fissa
 */
export function getCandelora(year: number): Date {
  return new Date(year, 1, 2); // 2 febbraio
}

/**
 * Calcola i Giorni della Merla (29-30-31 gennaio) - date fisse
 */
export function getGiorniMerla(year: number): Date[] {
  return [
    new Date(year, 0, 29),
    new Date(year, 0, 30),
    new Date(year, 0, 31)
  ];
}

/**
 * Calcola San Giuseppe (19 marzo) - data fissa
 */
export function getSanGiuseppe(year: number): Date {
  return new Date(year, 2, 19);
}

/**
 * Calcola San Martino (11 novembre) - data fissa
 */
export function getSanMartino(year: number): Date {
  return new Date(year, 10, 11);
}

/**
 * Ottiene tutti gli eventi stagionali per un anno
 */
export function getSeasonalEventsForYear(year: number): SeasonalEvent[] {
  const events: SeasonalEvent[] = [];
  
  // Equinozi e Solstizi
  events.push({
    type: 'equinox',
    name: 'Equinozio di Primavera',
    date: calculateSpringEquinox(year),
    emoji: '🌸',
    description: 'Inizio della primavera astronomica. Giorno e notte hanno la stessa durata.',
    consiglioOrto: 'Momento ideale per semine primaverili: pomodori, zucchine, peperoni in semenzaio. Trapianti in pieno campo per lattughe, spinaci, rucola.',
    proverbio: 'Equinozio di primavera, semina senza sosta'
  });
  
  events.push({
    type: 'solstice',
    name: 'Solstizio d\'Estate',
    date: calculateSummerSolstice(year),
    emoji: '☀️',
    description: 'Giorno più lungo dell\'anno. Inizio dell\'estate astronomica.',
    consiglioOrto: 'Massima luce solare. Irrigazione intensa necessaria. Raccogli erbe officinali al mattino presto per massima concentrazione oli essenziali.',
    proverbio: 'Solstizio d\'estate, raccolto senza sosta'
  });
  
  events.push({
    type: 'equinox',
    name: 'Equinozio d\'Autunno',
    date: calculateAutumnEquinox(year),
    emoji: '🍂',
    description: 'Inizio dell\'autunno astronomico. Giorno e notte hanno la stessa durata.',
    consiglioOrto: 'Semine autunnali: spinaci, valerianella, rucola. Preparazione terreno per inverno. Ultimi trapianti prima del freddo.',
    proverbio: 'Equinozio d\'autunno, semina per l\'inverno'
  });
  
  events.push({
    type: 'solstice',
    name: 'Solstizio d\'Inverno',
    date: calculateWinterSolstice(year),
    emoji: '❄️',
    description: 'Giorno più corto dell\'anno. Inizio dell\'inverno astronomico.',
    consiglioOrto: 'Riposo della terra. Pianificazione per prossima stagione. Protezione piante dal gelo. Semine in serra/semenzaio.',
    proverbio: 'Solstizio d\'inverno, la terra riposa'
  });
  
  // Candelora (2 febbraio)
  events.push({
    type: 'candelora',
    name: 'Candelora',
    date: getCandelora(year),
    emoji: '🕯️',
    description: 'Festa della Presentazione di Gesù al Tempio. Tradizionalmente segna la fine dell\'inverno più rigido.',
    consiglioOrto: 'Se la Candelora è soleggiata, l\'inverno continua. Se è nuvolosa, primavera anticipata. Inizia preparazione semenzaio per pomodori, peperoni.',
    proverbio: 'Per la Candelora, dall\'inverno siamo fuora; ma se piove o tira vento, dell\'inverno siamo dentro'
  });
  
  // Giorni della Merla (29-30-31 gennaio)
  const giorniMerla = getGiorniMerla(year);
  events.push({
    type: 'giorni-merla',
    name: 'Giorni della Merla',
    date: giorniMerla[0],
    emoji: '🐦',
    description: 'Gli ultimi tre giorni di gennaio sono tradizionalmente i più freddi dell\'anno. Se sono miti, l\'inverno sarà breve.',
    consiglioOrto: 'Proteggi piante sensibili. Se i giorni della Merla sono miti, anticipa semine primaverili. Se gelano, aspetta ancora.',
    proverbio: 'Se i giorni della Merla sono freddi, la primavera sarà bella; se sono caldi, la primavera arriverà tardi'
  });
  
  // San Giuseppe (19 marzo)
  events.push({
    type: 'san-giuseppe',
    name: 'San Giuseppe',
    date: getSanGiuseppe(year),
    emoji: '🌿',
    description: 'Festa del papà. Tradizionalmente segna l\'inizio della primavera agricola.',
    consiglioOrto: 'Semina fave, piselli, lattughe in pieno campo. Trapianti di cipolle, aglio. Potatura alberi da frutto.',
    proverbio: 'San Giuseppe, semina senza paura'
  });
  
  // San Martino (11 novembre)
  events.push({
    type: 'san-martino',
    name: 'San Martino',
    date: getSanMartino(year),
    emoji: '🍷',
    description: 'Estate di San Martino: periodo di bel tempo a novembre. Tradizionalmente si aprono i vini nuovi.',
    consiglioOrto: 'Ultimi raccolti autunnali. Preparazione terreno per inverno. Semine invernali: aglio, cipolle, fave.',
    proverbio: 'Per San Martino, ogni mosto diventa vino'
  });
  
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Ottiene l'evento stagionale per una data specifica
 */
export function getSeasonalEventForDate(date: Date): SeasonalEvent | null {
  const year = date.getFullYear();
  const events = getSeasonalEventsForYear(year);
  
  // Cerca evento esatto per data
  const event = events.find(e => {
    const eventDate = e.date;
    return eventDate.getFullYear() === date.getFullYear() &&
           eventDate.getMonth() === date.getMonth() &&
           eventDate.getDate() === date.getDate();
  });
  
  return event || null;
}

/**
 * Ottiene i prossimi eventi stagionali (nei prossimi N giorni)
 */
export function getUpcomingSeasonalEvents(daysAhead: number = 30): SeasonalEvent[] {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysAhead);
  
  const currentYear = today.getFullYear();
  const nextYear = endDate.getFullYear();
  
  const events: SeasonalEvent[] = [];
  
  // Eventi anno corrente
  events.push(...getSeasonalEventsForYear(currentYear));
  
  // Se necessario, aggiungi eventi anno successivo
  if (nextYear > currentYear) {
    events.push(...getSeasonalEventsForYear(nextYear));
  }
  
  // Filtra solo eventi futuri
  return events
    .filter(e => e.date >= today && e.date <= endDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
