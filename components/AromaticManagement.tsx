import React, { useState } from 'react';
import { GardenTask, Garden } from '../types';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import { AromaticMedicinalCrop } from '../types/aromatic';
import { calculateAromaticTasks } from '../logic/aromaticEngine';
import { getMasterSheetSync } from '../services/plantMasterService';
import { Leaf, Calendar, CheckCircle, Droplets, Scissors, Package } from 'lucide-react';

interface AromaticManagementProps {
  tasks: GardenTask[];
  garden: Garden;
  onUpdateTask: (task: GardenTask) => void;
}

const AromaticManagement: React.FC<AromaticManagementProps> = ({
  tasks,
  garden,
  onUpdateTask
}) => {
  const { can } = useTier();
  const [selectedTask, setSelectedTask] = useState<GardenTask | null>(null);

  // Protezione Pro
  if (!can('specializedCrops')) {
    return (
      <div className="p-6 bg-white rounded-xl border-2 border-purple-200">
        <UpgradePrompt
          feature="Gestione Erbe Aromatiche e Officinali"
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      </div>
    );
  }

  // Filtra solo task di erbe aromatiche
  const aromaticTasks = (tasks || []).filter(t => {
    const master = getMasterSheetSync(t.plantName);
    return master?.cropType === 'Aromatic' || master?.cropType === 'Medicinal';
  });

  if (aromaticTasks.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="text-green-500" size={24} />
          <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Erbe Aromatiche</h3>
        </div>
        <p className="text-gray-600">Nessuna coltura di erbe aromatiche attiva in questo orto.</p>
      </div>
    );
  }

  const currentTask = selectedTask || aromaticTasks[0];
  const masterData = getMasterSheetSync(currentTask.plantName);
  const aromaticCrop = masterData as unknown as AromaticMedicinalCrop | undefined;

  if (!aromaticCrop || (aromaticCrop.cropType !== 'Aromatic' && aromaticCrop.cropType !== 'Medicinal')) {
    return null;
  }

  const aromaticAdvice = calculateAromaticTasks(aromaticCrop);
  const harvestTimingLabel = {
    'BeforeFlowering': 'Prima della fioritura',
    'DuringFlowering': 'Durante la fioritura',
    'AfterFlowering': 'Dopo la fioritura'
  }[aromaticCrop.harvestTiming];

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Leaf className="text-green-500" size={24} />
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Erbe Aromatiche</h3>
      </div>

      {/* Selettore Pianta */}
      {aromaticTasks.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Seleziona Pianta</label>
          <select
            value={currentTask.id}
            onChange={(e) => {
              const task = aromaticTasks.find(t => t.id === e.target.value);
              if (task) setSelectedTask(task);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {aromaticTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.plantName} {task.variety ? `- ${task.variety}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info Pianta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Parte Raccolta</div>
          <div className="font-bold text-gray-800">
            {aromaticCrop.harvestType === 'Leaves' ? 'Foglie' :
             aromaticCrop.harvestType === 'Flowers' ? 'Fiori' :
             aromaticCrop.harvestType === 'Stems' ? 'Steli' :
             aromaticCrop.harvestType === 'Roots' ? 'Radici' :
             'Semi'}
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Timing Raccolta</div>
          <div className="font-bold text-gray-800">{harvestTimingLabel}</div>
        </div>
      </div>

      {/* Essiccazione */}
      {aromaticCrop.dryingRequired && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-full max-w-sm">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="text-yellow-full max-w-sm" size={18} />
            <span className="font-semibold text-yellow-full max-w-sm">Essiccazione Richiesta</span>
          </div>
          <div className="space-y-1 text-sm text-yellow-full max-w-sm">
            <p><strong>Metodo:</strong> {
              aromaticCrop.dryingMethod === 'Air' ? 'Aria' :
              aromaticCrop.dryingMethod === 'Dehydrator' ? 'Essiccatore' :
              'Forno'
            }</p>
            <p><strong>Tempo stimato:</strong> {aromaticCrop.dryingTime || '7-14'} giorni</p>
            <p><strong>Conservazione:</strong> {
              aromaticCrop.storageMethod === 'Dried' ? 'Essiccato' :
              aromaticCrop.storageMethod === 'Fresh' ? 'Fresco' :
              aromaticCrop.storageMethod === 'Frozen' ? 'Congelato' :
              'Olio'
            }</p>
          </div>
        </div>
      )}

      {/* Moltiplicazione */}
      {aromaticCrop.multiplicationMethod && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Scissors className="text-blue-600" size={18} />
            <span className="font-semibold text-blue-800">Metodo Moltiplicazione</span>
          </div>
          <p className="text-sm text-blue-700">
            {aromaticCrop.multiplicationMethod === 'Seed' ? 'Seme' :
             aromaticCrop.multiplicationMethod === 'Cutting' ? 'Talea' :
             aromaticCrop.multiplicationMethod === 'Division' ? 'Divisione' :
             'Propagazione'}
          </p>
        </div>
      )}

      {/* Task Consigliati */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
          <Calendar className="text-green-500" size={20} />
          Task Consigliati
        </h4>
        <div className="space-y-3">
          {aromaticAdvice.map((advice, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                advice.priority === 'High'
                  ? 'border-green-300 bg-green-50'
                  : advice.priority === 'Medium'
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">{advice.message}</div>
                  <div className="text-sm text-gray-600">
                    Scadenza: {new Date(advice.dueDate).toLocaleDateString('it-IT')}
                  </div>
                </div>
                {advice.taskType === 'Harvest' && (
                  <Leaf className="text-green-500" size={20} />
                )}
                {advice.taskType === 'Drying' && (
                  <Droplets className="text-yellow-full max-w-sm" size={20} />
                )}
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                {advice.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Resa Oli Essenziali */}
      {aromaticCrop.essentialOilYield && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-3">
            <Package className="text-purple-600" size={18} />
            Resa Oli Essenziali
          </h4>
          <p className="text-sm text-purple-700">
            Resa stimata: {aromaticCrop.essentialOilYield} ml/kg di materiale fresco
          </p>
        </div>
      )}
    </div>
  );
};

export default AromaticManagement;






