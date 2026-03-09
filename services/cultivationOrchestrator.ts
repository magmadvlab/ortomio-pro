/**
 * ORCHESTRATORE COLTIVAZIONE ORTOMIO
 *
 * Gestisce il flusso completo dalla pianificazione alla raccolta
 * Coordina le diverse banche (semi, piantine, alberelli) in base al tipo di giardino
 *
 * INTEGRAZIONE DAILY DIARY:
 * L'orchestratore ora si integra con il DailyDiaryService per:
 * - Registrare automaticamente eventi di fase nel diario
 * - Utilizzare previsioni GDD per stime più accurate
 * - Generare raccomandazioni basate su dati storici
 */

import { getSupabaseClient } from '../config/supabase';
import { dailyDiaryService, type DiaryEvent } from './dailyDiaryService';
import { diaryPredictiveEngine, type CropPrediction, type ActionRecommendation } from './diaryPredictiveEngine';

// Tipi di giardino supportati
export type GardenType = 
  | 'OpenField'      // Orto tradizionale
  | 'Greenhouse'     // Serra
  | 'Tunnel'         // Tunnel
  | 'RaisedBed'      // Aiuole rialzate
  | 'Indoor'         // Coltivazione indoor
  | 'Hydroponic'     // Idroponica
  | 'Aquaponic'      // Acquaponica
  | 'Orchard'        // Frutteto
  | 'Vineyard'       // Vigneto
  | 'OliveGrove';    // Oliveto

// Tipi di materiale di partenza
export type StartingMaterial = 
  | 'seed'           // Semi (dalla banca semi)
  | 'seedling'       // Piantine (dal vivaio/acquistate)
  | 'sapling'        // Alberelli (per frutteti/oliveti)
  | 'cutting'        // Talee
  | 'bulb';          // Bulbi

// Categorie di archetipi
export type ArchetypeCategory = 
  | 'vegetable'      // A1-A9: Ortaggi
  | 'aromatic'       // A10: Aromatiche
  | 'berry'          // A11: Piccoli frutti
  | 'tree';          // A12: Colture legnose

// Fasi del ciclo di coltivazione
export type CultivationPhase = 
  | 'planning'       // Pianificazione
  | 'preparation'    // Preparazione materiale
  | 'sowing'         // Semina
  | 'germination'    // Germinazione
  | 'nursing'        // Allevamento piantine
  | 'hardening'      // Indurimento
  | 'transplanting'  // Trapianto
  | 'growing'        // Crescita
  | 'flowering'      // Fioritura
  | 'fruiting'       // Fruttificazione
  | 'harvesting'     // Raccolta
  | 'composting';    // Smaltimento/compostaggio

interface CultivationPlan {
  id: string;
  gardenId: string;
  gardenType: GardenType;
  archetypeId: string;
  archetypeCategory: ArchetypeCategory;
  plantName: string;
  varietyName?: string;
  startingMaterial: StartingMaterial;
  currentPhase: CultivationPhase;
  plannedStartDate: Date;
  estimatedHarvestDate: Date;
  
  // Riferimenti alle banche
  seedInventoryId?: string;      // Se parte da seme
  seedlingBatchId?: string;      // Se parte da piantina
  saplingInventoryId?: string;   // Se parte da alberello
  
  // Tracking del ciclo
  phaseHistory: PhaseRecord[];
  currentLocation: string;       // Indoor/Greenhouse/Garden
  
  // Metadati
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PhaseRecord {
  phase: CultivationPhase;
  startDate: Date;
  endDate?: Date;
  location: string;
  quantity: number;
  notes?: string;
  photos?: string[];
}

export class CultivationOrchestrator {
  
  /**
   * STEP 1: Determina materiali disponibili per un archetipo
   */
  static async getAvailableMaterials(
    gardenId: string, 
    archetypeId: string
  ): Promise<{
    seeds: any[];
    seedlings: any[];
    saplings: any[];
    recommendedMaterial: StartingMaterial;
  }> {
    
    // Ottieni tipo di giardino
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const { data: garden } = await supabase
      .from('gardens')
      .select('garden_type')
      .eq('id', gardenId)
      .single();
    
    const gardenType = garden?.garden_type as GardenType;
    const archetypeCategory = this.getArchetypeCategory(archetypeId);
    
    // Cerca materiali disponibili
    const [seedsResult, seedlingsResult, saplingsResult] = await Promise.all([
      this.getAvailableSeeds(gardenId, archetypeId),
      this.getAvailableSeedlings(gardenId, archetypeId),
      this.getAvailableSaplings(gardenId, archetypeId)
    ]);
    
    // Determina materiale raccomandato
    const recommendedMaterial = this.getRecommendedMaterial(
      gardenType, 
      archetypeCategory,
      seedsResult.length > 0,
      seedlingsResult.length > 0,
      saplingsResult.length > 0
    );
    
    return {
      seeds: seedsResult,
      seedlings: seedlingsResult,
      saplings: saplingsResult,
      recommendedMaterial
    };
  }
  
  /**
   * STEP 2: Crea piano di coltivazione
   */
  static async createCultivationPlan(params: {
    gardenId: string;
    archetypeId: string;
    plantName: string;
    varietyName?: string;
    startingMaterial: StartingMaterial;
    materialId?: string; // ID del seme/piantina/alberello
    quantity: number;
    plannedStartDate: Date;
  }): Promise<CultivationPlan> {
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const { data: garden } = await supabase
      .from('gardens')
      .select('garden_type')
      .eq('id', params.gardenId)
      .single();
    
    const gardenType = garden?.garden_type as GardenType;
    const archetypeCategory = this.getArchetypeCategory(params.archetypeId);
    
    // Calcola date stimate
    const estimatedHarvestDate = this.calculateHarvestDate(
      params.archetypeId,
      params.startingMaterial,
      params.plannedStartDate
    );
    
    // Determina fase iniziale e location
    const { initialPhase, initialLocation } = this.getInitialPhaseAndLocation(
      params.startingMaterial,
      gardenType
    );
    
    // Crea piano
    const plan: CultivationPlan = {
      id: crypto.randomUUID(),
      gardenId: params.gardenId,
      gardenType,
      archetypeId: params.archetypeId,
      archetypeCategory,
      plantName: params.plantName,
      varietyName: params.varietyName,
      startingMaterial: params.startingMaterial,
      currentPhase: initialPhase,
      plannedStartDate: params.plannedStartDate,
      estimatedHarvestDate,
      phaseHistory: [{
        phase: initialPhase,
        startDate: params.plannedStartDate,
        location: initialLocation,
        quantity: params.quantity
      }],
      currentLocation: initialLocation,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Collega alle banche appropriate
    if (params.startingMaterial === 'seed' && params.materialId) {
      plan.seedInventoryId = params.materialId;
      await this.consumeFromSeedBank(params.materialId, params.quantity);
    } else if (params.startingMaterial === 'seedling' && params.materialId) {
      plan.seedlingBatchId = params.materialId;
    } else if (params.startingMaterial === 'sapling' && params.materialId) {
      plan.saplingInventoryId = params.materialId;
    }
    
    // Salva nel database
    await this.saveCultivationPlan(plan);
    
    return plan;
  }
  
  /**
   * STEP 3: Avanza fase di coltivazione
   */
  static async advancePhase(
    planId: string,
    newPhase: CultivationPhase,
    params: {
      location?: string;
      quantity?: number;
      notes?: string;
      photos?: string[];
      userId?: string; // Per registrazione diario
    }
  ): Promise<CultivationPlan> {

    const plan = await this.getCultivationPlan(planId);
    if (!plan) throw new Error('Piano non trovato');

    const oldPhase = plan.currentPhase;

    // Chiudi fase corrente
    const currentPhaseRecord = plan.phaseHistory[plan.phaseHistory.length - 1];
    currentPhaseRecord.endDate = new Date();

    // Aggiungi nuova fase
    const newPhaseRecord: PhaseRecord = {
      phase: newPhase,
      startDate: new Date(),
      location: params.location || plan.currentLocation,
      quantity: params.quantity || currentPhaseRecord.quantity,
      notes: params.notes,
      photos: params.photos
    };

    plan.phaseHistory.push(newPhaseRecord);
    plan.currentPhase = newPhase;
    plan.currentLocation = newPhaseRecord.location;
    plan.updatedAt = new Date();

    // Gestisci transizioni speciali
    await this.handlePhaseTransition(plan, newPhase, params);

    // Salva aggiornamenti
    await this.saveCultivationPlan(plan);

    // INTEGRAZIONE DIARY: Registra evento cambio fase
    if (params.userId) {
      await this.recordPhaseChangeEvent(plan, oldPhase, newPhase, params.userId);
    }

    return plan;
  }
  
  /**
   * Determina categoria archetipo
   */
  private static getArchetypeCategory(archetypeId: string): ArchetypeCategory {
    if (archetypeId.match(/^A[1-9]$/)) return 'vegetable';
    if (archetypeId === 'A10') return 'aromatic';
    if (archetypeId === 'A11') return 'berry';
    if (archetypeId === 'A12' || archetypeId.startsWith('L')) return 'tree';
    return 'vegetable';
  }
  
  /**
   * Determina materiale raccomandato
   */
  private static getRecommendedMaterial(
    gardenType: GardenType,
    archetypeCategory: ArchetypeCategory,
    hasSeeds: boolean,
    hasSeedlings: boolean,
    hasSaplings: boolean
  ): StartingMaterial {
    
    // Frutteti/oliveti: sempre alberelli
    if (archetypeCategory === 'tree') {
      return hasSaplings ? 'sapling' : 'seedling';
    }
    
    // Ortaggi: preferenza semi se disponibili
    if (archetypeCategory === 'vegetable') {
      if (hasSeeds) return 'seed';
      if (hasSeedlings) return 'seedling';
      return 'seed'; // Default anche se non disponibili
    }
    
    // Aromatiche: preferenza piantine
    if (archetypeCategory === 'aromatic') {
      if (hasSeedlings) return 'seedling';
      if (hasSeeds) return 'seed';
      return 'seedling';
    }
    
    // Piccoli frutti: preferenza piantine
    if (archetypeCategory === 'berry') {
      if (hasSeedlings) return 'seedling';
      return 'seedling';
    }
    
    return 'seed';
  }
  
  /**
   * Determina fase iniziale e location
   */
  private static getInitialPhaseAndLocation(
    startingMaterial: StartingMaterial,
    gardenType: GardenType
  ): { initialPhase: CultivationPhase; initialLocation: string } {
    
    switch (startingMaterial) {
      case 'seed':
        return {
          initialPhase: 'sowing',
          initialLocation: gardenType === 'Indoor' ? 'Indoor' : 'Greenhouse'
        };
      
      case 'seedling':
        return {
          initialPhase: 'hardening',
          initialLocation: 'Greenhouse'
        };
      
      case 'sapling':
        return {
          initialPhase: 'transplanting',
          initialLocation: 'Garden'
        };
      
      default:
        return {
          initialPhase: 'preparation',
          initialLocation: 'Indoor'
        };
    }
  }
  
  /**
   * Calcola data raccolta stimata
   */
  private static calculateHarvestDate(
    archetypeId: string,
    startingMaterial: StartingMaterial,
    startDate: Date
  ): Date {
    
    // Giorni base per archetipo (dal seme)
    const baseDays: Record<string, number> = {
      'A1': 90,  // Solanacee
      'A2': 70,  // Cucurbitacee fresche
      'A3': 120, // Cucurbitacee grosse
      'A4': 45,  // Insalate
      'A5': 60,  // Foglie robuste
      'A6': 80,  // Brassiche
      'A7': 120, // Bulbi
      'A8': 90,  // Radici
      'A9': 75,  // Legumi
      'A10': 30, // Aromatiche
      'A11': 365, // Piccoli frutti (primo anno)
      'A12': 1095 // Alberi (3 anni)
    };
    
    let days = baseDays[archetypeId] || 90;
    
    // Riduci se parti da piantina/alberello
    if (startingMaterial === 'seedling') {
      days = Math.max(30, days - 30);
    } else if (startingMaterial === 'sapling') {
      days = Math.max(180, days - 180);
    }
    
    const harvestDate = new Date(startDate);
    harvestDate.setDate(harvestDate.getDate() + days);
    
    return harvestDate;
  }
  
  /**
   * Gestisce transizioni speciali tra fasi
   */
  private static async handlePhaseTransition(
    plan: CultivationPlan,
    newPhase: CultivationPhase,
    params: any
  ): Promise<void> {
    
    switch (newPhase) {
      case 'transplanting':
        // Crea record nel giardino
        await this.createGardenRecord(plan, params);
        break;
      
      case 'harvesting':
        // Registra raccolta
        await this.recordHarvest(plan, params);
        break;
      
      case 'composting':
        // Chiudi ciclo e libera spazio
        await this.completeCycle(plan);
        break;
    }
  }
  
  /**
   * Metodi di supporto per database
   */
  private static async getAvailableSeeds(gardenId: string, archetypeId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const { data } = await supabase
      .from('seed_inventory')
      .select('*')
      .eq('garden_id', gardenId)
      .neq('quantity_remaining', 'Empty');
    
    return data || [];
  }
  
  private static async getAvailableSeedlings(gardenId: string, archetypeId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const { data } = await supabase
      .from('seedling_batches')
      .select('*')
      .eq('garden_id', gardenId)
      .in('phase', ['ReadyToTransplant', 'Hardening']);
    
    return data || [];
  }
  
  private static async getAvailableSaplings(gardenId: string, archetypeId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const { data } = await supabase
      .from('sapling_inventory')
      .select('*')
      .eq('garden_id', gardenId)
      .gt('quantity_available', 0);
    
    return data || [];
  }
  
  private static async consumeFromSeedBank(seedId: string, quantity: number) {
    // La logica di consumo è gestita automaticamente dal trigger
    // Qui potremmo aggiungere validazioni aggiuntive se necessario
    console.log(`Consumo automatico: ${quantity} semi da ${seedId}`);
  }

  private static async resolveGardenOwnerId(gardenId: string): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('gardens')
      .select('user_id')
      .eq('id', gardenId)
      .single();

    if (error) {
      console.error('Errore risoluzione owner garden:', error);
      return null;
    }

    return data?.user_id || null;
  }
  
  private static async saveCultivationPlan(plan: CultivationPlan) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const ownerId = await this.resolveGardenOwnerId(plan.gardenId);
    if (!ownerId) {
      throw new Error(`Impossibile risolvere user_id per garden ${plan.gardenId}`);
    }
    
    const { data, error } = await supabase
      .from('cultivation_plans')
      .insert({
        id: plan.id,
        user_id: ownerId,
        garden_id: plan.gardenId,
        archetype_id: plan.archetypeId,
        archetype_category: plan.archetypeCategory,
        plant_name: plan.plantName,
        variety_name: plan.varietyName,
        starting_material: plan.startingMaterial,
        seed_inventory_id: plan.seedInventoryId,
        seedling_batch_id: plan.seedlingBatchId,
        sapling_inventory_id: plan.saplingInventoryId,
        current_phase: plan.currentPhase,
        current_location: plan.currentLocation,
        current_quantity: plan.phaseHistory[0]?.quantity || 1,
        planned_start_date: plan.plannedStartDate.toISOString().split('T')[0],
        estimated_harvest_date: plan.estimatedHarvestDate.toISOString().split('T')[0],
        phase_history: plan.phaseHistory,
        notes: plan.notes
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Errore nel salvare il piano: ${error.message}`);
    }
    
    return data;
  }
  
  private static async getCultivationPlan(planId: string): Promise<CultivationPlan | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const { data, error } = await supabase
      .from('cultivation_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Converti da database a oggetto CultivationPlan
    return {
      id: data.id,
      gardenId: data.garden_id,
      gardenType: 'OpenField', // TODO: Ottenere da gardens table
      archetypeId: data.archetype_id,
      archetypeCategory: data.archetype_category as ArchetypeCategory,
      plantName: data.plant_name,
      varietyName: data.variety_name,
      startingMaterial: data.starting_material as StartingMaterial,
      currentPhase: data.current_phase as CultivationPhase,
      plannedStartDate: new Date(data.planned_start_date),
      estimatedHarvestDate: new Date(data.estimated_harvest_date),
      seedInventoryId: data.seed_inventory_id,
      seedlingBatchId: data.seedling_batch_id,
      saplingInventoryId: data.sapling_inventory_id,
      phaseHistory: data.phase_history || [],
      currentLocation: data.current_location,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
  
  private static async createGardenRecord(plan: CultivationPlan, params: any) {
    // Crea record in custom_crops quando si trapianta
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const ownerId = await this.resolveGardenOwnerId(plan.gardenId);
    
    const { data, error } = await supabase
      .from('custom_crops')
      .insert({
        user_id: ownerId,
        garden_id: plan.gardenId,
        common_name: plan.plantName,
        scientific_name: plan.varietyName || `${plan.plantName} sp.`,
        family: 'Unknown', // TODO: Derivare da archetipo
        initial_data: {
          cultivation_plan_id: plan.id,
          archetype_id: plan.archetypeId,
          starting_material: plan.startingMaterial,
          transplant_date: new Date().toISOString()
        }
      });
    
    if (error) {
      console.error('Errore nella creazione record giardino:', error);
    }
  }
  
  private static async recordHarvest(plan: CultivationPlan, params: any) {
    // Registra raccolta dettagliata
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const { data, error } = await supabase
      .from('detailed_harvests')
      .insert({
        cultivation_plan_id: plan.id,
        harvest_date: new Date().toISOString().split('T')[0],
        quantity_harvested: params.quantity || 0,
        unit_of_measure: params.unit || 'kg',
        quality_grade: params.quality || 'good',
        plant_health: params.health || 'good',
        destination: params.destination || 'consumption',
        notes: params.notes
      });
    
    if (error) {
      console.error('Errore nella registrazione raccolta:', error);
    }
  }
  
  private static async completeCycle(plan: CultivationPlan) {
    // Chiudi piano e calcola statistiche
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    await supabase
      .from('cultivation_plans')
      .update({ is_active: false })
      .eq('id', plan.id);

    // Trigger automatico calcolerà le statistiche
  }

  // ==========================================================================
  // INTEGRAZIONE DAILY DIARY
  // ==========================================================================

  /**
   * Registra evento di cambio fase nel diario
   */
  private static async recordPhaseChangeEvent(
    plan: CultivationPlan,
    oldPhase: CultivationPhase,
    newPhase: CultivationPhase,
    userId: string
  ): Promise<void> {
    try {
      await dailyDiaryService.recordManualEvent({
        user_id: userId,
        cultivation_id: plan.id,
        event_date: new Date().toISOString().split('T')[0],
        event_type: 'phase_change',
        severity: 'info',
        title: `Cambio fase: ${this.translatePhase(oldPhase)} → ${this.translatePhase(newPhase)}`,
        description: `La coltivazione "${plan.plantName}" è passata dalla fase ${this.translatePhase(oldPhase)} alla fase ${this.translatePhase(newPhase)}.`,
        parameters_affected: ['phenological_stage', 'growth_rate'],
        resolved: true
      });
    } catch (err) {
      console.error('Errore registrazione evento fase:', err);
    }
  }

  /**
   * Traduce fase in italiano
   */
  private static translatePhase(phase: CultivationPhase): string {
    const translations: Record<CultivationPhase, string> = {
      planning: 'Pianificazione',
      preparation: 'Preparazione',
      sowing: 'Semina',
      germination: 'Germinazione',
      nursing: 'Allevamento',
      hardening: 'Indurimento',
      transplanting: 'Trapianto',
      growing: 'Crescita',
      flowering: 'Fioritura',
      fruiting: 'Fruttificazione',
      harvesting: 'Raccolta',
      composting: 'Compostaggio'
    };
    return translations[phase] || phase;
  }

  /**
   * Ottiene previsioni dettagliate per una coltivazione
   */
  static async getCultivationPrediction(
    userId: string,
    planId: string
  ): Promise<CropPrediction | null> {
    try {
      return await diaryPredictiveEngine.generateCropPrediction(userId, planId);
    } catch (err) {
      console.error('Errore generazione previsione:', err);
      return null;
    }
  }

  /**
   * Ottiene raccomandazioni giornaliere per tutte le coltivazioni
   */
  static async getDailyRecommendations(userId: string): Promise<ActionRecommendation[]> {
    try {
      return await diaryPredictiveEngine.generateDailyRecommendations(userId);
    } catch (err) {
      console.error('Errore generazione raccomandazioni:', err);
      return [];
    }
  }

  /**
   * Esegue registrazione giornaliera automatica
   * Da chiamare ogni giorno (tramite cron o manualmente)
   */
  static async runDailyDiaryRegistration(userId: string, date?: string): Promise<{
    success: boolean;
    weatherLog: any;
    cultivationsUpdated: number;
    eventsGenerated: number;
    errors: string[];
  }> {
    try {
      const result = await dailyDiaryService.runDailyRegistration(userId, date);
      return {
        success: result.errors.length === 0,
        weatherLog: result.weatherLog,
        cultivationsUpdated: result.cultivationsUpdated,
        eventsGenerated: result.eventsGenerated,
        errors: result.errors
      };
    } catch (err) {
      return {
        success: false,
        weatherLog: null,
        cultivationsUpdated: 0,
        eventsGenerated: 0,
        errors: [String(err)]
      };
    }
  }

  /**
   * Calcola data raccolta più precisa usando GDD accumulati
   */
  static async getImprovedHarvestEstimate(
    userId: string,
    planId: string
  ): Promise<{ date: string; confidence: number; daysRemaining: number } | null> {
    try {
      const prediction = await this.getCultivationPrediction(userId, planId);
      if (!prediction) return null;

      const harvestDate = new Date(prediction.predicted_harvest_date);
      const today = new Date();
      const daysRemaining = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        date: prediction.predicted_harvest_date,
        confidence: prediction.confidence,
        daysRemaining: Math.max(0, daysRemaining)
      };
    } catch (err) {
      console.error('Errore stima raccolta:', err);
      return null;
    }
  }

  /**
   * Confronta performance anno su anno per una coltivazione
   */
  static async getYearOverYearAnalysis(
    userId: string,
    planId: string,
    years?: number[]
  ): Promise<{
    comparisons: any[];
    analysis: string;
    bestYear: number;
    recommendations: string[];
  }> {
    try {
      return await diaryPredictiveEngine.compareYears(userId, planId, years);
    } catch (err) {
      console.error('Errore confronto annate:', err);
      return {
        comparisons: [],
        analysis: 'Errore nel recupero dati',
        bestYear: new Date().getFullYear(),
        recommendations: []
      };
    }
  }

  /**
   * Ottieni riassunto del diario per un periodo
   */
  static async getDiarySummary(
    userId: string,
    startDate: string,
    endDate: string,
    cultivationId?: string
  ): Promise<{
    totalDays: number;
    weatherSummary: {
      avgTemp: number;
      totalPrecipitation: number;
      stressDays: number;
    };
    events: DiaryEvent[];
    gddAccumulated: number;
  }> {
    try {
      const entries = await dailyDiaryService.getDiaryEntries(userId, startDate, endDate, cultivationId);

      const weatherSummary = {
        avgTemp: entries.weather.length > 0
          ? entries.weather.reduce((sum, w) => sum + w.temp_avg, 0) / entries.weather.length
          : 0,
        totalPrecipitation: entries.weather.reduce((sum, w) => sum + w.precipitation_mm, 0),
        stressDays: entries.tracking.filter(t =>
          t.cold_stress_index > 0.5 || t.heat_stress_index > 0.5 || t.water_stress_index > 0.5
        ).length
      };

      const lastTracking = entries.tracking[entries.tracking.length - 1];
      const firstTracking = entries.tracking[0];
      const gddAccumulated = lastTracking && firstTracking
        ? lastTracking.accumulated_gdd - (firstTracking.accumulated_gdd - firstTracking.daily_gdd)
        : 0;

      return {
        totalDays: entries.weather.length,
        weatherSummary: {
          avgTemp: Math.round(weatherSummary.avgTemp * 10) / 10,
          totalPrecipitation: Math.round(weatherSummary.totalPrecipitation),
          stressDays: weatherSummary.stressDays
        },
        events: entries.events,
        gddAccumulated: Math.round(gddAccumulated)
      };
    } catch (err) {
      console.error('Errore riassunto diario:', err);
      return {
        totalDays: 0,
        weatherSummary: { avgTemp: 0, totalPrecipitation: 0, stressDays: 0 },
        events: [],
        gddAccumulated: 0
      };
    }
  }
}

/**
 * HOOK REACT PER L'ORCHESTRATORE
 */
export function useCultivationOrchestrator(gardenId: string, userId?: string) {

  const getAvailableMaterials = async (archetypeId: string) => {
    return CultivationOrchestrator.getAvailableMaterials(gardenId, archetypeId);
  };

  const createPlan = async (params: any) => {
    return CultivationOrchestrator.createCultivationPlan({
      ...params,
      gardenId
    });
  };

  const advancePhase = async (planId: string, newPhase: CultivationPhase, params: any) => {
    return CultivationOrchestrator.advancePhase(planId, newPhase, { ...params, userId });
  };

  // NUOVE FUNZIONI INTEGRAZIONE DIARY

  const runDailyRegistration = async (date?: string) => {
    if (!userId) throw new Error('userId richiesto per registrazione diario');
    return CultivationOrchestrator.runDailyDiaryRegistration(userId, date);
  };

  const getCultivationPrediction = async (planId: string) => {
    if (!userId) throw new Error('userId richiesto per previsioni');
    return CultivationOrchestrator.getCultivationPrediction(userId, planId);
  };

  const getDailyRecommendations = async () => {
    if (!userId) throw new Error('userId richiesto per raccomandazioni');
    return CultivationOrchestrator.getDailyRecommendations(userId);
  };

  const getHarvestEstimate = async (planId: string) => {
    if (!userId) throw new Error('userId richiesto per stima raccolta');
    return CultivationOrchestrator.getImprovedHarvestEstimate(userId, planId);
  };

  const getYearComparison = async (planId: string, years?: number[]) => {
    if (!userId) throw new Error('userId richiesto per confronto annate');
    return CultivationOrchestrator.getYearOverYearAnalysis(userId, planId, years);
  };

  const getDiarySummary = async (startDate: string, endDate: string, cultivationId?: string) => {
    if (!userId) throw new Error('userId richiesto per riassunto diario');
    return CultivationOrchestrator.getDiarySummary(userId, startDate, endDate, cultivationId);
  };

  return {
    // Funzioni originali
    getAvailableMaterials,
    createPlan,
    advancePhase,
    // Nuove funzioni Diary
    runDailyRegistration,
    getCultivationPrediction,
    getDailyRecommendations,
    getHarvestEstimate,
    getYearComparison,
    getDiarySummary
  };
}
