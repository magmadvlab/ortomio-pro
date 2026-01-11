/**
 * Zone Management Service
 * Gestione avanzata delle zone per prescription maps
 */

import {
  PrescriptionZone,
  ZonePrescription,
  NDVIDataPoint,
  PlantDataPoint,
  ZoneGenerationAlgorithm
} from '../types/prescriptionMaps';

export interface ZoneAnalysis {
  zoneId: string;
  statistics: {
    area: number;
    plantCount: number;
    avgNdvi: number;
    avgHealthScore: number;
    dataPointCount: number;
  };
  recommendations: {
    applicationRate: number;
    confidence: number;
    reasoning: string[];
    alternatives: Array<{
      rate: number;
      description: string;
      expectedOutcome: string;
    }>;
  };
  riskFactors: Array<{
    type: 'weather' | 'soil' | 'disease' | 'nutrient';
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }>;
}

export interface ZoneOptimizationResult {
  originalZones: number;
  optimizedZones: number;
  areaReduction: number; // Percentage
  costSavings: number; // Euro
  qualityImprovement: number; // Percentage
  recommendations: string[];
}

export interface ZoneMergeCandidate {
  zone1Id: string;
  zone2Id: string;
  similarity: number; // 0-1
  potentialSavings: number;
  mergedArea: number;
  recommendedRate: number;
}

/**
 * ZONE MANAGEMENT SERVICE
 */
export class ZoneManagementService {
  private storageProvider: any;

  constructor(storageProvider: any) {
    this.storageProvider = storageProvider;
  }

  /**
   * Analyze individual zone for optimization opportunities
   */
  async analyzeZone(
    zone: PrescriptionZone,
    ndviData: NDVIDataPoint[],
    plantData: PlantDataPoint[]
  ): Promise<ZoneAnalysis> {
    
    // Calculate zone statistics
    const statistics = await this.calculateZoneStatistics(zone, ndviData, plantData);
    
    // Generate recommendations
    const recommendations = await this.generateZoneRecommendations(zone, statistics);
    
    // Identify risk factors
    const riskFactors = await this.identifyRiskFactors(zone, statistics);
    
    return {
      zoneId: zone.id,
      statistics,
      recommendations,
      riskFactors
    };
  }

  /**
   * Optimize zones by merging similar adjacent zones
   */
  async optimizeZones(zones: PrescriptionZone[]): Promise<ZoneOptimizationResult> {
    const originalCount = zones.length;
    const originalArea = zones.reduce((sum, zone) => sum + zone.areaSqm, 0);
    
    // Find merge candidates
    const mergeCandidates = await this.findMergeCandidates(zones);
    
    // Apply merges based on similarity and cost savings
    const optimizedZones = await this.applyOptimalMerges(zones, mergeCandidates);
    
    // Calculate optimization results
    const optimizedCount = optimizedZones.length;
    const optimizedArea = optimizedZones.reduce((sum, zone) => sum + zone.areaSqm, 0);
    
    const areaReduction = ((originalArea - optimizedArea) / originalArea) * 100;
    const costSavings = this.calculateCostSavings(zones, optimizedZones);
    const qualityImprovement = this.calculateQualityImprovement(zones, optimizedZones);
    
    const recommendations = this.generateOptimizationRecommendations(
      originalCount,
      optimizedCount,
      costSavings
    );
    
    return {
      originalZones: originalCount,
      optimizedZones: optimizedCount,
      areaReduction: Math.round(areaReduction * 100) / 100,
      costSavings: Math.round(costSavings * 100) / 100,
      qualityImprovement: Math.round(qualityImprovement * 100) / 100,
      recommendations
    };
  }

  /**
   * Validate zone configuration for practical application
   */
  async validateZoneConfiguration(zones: PrescriptionZone[]): Promise<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
    suggestions: string[];
  }> {
    
    const warnings: string[] = [];
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    // Check minimum zone size
    const minZoneSize = 500; // 500 m² minimum for practical application
    const smallZones = zones.filter(zone => zone.areaSqm < minZoneSize);
    if (smallZones.length > 0) {
      warnings.push(`${smallZones.length} zones are smaller than ${minZoneSize} m² and may be impractical for machinery`);
      suggestions.push('Consider merging small zones with adjacent similar zones');
    }
    
    // Check maximum zones for practical management
    const maxPracticalZones = 20;
    if (zones.length > maxPracticalZones) {
      warnings.push(`${zones.length} zones may be too many for practical field management`);
      suggestions.push('Consider reducing zones to improve operational efficiency');
    }
    
    // Check application rate variations
    const rates = zones.map(zone => zone.prescription.applicationRate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const variation = ((maxRate - minRate) / minRate) * 100;
    
    if (variation > 200) {
      warnings.push(`Application rate variation of ${Math.round(variation)}% is very high`);
      suggestions.push('Review zone boundaries and data quality to reduce extreme variations');
    }
    
    // Check for isolated zones
    const isolatedZones = this.findIsolatedZones(zones);
    if (isolatedZones.length > 0) {
      warnings.push(`${isolatedZones.length} zones are isolated and may cause application inefficiencies`);
      suggestions.push('Consider connecting isolated zones or adjusting boundaries');
    }
    
    // Check data quality
    const lowQualityZones = zones.filter(zone => zone.dataQuality < 60);
    if (lowQualityZones.length > 0) {
      warnings.push(`${lowQualityZones.length} zones have low data quality (<60%)`);
      suggestions.push('Collect additional data for low-quality zones before application');
    }
    
    const isValid = errors.length === 0;
    
    return { isValid, warnings, errors, suggestions };
  }

  /**
   * Generate variable rate prescription for zone
   */
  async generateVariableRatePrescription(
    zone: PrescriptionZone,
    baseRate: number,
    maxVariation: number,
    algorithm: 'linear' | 'exponential' | 'step' = 'linear'
  ): Promise<ZonePrescription> {
    
    const zoneValue = zone.sourceData.avgNdvi || 0.5;
    const confidence = zone.confidence / 100;
    
    let adjustmentFactor = 0;
    
    switch (algorithm) {
      case 'linear':
        // Linear adjustment based on NDVI
        adjustmentFactor = (zoneValue - 0.5) * 2; // -1 to 1 range
        break;
        
      case 'exponential':
        // Exponential adjustment for more dramatic changes
        adjustmentFactor = Math.sign(zoneValue - 0.5) * Math.pow(Math.abs(zoneValue - 0.5) * 2, 1.5);
        break;
        
      case 'step':
        // Step function for discrete rate levels
        if (zoneValue < 0.3) adjustmentFactor = -0.8;
        else if (zoneValue < 0.7) adjustmentFactor = 0;
        else adjustmentFactor = 0.8;
        break;
    }
    
    // Apply confidence weighting
    adjustmentFactor *= confidence;
    
    // Calculate final rate
    const rateAdjustment = adjustmentFactor * (maxVariation / 100);
    const finalRate = baseRate * (1 + rateAdjustment);
    
    // Ensure rate stays within bounds
    const minRate = baseRate * (1 - maxVariation / 100);
    const maxRate = baseRate * (1 + maxVariation / 100);
    const boundedRate = Math.max(minRate, Math.min(maxRate, finalRate));
    
    return {
      applicationRate: Math.round(boundedRate * 100) / 100,
      unit: zone.prescription.unit,
      productName: zone.prescription.productName,
      applicationMethod: 'variable_rate',
      variableRate: {
        minRate,
        maxRate,
        rateFunction: algorithm,
        parameters: {
          baseRate,
          adjustmentFactor,
          confidence,
          zoneValue
        }
      },
      expectedOutcome: {
        yieldIncrease: Math.round(Math.abs(adjustmentFactor) * 10), // Simplified yield impact
        costReduction: rateAdjustment < 0 ? Math.abs(rateAdjustment) * baseRate : 0,
        environmentalBenefit: rateAdjustment < 0 ? 'Reduced input usage' : 'Optimized application'
      }
    };
  }

  /**
   * Calculate zone adjacency matrix for optimization
   */
  private calculateZoneAdjacency(zones: PrescriptionZone[]): Map<string, string[]> {
    const adjacency = new Map<string, string[]>();
    
    zones.forEach(zone1 => {
      const neighbors: string[] = [];
      
      zones.forEach(zone2 => {
        if (zone1.id !== zone2.id) {
          if (this.areZonesAdjacent(zone1, zone2)) {
            neighbors.push(zone2.id);
          }
        }
      });
      
      adjacency.set(zone1.id, neighbors);
    });
    
    return adjacency;
  }

  /**
   * Check if two zones are adjacent (share boundary)
   */
  private areZonesAdjacent(zone1: PrescriptionZone, zone2: PrescriptionZone): boolean {
    // Simplified adjacency check using centroid distance
    const distance = this.calculateDistance(zone1.centroid, zone2.centroid);
    const avgRadius = Math.sqrt((zone1.areaSqm + zone2.areaSqm) / (2 * Math.PI));
    
    // Consider adjacent if centroids are within 1.5 times average radius
    return distance <= avgRadius * 1.5;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private async calculateZoneStatistics(
    zone: PrescriptionZone,
    ndviData: NDVIDataPoint[],
    plantData: PlantDataPoint[]
  ) {
    // Filter data points within zone bounds
    const zoneNdviData = this.filterDataPointsInZone(ndviData, zone);
    const zonePlantData = this.filterDataPointsInZone(plantData, zone);
    
    return {
      area: zone.areaSqm,
      plantCount: zonePlantData.length,
      avgNdvi: zoneNdviData.length > 0 
        ? zoneNdviData.reduce((sum, d) => sum + d.ndviValue, 0) / zoneNdviData.length
        : zone.sourceData.avgNdvi || 0,
      avgHealthScore: zonePlantData.length > 0
        ? zonePlantData.reduce((sum, d) => sum + d.healthScore, 0) / zonePlantData.length
        : zone.sourceData.avgPlantHealth || 0,
      dataPointCount: zoneNdviData.length + zonePlantData.length
    };
  }

  private async generateZoneRecommendations(zone: PrescriptionZone, statistics: any) {
    const baseRate = zone.prescription.applicationRate;
    let recommendedRate = baseRate;
    const reasoning: string[] = [];
    
    // Adjust based on NDVI
    if (statistics.avgNdvi > 0.7) {
      recommendedRate *= 0.8;
      reasoning.push('High NDVI indicates good vegetation health - reduced rate recommended');
    } else if (statistics.avgNdvi < 0.3) {
      recommendedRate *= 1.2;
      reasoning.push('Low NDVI indicates stress - increased rate recommended');
    }
    
    // Adjust based on plant health
    if (statistics.avgHealthScore > 80) {
      recommendedRate *= 0.9;
      reasoning.push('High plant health scores - maintenance rate sufficient');
    } else if (statistics.avgHealthScore < 60) {
      recommendedRate *= 1.1;
      reasoning.push('Low plant health scores - increased intervention needed');
    }
    
    // Data quality consideration
    const confidence = statistics.dataPointCount > 10 ? 0.9 : 0.6;
    
    const alternatives = [
      {
        rate: recommendedRate * 0.8,
        description: 'Conservative approach',
        expectedOutcome: 'Lower cost, moderate results'
      },
      {
        rate: recommendedRate,
        description: 'Recommended approach',
        expectedOutcome: 'Optimal cost-benefit balance'
      },
      {
        rate: recommendedRate * 1.2,
        description: 'Intensive approach',
        expectedOutcome: 'Higher cost, maximum results'
      }
    ];
    
    return {
      applicationRate: Math.round(recommendedRate * 100) / 100,
      confidence: Math.round(confidence * 100),
      reasoning,
      alternatives
    };
  }

  private async identifyRiskFactors(zone: PrescriptionZone, statistics: any) {
    const risks: Array<{
      type: 'weather' | 'soil' | 'disease' | 'nutrient';
      severity: 'low' | 'medium' | 'high';
      description: string;
      mitigation: string;
    }> = [];
    
    // Low data quality risk
    if (statistics.dataPointCount < 5) {
      risks.push({
        type: 'soil',
        severity: 'medium',
        description: 'Limited data points for reliable prescription',
        mitigation: 'Collect additional soil or plant samples before application'
      });
    }
    
    // Extreme NDVI values
    if (statistics.avgNdvi < 0.2) {
      risks.push({
        type: 'disease',
        severity: 'high',
        description: 'Very low NDVI may indicate disease or severe stress',
        mitigation: 'Investigate cause before fertilizer application'
      });
    }
    
    // Large zone size
    if (zone.areaSqm > 5000) {
      risks.push({
        type: 'nutrient',
        severity: 'low',
        description: 'Large zone may have internal variability',
        mitigation: 'Consider subdividing zone for more precise application'
      });
    }
    
    return risks;
  }

  private async findMergeCandidates(zones: PrescriptionZone[]): Promise<ZoneMergeCandidate[]> {
    const candidates: ZoneMergeCandidate[] = [];
    const adjacency = this.calculateZoneAdjacency(zones);
    
    zones.forEach(zone1 => {
      const neighbors = adjacency.get(zone1.id) || [];
      
      neighbors.forEach(neighborId => {
        const zone2 = zones.find(z => z.id === neighborId);
        if (!zone2 || zone1.id >= zone2.id) return; // Avoid duplicates
        
        const similarity = this.calculateZoneSimilarity(zone1, zone2);
        
        if (similarity > 0.8) { // High similarity threshold
          const potentialSavings = this.calculateMergeSavings(zone1, zone2);
          const mergedArea = zone1.areaSqm + zone2.areaSqm;
          const recommendedRate = (
            zone1.prescription.applicationRate * zone1.areaSqm +
            zone2.prescription.applicationRate * zone2.areaSqm
          ) / mergedArea;
          
          candidates.push({
            zone1Id: zone1.id,
            zone2Id: zone2.id,
            similarity,
            potentialSavings,
            mergedArea,
            recommendedRate
          });
        }
      });
    });
    
    return candidates.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  private calculateZoneSimilarity(zone1: PrescriptionZone, zone2: PrescriptionZone): number {
    // Calculate similarity based on multiple factors
    const rateRatio = Math.min(
      zone1.prescription.applicationRate / zone2.prescription.applicationRate,
      zone2.prescription.applicationRate / zone1.prescription.applicationRate
    );
    
    const ndviSimilarity = 1 - Math.abs(
      (zone1.sourceData.avgNdvi || 0) - (zone2.sourceData.avgNdvi || 0)
    );
    
    const healthSimilarity = 1 - Math.abs(
      (zone1.sourceData.avgPlantHealth || 0) - (zone2.sourceData.avgPlantHealth || 0)
    ) / 100;
    
    return (rateRatio * 0.5 + ndviSimilarity * 0.3 + healthSimilarity * 0.2);
  }

  private calculateMergeSavings(zone1: PrescriptionZone, zone2: PrescriptionZone): number {
    // Simplified savings calculation based on reduced complexity
    const complexityReduction = 50; // €50 per zone reduction
    const areaFactor = Math.min(zone1.areaSqm, zone2.areaSqm) / 1000; // Bonus for larger zones
    
    return complexityReduction + areaFactor;
  }

  private async applyOptimalMerges(
    zones: PrescriptionZone[],
    candidates: ZoneMergeCandidate[]
  ): Promise<PrescriptionZone[]> {
    // Simple greedy approach - apply merges with highest savings first
    const mergedZoneIds = new Set<string>();
    const optimizedZones = [...zones];
    
    for (const candidate of candidates) {
      if (mergedZoneIds.has(candidate.zone1Id) || mergedZoneIds.has(candidate.zone2Id)) {
        continue; // One of the zones already merged
      }
      
      if (candidate.potentialSavings > 25) { // Minimum savings threshold
        // Mark zones as merged
        mergedZoneIds.add(candidate.zone1Id);
        mergedZoneIds.add(candidate.zone2Id);
        
        // Create merged zone (simplified)
        const zone1 = zones.find(z => z.id === candidate.zone1Id)!;
        const zone2 = zones.find(z => z.id === candidate.zone2Id)!;
        
        const mergedZone: PrescriptionZone = {
          ...zone1,
          id: crypto.randomUUID(),
          zoneName: `${zone1.zoneName} + ${zone2.zoneName}`,
          areaSqm: candidate.mergedArea,
          prescription: {
            ...zone1.prescription,
            applicationRate: candidate.recommendedRate
          }
        };
        
        // Remove original zones and add merged zone
        const zone1Index = optimizedZones.findIndex(z => z.id === candidate.zone1Id);
        const zone2Index = optimizedZones.findIndex(z => z.id === candidate.zone2Id);
        
        if (zone1Index > -1) optimizedZones.splice(zone1Index, 1);
        if (zone2Index > -1) optimizedZones.splice(zone2Index, 1);
        
        optimizedZones.push(mergedZone);
      }
    }
    
    return optimizedZones;
  }

  private calculateCostSavings(original: PrescriptionZone[], optimized: PrescriptionZone[]): number {
    const complexitySavings = (original.length - optimized.length) * 50; // €50 per zone reduction
    return Math.max(0, complexitySavings);
  }

  private calculateQualityImprovement(original: PrescriptionZone[], optimized: PrescriptionZone[]): number {
    // Simplified quality improvement calculation
    const originalAvgQuality = original.reduce((sum, z) => sum + z.dataQuality, 0) / original.length;
    const optimizedAvgQuality = optimized.reduce((sum, z) => sum + z.dataQuality, 0) / optimized.length;
    
    return ((optimizedAvgQuality - originalAvgQuality) / originalAvgQuality) * 100;
  }

  private generateOptimizationRecommendations(
    originalCount: number,
    optimizedCount: number,
    savings: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (optimizedCount < originalCount) {
      recommendations.push(`Reduced zones from ${originalCount} to ${optimizedCount} for simpler field management`);
    }
    
    if (savings > 0) {
      recommendations.push(`Estimated cost savings: €${savings.toFixed(2)} from reduced complexity`);
    }
    
    if (optimizedCount > 15) {
      recommendations.push('Consider further zone reduction for easier machinery operation');
    }
    
    if (optimizedCount < 5) {
      recommendations.push('Very few zones - ensure sufficient precision for variable rate application');
    }
    
    return recommendations;
  }

  private findIsolatedZones(zones: PrescriptionZone[]): PrescriptionZone[] {
    const adjacency = this.calculateZoneAdjacency(zones);
    
    return zones.filter(zone => {
      const neighbors = adjacency.get(zone.id) || [];
      return neighbors.length === 0 && zones.length > 1;
    });
  }

  private filterDataPointsInZone<T extends { latitude: number; longitude: number }>(
    dataPoints: T[],
    zone: PrescriptionZone
  ): T[] {
    // Simplified point-in-polygon check using bounding box
    const coords = zone.geometry.coordinates[0];
    const lats = coords.map(c => c[1]);
    const lons = coords.map(c => c[0]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    return dataPoints.filter(point =>
      point.latitude >= minLat && point.latitude <= maxLat &&
      point.longitude >= minLon && point.longitude <= maxLon
    );
  }
}

/**
 * UTILITY FUNCTIONS
 */

export const createZoneManagementService = (storageProvider: any) => {
  return new ZoneManagementService(storageProvider);
};

export default ZoneManagementService;