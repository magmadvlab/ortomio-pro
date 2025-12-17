import React from 'react';
import { Info, Droplet, Wind, Sun } from 'lucide-react';
import { SoilType } from '@/types';

interface SoilTypeInfoProps {
  soilType: SoilType | '';
  onSelect?: (type: SoilType) => void;
}

const soilTypeDescriptions: Record<SoilType, { description: string; icon: React.ReactNode; color: string }> = {
  Loamy: {
    description: 'Ideale: buon drenaggio, ritenzione umidità ottimale, facile da lavorare. Adatto alla maggior parte delle piante.',
    icon: <Sun size={16} className="text-green-600" />,
    color: 'text-green-700 bg-green-50 border-green-200',
  },
  Sandy: {
    description: 'Drena velocemente, richiede più irrigazione. Ideale per piante che preferiscono terreno asciutto. Aggiungi materia organica per migliorare ritenzione.',
    icon: <Droplet size={16} className="text-yellow-600" />,
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  },
  Clay: {
    description: 'Ritiene molta acqua, può essere compatto. Migliora con sabbia e materia organica. Ideale per piante che amano umidità costante.',
    icon: <Droplet size={16} className="text-blue-600" />,
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  Peaty: {
    description: 'Ricco di materia organica, acido, trattiene molta umidità. Ideale per piante acidofile. Richiede drenaggio per evitare ristagni.',
    icon: <Wind size={16} className="text-purple-600" />,
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  Chalky: {
    description: 'Alcalino, drena bene ma può essere povero di nutrienti. Ideale per piante che preferiscono terreno alcalino. Aggiungi materia organica.',
    icon: <Sun size={16} className="text-orange-600" />,
    color: 'text-orange-700 bg-orange-50 border-orange-200',
  },
  Silty: {
    description: 'Fertile, trattiene umidità meglio della sabbia. Facile da lavorare. Ideale per la maggior parte delle coltivazioni.',
    icon: <Sun size={16} className="text-green-600" />,
    color: 'text-green-700 bg-green-50 border-green-200',
  },
};

const soilTypeNames: Record<SoilType, string> = {
  Loamy: 'Franco',
  Sandy: 'Sabbioso',
  Clay: 'Argilloso',
  Peaty: 'Torba',
  Chalky: 'Calcareo',
  Silty: 'Limoso',
};

const idealPhRanges: Record<SoilType, string> = {
  Loamy: '6.0 - 7.0 (neutro-leggermente acido)',
  Sandy: '5.5 - 7.0 (leggermente acido-neutro)',
  Clay: '6.0 - 7.5 (neutro-leggermente alcalino)',
  Peaty: '4.5 - 6.0 (acido)',
  Chalky: '7.0 - 8.5 (alcalino)',
  Silty: '6.0 - 7.0 (neutro-leggermente acido)',
};

export const SoilTypeInfo: React.FC<SoilTypeInfoProps> = ({ soilType, onSelect }) => {
  if (!soilType) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-3">
          Seleziona il tipo di terreno per vedere informazioni dettagliate:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(soilTypeDescriptions) as SoilType[]).map((type) => (
            <button
              key={type}
              onClick={() => onSelect?.(type)}
              className={`p-3 rounded-lg border-2 border-gray-200 hover:border-green-400 transition-colors text-left ${soilTypeDescriptions[type].color}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {soilTypeDescriptions[type].icon}
                <span className="font-semibold text-sm">{soilTypeNames[type]}</span>
              </div>
              <p className="text-xs opacity-90">{soilTypeDescriptions[type].description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const info = soilTypeDescriptions[soilType];

  return (
    <div className={`p-4 rounded-lg border-2 ${info.color}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {info.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            {soilTypeNames[soilType]}
            {onSelect && (
              <button
                onClick={() => onSelect('' as SoilType)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Cambia
              </button>
            )}
          </h4>
          <p className="text-xs mb-3">{info.description}</p>
          <div className="border-t border-current border-opacity-20 pt-2 mt-2">
            <p className="text-xs font-semibold mb-1">pH Ideale:</p>
            <p className="text-xs opacity-90">{idealPhRanges[soilType]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SoilTypeTooltip: React.FC<{ soilType: SoilType }> = ({ soilType }) => {
  const info = soilTypeDescriptions[soilType];
  return (
    <div className="max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        {info.icon}
        <span className="font-semibold text-sm">{soilTypeNames[soilType]}</span>
      </div>
      <p className="text-xs mb-2">{info.description}</p>
      <div className="border-t border-gray-200 pt-2">
        <p className="text-xs text-gray-600">
          <strong>pH Ideale:</strong> {idealPhRanges[soilType]}
        </p>
      </div>
    </div>
  );
};

