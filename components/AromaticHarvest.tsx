import React, { useState } from 'react';
import { HarvestLogData } from '../types';
import { AromaticHarvest as AromaticHarvestData } from '../types/aromatic';
import { Leaf, Flower2, Scissors, Droplets } from 'lucide-react';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';

interface AromaticHarvestProps {
  harvestData: Partial<AromaticHarvestData>;
  onUpdate: (data: Partial<AromaticHarvestData>) => void;
}

const AromaticHarvest: React.FC<AromaticHarvestProps> = ({ harvestData, onUpdate }) => {
  const { can } = useTier();
  const [showDrying, setShowDrying] = useState(false);

  // Protezione Pro: Colture specializzate sono feature Pro
  if (!can('specializedCrops')) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
        <UpgradePrompt
          feature="Gestione Erbe Aromatiche e Medicinali"
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Raccolta Erbe */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-3">
          <Leaf className="text-green-600" size={18} />
          Raccolta Erbe Aromatiche
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Parte Raccolta
            </label>
            <select
              value={harvestData.harvestPart || 'Leaves'}
              onChange={(e) => onUpdate({ harvestPart: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="Leaves">Foglie</option>
              <option value="Flowers">Fiori</option>
              <option value="Stems">Steli</option>
              <option value="Roots">Radici</option>
              <option value="Seeds">Semi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Timing Raccolta
            </label>
            <select
              value={(harvestData as any).harvestTiming || 'BeforeFlowering'}
              onChange={(e) => onUpdate({ harvestTiming: e.target.value as any } as any)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="BeforeFlowering">Prima della Fioritura (massimo aroma)</option>
              <option value="DuringFlowering">Durante la Fioritura</option>
              <option value="AfterFlowering">Dopo la Fioritura</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quantità Raccolta (kg fresco)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={(harvestData as any).quantity ?? ''}
              onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) || 0 } as any)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Essiccazione */}
      <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-3">
            <Droplets className="text-blue-600" size={18} />
            Essiccazione
          </h4>
        </div>

        <label className="flex items-center gap-3 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={harvestData.requiresDrying || false}
            onChange={(e) => {
              onUpdate({ requiresDrying: e.target.checked });
              if (e.target.checked) setShowDrying(true);
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Richiede essiccazione</span>
        </label>

        {harvestData.requiresDrying && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Metodo Essiccazione
              </label>
              <select
                value={harvestData.dryingMethod || 'Air'}
                onChange={(e) => onUpdate({ dryingMethod: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Air">Aria (naturale)</option>
                <option value="Dehydrator">Essiccatore</option>
                <option value="Oven">Forno (bassa temperatura)</option>
              </select>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Consigli Essiccazione:</strong>
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Raccogli in mazzetti e appendi a testa in giù</li>
                <li>• Mantieni in ambiente buio, asciutto e areato</li>
                <li>• Tempo stimato: 7-14 giorni (dipende da umidità)</li>
                <li>• Verifica secco quando le foglie si sbriciolano facilmente</li>
                <li>• Conserva in contenitori ermetici al buio</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Oli Essenziali (opzionale) */}
      {harvestData.harvestPart === 'Leaves' || harvestData.harvestPart === 'Flowers' ? (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-3">
            <Droplets className="text-purple-600" size={18} />
            Estrazione Oli Essenziali (Opzionale)
          </h4>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Olio Essenziale Estratto (ml)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={harvestData.essentialOilExtracted || ''}
              onChange={(e) => onUpdate({ essentialOilExtracted: parseFloat(e.target.value) || 0 })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="0.0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Rendimento tipico: 0.5-2 ml per kg di materiale fresco
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AromaticHarvest;

