import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Mountain, Info } from 'lucide-react';
import { getCurrentPositionWithRetry, getDefaultCoordinates } from '@/services/geolocationService';
import { GardenType } from '@/types';

interface LocationStepProps {
  gardenType: GardenType | '';
  latitude: string;
  longitude: string;
  altitudeMeters: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onAltitudeChange: (value: string) => void;
  onAltitudeSourceChange: (source: 'manual' | 'inferred' | null) => void;
  altitudeSource: 'manual' | 'inferred' | null;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  gardenType,
  latitude,
  longitude,
  altitudeMeters,
  onLatitudeChange,
  onLongitudeChange,
  onAltitudeChange,
  onAltitudeSourceChange,
  altitudeSource,
}) => {
  const [loading, setLoading] = useState(false);
  const [inferringGeo, setInferringGeo] = useState(false);

  // Determina se la posizione è necessaria
  const needsLocation = !['Indoor', 'Hydroponic', 'Aquaponic', 'Aeroponic'].includes(gardenType);
  const isIndoor = ['Indoor', 'Hydroponic', 'Aquaponic', 'Aeroponic'].includes(gardenType);
  const isGreenhouse = gardenType === 'Greenhouse' || gardenType === 'Tunnel';

  // Autocompilazione automatica al mount se permessi
  useEffect(() => {
    if (needsLocation && !latitude && !longitude) {
      handleGetLocation();
    }
  }, []);

  const handleGetLocation = async () => {
    setLoading(true);
    setInferringGeo(true);
    try {
      const result = await getCurrentPositionWithRetry(2, {
        timeout: 20000,
        enableHighAccuracy: false,
      });

      if (result.success && result.latitude && result.longitude) {
        onLatitudeChange(result.latitude.toString());
        onLongitudeChange(result.longitude.toString());
        
        // Prova a inferire altitudine (temporaneamente disabilitato per problemi con import dinamici)
        // L'inferenza può essere riattivata quando il problema sarà risolto
      } else {
        // Fallback a coordinate default
        const defaultCoords = getDefaultCoordinates();
        onLatitudeChange(defaultCoords.latitude.toString());
        onLongitudeChange(defaultCoords.longitude.toString());
      }
    } catch (error) {
      console.error('Error getting location:', error);
      const defaultCoords = getDefaultCoordinates();
      onLatitudeChange(defaultCoords.latitude.toString());
      onLongitudeChange(defaultCoords.longitude.toString());
    } finally {
      setLoading(false);
      setInferringGeo(false);
    }
  };

  if (!needsLocation) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">
                Posizione Geografica Opzionale
              </p>
              <p className="text-xs text-blue-700">
                Per giardini indoor e sistemi idroponici/acquaponici/aeroponici, la posizione geografica 
                è opzionale poiché il clima è controllato artificialmente. Puoi comunque inserirla per 
                statistiche e analisi generali.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitudine (opzionale)
            </label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => onLatitudeChange(e.target.value)}
              placeholder="Es. 41.9028"
              step="0.0001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitudine (opzionale)
            </label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => onLongitudeChange(e.target.value)}
              placeholder="Es. 12.4964"
              step="0.0001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleGetLocation}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Rilevamento posizione...</span>
            </>
          ) : (
            <>
              <MapPin size={18} />
              <span>Usa la mia posizione</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isGreenhouse && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">
                Posizione Importante per Serre/Tunnel
              </p>
              <p className="text-xs text-green-700">
                La posizione geografica è importante per calcolare il clima interno della serra/tunnel, 
                che è influenzato dal clima locale esterno. Questo aiuta a fornire suggerimenti più 
                precisi per la gestione della serra.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitudine *
          </label>
          <input
            type="number"
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            placeholder="Es. 41.9028"
            step="0.0001"
            required={needsLocation}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitudine *
          </label>
          <input
            type="number"
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            placeholder="Es. 12.4964"
            step="0.0001"
            required={needsLocation}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleGetLocation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Rilevamento posizione...</span>
          </>
        ) : (
          <>
            <MapPin size={18} />
            <span>Usa la mia posizione</span>
          </>
        )}
      </button>

      {inferringGeo && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 size={16} className="animate-spin" />
          <span>Inferenza dati geoclimatici...</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Mountain size={16} />
          Altitudine (metri)
          {altitudeSource === 'inferred' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded" title="Altitudine calcolata automaticamente dalle coordinate">
              ⚡ Inferita
            </span>
          )}
          {altitudeSource === 'manual' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded" title="Altitudine inserita manualmente">
              ✏️ Manuale
            </span>
          )}
        </label>
        <input
          type="number"
          value={altitudeMeters}
          onChange={(e) => {
            onAltitudeChange(e.target.value);
            if (e.target.value) {
              onAltitudeSourceChange('manual');
            } else {
              onAltitudeSourceChange(null);
            }
          }}
          placeholder="Es. 200 (opzionale)"
          min="0"
          max="5000"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {altitudeSource === 'inferred' 
            ? 'Altitudine calcolata automaticamente. Puoi correggerla manualmente se necessario.'
            : 'Se lasciato vuoto, verrà inferito automaticamente dalle coordinate (range: 0-5000m)'}
        </p>
      </div>
    </div>
  );
};

