import type { Garden } from '@/types';
import type { IStorageProvider } from '@/packages/core/storage/interface';
import type { GreenhouseBench } from '@/types/greenhouseBench';
import type { GreenhouseReading } from '@/types/greenhouseReading';
import type { AquaponicReading, HydroponicReading } from '@/types/indoorGrowing';
import {
  ControlledEnvironmentDashboardData,
  ControlledEnvironmentProfile,
  ControlledEnvironmentReadingSummary,
  ControlledEnvironmentType,
  GrowSiteProfile,
  LoopProfile,
  ReservoirProfile,
} from '@/types/controlledEnvironment';
import { createControlledEnvironmentExecutionService } from '@/services/controlledEnvironmentExecutionService';
import { getLatestControlledEnvironmentSensorSnapshot } from '@/services/sensorDataService';

const CONTROLLED_ENVIRONMENT_GARDEN_TYPES = [
  'Greenhouse',
  'Tunnel',
  'Indoor',
  'Hydroponic',
  'Aquaponic',
  'Aeroponic',
] as const;

type ControlledEnvironmentGardenType = (typeof CONTROLLED_ENVIRONMENT_GARDEN_TYPES)[number];

export function isControlledEnvironmentGarden(garden?: Garden | null): boolean {
  return Boolean(
    garden?.gardenType && CONTROLLED_ENVIRONMENT_GARDEN_TYPES.includes(garden.gardenType as ControlledEnvironmentGardenType)
  );
}

export function getControlledEnvironmentType(garden: Garden): ControlledEnvironmentType {
  switch (garden.gardenType) {
    case 'Greenhouse':
    case 'Tunnel':
      return 'greenhouse';
    case 'Indoor':
      return 'indoor';
    case 'Aquaponic':
      return 'aquaponic';
    case 'Aeroponic':
      return 'aeroponic';
    case 'Hydroponic':
    default:
      return 'hydroponic';
  }
}

export function buildControlledEnvironmentProfile(garden: Garden): ControlledEnvironmentProfile {
  const environmentType = getControlledEnvironmentType(garden);
  const systemMode =
    environmentType === 'greenhouse' || environmentType === 'indoor'
      ? 'soil_protected'
      : environmentType === 'aeroponic'
        ? 'drain_to_waste'
        : 'recirculating';

  return {
    id: `ce-env-${garden.id}`,
    gardenId: garden.id,
    environmentType,
    systemMode,
    validFrom: garden.createdAt,
    lightingProfile: garden.indoorConfig?.lighting
      ? { ...garden.indoorConfig.lighting }
      : undefined,
    climateProfile:
      garden.indoorConfig?.climate
      || (garden.greenhouseConfig
        ? {
            hasVentilation: garden.greenhouseConfig.hasVentilation,
            hasHeating: garden.greenhouseConfig.hasHeating,
            minTemp: garden.greenhouseConfig.minTemp,
            maxTemp: garden.greenhouseConfig.maxTemp,
          }
        : undefined),
    structureProfile: {
      gardenType: garden.gardenType,
      greenhouseConfig: garden.greenhouseConfig,
      structureConfig: garden.structureConfig,
    },
    automationProfile:
      garden.indoorConfig?.automation
      || garden.hydroponicConfig?.maintenance
      || garden.aquaponicConfig?.maintenance
      || garden.aeroponicConfig?.maintenance,
  };
}

function buildReservoirs(garden: Garden, profile: ControlledEnvironmentProfile): ReservoirProfile[] {
  const validFrom = profile.validFrom;

  if (garden.hydroponicConfig) {
    return [
      {
        id: `ce-reservoir-${garden.id}-main`,
        gardenId: garden.id,
        environmentProfileId: profile.id,
        name: 'Main reservoir',
        capacityLiters: garden.hydroponicConfig.nutrientSolution.reservoirCapacity,
        usableVolumeLiters:
          garden.hydroponicConfig.nutrientSolution.currentVolume
          || garden.hydroponicConfig.nutrientSolution.reservoirCapacity,
        waterSource: 'nutrient_solution',
        isShared: true,
        validFrom,
      },
    ];
  }

  if (garden.aquaponicConfig) {
    return [
      {
        id: `ce-reservoir-${garden.id}-fish-tank`,
        gardenId: garden.id,
        environmentProfileId: profile.id,
        name: 'Fish tank reservoir',
        capacityLiters: garden.aquaponicConfig.fishTank.capacity,
        usableVolumeLiters:
          garden.aquaponicConfig.fishTank.currentVolume
          || garden.aquaponicConfig.fishTank.capacity,
        waterSource: 'recirculating_aquaponic',
        isShared: true,
        validFrom,
      },
    ];
  }

  if (garden.aeroponicConfig) {
    return [
      {
        id: `ce-reservoir-${garden.id}-mist`,
        gardenId: garden.id,
        environmentProfileId: profile.id,
        name: 'Mist reservoir',
        capacityLiters: garden.aeroponicConfig.nutrientSolution.reservoirCapacity,
        usableVolumeLiters:
          garden.aeroponicConfig.nutrientSolution.currentVolume
          || garden.aeroponicConfig.nutrientSolution.reservoirCapacity,
        waterSource: 'mist_solution',
        isShared: true,
        validFrom,
      },
    ];
  }

  return [];
}

function buildLoops(
  garden: Garden,
  profile: ControlledEnvironmentProfile,
  reservoirs: ReservoirProfile[]
): LoopProfile[] {
  const reservoirId = reservoirs[0]?.id;
  const validFrom = profile.validFrom;

  if (garden.hydroponicConfig) {
    const loopTypeMap: Record<string, LoopProfile['loopType']> = {
      NFT: 'nft',
      DWC: 'dwc',
      EbbFlow: 'ebb_flow',
      Drip: 'drip_recirculating',
      Wick: 'drip_recirculating',
      Kratky: 'dwc',
    };

    return [
      {
        id: `ce-loop-${garden.id}-main`,
        gardenId: garden.id,
        environmentProfileId: profile.id,
        reservoirId,
        loopType: loopTypeMap[garden.hydroponicConfig.systemType] || 'drip_recirculating',
        pumpFlowRate:
          garden.hydroponicConfig.nftConfig?.flowRate
          || garden.hydroponicConfig.dripConfig?.dripperFlowRate,
        cycleFrequency:
          garden.hydroponicConfig.ebbFlowConfig?.floodFrequency
          || garden.hydroponicConfig.dripConfig?.timerFrequency,
        cycleDuration:
          garden.hydroponicConfig.ebbFlowConfig?.floodDuration
          || garden.hydroponicConfig.dripConfig?.timerDuration,
        drainMode: garden.hydroponicConfig.systemType === 'EbbFlow' ? 'flood_and_drain' : 'continuous',
        validFrom,
      },
    ];
  }

  if (garden.aquaponicConfig) {
    const loopType = garden.aquaponicConfig.systemType === 'MediaBed'
      ? 'aquaponic_media_bed'
      : 'aquaponic_nft';

    return [
      {
        id: `ce-loop-${garden.id}-main`,
        gardenId: garden.id,
        environmentProfileId: profile.id,
        reservoirId,
        loopType,
        pumpFlowRate: garden.aquaponicConfig.waterCycle.pumpFlowRate,
        cycleFrequency: garden.aquaponicConfig.waterCycle.cycleFrequency,
        cycleDuration: garden.aquaponicConfig.waterCycle.cycleDuration,
        drainMode: 'recirculating',
        validFrom,
      },
    ];
  }

  if (garden.aeroponicConfig) {
    return [
      {
        id: `ce-loop-${garden.id}-main`,
        gardenId: garden.id,
        environmentProfileId: profile.id,
        reservoirId,
        loopType: 'aeroponic',
        cycleFrequency: garden.aeroponicConfig.misting.mistFrequency,
        cycleDuration: garden.aeroponicConfig.misting.mistDuration,
        drainMode: garden.aeroponicConfig.rootChamber.hasDrainage ? 'drain_to_waste' : 'recapture',
        validFrom,
      },
    ];
  }

  if (profile.environmentType === 'greenhouse' || profile.environmentType === 'indoor') {
    return [
      {
        id: `ce-loop-${garden.id}-climate`,
        gardenId: garden.id,
        environmentProfileId: profile.id,
        loopType: 'manual_climate',
        drainMode: 'climate_control',
        validFrom,
      },
    ];
  }

  return [];
}

function expandCountedSites(
  count: number,
  builder: (index: number) => GrowSiteProfile
): GrowSiteProfile[] {
  return Array.from({ length: count }, (_, index) => builder(index));
}

function buildGrowSites(
  garden: Garden,
  profile: ControlledEnvironmentProfile,
  loops: LoopProfile[],
  greenhouseBenches: GreenhouseBench[]
): GrowSiteProfile[] {
  const loopId = loops[0]?.id;
  const validFrom = profile.validFrom;
  const structureConfig = garden.structureConfig;
  const sites: GrowSiteProfile[] = [];

  greenhouseBenches.forEach((bench, index) => {
    sites.push({
      id: `ce-site-bench-${bench.id}`,
      gardenId: garden.id,
      environmentProfileId: profile.id,
      loopId,
      siteType: 'bench',
      siteName: bench.name,
      positionIndex: index + 1,
      capacityPlants: bench.totalCapacity,
      rowLikeIndex: bench.benchNumber,
      zoneLikeLabel: bench.position,
      validFrom,
    });
  });

  if (structureConfig?.tanks?.length) {
    structureConfig.tanks.forEach((tank, groupIndex) => {
      sites.push(
        ...expandCountedSites(tank.count, (index) => ({
          id: `ce-site-tank-${garden.id}-${groupIndex + 1}-${index + 1}`,
          gardenId: garden.id,
          environmentProfileId: profile.id,
          loopId,
          siteType: 'tank',
          siteName: tank.name || `Tank ${groupIndex + 1}.${index + 1}`,
          positionIndex: index + 1,
          capacityPlants: tank.holes,
          validFrom,
        }))
      );
    });
  }

  if (structureConfig?.beds?.length) {
    structureConfig.beds.forEach((bed, groupIndex) => {
      sites.push(
        ...expandCountedSites(bed.count, (index) => ({
          id: `ce-site-bed-${garden.id}-${groupIndex + 1}-${index + 1}`,
          gardenId: garden.id,
          environmentProfileId: profile.id,
          loopId,
          siteType: 'bed',
          siteName: bed.name || `Bed ${groupIndex + 1}.${index + 1}`,
          positionIndex: index + 1,
          capacityPlants: bed.holes,
          validFrom,
        }))
      );
    });
  }

  if (structureConfig?.containers?.length) {
    structureConfig.containers.forEach((container, groupIndex) => {
      sites.push(
        ...expandCountedSites(container.count, (index) => ({
          id: `ce-site-container-${garden.id}-${groupIndex + 1}-${index + 1}`,
          gardenId: garden.id,
          environmentProfileId: profile.id,
          loopId,
          siteType: 'container',
          siteName: container.name || `Container ${groupIndex + 1}.${index + 1}`,
          positionIndex: index + 1,
          capacityPlants: container.holes,
          validFrom,
        }))
      );
    });
  }

  if (structureConfig?.pots?.length) {
    structureConfig.pots.forEach((pot, groupIndex) => {
      sites.push(
        ...expandCountedSites(pot.count, (index) => ({
          id: `ce-site-pot-${garden.id}-${groupIndex + 1}-${index + 1}`,
          gardenId: garden.id,
          environmentProfileId: profile.id,
          loopId,
          siteType: 'pot',
          siteName: pot.name || `Pot ${groupIndex + 1}.${index + 1}`,
          positionIndex: index + 1,
          capacityPlants: 1,
          validFrom,
        }))
      );
    });
  }

  if (sites.length === 0) {
    sites.push({
      id: `ce-site-${garden.id}-default`,
      gardenId: garden.id,
      environmentProfileId: profile.id,
      loopId,
      siteType: 'grow_tray',
      siteName: `${garden.name} main site`,
      positionIndex: 1,
      validFrom,
    });
  }

  return sites;
}

function normalizeHydroponicReadings(readings: HydroponicReading[]): ControlledEnvironmentReadingSummary[] {
  return readings.map((reading) => ({
    id: reading.id,
    sourceKind: 'hydroponic',
    recordedAt: reading.readingDate,
    title: 'Hydroponic reading',
    metrics: {
      pH: reading.ph ?? 'n/a',
      EC: reading.ec ?? 'n/a',
      temperatureC: reading.waterTemperature ?? 'n/a',
      reservoirLiters: reading.reservoirVolume ?? 'n/a',
    },
    notes: reading.notes,
  }));
}

function normalizeAquaponicReadings(readings: AquaponicReading[]): ControlledEnvironmentReadingSummary[] {
  return readings.map((reading) => ({
    id: reading.id,
    sourceKind: 'aquaponic',
    recordedAt: reading.readingDate,
    title: 'Aquaponic water test',
    metrics: {
      pH: reading.ph ?? 'n/a',
      ammonia: reading.ammonia ?? 'n/a',
      nitrite: reading.nitrite ?? 'n/a',
      nitrate: reading.nitrate ?? 'n/a',
      oxygen: reading.dissolvedOxygen ?? 'n/a',
    },
    notes: reading.notes,
  }));
}

function normalizeGreenhouseReadings(readings: GreenhouseReading[]): ControlledEnvironmentReadingSummary[] {
  return readings.map((reading) => ({
    id: reading.id,
    sourceKind: 'greenhouse',
    recordedAt: reading.timestamp,
    title: 'Climate reading',
    metrics: {
      internalTemperature: reading.internalTemperature,
      internalHumidity: reading.internalHumidity,
      co2: reading.co2Level ?? 'n/a',
      light: reading.lightIntensity ?? 'n/a',
    },
    notes: reading.notes,
  }));
}

export async function loadControlledEnvironmentDashboard(
  storageProvider: IStorageProvider,
  garden: Garden
): Promise<ControlledEnvironmentDashboardData> {
  const executionService = createControlledEnvironmentExecutionService(storageProvider);
  const profile = buildControlledEnvironmentProfile(garden);

  const [greenhouseBenches, hydroponicReadings, aquaponicReadings, greenhouseReadings, executions, observations, outcomes, plants, sensorSnapshot] =
    await Promise.all([
      storageProvider.getGreenhouseBenches?.(garden.id) || Promise.resolve([]),
      garden.hydroponicConfig ? storageProvider.getHydroponicReadings(garden.id, 12) : Promise.resolve([]),
      garden.aquaponicConfig ? storageProvider.getAquaponicReadings(garden.id, 12) : Promise.resolve([]),
      storageProvider.getGreenhouseReadings?.(garden.id, 12) || Promise.resolve([]),
      executionService.getRecentExecutions(garden.id, 12),
      executionService.getRecentObservations(garden.id, 12),
      executionService.getOutcomes(garden.id),
      storageProvider.getIndividualPlants?.(garden.id) || Promise.resolve([]),
      getLatestControlledEnvironmentSensorSnapshot(garden.id).catch(() => undefined),
    ]);

  const reservoirs = buildReservoirs(garden, profile);
  const loops = buildLoops(garden, profile, reservoirs);
  const growSites = buildGrowSites(garden, profile, loops, greenhouseBenches);

  const readings = [
    ...normalizeHydroponicReadings(hydroponicReadings),
    ...normalizeAquaponicReadings(aquaponicReadings),
    ...normalizeGreenhouseReadings(greenhouseReadings),
    ...observations.map((observation) => ({
      id: observation.id,
      sourceKind: 'observation' as const,
      recordedAt: observation.observedAt,
      title: observation.observationType,
      metrics: observation.payload,
      notes: observation.notes,
    })),
  ]
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, 20);

  const structuralInsights: string[] = [];

  if (reservoirs.length > 0) {
    structuralInsights.push(`${reservoirs.length} reservoir profile active`);
  }
  if (loops.length > 0) {
    structuralInsights.push(`${loops.length} loop profile available`);
  }
  if (growSites.length > 0) {
    structuralInsights.push(`${growSites.length} grow sites derived from saved structures`);
  }
  if (greenhouseBenches.length > 0) {
    structuralInsights.push(`${greenhouseBenches.length} greenhouse benches linked`);
  }
  if (readings.length === 0) {
    structuralInsights.push('No controlled-environment readings recorded yet');
  }

  return {
    environmentProfile: profile,
    reservoirs,
    loops,
    growSites,
    executions,
    observations,
    readings,
    recentOutcomeCount: outcomes.length,
    linkedPlantCount: plants.length,
    structuralInsights,
    sensorSnapshot: sensorSnapshot
      ? Object.fromEntries(
          Object.entries(sensorSnapshot)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
              const reading = value as { value?: number | string; unit?: string };
              return [key, `${reading.value ?? ''} ${reading.unit ?? ''}`.trim()];
            })
        )
      : undefined,
  };
}

export { CONTROLLED_ENVIRONMENT_GARDEN_TYPES };
