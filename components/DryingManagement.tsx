import React, { useState, useEffect } from 'react';
import { DryingRecord } from '../types/aromatic';
import { calculateDryingTime, isDryingComplete } from '../logic/aromaticEngine';
import { Calendar, Droplets, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface DryingManagementProps {
  dryingRecords: DryingRecord[];
  onUpdateRecord: (id: string, updates: Partial<DryingRecord>) => void;
  onCompleteDrying: (id: string) => void;
}

const DryingManagement: React.FC<DryingManagementProps> = ({
  dryingRecords,
  onUpdateRecord,
  onCompleteDrying
}) => {
  const [currentHumidity, setCurrentHumidity] = useState<number>(50);
  const [currentTemperature, setCurrentTemperature] = useState<number>(20);

  const activeDryings = dryingRecords.filter(r => !r.dryingEndDate);
  const completedDryings = dryingRecords.filter(r => r.dryingEndDate);

  const calculateProgress = (record: DryingRecord): number => {
    if (record.dryingEndDate) return 100;
    
    const startDate = new Date(record.dryingStartDate);
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const estimatedDays = calculateDryingTime(
      record.dryingMethod,
      currentHumidity,
      currentTemperature
    );
    
    return Math.min((daysElapsed / estimatedDays) * 100, 95);
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Droplets className="text-blue-500" size={24} />
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Essiccazione</h3>
      </div>

      {/* Controlli Ambiente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Umidità Relativa (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={currentHumidity}
            onChange={(e) => setCurrentHumidity(parseInt(e.target.value) || 50)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Temperatura (°C)
          </label>
          <input
            type="number"
            min="0"
            max="40"
            value={currentTemperature}
            onChange={(e) => setCurrentTemperature(parseInt(e.target.value) || 20)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Essiccazioni in Corso */}
      {activeDryings.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
            <Clock className="text-blue-500" size={20} />
            Essiccazioni in Corso
          </h4>
          <div className="space-y-4">
            {activeDryings.map(record => {
              const progress = calculateProgress(record);
              const startDate = new Date(record.dryingStartDate);
              const daysElapsed = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const estimatedDays = calculateDryingTime(record.dryingMethod, currentHumidity, currentTemperature);
              const daysRemaining = Math.max(0, estimatedDays - daysElapsed);

              return (
                <div key={record.id} className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">
                        {record.aromaticCropId} - {record.dryingMethod}
                      </div>
                      <div className="text-sm text-gray-600">
                        Iniziato: {startDate.toLocaleDateString('it-IT')} ({daysElapsed} giorni fa)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">
                        {daysRemaining} giorni rimanenti
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Progresso</span>
                      <span className="text-xs font-semibold text-blue-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Controllo Peso */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Peso Iniziale (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={record.initialWeight}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Peso Attuale (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={record.finalWeight || ''}
                        onChange={(e) => {
                          const weight = parseFloat(e.target.value) || 0;
                          onUpdateRecord(record.id, { finalWeight: weight });
                          
                          // Verifica se essiccazione completa
                          if (weight > 0 && isDryingComplete(record.initialWeight, weight)) {
                            const moistureContent = ((record.initialWeight - weight) / record.initialWeight) * 100;
                            onUpdateRecord(record.id, {
                              dryingEndDate: new Date().toISOString().split('T')[0],
                              moistureContent: 100 - moistureContent
                            });
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Inserisci peso"
                      />
                    </div>
                  </div>

                  {/* Verifica Completamento */}
                  {record.finalWeight && record.finalWeight > 0 && (
                    <div className="mt-3">
                      {isDryingComplete(record.initialWeight, record.finalWeight) ? (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-600" size={18} />
                            <span className="text-sm font-semibold text-green-800">Essiccazione Completa!</span>
                          </div>
                          <button
                            onClick={() => onCompleteDrying(record.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                          >
                            Conferma
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-full max-w-sm">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="text-yellow-full max-w-sm" size={18} />
                            <span className="text-sm text-yellow-full max-w-sm">Ancora in essiccazione</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Storico Essiccazioni */}
      {completedDryings.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            Essiccazioni Completate
          </h4>
          <div className="space-y-2">
            {completedDryings.map(record => {
              const weightLoss = record.initialWeight - (record.finalWeight || 0);
              const weightLossPercent = (weightLoss / record.initialWeight) * 100;

              return (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {record.aromaticCropId} - {record.dryingMethod}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(record.dryingStartDate).toLocaleDateString('it-IT')} →{' '}
                        {record.dryingEndDate && new Date(record.dryingEndDate).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">
                        {record.initialWeight.toFixed(2)}kg → {(record.finalWeight || 0).toFixed(2)}kg
                      </div>
                      <div className="text-xs text-gray-600">
                        -{weightLossPercent.toFixed(1)}% peso
                      </div>
                    </div>
                  </div>
                  {record.qualityRating && (
                    <div className="mt-2 text-xs text-gray-600">
                      Qualità: {record.qualityRating}/5
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeDryings.length === 0 && completedDryings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Droplets className="mx-auto mb-3 text-gray-400" size={48} />
          <p>Nessuna essiccazione in corso o completata.</p>
        </div>
      )}
    </div>
  );
};

export default DryingManagement;

