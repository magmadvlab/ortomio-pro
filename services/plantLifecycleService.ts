// =====================================================
// PLANT LIFECYCLE SERVICE
// Servizio per tracciamento automatico ciclo vita piante
// =====================================================

import { getSupabaseClient } from '../config/supabase';
import {
  PlantLifecycleEvent,
  CropVariety,
  PendingNotification,
  LifecycleUpdateData,
  PlantLifecycleStatus
} from '../types/plantLifecycle';

const supabase = getSupabaseClient();

/**
 * Crea un nuovo evento lifecycle quando viene creato un filare con coltura
 */
export async function createLifecycleEvent(
  gardenId: string,
  cropName: string,
  seedingDate: string,
  plantCount: number,
  options?: {
    cropVariety?: string;
    zoneId?: string;
    fieldRowId?: string;
    fieldRowSectionId?: string;
    notes?: string;
  }
): Promise<PlantLifecycleEvent> {
  try {
    // Cerca dati varietà nel database
    const { data: varietyData } = await supabase
      .from('crop_varieties_database')
      .select('*')
      .eq('crop_name', cropName)
      .maybeSingle();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const eventData = {
      user_id: user.id,
      garden_id: gardenId,
      crop_name: cropName,
      crop_variety: options?.cropVariety,
      plant_count: plantCount,
      seeding_date: seedingDate,
      zone_id: options?.zoneId,
      field_row_id: options?.fieldRowId,
      field_row_section_id: options?.fieldRowSectionId,
      notes: options?.notes,
      // Dati da varietà database
      expected_germination_days: varietyData?.germination_days_avg,
      expected_transplant_days: varietyData?.transplant_days_avg,
      expected_maturity_days: varietyData?.maturity_days_avg,
      expected_harvest_duration_days: varietyData?.harvest_duration_days,
      // Notifiche inizialmente false
      notification_sent_germination: false,
      notification_sent_transplant: false,
      notification_sent_harvest: false,
      notification_sent_end_cycle: false
    };

    const { data, error } = await supabase
      .from('plant_lifecycle_events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating lifecycle event:', error);
    throw error;
  }
}

/**
 * Aggiorna un evento lifecycle (es. registra germinazione, trapianto, raccolta)
 */
export async function updateLifecycleEvent(
  eventId: string,
  updates: LifecycleUpdateData
): Promise<PlantLifecycleEvent> {
  try {
    const { data, error } = await supabase
      .from('plant_lifecycle_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating lifecycle event:', error);
    throw error;
  }
}

/**
 * Ottieni tutti gli eventi lifecycle attivi per un giardino
 */
export async function getActiveLifecycleEvents(
  gardenId: string
): Promise<PlantLifecycleEvent[]> {
  try {
    const { data, error } = await supabase
      .from('plant_lifecycle_events')
      .select('*')
      .eq('garden_id', gardenId)
      .is('end_of_cycle_date', null)
      .order('seeding_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active lifecycle events:', error);
    return [];
  }
}

/**
 * Ottieni notifiche pending per un giardino
 */
export async function getPendingNotifications(
  gardenId: string
): Promise<PendingNotification[]> {
  try {
    const { data, error } = await supabase
      .from('plant_lifecycle_pending_notifications')
      .select('*')
      .eq('garden_id', gardenId)
      .not('notification_type', 'is', null)
      .order('days_since_seeding', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    return [];
  }
}

/**
 * Marca una notifica come inviata
 */
export async function markNotificationSent(
  eventId: string,
  notificationType: 'germination' | 'transplant' | 'harvest' | 'end_cycle'
): Promise<void> {
  try {
    const fieldName = `notification_sent_${notificationType}`;
    
    const { error } = await supabase
      .from('plant_lifecycle_events')
      .update({ [fieldName]: true })
      .eq('id', eventId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    throw error;
  }
}

/**
 * Termina il ciclo di vita di una pianta
 */
export async function endLifecycle(
  eventId: string,
  actualYieldKg?: number,
  notes?: string
): Promise<PlantLifecycleEvent> {
  try {
    const updates: LifecycleUpdateData = {
      end_of_cycle_date: new Date().toISOString().split('T')[0],
      actual_yield_kg: actualYieldKg,
      notes: notes
    };

    return await updateLifecycleEvent(eventId, updates);
  } catch (error) {
    console.error('Error ending lifecycle:', error);
    throw error;
  }
}

/**
 * Ottieni tutte le varietà disponibili nel database
 */
export async function getCropVarieties(): Promise<CropVariety[]> {
  try {
    const { data, error } = await supabase
      .from('crop_varieties_database')
      .select('*')
      .order('crop_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching crop varieties:', error);
    return [];
  }
}

/**
 * Cerca varietà per nome coltura
 */
export async function getCropVarietiesByName(
  cropName: string
): Promise<CropVariety[]> {
  try {
    const { data, error } = await supabase
      .from('crop_varieties_database')
      .select('*')
      .eq('crop_name', cropName)
      .order('variety_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching crop varieties by name:', error);
    return [];
  }
}

/**
 * Ottieni statistiche lifecycle per un giardino
 */
export async function getLifecycleStats(gardenId: string): Promise<{
  activeCount: number;
  completedCount: number;
  pendingNotifications: number;
  averageYield: number;
}> {
  try {
    // Eventi attivi
    const { data: activeData } = await supabase
      .from('plant_lifecycle_events')
      .select('id')
      .eq('garden_id', gardenId)
      .is('end_of_cycle_date', null);

    // Eventi completati
    const { data: completedData } = await supabase
      .from('plant_lifecycle_events')
      .select('actual_yield_kg')
      .eq('garden_id', gardenId)
      .not('end_of_cycle_date', 'is', null);

    // Notifiche pending
    const { data: notificationsData } = await supabase
      .from('plant_lifecycle_pending_notifications')
      .select('id')
      .eq('garden_id', gardenId)
      .not('notification_type', 'is', null);

    // Calcola resa media
    const yields = (completedData || [])
      .map(e => e.actual_yield_kg)
      .filter((y): y is number => y !== null && y !== undefined);
    
    const averageYield = yields.length > 0
      ? yields.reduce((sum, y) => sum + y, 0) / yields.length
      : 0;

    return {
      activeCount: activeData?.length || 0,
      completedCount: completedData?.length || 0,
      pendingNotifications: notificationsData?.length || 0,
      averageYield: Math.round(averageYield * 100) / 100
    };
  } catch (error) {
    console.error('Error fetching lifecycle stats:', error);
    return {
      activeCount: 0,
      completedCount: 0,
      pendingNotifications: 0,
      averageYield: 0
    };
  }
}

/**
 * Helper: Ottieni label italiano per stato lifecycle
 */
export function getStatusLabel(status: PlantLifecycleStatus): string {
  const labels: Record<PlantLifecycleStatus, string> = {
    seed: '🌱 Seme',
    germinating: '🌱 In germinazione',
    seedling: '🌿 Piantina',
    transplanted: '🌿 Trapiantata',
    growing: '🌱 In crescita',
    flowering: '🌸 In fioritura',
    fruiting: '🍅 In fruttificazione',
    harvesting: '🧺 In raccolta',
    finished: '✅ Completato'
  };
  return labels[status] || status;
}

/**
 * Helper: Ottieni colore per stato lifecycle
 */
export function getStatusColor(status: PlantLifecycleStatus): string {
  const colors: Record<PlantLifecycleStatus, string> = {
    seed: 'bg-gray-100 text-gray-700',
    germinating: 'bg-yellow-100 text-yellow-700',
    seedling: 'bg-green-100 text-green-700',
    transplanted: 'bg-blue-100 text-blue-700',
    growing: 'bg-emerald-100 text-emerald-700',
    flowering: 'bg-pink-100 text-pink-700',
    fruiting: 'bg-orange-100 text-orange-700',
    harvesting: 'bg-purple-100 text-purple-700',
    finished: 'bg-gray-100 text-gray-500'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}
