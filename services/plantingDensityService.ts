import {
  CropType,
  TrainingSystem,
  DensityInput,
  DensityRecommendation,
  TrainingSystemInfo,
  DensityRange,
  SpacingRange
} from '@/types/plantingDensity';

// Database delle forme di allevamento con parametri standard
const TRAINING_SYSTEMS: Record<TrainingSystem, TrainingSystemInfo> = {
  // POMACEE
  'spindle': {
    name: 'Fusetto',
    description: 'Forma intensiva con asse centrale e branche laterali corte',
    suitableFor: ['apple', 'pear'],
    densityRange: { min: 2000, optimal: 2500, max: 4000, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 3.0, rowOptimal: 3.5, rowMax: 4.0,
      plantMin: 0.8, plantOptimal: 1.2, plantMax: 1.5,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'intermediate',
    advantages: ['Alta produttività', 'Entrata in produzione rapida', 'Facile meccanizzazione'],
    disadvantages: ['Richiede potatura frequente', 'Costi impianto elevati']
  },
  'palmette': {
    name: 'Palmetta',
    description: 'Forma bidimensionale con branche disposte su un piano',
    suitableFor: ['apple', 'pear', 'peach', 'apricot'],
    densityRange: { min: 800, optimal: 1200, max: 1600, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 4.0, rowOptimal: 4.5, rowMax: 5.0,
      plantMin: 1.5, plantOptimal: 2.0, plantMax: 2.5,
      unit: 'm'
    },
    mechanizationLevel: 'medium',
    skillLevel: 'advanced',
    advantages: ['Buona esposizione alla luce', 'Qualità frutti elevata'],
    disadvantages: ['Richiede strutture di sostegno', 'Potatura complessa']
  },
  'vase': {
    name: 'Vaso',
    description: 'Forma tradizionale con chioma aperta a vaso',
    suitableFor: ['apple', 'pear', 'peach', 'apricot', 'cherry', 'plum'],
    densityRange: { min: 400, optimal: 600, max: 800, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 5.0, rowOptimal: 5.5, rowMax: 6.0,
      plantMin: 3.0, plantOptimal: 3.5, plantMax: 4.0,
      unit: 'm'
    },
    mechanizationLevel: 'medium',
    skillLevel: 'intermediate',
    advantages: ['Forma tradizionale', 'Buona ventilazione', 'Longevità piante'],
    disadvantages: ['Entrata in produzione lenta', 'Densità limitata']
  },
  
  // DRUPACEE
  'open-vase': {
    name: 'Vaso Aperto',
    description: 'Vaso classico per drupacee con 3-4 branche principali',
    suitableFor: ['peach', 'apricot', 'cherry', 'plum'],
    densityRange: { min: 300, optimal: 500, max: 700, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 5.0, rowOptimal: 5.5, rowMax: 6.0,
      plantMin: 3.5, plantOptimal: 4.0, plantMax: 4.5,
      unit: 'm'
    },
    mechanizationLevel: 'medium',
    skillLevel: 'intermediate',
    advantages: ['Buona illuminazione', 'Facilità raccolta', 'Longevità'],
    disadvantages: ['Bassa densità', 'Entrata produzione lenta']
  },
  'delayed-vase': {
    name: 'Vaso Ritardato',
    description: 'Vaso con formazione ritardata per maggiore produttività',
    suitableFor: ['peach', 'apricot'],
    densityRange: { min: 500, optimal: 700, max: 900, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 4.5, rowOptimal: 5.0, rowMax: 5.5,
      plantMin: 2.5, plantOptimal: 3.0, plantMax: 3.5,
      unit: 'm'
    },
    mechanizationLevel: 'medium',
    skillLevel: 'advanced',
    advantages: ['Produzione precoce', 'Densità maggiore'],
    disadvantages: ['Gestione complessa', 'Durata limitata']
  },
  'palmette-drupacee': {
    name: 'Palmetta Drupacee',
    description: 'Palmetta adattata per drupacee',
    suitableFor: ['peach', 'apricot', 'cherry'],
    densityRange: { min: 800, optimal: 1000, max: 1200, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 4.0, rowOptimal: 4.5, rowMax: 5.0,
      plantMin: 2.0, plantOptimal: 2.5, plantMax: 3.0,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'advanced',
    advantages: ['Alta densità', 'Meccanizzazione facile'],
    disadvantages: ['Costi impianto alti', 'Potatura frequente']
  },
  
  // VITE
  'guyot': {
    name: 'Guyot',
    description: 'Sistema a tralcio rinnovato annualmente',
    suitableFor: ['grape'],
    densityRange: { min: 4000, optimal: 5000, max: 6000, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 2.0, rowOptimal: 2.5, rowMax: 3.0,
      plantMin: 0.8, plantOptimal: 1.0, plantMax: 1.2,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'intermediate',
    advantages: ['Qualità elevata', 'Controllo vigoria', 'Meccanizzabile'],
    disadvantages: ['Potatura annuale complessa', 'Richiede strutture']
  },
  'cordon': {
    name: 'Cordone Speronato',
    description: 'Cordone permanente con speroni',
    suitableFor: ['grape'],
    densityRange: { min: 3000, optimal: 4000, max: 5000, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 2.5, rowOptimal: 3.0, rowMax: 3.5,
      plantMin: 0.8, plantOptimal: 1.0, plantMax: 1.2,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'beginner',
    advantages: ['Potatura semplice', 'Meccanizzazione totale', 'Produttività alta'],
    disadvantages: ['Qualità media', 'Vigoria difficile da controllare']
  },
  'pergola': {
    name: 'Pergola',
    description: 'Sistema tradizionale con vegetazione orizzontale',
    suitableFor: ['grape'],
    densityRange: { min: 2000, optimal: 2500, max: 3000, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 3.0, rowOptimal: 3.5, rowMax: 4.0,
      plantMin: 1.0, plantOptimal: 1.2, plantMax: 1.5,
      unit: 'm'
    },
    mechanizationLevel: 'low',
    skillLevel: 'advanced',
    advantages: ['Produzione elevata', 'Protezione grappoli'],
    disadvantages: ['Meccanizzazione difficile', 'Qualità media']
  },
  'tendone': {
    name: 'Tendone',
    description: 'Sistema a tetto orizzontale per uva da tavola',
    suitableFor: ['grape'],
    densityRange: { min: 1500, optimal: 2000, max: 2500, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 3.5, rowOptimal: 4.0, rowMax: 4.5,
      plantMin: 1.5, plantOptimal: 2.0, plantMax: 2.5,
      unit: 'm'
    },
    mechanizationLevel: 'low',
    skillLevel: 'advanced',
    advantages: ['Grappoli grandi', 'Protezione agenti atmosferici'],
    disadvantages: ['Costi strutture alti', 'Meccanizzazione impossibile']
  },
  
  // OLIVO
  'globe': {
    name: 'Globo',
    description: 'Forma tradizionale a chioma globosa',
    suitableFor: ['olive'],
    densityRange: { min: 200, optimal: 300, max: 400, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 6.0, rowOptimal: 7.0, rowMax: 8.0,
      plantMin: 5.0, plantOptimal: 6.0, plantMax: 7.0,
      unit: 'm'
    },
    mechanizationLevel: 'medium',
    skillLevel: 'intermediate',
    advantages: ['Longevità', 'Produzione costante', 'Tradizionale'],
    disadvantages: ['Bassa densità', 'Entrata produzione lenta']
  },
  'polyconic-vase': {
    name: 'Vaso Policonico',
    description: 'Vaso con più coni produttivi',
    suitableFor: ['olive'],
    densityRange: { min: 300, optimal: 400, max: 500, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 5.0, rowOptimal: 6.0, rowMax: 7.0,
      plantMin: 4.0, plantOptimal: 5.0, plantMax: 6.0,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'intermediate',
    advantages: ['Meccanizzazione raccolta', 'Produttività buona'],
    disadvantages: ['Potatura frequente', 'Gestione complessa']
  },
  'monoconic': {
    name: 'Monocono',
    description: 'Forma intensiva a cono singolo',
    suitableFor: ['olive'],
    densityRange: { min: 1000, optimal: 1500, max: 2000, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 4.0, rowOptimal: 4.5, rowMax: 5.0,
      plantMin: 1.5, plantOptimal: 2.0, plantMax: 2.5,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'advanced',
    advantages: ['Alta densità', 'Entrata produzione rapida', 'Meccanizzazione totale'],
    disadvantages: ['Durata limitata', 'Costi impianto alti']
  },
  
  // GENERICI
  'espalier': {
    name: 'Spalliera',
    description: 'Forma bidimensionale su supporto',
    suitableFor: ['apple', 'pear', 'peach', 'apricot'],
    densityRange: { min: 1000, optimal: 1500, max: 2000, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 3.5, rowOptimal: 4.0, rowMax: 4.5,
      plantMin: 1.5, plantOptimal: 2.0, plantMax: 2.5,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'intermediate',
    advantages: ['Meccanizzazione facile', 'Buona esposizione'],
    disadvantages: ['Costi strutture', 'Potatura frequente']
  },
  'y-trellis': {
    name: 'Y-Trellis',
    description: 'Sistema a Y per massima esposizione',
    suitableFor: ['apple', 'pear'],
    densityRange: { min: 1500, optimal: 2000, max: 2500, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 3.5, rowOptimal: 4.0, rowMax: 4.5,
      plantMin: 1.2, plantOptimal: 1.5, plantMax: 2.0,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'advanced',
    advantages: ['Esposizione ottimale', 'Qualità elevata'],
    disadvantages: ['Costi strutture alti', 'Gestione complessa']
  },
  'free-form': {
    name: 'Forma Libera',
    description: 'Forma naturale senza potatura di formazione',
    suitableFor: ['apple', 'pear', 'peach', 'apricot', 'cherry', 'plum', 'citrus', 'walnut', 'hazelnut', 'almond'],
    densityRange: { min: 200, optimal: 400, max: 600, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 5.0, rowOptimal: 6.0, rowMax: 7.0,
      plantMin: 4.0, plantOptimal: 5.0, plantMax: 6.0,
      unit: 'm'
    },
    mechanizationLevel: 'low',
    skillLevel: 'beginner',
    advantages: ['Gestione semplice', 'Costi bassi'],
    disadvantages: ['Produttività bassa', 'Qualità variabile']
  },
  'hedge': {
    name: 'Siepe',
    description: 'Forma a siepe continua',
    suitableFor: ['apple', 'pear', 'peach', 'apricot', 'olive'],
    densityRange: { min: 2000, optimal: 3000, max: 4000, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 3.0, rowOptimal: 3.5, rowMax: 4.0,
      plantMin: 0.8, plantOptimal: 1.0, plantMax: 1.2,
      unit: 'm'
    },
    mechanizationLevel: 'high',
    skillLevel: 'advanced',
    advantages: ['Meccanizzazione totale', 'Produzione precoce'],
    disadvantages: ['Durata limitata', 'Gestione intensiva']
  },
  'custom': {
    name: 'Personalizzato',
    description: 'Sesti personalizzati dall\'utente',
    suitableFor: ['apple', 'pear', 'peach', 'apricot', 'cherry', 'plum', 'citrus', 'walnut', 'hazelnut', 'almond', 'olive', 'grape'],
    densityRange: { min: 100, optimal: 1000, max: 10000, unit: 'plants/ha' },
    spacingRange: {
      rowMin: 1.0, rowOptimal: 4.0, rowMax: 10.0,
      plantMin: 0.5, plantOptimal: 2.0, plantMax: 8.0,
      unit: 'm'
    },
    mechanizationLevel: 'medium',
    skillLevel: 'advanced',
    advantages: ['Massima flessibilità'],
    disadvantages: ['Richiede esperienza']
  }
};

export class PlantingDensityService {
  /**
   * Calcola la densità ottimale di impianto
   */
  calculateDensity(input: DensityInput): DensityRecommendation {
    const systemInfo = TRAINING_SYSTEMS[input.trainingSystem];
    
    // Usa sesti forniti o calcola ottimali
    let rowSpacing = input.rowSpacing || systemInfo.spacingRange.rowOptimal;
    let plantSpacing = input.plantSpacing || systemInfo.spacingRange.plantOptimal;
    
    // Aggiustamenti basati su meccanizzazione
    if (input.mechanization === 'full') {
      rowSpacing = Math.max(rowSpacing, systemInfo.spacingRange.rowOptimal);
    } else if (input.mechanization === 'manual') {
      rowSpacing = Math.min(rowSpacing, systemInfo.spacingRange.rowOptimal);
      plantSpacing = Math.min(plantSpacing, systemInfo.spacingRange.plantOptimal);
    }
    
    // Aggiustamenti basati su qualità suolo
    const soilFactor = {
      'poor': 1.1,
      'medium': 1.0,
      'good': 0.95,
      'excellent': 0.9
    }[input.soilQuality];
    
    plantSpacing *= soilFactor;
    
    // Calcola piante per ettaro
    const plantsPerHectare = Math.round(10000 / (rowSpacing * plantSpacing));
    
    // Calcola per superficie specifica
    const surfaceHa = input.surfaceArea / 10000;
    const plantsTotal = Math.round(plantsPerHectare * surfaceHa);
    
    // Calcola numero file e piante per fila
    const rowsCount = Math.floor(Math.sqrt(input.surfaceArea) / rowSpacing);
    const plantsPerRow = Math.round(plantsTotal / rowsCount);
    
    // Determina confidenza
    const confidence = this.calculateConfidence(
      plantsPerHectare,
      systemInfo.densityRange,
      input
    );
    
    // Genera note
    const notes = this.generateNotes(input, systemInfo, plantsPerHectare);
    
    // Genera alternative
    const alternatives = this.generateAlternatives(systemInfo, input);
    
    return {
      plantsPerHectare,
      plantsTotal,
      rowSpacing,
      plantSpacing,
      rowsCount,
      plantsPerRow,
      confidence,
      notes,
      alternatives
    };
  }
  
  /**
   * Calcola confidenza della raccomandazione
   */
  private calculateConfidence(
    calculated: number,
    range: DensityRange,
    input: DensityInput
  ): 'low' | 'medium' | 'high' {
    if (calculated < range.min || calculated > range.max) {
      return 'low';
    }
    
    const deviation = Math.abs(calculated - range.optimal) / range.optimal;
    
    if (deviation < 0.1) return 'high';
    if (deviation < 0.25) return 'medium';
    return 'low';
  }
  
  /**
   * Genera note e avvisi
   */
  private generateNotes(
    input: DensityInput,
    systemInfo: TrainingSystemInfo,
    calculated: number
  ): string[] {
    const notes: string[] = [];
    
    // Verifica range
    if (calculated < systemInfo.densityRange.min) {
      notes.push(`⚠️ Densità sotto il minimo consigliato (${systemInfo.densityRange.min} piante/ha)`);
    } else if (calculated > systemInfo.densityRange.max) {
      notes.push(`⚠️ Densità sopra il massimo consigliato (${systemInfo.densityRange.max} piante/ha)`);
    }
    
    // Note su meccanizzazione
    if (input.mechanization === 'full' && systemInfo.mechanizationLevel === 'low') {
      notes.push('⚠️ Questa forma di allevamento non è ottimale per meccanizzazione completa');
    }
    
    // Note su suolo
    if (input.soilQuality === 'poor') {
      notes.push('💡 Su suolo povero, considera densità ridotta e maggiore distanza tra piante');
    } else if (input.soilQuality === 'excellent') {
      notes.push('💡 Su suolo ottimale, puoi aumentare leggermente la densità');
    }
    
    // Note su clima
    if (input.climateZone === 'hot' || input.climateZone === 'warm') {
      notes.push('💡 In clima caldo, considera distanze maggiori per migliore ventilazione');
    }
    
    return notes;
  }
  
  /**
   * Genera soluzioni alternative
   */
  private generateAlternatives(
    systemInfo: TrainingSystemInfo,
    input: DensityInput
  ): Array<{
    rowSpacing: number;
    plantSpacing: number;
    plantsPerHectare: number;
    description: string;
  }> {
    const alternatives = [];
    
    // Alternativa densità minima
    const minDensity = {
      rowSpacing: systemInfo.spacingRange.rowMax,
      plantSpacing: systemInfo.spacingRange.plantMax,
      plantsPerHectare: Math.round(10000 / (systemInfo.spacingRange.rowMax * systemInfo.spacingRange.plantMax)),
      description: 'Densità minima - Maggiore spazio per piante, gestione più semplice'
    };
    alternatives.push(minDensity);
    
    // Alternativa densità massima
    const maxDensity = {
      rowSpacing: systemInfo.spacingRange.rowMin,
      plantSpacing: systemInfo.spacingRange.plantMin,
      plantsPerHectare: Math.round(10000 / (systemInfo.spacingRange.rowMin * systemInfo.spacingRange.plantMin)),
      description: 'Densità massima - Produzione precoce, gestione intensiva'
    };
    alternatives.push(maxDensity);
    
    // Alternativa bilanciata
    const balanced = {
      rowSpacing: (systemInfo.spacingRange.rowMin + systemInfo.spacingRange.rowMax) / 2,
      plantSpacing: (systemInfo.spacingRange.plantMin + systemInfo.spacingRange.plantMax) / 2,
      plantsPerHectare: Math.round(10000 / (
        ((systemInfo.spacingRange.rowMin + systemInfo.spacingRange.rowMax) / 2) *
        ((systemInfo.spacingRange.plantMin + systemInfo.spacingRange.plantMax) / 2)
      )),
      description: 'Soluzione bilanciata - Compromesso tra produttività e gestibilità'
    };
    alternatives.push(balanced);
    
    return alternatives;
  }
  
  /**
   * Ottieni informazioni su una forma di allevamento
   */
  getTrainingSystemInfo(system: TrainingSystem): TrainingSystemInfo {
    return TRAINING_SYSTEMS[system];
  }
  
  /**
   * Ottieni tutte le forme di allevamento disponibili
   */
  getAllTrainingSystems(): Record<TrainingSystem, TrainingSystemInfo> {
    return TRAINING_SYSTEMS;
  }
  
  /**
   * Ottieni forme di allevamento adatte per una coltura
   */
  getTrainingSystemsForCrop(cropType: CropType): Array<{
    system: TrainingSystem;
    info: TrainingSystemInfo;
  }> {
    return Object.entries(TRAINING_SYSTEMS)
      .filter(([_, info]) => info.suitableFor.includes(cropType))
      .map(([system, info]) => ({
        system: system as TrainingSystem,
        info
      }));
  }
}

export const plantingDensityService = new PlantingDensityService();
