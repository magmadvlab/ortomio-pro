/**
 * Zone Mapping Tool Component
 * Tool per disegnare e gestire zone nell'orto per agricoltura di precisione
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, X, Save, Edit2, Trash2, Info } from 'lucide-react';
import { GardenZone, createZone, getZonesByGarden, updateZone, deleteZone } from '@/services/zoneMappingService';
import { getSupabaseClient } from '@/config/supabase';
import { Garden } from '@/types';

interface ZoneMappingToolProps {
  garden: Garden;
  gardenSizeCm: number;
  onZonesUpdated?: (zones: GardenZone[]) => void;
  onClose?: () => void;
}

export const ZoneMappingTool: React.FC<ZoneMappingToolProps> = ({
  garden,
  gardenSizeCm,
  onZonesUpdated,
  onClose
}) => {
  const [zones, setZones] = useState<GardenZone[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<Array<{ x: number; y: number }>>([]);
  const [editingZone, setEditingZone] = useState<GardenZone | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<GardenZone>>({
    name: '',
    description: '',
    soilType: undefined,
    soilPh: undefined,
    sunExposure: undefined,
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (supabase && garden.id) {
      loadZones();
    }
  }, [supabase, garden.id]);

  const loadZones = async () => {
    if (!supabase) return;
    try {
      const loadedZones = await getZonesByGarden(supabase, garden.id);
      setZones(loadedZones);
      if (onZonesUpdated) {
        onZonesUpdated(loadedZones);
      }
    } catch (error: any) {
      // Gestisci silenziosamente errori di tabella non trovata (locale senza migrazioni)
      const errorMessage = error?.message || '';
      if (errorMessage.includes('Could not find the table') || 
          (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
        // Tabella non esiste - normale in locale senza migrazioni precision agriculture
        if (process.env.NODE_ENV === 'development') {
          console.debug('Garden zones table not available (local mode without migrations)');
        }
        setZones([]); // Imposta array vuoto invece di loggare errore
        if (onZonesUpdated) {
          onZonesUpdated([]);
        }
      } else {
        // Altri errori: logga solo in sviluppo
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading zones:', error);
        }
      }
    }
  };

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * gardenSizeCm;
    const y = ((e.clientY - rect.top) / rect.height) * gardenSizeCm;

    // Clamp coordinates dentro i limiti dell'orto
    const clampedX = Math.max(0, Math.min(gardenSizeCm, x));
    const clampedY = Math.max(0, Math.min(gardenSizeCm, y));

    setCurrentPolygon(prev => [...prev, { x: clampedX, y: clampedY }]);
  }, [isDrawing, gardenSizeCm]);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCurrentPolygon([]);
    setShowForm(false);
    setEditingZone(null);
  };

  const handleFinishDrawing = () => {
    if (currentPolygon.length < 3) {
      alert('Disegna almeno 3 punti per creare una zona');
      return;
    }
    setIsDrawing(false);
    setShowForm(true);
    setFormData({
      name: `Zona ${zones.length + 1}`,
      description: '',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      coordinates: currentPolygon
    });
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPolygon([]);
  };

  const handleSaveZone = async () => {
    if (!supabase || !formData.name || !formData.coordinates) return;

    setLoading(true);
    try {
      if (editingZone) {
        // Update existing zone
        await updateZone(supabase, editingZone.id, {
          gardenId: garden.id,
          name: formData.name,
          description: formData.description,
          coordinates: formData.coordinates,
          soilType: formData.soilType,
          soilPh: formData.soilPh,
          sunExposure: formData.sunExposure,
          color: formData.color
        });
      } else {
        // Create new zone
        await createZone(supabase, {
          gardenId: garden.id,
          name: formData.name,
          description: formData.description,
          coordinates: formData.coordinates,
          soilType: formData.soilType,
          soilPh: formData.soilPh,
          sunExposure: formData.sunExposure,
          color: formData.color
        });
      }

      await loadZones();
      setShowForm(false);
      setEditingZone(null);
      setCurrentPolygon([]);
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6'
      });
    } catch (error: any) {
      console.error('Error saving zone:', error);
      alert(`Errore nel salvare la zona: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditZone = (zone: GardenZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description,
      coordinates: zone.coordinates,
      soilType: zone.soilType,
      soilPh: zone.soilPh,
      sunExposure: zone.sunExposure,
      color: zone.color
    });
    setShowForm(true);
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!supabase) return;
    if (!confirm('Sei sicuro di voler eliminare questa zona?')) return;

    try {
      await deleteZone(supabase, zoneId);
      await loadZones();
    } catch (error: any) {
      console.error('Error deleting zone:', error);
      alert(`Errore nell'eliminare la zona: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
            <MapPin size={20} />
            Mappatura Zone
          </h3>
          {!isDrawing && (
            <button
              onClick={handleStartDrawing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Disegna Nuova Zona
            </button>
          )}
          {isDrawing && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleFinishDrawing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Completa Zona ({currentPolygon.length} punti)
              </button>
              <button
                onClick={handleCancelDrawing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annulla
              </button>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Istruzioni */}
      {isDrawing && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-800">
            <Info size={16} className="inline mr-2" />
            Clicca sul Visual Planner per aggiungere punti al poligono. 
            Completa con almeno 3 punti per creare la zona.
          </p>
        </div>
      )}

      {/* Form Creazione/Modifica Zona */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4">
            {editingZone ? 'Modifica Zona' : 'Nuova Zona'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Zona *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Es. Zona Nord, Zona Soleggiata, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                placeholder="Note sulla zona..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Terreno
                </label>
                <select
                  value={formData.soilType || ''}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value as any })}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleziona...</option>
                  <option value="Clay">Argilloso</option>
                  <option value="Sandy">Sabbioso</option>
                  <option value="Loamy">Limosso</option>
                  <option value="Peaty">Torboso</option>
                  <option value="Chalky">Calcareo</option>
                  <option value="Silty">Sabbioso-limoso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  pH Suolo
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  value={formData.soilPh || ''}
                  onChange={(e) => setFormData({ ...formData, soilPh: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="6.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Esposizione Solare
                </label>
                <select
                  value={formData.sunExposure || ''}
                  onChange={(e) => setFormData({ ...formData, sunExposure: e.target.value as any })}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleziona...</option>
                  <option value="FullSun">Sole Pieno</option>
                  <option value="PartSun">Sole Parziale</option>
                  <option value="Shade">Ombra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colore Zona
                </label>
                <input
                  type="color"
                  value={formData.color || '#3b82f6'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSaveZone}
                disabled={loading || !formData.name}
                className="flex items-center gap-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Save size={16} />
                {loading ? 'Salvataggio...' : editingZone ? 'Aggiorna' : 'Crea Zona'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingZone(null);
                  setFormData({ name: '', description: '', color: '#3b82f6' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista Zone Esistenti */}
      {zones.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-md font-semibold mb-3">Zone Create ({zones.length})</h4>
          <div className="space-y-2">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{zone.name}</p>
                    {zone.soilType && (
                      <p className="text-xs text-gray-600">
                        {zone.soilType} {zone.soilPh && `• pH ${zone.soilPh}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditZone(zone)}
                    className="p-3 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente per renderizzare zone sul Visual Planner
export const ZoneOverlay: React.FC<{
  zones: GardenZone[];
  gardenSizeCm: number;
  onZoneClick?: (zone: GardenZone) => void;
}> = ({ zones, gardenSizeCm, onZoneClick }) => {
  return (
    <g>
      {zones.map((zone) => (
        <g key={zone.id}>
          {/* Poligono zona */}
          <polygon
            points={zone.coordinates.map(c => `${c.x},${c.y}`).join(' ')}
            fill={zone.color}
            fillOpacity="0.2"
            stroke={zone.color}
            strokeWidth="2"
            strokeDasharray="5,5"
            style={{ cursor: 'pointer' }}
            onClick={() => onZoneClick && onZoneClick(zone)}
          />
          {/* Label zona */}
          {zone.coordinates.length > 0 && (
            <text
              x={zone.coordinates[0].x}
              y={zone.coordinates[0].y - 10}
              fill={zone.color}
              fontSize="12"
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              {zone.name}
            </text>
          )}
        </g>
      ))}
    </g>
  );
};

export default ZoneMappingTool;

