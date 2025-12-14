import React, { useState, useEffect } from 'react';
import { Garden } from '../types';
import { getCurrentPositionWithRetry, getDefaultCoordinates } from '../services/geolocationService';
// getGeoClimateInfo importato dinamicamente per evitare problemi con 'use client'
import { analyzeSunExposure, analyzeAspectDirection, analyzePanoramic360, fileToBase64 } from '../services/photoAnalysisService';
import { convertToSqMeters, convertFromSqMeters, AreaUnit } from '../utils/areaConverter';
import { MapPin, ArrowRight, ArrowLeft, Loader2, CheckCircle, Mountain, Sun, Wind, Home, Camera, Upload, X, Shovel } from 'lucide-react';
import { ObstacleManager } from './sunExposure/ObstacleManager';
import { Obstacle3D } from '../services/preciseSunCalculator';
import { InfoTooltip } from './shared/InfoTooltip';
import VisualSunInput, { VisualSunInputData } from './sunExposure/VisualSunInput';
import { convertVisualInputToSunHours } from '../services/visualSunInputConverter';
import { useTier } from '../packages/core/hooks/useTier';
import { ProFeatureGate } from './shared/ProFeatureGate';
import { GardenType } from '../types';
import { GreenhouseConfigForm } from './gardens/GreenhouseConfigForm';
import { HydroponicConfigForm } from './gardens/HydroponicConfigForm';
import { AquaponicConfigForm } from './gardens/AquaponicConfigForm';
import { AeroponicConfigForm } from './gardens/AeroponicConfigForm';
import { IndoorConfigForm } from './gardens/IndoorConfigForm';
import { GreenhouseConfig } from '../types/greenhouse';
import { HydroponicSystemConfig, AquaponicSystemConfig, AeroponicSystemConfig, IndoorGrowingConfig } from '../types/indoorGrowing';
import { GardenBed } from '../types/gardenBed';
import { BedForm } from './gardens/BedForm';
import { BulkBedCreator } from './gardens/BulkBedCreator';
import { SizeConfigurationStep } from './gardens/SizeConfigurationStep';
import { useStorage } from '../packages/core/hooks/useStorage';
import { Grid, Plus, Layers } from 'lucide-react';

interface GardenOnboardingProps {
  onComplete: (garden: Garden) => void;
  onCancel: () => void;
  existingGarden?: Garden; // Per edit
  existingGardensCount?: number; // Numero di giardini esistenti per controllo limite FREE
}

const GardenOnboarding: React.FC<GardenOnboardingProps> = ({ onComplete, onCancel, existingGarden, existingGardensCount = 0 }) => {
  const { isPro, checkLimit, limit } = useTier();
  const { storageProvider } = useStorage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [showBedForm, setShowBedForm] = useState(false);
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [editingBed, setEditingBed] = useState<GardenBed | null>(null);
  
  // Step 1: Identità e Posizione
  const [name, setName] = useState(existingGarden?.name || '');
  const [latitude, setLatitude] = useState(existingGarden?.coordinates?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(existingGarden?.coordinates?.longitude?.toString() || '');
  const [altitudeMeters, setAltitudeMeters] = useState(existingGarden?.altitudeMeters?.toString() || '');
  const [inferringGeo, setInferringGeo] = useState(false);
  const [altitudeSource, setAltitudeSource] = useState<'manual' | 'inferred' | null>(null);

  // Step 2: Tipo Spazio Coltivabile
  const [gardenType, setGardenType] = useState<GardenType | ''>(existingGarden?.gardenType || '');
  const [greenhouseConfig, setGreenhouseConfig] = useState<GreenhouseConfig | undefined>(existingGarden?.greenhouseConfig);
  const [hydroponicConfig, setHydroponicConfig] = useState<HydroponicSystemConfig | undefined>(existingGarden?.hydroponicConfig);
  const [aquaponicConfig, setAquaponicConfig] = useState<AquaponicSystemConfig | undefined>(existingGarden?.aquaponicConfig);
  const [aeroponicConfig, setAeroponicConfig] = useState<AeroponicSystemConfig | undefined>(existingGarden?.aeroponicConfig);
  const [indoorConfig, setIndoorConfig] = useState<IndoorGrowingConfig | undefined>(existingGarden?.indoorConfig);

  // Step 3: Configurazione Dimensioni (NUOVO)
  const [calculatedSizeSqMeters, setCalculatedSizeSqMeters] = useState<number>(existingGarden?.sizeSqMeters || 0);
  const [calculatedSizeUnit, setCalculatedSizeUnit] = useState<AreaUnit>(existingGarden?.sizeUnit || 'sqm');
  // Per vasi
  const [potCount, setPotCount] = useState<number>(0);
  const [potDiameter, setPotDiameter] = useState<number>(0);
  // Per letti
  const [bedCount, setBedCount] = useState<number>(0);
  const [bedLength, setBedLength] = useState<number>(0);
  const [bedWidth, setBedWidth] = useState<number>(0);
  const [bedHeight, setBedHeight] = useState<number>(0);
  const [bedHoles, setBedHoles] = useState<number>(0);
  // Per campo aperto
  const [openFieldSize, setOpenFieldSize] = useState<string>(() => {
    if (existingGarden?.sizeSqMeters && existingGarden?.sizeUnit) {
      return convertFromSqMeters(existingGarden.sizeSqMeters, existingGarden.sizeUnit).toFixed(2);
    }
    return '';
  });
  const [openFieldUnit, setOpenFieldUnit] = useState<AreaUnit>(existingGarden?.sizeUnit || 'sqm');

  // Step 4: Suolo (rinumerato da Step 3)
  const [soilType, setSoilType] = useState<Garden['soilType'] | ''>(existingGarden?.soilType || '');
  const [soilPh, setSoilPh] = useState(existingGarden?.soilPh?.toString() || '');

  // Step 5: Microclima (rinumerato da Step 4)
  const [sunExposure, setSunExposure] = useState<Garden['sunExposure'] | ''>(existingGarden?.sunExposure || '');
  const [dailySunHours, setDailySunHours] = useState(existingGarden?.dailySunHours?.toString() || '');
  const [aspectDirection, setAspectDirection] = useState<Garden['aspectDirection'] | ''>(existingGarden?.aspectDirection || '');
  const [windProtection, setWindProtection] = useState<Garden['windProtection'] | ''>(existingGarden?.windProtection || '');
  const [hasCompostBin, setHasCompostBin] = useState(existingGarden?.hasCompostBin || false);
  const [isRaisedBed, setIsRaisedBed] = useState(existingGarden?.isRaisedBed || false);
  const [obstacles, setObstacles] = useState<Obstacle3D[]>(existingGarden?.obstacles || []);
  
  // Visual Sun Input (wizard semplificato)
  const [visualSunInput, setVisualSunInput] = useState<VisualSunInputData | undefined>(
    existingGarden?.visualSunInput
  );
  const [useVisualInput, setUseVisualInput] = useState(!!existingGarden?.visualSunInput);
  const [estimatedHoursFromVisual, setEstimatedHoursFromVisual] = useState<number | undefined>();
  
  // Photo Analysis (Pro Feature)
  const [noonPhoto, setNoonPhoto] = useState<File | null>(null);
  const [noonPhotoPreview, setNoonPhotoPreview] = useState<string | null>(null);
  const [horizonPhoto, setHorizonPhoto] = useState<File | null>(null);
  const [horizonPhotoPreview, setHorizonPhotoPreview] = useState<string | null>(null);
  const [panoramicPhoto, setPanoramicPhoto] = useState<File | null>(null);
  const [panoramicPhotoPreview, setPanoramicPhotoPreview] = useState<string | null>(null);
  const [analyzingPhotos, setAnalyzingPhotos] = useState(false);
  const [photoAnalysisError, setPhotoAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-riempi coordinate se esiste già un giardino
    if (existingGarden?.coordinates) {
      setLatitude(existingGarden.coordinates.latitude.toString());
      setLongitude(existingGarden.coordinates.longitude.toString());
    }
    
    // Retrocompatibilità: se esiste superficie ma non tipo, pre-compila come Campo Aperto
    if (existingGarden?.sizeSqMeters && !existingGarden?.gardenType) {
      setCalculatedSizeSqMeters(existingGarden.sizeSqMeters);
      setCalculatedSizeUnit(existingGarden.sizeUnit || 'sqm');
      if (existingGarden.sizeSqMeters && existingGarden.sizeUnit) {
        const displayValue = convertFromSqMeters(existingGarden.sizeSqMeters, existingGarden.sizeUnit).toFixed(2);
        setOpenFieldSize(displayValue);
        setOpenFieldUnit(existingGarden.sizeUnit);
      }
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
        // Temporaneamente disabilitato per evitare problemi con import dinamici in Turbopack
        // L'inferenza automatica dell'altitudine può essere riattivata quando il problema sarà risolto
        // setInferringGeo(true);
        // try {
        //   // Import dinamico usando il wrapper client-side per evitare problemi con 'use client'
        //   const geoClimateModule = await import('@/services/geoClimateService.client').catch(() => null);
        //   if (geoClimateModule && 'getGeoClimateInfo' in geoClimateModule && typeof geoClimateModule.getGeoClimateInfo === 'function') {
        //     const geoInfo = await geoClimateModule.getGeoClimateInfo(result.latitude, result.longitude, true);
        //     
        //     if (geoInfo) {
        //       setAltitudeMeters(geoInfo.altitude.toString());
        //       setAltitudeSource('inferred');
        //     }
        //   }
        // } catch (e) {
        //   console.error('Error getting geo climate info:', e);
        // }
        // setInferringGeo(false);
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
      // Validazione step 1: solo nome richiesto
      if (!name.trim()) {
        alert('Inserisci un nome per il giardino');
        return;
      }
    }
    if (step === 2) {
      // Validazione step 2: tipo selezionato (opzionale, può essere vuoto)
    }
    if (step === 3) {
      // Validazione step 3: configurazione dimensioni completata
      if (calculatedSizeSqMeters <= 0) {
        alert('Configura le dimensioni del tuo spazio coltivabile');
        return;
      }
      // Validazione specifica per tipo
      if (gardenType === 'Pot' && (potCount <= 0 || potDiameter <= 0)) {
        alert('Inserisci numero vasi e diametro');
        return;
      }
      if ((gardenType === 'RaisedBed' || gardenType === 'Container') && (bedCount <= 0 || bedLength <= 0 || bedWidth <= 0)) {
        alert('Inserisci numero letti e dimensioni');
        return;
      }
      if ((gardenType === 'OpenField' || gardenType === '') && !openFieldSize) {
        alert('Inserisci la superficie del campo aperto');
        return;
      }
      if ((gardenType === 'Greenhouse' || gardenType === 'Tunnel') && (!greenhouseConfig?.length || !greenhouseConfig?.width)) {
        alert('Configura le dimensioni della serra');
        return;
      }
      if (gardenType === 'Indoor' && (!indoorConfig?.growSpace?.length || !indoorConfig?.growSpace?.width)) {
        alert('Configura le dimensioni dello spazio indoor');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Load existing beds if editing
  useEffect(() => {
    if (existingGarden?.id) {
      const loadBeds = async () => {
        try {
          const gardenBeds = await storageProvider.getGardenBeds(existingGarden.id);
          setBeds(gardenBeds);
          
          // Retrocompatibilità: se ci sono beds ma non superficie calcolata, calcola da beds
          if (gardenBeds.length > 0 && !calculatedSizeSqMeters) {
            let totalArea = 0;
            for (const bed of gardenBeds) {
              if (bed.areaSqMeters) {
                totalArea += bed.areaSqMeters;
              } else if (bed.lengthCm && bed.widthCm) {
                totalArea += (bed.lengthCm * bed.widthCm) / 10000;
              } else if (bed.diameterCm) {
                totalArea += Math.PI * Math.pow(bed.diameterCm / 2, 2) / 10000;
              }
            }
            if (totalArea > 0) {
              setCalculatedSizeSqMeters(totalArea);
            }
          }
        } catch (error) {
          console.error('Error loading beds:', error);
        }
      };
      loadBeds();
    }
  }, [existingGarden?.id, storageProvider]);

  const handleBedSubmit = async (bedData: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const tempGardenId = existingGarden?.id || 'temp';
      const bedToSave = { ...bedData, gardenId: tempGardenId };
      
      if (editingBed) {
        // In edit mode, we'll save after completion
        const updatedBed = { ...editingBed, ...bedData };
        setBeds(beds.map(b => b.id === editingBed.id ? updatedBed : b));
      } else {
        // Create temporary bed (will be saved with proper gardenId on completion)
        const tempBed: GardenBed = {
          ...bedToSave,
          id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBeds([...beds, tempBed]);
      }
      setShowBedForm(false);
      setEditingBed(null);
    } catch (error) {
      console.error('Error saving bed:', error);
      alert('Errore nel salvare il letto');
    }
  };

  const handleBulkSubmit = async (bedsToCreate: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      const tempGardenId = existingGarden?.id || 'temp';
      const tempBeds: GardenBed[] = bedsToCreate.map((bedData, idx) => ({
        ...bedData,
        gardenId: tempGardenId,
        id: `temp_bulk_${Date.now()}_${idx}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setBeds([...beds, ...tempBeds]);
      setShowBulkCreator(false);
    } catch (error) {
      console.error('Error creating bulk beds:', error);
      alert('Errore nella creazione multipla');
    }
  };

  // Ottieni strutture disponibili (serre/tunnel nel giardino)
  const getAvailableStructures = () => {
    const structures: Array<{ id: string; name: string; type: 'Greenhouse' | 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'Indoor' }> = [];
    if (gardenType === 'Greenhouse' || gardenType === 'Tunnel') {
      structures.push({
        id: existingGarden?.id || 'temp',
        name: name || 'Serra',
        type: 'Greenhouse'
      });
    }
    return structures;
  };

  const handleDeleteBed = (bedId: string) => {
    setBeds(beds.filter(b => b.id !== bedId));
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

  /**
   * Gestisce l'upload e l'analisi di una foto panoramica 360°
   * 
   * **Perché la foto 360° è importante**:
   * - Calcola con precisione l'incidenza della luce solare e del sole sull'orto da TUTTE le direzioni
   * - Identifica ostacoli (edifici, alberi, montagne) che possono ombreggiare l'orto in momenti specifici
   * - Fornisce ore di sole per ogni direzione cardinale (Nord, Sud, Est, Ovest)
   * - Permette calcolo automatico preciso di esposizione solare e orientamento
   * 
   * **Cosa viene calcolato automaticamente**:
   * - Ore di sole giornaliere totali
   * - Tipo esposizione (FullSun/PartSun/Shade)
   * - Direzione esposizione principale (North/South/East/West/Flat)
   * - Ore sole per direzione (Nord, Sud, Est, Ovest)
   * - Ostacoli identificati con direzione, tipo e altezza
   * 
   * **Come viene usata**:
   * - Popola automaticamente i campi `dailySunHours`, `sunExposure`, `aspectDirection`
   * - Migliora la precisione dei suggerimenti dell'orchestrator basati su esposizione reale
   * - Permette di identificare zone dell'orto con esposizione diversa
   */
  const handlePanoramicPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPanoramicPhoto(file);
    setPhotoAnalysisError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPanoramicPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze panoramic photo (comprehensive analysis)
    // La foto 360° permette analisi completa esposizione da tutte le direzioni,
    // non solo un momento della giornata come la foto mezzogiorno
    try {
      setAnalyzingPhotos(true);
      const base64 = await fileToBase64(file);
      const analysis = await analyzePanoramic360(base64);
      
      // Popola tutti i campi dall'analisi panoramica
      // Questi valori vengono usati dall'orchestrator per calcoli precisi
      setDailySunHours(analysis.dailySunHours.toString());
      setSunExposure(analysis.sunExposure);
      setAspectDirection(analysis.aspectDirection);
      
      // Mostra info ostacoli se presenti
      // Gli ostacoli identificati aiutano a capire perché alcune zone hanno meno sole
      if (analysis.obstacles.length > 0) {
        const obstaclesInfo = analysis.obstacles.map(o => 
          `${o.direction}: ${o.type} (${o.height})`
        ).join(', ');
        setPhotoAnalysisError(`Ostacoli rilevati: ${obstaclesInfo}. Analisi completata.`);
      }
    } catch (error: any) {
      console.error('Error analyzing panoramic photo:', error);
      setPhotoAnalysisError('Errore nell\'analisi foto panoramica. Puoi inserire i valori manualmente.');
    } finally {
      setAnalyzingPhotos(false);
    }
  };

  const removePanoramicPhoto = () => {
    setPanoramicPhoto(null);
    setPanoramicPhotoPreview(null);
  };

  const handleComplete = async () => {
    // Verifica limite giardini per FREE (solo se non è un edit)
    if (!existingGarden) {
      const gardensLimit = checkLimit('maxGardens', existingGardensCount);
      if (!isPro && !gardensLimit.allowed) {
        alert(`Limite raggiunto: massimo ${limit('maxGardens')} orto in versione Free. Passa a Pro per orti illimitati.`);
        return;
      }
    }

    const garden: Garden = {
      id: existingGarden?.id || crypto.randomUUID(),
      name: name.trim(),
      sizeSqMeters: calculatedSizeSqMeters || 0,
      sizeUnit: calculatedSizeUnit,
      gardenType: gardenType || undefined,
      greenhouseConfig: greenhouseConfig,
      hydroponicConfig: hydroponicConfig,
      aquaponicConfig: aquaponicConfig,
      aeroponicConfig: aeroponicConfig,
      indoorConfig: indoorConfig,
      soilType: soilType || undefined,
      soilPh: soilPh ? parseFloat(soilPh) : undefined,
      coordinates: (latitude && longitude) ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      } : undefined,
      altitudeMeters: altitudeMeters ? parseFloat(altitudeMeters) : undefined,
      sunExposure: sunExposure || undefined,
      dailySunHours: useVisualInput && estimatedHoursFromVisual !== undefined
        ? estimatedHoursFromVisual
        : dailySunHours ? parseFloat(dailySunHours) : undefined,
      visualSunInput: visualSunInput,
      aspectDirection: aspectDirection || undefined,
      windProtection: windProtection || undefined,
      hasCompostBin: hasCompostBin,
      isRaisedBed: isRaisedBed,
      obstacles: obstacles.length > 0 ? obstacles : undefined,
      // panoramicPhoto non è parte dell'interfaccia Garden, viene gestito separatamente
      createdAt: existingGarden?.createdAt || new Date().toISOString()
    };

    // Save beds if any were created
    if (beds.length > 0) {
      try {
        for (const bed of beds) {
          if (bed.id.startsWith('temp_')) {
            // New bed, create with proper gardenId
            await storageProvider.createGardenBed({
              ...bed,
              gardenId: garden.id,
            });
          } else if (editingBed && bed.id === editingBed.id) {
            // Updated bed
            await storageProvider.updateGardenBed(bed.id, {
              ...bed,
              gardenId: garden.id,
            });
          }
        }
      } catch (error) {
        console.error('Error saving beds:', error);
        // Continue anyway, beds can be added later
      }
    }

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
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle size={20} /> : s}
                </div>
                {s < 6 && (
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

              {/* Badge informativo per FREE */}
              {!isPro && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>Versione Free: massimo {limit('maxGardens')} orto. Passa a Pro per orti illimitati.</span>
                  </p>
                </div>
              )}

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
                  {altitudeSource === 'inferred' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded" title="Altitudine calcolata automaticamente dalle coordinate">
                      ⚡ Inferita
                    </span>
                  )}
                  {altitudeSource === 'manual' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded" title="Altitudine inserita manualmente">
                      ✏️ Manuale
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={altitudeMeters}
                  onChange={(e) => {
                    setAltitudeMeters(e.target.value);
                    if (e.target.value) {
                      setAltitudeSource('manual');
                    } else {
                      setAltitudeSource(null);
                    }
                  }}
                  placeholder="Es. 200 (opzionale)"
                  min="0"
                  max="5000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {altitudeSource === 'inferred' 
                    ? 'Altitudine calcolata automaticamente. Puoi correggerla manualmente se necessario.'
                    : 'Se lasciato vuoto, verrà inferito automaticamente dalle coordinate (range: 0-5000m)'}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Tipo Spazio Coltivabile */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Home size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Tipo Spazio Coltivabile</h3>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 mb-2">
                  💡 <strong>Nota importante:</strong> Questo step definisce il tipo generale di spazio. 
                  Le zone specifiche (vasi, cassoni, letti rialzati) si configurano nello <strong>Step 5 (Zone di Coltivazione)</strong>, 
                  dove puoi aggiungere multipli elementi (es. "5 vasi da ø29", "3 cassoni 40x30x40").
                </p>
              </div>

              {!isPro && (
                <ProFeatureGate feature="advancedGrowingSystems">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      ⭐ I sistemi avanzati (serre, idroponica, acquaponica) sono disponibili nella versione Pro.
                    </p>
                  </div>
                </ProFeatureGate>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona Tipo Spazio Principale
                </label>
                <select
                  value={gardenType}
                  onChange={(e) => {
                    const newType = e.target.value as GardenType | '';
                    setGardenType(newType);
                    // Reset configs quando cambia tipo
                    if (newType !== 'Greenhouse' && newType !== 'Tunnel') setGreenhouseConfig(undefined);
                    if (!newType?.startsWith('Hydroponic') && newType !== 'NFT' && newType !== 'DWC' && newType !== 'EbbFlow' && newType !== 'Drip' && newType !== 'Wick' && newType !== 'Kratky') setHydroponicConfig(undefined);
                    if (newType !== 'Aquaponic') setAquaponicConfig(undefined);
                    if (newType !== 'Aeroponic') setAeroponicConfig(undefined);
                    if (newType !== 'Indoor') setIndoorConfig(undefined);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                >
                  <optgroup label="Opzioni Base (Disponibili per tutti)">
                    <option value="">Campo Aperto Tradizionale</option>
                    <option value="OpenField">Campo Aperto</option>
                    <option value="RaisedBed">Aiuola/Cassone Rialzato</option>
                    <option value="Pot">🪴 Vasi</option>
                    <option value="Container">📦 Contenitori</option>
                  </optgroup>
                  {isPro && (
                    <optgroup label="Sistemi Avanzati (Pro)">
                      <option value="Greenhouse">🌿 Serra</option>
                      <option value="Tunnel">🌿 Tunnel/Polytunnel</option>
                      <option value="Indoor">🏠 Indoor Generico</option>
                      <option value="Hydroponic">💧 Idroponica Generica</option>
                      <option value="NFT">💧 NFT (Tecnica del Film Nutriente)</option>
                      <option value="DWC">💧 DWC (Coltura in Acqua Profonda)</option>
                      <option value="EbbFlow">💧 Flusso e Riflusso</option>
                      <option value="Drip">💧 Sistema a Goccia</option>
                      <option value="Wick">💧 Sistema a Stoppino</option>
                      <option value="Kratky">💧 Metodo Kratky</option>
                      <option value="Aquaponic">🐟 Acquaponica</option>
                      <option value="Aeroponic">🌬️ Aeroponica</option>
                    </optgroup>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Puoi lasciare vuoto se coltivi principalmente in vasi o cassoni. Configurerai le zone specifiche nello Step 5.
                </p>
              </div>

              {/* Form condizionali per configurazione */}
              {isPro && gardenType === 'Greenhouse' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Configurazione Serra</h4>
                  <GreenhouseConfigForm
                    initialConfig={greenhouseConfig}
                    onSubmit={(config) => setGreenhouseConfig(config)}
                  />
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600 mb-2">
                      💡 <strong>Suggerimento:</strong> Puoi aggiungere letti dentro la serra nello Step 5 (Zone di Coltivazione).
                      I letti dentro la serra saranno automaticamente associati a questa configurazione.
                    </p>
                  </div>
                </div>
              )}

              {isPro && gardenType === 'Tunnel' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Configurazione Tunnel</h4>
                  <GreenhouseConfigForm
                    initialConfig={greenhouseConfig}
                    onSubmit={(config) => setGreenhouseConfig(config)}
                  />
                </div>
              )}

              {isPro && (gardenType === 'Hydroponic' || gardenType === 'NFT' || gardenType === 'DWC' || gardenType === 'EbbFlow' || gardenType === 'Drip' || gardenType === 'Wick' || gardenType === 'Kratky') && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Configurazione Sistema Idroponico</h4>
                  <HydroponicConfigForm
                    initialConfig={hydroponicConfig}
                    onSubmit={(config) => setHydroponicConfig(config)}
                  />
                </div>
              )}

              {isPro && gardenType === 'Aquaponic' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Configurazione Sistema Acquaponico</h4>
                  <AquaponicConfigForm
                    initialConfig={aquaponicConfig}
                    onSubmit={(config) => setAquaponicConfig(config)}
                  />
                </div>
              )}

              {isPro && gardenType === 'Aeroponic' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Configurazione Sistema Aeroponico</h4>
                  <AeroponicConfigForm
                    initialConfig={aeroponicConfig}
                    onSubmit={(config) => setAeroponicConfig(config)}
                  />
                </div>
              )}

              {isPro && gardenType === 'Indoor' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Configurazione Spazio Indoor</h4>
                  <IndoorConfigForm
                    initialConfig={indoorConfig}
                    onSubmit={(config) => setIndoorConfig(config)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Configurazione Dimensioni */}
          {step === 3 && (
            <SizeConfigurationStep
              gardenType={gardenType}
              onSizeCalculated={(sizeSqMeters, sizeUnit) => {
                setCalculatedSizeSqMeters(sizeSqMeters);
                setCalculatedSizeUnit(sizeUnit);
              }}
              initialSize={calculatedSizeSqMeters}
              initialUnit={calculatedSizeUnit}
              greenhouseConfig={greenhouseConfig}
              onGreenhouseConfigChange={setGreenhouseConfig}
              hydroponicConfig={hydroponicConfig}
              onHydroponicConfigChange={setHydroponicConfig}
              aquaponicConfig={aquaponicConfig}
              onAquaponicConfigChange={setAquaponicConfig}
              aeroponicConfig={aeroponicConfig}
              onAeroponicConfigChange={setAeroponicConfig}
              indoorConfig={indoorConfig}
              onIndoorConfigChange={setIndoorConfig}
              potCount={potCount}
              potDiameter={potDiameter}
              onPotConfigChange={(count, diameter) => {
                setPotCount(count);
                setPotDiameter(diameter);
              }}
              bedCount={bedCount}
              bedLength={bedLength}
              bedWidth={bedWidth}
              bedHeight={bedHeight}
              bedHoles={bedHoles}
              onBedConfigChange={(count, length, width, height, holes) => {
                setBedCount(count);
                setBedLength(length);
                setBedWidth(width);
                setBedHeight(height);
                setBedHoles(holes);
              }}
              openFieldSize={openFieldSize}
              openFieldUnit={openFieldUnit}
              onOpenFieldConfigChange={(size, unit) => {
                setOpenFieldSize(size);
                setOpenFieldUnit(unit);
              }}
            />
          )}

          {/* Step 4: Suolo (rinumerato da Step 3) */}
          {step === 4 && (
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

          {/* Step 5: Microclima (rinumerato da Step 4) */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sun size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Microclima</h3>
              </div>

              {/* Foto Analisi AI (Pro Feature) */}
              <ProFeatureGate
                feature="photoOnboarding"
                title="Analisi AI da Foto"
                description="Analizza automaticamente l'esposizione solare dalle tue foto"
                requiredTier="PRO"
              >
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

                  {/* Foto Panoramica 360° (Opzionale - Analisi Completa) */}
                  {/* 
                    IMPORTANTE: La foto panoramica 360° è fondamentale per calcolare con precisione
                    l'incidenza della luce solare e del sole sull'orto.
                    
                    Perché è importante:
                    - Analizza l'esposizione solare da TUTTE le direzioni (Nord, Sud, Est, Ovest)
                    - Identifica ostacoli (edifici, alberi, montagne) che possono ombreggiare l'orto
                    - Calcola ore di sole per ogni direzione, non solo un momento (come foto mezzogiorno)
                    - Permette calcolo automatico preciso di esposizione e orientamento
                    
                    Cosa viene analizzato:
                    - Ore sole per direzione cardinale
                    - Ostacoli con direzione, tipo e altezza
                    - Esposizione complessiva (FullSun/PartSun/Shade)
                    - Direzione esposizione principale
                    
                    Come viene usata:
                    - Popola automaticamente campi esposizione solare e orientamento
                    - Migliora precisione suggerimenti orchestrator basati su esposizione reale
                  */}
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      🌐 Foto Panoramica 360° (Opzionale) - Analisi completa esposizione
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      <strong>Per calcolare bene l'incidenza della luce e del sole sull'orto</strong>, 
                      carica una foto panoramica 360° che permette un'analisi completa dell'esposizione 
                      solare da tutte le direzioni. Identifica ostacoli (edifici, alberi) e calcola 
                      ore di sole per ogni direzione cardinale.
                    </p>
                    {panoramicPhotoPreview ? (
                      <div className="relative">
                        <img
                          src={panoramicPhotoPreview}
                          alt="Foto panoramica 360°"
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={removePanoramicPhoto}
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
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                        <Upload size={24} className="text-purple-400 mb-2" />
                        <span className="text-xs text-gray-600">Clicca per caricare foto panoramica 360°</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePanoramicPhotoChange}
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
              </ProFeatureGate>

              {/* Wizard Visivo Esposizione Solare */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Sun size={16} />
                    Esposizione Solare
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseVisualInput(!useVisualInput);
                      if (!useVisualInput && visualSunInput) {
                        // Calcola ore stimate quando si attiva
                        const lat = parseFloat(latitude) || 0;
                        const lng = parseFloat(longitude) || 0;
                        const hours = convertVisualInputToSunHours(visualSunInput, lat, lng);
                        setEstimatedHoursFromVisual(hours);
                        setDailySunHours(hours.toFixed(1));
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    {useVisualInput ? 'Usa input manuale' : 'Usa wizard visivo'}
                  </button>
                </div>

                {useVisualInput ? (
                  <VisualSunInput
                    value={visualSunInput}
                    onChange={(data) => {
                      setVisualSunInput(data);
                      const lat = parseFloat(latitude) || 0;
                      const lng = parseFloat(longitude) || 0;
                      const hours = convertVisualInputToSunHours(data, lat, lng);
                      setEstimatedHoursFromVisual(hours);
                      setDailySunHours(hours.toFixed(1));
                      
                      // Aggiorna anche sunExposure basandosi su ore
                      if (hours >= 8) {
                        setSunExposure('FullSun');
                      } else if (hours >= 4) {
                        setSunExposure('PartSun');
                      } else {
                        setSunExposure('Shade');
                      }
                    }}
                    estimatedHours={estimatedHoursFromVisual}
                  />
                ) : (
                  <>
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ore di Sole Giornaliere (opzionale)
                      </label>
                      <input
                        type="number"
                        value={dailySunHours}
                        onChange={(e) => setDailySunHours(e.target.value)}
                        placeholder="Es. 6"
                        min="0"
                        max="12"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
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

              {/* Gestione Ostacoli */}
              {(latitude && longitude) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Ostacoli (Opzionale)</h4>
                    <InfoTooltip
                      content="Aggiungi ostacoli come palazzi, alberi o montagne che possono bloccare il sole. Questo migliora la precisione del calcolo dell'esposizione solare giorno-per-giorno."
                      size="sm"
                    />
                  </div>
                  <ObstacleManager
                    garden={{
                      id: existingGarden?.id || '',
                      name: name || '',
                      coordinates: (latitude && longitude) ? {
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude)
                      } : undefined,
                      sizeSqMeters: calculatedSizeSqMeters || 0,
                      createdAt: existingGarden?.createdAt || new Date().toISOString()
                    }}
                    obstacles={obstacles}
                    onObstaclesChange={setObstacles}
                  />
                </div>
              )}

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

          {/* Step 6: Zone Aggiuntive (Opzionale, rinumerato da Step 5) */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Grid size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Zone di Coltivazione (Opzionale)</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 mb-2">
                  💡 <strong>Consiglio:</strong> Definisci le tue zone di coltivazione (cassoni, letti rialzati, vasi) 
                  per organizzare meglio il tuo giardino e calcolare lo spazio disponibile. Puoi sempre aggiungerle dopo.
                </p>
                <div className="mt-3 pt-3 border-t border-blue-300">
                  <p className="text-sm font-semibold text-blue-900 mb-1">✨ Funzionalità disponibili:</p>
                  <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                    <li><strong>Aggiungi Zona:</strong> Aggiungi una singola zona (vaso, cassone, letto) con misure personalizzate</li>
                    <li><strong>Aggiungi Multipli:</strong> Aggiungi più zone dello stesso tipo in una volta (es. "5 vasi da ø29", "3 cassoni 40x30x40")</li>
                    <li>Puoi associare zone a strutture esistenti (serre, tunnel) se configurate nello Step 2</li>
                  </ul>
                </div>
              </div>

              {showBulkCreator ? (
                <BulkBedCreator
                  garden={{
                    id: existingGarden?.id || 'temp',
                    name: name || '',
                    sizeSqMeters: calculatedSizeSqMeters || 0,
                    gardenType: gardenType || undefined,
                    createdAt: existingGarden?.createdAt || new Date().toISOString()
                  }}
                  onAddMultiple={handleBulkSubmit}
                  onCancel={() => setShowBulkCreator(false)}
                  existingStructures={getAvailableStructures()}
                />
              ) : showBedForm ? (
                <BedForm
                  garden={{
                    id: existingGarden?.id || 'temp',
                    name: name || '',
                    sizeSqMeters: calculatedSizeSqMeters || 0,
                    gardenType: gardenType || undefined,
                    createdAt: existingGarden?.createdAt || new Date().toISOString()
                  }}
                  bed={editingBed}
                  onSave={handleBedSubmit}
                  onCancel={() => {
                    setShowBedForm(false);
                    setEditingBed(null);
                  }}
                />
              ) : (
                <>
                  {beds.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {beds.map(bed => (
                        <div
                          key={bed.id}
                          className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-gray-800">{bed.name}</div>
                            <div className="text-sm text-gray-600">
                              {bed.bedType} - {bed.areaSqMeters?.toFixed(2)} m²
                              {bed.isCovered && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Dentro serra
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteBed(bed.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingBed(null);
                        setShowBedForm(true);
                        setShowBulkCreator(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus size={18} />
                      Aggiungi Zona
                    </button>
                    <button
                      onClick={() => {
                        setShowBulkCreator(true);
                        setShowBedForm(false);
                        setEditingBed(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Layers size={18} />
                      Aggiungi Multipli
                    </button>
                  </div>

                  {beds.length === 0 && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Nessuna zona definita. Puoi aggiungerle dopo dalla gestione giardino.
                    </p>
                  )}
                </>
              )}
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

            {step < 6 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Avanti
                <ArrowRight size={18} />
              </button>
            ) : step === 6 ? (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={18} />
                Completa
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenOnboarding;

