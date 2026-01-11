import React, { useState } from 'react';
import { GardenTask, Garden } from '../types';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import { StrawberryCrop } from '../types/strawberry';
import { calculateStrawberryTasks, isOptimalHarvestTime, calculateNextRenovationDate } from '../logic/strawberryEngine';
import { getMasterSheetSync } from '../services/plantMasterService';
import { Calendar, Scissors, Sprout, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface StrawberryManagementProps {
  tasks: GardenTask[];
  garden: Garden;
  onUpdateTask: (task: GardenTask) => void;
}

const StrawberryManagement: React.FC<StrawberryManagementProps> = ({ tasks, garden, onUpdateTask }) => {
  const [selectedTask, setSelectedTask] = useState<GardenTask | null>(null);

  // Filtra solo task di fragole
  const strawberryTasks = tasks.filter(t => {
    const master = getMasterSheetSync(t.plantName);
    return master?.cropType === 'Strawberry';
  });

  if (strawberryTasks.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-red-500" size={24} />
          <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Fragole</h3>
        </div>
        <p className="text-gray-600">Nessuna coltura di fragole attiva in questo orto.</p>
      </div>
    );
  }

  const currentTask = selectedTask || strawberryTasks[0];
  const masterData = getMasterSheetSync(currentTask.plantName);
  const strawberryCrop = masterData as unknown as StrawberryCrop | undefined;

  if (!strawberryCrop || strawberryCrop.cropType !== 'Strawberry') {
    return null;
  }

  const strawberryAdvice = calculateStrawberryTasks(strawberryCrop);
  const isHarvestTime = isOptimalHarvestTime(strawberryCrop);
  const nextRenovation = calculateNextRenovationDate(strawberryCrop, currentTask.strawberryData?.renovationCompleted ? currentTask.date : undefined);

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Package className="text-red-500" size={24} />
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Fragole</h3>
      </div>

      {/* Selettore Task */}
      {strawberryTasks.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Seleziona Impianto</label>
          <select
            value={currentTask.id}
            onChange={(e) => {
              const task = strawberryTasks.find(t => t.id === e.target.value);
              if (task) setSelectedTask(task);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {strawberryTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.plantName} {task.variety ? `- ${task.variety}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info Impianto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm text-gray-600 mb-1">Varietà</div>
          <div className="font-bold text-gray-800">{strawberryCrop.varietyType}</div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm text-gray-600 mb-1">Sistema Impianto</div>
          <div className="font-bold text-gray-800">{strawberryCrop.plantingSystem}</div>
        </div>
      </div>

      {/* Task Consigliati */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
          <Calendar className="text-red-500" size={20} />
          Task Consigliati
        </h4>
        <div className="space-y-3">
          {strawberryAdvice.map((advice, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                advice.priority === 'High'
                  ? 'border-red-300 bg-red-50'
                  : advice.priority === 'Medium'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">{advice.message}</div>
                  <div className="text-sm text-gray-600">Scadenza: {new Date(advice.dueDate).toLocaleDateString('it-IT')}</div>
                </div>
                {advice.priority === 'High' && (
                  <AlertCircle className="text-red-500" size={20} />
                )}
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                {advice.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Stato Raccolta */}
      {isHarvestTime && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-300">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="font-semibold text-green-800">Periodo di Raccolta Attivo</span>
          </div>
          <p className="text-sm text-green-700">
            Raccogli fragole mature ogni 2-3 giorni. Il periodo di raccolta va da{' '}
            {new Date(2024, strawberryCrop.harvestWindow.startMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}{' '}
            a{' '}
            {new Date(2024, strawberryCrop.harvestWindow.endMonth - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}.
          </p>
        </div>
      )}

      {/* Rinnovo Impianto (solo per June-bearing) */}
      {strawberryCrop.varietyType === 'June-bearing' && strawberryCrop.renovationRequired && nextRenovation && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
          <div className="flex items-center gap-3 mb-2">
            <Scissors className="text-blue-600" size={20} />
            <span className="font-semibold text-blue-800">Prossimo Rinnovo</span>
          </div>
          <p className="text-sm text-blue-700">
            Data consigliata: {new Date(nextRenovation).toLocaleDateString('it-IT', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      )}

      {/* Gestione Stoloni */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-3">
          <Sprout className="text-gray-600" size={18} />
          Gestione Stoloni
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={currentTask.strawberryData?.runnerAction === 'Remove'}
              onChange={(e) => {
                onUpdateTask({
                  ...currentTask,
                  strawberryData: {
                    ...currentTask.strawberryData,
                    varietyType: strawberryCrop.varietyType,
                    runnerAction: e.target.checked ? 'Remove' : undefined
                  }
                });
              }}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Rimuovi stoloni (consigliato per June-bearing)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={currentTask.strawberryData?.runnerAction === 'Propagate'}
              onChange={(e) => {
                onUpdateTask({
                  ...currentTask,
                  strawberryData: {
                    ...currentTask.strawberryData,
                    varietyType: strawberryCrop.varietyType,
                    runnerAction: e.target.checked ? 'Propagate' : undefined
                  }
                });
              }}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Mantieni stoloni per propagazione</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default StrawberryManagement;

