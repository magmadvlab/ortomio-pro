import React, { useState } from 'react';
import { GardenTask, Garden } from '../types';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import { ExoticFruitCrop } from '../types/exoticFruit';
import { calculateExoticFruitTasks, checkClimateRequirements } from '../logic/exoticFruitEngine';
import { getMasterSheet } from '../services/plantMasterService';
import { ThermometerSun, AlertTriangle, CheckCircle, Calendar, Cloud, Sprout } from 'lucide-react';

interface ExoticFruitManagementProps {
  tasks: GardenTask[];
  garden: Garden;
  onUpdateTask: (task: GardenTask) => void;
}

const ExoticFruitManagement: React.FC<ExoticFruitManagementProps> = ({
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
          feature="Gestione Frutti Esotici"
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      </div>
    );
  }

  // Filtra solo task di frutti esotici
  const exoticFruitTasks = tasks.filter(t => {
    const master = getMasterSheet(t.plantName);
    return master?.cropType === 'ExoticFruit';
  });

  if (exoticFruitTasks.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Sprout className="text-orange-500" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Gestione Frutti Esotici</h3>
        </div>
        <p className="text-gray-600">Nessuna coltura di frutti esotici attiva in questo orto.</p>
      </div>
    );
  }

  const currentTask = selectedTask || exoticFruitTasks[0];
  const masterData = getMasterSheet(currentTask.plantName);
  const exoticCrop = masterData as unknown as ExoticFruitCrop | undefined;

  if (!exoticCrop || exoticCrop.cropType !== 'ExoticFruit') {
    return null;
  }

  const exoticAdvice = calculateExoticFruitTasks(exoticCrop, garden);
  const currentTemp = currentTask.exoticFruitData?.currentTemp || 20; // Default
  const climateStatus = checkClimateRequirements(exoticCrop, currentTemp);

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Sprout className="text-orange-500" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Gestione Frutti Esotici</h3>
      </div>

      {/* Selettore Pianta */}
      {exoticFruitTasks.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Seleziona Pianta</label>
          <select
            value={currentTask.id}
            onChange={(e) => {
              const task = exoticFruitTasks.find(t => t.id === e.target.value);
              if (task) setSelectedTask(task);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            {exoticFruitTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.plantName} {task.variety ? `- ${task.variety}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info Pianta */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-sm text-gray-600 mb-1">Tipo</div>
          <div className="font-bold text-gray-800">{exoticCrop.fruitType}</div>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-sm text-gray-600 mb-1">Serra Richiesta</div>
          <div className="font-bold text-gray-800">
            {exoticCrop.greenhouseRequired ? 'Sì' : 'No'}
          </div>
        </div>
      </div>

      {/* Avviso Clima */}
      {exoticCrop.greenhouseRequired && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          climateStatus.status === 'Critical' ? 'bg-red-50 border-red-300' :
          climateStatus.status === 'Warning' ? 'bg-yellow-50 border-yellow-300' :
          'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {climateStatus.status === 'Critical' ? (
              <AlertTriangle className="text-red-600" size={20} />
            ) : climateStatus.status === 'Warning' ? (
              <AlertTriangle className="text-yellow-600" size={20} />
            ) : (
              <CheckCircle className="text-green-600" size={20} />
            )}
            <span className={`font-semibold ${
              climateStatus.status === 'Critical' ? 'text-red-800' :
              climateStatus.status === 'Warning' ? 'text-yellow-800' :
              'text-green-800'
            }`}>
              Stato Clima: {climateStatus.status === 'Critical' ? 'CRITICO' : 
                           climateStatus.status === 'Warning' ? 'ATTENZIONE' : 'OTTIMALE'}
            </span>
          </div>
          <p className={`text-sm ${
            climateStatus.status === 'Critical' ? 'text-red-700' :
            climateStatus.status === 'Warning' ? 'text-yellow-700' :
            'text-green-700'
          }`}>
            {climateStatus.message}
          </p>
          <div className="mt-2 text-xs text-gray-600">
            Temperatura attuale: {currentTemp}°C | Range ideale: {exoticCrop.climateRequirements.idealTemp} | 
            Min: {exoticCrop.climateRequirements.minTemp}°C | Max: {exoticCrop.climateRequirements.maxTemp}°C
          </div>
        </div>
      )}

      {/* Note Clima Italiano */}
      {exoticCrop.italianClimateNotes && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="text-blue-600" size={18} />
            <span className="font-semibold text-blue-800">Note Clima Italiano</span>
          </div>
          <p className="text-sm text-blue-700">{exoticCrop.italianClimateNotes}</p>
        </div>
      )}

      {/* Task Consigliati */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="text-orange-500" size={20} />
          Task Consigliati
        </h4>
        <div className="space-y-3">
          {exoticAdvice.map((advice, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                advice.priority === 'High'
                  ? 'border-orange-300 bg-orange-50'
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
                {advice.climateWarning && (
                  <ThermometerSun className="text-orange-500" size={20} />
                )}
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                {advice.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Gestione Serra */}
      {exoticCrop.greenhouseRequired && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Cloud className="text-purple-600" size={18} />
            Gestione Serra
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Tipo serra:</strong> {exoticCrop.greenhouseType || 'Warm'}</p>
            <p><strong>Temperatura ideale:</strong> {exoticCrop.climateRequirements.idealTemp}</p>
            <p><strong>Umidità:</strong> {exoticCrop.climateRequirements.humidity}</p>
            <p><strong>Ventilazione:</strong> Apri durante le ore calde</p>
            <p><strong>Riscaldamento:</strong> Attiva se temperatura &lt; {exoticCrop.climateRequirements.minTemp}°C</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExoticFruitManagement;


