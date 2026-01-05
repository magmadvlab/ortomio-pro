/**
 * ORCHESTRATORE COLTIVAZIONE ORTOMIO
 * 
 * Gestisce il flusso completo dalla pianificazione alla raccolta
 * Coordina le diverse banche (semi, piantine, alberelli) in base al tipo di giardino
 */

import { supabase } from '../lib/supabase';

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
    }
  ): Promise<CultivationPlan> {
    
    const plan = await this.getCultivationPlan(planId);
    if (!plan) throw new Error('Piano non trovato');
    
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
    const { data } = await supabase
      .from('seed_inventory')
      .select('*')
      .eq('garden_id', gardenId)
      .neq('quantity_remaining', 'Empty');
    
    return data || [];
  }
  
  private static async getAvailableSeedlings(gardenId: string, archetypeId: string) {
    const { data } = await supabase
      .from('seedling_batches')
      .select('*')
      .eq('garden_id', gardenId)
      .in('phase', ['ReadyToTransplant', 'Hardening']);
    
    return data || [];
  }
  
  private static async getAvailableSaplings(gardenId: string, archetypeId: string) {
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
  
  private static async saveCultivationPlan(plan: CultivationPlan) {
    const { data, error } = await supabase
      .from('cultivation_plans')
      .insert({
        id: plan.id,
        user_id: plan.gardenId, // TODO: Ottenere user_id corretto
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
    const { data, error } = await supabase
      .from('custom_crops')
      .insert({
        user_id: plan.gardenId, // TODO: Ottenere user_id corretto
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
    await supabase
      .from('cultivation_plans')
      .update({ is_active: false })
      .eq('id', plan.id);
    
    // Trigger automatico calcolerà le statistiche
  }
}

/**
 * HOOK REACT PER L'ORCHESTRATORE
 */
export function useCultivationOrchestrator(gardenId: string) {
  
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
    return CultivationOrchestrator.advancePhase(planId, newPhase, params);
  };
  
  return {
    getAvailableMaterials,
    createPlan,
    advancePhase
  };
}