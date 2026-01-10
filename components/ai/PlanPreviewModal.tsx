/**
 * Plan Preview Modal - Anteprima piano AI con opzioni di modifica e conferma
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Edit3, 
  Check, 
  X, 
  Download,
  Eye,
  Users,
  Truck,
  Droplets,
  Package
} from 'lucide-react';
import { ScalingPlan, ScalingPhase, PlannedActivity } from '../../services/aiPlanningService';

interface PlanPreviewModalProps {
  plan: ScalingPlan;
  onConfirm: (modifiedPlan: ScalingPlan) => void;
  onReject: () => void;
  onConsultOnly: () => void;
  isOpen: boolean;
}

export const PlanPreviewModal: React.FC<PlanPreviewModalProps> = ({
  plan,
  onConfirm,
  onReject,
  onConsultOnly,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'resources' | 'risks'>('overview');
  const [editingPhase, setEditingPhase] = useState<number | null>(null);
  const [modifiedPlan, setModifiedPlan] = useState<ScalingPlan>(plan);
  const [showModifications, setShowModifications] = useState(false);

  if (!isOpen) return null;

  const handlePhaseEdit = (phaseIndex: number, updatedPhase: ScalingPhase) => {
    const newTimeline = [...modifiedPlan.timeline];
    newTimeline[phaseIndex] = updatedPhase;
    
    setModifiedPlan(prev => ({
      ...prev,
      timeline: newTimeline
    }));
    
    setEditingPhase(null);
    setShowModifications(true);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {modifiedPlan.overview.plantingPeriods}
          </div>
          <div className="text-sm text-blue-800">Fasi di semina</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {modifiedPlan.overview.estimatedYield.toFixed(1)}t
          </div>
          <div className="text-sm text-green-800">Produzione stimata</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            €{(modifiedPlan.overview.totalInvestment / 1000).toFixed(0)}k
          </div>
          <div className="text-sm text-purple-800">Investimento</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            {modifiedPlan.overview.roi.toFixed(1)}%
          </div>
          <div className="text-sm text-orange-800">ROI stimato</div>
        </div>
      </div>

      {/* Raccomandazioni AI */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🤖 Raccomandazioni AI
        </h3>
        <div className="space-y-2">
          {modifiedPlan.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Finestre di Raccolta */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Finestre di Raccolta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {modifiedPlan.overview.harvestWindows.map((date, index) => (
            <div key={index} className="bg-green-50 p-3 rounded-lg text-center">
              <div className="font-medium text-green-800">
                Raccolta {index + 1}
              </div>
              <div className="text-sm text-green-600">
                {new Date(date).toLocaleDateString('it-IT', { 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Timeline Scaglionamento</h3>
        <div className="text-sm text-gray-600">
          {modifiedPlan.timeline.length} fasi pianificate
        </div>
      </div>
      
      {modifiedPlan.timeline.map((phase, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-800">
                Fase {phase.phaseNumber}
              </h4>
              <p className="text-sm text-gray-600">
                {phase.surfaceHectares} ha • {phase.expectedYield}t stimati
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {new Date(phase.startDate).toLocaleDateString('it-IT')} - {new Date(phase.endDate).toLocaleDateString('it-IT')}
                </div>
                <div className="text-xs text-gray-500">
                  Durata: {Math.ceil((new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / (1000 * 60 * 60 * 24))} giorni
                </div>
              </div>
              <button
                onClick={() => setEditingPhase(index)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 size={16} />
              </button>
            </div>
          </div>

          {editingPhase === index ? (
            <PhaseEditForm 
              phase={phase}
              onSave={(updatedPhase) => handlePhaseEdit(index, updatedPhase)}
              onCancel={() => setEditingPhase(null)}
            />
          ) : (
            <div className="space-y-3">
              {phase.activities.map((activity, actIndex) => (
                <div key={actIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'sowing' ? 'bg-green-500' :
                      activity.type === 'transplant' ? 'bg-blue-500' :
                      activity.type === 'fertilization' ? 'bg-yellow-500' :
                      activity.type === 'harvest' ? 'bg-orange-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <div className="font-medium text-sm">{activity.description}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(activity.date).toLocaleDateString('it-IT')} • {activity.estimatedHours}h • €{activity.cost}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      {/* Semi */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={20} />
          Semi e Materiale Vegetale
        </h3>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{modifiedPlan.resources.seeds.variety}</div>
              <div className="text-sm text-gray-600">
                Quantità: {modifiedPlan.resources.seeds.quantity}
              </div>
              {modifiedPlan.resources.seeds.supplier && (
                <div className="text-xs text-gray-500">
                  Fornitore: {modifiedPlan.resources.seeds.supplier}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">
                €{modifiedPlan.resources.seeds.cost}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attrezzature */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Truck size={20} />
          Attrezzature e Macchinari
        </h3>
        <div className="space-y-3">
          {modifiedPlan.resources.equipment.map((eq, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{eq.name}</div>
                <div className="text-sm text-gray-600">
                  Quantità: {eq.quantity} • {eq.rental ? 'Noleggio' : 'Acquisto'}
                </div>
              </div>
              <div className="font-bold text-gray-800">
                €{eq.cost}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manodopera */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} />
          Fabbisogno Manodopera
        </h3>
        <div className="space-y-3">
          {modifiedPlan.resources.labor.map((labor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">{labor.phase}</div>
                <div className="text-sm text-gray-600">
                  {labor.hoursNeeded}h • {labor.skillLevel}
                </div>
              </div>
              <div className="font-bold text-blue-600">
                €{labor.estimatedCost}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Tecnici */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Droplets size={20} />
          Input Tecnici
        </h3>
        <div className="space-y-3">
          {modifiedPlan.resources.inputs.map((input, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">{input.name}</div>
                <div className="text-sm text-gray-600">
                  {input.quantity} • {input.type}
                </div>
              </div>
              <div className="font-bold text-yellow-600">
                €{input.cost}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRisks = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Analisi Rischi</h3>
      
      {modifiedPlan.riskAnalysis.map((risk, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-800">{risk.risk}</h4>
              <div className="text-sm text-gray-600 capitalize">
                Categoria: {risk.category}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                risk.probability === 'high' ? 'bg-red-100 text-red-800' :
                risk.probability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                Prob: {risk.probability}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                risk.impact === 'high' ? 'bg-red-100 text-red-800' :
                risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                Impatto: {risk.impact}
              </span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-1">Strategia di Mitigazione:</div>
            <div className="text-sm text-blue-700">{risk.mitigation}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Anteprima Piano AI
              </h1>
              <p className="text-gray-600">
                Rivedi, modifica e conferma il piano di scaglionamento
              </p>
              {showModifications && (
                <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  ✏️ Piano modificato - Le modifiche saranno applicate alla conferma
                </div>
              )}
            </div>
            <button
              onClick={onReject}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Panoramica', icon: TrendingUp },
              { key: 'timeline', label: 'Timeline', icon: Calendar },
              { key: 'resources', label: 'Risorse', icon: Package },
              { key: 'risks', label: 'Rischi', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'timeline' && renderTimeline()}
          {activeTab === 'resources' && renderResources()}
          {activeTab === 'risks' && renderRisks()}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Implementa download PDF
                console.log('Download PDF:', modifiedPlan);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download size={16} />
              Scarica PDF
            </button>
            
            <button
              onClick={onConsultOnly}
              className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
            >
              <Eye size={16} />
              Solo Consultazione
            </button>
            
            <div className="flex-1" />
            
            <button
              onClick={onReject}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
            >
              <X size={16} />
              Scarta Piano
            </button>
            
            <button
              onClick={() => onConfirm(modifiedPlan)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Check size={16} />
              Conferma e Applica
              {showModifications && (
                <span className="ml-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  Modificato
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente per editing delle fasi
const PhaseEditForm: React.FC<{
  phase: ScalingPhase;
  onSave: (phase: ScalingPhase) => void;
  onCancel: () => void;
}> = ({ phase, onSave, onCancel }) => {
  const [editedPhase, setEditedPhase] = useState<ScalingPhase>(phase);

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h5 className="font-medium text-blue-800 mb-3">Modifica Fase {phase.phaseNumber}</h5>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Superficie (ha)
          </label>
          <input
            type="number"
            step="0.1"
            value={editedPhase.surfaceHectares}
            onChange={(e) => setEditedPhase(prev => ({
              ...prev,
              surfaceHectares: parseFloat(e.target.value) || 0
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Inizio
          </label>
          <input
            type="date"
            value={editedPhase.startDate}
            onChange={(e) => setEditedPhase(prev => ({
              ...prev,
              startDate: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resa Attesa (t)
          </label>
          <input
            type="number"
            step="0.1"
            value={editedPhase.expectedYield}
            onChange={(e) => setEditedPhase(prev => ({
              ...prev,
              expectedYield: parseFloat(e.target.value) || 0
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onSave(editedPhase)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Salva
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Annulla
        </button>
      </div>
    </div>
  );
};

export default PlanPreviewModal;