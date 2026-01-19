// Types for planting density calculations

export type CropType = 'apple' | 'pear' | 'peach' | 'apricot' | 'cherry' | 'plum' | 
                       'citrus' | 'walnut' | 'hazelnut' | 'almond' | 'olive' | 'grape';

export type TrainingSystem = 
  // Pomacee
  | 'spindle' // Fusetto
  | 'palmette' // Palmetta
  | 'vase' // Vaso
  | 'espalier' // Spalliera
  | 'y-trellis' // Y-trellis
  // Drupacee
  | 'open-vase' // Vaso aperto
  | 'delayed-vase' // Vaso ritardato
  | 'palmette-drupacee' // Palmetta drupacee
  // Vite
  | 'guyot' // Guyot
  | 'cordon' // Cordone speronato
  | 'pergola' // Pergola
  | 'tendone' // Tendone
  // Olivo
  | 'globe' // Globo
  | 'polyconic-vase' // Vaso policonico
  | 'monoconic' // Monocono
  // Generico
  | 'free-form' // Forma libera
  | 'hedge' // Siepe
  | 'custom'; // Personalizzato

export interface DensityInput {
  cropType: CropType;
  trainingSystem: TrainingSystem;
  surfaceArea: number; // m²
  rowSpacing?: number; // m (opzionale, calcolato se non fornito)
  plantSpacing?: number; // m (opzionale, calcolato se non fornito)
  mechanization: 'full' | 'partial' | 'manual';
  soilQuality: 'poor' | 'medium' | 'good' | 'excellent';
  climateZone: 'cold' | 'temperate' | 'warm' | 'hot';
}

export interface DensityRecommendation {
  plantsPerHectare: number;
  plantsTotal: number;
  rowSpacing: number; // m
  plantSpacing: number; // m
  rowsCount: number;
  plantsPerRow: number;
  confidence: 'low' | 'medium' | 'high';
  notes: string[];
  alternatives: Array<{
    rowSpacing: number;
    plantSpacing: number;
    plantsPerHectare: number;
    description: string;
  }>;
}

export interface DensityRange {
  min: number;
  optimal: number;
  max: number;
  unit: 'plants/ha';
}

export interface SpacingRange {
  rowMin: number;
  rowOptimal: number;
  rowMax: number;
  plantMin: number;
  plantOptimal: number;
  plantMax: number;
  unit: 'm';
}

export interface TrainingSystemInfo {
  name: string;
  description: string;
  suitableFor: CropType[];
  densityRange: DensityRange;
  spacingRange: SpacingRange;
  mechanizationLevel: 'high' | 'medium' | 'low';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  advantages: string[];
  disadvantages: string[];
}
