import { Garden, GardenTask } from '../types';
import { IrrigationSystem, IrrigationZone } from '../types/irrigation';

/**
 * Agronomic data for plant spacing and irrigation needs
 */
export interface CropIrrigationData {
  plantName: string;
  // Spacing data (cm)
  inRowSpacing: number;
  betweenRowSpacing: number;
  // Irrigation requirements
  dailyWaterNeedMm: number; // mm per day during peak season
  criticalWaterNeedStage: string; // e.g., 'flowering', 'fruiting', 'establishment'
  // Preferred irrigation methods
  preferredMethods: ('drip' | 'sprinkler' | 'flood')[];
  // System design parameters
  driplineSpacing: number; // cm between driplines
  emitterSpacing: number; // cm between emitters
  emitterFlowRate: number; // liters per hour per emitter
  // Pressure requirements
  minPressureBar: number;
  maxPressureBar: number;
  // Efficiency factors
  applicationEfficiency: number; // percentage
}

/**
 * Irrigation design suggestion
 */
export interface IrrigationDesignSuggestion {
  gardenId: string;
  gardenType: string;
  totalArea: number; // m²
  // System recommendations
  systemType: 'drip' | 'sprinkler' | 'flood';
  waterSource: 'mains' | 'well' | 'tank' | 'river';
  pressureBar: number;
  flowRateLpm: number; // total system flow rate
  // Zone breakdown
  zones: ZoneSuggestion[];
  // Component list
  components: ComponentSuggestion[];
  // Cost estimation
  estimatedCost: number;
  costPerLiter: number;
  // Design notes
  designNotes: string[];
  limitations: string[];
}

export interface ZoneSuggestion {
  zoneName: string;
  areaSqm: number;
  plantTypes: string[];
  method: 'drip' | 'sprinkler' | 'manual';
  flowRateLph: number;
  // Drip system specifics
  driplineLength: number; // meters
  emitterCount: number;
  emitterSpacing: number; // cm
  driplineSpacing: number; // cm
  // Sprinkler specifics
  sprinklerCount: number;
  sprinklerRadius: number; // meters
  // Duration calculations
  wateringDurationMinutes: number; // for 5mm
  dailyWaterRequirementLiters: number;
}

export interface ComponentSuggestion {
  componentType: 'mainline' | 'submain' | 'dripline' | 'emitters' | 'sprinklers' | 'valves' | 'timer' | 'filter' | 'fittings' | 'accessories';
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specs: Record<string, any>;
}

/**
 * Database of crop irrigation requirements
 * This would typically come from agricultural research data
 */
const CROP_IRRIGATION_DATABASE: CropIrrigationData[] = [
  // Vegetables - High frequency, low volume
  {
    plantName: 'pomodoro',
    inRowSpacing: 40,
    betweenRowSpacing: 100,
    dailyWaterNeedMm: 4,
    criticalWaterNeedStage: 'fruiting',
    preferredMethods: ['drip'],
    driplineSpacing: 100,
    emitterSpacing: 30,
    emitterFlowRate: 2.0,
    minPressureBar: 1.0,
    maxPressureBar: 2.5,
    applicationEfficiency: 90
  },
  {
    plantName: 'lattuga',
    inRowSpacing: 25,
    betweenRowSpacing: 30,
    dailyWaterNeedMm: 3,
    criticalWaterNeedStage: 'establishment',
    preferredMethods: ['drip', 'sprinkler'],
    driplineSpacing: 30,
    emitterSpacing: 25,
    emitterFlowRate: 1.5,
    minPressureBar: 0.8,
    maxPressureBar: 2.0,
    applicationEfficiency: 85
  },
  {
    plantName: 'peperone',
    inRowSpacing: 40,
    betweenRowSpacing: 80,
    dailyWaterNeedMm: 4,
    criticalWaterNeedStage: 'fruiting',
    preferredMethods: ['drip'],
    driplineSpacing: 80,
    emitterSpacing: 40,
    emitterFlowRate: 2.0,
    minPressureBar: 1.0,
    maxPressureBar: 2.5,
    applicationEfficiency: 90
  },
  {
    plantName: 'zucchina',
    inRowSpacing: 80,
    betweenRowSpacing: 120,
    dailyWaterNeedMm: 5,
    criticalWaterNeedStage: 'fruiting',
    preferredMethods: ['drip'],
    driplineSpacing: 120,
    emitterSpacing: 40,
    emitterFlowRate: 2.5,
    minPressureBar: 1.0,
    maxPressureBar: 2.5,
    applicationEfficiency: 90
  },
  
  // Fruit trees - Low frequency, high volume
  {
    plantName: 'melo',
    inRowSpacing: 300,
    betweenRowSpacing: 400,
    dailyWaterNeedMm: 6,
    criticalWaterNeedStage: 'fruit development',
    preferredMethods: ['drip', 'sprinkler'],
    driplineSpacing: 300,
    emitterSpacing: 50,
    emitterFlowRate: 4.0,
    minPressureBar: 1.5,
    maxPressureBar: 3.0,
    applicationEfficiency: 85
  },
  {
    plantName: 'pero',
    inRowSpacing: 250,
    betweenRowSpacing: 350,
    dailyWaterNeedMm: 5,
    criticalWaterNeedStage: 'fruit development',
    preferredMethods: ['drip', 'sprinkler'],
    driplineSpacing: 250,
    emitterSpacing: 50,
    emitterFlowRate: 4.0,
    minPressureBar: 1.5,
    maxPressureBar: 3.0,
    applicationEfficiency: 85
  },
  {
    plantName: 'pesco',
    inRowSpacing: 400,
    betweenRowSpacing: 450,
    dailyWaterNeedMm: 7,
    criticalWaterNeedStage: 'fruit development',
    preferredMethods: ['drip', 'sprinkler'],
    driplineSpacing: 400,
    emitterSpacing: 60,
    emitterFlowRate: 6.0,
    minPressureBar: 1.5,
    maxPressureBar: 3.5,
    applicationEfficiency: 85
  },
  
  // Vineyards - Specialized drip
  {
    plantName: 'vite',
    inRowSpacing: 80,
    betweenRowSpacing: 200,
    dailyWaterNeedMm: 3,
    criticalWaterNeedStage: 'veraison',
    preferredMethods: ['drip'],
    driplineSpacing: 200,
    emitterSpacing: 80,
    emitterFlowRate: 2.0,
    minPressureBar: 1.0,
    maxPressureBar: 2.5,
    applicationEfficiency: 90
  },
  
  // Olive groves - Low water needs
  {
    plantName: 'olivo',
    inRowSpacing: 500,
    betweenRowSpacing: 600,
    dailyWaterNeedMm: 2,
    criticalWaterNeedStage: 'fruit development',
    preferredMethods: ['drip'],
    driplineSpacing: 500,
    emitterSpacing: 100,
    emitterFlowRate: 4.0,
    minPressureBar: 1.0,
    maxPressureBar: 2.5,
    applicationEfficiency: 90
  },
  
  // Aromatics - Low water needs
  {
    plantName: 'rosmarino',
    inRowSpacing: 60,
    betweenRowSpacing: 80,
    dailyWaterNeedMm: 2,
    criticalWaterNeedStage: 'establishment',
    preferredMethods: ['drip'],
    driplineSpacing: 80,
    emitterSpacing: 30,
    emitterFlowRate: 1.5,
    minPressureBar: 0.8,
    maxPressureBar: 2.0,
    applicationEfficiency: 85
  },
  {
    plantName: 'salvia',
    inRowSpacing: 40,
    betweenRowSpacing: 60,
    dailyWaterNeedMm: 2,
    criticalWaterNeedStage: 'establishment',
    preferredMethods: ['drip'],
    driplineSpacing: 60,
    emitterSpacing: 30,
    emitterFlowRate: 1.5,
    minPressureBar: 0.8,
    maxPressureBar: 2.0,
    applicationEfficiency: 85
  }
];

/**
 * Component pricing database (€ per unit)
 * These would be updated based on current market prices
 */
const COMPONENT_PRICING = {
  // Mainline (PE pipe)
  mainline_32mm: { unitPrice: 2.5, unit: 'm', specs: { diameter: '32mm', pressure: '6 bar' } },
  mainline_25mm: { unitPrice: 1.8, unit: 'm', specs: { diameter: '25mm', pressure: '6 bar' } },
  
  // Dripline
  dripline_16mm: { unitPrice: 0.8, unit: 'm', specs: { diameter: '16mm', wall: '0.6mm' } },
  dripline_20mm: { unitPrice: 1.2, unit: 'm', specs: { diameter: '20mm', wall: '0.8mm' } },
  
  // Emitters
  emitter_2lph: { unitPrice: 0.15, unit: 'piece', specs: { flowRate: '2 L/h', pressure: '1-2 bar' } },
  emitter_4lph: { unitPrice: 0.25, unit: 'piece', specs: { flowRate: '4 L/h', pressure: '1.5-3 bar' } },
  emitter_6lph: { unitPrice: 0.35, unit: 'piece', specs: { flowRate: '6 L/h', pressure: '2-3.5 bar' } },
  
  // Sprinklers
  sprinkler_micro: { unitPrice: 8.5, unit: 'piece', specs: { flowRate: '30 L/h', radius: '3m' } },
  sprinkler_mini: { unitPrice: 12.0, unit: 'piece', specs: { flowRate: '70 L/h', radius: '5m' } },
  
  // Valves
  valve_solenoid: { unitPrice: 25.0, unit: 'piece', specs: { voltage: '24V', pressure: '10 bar' } },
  valve_manual: { unitPrice: 8.5, unit: 'piece', specs: { pressure: '10 bar' } },
  
  // Timer/Controller
  timer_basic: { unitPrice: 45.0, unit: 'piece', specs: { zones: 4, battery: '9V' } },
  timer_smart: { unitPrice: 120.0, unit: 'piece', specs: { zones: 8, wifi: true, app: true } },
  
  // Filter
  filter_screen: { unitPrice: 18.0, unit: 'piece', specs: { mesh: '120', pressure: '6 bar' } },
  filter_disc: { unitPrice: 35.0, unit: 'piece', specs: { discs: '120', pressure: '8 bar' } },
  
  // Fittings (average price per piece)
  fitting_compression: { unitPrice: 1.2, unit: 'piece', specs: { type: 'compression' } },
  fitting_tee: { unitPrice: 1.5, unit: 'piece', specs: { type: 'tee' } },
  fitting_elbow: { unitPrice: 1.3, unit: 'piece', specs: { type: 'elbow' } },
  
  // Accessories
  accessories_starter: { unitPrice: 35.0, unit: 'set', specs: { includes: 'clamps, plugs, tools' } },
  accessories_punch: { unitPrice: 12.0, unit: 'piece', specs: { type: 'punch tool' } }
};

/**
 * Get crop irrigation data for a plant
 */
function getCropIrrigationData(plantName: string): CropIrrigationData | null {
  const normalizedName = plantName.toLowerCase().trim();
  
  // Try exact match first
  let match = CROP_IRRIGATION_DATABASE.find(c => c.plantName === normalizedName);
  if (match) return match;
  
  // Try partial match
  match = CROP_IRRIGATION_DATABASE.find(c => 
    normalizedName.includes(c.plantName) || c.plantName.includes(normalizedName)
  );
  if (match) return match;
  
  // Try family-based matching for common groups
  if (normalizedName.includes('insalata') || normalizedName.includes('lattuga')) {
    return CROP_IRRIGATION_DATABASE.find(c => c.plantName === 'lattuga') || null;
  }
  
  // Default for unknown vegetables (moderate needs)
  if (normalizedName.includes('pomodoro') || normalizedName.includes('peperone') || 
      normalizedName.includes('melanzana') || normalizedName.includes('zucchina')) {
    return CROP_IRRIGATION_DATABASE.find(c => c.plantName === 'pomodoro') || null;
  }
  
  // Default for unknown fruit trees
  if (normalizedName.includes('albero') || normalizedName.includes('frutto')) {
    return CROP_IRRIGATION_DATABASE.find(c => c.plantName === 'melo') || null;
  }
  
  return null;
}

/**
 * Calculate irrigation design suggestions for a garden
 */
export function calculateIrrigationDesignSuggestions(
  garden: Garden,
  activeTasks: GardenTask[],
  existingSystems?: IrrigationSystem[],
  existingZones?: IrrigationZone[]
): IrrigationDesignSuggestion | null {
  // Skip if garden has no area defined
  if (!garden.sizeSqMeters || garden.sizeSqMeters <= 0) {
    return null;
  }
  
  // Skip if already has irrigation system (unless explicitly requesting redesign)
  if (existingSystems && existingSystems.length > 0) {
    return null;
  }
  
  // Group active plants by location/type
  const plantsByLocation = groupPlantsByLocation(activeTasks);
  
  if (plantsByLocation.length === 0) {
    return null;
  }
  
  // Determine optimal system type based on garden type and crops
  const systemType = determineOptimalSystemType(garden, plantsByLocation);
  
  // Calculate zones
  const zones = calculateZoneSuggestions(plantsByLocation, systemType);
  
  if (zones.length === 0) {
    return null;
  }
  
  // Calculate system requirements
  const systemRequirements = calculateSystemRequirements(zones, systemType);
  
  // Generate component list
  const components = generateComponentList(zones, systemType, systemRequirements);
  
  // Calculate costs
  const estimatedCost = components.reduce((sum, c) => sum + c.totalPrice, 0);
  const totalDailyWater = zones.reduce((sum, z) => sum + z.dailyWaterRequirementLiters, 0);
  const costPerLiter = totalDailyWater > 0 ? estimatedCost / totalDailyWater : 0;
  
  // Generate design notes
  const designNotes = generateDesignNotes(garden, zones, systemType);
  const limitations = generateLimitations(garden, zones, systemType);
  
  return {
    gardenId: garden.id,
    gardenType: garden.gardenType || 'vegetable',
    totalArea: garden.sizeSqMeters,
    systemType,
    waterSource: determineWaterSource(garden),
    pressureBar: systemRequirements.pressureBar,
    flowRateLpm: systemRequirements.flowRateLpm,
    zones,
    components,
    estimatedCost,
    costPerLiter,
    designNotes,
    limitations
  };
}

/**
 * Group active plants by location for zone planning
 */
function groupPlantsByLocation(tasks: GardenTask[]): Array<{
  locationType: string;
  locationName: string;
  plants: Array<{
    plantName: string;
    variety?: string;
    areaSqm: number;
    quantity: number;
  }>;
}> {
  const grouped = new Map<string, { locationName: string; plants: Array<{
    plantName: string;
    variety?: string;
    areaSqm: number;
    quantity: number;
  }> }>();
  
  for (const task of tasks) {
    if (task.completed || task.isSuggested) continue;
    
    const locationKey = task.locationType || 'unknown';
    const locationName = task.bedId || task.locationType || 'Zona Sconosciuta';
    
    if (!grouped.has(locationKey)) {
      grouped.set(locationKey, { locationName, plants: [] });
    }
    
    // Estimate area based on crop requirements
    const cropData = getCropIrrigationData(task.plantName);
    let areaSqm = 0;
    
    if (cropData && task.quantity) {
      // Calculate area based on spacing
      const areaPerPlant = (cropData.inRowSpacing * cropData.betweenRowSpacing) / 10000; // cm² to m²
      areaSqm = task.quantity * areaPerPlant;
    } else {
      // Default estimate if no data available
      areaSqm = task.quantity ? task.quantity * 0.5 : 10; // 0.5m² per plant default
    }
    
    grouped.get(locationKey)!.plants.push({
      plantName: task.plantName,
      variety: task.variety,
      areaSqm,
      quantity: task.quantity || 1
    });
  }
  
  return Array.from(grouped.entries()).map(([locationKey, entry]) => ({
    locationType: locationKey,
    locationName: entry.locationName,
    plants: entry.plants
  }));
}

/**
 * Determine optimal irrigation system type
 */
function determineOptimalSystemType(
  garden: Garden, 
  plantGroups: Array<{ locationType: string; plants: any[] }>
): 'drip' | 'sprinkler' | 'flood' {
  // Count crop types
  const cropTypes = new Set<string>();
  let hasTrees = false;
  let hasVines = false;
  let hasVegetables = false;
  
  for (const group of plantGroups) {
    for (const plant of group.plants) {
      const cropData = getCropIrrigationData(plant.plantName);
      if (cropData) {
        cropTypes.add(plant.plantName);
        
        if (['melo', 'pero', 'pesco'].includes(cropData.plantName)) {
          hasTrees = true;
        } else if (cropData.plantName === 'vite') {
          hasVines = true;
        } else {
          hasVegetables = true;
        }
      }
    }
  }
  
  // Decision logic
  if (hasTrees || hasVines) {
    return 'drip'; // Most efficient for trees and vines
  }
  
  if (hasVegetables && garden.sizeSqMeters && garden.sizeSqMeters < 500) {
    return 'drip'; // Small vegetable gardens benefit from drip precision
  }
  
  if (garden.gardenType?.includes('field') || garden.gardenType?.includes('large')) {
    return 'sprinkler'; // Large areas benefit from sprinklers
  }
  
  return 'drip'; // Default to drip for versatility and efficiency
}

/**
 * Calculate zone suggestions
 */
function calculateZoneSuggestions(
  plantGroups: Array<{ locationType: string; locationName: string; plants: any[] }>,
  systemType: string
): ZoneSuggestion[] {
  const zones: ZoneSuggestion[] = [];
  
  for (let i = 0; i < plantGroups.length; i++) {
    const group = plantGroups[i];
    const zoneName = `Zona ${i + 1}: ${group.locationName}`;
    
    // Calculate total area
    const totalArea = group.plants.reduce((sum, p) => sum + p.areaSqm, 0);
    
    // Get unique plant types
    const plantTypes = [...new Set(group.plants.map(p => p.plantName))];
    
    // Determine method based on system type and crop preferences
    const method = determineZoneMethod(group.plants, systemType);
    
    // Calculate zone parameters
    const zoneParams = calculateZoneParameters(group.plants, method, totalArea);
    
    zones.push({
      zoneName,
      areaSqm: totalArea,
      plantTypes,
      method,
      flowRateLph: zoneParams.flowRateLph,
      driplineLength: zoneParams.driplineLength,
      emitterCount: zoneParams.emitterCount,
      emitterSpacing: zoneParams.emitterSpacing,
      driplineSpacing: zoneParams.driplineSpacing,
      sprinklerCount: zoneParams.sprinklerCount,
      sprinklerRadius: zoneParams.sprinklerRadius,
      wateringDurationMinutes: zoneParams.wateringDurationMinutes,
      dailyWaterRequirementLiters: zoneParams.dailyWaterRequirementLiters
    });
  }
  
  return zones;
}

/**
 * Determine irrigation method for a zone
 */
function determineZoneMethod(plants: any[], systemType: string): 'drip' | 'sprinkler' | 'manual' {
  // Check if any plant prefers sprinkler
  const prefersSprinkler = plants.some(p => {
    const cropData = getCropIrrigationData(p.plantName);
    return cropData?.preferredMethods.includes('sprinkler');
  });
  
  if (prefersSprinkler && systemType === 'sprinkler') {
    return 'sprinkler';
  }
  
  // Default to drip for most cases
  return 'drip';
}

/**
 * Calculate zone parameters
 */
function calculateZoneParameters(
  plants: any[],
  method: 'drip' | 'sprinkler' | 'manual',
  totalArea: number
) {
  if (method === 'manual') {
    // Manual zone - no hardware calculations
    const dailyWaterMm = Math.max(...plants.map(p => {
      const cropData = getCropIrrigationData(p.plantName);
      return cropData?.dailyWaterNeedMm || 3;
    }));
    
    const dailyWaterLiters = totalArea * dailyWaterMm; // 1mm su 1m² = 1 litro
    
    return {
      flowRateLph: 0,
      driplineLength: 0,
      emitterCount: 0,
      emitterSpacing: 0,
      driplineSpacing: 0,
      sprinklerCount: 0,
      sprinklerRadius: 0,
      wateringDurationMinutes: 0,
      dailyWaterRequirementLiters: dailyWaterLiters
    };
  }
  
  if (method === 'sprinkler') {
    // Sprinkler calculations
    const sprinklerRadius = 5; // 5m radius standard
    const areaPerSprinkler = Math.PI * sprinklerRadius * sprinklerRadius;
    const sprinklerCount = Math.ceil(totalArea / areaPerSprinkler);
    
    // Average flow rate per sprinkler
    const flowPerSprinkler = 70; // L/h
    const flowRateLph = sprinklerCount * flowPerSprinkler;
    
    // Water requirements
    const dailyWaterMm = Math.max(...plants.map(p => {
      const cropData = getCropIrrigationData(p.plantName);
      return cropData?.dailyWaterNeedMm || 3;
    }));
    
    const dailyWaterLiters = totalArea * dailyWaterMm;
    
    // Duration to apply 5mm
    const waterToApply = totalArea * 5; // liters for 5mm
    const wateringDurationMinutes = (waterToApply / flowRateLph) * 60;
    
    return {
      flowRateLph,
      driplineLength: 0,
      emitterCount: 0,
      emitterSpacing: 0,
      driplineSpacing: 0,
      sprinklerCount,
      sprinklerRadius,
      wateringDurationMinutes,
      dailyWaterRequirementLiters: dailyWaterLiters
    };
  }
  
  // Drip irrigation calculations
  let totalDriplineLength = 0;
  let totalEmitterCount = 0;
  let totalFlowRate = 0;
  
  for (const plant of plants) {
    const cropData = getCropIrrigationData(plant.plantName);
    if (!cropData) continue;
    
    // Calculate dripline needed for this plant
    const plantArea = plant.areaSqm;
    const driplineLength = plantArea / (cropData.driplineSpacing * 0.01); // Convert cm to m
    const emitterCount = driplineLength / (cropData.emitterSpacing * 0.01);
    const zoneFlowRate = emitterCount * cropData.emitterFlowRate;
    
    totalDriplineLength += driplineLength;
    totalEmitterCount += emitterCount;
    totalFlowRate += zoneFlowRate;
  }
  
  // Water requirements
  const dailyWaterMm = Math.max(...plants.map(p => {
    const cropData = getCropIrrigationData(p.plantName);
    return cropData?.dailyWaterNeedMm || 3;
  }));
  
  const dailyWaterLiters = totalArea * dailyWaterMm;
  
  // Duration to apply 5mm
  const waterToApply = totalArea * 5; // liters for 5mm
  const wateringDurationMinutes = totalFlowRate > 0 ? (waterToApply / totalFlowRate) * 60 : 0;
  
  return {
    flowRateLph: Math.ceil(totalFlowRate),
    driplineLength: Math.ceil(totalDriplineLength),
    emitterCount: Math.ceil(totalEmitterCount),
    emitterSpacing: 30, // Default emitter spacing
    driplineSpacing: 100, // Default dripline spacing
    sprinklerCount: 0,
    sprinklerRadius: 0,
    wateringDurationMinutes,
    dailyWaterRequirementLiters: dailyWaterLiters
  };
}

/**
 * Calculate overall system requirements
 */
function calculateSystemRequirements(
  zones: ZoneSuggestion[],
  systemType: string
) {
  const totalFlowRate = zones.reduce((sum, z) => sum + z.flowRateLph, 0);
  
  // Pressure requirements based on system type
  let pressureBar = 1.5; // Default
  
  if (systemType === 'drip') {
    pressureBar = 2.0; // Drip needs moderate pressure
  } else if (systemType === 'sprinkler') {
    pressureBar = 3.0; // Sprinklers need higher pressure
  } else if (systemType === 'microsprinkler') {
    pressureBar = 2.5; // Microsprinklers medium pressure
  }
  
  // Convert L/h to L/min for system specification
  const flowRateLpm = Math.ceil(totalFlowRate / 60);
  
  return {
    pressureBar,
    flowRateLpm: Math.max(flowRateLpm, 10) // Minimum 10 L/min system
  };
}

/**
 * Generate component list with pricing
 */
function generateComponentList(
  zones: ZoneSuggestion[],
  systemType: string,
  requirements: { pressureBar: number; flowRateLpm: number }
): ComponentSuggestion[] {
  const components: ComponentSuggestion[] = [];
  
  // Mainline pipe (calculate based on total area)
  const mainlineLength = Math.ceil(Math.sqrt(zones.reduce((sum, z) => sum + z.areaSqm, 0)) * 1.5);
  const mainlineSize = requirements.flowRateLpm > 20 ? '32mm' : '25mm';
  const mainlineKey = `mainline_${mainlineSize}`;
  const mainlinePricing = COMPONENT_PRICING[mainlineKey as keyof typeof COMPONENT_PRICING];
  
  if (mainlinePricing) {
    components.push({
      componentType: 'mainline',
      description: `Tubo principale ${mainlineSize} PE`,
      quantity: mainlineLength,
      unit: mainlinePricing.unit,
      unitPrice: mainlinePricing.unitPrice,
      totalPrice: mainlineLength * mainlinePricing.unitPrice,
      specs: mainlinePricing.specs
    });
  }
  
  // Zone components
  for (const zone of zones) {
    if (zone.method === 'drip') {
      // Dripline
      const driplineKey = 'dripline_16mm';
      const driplinePricing = COMPONENT_PRICING[driplineKey as keyof typeof COMPONENT_PRICING];
      
      if (driplinePricing && zone.driplineLength > 0) {
        components.push({
          componentType: 'dripline',
          description: `Tubo goccia ${zone.zoneName}`,
          quantity: zone.driplineLength,
          unit: driplinePricing.unit,
          unitPrice: driplinePricing.unitPrice,
          totalPrice: zone.driplineLength * driplinePricing.unitPrice,
          specs: driplinePricing.specs
        });
      }
      
      // Emitters
      const emitterKey = zone.flowRateLph > 100 ? 'emitter_4lph' : 'emitter_2lph';
      const emitterPricing = COMPONENT_PRICING[emitterKey as keyof typeof COMPONENT_PRICING];
      
      if (emitterPricing && zone.emitterCount > 0) {
        components.push({
          componentType: 'emitters',
          description: `Erogatori ${zone.zoneName}`,
          quantity: zone.emitterCount,
          unit: emitterPricing.unit,
          unitPrice: emitterPricing.unitPrice,
          totalPrice: zone.emitterCount * emitterPricing.unitPrice,
          specs: emitterPricing.specs
        });
      }
    } else if (zone.method === 'sprinkler') {
      // Sprinklers
      const sprinklerKey = 'sprinkler_mini';
      const sprinklerPricing = COMPONENT_PRICING[sprinklerKey as keyof typeof COMPONENT_PRICING];
      
      if (sprinklerPricing && zone.sprinklerCount > 0) {
        components.push({
          componentType: 'sprinklers',
          description: `Sprinkler ${zone.zoneName}`,
          quantity: zone.sprinklerCount,
          unit: sprinklerPricing.unit,
          unitPrice: sprinklerPricing.unitPrice,
          totalPrice: zone.sprinklerCount * sprinklerPricing.unitPrice,
          specs: sprinklerPricing.specs
        });
      }
    }
    
    // Zone valve
    const valveKey = 'valve_solenoid';
    const valvePricing = COMPONENT_PRICING[valveKey as keyof typeof COMPONENT_PRICING];
    
    if (valvePricing && zone.method !== 'manual') {
      components.push({
        componentType: 'valves',
        description: `Elettrovalvola ${zone.zoneName}`,
        quantity: 1,
        unit: valvePricing.unit,
        unitPrice: valvePricing.unitPrice,
        totalPrice: valvePricing.unitPrice,
        specs: valvePricing.specs
      });
    }
  }
  
  // System controller
  const timerKey = zones.length > 4 ? 'timer_smart' : 'timer_basic';
  const timerPricing = COMPONENT_PRICING[timerKey as keyof typeof COMPONENT_PRICING];
  
  if (timerPricing) {
    components.push({
      componentType: 'timer',
      description: 'Programmatore irrigazione',
      quantity: 1,
      unit: timerPricing.unit,
      unitPrice: timerPricing.unitPrice,
      totalPrice: timerPricing.unitPrice,
      specs: timerPricing.specs
    });
  }
  
  // Filter
  const filterKey = requirements.flowRateLpm > 30 ? 'filter_disc' : 'filter_screen';
  const filterPricing = COMPONENT_PRICING[filterKey as keyof typeof COMPONENT_PRICING];
  
  if (filterPricing) {
    components.push({
      componentType: 'filter',
      description: 'Filtro acqua',
      quantity: 1,
      unit: filterPricing.unit,
      unitPrice: filterPricing.unitPrice,
      totalPrice: filterPricing.unitPrice,
      specs: filterPricing.specs
    });
  }
  
  // Fittings (estimate based on components)
  const fittingCount = Math.ceil(components.length * 2);
  const fittingPricing = COMPONENT_PRICING.fitting_compression;
  
  components.push({
    componentType: 'fittings',
    description: 'Raccordi e accessori vari',
    quantity: fittingCount,
    unit: fittingPricing.unit,
    unitPrice: fittingPricing.unitPrice,
    totalPrice: fittingCount * fittingPricing.unitPrice,
    specs: fittingPricing.specs
  });
  
  return components;
}

/**
 * Determine water source
 */
function determineWaterSource(garden: Garden): 'mains' | 'well' | 'tank' | 'river' {
  // This would typically be user input or detected from infrastructure
  // For now, default to mains
  return 'mains';
}

/**
 * Generate design notes
 */
function generateDesignNotes(
  garden: Garden,
  zones: ZoneSuggestion[],
  systemType: string
): string[] {
  const notes: string[] = [];
  
  notes.push(`Sistema ${systemType} ottimizzato per ${garden.gardenType || 'orto'}`);
  notes.push(`${zones.length} zone irrigue indipendenti`);
  
  const totalDailyWater = zones.reduce((sum, z) => sum + z.dailyWaterRequirementLiters, 0);
  notes.push(`Fabbisogno idrico giornaliero: ${totalDailyWater.toFixed(1)} litri`);
  
  if (systemType === 'drip') {
    notes.push('Irrigazione a goccia: efficienza del 90%, riduzione evaporazione');
    notes.push('Ideale per colture ortive e frutteti');
  } else if (systemType === 'sprinkler') {
    notes.push('Irrigazione a pioggia: copertura uniforme aree estese');
    notes.push('Monitorare condizioni vento durante l\'irrigazione');
  }
  
  // Pressure considerations
  const maxPressure = Math.max(...zones.map(z => {
    const cropData = z.plantTypes.length > 0 ? getCropIrrigationData(z.plantTypes[0]) : null;
    return cropData?.maxPressureBar || 2.5;
  }));
  
  if (maxPressure > 2.5) {
    notes.push('Verificare pressione di rete sufficiente (necessaria > 2.5 bar)');
  }
  
  return notes;
}

/**
 * Generate limitations and considerations
 */
function generateLimitations(
  garden: Garden,
  zones: ZoneSuggestion[],
  systemType: string
): string[] {
  const limitations: string[] = [];
  
  if (!garden.coordinates) {
    limitations.push('Coordinate non disponibili: impossibile calcolare efficienza basata su meteo');
  }
  
  if (systemType === 'sprinkler') {
    limitations.push('Irrigazione a pioggia non consigliata in zone ventose');
    limitations.push('Efficienza ridotta (60-70%) rispetto a goccia');
  }
  
  if (zones.some(z => z.areaSqm > 1000)) {
    limitations.push('Zone molto estese potrebbero richiedere suddivisione aggiuntiva');
  }
  
  limitations.push('Costi stimati basati su prezzi medi di mercato');
  limitations.push('Installazione da parte di professionista consigliata per sistemi complessi');
  
  return limitations;
}
