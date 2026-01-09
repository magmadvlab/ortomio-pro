/**
 * Exotic Fruit Types
 * Support for tropical and exotic fruits
 */

import { PlantMasterSheet } from '../types';

/**
 * Exotic Fruit Crop - Extends PlantMasterSheet with exotic fruit specific data
 */
export interface ExoticFruitCrop extends PlantMasterSheet {
  cropType: 'ExoticFruit';
  fruitType: 'Tropical' | 'Subtropical' | 'MediterraneanExotic';
  
  // Climate requirements
  climateRequirements: {
    minTemp: number;        // Minimum temperature (°C)
    maxTemp: number;        // Maximum temperature (°C)
    idealTemp: string;      // Ideal range
    humidity: 'Low' | 'Medium' | 'High';
    frostTolerant: boolean;
    heatTolerant: boolean;
  };
  
  // Greenhouse/controlled environment management
  greenhouseRequired: boolean;
  greenhouseType?: 'Cold' | 'Warm' | 'Tropical';
  indoorGrowing?: boolean;
  containerSize?: string;  // For container growing
  
  // Specific characteristics
  treeType?: 'Tree' | 'Shrub' | 'Herbaceous';
  maturityYears?: number;
  harvestWindow: {
    startMonth: number;
    endMonth: number;
  };
  
  // Notes for Italian climate
  italianClimateNotes?: string;  // How to adapt for Italian climate
  regionalSuitability?: {
    region: string;  // e.g. 'Sicilia', 'Calabria', 'Puglia'
    suitability: 'High' | 'Medium' | 'Low';
    notes?: string;
  }[];
  
  // NEW: Varieties available
  varieties?: ExoticFruitVariety[];
  
  // NEW: Universal climate compatibility
  climateCompatibility?: {
    usdaZones: number[];
    optimalUsdaZones: number[];
    tempMinSurvival: number;
    tempMinGrowth: number;
    tempOptimal: { min: number; max: number };
    tempMax: number;
    maxAltitudeMeters?: number;
    benefitsFromSea?: boolean;
    seaDistanceKm?: number;
  };
  
  // NEW: Cultivation systems
  cultivationSystems?: {
    openField: {
      possible: boolean;
      requires: {
        minUsdaZone?: number;
        protection?: 'None' | 'Temporary' | 'Permanent';
        protectionType?: 'TNT' | 'Mulch' | 'Windbreak';
      };
    };
    container: {
      possible: boolean;
      minSizeLiters?: number;
      moveableIndoor?: boolean;
      indoorMonths?: number[];
    };
    greenhouse: {
      required: boolean;
      type: 'Cold' | 'Warm' | 'Tropical';
      heatingRequired: boolean;
      minTempGreenhouse?: number;
    };
  };
  
  // NEW: Feasibility calculation result (calculated at runtime)
  feasibilityResult?: FeasibilityResult;
}

/**
 * Exotic Fruit Task Data
 */
export interface ExoticFruitTaskData {
  fruitType: 'Tropical' | 'Subtropical' | 'MediterraneanExotic';
  greenhouseRequired: boolean;
  currentTemp?: number;  // Current monitored temperature
  climateStatus?: 'Optimal' | 'Warning' | 'Critical';
  greenhouseSettings?: {
    temp: number;
    humidity: number;
    ventilation: boolean;
  };
}

/**
 * Exotic Fruit Variety - Specific variety information
 */
export interface ExoticFruitVariety {
  id: string;
  name: string;
  coldHardiness: number; // °C minimum survival temperature
  heatTolerance: number; // °C maximum tolerance
  containerFriendly: boolean;
  dwarf?: boolean;
  maturityYears: number;
  harvestMonths: number[];
  bestUsdaZones: number[];
  notes?: string;
}

/**
 * Feasibility Result - Result of geographic matching calculation
 */
export interface FeasibilityResult {
  feasibility: 'Ideal' | 'Possible' | 'Difficult' | 'NotRecommended';
  score: number; // 0-100
  requiredProtections: string[];
  recommendedVariety?: string;
  recommendedSystem: 'openField' | 'container' | 'greenhouse';
  warnings: string[];
  personalizedTimeline?: {
    sowingDate?: string;
    transplantDate?: string;
    harvestStart?: string;
    harvestEnd?: string;
  };
}







