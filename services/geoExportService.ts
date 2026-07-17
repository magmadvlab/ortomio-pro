/**
 * Geo Export Service
 * Servizio per export mappe prescrizione in formati GIS standard
 */

import {
  PrescriptionMap,
  PrescriptionZone,
  ExportConfiguration,
  MachineryCompatibility
} from '../types/prescriptionMaps';

export interface ExportResult {
  success: boolean;
  fileName: string;
  filePath?: string;
  downloadUrl?: string;
  fileSize?: number;
  exportRecordId?: string;
  errors?: string[];
  warnings?: string[];
  metadata: {
    format: string;
    coordinateSystem: string;
    zoneCount: number;
    totalArea: number;
    generatedAt: string;
    algorithmVersion?: string;
    inputHash?: string;
    contentChecksum?: string;
    sourceQuality?: string;
  };
}

export interface ShapefileComponents {
  shp: ArrayBuffer; // Geometry data
  shx: ArrayBuffer; // Shape index
  dbf: ArrayBuffer; // Attribute data
  prj: string;      // Projection info
  cpg?: string;     // Code page info
}

export interface KMLDocument {
  header: string;
  styles: string;
  placemarks: string[];
  footer: string;
}

export interface ISOXMLTask {
  taskData: string;
  deviceElements: string[];
  products: string[];
  workingAreas: string[];
}

/**
 * GEO EXPORT SERVICE
 */
export class GeoExportService {
  private storageProvider: any;

  constructor(storageProvider: any) {
    this.storageProvider = storageProvider;
  }

  /**
   * Export prescription map in specified format
   */
  async exportPrescriptionMap(
    prescriptionMap: PrescriptionMap,
    config: ExportConfiguration
  ): Promise<ExportResult> {
    
    try {
      if (!prescriptionMap.algorithmMetadata?.algorithmVersion || !prescriptionMap.algorithmMetadata.inputHash || !prescriptionMap.contentChecksum) {
        return {
          success: false,
          fileName: '',
          errors: ['Export bloccato: provenance algoritmo/input e checksum mancanti. Crea una nuova revisione P6.'],
          metadata: this.createMetadata(prescriptionMap, config),
        }
      }
      // Validate export configuration
      const validationErrors = this.validateExportConfig(config);
      if (validationErrors.length > 0) {
        return {
          success: false,
          fileName: '',
          errors: validationErrors,
          metadata: this.createMetadata(prescriptionMap, config)
        };
      }

      // Transform coordinates if needed
      const transformedZones = await this.transformCoordinates(
        prescriptionMap.zones,
        config.coordinateSystem,
        config.utmZone
      );

      let result: ExportResult;

      // Export based on format
      switch (config.format) {
        case 'shapefile':
          result = await this.exportShapefile(prescriptionMap, transformedZones, config);
          break;
        
        case 'kml':
          result = await this.exportKML(prescriptionMap, transformedZones, config);
          break;
        
        case 'isoxml':
          result = await this.exportISOXML(prescriptionMap, transformedZones, config);
          break;
        
        case 'geojson':
          result = await this.exportGeoJSON(prescriptionMap, transformedZones, config);
          break;
        
        case 'csv':
          result = await this.exportCSV(prescriptionMap, transformedZones, config);
          break;
        
        default:
          return {
            success: false,
            fileName: '',
            errors: [`Unsupported export format: ${config.format}`],
            metadata: this.createMetadata(prescriptionMap, config)
          };
      }

      // Add metadata
      result.metadata = this.createMetadata(prescriptionMap, config);
      
      // Log export for tracking
      const exportRecordId = await this.logExport(prescriptionMap, config, result);
      if (exportRecordId) {
        result.exportRecordId = exportRecordId;
      }
      
      return result;

    } catch (error) {
      console.error('Error exporting prescription map:', error);
      return {
        success: false,
        fileName: '',
        errors: [error instanceof Error ? error.message : 'Unknown export error'],
        metadata: this.createMetadata(prescriptionMap, config)
      };
    }
  }

  /**
   * Export as Shapefile (.shp + .shx + .dbf + .prj)
   */
  private async exportShapefile(
    prescriptionMap: PrescriptionMap,
    zones: PrescriptionZone[],
    config: ExportConfiguration
  ): Promise<ExportResult> {
    
    const fileName = `${this.sanitizeFileName(prescriptionMap.name)}_prescription.zip`;
    
    try {
      // Generate shapefile components
      const components = await this.generateShapefileComponents(zones, config);
      
      // Create ZIP archive with all components
      const zipBuffer = await this.createZipArchive({
        [`${prescriptionMap.name}.shp`]: components.shp,
        [`${prescriptionMap.name}.shx`]: components.shx,
        [`${prescriptionMap.name}.dbf`]: components.dbf,
        [`${prescriptionMap.name}.prj`]: new TextEncoder().encode(components.prj).buffer as ArrayBuffer,
        ...(components.cpg && { [`${prescriptionMap.name}.cpg`]: new TextEncoder().encode(components.cpg).buffer as ArrayBuffer })
      });
      
      // Save to storage
      const filePath = await this.saveToStorage(fileName, zipBuffer);
      const downloadUrl = await this.generateDownloadUrl(filePath);
      
      return {
        success: true,
        fileName,
        filePath,
        downloadUrl,
        fileSize: zipBuffer.byteLength,
        metadata: this.createMetadata(prescriptionMap, config)
      };
      
    } catch (error) {
      return {
        success: false,
        fileName,
        errors: [`Shapefile export failed: ${error}`],
        metadata: this.createMetadata(prescriptionMap, config)
      };
    }
  }

  /**
   * Export as KML/KMZ
   */
  private async exportKML(
    prescriptionMap: PrescriptionMap,
    zones: PrescriptionZone[],
    config: ExportConfiguration
  ): Promise<ExportResult> {
    
    const fileName = `${this.sanitizeFileName(prescriptionMap.name)}_prescription.kml`;
    
    try {
      const kmlDocument = this.generateKMLDocument(prescriptionMap, zones, config);
      const kmlContent = this.assembleKMLContent(kmlDocument);
      
      let finalBuffer: ArrayBuffer;
      let finalFileName = fileName;
      
      if (config.compression) {
        // Create KMZ (compressed KML)
        finalFileName = fileName.replace('.kml', '.kmz');
        finalBuffer = await this.createZipArchive({
          'doc.kml': new TextEncoder().encode(kmlContent).buffer as ArrayBuffer
        });
      } else {
        finalBuffer = new TextEncoder().encode(kmlContent).buffer as ArrayBuffer;
      }
      
      const filePath = await this.saveToStorage(finalFileName, finalBuffer);
      const downloadUrl = await this.generateDownloadUrl(filePath);
      
      return {
        success: true,
        fileName: finalFileName,
        filePath,
        downloadUrl,
        fileSize: finalBuffer.byteLength,
        metadata: this.createMetadata(prescriptionMap, config)
      };
      
    } catch (error) {
      return {
        success: false,
        fileName,
        errors: [`KML export failed: ${error}`],
        metadata: this.createMetadata(prescriptionMap, config)
      };
    }
  }

  /**
   * Export as ISO-XML (ISOBUS standard)
   */
  private async exportISOXML(
    prescriptionMap: PrescriptionMap,
    zones: PrescriptionZone[],
    config: ExportConfiguration
  ): Promise<ExportResult> {
    
    const fileName = `${this.sanitizeFileName(prescriptionMap.name)}_TASKDATA.zip`;
    
    try {
      const isoxmlTask = this.generateISOXMLTask(prescriptionMap, zones, config);
      
      // Create TASKDATA structure
      const taskDataFiles = {
        'TASKDATA.XML': new TextEncoder().encode(isoxmlTask.taskData).buffer as ArrayBuffer,
        ...isoxmlTask.deviceElements.reduce((acc, element, index) => {
          acc[`DVC${String(index).padStart(5, '0')}.XML`] = new TextEncoder().encode(element).buffer as ArrayBuffer;
          return acc;
        }, {} as Record<string, ArrayBuffer>),
        ...isoxmlTask.products.reduce((acc, product, index) => {
          acc[`PDT${String(index).padStart(5, '0')}.XML`] = new TextEncoder().encode(product).buffer as ArrayBuffer;
          return acc;
        }, {} as Record<string, ArrayBuffer>)
      };
      
      const zipBuffer = await this.createZipArchive(taskDataFiles);
      
      const filePath = await this.saveToStorage(fileName, zipBuffer);
      const downloadUrl = await this.generateDownloadUrl(filePath);
      
      return {
        success: true,
        fileName,
        filePath,
        downloadUrl,
        fileSize: zipBuffer.byteLength,
        metadata: this.createMetadata(prescriptionMap, config)
      };
      
    } catch (error) {
      return {
        success: false,
        fileName,
        errors: [`ISO-XML export failed: ${error}`],
        metadata: this.createMetadata(prescriptionMap, config)
      };
    }
  }

  /**
   * Export as GeoJSON
   */
  private async exportGeoJSON(
    prescriptionMap: PrescriptionMap,
    zones: PrescriptionZone[],
    config: ExportConfiguration
  ): Promise<ExportResult> {
    
    const fileName = `${this.sanitizeFileName(prescriptionMap.name)}_prescription.geojson`;
    
    try {
      const geoJson = {
        type: 'FeatureCollection',
        name: prescriptionMap.name,
        crs: {
          type: 'name',
          properties: {
            name: this.getGeoJSONCRS(config.coordinateSystem)
          }
        },
        features: zones.map(zone => ({
          type: 'Feature',
          properties: {
            zone_id: zone.id,
            zone_number: zone.zoneNumber,
            zone_name: zone.zoneName,
            application_rate: zone.prescription.applicationRate,
            unit: zone.prescription.unit,
            product_name: zone.prescription.productName || '',
            area_sqm: zone.areaSqm,
            data_quality: zone.dataQuality,
            confidence: zone.confidence,
            avg_ndvi: zone.sourceData.avgNdvi,
            avg_health: zone.sourceData.avgPlantHealth,
            plant_count: zone.sourceData.plantCount
          },
          geometry: zone.geometry
        }))
      };
      
      const geoJsonContent = JSON.stringify(geoJson, null, 2);
      const buffer = new TextEncoder().encode(geoJsonContent).buffer as ArrayBuffer;
      
      const filePath = await this.saveToStorage(fileName, buffer);
      const downloadUrl = await this.generateDownloadUrl(filePath);
      
      return {
        success: true,
        fileName,
        filePath,
        downloadUrl,
        fileSize: buffer.byteLength,
        metadata: this.createMetadata(prescriptionMap, config)
      };
      
    } catch (error) {
      return {
        success: false,
        fileName,
        errors: [`GeoJSON export failed: ${error}`],
        metadata: this.createMetadata(prescriptionMap, config)
      };
    }
  }

  /**
   * Export as CSV with coordinates
   */
  private async exportCSV(
    prescriptionMap: PrescriptionMap,
    zones: PrescriptionZone[],
    config: ExportConfiguration
  ): Promise<ExportResult> {
    
    const fileName = `${this.sanitizeFileName(prescriptionMap.name)}_prescription.csv`;
    
    try {
      const delimiter = config.csvOptions?.delimiter || ',';
      const includeHeaders = config.csvOptions?.includeHeaders !== false;
      const coordinateFormat = config.csvOptions?.coordinateFormat || 'decimal';
      
      let csvContent = '';
      
      // Add headers
      if (includeHeaders) {
        const headers = [
          'zone_id', 'zone_number', 'zone_name', 'latitude', 'longitude',
          'application_rate', 'unit', 'product_name', 'area_sqm',
          'data_quality', 'confidence', 'avg_ndvi', 'avg_health', 'plant_count'
        ];
        csvContent += headers.join(delimiter) + '\n';
      }
      
      // Add data rows
      zones.forEach(zone => {
        const lat = this.formatCoordinate(zone.centroid.latitude, coordinateFormat);
        const lon = this.formatCoordinate(zone.centroid.longitude, coordinateFormat);
        
        const row = [
          zone.id,
          zone.zoneNumber,
          `"${zone.zoneName}"`,
          lat,
          lon,
          zone.prescription.applicationRate,
          zone.prescription.unit,
          `"${zone.prescription.productName || ''}"`,
          zone.areaSqm,
          zone.dataQuality,
          zone.confidence,
          zone.sourceData.avgNdvi || '',
          zone.sourceData.avgPlantHealth || '',
          zone.sourceData.plantCount || ''
        ];
        
        csvContent += row.join(delimiter) + '\n';
      });
      
      const buffer = new TextEncoder().encode(csvContent).buffer as ArrayBuffer;
      
      const filePath = await this.saveToStorage(fileName, buffer);
      const downloadUrl = await this.generateDownloadUrl(filePath);
      
      return {
        success: true,
        fileName,
        filePath,
        downloadUrl,
        fileSize: buffer.byteLength,
        metadata: this.createMetadata(prescriptionMap, config)
      };
      
    } catch (error) {
      return {
        success: false,
        fileName,
        errors: [`CSV export failed: ${error}`],
        metadata: this.createMetadata(prescriptionMap, config)
      };
    }
  }

  /**
   * Check machinery compatibility for export format
   */
  async checkMachineryCompatibility(
    format: string,
    machineryBrand?: string,
    machineryModel?: string
  ): Promise<{
    compatible: boolean;
    compatibility: MachineryCompatibility | null;
    recommendations: string[];
    warnings: string[];
  }> {
    
    try {
      let compatibility: MachineryCompatibility | null = null;
      
      if (machineryBrand && machineryModel) {
        // Look up specific machinery
        compatibility = await this.getMachineryCompatibility(machineryBrand, machineryModel);
      }
      
      const recommendations: string[] = [];
      const warnings: string[] = [];
      
      // General format compatibility
      const formatCompatibility = this.getFormatCompatibility(format);
      
      if (compatibility) {
        const isCompatible = compatibility.supportedFormats[format as keyof typeof compatibility.supportedFormats];
        
        if (!isCompatible) {
          warnings.push(`${machineryBrand} ${machineryModel} does not natively support ${format.toUpperCase()} format`);
          recommendations.push('Consider using a supported format or conversion software');
        }
        
        if (compatibility.gpsAccuracy > 1.0) {
          warnings.push(`GPS accuracy of ${compatibility.gpsAccuracy}m may limit precision farming effectiveness`);
        }
        
        if (!compatibility.variableRateCapable && format === 'isoxml') {
          warnings.push('Machinery does not support variable rate application');
          recommendations.push('Use uniform rate or upgrade machinery for variable rate capability');
        }
        
      } else {
        recommendations.push('Verify format compatibility with your specific machinery model');
        recommendations.push('Test import with a small sample file before full field application');
      }
      
      // Format-specific recommendations
      switch (format) {
        case 'shapefile':
          recommendations.push('Shapefile is widely supported by most GIS software and GPS units');
          break;
        case 'kml':
          recommendations.push('KML works well with Google Earth and many consumer GPS devices');
          break;
        case 'isoxml':
          recommendations.push('ISO-XML is the standard for professional agricultural machinery');
          if (!compatibility?.variableRateCapable) {
            warnings.push('Variable rate features require compatible machinery');
          }
          break;
        case 'csv':
          recommendations.push('CSV format requires manual import but works with most systems');
          break;
      }
      
      return {
        compatible: warnings.length === 0,
        compatibility,
        recommendations,
        warnings
      };
      
    } catch (error) {
      return {
        compatible: false,
        compatibility: null,
        recommendations: ['Unable to verify compatibility - proceed with caution'],
        warnings: ['Compatibility check failed']
      };
    }
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private validateExportConfig(config: ExportConfiguration): string[] {
    const errors: string[] = [];
    
    if (!config.format) {
      errors.push('Export format is required');
    }
    
    if (config.coordinateSystem === 'UTM' && !config.utmZone) {
      errors.push('UTM zone is required for UTM coordinate system');
    }
    
    return errors;
  }

  private async transformCoordinates(
    zones: PrescriptionZone[],
    targetSystem: string,
    utmZone?: string
  ): Promise<PrescriptionZone[]> {
    // For now, return zones as-is (WGS84)
    // In production, would implement coordinate transformation
    return zones;
  }

  private async generateShapefileComponents(
    zones: PrescriptionZone[],
    config: ExportConfiguration
  ): Promise<ShapefileComponents> {
    // Simplified shapefile generation
    // In production, would use proper shapefile library
    
    const shp = new ArrayBuffer(100); // Placeholder geometry data
    const shx = new ArrayBuffer(100); // Placeholder index data
    const dbf = new ArrayBuffer(1000); // Placeholder attribute data
    
    const prj = this.getProjectionString(config.coordinateSystem, config.utmZone);
    const cpg = config.shapefileOptions?.encoding === 'UTF-8' ? 'UTF-8' : undefined;
    
    return { shp, shx, dbf, prj, cpg };
  }

  private generateKMLDocument(
    prescriptionMap: PrescriptionMap,
    zones: PrescriptionZone[],
    config: ExportConfiguration
  ): KMLDocument {
    
    const header = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${prescriptionMap.name}</name>
    <description>Prescription Map generated by OrtoMio</description>`;
    
    const styles = this.generateKMLStyles(config);
    
    const placemarks = zones.map(zone => this.generateKMLPlacemark(zone, config));
    
    const footer = `  </Document>
</kml>`;
    
    return { header, styles, placemarks, footer };
  }

  private generateKMLStyles(config: ExportConfiguration): string {
    const colorScheme = config.kmlOptions?.colorScheme || 'default';
    
    // Generate color styles based on scheme
    return `
    <Style id="zone_style">
      <PolyStyle>
        <color>7f00ff00</color>
        <outline>1</outline>
      </PolyStyle>
      <LineStyle>
        <color>ff000000</color>
        <width>2</width>
      </LineStyle>
    </Style>`;
  }

  private generateKMLPlacemark(zone: PrescriptionZone, config: ExportConfiguration): string {
    const coordinates = zone.geometry.coordinates[0]
      .map(coord => `${coord[0]},${coord[1]},0`)
      .join(' ');
    
    return `
    <Placemark>
      <name>${zone.zoneName}</name>
      <description>
        Application Rate: ${zone.prescription.applicationRate} ${zone.prescription.unit}
        Area: ${zone.areaSqm} m²
        Data Quality: ${zone.dataQuality}%
      </description>
      <styleUrl>#zone_style</styleUrl>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordinates}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
  }

  private generateISOXMLTask(
    prescriptionMap: PrescriptionMap,
    zones: PrescriptionZone[],
    config: ExportConfiguration
  ): ISOXMLTask {
    
    const taskData = `<?xml version="1.0" encoding="UTF-8"?>
<ISO11783_TaskData VersionMajor="4" VersionMinor="0" ManagementSoftwareManufacturer="OrtoMio" ManagementSoftwareVersion="1.0">
  <TSK A="${prescriptionMap.id}" B="${prescriptionMap.name}" C="1" D="4" E="1" F="1" G="4">
    ${zones.map(zone => `<TZN A="${zone.id}" B="${zone.zoneName}" C="1" />`).join('\n    ')}
  </TSK>
</ISO11783_TaskData>`;
    
    return {
      taskData,
      deviceElements: [],
      products: [],
      workingAreas: []
    };
  }

  private assembleKMLContent(document: KMLDocument): string {
    return [
      document.header,
      document.styles,
      ...document.placemarks,
      document.footer
    ].join('\n');
  }

  private async createZipArchive(files: Record<string, ArrayBuffer>): Promise<ArrayBuffer> {
    // Simplified ZIP creation
    // In production, would use proper ZIP library
    const totalSize = Object.values(files).reduce((sum, buffer) => sum + buffer.byteLength, 0);
    return new ArrayBuffer(totalSize + 1000); // Placeholder with overhead
  }

  private async saveToStorage(fileName: string, buffer: ArrayBuffer): Promise<string> {
    // Save to storage provider
    // For now, return mock path
    return `/exports/${fileName}`;
  }

  private async generateDownloadUrl(filePath: string): Promise<string> {
    // Generate temporary download URL
    // For now, return mock URL
    return `https://ortomio.com/downloads${filePath}?expires=${Date.now() + 3600000}`;
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  }

  private getProjectionString(coordinateSystem: string, utmZone?: string): string {
    switch (coordinateSystem) {
      case 'WGS84':
        return 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]';
      case 'UTM':
        return `PROJCS["WGS 84 / UTM zone ${utmZone}",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",${this.getUTMCentralMeridian(utmZone || '33N')}],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1]]`;
      default:
        return 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]';
    }
  }

  private getUTMCentralMeridian(utmZone: string): number {
    const zoneNumber = parseInt(utmZone.replace(/[NS]/, ''));
    return (zoneNumber - 1) * 6 - 180 + 3;
  }

  private getGeoJSONCRS(coordinateSystem: string): string {
    switch (coordinateSystem) {
      case 'WGS84':
        return 'urn:ogc:def:crs:OGC:1.3:CRS84';
      case 'UTM':
        return 'urn:ogc:def:crs:EPSG::32633'; // Example UTM zone
      default:
        return 'urn:ogc:def:crs:OGC:1.3:CRS84';
    }
  }

  private formatCoordinate(coordinate: number, format: string): string {
    if (format === 'dms') {
      // Convert to degrees, minutes, seconds
      const degrees = Math.floor(Math.abs(coordinate));
      const minutes = Math.floor((Math.abs(coordinate) - degrees) * 60);
      const seconds = ((Math.abs(coordinate) - degrees) * 60 - minutes) * 60;
      const direction = coordinate >= 0 ? 'N' : 'S';
      return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
    }
    return coordinate.toFixed(6);
  }

  private getFormatCompatibility(format: string): { widely_supported: boolean; notes: string } {
    const compatibility = {
      shapefile: { widely_supported: true, notes: 'Industry standard for GIS data' },
      kml: { widely_supported: true, notes: 'Supported by Google Earth and many GPS devices' },
      isoxml: { widely_supported: false, notes: 'Professional agricultural machinery standard' },
      geojson: { widely_supported: true, notes: 'Modern web mapping standard' },
      csv: { widely_supported: true, notes: 'Universal format, requires manual import' }
    };
    
    return compatibility[format as keyof typeof compatibility] || 
           { widely_supported: false, notes: 'Unknown format compatibility' };
  }

  private async getMachineryCompatibility(brand: string, model: string): Promise<MachineryCompatibility | null> {
    // Query machinery compatibility database
    // For now, return null
    return null;
  }

  private createMetadata(prescriptionMap: PrescriptionMap, config: ExportConfiguration) {
    return {
      format: config.format,
      coordinateSystem: config.coordinateSystem,
      zoneCount: prescriptionMap.totalZones,
      totalArea: prescriptionMap.totalAreaSqm,
      generatedAt: new Date().toISOString(),
      algorithmVersion: prescriptionMap.algorithmMetadata?.algorithmVersion,
      inputHash: prescriptionMap.algorithmMetadata?.inputHash,
      contentChecksum: prescriptionMap.contentChecksum,
      sourceQuality: prescriptionMap.algorithmMetadata?.sourceQuality,
    };
  }

  private async logExport(
    prescriptionMap: PrescriptionMap,
    config: ExportConfiguration,
    result: ExportResult
  ): Promise<string | undefined> {
    if (!this.storageProvider?.createPrescriptionMapExportRecord) {
      return undefined
    }

    const exportedAt = new Date().toISOString()
    const exportRecord = await this.storageProvider.createPrescriptionMapExportRecord({
      prescriptionMapId: prescriptionMap.id,
      gardenId: prescriptionMap.gardenId,
      versionNumber: prescriptionMap.versionNumber || 1,
      format: config.format,
      coordinateSystem: config.coordinateSystem,
      compression: config.compression,
      includeMetadata: config.includeMetadata,
      includePreview: config.includePreview,
      fileName: result.fileName,
      filePath: result.filePath,
      downloadUrl: result.downloadUrl,
      fileSize: result.fileSize,
      status: result.downloadUrl ? 'downloaded' : 'generated',
      machineryBrand: config.machineryBrand,
      machineryModel: config.machineryModel,
      machineryProfileId: config.isoxmlOptions?.machineryProfile,
      warnings: result.warnings,
      metadata: {
        zoneCount: prescriptionMap.totalZones,
        totalArea: prescriptionMap.totalAreaSqm,
        coordinateSystem: config.coordinateSystem,
        algorithmVersion: prescriptionMap.algorithmMetadata?.algorithmVersion || null,
        inputHash: prescriptionMap.algorithmMetadata?.inputHash || null,
        contentChecksum: prescriptionMap.contentChecksum || null,
        sourceQuality: prescriptionMap.algorithmMetadata?.sourceQuality || null,
      },
      exportedAt,
      downloadedAt: result.downloadUrl ? exportedAt : undefined,
    })

    if (this.storageProvider?.updatePrescriptionMap) {
      await this.storageProvider.updatePrescriptionMap(prescriptionMap.id, {
        lastExportedAt: exportedAt,
        exportCount: (prescriptionMap.exportCount || 0) + 1,
      }).catch(() => undefined)
    }

    return exportRecord.id
  }
}

/**
 * UTILITY FUNCTIONS
 */

export const createGeoExportService = (storageProvider: any) => {
  return new GeoExportService(storageProvider);
};

export default GeoExportService;
