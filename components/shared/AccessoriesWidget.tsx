import React, { useState, useEffect } from 'react';
import { Garden } from '@/types';
import { GardenAccessory } from '@/types/accessories';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Package, AlertTriangle } from 'lucide-react';

interface AccessoriesWidgetProps {
  garden: Garden;
  onOpenManagement?: () => void;
}

export const AccessoriesWidget: React.FC<AccessoriesWidgetProps> = ({
  garden,
  onOpenManagement
}) => {
  const { storageProvider } = useStorage();
  const [accessories, setAccessories] = useState<GardenAccessory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccessories();
  }, [garden.id]);

  const loadAccessories = async () => {
    try {
      const allAccessories = await storageProvider.getAccessories(garden.id);
      setAccessories(allAccessories);
    } catch (error) {
      console.error('Error loading accessories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center py-4 text-gray-500">Caricamento...</div>
      </div>
    );
  }

  const needsReplacement = accessories.filter(a => a.needsReplacement);
  const byCategory = {
    Support: accessories.filter(a => a.category === 'Support').length,
    Netting: accessories.filter(a => a.category === 'Netting').length,
    Wire: accessories.filter(a => a.category === 'Wire').length,
    Structure: accessories.filter(a => a.category === 'Structure').length,
  };
  const total = accessories.length;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-green-600" />
          <h3 className="text-lg font-bold text-gray-800">Accessori</h3>
        </div>
        {onOpenManagement && (
          <button
            onClick={onOpenManagement}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Gestisci
          </button>
        )}
      </div>

      {total === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nessun accessorio registrato
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{byCategory.Support}</div>
              <div className="text-xs text-gray-600">Supporti</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{byCategory.Netting}</div>
              <div className="text-xs text-gray-600">Reti</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{byCategory.Wire}</div>
              <div className="text-xs text-gray-600">Fili</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{byCategory.Structure}</div>
              <div className="text-xs text-gray-600">Strutture</div>
            </div>
          </div>

          {needsReplacement.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-sm text-red-800">
                {needsReplacement.length} da sostituire
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

