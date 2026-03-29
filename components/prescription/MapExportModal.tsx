/**
 * Map Export Modal
 * Modal per export mappe prescrizione in vari formati
 */

import React, { useState, useEffect } from 'react';
import { 
  PrescriptionMap, 
  ExportConfiguration,
  MachineryCompatibility 
} from '../../types/prescriptionMaps';
import { createGeoExportService } from '../../services/geoExportService';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { 
  Download, 
  FileText, 
  Map as MapIcon, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Truck,
  X,
  Eye,
  Copy
} from 'lucide-react';

interface MapExportModalProps {
  prescriptionMap: PrescriptionMap;
  onClose: () => void;
}

const MapExportModal: React.FC<MapExportModalProps> = ({
  prescriptionMap,
  onClose
}) => {
  const { storageProvider } = useStorage();
  const exportService = createGeoExportService(storageProvider);
  
  // State
  const [exportConfig, setExportConfig] = useState<ExportConfiguration>({
    format: 'shapefile',
    coordinateSystem: 'WGS84',
    compression: true,
    includeMetadata: true,
    includePreview: false
  });
  
  const [machineryCompatibility, setMachineryCompatibility] = useState<{
    compatible: boolean;
    compatibility: MachineryCompatibility | null;
    recommendations: string[];
    warnings: string[];
  } | null>(null);
  
  const [selectedMachinery, setSelectedMachinery] = useState<{
    brand: string;
    model: string;
  }>({ brand: '', model: '' });
  
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'format' | 'machinery' | 'advanced'>('format');

  useEffect(() => {
    if (selectedMachinery.brand && selectedMachinery.model) {
      checkMachineryCompatibility();
    }
  }, [selectedMachinery, exportConfig.format]);

  const checkMachineryCompatibility = async () => {
    try {
      const result = await exportService.checkMachineryCompatibility(
        exportConfig.format,
        selectedMachinery.brand,
        selectedMachinery.model
      );
      setMachineryCompatibility(result);
    } catch (error) {
      console.error('Error checking machinery compatibility:', error);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 15, 90));
      }, 300);
      
      const result = await exportService.exportPrescriptionMap(prescriptionMap, {
        ...exportConfig,
        machineryBrand: selectedMachinery.brand || undefined,
        machineryModel: selectedMachinery.model || undefined
      });
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      if (result.success) {
        setExportResult(result);
        
        // Auto-download if URL available
        if (result.downloadUrl) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = result.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        alert(`❌ Errore nell'export:\n${result.errors?.join('\n')}`);
      }
    } catch (error) {
      console.error('Error exporting map:', error);
      alert('Errore durante l\'export');
    } finally {
      setExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'shapefile': return <MapIcon className="text-blue-600" size={20} />;
      case 'kml': return <MapIcon className="text-green-600" size={20} />;
      case 'isoxml': return <Truck className="text-orange-600" size={20} />;
      case 'geojson': return <FileText className="text-purple-600" size={20} />;
      case 'csv': return <FileText className="text-gray-600" size={20} />;
      default: return <FileText className="text-gray-600" size={20} />;
    }
  };

  const getFormatDescription = (format: string) => {
    const descriptions = {
      shapefile: 'Standard GIS - Compatibile con la maggior parte dei software agricoli',
      kml: 'Google Earth - Ideale per visualizzazione e GPS consumer',
      isoxml: 'Standard ISOBUS - Per machinery agricole professionali',
      geojson: 'Web standard - Per applicazioni web e moderne',
      csv: 'Formato universale - Richiede importazione manuale'
    };
    return descriptions[format as keyof typeof descriptions] || 'Formato sconosciuto';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="text-green-600" size={24} />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Export Mappa Prescrizione</h2>
              <p className="text-sm text-gray-600">{prescriptionMap.name}</p>
            </div>
          </div>
          
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Configuration */}
          <div className="w-2/3 border-r border-gray-200 overflow-y-auto">
            {/* Tabs */}
            <div className="border-b border-gray-200 px-6 py-4">
              <nav className="flex space-x-8">
                {[
                  { key: 'format', label: 'Formato', icon: FileText },
                  { key: 'machinery', label: 'Machinery', icon: Truck },
                  { key: 'advanced', label: 'Avanzate', icon: Settings }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Format Tab */}
              {activeTab === 'format' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona Formato Export</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                      {(['shapefile', 'kml', 'isoxml', 'geojson', 'csv'] as const).map((format) => (
                        <label
                          key={format}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            exportConfig.format === format
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="format"
                            value={format}
                            checked={exportConfig.format === format}
                            onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as any }))}
                            className="sr-only"
                          />
                          
                          <div className="flex items-center gap-3 flex-1">
                            {getFormatIcon(format)}
                            <div>
                              <div className="font-medium text-gray-900 uppercase">{format}</div>
                              <div className="text-sm text-gray-600">{getFormatDescription(format)}</div>
                            </div>
                          </div>
                          
                          {exportConfig.format === format && (
                            <CheckCircle className="text-green-600" size={20} />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Coordinate System */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Sistema di Coordinate</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="coordinateSystem"
                          value="WGS84"
                          checked={exportConfig.coordinateSystem === 'WGS84'}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, coordinateSystem: e.target.value as any }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">WGS84</div>
                          <div className="text-sm text-gray-600">Standard GPS</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="coordinateSystem"
                          value="UTM"
                          checked={exportConfig.coordinateSystem === 'UTM'}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, coordinateSystem: e.target.value as any }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">UTM</div>
                          <div className="text-sm text-gray-600">Proiezione metrica</div>
                        </div>
                      </label>
                    </div>
                    
                    {exportConfig.coordinateSystem === 'UTM' && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zona UTM
                        </label>
                        <select
                          value={exportConfig.utmZone || '33N'}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, utmZone: e.target.value }))}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="32N">32N (Italia Ovest)</option>
                          <option value="33N">33N (Italia Centro-Est)</option>
                          <option value="34N">34N (Italia Sud-Est)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Machinery Tab */}
              {activeTab === 'machinery' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Compatibilità Machinery</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marca
                        </label>
                        <select
                          value={selectedMachinery.brand}
                          onChange={(e) => setSelectedMachinery(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Seleziona marca...</option>
                          <option value="John Deere">John Deere</option>
                          <option value="Case IH">Case IH</option>
                          <option value="New Holland">New Holland</option>
                          <option value="Fendt">Fendt</option>
                          <option value="Massey Ferguson">Massey Ferguson</option>
                          <option value="Claas">Claas</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Modello
                        </label>
                        <input
                          type="text"
                          value={selectedMachinery.model}
                          onChange={(e) => setSelectedMachinery(prev => ({ ...prev, model: e.target.value }))}
                          placeholder="es. 8R Series"
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {/* Compatibility Results */}
                    {machineryCompatibility && (
                      <div className={`p-4 rounded-lg border ${
                        machineryCompatibility.compatible 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          {machineryCompatibility.compatible ? (
                            <CheckCircle className="text-green-600" size={20} />
                          ) : (
                            <AlertTriangle className="text-yellow-full max-w-sm" size={20} />
                          )}
                          <span className={`font-medium ${
                            machineryCompatibility.compatible ? 'text-green-900' : 'text-yellow-900'
                          }`}>
                            {machineryCompatibility.compatible ? 'Compatibile' : 'Compatibilità Limitata'}
                          </span>
                        </div>

                        {machineryCompatibility.recommendations.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Raccomandazioni:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {machineryCompatibility.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <span className="text-green-500 mt-1">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {machineryCompatibility.warnings.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-yellow-full max-w-sm mb-2">Avvertenze:</p>
                            <ul className="text-sm text-yellow-full max-w-sm space-y-1">
                              {machineryCompatibility.warnings.map((warning, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <span className="text-yellow-full max-w-sm mt-1">⚠</span>
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Opzioni Avanzate</h3>
                    
                    {/* General Options */}
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportConfig.compression}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, compression: e.target.checked }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Compressione file</div>
                          <div className="text-sm text-gray-600">Riduce dimensioni file (raccomandato)</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportConfig.includeMetadata}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Includi metadati</div>
                          <div className="text-sm text-gray-600">Informazioni aggiuntive sulla mappa</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportConfig.includePreview}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, includePreview: e.target.checked }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Includi anteprima</div>
                          <div className="text-sm text-gray-600">Immagine di anteprima della mappa</div>
                        </div>
                      </label>
                    </div>

                    {/* Format-specific options */}
                    {exportConfig.format === 'kml' && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Opzioni KML</h4>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={exportConfig.kmlOptions?.stylePolygons !== false}
                              onChange={(e) => setExportConfig(prev => ({
                                ...prev,
                                kmlOptions: { ...prev.kmlOptions, stylePolygons: e.target.checked }
                              }))}
                              className="mr-3"
                            />
                            <span className="text-sm">Stile poligoni colorati</span>
                          </label>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Schema colori
                            </label>
                            <select
                              value={exportConfig.kmlOptions?.colorScheme || 'default'}
                              onChange={(e) => setExportConfig(prev => ({
                                ...prev,
                                kmlOptions: { ...prev.kmlOptions, colorScheme: e.target.value as any }
                              }))}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="default">Default</option>
                              <option value="ndvi">NDVI</option>
                              <option value="yield">Produzione</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {exportConfig.format === 'csv' && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Opzioni CSV</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delimitatore
                            </label>
                            <select
                              value={exportConfig.csvOptions?.delimiter || ','}
                              onChange={(e) => setExportConfig(prev => ({
                                ...prev,
                                csvOptions: { ...prev.csvOptions, delimiter: e.target.value as any }
                              }))}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value=",">Virgola (,)</option>
                              <option value=";">Punto e virgola (;)</option>
                              <option value="\t">Tab</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Formato coordinate
                            </label>
                            <select
                              value={exportConfig.csvOptions?.coordinateFormat || 'decimal'}
                              onChange={(e) => setExportConfig(prev => ({
                                ...prev,
                                csvOptions: { ...prev.csvOptions, coordinateFormat: e.target.value as any }
                              }))}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="decimal">Decimale</option>
                              <option value="dms">Gradi, Minuti, Secondi</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Summary & Export */}
          <div className="w-1/3 p-6 bg-gray-50">
            <div className="space-y-6">
              {/* Map Summary */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Riepilogo Mappa</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zone:</span>
                    <span className="font-medium">{prescriptionMap.totalZones}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">{(prescriptionMap.totalAreaSqm / 10000).toFixed(1)} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Qualità:</span>
                    <span className="font-medium">{prescriptionMap.qualityScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium capitalize">{prescriptionMap.mapType}</span>
                  </div>
                </div>
              </div>

              {/* Export Configuration Summary */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Configurazione Export</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formato:</span>
                    <span className="font-medium uppercase">{exportConfig.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinate:</span>
                    <span className="font-medium">{exportConfig.coordinateSystem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compressione:</span>
                    <span className="font-medium">{exportConfig.compression ? 'Sì' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Export Progress */}
              {exporting && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">Export in corso...</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{exportProgress}% completato</p>
                </div>
              )}

              {/* Export Result */}
              {exportResult && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-medium text-green-900">Export Completato</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">File:</span>
                      <span className="font-medium text-green-800">{exportResult.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Dimensione:</span>
                      <span className="font-medium text-green-800">
                        {exportResult.fileSize ? `${(exportResult.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                      </span>
                    </div>
                    {exportResult.exportRecordId && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Trace ID:</span>
                        <span className="font-medium text-green-800">{exportResult.exportRecordId}</span>
                      </div>
                    )}
                  </div>
                  
                  {exportResult.downloadUrl && (
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = exportResult.downloadUrl;
                          link.download = exportResult.fileName;
                          link.click();
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-3"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(exportResult.downloadUrl);
                          alert('Link copiato negli appunti');
                        }}
                        className="p-3 text-green-600 border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Esportazione...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Esporta Mappa
                  </>
                )}
              </button>

              {/* Preview Button */}
              <button
                onClick={() => {
                  // TODO: Implement map preview
                  alert('Anteprima mappa - funzionalità in sviluppo');
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
              >
                <Eye size={16} />
                Anteprima
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExportModal;
