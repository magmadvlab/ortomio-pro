/**
 * Plant Health Heatmap
 * Visualizzazione heatmap per salute piante con drill-down
 */

import React, { useState, useMemo } from 'react';
import { GardenPlant } from '../../types/individualPlant';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Camera, 
  Eye,
  ZoomIn,
  Info
} from 'lucide-react';

interface PlantHealthHeatmapProps {
  plants: GardenPlant[];
  onPlantSelect?: (plant: GardenPlant) => void;
  onPlantHover?: (plant: GardenPlant | null) => void;
  onShowDetails?: (plant: GardenPlant) => void;
}

interface HeatmapCell {
  plant: GardenPlant;
  x: number;
  y: number;
  rowNumber: number;
  positionInRow: number;
}

const PlantHealthHeatmap: React.FC<PlantHealthHeatmapProps> = ({
  plants,
  onPlantSelect,
  onPlantHover,
  onShowDetails
}) => {
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'overview' | 'detailed'>('overview');
  const [hoveredPlant, setHoveredPlant] = useState<GardenPlant | null>(null);

  // Organizza piante per filare e posizione
  const heatmapData = useMemo(() => {
    const rows: { [key: string]: GardenPlant[] } = {};
    
    plants.forEach(plant => {
      // Estrai numero filare dal plant_code (es. F1-P001 -> 1)
      const rowMatch = plant.plantCode.match(/F(\d+)-P/);
      const rowNumber = rowMatch ? parseInt(rowMatch[1]) : 1;
      const rowKey = `row_${rowNumber}`;
      
      if (!rows[rowKey]) {
        rows[rowKey] = [];
      }
      rows[rowKey].push(plant);
    });

    // Ordina piante per posizione in ogni filare
    Object.keys(rows).forEach(rowKey => {
      rows[rowKey].sort((a, b) => a.positionInRow - b.positionInRow);
    });

    return rows;
  }, [plants]);

  const getHealthColor = (healthScore: number, opacity: number = 1) => {
    if (healthScore >= 90) return `rgba(34, 197, 94, ${opacity})`; // green-500
    if (healthScore >= 70) return `rgba(234, 179, 8, ${opacity})`; // yellow-500
    if (healthScore >= 50) return `rgba(249, 115, 22, ${opacity})`; // orange-500
    return `rgba(239, 68, 68, ${opacity})`; // red-500
  };

  const getHealthLabel = (healthScore: number) => {
    if (healthScore >= 90) return 'Eccellente';
    if (healthScore >= 70) return 'Buona';
    if (healthScore >= 50) return 'Discreta';
    return 'Scarsa';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🌱';
      case 'diseased': return '🦠';
      case 'dead': return '💀';
      case 'harvested': return '🌾';
      default: return '❓';
    }
  };

  const handlePlantClick = (plant: GardenPlant) => {
    setSelectedPlant(plant);
    onPlantSelect?.(plant);
  };

  const handlePlantHover = (plant: GardenPlant | null) => {
    setHoveredPlant(plant);
    onPlantHover?.(plant);
  };

  // Calcola statistiche
  const stats = useMemo(() => {
    const total = plants.length;
    const healthy = plants.filter(p => p.status === 'healthy').length;
    const diseased = plants.filter(p => p.status === 'diseased').length;
    const dead = plants.filter(p => p.status === 'dead').length;
    const avgHealth = plants.reduce((sum, p) => sum + p.healthScore, 0) / total;
    
    return { total, healthy, diseased, dead, avgHealth };
  }, [plants]);

  const rowKeys = Object.keys(heatmapData).sort((a, b) => {
    const numA = parseInt(a.split('_')[1]);
    const numB = parseInt(b.split('_')[1]);
    return numA - numB;
  });

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Mappa Salute Piante
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoomLevel(zoomLevel === 'overview' ? 'detailed' : 'overview')}
              className="px-4 py-3 text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <ZoomIn size={16} />
              {zoomLevel === 'overview' ? 'Dettaglio' : 'Panoramica'}
            </button>
          </div>
        </div>

        {/* Statistiche rapide */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Totali</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-green-600">{stats.healthy}</p>
            <p className="text-sm text-gray-600">Sane</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.diseased}</p>
            <p className="text-sm text-gray-600">Malate</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-red-600">{stats.dead}</p>
            <p className="text-sm text-gray-600">Morte</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-purple-600">{Math.round(stats.avgHealth)}%</p>
            <p className="text-sm text-gray-600">Salute Media</p>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Legenda Salute</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
            <span className="text-sm">Eccellente (90-100%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-yellow-full max-w-sm"></div>
            <span className="text-sm">Buona (70-89%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-orange-500"></div>
            <span className="text-sm">Discreta (50-69%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-red-500"></div>
            <span className="text-sm">Scarsa (&lt;50%)</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          {rowKeys.map((rowKey) => {
            const rowNumber = parseInt(rowKey.split('_')[1]);
            const rowPlants = heatmapData[rowKey];
            
            return (
              <div key={rowKey} className="space-y-2">
                {/* Row Header */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-20">
                    Filare {rowNumber}
                  </span>
                  <div className="text-xs text-gray-500">
                    {rowPlants.length} piante • 
                    Media: {Math.round(rowPlants.reduce((sum, p) => sum + p.healthScore, 0) / rowPlants.length)}%
                  </div>
                </div>
                
                {/* Row Plants */}
                <div className="flex flex-wrap gap-3">
                  {rowPlants.map((plant) => {
                    const cellSize = zoomLevel === 'overview' ? 'w-3 h-3' : 'w-6 h-6';
                    const isSelected = selectedPlant?.id === plant.id;
                    const isHovered = hoveredPlant?.id === plant.id;
                    
                    return (
                      <div
                        key={plant.id}
                        className={`${cellSize} rounded-sm cursor-pointer transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        } ${isHovered ? 'scale-125 z-10 relative' : ''}`}
                        style={{
                          backgroundColor: getHealthColor(plant.healthScore),
                          opacity: plant.status === 'dead' ? 0.5 : 1
                        }}
                        onClick={() => handlePlantClick(plant)}
                        onMouseEnter={() => handlePlantHover(plant)}
                        onMouseLeave={() => handlePlantHover(null)}
                        title={`${plant.plantCode} - Filare ${rowNumber} Pos.${plant.positionInRow || 'N/A'} - Salute: ${plant.healthScore}% - Stato: ${plant.status}`}
                      >
                        {zoomLevel === 'detailed' && plant.status !== 'healthy' && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs">
                            {getStatusIcon(plant.status)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plant Detail Panel */}
      {(selectedPlant || hoveredPlant) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Dettagli Pianta</h4>
            {selectedPlant && (
              <button
                onClick={() => setSelectedPlant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          {(() => {
            const plant = selectedPlant || hoveredPlant;
            if (!plant) return null;
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl md:text-2xl">{getStatusIcon(plant.status)}</span>
                    <div>
                      <h5 className="font-semibold text-lg">{plant.plantCode}</h5>
                      <p className="text-gray-600">{plant.plantName} - {plant.variety}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Salute:</span>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getHealthColor(plant.healthScore) }}
                        />
                        <span className="font-medium">{plant.healthScore}%</span>
                        <span className="text-sm text-gray-500">
                          ({getHealthLabel(plant.healthScore)})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stato:</span>
                      <span className="font-medium capitalize">{plant.status}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Posizione:</span>
                      <span className="font-medium">Pos. {plant.positionInRow}</span>
                    </div>
                    
                    {plant.plantingDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Piantata:</span>
                        <span className="font-medium">
                          {new Date(plant.plantingDate).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Photos */}
                <div className="space-y-3">
                  {plant.photos && plant.photos.length > 0 && (
                    <div>
                      <h6 className="font-medium text-gray-900 mb-2">Foto Recenti</h6>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {plant.photos.slice(0, 3).map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`${plant.plantCode} foto ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {plant.notes && (
                    <div>
                      <h6 className="font-medium text-gray-900 mb-2">Note</h6>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {plant.notes}
                      </p>
                    </div>
                  )}
                  
                  {selectedPlant && (
                    <div className="flex gap-3 pt-3">
                      <button className="flex-1 px-4 py-3 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 text-sm">
                        <Camera size={16} />
                        Foto
                      </button>
                      <button 
                        onClick={() => onShowDetails?.(selectedPlant)}
                        className="flex-1 px-4 py-3 text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 text-sm"
                      >
                        <Eye size={16} />
                        Dettagli
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Alert per piante con problemi */}
      {stats.diseased > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-orange-600" size={20} />
            <h4 className="font-semibold text-orange-900">
              Attenzione: {stats.diseased} piante con problemi
            </h4>
          </div>
          <p className="text-sm text-orange-800">
            Alcune piante richiedono attenzione. Considera di fotografare e trattare le piante malate.
          </p>
          <button className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
            Seleziona Piante Malate
          </button>
        </div>
      )}
    </div>
  );
};

export default PlantHealthHeatmap;