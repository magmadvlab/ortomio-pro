'use client'

import React, { useState } from 'react';
import { Garden, GrowingLocation } from '../types';
import { X, ArrowRight, Calendar, Sprout, Sun, Snowflake } from 'lucide-react';
import { findSeedsForPlant } from '@/services/seedInventoryService';
import { SeedPacket } from '../types';

interface PlantingWizardProps {
  plantName: string;
  plantNotes?: string;
  variety?: string;
  garden: Garden;
  onComplete: (data: {
    plantName: string;
    variety?: string;
    method: 'Seed' | 'Seedling' | 'Sapling';
    season: 'Summer' | 'Winter';
    locationType: GrowingLocation;
    date: string;
    quantity: number;
    notes?: string;
    selectedSeedPacketId?: string;
    taskType: 'Sowing' | 'Transplant';
  }) => void;
  onCancel: () => void;
}

const PlantingWizard: React.FC<PlantingWizardProps> = ({
  plantName,
  plantNotes,
  variety: initialVariety,
  garden,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'Seed' | 'Seedling' | 'Sapling'>('Seed');
  const [season, setSeason] = useState<'Summer' | 'Winter'>('Summer');
  const [locationType, setLocationType] = useState<GrowingLocation>('Ground');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState(1);
  const [variety, setVariety] = useState(initialVariety || '');
  const [selectedSeedPacketId, setSelectedSeedPacketId] = useState<string | undefined>(undefined);
  
  // Trova semi disponibili
  const availableSeeds = findSeedsForPlant(garden.id, plantName.toUpperCase(), variety);
  
  // Auto-detect season from date
  const detectSeason = (dateStr: string): 'Summer' | 'Winter' => {
    const month = new Date(dateStr).getMonth() + 1;
    return (month >= 4 && month <= 9) ? 'Summer' : 'Winter';
  };

  // Update season when date changes
  React.useEffect(() => {
    const detected = detectSeason(date);
    setSeason(detected);
  }, [date]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const taskType = method === 'Seed' ? 'Sowing' : 'Transplant';
    
    onComplete({
      plantName,
      variety: variety || undefined,
      method,
      season,
      locationType,
      date,
      quantity,
      notes: plantNotes,
      selectedSeedPacketId,
      taskType
    });
  };

  const getLocationOptions = (): GrowingLocation[] => {
    if (method === 'Sapling') {
      return ['Ground', 'Pot'];
    }
    
    if (method === 'Seed') {
      if (season === 'Summer') {
        return ['Ground', 'Tray', 'Pot', 'RaisedBed'];
      } else {
        return ['Tray', 'Pot', 'RaisedBed'];
      }
    }
    
    // Seedling
    if (season === 'Summer') {
      return ['Pot', 'RaisedBed', 'Ground'];
    } else {
      return ['Pot', 'RaisedBed'];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-green-800">
            Aggiungi {plantName} al Diario
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      step >= s
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {s === 1 && 'Metodo'}
                    {s === 2 && 'Stagione'}
                    {s === 3 && 'Posizione'}
                    {s === 4 && 'Dettagli'}
                  </span>
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Metodo */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Come vuoi partire?</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setMethod('Seed')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    method === 'Seed'
                      ? 'bg-orange-50 border-orange-300 text-orange-800'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🌰</div>
                  <div className="font-bold text-sm">Dal Seme</div>
                </button>
                <button
                  onClick={() => setMethod('Seedling')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    method === 'Seedling'
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🌱</div>
                  <div className="font-bold text-sm">Da Piantina</div>
                </button>
                <button
                  onClick={() => setMethod('Sapling')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    method === 'Sapling'
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🌳</div>
                  <div className="font-bold text-sm">Da Alberello</div>
                </button>
              </div>
              
              {method === 'Sapling' && (
                <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                  💡 Ideale per: Frutteti, Uliveti, Vigneti, Alberi da frutto esotici
                </p>
              )}

              {/* Seed Selection if method is Seed */}
              {method === 'Seed' && availableSeeds.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semi disponibili dalla Banca:
                  </label>
                  <select
                    value={selectedSeedPacketId || ''}
                    onChange={(e) => setSelectedSeedPacketId(e.target.value || undefined)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Non usare semi dalla banca</option>
                    {availableSeeds.map((seed) => (
                      <option key={seed.id} value={seed.id}>
                        {seed.varietyName} ({seed.quantityRemaining === 'High' ? 'Alta' : seed.quantityRemaining === 'Medium' ? 'Media' : 'Bassa'} disponibilità)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Stagione */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Per quale orto?</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSeason('Summer')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    season === 'Summer'
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Sun size={32} className="mx-auto mb-2" />
                  <div className="font-bold">Orto Estivo</div>
                  <div className="text-xs mt-1">Aprile - Settembre</div>
                </button>
                <button
                  onClick={() => setSeason('Winter')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    season === 'Winter'
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Snowflake size={32} className="mx-auto mb-2" />
                  <div className="font-bold">Orto Invernale</div>
                  <div className="text-xs mt-1">Ottobre - Marzo</div>
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Stagione auto-rilevata dalla data: <strong>{season === 'Summer' ? 'Estivo' : 'Invernale'}</strong>
              </p>
            </div>
          )}

          {/* Step 3: Posizione */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Dove piantare?</h3>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as GrowingLocation)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-green-500 focus:ring-0 outline-none"
              >
                {method === 'Sapling' ? (
                  <>
                    <option value="Ground">Piena Terra (per frutteti/uliveti/vigneti)</option>
                    <option value="Pot">Vaso (per alberelli esotici)</option>
                  </>
                ) : season === 'Summer' && method === 'Seed' && locationType !== 'Tray' ? (
                  <>
                    <option value="Ground">Piena Terra</option>
                    <option value="Tray">📦 Vassoio per Semina</option>
                    <option value="Pot">Vaso</option>
                    <option value="RaisedBed">Letto/Cassone</option>
                  </>
                ) : method === 'Seed' ? (
                  <>
                    <option value="Tray">📦 Vassoio per Semina</option>
                    <option value="Pot">Vaso (posizione finale al trapianto)</option>
                    <option value="RaisedBed">Letto/Cassone (posizione finale al trapianto)</option>
                  </>
                ) : (
                  <>
                    <option value="Pot">Vaso</option>
                    <option value="RaisedBed">Letto/Cassone</option>
                    {season === 'Summer' && <option value="Ground">Piena Terra</option>}
                  </>
                )}
              </select>
              
              {method === 'Seed' && locationType === 'Tray' && (
                <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                  💡 I semi verranno seminati nel vassoio. Dovrai trapiantarli quando avranno 2-3 foglie vere.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Dettagli */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Dettagli finali</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data semina/trapianto
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varietà (opzionale)
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="Es. Cayenna, Datterino, etc."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantità
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                />
              </div>

              {/* Riepilogo */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                <h4 className="font-bold text-green-800 mb-2">Riepilogo:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>Pianta:</strong> {plantName} {variety && `(${variety})`}</li>
                  <li>• <strong>Metodo:</strong> {
                    method === 'Seed' ? 'Dal Seme' :
                    method === 'Seedling' ? 'Da Piantina' : 'Da Alberello'
                  }</li>
                  <li>• <strong>Stagione:</strong> {season === 'Summer' ? 'Estivo' : 'Invernale'}</li>
                  <li>• <strong>Posizione:</strong> {
                    locationType === 'Ground' ? 'Piena Terra' :
                    locationType === 'Tray' ? 'Vassoio per Semina' :
                    locationType === 'Pot' ? 'Vaso' :
                    locationType === 'RaisedBed' ? 'Letto/Cassone' : locationType
                  }</li>
                  <li>• <strong>Data:</strong> {new Date(date).toLocaleDateString('it-IT')}</li>
                  <li>• <strong>Quantità:</strong> {quantity}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Indietro
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            {step === 4 ? 'Aggiungi al Diario' : 'Avanti'}
            {step < 4 && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantingWizard;


