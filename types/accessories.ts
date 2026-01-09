/**
 * Garden Accessories Types
 * Support for stakes, tutors, wires, netting, trellises, etc.
 */

/**
 * Categoria accessorio
 */
export type AccessoryCategory = 'Support' | 'Netting' | 'Wire' | 'Structure';

/**
 * Tipo supporto
 */
export type SupportType = 'Stake' | 'Tutor' | 'Trellis' | 'Cage' | 'Espalier';

/**
 * Tipo rete
 */
export type NettingType = 'Shade' | 'Hail' | 'Insect' | 'Harvest';

/**
 * Tipo filo
 */
export type WireType = 'Steel' | 'Plastic';

/**
 * Materiale accessorio
 */
export type AccessoryMaterial = 
  | 'Wood'           // Legno
  | 'Steel'          // Ferro zincato
  | 'Plastic'        // Plastica/PVC
  | 'Bamboo'         // Bambù
  | 'Cane'           // Canna
  | 'Aluminum'       // Alluminio
  | 'Polyethylene'   // Polietilene (per reti)
  | 'Polypropylene'; // Polipropilene (per reti)

/**
 * Accessorio giardino
 */
export interface GardenAccessory {
  id: string;
  gardenId: string; // Associazione a orto/serra
  name: string;
  category: AccessoryCategory;
  
  // Dettagli specifici per categoria
  supportType?: SupportType;
  nettingType?: NettingType;
  wireType?: WireType;
  
  // Materiale
  material: AccessoryMaterial;
  
  // Dimensioni e quantità
  quantity?: number;        // Numero pezzi
  length?: number;          // Lunghezza in cm
  height?: number;          // Altezza in cm
  width?: number;           // Larghezza in cm
  diameter?: number;        // Diametro in cm (per paletti)
  meshSize?: number;        // Dimensione maglia rete in mm
  
  // Utilizzo
  usedFor?: string[];       // Piante/colture per cui è usato
  installationDate?: string; // Data installazione (ISO string)
  expectedLifespan?: number; // Durata prevista in anni
  
  // Manutenzione
  lastMaintenance?: string;  // Ultima manutenzione (ISO string)
  needsReplacement?: boolean; // Da sostituire
  
  // Posizione (opzionale, per visualizzazione)
  position?: {
    x: number; // Coordinate nella griglia (0-100%)
    y: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

