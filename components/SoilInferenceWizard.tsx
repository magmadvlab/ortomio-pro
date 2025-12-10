import React, { useState } from 'react';
import { inferSoilFromIndicators, SoilInference } from '../logic/soilInferenceEngine';
import { soilIndicators } from '../data/soilIndicators';
import { Garden } from '../types';
import { Camera, CheckCircle, Loader2, Upload, X } from 'lucide-react';

interface SoilInferenceWizardProps {
  garden: Garden;
  onComplete: (inference: SoilInference, updates: Partial<Garden>) => void;
  onCancel: () => void;
}

const SoilInferenceWizard: React.FC<SoilInferenceWizardProps> = ({
  garden,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [manualPlants, setManualPlants] = useState<string[]>([]);
  const [inference, setInference] = useState<SoilInference | null>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));

    // TODO: Integrare con Gemini Vision per riconoscimento automatico
    // Per ora, l'utente deve selezionare manualmente
    setAnalyzingPhoto(false);
  };

  const handlePlantToggle = (plantName: string) => {
    setManualPlants(prev =>
      prev.includes(plantName)
        ? prev.filter(p => p !== plantName)
        : [...prev, plantName]
    );
  };

  const handleAnalyze = () => {
    const plants = manualPlants.length > 0 ? manualPlants : [];
    const result = inferSoilFromIndicators(plants);
    setInference(result);
    setStep(2);
  };

  const handleApply = () => {
    if (!inference) return;

    const updates: Partial<Garden> = {};
    if (inference.estimatedPH && !garden.soilPh) {
      updates.soilPh = inference.estimatedPH;
    }
    if (inference.likelySoilType && !garden.soilType) {
      updates.soilType = inference.likelySoilType;
    }

    onComplete(inference, updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Analisi Terreno da Piante Spontanee
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">
                Le piante che crescono naturalmente nel tuo terreno sono ottimi indicatori delle sue caratteristiche!
              </p>

              {/* Upload Foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📸 Foto delle Piante Spontanee (Opzionale)
                </label>
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Foto piante spontanee"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                    {analyzingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={24} />
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600">Clicca per caricare foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Funzionalità di riconoscimento automatico in arrivo. Per ora, seleziona manualmente le piante che vedi.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Seleziona le piante spontanee che vedi nel tuo terreno:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {soilIndicators.map((indicator) => (
                    <label
                      key={indicator.name}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        manualPlants.includes(indicator.name)
                          ? 'bg-green-50 border-green-400'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={manualPlants.includes(indicator.name)}
                        onChange={() => handlePlantToggle(indicator.name)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{indicator.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={manualPlants.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analizza
                </button>
              </div>
            </div>
          )}

          {step === 2 && inference && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-l-4 ${
                inference.confidence === 'HIGH' ? 'bg-green-50 border-green-400' :
                inference.confidence === 'MEDIUM' ? 'bg-blue-50 border-blue-400' :
                'bg-yellow-50 border-yellow-400'
              }`}>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className={`${
                    inference.confidence === 'HIGH' ? 'text-green-600' :
                    inference.confidence === 'MEDIUM' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-bold text-gray-800 mb-1">
                      Confidenza: {inference.confidence === 'HIGH' ? 'Alta' : inference.confidence === 'MEDIUM' ? 'Media' : 'Bassa'}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {inference.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dettagli inferenza */}
              <div className="grid grid-cols-2 gap-4">
                {inference.estimatedPH && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">pH Stimato</p>
                    <p className="text-lg font-bold text-gray-800">{inference.estimatedPH.toFixed(1)}</p>
                  </div>
                )}
                {inference.likelySoilType && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Tipo Terreno</p>
                    <p className="text-lg font-bold text-gray-800">{inference.likelySoilType}</p>
                  </div>
                )}
                {inference.estimatedNutrientLevel && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Nutrienti</p>
                    <p className="text-lg font-bold text-gray-800">
                      {inference.estimatedNutrientLevel === 'rich' ? 'Ricco' :
                       inference.estimatedNutrientLevel === 'medium' ? 'Medio' : 'Povero'}
                    </p>
                  </div>
                )}
                {inference.estimatedMoisture && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Umidità</p>
                    <p className="text-lg font-bold text-gray-800">
                      {inference.estimatedMoisture === 'wet' ? 'Umido' :
                       inference.estimatedMoisture === 'medium' ? 'Medio' : 'Secco'}
                    </p>
                  </div>
                )}
              </div>

              {/* Evidenza */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 mb-2">Piante osservate:</p>
                <div className="flex flex-wrap gap-2">
                  {inference.evidence.map((plant, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white rounded border border-gray-200 text-xs text-gray-700">
                      {plant}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Indietro
                </button>
                <button
                  onClick={handleApply}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Applica al Profilo Giardino
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilInferenceWizard;

