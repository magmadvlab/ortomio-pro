/**
 * Wizard per creare configurazione frutteto/oliveto/vigneto
 * Mostra scelta rapida di categorie e raccoglie informazioni base
 */

import React, { useState } from 'react';
import { Garden } from '../../types';
import { FruitTreeCategory, fruitTreeCategories, getCategoryInfo } from '../../types/orchardTypes';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { X, ArrowRight, ArrowLeft, TreePine, CircleDot, Grape, Calendar, Info, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { getCategoryTips, getCategoryRecommendations } from '../../data/orchardCategoryTips';
import { generateOrchardTasks, getTasksSummary } from '../../data/orchardTaskTemplates';
import { orchardService } from '../../services/orchardService';
import { vineyardService } from '../../services/vineyardService';

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

  // Campi condivisi tra tutte le colture arboree
  const [plantingSystem, setPlantingSystem] = useState<'TRADITIONAL' | 'INTENSIVE' | 'SUPER_INTENSIVE'>('INTENSIVE');
  const [surfaceHa, setSurfaceHa] = useState('');
  const [plantSpacing, setPlantSpacing] = useState('');
  const [rowSpacing, setRowSpacing] = useState('');
  const [irrigationSystem, setIrrigationSystem] = useState<'DRIP' | 'SPRINKLER' | 'MICRO' | 'MANUAL'>('DRIP');
  const [soilType, setSoilType] = useState<'SANDY' | 'CLAY' | 'LOAM' | 'ROCKY' | 'MIXED'>('LOAM');
  const [soilPh, setSoilPh] = useState('');

  // Comuni
  const [establishedDate, setEstablishedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [totalCount, setTotalCount] = useState('');
  const [varieties, setVarieties] = useState('');
  const [generateTasks, setGenerateTasks] = useState(true); // Default: genera task automaticamente
  const [isSaving, setIsSaving] = useState(false);

  const handleComplete = async () => {
    setIsSaving(true);

    try {
      const config: any = {
        establishedDate: establishedDate || new Date().toISOString().split('T')[0],
        totalTrees: totalCount ? parseInt(totalCount) : undefined,
        varieties: varieties ? varieties.split(',').map(v => v.trim()).filter(Boolean) : undefined,
        // Campi condivisi ambiente
        plantingSystem: plantingSystem,
        irrigationSystem: irrigationSystem,
        soilType: soilType,
      };

      // Campi numerici opzionali condivisi
      if (surfaceHa) config.surfaceHa = parseFloat(surfaceHa);
      if (plantSpacing) config.plantSpacing = parseFloat(plantSpacing);
      if (rowSpacing) config.rowSpacing = parseFloat(rowSpacing);
      if (soilPh) config.soilPh = parseFloat(soilPh);

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

      // Salva la configurazione nel servizio corretto invece di aggiornare il garden vuoto
      if (orchardType === 'orchard' || orchardType === 'oliveGrove') {
        await orchardService.createOrchardConfiguration({
          gardenId: garden.id,
          name: garden.name + (orchardType === 'oliveGrove' ? ' - Oliveto' : ' - Frutteto'),
          orchardType: orchardType === 'oliveGrove' ? 'olive' : (config.category?.toLowerCase() || 'mixed'),
          establishedDate: config.establishedDate,
          totalTrees: config.totalTrees || 0,
          rowSpacingM: config.rowSpacing,
          treeSpacingM: config.plantSpacing,
          trainingSystem: config.plantingSystem,
          soilType: config.soilType,
          irrigationSystem: config.irrigationSystem,
          mainVarieties: config.varieties?.map((v: string) => ({ variety: v, percentage: 100 / config.varieties.length })) || [],
          rootstockTypes: [],
          organicCertified: false,
          precisionManagement: false
        });
      } else if (orchardType === 'vineyard') {
        await vineyardService.createVineyardConfiguration({
          gardenId: garden.id,
          name: garden.name + ' - Vigneto',
          vineyardType: config.type || 'wine',
          establishedDate: config.establishedDate,
          totalVines: config.totalTrees || 0,
          rowSpacingM: config.rowSpacing,
          vineSpacingM: config.plantSpacing,
          trainingSystem: config.trainingSystem,
          soilType: config.soilType,
          irrigationSystem: config.irrigationSystem,
          mainVarieties: config.varieties?.map((v: string) => ({ variety: v, percentage: 100 / config.varieties.length })) || [],
          rootstockTypes: [],
          organicCertified: false,
          precisionManagement: false
        });
      }

      // Genera task automatici se richiesto e se è un frutteto
      if (generateTasks && orchardType === 'orchard' && fruitCategory) {
        try {
          const plantedDateObj = new Date(establishedDate || new Date());
          const tasks = generateOrchardTasks(fruitCategory, plantedDateObj, garden.id, garden.name);

          // Crea tutti i task
          for (const taskData of tasks) {
            await storageProvider.createTask(taskData);
          }

          console.debug(`Generated ${tasks.length} tasks for ${fruitCategory}`);
        } catch (error) {
          console.error('Error generating tasks:', error);
          // Non blocchiamo il flusso se task generation fallisce
        }
      }

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
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 gap-4">
                    {fruitTreeCategories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setFruitCategory(category.id)}
                        className={`p-6 border-2 rounded-lg text-left transition-all ${fruitCategory === category.id
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
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <Info size={12} />
                          <span>{category.botanicalFamily}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {fruitCategory && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">Sistema di Impianto</h4>
                      <select
                        value={plantingSystem}
                        onChange={(e) => setPlantingSystem(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="TRADITIONAL">Tradizionale (meno di 200 piante/ha)</option>
                        <option value="INTENSIVE">Intensivo (400-600 piante/ha)</option>
                        <option value="SUPER_INTENSIVE">Superintensivo (1.600-2.500 piante/ha)</option>
                      </select>
                      <p className="mt-2 text-xs text-gray-500">
                        {plantingSystem === 'TRADITIONAL' && 'Sistema tradizionale con sesti ampi e maggiore manodopera manuale'}
                        {plantingSystem === 'INTENSIVE' && 'Sistema con parziale meccanizzazione e buona produttività'}
                        {plantingSystem === 'SUPER_INTENSIVE' && 'Sistema ad alta densità completamente meccanizzato per massima resa'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {orchardType === 'oliveGrove' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Destinazione Produzione</h4>
                    <button
                      onClick={() => setOliveType('OIL')}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all ${oliveType === 'OIL'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">🫒 Da Olio</div>
                      <div className="text-sm text-gray-600">Varietà per produzione olio</div>
                    </button>
                    <button
                      onClick={() => setOliveType('TABLE')}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all ${oliveType === 'TABLE'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">🫒 Da Mensa</div>
                      <div className="text-sm text-gray-600">Varietà per consumo diretto</div>
                    </button>
                    <button
                      onClick={() => setOliveType('DUAL_PURPOSE')}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all ${oliveType === 'DUAL_PURPOSE'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">🫒 Dual-Purpose</div>
                      <div className="text-sm text-gray-600">Varietà per olio e mensa</div>
                    </button>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Sistema di Impianto</h4>
                    <select
                      value={plantingSystem}
                      onChange={(e) => setPlantingSystem(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="TRADITIONAL">Tradizionale (meno di 200 piante/ha)</option>
                      <option value="INTENSIVE">Intensivo (400-600 piante/ha)</option>
                      <option value="SUPER_INTENSIVE">Superintensivo (1.600-2.500 piante/ha)</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      {plantingSystem === 'TRADITIONAL' && 'Sistema tradizionale con maggior manodopera manuale e sesti ampi'}
                      {plantingSystem === 'INTENSIVE' && 'Sistema con parziale meccanizzazione e produttività media'}
                      {plantingSystem === 'SUPER_INTENSIVE' && 'Sistema ad alta densità completamente meccanizzato per massima resa'}
                    </p>
                  </div>
                </div>
              )}

              {orchardType === 'vineyard' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Tipo Vigneto</h4>
                    <button
                      onClick={() => setVineType('WINE')}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all ${vineType === 'WINE'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">🍷 Da Vino</div>
                      <div className="text-sm text-gray-600">Varietà per produzione vino</div>
                    </button>
                    <button
                      onClick={() => setVineType('TABLE')}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all ${vineType === 'TABLE'
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

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Sistema di Impianto</h4>
                    <select
                      value={plantingSystem}
                      onChange={(e) => setPlantingSystem(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="TRADITIONAL">Tradizionale (meno di 200 piante/ha)</option>
                      <option value="INTENSIVE">Intensivo (400-600 piante/ha)</option>
                      <option value="SUPER_INTENSIVE">Superintensivo (1.600-2.500 piante/ha)</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      {plantingSystem === 'TRADITIONAL' && 'Sesti ampi tradizionali, adatti a terreni collinari e coltivazione di qualità'}
                      {plantingSystem === 'INTENSIVE' && 'Densità media con meccanizzazione parziale, equilibrio tra qualità e produttività'}
                      {plantingSystem === 'SUPER_INTENSIVE' && 'Alta densità per massima produzione, richiede irrigazione e meccanizzazione completa'}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottoni Navigazione */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-3"
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-3"
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
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

              {/* Campi condivisi - Configurazione Ambiente */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Configurazione Ambiente</h4>

                {/* Superficie */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie (ettari - opzionale)
                  </label>
                  <input
                    type="number"
                    value={surfaceHa}
                    onChange={(e) => setSurfaceHa(e.target.value)}
                    placeholder="Es. 2.5"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Sesto di Impianto */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sesto di Impianto (opzionale)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Distanza tra piante (m)</label>
                      <input
                        type="number"
                        value={plantSpacing}
                        onChange={(e) => setPlantSpacing(e.target.value)}
                        placeholder="Es. 4"
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Distanza tra file (m)</label>
                      <input
                        type="number"
                        value={rowSpacing}
                        onChange={(e) => setRowSpacing(e.target.value)}
                        placeholder="Es. 6"
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  {plantSpacing && rowSpacing && (
                    <p className="mt-2 text-xs text-gray-600 bg-blue-50 p-3 rounded">
                      Densità calcolata: ~{Math.round(10000 / (parseFloat(plantSpacing) * parseFloat(rowSpacing)))} piante/ha
                    </p>
                  )}
                </div>

                {/* Sistema di Irrigazione */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sistema di Irrigazione
                  </label>
                  <select
                    value={irrigationSystem}
                    onChange={(e) => setIrrigationSystem(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="DRIP">Goccia (microirrigazione localizzata)</option>
                    <option value="SPRINKLER">Aspersione (irrigatori aerei)</option>
                    <option value="MICRO">Microirrigatori (nebulizzatori)</option>
                    <option value="MANUAL">Manuale (con tubo/annaffiatoio)</option>
                  </select>
                </div>

                {/* Tipo di Terreno */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo di Terreno
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="SANDY">Sabbioso (drenante, scarsa ritenzione idrica)</option>
                    <option value="CLAY">Argilloso (compatto, buona ritenzione idrica)</option>
                    <option value="LOAM">Franco (equilibrato, ideale per la maggior parte delle colture)</option>
                    <option value="ROCKY">Roccioso (drenaggio eccellente, bassa fertilità)</option>
                    <option value="MIXED">Misto (combinazione di diverse texture)</option>
                  </select>
                </div>

                {/* pH del Suolo */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    pH del Suolo (opzionale)
                  </label>
                  <input
                    type="number"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    placeholder="Es. 6.5"
                    min="0"
                    max="14"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Valore ideale 6.0-7.5 (neutro/leggermente acido). Valori inferiori a 6.0 = acido, superiori a 7.5 = alcalino
                  </p>
                </div>
              </div>

              {/* Tips Contestuali per Categoria Frutteto */}
              {orchardType === 'orchard' && fruitCategory && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-3">
                    <Lightbulb size={18} className="text-yellow-full max-w-sm" />
                    Suggerimenti per {getCategoryInfo(fruitCategory)?.label}
                  </h4>
                  <div className="space-y-3">
                    {getCategoryTips(fruitCategory).map((tip, index) => {
                      const bgColor = tip.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                        tip.type === 'success' ? 'bg-green-50 border-green-200' :
                          'bg-blue-50 border-blue-200';
                      const iconColor = tip.type === 'warning' ? 'text-amber-600' :
                        tip.type === 'success' ? 'text-green-600' :
                          'text-blue-600';
                      const Icon = tip.type === 'warning' ? AlertCircle :
                        tip.type === 'success' ? CheckCircle :
                          Info;

                      return (
                        <div key={index} className={`p-4 rounded-lg border ${bgColor}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <Icon className={iconColor} size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-lg md:text-xl">{tip.icon}</span>
                                <h5 className="font-medium text-gray-900">{tip.title}</h5>
                              </div>
                              <p className="text-sm text-gray-700">{tip.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Raccomandazioni pH specifiche per categoria */}
                  {getCategoryRecommendations(fruitCategory) && (
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
                        <div className="text-sm">
                          <span className="font-medium text-purple-900">pH Ideale:</span>{' '}
                          <span className="text-purple-800">
                            {getCategoryRecommendations(fruitCategory)!.soilPh.min.toFixed(1)} - {getCategoryRecommendations(fruitCategory)!.soilPh.max.toFixed(1)}
                            {' '}(ottimale: {getCategoryRecommendations(fruitCategory)!.soilPh.ideal.toFixed(1)})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

              {/* Opzione Generazione Task Automatici */}
              {orchardType === 'orchard' && fruitCategory && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generateTasks}
                      onChange={(e) => setGenerateTasks(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Genera task stagionali automaticamente
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {getTasksSummary(fruitCategory)} verranno creati nel calendario per guidarti nelle operazioni colturali.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Bottoni Navigazione */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep('category')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                >
                  <ArrowLeft size={18} />
                  Indietro
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-3"
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

