import React, { useState, useEffect } from 'react';
import { Garden, GardenTask } from '../types';
import { generateAnnualPlan, optimizeRotations, calculateProjections, suggestSuccessions } from '../logic/annualPlannerEngine';
import type { AnnualPlan, QuarterPlan, PlannedPlanting } from '../logic/annualPlannerEngine';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import { Calendar, TrendingUp, DollarSign, RotateCw, Download, Plus, X, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface AnnualPlannerProps {
  garden: Garden;
  tasks: GardenTask[];
  onUpdatePlan?: (plan: AnnualPlan) => void;
}

const AnnualPlanner: React.FC<AnnualPlannerProps> = ({ garden, tasks, onUpdatePlan }) => {
  const { can, isPro } = useTier();
  const [annualPlan, setAnnualPlan] = useState<AnnualPlan | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProjections, setShowProjections] = useState(false);

  // Protezione Pro: Annual Planner è feature Pro
  if (!can('annualPlanner')) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
        <UpgradePrompt
          feature="Pianificazione Annuale"
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Versione Free:</strong> Puoi pianificare manualmente le tue colture.
          </p>
          <p className="text-xs text-gray-500">
            La pianificazione annuale automatica con ottimizzazione rotazioni, proiezioni resa e suggerimenti successioni è disponibile in versione Pro.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (tasks.length > 0 && garden) {
      generateInitialPlan();
    }
  }, [tasks, garden]);

  const generateInitialPlan = async () => {
    setIsGenerating(true);
    try {
      const plan = generateAnnualPlan(garden, {
        preferredPlants: tasks.map(t => t.plantName).filter((v, i, a) => a.indexOf(v) === i)
      });
      const optimized = optimizeRotations(plan, garden);
      setAnnualPlan(optimized);
      if (onUpdatePlan) {
        onUpdatePlan(optimized);
      }
    } catch (error) {
      console.error('Error generating annual plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeRotations = () => {
    if (!annualPlan) return;
    const optimized = optimizeRotations(annualPlan, garden);
    setAnnualPlan(optimized);
    if (onUpdatePlan) {
      onUpdatePlan(optimized);
    }
  };

  const handleExportPlan = () => {
    if (!annualPlan) return;
    
    const dataStr = JSON.stringify(annualPlan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `piano-annuale-${garden.name}-${new Date().getFullYear()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const projections = annualPlan ? annualPlan.projections : null;
  
  // Calcola successioni (semplificato - usa primo harvest se disponibile)
  const successions: Array<{ fromPlant: string; toPlant: string; reason: string; daysUntilSpaceFree: number; suggestedSowingDate: Date }> = [];
  if (annualPlan) {
    // Estrai informazioni per successioni
    Object.values(annualPlan.quarters).forEach(quarter => {
      quarter.harvests.forEach(harvest => {
        const nextQuarter = Object.values(annualPlan.quarters).find(q => 
          q.plantings.some(p => p.month > harvest.month)
        );
        if (nextQuarter) {
          const nextPlanting = nextQuarter.plantings[0];
          if (nextPlanting) {
            successions.push({
              fromPlant: harvest.plantName,
              toPlant: nextPlanting.plantName,
              reason: 'Successione ottimale per rotazione',
              daysUntilSpaceFree: (nextPlanting.month - harvest.month) * 30,
              suggestedSowingDate: new Date(new Date().getFullYear(), nextPlanting.month - 1, 15)
            });
          }
        }
      });
    });
  }

  const getQuarterLabel = (q: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
    switch (q) {
      case 'Q1': return 'Q1 (Gen-Mar)';
      case 'Q2': return 'Q2 (Apr-Giu)';
      case 'Q3': return 'Q3 (Lug-Set)';
      case 'Q4': return 'Q4 (Ott-Dic)';
    }
  };

  const getQuarterPlan = (q: 'Q1' | 'Q2' | 'Q3' | 'Q4'): QuarterPlan | null => {
    if (!annualPlan) return null;
    return annualPlan.quarters[q] || null;
  };

  const currentQuarter = getQuarterPlan(selectedQuarter);

  return (
    <div className="p-4 sm:p-6 pb-24 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 flex items-center gap-2">
            <Calendar size={28} className="text-green-600" />
            Piano Annuale {new Date().getFullYear()}
          </h1>
          <p className="text-green-600 text-sm sm:text-base mt-1">Pianifica tutto l'anno per: <b>{garden.name}</b></p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={generateInitialPlan}
            disabled={isGenerating}
            className="px-4 py-2 min-h-[44px] bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Generazione...
              </>
            ) : (
              <>
                <RotateCw size={18} />
                Rigenera Piano
              </>
            )}
          </button>
          <button
            onClick={handleOptimizeRotations}
            disabled={!annualPlan || isGenerating}
            className="px-4 py-2 min-h-[44px] bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2"
          >
            <RotateCw size={18} />
            Ottimizza Rotazioni
          </button>
          <button
            onClick={handleExportPlan}
            disabled={!annualPlan}
            className="px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2"
          >
            <Download size={18} />
            Esporta
          </button>
        </div>
      </div>

      {isGenerating ? (
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Generazione piano annuale in corso...</p>
          <p className="text-sm text-gray-500 mt-2">Analisi rotazioni e ottimizzazione colture</p>
        </div>
      ) : !annualPlan ? (
        <div className="bg-white rounded-xl p-8 border border-dashed border-gray-300 text-center">
          <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 font-medium text-sm sm:text-base">Nessun piano annuale generato</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Clicca "Rigenera Piano" per creare un piano annuale ottimizzato</p>
          <button
            onClick={generateInitialPlan}
            className="mt-4 px-6 py-3 min-h-[44px] bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all duration-200 text-sm sm:text-base"
          >
            Genera Piano Annuale
          </button>
        </div>
      ) : (
        <>
          {/* Quarter Selector */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={`p-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 min-h-[44px] ${
                    selectedQuarter === q
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getQuarterLabel(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Current Quarter Plan */}
          {currentQuarter && (
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                {getQuarterLabel(selectedQuarter)}
              </h2>
              
              <div className="space-y-4">
                {currentQuarter.plantings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Nessuna coltura pianificata per questo trimestre</p>
                  </div>
                ) : (
                  currentQuarter.plantings.map((planting, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">{planting.plantName}</h3>
                          {planting.variety && (
                            <p className="text-sm text-gray-600 italic">Varietà: {planting.variety}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2 text-xs sm:text-sm">
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                              Semina: Mese {planting.month}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              Metodo: {planting.method === 'Seed' ? 'Seme' : 'Trapianto'}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              Quantità: {planting.quantity}
                            </span>
                          </div>
                          {planting.bed && (
                            <p className="text-xs text-gray-500 mt-1">
                              Aiuola: {planting.bed}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Projections Dashboard */}
          {projections && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-600" />
                  Proiezioni Anno {new Date().getFullYear()}
                </h2>
                <button
                  onClick={() => setShowProjections(!showProjections)}
                  className="text-sm text-green-700 font-bold hover:text-green-800"
                >
                  {showProjections ? 'Nascondi' : 'Mostra'}
                </button>
              </div>
              
              {showProjections && (
                <div className={`grid gap-4 ${projections.breakEvenDate ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <p className="text-xs text-gray-600 mb-1">Resa Totale Stimata</p>
                    <p className="text-2xl font-bold text-green-700">
                      {projections.totalYield.toFixed(1)} kg
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <p className="text-xs text-gray-600 mb-1">Risparmio Stimato</p>
                    <p className="text-2xl font-bold text-green-700 flex items-center gap-1">
                      <DollarSign size={20} />
                      {projections.costSavings.toFixed(0)} €
                    </p>
                  </div>
                  {projections.breakEvenDate && (
                    <div className="bg-white p-4 rounded-lg border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Break-Even</p>
                      <p className="text-lg font-bold text-green-700">
                        {new Date(projections.breakEvenDate).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Succession Suggestions */}
          {successions.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-4 sm:p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <RotateCw size={20} className="text-purple-600" />
                Suggerimenti Successioni
              </h2>
              <div className="space-y-3">
                {successions.map((succession, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-800">{succession.fromPlant}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-bold text-green-700">{succession.toPlant}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{succession.reason}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        Spazio libero: {succession.daysUntilSpaceFree} giorni
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        Semina consigliata: {new Date(succession.suggestedSowingDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rotation Matrix */}
          {annualPlan.rotations && annualPlan.rotations.length > 0 && (
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Rotazioni Aiuole</h2>
              <div className="space-y-3">
                {annualPlan.rotations.map((rotation, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-2">Aiuola: {rotation.bedName || rotation.bedId || `Aiuola ${idx + 1}`}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      {rotation.quarters ? (
                        <>
                          {rotation.quarters.Q1 && (
                            <div className="p-2 bg-white rounded border border-gray-200">
                              <p className="font-medium text-gray-700">Q1: {rotation.quarters.Q1}</p>
                            </div>
                          )}
                          {rotation.quarters.Q2 && (
                            <div className="p-2 bg-white rounded border border-gray-200">
                              <p className="font-medium text-gray-700">Q2: {rotation.quarters.Q2}</p>
                            </div>
                          )}
                          {rotation.quarters.Q3 && (
                            <div className="p-2 bg-white rounded border border-gray-200">
                              <p className="font-medium text-gray-700">Q3: {rotation.quarters.Q3}</p>
                            </div>
                          )}
                          {rotation.quarters.Q4 && (
                            <div className="p-2 bg-white rounded border border-gray-200">
                              <p className="font-medium text-gray-700">Q4: {rotation.quarters.Q4}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">Nessuna rotazione pianificata</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnnualPlanner;

