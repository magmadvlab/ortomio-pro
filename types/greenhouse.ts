/**
 * Greenhouse Configuration Types
 */

export type GreenhouseStructureType = 
  | 'Arched'      // Archi
  | 'Tunnel'      // Tunnel
  | 'ColdFrame'   // Telaio Freddo
  | 'Polytunnel'; // Polytunnel

export type GreenhouseCoveringType = 
  | 'Polyethylene'   // Polietilene
  | 'Polycarbonate'  // Policarbonato
  | 'Glass'          // Vetro
  | 'Netting';       // Rete

export type ArchMaterial = 
  | 'Steel'      // Acciaio
  | 'Aluminum'   // Alluminio
  | 'PVC'        // PVC
  | 'Wood';      // Legno

export interface GreenhouseConfig {
  structureType: GreenhouseStructureType;
  coveringType: GreenhouseCoveringType;
  coveringThickness?: number;  // Spessore copertura in micron
  archSpacing?: number;        // Spaziatura archi in cm
  width?: number;        // Larghezza in metri
  length?: number;       // Lunghezza in metri
  height?: number;      // Altezza in metri
  archCount?: number;   // Numero archi
  archLength?: number;  // Lunghezza arco in metri
  archWidth?: number;   // Larghezza arco in metri
  archHeight?: number;  // Altezza arco in metri
  archMaterial?: ArchMaterial;
  hasVentilation?: boolean;
  hasHeating?: boolean;
  minTemp?: number;     // Temperatura minima (°C)
  maxTemp?: number;     // Temperatura massima (°C)
}

export interface GreenhouseStructure {
  id: string;
  name: string; // "Serra 1", "Tunnel Nord", etc.
  structureType: GreenhouseStructureType;
  coveringType: GreenhouseCoveringType;
  archCount?: number; // Numero archi
  archLength?: number; // Lunghezza arco in metri
  archWidth?: number; // Larghezza arco in metri
  archHeight?: number; // Altezza arco in metri
  width?: number;
  length?: number;
  height?: number;
  hasVentilation?: boolean;
  hasHeating?: boolean;
  minTemp?: number;
  maxTemp?: number;
}

// Configurazione può essere singola (retrocompatibilità) o multipla
export type GreenhouseConfigData = 
  | GreenhouseConfig  // Singola serra (retrocompatibilità)
  | { structures: GreenhouseStructure[] }; // Serre multiple
