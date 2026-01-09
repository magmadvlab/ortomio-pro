/**
 * Custom Plan Service
 * Manages custom plans for expert farmers
 */

import { CustomPlan } from '../types/customPlan';
import { PlantMasterSheet } from '../types';
import { getMasterSheet } from './plantMasterService';

/**
 * Create a custom plan from a master sheet
 */
export const createCustomPlan = async (
  baseMasterSheetId: string,
  name: string,
  userId: string,
  overrides: CustomPlan['overrides'],
  customNotes?: CustomPlan['customNotes'],
  customMethods?: CustomPlan['customMethods'],
  gardenId?: string,
  description?: string
): Promise<CustomPlan> => {
  const baseMasterSheet = await getMasterSheet(baseMasterSheetId);
  if (!baseMasterSheet) {
    throw new Error(`Master sheet not found: ${baseMasterSheetId}`);
  }

  const customPlan: CustomPlan = {
    ...baseMasterSheet,
    id: crypto.randomUUID(),
    baseMasterSheetId,
    userId,
    gardenId,
    name,
    description,
    overrides,
    customNotes: customNotes || [],
    customMethods: customMethods || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false,
  };

  return customPlan;
};

/**
 * Get a custom plan by ID
 */
export const getCustomPlan = async (planId: string): Promise<CustomPlan | null> => {
  // This will be implemented by storage provider
  // For now, return null (placeholder)
  return null;
};

/**
 * Get all custom plans for a user
 */
export const getUserCustomPlans = async (
  userId: string,
  gardenId?: string
): Promise<CustomPlan[]> => {
  // This will be implemented by storage provider
  return [];
};

/**
 * Apply a custom plan to a task
 */
export const applyCustomPlanToTask = async (
  taskId: string,
  planId: string
): Promise<void> => {
  // This will be implemented by storage provider
  // Store reference to custom plan in task
};

/**
 * Merge custom plan with master sheet to get final plan
 */
export const mergePlanWithMaster = async (customPlan: CustomPlan): Promise<PlantMasterSheet> => {
  const baseMasterSheet = await getMasterSheet(customPlan.baseMasterSheetId);
  if (!baseMasterSheet) {
    throw new Error(`Master sheet not found: ${customPlan.baseMasterSheetId}`);
  }

  // Start with base master sheet
  const merged: PlantMasterSheet = { ...baseMasterSheet };

  // Apply overrides
  if (customPlan.overrides.germination) {
    merged.germination = { ...merged.germination, ...customPlan.overrides.germination };
  }
  if (customPlan.overrides.transplanting) {
    merged.transplanting = { ...merged.transplanting, ...customPlan.overrides.transplanting };
  }
  if (customPlan.overrides.baseInstructions) {
    merged.baseInstructions = { ...merged.baseInstructions, ...customPlan.overrides.baseInstructions };
  }
  if (customPlan.overrides.susceptibility) {
    merged.susceptibility = {
      ...merged.susceptibility,
      ...customPlan.overrides.susceptibility,
      fungalDiseases: customPlan.overrides.susceptibility.fungalDiseases ?? merged.susceptibility?.fungalDiseases ?? [],
      pests: customPlan.overrides.susceptibility.pests ?? merged.susceptibility?.pests ?? [],
      preventiveStrategy: customPlan.overrides.susceptibility.preventiveStrategy ?? merged.susceptibility?.preventiveStrategy ?? 'MEDIUM',
    };
  }

  return merged;
};









