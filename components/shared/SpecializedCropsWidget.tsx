import React, { useState } from 'react';
import { Garden, GardenTask } from '@/types';
import { getMasterSheet } from '@/services/plantMasterService';
import { TreePine, Package, Droplets, Wine, Sprout, Leaf, Grid, ChevronRight } from 'lucide-react';

interface SpecializedCropsWidgetProps {
  garden: Garden;
  tasks: GardenTask[];
  onOpenManagement: (cropType: string) => void;
}

interface CropCount {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

const SpecializedCropsWidget: React.FC<SpecializedCropsWidgetProps> = ({
  garden,
  tasks,
  onOpenManagement
}) => {
  const [expanded, setExpanded] = useState(false);

  // Raggruppa task per tipo coltura specializzata
  const cropCounts: CropCount[] = [
    {
      type: 'FruitTree',
      label: 'Alberi da Frutto',
      icon: <TreePine size={20} />,
      color: 'green',
      count: 0
    },
    {
      type: 'Strawberry',
      label: 'Fragole',
      icon: <Package size={20} />,
      color: 'red',
      count: 0
    },
    {
      type: 'Olive',
      label: 'Olive',
      icon: <Droplets size={20} />,
      color: 'green',
      count: 0
    },
    {
      type: 'Vine',
      label: 'Vite',
      icon: <Wine size={20} />,
      color: 'purple',
      count: 0
    },
    {
      type: 'ExoticFruit',
      label: 'Frutti Esotici',
      icon: <Sprout size={20} />,
      color: 'orange',
      count: 0
    },
    {
      type: 'Aromatic',
      label: 'Erbe Aromatiche',
      icon: <Leaf size={20} />,
      color: 'green',
      count: 0
    },
    {
      type: 'Raspberry',
      label: 'Lamponi',
      icon: <Grid size={20} />,
      color: 'purple',
      count: 0
    }
  ];

  // Conta task per tipo
  tasks.forEach(task => {
    const master = getMasterSheet(task.plantName);
    if (master?.cropType) {
      const cropCount = cropCounts.find(c => c.type === master.cropType);
      if (cropCount) {
        cropCount.count++;
      }
      // Aromatic può essere anche 'Medicinal'
      if (master.cropType === 'Medicinal') {
        const aromaticCount = cropCounts.find(c => c.type === 'Aromatic');
        if (aromaticCount) {
          aromaticCount.count++;
        }
      }
    }
  });

  // Filtra solo colture presenti
  const activeCrops = cropCounts.filter(c => c.count > 0);
  const totalCount = activeCrops.reduce((sum, c) => sum + c.count, 0);

  if (totalCount === 0) {
    return null; // Non mostrare widget se non ci sono colture specializzate
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' }
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-purple-100 flex items-center justify-center">
            <Grid size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Colture Specializzate</h3>
            <p className="text-xs text-gray-600">{totalCount} colture attive</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronRight 
            size={20} 
            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="space-y-2 mt-4">
          {activeCrops.map((crop) => {
            const colorClasses = getColorClasses(crop.color);
            return (
              <button
                key={crop.type}
                onClick={() => onOpenManagement(crop.type)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border ${colorClasses.bg} ${colorClasses.border} hover:shadow-md transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={colorClasses.text}>
                    {crop.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">{crop.label}</div>
                    <div className="text-xs text-gray-600">{crop.count} {crop.count === 1 ? 'coltura' : 'colture'}</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            );
          })}
        </div>
      )}

      {!expanded && (
        <div className="flex flex-wrap gap-2 mt-3">
          {activeCrops.slice(0, 4).map((crop) => {
            const colorClasses = getColorClasses(crop.color);
            return (
              <div
                key={crop.type}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colorClasses.bg} ${colorClasses.border} border text-xs`}
              >
                <div className={colorClasses.text}>
                  {crop.icon}
                </div>
                <span className="font-medium text-gray-700">{crop.label}</span>
                <span className="text-gray-500">({crop.count})</span>
              </div>
            );
          })}
          {activeCrops.length > 4 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600">
              +{activeCrops.length - 4} altre
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SpecializedCropsWidget };
export default SpecializedCropsWidget;

