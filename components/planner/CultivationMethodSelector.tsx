'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/ortomio-adapter';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/ortomio-adapter';
import { 
  Sprout, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Thermometer
} from 'lucide-react';

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
  season: string;
}

interface CultivationMethodSelectorProps {
  plant: PlantData;
  onSelect: (method: 'seed' | 'transplant', data: any) => void;
  userLevel?: 'principiante' | 'intermedio' | 'esperto';
  currentSeason?: string;
  weatherConditions?: {
    temperature: number;
    nightTemperature: number;
    humidity: number;
  };
}

export default function CultivationMethodSelector({
  plant,
  onSelect,
  userLevel = 'intermedio',
  currentSeason = 'primavera',
  weatherConditions
}: CultivationMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'seed' | 'transplant' | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Calcoli per i tempi
  const seedToHarvestDays = plant.germinationDays + plant.nursingDays + plant.hardeningDays + plant.harvestDays;
  const transplantToHarvestDays = plant.harvestDays;
  const seedlingReadyDays = plant.germinationDays + plant.nursingDays + plant.hardeningDays;

  // Suggerimenti intelligenti basati su contesto
  const getSmartSuggestion = () => {
    const suggestions = [];
    
    // Suggerimenti basati su livello utente
    if (userLevel === 'principiante') {
      suggestions.push({
        type: 'user',
        method: 'transplant',
        reason: 'Per iniziare, le piantine garantiscono maggior successo'
      });
    }

    // Suggerimenti stagionali
    if (currentSeason === 'estate' && plant.season.includes('primavera')) {
      suggestions.push({
        type: 'season',
        method: 'transplant',
        reason: 'Stagione avanzata: meglio piantine per recuperare tempo'
      });
    }

    // Suggerimenti meteo
    if (weatherConditions?.nightTemperature && weatherConditions.nightTemperature < 10) {
      suggestions.push({
        type: 'weather',
        method: 'seed',
        reason: 'Temperature notturne basse: meglio seminare in casa'
      });
    }

    // Suggerimenti per difficoltà pianta
    if (plant.difficulty === 'difficile') {
      suggestions.push({
        type: 'difficulty',
        method: 'transplant',
        reason: 'Pianta difficile: piantine professionali consigliate'
      });
    }

    return suggestions[0] || null;
  };

  const smartSuggestion = getSmartSuggestion();

  const seedMethod = {
    id: 'seed',
    title: 'Dal Seme',
    icon: <Sprout className="w-8 h-8 text-orange-500" />,
    color: 'orange',
    totalDays: seedToHarvestDays,
    readyForTransplantDays: seedlingReadyDays,
    advantages: [
      'Controllo completo del processo',
      'Costo molto ridotto',
      'Soddisfazione personale',
      'Varietà più ampie disponibili'
    ],
    disadvantages: [
      'Richiede più tempo e attenzione',
      'Rischio di fallimento germinazione',
      'Necessita spazio per semenzaio',
      'Più complesso per principianti'
    ],
    phases: [
      { name: 'Germinazione', days: plant.germinationDays, color: 'yellow' },
      { name: 'Nursing', days: plant.nursingDays, color: 'orange' },
      { name: 'Indurimento', days: plant.hardeningDays, color: 'blue' },
      { name: 'Trapianto', days: 1, color: 'green' },
      { name: 'Crescita', days: plant.harvestDays, color: 'green' }
    ]
  };

  const transplantMethod = {
    id: 'transplant',
    title: 'Dalla Piantina',
    icon: <Sprout className="w-8 h-8 text-green-500" />,
    color: 'green',
    totalDays: transplantToHarvestDays,
    advantages: [
      'Risultato garantito',
      'Tempo ridotto al minimo',
      'Perfetto per principianti',
      'Ideale per stagione avanzata'
    ],
    disadvantages: [
      'Costo maggiore',
      'Meno varietà disponibili',
      'Dipendenza da vivaisti',
      'Meno controllo sulla crescita'
    ],
    phases: [
      { name: 'Trapianto', days: 1, color: 'green' },
      { name: 'Crescita', days: plant.harvestDays, color: 'green' }
    ]
  };

  const handleMethodSelect = (method: 'seed' | 'transplant') => {
    setSelectedMethod(method);
    const methodData = method === 'seed' ? seedMethod : transplantMethod;
    onSelect(method, {
      method,
      totalDays: methodData.totalDays,
      phases: methodData.phases,
      plant: plant
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con suggerimento intelligente */}
      {smartSuggestion && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Suggerimento Intelligente</p>
                <p className="text-sm text-blue-700">{smartSuggestion.reason}</p>
                <Badge variant="outline" className="mt-2 border-blue-300 text-blue-700">
                  Consigliato: {smartSuggestion.method === 'seed' ? 'Dal Seme' : 'Dalla Piantina'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selezione Metodo */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Dal Seme */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedMethod === 'seed' 
              ? 'ring-2 ring-orange-500 border-orange-500' 
              : smartSuggestion?.method === 'seed' 
                ? 'ring-1 ring-blue-300 border-blue-300'
                : 'hover:border-orange-300'
          }`}
          onClick={() => handleMethodSelect('seed')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {seedMethod.icon}
                <CardTitle className="text-lg">{seedMethod.title}</CardTitle>
              </div>
              {smartSuggestion?.method === 'seed' && (
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  Consigliato
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timeline compatta */}
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">
                  Tempo totale: {seedMethod.totalDays} giorni
                </span>
              </div>
              <div className="text-sm text-orange-700">
                Pronto per trapianto in {seedMethod.readyForTransplantDays} giorni
              </div>
            </div>

            {/* Vantaggi principali */}
            <div>
              <p className="font-medium text-green-700 mb-2">✓ Vantaggi</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {seedMethod.advantages.slice(0, 2).map((advantage, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>

            {/* Svantaggi principali */}
            <div>
              <p className="font-medium text-red-700 mb-2">⚠ Considerazioni</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {seedMethod.disadvantages.slice(0, 2).map((disadvantage, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    {disadvantage}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Dalla Piantina */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedMethod === 'transplant' 
              ? 'ring-2 ring-green-500 border-green-500' 
              : smartSuggestion?.method === 'transplant' 
                ? 'ring-1 ring-blue-300 border-blue-300'
                : 'hover:border-green-300'
          }`}
          onClick={() => handleMethodSelect('transplant')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {transplantMethod.icon}
                <CardTitle className="text-lg">{transplantMethod.title}</CardTitle>
              </div>
              {smartSuggestion?.method === 'transplant' && (
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  Consigliato
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timeline compatta */}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">
                  Tempo totale: {transplantMethod.totalDays} giorni
                </span>
              </div>
              <div className="text-sm text-green-700">
                Trapianto immediato, raccolta più veloce
              </div>
            </div>

            {/* Vantaggi principali */}
            <div>
              <p className="font-medium text-green-700 mb-2">✓ Vantaggi</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {transplantMethod.advantages.slice(0, 2).map((advantage, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>

            {/* Svantaggi principali */}
            <div>
              <p className="font-medium text-red-700 mb-2">⚠ Considerazioni</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {transplantMethod.disadvantages.slice(0, 2).map((disadvantage, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    {disadvantage}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pulsante confronto dettagliato */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => setShowComparison(!showComparison)}
          className="gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          {showComparison ? 'Nascondi' : 'Mostra'} Confronto Dettagliato
        </Button>
      </div>

      {/* Confronto dettagliato */}
      {showComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Confronto Dettagliato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Colonna Dal Seme */}
              <div>
                <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  Dal Seme
                </h4>
                
                {/* Timeline fasi */}
                <div className="space-y-2 mb-4">
                  {seedMethod.phases.map((phase, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${phase.color}-500`} />
                      <span className="text-sm">{phase.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {phase.days} {phase.days === 1 ? 'giorno' : 'giorni'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tutti i vantaggi */}
                <div className="mb-4">
                  <p className="font-medium text-green-700 mb-2">Tutti i Vantaggi</p>
                  <ul className="text-sm space-y-1">
                    {seedMethod.advantages.map((advantage, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tutti gli svantaggi */}
                <div>
                  <p className="font-medium text-red-700 mb-2">Tutte le Considerazioni</p>
                  <ul className="text-sm space-y-1">
                    {seedMethod.disadvantages.map((disadvantage, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                        {disadvantage}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Colonna Dalla Piantina */}
              <div>
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  Dalla Piantina
                </h4>
                
                {/* Timeline fasi */}
                <div className="space-y-2 mb-4">
                  {transplantMethod.phases.map((phase, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${phase.color}-500`} />
                      <span className="text-sm">{phase.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {phase.days} {phase.days === 1 ? 'giorno' : 'giorni'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tutti i vantaggi */}
                <div className="mb-4">
                  <p className="font-medium text-green-700 mb-2">Tutti i Vantaggi</p>
                  <ul className="text-sm space-y-1">
                    {transplantMethod.advantages.map((advantage, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tutti gli svantaggi */}
                <div>
                  <p className="font-medium text-red-700 mb-2">Tutte le Considerazioni</p>
                  <ul className="text-sm space-y-1">
                    {transplantMethod.disadvantages.map((disadvantage, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                        {disadvantage}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informazioni contestuali */}
      {weatherConditions && (
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                <span>Temp: {weatherConditions.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Stagione: {currentSeason}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Livello: {userLevel}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}