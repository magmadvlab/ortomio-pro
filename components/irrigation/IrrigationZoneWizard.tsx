'use client'

import React, { useState } from 'react';
import { IrrigationZone, IrrigationTemplate, WateringMethod } from '@/types/irrigation';
import { irrigationTemplates } from '@/data/irrigationTemplates';
import { Garden, GardenBed } from '@/types';
import { createIrrigationZone, calculateDriplineFlowRate } from '@/services/irrigationService';
import { X, ArrowRight, ArrowLeft, Droplets, CheckCircle } from 'lucide-react';

interface IrrigationZoneWizardProps {
  garden: Garden;
  beds: GardenBed[];
  systemId: string;
  onComplete: (zone: IrrigationZone) => void;
  onCancel: () => void;
}

type WizardStep = 'method' | 'details' | 'assign';

export const IrrigationZoneWizard: React.FC<IrrigationZoneWizardProps> = ({
  garden, beds, systemId, onComplete, onCancel
}) => {
  const [step, setStep] = useState<WizardStep>('method');
  const [selectedTemplate, setSelectedTemplate] = useState<IrrigationTemplate | null>(null);
  const [method, setMethod] = useState<WateringMethod>('Dripline');
  const [flowRateLph, setFlowRateLph] = useState<number>(0);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [zoneName, setZoneName] = useState('');
  const [valveId, setValveId] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Configurazione Manuale
  const [manualMode, setManualMode] = useState<'liters' | 'minutes'>('liters');
  const [manualFlowRate, setManualFlowRate] = useState<number>(600); // Default tubo

  // Configurazione Dripline
  const [driplineLength, setDriplineLength] = useState<number>(0);
  const [driplineConfig, setDriplineConfig] = useState<'spacing' | 'perMeter'>('spacing');
  const [dripperSpacing, setDripperSpacing] = useState<number>(30); // cm
  const [dripperFlowRate, setDripperFlowRate] = useState<number>(2); // L/h
  const [flowRatePerMeter, setFlowRatePerMeter] = useState<number>(6.67); // L/h per metro

  // Configurazione Drippers
  const [dripperCount, setDripperCount] = useState<number>(0);
  const [dripperLph, setDripperLph] = useState<number>(4); // L/h per gocciolatore

  // Configurazione MicroSprinkler
  const [sprinklerCount, setSprinklerCount] = useState<number>(0);
  const [sprinklerLph, setSprinklerLph] = useState<number>(40); // L/h per irrigatore

  const handleTemplateSelect = (template: IrrigationTemplate) => {
    setSelectedTemplate(template);
    setMethod(template.method);
    setStep('details');
    
    // Pre-compila valori in base al template
    if (template.id === 'dripline-bed') {
      setDriplineConfig('spacing');
      setDripperSpacing(30); // cm
      setDripperFlowRate(2); // L/h
    } else if (template.id === 'drippers-vegetable') {
      setDripperLph(4); // L/h
    } else if (template.id === 'drippers-orchard') {
      setDripperLph(4); // L/h per dripper
      // Nota: numero piante sarà chiesto dopo, ma per ora pre-compiliamo solo L/h
    } else if (template.id === 'micro-sprinkler') {
      setSprinklerLph(40); // L/h
    }
  };

  // Calcola portata finale in base al metodo selezionato
  const calculateFinalFlowRate = (): number => {
    if (method === 'Manual') {
      return manualMode === 'minutes' ? manualFlowRate : 0; // Se litri, non serve portata
    }
    
    if (method === 'Dripline') {
      if (driplineConfig === 'spacing') {
        return calculateDriplineFlowRate(driplineLength, dripperSpacing, dripperFlowRate);
      } else {
        return calculateDriplineFlowRate(driplineLength, undefined, undefined, flowRatePerMeter);
      }
    }
    
    if (method === 'Drippers') {
      return dripperCount * dripperLph;
    }
    
    if (method === 'MicroSprinkler') {
      return sprinklerCount * sprinklerLph;
    }
    
    return flowRateLph; // Fallback per altri metodi
  };

  // Validazione configurazione
  const validateConfiguration = (): string | null => {
    if (!zoneName.trim()) {
      return 'Inserisci un nome per la zona';
    }

    if (method === 'Dripline') {
      if (driplineLength <= 0) {
        return 'Inserisci la lunghezza totale dell\'ala (metri)';
      }
      if (driplineConfig === 'spacing' && (!dripperSpacing || !dripperFlowRate)) {
        return 'Inserisci passo gocciolatori e portata per gocciolatore';
      }
      if (driplineConfig === 'perMeter' && !flowRatePerMeter) {
        return 'Inserisci L/h per metro';
      }
    }

    if (method === 'Drippers') {
      if (dripperCount <= 0) {
        return 'Inserisci il numero di gocciolatori';
      }
      if (!dripperLph || dripperLph <= 0) {
        return 'Inserisci la portata per gocciolatore (L/h)';
      }
    }

    if (method === 'MicroSprinkler') {
      if (sprinklerCount <= 0) {
        return 'Inserisci il numero di irrigatori';
      }
      if (!sprinklerLph || sprinklerLph <= 0) {
        return 'Inserisci la portata per irrigatore (L/h)';
      }
    }

    // Manuale: sempre valido (portata opzionale)
    if (method === 'Manual') {
      // OK sempre
    }

    return null;
  };

  const handleComplete = () => {
    const validationError = validateConfiguration();
    if (validationError) {
      alert(validationError);
      return;
    }

    const finalFlowRate = calculateFinalFlowRate();
    
    // Per zone manuali in modalità litri, portata può essere 0
    if (method !== 'Manual' && finalFlowRate <= 0) {
      alert('Configura correttamente la portata della zona');
      return;
    }

    // Crea zona con configurazione specifica
    const zone: IrrigationZone = {
      id: crypto.randomUUID(),
      systemId,
      name: zoneName.trim(),
      method,
      flowRateLph: finalFlowRate,
      valveId: valveId || undefined,
      bedIds: selectedBeds,
      plantTaskIds: [], // Verrà popolato dopo
      notes: notes || undefined,
      calculatedFromComponents: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Configurazione specifica
      manualConfig: method === 'Manual' ? {
        mode: manualMode,
        estimatedFlowRateLph: manualMode === 'minutes' ? manualFlowRate : undefined
      } : undefined,
      driplineConfig: method === 'Dripline' ? {
        lengthMeters: driplineLength,
        spacing: driplineConfig === 'spacing' ? dripperSpacing : undefined,
        dripperFlowRate: driplineConfig === 'spacing' ? dripperFlowRate : undefined,
        flowRatePerMeter: driplineConfig === 'perMeter' ? flowRatePerMeter : undefined
      } : undefined,
      drippersConfig: method === 'Drippers' ? {
        count: dripperCount,
        flowRateLph: dripperLph
      } : undefined,
      microSprinklerConfig: method === 'MicroSprinkler' ? {
        count: sprinklerCount,
        flowRateLph: sprinklerLph
      } : undefined
    };
    
    onComplete(zone);
  };

  const getMethodLabel = (method: WateringMethod) => {
    const labels = {
      'Manual': 'Manuale',
      'Hose': 'Tubo + Lancia',
      'Dripline': 'Ala Gocciolante',
      'Drippers': 'Gocciolatori',
      'MicroSprinkler': 'Micro-Sprinkler',
      'Sprinkler': 'Sprinkler',
      'Mixed': 'Misto'
    };
    return labels[method];
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets size={24} className="text-blue-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Crea Zona Irrigua</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Step 1: Selezione Metodo/Template */}
        {step === 'method' && (
          <div className="p-6">
            <p className="text-gray-600 mb-6">Scegli un template o configura manualmente:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {irrigationTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                  <div className="text-xs text-gray-500">
                    {template.defaultFlowRateLph} L/h tipici
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setStep('details')}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Configurazione Manuale
            </button>
          </div>
        )}

        {/* Step 2: Dettagli Zona */}
        {step === 'details' && (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Configura Zona</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Zona <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Es. Aiuola 1, Serretta, Filare 2..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Metodo</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as WateringMethod)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Manual">🪣 Manuale</option>
                  <option value="Dripline">💧 Ala Gocciolante</option>
                  <option value="Drippers">🟦 Gocciolatori</option>
                  <option value="MicroSprinkler">🌧️ Micro-Sprinkler</option>
                  <option value="Hose">Tubo + Lancia</option>
                </select>
              </div>

              {/* Configurazione Manuale */}
              {method === 'Manual' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vuoi gestire in litri o in minuti?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setManualMode('liters')}
                        className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                          manualMode === 'liters' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        Litri
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualMode('minutes')}
                        className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                          manualMode === 'minutes' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        Minuti
                      </button>
                    </div>
                  </div>
                  {manualMode === 'minutes' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Portata stimata tubo (L/h) <span className="text-gray-500 text-xs">(opzionale)</span>
                      </label>
                      <input
                        type="number"
                        value={manualFlowRate}
                        onChange={(e) => setManualFlowRate(parseFloat(e.target.value) || 600)}
                        placeholder="600"
                        min="0"
                        step="10"
                        className="w-full p-3 border rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se non lo sai, lascia 600 L/h (default per tubo standard)
                      </p>
                    </div>
                  )}
                  {manualMode === 'liters' && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Il sistema mostrerà solo i litri necessari, senza calcolare minuti.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Configurazione Dripline */}
              {method === 'Dripline' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Lunghezza totale ala in zona (metri) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={driplineLength}
                      onChange={(e) => setDriplineLength(parseFloat(e.target.value) || 0)}
                      placeholder="Es. 12"
                      min="0"
                      step="0.1"
                      className="w-full p-3 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Somma delle linee in questa zona
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Come vuoi configurare?
                    </label>
                    <div className="flex gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => setDriplineConfig('spacing')}
                        className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                          driplineConfig === 'spacing' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        Passo gocciolatori
                      </button>
                      <button
                        type="button"
                        onClick={() => setDriplineConfig('perMeter')}
                        className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                          driplineConfig === 'perMeter' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        L/h per metro
                      </button>
                    </div>

                    {driplineConfig === 'spacing' && (
                      <>
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-2">
                            Passo gocciolatori (cm)
                          </label>
                          <input
                            type="number"
                            value={dripperSpacing}
                            onChange={(e) => setDripperSpacing(parseFloat(e.target.value) || 30)}
                            placeholder="30"
                            min="0"
                            step="1"
                            className="w-full p-3 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Portata per gocciolatore (L/h)
                          </label>
                          <input
                            type="number"
                            value={dripperFlowRate}
                            onChange={(e) => setDripperFlowRate(parseFloat(e.target.value) || 2)}
                            placeholder="2"
                            min="0"
                            step="0.1"
                            className="w-full p-3 border rounded-lg"
                          />
                        </div>
                        {driplineLength > 0 && dripperSpacing > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Portata zona calcolata:</strong>{' '}
                              {Math.round(calculateDriplineFlowRate(driplineLength, dripperSpacing, dripperFlowRate) * 10) / 10} L/h
                              <br />
                              <span className="text-xs">
                                ({Math.round((driplineLength * 100) / dripperSpacing)} gocciolatori × {dripperFlowRate} L/h)
                              </span>
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {driplineConfig === 'perMeter' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          L/h per metro
                        </label>
                        <input
                          type="number"
                          value={flowRatePerMeter}
                          onChange={(e) => setFlowRatePerMeter(parseFloat(e.target.value) || 6.67)}
                          placeholder="6.67"
                          min="0"
                          step="0.01"
                          className="w-full p-3 border rounded-lg"
                        />
                        {driplineLength > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Portata zona calcolata:</strong>{' '}
                              {Math.round(calculateDriplineFlowRate(driplineLength, undefined, undefined, flowRatePerMeter) * 10) / 10} L/h
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Configurazione Drippers */}
              {method === 'Drippers' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Numero gocciolatori nella zona <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={dripperCount}
                      onChange={(e) => setDripperCount(parseInt(e.target.value) || 0)}
                      placeholder="Es. 20"
                      min="0"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      L/h per gocciolatore
                    </label>
                    <input
                      type="number"
                      value={dripperLph}
                      onChange={(e) => setDripperLph(parseFloat(e.target.value) || 4)}
                      placeholder="4"
                      min="0"
                      step="0.1"
                      className="w-full p-3 border rounded-lg"
                    />
                    {dripperCount > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Portata zona calcolata:</strong>{' '}
                          {dripperCount * dripperLph} L/h
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Configurazione MicroSprinkler */}
              {method === 'MicroSprinkler' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Numero irrigatori <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={sprinklerCount}
                      onChange={(e) => setSprinklerCount(parseInt(e.target.value) || 0)}
                      placeholder="Es. 6"
                      min="0"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      L/h per irrigatore
                    </label>
                    <input
                      type="number"
                      value={sprinklerLph}
                      onChange={(e) => setSprinklerLph(parseFloat(e.target.value) || 40)}
                      placeholder="40"
                      min="0"
                      step="0.1"
                      className="w-full p-3 border rounded-lg"
                    />
                    {sprinklerCount > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Portata zona calcolata:</strong>{' '}
                          {sprinklerCount * sprinklerLph} L/h
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Riepilogo portata calcolata */}
              {method !== 'Manual' && calculateFinalFlowRate() > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">
                    Portata zona: {Math.round(calculateFinalFlowRate() * 10) / 10} L/h
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Con questa portata, 120 L = {Math.round((120 / (calculateFinalFlowRate() / 60)) * 10) / 10} minuti
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Valvola Smart (opzionale)
                </label>
                <input
                  type="text"
                  value={valveId}
                  onChange={(e) => setValveId(e.target.value)}
                  placeholder="ID valvola SmartHub (opzionale)"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se hai una valvola smart, inserisci il suo ID per controllo automatico
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Note (opzionale)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note aggiuntive sulla zona..."
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setStep('method')} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-3"
              >
                <ArrowLeft size={18} />
                Indietro
              </button>
              <button 
                onClick={() => setStep('assign')} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-3"
              >
                Avanti
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Assegnazione Aiuole */}
        {step === 'assign' && (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Associa Aiuole</h3>
            <p className="text-gray-600 mb-4">
              Seleziona le aiuole servite da questa zona (opzionale, puoi aggiungerle dopo):
            </p>
            
            {beds.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                Nessuna aiuola disponibile. Puoi creare zone senza associazioni e aggiungerle dopo.
              </div>
            ) : (
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {beds.map(bed => (
                  <label 
                    key={bed.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBeds.includes(bed.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBeds([...selectedBeds, bed.id]);
                        } else {
                          setSelectedBeds(selectedBeds.filter(id => id !== bed.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="flex-1">{bed.name}</span>
                    {bed.bedType && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {bed.bedType}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => setStep('details')} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-3"
              >
                <ArrowLeft size={18} />
                Indietro
              </button>
              <button 
                onClick={handleComplete}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-3"
              >
                <CheckCircle size={18} />
                Crea Zona
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

