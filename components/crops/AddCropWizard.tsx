import React, { useState, useEffect } from 'react';
import { Garden, GardenTask, GrowingLocation, ArchetypeId } from '../../types';
import { AddWoodyCropWizard } from './AddWoodyCropWizard';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { createAlias } from '../../services/aliasService';
import { getArchetypeById, getDefaultProfile, getAllArchetypes } from '../../services/archetypeService';
import { calculateRootDepthForArchetype } from '../../logic/rootDepthCalculator';
import { searchCropWithFuzzy, SearchResult } from '../../services/fuzzySearchService';
import { extractMainPlantName, suggestArchetypeFromKeywords } from '../../services/plantNameExtractor';
import { searchArchetypesByExample } from '../../services/archetypeService';
import { X, ArrowRight, ArrowLeft, Search, Loader2, Info } from 'lucide-react';
import { InfoTooltip } from '../shared/InfoTooltip';
import { getMasterSheetSync } from '../../services/plantMasterService';
import { parseSpacing, getCropType, calculateOrchardLayout, calculateVineyardLayout, calculateOliveLayout, calculateMaxPlants, suggestOptimalLayout, getMasterSheetForPlant, Spacing } from '../../logic/gardenLayoutEngine';

interface AddCropWizardProps {
  garden: Garden;
  onComplete: (task: GardenTask) => void;
  onCancel: () => void;
  initialPlantName?: string; // Nome iniziale se già inserito
}

type WizardStep = 'name' | 'setup' | 'advanced';

export const AddCropWizard: React.FC<AddCropWizardProps> = ({
  garden,
  onComplete,
  onCancel,
  initialPlantName = ''
}) => {
  const { storageProvider } = useStorage();
  const [step, setStep] = useState<WizardStep>('name');
  const [loading, setLoading] = useState(false);
  
  // Step 1: Nome coltura
  const [plantName, setPlantName] = useState(initialPlantName);
  const [searching, setSearching] = useState(false);
  const [foundArchetype, setFoundArchetype] = useState<ArchetypeId | null>(null);
  const [fuzzySuggestions, setFuzzySuggestions] = useState<SearchResult[]>([]);
  const [extractedMainName, setExtractedMainName] = useState<string | null>(null);
  const [extractedVariety, setExtractedVariety] = useState<string | null>(null);
  
  // Step 2: Archetipo (se non trovato)
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | null>(null);
  const [suggestedArchetype, setSuggestedArchetype] = useState<ArchetypeId | null>(null);
  
  // Step 3: Setup impianto
  const [locationType, setLocationType] = useState<GrowingLocation>('Ground');
  const [areaSqm, setAreaSqm] = useState<string>('');
  const [plantCount, setPlantCount] = useState<string>('');
  const [irrigationMethod, setIrrigationMethod] = useState<'Drip' | 'Sprinkler' | 'Manual' | 'Flood' | 'NFT' | 'DWC' | 'EbbFlow' | 'Wick' | 'Kratky'>('Drip');
  const [soilType, setSoilType] = useState<'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty' | ''>(garden.soilType || '');
  
  // Step 4: Advanced (opzionale)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [flowRateLpm, setFlowRateLpm] = useState<string>('');
  const [hasMoistureSensor, setHasMoistureSensor] = useState(false);
  const [hasECSensor, setHasECSensor] = useState(false);
  const [hasPHSensor, setHasPHSensor] = useState(false);
  
  // Wizard colture legnose
  const [showWoodyWizard, setShowWoodyWizard] = useState(false);
  const [detectedWoodyArchetype, setDetectedWoodyArchetype] = useState<ArchetypeId | null>(null);
  const [detectedVarietyType, setDetectedVarietyType] = useState<'Wine' | 'Table' | 'Oil' | 'Dual-purpose' | undefined>(undefined);
  
  // Stati per calcoli automatici spacing/layout
  const [spacingInfo, setSpacingInfo] = useState<Spacing | null>(null);
  const [layoutSuggestion, setLayoutSuggestion] = useState<string>('');
  const [calculatedPlants, setCalculatedPlants] = useState<number | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  
  // Cerca nome quando cambia
  useEffect(() => {
    if (plantName.trim().length >= 2) {
      handleSearch();
    } else {
      setFoundArchetype(null);
    }
  }, [plantName]);
  
  // Calcola automaticamente spacing e layout quando cambiano pianta/varietà/area/piante
  useEffect(() => {
    if (!selectedArchetype || !plantName.trim()) {
      setSpacingInfo(null);
      setLayoutSuggestion('');
      setCalculatedPlants(null);
      setCalculatedArea(null);
      return;
    }
    
    // Ottieni master sheet (considerando varietà se presente)
    const masterData = getMasterSheetForPlant(plantName.trim(), extractedVariety || undefined, getMasterSheetSync);
    if (!masterData || !masterData.transplanting?.spacing) {
      setSpacingInfo(null);
      setLayoutSuggestion('');
      setCalculatedPlants(null);
      setCalculatedArea(null);
      return;
    }
    
    // Parsa le distanze
    const spacing = parseSpacing(masterData.transplanting.spacing);
    if (!spacing) {
      setSpacingInfo(null);
      setLayoutSuggestion('');
      setCalculatedPlants(null);
      setCalculatedArea(null);
      return;
    }
    
    setSpacingInfo(spacing);
    
    // Determina tipo di coltura
    const cropType = getCropType(masterData);
    
    // Calcola suggerimenti basati su area o numero piante
    if (areaSqm && parseFloat(areaSqm) > 0) {
      const area = parseFloat(areaSqm);
      let layoutResult;
      
      if (cropType === 'orchard' || cropType === 'olive') {
        layoutResult = calculateOrchardLayout(spacing, area);
      } else if (cropType === 'vineyard') {
        layoutResult = calculateVineyardLayout(spacing, area);
      } else {
        const maxPlantsResult = calculateMaxPlants(masterData, area);
        const sideCm = Math.sqrt(area * 10000);
        const layout = suggestOptimalLayout(masterData, sideCm, sideCm);
        layoutResult = {
          maxPlants: maxPlantsResult.maxPlants,
          plantsPerRow: Math.floor(sideCm / spacing.row),
          numRows: Math.floor(sideCm / spacing.between),
          layout: layout || `Layout consigliato: ${Math.floor(sideCm / spacing.row)} piante per fila × ${Math.floor(sideCm / spacing.between)} file`
        };
      }
      
      setCalculatedPlants(layoutResult.maxPlants > 0 ? layoutResult.maxPlants : null);
      setCalculatedArea(null);
      setLayoutSuggestion(String(layoutResult.layout || ''));
    } else if (plantCount && parseInt(plantCount) > 0) {
      const numPlants = parseInt(plantCount);
      let layoutResult;
      
      if (cropType === 'orchard' || cropType === 'olive') {
        layoutResult = calculateOrchardLayout(spacing, 0, numPlants);
      } else if (cropType === 'vineyard') {
        layoutResult = calculateVineyardLayout(spacing, 0, numPlants);
      } else {
        const areaPerPlant = (spacing.row * spacing.between) / 10000;
        const totalArea = numPlants * areaPerPlant;
        const sideCm = Math.sqrt(totalArea * 10000);
        const plantsPerRow = Math.floor(sideCm / spacing.row);
        const numRows = Math.ceil(numPlants / plantsPerRow);
        const layout = suggestOptimalLayout(masterData, sideCm, sideCm);
        layoutResult = {
          maxPlants: numPlants,
          plantsPerRow,
          numRows,
          layout: layout || `Layout consigliato: ${plantsPerRow} piante per fila × ${numRows} file = ${numPlants} piante totali`,
          areaNeeded: totalArea
        };
      }
      
      const areaNeeded = layoutResult.areaNeeded && layoutResult.areaNeeded > 0 ? layoutResult.areaNeeded : null;
      setCalculatedArea(areaNeeded);
      setCalculatedPlants(null);
      setLayoutSuggestion(String(layoutResult.layout || ''));
    } else {
      setCalculatedPlants(null);
      setCalculatedArea(null);
      setLayoutSuggestion('');
    }
  }, [selectedArchetype, plantName, extractedVariety, areaSqm, plantCount]);
  
  const handleSearch = async () => {
    if (!plantName.trim()) {
      setFuzzySuggestions([]);
      setFoundArchetype(null);
      setExtractedMainName(null);
      setExtractedVariety(null);
      return;
    }
    
    setSearching(true);
    try {
      // Estrai parola principale dal nome composto
      const extracted = extractMainPlantName(plantName.trim());
      const mainName = extracted.mainName;
      setExtractedMainName(mainName);
      setExtractedVariety(extracted.variety || null);
      
      // Cerca prima con la parola principale se diversa dall'input completo
      let searchQuery = plantName.trim();
      if (mainName && mainName !== plantName.trim().toLowerCase()) {
        // Prova prima con la parola principale
        const region = garden.coordinates ? undefined : undefined;
        const mainResult = await searchCropWithFuzzy(
          storageProvider,
          mainName,
          region,
          undefined
        );
        
        if (mainResult.exactMatch) {
          const archetypeId = mainResult.exactMatch.archetypeId;
          if (archetypeId === 'L1' || archetypeId === 'L2' || archetypeId === 'L3') {
            setDetectedWoodyArchetype(archetypeId);
            setDetectedVarietyType(mainResult.exactMatch.defaultVarietyType);
            setFoundArchetype(null);
            setFuzzySuggestions([]);
            return;
          }
          // Trovato con parola principale!
          setFoundArchetype(archetypeId);
          setSelectedArchetype(archetypeId);
          setFuzzySuggestions([]);
          return;
        }
        
        // Se non trovato con parola principale, prova anche negli esempi degli archetipi
        const archetypeMatches = searchArchetypesByExample(mainName);
        if (archetypeMatches.length > 0) {
          const matchedArchetype = archetypeMatches[0];
          setFoundArchetype(matchedArchetype.id as ArchetypeId);
          setSelectedArchetype(matchedArchetype.id as ArchetypeId);
          setFuzzySuggestions([]);
          return;
        }
      }
      
      // Usa pipeline fuzzy completa con il nome originale
      const region = garden.coordinates ? undefined : undefined;
      const result = await searchCropWithFuzzy(
        storageProvider,
        searchQuery,
        region,
        undefined
      );
      
      if (result.exactMatch) {
        // Match esatto trovato → verifica se è coltura legnosa
        const archetypeId = result.exactMatch.archetypeId;
        if (archetypeId === 'L1' || archetypeId === 'L2' || archetypeId === 'L3') {
          setDetectedWoodyArchetype(archetypeId);
          setDetectedVarietyType(result.exactMatch.defaultVarietyType);
          setFoundArchetype(null);
          setFuzzySuggestions([]);
          return;
        }
        // Altrimenti procedi normalmente
        setFoundArchetype(archetypeId);
        setSelectedArchetype(archetypeId);
        setFuzzySuggestions([]);
        return;
      }
      
      // Verifica anche nei fuzzy matches se c'è una coltura legnosa
      if (result.fuzzyMatches.length > 0) {
        const woodyMatch = result.fuzzyMatches.find(m => m.archetypeId === 'L1' || m.archetypeId === 'L2' || m.archetypeId === 'L3');
        if (woodyMatch && woodyMatch.score >= 0.8) {
          setDetectedWoodyArchetype(woodyMatch.archetypeId);
          setDetectedVarietyType(woodyMatch.defaultVarietyType);
        }
      }
      
      if (result.fuzzyMatches.length > 0) {
        // Mostra suggerimenti fuzzy
        setFuzzySuggestions(result.fuzzyMatches);
        setFoundArchetype(null);
        return;
      }
      
      // Se ancora non trovato, prova suggerimento basato su keywords
      if (extracted.keywords.length > 0) {
        const suggestedArchetypeId = suggestArchetypeFromKeywords(extracted.keywords);
        if (suggestedArchetypeId) {
          setSuggestedArchetype(suggestedArchetypeId as ArchetypeId);
          // Se abbiamo un suggerimento e non abbiamo trovato nulla, selezionalo automaticamente
          if (!foundArchetype && !fuzzySuggestions.length) {
            const archetypeId = suggestedArchetypeId as ArchetypeId;
            setSelectedArchetype(archetypeId);
            // Crea alias con confidence media per selezione automatica basata su riconoscimento
            createAlias(
              storageProvider,
              plantName.trim(),
              archetypeId,
              undefined, // region
              undefined, // province
              undefined, // userId (TODO: ottenere da auth)
              0.6 // Confidence media per riconoscimento automatico
            ).catch(console.error);
          }
        } else {
          setSuggestedArchetype(null);
        }
      } else {
        setSuggestedArchetype(null);
      }
      
      // Nessun match → mostra dropdown archetipo nella prima schermata
      setFuzzySuggestions([]);
      setFoundArchetype(null);
    } catch (error) {
      console.error('Error searching crop:', error);
      setFuzzySuggestions([]);
      setFoundArchetype(null);
    } finally {
      setSearching(false);
    }
  };
  
  const handleArchetypeChange = (archetypeId: ArchetypeId) => {
    setSelectedArchetype(archetypeId);
    // Se era suggerito, rimuovi il suggerimento
    if (suggestedArchetype === archetypeId) {
      setSuggestedArchetype(null);
    }
    
    // Se nome non trovato (né exact né fuzzy), crea alias con confidence bassa
    if (plantName.trim() && !foundArchetype && fuzzySuggestions.length === 0) {
      createAlias(
        storageProvider,
        plantName.trim(),
        archetypeId,
        undefined, // region
        undefined, // province
        undefined, // userId (TODO: ottenere da auth)
        0.5 // Confidence bassa per selezione manuale
      ).catch(console.error);
    }
  };
  
  const handleFuzzySuggestionSelect = async (suggestion: SearchResult) => {
    setSelectedArchetype(suggestion.archetypeId);
    setPlantName(suggestion.name);
    setFuzzySuggestions([]);
    setFoundArchetype(suggestion.archetypeId);
    setStep('setup');
    
    // Se è un alias fuzzy match, incrementa usage count
    if (suggestion.aliasId) {
      try {
        const alias = await storageProvider.getAlias(suggestion.aliasId);
        if (alias) {
          await storageProvider.updateAlias(suggestion.aliasId, {
            usageCount: (alias.usageCount || 0) + 1
          });
        }
      } catch (error) {
        console.error('Error updating alias usage:', error);
      }
    }
    
    // Se è un nuovo nome (non era alias), crea alias con confidence media
    if (suggestion.source === 'crop' && suggestion.type === 'fuzzy_crop') {
      createAlias(
        storageProvider,
        plantName.trim(),
        suggestion.archetypeId,
        undefined,
        undefined,
        undefined,
        0.7 // Confidence media per fuzzy match confermato
      ).catch(console.error);
    }
  };
  
  const handleNext = () => {
    if (step === 'name') {
      if (!plantName.trim()) {
        alert('Inserisci un nome per la coltura');
        return;
      }
      
      // Se abbiamo un archetipo (trovato, suggerito o selezionato), vai direttamente a setup
      if (foundArchetype || selectedArchetype) {
        setStep('setup');
      } else {
        // Se non abbiamo archetipo, chiedi di selezionarlo dal dropdown
        alert('Seleziona un tipo di coltura dal menu a tendina');
        return;
      }
    } else if (step === 'setup') {
      // Valida setup
      if (!areaSqm && !plantCount) {
        alert('Inserisci area o numero piante');
        return;
      }
      
      // Se advanced visibile, vai lì, altrimenti completa
      if (showAdvanced) {
        setStep('advanced');
      } else {
        handleComplete();
      }
    } else if (step === 'advanced') {
      handleComplete();
    }
  };
  
  const handleComplete = () => {
    if (!selectedArchetype) {
      alert('Seleziona un tipo di coltura');
      return;
    }
    
    // Calcola root depth
    const containerDepth = locationType === 'Pot' ? 25 : locationType === 'RaisedBed' ? 35 : undefined;
    const rootDepth = calculateRootDepthForArchetype(selectedArchetype, containerDepth);
    
    // Crea task
    const task: GardenTask = {
      id: crypto.randomUUID(),
      gardenId: garden.id,
      plantName: plantName.trim(),
      taskType: 'Sowing',
      date: new Date().toISOString().split('T')[0],
      completed: false,
      locationType,
      initialQuantity: plantCount ? parseInt(plantCount) : undefined,
      currentQuantity: plantCount ? parseInt(plantCount) : undefined,
      archetypeId: selectedArchetype,
      rootZoneDepthCm: rootDepth,
      irrigationSetup: {
        method: irrigationMethod,
        areaSqm: areaSqm ? parseFloat(areaSqm) : undefined,
        flowRateLpm: flowRateLpm ? parseFloat(flowRateLpm) : undefined,
        sensorData: showAdvanced ? {
          hasMoistureSensor: hasMoistureSensor,
          hasECSensor: hasECSensor,
          hasPHSensor: hasPHSensor
        } : undefined
      }
    };
    
    onComplete(task);
  };
  
  const currentArchetype = selectedArchetype ? getArchetypeById(selectedArchetype) : null;
  const currentProfile = selectedArchetype ? getDefaultProfile(selectedArchetype) : null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Aggiungi Coltura</h2>
            <p className="text-sm text-gray-500">{garden.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Chiudi"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Step 1: Nome coltura */}
          {step === 'name' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome coltura *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    placeholder="Es: burattino, pomodoro, lattuga..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    autoFocus
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={20} className="animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {foundArchetype && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <span className="text-xl">{currentArchetype?.icon}</span>
                      <span>✓ Trovato: <strong>{currentArchetype?.label}</strong></span>
                    </p>
                    {extractedMainName && extractedMainName !== plantName.trim().toLowerCase() && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="text-xs text-green-700">
                          ✓ Riconosciuto: <strong>"{extractedMainName}"</strong>
                          {extractedVariety && <span> (varietà: {extractedVariety})</span>}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Associato a: <strong>{currentArchetype?.label}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Rilevamento Coltura Legnosa */}
                {detectedWoodyArchetype && (
                  <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">
                      🌳 Questa è una coltura legnosa!
                    </p>
                    <p className="text-sm text-purple-800 mb-3">
                      Per alberi da frutto, olivi e viti è disponibile un wizard dedicato con funzionalità avanzate.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const cropType = detectedWoodyArchetype === 'L1' ? 'Vine' : 
                                          detectedWoodyArchetype === 'L2' ? 'Olive' : 'FruitTree';
                          setShowWoodyWizard(true);
                        }}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                      >
                        Usa Wizard Colture Legnose
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDetectedWoodyArchetype(null);
                          setFoundArchetype(detectedWoodyArchetype);
                          setSelectedArchetype(detectedWoodyArchetype);
                        }}
                        className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50"
                      >
                        Continua qui
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Suggerimenti Fuzzy */}
                {fuzzySuggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600 font-medium">
                      Intendevi:
                    </p>
                    {fuzzySuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleFuzzySuggestionSelect(suggestion)}
                        className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left flex items-center gap-3"
                      >
                        <span className="text-2xl">{suggestion.archetypeIcon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {suggestion.name}
                            {suggestion.source === 'alias' && (
                              <span className="text-xs text-gray-500 ml-2">
                                (alias locale)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {suggestion.archetypeLabel}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {Math.round(suggestion.score * 100)}% match
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Dropdown archetipo - mostrare solo se non trovato e nessun suggerimento fuzzy */}
                {!foundArchetype && !fuzzySuggestions.length && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo coltura {selectedArchetype ? '' : '*'}
                      {extractedMainName && suggestedArchetype && (
                        <span className="text-xs text-blue-600 ml-2 font-normal">
                          (Suggerito: {getArchetypeById(suggestedArchetype)?.label})
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedArchetype || suggestedArchetype || ''}
                      onChange={(e) => {
                        const archetypeId = e.target.value as ArchetypeId;
                        if (archetypeId) {
                          handleArchetypeChange(archetypeId);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleziona tipo coltura...</option>
                      {getAllArchetypes().map((archetype) => (
                        <option key={archetype.id} value={archetype.id}>
                          {archetype.icon} {archetype.label}
                          {archetype.examples && archetype.examples.length > 0 && (
                            ` (${archetype.examples.slice(0, 3).join(', ')}...)`
                          )}
                        </option>
                      ))}
                    </select>
                    {extractedMainName && suggestedArchetype && (
                      <p className="text-xs text-blue-600 mt-2">
                        💡 Sembra un <strong>"{extractedMainName}"</strong>? 
                        {extractedVariety && <span> Varietà: <strong>"{extractedVariety}"</strong></span>}
                        {' '}Abbiamo selezionato automaticamente <strong>{getArchetypeById(suggestedArchetype)?.label}</strong>.
                      </p>
                    )}
                    {!extractedMainName && !selectedArchetype && (
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Non trovi il nome? Seleziona il tipo più simile. Il sistema imparerà dai tuoi inserimenti.
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Annulla
                </button>
                <button
                  onClick={handleNext}
                  disabled={!plantName.trim() || searching}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Avanti
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Setup impianto */}
          {step === 'setup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Setup Impianto</h3>
                
                {/* Tipo ambiente */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ambiente *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['Ground', 'RaisedBed', 'Pot', 'Greenhouse', 'HydroponicDrip', 'Indoor'] as GrowingLocation[]).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setLocationType(loc)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          locationType === loc
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {loc === 'Ground' ? 'Campo' :
                         loc === 'RaisedBed' ? 'Letto rialzato' :
                         loc === 'Pot' ? 'Vaso' :
                         loc === 'Greenhouse' ? 'Serra' :
                         loc === 'HydroponicDrip' ? 'Idroponica' :
                         loc === 'Indoor' ? 'Indoor' : loc}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Area o numero piante */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area o Numero Piante *
                  </label>
                  
                  {/* Mostra sempre le distanze consigliate */}
                  {spacingInfo && typeof spacingInfo.row === 'number' && typeof spacingInfo.between === 'number' && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        📏 Distanze Consigliate:
                      </p>
                      <p className="text-sm text-blue-800">
                        • Sulla fila: <strong>{spacingInfo.row} cm</strong>
                        <br />
                        • Tra le file: <strong>{spacingInfo.between} cm</strong>
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area (m²)
                      </label>
                      <input
                        type="number"
                        value={areaSqm}
                        onChange={(e) => {
                          setAreaSqm(e.target.value);
                          setPlantCount(''); // Reset numero piante quando cambia area
                        }}
                        placeholder="Es. 10"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      {calculatedPlants !== null && calculatedPlants > 0 && spacingInfo && areaSqm && parseFloat(areaSqm) > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          💡 Con {areaSqm} m² puoi piantare fino a <strong>{calculatedPlants} piante</strong>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numero piante
                      </label>
                      <input
                        type="number"
                        value={plantCount}
                        onChange={(e) => {
                          setPlantCount(e.target.value);
                          setAreaSqm(''); // Reset area quando cambia numero piante
                        }}
                        placeholder="Es. 20"
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      {calculatedArea !== null && calculatedArea > 0 && spacingInfo && plantCount && parseInt(plantCount) > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          💡 Per {plantCount} piante servono circa <strong>{calculatedArea.toFixed(2)} m²</strong>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Mostra layout suggerito */}
                  {layoutSuggestion && typeof layoutSuggestion === 'string' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 mb-1">
                        🌱 Layout Suggerito:
                      </p>
                      <p className="text-sm text-green-800">
                        {layoutSuggestion}
                      </p>
                      {spacingInfo && typeof spacingInfo.row === 'number' && typeof spacingInfo.between === 'number' && (
                        <p className="text-xs text-green-700 mt-2">
                          Spazio per pianta: {(spacingInfo.row * spacingInfo.between / 10000).toFixed(2)} m²
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Metodo irrigazione */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metodo irrigazione *
                  </label>
                  <select
                    value={irrigationMethod}
                    onChange={(e) => setIrrigationMethod(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Drip">Goccia a goccia</option>
                    <option value="Sprinkler">Aspersione</option>
                    <option value="Manual">Manuale</option>
                    <option value="Flood">Sommersione</option>
                    <option value="NFT">NFT (Idroponica)</option>
                    <option value="DWC">DWC (Idroponica)</option>
                    <option value="EbbFlow">Ebb & Flow</option>
                    <option value="Wick">Wick System</option>
                    <option value="Kratky">Kratky</option>
                  </select>
                </div>
                
                {/* Tipo suolo */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo suolo
                    <InfoTooltip content="Se non specificato, usa quello del giardino" />
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Usa quello del giardino</option>
                    <option value="Clay">Argilloso</option>
                    <option value="Sandy">Sabbioso</option>
                    <option value="Loamy">Franco</option>
                    <option value="Peaty">Torba</option>
                    <option value="Chalky">Calcareo</option>
                    <option value="Silty">Limoso</option>
                  </select>
                </div>
                
                {/* Root depth stimata */}
                {currentProfile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800">
                      <strong>Profondità radici stimata:</strong> {currentProfile.rootZoneDepthCmDefault} cm
                      {currentProfile.rootZoneDepthCmMin && currentProfile.rootZoneDepthCmMax && (
                        <span className="text-gray-600"> (range: {currentProfile.rootZoneDepthCmMin}-{currentProfile.rootZoneDepthCmMax} cm)</span>
                      )}
                    </p>
                  </div>
                )}
                
                {/* Advanced toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Info size={14} />
                  {showAdvanced ? 'Nascondi' : 'Mostra'} opzioni avanzate (portate, sensori)
                </button>
              </div>
              
              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setStep('name')}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Indietro
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                >
                  {showAdvanced ? 'Avanti' : 'Completa'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Advanced (opzionale) */}
          {step === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Opzioni Avanzate</h3>
                
                {/* Portata impianto */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portata impianto (litri/minuto)
                    <InfoTooltip content="Portata del tuo impianto di irrigazione. Utile per calcolare durata irrigazione." />
                  </label>
                  <input
                    type="number"
                    value={flowRateLpm}
                    onChange={(e) => setFlowRateLpm(e.target.value)}
                    placeholder="Es. 2.0"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                {/* Sensori */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sensori disponibili
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasMoistureSensor}
                        onChange={(e) => setHasMoistureSensor(e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Sensore umidità terreno</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasECSensor}
                        onChange={(e) => setHasECSensor(e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Sensore EC (conducibilità)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasPHSensor}
                        onChange={(e) => setHasPHSensor(e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Sensore pH</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setStep('setup')}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Indietro
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                >
                  Completa
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Wizard Colture Legnose */}
      {showWoodyWizard && (
        <AddWoodyCropWizard
          garden={garden}
          onComplete={(task) => {
            setShowWoodyWizard(false);
            setDetectedVarietyType(undefined);
            onComplete(task);
          }}
          onCancel={() => {
            setShowWoodyWizard(false);
            setDetectedWoodyArchetype(null);
            setDetectedVarietyType(undefined);
          }}
          initialCropType={
            detectedWoodyArchetype === 'L1' ? 'Vine' :
            detectedWoodyArchetype === 'L2' ? 'Olive' :
            detectedWoodyArchetype === 'L3' ? 'FruitTree' : undefined
          }
          defaultVarietyType={detectedVarietyType}
        />
      )}
    </div>
  );
};

