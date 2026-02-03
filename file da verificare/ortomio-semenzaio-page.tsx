'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SeedlingDashboard from '../components/seedling/SeedlingDashboard';

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

export default function SemenzaioPage() {
  const [batches, setBatches] = useState<SeedlingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  // Carica i batch dal database Supabase
  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('seedling_batches')
        .select(`
          *,
          seedling_photos (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Trasforma i dati Supabase nel formato dei componenti
      const transformedBatches: SeedlingBatch[] = data?.map(batch => ({
        id: batch.id,
        plantName: batch.plant_name,
        variety: batch.variety || 'Varietà standard',
        source: batch.source,
        currentPhase: batch.current_phase,
        startDate: new Date(batch.start_date),
        quantity: batch.initial_quantity,
        survivingQuantity: batch.current_quantity,
        photos: batch.seedling_photos?.map((photo: any) => ({
          id: photo.id,
          url: photo.photo_url,
          date: new Date(photo.created_at),
          phase: photo.growth_phase,
          notes: photo.notes
        })) || [],
        notes: batch.notes || '',
        expectedTransplantDate: new Date(batch.expected_transplant_date),
        actualTransplantDate: batch.actual_transplant_date ? new Date(batch.actual_transplant_date) : undefined
      })) || [];

      setBatches(transformedBatches);
    } catch (error) {
      console.error('Errore caricamento batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchCreate = async (batchData: Partial<SeedlingBatch>) => {
    try {
      const { data, error } = await supabase
        .from('seedling_batches')
        .insert({
          plant_name: batchData.plantName,
          variety: batchData.variety,
          source: batchData.source,
          current_phase: 'germination',
          start_date: new Date().toISOString(),
          initial_quantity: batchData.quantity,
          current_quantity: batchData.quantity,
          expected_transplant_date: batchData.expectedTransplantDate?.toISOString(),
          notes: batchData.notes
        })
        .select()
        .single();

      if (error) throw error;

      // Ricarica i batch
      loadBatches();
    } catch (error) {
      console.error('Errore creazione batch:', error);
    }
  };

  const handleBatchUpdate = async (batchId: string, updates: Partial<SeedlingBatch>) => {
    try {
      const updateData: any = {};
      
      if (updates.currentPhase) updateData.current_phase = updates.currentPhase;
      if (updates.survivingQuantity !== undefined) updateData.current_quantity = updates.survivingQuantity;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.actualTransplantDate) updateData.actual_transplant_date = updates.actualTransplantDate.toISOString();

      const { error } = await supabase
        .from('seedling_batches')
        .update(updateData)
        .eq('id', batchId);

      if (error) throw error;

      // Se il batch è stato trapiantato, crea le plant_instances
      if (updates.currentPhase === 'transplanted') {
        await createPlantInstances(batchId);
      }

      // Ricarica i batch
      loadBatches();
    } catch (error) {
      console.error('Errore aggiornamento batch:', error);
    }
  };

  // Crea le plant_instances quando il batch viene trapiantato
  const createPlantInstances = async (batchId: string) => {
    try {
      const batch = batches.find(b => b.id === batchId);
      if (!batch) return;

      // Crea una plant_instance per ogni piantina sopravvissuta
      const plantInstances = Array.from({ length: batch.survivingQuantity }, (_, index) => ({
        plant_name: batch.plantName,
        variety: batch.variety,
        source: 'seedling_batch',
        source_batch_id: batchId,
        planting_date: batch.actualTransplantDate?.toISOString() || new Date().toISOString(),
        status: 'growing',
        notes: `Trapiantata da batch semenzaio - Pianta ${index + 1}/${batch.survivingQuantity}`
      }));

      const { error } = await supabase
        .from('plant_instances')
        .insert(plantInstances);

      if (error) throw error;

      console.log(`Create ${batch.survivingQuantity} plant instances per batch ${batchId}`);
    } catch (error) {
      console.error('Errore creazione plant instances:', error);
    }
  };

  const handleBatchDelete = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('seedling_batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;

      // Ricarica i batch
      loadBatches();
    } catch (error) {
      console.error('Errore eliminazione batch:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento semenzaio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              🌱 Semenzaio OrtoMio Pro
            </h1>
            <p className="mt-2 text-gray-600">
              Gestisci i tuoi batch di semina e monitora la crescita delle piantine
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SeedlingDashboard
          batches={batches}
          onBatchCreate={handleBatchCreate}
          onBatchUpdate={handleBatchUpdate}
          onBatchDelete={handleBatchDelete}
          maxBatches={10} // Limite per versione free
        />
      </div>
    </div>
  );
}