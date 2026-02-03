'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Seed, 
  Sprout, 
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Camera,
  Bell,
  BarChart3,
  Grid3X3,
  List
} from 'lucide-react';
import SeedingProgressCard from './ortomio-seeding-progress-card';

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

interface SeedlingDashboardProps {
  batches: SeedlingBatch[];
  onBatchCreate?: (batch: Partial<SeedlingBatch>) => void;
  onBatchUpdate?: (batchId: string, updates: Partial<SeedlingBatch>) => void;
  onBatchDelete?: (batchId: string) => void;
  maxBatches?: number; // Limite per versione free
}

export default function SeedlingDashboard({
  batches,
  onBatchCreate,
  onBatchUpdate,
  onBatchDelete,
  maxBatches = 10
}: SeedlingDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filtri e ricerca
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = filterPhase === 'all' || batch.currentPhase === filterPhase;
    return matchesSearch && matchesPhase;
  });

  // Statistiche
  const stats = {
    total: batches.length,
    active: batches.filter(b => b.currentPhase !== 'transplanted').length,
    ready: batches.filter(b => b.currentPhase === 'ready').length,
    germinating: batches.filter(b => b.currentPhase === 'germination').length,
    totalSeedlings: batches.reduce((sum, b) => sum + b.survivingQuantity, 0),
    averageSurvival: batches.length > 0 
      ? batches.reduce((sum, b) => sum + (b.survivingQuantity / b.quantity), 0) / batches.length * 100
      : 0
  };

  // Promemoria e avvisi
  const alerts = [
    ...batches.filter(b => b.currentPhase === 'ready').map(b => ({
      type: 'ready',
      message: `${b.plantName} (${b.variety}) è pronto per il trapianto`,
      batch: b,
      priority: 'high'
    })),
    ...batches.filter(b => {
      const daysSinceStart = (new Date().getTime() - b.startDate.getTime()) / (1000 * 60 * 60 * 24);
      return b.currentPhase === 'germination' && daysSinceStart > 14;
    }).map(b => ({
      type: 'delayed',
      message: `${b.plantName} (${b.variety}) ha germinazione ritardata`,
      batch: b,
      priority: 'medium'
    })),
    ...batches.filter(b => (b.survivingQuantity / b.quantity) < 0.5).map(b => ({
      type: 'survival',
      message: `${b.plantName} (${b.variety}) ha bassa sopravvivenza`,
      batch: b,
      priority: 'high'
    }))
  ];

  const handlePhaseUpdate = (batchId: string, newPhase: SeedlingBatch['currentPhase']) => {
    onBatchUpdate?.(batchId, { currentPhase: newPhase });
  };

  const handlePhotoAdd = (batchId: string, photo: File) => {
    // Logica per aggiungere foto
    console.log('Adding photo to batch:', batchId, photo);
  };

  const handleNotesUpdate = (batchId: string, notes: string) => {
    onBatchUpdate?.(batchId, { notes });
  };

  const handleTransplant = (batchId: string) => {
    onBatchUpdate?.(batchId, { 
      currentPhase: 'transplanted',
      actualTransplantDate: new Date()
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batch Attivi</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Seed className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pronti</p>
                <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Piantine Totali</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalSeedlings}</p>
              </div>
              <Sprout className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sopravvivenza</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageSurvival.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avvisi e promemoria */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="w-5 h-5" />
              Promemoria e Avvisi ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                {alert.type === 'ready' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {alert.type === 'delayed' && <Clock className="w-4 h-4 text-yellow-500" />}
                {alert.type === 'survival' && <AlertCircle className="w-4 h-4 text-red-500" />}
                <span className="text-sm flex-1">{alert.message}</span>
                <Badge variant="outline" className={
                  alert.priority === 'high' ? 'border-red-300 text-red-700' : 'border-yellow-300 text-yellow-700'
                }>
                  {alert.priority === 'high' ? 'Urgente' : 'Attenzione'}
                </Badge>
              </div>
            ))}
            {alerts.length > 3 && (
              <p className="text-sm text-orange-700">
                +{alerts.length - 3} altri avvisi
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Controlli */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cerca per pianta o varietà..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Tutte le fasi</option>
            <option value="germination">Germinazione</option>
            <option value="nursing">Nursing</option>
            <option value="hardening">Indurimento</option>
            <option value="ready">Pronto</option>
            <option value="transplanted">Trapiantato</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            disabled={batches.length >= maxBatches}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuovo Batch
          </Button>
        </div>
      </div>

      {/* Limite versione free */}
      {batches.length >= maxBatches && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Hai raggiunto il limite di {maxBatches} batch per la versione gratuita. 
                Passa a Pro per batch illimitati!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista batch */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
      }>
        {filteredBatches.length > 0 ? (
          filteredBatches.map((batch) => (
            <SeedingProgressCard
              key={batch.id}
              batch={batch}
              onPhaseUpdate={handlePhaseUpdate}
              onPhotoAdd={handlePhotoAdd}
              onNotesUpdate={handleNotesUpdate}
              onTransplant={handleTransplant}
              compact={viewMode === 'list'}
            />
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Seed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Nessun batch trovato</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterPhase !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia creando il tuo primo batch di semenzaio'
                }
              </p>
              {!searchTerm && filterPhase === 'all' && (
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Crea Primo Batch
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs aggiuntive */}
      <Tabs defaultValue="active" className="mt-8">
        <TabsList>
          <TabsTrigger value="active">Attivi</TabsTrigger>
          <TabsTrigger value="completed">Completati</TabsTrigger>
          <TabsTrigger value="analytics">Statistiche</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {/* Contenuto già mostrato sopra */}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches
              .filter(b => b.currentPhase === 'transplanted')
              .map((batch) => (
                <SeedingProgressCard
                  key={batch.id}
                  batch={batch}
                  compact={true}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grafico sopravvivenza */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Tasso di Sopravvivenza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {batches.slice(0, 5).map((batch) => {
                    const survivalRate = (batch.survivingQuantity / batch.quantity) * 100;
                    return (
                      <div key={batch.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{batch.plantName}</span>
                          <span>{survivalRate.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              survivalRate >= 80 ? 'bg-green-500' :
                              survivalRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${survivalRate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tempi di crescita */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tempi di Crescita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        batches
                          .filter(b => b.actualTransplantDate)
                          .reduce((sum, b) => {
                            const days = (b.actualTransplantDate!.getTime() - b.startDate.getTime()) / (1000 * 60 * 60 * 24);
                            return sum + days;
                          }, 0) / batches.filter(b => b.actualTransplantDate).length || 0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Giorni medi al trapianto</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.averageSurvival.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Sopravvivenza media</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form creazione batch (placeholder) */}
      {showCreateForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Crea Nuovo Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Form per creare nuovo batch di semenzaio...
            </p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setShowCreateForm(false)} variant="outline">
                Annulla
              </Button>
              <Button onClick={() => setShowCreateForm(false)}>
                Crea Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}