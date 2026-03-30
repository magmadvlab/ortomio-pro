import { getFunctionalCategoryFromArchetype } from '../data/plantTaxonomy';
import {
  AGRONOMIC_CROP_PROFILES,
  AGRONOMIC_FALLBACK_BY_FUNCTIONAL_CATEGORY,
  AGRONOMIC_PROFILE_ALIASES,
} from '../data/agronomicCropProfiles';
import type { CustomCrop } from '../types/customCrop';
import type {
  AgronomicCropProfile,
  ResolvedAgronomicCropProfile,
} from '../types/agronomicKernel';
import type { ArchetypeId } from '../types/archetypes';
import type { FunctionalCategory } from '../data/plantTaxonomy';

export interface ResolveAgronomicCropProfileInput {
  plantId?: string | null;
  archetypeId?: ArchetypeId | null;
  functionalCategory?: FunctionalCategory | null;
  customCrop?: CustomCrop | null;
}

const normalizeKey = (value?: string | null) => {
  return value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

const findProfileById = (profileId: string): AgronomicCropProfile | null => {
  return AGRONOMIC_CROP_PROFILES.find((profile) => profile.id === profileId) || null;
};

const findProfileByPlantId = (plantId?: string | null): AgronomicCropProfile | null => {
  const normalized = normalizeKey(plantId);
  if (!normalized) return null;

  const aliasProfileId = AGRONOMIC_PROFILE_ALIASES[normalized];
  if (aliasProfileId) {
    return findProfileById(aliasProfileId);
  }

  return (
    AGRONOMIC_CROP_PROFILES.find((profile) =>
      profile.supportedPlantIds?.some((candidate) => normalizeKey(candidate) === normalized)
    ) || null
  );
};

const findProfileByFunctionalCategory = (
  functionalCategory?: FunctionalCategory | null
): AgronomicCropProfile | null => {
  if (!functionalCategory) return null;

  const profileId = AGRONOMIC_FALLBACK_BY_FUNCTIONAL_CATEGORY[functionalCategory];
  return profileId ? findProfileById(profileId) : null;
};

export const getAgronomicCropProfiles = (): AgronomicCropProfile[] => {
  return [...AGRONOMIC_CROP_PROFILES];
};

export const getAgronomicCropProfileById = (
  profileId: string
): AgronomicCropProfile | null => {
  return findProfileById(profileId);
};

export const resolveAgronomicCropProfileSync = (
  input: ResolveAgronomicCropProfileInput
): ResolvedAgronomicCropProfile => {
  const warnings: string[] = [];

  const byPlantId = findProfileByPlantId(input.plantId);
  if (byPlantId) {
    return {
      profile: byPlantId,
      source: 'plant_id',
      matchedBy: normalizeKey(input.plantId) || byPlantId.id,
      warnings,
    };
  }

  const customCropName = normalizeKey(input.customCrop?.common_name);
  if (customCropName) {
    const byCustomName = findProfileByPlantId(customCropName);
    if (byCustomName) {
      warnings.push('Resolved custom crop through canonical plant alias. Site-specific tuning is still required.');
      return {
        profile: byCustomName,
        source: 'custom_crop',
        matchedBy: customCropName,
        warnings,
      };
    }
  }

  const derivedFunctionalCategory =
    input.functionalCategory ||
    (input.archetypeId ? getFunctionalCategoryFromArchetype(input.archetypeId) : null);

  const byFunctionalCategory = findProfileByFunctionalCategory(derivedFunctionalCategory);
  if (byFunctionalCategory) {
    warnings.push('Resolved through functional category fallback. Crop-specific calibration is still needed.');
    return {
      profile: byFunctionalCategory,
      source: input.functionalCategory ? 'functional_category' : 'taxonomy',
      matchedBy: derivedFunctionalCategory || byFunctionalCategory.id,
      warnings,
    };
  }

  const fallbackProfile = findProfileById('fruiting_vegetables') || AGRONOMIC_CROP_PROFILES[0];
  warnings.push('No direct agronomic profile match found. Using generic fallback profile.');

  return {
    profile: fallbackProfile,
    source: 'fallback',
    matchedBy: 'generic_fallback',
    warnings,
  };
};

export const resolveAgronomicCropProfile = async (
  input: ResolveAgronomicCropProfileInput
): Promise<ResolvedAgronomicCropProfile> => {
  return resolveAgronomicCropProfileSync(input)
}
