import React, { useState, useEffect } from 'react';
import { GardenTask, Garden } from '../types';
import { PlantMasterSheet } from '../types';
import { calculateFertigationPlan, FertigationPlan } from '../logic/fertigationEngine';
import { getMasterSheet } from '../services/plantMasterService';
import { Droplets, FlaskConical, Calendar, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';
import { useTier } from '../packages/core/hooks/useTier';

interface FertigationPlannerProps {
  task: GardenTask;
  garden: Garden;
}

const FertigationPlanner: React.FC<FertigationPlannerProps> = ({ task, garden }) => {
  const { isPro } = useTier();
  const [plan, setPlan] = useState<FertigationPlan | null>(null);
  const [plant, setPlant] = useState<PlantMasterSheet | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const masterSheet = await getMasterSheet(task.plantName);
      if (masterSheet) {
        setPlant(masterSheet);
        const fertigationPlan = calculateFertigationPlan(task, masterSheet, garden);
        setPlan(fertigationPlan);
      }
    };
    loadData();
  }, [task, garden]);

  if (!plan || !plant) return null;

  if (!plan.shouldFertigate) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Info size={16} className="text-gray-500" />
          <p className="text-sm font-medium text-gray-700">Fertirrigazione</p>
        </div>
        <p className="text-sm text-gray-600">{plan.instructions[0]}</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Droplets size={20} className="text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Piano Fertirrigazione</h3>
      </div>

      {/* Prodotto Consigliato */}
      <div className="bg-white p-4 rounded-lg mb-4 border border-blue-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="font-bold text-gray-800 mb-1">{plan.product?.name}</p>
            <p className="text-xs text-gray-600 mb-2">
              NPK {plan.product?.npk.n}-{plan.product?.npk.p}-{plan.product?.npk.k}
              {plan.product?.organic && <span className="ml-2 text-green-600 font-semibold">● Bio</span>}
              {plan.product?.type && (
                <span className="ml-2 text-gray-500">
                  ({plan.product.type === 'Liquid' ? 'Liquido' : plan.product.type === 'Soluble' ? 'Solubile' : 'Chelato'})
                </span>
              )}
            </p>
            {plan.product?.micronutrients && plan.product.micronutrients.length > 0 && (
              <p className="text-xs text-gray-500">
                Microelementi: {plan.product.micronutrients.join(', ')}
              </p>
            )}
          </div>
          <FlaskConical size={24} className="text-blue-600 flex-shrink-0" />
        </div>
      </div>

      {/* Dosaggio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-white p-3 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">Dosaggio per Litro</p>
          <p className="text-lg font-bold text-blue-800">
            {plan.dosage.perLiter.toFixed(1)} {plan.dosage.unit}/L
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">Totale per Irrigazione</p>
          <p className="text-lg font-bold text-blue-800">
            {plan.dosage.totalForIrrigation.toFixed(1)} {plan.dosage.unit}
          </p>
        </div>
      </div>

      {/* Volume Acqua */}
      <div className="bg-blue-100 p-3 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-700" />
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Volume irrigazione:</span>{' '}
            {plan.irrigationVolume.toFixed(0)} litri d'acqua
          </p>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Per {garden.sizeSqMeters} m² di giardino
        </p>
      </div>

      {/* Tempistiche */}
      <div className="bg-white p-4 rounded-lg mb-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-blue-600" />
          <p className="font-semibold text-gray-800">Tempistiche</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-500" />
            <span className="text-gray-700">
              Prossima fertirrigazione: <span className="font-semibold">{plan.timing.nextDate.toLocaleDateString('it-IT')}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">
              Frequenza: <span className="font-semibold">ogni {plan.timing.frequency} giorni</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">
              Orario ideale: <span className="font-semibold">{plan.timing.bestTimeOfDay === 'Evening' ? 'Sera (dopo le 18:00)' : 'Mattina (prima delle 10:00)'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Istruzioni */}
      <div className="bg-white p-4 rounded-lg mb-4 border border-blue-100">
        <p className="font-semibold text-gray-800 mb-2">Istruzioni</p>
        <ol className="list-decimal list-inside space-y-1 text-sm sm:text-base text-gray-700">
          {plan.instructions.map((inst, idx) => (
            <li key={idx} className="ml-2 break-words">{inst}</li>
          ))}
        </ol>
      </div>

      {/* Warnings */}
      {plan.warnings.length > 0 && (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-orange-800 mb-1">Avvertenze</p>
              <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                {plan.warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Note Prodotto */}
      {plan.product?.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
          <p className="font-semibold mb-1 text-gray-700">Nota sul prodotto:</p>
          <p>{plan.product.notes}</p>
        </div>
      )}
    </div>
  );
};

export default FertigationPlanner;

