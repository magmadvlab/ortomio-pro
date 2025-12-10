import React, { useState, useEffect } from 'react';
import { Garden } from '../types';
import { getCurrentPositionWithRetry, getDefaultCoordinates } from '../services/geolocationService';
import { getGeoClimateInfo } from '../services/geoClimateService';
import { analyzeSunExposure, analyzeAspectDirection, fileToBase64 } from '../services/photoAnalysisService';
import { MapPin, ArrowRight, ArrowLeft, Loader2, CheckCircle, Mountain, Sun, Wind, Home, Camera, Upload, X } from 'lucide-react';

interface GardenOnboardingProps {
  onComplete: (garden: Garden) => void;
  onCancel: () => void;
  existingGarden?: Garden; // Per edit
}

const GardenOnboarding: React.FC<GardenOnboardingProps> = ({ onComplete, onCancel, existingGarden }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Identità e Posizione
  const [name, setName] = useState(existingGarden?.name || '');
  const [sizeSqMeters, setSizeSqMeters] = useState(existingGarden?.sizeSqMeters?.toString() || '');
  const [latitude, setLatitude] = useState(existingGarden?.coordinates?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(existingGarden?.coordinates?.longitude?.toString() || '');
  const [altitudeMeters, setAltitudeMeters] = useState(existingGarden?.altitudeMeters?.toString() || '');
  const [inferringGeo, setInferringGeo] = useState(false);

  // Step 2: Suolo
  const [soilType, setSoilType] = useState<Garden['soilType'] | ''>(existingGarden?.soilType || '');
  const [soilPh, setSoilPh] = useState(existingGarden?.soilPh?.toString() || '');

  // Step 3: Microclima
  const [sunExposure, setSunExposure] = useState<Garden['sunExposure'] | ''>(existingGarden?.sunExposure || '');
  const [dailySunHours, setDailySunHours] = useState(existingGarden?.dailySunHours?.toString() || '');
  const [aspectDirection, setAspectDirection] = useState<Garden['aspectDirection'] | ''>(existingGarden?.aspectDirection || '');
  const [windProtection, setWindProtection] = useState<Garden['windProtection'] | ''>(existingGarden?.windProtection || '');
  const [hasCompostBin, setHasCompostBin] = useState(existingGarden?.hasCompostBin || false);
  const [isRaisedBed, setIsRaisedBed] = useState(existingGarden?.isRaisedBed || false);
  
  // Photo Analysis (Pro Feature)
  const [noonPhoto, setNoonPhoto] = useState<File | null>(null);
  const [noonPhotoPreview, setNoonPhotoPreview] = useState<string | null>(null);
  const [horizonPhoto, setHorizonPhoto] = useState<File | null>(null);
  const [horizonPhotoPreview, setHorizonPhotoPreview] = useState<string | null>(null);
  const [analyzingPhotos, setAnalyzingPhotos] = useState(false);
  const [photoAnalysisError, setPhotoAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-riempi coordinate se esiste già un giardino
    if (existingGarden?.coordinates) {
      setLatitude(existingGarden.coordinates.latitude.toString());
      setLongitude(existingGarden.coordinates.longitude.toString());
    }
  }, [existingGarden]);

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      const result = await getCurrentPositionWithRetry(2, {
        timeout: 20000,
        enableHighAccuracy: false,
      });

      if (result.success && result.latitude && result.longitude) {
        setLatitude(result.latitude.toString());
        setLongitude(result.longitude.toString());
        
        // Prova a inferire altitudine e dati geoclimatici
        setInferringGeo(true);
        const geoInfo = await getGeoClimateInfo(result.latitude, result.longitude, true);
        
        if (geoInfo) {
          setAltitudeMeters(geoInfo.altitude.toString());
        }
        setInferringGeo(false);
      } else {
        // Fallback a coordinate default
        const defaultCoords = getDefaultCoordinates();
        setLatitude(defaultCoords.latitude.toString());
        setLongitude(defaultCoords.longitude.toString());
      }
    } catch (error) {
      console.error('Error getting location:', error);
      const defaultCoords = getDefaultCoordinates();
      setLatitude(defaultCoords.latitude.toString());
      setLongitude(defaultCoords.longitude.toString());
    } finally {
      setLoading(false);
      setInferringGeo(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // Validazione step 1
      if (!name.trim()) {
        alert('Inserisci un nome per il giardino');
        return;
      }
      if (!sizeSqMeters || parseFloat(sizeSqMeters) <= 0) {
        alert('Inserisci una dimensione valida');
        return;
      }
    }
    if (step === 2) {
      // Validazione step 2 (opzionale)
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleNoonPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNoonPhoto(file);
    setPhotoAnalysisError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setNoonPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze photo
    try {
      setAnalyzingPhotos(true);
      const base64 = await fileToBase64(file);
      const analysis = await analyzeSunExposure(base64);
      
      setDailySunHours(analysis.dailySunHours.toString());
      setSunExposure(analysis.sunExposure);
    } catch (error: any) {
      console.error('Error analyzing sun exposure:', error);
      setPhotoAnalysisError('Errore nell\'analisi foto. Puoi inserire i valori manualmente.');
    } finally {
      setAnalyzingPhotos(false);
    }
  };

  const handleHorizonPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHorizonPhoto(file);
    setPhotoAnalysisError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setHorizonPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze photo
    try {
      setAnalyzingPhotos(true);
      const base64 = await fileToBase64(file);
      const analysis = await analyzeAspectDirection(base64);
      
      setAspectDirection(analysis.aspectDirection);
    } catch (error: any) {
      console.error('Error analyzing aspect direction:', error);
      setPhotoAnalysisError('Errore nell\'analisi foto. Puoi inserire i valori manualmente.');
    } finally {
      setAnalyzingPhotos(false);
    }
  };

  const removeNoonPhoto = () => {
    setNoonPhoto(null);
    setNoonPhotoPreview(null);
  };

  const removeHorizonPhoto = () => {
    setHorizonPhoto(null);
    setHorizonPhotoPreview(null);
  };

  const handleComplete = () => {
    const garden: Garden = {
      id: existingGarden?.id || crypto.randomUUID(),
      name: name.trim(),
      sizeSqMeters: parseFloat(sizeSqMeters) || 0,
      soilType: soilType || undefined,
      soilPh: soilPh ? parseFloat(soilPh) : undefined,
      coordinates: (latitude && longitude) ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      } : undefined,
      altitudeMeters: altitudeMeters ? parseFloat(altitudeMeters) : undefined,
      sunExposure: sunExposure || undefined,
      dailySunHours: dailySunHours ? parseFloat(dailySunHours) : undefined,
      aspectDirection: aspectDirection || undefined,
      windProtection: windProtection || undefined,
      hasCompostBin: hasCompostBin,
      isRaisedBed: isRaisedBed,
      createdAt: existingGarden?.createdAt || new Date().toISOString()
    };

    onComplete(garden);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {existingGarden ? 'Modifica Giardino' : 'Nuovo Giardino'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle size={20} /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Identità e Posizione */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Home size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Identità e Posizione</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Giardino *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es. Orto di Casa, Balcone Sud..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensione (mq) *
                </label>
                <input
                  type="number"
                  value={sizeSqMeters}
                  onChange={(e) => setSizeSqMeters(e.target.value)}
                  placeholder="Es. 20"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitudine
                  </label>
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Es. 41.9028"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitudine
                  </label>
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Es. 12.4964"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleGetLocation}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Rilevamento posizione...</span>
                  </>
                ) : (
                  <>
                    <MapPin size={18} />
                    <span>Usa la mia posizione</span>
                  </>
                )}
              </button>

              {inferringGeo && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Inferenza dati geoclimatici...</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mountain size={16} />
                  Altitudine (metri)
                </label>
                <input
                  type="number"
                  value={altitudeMeters}
                  onChange={(e) => setAltitudeMeters(e.target.value)}
                  placeholder="Es. 200 (opzionale)"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se lasciato vuoto, verrà inferito automaticamente dalle coordinate
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Suolo */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shovel size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Struttura Suolo</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo di Terreno
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as Garden['soilType'] | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleziona...</option>
                  <option value="Loamy">Franco (Ideale)</option>
                  <option value="Sandy">Sabbioso</option>
                  <option value="Clay">Argilloso</option>
                  <option value="Peaty">Torba</option>
                  <option value="Chalky">Calcareo</option>
                  <option value="Silty">Limoso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  pH del Suolo
                </label>
                <input
                  type="number"
                  value={soilPh}
                  onChange={(e) => setSoilPh(e.target.value)}
                  placeholder="Es. 6.5 (opzionale)"
                  min="0"
                  max="14"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  La maggior parte delle piante preferisce pH 6.0-7.0
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Microclima */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sun size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Microclima</h3>
              </div>

              {/* Foto Analisi AI (Pro Feature) */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera size={18} className="text-purple-600" />
                  <h4 className="font-bold text-gray-800 text-sm">Analisi AI da Foto (Pro)</h4>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Scatta foto per analisi automatica dell'esposizione solare e direzione
                </p>

                {/* Foto Mezzogiorno */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    📸 Foto Mezzogiorno (12:30) - Analizza esposizione solare
                  </label>
                  {noonPhotoPreview ? (
                    <div className="relative">
                      <img
                        src={noonPhotoPreview}
                        alt="Foto mezzogiorno"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={removeNoonPhoto}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                      {analyzingPhotos && (
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
                        onChange={handleNoonPhotoChange}
                        className="hidden"
                        disabled={analyzingPhotos}
                      />
                    </label>
                  )}
                </div>

                {/* Foto Orizzonte */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    📸 Foto Orizzonte (alba/tramonto) - Analizza direzione esposizione
                  </label>
                  {horizonPhotoPreview ? (
                    <div className="relative">
                      <img
                        src={horizonPhotoPreview}
                        alt="Foto orizzonte"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={removeHorizonPhoto}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                      {analyzingPhotos && (
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
                        onChange={handleHorizonPhotoChange}
                        className="hidden"
                        disabled={analyzingPhotos}
                      />
                    </label>
                  )}
                </div>

                {photoAnalysisError && (
                  <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                    {photoAnalysisError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Sun size={16} />
                  Esposizione Solare
                </label>
                <select
                  value={sunExposure}
                  onChange={(e) => setSunExposure(e.target.value as Garden['sunExposure'] | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleziona...</option>
                  <option value="FullSun">Pieno Sole (8+ ore)</option>
                  <option value="PartSun">Mezz'Ombra (4-8 ore)</option>
                  <option value="Shade">Ombra (meno di 4 ore)</option>
                </select>
                {dailySunHours && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Analisi AI: {dailySunHours} ore/giorno
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ore di Sole Giornaliere
                </label>
                <input
                  type="number"
                  value={dailySunHours}
                  onChange={(e) => setDailySunHours(e.target.value)}
                  placeholder="Es. 6 (opzionale)"
                  min="0"
                  max="12"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Wind size={16} />
                  Direzione Esposizione
                </label>
                <select
                  value={aspectDirection}
                  onChange={(e) => setAspectDirection(e.target.value as Garden['aspectDirection'] | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleziona...</option>
                  <option value="South">Sud (Ideale)</option>
                  <option value="East">Est</option>
                  <option value="West">Ovest</option>
                  <option value="North">Nord</option>
                  <option value="Flat">Piano</option>
                </select>
                {aspectDirection && horizonPhotoPreview && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Analisi AI: {aspectDirection}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protezione dal Vento
                </label>
                <select
                  value={windProtection}
                  onChange={(e) => setWindProtection(e.target.value as Garden['windProtection'] | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleziona...</option>
                  <option value="High">Alta</option>
                  <option value="Medium">Media</option>
                  <option value="Low">Bassa</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCompostBin}
                    onChange={(e) => setHasCompostBin(e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Ho una compostiera
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRaisedBed}
                    onChange={(e) => setIsRaisedBed(e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Uso aiuole rialzate (raised bed)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={step === 1 ? onCancel : handlePrevious}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={18} />
              {step === 1 ? 'Annulla' : 'Indietro'}
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Avanti
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={18} />
                Completa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenOnboarding;

