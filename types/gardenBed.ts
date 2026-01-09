/**
 * Garden Bed Types
 * Support for raised beds, containers, pots, and integration with structures (greenhouses, hydroponic systems)
 */

/**
 * Tipo di letto/zona coltivazione
 */
export type BedType = 
  | 'RaisedBed'      // Cassone/letto rialzato
  | 'Container'      // Contenitore generico
  | 'Pot'            // Vaso
  | 'Ground'         // Piena terra (zona non delimitata)
  | 'Greenhouse'     // Dentro serra
  | 'Hydroponic'     // Sistema idroponico
  | 'Aquaponic'      // Sistema acquaponico
  | 'Aeroponic'      // Sistema aeroponico
  | 'Indoor';        // Coltivazione indoor

/**
 * Forma del letto
 */
export type BedShape = 'Rectangle' | 'Circle' | 'Custom';

/**
 * Tipo struttura associata
 */
export type StructureType = 'Greenhouse' | 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'Indoor';

/**
 * Interfaccia per letto/zona di coltivazione
 */
export interface GardenBed {
  id: string;
  gardenId: string;
  name: string;                    // "Cassone 1", "Letto Nord", "Vaso Grande"
  bedType: BedType;
  
  // Dimensioni
  shape: BedShape;
  lengthCm?: number;               // Per rettangoli (lunghezza)
  widthCm?: number;                 // Per rettangoli (larghezza)
  diameterCm?: number;              // Per cerchi (vasi)
  areaSqMeters?: number;           // Calcolato automaticamente
  
  // Posizione nel Visual Planner
  position?: {
    x: number;                     // Coordinate in cm (0-100% del giardino convertito in cm)
    y: number;
    rotation?: number;              // Rotazione in gradi (0-360)
  };
  
  // Caratteristiche specifiche (override per questo letto)
  soilType?: string;               // Override terreno per questo letto
  sunExposure?: string;            // Override esposizione solare
  dailySunHours?: number;          // Override ore di sole
  
  // Associazione a strutture esistenti
  structureId?: string;            // ID struttura se associato a serra/idroponica esistente
  structureType?: StructureType;   // Tipo struttura
  
  // Copertura da struttura
  isCovered?: boolean;             // Se il letto è coperto da serra/tunnel
  coveringStructureId?: string;    // ID struttura che copre questo letto (se diversa da structureId)
  
  // Metadati
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

