/**
 * Suggerimenti contestuali per categorie frutteto
 * Tips mostrati durante configurazione wizard basati su categoria selezionata
 */

import { FruitTreeCategory } from '../types/orchardTypes'

export interface CategoryTip {
  icon: string
  title: string
  description: string
  type: 'info' | 'warning' | 'success'
}

export interface CategoryConfig {
  category: FruitTreeCategory
  tips: CategoryTip[]
  recommendedPlantingSystem: 'TRADITIONAL' | 'INTENSIVE' | 'SUPER_INTENSIVE'
  recommendedIrrigation: 'DRIP' | 'SPRINKLER' | 'MICRO'
  recommendedSoilPh: { min: number; max: number; ideal: number }
  criticalPeriods: string[]
}

export const orchardCategoryConfigs: Record<FruitTreeCategory, CategoryConfig> = {
  'POMACEE': {
    category: 'POMACEE',
    tips: [
      {
        icon: '🍎',
        title: 'Trattamento Ticchiolatura',
        description: 'Fondamentale trattamento preventivo contro ticchiolatura in primavera (marzo-aprile). Monitora foglie dopo piogge.',
        type: 'warning'
      },
      {
        icon: '✂️',
        title: 'Potatura Invernale',
        description: 'Potatura tra gennaio e febbraio, prima della ripresa vegetativa. Elimina rami secchi e favorisci luce.',
        type: 'info'
      },
      {
        icon: '🌸',
        title: 'Diradamento Frutti',
        description: 'A maggio dirada i frutti: lascia 1 mela ogni 15-20cm per ottenere frutti più grandi e di qualità.',
        type: 'success'
      }
    ],
    recommendedPlantingSystem: 'INTENSIVE',
    recommendedIrrigation: 'DRIP',
    recommendedSoilPh: { min: 6.0, max: 7.0, ideal: 6.5 },
    criticalPeriods: ['Fioritura (Aprile)', 'Allegagione (Maggio)', 'Invaiatura (Luglio)', 'Raccolta (Set-Ott)']
  },

  'DRUPACEE': {
    category: 'DRUPACEE',
    tips: [
      {
        icon: '🍑',
        title: 'Attenzione alla Bolla',
        description: 'Trattamento preventivo contro bolla del pesco PRIMA della fioritura (febbraio). Ripeti se piove.',
        type: 'warning'
      },
      {
        icon: '❄️',
        title: 'Protezione Gelo',
        description: 'Fioritura precoce = rischio gelate! Monitora meteo marzo-aprile. Considera irrigazione antibrina.',
        type: 'warning'
      },
      {
        icon: '🌳',
        title: 'Potatura Verde',
        description: 'Potatura estiva (giugno-luglio) per migliorare areazione e colore frutti. Elimina succhioni.',
        type: 'info'
      }
    ],
    recommendedPlantingSystem: 'INTENSIVE',
    recommendedIrrigation: 'DRIP',
    recommendedSoilPh: { min: 6.0, max: 7.5, ideal: 6.8 },
    criticalPeriods: ['Riposo (Gen-Feb)', 'Fioritura (Mar)', 'Indurimento Nocciolo (Mag)', 'Raccolta (Giu-Ago)']
  },

  'AGRUMI': {
    category: 'AGRUMI',
    tips: [
      {
        icon: '🍊',
        title: 'Fertirrigazione Costante',
        description: 'Agrumi richiedono nutrienti regolari. Fertirriga ogni 7-10 giorni in crescita con NPK bilanciato.',
        type: 'info'
      },
      {
        icon: '🦟',
        title: 'Mosca Mediterranea',
        description: 'Da giugno monitora mosca della frutta. Usa trappole cromotropiche gialle e trattamenti bio se necessario.',
        type: 'warning'
      },
      {
        icon: '🌡️',
        title: 'Sensibili al Freddo',
        description: 'Temperature sotto -2°C danneggiano piante. Proteggi con teli o porta in serra se coltivi in vaso.',
        type: 'warning'
      }
    ],
    recommendedPlantingSystem: 'TRADITIONAL',
    recommendedIrrigation: 'DRIP',
    recommendedSoilPh: { min: 6.0, max: 7.0, ideal: 6.5 },
    criticalPeriods: ['Fioritura (Mar-Mag)', 'Allegagione (Giu)', 'Ingrossamento (Lug-Set)', 'Maturazione (Nov-Mar)']
  },

  'FRUTTA_GUSCIO': {
    category: 'FRUTTA_GUSCIO',
    tips: [
      {
        icon: '🌰',
        title: 'Raccolta Meccanica',
        description: 'Noci e nocciole si prestano a raccolta meccanizzata. Scuotitore + reti facilita operazioni.',
        type: 'info'
      },
      {
        icon: '☀️',
        title: 'Essiccazione Importante',
        description: 'Dopo raccolta essicca frutti a 25-30°C fino a 10-12% umidità. Previene muffe e conserva qualità.',
        type: 'success'
      },
      {
        icon: '🐿️',
        title: 'Protezione Fauna',
        description: 'Ghiandaie e scoiattoli amano noci. Raccogli tempestivamente appena cadono per evitare perdite.',
        type: 'warning'
      }
    ],
    recommendedPlantingSystem: 'TRADITIONAL',
    recommendedIrrigation: 'DRIP',
    recommendedSoilPh: { min: 6.5, max: 7.5, ideal: 7.0 },
    criticalPeriods: ['Fioritura (Apr)', 'Allegagione (Mag)', 'Ingrossamento (Giu-Ago)', 'Raccolta (Set-Ott)']
  },

  'MEDITERRANEA': {
    category: 'MEDITERRANEA',
    tips: [
      {
        icon: '🌿',
        title: 'Rustiche e Resistenti',
        description: 'Fichi, melograni e cachi sono molto rustici e tollerano bene siccità e caldo estivo.',
        type: 'success'
      },
      {
        icon: '✂️',
        title: 'Potatura Leggera',
        description: 'Evita potature drastiche. Elimina solo rami secchi e succhioni, mantieni forma naturale.',
        type: 'info'
      },
      {
        icon: '🍂',
        title: 'Raccolta Scalare',
        description: 'Fichi hanno maturazione scalare: raccogli 2-3 volte a settimana quando frutti sono morbidi.',
        type: 'info'
      }
    ],
    recommendedPlantingSystem: 'TRADITIONAL',
    recommendedIrrigation: 'DRIP',
    recommendedSoilPh: { min: 6.5, max: 7.5, ideal: 7.0 },
    criticalPeriods: ['Fioritura (Apr-Mag)', 'Allegagione (Mag)', 'Maturazione (Ago-Nov)', 'Raccolta (Ago-Nov)']
  },

  'KIWI': {
    category: 'KIWI',
    tips: [
      {
        icon: '🥝',
        title: 'Serve Maschio e Femmina',
        description: 'Kiwi è dioico: pianta 1 maschio ogni 5-6 femmine per impollinazione. Senza maschio niente frutti!',
        type: 'warning'
      },
      {
        icon: '🌳',
        title: 'Pergolato Robusto',
        description: 'Kiwi è vigoroso e pesante. Costruisci pergolato robusto con pali in ferro/cemento.',
        type: 'info'
      },
      {
        icon: '💧',
        title: 'Molta Acqua',
        description: 'Kiwi richiede irrigazioni frequenti in estate. Mai stress idrico da maggio a settembre.',
        type: 'warning'
      }
    ],
    recommendedPlantingSystem: 'TRADITIONAL',
    recommendedIrrigation: 'DRIP',
    recommendedSoilPh: { min: 6.0, max: 7.0, ideal: 6.5 },
    criticalPeriods: ['Fioritura (Mag)', 'Allegagione (Giu)', 'Ingrossamento (Lug-Set)', 'Raccolta (Ott-Nov)']
  },

  'ESOTICHE': {
    category: 'ESOTICHE',
    tips: [
      {
        icon: '🥑',
        title: 'Clima Adatto',
        description: 'Avocado e mango richiedono clima mite (>5°C inverno). In Italia solo zone costiere del sud.',
        type: 'warning'
      },
      {
        icon: '🌡️',
        title: 'Protezione Gelo',
        description: 'Temperature sotto 0°C sono letali. Proteggi con teli o coltiva in serra/vaso mobile.',
        type: 'warning'
      },
      {
        icon: '💧',
        title: 'Umidità Costante',
        description: 'Piante tropicali amano umidità. Irriga regolarmente e mantieni pacciamatura organica.',
        type: 'info'
      }
    ],
    recommendedPlantingSystem: 'TRADITIONAL',
    recommendedIrrigation: 'DRIP',
    recommendedSoilPh: { min: 6.0, max: 7.0, ideal: 6.5 },
    criticalPeriods: ['Fioritura (variabile)', 'Maturazione (variabile)', 'Protezione freddo (Nov-Mar)']
  }
}

/**
 * Ottieni suggerimenti per categoria selezionata
 */
export function getCategoryTips(category: FruitTreeCategory): CategoryTip[] {
  return orchardCategoryConfigs[category]?.tips || []
}

/**
 * Ottieni configurazione raccomandata per categoria
 */
export function getCategoryRecommendations(category: FruitTreeCategory) {
  const config = orchardCategoryConfigs[category]
  if (!config) return null

  return {
    plantingSystem: config.recommendedPlantingSystem,
    irrigation: config.recommendedIrrigation,
    soilPh: config.recommendedSoilPh,
    criticalPeriods: config.criticalPeriods
  }
}
