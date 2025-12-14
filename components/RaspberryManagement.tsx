import React, { useState } from 'react';
import { GardenTask, Garden } from '../types';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import { RaspberryCrop } from '../types/raspberry';
import { calculateRaspberryTasks, isOptimalHarvestTime } from '../logic/raspberryEngine';
import { getMasterSheet } from '../services/plantMasterService';
import { Calendar, Scissors, Package, AlertCircle, CheckCircle, Grid } from 'lucide-react';

interface RaspberryManagementProps {
  tasks: GardenTask[];
  garden: Garden;
  onUpdateTask: (task: GardenTask) => void;
}

const RaspberryManagement: React.FC<RaspberryManagementProps> = ({ tasks, garden, onUpdateTask }) => {
  const { can } = useTier();
  const [selectedTask, setSelectedTask] = useState<GardenTask | null>(null);

  // Protezione Pro
  if (!can('specializedCrops')) {
    return (
      <div className="p-6 bg-white rounded-xl border-2 border-purple-200">
        <UpgradePrompt
          feature="Gestione Lamponi"
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      </div>
    );
  }

  // Filtra solo task di lamponi
  const raspberryTasks = tasks.filter(t => {
    const master = getMasterSheet(t.plantName);
    return master?.cropType === 'Raspberry' as any; // Raspberry è un CropType valido ma TypeScript non lo riconosce
  });

  if (raspberryTasks.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-purple-500" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Gestione Lamponi</h3>
        </div>
        <p className="text-gray-600">Nessuna coltura di lamponi attiva in questo orto.</p>
      </div>
    );
  }

  const currentTask = selectedTask || raspberryTasks[0];
  const masterData = getMasterSheet(currentTask.plantName);
  const raspberryCrop = masterData as unknown as RaspberryCrop | undefined;

  if (!raspberryCrop || raspberryCrop.cropType !== 'Raspberry') {
    return null;
  }

  const raspberryAdvice = calculateRaspberryTasks(raspberryCrop);
  const isHarvestTime = isOptimalHarvestTime(raspberryCrop);

  const varietyTypeLabel = {
    'Summer-bearing': 'Estiva',
    'Ever-bearing': 'Rifiorente',
    'Fall-bearing': 'Autunnale'
  }[raspberryCrop.varietyType];

  const canesTypeLabel = {
    'Primocane': 'Primocane (canne dell\'anno)',
    'Floricane': 'Floricane (canne dell\'anno precedente)'
  }[raspberryCrop.canesType];

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Package className="text-purple-500" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Gestione Lamponi</h3>
      </div>

      {/* Selettore Task */}
      {raspberryTasks.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Seleziona Impianto</label>
          <select
            value={currentTask.id}
            onChange={(e) => {
              const task = raspberryTasks.find(t => t.id === e.target.value);
              if (task) setSelectedTask(task);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {raspberryTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.plantName} {task.variety ? `- ${task.variety}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info Impianto */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Varietà</div>
          <div className="font-bold text-gray-800">{varietyTypeLabel}</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Tipo Canne</div>
          <div className="font-bold text-gray-800 text-xs">{canesTypeLabel}</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Sistema Allevamento</div>
          <div className="font-bold text-gray-800">
            {raspberryCrop.trainingSystem === 'Trellis' ? 'Trelis' : 'Libero'}
          </div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Supporti</div>
          <div className="font-bold text-gray-800">
            {raspberryCrop.supportRequired ? 'Richiesti' : 'Non richiesti'}
          </div>
        </div>
      </div>

      {/* Avviso Supporti */}
      {raspberryCrop.supportRequired && !currentTask.raspberryData?.supportInstalled && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <span className="font-semibold text-yellow-800">Supporti Non Installati</span>
          </div>
          <p className="text-sm text-yellow-700">
            Questa varietà richiede supporti (trelis) per sostenere le canne. Installa i supporti prima che le canne crescano troppo.
          </p>
        </div>
      )}

      {/* Task Consigliati */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="text-purple-500" size={20} />
          Task Consigliati
        </h4>
        <div className="space-y-3">
          {raspberryAdvice.map((advice, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                advice.priority === 'High'
                  ? 'border-purple-300 bg-purple-50'
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
                    {advice.canesType && ` | Tipo canne: ${advice.canesType === 'Primocane' ? 'Primocane' : 'Floricane'}`}
                  </div>
                </div>
                {advice.taskType === 'CaneRemoval' || advice.taskType === 'Pruning' ? (
                  <Scissors className="text-purple-500" size={20} />
                ) : advice.taskType === 'SupportInstallation' ? (
                  <Grid className="text-blue-500" size={20} />
                ) : (
                  <CheckCircle className="text-green-500" size={20} />
                )}
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                {advice.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Info Gestione Canne */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Scissors className="text-blue-600" size={18} />
          Gestione Canne
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          {raspberryCrop.varietyType === 'Summer-bearing' && raspberryCrop.canesType === 'Floricane' ? (
            <>
              <p><strong>Varietà estiva (Floricane):</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Le canne floricane producono frutti nell'estate del secondo anno</li>
                <li>Dopo la raccolta (agosto-settembre), rimuovi tutte le canne floricane esaurite</li>
                <li>Lascia solo le canne primocane nuove che produrranno l'anno prossimo</li>
                <li>In inverno, seleziona 4-6 primocane migliori e legale al trelis</li>
              </ul>
            </>
          ) : (
            <>
              <p><strong>Varietà rifiorente/autunnale (Primocane):</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Le canne primocane producono frutti nello stesso anno</li>
                <li>In inverno, taglia tutte le canne a terra per produzione solo autunnale</li>
                <li>Oppure mantieni parte delle canne per doppia produzione (estate + autunno)</li>
                <li>Le nuove canne primocane produrranno in autunno</li>
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Stato Raccolta */}
      {isHarvestTime && (
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="font-semibold text-green-800">Periodo di Raccolta Attivo</span>
          </div>
          <p className="text-sm text-green-700">
            Raccogli lamponi maturi ogni 2-3 giorni durante la stagione.
          </p>
        </div>
      )}
    </div>
  );
};

export default RaspberryManagement;

