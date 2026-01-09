/**
 * Micro-Zone Tracking Types
 * Supporto bed_id, zone_id, row_id per tracking operazioni specifiche
 */

/**
 * Riferimenti micro-zone comuni
 * IMPORTANTE: Separazione tra bed_rows (filari di aiuole) e field_rows (filari di campo aperto)
 */
export interface MicroZoneReference {
  bedId?: string;        // garden_beds (aiuole/letti)
  bedRowId?: string;     // garden_rows (filari di aiuole/letti) - renamed from rowId
  zoneId?: string;       // garden_zones (zone dell'orto)
  fieldRowId?: string;   // field_rows (filari di campo aperto) - NUOVO
}

/**
 * Log Fertilizzazione
 */
export interface FertilizationLog extends MicroZoneReference {
  id: string;
  gardenId: string;
  taskId?: string;

  // Prodotto
  productId?: string;
  productName: string;

  // Dettagli applicazione
  applicationDate: string; // ISO date
  dosage: number;
  dosageUnit: 'kg' | 'L' | 'g' | 'ml' | 'kg/ha' | 'L/ha';
  applicationMethod: 'Broadcast' | 'Banding' | 'Foliar' | 'Fertigation' | 'Injection';

  // Area trattata
  areaTreatedSqm?: number;

  // NPK applicato
  npkApplied?: {
    n: number;
    p: number;
    k: number;
  };

  // Condizioni
  soilMoisture?: 'Dry' | 'Moist' | 'Wet';
  weatherConditions?: {
    temperature?: number;
    wind?: string;
    rain?: boolean;
  };

  // Piante target
  plantNames?: string[];

  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Treatment Registry esteso
 */
export interface TreatmentRegistry extends MicroZoneReference {
  id: string;
  gardenId: string;
  taskId?: string;
  productId?: string;
  plantName: string;
  treatmentDate: string; // ISO date
  dosage: string;
  applicationMethod: string;
  targetPestDisease: string;
  weatherConditions?: Record<string, any>;
  safetyIntervalEndDate: string; // ISO date
  notes?: string;
  createdAt: string;
}

/**
 * Watering Log esteso
 */
export interface WateringLog extends MicroZoneReference {
  id: string;
  zoneId: string; // irrigation_zones (obbligatorio)
  gardenId: string;
  wateredAt: string; // ISO timestamp
  date: string; // ISO date
  durationMinutes: number;
  litersApplied: number;
  method: 'Manual' | 'Automatic' | 'Timer';
  weatherCondition?: string;
  soilMoistureBefore?: number;
  soilMoistureAfter?: number;
  airTemperatureC?: number;
  notes?: string;
  valveId?: string;
  completed: boolean;
  createdAt: string;
}

/**
 * Vista micro-zone trattamento
 */
export interface TreatmentByMicrozone {
  id: string;
  gardenId: string;
  treatmentDate: string;
  plantName: string;
  targetPestDisease: string;
  dosage: string;
  operationType: 'treatment';
  bedId?: string;
  bedRowId?: string;      // Filari di aiuole/letti - renamed from rowId
  zoneId?: string;
  fieldRowId?: string;    // Filari di campo aperto - NUOVO
  bedName?: string;
  bedRowName?: string;    // Nome filare aiuola - renamed from rowName
  zoneName?: string;
  fieldRowName?: string;  // Nome filare campo - NUOVO
}

/**
 * Vista micro-zone fertilizzazione
 */
export interface FertilizationByMicrozone {
  id: string;
  gardenId: string;
  applicationDate: string;
  productName: string;
  dosage: number;
  dosageUnit: string;
  applicationMethod: string;
  operationType: 'fertilization';
  bedId?: string;
  bedRowId?: string;      // Filari di aiuole/letti - renamed from rowId
  zoneId?: string;
  fieldRowId?: string;    // Filari di campo aperto - NUOVO
  bedName?: string;
  bedRowName?: string;    // Nome filare aiuola - renamed from rowName
  zoneName?: string;
  fieldRowName?: string;  // Nome filare campo - NUOVO
}

/**
 * Vista micro-zone irrigazione
 */
export interface IrrigationByMicrozone {
  id: string;
  gardenId: string;
  date: string;
  durationMinutes: number;
  litersApplied: number;
  method: string;
  operationType: 'irrigation';
  bedId?: string;
  bedRowId?: string;      // Filari di aiuole/letti - renamed from rowId
  zoneId?: string;
  fieldRowId?: string;    // Filari di campo aperto - NUOVO
  bedName?: string;
  bedRowName?: string;    // Nome filare aiuola - renamed from rowName
  zoneName?: string;
  fieldRowName?: string;  // Nome filare campo - NUOVO
}

/**
 * Tipo unione per tutte le operazioni
 */
export type OperationByMicrozone =
  | TreatmentByMicrozone
  | FertilizationByMicrozone
  | IrrigationByMicrozone;

/**
 * Helper per filtrare operazioni per micro-zona
 */
export interface MicroZoneFilter {
  gardenId: string;
  bedId?: string;
  bedRowId?: string;      // Filari di aiuole/letti - renamed from rowId
  zoneId?: string;
  fieldRowId?: string;    // Filari di campo aperto - NUOVO
  startDate?: string;
  endDate?: string;
  operationType?: 'treatment' | 'fertilization' | 'irrigation';
}

/**
 * Statistiche operazioni per micro-zona
 */
export interface MicroZoneStats {
  bedId?: string;
  bedRowId?: string;      // Filari di aiuole/letti - renamed from rowId
  zoneId?: string;
  fieldRowId?: string;    // Filari di campo aperto - NUOVO
  totalOperations: number;
  treatmentCount: number;
  fertilizationCount: number;
  irrigationCount: number;
  lastOperationDate?: string;
  totalLitersApplied?: number;
  totalFertilizerKg?: number;
}
