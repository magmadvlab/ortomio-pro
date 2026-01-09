/**
 * Soil Analysis Service
 * Gestisce analisi suolo avanzate per agricoltura di precisione
 */

import { SupabaseClient } from '@supabase/supabase-js';

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







