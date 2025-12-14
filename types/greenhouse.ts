/**
 * Greenhouse and Protected Structure Types
 * Support for greenhouses, tunnels, polytunnels
 */

/**
 * Tipo struttura serra
 */
export type GreenhouseStructureType = 'Arched' | 'Tunnel' | 'ColdFrame' | 'Polytunnel';

/**
 * Tipo copertura serra
 */
export type GreenhouseCoveringType = 'Polyethylene' | 'Polycarbonate' | 'Glass' | 'Netting';

/**
 * Materiale archetti
 */
export type ArchMaterial = 'Steel' | 'Aluminum' | 'PVC' | 'Bamboo';

/**
 * Configurazione serra/tunnel
 */
export interface GreenhouseConfig {
  structureType: GreenhouseStructureType;
  coveringType: GreenhouseCoveringType;
  coveringThickness?: number; // micron per polietilene
  
  // Architettura
  archSpacing?: number; // Distanza tra archetti in cm
  archHeight?: number; // Altezza archetti in cm
  archMaterial?: ArchMaterial;
  
  // Controllo ambiente
  hasVentilation?: boolean;
  hasHeating?: boolean;
  minTemp?: number; // Temperatura minima garantita (°C)
  maxTemp?: number; // Temperatura massima garantita (°C)
  
  // Dimensioni
  width?: number; // Larghezza in cm
  length?: number; // Lunghezza in cm
  height?: number; // Altezza in cm
}


