'use client'

import React, { useState } from 'react';
import { Garden } from '../types';
import { X, Sprout, TreePine, CircleDot, Grape, ArrowRight, Droplets } from 'lucide-react';
import GardenOnboarding from './GardenOnboarding';
import OrchardWizard from './orchard/OrchardWizard';
import { useStorage } from '@/packages/core/hooks/useStorage';

export type SpaceType = 'vegetable' | 'orchard' | 'oliveGrove' | 'vineyard' | 'hydroponic' | 'aquaponic' | 'aeroponic';

interface GardenTypeWizardProps {
  onComplete: (garden: Garden) => void;
  onCancel: () => void;
}

export const GardenTypeWizard: React.FC<GardenTypeWizardProps> = ({ onComplete, onCancel }) => {
  const { storageProvider } = useStorage();
  const [selectedType, setSelectedType] = useState<SpaceType | null>(null);
  const [selectedHydroponicType, setSelectedHydroponicType] = useState<'NFT' | 'DWC' | 'EbbFlow' | 'Drip' | 'Wick' | 'Kratky' | null>(null);
  const [createdGarden, setCreatedGarden] = useState<Garden | null>(null);
  const [saving, setSaving] = useState(false);

  console.log('[GardenTypeWizard] Rendered - selectedType:', selectedType, 'createdGarden:', createdGarden);

  const handleTypeSelect = (type: SpaceType) => {
    setSelectedType(type);
  };

  const handleGardenCreated = async (garden: Garden) => {
    try {
      console.log('✅ Garden created from GardenOnboarding:', garden);
      console.log('📊 Storage provider available:', storageProvider.isAvailable());
      console.log('🔐 About to save garden to database...');
      
      setSaving(true);
      
      // CRITICAL: Save garden to database FIRST
      const savedGarden = await storageProvider.createGarden(garden);
      console.log('💾 Garden saved to database successfully:', savedGarden.id);
      
      setCreatedGarden(savedGarden);
      
      // Se è un orto, completa subito
      if (selectedType === 'vegetable') {
        console.log('🎉 Vegetable garden complete, calling onComplete');
        onComplete(savedGarden);
      }
      // Se è frutteto/oliveto/vigneto, mostra wizard configurazione
    } catch (error) {
      console.error('❌ CRITICAL ERROR: Failed to save garden to database:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      
      // Show error to user
      alert(`Errore nel salvare il giardino: ${error instanceof Error ? error.message : 'Errore sconosciuto'}. Riprova.`);
    } finally {
      setSaving(false);
    }
  };

  const handleOrchardConfigComplete = (_orchardId: string) => {
    if (createdGarden) {
      console.log('🎉 Orchard/Olive/Vineyard configuration complete, calling onComplete');
      onComplete(createdGarden);
    }
  };

  // Step 1: Selezione Tipo
  if (!selectedType) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Crea Nuovo Spazio</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6">Scegli il tipo di spazio che vuoi creare:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              {/* Orto */}
              <button
                onClick={() => handleTypeSelect('vegetable')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Sprout size={32} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Orto</h3>
                    <p className="text-sm text-gray-600">Ortaggi, verdure, erbe</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Perfetto per pomodori, zucchine, insalate, erbe aromatiche e tutte le colture stagionali.
                </p>
              </button>

              {/* Coltivazione Idroponica */}
              <button
                onClick={() => handleTypeSelect('hydroponic')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Droplets size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Coltivazione Idroponica</h3>
                    <p className="text-sm text-gray-600">Sistemi senza suolo</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  NFT, DWC, Ebb&Flow, Drip, Wick, Kratky - coltivazione in soluzione nutritiva per massima efficienza.
                </p>
              </button>

              {/* Frutteto */}
              <button
                onClick={() => handleTypeSelect('orchard')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <TreePine size={32} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Frutteto</h3>
                    <p className="text-sm text-gray-600">Alberi da frutto</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Mele, pere, pesche, agrumi, frutta a guscio e altre colture arboree.
                </p>
              </button>

              {/* Oliveto */}
              <button
                onClick={() => handleTypeSelect('oliveGrove')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <CircleDot size={32} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Oliveto</h3>
                    <p className="text-sm text-gray-600">Olivi per olio o mensa</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Gestione completa di oliveti per produzione olio, olive da mensa o dual-purpose.
                </p>
              </button>

              {/* Vigneto */}
              <button
                onClick={() => handleTypeSelect('vineyard')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Grape size={32} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Vigneto</h3>
                    <p className="text-sm text-gray-600">Viti da vino o tavola</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Gestione di vigneti per produzione vino, uva da tavola o uva passa.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Wizard Configurazione
  if (selectedType === 'vegetable') {
    return (
      <GardenOnboarding
        onComplete={handleGardenCreated}
        onCancel={() => setSelectedType(null)}
      />
    );
  }

  // Step 2.5: Selezione Tipo Sistema Idroponico
  if (selectedType === 'hydroponic' && !selectedHydroponicType) {
    const hydroponicSystems = [
      {
        type: 'NFT' as const,
        name: 'NFT (Nutrient Film Technique)',
        description: 'Film sottile di soluzione nutritiva che scorre continuamente sulle radici',
        difficulty: 'Media',
        advantages: 'Efficiente, risparmio acqua, crescita rapida'
      },
      {
        type: 'DWC' as const,
        name: 'DWC (Deep Water Culture)',
        description: 'Radici immerse in soluzione nutritiva ossigenata',
        difficulty: 'Facile',
        advantages: 'Semplice, economico, crescita veloce'
      },
      {
        type: 'EbbFlow' as const,
        name: 'Ebb & Flow (Flusso e Riflusso)',
        description: 'Allagamento periodico delle radici con soluzione nutritiva',
        difficulty: 'Media',
        advantages: 'Versatile, adatto a molte piante, affidabile'
      },
      {
        type: 'Drip' as const,
        name: 'Sistema a Goccia',
        description: 'Soluzione nutritiva erogata goccia a goccia alle radici',
        difficulty: 'Facile',
        advantages: 'Preciso, scalabile, basso consumo'
      },
      {
        type: 'Wick' as const,
        name: 'Sistema a Stoppino',
        description: 'Soluzione nutritiva assorbita per capillarità tramite stoppini',
        difficulty: 'Molto Facile',
        advantages: 'Passivo, nessuna elettricità, economico'
      },
      {
        type: 'Kratky' as const,
        name: 'Metodo Kratky',
        description: 'Sistema passivo con radici parzialmente immerse',
        difficulty: 'Molto Facile',
        advantages: 'Passivo, semplice, ideale per principianti'
      }
    ];

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Scegli Tipo Sistema Idroponico</h2>
              <p className="text-sm text-gray-600 mt-1">Seleziona il sistema più adatto alle tue esigenze</p>
            </div>
            <button onClick={() => setSelectedType(null)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hydroponicSystems.map((system) => (
                <button
                  key={system.type}
                  onClick={() => setSelectedHydroponicType(system.type)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Droplets size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{system.name}</h3>
                      <p className="text-xs text-gray-600">Difficoltà: {system.difficulty}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{system.description}</p>
                  <p className="text-xs text-green-600">✓ {system.advantages}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Per frutteti/oliveti/vigneti: prima crea il giardino base, poi configura
  if (selectedType && !createdGarden) {
    // Per idroponica, passa il tipo sistema selezionato
    if (selectedType === 'hydroponic' && selectedHydroponicType) {
      return (
        <GardenOnboarding
          onComplete={handleGardenCreated}
          onCancel={() => {
            setSelectedType(null);
            setSelectedHydroponicType(null);
          }}
          initialGardenType="Hydroponic"
          initialHydroponicType={selectedHydroponicType}
        />
      );
    }

    const gardenTypeMap: Record<SpaceType, 'Orchard' | 'OliveGrove' | 'Vineyard' | 'Hydroponic' | 'Aquaponic' | 'Aeroponic'> = {
      'orchard': 'Orchard',
      'oliveGrove': 'OliveGrove',
      'vineyard': 'Vineyard',
      'hydroponic': 'Hydroponic',
      'aquaponic': 'Aquaponic',
      'aeroponic': 'Aeroponic',
      'vegetable': 'Orchard' // Fallback, non usato
    };

    return (
      <GardenOnboarding
        onComplete={handleGardenCreated}
        onCancel={() => setSelectedType(null)}
        initialGardenType={gardenTypeMap[selectedType]}
      />
    );
  }

  // Step 3: Configurazione Impianto Specializzato
  if (createdGarden && (selectedType === 'orchard' || selectedType === 'oliveGrove' || selectedType === 'vineyard')) {
    const presetType = selectedType === 'orchard' ? 'orchard' as const : 
                        selectedType === 'oliveGrove' ? 'oliveGrove' as const : 
                        'vineyard' as const;

    return (
      <OrchardWizard
        gardenId={createdGarden.id}
        garden={createdGarden}
        presetType={presetType}
        onComplete={handleOrchardConfigComplete}
        onCancel={() => setCreatedGarden(null)}
      />
    );
  }

  return null;
};

