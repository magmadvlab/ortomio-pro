import React from 'react';
import { Garden, GardenTask } from '@/types';
import { getMasterSheetSync } from '@/services/plantMasterService';
import { Droplets, Wine, ChevronRight } from 'lucide-react';

interface TraditionalCropsWidgetProps {
  garden: Garden;
  tasks: GardenTask[];
  onOpenManagement: (cropType: string) => void;
}

const TraditionalCropsWidget: React.FC<TraditionalCropsWidgetProps> = ({
  garden,
  tasks,
  onOpenManagement
}) => {
  // Conta Olive e Vite
  let oliveCount = 0;
  let vineCount = 0;

  tasks.forEach(task => {
    const master = getMasterSheetSync(task.plantName);
    if (master?.cropType === 'Olive') {
      oliveCount++;
    } else if (master?.cropType === 'Vine') {
      vineCount++;
    }
  });

  // Non mostrare widget se non ci sono olive o viti
  if (oliveCount === 0 && vineCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-purple-50 rounded-2xl shadow-sm border-2 border-green-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-purple-600 flex items-center justify-center">
            <Droplets size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Colture Tradizionali Italiane</h3>
            <p className="text-xs text-gray-600">Gestisci olio e vino</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {oliveCount > 0 && (
          <button
            onClick={() => onOpenManagement('Olive')}
            className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-green-300 bg-green-50 hover:bg-green-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-green-700">
                <Droplets size={24} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-gray-900">Olive</div>
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                    ITALIANO
                  </span>
                </div>
                <div className="text-sm text-gray-600">{oliveCount} {oliveCount === 1 ? 'ulivo attivo' : 'ulivi attivi'}</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        )}

        {vineCount > 0 && (
          <button
            onClick={() => onOpenManagement('Vine')}
            className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-purple-300 bg-purple-50 hover:bg-purple-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-purple-700">
                <Wine size={24} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-gray-900">Vite</div>
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                    ITALIANO
                  </span>
                </div>
                <div className="text-sm text-gray-600">{vineCount} {vineCount === 1 ? 'vite attiva' : 'viti attive'}</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        )}
      </div>

      {(oliveCount === 0 || vineCount === 0) && (
        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            {oliveCount === 0 && vineCount === 0 
              ? 'Aggiungi ulivi o viti per gestire la produzione di olio e vino'
              : oliveCount === 0
              ? 'Aggiungi ulivi per gestire la produzione di olio'
              : 'Aggiungi viti per gestire la produzione di vino'}
          </p>
        </div>
      )}
    </div>
  );
};

export { TraditionalCropsWidget };
export default TraditionalCropsWidget;

