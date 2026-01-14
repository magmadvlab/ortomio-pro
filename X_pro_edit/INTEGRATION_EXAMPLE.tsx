/**
 * ESEMPIO DI INTEGRAZIONE - Sistema Fertilizzanti e Trattamenti PRO
 * 
 * Questo file mostra come integrare il sistema nella versione PRO
 */

import React, { useState, useEffect } from 'react';
import MaintenanceTasks from './components/MaintenanceTasks';
import { ProductCard, GardenTask } from './types';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

// Hook per gestire le schede prodotto
const useProductCards = (gardenId: string) => {
  const [productCards, setProductCards] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica schede prodotto dal database
  useEffect(() => {
    const loadProductCards = async () => {
      try {
        const { data, error } = await supabase
          .from('product_cards')
          .select('*')
          .or(`garden_id.eq.${gardenId},garden_id.is.null`)
          .order('last_used', { ascending: false, nullsFirst: false });

        if (error) throw error;
        setProductCards(data || []);
      } catch (error) {
        console.error('Error loading product cards:', error);
      } finally {
        setLoading(false);
      }
    };

    if (gardenId) {
      loadProductCards();
    }
  }, [gardenId]);

  // Aggiungi nuova scheda prodotto
  const addProductCard = async (card: Omit<ProductCard, 'id'>): Promise<ProductCard> => {
    try {
      const { data, error } = await supabase
        .from('product_cards')
        .insert([card])
        .select()
        .single();

      if (error) throw error;

      const newCard = data as ProductCard;
      setProductCards(prev => [newCard, ...prev]);
      return newCard;
    } catch (error) {
      console.error('Error adding product card:', error);
      throw error;
    }
  };

  // Aggiorna scheda prodotto esistente
  const updateProductCard = async (id: string, updates: Partial<ProductCard>): Promise<ProductCard> => {
    try {
      const { data, error } = await supabase
        .from('product_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCard = data as ProductCard;
      setProductCards(prev => prev.map(c => c.id === id ? updatedCard : c));
      return updatedCard;
    } catch (error) {
      console.error('Error updating product card:', error);
      throw error;
    }
  };

  return { productCards, addProductCard, updateProductCard, loading };
};

// Componente principale che integra il sistema
interface ProMaintenancePageProps {
  activeGardenId: string;
  tasks: GardenTask[];
  onAddTask: (task: Partial<GardenTask>) => Promise<void>;
  onUpdateTask: (task: GardenTask) => Promise<void>;
}

const ProMaintenancePage: React.FC<ProMaintenancePageProps> = ({
  activeGardenId,
  tasks,
  onAddTask,
  onUpdateTask
}) => {
  const { user } = useAuth();
  const { productCards, addProductCard, updateProductCard, loading } = useProductCards(activeGardenId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Caricamento prodotti...</span>
      </div>
    );
  }

  return (
    <MaintenanceTasks
      tasks={tasks}
      onAddTask={onAddTask}
      onUpdateTask={onUpdateTask}
      productCards={productCards}
      onAddProductCard={addProductCard}
      onUpdateProductCard={updateProductCard}
      activeGardenId={activeGardenId}
    />
  );
};

export default ProMaintenancePage;

// ============================================
// ESEMPIO DI MIGRAZIONE DATABASE SUPABASE
// ============================================

/*
-- Esegui questa migrazione nel tuo database Supabase

-- Crea tabella product_cards
CREATE TABLE product_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fertilizer', 'treatment')),
  category TEXT,
  description TEXT,
  scientific_name TEXT,
  active_ingredients TEXT,
  recommended_dosage TEXT,
  application_method TEXT,
  application_frequency TEXT,
  default_repeat_days INTEGER,
  seasonal_adjustment JSONB,
  precautions TEXT[],
  best_for TEXT[],
  avoid_with TEXT[],
  best_time TEXT,
  ph_requirement TEXT,
  organic_certified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  times_used INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  ai_provider TEXT,
  ai_model TEXT,
  ai_prompt TEXT,
  application_history JSONB DEFAULT '[]'::jsonb
);

-- Indici per performance
CREATE INDEX idx_product_cards_user_id ON product_cards(user_id);
CREATE INDEX idx_product_cards_garden_id ON product_cards(garden_id);
CREATE INDEX idx_product_cards_type ON product_cards(type);
CREATE INDEX idx_product_cards_last_used ON product_cards(last_used DESC NULLS LAST);

-- RLS (Row Level Security)
ALTER TABLE product_cards ENABLE ROW LEVEL SECURITY;

-- Policy: utenti possono vedere solo le proprie schede
CREATE POLICY "Users can view own product cards" ON product_cards
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: utenti possono inserire proprie schede
CREATE POLICY "Users can insert own product cards" ON product_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: utenti possono aggiornare proprie schede
CREATE POLICY "Users can update own product cards" ON product_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: utenti possono eliminare proprie schede
CREATE POLICY "Users can delete own product cards" ON product_cards
  FOR DELETE USING (auth.uid() = user_id);
*/

// ============================================
// ESEMPIO DI CONFIGURAZIONE TIER PRO
// ============================================

/*
// Nel tuo sistema di tier, aggiungi le funzionalità PRO:

const PRO_FEATURES = {
  // ... altre funzionalità PRO esistenti
  
  // Sistema Fertilizzanti e Trattamenti AI
  aiProductCards: true,
  unlimitedProductCards: true,
  advancedProductAnalytics: true,
  productCardExport: true,
  customProductCategories: true,
  
  // Limiti aumentati
  maxProductCardsPerGarden: -1, // Illimitato
  maxAIProductGenerationsPerMonth: 100, // vs 10 per FREE
};

// Verifica tier prima di permettere funzionalità
const checkProFeature = (feature: keyof typeof PRO_FEATURES) => {
  const userTier = getCurrentUserTier();
  return userTier === 'PRO' && PRO_FEATURES[feature];
};

// Esempio di utilizzo nel componente
if (!checkProFeature('aiProductCards')) {
  return <UpgradeToProMessage feature="Sistema AI Fertilizzanti e Trattamenti" />;
}
*/