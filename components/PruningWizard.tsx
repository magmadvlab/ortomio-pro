import React, { useState } from 'react';
import { GardenTask } from '../types';
import { FruitTreeCrop, PruningRecord } from '../types/fruitTree';
import { getMasterSheetSync } from '../services/plantMasterService';
import { Scissors, ChevronRight, ChevronLeft, Camera, CheckCircle } from 'lucide-react';

interface PruningWizardProps {
  task: GardenTask;
  onComplete: (record: Omit<PruningRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

type PruningType = 'Formative' | 'Maintenance' | 'Rejuvenation';
type PruningSeason = 'Winter' | 'Summer';

const PruningWizard: React.FC<PruningWizardProps> = ({ task, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [pruningType, setPruningType] = useState<PruningType>('Maintenance');
  const [pruningSeason, setPruningSeason] = useState<PruningSeason>('Winter');
  const [technique, setTechnique] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const masterData = getMasterSheetSync(task.plantName);
  const isVine = masterData?.cropType === 'Vine';
  const isFruitTree = masterData?.cropType === 'FruitTree';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          setPhotos([...photos, base64]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onComplete({
      fruitTreeId: task.id,
      pruningDate: new Date().toISOString().split('T')[0],
      pruningType,
      season: pruningSeason,
      technique: technique || `${pruningType} pruning`,
      notes: notes || undefined,
      photos: photos.length > 0 ? photos : undefined
    });
  };

  const getPruningInstructions = (): string[] => {
    if (isVine) {
      const vineCrop = masterData as any;
      const instructions: Record<string, string[]> = {
        'Guyot': [
          'Mantieni 1-2 tralci fruttiferi',
          'Taglia tralci dell\'anno precedente, mantieni solo sperone',
          'Lascia 6-8 gemme per tralcio fruttifero',
          'Mantieni sperone con 2-3 gemme per rinnovo',
          'Elimina tralci deboli, malati o mal posizionati'
        ],
        'Cordon': [
          'Mantieni cordone permanente con speroni di 2-3 gemme',
          'Rinnova speroni ogni 2-3 anni',
          'Elimina tralci che escono dal cordone',
          'Mantieni distanza di 20-30cm tra speroni'
        ],
        'Pergola': [
          'Mantieni struttura permanente della pergola',
          'Rinnova tralci fruttiferi ogni anno',
          'Lascia 8-12 gemme per tralcio',
          'Elimina tralci vecchi o deboli'
        ],
        'Alberello': [
          'Mantieni forma a vaso basso',
          'Lascia 2-3 tralci principali con 4-6 gemme',
          'Rinnova tralci ogni anno',
          'Elimina succhioni e polloni'
        ]
      };
      return instructions[vineCrop.trainingSystem] || instructions['Guyot'];
    }

    if (isFruitTree) {
      const fruitTreeCrop = masterData as unknown as FruitTreeCrop;
      const instructions: Record<string, string[]> = {
        'Pome': [
          'Rimuovi rami morti, malati o danneggiati',
          'Elimina rami che si incrociano o competono',
          'Apri la chioma per favorire penetrazione luce',
          'Mantieni forma a vaso o piramide',
          'Taglia sopra gemma esterna per favorire crescita verso l\'esterno'
        ],
        'Stone': [
          'Potatura più leggera rispetto ai pomacee',
          'Rimuovi rami che producono frutti piccoli',
          'Favorisci rinnovo di rami fruttiferi',
          'Elimina succhioni vigorosi'
        ],
        'Citrus': [
          'Potatura leggera, principalmente rimozione rami secchi',
          'Elimina rami che toccano il suolo',
          'Apri la chioma per favorire aereazione',
          'Rimuovi rami interni che non ricevono luce'
        ]
      };
      return instructions[fruitTreeCrop.treeType] || instructions['Pome'];
    }

    return [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Scissors className="text-green-500" size={24} />
              Wizard Potatura
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s <= step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Seleziona Tipo Potatura */}
          {step === 1 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Tipo di Potatura</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="pruningType"
                    value="Formative"
                    checked={pruningType === 'Formative'}
                    onChange={(e) => setPruningType(e.target.value as PruningType)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Potatura Formativa</div>
                    <div className="text-sm text-gray-600">
                      Per alberi giovani (0-3 anni). Stabilisci struttura principale e forma.
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="pruningType"
                    value="Maintenance"
                    checked={pruningType === 'Maintenance'}
                    onChange={(e) => setPruningType(e.target.value as PruningType)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Potatura di Manutenzione</div>
                    <div className="text-sm text-gray-600">
                      Per alberi maturi (3-15 anni). Mantieni forma e favorisci produzione.
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="pruningType"
                    value="Rejuvenation"
                    checked={pruningType === 'Rejuvenation'}
                    onChange={(e) => setPruningType(e.target.value as PruningType)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Potatura di Ringiovanimento</div>
                    <div className="text-sm text-gray-600">
                      Per alberi vecchi (&gt;15 anni). Rinnova struttura e stimola nuova crescita.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Stagione */}
          {step === 2 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Stagione</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="pruningSeason"
                    value="Winter"
                    checked={pruningSeason === 'Winter'}
                    onChange={(e) => setPruningSeason(e.target.value as PruningSeason)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Potatura Invernale</div>
                    <div className="text-sm text-gray-600">
                      Dicembre-Febbraio. Potatura principale, struttura e forma.
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="pruningSeason"
                    value="Summer"
                    checked={pruningSeason === 'Summer'}
                    onChange={(e) => setPruningSeason(e.target.value as PruningSeason)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Potatura Estiva</div>
                    <div className="text-sm text-gray-600">
                      Giugno-Luglio. Controllo vegetazione, rimozione succhioni.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Guida Tecnica */}
          {step === 3 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Guida Tecnica</h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Istruzioni per {pruningType}</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {getPruningInstructions().map((inst, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tecnica Specifica Utilizzata
                </label>
                <input
                  type="text"
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  placeholder="es. Guyot renewal, Thinning cuts, etc."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Foto e Note */}
          {step === 4 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Documentazione</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Foto Prima/Dopo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Note sulla potatura, osservazioni, difficoltà incontrate..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Conferma */}
          {step === 5 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Riepilogo</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pianta:</span>
                  <span className="font-semibold">{task.plantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo Potatura:</span>
                  <span className="font-semibold">{pruningType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stagione:</span>
                  <span className="font-semibold">{pruningSeason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-semibold">{new Date().toLocaleDateString('it-IT')}</span>
                </div>
                {technique && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tecnica:</span>
                    <span className="font-semibold">{technique}</span>
                  </div>
                )}
                {photos.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Foto:</span>
                    <span className="font-semibold">{photos.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <ChevronLeft size={18} />
              {step === 1 ? 'Annulla' : 'Indietro'}
            </button>
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-3"
              >
                Avanti
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-3"
              >
                <CheckCircle size={18} />
                Conferma Potatura
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PruningWizard;

