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
 * Configurazione serra/tunnel (singola serra - retrocompatibilità)
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

/**
 * Struttura serra singola (per serre multiple)
 */
export interface GreenhouseStructure {
  id: string;
  name: string; // "Serra 1", "Tunnel Nord", etc.
  structureType: GreenhouseStructureType;
  coveringType: GreenhouseCoveringType;
  coveringThickness?: number; // micron per polietilene
  
  // Architettura - dimensioni per arco
  archCount?: number; // Numero archi
  archLength?: number; // Lunghezza arco in metri
  archWidth?: number; // Larghezza arco in metri
  archHeight?: number; // Altezza arco in metri
  archSpacing?: number; // Distanza tra archetti in cm
  archMaterial?: ArchMaterial;
  
  // Controllo ambiente
  hasVentilation?: boolean;
  hasHeating?: boolean;
  minTemp?: number; // Temperatura minima garantita (°C)
  maxTemp?: number; // Temperatura massima garantita (°C)
  
  // Dimensioni totali (calcolate da archi o manuali)
  width?: number; // Larghezza totale in cm
  length?: number; // Lunghezza totale in cm
  height?: number; // Altezza totale in cm
}

/**
 * Configurazione serre/tunnel
 * Può essere singola serra (retrocompatibilità) o serre multiple
 */
export type GreenhouseConfigData = 
  | GreenhouseConfig  // Singola serra (retrocompatibilità)
  | { structures: GreenhouseStructure[] }; // Serre multiple



