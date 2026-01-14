/**
 * Hook per gestire le schede prodotto AI (fertilizzanti e trattamenti)
 * Integrazione con Supabase per OrtoMio PRO
 */

import { useState, useEffect } from 'react';
import { ProductCard } from '@/types';
import { useAuth } from '@/packages/core/hooks/useAuth';
import { getSupabaseClient } from '@/config/supabase';

export const useProductCards = (gardenId?: string) => {
  const [productCards, setProductCards] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Carica schede prodotto dal database
  useEffect(() => {
    const loadProductCards = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setError('Database non disponibile');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('product_cards')
          .select('*')
          .eq('user_id', user.id);

        // Se specificato un garden, filtra per quello o schede globali
        if (gardenId) {
          query = query.or(`garden_id.eq.${gardenId},garden_id.is.null`);
        }

        const { data, error: fetchError } = await query
          .order('last_used', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Converti i dati dal database al formato ProductCard
        const cards: ProductCard[] = (data || []).map(row => ({
          id: row.id,
          userId: row.user_id,
          gardenId: row.garden_id,
          name: row.name,
          type: row.type,
          category: row.category,
          description: row.description,
          scientificName: row.scientific_name,
          activeIngredients: row.active_ingredients,
          recommendedDosage: row.recommended_dosage,
          applicationMethod: row.application_method,
          applicationFrequency: row.application_frequency,
          defaultRepeatDays: row.default_repeat_days,
          seasonalAdjustment: row.seasonal_adjustment,
          precautions: row.precautions || [],
          bestFor: row.best_for || [],
          avoidWith: row.avoid_with || [],
          bestTime: row.best_time,
          phRequirement: row.ph_requirement,
          organicCertified: row.organic_certified,
          createdAt: row.created_at,
          lastUsed: row.last_used,
          timesUsed: row.times_used,
          aiGenerated: row.ai_generated,
          aiProvider: row.ai_provider,
          aiModel: row.ai_model,
          aiPrompt: row.ai_prompt,
          applicationHistory: row.application_history || []
        }));

        setProductCards(cards);
      } catch (error: any) {
        console.error('Error loading product cards:', error);
        setError(error.message || 'Errore nel caricamento delle schede prodotto');
      } finally {
        setLoading(false);
      }
    };

    loadProductCards();
  }, [user, gardenId]);

  // Aggiungi nuova scheda prodotto
  const addProductCard = async (card: Omit<ProductCard, 'id'>): Promise<ProductCard> => {
    if (!user) throw new Error('Utente non autenticato');

    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database non disponibile');

    try {
      // Converti al formato database
      const dbCard = {
        user_id: user.id, // Manteniamo come stringa
        garden_id: card.gardenId,
        name: card.name,
        type: card.type,
        category: card.category,
        description: card.description,
        scientific_name: card.scientificName,
        active_ingredients: card.activeIngredients,
        recommended_dosage: card.recommendedDosage,
        application_method: card.applicationMethod,
        application_frequency: card.applicationFrequency,
        default_repeat_days: card.defaultRepeatDays,
        seasonal_adjustment: card.seasonalAdjustment,
        precautions: card.precautions,
        best_for: card.bestFor,
        avoid_with: card.avoidWith,
        best_time: card.bestTime,
        ph_requirement: card.phRequirement,
        organic_certified: card.organicCertified,
        last_used: card.lastUsed,
        times_used: card.timesUsed,
        ai_generated: card.aiGenerated,
        ai_provider: card.aiProvider,
        ai_model: card.aiModel,
        ai_prompt: card.aiPrompt,
        application_history: card.applicationHistory
      };

      const { data, error } = await supabase
        .from('product_cards')
        .insert([dbCard])
        .select()
        .single();

      if (error) throw error;

      // Converti di nuovo al formato ProductCard
      const newCard: ProductCard = {
        id: data.id,
        userId: data.user_id,
        gardenId: data.garden_id,
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        scientificName: data.scientific_name,
        activeIngredients: data.active_ingredients,
        recommendedDosage: data.recommended_dosage,
        applicationMethod: data.application_method,
        applicationFrequency: data.application_frequency,
        defaultRepeatDays: data.default_repeat_days,
        seasonalAdjustment: data.seasonal_adjustment,
        precautions: data.precautions || [],
        bestFor: data.best_for || [],
        avoidWith: data.avoid_with || [],
        bestTime: data.best_time,
        phRequirement: data.ph_requirement,
        organicCertified: data.organic_certified,
        createdAt: data.created_at,
        lastUsed: data.last_used,
        timesUsed: data.times_used,
        aiGenerated: data.ai_generated,
        aiProvider: data.ai_provider,
        aiModel: data.ai_model,
        aiPrompt: data.ai_prompt,
        applicationHistory: data.application_history || []
      };

      setProductCards(prev => [newCard, ...prev]);
      return newCard;
    } catch (error: any) {
      console.error('Error adding product card:', error);
      throw error;
    }
  };

  // Aggiorna scheda prodotto esistente
  const updateProductCard = async (id: string, updates: Partial<ProductCard>): Promise<ProductCard> => {
    if (!user) throw new Error('Utente non autenticato');

    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database non disponibile');

    try {
      // Converti gli aggiornamenti al formato database
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.scientificName !== undefined) dbUpdates.scientific_name = updates.scientificName;
      if (updates.activeIngredients !== undefined) dbUpdates.active_ingredients = updates.activeIngredients;
      if (updates.recommendedDosage !== undefined) dbUpdates.recommended_dosage = updates.recommendedDosage;
      if (updates.applicationMethod !== undefined) dbUpdates.application_method = updates.applicationMethod;
      if (updates.applicationFrequency !== undefined) dbUpdates.application_frequency = updates.applicationFrequency;
      if (updates.defaultRepeatDays !== undefined) dbUpdates.default_repeat_days = updates.defaultRepeatDays;
      if (updates.seasonalAdjustment !== undefined) dbUpdates.seasonal_adjustment = updates.seasonalAdjustment;
      if (updates.precautions !== undefined) dbUpdates.precautions = updates.precautions;
      if (updates.bestFor !== undefined) dbUpdates.best_for = updates.bestFor;
      if (updates.avoidWith !== undefined) dbUpdates.avoid_with = updates.avoidWith;
      if (updates.bestTime !== undefined) dbUpdates.best_time = updates.bestTime;
      if (updates.phRequirement !== undefined) dbUpdates.ph_requirement = updates.phRequirement;
      if (updates.organicCertified !== undefined) dbUpdates.organic_certified = updates.organicCertified;
      if (updates.lastUsed !== undefined) dbUpdates.last_used = updates.lastUsed;
      if (updates.timesUsed !== undefined) dbUpdates.times_used = updates.timesUsed;
      if (updates.applicationHistory !== undefined) dbUpdates.application_history = updates.applicationHistory;

      const { data, error } = await supabase
        .from('product_cards')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Converti di nuovo al formato ProductCard
      const updatedCard: ProductCard = {
        id: data.id,
        userId: data.user_id,
        gardenId: data.garden_id,
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        scientificName: data.scientific_name,
        activeIngredients: data.active_ingredients,
        recommendedDosage: data.recommended_dosage,
        applicationMethod: data.application_method,
        applicationFrequency: data.application_frequency,
        defaultRepeatDays: data.default_repeat_days,
        seasonalAdjustment: data.seasonal_adjustment,
        precautions: data.precautions || [],
        bestFor: data.best_for || [],
        avoidWith: data.avoid_with || [],
        bestTime: data.best_time,
        phRequirement: data.ph_requirement,
        organicCertified: data.organic_certified,
        createdAt: data.created_at,
        lastUsed: data.last_used,
        timesUsed: data.times_used,
        aiGenerated: data.ai_generated,
        aiProvider: data.ai_provider,
        aiModel: data.ai_model,
        aiPrompt: data.ai_prompt,
        applicationHistory: data.application_history || []
      };

      setProductCards(prev => prev.map(c => c.id === id ? updatedCard : c));
      return updatedCard;
    } catch (error: any) {
      console.error('Error updating product card:', error);
      throw error;
    }
  };

  // Elimina scheda prodotto
  const deleteProductCard = async (id: string): Promise<void> => {
    if (!user) throw new Error('Utente non autenticato');

    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Database non disponibile');

    try {
      const { error } = await supabase
        .from('product_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProductCards(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      console.error('Error deleting product card:', error);
      throw error;
    }
  };

  // Marca scheda come usata (incrementa contatore e aggiorna last_used)
  const markAsUsed = async (id: string): Promise<void> => {
    const card = productCards.find(c => c.id === id);
    if (!card) return;

    await updateProductCard(id, {
      lastUsed: new Date().toISOString(),
      timesUsed: (card.timesUsed || 0) + 1
    });
  };

  return {
    productCards,
    loading,
    error,
    addProductCard,
    updateProductCard,
    deleteProductCard,
    markAsUsed,
    // Utility functions
    fertilizers: productCards.filter(c => c.type === 'fertilizer'),
    treatments: productCards.filter(c => c.type === 'treatment'),
    recentlyUsed: productCards.filter(c => c.lastUsed).slice(0, 5)
  };
};