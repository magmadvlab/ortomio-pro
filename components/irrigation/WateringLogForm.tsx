'use client'

import React, { useState } from 'react';
import { IrrigationZone, WateringLog } from '@/types/irrigation';
import { createWateringLog, calculateLitersApplied } from '@/services/irrigationService';
import { X, Save, Droplets, Clock } from 'lucide-react';

interface WateringLogFormProps {
  zone: IrrigationZone;
  onComplete: (log: WateringLog) => void;
  onCancel: () => void;
}

export const WateringLogForm: React.FC<WateringLogFormProps> = ({
  zone,
  onComplete,
  onCancel
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [method, setMethod] = useState<'Manual' | 'Automatic' | 'Timer'>('Manual');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [wasInterrupted, setWasInterrupted] = useState(false);
  const [actualDurationMinutes, setActualDurationMinutes] = useState<number>(0);

  const finalDuration = wasInterrupted && actualDurationMinutes > 0 
    ? actualDurationMinutes 
    : durationMinutes;
  const litersApplied = calculateLitersApplied(finalDuration, zone.flowRateLph);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (finalDuration <= 0) {
      alert('Inserisci una durata valida');
      return;
    }

    if (wasInterrupted && actualDurationMinutes <= 0) {
      alert('Se l\'irrigazione è stata interrotta, inserisci i minuti effettivi');
      return;
    }

    const log = createWateringLog(
      zone.id,
      finalDuration,
      zone.flowRateLph,
      method,
      zone.valveId,
      notes || undefined
    );
    
    // Override date se diversa da oggi
    if (date !== new Date().toISOString().split('T')[0]) {
      log.date = date;
    }
    
    onComplete(log);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold">Registra Irrigazione</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Zona</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold">{zone.name}</p>
              <p className="text-sm text-gray-600">{zone.flowRateLph} L/h</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Durata (minuti) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Es. 20"
            />
            {durationMinutes > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Litri applicati: <strong>{litersApplied.toFixed(1)} L</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Metodo</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Manual">Manuale</option>
              <option value="Automatic">Automatico (SmartHub)</option>
              <option value="Timer">Timer/Programmatore</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={wasInterrupted}
                onChange={(e) => {
                  setWasInterrupted(e.target.checked);
                  if (!e.target.checked) {
                    setActualDurationMinutes(0);
                  }
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span>Irrigazione interrotta</span>
            </label>
            {wasInterrupted && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-2">
                  Minuti effettivi <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={actualDurationMinutes}
                  onChange={(e) => setActualDurationMinutes(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  placeholder="Es. 12"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minuti effettivi di irrigazione (se interrotta prima del previsto)
                </p>
                {actualDurationMinutes > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Litri applicati: <strong>{calculateLitersApplied(actualDurationMinutes, zone.flowRateLph).toFixed(1)} L</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Note (opzionale)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note sull'irrigazione..."
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

