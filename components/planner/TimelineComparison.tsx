'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/ortomio-adapter';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/ortomio-adapter';
import { 
  Sprout, 
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Thermometer,
  Droplets,
  Sun
} from 'lucide-react';

interface TimelinePhase {
  name: string;
  days: number;
  color: string;
  description: string;
  tasks: string[];
  conditions?: {
    temperature?: string;
    humidity?: string;
    light?: string;
  };
}

interface PlantData {
  name: string;
  archetype_id: string;
  scientific_name: string;
  germinationDays: number;
  nursingDays: number;
  hardeningDays: number;
  transplantDays: number;
  harvestDays: number;
  difficulty: 'facile' | 'media' | 'difficile';
}

interface TimelineComparisonProps {
  plant: PlantData;
  showBoth?: boolean;
  highlightDifferences?: boolean;
  selectedMethod?: 'seed' | 'transplant' | null;
  onMethodSelect?: (method: 'seed' | 'transplant') => void;
}

export default function TimelineComparison({
  plant,
  showBoth = true,
  highlightDifferences = true,
  selectedMethod,
  onMethodSelect
}: TimelineComparisonProps) {
  const [activeView, setActiveView] = useState<'timeline' | 'calendar' | 'phases'>('timeline');

  // Definizione fasi per semina
  const seedPhases: TimelinePhase[] = [
    {
      name: 'Germinazione',
      days: plant.germinationDays,
      color: 'yellow',
      description: 'I semi germogliano e spuntano i primi cotiledoni',
      tasks: [
        'Mantenere umidità costante',
        'Temperatura 18-22°C',
        'Controllare ogni giorno',
        'Nebulizzare se necessario'
      ],
      conditions: {
        temperature: '18-22°C',
        humidity: '70-80%',
        light: 'Luce indiretta'
      }
    },
    {
      name: 'Nursing',
      days: plant.nursingDays,
      color: 'orange',
      description: 'Sviluppo delle prime foglie vere e rafforzamento',
      tasks: [
        'Diradamento piantine',
        'Prima concimazione leggera',
        'Controllo parassiti',
        'Regolare irrigazione'
      ],
      conditions: {
        temperature: '16-20°C',
        humidity: '60-70%',
        light: 'Luce diretta graduale'
      }
    },
    {
      name: 'Indurimento',
      days: plant.hardeningDays,
      color: 'blue',
      description: 'Preparazione delle piantine alle condizioni esterne',
      tasks: [
        'Esposizione graduale all\'esterno',
        'Riduzione irrigazione',
        'Controllo robustezza',
        'Preparazione trapianto'
      ],
      conditions: {
        temperature: 'Temperatura esterna',
        humidity: '50-60%',
        light: 'Luce solare diretta'
      }
    },
    {
      name: 'Trapianto',
      days: 1,
      color: 'green',
      description: 'Trasferimento definitivo nell\'orto',
      tasks: [
        'Preparazione terreno',
        'Trapianto con pane di terra',
        'Irrigazione abbondante',
        'Protezione iniziale'
      ],
      conditions: {
        temperature: '>10°C notturna',
        humidity: 'Terreno umido',
        light: 'Posizione definitiva'
      }
    },
    {
      name: 'Crescita e Raccolta',
      days: plant.harvestDays,
      color: 'green',
      description: 'Sviluppo completo e produzione',
      tasks: [
        'Irrigazione regolare',
        'Concimazioni periodiche',
        'Controllo malattie',
        'Raccolta graduale'
      ],
      conditions: {
        temperature: 'Secondo stagione',
        humidity: 'Secondo necessità',
        light: 'Pieno sole/mezz\'ombra'
      }
    }
  ];

  // Definizione fasi per trapianto
  const transplantPhases: TimelinePhase[] = [
    {
      name: 'Trapianto',
      days: 1,
      color: 'green',
      description: 'Trasferimento piantine acquistate nell\'orto',
      tasks: [
        'Preparazione terreno',
        'Trapianto con pane di terra',
        'Irrigazione abbondante',
        'Protezione iniziale'
      ],
      conditions: {
        temperature: '>10°C notturna',
        humidity: 'Terreno umido',
        light: 'Posizione definitiva'
      }
    },
    {
      name: 'Crescita e Raccolta',
      days: plant.harvestDays,
      color: 'green',
      description: 'Sviluppo completo e produzione',
      tasks: [
        'Irrigazione regolare',
        'Concimazioni periodiche',
        'Controllo malattie',
        'Raccolta graduale'
      ],
      conditions: {
        temperature: 'Secondo stagione',
        humidity: 'Secondo necessità',
        light: 'Pieno sole/mezz\'ombra'
      }
    }
  ];

  const seedTotalDays = seedPhases.reduce((sum, phase) => sum + phase.days, 0);
  const transplantTotalDays = transplantPhases.reduce((sum, phase) => sum + phase.days, 0);
  const timeDifference = seedTotalDays - transplantTotalDays;

  // Calcolo date (esempio)
  const today = new Date();
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // Timeline visiva
  const renderTimeline = (phases: TimelinePhase[], method: 'seed' | 'transplant') => {
    let currentDay = 0;
    
    return (
      <div className="space-y-4">
        {phases.map((phase, index) => {
          const startDay = currentDay;
          currentDay += phase.days;
          const endDay = currentDay;
          const startDate = addDays(today, startDay);
          const endDate = addDays(today, endDay);
          
          return (
            <div key={index} className="relative">
              {/* Linea di connessione */}
              {index < phases.length - 1 && (
                <div className="absolute left-6 top-32 w-0.5 h-8 bg-gray-300" />
              )}
              
              <div className="flex items-start gap-4">
                {/* Icona fase */}
                <div className={`w-12 h-12 rounded-full bg-${phase.color}-100 border-2 border-${phase.color}-500 flex items-center justify-center flex-shrink-0`}>
                  {index === 0 && method === 'seed' && <Sprout className={`w-5 h-5 text-${phase.color}-600`} />}
                  {index === 0 && method === 'transplant' && <Sprout className={`w-5 h-5 text-${phase.color}-600`} />}
                  {index > 0 && <CheckCircle className={`w-5 h-5 text-${phase.color}-600`} />}
                </div>
                
                {/* Contenuto fase */}
                <div className="flex-1 min-w-0">
                  <Card className={`border-${phase.color}-200`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`border-${phase.color}-300 text-${phase.color}-700`}>
                            {phase.days} {phase.days === 1 ? 'giorno' : 'giorni'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(startDate)} - {formatDate(endDate)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                      
                      {/* Condizioni ambientali */}
                      {phase.conditions && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          {phase.conditions.temperature && (
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <Thermometer className="w-3 h-3" />
                              {phase.conditions.temperature}
                            </div>
                          )}
                          {phase.conditions.humidity && (
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <Droplets className="w-3 h-3" />
                              {phase.conditions.humidity}
                            </div>
                          )}
                          {phase.conditions.light && (
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <Sun className="w-3 h-3" />
                              {phase.conditions.light}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Task principali */}
                      <div className="space-y-1">
                        {phase.tasks.slice(0, 2).map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {task}
                          </div>
                        ))}
                        {phase.tasks.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{phase.tasks.length - 2} altre attività
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Vista calendario
  const renderCalendarView = () => {
    const months = [];
    let currentDate = new Date(today);
    
    for (let i = 0; i < 6; i++) {
      months.push({
        name: currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
        weeks: []
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4">
        {months.map((month, index) => (
          <Card key={index} className="p-3">
            <h4 className="font-medium text-center mb-2 capitalize">{month.name}</h4>
            <div className="h-20 bg-gray-50 rounded flex items-center justify-center text-xs text-gray-500">
              Calendario dettagliato
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold text-orange-600">{seedTotalDays}</div>
              <div className="text-sm text-gray-600">Giorni dal seme</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-green-600">{transplantTotalDays}</div>
              <div className="text-sm text-gray-600">Giorni da piantina</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-blue-600">{timeDifference}</div>
              <div className="text-sm text-gray-600">Giorni di differenza</div>
            </div>
          </div>
          
          {highlightDifferences && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 text-blue-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">
                  Scegliendo le piantine risparmi {timeDifference} giorni e puoi raccogliere prima!
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigazione per diverse viste */}
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setActiveView('timeline')}
          className={`px-4 py-2 rounded ${activeView === 'timeline' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Timeline
        </button>
        <button 
          onClick={() => setActiveView('phases')}
          className={`px-4 py-2 rounded ${activeView === 'phases' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Fasi Dettagliate
        </button>
        <button 
          onClick={() => setActiveView('calendar')}
          className={`px-4 py-2 rounded ${activeView === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Vista Calendario
        </button>
      </div>

      {activeView === 'timeline' && (
        <div className="space-y-6">
          {showBoth ? (
            <div className="grid lg:grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timeline Dal Seme */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sprout className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-orange-700">Dal Seme</h3>
                  {onMethodSelect && (
                    <Button 
                      size="sm" 
                      variant={selectedMethod === 'seed' ? 'primary' : 'outline'}
                      onClick={() => onMethodSelect('seed')}
                      className="ml-auto"
                    >
                      Seleziona
                    </Button>
                  )}
                </div>
                {renderTimeline(seedPhases, 'seed')}
              </div>

              {/* Timeline Dalla Piantina */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sprout className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-green-700">Dalla Piantina</h3>
                  {onMethodSelect && (
                    <Button 
                      size="sm" 
                      variant={selectedMethod === 'transplant' ? 'primary' : 'outline'}
                      onClick={() => onMethodSelect('transplant')}
                      className="ml-auto"
                    >
                      Seleziona
                    </Button>
                  )}
                </div>
                {renderTimeline(transplantPhases, 'transplant')}
              </div>
            </div>
          ) : (
            <div>
              {selectedMethod === 'seed' && renderTimeline(seedPhases, 'seed')}
              {selectedMethod === 'transplant' && renderTimeline(transplantPhases, 'transplant')}
            </div>
          )}
        </div>
      )}

      {activeView === 'phases' && (
        <div className="space-y-4">
          {/* Confronto dettagliato delle fasi */}
          <div className="grid gap-4">
            {seedPhases.map((seedPhase, index) => {
              const transplantPhase = transplantPhases[index - 3]; // Offset per le fasi iniziali
              
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fase dal seme */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full bg-${seedPhase.color}-500`} />
                          <h4 className="font-medium">{seedPhase.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {seedPhase.days} giorni
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{seedPhase.description}</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {seedPhase.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-center gap-3">
                              <div className="w-1 h-1 bg-gray-400 rounded-full" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Fase da piantina (se esiste) */}
                      <div>
                        {transplantPhase ? (
                          <>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-3 h-3 rounded-full bg-${transplantPhase.color}-500`} />
                              <h4 className="font-medium">{transplantPhase.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {transplantPhase.days} giorni
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{transplantPhase.description}</p>
                            <ul className="text-xs text-gray-500 space-y-1">
                              {transplantPhase.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="flex items-center gap-3">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            Fase non necessaria con piantine
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeView === 'calendar' && (
        <div>
          {renderCalendarView()}
        </div>
      )}
    </div>
  );
}