import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, useMap, WMSTileLayer } from 'react-leaflet';
import { Garden } from '../../types';
import { Map, Layers, Satellite, Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface NDVIMapProps {
  garden: Garden;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

// OrtoMio WMS Configuration - Endpoint Corretto Copernicus
const ORTOMIO_WMS_CONFIG = {
  configId: 'a9646191-f172-4e6e-a965-670c4a222898',
  baseUrl: 'https://sh.dataspace.copernicus.eu/ogc/wms/a9646191-f172-4e6e-a965-670c4a222898',
  layers: 'VEGETATION_INDEX',
  format: 'image/png',
  transparent: true,
  version: '1.3.0',
  tileSize: 256,
  attribution: 'Copernicus/SentinelHub/OrtoMio NDVI'
};

// Componente per controlli mappa
const MapControls: React.FC<{
  showNDVI: boolean;
  onToggleNDVI: () => void;
  onResetView: () => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}> = ({ showNDVI, onToggleNDVI, onResetView, opacity, onOpacityChange }) => {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2">
      {/* Toggle NDVI Layer */}
      <button
        onClick={onToggleNDVI}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          showNDVI 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {showNDVI ? <Eye size={16} /> : <EyeOff size={16} />}
        {showNDVI ? 'Nascondi NDVI' : 'Mostra NDVI'}
      </button>

      {/* Opacity Control */}
      {showNDVI && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Opacità NDVI</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="text-xs text-gray-500 text-center">{Math.round(opacity * 100)}%</div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleZoomIn}
          className="flex-1 flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ZoomIn size={16} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex-1 flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ZoomOut size={16} className="text-gray-700" />
        </button>
      </div>

      {/* Reset View */}
      <button
        onClick={onResetView}
        className="w-full flex items-center gap-3 px-4 py-3 text-base bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
      >
        <RotateCcw size={16} />
        Reset Vista
      </button>
    </div>
  );
};

// Componente per area garden
const GardenBounds: React.FC<{ garden: Garden }> = ({ garden }) => {
  if (!garden.coordinates) return null;

  // Calcola bounds approssimativi basati su sizeSqMeters
  const sizeKm = Math.sqrt(garden.sizeSqMeters) / 1000;
  const latOffset = sizeKm / 111; // ~111 km per grado di latitudine
  const lngOffset = sizeKm / (111 * Math.cos(garden.coordinates.latitude * Math.PI / 180));

  const bounds: [[number, number], [number, number]] = [
    [garden.coordinates.latitude - latOffset/2, garden.coordinates.longitude - lngOffset/2],
    [garden.coordinates.latitude + latOffset/2, garden.coordinates.longitude + lngOffset/2]
  ];

  return (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        color: '#3b82f6',
        weight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.1
      }}
    />
  );
};

const NDVIMap: React.FC<NDVIMapProps> = ({ garden, onBoundsChange }) => {
  const [showNDVI, setShowNDVI] = useState(true);
  const [opacity, setOpacity] = useState(0.8);
  const [mapKey, setMapKey] = useState(0);
  const [wmsError, setWmsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calcola centro mappa
  const center: [number, number] = garden.coordinates 
    ? [garden.coordinates.latitude, garden.coordinates.longitude]
    : [41.9028, 12.4964]; // Roma come fallback

  // Calcola zoom basato su dimensione garden
  const getZoomLevel = () => {
    if (!garden.sizeSqMeters) return 16;
    
    if (garden.sizeSqMeters < 1000) return 18;      // <0.1 ha
    if (garden.sizeSqMeters < 10000) return 16;     // <1 ha  
    if (garden.sizeSqMeters < 100000) return 14;    // <10 ha
    return 12; // >10 ha
  };

  const zoom = getZoomLevel();

  // Test WMS endpoint availability
  useEffect(() => {
    const testWMSEndpoint = async () => {
      try {
        const testUrl = `${ORTOMIO_WMS_CONFIG.baseUrl}?service=WMS&request=GetCapabilities`;
        const response = await fetch(testUrl, { method: 'HEAD' });
        
        if (response.status === 503) {
          setWmsError(true);
          console.warn('WMS Endpoint 503 - Sentinel Hub overload, fallback attivo');
        } else {
          setWmsError(false);
        }
      } catch (error) {
        console.warn('WMS test failed:', error);
        setWmsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    testWMSEndpoint();
  }, []);

  const handleResetView = () => {
    setMapKey(prev => prev + 1); // Force re-render per reset
  };

  const handleToggleNDVI = () => {
    setShowNDVI(!showNDVI);
  };

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[500]">
          <div className="text-center">
            <Satellite className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-gray-600">Caricamento mappa NDVI...</p>
          </div>
        </div>
      )}

      {/* WMS Error Warning */}
      {wmsError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001] bg-yellow-full max-w-sm border border-yellow-300 rounded-lg p-3 max-w-sm">
          <div className="flex items-center gap-3 text-yellow-full max-w-sm">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">Sentinel Hub 503</span>
          </div>
          <p className="text-xs text-yellow-full max-w-sm mt-1">
            Overload temporaneo. Riprova tra 10-30 minuti.
          </p>
        </div>
      )}

      <MapContainer
        key={mapKey}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-[400]"
      >
        {/* Base Map Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* NDVI WMS Layer - Usando WMSTileLayer più stabile */}
        {showNDVI && !wmsError && (
          <WMSTileLayer
            url={ORTOMIO_WMS_CONFIG.baseUrl}
            layers={ORTOMIO_WMS_CONFIG.layers}
            format={ORTOMIO_WMS_CONFIG.format}
            transparent={ORTOMIO_WMS_CONFIG.transparent}
            version={ORTOMIO_WMS_CONFIG.version}
            tileSize={ORTOMIO_WMS_CONFIG.tileSize}
            attribution={ORTOMIO_WMS_CONFIG.attribution}
            opacity={opacity}
          />
        )}

        {/* Garden Bounds */}
        <GardenBounds garden={garden} />

        {/* Map Controls */}
        <MapControls
          showNDVI={showNDVI}
          onToggleNDVI={handleToggleNDVI}
          onResetView={handleResetView}
          opacity={opacity}
          onOpacityChange={setOpacity}
        />
      </MapContainer>

      {/* Legend */}
      {showNDVI && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-3 mb-2">
            <Layers size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-800">Legenda NDVI</span>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-4 h-3 bg-red-500 rounded"></div>
              <span>Critico (0.0-0.2)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-3 bg-orange-400 rounded"></div>
              <span>Scarso (0.2-0.4)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-3 bg-yellow-full max-w-sm rounded"></div>
              <span>Moderato (0.4-0.6)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-3 bg-green-400 rounded"></div>
              <span>Buono (0.6-0.8)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-3 bg-green-600 rounded"></div>
              <span>Eccellente (0.8+)</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center gap-3 mb-2">
          <Map size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-800">Mappa NDVI</span>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Garden:</strong> {garden.name}</div>
          <div><strong>Area:</strong> {(garden.sizeSqMeters / 10000).toFixed(2)} ha</div>
          <div><strong>Fonte:</strong> Sentinel-2 (10m)</div>
          <div><strong>Config:</strong> OrtoMio WMS</div>
        </div>
      </div>
    </div>
  );
};

export default NDVIMap;