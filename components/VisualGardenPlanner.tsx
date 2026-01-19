import React, { useState, useRef, useEffect } from 'react';
import { GardenTask, Garden, PlantMasterSheet } from '../types';
import { GardenAccessory } from '../types/accessories';
import { GardenBed } from '../types/gardenBed';
import { useStorage } from '../packages/core/hooks/useStorage';
import { 
  calculateFootprint, 
  checkAllCollisions, 
  suggestInitialPosition,
  Footprint
} from '../logic/gardenLayoutEngine';
import { getMasterSheetSync } from '../services/plantMasterService';
import { suggestPlantPlacement, isAreaSuitableForPlant } from '../logic/spatialPlanner';
import { calculateSunIncidence, SunIncidenceCell } from '../logic/sunIncidenceCalculator';
import { 
  ZoomIn, ZoomOut, Grid, RotateCcw, Save, X, AlertTriangle, 
  CheckCircle, Move, MapPin, Sun, Package, Droplets, Home, Mountain, Building, Trees
} from 'lucide-react';
import { ZoneMappingTool, ZoneOverlay } from './planner/ZoneMappingTool';
import { GardenZone, getZonesByGarden } from '@/services/zoneMappingService';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import GardenPointScoreCard from './sunExposure/GardenPointScoreCard';
import { calculateGardenPointScores, GardenPoint } from '../services/gardenPointScorer';
import { calculateSeasonalWindows } from '../services/seasonalSunWindows';
import { getAllHistoricalWeather } from '../services/historicalWeatherService';
import { getSupabaseClient } from '../config/supabase';

interface VisualGardenPlannerProps {
  garden: Garden;
  tasks: GardenTask[];
  onUpdateTask: (task: GardenTask) => void;
  onClose?: () => void;
}

const VisualGardenPlanner: React.FC<VisualGardenPlannerProps> = ({
  garden,
  tasks,
  onUpdateTask,
  onClose
}) => {
  const { can } = useTier();
  const { storageProvider } = useStorage();
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showSunHeatmap, setShowSunHeatmap] = useState(false);
  const [showStructures, setShowStructures] = useState(true);
  const [showAccessories, setShowAccessories] = useState(true);
  const [showObstacles, setShowObstacles] = useState(true);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [placementAdvice, setPlacementAdvice] = useState<string | null>(null);
  const [accessories, setAccessories] = useState<GardenAccessory[]>([]);
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [showBeds, setShowBeds] = useState(true);
  const [showZoneMapping, setShowZoneMapping] = useState(false);
  const [zones, setZones] = useState<GardenZone[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Load accessories
  useEffect(() => {
    const loadAccessories = async () => {
      try {
        const allAccessories = await storageProvider.getAccessories(garden.id);
        setAccessories(allAccessories);
      } catch (error) {
        console.error('Error loading accessories:', error);
      }
    };
    loadAccessories();
  }, [garden.id, storageProvider]);

  // Load garden beds
  useEffect(() => {
    const loadBeds = async () => {
      try {
        const gardenBeds = await storageProvider.getGardenBeds(garden.id);
        setBeds(gardenBeds);
      } catch (error) {
        console.error('Error loading beds:', error);
      }
    };
    loadBeds();
  }, [garden.id, storageProvider]);

  // Load zones
  useEffect(() => {
    const loadZones = async () => {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const loadedZones = await getZonesByGarden(supabase, garden.id);
          setZones(loadedZones);
        }
      } catch (error: any) {
        // Gestisci silenziosamente errori di tabella non trovata (locale senza migrazioni)
        const errorMessage = error?.message || '';
        if (errorMessage.includes('Could not find the table') || 
            errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
          // Tabella non esiste - normale in locale senza migrazioni precision agriculture
          if (process.env.NODE_ENV === 'development') {
            console.debug('Garden zones table not available (local mode without migrations)');
          }
          setZones([]); // Imposta array vuoto invece di loggare errore
        } else {
          // Altri errori: logga solo in sviluppo
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading zones:', error);
          }
        }
      }
    };
    loadZones();
  }, [garden.id]);

  // Protezione Pro: Visual Planner è feature Pro
  if (!can('visualGardenPlanner')) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
        <UpgradePrompt
          feature="Visual Garden Planner"
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      </div>
    );
  }
  
  // Calcola incidenza solare per griglia
  const sunIncidenceCells = React.useMemo(() => {
    if (!garden.dailySunHours && (!garden.coordinates || !garden.obstacles || garden.obstacles.length === 0)) {
      return [];
    }
    
    // Se ci sono ostacoli configurati, usa calcolo preciso per ogni cella
    if (garden.coordinates && garden.obstacles && garden.obstacles.length > 0) {
      // Converti ostacoli Garden a formato Obstacle per sunIncidenceCalculator
      const obstaclesForCalc = garden.obstacles.map(obs => ({
        x: 50 + (obs.azimuth - 180) / 360 * 100, // Approssimazione posizione nella griglia
        y: 50,
        width: obs.widthDegrees / 360 * 100,
        height: (obs.height / obs.distance) * 100, // Normalizza altezza
        type: obs.type || 'Other' as any,
        shadowLength: Math.min(100, (obs.height / obs.distance) * 200), // Stima lunghezza ombra
      }));
      
      return calculateSunIncidence(garden, 20, obstaclesForCalc);
    }
    
    // Altrimenti usa calcolo base
    return calculateSunIncidence(garden, 20);
  }, [garden]);
  
  // Converti dimensioni orto da m² a cm (assumendo forma quadrata)
  // Aggiungi controllo per evitare dimensioni 0 o NaN
  const gardenSizeSqMeters = React.useMemo(() => {
    return garden.sizeSqMeters && garden.sizeSqMeters > 0 
      ? garden.sizeSqMeters 
      : 10; // Default a 10 m² se non specificato o invalido
  }, [garden.sizeSqMeters]);
  
  const gardenSizeCm = React.useMemo(() => {
    return Math.max(100, Math.sqrt(gardenSizeSqMeters * 10000)); // Minimo 100cm
  }, [gardenSizeSqMeters]);
  
  const viewBoxSize = gardenSizeCm;
  
  // Filtra solo task con posizione o task di semina/trapianto attivi
  const activeTasks = React.useMemo(() => {
    return (tasks || []).filter(t => 
      (t.taskType === 'Sowing' || t.taskType === 'Transplant') && !t.completed
    );
  }, [tasks]);
  
  // Crea mappa master data (memoizzato per evitare re-render)
  const masterDataMap = React.useMemo(() => {
    const map = new Map<string, PlantMasterSheet>();
    activeTasks.forEach(task => {
      const master = getMasterSheetSync(task.plantName);
      if (master) {
        map.set(task.plantName, master);
      }
    });
    return map;
  }, [activeTasks]);

  const handleMouseDown = React.useCallback((e: React.MouseEvent, taskId: string) => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const task = activeTasks.find(t => t.id === taskId);
    if (task && task.gridPosition) {
      setDraggingTaskId(taskId);
      setDragOffset({
        x: svgPoint.x - task.gridPosition.x,
        y: svgPoint.y - task.gridPosition.y
      });
    }
  }, [activeTasks]);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!draggingTaskId || !svgRef.current) return;
    
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const newX = Math.max(0, Math.min(gardenSizeCm, svgPoint.x - dragOffset.x));
    const newY = Math.max(0, Math.min(gardenSizeCm, svgPoint.y - dragOffset.y));
    
    const task = activeTasks.find(t => t.id === draggingTaskId);
    if (task) {
      const master = masterDataMap.get(task.plantName);
      
      // Calcola suggerimento posizionamento se abbiamo dati microclima
      if (master && garden.dailySunHours !== undefined) {
        const area = {
          id: 'current',
          name: 'Posizione corrente',
          dailySunHours: garden.dailySunHours,
          sunExposure: garden.sunExposure || 'PartSun'
        };
        
        const advice = suggestPlantPlacement(master, [area], garden);
        
        if (!advice.canPlant) {
          setPlacementAdvice(advice.warning || 'Posizione non adatta');
        } else {
          setPlacementAdvice(null);
        }
      } else {
        setPlacementAdvice(null);
      }
      
      const updatedTask: GardenTask = {
        ...task,
        gridPosition: { x: newX, y: newY }
      };
      onUpdateTask(updatedTask);
    }
  }, [draggingTaskId, dragOffset, gardenSizeCm, activeTasks, masterDataMap, garden, onUpdateTask]);

  const handleMouseUp = React.useCallback(() => {
    setDraggingTaskId(null);
    setPlacementAdvice(null);
  }, []);

  const getTaskColor = (task: GardenTask): string => {
    const collisions = checkAllCollisions(task, activeTasks, masterDataMap);
    if (collisions.length > 0) return '#ef4444'; // Rosso per collisioni
    
    const master = masterDataMap.get(task.plantName);
    if (!master) return '#6b7280'; // Grigio
    
    // Colore basato sulla categoria
    switch (master.nutrientCategory) {
      case 'FRUITING': return '#f59e0b'; // Arancione
      case 'LEAFY': return '#10b981'; // Verde
      case 'ROOT': return '#8b5cf6'; // Viola
      case 'LEGUME': return '#3b82f6'; // Blu
      default: return '#6b7280';
    }
  };

  const getTaskStatus = (task: GardenTask): 'valid' | 'collision' | 'warning' => {
    const collisions = checkAllCollisions(task, activeTasks, masterDataMap);
    if (collisions.length > 0) return 'collision';
    
    // Warning se troppo vicino ai bordi
    if (task.gridPosition) {
      const margin = 30; // 30cm di margine
      if (task.gridPosition.x < margin || 
          task.gridPosition.x > gardenSizeCm - margin ||
          task.gridPosition.y < margin || 
          task.gridPosition.y > gardenSizeCm - margin) {
        return 'warning';
      }
    }
    
    return 'valid';
  };

  const handleAddToGrid = React.useCallback((task: GardenTask) => {
    const master = masterDataMap.get(task.plantName);
    if (!master) {
      return;
    }
    
    const suggestion = suggestInitialPosition(
      task,
      activeTasks,
      master,
      gardenSizeCm,
      gardenSizeCm
    );
    
    if (suggestion) {
      const updatedTask: GardenTask = {
        ...task,
        gridPosition: { x: suggestion.x, y: suggestion.y },
        gridRotation: suggestion.rotation
      };
      onUpdateTask(updatedTask);
    }
  }, [masterDataMap, activeTasks, gardenSizeCm, onUpdateTask]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-3">
              <MapPin size={24} />
              Visual Garden Planner - {garden.name}
            </h2>
            <p className="text-sm text-gray-500">Trascina le piante per posizionarle</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Toolbar */}
            <button
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
              className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg ${showGrid ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setShowZoneMapping(!showZoneMapping)}
              className={`p-2 rounded-lg ${showZoneMapping ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
              title="Toggle Zone Mapping"
            >
              <MapPin size={18} />
            </button>
            {garden.dailySunHours !== undefined && (
              <button
                onClick={() => setShowSunHeatmap(!showSunHeatmap)}
                className={`p-2 rounded-lg ${showSunHeatmap ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}
                title="Mostra heatmap esposizione solare"
              >
                <Sun size={18} />
              </button>
            )}
            {/* NEW: Toggle for Structures */}
            {can('visualGardenPlanner') && (garden.greenhouseConfig || garden.hydroponicConfig || garden.aquaponicConfig || garden.aeroponicConfig) && (
              <button
                onClick={() => setShowStructures(!showStructures)}
                className={`p-2 rounded-lg ${showStructures ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                title="Mostra/Nascondi Strutture (Serre, Idroponica, etc.)"
              >
                <Home size={18} />
              </button>
            )}
            {/* NEW: Toggle for Accessories */}
            {can('visualGardenPlanner') && accessories.length > 0 && (
              <button
                onClick={() => setShowAccessories(!showAccessories)}
                className={`p-2 rounded-lg ${showAccessories ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
                title="Mostra/Nascondi Accessori"
              >
                <Package size={18} />
              </button>
            )}
            {/* Toggle for Garden Beds */}
            {beds.length > 0 && (
              <button
                onClick={() => setShowBeds(!showBeds)}
                className={`p-2 rounded-lg ${showBeds ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                title="Mostra/Nascondi Letti/Cassoni/Vasi"
              >
                <Grid size={18} />
              </button>
            )}
            {/* Toggle for Obstacles */}
            {garden.obstacles && garden.obstacles.length > 0 && (
              <button
                onClick={() => setShowObstacles(!showObstacles)}
                className={`p-2 rounded-lg ${showObstacles ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}
                title="Mostra/Nascondi Ostacoli"
              >
                <Mountain size={18} />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Placement Advice Banner */}
        {placementAdvice && draggingTaskId && (
          <div className="bg-yellow-50 border-l-4 border-yellow-full max-w-sm p-3 mx-4 mt-2">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-yellow-full max-w-sm" />
              <p className="text-sm text-yellow-full max-w-sm font-medium">{placementAdvice}</p>
            </div>
          </div>
        )}

        {/* SVG Canvas */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {gardenSizeCm > 0 && !isNaN(gardenSizeCm) ? (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              className="w-full h-full border border-gray-300 bg-white rounded-lg"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', minHeight: '400px' }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
            {/* Grid */}
            {showGrid && (
              <defs>
                <pattern
                  id="grid"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
            )}
            
            {/* Terreno Base - Sempre visibile */}
            <rect
              x="0"
              y="0"
              width={gardenSizeCm}
              height={gardenSizeCm}
              fill="#8B4513"
              fillOpacity="0.3"
              stroke="#654321"
              strokeWidth="2"
            />
            
            {/* Pattern texture terreno */}
            <defs>
              <pattern id="soil-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="#654321" opacity="0.2" />
                <circle cx="15" cy="10" r="1" fill="#654321" opacity="0.2" />
                <circle cx="10" cy="15" r="1" fill="#654321" opacity="0.2" />
              </pattern>
            </defs>
            <rect
              x="0"
              y="0"
              width={gardenSizeCm}
              height={gardenSizeCm}
              fill="url(#soil-pattern)"
            />
            
            {showGrid && <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />}
            
            {/* Zone Overlay */}
            {showZoneMapping && zones.length > 0 && (
              <ZoneOverlay 
                zones={zones} 
                gardenSizeCm={gardenSizeCm}
                onZoneClick={(zone) => {
                  console.log('Zone clicked:', zone);
                }}
              />
            )}
            
            {/* Indicatore Scala */}
            <g>
              <rect
                x={gardenSizeCm - 120}
                y={gardenSizeCm - 30}
                width="110"
                height="25"
                fill="rgba(255, 255, 255, 0.9)"
                stroke="#6b7280"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={gardenSizeCm - 65}
                y={gardenSizeCm - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#374151"
                fontWeight="bold"
              >
                Scala: 1cm = {Math.round(gardenSizeCm / 100)}cm
              </text>
            </g>
            
            {/* Greenhouse/Tunnel Structures */}
            {showStructures && (garden.gardenType === 'Greenhouse' || garden.gardenType === 'Tunnel') && garden.greenhouseConfig && (
              <g>
                {/* Draw greenhouse as a rectangle covering the garden */}
                <rect
                  x={gardenSizeCm * 0.1}
                  y={gardenSizeCm * 0.1}
                  width={gardenSizeCm * 0.8}
                  height={gardenSizeCm * 0.8}
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="10,5"
                  rx="10"
                />
                <text
                  x={gardenSizeCm * 0.5}
                  y={gardenSizeCm * 0.15}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#3b82f6"
                  fontWeight="bold"
                >
                  {garden.gardenType === 'Greenhouse' ? '🏠 Serra' : '🌉 Tunnel'}
                </text>
                {garden.greenhouseConfig.width && garden.greenhouseConfig.length && (
                  <text
                    x={gardenSizeCm * 0.5}
                    y={gardenSizeCm * 0.2}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#3b82f6"
                  >
                    {garden.greenhouseConfig.width}m × {garden.greenhouseConfig.length}m
                  </text>
                )}
              </g>
            )}

            {/* Hydroponic Systems */}
            {showStructures && garden.hydroponicConfig && (
              <g>
                {garden.hydroponicConfig.systemType === 'NFT' && garden.hydroponicConfig.nftConfig && (
                  <>
                    {/* Draw NFT channels */}
                    {Array.from({ length: garden.hydroponicConfig?.nftConfig?.channelCount || 1 }).map((_, i) => {
                      const channelWidth = 20; // cm
                      const channelLength = (garden.hydroponicConfig?.nftConfig?.channelLength || 100) / 100 * gardenSizeCm;
                      const spacing = 50; // cm between channels
                      const startX = gardenSizeCm * 0.1;
                      const startY = gardenSizeCm * 0.3 + (i * spacing);
                      
                      return (
                        <g key={`nft-channel-${i}`}>
                          <rect
                            x={startX}
                            y={startY}
                            width={channelLength}
                            height={channelWidth}
                            fill="rgba(139, 92, 246, 0.2)"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            rx="5"
                          />
                          <text
                            x={startX + channelLength / 2}
                            y={startY + channelWidth / 2}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#8b5cf6"
                            fontWeight="bold"
                          >
                            NFT {i + 1}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
                {garden.hydroponicConfig?.systemType === 'DWC' && garden.hydroponicConfig?.dwcConfig && (
                  <>
                    {/* Draw DWC buckets */}
                    {Array.from({ length: Math.min(garden.hydroponicConfig.dwcConfig.bucketCount || 1, 10) }).map((_, i) => {
                      const bucketSize = 30; // cm
                      const cols = 5;
                      const row = Math.floor(i / cols);
                      const col = i % cols;
                      const spacing = 50;
                      const startX = gardenSizeCm * 0.1 + (col * spacing);
                      const startY = gardenSizeCm * 0.3 + (row * spacing);
                      
                      return (
                        <g key={`dwc-bucket-${i}`}>
                          <circle
                            cx={startX + bucketSize / 2}
                            cy={startY + bucketSize / 2}
                            r={bucketSize / 2}
                            fill="rgba(139, 92, 246, 0.2)"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                          />
                          <text
                            x={startX + bucketSize / 2}
                            y={startY + bucketSize / 2}
                            textAnchor="middle"
                            fontSize="8"
                            fill="#8b5cf6"
                            fontWeight="bold"
                          >
                            DWC {i + 1}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
                {/* Reservoir */}
                {garden.hydroponicConfig?.nutrientSolution?.reservoirCapacity && garden.hydroponicConfig.nutrientSolution.reservoirCapacity > 0 && (
                  <g>
                    <rect
                      x={gardenSizeCm * 0.8}
                      y={gardenSizeCm * 0.8}
                      width={gardenSizeCm * 0.15}
                      height={gardenSizeCm * 0.15}
                      fill="rgba(59, 130, 246, 0.3)"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      rx="5"
                    />
                    <text
                      x={gardenSizeCm * 0.875}
                      y={gardenSizeCm * 0.85}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#3b82f6"
                      fontWeight="bold"
                    >
                      Serbatoio
                    </text>
                    <text
                      x={gardenSizeCm * 0.875}
                      y={gardenSizeCm * 0.9}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#3b82f6"
                    >
                      {garden.hydroponicConfig.nutrientSolution.reservoirCapacity}L
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* Garden Beds */}
            {showBeds && beds.length > 0 && (
              <g>
                {beds.map(bed => {
                  // Check if bed is associated with a structure
                  const isInStructure = bed.structureType && (
                    (bed.structureType === 'Greenhouse' && garden.gardenType === 'Greenhouse') ||
                    (bed.structureType === 'Hydroponic' && garden.hydroponicConfig) ||
                    (bed.structureType === 'Aquaponic' && garden.aquaponicConfig) ||
                    (bed.structureType === 'Aeroponic' && garden.aeroponicConfig) ||
                    (bed.structureType === 'Indoor' && garden.indoorConfig)
                  );

                  // Calculate position relative to structure if inside one
                  let x = bed.position?.x || 0;
                  let y = bed.position?.y || 0;
                  
                  if (isInStructure && showStructures) {
                    // Position beds inside structure (offset from structure position)
                    if (garden.gardenType === 'Greenhouse' && garden.greenhouseConfig) {
                      // Position inside greenhouse
                      const ghX = gardenSizeCm * 0.1;
                      const ghY = gardenSizeCm * 0.1;
                      const ghWidth = gardenSizeCm * 0.8;
                      const ghHeight = gardenSizeCm * 0.8;
                      
                      // If bed has relative position, use it; otherwise auto-position
                      if (!bed.position) {
                        const structureBeds = beds.filter(b => b.structureType === 'Greenhouse');
                        const index = structureBeds.indexOf(bed);
                        const cols = Math.ceil(Math.sqrt(structureBeds.length));
                        const row = Math.floor(index / cols);
                        const col = index % cols;
                        x = ghX + (ghWidth / (cols + 1)) * (col + 1) - (bed.lengthCm || bed.diameterCm || 50) / 2;
                        y = ghY + (ghHeight / (cols + 1)) * (row + 1) - (bed.widthCm || bed.diameterCm || 50) / 2;
                      } else {
                        // Use relative position within structure
                        x = ghX + (bed.position.x / 100) * ghWidth;
                        y = ghY + (bed.position.y / 100) * ghHeight;
                      }
                    } else {
                      // Similar logic for hydroponic systems
                      if (!bed.position) {
                        const index = beds.indexOf(bed);
                        const cols = Math.ceil(Math.sqrt(beds.length));
                        const row = Math.floor(index / cols);
                        const col = index % cols;
                        x = gardenSizeCm * 0.1 + (col * gardenSizeCm * 0.3);
                        y = gardenSizeCm * 0.3 + (row * gardenSizeCm * 0.3);
                      }
                    }
                  } else {
                    // Normal positioning outside structures
                    if (!bed.position) {
                      const index = beds.indexOf(bed);
                      const cols = Math.ceil(Math.sqrt(beds.length));
                      const row = Math.floor(index / cols);
                      const col = index % cols;
                      x = gardenSizeCm * 0.1 + (col * gardenSizeCm * 0.3);
                      y = gardenSizeCm * 0.1 + (row * gardenSizeCm * 0.3);
                    }
                  }
                  
                  // Ensure coordinates are within bounds
                  x = Math.max(0, Math.min(x, gardenSizeCm - (bed.lengthCm || bed.diameterCm || 50)));
                  y = Math.max(0, Math.min(y, gardenSizeCm - (bed.widthCm || bed.diameterCm || 50)));
                  
                  // Different styling if inside structure
                  const fillColor = isInStructure ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.1)';
                  const strokeColor = isInStructure ? '#3b82f6' : '#22c55e';
                  
                  if (bed.shape === 'Rectangle' && bed.lengthCm && bed.widthCm) {
                    return (
                      <g key={bed.id}>
                        <rect
                          x={x}
                          y={y}
                          width={bed.lengthCm}
                          height={bed.widthCm}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          rx="5"
                        />
                        <text
                          x={x + bed.lengthCm / 2}
                          y={y + bed.widthCm / 2}
                          textAnchor="middle"
                          fontSize="12"
                          fill={strokeColor}
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          {bed.name}
                        </text>
                        {bed.areaSqMeters && (
                          <text
                            x={x + bed.lengthCm / 2}
                            y={y + bed.widthCm / 2 + 15}
                            textAnchor="middle"
                            fontSize="9"
                            fill={strokeColor}
                            dominantBaseline="middle"
                          >
                            {bed.areaSqMeters.toFixed(2)} m²
                          </text>
                        )}
                      </g>
                    );
                  } else if (bed.shape === 'Circle' && bed.diameterCm) {
                    const radius = bed.diameterCm / 2;
                    return (
                      <g key={bed.id}>
                        <circle
                          cx={x + radius}
                          cy={y + radius}
                          r={radius}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        <text
                          x={x + radius}
                          y={y + radius}
                          textAnchor="middle"
                          fontSize="11"
                          fill={strokeColor}
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          {bed.name}
                        </text>
                        {bed.areaSqMeters && (
                          <text
                            x={x + radius}
                            y={y + radius + 12}
                            textAnchor="middle"
                            fontSize="8"
                            fill={strokeColor}
                            dominantBaseline="middle"
                          >
                            {bed.areaSqMeters.toFixed(2)} m²
                          </text>
                        )}
                      </g>
                    );
                  }
                  return null;
                })}
              </g>
            )}

            {/* Accessories */}
            {showAccessories && accessories.length > 0 && (
              <g>
                {accessories.filter(a => a.position).map((accessory) => {
                  const pos = accessory.position!;
                  const x = (pos.x / 100) * gardenSizeCm;
                  const y = (pos.y / 100) * gardenSizeCm;
                  
                  if (accessory.category === 'Support') {
                    // Draw stake/tutor as a vertical line
                    const height = accessory.height || 50;
                    return (
                      <g key={accessory.id}>
                        <line
                          x1={x}
                          y1={y}
                          x2={x}
                          y2={y - height}
                          stroke="#8b5cf6"
                          strokeWidth="3"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#8b5cf6"
                        />
                        <text
                          x={x + 10}
                          y={y}
                          fontSize="9"
                          fill="#8b5cf6"
                          fontWeight="bold"
                        >
                          {accessory.name}
                        </text>
                      </g>
                    );
                  } else if (accessory.category === 'Netting') {
                    // Draw netting as a rectangle
                    const width = accessory.width || 100;
                    const height = accessory.height || 100;
                    return (
                      <g key={accessory.id}>
                        <rect
                          x={x - width / 2}
                          y={y - height / 2}
                          width={width}
                          height={height}
                          fill="rgba(34, 197, 94, 0.1)"
                          stroke="#22c55e"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        <text
                          x={x}
                          y={y - height / 2 - 5}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#22c55e"
                          fontWeight="bold"
                        >
                          {accessory.name}
                        </text>
                      </g>
                    );
                  } else if (accessory.category === 'Structure') {
                    // Draw structure (arch, trellis) as a larger rectangle
                    const width = accessory.width || 200;
                    const height = accessory.height || 100;
                    return (
                      <g key={accessory.id}>
                        <rect
                          x={x - width / 2}
                          y={y - height / 2}
                          width={width}
                          height={height}
                          fill="rgba(168, 85, 247, 0.1)"
                          stroke="#a855f7"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#a855f7"
                          fontWeight="bold"
                        >
                          {accessory.name}
                        </text>
                      </g>
                    );
                  }
                  return null;
                })}
              </g>
            )}
            
            {/* Sun Exposure Heatmap - Calcolo Incidenza Solare */}
            {showSunHeatmap && sunIncidenceCells.length > 0 && (
              <>
                {sunIncidenceCells.map((cell, idx) => {
                  const cellSize = gardenSizeCm / 20; // 20x20 grid
                  const x = (cell.x / 100) * gardenSizeCm;
                  const y = (cell.y / 100) * gardenSizeCm;
                  
                  // Colore basato su intensità
                  const opacity = 0.3 + (cell.intensity * 0.4); // 0.3-0.7
                  let color = '#fef3c7'; // Giallo chiaro (ombra)
                  if (cell.intensity > 0.6) {
                    color = '#f59e0b'; // Arancione (pieno sole)
                  } else if (cell.intensity > 0.3) {
                    color = '#fbbf24'; // Giallo (mezz'ombra)
                  }
                  
                  return (
                    <rect
                      key={`sun-${idx}`}
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      fill={color}
                      opacity={opacity}
                    >
                      <title>{`${cell.dailySunHours}h sole - ${cell.sunExposure}`}</title>
                    </rect>
                  );
                })}
              </>
            )}
            
            {/* Indicatore Nord */}
            <g>
              {/* Freccia Nord in alto */}
              <line
                x1={gardenSizeCm / 2}
                y1="10"
                x2={gardenSizeCm / 2}
                y2="30"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                markerEnd="url(#arrowhead-north)"
              />
              <text
                x={gardenSizeCm / 2}
                y="8"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#ef4444"
              >
                N
              </text>
              {/* Marker per freccia */}
              <defs>
                <marker
                  id="arrowhead-north"
                  markerWidth="10"
                  markerHeight="10"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="#ef4444"
                  />
                </marker>
              </defs>
            </g>
            
            {/* Ostacoli - Rendering semplificato (cerchi con lettere) */}
            {showObstacles && garden.obstacles && garden.obstacles.length > 0 && (
              <g>
                {garden.obstacles.map((obstacle, idx) => {
                  // Calcola posizione ostacolo intorno all'orto
                  // L'orto è al centro, gli ostacoli sono fuori
                  const centerX = gardenSizeCm / 2;
                  const centerY = gardenSizeCm / 2;
                  
                  // Raggio basato su distanza (normalizzato per visualizzazione)
                  // Distanza tipica: 10-100m, scala per visualizzazione: 1m = 8cm (più compatto)
                  const radius = Math.min(gardenSizeCm * 0.5, obstacle.distance * 0.08);
                  
                  // Angolo in radianti (azimuth: 0 = Nord, 90 = Est, 180 = Sud, 270 = Ovest)
                  // In SVG, 0° è verso destra, quindi ruotiamo di -90° per allineare Nord in alto
                  const angleRad = ((obstacle.azimuth - 90) * Math.PI) / 180;
                  
                  // Posizione ostacolo sulla circonferenza
                  const obstacleX = centerX + radius * Math.cos(angleRad);
                  const obstacleY = centerY + radius * Math.sin(angleRad);
                  
                  // Colore basato su tipo
                  const getObstacleColor = () => {
                    switch (obstacle.type) {
                      case 'Building': return '#3b82f6'; // Blu
                      case 'Tree': return '#22c55e'; // Verde
                      case 'Mountain': return '#6b7280'; // Grigio
                      default: return '#8b5cf6'; // Viola
                    }
                  };
                  
                  const color = getObstacleColor();
                  
                  // Lettera tipo ostacolo
                  const getObstacleLetter = () => {
                    switch (obstacle.type) {
                      case 'Building': return 'B';
                      case 'Tree': return 'T';
                      case 'Mountain': return 'M';
                      default: return 'O';
                    }
                  };
                  
                  return (
                    <g key={`obstacle-${idx}`}>
                      {/* Linea semplice verso centro (direzione ostacolo) */}
                      <line
                        x1={centerX}
                        y1={centerY}
                        x2={obstacleX}
                        y2={obstacleY}
                        stroke={color}
                        strokeWidth="1.5"
                        opacity="0.4"
                      />
                      
                      {/* Cerchio colorato con lettera tipo */}
                      <circle
                        cx={obstacleX}
                        cy={obstacleY}
                        r="14"
                        fill={color}
                        fillOpacity="0.7"
                        stroke={color}
                        strokeWidth="2"
                      />
                      <text
                        x={obstacleX}
                        y={obstacleY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="white"
                      >
                        {getObstacleLetter()}
                      </text>
                      
                      {/* Tooltip con dettagli */}
                      <title>
                        {obstacle.type === 'Building' ? 'Edificio' :
                         obstacle.type === 'Tree' ? 'Albero' :
                         obstacle.type === 'Mountain' ? 'Montagna' : 'Ostacolo'} 
                        {' '}a {Math.round(obstacle.azimuth)}°
                        {' '}({obstacle.height}m alto, {obstacle.distance}m distanza)
                      </title>
                    </g>
                  );
                })}
              </g>
            )}
            
            {/* Garden Border */}
            <rect
              x="0"
              y="0"
              width={gardenSizeCm}
              height={gardenSizeCm}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Empty State - Nessun task attivo */}
            {activeTasks.length === 0 && (
              <g>
                <rect
                  x={gardenSizeCm * 0.1}
                  y={gardenSizeCm * 0.3}
                  width={gardenSizeCm * 0.8}
                  height={gardenSizeCm * 0.4}
                  fill="rgba(249, 250, 251, 0.8)"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  strokeDasharray="10,5"
                  rx="10"
                />
                <text
                  x={gardenSizeCm / 2}
                  y={gardenSizeCm / 2 - 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="18"
                  fill="#6b7280"
                  fontWeight="600"
                >
                  Nessuna pianta da posizionare
                </text>
                <text
                  x={gardenSizeCm / 2}
                  y={gardenSizeCm / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fill="#9ca3af"
                >
                  Il Visual Garden Planner mostra solo
                </text>
                <text
                  x={gardenSizeCm / 2}
                  y={gardenSizeCm / 2 + 30}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fill="#9ca3af"
                >
                  semine e trapianti non completati
                </text>
              </g>
            )}
            {activeTasks.map(task => {
              if (!task.gridPosition) {
                // Task senza posizione - mostra nella sidebar
                return null;
              }
              
              const master = masterDataMap.get(task.plantName);
              if (!master) {
                return null;
              }
              
              const footprint = calculateFootprint(master);
              const status = getTaskStatus(task);
              const color = getTaskColor(task);
              const isDragging = draggingTaskId === task.id;
              
              return (
                <g key={task.id}>
                  {/* Cerchio di ingombro */}
                  <circle
                    cx={task.gridPosition.x}
                    cy={task.gridPosition.y}
                    r={footprint.radius}
                    fill={status === 'collision' ? '#fee2e2' : status === 'warning' ? '#fef3c7' : '#dcfce7'}
                    stroke={color}
                    strokeWidth={status === 'collision' ? '3' : '2'}
                    opacity={isDragging ? 0.7 : 1}
                    style={{ cursor: 'move' }}
                    onMouseDown={(e) => handleMouseDown(e, task.id)}
                  />
                  
                  {/* Label */}
                  <text
                    x={task.gridPosition.x}
                    y={task.gridPosition.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill={status === 'collision' ? '#dc2626' : '#1f2937'}
                    fontWeight="bold"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {task.plantName}
                  </text>
                  
                  {/* Status Icon */}
                  {status === 'collision' && (
                    <g transform={`translate(${task.gridPosition.x}, ${task.gridPosition.y - footprint.radius - 10})`}>
                      <AlertTriangle size={16} fill="#dc2626" />
                    </g>
                  )}
                  {status === 'valid' && !placementAdvice && (
                    <g transform={`translate(${task.gridPosition.x}, ${task.gridPosition.y - footprint.radius - 10})`}>
                      <CheckCircle size={16} fill="#10b981" />
                    </g>
                  )}
                  {/* Sun exposure warning */}
                  {draggingTaskId === task.id && placementAdvice && (
                    <g transform={`translate(${task.gridPosition.x}, ${task.gridPosition.y - footprint.radius - 20})`}>
                      <rect
                        x="-50"
                        y="-10"
                        width="100"
                        height="20"
                        fill="#fee2e2"
                        stroke="#dc2626"
                        strokeWidth="1"
                        rx="4"
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#dc2626"
                        fontWeight="bold"
                      >
                        ⚠️ Poco sole
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            </svg>
          ) : (
            <div className="w-full h-full flex items-center justify-center border border-gray-300 bg-white rounded-lg min-h-[400px]">
              <div className="text-center p-8">
                <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-full max-w-sm" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Dimensioni orto non valide
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  L'orto deve avere una dimensione valida per visualizzare il planner
                </p>
                <p className="text-xs text-gray-400">
                  Dimensione attuale: {garden.sizeSqMeters || 0} m²
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Vai alle impostazioni dell'orto e imposta una dimensione valida (es. 10 m²)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Tasks senza posizione */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 max-h-40 overflow-y-auto">
          <h3 className="font-bold text-sm text-gray-700 mb-2">Piante da posizionare:</h3>
          {activeTasks.length === 0 ? (
            <div className="text-center py-4 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  ℹ️ Come funziona
                </p>
                <p className="text-xs text-blue-800 mb-2">
                  Il Visual Garden Planner mostra solo <strong>semine</strong> e <strong>trapianti</strong> non completati.
                </p>
                <p className="text-xs text-blue-700">
                  Vai al <strong>Planner</strong> per aggiungere una nuova semina o trapianto, poi torna qui per posizionarla visivamente.
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 mb-1">
                  <strong>Task totali nel giardino:</strong> {tasks.length}
                </p>
                <p className="text-xs text-gray-500 mb-1">
                  <strong>Task di semina/trapianto:</strong> {(tasks || []).filter(t => (t.taskType === 'Sowing' || t.taskType === 'Transplant')).length}
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Task non completati:</strong> {(tasks || []).filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')).length}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {activeTasks
                .filter(t => !t.gridPosition)
                .map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleAddToGrid(task)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-3"
                  >
                    <Move size={14} />
                    {task.plantName || 'Pianta senza nome'}
                  </button>
                ))}
              {(activeTasks || []).filter(t => !t.gridPosition).length === 0 && (
                <p className="text-sm text-gray-500">Tutte le piante sono posizionate!</p>
              )}
            </div>
          )}
        </div>

        {/* Collision Warnings */}
        {activeTasks.some(t => {
          if (!t.gridPosition) return false;
          const collisions = checkAllCollisions(t, activeTasks, masterDataMap);
          return collisions.length > 0;
        }) && (
          <div className="border-t border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-red-900 mb-1">Collisioni rilevate!</p>
                <ul className="text-red-700 space-y-1">
                  {activeTasks.map(task => {
                    if (!task.gridPosition) return null;
                    const collisions = checkAllCollisions(task, activeTasks, masterDataMap);
                    return collisions.map((c, idx) => (
                      <li key={`${task.id}-${idx}`}>
                        {c.collision.message}
                      </li>
                    ));
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone Mapping Tool */}
      {showZoneMapping && (
        <div className="mt-4">
          <ZoneMappingTool
            garden={garden}
            gardenSizeCm={gardenSizeCm}
            onZonesUpdated={(updatedZones) => {
              setZones(updatedZones);
            }}
            onClose={() => setShowZoneMapping(false)}
          />
        </div>
      )}
    </div>
  );
};

export default VisualGardenPlanner;





