'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/ortomio-adapter';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/ortomio-adapter';
import { 
  Sprout, 
  Camera, 
  Calendar,
  Clock,
  Thermometer,
  Droplets,
  Sun,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Plus,
  Eye,
  Bell
} from 'lucide-react';

interface SeedlingBatch {
  id: string;
  plantName: string;
  variety: string;
  source: 'home' | 'nursery';
  currentPhase: 'germination' | 'nursing' | 'hardening' | 'ready' | 'transplanted';
  startDate: Date;
  quantity: number;
  survivingQuantity: number;
  photos: Array<{
    id: string;
    url: string;
    date: Date;
    phase: string;
    notes?: string;
  }>;
  notes: string;
  expectedTransplantDate: Date;
  actualTransplantDate?: Date;
}

interface SeedingProgressCardProps {
  batch: SeedlingBatch;
  onPhaseUpdate?: (batchId: string, newPhase: SeedlingBatch['currentPhase']) => void;
  onPhotoAdd?: (batchId: string, photo: File) => void;
  onNotesUpdate?: (batchId: string, notes: string) => void;
  onTransplant?: (batchId: string) => void;
  compact?: boolean;
}

export default function SeedingProgressCard({
  batch,
  onPhaseUpdate,
  onPhotoAdd,
  onNotesUpdate,
  onTransplant,
  compact = false
}: SeedingProgressCardProps) {
  const [showDetails, setShowDetails] = useState(!compact);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newNotes, setNewNotes] = useState(batch.notes);

  // Configurazione fasi
  const phases = [
    {
      id: 'germination',
      name: 'Germinazione',
      icon: <Sprout className="w-4 h-4" />,
      color: 'yellow',
      description: 'I semi stanno germogliando',
      expectedDays: 7,
      tasks: ['Mantenere umidità', 'Controllare temperatura', 'Nebulizzare'],
      conditions: { temp: '18-22°C', humidity: '70-80%', light: 'Indiretta' }
    },
    {
      id: 'nursing',
      name: 'Nursing',
      icon: <Sprout className="w-4 h-4" />,
      color: 'orange',
      description: 'Sviluppo prime foglie vere',
      expectedDays: 30,
      tasks: ['Diradamento', 'Prima concimazione', 'Controllo parassiti'],
      conditions: { temp: '16-20°C', humidity: '60-70%', light: 'Diretta graduale' }
    },
    {
      id: 'hardening',
      name: 'Indurimento',
      icon: <Sun className="w-4 h-4" />,
      color: 'blue',
      description: 'Preparazione alle condizioni esterne',
      expectedDays: 10,
      tasks: ['Esposizione esterna', 'Ridurre irrigazione', 'Controllo robustezza'],
      conditions: { temp: 'Esterna', humidity: '50-60%', light: 'Solare diretta' }
    },
    {
      id: 'ready',
      name: 'Pronto',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'green',
      description: 'Pronto per il trapianto',
      expectedDays: 0,
      tasks: ['Preparare terreno', 'Scegliere posizione', 'Pianificare trapianto'],
      conditions: { temp: '>10°C notte', humidity: 'Terreno umido', light: 'Posizione finale' }
    }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === batch.currentPhase);
  const currentPhaseData = phases[currentPhaseIndex];
  const nextPhaseData = phases[currentPhaseIndex + 1];

  // Calcoli temporali
  const daysSinceStart = Math.floor((new Date().getTime() - batch.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilTransplant = Math.floor((batch.expectedTransplantDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcolo progresso
  const totalExpectedDays = phases.slice(0, -1).reduce((sum, phase) => sum + phase.expectedDays, 0);
  const completedDays = phases.slice(0, currentPhaseIndex).reduce((sum, phase) => sum + phase.expectedDays, 0);
  const progressPercentage = Math.min(100, (completedDays / totalExpectedDays) * 100);

  // Stato di salute del batch
  const survivalRate = (batch.survivingQuantity / batch.quantity) * 100;
  const healthStatus = survivalRate >= 80 ? 'excellent' : survivalRate >= 60 ? 'good' : survivalRate >= 40 ? 'warning' : 'critical';

  const getHealthColor = () => {
    switch (healthStatus) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const handlePhaseAdvance = () => {
    if (nextPhaseData && onPhaseUpdate) {
      onPhaseUpdate(batch.id, nextPhaseData.id as SeedlingBatch['currentPhase']);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPhotoAdd) {
      onPhotoAdd(batch.id, file);
      setIsAddingPhoto(false);
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-${currentPhaseData?.color}-100 border-2 border-${currentPhaseData?.color}-500 flex items-center justify-center`}>
                {currentPhaseData?.icon}
              </div>
              <div>
                <h4 className="font-medium">{batch.plantName}</h4>
                <p className="text-sm text-gray-600">{batch.variety}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={`border-${currentPhaseData?.color}-300 text-${currentPhaseData?.color}-700`}>
                {currentPhaseData?.name}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {batch.survivingQuantity}/{batch.quantity} piantine
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              {batch.source === 'home' ? <Sprout className="w-5 h-5" /> : <Sprout className="w-5 h-5" />}
              {batch.plantName}
            </CardTitle>
            <p className="text-sm text-gray-600">{batch.variety}</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className={`border-${getHealthColor()}-300 text-${getHealthColor()}-700`}>
              {batch.survivingQuantity}/{batch.quantity} piantine
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Sopravvivenza: {survivalRate.toFixed(0)}%
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso generale */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso generale</span>
            <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Iniziato {daysSinceStart} giorni fa</span>
            <span>Trapianto in {daysUntilTransplant} giorni</span>
          </div>
        </div>

        {/* Fase attuale */}
        <Card className={`border-${currentPhaseData?.color}-200 bg-${currentPhaseData?.color}-50`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {currentPhaseData?.icon}
                <h4 className="font-semibold">{currentPhaseData?.name}</h4>
              </div>
              {nextPhaseData && (
                <Button size="sm" onClick={handlePhaseAdvance} className="gap-3">
                  Avanza a {nextPhaseData.name}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}
              {batch.currentPhase === 'ready' && onTransplant && (
                <Button size="sm" onClick={() => onTransplant(batch.id)} className="gap-3">
                  Trapianta Ora
                  <CheckCircle className="w-3 h-3" />
                </Button>
              )}
            </div>

            <p className="text-sm text-gray-700 mb-3">{currentPhaseData?.description}</p>

            {/* Condizioni ambientali */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="flex items-center gap-3 text-xs">
                <Thermometer className="w-3 h-3" />
                {currentPhaseData?.conditions.temp}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Droplets className="w-3 h-3" />
                {currentPhaseData?.conditions.humidity}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Sun className="w-3 h-3" />
                {currentPhaseData?.conditions.light}
              </div>
            </div>

            {/* Task da fare */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Attività da svolgere:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {currentPhaseData?.tasks.map((task, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Timeline fasi */}
        <div>
          <h5 className="font-medium mb-2">Timeline Crescita</h5>
          <div className="flex items-center gap-3">
            {phases.slice(0, -1).map((phase, index) => (
              <React.Fragment key={phase.id}>
                <div className={`flex flex-col items-center gap-1 ${
                  index <= currentPhaseIndex ? 'opacity-100' : 'opacity-40'
                }`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    index < currentPhaseIndex 
                      ? `bg-${phase.color}-500 border-${phase.color}-500 text-white`
                      : index === currentPhaseIndex
                        ? `bg-${phase.color}-100 border-${phase.color}-500 text-${phase.color}-700`
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {index < currentPhaseIndex ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      React.cloneElement(phase.icon, { className: 'w-3 h-3' })
                    )}
                  </div>
                  <span className="text-xs text-center">{phase.name}</span>
                </div>
                {index < phases.length - 2 && (
                  <div className={`flex-1 h-0.5 ${
                    index < currentPhaseIndex ? `bg-${phases[index + 1].color}-500` : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Foto progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">Foto Progresso</h5>
            <Button size="sm" variant="outline" onClick={() => setIsAddingPhoto(true)} className="gap-3">
              <Camera className="w-3 h-3" />
              Aggiungi Foto
            </Button>
          </div>
          
          {batch.photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {batch.photos.slice(-4).map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={photo.url} 
                    alt={`Progresso ${photo.phase}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-3">
                    {photo.phase}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nessuna foto ancora</p>
              <p className="text-xs text-gray-400">Documenta la crescita delle tue piantine</p>
            </div>
          )}

          {/* Input foto nascosto */}
          {isAddingPhoto && (
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id={`photo-upload-${batch.id}`}
            />
          )}
        </div>

        {/* Note */}
        <div>
          <h5 className="font-medium mb-2">Note</h5>
          <textarea
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            onBlur={() => onNotesUpdate?.(batch.id, newNotes)}
            placeholder="Aggiungi note sulla crescita, problemi riscontrati, osservazioni..."
            className="w-full p-3 border rounded-md text-sm resize-none"
            rows={3}
          />
        </div>

        {/* Promemoria e avvisi */}
        {daysUntilTransplant <= 3 && batch.currentPhase === 'ready' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Promemoria: Le piantine sono pronte per il trapianto!
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {survivalRate < 60 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Attenzione: Tasso di sopravvivenza basso ({survivalRate.toFixed(0)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}