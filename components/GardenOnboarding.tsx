import React, { useState, useEffect, useCallback } from 'react';
import { Garden, GardenType, StructureConfig } from '../types';
import { getCurrentPositionWithRetry, getCurrentPositionForceRefresh, getCurrentPositionWithAccuracy, getDefaultCoordinates } from '../services/geolocationService';
import { getGeoClimateInfo } from '../services/geoClimateService';
import { analyzeSunExposure, analyzeAspectDirection, analyzePanoramic360, fileToBase64 } from '../services/photoAnalysisService';
import { convertToSqMeters, convertFromSqMeters, AreaUnit } from '../utils/areaConverter';
import { MapPin, ArrowRight, ArrowLeft, Loader2, CheckCircle, Mountain, Sun, Wind, Home, Camera, Upload, X, Shovel, Info, Grid } from 'lucide-react';
import { ObstacleManager } from './sunExposure/ObstacleManager';
import { Obstacle3D } from '../services/preciseSunCalculator';
import { InfoTooltip } from './shared/InfoTooltip';
import VisualSunInput, { VisualSunInputData } from './sunExposure/VisualSunInput';
import { convertVisualInputToSunHours } from '../services/visualSunInputConverter';
import { SizeConfigurationStep } from './gardens/SizeConfigurationStep';
import { AdvancedSunExposureWizard } from './sunExposure/AdvancedSunExposureWizard';
import { GreenhouseConfig } from '../types/greenhouse';
import { HydroponicSystemConfig, AquaponicSystemConfig, AeroponicSystemConfig, IndoorGrowingConfig } from '../types/indoorGrowing';
import { useTier } from '../packages/core/hooks/useTier';
import { ProFeatureGate } from './shared/ProFeatureGate';
import { getDeviceHeadingOnce } from '../hooks/useDeviceOrientation';
import { readEXIF, calculateNorthOffsetFromEXIF } from '../services/exifReader';
import { CompassCalibrator } from './sunExposure/CompassCalibrator';

interface GardenOnboardingProps {
  onComplete: (garden: Garden) => void;
  onCancel: () => void;
  existingGarden?: Garden; // Per edit
  initialGardenType?: 'Orchard' | 'OliveGrove' | 'Vineyard' | 'Hydroponic' | 'Aquaponic' | 'Aeroponic'; // Tipo pre-selezionato per wizard unificato
  initialHydroponicType?: 'NFT' | 'DWC' | 'EbbFlow' | 'Drip' | 'Wick' | 'Kratky'; // Tipo sistema idroponico pre-selezionato
}

const GardenOnboarding: React.FC<GardenOnboardingProps> = ({ onComplete, onCancel, existingGarden, initialGardenType, initialHydroponicType }) => {
  const { isPro } = useTier();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Nome Giardino
  const [name, setName] = useState(existingGarden?.name || '');
  
  // Step 2: Tipo Giardino
  const [gardenType, setGardenType] = useState<GardenType | ''>(existingGarden?.gardenType || initialGardenType || '');
  const [greenhouseConfig, setGreenhouseConfig] = useState<GreenhouseConfig | undefined>(existingGarden?.greenhouseConfig);
  const [hydroponicConfig, setHydroponicConfig] = useState<HydroponicSystemConfig | undefined>(existingGarden?.hydroponicConfig);
  const [aquaponicConfig, setAquaponicConfig] = useState<AquaponicSystemConfig | undefined>(existingGarden?.aquaponicConfig);
  const [aeroponicConfig, setAeroponicConfig] = useState<AeroponicSystemConfig | undefined>(existingGarden?.aeroponicConfig);
  const [indoorConfig, setIndoorConfig] = useState<IndoorGrowingConfig | undefined>(existingGarden?.indoorConfig);
  
  // Step 3: Posizione Geografica (condizionale)
  const [latitude, setLatitude] = useState(existingGarden?.coordinates?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(existingGarden?.coordinates?.longitude?.toString() || '');
  const [altitudeMeters, setAltitudeMeters] = useState(existingGarden?.altitudeMeters?.toString() || '');
  const [inferringGeo, setInferringGeo] = useState(false);
  const [altitudeSource, setAltitudeSource] = useState<'manual' | 'inferred' | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | undefined>(undefined);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  
  // Determina se Step 3 è necessario
  const needsLocation = !['Indoor', 'Hydroponic', 'Aquaponic', 'Aeroponic', 'Orchard', 'OliveGrove', 'Vineyard'].includes(gardenType);

  // Step 4: Configurazione Strutture e Dimensioni
  const [calculatedSizeSqMeters, setCalculatedSizeSqMeters] = useState<number>(existingGarden?.sizeSqMeters || 0);
  const [calculatedSizeUnit, setCalculatedSizeUnit] = useState<AreaUnit>(existingGarden?.sizeUnit || 'sqm');
  const [potCount, setPotCount] = useState<number>(0);
  const [potDiameter, setPotDiameter] = useState<number>(0);
  const [bedCount, setBedCount] = useState<number>(0);
  const [bedLength, setBedLength] = useState<number>(0);
  const [bedWidth, setBedWidth] = useState<number>(0);
  const [bedHeight, setBedHeight] = useState<number>(0);
  const [bedHoles, setBedHoles] = useState<number>(0);
  const [containerCount, setContainerCount] = useState<number>(0);
  const [containerLength, setContainerLength] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [containerHoles, setContainerHoles] = useState<number>(0);
  const [tankCount, setTankCount] = useState<number>(0);
  const [tankLength, setTankLength] = useState<number>(0);
  const [tankWidth, setTankWidth] = useState<number>(0);
  const [tankHeight, setTankHeight] = useState<number>(0);
  const [tankHoles, setTankHoles] = useState<number>(0);
  const [openFieldSize, setOpenFieldSize] = useState<string>(() => {
    if (existingGarden?.sizeSqMeters && existingGarden?.sizeUnit) {
      return convertFromSqMeters(existingGarden.sizeSqMeters, existingGarden.sizeUnit).toFixed(2);
    }
    return '';
  });
  const [openFieldUnit, setOpenFieldUnit] = useState<AreaUnit>(existingGarden?.sizeUnit || 'sqm');
  const [structureConfig, setStructureConfig] = useState<StructureConfig | undefined>(
    existingGarden?.structureConfig
  );

  // Step 5: Suolo
  const [soilType, setSoilType] = useState<Garden['soilType'] | ''>(existingGarden?.soilType || '');
  const [soilPh, setSoilPh] = useState(existingGarden?.soilPh?.toString() || '');

  // Step 6: Microclima
  const [sunExposure, setSunExposure] = useState<Garden['sunExposure'] | ''>(existingGarden?.sunExposure || '');
  const [dailySunHours, setDailySunHours] = useState(existingGarden?.dailySunHours?.toString() || '');
  const [aspectDirection, setAspectDirection] = useState<Garden['aspectDirection'] | ''>(existingGarden?.aspectDirection || '');
  const [windProtection, setWindProtection] = useState<Garden['windProtection'] | ''>(existingGarden?.windProtection || '');
  const [hasCompostBin, setHasCompostBin] = useState(existingGarden?.hasCompostBin || false);
  // isRaisedBed deprecato - gestito tramite garden_beds con bedType: 'RaisedBed'
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
  const [photoNorthOffset, setPhotoNorthOffset] = useState<number | undefined>(existingGarden?.photoNorthOffset);
  const [showCompassCalibrator, setShowCompassCalibrator] = useState(false);

  // Callback handlers memoized con useCallback per evitare loop infiniti
  const handleSizeCalculated = useCallback((sizeSqMeters: number, sizeUnit: AreaUnit) => {
    setCalculatedSizeSqMeters(sizeSqMeters);
    setCalculatedSizeUnit(sizeUnit);
  }, []);

  const handleGreenhouseConfigChange = useCallback((config: GreenhouseConfig) => {
    setGreenhouseConfig(config);
  }, []);

  const handleHydroponicConfigChange = useCallback((config: HydroponicSystemConfig) => {
    setHydroponicConfig(config);
  }, []);

  const handleAquaponicConfigChange = useCallback((config: AquaponicSystemConfig) => {
    setAquaponicConfig(config);
  }, []);

  const handleAeroponicConfigChange = useCallback((config: AeroponicSystemConfig) => {
    setAeroponicConfig(config);
  }, []);

  const handleIndoorConfigChange = useCallback((config: IndoorGrowingConfig) => {
    setIndoorConfig(config);
  }, []);

  const handlePotConfigChange = useCallback((count: number, diameter: number) => {
    setPotCount(count);
    setPotDiameter(diameter);
  }, []);

  const handleBedConfigChange = useCallback((count: number, length: number, width: number, height: number, holes: number) => {
    setBedCount(count);
    setBedLength(length);
    setBedWidth(width);
    setBedHeight(height);
    setBedHoles(holes);
  }, []);

  const handleContainerConfigChange = useCallback((count: number, length: number, width: number, height: number, holes: number) => {
    setContainerCount(count);
    setContainerLength(length);
    setContainerWidth(width);
    setContainerHeight(height);
    setContainerHoles(holes);
  }, []);

  const handleTankConfigChange = useCallback((count: number, length: number, width: number, height: number, holes: number) => {
    setTankCount(count);
    setTankLength(length);
    setTankWidth(width);
    setTankHeight(height);
    setTankHoles(holes);
  }, []);

  const handleOpenFieldConfigChange = useCallback((size: string, unit: AreaUnit) => {
    setOpenFieldSize(size);
    setOpenFieldUnit(unit);
  }, []);

  const handleStructureConfigChange = useCallback((config: StructureConfig) => {
    setStructureConfig(config);
  }, []);

  useEffect(() => {
    // Auto-riempi coordinate se esiste già un giardino
    if (existingGarden?.coordinates) {
      setLatitude(existingGarden.coordinates.latitude.toString());
      setLongitude(existingGarden.coordinates.longitude.toString());
    }
    
    // Inizializza configurazione idroponica se tipo pre-selezionato
    if (initialHydroponicType && !existingGarden && !hydroponicConfig) {
      setHydroponicConfig({
        systemType: initialHydroponicType,
        nutrientSolution: {
          reservoirCapacity: 50,
          phTarget: 6.0,
          ecTarget: 2.0,
        },
        maintenance: {
          changeFrequencyDays: 14,
          phCheckFrequencyDays: 2,
        },
      });
    }
    
    // Geolocalizzazione automatica al mount se non esistente e necessario
    if (!existingGarden && !latitude && !longitude && needsLocation && step >= 3) {
      handleGetLocation(false); // Auto-detect senza forzare refresh
    }
    
    // Se initialGardenType è presente, salta lo step 2 (tipo giardino)
    if (initialGardenType && !existingGarden && step === 1) {
      // Il tipo è già impostato, dopo step 1 vai direttamente allo step 3 (posizione) o 4 (dimensioni)
      // La logica di skip sarà gestita in handleNext
    }
  }, [existingGarden, initialGardenType, initialHydroponicType, step]);

  // Inizializza stati da structureConfig esistente
  useEffect(() => {
    if (existingGarden?.structureConfig) {
      const config = existingGarden.structureConfig;
      
      // Ripristina campo aperto
      if (config.openField) {
        setOpenFieldSize(config.openField.size.toString());
        setOpenFieldUnit(config.openField.unit);
      }
      
      // Ripristina vasi
      if (config.pots && config.pots.length > 0) {
        const pot = config.pots[0];
        setPotCount(pot.count);
        setPotDiameter(pot.diameter);
      }
      
      // Ripristina letti
      if (config.beds && config.beds.length > 0) {
        const bed = config.beds[0];
        setBedCount(bed.count);
        setBedLength(bed.length);
        setBedWidth(bed.width);
        setBedHeight(bed.height);
        setBedHoles(bed.holes || 0);
      }
      
      // Ripristina cassoni
      if (config.containers && config.containers.length > 0) {
        const container = config.containers[0];
        setContainerCount(container.count);
        setContainerLength(container.length);
        setContainerWidth(container.width);
        setContainerHeight(container.height);
        setContainerHoles(container.holes || 0);
      }
      
      // Ripristina vasche
      if (config.tanks && config.tanks.length > 0) {
        const tank = config.tanks[0];
        setTankCount(tank.count);
        setTankLength(tank.length);
        setTankWidth(tank.width);
        setTankHeight(tank.height);
        setTankHoles(tank.holes || 0);
      }
    }
  }, [existingGarden]);

  const handleGetLocation = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setIsRefreshingLocation(false);
    try {
      // Usa funzione con alta precisione per distinguere serre/campi vicini
      // Accetta solo se accuratezza < 20m (sufficiente per distinguere posizioni a pochi metri)
      const result = forceRefresh
        ? await getCurrentPositionForceRefresh({ timeout: 20000 })
        : await getCurrentPositionWithAccuracy(20, 2, { timeout: 20000 });

      if (result.success && result.latitude && result.longitude) {
        setLatitude(result.latitude.toString());
        setLongitude(result.longitude.toString());
        setLocationAccuracy(result.accuracy);

        // Usa altitudine dal GPS se disponibile (più precisa)
        if (result.altitude !== null && result.altitude !== undefined) {
          setAltitudeMeters(Math.round(result.altitude).toString());
          setAltitudeSource('inferred');
        } else {
          // Altrimenti prova a inferire altitudine da servizio geoclimatico
          setInferringGeo(true);
          const geoInfo = await getGeoClimateInfo(result.latitude, result.longitude, true);

          if (geoInfo) {
            setAltitudeMeters(geoInfo.altitude.toString());
            setAltitudeSource('inferred');
          }
          setInferringGeo(false);
        }
      } else {
        // Fallback a coordinate default
        const defaultCoords = getDefaultCoordinates();
        setLatitude(defaultCoords.latitude.toString());
        setLongitude(defaultCoords.longitude.toString());
        setLocationAccuracy(undefined);
      }
    } catch (error: any) {
      // Filtra errori temporanei (kCLErrorLocationUnknown) per evitare spam nella console
      const errorMessage = error?.message || '';
      const isLocationUnknown = errorMessage.includes('kCLErrorLocationUnknown') || 
                               errorMessage.includes('locationUnknown') ||
                               errorMessage.includes('LocationUnknown');
      
      // Log solo errori critici, non quelli temporanei
      if (!isLocationUnknown) {
        console.error('Error getting location:', error);
      }
      const defaultCoords = getDefaultCoordinates();
      setLatitude(defaultCoords.latitude.toString());
      setLongitude(defaultCoords.longitude.toString());
      setLocationAccuracy(undefined);
    } finally {
      setLoading(false);
      setIsRefreshingLocation(false);
      setInferringGeo(false);
    }
  };

  const handleRefreshLocation = async () => {
    setIsRefreshingLocation(true);
    await handleGetLocation(true);
  };

  const handleNext = () => {
    if (step === 1) {
      // Validazione step 1: solo nome richiesto
      if (!name.trim()) {
        alert('Inserisci un nome per il giardino');
        return;
      }
      // Se initialGardenType è presente, salta step 2
      if (initialGardenType) {
        if (!needsLocation) {
          setStep(4);
        } else {
          setStep(3);
        }
        return;
      }
    }
    if (step === 2) {
      // Validazione step 2: tipo selezionato (opzionale, può essere vuoto)
      // Se tipo richiede posizione, vai a Step 3, altrimenti salta a Step 4
      if (!needsLocation) {
        // Salta Step 3 (posizione) per indoor/idroponico
        setStep(4);
        return;
      }
    }
    if (step === 3) {
      // Validazione step 3: posizione geografica (solo se necessaria)
      if (needsLocation && (!latitude || !longitude)) {
        alert('Inserisci latitudine e longitudine');
        return;
      }
    }
    if (step === 4) {
      // Validazione step 4: configurazione dimensioni completata
      if (calculatedSizeSqMeters <= 0) {
        alert('Configura le dimensioni del tuo spazio coltivabile');
        return;
      }
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

    // Tentativo 1: Cattura orientamento dispositivo durante selezione file
    let deviceHeading: number | null = null;
    try {
      deviceHeading = await getDeviceHeadingOnce();
      if (deviceHeading !== null) {
        // Se abbiamo heading dispositivo, quello è il Nord nella foto
        // Offset = 0 - heading (perché vogliamo sapere quanto ruotare la foto)
        // Ma in realtà, se il dispositivo punta a Nord (0°), la foto è già orientata correttamente
        // Quindi offset = 0 se heading = 0
        setPhotoNorthOffset(0); // Assumiamo che la foto sia stata scattata con dispositivo orientato correttamente
        console.log('Device heading captured:', deviceHeading);
      }
    } catch (error) {
      console.warn('Could not capture device orientation:', error);
    }

    // Tentativo 2: Leggi EXIF dalla foto
    let exifOffset: number | null = null;
    if (deviceHeading === null) {
      try {
        const exifData = await readEXIF(file);
        if (exifData) {
          exifOffset = calculateNorthOffsetFromEXIF(exifData);
          if (exifOffset !== null) {
            setPhotoNorthOffset(exifOffset);
            console.log('EXIF offset calculated:', exifOffset);
          }
        }
      } catch (error) {
        console.warn('Could not read EXIF data:', error);
      }
    }

    // Tentativo 3: Se entrambi falliscono, mostra calibratore manuale
    if (deviceHeading === null && exifOffset === null) {
      setShowCompassCalibrator(true);
      return; // Non analizzare ancora, aspetta calibrazione
    }

    // Analizza foto con offset determinato
    await analyzePanoramicPhotoWithOffset(file, photoNorthOffset || 0);
  };

  /**
   * Analizza foto panoramica con offset Nord già determinato
   */
  const analyzePanoramicPhotoWithOffset = async (file: File, offset: number) => {
    try {
      setAnalyzingPhotos(true);
      const base64 = await fileToBase64(file);
      const analysis = await analyzePanoramic360(base64);
      
      // Popola tutti i campi dall'analisi panoramica
      setDailySunHours(analysis.dailySunHours.toString());
      setSunExposure(analysis.sunExposure);
      setAspectDirection(analysis.aspectDirection);
      
      // Mostra info ostacoli se presenti
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

  /**
   * Gestisce conferma calibrazione manuale
   */
  const handleCompassCalibrationConfirm = async (offset: number) => {
    setPhotoNorthOffset(offset);
    setShowCompassCalibrator(false);
    
    // Ora analizza la foto con offset determinato
    if (panoramicPhoto) {
      await analyzePanoramicPhotoWithOffset(panoramicPhoto, offset);
    }
  };

  const removePanoramicPhoto = () => {
    setPanoramicPhoto(null);
    setPanoramicPhotoPreview(null);
    setPhotoNorthOffset(undefined);
  };

  const handleComplete = () => {
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
      photoNorthOffset: photoNorthOffset,
      // isRaisedBed deprecato - gestito tramite garden_beds con bedType: 'RaisedBed'
      obstacles: obstacles.length > 0 ? obstacles : undefined,
      structureConfig: structureConfig,
      createdAt: existingGarden?.createdAt || new Date().toISOString()
    };

    onComplete(garden);
  };

  return (
    <>
      {showCompassCalibrator && panoramicPhotoPreview && (
        <CompassCalibrator
          photoUrl={panoramicPhotoPreview}
          onConfirm={handleCompassCalibrationConfirm}
          onCancel={() => {
            setShowCompassCalibrator(false);
            // Se l'utente annulla, rimuovi la foto
            removePanoramicPhoto();
          }}
          initialOffset={photoNorthOffset || 0}
        />
      )}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
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

          {/* Step 1: Nome Giardino */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Home size={24} className="text-green-600" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Nome Giardino</h3>
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
                <p className="text-xs text-gray-500 mt-1">
                  Scegli un nome che ti aiuti a identificare questo giardino
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Tipo Giardino */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Grid size={24} className="text-green-600" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Tipo Giardino</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 mb-2">
                  💡 <strong>Nota importante:</strong> Questo step definisce il tipo generale di spazio. 
                  Le zone specifiche (vasi, cassoni, letti rialzati) si configurano nello <strong>Step 4 (Configurazione Strutture e Dimensioni)</strong>, 
                  dove puoi aggiungere multipli elementi (es. "5 vasi da ø29", "3 cassoni 40x30x40").
                </p>
              </div>

              {initialGardenType && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    <strong>Tipo pre-selezionato:</strong> {initialGardenType === 'Orchard' ? 'Frutteto' : initialGardenType === 'OliveGrove' ? 'Oliveto' : 'Vigneto'}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di Spazio Coltivabile
                </label>
                <select
                  value={gardenType}
                  onChange={(e) => setGardenType(e.target.value as GardenType | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!!initialGardenType} // Disabilita se pre-selezionato
                >
                  <option value="">Seleziona tipo di spazio...</option>
                  <option value="OpenField">Campo Aperto</option>
                  <option value="Greenhouse">Serra</option>
                  <option value="Tunnel">Tunnel/Polytunnel</option>
                  <option value="RaisedBed">Aiuole/Cassoni Rialzati</option>
                  <option value="Pot">Vasi</option>
                  <option value="Container">Contenitori</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Hydroponic">Idroponica</option>
                  <option value="Aquaponic">Acquaponica</option>
                  <option value="Aeroponic">Aeroponica</option>
                  <option value="Orchard">Frutteto</option>
                  <option value="OliveGrove">Oliveto</option>
                  <option value="Vineyard">Vigneto</option>
                </select>
              </div>

              {isPro && (gardenType === 'Greenhouse' || gardenType === 'Tunnel') && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Configurazione {gardenType === 'Greenhouse' ? 'Serra' : 'Tunnel'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    La configurazione dettagliata della serra/tunnel sarà disponibile nello Step 4 (Configurazione Strutture e Dimensioni).
                  </p>
                </div>
              )}

              {isPro && ['Hydroponic', 'Aquaponic', 'Aeroponic', 'Indoor'].includes(gardenType) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Configurazione Sistema {gardenType}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    La configurazione dettagliata del sistema sarà disponibile nello Step 4 (Configurazione Strutture e Dimensioni).
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Posizione Geografica (Condizionale) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={24} className="text-green-600" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Posizione Geografica</h3>
              </div>

              {!needsLocation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        Posizione Geografica Opzionale
                      </p>
                      <p className="text-xs text-blue-700">
                        Per giardini indoor e sistemi idroponici/acquaponici/aeroponici, la posizione geografica 
                        è opzionale poiché il clima è controllato artificialmente. Puoi comunque inserirla per 
                        statistiche e analisi generali.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(gardenType === 'Greenhouse' || gardenType === 'Tunnel') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-800 mb-1">
                        Posizione Importante per Serre/Tunnel
                      </p>
                      <p className="text-xs text-green-700">
                        La posizione geografica è importante per calcolare il clima interno della serra/tunnel, 
                        che è influenzato dal clima locale esterno. Questo aiuta a fornire suggerimenti più 
                        precisi per la gestione della serra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitudine {needsLocation && '*'}
                  </label>
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Es. 41.9028"
                    step="0.0001"
                    required={needsLocation}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitudine {needsLocation && '*'}
                  </label>
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Es. 12.4964"
                    step="0.0001"
                    required={needsLocation}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleGetLocation(false)}
                  disabled={loading || isRefreshingLocation}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
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

                {/* Mostra accuratezza se disponibile */}
                {locationAccuracy !== undefined && (
                  <div className={`p-3 rounded-lg border-2 ${
                    locationAccuracy <= 10 
                      ? 'bg-green-50 border-green-200' 
                      : locationAccuracy <= 20 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          Accuratezza: ±{Math.round(locationAccuracy)}m
                        </div>
                        {locationAccuracy > 20 && (
                          <div className="text-xs text-orange-700 mt-1">
                            ⚠️ Precisione bassa. Per distinguere serre/campi vicini, usa il pulsante "Aggiorna GPS" per ottenere maggiore precisione.
                          </div>
                        )}
                        {locationAccuracy <= 10 && (
                          <div className="text-xs text-green-700 mt-1">
                            ✓ Precisione ottimale per distinguere posizioni vicine
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pulsante per forzare refresh GPS con alta precisione */}
                {(locationAccuracy === undefined || locationAccuracy > 20) && (
                  <button
                    onClick={handleRefreshLocation}
                    disabled={loading || isRefreshingLocation}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 text-sm"
                  >
                    {isRefreshingLocation ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Aggiornamento GPS...</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={16} />
                        <span>🔄 Aggiorna GPS (alta precisione)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {inferringGeo && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Inferenza dati geoclimatici...</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-3">
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

          {/* Step 4: Configurazione Strutture e Dimensioni */}
          {step === 4 && (
            <SizeConfigurationStep
              gardenType={gardenType}
              onSizeCalculated={handleSizeCalculated}
              initialSize={calculatedSizeSqMeters}
              initialUnit={calculatedSizeUnit}
              greenhouseConfig={greenhouseConfig}
              onGreenhouseConfigChange={handleGreenhouseConfigChange}
              hydroponicConfig={hydroponicConfig}
              onHydroponicConfigChange={handleHydroponicConfigChange}
              aquaponicConfig={aquaponicConfig}
              onAquaponicConfigChange={handleAquaponicConfigChange}
              aeroponicConfig={aeroponicConfig}
              onAeroponicConfigChange={handleAeroponicConfigChange}
              indoorConfig={indoorConfig}
              onIndoorConfigChange={handleIndoorConfigChange}
              potCount={potCount}
              potDiameter={potDiameter}
              onPotConfigChange={handlePotConfigChange}
              bedCount={bedCount}
              bedLength={bedLength}
              bedWidth={bedWidth}
              bedHeight={bedHeight}
              bedHoles={bedHoles}
              onBedConfigChange={handleBedConfigChange}
              containerCount={containerCount}
              containerLength={containerLength}
              containerWidth={containerWidth}
              containerHeight={containerHeight}
              containerHoles={containerHoles}
              onContainerConfigChange={handleContainerConfigChange}
              tankCount={tankCount}
              tankLength={tankLength}
              tankWidth={tankWidth}
              tankHeight={tankHeight}
              tankHoles={tankHoles}
              onTankConfigChange={handleTankConfigChange}
              openFieldSize={openFieldSize}
              openFieldUnit={openFieldUnit}
              onOpenFieldConfigChange={handleOpenFieldConfigChange}
              onStructureConfigChange={handleStructureConfigChange}
            />
          )}

          {/* Step 5: Suolo */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Shovel size={24} className="text-green-600" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Struttura Suolo</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      Informazioni sul Suolo
                    </p>
                    <p className="text-xs text-blue-700">
                      Il tipo di terreno e il pH influenzano la disponibilità dei nutrienti per le piante. 
                      Conoscere queste informazioni aiuta a fornire suggerimenti più precisi per la fertilizzazione e la gestione del suolo.
                    </p>
                  </div>
                </div>
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
                  <option value="Loamy">Franco (Ideale) - Equilibrio perfetto di sabbia, limo e argilla</option>
                  <option value="Sandy">Sabbioso - Drena rapidamente, richiede irrigazioni frequenti</option>
                  <option value="Clay">Argilloso - Trattiene acqua, può compattarsi</option>
                  <option value="Peaty">Torba - Ricco di materia organica, acido</option>
                  <option value="Chalky">Calcareo - Alcalino, può causare carenze di ferro</option>
                  <option value="Silty">Limoso - Fine e fertile, buona ritenzione idrica</option>
                </select>
                {soilType && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-700">
                      {soilType === 'Loamy' && 'Il terreno franco è considerato ideale per la maggior parte delle colture. Ha un buon equilibrio di sabbia, limo e argilla, offrendo ottimo drenaggio e ritenzione idrica. pH ideale: 6.0-7.0'}
                      {soilType === 'Sandy' && 'Il terreno sabbioso drena molto rapidamente e si riscalda in fretta. Tende a perdere nutrienti facilmente e richiede irrigazioni e fertilizzazioni più frequenti. pH ideale: 5.5-7.0'}
                      {soilType === 'Clay' && 'Il terreno argilloso è pesante e trattiene molta acqua, ma drena lentamente. Può essere difficile da lavorare e tende a compattarsi, ma è ricco di nutrienti. pH ideale: 6.0-7.5'}
                      {soilType === 'Peaty' && 'Il terreno torboso è ricco di materia organica, acido e trattiene molta acqua. È leggero ma può avere carenze di alcuni nutrienti. pH ideale: 4.0-5.5'}
                      {soilType === 'Chalky' && 'Il terreno calcareo è alcalino e spesso povero di materia organica. Drena rapidamente ma può causare carenze di ferro e manganese. pH ideale: 7.0-8.0'}
                      {soilType === 'Silty' && 'Il terreno limoso è fine e fertile, con buona ritenzione idrica e drenaggio. Può compattarsi se lavorato quando bagnato. pH ideale: 6.0-7.0'}
                    </p>
                  </div>
                )}
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
                  Il pH del suolo influenza la disponibilità dei nutrienti per le piante. Un pH tra 6.0 e 7.0 è generalmente ottimale per la maggior parte delle colture.
                </p>
                {soilPh && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-700">
                      pH {soilPh}: {
                        parseFloat(soilPh) < 6.0 ? 'Acido - Ideale per piante acidofile (es. mirtilli, azalee)' :
                        parseFloat(soilPh) > 7.5 ? 'Alcalino - Ideale per piante alcalofile (es. cavoli, asparagi)' :
                        'Neutro-Acido - Ideale per la maggior parte delle colture orticole'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Microclima */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Sun size={24} className="text-green-600" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Microclima</h3>
              </div>

              {/* Foto Analisi AI (Pro Feature) */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
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
                        className="absolute top-3 right-2 bg-red-500 text-white rounded-full p-3 hover:bg-red-600"
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
                        capture="environment"
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
                        className="absolute top-3 right-2 bg-red-500 text-white rounded-full p-3 hover:bg-red-600"
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
                        capture="environment"
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
                        className="absolute top-3 right-2 bg-red-500 text-white rounded-full p-3 hover:bg-red-600"
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
                        capture="environment"
                        onChange={handlePanoramicPhotoChange}
                        className="hidden"
                        disabled={analyzingPhotos}
                      />
                    </label>
                  )}
                </div>

                {photoAnalysisError && (
                  <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
                    {photoAnalysisError}
                  </div>
                )}
              </div>

              {/* Advanced Sun Exposure Wizard */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-3 mb-2">
                  <Sun size={16} />
                  Esposizione Solare
                </label>
                <AdvancedSunExposureWizard
                  latitude={parseFloat(latitude) || 0}
                  longitude={parseFloat(longitude) || 0}
                  onComplete={(data) => {
                    // Aggiorna tutti gli stati con i dati del wizard
                    setDailySunHours(data.dailySunHours.toString());
                    setSunExposure(data.sunExposure);
                    setAspectDirection(data.aspectDirection || '');
                    setObstacles(data.obstacles);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-3">
                  <Wind size={16} />
                  Direzione Esposizione
                </label>
                <select
                  value={aspectDirection}
                  onChange={(e) => setAspectDirection(e.target.value as Garden['aspectDirection'] | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleziona...</option>
                  <option value="South">Sud (Ideale) - Massima esposizione solare</option>
                  <option value="East">Est - Sole mattutino, fresco pomeridiano</option>
                  <option value="West">Ovest - Ombra mattutina, sole pomeridiano</option>
                  <option value="North">Nord - Poca esposizione solare</option>
                  <option value="Flat">Piano - Nessuna pendenza significativa</option>
                </select>
                {aspectDirection && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-700">
                      {aspectDirection === 'South' && 'Sud è la direzione ideale per la maggior parte delle colture, garantendo il massimo sole durante tutto il giorno.'}
                      {aspectDirection === 'East' && 'Est riceve il sole del mattino, ideale per piante che preferiscono evitare il calore intenso del pomeriggio.'}
                      {aspectDirection === 'West' && 'Ovest riceve il sole pomeridiano, può essere caldo in estate ma ideale per piante che amano il calore.'}
                      {aspectDirection === 'North' && 'Nord riceve meno sole, ideale per piante che preferiscono ombra o mezz\'ombra.'}
                      {aspectDirection === 'Flat' && 'Terreno piano senza pendenza significativa, esposizione uniforme.'}
                    </p>
                  </div>
                )}
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
                  <option value="High">Alta - Muri, siepi alte, edifici</option>
                  <option value="Medium">Media - Siepi basse, alberi distanti</option>
                  <option value="Low">Bassa - Nessuna protezione significativa</option>
                </select>
                {windProtection && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-700">
                      {windProtection === 'High' && 'Alta protezione dal vento (muri, siepi alte, edifici) riduce l\'evaporazione e protegge le piante delicate dal vento forte.'}
                      {windProtection === 'Medium' && 'Protezione media (siepi basse, alberi distanti) offre una moderata protezione mantenendo una buona circolazione dell\'aria.'}
                      {windProtection === 'Low' && 'Bassa protezione significa che il giardino è esposto al vento, che può aumentare l\'evaporazione e richiedere irrigazioni più frequenti.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Gestione Ostacoli */}
              {(latitude && longitude) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
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

              {/* Compostiera - Card Dedicata */}
              <div className={`p-4 rounded-lg border ${hasCompostBin ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasCompostBin ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="text-lg md:text-xl">{hasCompostBin ? '♻️' : '📦'}</span>
                    </div>
                    <div>
                      <span className={`text-lg font-bold ${hasCompostBin ? 'text-green-800' : 'text-gray-700'}`}>
                        Ho una compostiera
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasCompostBin}
                    onChange={(e) => setHasCompostBin(e.target.checked)}
                    className="w-6 h-6 text-green-600 rounded-md focus:ring-green-500"
                  />
                </label>
                {hasCompostBin && (
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <div className="flex items-start gap-3 mb-2">
                      <Info size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">
                        Una compostiera ti permette di riciclare i materiali di risulta del tuo orto (scarti vegetali, foglie, erba tagliata) trasformandoli in prezioso humus.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-600">🌱</span>
                      <p className="text-sm text-green-700">
                        L'humus è un fertilizzante naturale eccellente che migliora la struttura del suolo, aumenta la sua fertilità e la capacità di trattenere acqua e nutrienti per le stagioni successive.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={step === 1 ? onCancel : handlePrevious}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={18} />
              {step === 1 ? 'Annulla' : 'Indietro'}
            </button>

            {step < 6 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Avanti
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={18} />
                Completa
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default GardenOnboarding;

