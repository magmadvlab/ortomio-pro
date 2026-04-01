/**
 * Soil Analysis Service
 * Gestisce analisi suolo avanzate per agricoltura di precisione
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { IrrigationWaterQualityProfile, IrrigationZone } from '@/types/irrigation';

export interface SoilAnalysis {
  id: string;
  zoneId?: string;
  gardenId: string;
  analysisDate: string;
  labName?: string;
  analysisType: 'basic' | 'complete' | 'professional';
  
  // Macro-nutrienti
  nitrogenN?: number;
  phosphorusP?: number;
  potassiumK?: number;
  
  // Micro-nutrienti
  ironFe?: number;
  manganeseMn?: number;
  zincZn?: number;
  copperCu?: number;
  boronB?: number;
  
  // Proprietà fisico-chimiche
  ph?: number;
  organicMatterPercent?: number;
  organicCarbonPercent?: number;
  cec?: number; // Capacità di Scambio Cationico
  
  // Texture
  sandPercent?: number;
  siltPercent?: number;
  clayPercent?: number;
  
  notes?: string;
  recommendations?: {
    deficiencies: string[];
    suggestedFertilizers: Array<{
      product: string;
      dosage: number;
      unit: string;
      reason: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSoilAnalysisInput {
  zoneId?: string;
  gardenId: string;
  analysisDate: string;
  labName?: string;
  analysisType?: 'basic' | 'complete' | 'professional';
  nitrogenN?: number;
  phosphorusP?: number;
  potassiumK?: number;
  ironFe?: number;
  manganeseMn?: number;
  zincZn?: number;
  copperCu?: number;
  boronB?: number;
  ph?: number;
  organicMatterPercent?: number;
  organicCarbonPercent?: number;
  cec?: number;
  sandPercent?: number;
  siltPercent?: number;
  clayPercent?: number;
  notes?: string;
}

export type SoilTextureClass =
  | 'sand'
  | 'sandy_loam'
  | 'loam'
  | 'silt_loam'
  | 'clay_loam'
  | 'clay';

export interface SoilHydraulicProfile {
  textureClass: SoilTextureClass;
  fieldCapacityVolumetricPercent: number;
  wiltingPointVolumetricPercent: number;
  availableWaterHoldingMmPerMeter: number;
  estimatedInfiltrationRateMmh: number;
  rootZoneDepthCm: number;
  effectiveRootableDepthCm: number;
  drainageClass: 'free' | 'moderate' | 'slow';
  compactionRisk: 'low' | 'medium' | 'high' | 'unknown';
  salinityAccumulationRisk: 'low' | 'medium' | 'high';
  hydraulicQuality: 'measured' | 'mixed' | 'estimated';
  fieldCapacitySource: 'measured' | 'estimated';
  wiltingPointSource: 'measured' | 'estimated';
  infiltrationSource: 'measured' | 'estimated';
  rootDepthSource: 'crop_profile' | 'user_override' | 'default';
  effectiveStorageFraction: number;
  refillTriggerThresholdPercent: number;
  refillEventTargetMm: number;
  pulseSplitRecommended: boolean;
  pulseCountSuggestion: number;
  drainageConstraintFactor: number;
  compactionConstraintFactor: number;
  salinityPressureIndex: number;
  source: 'soil_analysis' | 'estimated_from_partial_analysis';
  notes: string[];
}

/**
 * Crea una nuova analisi suolo
 */
export async function createSoilAnalysis(
  supabase: SupabaseClient,
  input: CreateSoilAnalysisInput
): Promise<SoilAnalysis> {
  // Calcola raccomandazioni basate su carenze
  const recommendations = calculateRecommendations(input);

  const { data, error } = await supabase
    .from('soil_analysis')
    .insert({
      zone_id: input.zoneId,
      garden_id: input.gardenId,
      analysis_date: input.analysisDate,
      lab_name: input.labName,
      analysis_type: input.analysisType || 'basic',
      nitrogen_n: input.nitrogenN,
      phosphorus_p: input.phosphorusP,
      potassium_k: input.potassiumK,
      iron_fe: input.ironFe,
      manganese_mn: input.manganeseMn,
      zinc_zn: input.zincZn,
      copper_cu: input.copperCu,
      boron_b: input.boronB,
      ph: input.ph,
      organic_matter_percent: input.organicMatterPercent,
      organic_carbon_percent: input.organicCarbonPercent,
      cec: input.cec,
      sand_percent: input.sandPercent,
      silt_percent: input.siltPercent,
      clay_percent: input.clayPercent,
      notes: input.notes,
      recommendations: recommendations
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create soil analysis: ${error.message}`);
  }

  return mapSoilAnalysisFromDB(data);
}

/**
 * Recupera analisi suolo per zona o giardino
 */
export async function getSoilAnalyses(
  supabase: SupabaseClient,
  filters: {
    zoneId?: string;
    gardenId?: string;
    limit?: number;
  }
): Promise<SoilAnalysis[]> {
  let query = supabase
    .from('soil_analysis')
    .select('*')
    .order('analysis_date', { ascending: false });

  if (filters.zoneId) {
    query = query.eq('zone_id', filters.zoneId);
  }
  if (filters.gardenId) {
    query = query.eq('garden_id', filters.gardenId);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch soil analyses: ${error.message}`);
  }

  return (data || []).map(mapSoilAnalysisFromDB);
}

/**
 * Recupera analisi più recente per zona o giardino
 */
export async function getLatestSoilAnalysis(
  supabase: SupabaseClient,
  zoneId?: string,
  gardenId?: string
): Promise<SoilAnalysis | null> {
  const analyses = await getSoilAnalyses(supabase, {
    zoneId,
    gardenId,
    limit: 1
  });

  return analyses.length > 0 ? analyses[0] : null;
}

/**
 * Aggiorna analisi suolo esistente
 */
export async function updateSoilAnalysis(
  supabase: SupabaseClient,
  analysisId: string,
  updates: Partial<CreateSoilAnalysisInput>
): Promise<SoilAnalysis> {
  const updateData: any = {};

  if (updates.analysisDate !== undefined) updateData.analysis_date = updates.analysisDate;
  if (updates.labName !== undefined) updateData.lab_name = updates.labName;
  if (updates.analysisType !== undefined) updateData.analysis_type = updates.analysisType;
  if (updates.nitrogenN !== undefined) updateData.nitrogen_n = updates.nitrogenN;
  if (updates.phosphorusP !== undefined) updateData.phosphorus_p = updates.phosphorusP;
  if (updates.potassiumK !== undefined) updateData.potassium_k = updates.potassiumK;
  if (updates.ironFe !== undefined) updateData.iron_fe = updates.ironFe;
  if (updates.manganeseMn !== undefined) updateData.manganese_mn = updates.manganeseMn;
  if (updates.zincZn !== undefined) updateData.zinc_zn = updates.zincZn;
  if (updates.copperCu !== undefined) updateData.copper_cu = updates.copperCu;
  if (updates.boronB !== undefined) updateData.boron_b = updates.boronB;
  if (updates.ph !== undefined) updateData.ph = updates.ph;
  if (updates.organicMatterPercent !== undefined) updateData.organic_matter_percent = updates.organicMatterPercent;
  if (updates.organicCarbonPercent !== undefined) updateData.organic_carbon_percent = updates.organicCarbonPercent;
  if (updates.cec !== undefined) updateData.cec = updates.cec;
  if (updates.sandPercent !== undefined) updateData.sand_percent = updates.sandPercent;
  if (updates.siltPercent !== undefined) updateData.silt_percent = updates.siltPercent;
  if (updates.clayPercent !== undefined) updateData.clay_percent = updates.clayPercent;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  // Ricalcola raccomandazioni se ci sono aggiornamenti
  if (Object.keys(updateData).length > 0) {
    const current = await getSoilAnalyses(supabase, { gardenId: updates.gardenId || '' });
    const currentAnalysis = current.find(a => a.id === analysisId);
    if (currentAnalysis) {
      const merged = { ...currentAnalysis, ...updates };
      updateData.recommendations = calculateRecommendations(merged);
    }
  }

  const { data, error } = await supabase
    .from('soil_analysis')
    .update(updateData)
    .eq('id', analysisId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update soil analysis: ${error.message}`);
  }

  return mapSoilAnalysisFromDB(data);
}

/**
 * Elimina analisi suolo
 */
export async function deleteSoilAnalysis(
  supabase: SupabaseClient,
  analysisId: string
): Promise<void> {
  const { error } = await supabase
    .from('soil_analysis')
    .delete()
    .eq('id', analysisId);

  if (error) {
    throw new Error(`Failed to delete soil analysis: ${error.message}`);
  }
}

/**
 * Calcola raccomandazioni basate su carenze rilevate
 */
function calculateRecommendations(
  analysis: Partial<CreateSoilAnalysisInput> | Partial<SoilAnalysis>
): SoilAnalysis['recommendations'] {
  const deficiencies: string[] = [];
  const suggestedFertilizers: Array<{
    product: string;
    dosage: number;
    unit: string;
    reason: string;
  }> = [];

  // Valori ottimali di riferimento (mg/kg o %)
  const optimalValues = {
    nitrogenN: 20, // mg/kg
    phosphorusP: 15, // mg/kg
    potassiumK: 200, // mg/kg
    ironFe: 5, // mg/kg
    manganeseMn: 10, // mg/kg
    zincZn: 2, // mg/kg
    copperCu: 1, // mg/kg
    boronB: 0.5, // mg/kg
    organicMatterPercent: 3, // %
    ph: { min: 6.0, max: 7.0 } // Range ottimale
  };

  // Verifica carenze macro-nutrienti
  if (analysis.nitrogenN !== undefined && analysis.nitrogenN < optimalValues.nitrogenN) {
    deficiencies.push('Azoto (N)');
    suggestedFertilizers.push({
      product: 'Concime azotato (es. Nitrato ammonico)',
      dosage: (optimalValues.nitrogenN - analysis.nitrogenN) * 2, // Stima dosaggio
      unit: 'g/m²',
      reason: `Carenza azoto: ${analysis.nitrogenN.toFixed(1)} mg/kg (ottimale: ${optimalValues.nitrogenN} mg/kg)`
    });
  }

  if (analysis.phosphorusP !== undefined && analysis.phosphorusP < optimalValues.phosphorusP) {
    deficiencies.push('Fosforo (P)');
    suggestedFertilizers.push({
      product: 'Concime fosfatico (es. Perfosfato)',
      dosage: (optimalValues.phosphorusP - analysis.phosphorusP) * 1.5,
      unit: 'g/m²',
      reason: `Carenza fosforo: ${analysis.phosphorusP.toFixed(1)} mg/kg (ottimale: ${optimalValues.phosphorusP} mg/kg)`
    });
  }

  if (analysis.potassiumK !== undefined && analysis.potassiumK < optimalValues.potassiumK) {
    deficiencies.push('Potassio (K)');
    suggestedFertilizers.push({
      product: 'Concime potassico (es. Solfato di potassio)',
      dosage: (optimalValues.potassiumK - analysis.potassiumK) * 0.5,
      unit: 'g/m²',
      reason: `Carenza potassio: ${analysis.potassiumK.toFixed(1)} mg/kg (ottimale: ${optimalValues.potassiumK} mg/kg)`
    });
  }

  // Verifica carenze micro-nutrienti
  if (analysis.ironFe !== undefined && analysis.ironFe < optimalValues.ironFe) {
    deficiencies.push('Ferro (Fe)');
    suggestedFertilizers.push({
      product: 'Chelato di ferro',
      dosage: 10,
      unit: 'g/m²',
      reason: `Carenza ferro: ${analysis.ironFe.toFixed(1)} mg/kg`
    });
  }

  if (analysis.zincZn !== undefined && analysis.zincZn < optimalValues.zincZn) {
    deficiencies.push('Zinco (Zn)');
    suggestedFertilizers.push({
      product: 'Solfato di zinco',
      dosage: 5,
      unit: 'g/m²',
      reason: `Carenza zinco: ${analysis.zincZn.toFixed(1)} mg/kg`
    });
  }

  // Verifica pH
  if (analysis.ph !== undefined) {
    if (analysis.ph < optimalValues.ph.min) {
      deficiencies.push('pH troppo basso');
      suggestedFertilizers.push({
        product: 'Calce agricola',
        dosage: (optimalValues.ph.min - analysis.ph) * 200,
        unit: 'g/m²',
        reason: `pH ${analysis.ph.toFixed(1)} troppo acido (ottimale: ${optimalValues.ph.min}-${optimalValues.ph.max})`
      });
    } else if (analysis.ph > optimalValues.ph.max) {
      deficiencies.push('pH troppo alto');
      suggestedFertilizers.push({
        product: 'Zolfo elementare',
        dosage: (analysis.ph - optimalValues.ph.max) * 100,
        unit: 'g/m²',
        reason: `pH ${analysis.ph.toFixed(1)} troppo basico`
      });
    }
  }

  // Verifica materia organica
  if (analysis.organicMatterPercent !== undefined && analysis.organicMatterPercent < optimalValues.organicMatterPercent) {
    deficiencies.push('Materia organica');
    suggestedFertilizers.push({
      product: 'Compost o letame maturo',
      dosage: (optimalValues.organicMatterPercent - analysis.organicMatterPercent) * 10,
      unit: 'kg/m²',
      reason: `Materia organica ${analysis.organicMatterPercent.toFixed(1)}% (ottimale: ${optimalValues.organicMatterPercent}%)`
    });
  }

  return {
    deficiencies,
    suggestedFertilizers
  };
}

/**
 * Mappa dati da database a tipo TypeScript
 */
function mapSoilAnalysisFromDB(db: any): SoilAnalysis {
  return {
    id: db.id,
    zoneId: db.zone_id,
    gardenId: db.garden_id,
    analysisDate: db.analysis_date,
    labName: db.lab_name,
    analysisType: db.analysis_type || 'basic',
    nitrogenN: db.nitrogen_n ? Number(db.nitrogen_n) : undefined,
    phosphorusP: db.phosphorus_p ? Number(db.phosphorus_p) : undefined,
    potassiumK: db.potassium_k ? Number(db.potassium_k) : undefined,
    ironFe: db.iron_fe ? Number(db.iron_fe) : undefined,
    manganeseMn: db.manganese_mn ? Number(db.manganese_mn) : undefined,
    zincZn: db.zinc_zn ? Number(db.zinc_zn) : undefined,
    copperCu: db.copper_cu ? Number(db.copper_cu) : undefined,
    boronB: db.boron_b ? Number(db.boron_b) : undefined,
    ph: db.ph ? Number(db.ph) : undefined,
    organicMatterPercent: db.organic_matter_percent ? Number(db.organic_matter_percent) : undefined,
    organicCarbonPercent: db.organic_carbon_percent ? Number(db.organic_carbon_percent) : undefined,
    cec: db.cec ? Number(db.cec) : undefined,
    sandPercent: db.sand_percent ? Number(db.sand_percent) : undefined,
    siltPercent: db.silt_percent ? Number(db.silt_percent) : undefined,
    clayPercent: db.clay_percent ? Number(db.clay_percent) : undefined,
    notes: db.notes,
    recommendations: db.recommendations,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

const TEXTURE_HYDRAULIC_BASELINES: Record<
  SoilTextureClass,
  {
    fieldCapacityVolumetricPercent: number;
    wiltingPointVolumetricPercent: number;
    estimatedInfiltrationRateMmh: number;
  }
> = {
  sand: { fieldCapacityVolumetricPercent: 12, wiltingPointVolumetricPercent: 5, estimatedInfiltrationRateMmh: 26 },
  sandy_loam: { fieldCapacityVolumetricPercent: 18, wiltingPointVolumetricPercent: 8, estimatedInfiltrationRateMmh: 18 },
  loam: { fieldCapacityVolumetricPercent: 27, wiltingPointVolumetricPercent: 12, estimatedInfiltrationRateMmh: 12 },
  silt_loam: { fieldCapacityVolumetricPercent: 31, wiltingPointVolumetricPercent: 14, estimatedInfiltrationRateMmh: 9 },
  clay_loam: { fieldCapacityVolumetricPercent: 34, wiltingPointVolumetricPercent: 18, estimatedInfiltrationRateMmh: 6 },
  clay: { fieldCapacityVolumetricPercent: 40, wiltingPointVolumetricPercent: 24, estimatedInfiltrationRateMmh: 3.5 },
};

export function calculateSoilHydraulicProfile(
  analysis: SoilAnalysis | null | undefined,
  options?: {
    rootZoneDepthCm?: number;
    rootDepthSource?: 'crop_profile' | 'user_override' | 'default';
    zone?: Pick<IrrigationZone, 'drainageQuality' | 'waterRetention' | 'slopePercentage' | 'soilType'> | null;
    waterQualityProfile?: IrrigationWaterQualityProfile | null;
  }
): SoilHydraulicProfile | null {
  if (!analysis) {
    return null;
  }

  const notes: string[] = [];
  const textureClass = classifyTextureClass(
    analysis.sandPercent,
    analysis.siltPercent,
    analysis.clayPercent,
    notes
  );
  const baseline = TEXTURE_HYDRAULIC_BASELINES[textureClass];
  const organicMatterPercent = analysis.organicMatterPercent ?? 2.5;
  const cec = analysis.cec ?? 15;
  const zone = options?.zone;
  const waterQualityProfile = options?.waterQualityProfile;
  const textureMeasured =
    analysis.sandPercent !== undefined ||
    analysis.siltPercent !== undefined ||
    analysis.clayPercent !== undefined;
  const organicMatterMeasured = analysis.organicMatterPercent !== undefined;
  const cecMeasured = analysis.cec !== undefined;
  const phMeasured = analysis.ph !== undefined;
  const rootZoneDepthCm = roundTo(clamp(options?.rootZoneDepthCm ?? 45, 20, 140), 0);
  const rootDepthSource = options?.rootDepthSource || 'default';
  const waterRetentionModifier =
    zone?.waterRetention === 'high' ? 1.6 : zone?.waterRetention === 'low' ? -1.8 : 0;
  const drainageModifier =
    zone?.drainageQuality === 'excellent'
      ? 2.2
      : zone?.drainageQuality === 'poor'
        ? -2.4
        : zone?.drainageQuality === 'fair'
          ? -1
          : 0;
  const slopeDepthPenalty =
    typeof zone?.slopePercentage === 'number' && zone.slopePercentage >= 12
      ? 0.08
      : typeof zone?.slopePercentage === 'number' && zone.slopePercentage >= 6
        ? 0.04
        : 0;

  const organicMatterModifier = clamp((organicMatterPercent - 2.5) * 0.8, -2.5, 4);
  const cecModifier = cec >= 25 ? 1.5 : cec <= 8 ? -1 : 0;
  const fieldCapacityVolumetricPercent = roundTo(
    clamp(
      baseline.fieldCapacityVolumetricPercent + organicMatterModifier + cecModifier + waterRetentionModifier,
      baseline.wiltingPointVolumetricPercent + 6,
      48
    ),
    1
  );
  const wiltingPointVolumetricPercent = roundTo(
    clamp(
      baseline.wiltingPointVolumetricPercent + organicMatterModifier * 0.45 + (textureClass === 'clay' ? 1 : 0),
      4,
      fieldCapacityVolumetricPercent - 4
    ),
    1
  );
  const availableWaterHoldingMmPerMeter = roundTo(
    (fieldCapacityVolumetricPercent - wiltingPointVolumetricPercent) * 10,
    0
  );
  const estimatedInfiltrationRateMmh = roundTo(
    clamp(
      baseline.estimatedInfiltrationRateMmh +
        clamp((organicMatterPercent - 2.5) * 0.7, -2, 4) +
        drainageModifier,
      2.5,
      30
    ),
    1
  );
  const compactionRisk = deriveCompactionRisk(textureClass, organicMatterPercent, cec);
  const drainageClass = deriveDrainageClass(estimatedInfiltrationRateMmh, textureClass);
  const effectiveRootableDepthCm = roundTo(
    clamp(
      rootZoneDepthCm *
        (compactionRisk === 'high'
          ? 0.74
          : compactionRisk === 'medium'
            ? 0.84
            : drainageClass === 'slow'
              ? 0.9
              : 1),
      20,
      rootZoneDepthCm
    ),
    0
  );
  const salinityPressureIndex = deriveSalinityPressureIndex(
    waterQualityProfile,
    analysis.ph,
    phMeasured
  );
  const effectiveRootableDepthAdjustedCm = roundTo(
    clamp(
      effectiveRootableDepthCm * (1 - slopeDepthPenalty) *
        (salinityPressureIndex >= 75 ? 0.88 : salinityPressureIndex >= 45 ? 0.94 : 1),
      20,
      rootZoneDepthCm
    ),
    0
  );
  const salinityAccumulationRisk = deriveSalinityAccumulationRisk(
    textureClass,
    estimatedInfiltrationRateMmh,
    compactionRisk,
    analysis.ph,
    salinityPressureIndex
  );
  const drainageConstraintFactor = roundTo(
    drainageClass === 'slow' ? 1.16 : drainageClass === 'moderate' ? 1.06 : 0.96,
    2
  );
  const compactionConstraintFactor = roundTo(
    compactionRisk === 'high' ? 1.18 : compactionRisk === 'medium' ? 1.08 : 1,
    2
  );
  const effectiveStorageFraction = roundTo(
    salinityAccumulationRisk === 'high'
      ? 0.38
      : compactionRisk === 'high' || drainageClass === 'slow'
        ? 0.42
        : compactionRisk === 'medium' || drainageClass === 'moderate'
          ? 0.5
          : 0.58,
    2
  );
  const refillTriggerThresholdPercent = roundTo(
    salinityAccumulationRisk === 'high' ? 42 : compactionRisk === 'high' ? 46 : 52,
    0
  );
  const refillEventTargetMm = roundTo(
    Math.max(
      6,
      (availableWaterHoldingMmPerMeter * (effectiveRootableDepthAdjustedCm / 100)) * effectiveStorageFraction
    ),
    1
  );
  const pulseCountSuggestion =
    salinityAccumulationRisk === 'high' || compactionRisk === 'high' || drainageClass === 'slow'
      ? 2
      : 1;
  const pulseSplitRecommended = pulseCountSuggestion > 1;
  const hydraulicQuality: SoilHydraulicProfile['hydraulicQuality'] =
    textureMeasured && organicMatterMeasured && cecMeasured
      ? 'measured'
      : textureMeasured || organicMatterMeasured || cecMeasured || phMeasured
        ? 'mixed'
        : 'estimated';
  const fieldCapacitySource: SoilHydraulicProfile['fieldCapacitySource'] =
    textureMeasured || organicMatterMeasured || cecMeasured ? 'measured' : 'estimated';
  const wiltingPointSource: SoilHydraulicProfile['wiltingPointSource'] =
    textureMeasured || organicMatterMeasured ? 'measured' : 'estimated';
  const infiltrationSource: SoilHydraulicProfile['infiltrationSource'] =
    textureMeasured || organicMatterMeasured || zone?.drainageQuality ? 'measured' : 'estimated';

  notes.push(
    `Texture class estimated as ${textureClass.replace('_', ' ')} with root zone depth ${rootZoneDepthCm} cm.`
  );
  notes.push(
    `Estimated hydraulic envelope: FC ${fieldCapacityVolumetricPercent}%, WP ${wiltingPointVolumetricPercent}%, AWH ${availableWaterHoldingMmPerMeter} mm/m.`
  );
  notes.push(
    `Estimated infiltration ${estimatedInfiltrationRateMmh} mm/h; drainage ${drainageClass}; effective rootable depth ${effectiveRootableDepthAdjustedCm} cm; compaction risk ${compactionRisk}.`
  );
  notes.push(`Estimated salinity accumulation risk ${salinityAccumulationRisk}.`);
  notes.push(
    `Hydraulic quality ${hydraulicQuality}; refill target ${refillEventTargetMm} mm/event with trigger near ${refillTriggerThresholdPercent}% depletion.`
  );
  if (pulseSplitRecommended) {
    notes.push(`Pulse split recommended (${pulseCountSuggestion} pulses) due to drainage, compaction or salinity pressure.`);
  }
  if (zone?.drainageQuality || zone?.waterRetention || typeof zone?.slopePercentage === 'number') {
    notes.push(
      `Zone modifiers applied: drainage ${zone?.drainageQuality || 'n/a'}, retention ${zone?.waterRetention || 'n/a'}, slope ${zone?.slopePercentage ?? 0}%.`
    );
  }
  if (salinityPressureIndex > 0) {
    notes.push(`Water-quality salinity pressure index ${salinityPressureIndex}/100 propagated into the soil-water profile.`);
  }

  if (analysis.organicMatterPercent === undefined) {
    notes.push('Organic matter missing: hydraulic adjustment uses a conservative default of 2.5%.');
  }
  if (analysis.cec === undefined) {
    notes.push('CEC missing: structure-related retention adjustment uses a neutral baseline.');
  }

  return {
    textureClass,
    fieldCapacityVolumetricPercent,
    wiltingPointVolumetricPercent,
    availableWaterHoldingMmPerMeter,
    estimatedInfiltrationRateMmh,
    rootZoneDepthCm,
    effectiveRootableDepthCm: effectiveRootableDepthAdjustedCm,
    drainageClass,
    compactionRisk,
    salinityAccumulationRisk,
    hydraulicQuality,
    fieldCapacitySource,
    wiltingPointSource,
    infiltrationSource,
    rootDepthSource,
    effectiveStorageFraction,
    refillTriggerThresholdPercent,
    refillEventTargetMm,
    pulseSplitRecommended,
    pulseCountSuggestion,
    drainageConstraintFactor,
    compactionConstraintFactor,
    salinityPressureIndex,
    source:
      analysis.sandPercent === undefined &&
      analysis.siltPercent === undefined &&
      analysis.clayPercent === undefined
        ? 'estimated_from_partial_analysis'
        : 'soil_analysis',
    notes,
  };
}

function classifyTextureClass(
  sandPercent?: number,
  siltPercent?: number,
  clayPercent?: number,
  notes?: string[]
): SoilTextureClass {
  if (
    sandPercent === undefined &&
    siltPercent === undefined &&
    clayPercent === undefined
  ) {
    notes?.push('Texture fractions missing: using loam baseline as a conservative hydraulic default.');
    return 'loam';
  }

  const sand = sandPercent ?? 40;
  const silt = siltPercent ?? 40;
  const clay = clayPercent ?? Math.max(0, 100 - sand - silt);

  if (clay >= 40) return 'clay';
  if (clay >= 27 && sand <= 45) return 'clay_loam';
  if (silt >= 50 && clay < 27) return 'silt_loam';
  if (sand >= 70 && clay < 15) return 'sand';
  if (sand >= 55 && clay < 20) return 'sandy_loam';
  return 'loam';
}

function deriveCompactionRisk(
  textureClass: SoilTextureClass,
  organicMatterPercent: number,
  cec: number
): 'low' | 'medium' | 'high' | 'unknown' {
  let riskScore = 0;

  if (textureClass === 'clay' || textureClass === 'clay_loam') riskScore += 2;
  if (textureClass === 'silt_loam') riskScore += 1;
  if (organicMatterPercent < 2) riskScore += 1;
  if (organicMatterPercent > 4) riskScore -= 1;
  if (cec > 25) riskScore += 1;

  if (riskScore >= 3) return 'high';
  if (riskScore >= 1) return 'medium';
  return 'low';
}

function deriveDrainageClass(
  infiltrationRateMmh: number,
  textureClass: SoilTextureClass
): 'free' | 'moderate' | 'slow' {
  if (infiltrationRateMmh <= 6 || textureClass === 'clay') return 'slow';
  if (infiltrationRateMmh >= 15 && (textureClass === 'sand' || textureClass === 'sandy_loam')) {
    return 'free';
  }
  return 'moderate';
}

function deriveSalinityAccumulationRisk(
  textureClass: SoilTextureClass,
  infiltrationRateMmh: number,
  compactionRisk: 'low' | 'medium' | 'high' | 'unknown',
  ph?: number,
  salinityPressureIndex?: number
): 'low' | 'medium' | 'high' {
  let riskScore = 0;

  if (textureClass === 'clay' || textureClass === 'clay_loam') riskScore += 2;
  if (infiltrationRateMmh < 7) riskScore += 2;
  if (compactionRisk === 'medium') riskScore += 1;
  if (compactionRisk === 'high') riskScore += 2;
  if (typeof ph === 'number' && ph >= 7.8) riskScore += 1;
  if (typeof salinityPressureIndex === 'number' && salinityPressureIndex >= 70) riskScore += 2;
  if (typeof salinityPressureIndex === 'number' && salinityPressureIndex >= 45) riskScore += 1;

  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

function deriveSalinityPressureIndex(
  waterQualityProfile?: IrrigationWaterQualityProfile | null,
  soilPh?: number,
  soilPhMeasured?: boolean
): number {
  if (!waterQualityProfile && typeof soilPh !== 'number') {
    return 0;
  }

  let pressure = 0;

  if (waterQualityProfile?.qualityBand === 'critical') pressure += 45;
  else if (waterQualityProfile?.qualityBand === 'caution') pressure += 25;
  else if (waterQualityProfile?.qualityBand === 'acceptable') pressure += 10;

  if (waterQualityProfile?.salinity?.value) {
    pressure += waterQualityProfile.salinity.value >= 2.2
      ? 35
      : waterQualityProfile.salinity.value >= 1.3
        ? 22
        : waterQualityProfile.salinity.value >= 0.8
          ? 10
          : 0;
  }

  if (waterQualityProfile?.bicarbonates?.value) {
    pressure += waterQualityProfile.bicarbonates.value >= 3.5
      ? 15
      : waterQualityProfile.bicarbonates.value >= 2
        ? 8
        : 0;
  }

  if (typeof soilPh === 'number' && soilPhMeasured && soilPh >= 7.8) {
    pressure += 10;
  }

  return clamp(Math.round(pressure), 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
