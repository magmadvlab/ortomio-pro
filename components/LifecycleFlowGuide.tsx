/**
 * Componente per visualizzare e gestire il flusso guidato del ciclo vitale delle piante
 * Mostra chiaramente: SEME → [Germoglia] → PIANTINA → [Trapianto] → PIANTA → [Raccolta]
 */

import React from 'react';
import { GardenTask } from '../types';
import { CheckCircle, Circle, ArrowRight, Calendar } from 'lucide-react';

interface LifecycleFlowGuideProps {
  task: GardenTask;
  onAdvancePhase?: (newPhase: string) => void;
  onViewSuggestedTasks?: () => void;
}

type LifecyclePhase = 'Seed' | 'Germinating' | 'Seedling' | 'YoungPlant' | 'MaturePlant' | 'Harvesting';

const PHASE_LABELS: Record<LifecyclePhase, string> = {
  Seed: 'Seme',
  Germinating: 'Germinazione',
  Seedling: 'Piantina',
  YoungPlant: 'Pianta Giovane',
  MaturePlant: 'Pianta Matura',
  Harvesting: 'Raccolta'
};

const PHASE_COLORS: Record<LifecyclePhase, string> = {
  Seed: 'bg-gray-100 text-gray-700',
  Germinating: 'bg-blue-100 text-blue-700',
  Seedling: 'bg-green-100 text-green-700',
  YoungPlant: 'bg-emerald-100 text-emerald-700',
  MaturePlant: 'bg-teal-100 text-teal-700',
  Harvesting: 'bg-orange-100 text-orange-700'
};

/**
 * Determina la fase corrente del ciclo vitale basata su lifecycleState e stage
 */
function getCurrentPhase(task: GardenTask): LifecyclePhase {
  if (task.lifecycleState === 'Sowing') return 'Seed';
  if (task.lifecycleState === 'Germination') return 'Germinating';
  if (task.lifecycleState === 'Nursing' || task.lifecycleState === 'Hardening') return 'Seedling';
  if (task.lifecycleState === 'Transplanting') return 'YoungPlant';
  if (task.lifecycleState === 'Production') {
    if (task.stage === 'Harvested') return 'Harvesting';
    return 'MaturePlant';
  }
  
  // Fallback basato su stage
  if (task.stage === 'Germination') return 'Germinating';
  if (task.stage === 'ReadyToTransplant') return 'Seedling';
  if (task.stage === 'Harvested') return 'Harvesting';
  
  return 'Seed';
}

/**
 * Determina la prossima fase logica
 */
function getNextPhase(currentPhase: LifecyclePhase): LifecyclePhase | null {
  const phaseOrder: LifecyclePhase[] = ['Seed', 'Germinating', 'Seedling', 'YoungPlant', 'MaturePlant', 'Harvesting'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  return currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null;
}

/**
 * Determina quale operazione suggerire per avanzare alla prossima fase
 */
function getSuggestedAction(currentPhase: LifecyclePhase, nextPhase: LifecyclePhase | null): string | null {
  if (!nextPhase) return null;
  
  const actions: Record<string, string> = {
    'Seed→Germinating': 'Conferma Germinazione',
    'Germinating→Seedling': 'Inizia Nursing',
    'Seedling→YoungPlant': 'Pronto per Trapianto',
    'YoungPlant→MaturePlant': 'Trapiantato',
    'MaturePlant→Harvesting': 'Inizia Raccolta'
  };
  
  return actions[`${currentPhase}→${nextPhase}`] || null;
}

const LifecycleFlowGuide: React.FC<LifecycleFlowGuideProps> = ({ 
  task, 
  onAdvancePhase,
  onViewSuggestedTasks 
}) => {
  const currentPhase = getCurrentPhase(task);
  const nextPhase = getNextPhase(currentPhase);
  const suggestedAction = getSuggestedAction(currentPhase, nextPhase);
  
  const phases: LifecyclePhase[] = ['Seed', 'Germinating', 'Seedling', 'YoungPlant', 'MaturePlant', 'Harvesting'];
  const currentIndex = phases.indexOf(currentPhase);
  
  const handleAdvance = () => {
    if (nextPhase && onAdvancePhase) {
      // Mappa la fase al lifecycleState appropriato
      const lifecycleStateMap: Record<LifecyclePhase, string> = {
        Seed: 'Sowing',
        Germinating: 'Germination',
        Seedling: 'Nursing',
        YoungPlant: 'Transplanting',
        MaturePlant: 'Production',
        Harvesting: 'Production'
      };
      
      onAdvancePhase(lifecycleStateMap[nextPhase] || nextPhase);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Ciclo Vitale</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {phases.map((phase, index) => {
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;
            
            return (
              <React.Fragment key={phase}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
                      ${isPast ? 'bg-green-500 text-white' : ''}
                      ${isCurrent ? PHASE_COLORS[phase] + ' ring-2 ring-green-500' : ''}
                      ${isFuture ? 'bg-gray-100 text-gray-400' : ''}
                    `}
                  >
                    {isPast ? <CheckCircle size={20} /> : <Circle size={20} />}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? 'font-bold' : ''} ${isFuture ? 'text-gray-400' : ''}`}>
                    {PHASE_LABELS[phase]}
                  </span>
                </div>
                {index < phases.length - 1 && (
                  <ArrowRight 
                    size={16} 
                    className={`${isPast ? 'text-green-500' : 'text-gray-300'}`} 
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Informazioni fase corrente */}
      <div className="bg-gray-50 p-3 rounded-lg mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Fase corrente: <span className={PHASE_COLORS[currentPhase]}>{PHASE_LABELS[currentPhase]}</span>
            </p>
            {task.sowingDetails && (
              <p className="text-xs text-gray-600 mt-1">
                {task.sowingDetails.expectedSeedlings 
                  ? `Piantine attese: ${task.sowingDetails.expectedSeedlings}`
                  : task.initialQuantity 
                    ? `Semi seminati: ${task.initialQuantity}`
                    : ''}
              </p>
            )}
          </div>
          {task.expectedTransplantDate && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar size={12} />
                <span>Trapianto previsto: {new Date(task.expectedTransplantDate).toLocaleDateString('it-IT')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Azioni suggerite */}
      {suggestedAction && (
        <div className="flex gap-2">
          <button
            onClick={handleAdvance}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            {suggestedAction}
          </button>
          {onViewSuggestedTasks && (
            <button
              onClick={onViewSuggestedTasks}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Vedi Task
            </button>
          )}
        </div>
      )}
      
      {/* Separazione operazione/fase */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500 font-semibold">Operazione:</span>
            <p className="text-gray-700 font-bold mt-1">{task.taskType}</p>
          </div>
          <div>
            <span className="text-gray-500 font-semibold">Fase:</span>
            <p className={`font-bold mt-1 ${PHASE_COLORS[currentPhase]}`}>
              {PHASE_LABELS[currentPhase]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifecycleFlowGuide;

