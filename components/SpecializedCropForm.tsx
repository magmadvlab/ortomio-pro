import React, { useState } from 'react';
import { Garden } from '../types';
import { PlantMasterSheet } from '../types';
import { TreePine, Package, Droplets, Wine, Sprout, Leaf, Grid } from 'lucide-react';

export type SpecializedCropType = 'FruitTree' | 'Strawberry' | 'Olive' | 'Vine' | 'ExoticFruit' | 'Aromatic' | 'Raspberry';

interface SpecializedCropFormProps {
  cropType: SpecializedCropType;
  masterSheet: PlantMasterSheet;
  garden: Garden;
  onSubmit: (data: {
    plantName: string;
    variety?: string;
    date: string;
    notes: string;
    taskType: string;
    additionalData?: any;
  }) => void;
  onCancel: () => void;
}

const SpecializedCropForm: React.FC<SpecializedCropFormProps> = ({
  cropType,
  masterSheet,
  garden,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<any>({
    plantName: masterSheet.commonName,
    variety: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    // Campi specifici per tipo
    ...getDefaultFieldsForType(cropType)
  });

  function getDefaultFieldsForType(type: SpecializedCropType): any {
    switch (type) {
      case 'FruitTree':
        return { treeAge: 1, rootstock: '' };
      case 'Strawberry':
        return { varietyType: 'June-bearing', plantingSystem: 'Matted Row' };
      case 'Olive':
        return { varietyType: 'Oil', harvestMethod: 'Manual' };
      case 'Vine':
        return { varietyType: 'Wine', trainingSystem: 'Guyot', brixTarget: 22 };
      case 'ExoticFruit':
        return { greenhouseRequired: false };
      case 'Aromatic':
        return { harvestType: 'Leaves', harvestTiming: 'BeforeFlowering', multiplicationMethod: 'Seed' };
      case 'Raspberry':
        return { varietyType: 'Summer-bearing', canesType: 'Floricane', trainingSystem: 'Trellis' };
      default:
        return {};
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const additionalData: any = {};
    
    // Aggiungi dati specifici per tipo
    switch (cropType) {
      case 'FruitTree':
        additionalData.fruitTreeData = {
          treeAge: formData.treeAge,
          rootstock: formData.rootstock || undefined
        };
        break;
      case 'Strawberry':
        additionalData.strawberryData = {
          varietyType: formData.varietyType,
          runnerAction: 'Remove'
        };
        break;
      case 'Olive':
        additionalData.oliveData = {
          varietyType: formData.varietyType,
          harvestMethod: formData.harvestMethod
        };
        break;
      case 'Vine':
        additionalData.vineData = {
          varietyType: formData.varietyType,
          trainingSystem: formData.trainingSystem,
          brixTarget: formData.brixTarget
        };
        break;
      case 'ExoticFruit':
        additionalData.exoticFruitData = {
          greenhouseRequired: formData.greenhouseRequired,
          fruitType: (masterSheet as any).fruitType || 'Tropical'
        };
        break;
      case 'Aromatic':
        additionalData.aromaticData = {
          harvestType: formData.harvestType,
          harvestTiming: formData.harvestTiming,
          multiplicationMethod: formData.multiplicationMethod
        };
        break;
      case 'Raspberry':
        additionalData.raspberryData = {
          varietyType: formData.varietyType,
          canesType: formData.canesType,
          trainingSystem: formData.trainingSystem,
          supportInstalled: formData.trainingSystem === 'Trellis'
        };
        break;
    }

    onSubmit({
      plantName: formData.plantName,
      variety: formData.variety,
      date: formData.date,
      notes: formData.notes || `Coltura specializzata: ${cropType}`,
      taskType: cropType === 'FruitTree' ? 'Transplant' : 'Sowing',
      additionalData
    });
  };

  const renderFieldsForType = () => {
    switch (cropType) {
      case 'FruitTree':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Età Albero (anni)
              </label>
              <input
                type="number"
                min="1"
                value={formData.treeAge || 1}
                onChange={(e) => setFormData({ ...formData, treeAge: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portinnesto (opzionale)
              </label>
              <input
                type="text"
                value={formData.rootstock || ''}
                onChange={(e) => setFormData({ ...formData, rootstock: e.target.value })}
                placeholder="Es. M9, M26"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </>
        );
      
      case 'Strawberry':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Varietà
              </label>
              <select
                value={formData.varietyType}
                onChange={(e) => setFormData({ ...formData, varietyType: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="June-bearing">June-bearing (produzione concentrata)</option>
                <option value="Ever-bearing">Ever-bearing (produzione continua)</option>
                <option value="Day-neutral">Day-neutral (produzione indipendente)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sistema Impianto
              </label>
              <select
                value={formData.plantingSystem}
                onChange={(e) => setFormData({ ...formData, plantingSystem: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="Matted Row">Matted Row</option>
                <option value="Spaced Row">Spaced Row</option>
                <option value="Hill System">Hill System</option>
              </select>
            </div>
          </>
        );
      
      case 'Olive':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Varietà
              </label>
              <select
                value={formData.varietyType}
                onChange={(e) => setFormData({ ...formData, varietyType: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Oil">Da Olio</option>
                <option value="Table">Da Tavola</option>
                <option value="Dual-purpose">Dual-purpose</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metodo Raccolta
              </label>
              <select
                value={formData.harvestMethod}
                onChange={(e) => setFormData({ ...formData, harvestMethod: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Manual">Manuale</option>
                <option value="Mechanical">Meccanico</option>
                <option value="Shaking">Scuotitura</option>
              </select>
            </div>
          </>
        );
      
      case 'Vine':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Varietà
              </label>
              <select
                value={formData.varietyType}
                onChange={(e) => setFormData({ ...formData, varietyType: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Wine">Da Vino</option>
                <option value="Table">Da Tavola</option>
                <option value="Raisin">Per Uva Passa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sistema Allevamento
              </label>
              <select
                value={formData.trainingSystem}
                onChange={(e) => setFormData({ ...formData, trainingSystem: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Guyot">Guyot</option>
                <option value="Cordon">Cordon</option>
                <option value="Pergola">Pergola</option>
                <option value="Alberello">Alberello</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brix Target (gradi zuccherini per vendemmia)
              </label>
              <input
                type="number"
                min="18"
                max="26"
                value={formData.brixTarget || 22}
                onChange={(e) => setFormData({ ...formData, brixTarget: parseInt(e.target.value) || 22 })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </>
        );
      
      case 'ExoticFruit':
        return (
          <>
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.greenhouseRequired}
                  onChange={(e) => setFormData({ ...formData, greenhouseRequired: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Serra Richiesta</span>
              </label>
            </div>
            {(masterSheet as any).italianClimateNotes && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">{(masterSheet as any).italianClimateNotes}</p>
              </div>
            )}
          </>
        );
      
      case 'Aromatic':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parte Raccolta
              </label>
              <select
                value={formData.harvestType}
                onChange={(e) => setFormData({ ...formData, harvestType: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Leaves">Foglie</option>
                <option value="Flowers">Fiori</option>
                <option value="Stems">Steli</option>
                <option value="Roots">Radici</option>
                <option value="Seeds">Semi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timing Raccolta
              </label>
              <select
                value={formData.harvestTiming}
                onChange={(e) => setFormData({ ...formData, harvestTiming: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="BeforeFlowering">Prima della fioritura</option>
                <option value="DuringFlowering">Durante la fioritura</option>
                <option value="AfterFlowering">Dopo la fioritura</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metodo Moltiplicazione
              </label>
              <select
                value={formData.multiplicationMethod}
                onChange={(e) => setFormData({ ...formData, multiplicationMethod: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Seed">Seme</option>
                <option value="Cutting">Talea</option>
                <option value="Division">Divisione</option>
                <option value="Layering">Propagazione</option>
              </select>
            </div>
          </>
        );
      
      case 'Raspberry':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Varietà
              </label>
              <select
                value={formData.varietyType}
                onChange={(e) => setFormData({ ...formData, varietyType: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Summer-bearing">Summer-bearing (Estiva)</option>
                <option value="Ever-bearing">Ever-bearing (Rifiorente)</option>
                <option value="Fall-bearing">Fall-bearing (Autunnale)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Canne
              </label>
              <select
                value={formData.canesType}
                onChange={(e) => setFormData({ ...formData, canesType: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Floricane">Floricane (canne dell'anno precedente)</option>
                <option value="Primocane">Primocane (canne dell'anno)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sistema Allevamento
              </label>
              <select
                value={formData.trainingSystem}
                onChange={(e) => setFormData({ ...formData, trainingSystem: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Trellis">Trelis</option>
                <option value="Free-standing">Libero</option>
              </select>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (cropType) {
      case 'FruitTree': return <TreePine className="text-green-500" size={24} />;
      case 'Strawberry': return <Package className="text-red-500" size={24} />;
      case 'Olive': return <Droplets className="text-green-700" size={24} />;
      case 'Vine': return <Wine className="text-purple-700" size={24} />;
      case 'ExoticFruit': return <Sprout className="text-orange-500" size={24} />;
      case 'Aromatic': return <Leaf className="text-green-500" size={24} />;
      case 'Raspberry': return <Grid className="text-purple-500" size={24} />;
      default: return null;
    }
  };

  const isTraditional = cropType === 'Olive' || cropType === 'Vine';

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex items-center gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              Aggiungi {masterSheet.commonName}
            </h3>
            {isTraditional && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                TRADIZIONALE
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campi Comuni */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Pianta
          </label>
          <input
            type="text"
            value={formData.plantName}
            onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Varietà (opzionale)
          </label>
          <input
            type="text"
            value={formData.variety}
            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Impianto
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Campi Specifici per Tipo */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Dettagli Specifici</h4>
          <div className="space-y-4">
            {renderFieldsForType()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (opzionale)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Aggiungi
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpecializedCropForm;



