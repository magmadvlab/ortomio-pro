/**
 * Prescription Maps Service
 * Core engine per generazione mappe prescrizione precision farming
 */

import {
  PrescriptionMap,
  PrescriptionMapExportRecord,
  PrescriptionZone,
  PrescriptionExecutionRecord,
  PrescriptionGenerationRequest,
  PrescriptionGenerationResult,
  NDVIDataPoint,
  PlantDataPoint,
  SoilDataPoint,
  ZoneGenerationAlgorithm,
  PrescriptionAlgorithm,
  PrescriptionCostAnalysis
} from '../types/prescriptionMaps';
import {
  getPrescriptionExecutionEfficacySummary,
  getPrescriptionExecutionSummary,
  getPrescriptionExecutionVarianceSummary,
  getPrescriptionExecutionOutcomeSummary,
} from './prescriptionExecutionService';
import { getSupabaseClient } from '@/config/supabase'
import { getPersistedZoneEnvironmentalHistorySummary } from '@/services/environmentalMonitoringService'
import { getAgronomicMeasuredFeedbackRecords } from './agronomicMeasuredFeedbackService';
import { getAgronomicProfileLearningSnapshots } from './agronomicProfileLearningService';
import { buildPrescriptionAgronomicIntelligenceSummary } from './prescriptionAgronomicIntelligenceService';

export interface DataFusionResult {
  dataPoints: Array<{
    latitude: number;
    longitude: number;
    fusedValue: number;
    confidence: number;
    sources: string[];
  }>;
  quality: {
    completeness: number;
    accuracy: number;
    temporal_relevance: number;
  };
}

export interface ZoneGenerationResult {
  zones: Array<{
    id: string;
    geometry: any;
    centroid: { latitude: number; longitude: number };
    area: number;
    averageValue: number;
    confidence: number;
  }>;
  statistics: {
    totalZones: number;
    averageZoneSize: number;
    variabilityIndex: number;
  };
}

export interface PrescriptionMapFieldOpsSummary {
  totalExports: number
  generatedExports: number
  downloadedExports: number
  importedExports: number
  appliedExports: number
  linkedExecutions: number
  latestExport?: PrescriptionMapExportRecord
}

/**
 * PRESCRIPTION MAPS SERVICE
 */
export class PrescriptionMapsService {
  private storageProvider: any;

  constructor(storageProvider: any) {
    this.storageProvider = storageProvider;
  }

  private async sha256(value: unknown) {
    const encoded = new TextEncoder().encode(JSON.stringify(value))
    const digest = await crypto.subtle.digest('SHA-256', encoded)
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  async getPrescriptionMaps(gardenId: string): Promise<PrescriptionMap[]> {
    if (!this.storageProvider?.getPrescriptionMaps) {
      return [];
    }

    return this.storageProvider.getPrescriptionMaps(gardenId);
  }

  async getPrescriptionMapStats(gardenId: string) {
    const maps = await this.getPrescriptionMaps(gardenId);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const mapsGeneratedThisMonth = maps.filter((map) => {
      const generationDate = new Date(map.generationDate);
      return generationDate.getMonth() === currentMonth && generationDate.getFullYear() === currentYear;
    }).length;

    const average = (values: number[]) => (
      values.length > 0
        ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
        : 0
    );

    return {
      totalMapsGenerated: maps.length,
      mapsGeneratedThisMonth,
      totalAreaCovered: Number((maps.reduce((sum, map) => sum + map.areaHectares, 0)).toFixed(2)),
      popularMapTypes: maps.reduce((acc: Record<string, number>, map) => {
        acc[map.mapType] = (acc[map.mapType] || 0) + 1;
        return acc;
      }, {}),
      popularExportFormats: maps.reduce((acc: Record<string, number>, map) => {
        Object.entries(map.exportFormats).forEach(([format, enabled]) => {
          if (enabled) {
            acc[format] = (acc[format] || 0) + 1;
          }
        });
        return acc;
      }, {}),
      averageZonesPerMap: average(maps.map((map) => map.totalZones)),
      averageQualityScore: average(maps.map((map) => map.qualityScore)),
      averageDataCompleteness: average(maps.map((map) => map.dataCompleteness)),
      successRate: average(maps.map((map) => (map.validationStatus === 'invalid' ? 0 : 100))),
      totalCostSavings: Number((maps.reduce((sum, map) => sum + (map.costSavings || 0), 0)).toFixed(2)),
      averageRoi: average(maps.map((map) => map.costAnalysis?.roi || 0)),
      inputReductionAchieved: average(maps.map((map) => map.inputReduction || 0)),
      activeUsers: 1,
      mapsDownloaded: 0,
      machineryIntegrations: 0
    };
  }

  async getPrescriptionExecutionSummary(map: PrescriptionMap) {
    return getPrescriptionExecutionSummary(this.storageProvider, map);
  }

  async getPrescriptionExecutionVarianceSummary(map: PrescriptionMap) {
    return getPrescriptionExecutionVarianceSummary(this.storageProvider, map);
  }

  async getPrescriptionExecutionOutcomeSummary(map: PrescriptionMap) {
    return getPrescriptionExecutionOutcomeSummary(this.storageProvider, map);
  }

  async getPrescriptionExecutionEfficacySummary(map: PrescriptionMap) {
    return getPrescriptionExecutionEfficacySummary(this.storageProvider, map);
  }

  async getPrescriptionAgronomicIntelligenceSummary(map: PrescriptionMap) {
    const [efficacySummary, varianceSummary, outcomeSummary, measuredFeedbackRecords, learningSnapshots] = await Promise.all([
      this.getPrescriptionExecutionEfficacySummary(map),
      this.getPrescriptionExecutionVarianceSummary(map),
      this.getPrescriptionExecutionOutcomeSummary(map),
      getAgronomicMeasuredFeedbackRecords(this.storageProvider, map.gardenId).catch(() => []),
      getAgronomicProfileLearningSnapshots(this.storageProvider, map.gardenId).catch(() => []),
    ])
    const environmentalSummariesByZone = await this.getEnvironmentalSummariesByZone(map, efficacySummary.zoneScores.map((zone) => zone.zoneId))

    return buildPrescriptionAgronomicIntelligenceSummary(
      map,
      efficacySummary,
      varianceSummary,
      outcomeSummary,
      measuredFeedbackRecords,
      learningSnapshots,
      environmentalSummariesByZone
    )
  }

  private async getEnvironmentalSummariesByZone(map: PrescriptionMap, zoneIds: string[]) {
    const ownerId = await this.resolveMapOwnerId(map)
    if (!ownerId || zoneIds.length === 0) {
      return undefined
    }

    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const summaries = await Promise.all(
      Array.from(new Set(zoneIds)).map(async (zoneId) => ({
        zoneId,
        summary: await getPersistedZoneEnvironmentalHistorySummary({
          userId: ownerId,
          gardenId: map.gardenId,
          zoneId,
          startDate,
          endDate,
        }).catch(() => null),
      }))
    )

    return Object.fromEntries(summaries.map((entry) => [entry.zoneId, entry.summary]))
  }

  private async resolveMapOwnerId(map: PrescriptionMap): Promise<string | null> {
    if (map.createdBy) {
      return map.createdBy
    }

    if (this.storageProvider?.getGarden) {
      const garden = await this.storageProvider.getGarden(map.gardenId).catch(() => null)
      const ownerId = garden?.user_id || garden?.userId || garden?.ownerId
      if (typeof ownerId === 'string' && ownerId) {
        return ownerId
      }
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return null
    }

    const { data } = await supabase
      .from('gardens')
      .select('user_id')
      .eq('id', map.gardenId)
      .maybeSingle()

    return typeof data?.user_id === 'string' ? data.user_id : null
  }

  async getPrescriptionMapExportRecords(
    map: PrescriptionMap,
    options?: {
      format?: PrescriptionMapExportRecord['format']
      status?: PrescriptionMapExportRecord['status']
      limit?: number
    }
  ): Promise<PrescriptionMapExportRecord[]> {
    if (!this.storageProvider?.getPrescriptionMapExportRecords) {
      return []
    }

    return this.storageProvider.getPrescriptionMapExportRecords(map.id, options)
  }

  async getPrescriptionMapFieldOpsSummary(map: PrescriptionMap): Promise<PrescriptionMapFieldOpsSummary> {
    const [exports, records] = await Promise.all([
      this.getPrescriptionMapExportRecords(map, { limit: 50 }),
      this.storageProvider?.getPrescriptionExecutionRecords
        ? this.storageProvider.getPrescriptionExecutionRecords(map.id, { limit: 300 })
        : Promise.resolve([] as PrescriptionExecutionRecord[]),
    ])

    return {
      totalExports: exports.length,
      generatedExports: exports.filter((item: PrescriptionMapExportRecord) => item.status === 'generated').length,
      downloadedExports: exports.filter((item: PrescriptionMapExportRecord) => item.status === 'downloaded').length,
      importedExports: exports.filter((item: PrescriptionMapExportRecord) => item.status === 'field_imported').length,
      appliedExports: exports.filter((item: PrescriptionMapExportRecord) => item.status === 'field_applied').length,
      linkedExecutions: records.filter((item: PrescriptionExecutionRecord) => Boolean(item.prescriptionExportId)).length,
      latestExport: exports[0],
    }
  }

  async createPrescriptionMapRevision(
    mapId: string,
    overrides: Partial<PrescriptionMap> = {}
  ): Promise<PrescriptionMap> {
    if (!this.storageProvider?.getPrescriptionMap || !this.storageProvider?.createPrescriptionMap) {
      throw new Error('Storage provider non supporta il versioning operativo delle prescription maps')
    }

    const currentMap = await this.storageProvider.getPrescriptionMap(mapId)
    if (!currentMap) {
      throw new Error('Prescription map sorgente non trovata per creare una revisione')
    }

    const nextVersionNumber = (currentMap.versionNumber || 1) + 1
    const rootVersionId = currentMap.rootVersionId || currentMap.id
    const baseName = currentMap.name.replace(/\s+v\d+$/i, '')

    return this.storageProvider.createPrescriptionMap({
      ...currentMap,
      ...overrides,
      name: overrides.name || `${baseName} v${nextVersionNumber}`,
      versionNumber: nextVersionNumber,
      versionLabel: `v${nextVersionNumber}`,
      rootVersionId,
      parentVersionId: currentMap.id,
      exportCount: 0,
      lastExportedAt: undefined,
      lastExecutedAt: undefined,
      // Una revisione che cambia contenuto non puo ereditare checksum e input
      // della versione precedente. L'export resta chiuso finche non vengono
      // forniti metadati ricalcolati esplicitamente.
      algorithmMetadata: overrides.algorithmMetadata,
      contentChecksum: overrides.contentChecksum,
      zones: (overrides.zones || currentMap.zones).map((zone: PrescriptionZone) => ({
        ...zone,
        id: crypto.randomUUID(),
        prescriptionMapId: '',
      })),
    })
  }

  async recordZoneExecution(
    map: PrescriptionMap,
    zone: PrescriptionZone,
    payload: {
      executionStatus: PrescriptionExecutionRecord['executionStatus']
      actualRate?: number
      areaAppliedSqm?: number
      operatorName?: string
      notes?: string
      sourceOperationType?: PrescriptionExecutionRecord['sourceOperationType']
      sourceOperationId?: string
      prescriptionExportId?: string
      smartDeviceId?: string
    }
  ): Promise<PrescriptionExecutionRecord> {
    if (!this.storageProvider?.createPrescriptionExecutionRecord) {
      throw new Error('Storage provider non supporta la registrazione delle esecuzioni prescrittive')
    }

    const plannedRate = zone.prescription.applicationRate
    const plannedAreaSqm = zone.areaSqm

    const actualRate = payload.actualRate ?? (
      payload.executionStatus === 'completed'
        ? plannedRate
        : payload.executionStatus === 'partial'
          ? Number((plannedRate * 0.7).toFixed(2))
          : undefined
    )

    const areaAppliedSqm = payload.areaAppliedSqm ?? (
      payload.executionStatus === 'completed'
        ? plannedAreaSqm
        : payload.executionStatus === 'partial'
          ? Number((plannedAreaSqm * 0.6).toFixed(2))
          : 0
    )

    const applicationAccuracy = payload.executionStatus === 'missed'
      ? 0
      : plannedRate > 0 && typeof actualRate === 'number'
        ? Number((100 - Math.min(100, Math.abs(((actualRate - plannedRate) / plannedRate) * 100))).toFixed(2))
        : undefined

    const totalProductUsed = typeof actualRate === 'number'
      ? Number(((actualRate * areaAppliedSqm) / 10000).toFixed(4))
      : 0

    const createdRecord = await this.storageProvider.createPrescriptionExecutionRecord({
      prescriptionMapId: map.id,
      prescriptionZoneId: zone.id,
      applicationDate: new Date().toISOString(),
      productName: zone.prescription.productName || map.name,
      productType: zone.prescription.productType || map.mapType,
      plannedRate,
      actualRate,
      unit: zone.prescription.unit,
      plannedAreaSqm,
      areaAppliedSqm,
      totalProductUsed,
      applicationAccuracy,
      notes: payload.notes,
      operatorName: payload.operatorName,
      executionStatus: payload.executionStatus,
      executionScopeType: 'zone',
      executionScopeId: zone.id,
      sourceOperationType: payload.sourceOperationType || 'manual',
      sourceOperationId: payload.sourceOperationId,
      prescriptionExportId: payload.prescriptionExportId,
      smartDeviceId: payload.smartDeviceId,
    })

    if (this.storageProvider?.updatePrescriptionMap) {
      await this.storageProvider.updatePrescriptionMap(map.id, {
        lastExecutedAt: createdRecord.applicationDate,
      }).catch(() => undefined)
    }

    if (payload.prescriptionExportId && this.storageProvider?.updatePrescriptionMapExportRecord) {
      await this.storageProvider.updatePrescriptionMapExportRecord(payload.prescriptionExportId, {
        status: 'field_applied',
        appliedAt: createdRecord.applicationDate,
      }).catch(() => undefined)
    }

    return createdRecord
  }

  /**
   * Generate prescription map from multiple data sources
   */
  async generatePrescriptionMap(
    request: PrescriptionGenerationRequest
  ): Promise<PrescriptionGenerationResult> {
    const startTime = Date.now();
    
    try {
      // 1. Validate request
      const validationErrors = this.validateGenerationRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
          stats: { zonesGenerated: 0, totalArea: 0, dataPointsAnalyzed: 0, processingTimeMs: 0 },
          quality: { overallScore: 0, dataCompleteness: 0, spatialAccuracy: 0, temporalRelevance: 0 }
        };
      }

      // 2. Collect and fuse data sources
      const fusionResult = await this.fuseDataSources(request);
      
      if (fusionResult.dataPoints.length === 0) {
        return {
          success: false,
          errors: ['No data points available for the specified area and time period'],
          stats: { zonesGenerated: 0, totalArea: 0, dataPointsAnalyzed: 0, processingTimeMs: Date.now() - startTime },
          quality: { overallScore: 0, dataCompleteness: 0, spatialAccuracy: 0, temporalRelevance: 0 }
        };
      }

      // 3. Generate zones using clustering algorithm
      const zoneResult = await this.generateZones(fusionResult.dataPoints, request.zoneConfig);

      // 4. Calculate prescriptions for each zone
      const zones = await this.calculatePrescriptions(zoneResult.zones, request.prescriptionConfig);

      // 5. Perform cost analysis
      const costAnalysis = await this.calculateCostAnalysis(zones, request);
      const inputHash = await this.sha256({ request, dataPoints: fusionResult.dataPoints })
      const contentChecksum = await this.sha256({ zones, mapType: request.mapType, inputHash })

      // 6. Create prescription map record
      const prescriptionMap = await this.createPrescriptionMapRecord({
        ...request,
        zones,
        costAnalysis,
        quality: fusionResult.quality,
        algorithmMetadata: {
          algorithmVersion: 'prescription-fusion-kmeans-v2',
          inputHash,
          sourceQuality: fusionResult.dataPoints.every(point => point.sources.includes('ndvi')) ? 'measured' : 'mixed',
          generatedFrom: Array.from(new Set(fusionResult.dataPoints.flatMap(point => point.sources))).sort(),
        },
        contentChecksum,
      });

      // 7. Return result
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        prescriptionMapId: prescriptionMap.id,
        stats: {
          zonesGenerated: zones.length,
          totalArea: zones.reduce((sum, zone) => sum + zone.areaSqm, 0),
          dataPointsAnalyzed: fusionResult.dataPoints.length,
          processingTimeMs: processingTime
        },
        quality: {
          overallScore: this.calculateOverallQuality(fusionResult.quality, zones),
          dataCompleteness: fusionResult.quality.completeness,
          spatialAccuracy: fusionResult.quality.accuracy,
          temporalRelevance: fusionResult.quality.temporal_relevance
        }
      };

    } catch (error) {
      console.error('Error generating prescription map:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error during generation'],
        stats: { zonesGenerated: 0, totalArea: 0, dataPointsAnalyzed: 0, processingTimeMs: Date.now() - startTime },
        quality: { overallScore: 0, dataCompleteness: 0, spatialAccuracy: 0, temporalRelevance: 0 }
      };
    }
  }

  /**
   * Fuse multiple data sources into unified dataset
   */
  private async fuseDataSources(request: PrescriptionGenerationRequest): Promise<DataFusionResult> {
    const dataPoints: Array<{
      latitude: number;
      longitude: number;
      fusedValue: number;
      confidence: number;
      sources: string[];
    }> = [];

    // Get garden bounds for spatial filtering
    const gardenBounds = await this.getGardenBounds(request.gardenId);
    
    // Collect NDVI data
    let ndviData: NDVIDataPoint[] = [];
    if (request.dataSources.ndviWeight > 0) {
      ndviData = await this.getNDVIData(
        request.gardenId,
        request.analysisPeriod.startDate,
        request.analysisPeriod.endDate,
        gardenBounds
      );
      const distinctLocations = new Set(ndviData.map(point => `${point.latitude.toFixed(6)}:${point.longitude.toFixed(6)}`))
      const distinctValues = new Set(ndviData.map(point => point.ndviValue.toFixed(4)))
      if (distinctLocations.size < 3 || distinctValues.size < 2) {
        return { dataPoints: [], quality: { completeness: 0, accuracy: 0, temporal_relevance: 0 } }
      }
    }

    // Collect plant-level data
    let plantData: PlantDataPoint[] = [];
    if (request.dataSources.plantHealthWeight > 0) {
      plantData = await this.getPlantLevelData(
        request.gardenId,
        request.analysisPeriod.startDate,
        request.analysisPeriod.endDate
      );
    }

    // Collect soil data
    let soilData: SoilDataPoint[] = [];
    if (request.dataSources.soilWeight > 0) {
      soilData = await this.getSoilData(request.gardenId, gardenBounds);
    }

    // Create spatial grid for data fusion
    const gridSize = 10; // 10 meter grid
    const grid = this.createSpatialGrid(gardenBounds, gridSize);

    // Fuse data for each grid cell
    for (const cell of grid) {
      const fusedPoint = this.fuseDataForPoint(
        cell,
        ndviData,
        plantData,
        soilData,
        request.dataSources
      );

      if (fusedPoint.confidence > 0.3) { // Minimum confidence threshold
        dataPoints.push(fusedPoint);
      }
    }

    // Calculate quality metrics
    const quality = {
      completeness: this.calculateDataCompleteness(dataPoints, grid.length),
      accuracy: this.calculateDataAccuracy(dataPoints),
      temporal_relevance: this.calculateTemporalRelevance(
        request.analysisPeriod.startDate,
        request.analysisPeriod.endDate
      )
    };

    return { dataPoints, quality };
  }

  /**
   * Generate zones using clustering algorithm
   */
  private async generateZones(
    dataPoints: Array<{ latitude: number; longitude: number; fusedValue: number; confidence: number }>,
    zoneConfig: PrescriptionGenerationRequest['zoneConfig']
  ): Promise<ZoneGenerationResult> {
    
    // Use K-means clustering for zone generation
    const clusters = this.performKMeansClustering(
      dataPoints,
      Math.min(zoneConfig.maxZones, Math.ceil(dataPoints.length / 10))
    );

    const zones = clusters.map((cluster, index) => {
      const geometry = this.createPolygonFromPoints(cluster.points);
      const centroid = this.calculateCentroid(cluster.points);
      const area = this.calculatePolygonArea(geometry);

      return {
        id: `zone_${index + 1}`,
        geometry,
        centroid,
        area,
        averageValue: cluster.averageValue,
        confidence: cluster.confidence
      };
    }).filter(zone => zone.area >= zoneConfig.minZoneSize);

    // Apply smoothing if requested
    if (zoneConfig.smoothingFactor > 0) {
      // Implement polygon smoothing algorithm
      // For now, return zones as-is
    }

    const statistics = {
      totalZones: zones.length,
      averageZoneSize: zones.reduce((sum, z) => sum + z.area, 0) / zones.length,
      variabilityIndex: this.calculateVariabilityIndex(zones)
    };

    return { zones, statistics };
  }

  /**
   * Calculate prescriptions for each zone
   */
  private async calculatePrescriptions(
    zones: ZoneGenerationResult['zones'],
    prescriptionConfig: PrescriptionGenerationRequest['prescriptionConfig']
  ): Promise<PrescriptionZone[]> {
    
    return zones.map((zone, index) => {
      // Calculate application rate based on zone value
      let applicationRate = prescriptionConfig.baseRate;
      
      if (prescriptionConfig.variableRateEnabled) {
        // Adjust rate based on zone's average value
        // Higher NDVI/health = lower fertilizer rate (for fertilizer maps)
        const adjustment = (zone.averageValue - 0.5) * prescriptionConfig.maxVariation / 100;
        applicationRate = prescriptionConfig.baseRate * (1 - adjustment);
        
        // Ensure rate stays within reasonable bounds
        applicationRate = Math.max(
          prescriptionConfig.baseRate * 0.5,
          Math.min(prescriptionConfig.baseRate * 1.5, applicationRate)
        );
      }

      return {
        id: crypto.randomUUID(),
        prescriptionMapId: '', // Will be set when saving
        zoneNumber: index + 1,
        zoneName: `Zone ${index + 1}`,
        zoneType: 'uniform' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: zone.geometry.coordinates
        },
        centroid: zone.centroid,
        areaSqm: zone.area,
        prescription: {
          applicationRate: Math.round(applicationRate * 100) / 100,
          unit: prescriptionConfig.unit,
          productName: prescriptionConfig.productName,
          applicationMethod: prescriptionConfig.variableRateEnabled ? 'variable_rate' : 'broadcast',
          variableRate: prescriptionConfig.variableRateEnabled ? {
            minRate: prescriptionConfig.baseRate * 0.5,
            maxRate: prescriptionConfig.baseRate * 1.5,
            rateFunction: 'linear',
            parameters: { baseRate: prescriptionConfig.baseRate }
          } : undefined
        },
        sourceData: {
          avgNdvi: zone.averageValue,
          plantCount: 0, // Would be calculated from actual plant data
          avgPlantHealth: zone.averageValue * 100,
          soilType: 'mixed'
        },
        dataQuality: Math.round(zone.confidence * 100),
        confidence: Math.round(zone.confidence * 100),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }

  /**
   * Calculate cost analysis for prescription map
   */
  private async calculateCostAnalysis(
    zones: PrescriptionZone[],
    request: PrescriptionGenerationRequest
  ): Promise<PrescriptionCostAnalysis> {
    
    const totalArea = zones.reduce((sum, zone) => sum + zone.areaSqm, 0);
    const totalAreaHa = totalArea / 10000; // Convert to hectares
    
    // Calculate input costs
    const avgApplicationRate = zones.reduce((sum, zone) => 
      sum + zone.prescription.applicationRate * zone.areaSqm, 0
    ) / totalArea;
    
    const productCostPerUnit = this.getProductCost(request.prescriptionConfig.productName || 'generic');
    const totalInputCost = (avgApplicationRate * totalAreaHa * productCostPerUnit);
    
    // Calculate application costs
    const applicationCostPerHa = 25; // €25/ha for application
    const applicationCost = totalAreaHa * applicationCostPerHa;
    
    // Calculate uniform application cost for comparison
    const uniformRate = request.prescriptionConfig.baseRate;
    const uniformInputCost = uniformRate * totalAreaHa * productCostPerUnit;
    const uniformApplicationCost = applicationCost; // Same application cost
    const uniformTotalCost = uniformInputCost + uniformApplicationCost;
    
    // Calculate expected benefits
    const expectedYieldIncrease = 0.15; // 15% yield increase from precision application
    const expectedRevenuePerHa = 3000; // €3000/ha average revenue
    const expectedRevenue = totalAreaHa * expectedRevenuePerHa * expectedYieldIncrease;
    
    const totalCost = totalInputCost + applicationCost;
    const expectedProfit = expectedRevenue - totalCost;
    const roi = totalCost > 0 ? (expectedProfit / totalCost) * 100 : 0;
    
    const savingsVsUniform = uniformTotalCost - totalCost;
    const inputReduction = uniformInputCost > 0 ? 
      ((uniformInputCost - totalInputCost) / uniformInputCost) * 100 : 0;

    return {
      totalInputCost: Math.round(totalInputCost * 100) / 100,
      costPerHectare: Math.round((totalCost / totalAreaHa) * 100) / 100,
      costPerZone: zones.reduce((acc, zone) => {
        const zoneAreaHa = zone.areaSqm / 10000;
        const zoneCost = zone.prescription.applicationRate * zoneAreaHa * productCostPerUnit;
        acc[zone.id] = Math.round(zoneCost * 100) / 100;
        return acc;
      }, {} as Record<string, number>),
      
      applicationCost: Math.round(applicationCost * 100) / 100,
      machineryHours: Math.round((totalAreaHa / 8) * 100) / 100, // 8 ha/hour average
      laborHours: Math.round((totalAreaHa / 6) * 100) / 100, // 6 ha/hour average
      
      expectedYieldIncrease: Math.round(expectedYieldIncrease * 100),
      expectedRevenue: Math.round(expectedRevenue * 100) / 100,
      expectedProfit: Math.round(expectedProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      
      uniformApplicationCost: Math.round(uniformTotalCost * 100) / 100,
      savingsVsUniform: Math.round(savingsVsUniform * 100) / 100,
      efficiencyGain: Math.round((savingsVsUniform / uniformTotalCost) * 100 * 100) / 100,
      
      inputReduction: Math.round(inputReduction * 100) / 100,
      environmentalScore: Math.min(100, Math.round(inputReduction + 20)) // Base environmental score
    };
  }

  /**
   * HELPER METHODS
   */

  private validateGenerationRequest(request: PrescriptionGenerationRequest): string[] {
    const errors: string[] = [];

    if (!request.gardenId) errors.push('Garden ID is required');
    if (!request.name) errors.push('Map name is required');
    if (!request.mapType) errors.push('Map type is required');
    
    // Validate data source weights
    const totalWeight = Object.values(request.dataSources).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) {
      errors.push('At least one data source must have weight > 0');
    }
    if (Object.values(request.dataSources).some(weight => !Number.isFinite(weight) || weight < 0 || weight > 1)) {
      errors.push('Data source weights must be between 0 and 1');
    }
    const periodStart = new Date(request.analysisPeriod?.startDate)
    const periodEnd = new Date(request.analysisPeriod?.endDate)
    if (!Number.isFinite(periodStart.getTime()) || !Number.isFinite(periodEnd.getTime()) || periodStart > periodEnd) {
      errors.push('Analysis period is invalid');
    }

    // Validate zone configuration
    if (request.zoneConfig.maxZones < 1) {
      errors.push('Maximum zones must be at least 1');
    }
    if (request.zoneConfig.minZoneSize < 100) {
      errors.push('Minimum zone size must be at least 100 m²');
    }

    // Validate prescription configuration
    if (request.prescriptionConfig.baseRate <= 0) {
      errors.push('Base application rate must be greater than 0');
    }

    return errors;
  }

  private async getGardenBounds(gardenId: string): Promise<{
    minLat: number; maxLat: number; minLon: number; maxLon: number;
  }> {
    if (!this.storageProvider?.getGarden) throw new Error('Garden storage richiesto per la geometria prescrittiva')
    const garden = await this.storageProvider.getGarden(gardenId)
    if (!garden) throw new Error('Garden non trovato')
    const points = Array.isArray(garden.points) ? garden.points.flatMap((point: any) => {
      const latitude = Number(point.latitude ?? point.coordinates?.latitude)
      const longitude = Number(point.longitude ?? point.coordinates?.longitude)
      return Number.isFinite(latitude) && Number.isFinite(longitude) ? [{ latitude, longitude }] : []
    }) : []
    if (points.length >= 3) return {
      minLat: Math.min(...points.map((point: any) => point.latitude)), maxLat: Math.max(...points.map((point: any) => point.latitude)),
      minLon: Math.min(...points.map((point: any) => point.longitude)), maxLon: Math.max(...points.map((point: any) => point.longitude)),
    }
    const latitude = Number(garden.coordinates?.latitude)
    const longitude = Number(garden.coordinates?.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('Geometria o coordinate garden insufficienti')
    const buffer = 0.001
    return { minLat: latitude - buffer, maxLat: latitude + buffer, minLon: longitude - buffer, maxLon: longitude + buffer };
  }

  private async getNDVIData(
    gardenId: string,
    startDate: string,
    endDate: string,
    bounds: any
  ): Promise<NDVIDataPoint[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []
    const { data, error } = await supabase.from('ndvi_data_cache')
      .select('latitude, longitude, ndvi_value, data_date, data_quality, source_kind, algorithm_version')
      .eq('garden_id', gardenId).eq('source_kind', 'real').in('quality_status', ['accepted', 'warning'])
      .gte('data_date', startDate).lte('data_date', endDate).order('data_date', { ascending: false }).limit(5000)
    if (error) throw new Error(`NDVI cache read failed: ${error.message}`)
    return (data ?? []).map((row: any) => ({
      latitude: Number(row.latitude), longitude: Number(row.longitude), ndviValue: Number(row.ndvi_value),
      date: row.data_date, quality: Number(row.data_quality), sourceKind: row.source_kind, algorithmVersion: row.algorithm_version,
    }));
  }

  private async getPlantLevelData(
    gardenId: string,
    startDate: string,
    endDate: string
  ): Promise<PlantDataPoint[]> {
    // This would query individual plant data
    // For now, return sample data
    return [];
  }

  private async getSoilData(gardenId: string, bounds: any): Promise<SoilDataPoint[]> {
    // This would query soil data
    // For now, return sample data
    return [];
  }

  private createSpatialGrid(bounds: any, gridSize: number): Array<{
    latitude: number; longitude: number;
  }> {
    const grid: Array<{ latitude: number; longitude: number }> = [];
    
    // Convert grid size from meters to degrees (approximate)
    const latStep = gridSize / 111000; // ~111km per degree latitude
    const lonStep = gridSize / (111000 * Math.cos(bounds.minLat * Math.PI / 180));
    
    for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += latStep) {
      for (let lon = bounds.minLon; lon <= bounds.maxLon; lon += lonStep) {
        grid.push({ latitude: lat, longitude: lon });
      }
    }
    
    return grid;
  }

  private fuseDataForPoint(
    point: { latitude: number; longitude: number },
    ndviData: NDVIDataPoint[],
    plantData: PlantDataPoint[],
    soilData: SoilDataPoint[],
    weights: PrescriptionGenerationRequest['dataSources']
  ): { latitude: number; longitude: number; fusedValue: number; confidence: number; sources: string[] } {
    
    let fusedValue = 0;
    let totalWeight = 0;
    const sources: string[] = [];
    
    // Find nearest NDVI data point
    if (weights.ndviWeight > 0 && ndviData.length > 0) {
      const nearestNDVI = this.findNearestDataPoint(point, ndviData);
      if (nearestNDVI && this.calculateDistance(point, nearestNDVI) < 50) { // Within 50m
        fusedValue += nearestNDVI.ndviValue * weights.ndviWeight;
        totalWeight += weights.ndviWeight;
        sources.push('ndvi');
      }
    }
    
    // Find nearest plant data
    if (weights.plantHealthWeight > 0 && plantData.length > 0) {
      const nearestPlant = this.findNearestDataPoint(point, plantData);
      if (nearestPlant && this.calculateDistance(point, nearestPlant) < 20) { // Within 20m
        const normalizedHealth = nearestPlant.healthScore / 100; // Normalize to 0-1
        fusedValue += normalizedHealth * weights.plantHealthWeight;
        totalWeight += weights.plantHealthWeight;
        sources.push('plant_health');
      }
    }
    
    // Add soil data influence
    if (weights.soilWeight > 0 && soilData.length > 0) {
      const nearestSoil = this.findNearestDataPoint(point, soilData);
      if (nearestSoil && this.calculateDistance(point, nearestSoil) < 100) { // Within 100m
        // Convert soil properties to 0-1 scale (simplified)
        const soilValue = 0.7; // Placeholder soil quality score
        fusedValue += soilValue * weights.soilWeight;
        totalWeight += weights.soilWeight;
        sources.push('soil');
      }
    }
    
    // Normalize fused value
    if (totalWeight > 0) {
      fusedValue = fusedValue / totalWeight;
    }
    
    const confidence = totalWeight / (weights.ndviWeight + weights.plantHealthWeight + weights.soilWeight);
    
    return {
      latitude: point.latitude,
      longitude: point.longitude,
      fusedValue,
      confidence,
      sources
    };
  }

  private findNearestDataPoint<T extends { latitude: number; longitude: number }>(
    point: { latitude: number; longitude: number },
    dataPoints: T[]
  ): T | null {
    if (dataPoints.length === 0) return null;
    
    let nearest = dataPoints[0];
    let minDistance = this.calculateDistance(point, nearest);
    
    for (const dataPoint of dataPoints.slice(1)) {
      const distance = this.calculateDistance(point, dataPoint);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = dataPoint;
      }
    }
    
    return nearest;
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    // Haversine formula for distance calculation
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private performKMeansClustering(
    dataPoints: Array<{ latitude: number; longitude: number; fusedValue: number }>,
    k: number
  ): Array<{
    points: Array<{ latitude: number; longitude: number; fusedValue: number }>;
    averageValue: number;
    confidence: number;
  }> {
    // Simplified K-means implementation
    // In production, would use more sophisticated clustering
    
    const clusters: Array<{
      points: Array<{ latitude: number; longitude: number; fusedValue: number }>;
      averageValue: number;
      confidence: number;
    }> = [];
    
    // Initialize clusters
    for (let i = 0; i < k; i++) {
      clusters.push({
        points: [],
        averageValue: 0,
        confidence: 0
      });
    }
    
    // Simple assignment based on value ranges
    const sortedPoints = [...dataPoints].sort((a, b) => a.fusedValue - b.fusedValue);
    const pointsPerCluster = Math.ceil(sortedPoints.length / k);
    
    for (let i = 0; i < k; i++) {
      const startIdx = i * pointsPerCluster;
      const endIdx = Math.min(startIdx + pointsPerCluster, sortedPoints.length);
      const clusterPoints = sortedPoints.slice(startIdx, endIdx);
      
      if (clusterPoints.length > 0) {
        clusters[i].points = clusterPoints;
        clusters[i].averageValue = clusterPoints.reduce((sum, p) => sum + p.fusedValue, 0) / clusterPoints.length;
        clusters[i].confidence = 0.8; // Simplified confidence calculation
      }
    }
    
    return clusters.filter(cluster => cluster.points.length > 0);
  }

  private createPolygonFromPoints(points: Array<{ latitude: number; longitude: number }>): any {
    // Create convex hull polygon from points
    // Simplified implementation - in production would use proper convex hull algorithm
    
    if (points.length < 3) {
      // Create a small square around the point(s)
      const center = points[0] || { latitude: 0, longitude: 0 };
      const offset = 0.0001; // ~10m offset
      
      return {
        coordinates: [[
          [center.longitude - offset, center.latitude - offset],
          [center.longitude + offset, center.latitude - offset],
          [center.longitude + offset, center.latitude + offset],
          [center.longitude - offset, center.latitude + offset],
          [center.longitude - offset, center.latitude - offset]
        ]]
      };
    }
    
    // For multiple points, create bounding box
    const lats = points.map(p => p.latitude);
    const lons = points.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    return {
      coordinates: [[
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat]
      ]]
    };
  }

  private calculateCentroid(points: Array<{ latitude: number; longitude: number }>): { latitude: number; longitude: number } {
    if (points.length === 0) return { latitude: 0, longitude: 0 };
    
    const sumLat = points.reduce((sum, p) => sum + p.latitude, 0);
    const sumLon = points.reduce((sum, p) => sum + p.longitude, 0);
    
    return {
      latitude: sumLat / points.length,
      longitude: sumLon / points.length
    };
  }

  private calculatePolygonArea(geometry: any): number {
    // Simplified area calculation
    // In production would use proper geographic area calculation
    
    const coords = geometry.coordinates[0];
    if (coords.length < 4) return 100; // Minimum area
    
    // Calculate approximate area using bounding box
    const lons = coords.map((c: number[]) => c[0]);
    const lats = coords.map((c: number[]) => c[1]);
    const width = (Math.max(...lons) - Math.min(...lons)) * 111000; // Convert to meters
    const height = (Math.max(...lats) - Math.min(...lats)) * 111000;
    
    return Math.max(100, width * height * 0.7); // 70% of bounding box area
  }

  private calculateDataCompleteness(dataPoints: any[], totalGridCells: number): number {
    return Math.min(100, (dataPoints.length / totalGridCells) * 100);
  }

  private calculateDataAccuracy(dataPoints: any[]): number {
    // Simplified accuracy calculation based on confidence scores
    if (dataPoints.length === 0) return 0;
    
    const avgConfidence = dataPoints.reduce((sum, p) => sum + p.confidence, 0) / dataPoints.length;
    return Math.round(avgConfidence * 100);
  }

  private calculateTemporalRelevance(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    const daysSinceEnd = (now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24);
    
    // Relevance decreases with time
    if (daysSinceEnd <= 7) return 100;
    if (daysSinceEnd <= 30) return 80;
    if (daysSinceEnd <= 90) return 60;
    return 40;
  }

  private calculateVariabilityIndex(zones: any[]): number {
    if (zones.length <= 1) return 0;
    
    const values = zones.map(z => z.averageValue);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    return Math.round(Math.sqrt(variance) * 100);
  }

  private calculateOverallQuality(fusionQuality: any, zones: any[]): number {
    const qualityScores = [
      fusionQuality.completeness,
      fusionQuality.accuracy,
      fusionQuality.temporal_relevance,
      zones.length > 0 ? zones.reduce((sum, z) => sum + z.confidence, 0) / zones.length * 100 : 0
    ];
    
    return Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length);
  }

  private getProductCost(productName: string): number {
    // Simplified product cost lookup
    const costs: Record<string, number> = {
      'fertilizer': 1.2, // €1.2 per kg
      'seed': 0.8, // €0.8 per unit
      'pesticide': 15.0, // €15 per liter
      'generic': 2.0
    };
    
    return costs[productName.toLowerCase()] || costs.generic;
  }

  private async createPrescriptionMapRecord(data: any): Promise<PrescriptionMap> {
    const totalAreaSqm = data.zones.reduce((sum: number, zone: any) => sum + zone.areaSqm, 0);

    const builtMap: Omit<PrescriptionMap, 'id' | 'createdAt' | 'updatedAt'> = {
      gardenId: data.gardenId,
      gardenName: data.gardenName || 'Garden',
      name: data.name,
      description: data.description,
      mapType: data.mapType,
      generationDate: new Date().toISOString(),
      dataSourcePeriod: data.analysisPeriod,
      dataSources: {
        ndviData: data.dataSources.ndviWeight > 0,
        plantLevelData: data.dataSources.plantHealthWeight > 0,
        rowLevelData: false,
        soilData: data.dataSources.soilWeight > 0,
        weatherData: false
      },
      zones: data.zones,
      totalZones: data.zones.length,
      totalAreaSqm: totalAreaSqm,
      exportFormats: {
        shapefile: true,
        kml: true,
        isoxml: true,
        geojson: true,
        csv: true
      },
      areaHectares: totalAreaSqm / 10000,
      zonesCount: data.zones.length,
      applicationRate: {
        min: Math.min(...data.zones.map((z: any) => z.prescription.applicationRate)),
        max: Math.max(...data.zones.map((z: any) => z.prescription.applicationRate)),
        unit: data.zones[0]?.prescription.unit || data.prescriptionConfig.unit
      },
      costSavings: data.costAnalysis?.savingsVsUniform || 0,
      inputReduction: data.costAnalysis?.inputReduction || 0,
      status: 'completed',
      versionNumber: 1,
      versionLabel: 'v1',
      exportCount: 0,
      validationStatus: 'valid',
      qualityScore: this.calculateOverallQuality(data.quality, data.zones),
      dataCompleteness: data.quality?.completeness || 90,
      costAnalysis: data.costAnalysis,
      algorithmMetadata: data.algorithmMetadata,
      contentChecksum: data.contentChecksum,
      createdBy: data.createdBy
    };

    if (!this.storageProvider?.createPrescriptionMap) throw new Error('Persistenza cloud richiesta per la prescription map')
    return this.storageProvider.createPrescriptionMap(builtMap);
  }
}

/**
 * UTILITY FUNCTIONS
 */

export const createPrescriptionMapsService = (storageProvider: any) => {
  return new PrescriptionMapsService(storageProvider);
};

export default PrescriptionMapsService;
