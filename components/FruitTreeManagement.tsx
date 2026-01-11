import React, { useState } from 'react';
import { GardenTask, Garden } from '../types';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import { FruitTreeCrop, PruningRecord, GraftingRecord } from '../types/fruitTree';
import { calculateFruitTreeTasks, isChillRequirementMet } from '../logic/fruitTreeEngine';
import { getMasterSheetSync } from '../services/plantMasterService';
import { Scissors, TreePine, Calendar, CheckCircle, XCircle, MapPin, AlertCircle } from 'lucide-react';

interface FruitTreeManagementProps {
  tasks: GardenTask[];
  garden: Garden;
  onUpdateTask: (task: GardenTask) => void;
  pruningRecords?: PruningRecord[];
  graftingRecords?: GraftingRecord[];
}

const FruitTreeManagement: React.FC<FruitTreeManagementProps> = ({
  tasks,
  garden,
  onUpdateTask,
  pruningRecords = [],
  graftingRecords = []
}) => {
  const [selectedTask, setSelectedTask] = useState<GardenTask | null>(null);

  // Filtra solo task di frutteti
  const fruitTreeTasks = tasks.filter(t => {
    const master = getMasterSheetSync(t.plantName);
    return master?.cropType === 'FruitTree';
  });

  if (fruitTreeTasks.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <TreePine className="text-green-500" size={24} />
          <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Frutteti</h3>
        </div>
        <p className="text-gray-600">Nessun frutteto attivo in questo orto.</p>
      </div>
    );
  }

  const currentTask = selectedTask || fruitTreeTasks[0];
  const masterData = getMasterSheetSync(currentTask.plantName);
  const fruitTreeCrop = masterData as unknown as FruitTreeCrop | undefined;

  if (!fruitTreeCrop || fruitTreeCrop.cropType !== 'FruitTree') {
    return null;
  }

  const treeAge = currentTask.fruitTreeData?.treeAge || 1;
  const fruitTreeAdvice = calculateFruitTreeTasks(fruitTreeCrop, treeAge);
  const chillMet = garden.coordinates 
    ? isChillRequirementMet(fruitTreeCrop, garden.coordinates, garden.altitudeMeters)
    : true;

  // Filtra record per questo albero
  const treePruningRecords = pruningRecords.filter(r => r.fruitTreeId === currentTask.id);
  const treeGraftingRecords = graftingRecords.filter(r => r.fruitTreeId === currentTask.id);

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <TreePine className="text-green-500" size={24} />
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Frutteti</h3>
      </div>

      {/* Selettore Albero */}
      {fruitTreeTasks.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Seleziona Albero</label>
          <select
            value={currentTask.id}
            onChange={(e) => {
              const task = fruitTreeTasks.find(t => t.id === e.target.value);
              if (task) setSelectedTask(task);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {fruitTreeTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.plantName} {task.variety ? `- ${task.variety}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info Albero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Tipo</div>
          <div className="font-bold text-gray-800">{fruitTreeCrop.treeType}</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Età</div>
          <div className="font-bold text-gray-800">{treeAge} anni</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Portinnesto</div>
          <div className="font-bold text-gray-800">{fruitTreeCrop.rootstock}</div>
        </div>
      </div>

      {/* Verifica Impollinazione */}
      {fruitTreeCrop.pollinationType === 'Self-sterile' && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-full max-w-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-yellow-full max-w-sm" size={20} />
            <span className="font-semibold text-yellow-full max-w-sm">Richiede Impollinatori</span>
          </div>
          <p className="text-sm text-yellow-full max-w-sm">
            Questa varietà è auto-sterile. Assicurati di avere impollinatori nelle vicinanze:{' '}
            <strong>{fruitTreeCrop.pollinatorVarieties?.join(', ') || 'varietà compatibili'}</strong>
          </p>
        </div>
      )}

      {/* Verifica Chill Hours */}
      {fruitTreeCrop.chillHours && !chillMet && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-orange-600" size={20} />
            <span className="font-semibold text-orange-800">Fabbisogno Freddo Non Soddisfatto</span>
          </div>
          <p className="text-sm text-orange-700">
            Questa varietà richiede {fruitTreeCrop.chillHours} ore di freddo. 
            La tua località potrebbe non soddisfare questo requisito, con possibili effetti sulla produzione.
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
          {fruitTreeAdvice.map((advice, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                advice.priority === 'High'
                  ? 'border-green-300 bg-green-50'
                  : advice.priority === 'Medium'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">{advice.message}</div>
                  <div className="text-sm text-gray-600">
                    Scadenza: {new Date(advice.dueDate).toLocaleDateString('it-IT')}
                    {advice.season && ` (${advice.season})`}
                  </div>
                </div>
                {advice.priority === 'High' && (
                  <AlertCircle className="text-green-500" size={20} />
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

      {/* Storico Potature */}
      {treePruningRecords.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
            <Scissors className="text-green-500" size={20} />
            Storico Potature
          </h4>
          <div className="space-y-2">
            {treePruningRecords
              .sort((a, b) => new Date(b.pruningDate).getTime() - new Date(a.pruningDate).getTime())
              .slice(0, 5)
              .map(record => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {record.pruningType} - {record.season}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(record.pruningDate).toLocaleDateString('it-IT')} | {record.technique}
                      </div>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="mt-2 text-xs text-gray-600">{record.notes}</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Storico Innesti */}
      {treeGraftingRecords.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
            <TreePine className="text-green-500" size={20} />
            Storico Innesti
          </h4>
          <div className="space-y-2">
            {treeGraftingRecords
              .sort((a, b) => new Date(b.graftingDate).getTime() - new Date(a.graftingDate).getTime())
              .slice(0, 5)
              .map(record => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {record.graftingType} - {record.scionVariety}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(record.graftingDate).toLocaleDateString('it-IT')} | 
                        Portinnesto: {record.rootstockVariety}
                      </div>
                    </div>
                    {record.success ? (
                      <CheckCircle className="text-green-500" size={18} />
                    ) : (
                      <XCircle className="text-red-500" size={18} />
                    )}
                  </div>
                  {record.notes && (
                    <div className="mt-2 text-xs text-gray-600">{record.notes}</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Calendario Raccolta */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-3">
          <Calendar className="text-blue-500" size={18} />
          Periodo Raccolta
        </h4>
        <p className="text-sm text-blue-700">
          {(() => {
            // Usa array statico per evitare problemi di hydration SSR
            const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                                'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
            return `Da ${monthNames[fruitTreeCrop.harvestWindow.startMonth - 1]} a ${monthNames[fruitTreeCrop.harvestWindow.endMonth - 1]}`;
          })()}
        </p>
        {treeAge < fruitTreeCrop.maturityYears && (
          <p className="text-xs text-blue-600 mt-2">
            ⚠️ Albero ancora in fase di crescita. Produzione ottimale tra {fruitTreeCrop.maturityYears} anni.
          </p>
        )}
      </div>
    </div>
  );
};

export default FruitTreeManagement;

