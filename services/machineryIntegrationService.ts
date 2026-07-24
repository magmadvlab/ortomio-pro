/**
 * Machinery Integration Service
 * Integrazione con machinery agricole per prescription maps
 */

import { MachineryCompatibility, ExportConfiguration } from '../types/prescriptionMaps';

export interface MachineryProfile {
  id: string;
  brand: string;
  model: string;
  type: string;
  capabilities: {
    variableRate: boolean;
    gpsAccuracy: number;
    workingWidth: number;
    supportedFormats: string[];
  };
  configuration: {
    preferredFormat: string;
    coordinateSystem: string;
    connectionType: string;
  };
}

export interface IntegrationResult {
  success: boolean;
  machineryId: string;
  recommendedFormat: string;
  configurationSteps: string[];
  warnings: string[];
  estimatedAccuracy: number;
}

/**
 * MACHINERY INTEGRATION SERVICE
 */
export class MachineryIntegrationService {
  private storageProvider: any;

  constructor(storageProvider: any) {
    this.storageProvider = storageProvider;
  }

  /**
   * Get optimal export configuration for machinery
   */
  async getOptimalConfiguration(
    machineryBrand: string,
    machineryModel: string
  ): Promise<ExportConfiguration | null> {
    
    const compatibility = await this.getMachineryCompatibility(machineryBrand, machineryModel);
    
    if (!compatibility) {
      return null;
    }

    // Determine best format
    let preferredFormat: ExportConfiguration['format'] = 'csv';
    
    if (compatibility.supportedFormats.isoxml) {
      preferredFormat = 'isoxml';
    } else if (compatibility.supportedFormats.shapefile) {
      preferredFormat = 'shapefile';
    } else if (compatibility.supportedFormats.kml) {
      preferredFormat = 'kml';
    }

    return {
      format: preferredFormat,
      coordinateSystem: 'WGS84',
      compression: true,
      includeMetadata: true,
      includePreview: false,
      
      // Format-specific optimizations
      ...(preferredFormat === 'isoxml' && {
        isoxmlOptions: {
          taskDataVersion: '4.0',
          includeTaskController: compatibility.variableRateCapable,
          machineryProfile: `${machineryBrand}_${machineryModel}`
        }
      }),
      
      ...(preferredFormat === 'shapefile' && {
        shapefileOptions: {
          includeDbf: true,
          encoding: 'UTF-8'
        }
      }),
      
      ...(preferredFormat === 'kml' && {
        kmlOptions: {
          includeGroundOverlay: false,
          stylePolygons: true,
          colorScheme: 'default'
        }
      })
    };
  }

  /**
   * Validate machinery compatibility
   */
  async validateCompatibility(
    machineryBrand: string,
    machineryModel: string,
    exportFormat: string
  ): Promise<IntegrationResult> {
    
    const compatibility = await this.getMachineryCompatibility(machineryBrand, machineryModel);
    
    if (!compatibility) {
      return {
        success: false,
        machineryId: '',
        recommendedFormat: 'csv',
        configurationSteps: ['Manual import required - machinery not in database'],
        warnings: ['Compatibility unknown - test with small area first'],
        estimatedAccuracy: 50
      };
    }

    const isFormatSupported = compatibility.supportedFormats[exportFormat as keyof typeof compatibility.supportedFormats] || false;
    const warnings: string[] = [];
    const configurationSteps: string[] = [];

    // Check format compatibility
    if (!isFormatSupported) {
      warnings.push(`${exportFormat.toUpperCase()} format not natively supported`);
      configurationSteps.push('Consider format conversion or alternative format');
    }

    // Check GPS accuracy
    if (compatibility.gpsAccuracy > 1.0) {
      warnings.push(`GPS accuracy of ${compatibility.gpsAccuracy}m may limit precision`);
    }

    // Check variable rate capability
    if (exportFormat === 'isoxml' && !compatibility.variableRateCapable) {
      warnings.push('Variable rate application not supported');
      configurationSteps.push('Use uniform rate or upgrade machinery');
    }

    // Generate configuration steps
    configurationSteps.push(
      `Connect via ${compatibility.connectionType}`,
      `Import ${exportFormat.toUpperCase()} file to machinery`,
      'Verify field boundaries and application rates',
      'Test with small area before full field application'
    );

    const estimatedAccuracy = this.calculateEstimatedAccuracy(compatibility, exportFormat);

    return {
      success: isFormatSupported && warnings.length < 2,
      machineryId: compatibility.id,
      recommendedFormat: this.getRecommendedFormat(compatibility),
      configurationSteps,
      warnings,
      estimatedAccuracy
    };
  }

  /**
   * Get machinery database
   */
  async getMachineryDatabase(): Promise<MachineryCompatibility[]> {
    // Return sample machinery database
    return [
      {
        id: 'jd_8r_001',
        brand: 'John Deere',
        model: '8R Series',
        type: 'tractor',
        supportedFormats: {
          shapefile: true,
          kml: false,
          isoxml: true,
          geojson: false,
          csv: true
        },
        gpsAccuracy: 0.3,
        variableRateCapable: true,
        minApplicationRate: 10,
        maxApplicationRate: 500,
        workingWidth: 12,
        connectionType: 'usb',
        tested: true,
        compatibilityScore: 95
      }
      // More machinery entries would be loaded from database
    ];
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private async getMachineryCompatibility(
    brand: string,
    model: string
  ): Promise<MachineryCompatibility | null> {
    
    const database = await this.getMachineryDatabase();
    
    return database.find(machinery => 
      machinery.brand.toLowerCase() === brand.toLowerCase() &&
      machinery.model.toLowerCase().includes(model.toLowerCase())
    ) || null;
  }

  private getRecommendedFormat(compatibility: MachineryCompatibility): string {
    if (compatibility.supportedFormats.isoxml) return 'isoxml';
    if (compatibility.supportedFormats.shapefile) return 'shapefile';
    if (compatibility.supportedFormats.kml) return 'kml';
    return 'csv';
  }

  private calculateEstimatedAccuracy(
    compatibility: MachineryCompatibility,
    format: string
  ): number {
    
    const baseAccuracy = 100 - (compatibility.gpsAccuracy * 10);
    
    // Format accuracy impact
    const formatAccuracy = {
      isoxml: 100,
      shapefile: 95,
      kml: 85,
      geojson: 90,
      csv: 70
    };
    
    const formatScore = formatAccuracy[format as keyof typeof formatAccuracy] || 50;
    
    // Variable rate capability impact
    const vrScore = compatibility.variableRateCapable ? 100 : 80;
    
    return Math.round((baseAccuracy * 0.4 + formatScore * 0.4 + vrScore * 0.2));
  }
}

export const createMachineryIntegrationService = (storageProvider: any) => {
  return new MachineryIntegrationService(storageProvider);
};

export default MachineryIntegrationService;