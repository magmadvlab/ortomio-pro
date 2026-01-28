// =====================================================
// PLANT LIFECYCLE TRACKING TYPES
// Tipi per tracciamento automatico ciclo vita piante
// =====================================================

export type PlantLifecycleStatus = 
  | 'seed'           // Seme piantato
  | 'germinating'    // In germinazione
  | 'seedling'       // Piantina germinata
  | 'transplanted'   // Trapiantata
  | 'growing'        // In crescita
  | 'flowering'      // In fioritura
  | 'fruiting'       // In fruttificazione
  | 'harvesting'     // In raccolta
  | 'finished';      // Ciclo terminato

export type NotificationType = 
  | 'germination'    // Pronta per germinazione
  | 'transplant'     // Pronta per trapianto
  | 'harvest'        // Pronta per raccolta
  | 'end_cycle';     // Fine ciclo

export interface PlantLifecycleEvent {
  id: string;
  user_id: string;
  garden_id: string;
  
  // Location tracking
  zone_id?: string;
  field_row_id?: string;
  field_row_section_id?: string;
  
  // Dati coltura
  crop_name: string;
  crop_variety?: string;
  plant_count: number;
  
  // Date ciclo vita
  seeding_date: string; // ISO date
  germination_date?: string;
  transplant_date?: string;
  first_flower_date?: string;
  first_fruit_date?: string;
  first_harvest_date?: string;
  last_harvest_date?: string;
  end_of_cycle_date?: string;
  
  // Stati calcolati
  current_status: PlantLifecycleStatus;
  days_since_seeding?: number;
  
  // Dati varietà (da crop database)
  expected_germination_days?: number;
  expected_transplant_days?: number;
  expected_maturity_days?: number;
  expected_harvest_duration_days?: number;
  
  // Notifiche
  notification_sent_germination: boolean;
  notification_sent_transplant: boolean;
  notification_sent_harvest: boolean;
  notification_sent_end_cycle: boolean;
  
  // Metriche
  germination_rate?: number; // Percentuale germinazione
  actual_yield_kg?: number; // Resa effettiva
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CropVariety {
  id: string;
  
  // Identificazione
  crop_name: string;
  variety_name?: string;
  scientific_name?: string;
  crop_family?: string; // Solanaceae, Brassicaceae, etc.
  
  // Tempi ciclo vita (giorni)
  germination_days_min: number;
  germination_days_max: number;
  germination_days_avg?: number;
  
  transplant_days_min?: number;
  transplant_days_max?: number;
  transplant_days_avg?: number;
  
  maturity_days_min: number;
  maturity_days_max: number;
  maturity_days_avg?: number;
  
  harvest_duration_days?: number;
  
  // Condizioni ottimali
  optimal_temp_min?: number;
  optimal_temp_max?: number;
  frost_tolerant: boolean;
  
  // Caratteristiche
  is_direct_seeding: boolean;
  requires_transplant: boolean;
  
  // Resa attesa
  expected_yield_kg_per_plant?: number;
  expected_yield_kg_per_sqm?: number;
  
  created_at: string;
}

export interface PendingNotification {
  // Tutti i campi di PlantLifecycleEvent
  id: string;
  user_id: string;
  garden_id: string;
  zone_id?: string;
  field_row_id?: string;
  field_row_section_id?: string;
  crop_name: string;
  crop_variety?: string;
  plant_count: number;
  seeding_date: string;
  germination_date?: string;
  transplant_date?: string;
  first_harvest_date?: string;
  end_of_cycle_date?: string;
  current_status: PlantLifecycleStatus;
  days_since_seeding?: number;
  expected_germination_days?: number;
  expected_transplant_days?: number;
  expected_maturity_days?: number;
  notification_sent_germination: boolean;
  notification_sent_transplant: boolean;
  notification_sent_harvest: boolean;
  
  // Campi aggiuntivi dalla view
  crop_display_name?: string;
  days_until_germination?: number;
  days_until_transplant?: number;
  days_until_harvest?: number;
  notification_type?: NotificationType;
}

export interface LifecycleUpdateData {
  germination_date?: string;
  transplant_date?: string;
  first_flower_date?: string;
  first_fruit_date?: string;
  first_harvest_date?: string;
  last_harvest_date?: string;
  end_of_cycle_date?: string;
  germination_rate?: number;
  actual_yield_kg?: number;
  notes?: string;
}
