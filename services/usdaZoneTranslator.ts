/**
 * USDA Zone Translator
 * Traduce zone USDA in descrizioni user-friendly per utenti italiani
 */

export interface USDAZoneDescription {
  // Descrizione principale (mostrata prominente)
  climateName: string;
  
  // Temperatura minima in formato leggibile
  minTemp: string;
  
  // Riferimento geografico italiano
  geographicReference: string;
  
  // Livello di freddo (per icone/colori)
  coldLevel: 'Mite' | 'Moderato' | 'Rigido' | 'Molto Rigido';
  
  // Descrizione completa per tooltip/help
  description: string;
  
  // Zona tecnica originale (per riferimento)
  technicalZone: string;
  
  // Emoji per visualizzazione
  emoji: string;
}

/**
 * Traduce zona USDA in descrizione user-friendly
 */
export function translateUsdaZone(zone: string): USDAZoneDescription {
  const zoneMap: Record<string, USDAZoneDescription> = {
    '7a': {
      climateName: 'Clima Continentale Rigido',
      minTemp: 'Fino a -15°C',
      geographicReference: 'Come Alpi o Appennini sopra 1000m',
      coldLevel: 'Molto Rigido',
      description: 'Inverni molto rigidi con gelate frequenti. Ideale per piante rustiche e resistenti al freddo.',
      technicalZone: '7a',
      emoji: '❄️'
    },
    '7b': {
      climateName: 'Clima Continentale',
      minTemp: 'Fino a -12°C',
      geographicReference: 'Come Pianura Padana o Appennini',
      coldLevel: 'Rigido',
      description: 'Inverni rigidi con gelate frequenti. Molte piante necessitano protezione invernale.',
      technicalZone: '7b',
      emoji: '🧊'
    },
    '8a': {
      climateName: 'Clima Temperato-Freddo',
      minTemp: 'Fino a -9°C',
      geographicReference: 'Come Nord Italia pianura',
      coldLevel: 'Moderato',
      description: 'Inverni moderati con gelate occasionali. Clima ideale per molte piante da orto.',
      technicalZone: '8a',
      emoji: '🌨️'
    },
    '8b': {
      climateName: 'Clima Temperato',
      minTemp: 'Fino a -7°C',
      geographicReference: 'Come Centro Italia interno',
      coldLevel: 'Moderato',
      description: 'Inverni miti con gelate rare. Clima favorevole per la maggior parte delle piante.',
      technicalZone: '8b',
      emoji: '🌤️'
    },
    '9a': {
      climateName: 'Clima Mediterraneo',
      minTemp: 'Fino a -4°C',
      geographicReference: 'Come Toscana o Lazio costiero',
      coldLevel: 'Mite',
      description: 'Inverni miti con gelate occasionali. Ideale per piante mediterranee e molte esotiche.',
      technicalZone: '9a',
      emoji: '🌿'
    },
    '9b': {
      climateName: 'Clima Mediterraneo Mite',
      minTemp: 'Fino a -2°C',
      geographicReference: 'Come Sicilia o Calabria costiera',
      coldLevel: 'Mite',
      description: 'Inverni molto miti, gelate rare. Perfetto per piante esotiche e mediterranee.',
      technicalZone: '9b',
      emoji: '🌴'
    },
    '10a': {
      climateName: 'Clima Subtropicale',
      minTemp: 'Fino a 0°C',
      geographicReference: 'Come Sicilia meridionale o zone costiere calde',
      coldLevel: 'Mite',
      description: 'Inverni molto miti, quasi senza gelate. Ideale per piante tropicali e subtropicali.',
      technicalZone: '10a',
      emoji: '🌺'
    },
    '10b': {
      climateName: 'Clima Subtropicale Caldo',
      minTemp: 'Fino a 4°C',
      geographicReference: 'Come zone più calde del Sud Italia',
      coldLevel: 'Mite',
      description: 'Inverni caldi senza gelate. Perfetto per piante tropicali e subtropicali.',
      technicalZone: '10b',
      emoji: '🌴'
    },
    '11': {
      climateName: 'Clima Tropicale',
      minTemp: 'Sopra 4°C',
      geographicReference: 'Zone molto calde (raro in Italia)',
      coldLevel: 'Mite',
      description: 'Clima caldo tutto l\'anno. Ideale solo per piante tropicali.',
      technicalZone: '11',
      emoji: '🌴'
    }
  };

  return zoneMap[zone] || {
    climateName: 'Zona Sconosciuta',
    minTemp: 'N/A',
    geographicReference: 'Non disponibile',
    coldLevel: 'Moderato',
    description: 'Zona USDA non riconosciuta',
    technicalZone: zone,
    emoji: '❓'
  };
}

/**
 * Formatta zona USDA per display nell'UI
 * Mostra descrizione user-friendly con zona tecnica opzionale
 */
export function formatUsdaZoneForDisplay(
  zone: string, 
  options?: {
    showTechnical?: boolean;
    showTemp?: boolean;
    showEmoji?: boolean;
    compact?: boolean;
  }
): string {
  const translated = translateUsdaZone(zone);
  const {
    showTechnical = false,
    showTemp = false,
    showEmoji = false,
    compact = false
  } = options || {};

  if (compact) {
    return `${showEmoji ? translated.emoji + ' ' : ''}${translated.climateName}${showTemp ? ` (${translated.minTemp})` : ''}`;
  }

  const parts: string[] = [];
  
  if (showEmoji) {
    parts.push(translated.emoji);
  }
  
  parts.push(translated.climateName);
  
  if (showTemp) {
    parts.push(`(${translated.minTemp})`);
  }
  
  if (showTechnical) {
    parts.push(`[${translated.technicalZone}]`);
  }

  return parts.join(' ');
}

/**
 * Ottiene colore CSS per livello di freddo
 */
export function getColdLevelColor(coldLevel: USDAZoneDescription['coldLevel']): string {
  const colors = {
    'Mite': 'text-green-600 bg-green-50 border-green-200',
    'Moderato': 'text-blue-600 bg-blue-50 border-blue-200',
    'Rigido': 'text-orange-600 bg-orange-50 border-orange-200',
    'Molto Rigido': 'text-red-600 bg-red-50 border-red-200'
  };
  return colors[coldLevel] || colors.Moderato;
}

/**
 * Ottiene badge colorato per zona USDA
 */
export function getUsdaZoneBadge(zone: string): {
  text: string;
  className: string;
  tooltip: string;
} {
  const translated = translateUsdaZone(zone);
  
  return {
    text: `${translated.emoji} ${translated.climateName}`,
    className: `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getColdLevelColor(translated.coldLevel)}`,
    tooltip: `${translated.description}\n\nRiferimento: ${translated.geographicReference}\nTemperatura minima: ${translated.minTemp}`
  };
}

/**
 * Migliora messaggio di warning con descrizioni clima invece di zone tecniche
 */
export function formatClimateWarning(
  userZone: string,
  plantZones: number[],
  isOptimal: boolean = false
): string {
  const userDesc = translateUsdaZone(userZone);
  const minPlantZone = Math.min(...plantZones);
  const plantZoneDesc = translateUsdaZone(minPlantZone.toString());
  
  if (isOptimal) {
    return `Il tuo clima (${userDesc.climateName}, ${userDesc.minTemp}) è al limite della compatibilità. 
    Questa pianta preferisce climi più caldi (${plantZoneDesc.climateName}). 
    Consigliata serra o varietà più resistenti al freddo.`;
  }
  
  return `Il tuo clima (${userDesc.climateName}, ${userDesc.minTemp}) è troppo freddo per questa pianta tropicale. 
  Questa pianta richiede climi più caldi (${plantZoneDesc.climateName}, ${plantZoneDesc.minTemp}). 
  Necessaria serra riscaldata o varietà più resistenti.`;
}


