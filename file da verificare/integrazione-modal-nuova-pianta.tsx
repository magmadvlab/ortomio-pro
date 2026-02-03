// Integrazione Sistema Semenzaio nel Modal "Nuova Pianta" di OrtoMio
// Questo codice mostra come modificare il flusso esistente

// 1. MODIFICARE IL COMPONENTE "Nuova Pianta"
// Nel file che gestisce il modal "Aggiungi" (probabilmente AddPlantModal.tsx o simile)

import { useRouter } from 'next/navigation';
import CultivationMethodSelector from '@/components/planner/CultivationMethodSelector';

export function NuovaPiantaFlow({ selectedPlant, onClose }) {
  const router = useRouter();
  const [step, setStep] = useState('select-plant'); // 'select-plant' | 'select-method'
  const [selectedPlant, setSelectedPlant] = useState(null);

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
    setStep('select-method');
  };

  const handleMethodSelect = (method, data) => {
    if (method === 'seed') {
      // Reindirizza al semenzaio per creare batch
      onClose();
      router.push(`/app/semenzaio?create=true&plant=${selectedPlant.name}&variety=${selectedPlant.variety || ''}`);
    } else {
      // Continua con il flusso trapianto esistente
      onClose();
      // Qui chiama la funzione esistente per aggiungere pianta direttamente
      addPlantDirectly(selectedPlant, data);
    }
  };

  if (step === 'select-plant') {
    return (
      <div>
        <h3>Seleziona la Pianta</h3>
        {/* Lista piante esistente di OrtoMio */}
        <PlantSelector onSelect={handlePlantSelect} />
      </div>
    );
  }

  if (step === 'select-method') {
    return (
      <div>
        <button onClick={() => setStep('select-plant')} className="mb-4">
          ← Torna alla selezione pianta
        </button>
        
        <h3>Come vuoi coltivare {selectedPlant.name}?</h3>
        
        {/* Integra il nostro selettore metodo */}
        <CultivationMethodSelector
          plant={selectedPlant}
          onSelect={handleMethodSelect}
          userLevel="intermedio"
          currentSeason="primavera"
          compact={true} // Versione compatta per modal
        />
      </div>
    );
  }
}

// 2. VERSIONE COMPATTA DEL CULTIVATION METHOD SELECTOR
// Per il modal, creiamo una versione più compatta

export function CultivationMethodSelectorCompact({ plant, onSelect }) {
  return (
    <div className="space-y-4">
      {/* Dal Seme */}
      <div 
        onClick={() => onSelect('seed', { method: 'seed', plant })}
        className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer transition-all"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🌰</span>
          <div>
            <h4 className="font-semibold">Dal Seme</h4>
            <p className="text-sm text-gray-600">Controllo completo, più economico</p>
          </div>
        </div>
        
        <div className="bg-orange-50 p-2 rounded text-xs">
          <p className="text-orange-800">
            ⏱️ ~90 giorni • 💰 Economico • 🌱 Vai al Semenzaio
          </p>
        </div>
      </div>

      {/* Dalla Piantina */}
      <div 
        onClick={() => onSelect('transplant', { method: 'transplant', plant })}
        className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 cursor-pointer transition-all"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🌿</span>
          <div>
            <h4 className="font-semibold">Dalla Piantina</h4>
            <p className="text-sm text-gray-600">Risultato garantito, più veloce</p>
          </div>
        </div>
        
        <div className="bg-green-50 p-2 rounded text-xs">
          <p className="text-green-800">
            ⏱️ ~60 giorni • ✅ Garantito • 🚀 Trapianto diretto
          </p>
        </div>
      </div>
    </div>
  );
}

// 3. MODIFICARE LA PAGINA SEMENZAIO PER GESTIRE PARAMETRI URL
// In /app/(dashboard)/app/semenzaio/page.tsx

export default function SemenzaioPage() {
  const searchParams = useSearchParams();
  const shouldCreate = searchParams.get('create') === 'true';
  const plantName = searchParams.get('plant');
  const variety = searchParams.get('variety');

  useEffect(() => {
    if (shouldCreate && plantName) {
      // Apri automaticamente il form di creazione batch
      setShowCreateForm(true);
      setPrefilledData({
        plantName: decodeURIComponent(plantName),
        variety: variety ? decodeURIComponent(variety) : ''
      });
    }
  }, [shouldCreate, plantName, variety]);

  // ... resto del componente
}

// 4. AGGIUNGERE ICONA SEMENZAIO NEL MODAL
// Modificare il modal "Aggiungi" per includere accesso diretto al semenzaio

export function AddModal() {
  return (
    <div className="modal">
      <h2>Cosa vuoi aggiungere?</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Nuova Pianta - MODIFICATO */}
        <div onClick={() => openNuovaPiantaFlow()} className="option-card">
          <span className="text-2xl">🌱</span>
          <h3>Nuova Pianta</h3>
          <p>Seme o piantina?</p>
        </div>

        {/* Nuovo Task */}
        <div onClick={() => openNewTask()} className="option-card">
          <span className="text-2xl">📋</span>
          <h3>Nuovo Task</h3>
          <p>Pianifica un'attività</p>
        </div>

        {/* Raccolto */}
        <div onClick={() => openHarvest()} className="option-card">
          <span className="text-2xl">🛒</span>
          <h3>Raccolto</h3>
          <p>Registra un raccolto</p>
        </div>

        {/* NUOVO: Accesso diretto Semenzaio */}
        <div onClick={() => router.push('/app/semenzaio')} className="option-card">
          <span className="text-2xl">🌱</span>
          <h3>Semenzaio</h3>
          <p>Gestisci batch</p>
        </div>
      </div>
    </div>
  );
}

export default {
  NuovaPiantaFlow,
  CultivationMethodSelectorCompact,
  AddModal
};