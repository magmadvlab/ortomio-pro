/**
 * Wizard per creare configurazione frutteto/oliveto/vigneto
 * Mostra scelta rapida di categorie e raccoglie informazioni base
 */

import React, { useState } from 'react';
import { Garden } from '../../types';
import { FruitTreeCategory, fruitTreeCategories, getCategoryInfo } from '../../types/orchardTypes';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { X, ArrowRight, ArrowLeft, TreePine, CircleDot, Grape, Calendar, Info } from 'lucide-react';

interface CreateOrchardWizardProps {
  garden: Garden;
  orchardType: 'orchard' | 'oliveGrove' | 'vineyard';
  onComplete: (config: any) => void;
  onCancel: () => void;
}

type WizardStep = 'category' | 'details';

export const CreateOrchardWizard: React.FC<CreateOrchardWizardProps> = ({
  garden,
  orchardType,
  onComplete,
  onCancel
}) => {
  const { storageProvider } = useStorage();
  const [step, setStep] = useState<WizardStep>('category');
  
  // Per frutteto
  const [fruitCategory, setFruitCategory] = useState<FruitTreeCategory | ''>('');
  
  // Per oliveto
  const [oliveType, setOliveType] = useState<'OIL' | 'TABLE' | 'DUAL_PURPOSE'>('OIL');
  
  // Per vigneto
  const [vineType, setVineType] = useState<'WINE' | 'TABLE'>('WINE');
  const [trainingSystem, setTrainingSystem] = useState<
    'Guyot' | 'Cordon' | 'Pergola' | 'Alberello' | 'Tendone' | 'Spalliera' | 'Sylvoz' | 'GDC' | 'Casarsa' | 'Bellussi'
  >('Guyot');
  
  // Comuni
  const [establishedDate, setEstablishedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [totalCount, setTotalCount] = useState('');
  const [varieties, setVarieties] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleComplete = async () => {
    setIsSaving(true);
    
    try {
      let config: any = {
        establishedDate: establishedDate || new Date().toISOString().split('T')[0],
        totalTrees: totalCount ? parseInt(totalCount) : undefined,
        varieties: varieties ? varieties.split(',').map(v => v.trim()).filter(Boolean) : undefined
      };
      
      if (orchardType === 'orchard') {
        if (!fruitCategory) {
          alert('Seleziona una categoria di frutteto');
          setIsSaving(false);
          return;
        }
        const categoryInfo = getCategoryInfo(fruitCategory);
        config.category = fruitCategory;
        config.profileId = categoryInfo?.profileId || `l3-${fruitCategory.toLowerCase()}-profile`;
      } else if (orchardType === 'oliveGrove') {
        config.type = oliveType;
      } else if (orchardType === 'vineyard') {
        config.type = vineType;
        config.trainingSystem = trainingSystem;
      }
      
      // Salva config nel garden
      const updates: Partial<Garden> = {};
      if (orchardType === 'orchard') {
        updates.orchardConfig = config;
      } else if (orchardType === 'oliveGrove') {
        updates.oliveGroveConfig = config;
      } else if (orchardType === 'vineyard') {
        updates.vineyardConfig = config;
      }
      
      await storageProvider.updateGarden(garden.id, updates);
      
      onComplete(config);
    } catch (error) {
      console.error('Error saving orchard config:', error);
      alert('Errore nel salvare la configurazione. Riprova.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const getTitle = () => {
    switch (orchardType) {
      case 'orchard': return 'Crea Frutteto';
      case 'oliveGrove': return 'Crea Oliveto';
      case 'vineyard': return 'Crea Vigneto';
    }
  };
  
  const getIcon = () => {
    switch (orchardType) {
      case 'orchard': return <TreePine className="text-green-600" size={32} />;
      case 'oliveGrove': return <CircleDot className="text-green-600" size={32} />;
      case 'vineyard': return <Grape className="text-green-600" size={32} />;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-2xl font-bold text-gray-900">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Selezione Categoria/Tipo */}
          {step === 'category' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Seleziona {orchardType === 'orchard' ? 'Categoria' : 'Tipo'}</h3>
              
              {orchardType === 'orchard' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {fruitTreeCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setFruitCategory(category.id)}
                      className={`p-6 border-2 rounded-lg text-left transition-all ${
                        fruitCategory === category.id
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <div className="font-semibold text-gray-900 mb-1">{category.label}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {category.examples.slice(0, 3).join(', ')}
                        {category.examples.length > 3 && '...'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Info size={12} />
                        <span>{category.botanicalFamily}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {orchardType === 'oliveGrove' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setOliveType('OIL')}
                    className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                      oliveType === 'OIL'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">🫒 Da Olio</div>
                    <div className="text-sm text-gray-600">Varietà per produzione olio</div>
                  </button>
                  <button
                    onClick={() => setOliveType('TABLE')}
                    className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                      oliveType === 'TABLE'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">🫒 Da Mensa</div>
                    <div className="text-sm text-gray-600">Varietà per consumo diretto</div>
                  </button>
                  <button
                    onClick={() => setOliveType('DUAL_PURPOSE')}
                    className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                      oliveType === 'DUAL_PURPOSE'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">🫒 Dual-Purpose</div>
                    <div className="text-sm text-gray-600">Varietà per olio e mensa</div>
                  </button>
                </div>
              )}
              
              {orchardType === 'vineyard' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Tipo Vigneto</h4>
                    <button
                      onClick={() => setVineType('WINE')}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                        vineType === 'WINE'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">🍷 Da Vino</div>
                      <div className="text-sm text-gray-600">Varietà per produzione vino</div>
                    </button>
                    <button
                      onClick={() => setVineType('TABLE')}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                        vineType === 'TABLE'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">🍇 Da Tavola</div>
                      <div className="text-sm text-gray-600">Varietà per consumo diretto</div>
                    </button>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Sistema di Allevamento</h4>
                    <select
                      value={trainingSystem}
                      onChange={(e) => setTrainingSystem(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <optgroup label="Sistemi Verticali a Spalliera">
                        <option value="Guyot">Guyot (capo a frutto rinnovato)</option>
                        <option value="Cordon">Cordone Speronato (cordone permanente)</option>
                        <option value="Spalliera">Spalliera (generico verticale)</option>
                      </optgroup>
                      <optgroup label="Sistemi Orizzontali">
                        <option value="Tendone">Tendone (tetto orizzontale)</option>
                        <option value="Pergola">Pergola (sviluppo orizzontale/inclinato)</option>
                      </optgroup>
                      <optgroup label="Sistemi Tradizionali">
                        <option value="Alberello">Alberello (senza sostegni)</option>
                      </optgroup>
                      <optgroup label="Sistemi Avanzati">
                        <option value="Sylvoz">Sylvoz/Cappuccina (tralcio ad arco)</option>
                        <option value="GDC">GDC - Geneva Double Curtain (doppia cortina)</option>
                        <option value="Casarsa">Casarsa (derivato Sylvoz, meccanizzabile)</option>
                        <option value="Bellussi">Bellussi/Raggi (sesti ampi)</option>
                      </optgroup>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      La scelta dipende da clima, tipo uva e livello di meccanizzazione desiderato
                    </p>
                  </div>
                </div>
              )}
              
              {/* Bottoni Navigazione */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Annulla
                </button>
                <button
                  onClick={() => setStep('details')}
                  disabled={
                    (orchardType === 'orchard' && !fruitCategory) ||
                    (orchardType === 'oliveGrove' && !oliveType) ||
                    (orchardType === 'vineyard' && !vineType)
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Avanti
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Dettagli */}
          {step === 'details' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Dettagli Configurazione</h3>
              
              {/* Data Impianto */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Data Impianto (opzionale)
                </label>
                <input
                  type="date"
                  value={establishedDate}
                  onChange={(e) => setEstablishedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Numero Totale Piante */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero Totale {orchardType === 'vineyard' ? 'Viti' : 'Alberi'} (opzionale)
                </label>
                <input
                  type="number"
                  value={totalCount}
                  onChange={(e) => setTotalCount(e.target.value)}
                  placeholder="Es. 20"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Varietà Presenti */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varietà Presenti (opzionale)
                </label>
                <textarea
                  value={varieties}
                  onChange={(e) => setVarieties(e.target.value)}
                  placeholder="Es. Golden Delicious, Fuji, Gala (separate da virgola)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Inserisci le varietà separate da virgola. Puoi aggiungerle anche successivamente.
                </p>
              </div>
              
              {/* Bottoni Navigazione */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep('category')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Indietro
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? 'Salvataggio...' : 'Crea'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

