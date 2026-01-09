/**
 * Treatment Registry Component
 * Visualizza registro trattamenti (solo per PRO_PROFESSIONAL)
 */

import React, { useState, useEffect } from 'react';
import { Garden } from '../../types';
import {
  getTreatmentHistory,
  getActiveSafetyIntervals,
  exportRegistry,
} from '../../services/treatmentRegistryService';
import { TreatmentRecord } from '../../services/treatmentRegistryService';
import { Calendar, Download, AlertTriangle, CheckCircle } from 'lucide-react';

interface TreatmentRegistryProps {
  garden: Garden;
  userTier?: string;
}

const TreatmentRegistry: React.FC<TreatmentRegistryProps> = ({ garden, userTier }) => {
  const [records, setRecords] = useState<TreatmentRecord[]>([]);
  const [activeIntervals, setActiveIntervals] = useState<TreatmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlant, setFilterPlant] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  useEffect(() => {
    loadRegistry();
  }, [garden.id, filterPlant, dateRange]);

  const loadRegistry = async () => {
    setLoading(true);
    try {
      const history = await getTreatmentHistory(
        garden.id,
        filterPlant || undefined,
        dateRange.start && dateRange.end
          ? { start: new Date(dateRange.start), end: new Date(dateRange.end) }
          : undefined
      );
      setRecords(history);

      const intervals = await getActiveSafetyIntervals(garden.id);
      setActiveIntervals(intervals);
    } catch (error) {
      console.error('Error loading treatment registry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const data = await exportRegistry(garden.id, format);
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment_registry_${garden.id}.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting registry:', error);
    }
  };

  // Solo per PRO_PROFESSIONAL
  if (userTier !== 'PRO_PROFESSIONAL') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
        <p>Registro trattamenti disponibile solo per utenti PRO_PROFESSIONAL</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar size={20} />
          Registro Trattamenti
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Download size={14} />
            Esporta CSV
          </button>
        </div>
      </div>

      {/* Active Safety Intervals */}
      {activeIntervals.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-yellow-600" />
            <span className="font-semibold text-yellow-800">
              {activeIntervals.length} Trattamenti in Periodo Carenza
            </span>
          </div>
          <div className="space-y-2">
            {activeIntervals.map((record) => (
              <div key={record.id} className="text-sm text-yellow-700">
                {record.plantName} - {record.productName} - Fine carenza:{' '}
                {record.safetyIntervalEndDate.toLocaleDateString('it-IT')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Filtra per Pianta</label>
          <input
            type="text"
            value={filterPlant}
            onChange={(e) => setFilterPlant(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Es. Pomodoro"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Periodo</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Lista Trattamenti */}
      {records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar size={48} className="mx-auto mb-2 opacity-50" />
          <p>Nessun trattamento registrato</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {records.map((record) => {
            const isActive = activeIntervals.some((r) => r.id === record.id);
            return (
              <div
                key={record.id}
                className={`border rounded-lg p-4 ${
                  isActive ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-800">{record.plantName}</div>
                    <div className="text-sm text-gray-600">{record.productName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">
                      {record.treatmentDate.toLocaleDateString('it-IT')}
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 text-xs text-yellow-700 mt-1">
                        <AlertTriangle size={12} />
                        <span>Carenza attiva</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    <b>Dosaggio:</b> {record.dosage}
                  </div>
                  <div>
                    <b>Metodo:</b> {record.applicationMethod}
                  </div>
                  <div>
                    <b>Target:</b> {record.targetPestDisease}
                  </div>
                  <div>
                    <b>Fine carenza:</b> {record.safetyIntervalEndDate.toLocaleDateString('it-IT')}
                  </div>
                  {record.notes && (
                    <div>
                      <b>Note:</b> {record.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TreatmentRegistry;

