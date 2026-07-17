/**
 * NDVI Satellite Service
 * Integrazione con API satellitari per analisi vegetazione
 * Supporta EOSDA Land Viewer e Sentinel Hub
 */

import { Garden } from '../types';

export interface NDVIReading {
  id: string;
  garden_id: string;
  zone_id?: string;
  date: string;
  ndvi_value: number; // -1 to 1
  evi_value?: number; // Enhanced Vegetation Index
  savi_value?: number; // Soil Adjusted Vegetation Index
  cloud_coverage: number; // 0-100%
  resolution_meters: number;
  satellite_source: 'sentinel-2' | 'landsat-8' | 'modis';
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
  private static readonly EOSDA_API_URL = 'https://api.eosda.com/v1';
  private static readonly SENTINEL_HUB_URL = 'https://services.sentinel-hub.com/api/v1';
  
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
      let ndviData = await this.fetchSentinelHubData(request);
      
      // Se non disponibile, usa simulazione avanzata
      if (!ndviData) {
        console.log('API satellitari non disponibili, usando simulazione avanzata');
        ndviData = this.generateSimulatedNDVI(garden);
      }

      return ndviData;
    } catch (error) {
      console.error('Errore recupero NDVI:', error);
      return this.generateSimulatedNDVI(garden);
    }
  }

  /**
   * Analizza NDVI per zone specifiche del garden
   */
  static async analyzeGardenZones(garden: Garden): Promise<NDVIZoneAnalysis[]> {
    try {
      const ndviReading = await this.getLatestNDVI(garden);
      if (!ndviReading) return [];

      // Se il garden ha zone definite, analizza separatamente
      if (garden.points && garden.points.length > 0) {
        return garden.points.map(point => this.analyzePointNDVI(point, ndviReading));
      }

      // Altrimenti tratta tutto il garden come una zona
      return [{
        zone_id: 'main',
        zone_name: 'Area Principale',
        avg_ndvi: ndviReading.ndvi_value,
        min_ndvi: ndviReading.ndvi_value - 0.1,
        max_ndvi: ndviReading.ndvi_value + 0.1,
        area_hectares: garden.sizeSqMeters / 10000,
        health_distribution: this.calculateHealthDistribution(ndviReading.ndvi_value),
        problem_areas: this.identifyProblemAreas(ndviReading)
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
      // In demo, genera trend simulato
      if (process.env.NODE_ENV === 'development') {
        return this.generateSimulatedTrend(days);
      }

      // TODO: Implementare recupero storico da API
      const trend = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      for (let i = 0; i < days; i += 5) { // Ogni 5 giorni (frequenza Sentinel-2)
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Simula variazione stagionale
        const seasonalFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.2;
        const baseNDVI = 0.6 + seasonalFactor + (Math.random() - 0.5) * 0.1;
        
        trend.push({
          date: date.toISOString().split('T')[0],
          ndvi: Math.max(0, Math.min(1, baseNDVI)),
          health: this.classifyVegetationHealth(baseNDVI)
        });
      }

      return trend.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Errore trend NDVI:', error);
      return [];
    }
  }

  /**
   * Identifica aree con stress colturale
   */
  static async detectStressAreas(garden: Garden): Promise<Array<{
    coordinates: [number, number][];
    stress_type: 'water' | 'nutrient' | 'disease' | 'pest';
    severity: 'low' | 'medium' | 'high';
    affected_area_m2: number;
    recommendations: string[];
  }>> {
    try {
      const ndviReading = await this.getLatestNDVI(garden);
      if (!ndviReading) return [];

      const stressAreas = [];

      // Analizza stress idrico (NDVI < 0.4)
      if (ndviReading.ndvi_value < 0.4) {
        const severity: 'high' | 'medium' = ndviReading.ndvi_value < 0.2 ? 'high' : 'medium';
        stressAreas.push({
          coordinates: this.generateRandomPolygon(garden),
          stress_type: 'water' as const,
          severity,
          affected_area_m2: garden.sizeSqMeters * 0.3, // 30% dell'area
          recommendations: [
            'Aumentare frequenza irrigazione',
            'Verificare sistema irrigazione',
            'Considerare pacciamatura per ridurre evaporazione'
          ]
        });
      }

      // Analizza carenze nutrizionali (NDVI 0.4-0.6 con pattern irregolari)
      if (ndviReading.ndvi_value >= 0.4 && ndviReading.ndvi_value < 0.6) {
        stressAreas.push({
          coordinates: this.generateRandomPolygon(garden),
          stress_type: 'nutrient' as const,
          severity: 'medium' as const,
          affected_area_m2: garden.sizeSqMeters * 0.2,
          recommendations: [
            'Analisi del suolo per NPK',
            'Fertilizzazione fogliare di emergenza',
            'Regolare pH del suolo se necessario'
          ]
        });
      }

      return stressAreas;
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
    
    // Fallback: area generica Italia centrale
    return {
      north: 42.0,
      south: 41.9,
      east: 12.6,
      west: 12.5
    };
  }

  private static async fetchEOSDAData(request: SatelliteImageRequest): Promise<NDVIReading | null> {
    try {
      // TODO: Implementare chiamata reale EOSDA API
      // const response = await fetch(`${this.EOSDA_API_URL}/satellite-imagery`, {
      //   headers: { 'Authorization': `Bearer ${process.env.EOSDA_API_KEY}` }
      // });
      
      return null; // Per ora ritorna null, forza fallback a simulazione
    } catch (error) {
      console.error('Errore EOSDA API:', error);
      return null;
    }
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
      
      if (data.error && !data.simulated) {
        throw new Error(data.error);
      }

      // Converti risposta API in NDVIReading
      return {
        id: crypto.randomUUID(),
        garden_id: request.garden_id,
        date: data.date,
        ndvi_value: data.ndvi,
        evi_value: data.ndvi * 0.8, // Stima EVI da NDVI
        savi_value: data.ndvi * 0.9, // Stima SAVI da NDVI
        cloud_coverage: data.cloudCoverage || 0,
        resolution_meters: 10,
        satellite_source: 'sentinel-2',
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

  private static generateSimulatedNDVI(garden: Garden): NDVIReading {
    // Simula NDVI realistico basato su stagione
    const month = new Date().getMonth() + 1;
    let baseNDVI = 0.5;
    
    // Variazione stagionale
    if (month >= 4 && month <= 6) baseNDVI = 0.7; // Primavera
    else if (month >= 7 && month <= 9) baseNDVI = 0.6; // Estate
    else if (month >= 10 && month <= 11) baseNDVI = 0.4; // Autunno
    else baseNDVI = 0.2; // Inverno

    // Aggiungi variazione casuale
    const ndviValue = Math.max(0, Math.min(1, baseNDVI + (Math.random() - 0.5) * 0.2));

    return {
      id: crypto.randomUUID(),
      garden_id: garden.id,
      date: new Date().toISOString(),
      ndvi_value: ndviValue,
      evi_value: ndviValue * 0.8,
      savi_value: ndviValue * 0.9,
      cloud_coverage: Math.random() * 15, // 0-15% nuvole
      resolution_meters: 10,
      satellite_source: 'sentinel-2',
      analysis: {
        vegetation_health: this.classifyVegetationHealth(ndviValue),
        stress_indicators: {
          water_stress: ndviValue < 0.4,
          nutrient_deficiency: ndviValue < 0.5 && ndviValue >= 0.3,
          disease_risk: ndviValue < 0.3
        },
        recommendations: this.generateNDVIRecommendations(ndviValue)
      }
    };
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

  private static analyzePointNDVI(point: any, ndviReading: NDVIReading): NDVIZoneAnalysis {
    // Simula variazione NDVI per punto
    const pointVariation = (Math.random() - 0.5) * 0.2;
    const pointNDVI = Math.max(0, Math.min(1, ndviReading.ndvi_value + pointVariation));

    return {
      zone_id: point.id,
      zone_name: point.name,
      avg_ndvi: pointNDVI,
      min_ndvi: Math.max(0, pointNDVI - 0.1),
      max_ndvi: Math.min(1, pointNDVI + 0.1),
      area_hectares: 0.1, // Assume 1000m² per punto
      health_distribution: this.calculateHealthDistribution(pointNDVI),
      problem_areas: []
    };
  }

  private static calculateHealthDistribution(ndvi: number) {
    // Simula distribuzione salute basata su NDVI medio
    if (ndvi >= 0.7) {
      return { excellent: 70, good: 25, moderate: 5, poor: 0, critical: 0 };
    } else if (ndvi >= 0.5) {
      return { excellent: 20, good: 50, moderate: 25, poor: 5, critical: 0 };
    } else if (ndvi >= 0.3) {
      return { excellent: 0, good: 20, moderate: 40, poor: 30, critical: 10 };
    } else {
      return { excellent: 0, good: 0, moderate: 10, poor: 40, critical: 50 };
    }
  }

  private static identifyProblemAreas(ndviReading: NDVIReading): Array<{
    coordinates: [number, number][];
    issue_type: string;
    severity: 'low' | 'medium' | 'high';
    recommended_action: string;
  }> {
    const problemAreas: Array<{
      coordinates: [number, number][];
      issue_type: string;
      severity: 'low' | 'medium' | 'high';
      recommended_action: string;
    }> = [];
    
    if (ndviReading.analysis.stress_indicators.water_stress) {
      problemAreas.push({
        coordinates: [[0, 0], [0, 1], [1, 1], [1, 0]] as [number, number][], // Placeholder
        issue_type: 'Stress idrico',
        severity: 'high' as const,
        recommended_action: 'Aumentare irrigazione'
      });
    }

    return problemAreas;
  }

  private static generateSimulatedTrend(days: number) {
    const trend = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i += 5) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const seasonalFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.2;
      const baseNDVI = 0.6 + seasonalFactor + (Math.random() - 0.5) * 0.1;
      
      trend.push({
        date: date.toISOString().split('T')[0],
        ndvi: Math.max(0, Math.min(1, baseNDVI)),
        health: this.classifyVegetationHealth(baseNDVI)
      });
    }

    return trend;
  }

  private static calculateTrendDirection(trend: any[]): 'improving' | 'stable' | 'declining' {
    if (trend.length < 2) return 'stable';
    
    const recent = trend.slice(-5).reduce((sum, t) => sum + t.ndvi, 0) / 5;
    const older = trend.slice(0, 5).reduce((sum, t) => sum + t.ndvi, 0) / 5;
    
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

  private static generateRandomPolygon(garden: Garden): [number, number][] {
    // Genera poligono casuale per demo
    const centerLat = garden.coordinates?.latitude || 42.0;
    const centerLng = garden.coordinates?.longitude || 12.5;
    const radius = 0.001; // ~100m

    return [
      [centerLat + radius, centerLng - radius],
      [centerLat + radius, centerLng + radius],
      [centerLat - radius, centerLng + radius],
      [centerLat - radius, centerLng - radius]
    ];
  }
}
