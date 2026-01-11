/**
 * Enhanced Planner con integrazione AI Planning Wizard
 * Mantiene compatibilità con il planner esistente aggiungendo funzionalità AI
 */

import React, { useState } from 'react';
import { Bot, TrendingUp, Sparkles } from 'lucide-react';
import { Garden, GardenTask } from '../types';
import AIPlanningWizard from './ai/AIPlanningWizard';
import PlanPreviewModal from './ai/PlanPreviewModal';
import AIActionButton from './ai/AIActionButton';
import { ScalingPlan } from '../services/aiPlanningService';

interface PlannerWithAIProps {
  garden: Garden;
  tasks: GardenTask[];
  onTasksUpdate: (tasks: GardenTask[]) => void;
  // Altri props del planner esistente
}

export const PlannerWithAI: React.FC<PlannerWithAIProps> = ({
  garden,
  tasks,
  onTasksUpdate,
  ...otherProps
}) => {
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ScalingPlan | null>(null);

  const handlePlanGenerated = (plan: ScalingPlan) => {
    setGeneratedPlan(plan);
    setShowAIWizard(false);
    setShowPlanPreview(true);
  };

  const handlePlanConfirm = async (plan: ScalingPlan) => {
    // Converti il piano AI in task del giardino
    const newTasks: GardenTask[] = [];
    
    plan.timeline.forEach((phase) => {
      phase.activities.forEach((activity) => {
        const task: GardenTask = {
          id: `ai-${Date.now()}-${Math.random()}`,
          gardenId: garden.id,
          plantName: `${plan.overview.totalSurface}ha - Fase ${phase.phaseNumber}`,
          taskType: activity.type === 'sowing' ? 'Sowing' :
                   activity.type === 'transplant' ? 'Transplant' :
                   activity.type === 'fertilization' ? 'Fertilize' :
                   activity.type === 'harvest' ? 'Harvest' : 'Treatment',
          date: activity.date,
          completed: false,
          isSuggested: true,
          suggestedBy: 'ai_planning_wizard',
          suggestedDate: activity.date,
          notes: `${activity.description}\n\nRisorse: ${activity.resources.join(', ')}\nOre stimate: ${activity.estimatedHours}h\nCosto: €${activity.cost}`,
          surfaceHectares: phase.surfaceHectares,
          expectedYield: phase.expectedYield,
          estimatedCost: activity.cost,
          aiGenerated: true,
          planPhase: phase.phaseNumber
        };
        newTasks.push(task);
      });
    });

    // Aggiungi i nuovi task a quelli esistenti
    onTasksUpdate([...tasks, ...newTasks]);
    setShowPlanPreview(false);
    setGeneratedPlan(null);
  };

  const handlePlanReject = () => {
    setShowPlanPreview(false);
    setGeneratedPlan(null);
  };

  const handleConsultOnly = () => {
    // Salva il piano per consultazione senza creare task
    console.log('Piano salvato per consultazione:', generatedPlan);
    setShowPlanPreview(false);
  };

  return (
    <div className="relative">
      {/* Planner Esistente */}
      <div className="space-y-6">
        {/* Header con AI Integration */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Pianificazione Orto</h1>
            <p className="text-gray-600">Gestisci le tue coltivazioni con l'assistenza AI</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* AI Action Button per assistenza generale */}
            <AIActionButton
              context={{
                component: 'planner',
                data: { garden, tasks: tasks.length },
                action: 'suggest'
              }}
              variant="compact"
            />
            
            {/* Bottone principale AI Planning */}
            <button
              onClick={() => setShowAIWizard(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-3 shadow-lg"
            >
              <Bot size={20} />
              <span className="font-medium">Pianifica con AI</span>
              <Sparkles size={16} className="opacity-80" />
            </button>
          </div>
        </div>

        {/* Indicatori AI per task esistenti */}
        <div className="grid gap-4">
          {tasks.filter(t => t.aiGenerated).length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Bot size={20} className="text-blue-600" />
                <h3 className="font-semibold text-blue-800">Task Generati da AI</h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                {tasks.filter(t => t.aiGenerated).length} task creati dal sistema di pianificazione AI
              </p>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(tasks.filter(t => t.aiGenerated).map(t => t.planPhase))).map(phase => (
                  <span key={phase} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Fase {phase}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Qui andrebbe il contenuto del planner esistente */}
          {/* Mantieni tutti i componenti esistenti del planner */}
          
          {/* Esempio di integrazione AI nei task esistenti */}
          {tasks.map((task) => (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.completed ? 'bg-green-500' : 
                    task.aiGenerated ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <h4 className="font-medium">{task.plantName}</h4>
                    <p className="text-sm text-gray-600">
                      {task.taskType} • {new Date(task.date).toLocaleDateString('it-IT')}
                    </p>
                    {task.aiGenerated && (
                      <div className="flex items-center gap-3 mt-1">
                        <Bot size={12} className="text-blue-500" />
                        <span className="text-xs text-blue-600">Generato da AI</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* AI Action Button per ogni task */}
                <AIActionButton
                  context={{
                    component: 'planner',
                    data: task,
                    action: 'optimize'
                  }}
                  variant="compact"
                />
              </div>
              
              {task.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{task.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Planning Wizard Modal */}
      {showAIWizard && (
        <AIPlanningWizard
          garden={garden}
          onPlanGenerated={handlePlanGenerated}
          onClose={() => setShowAIWizard(false)}
        />
      )}

      {/* Plan Preview Modal */}
      {showPlanPreview && generatedPlan && (
        <PlanPreviewModal
          plan={generatedPlan}
          onConfirm={handlePlanConfirm}
          onReject={handlePlanReject}
          onConsultOnly={handleConsultOnly}
          isOpen={showPlanPreview}
        />
      )}
    </div>
  );
};

export default PlannerWithAI;