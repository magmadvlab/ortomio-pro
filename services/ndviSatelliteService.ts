/**
 * NDVI Satellite Service
 * Integrazione con API satellitari per analisi vegetazione
 * Supporta EOSDA Land Viewer e Sentinel Hub
 */

import { getSupabaseClient } from '../config/supabase';
import { Garden } from '../types';

export interface NDVIReading {
  id: string;
  garden_id: string;
  zone_id?: string;
  date: string;
  ndvi_value: number; // -1 to 1
  evi_value?: number; // Enhanced Vegetation Index
  savi_value?: number; // Soil Adjusted Vegetation Index
  cloud_coverage: number | null; // null quando la Statistical API non separa nuvole da altri pixel mascherati
  resolution_meters: number;
  satellite_source: 'sentinel-2' | 'landsat-8' | 'modis';
  source_kind: 'real' | 'estimated' | 'simulated' | 'fallback';
  provider: string;
  algorithm_version: string;
  quality_status: 'accepted' | 'warning' | 'rejected';
  valid_pixel_percent: number;
  statistics?: { min: number; max: number; mean: number; stDev: number; sampleCount: number; noDataCount: number };
  image_url?: string;
  analysis: {
    vegetation_health: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
    stress_indicators: {
      water_stress: boolean;
      nutrient_deficiency: boolean;
      disease_risk: boolean;
    };
    recommendations: string[];
  };
}

export interface NDVIZoneAnalysis {
  zone_id: string;
  zone_name: string;
  avg_ndvi: number;
  min_ndvi: number;
  max_ndvi: number;
  area_hectares: number;
  health_distribution: {
    excellent: number; // percentage
    good: number;
    moderate: number;
    poor: number;
    critical: number;
  };
  problem_areas: Array<{
    coordinates: [number, number][];
    issue_type: string;
    severity: 'low' | 'medium' | 'high';
    recommended_action: string;
  }>;
}

export interface SatelliteImageRequest {
  garden_id: string;
  coordinates: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  date_from: string;
  date_to: string;
  cloud_coverage_max: number;
  resolution_preference: 'high' | 'medium' | 'low';
}

export class NDVISatelliteService {
  /**
   * Recupera ultima immagine NDVI per garden
   */
  static async getLatestNDVI(garden: Garden): Promise<NDVIReading | null> {
    try {
      // Calcola bounding box dal garden
      const bbox = this.calculateBoundingBox(garden);
      
      // Cerca immagini recenti (ultimi 30 giorni)
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      
      const request: SatelliteImageRequest = {
        garden_id: garden.id,
        coordinates: bbox,
        date_from: dateFrom.toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
        cloud_coverage_max: 20,
        resolution_preference: 'high'
      };

      // Prova Sentinel Hub per dati reali
      const ndviData = await this.fetchSentinelHubData(request);
      
      return ndviData;
    } catch (error) {
      console.error('Errore recupero NDVI:', error);
      return null;
    }
  }

  /**
   * Analizza NDVI per zone specifiche del garden
   */
  static async analyzeGardenZones(garden: Garden, reading?: NDVIReading | null): Promise<NDVIZoneAnalysis[]> {
    try {
      const ndviReading = reading === undefined ? await this.getLatestNDVI(garden) : reading;
      if (!ndviReading) return [];

      // La Statistical API produce una statistica sull'intero bbox. Non inventiamo
      // differenze tra zone finche non esiste un raster georiferito persistito.
      return [{
        zone_id: 'main',
        zone_name: 'Area Principale',
        avg_ndvi: ndviReading.ndvi_value,
        min_ndvi: ndviReading.statistics?.min ?? ndviReading.ndvi_value,
        max_ndvi: ndviReading.statistics?.max ?? ndviReading.ndvi_value,
        area_hectares: garden.sizeSqMeters / 10000,
        health_distribution: this.calculateHealthDistribution(ndviReading.ndvi_value),
        problem_areas: []
      }];
    } catch (error) {
      console.error('Errore analisi zone NDVI:', error);
      return [];
    }
  }

  /**
   * Genera trend NDVI storico
   */
  static async getNDVITrend(
    garden: Garden, 
    days: number = 90
  ): Promise<Array<{ date: string; ndvi: number; health: string }>> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return [];

      const from = new Date();
      from.setUTCDate(from.getUTCDate() - Math.max(1, days));
      const { data, error } = await supabase
        .from('ndvi_data_cache')
        .select('data_date, ndvi_value, quality_status, source_kind')
        .eq('garden_id', garden.id)
        .eq('source_kind', 'real')
        .in('quality_status', ['accepted', 'warning'])
        .gte('data_date', from.toISOString().slice(0, 10))
        .order('data_date', { ascending: true });

      if (error) throw error;

      // La cache puo contenere piu punti dello stesso rilievo: il trend usa la
      // media reale giornaliera, senza interpolazioni o campioni sintetici.
      const daily = new Map<string, number[]>();
      for (const row of data || []) {
        const date = String(row.data_date);
        const value = Number(row.ndvi_value);
        if (!Number.isFinite(value)) continue;
        daily.set(date, [...(daily.get(date) || []), value]);
      }

      return [...daily.entries()].map(([date, values]) => {
        const ndvi = values.reduce((sum, value) => sum + value, 0) / values.length;
        return { date, ndvi, health: this.classifyVegetationHealth(ndvi) };
      });
    } catch (error) {
      console.error('Errore trend NDVI:', error);
      return [];
    }
  }

  /**
   * Identifica aree con stress colturale
   */
  static async detectStressAreas(garden: Garden, reading?: NDVIReading | null): Promise<Array<{
    coordinates: [number, number][];
    stress_type: 'water' | 'nutrient' | 'disease' | 'pest';
    severity: 'low' | 'medium' | 'high';
    affected_area_m2: number;
    recommendations: string[];
  }>> {
    try {
      const ndviReading = reading === undefined ? await this.getLatestNDVI(garden) : reading;
      if (!ndviReading) return [];

      // Una media sul bbox non localizza poligoni di stress. Le aree restano vuote
      // finche non viene processato e conservato un raster georiferito.
      return [];
    } catch (error) {
      console.error('Errore rilevamento stress:', error);
      return [];
    }
  }

  /**
   * Genera report NDVI completo
   */
  static async generateNDVIReport(garden: Garden): Promise<{
    summary: {
      overall_health: string;
      avg_ndvi: number;
      trend_direction: 'improving' | 'stable' | 'declining';
      last_update: string;
    };
    zones: NDVIZoneAnalysis[];
    stress_areas: any[];
    recommendations: string[];
    next_analysis_date: string;
  }> {
    try {
      const [ndviReading, zones, stressAreas, trend] = await Promise.all([
        this.getLatestNDVI(garden),
        this.analyzeGardenZones(garden),
        this.detectStressAreas(garden),
        this.getNDVITrend(garden, 30)
      ]);

      const trendDirection = this.calculateTrendDirection(trend);
      
      return {
        summary: {
          overall_health: ndviReading?.analysis.vegetation_health || 'unknown',
          avg_ndvi: ndviReading?.ndvi_value || 0,
          trend_direction: trendDirection,
          last_update: ndviReading?.date || new Date().toISOString()
        },
        zones,
        stress_areas: stressAreas,
        recommendations: this.generateRecommendations(ndviReading, stressAreas),
        next_analysis_date: this.calculateNextAnalysisDate()
      };
    } catch (error) {
      console.error('Errore generazione report NDVI:', error);
      throw error;
    }
  }

  // === METODI PRIVATI ===

  private static calculateBoundingBox(garden: Garden) {
    if (garden.coordinates) {
      const buffer = 0.001; // ~100m buffer
      return {
        north: garden.coordinates.latitude + buffer,
        south: garden.coordinates.latitude - buffer,
        east: garden.coordinates.longitude + buffer,
        west: garden.coordinates.longitude - buffer
      };
    }
    
    throw new Error('Coordinate garden richieste per NDVI reale');
  }

  private static async fetchSentinelHubData(request: SatelliteImageRequest): Promise<NDVIReading | null> {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      const response = await fetch(new URL('/api/ndvi/sentinel', window.location.origin), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gardenId: request.garden_id,
          bbox: request.coordinates,
          dateFrom: request.date_from,
          dateTo: request.date_to,
          cloudCoverage: request.cloud_coverage_max
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status !== 'available' || data.sourceKind !== 'real') {
        throw new Error(data.error);
      }

      // Converti risposta API in NDVIReading
      return {
        id: crypto.randomUUID(),
        garden_id: request.garden_id,
        date: data.date,
        ndvi_value: data.ndvi,
        evi_value: undefined,
        savi_value: undefined,
        cloud_coverage: typeof data.cloudCoverage === 'number' ? data.cloudCoverage : null,
        resolution_meters: data.resolutionMeters,
        satellite_source: 'sentinel-2',
        source_kind: data.sourceKind,
        provider: data.provider,
        algorithm_version: data.algorithmVersion,
        quality_status: data.qualityStatus,
        valid_pixel_percent: data.validPixelPercent,
        statistics: data.stats,
        image_url: data.imageUrl,
        analysis: {
          vegetation_health: this.classifyVegetationHealth(data.ndvi),
          stress_indicators: {
            water_stress: data.ndvi < 0.4,
            nutrient_deficiency: data.ndvi < 0.5 && data.ndvi >= 0.3,
            disease_risk: data.ndvi < 0.3
          },
          recommendations: this.generateNDVIRecommendations(data.ndvi)
        }
      };
    } catch (error) {
      console.error('Errore Sentinel Hub API:', error);
      return null;
    }
  }


  private static classifyVegetationHealth(ndvi: number): 'excellent' | 'good' | 'moderate' | 'poor' | 'critical' {
    if (ndvi >= 0.8) return 'excellent';
    if (ndvi >= 0.6) return 'good';
    if (ndvi >= 0.4) return 'moderate';
    if (ndvi >= 0.2) return 'poor';
    return 'critical';
  }

  private static generateNDVIRecommendations(ndvi: number): string[] {
    const recommendations = [];
    
    if (ndvi < 0.3) {
      recommendations.push('Intervento urgente necessario');
      recommendations.push('Verificare sistema irrigazione');
      recommendations.push('Analisi fitosanitaria immediata');
    } else if (ndvi < 0.5) {
      recommendations.push('Aumentare fertilizzazione');
      recommendations.push('Monitorare stress idrico');
      recommendations.push('Considerare trattamenti preventivi');
    } else if (ndvi < 0.7) {
      recommendations.push('Mantenere regime attuale');
      recommendations.push('Monitoraggio regolare');
    } else {
      recommendations.push('Vegetazione in ottima salute');
      recommendations.push('Continuare pratiche attuali');
    }

    return recommendations;
  }


  private static calculateHealthDistribution(ndvi: number) {
    const distribution = { excellent: 0, good: 0, moderate: 0, poor: 0, critical: 0 };
    distribution[this.classifyVegetationHealth(ndvi)] = 100;
    return distribution;
  }


  private static calculateTrendDirection(trend: any[]): 'improving' | 'stable' | 'declining' {
    if (trend.length < 2) return 'stable';
    
    const recentWindow = trend.slice(-5);
    const olderWindow = trend.slice(0, Math.min(5, trend.length));
    const recent = recentWindow.reduce((sum, t) => sum + t.ndvi, 0) / recentWindow.length;
    const older = olderWindow.reduce((sum, t) => sum + t.ndvi, 0) / olderWindow.length;
    
    const change = recent - older;
    
    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  private static generateRecommendations(ndviReading: NDVIReading | null, stressAreas: any[]): string[] {
    const recommendations = [];
    
    if (!ndviReading) {
      recommendations.push('Impossibile ottenere dati satellitari recenti');
      return recommendations;
    }

    recommendations.push(...ndviReading.analysis.recommendations);
    
    if (stressAreas.length > 0) {
      recommendations.push('Aree con stress rilevate - intervento mirato necessario');
    }

    return [...new Set(recommendations)]; // Rimuovi duplicati
  }

  private static calculateNextAnalysisDate(): string {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 5); // Ogni 5 giorni (frequenza Sentinel-2)
    return nextDate.toISOString().split('T')[0];
  }

}
