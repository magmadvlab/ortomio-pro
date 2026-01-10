import React, { useState, useEffect } from 'react';
import { Garden } from '../types';
import { SaplingBatch } from '../services/saplingService';
import { useStorage } from '../packages/core/context/StorageContext';
import SaplingManager from './SaplingManager';

interface SaplingDashboardProps {
  garden: Garden;
}

const SaplingDashboard: React.FC<SaplingDashboardProps> = ({ garden }) => {
  const { storageProvider } = useStorage();
  const [batches, setBatches] = useState<SaplingBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaplingBatches();
  }, [garden.id]);

  const loadSaplingBatches = async () => {
    try {
      if (!storageProvider) {
        setLoading(false);
        return;
      }

      // Load sapling batches from storage
      const loadedBatches = await storageProvider.getSaplingBatches?.(garden.id) || [];
      setBatches(loadedBatches);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sapling batches:', error);
      setLoading(false);
    }
  };

  const handleBatchCreate = async (batch: SaplingBatch) => {
    try {
      if (!storageProvider) return;
      
      await storageProvider.createSaplingBatch?.(batch);
      setBatches(prev => [batch, ...prev]);
    } catch (error) {
      console.error('Error creating sapling batch:', error);
      alert('Errore nella creazione del batch alberelli');
    }
  };

  const handleBatchUpdate = async (updatedBatch: SaplingBatch) => {
    try {
      if (!storageProvider) return;
      
      await storageProvider.updateSaplingBatch?.(updatedBatch.id, updatedBatch);
      setBatches(prev => prev.map(b => b.id === updatedBatch.id ? updatedBatch : b));
    } catch (error) {
      console.error('Error updating sapling batch:', error);
      alert('Errore nell\'aggiornamento del batch');
    }
  };

  const handleCreateOrchard = async (batch: SaplingBatch) => {
    // TODO: Implement orchard creation from sapling batch
    // This would create a specialized crop (FruitTree, Olive, Vine) from the sapling
    alert(`Funzionalità in sviluppo: Creazione impianto ${batch.saplingType} da ${batch.plantName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento alberelli...</p>
        </div>
      </div>
    );
  }

  return (
    <SaplingManager
      garden={garden}
      batches={batches}
      onBatchCreate={handleBatchCreate}
      onBatchUpdate={handleBatchUpdate}
      onCreateOrchard={handleCreateOrchard}
    />
  );
};

export default SaplingDashboard;