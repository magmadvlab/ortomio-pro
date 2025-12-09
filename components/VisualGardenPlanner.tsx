import React, { useState, useRef, useEffect } from 'react';
import { GardenTask, Garden, PlantMasterSheet } from '../types';
import { 
  calculateFootprint, 
  checkAllCollisions, 
  suggestInitialPosition,
  Footprint
} from '../logic/gardenLayoutEngine';
import { getMasterSheet } from '../services/plantMasterService';
import { 
  ZoomIn, ZoomOut, Grid, RotateCcw, Save, X, AlertTriangle, 
  CheckCircle, Move, MapPin
} from 'lucide-react';

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
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Converti dimensioni orto da m² a cm (assumendo forma quadrata)
  const gardenSizeCm = Math.sqrt(garden.sizeSqMeters * 10000); // m² * 10000 = cm², poi sqrt
  const viewBoxSize = gardenSizeCm;
  
  // Filtra solo task con posizione o task di semina/trapianto attivi
  const activeTasks = tasks.filter(t => 
    (t.taskType === 'Sowing' || t.taskType === 'Transplant') && !t.completed
  );
  
  // Crea mappa master data
  const masterDataMap = new Map<string, PlantMasterSheet>();
  activeTasks.forEach(task => {
    const master = getMasterSheet(task.plantName);
    if (master) {
      masterDataMap.set(task.plantName, master);
    }
  });

  const handleMouseDown = (e: React.MouseEvent, taskId: string) => {
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
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
      const updatedTask: GardenTask = {
        ...task,
        gridPosition: { x: newX, y: newY }
      };
      onUpdateTask(updatedTask);
    }
  };

  const handleMouseUp = () => {
    setDraggingTaskId(null);
  };

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

  const handleAddToGrid = (task: GardenTask) => {
    const master = masterDataMap.get(task.plantName);
    if (!master) return;
    
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
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin size={24} />
              Visual Garden Planner - {garden.name}
            </h2>
            <p className="text-sm text-gray-500">Trascina le piante per posizionarle</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Toolbar */}
            <button
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg ${showGrid ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
            >
              <Grid size={18} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full border border-gray-300 bg-white rounded-lg"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
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
            {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}
            
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
            
            {/* Tasks */}
            {activeTasks.map(task => {
              if (!task.gridPosition) {
                // Task senza posizione - mostra nella sidebar
                return null;
              }
              
              const master = masterDataMap.get(task.plantName);
              if (!master) return null;
              
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
                  {status === 'valid' && (
                    <g transform={`translate(${task.gridPosition.x}, ${task.gridPosition.y - footprint.radius - 10})`}>
                      <CheckCircle size={16} fill="#10b981" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sidebar - Tasks senza posizione */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 max-h-40 overflow-y-auto">
          <h3 className="font-bold text-sm text-gray-700 mb-2">Piante da posizionare:</h3>
          <div className="flex flex-wrap gap-2">
            {activeTasks
              .filter(t => !t.gridPosition)
              .map(task => (
                <button
                  key={task.id}
                  onClick={() => handleAddToGrid(task)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2"
                >
                  <Move size={14} />
                  {task.plantName}
                </button>
              ))}
            {activeTasks.filter(t => !t.gridPosition).length === 0 && (
              <p className="text-sm text-gray-500">Tutte le piante sono posizionate!</p>
            )}
          </div>
        </div>

        {/* Collision Warnings */}
        {activeTasks.some(t => {
          if (!t.gridPosition) return false;
          const collisions = checkAllCollisions(t, activeTasks, masterDataMap);
          return collisions.length > 0;
        }) && (
          <div className="border-t border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
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
    </div>
  );
};

export default VisualGardenPlanner;




