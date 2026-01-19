/**
 * Zone Management Service
 * Gestione avanzata delle zone per prescription maps
 */

import { createClient } from '@supabase/supabase-js';

export interface Zone {
  id: string;
  name: string;
  description?: string;
  area_sqm?: number;
  garden_id: string;
  created_at: string;
  updated_at: string;
}

export interface Field {
  id: string;
  name: string;
  zone_id: string;
  area_sqm?: number;
  created_at: string;
  updated_at: string;
}

export interface Row {
  id: string;
  name: string;
  field_id: string;
  length_m?: number;
  width_m?: number;
  created_at: string;
  updated_at: string;
}

export interface ZoneAnalysis {
  zoneId: string;
  statistics: {
    area: number;
    fieldCount: number;
    rowCount: number;
    avgFieldSize: number;
  };
  recommendations: {
    optimizationSuggestions: string[];
    irrigationRecommendations: string[];
    plantingRecommendations: string[];
  };
}

/**
 * ZONE MANAGEMENT SERVICE
 */
export class ZoneManagementService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Get all zones for a garden
   */
  async getZones(gardenId?: string): Promise<Zone[]> {
    try {
      let query = this.supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: true });

      if (gardenId) {
        query = query.eq('garden_id', gardenId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching zones:', error);
      return [];
    }
  }

  /**
   * Get all fields for zones
   */
  async getFields(zoneIds?: string[]): Promise<Field[]> {
    try {
      let query = this.supabase
        .from('zone_fields')
        .select('*')
        .order('created_at', { ascending: true });

      if (zoneIds && zoneIds.length > 0) {
        query = query.in('zone_id', zoneIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching fields:', error);
      return [];
    }
  }

  /**
   * Get all rows for fields
   */
  async getRows(fieldIds?: string[]): Promise<Row[]> {
    try {
      let query = this.supabase
        .from('zone_rows')
        .select('*')
        .order('created_at', { ascending: true });

      if (fieldIds && fieldIds.length > 0) {
        query = query.in('field_id', fieldIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rows:', error);
      return [];
    }
  }

  /**
   * Create a new zone
   */
  async createZone(zoneData: Omit<Zone, 'id' | 'created_at' | 'updated_at'>): Promise<Zone> {
    try {
      const { data, error } = await this.supabase
        .from('zones')
        .insert([zoneData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  /**
   * Create a new field
   */
  async createField(fieldData: Omit<Field, 'id' | 'created_at' | 'updated_at'>): Promise<Field> {
    try {
      const { data, error } = await this.supabase
        .from('zone_fields')
        .insert([fieldData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating field:', error);
      throw error;
    }
  }

  /**
   * Create a new row
   */
  async createRow(rowData: Omit<Row, 'id' | 'created_at' | 'updated_at'>): Promise<Row> {
    try {
      const { data, error } = await this.supabase
        .from('zone_rows')
        .insert([rowData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating row:', error);
      throw error;
    }
  }

  /**
   * Update a zone
   */
  async updateZone(zoneId: string, updates: Partial<Omit<Zone, 'id' | 'created_at' | 'updated_at'>>): Promise<Zone> {
    try {
      const { data, error } = await this.supabase
        .from('zones')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', zoneId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  }

  /**
   * Delete a zone (cascades to fields and rows)
   */
  async deleteZone(zoneId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  }

  /**
   * Delete a field (cascades to rows)
   */
  async deleteField(fieldId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('zone_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  }

  /**
   * Delete a row
   */
  async deleteRow(rowId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('zone_rows')
        .delete()
        .eq('id', rowId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting row:', error);
      throw error;
    }
  }

  /**
   * Analyze zone for optimization opportunities
   */
  async analyzeZone(zoneId: string): Promise<ZoneAnalysis> {
    try {
      const zone = await this.getZones().then(zones => zones.find(z => z.id === zoneId));
      if (!zone) throw new Error('Zone not found');

      const fields = await this.getFields([zoneId]);
      const fieldIds = fields.map(f => f.id);
      const rows = await this.getRows(fieldIds);

      const statistics = {
        area: zone.area_sqm || 0,
        fieldCount: fields.length,
        rowCount: rows.length,
        avgFieldSize: fields.length > 0 
          ? fields.reduce((sum, f) => sum + (f.area_sqm || 0), 0) / fields.length 
          : 0
      };

      const recommendations = {
        optimizationSuggestions: this.generateOptimizationSuggestions(statistics),
        irrigationRecommendations: this.generateIrrigationRecommendations(statistics),
        plantingRecommendations: this.generatePlantingRecommendations(statistics)
      };

      return {
        zoneId,
        statistics,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing zone:', error);
      throw error;
    }
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(statistics: ZoneAnalysis['statistics']): string[] {
    const suggestions: string[] = [];

    if (statistics.fieldCount === 0) {
      suggestions.push('Considera di suddividere la zona in campi per una gestione più efficiente');
    } else if (statistics.fieldCount > 10) {
      suggestions.push('Troppi campi potrebbero complicare la gestione - considera di accorparne alcuni');
    }

    if (statistics.rowCount === 0 && statistics.fieldCount > 0) {
      suggestions.push('Aggiungi filari ai campi per organizzare meglio le coltivazioni');
    }

    if (statistics.avgFieldSize > 0 && statistics.avgFieldSize < 50) {
      suggestions.push('I campi sono molto piccoli - considera di accorparli per ridurre la complessità');
    } else if (statistics.avgFieldSize > 1000) {
      suggestions.push('I campi sono molto grandi - considera di suddividerli per una gestione più precisa');
    }

    return suggestions;
  }

  /**
   * Generate irrigation recommendations
   */
  private generateIrrigationRecommendations(statistics: ZoneAnalysis['statistics']): string[] {
    const recommendations: string[] = [];

    if (statistics.fieldCount > 0) {
      recommendations.push('Configura sistemi di irrigazione separati per ogni campo');
      recommendations.push('Considera l\'irrigazione a goccia per un uso efficiente dell\'acqua');
    }

    if (statistics.rowCount > 0) {
      recommendations.push('Installa linee di irrigazione lungo i filari per una distribuzione uniforme');
    }

    return recommendations;
  }

  /**
   * Generate planting recommendations
   */
  private generatePlantingRecommendations(statistics: ZoneAnalysis['statistics']): string[] {
    const recommendations: string[] = [];

    if (statistics.fieldCount > 1) {
      recommendations.push('Pianifica rotazioni delle colture tra i diversi campi');
      recommendations.push('Raggruppa piante con esigenze simili nello stesso campo');
    }

    if (statistics.rowCount > 0) {
      recommendations.push('Utilizza i filari per organizzare le piante per altezza e periodo di crescita');
      recommendations.push('Lascia spazio sufficiente tra i filari per la manutenzione');
    }

    return recommendations;
  }
}

/**
 * UTILITY FUNCTIONS
 */

export const createZoneManagementService = (supabaseClient: any) => {
  return new ZoneManagementService(supabaseClient);
};

export default ZoneManagementService;