/**
 * Custom Plan Types
 * Allow expert farmers to create personalized plans based on master sheets
 */

import { PlantMasterSheet } from '../types';

/**
 * Custom Plan - Personalized plan based on a master sheet
 */
export interface CustomPlan extends PlantMasterSheet {
  id: string;
  baseMasterSheetId: string;  // ID of the base master sheet
  userId: string;              // User who created the plan
  gardenId?: string;           // Optional: specific to a garden
  name: string;                // Name of the custom plan
  description?: string;        // Description of the plan
  
  // Override master sheet parameters
  overrides: {
    // Germination
    germination?: Partial<PlantMasterSheet['germination']>;
    // Transplanting
    transplanting?: Partial<PlantMasterSheet['transplanting']>;
    // Instructions
    baseInstructions?: Partial<PlantMasterSheet['baseInstructions']>;
    // Susceptibility
    susceptibility?: Partial<PlantMasterSheet['susceptibility']>;
  };
  
  // Personal notes by farmer
  customNotes?: {
    phase: 'Germination' | 'Nursing' | 'Transplanting' | 'Production' | 'Harvest';
    note: string;
    date?: string;  // When to apply this note
  }[];
  
  // Custom methodologies
  customMethods?: {
    name: string;           // e.g. "Metodo Basilicata per fragole precoci"
    description: string;
    steps: string[];
    applicableSeasons?: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[];
  }[];
  
  // Additional parameters not in master sheet
  additionalParameters?: {
    [key: string]: any;  // Flexibility for custom data
  };
  
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;  // Shareable with other users?
}

















