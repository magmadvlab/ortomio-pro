'use client';

import React, { useState, useEffect } from 'react';
import { Garden } from '@/types';
import { Card } from '@/components/ui/Card';
import { CardContent, CardHeader, CardTitle, Badge, Input } from '@/components/ui/ortomio-adapter';
import { Button } from '@/components/ui/Button';
import { useStorage } from '@/packages/core/hooks/useStorage';
import {
  SeedlingBatch as StoredSeedlingBatch,
  isReadyToTransplant
} from '@/services/seedlingService';
import { getMasterSheetSync } from '@/services/plantMasterService';
import { 
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
import SeedingProgressCard from './SeedingProgressCard';

interface SeedlingDashboardBatch {
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
  garden: Garden;
  shouldCreate?: boolean;
  plantName?: string;
  variety?: string;
  batches?: StoredSeedlingBatch[];
  onBatchCreate?: (batch: Partial<StoredSeedlingBatch>) => void;
  onBatchUpdate?: (batchId: string, updates: Partial<StoredSeedlingBatch>) => void;
  onBatchDelete?: (batchId: string) => void;
  maxBatches?: number; // Limite per versione free
}

export default function SeedlingDashboard({
  garden,
  shouldCreate = false,
  plantName,
  variety,
  batches,
  onBatchCreate,
  onBatchUpdate,
  onBatchDelete,
  maxBatches = 10
}: SeedlingDashboardProps) {
  const { storageProvider } = useStorage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [loadedBatches, setLoadedBatches] = useState<StoredSeedlingBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadBatches = async () => {
      if (typeof batches !== 'undefined') {
        setLoadedBatches([]);
        setLoadingBatches(false);
        return;
      }

      try {
        setLoadingBatches(true);
        const data = await storageProvider.getSeedlingBatches(garden.id);
        if (!cancelled) {
          setLoadedBatches(data || []);
        }
      } catch (error) {
        console.error('Error loading real seedling batches:', error);
        if (!cancelled) {
          setLoadedBatches([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingBatches(false);
        }
      }
    };

    void loadBatches();

    return () => {
      cancelled = true;
    };
  }, [batches, garden.id, storageProvider]);

  const activeStoredBatches = typeof batches !== 'undefined' ? batches : loadedBatches;

  const mapPhaseToDashboard = (batch: StoredSeedlingBatch): SeedlingDashboardBatch['currentPhase'] => {
    const remaining = batch.currentQuantity ?? batch.initialQuantity ?? batch.quantity;
    if (remaining <= 0) {
      return 'transplanted';
    }

    switch (batch.phase) {
      case 'Nursing':
        return 'nursing';
      case 'Hardening':
        return 'hardening';
      case 'ReadyToTransplant':
        return 'ready';
      case 'Sowing':
      case 'Germination':
      default:
        return 'germination';
    }
  };

  const activeBatches: SeedlingDashboardBatch[] = activeStoredBatches.map((batch) => ({
    id: batch.id,
    plantName: batch.plantName,
    variety: batch.variety || 'Varietà non specificata',
    source: batch.source || 'home',
    currentPhase: mapPhaseToDashboard(batch),
    startDate: new Date(batch.purchaseDate || batch.sowingDate),
    quantity: batch.initialQuantity ?? batch.quantity,
    survivingQuantity: batch.currentQuantity ?? batch.initialQuantity ?? batch.quantity,
    photos: (batch.photoLog || []).map((photo, index) => ({
      id: `${batch.id}-${index}`,
      url: photo.image,
      date: new Date(photo.date),
      phase: batch.phase,
      notes: photo.notes
    })),
    notes: batch.notes || '',
    expectedTransplantDate: new Date(batch.expectedTransplantDate || batch.purchaseDate || batch.sowingDate),
    actualTransplantDate: undefined
  }));

  // Filtri e ricerca
  const filteredBatches = activeBatches.filter(batch => {
    const matchesSearch = batch.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = filterPhase === 'all' || batch.currentPhase === filterPhase;
    return matchesSearch && matchesPhase;
  });

  // Statistiche
  const stats = {
    total: activeBatches.length,
    active: activeBatches.filter(b => b.currentPhase !== 'transplanted').length,
    ready: activeBatches.filter(b => b.currentPhase === 'ready').length,
    germinating: activeBatches.filter(b => b.currentPhase === 'germination').length,
    totalSeedlings: activeBatches.reduce((sum, b) => sum + b.survivingQuantity, 0),
    averageSurvival: activeBatches.length > 0 
      ? activeBatches.reduce((sum, b) => sum + (b.survivingQuantity / b.quantity), 0) / activeBatches.length * 100
      : 0
  };

  // Promemoria e avvisi
  const alerts = activeStoredBatches.flatMap((batch) => {
    const items: Array<{
      type: 'ready' | 'delayed' | 'survival';
      message: string;
      batch: StoredSeedlingBatch;
      priority: 'high' | 'medium';
    }> = [];
    const label = batch.variety ? `${batch.plantName} (${batch.variety})` : batch.plantName;
    const readyCheck = isReadyToTransplant(batch, garden);
    const initialQuantity = batch.initialQuantity ?? batch.quantity;
    const currentQuantity = batch.currentQuantity ?? initialQuantity;
    const survivalRate = initialQuantity > 0 ? currentQuantity / initialQuantity : 1;
    const startDate = new Date(batch.purchaseDate || batch.sowingDate);
    const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const masterData = getMasterSheetSync(batch.plantName);
    const maxGerminationDays = masterData?.germination.emergenceDays.max ?? 14;

    if (readyCheck.ready && currentQuantity > 0) {
      items.push({
        type: 'ready',
        message: `${label} è pronto per il trapianto`,
        batch,
        priority: 'high'
      });
    }

    if (
      batch.source !== 'nursery' &&
      (batch.phase === 'Sowing' || batch.phase === 'Germination') &&
      daysSinceStart > maxGerminationDays + 3
    ) {
      items.push({
        type: 'delayed',
        message: `${label} ha germinazione ritardata rispetto ai tempi attesi`,
        batch,
        priority: 'medium'
      });
    }

    if (survivalRate < 0.5) {
      items.push({
        type: 'survival',
        message: `${label} ha bassa sopravvivenza (${Math.round(survivalRate * 100)}%)`,
        batch,
        priority: 'high'
      });
    }

    return items;
  });

  const handlePhaseUpdate = async (batchId: string, newPhase: SeedlingDashboardBatch['currentPhase']) => {
    const phaseMap: Record<Exclude<SeedlingDashboardBatch['currentPhase'], 'transplanted'>, StoredSeedlingBatch['phase']> = {
      germination: 'Germination',
      nursing: 'Nursing',
      hardening: 'Hardening',
      ready: 'ReadyToTransplant'
    };

    if (newPhase === 'transplanted') {
      return;
    }

    const updates: Partial<StoredSeedlingBatch> = { phase: phaseMap[newPhase] };
    if (onBatchUpdate) {
      onBatchUpdate(batchId, updates);
      return;
    }

    try {
      await storageProvider.updateSeedlingBatch(batchId, updates);
      const refreshed = await storageProvider.getSeedlingBatches(garden.id);
      setLoadedBatches(refreshed || []);
    } catch (error) {
      console.error('Error updating seedling phase:', error);
      alert('Errore durante l\'aggiornamento della fase del batch');
    }
  };

  const handlePhotoAdd = (batchId: string, photo: File) => {
    // Logica per aggiungere foto
    console.log('Adding photo to batch:', batchId, photo);
  };

  const handleNotesUpdate = async (batchId: string, notes: string) => {
    const updates: Partial<StoredSeedlingBatch> = { notes };
    if (onBatchUpdate) {
      onBatchUpdate(batchId, updates);
      return;
    }

    try {
      await storageProvider.updateSeedlingBatch(batchId, updates);
      const refreshed = await storageProvider.getSeedlingBatches(garden.id);
      setLoadedBatches(refreshed || []);
    } catch (error) {
      console.error('Error updating seedling notes:', error);
      alert('Errore durante l\'aggiornamento delle note del batch');
    }
  };

  return (
    <div className="space-y-6">
      {loadingBatches && typeof batches === 'undefined' && (
        <Card>
          <CardContent className="p-4 text-sm text-gray-600">
            Caricamento batch semenzaio reali...
          </CardContent>
        </Card>
      )}

      {/* Header con statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batch Attivi</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Sprout className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pronti</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{stats.ready}</p>
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
                <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.totalSeedlings}</p>
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
                <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.averageSurvival.toFixed(0)}%</p>
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
            <CardTitle className="flex items-center gap-3 text-orange-800">
              <Bell className="w-5 h-5" />
              Promemoria e Avvisi ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                {alert.type === 'ready' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {alert.type === 'delayed' && <Clock className="w-4 h-4 text-yellow-full max-w-sm" />}
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
      <div className="flex flex-col sm:flex-col md:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cerca per pianta o varietà..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            className="px-4 py-3 text-base border rounded-md text-sm"
          >
            <option value="all">Tutte le fasi</option>
            <option value="germination">Germinazione</option>
            <option value="nursing">Nursing</option>
            <option value="hardening">Indurimento</option>
            <option value="ready">Pronto</option>
            <option value="transplanted">Trapiantato</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            disabled={activeBatches.length >= maxBatches}
            className="gap-3"
          >
            <Plus className="w-4 h-4" />
            Nuovo Batch
          </Button>
        </div>
      </div>

      {/* Limite versione free */}
      {activeBatches.length >= maxBatches && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
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
              compact={viewMode === 'list'}
            />
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Nessun batch trovato</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterPhase !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia creando il tuo primo batch di semenzaio'
                }
              </p>
              {!searchTerm && filterPhase === 'all' && (
                <Button onClick={() => setShowCreateForm(true)} className="gap-3">
                  <Plus className="w-4 h-4" />
                  Crea Primo Batch
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigazione sezioni */}
      <div className="flex space-x-2 mt-8 mb-6">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded ${activeTab === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Attivi
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded ${activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Completati
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded ${activeTab === 'analytics' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Statistiche
        </button>
      </div>

      {activeTab === 'active' && (
        <div>
          {/* Contenuto già mostrato sopra */}
        </div>
      )}

      {activeTab === 'completed' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBatches
              .filter(b => b.currentPhase === 'transplanted')
              .map((batch) => (
                <SeedingProgressCard
                  key={batch.id}
                  batch={batch}
                  compact={true}
                />
              ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grafico sopravvivenza */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5" />
                  Tasso di Sopravvivenza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeBatches.slice(0, 5).map((batch) => {
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
                <CardTitle className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  Tempi di Crescita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-blue-600">
                      {Math.round(
                        activeBatches
                          .filter(b => b.actualTransplantDate)
                          .reduce((sum, b) => {
                            const days = (b.actualTransplantDate!.getTime() - b.startDate.getTime()) / (1000 * 60 * 60 * 24);
                            return sum + days;
                          }, 0) / activeBatches.filter(b => b.actualTransplantDate).length || 0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Giorni medi al trapianto</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-green-600">
                      {stats.averageSurvival.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Sopravvivenza media</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
            <div className="flex gap-3 mt-4">
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
