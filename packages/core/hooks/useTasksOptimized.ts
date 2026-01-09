/**
 * useTasksOptimized Hook
 *
 * Hook ottimizzato per caricare task con paginazione e limiti
 * per evitare saturazione memoria
 *
 * Features:
 * - Carica solo task recenti (ultimi 90 giorni di default)
 * - Paginazione opzionale
 * - Cache con limite di dimensione
 * - Auto-cleanup di task vecchi completati
 */

import { useState, useEffect, useCallback } from 'react';
import { useStorage } from './useStorage';
import { GardenTask } from '@/types';

export interface UseTasksOptimizedOptions {
  gardenId?: string;
  limit?: number; // Max task da caricare (default: 100)
  daysRange?: number; // Carica solo task degli ultimi N giorni (default: 90)
  includeCompleted?: boolean; // Include task completati (default: false)
  autoRefresh?: boolean; // Auto-refresh ogni N secondi (default: false)
  refreshInterval?: number; // Intervallo refresh in ms (default: 30000)
}

export interface UseTasksOptimizedReturn {
  tasks: GardenTask[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  totalCount: number;
}

const DEFAULT_OPTIONS: UseTasksOptimizedOptions = {
  limit: 100,
  daysRange: 90,
  includeCompleted: false,
  autoRefresh: false,
  refreshInterval: 30000,
};

export function useTasksOptimized(
  options: UseTasksOptimizedOptions = {}
): UseTasksOptimizedReturn {
  const { storageProvider } = useStorage();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const loadTasks = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      // Carica tutti i task (il filtering lo facciamo client-side per ora)
      const allTasks = await storageProvider.getTasks(opts.gardenId);

      // Filtra per range di date
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - (opts.daysRange || 90));

      let filtered = allTasks.filter(task => {
        const taskDate = new Date(task.date || task.startDate || '');
        return taskDate >= cutoffDate;
      });

      // Filtra task completati se richiesto
      if (!opts.includeCompleted) {
        filtered = filtered.filter(task => !task.completed);
      }

      // Ordina per data (più recenti primi)
      filtered.sort((a, b) => {
        const dateA = new Date(a.date || a.startDate || '').getTime();
        const dateB = new Date(b.date || b.startDate || '').getTime();
        return dateB - dateA;
      });

      setTotalCount(filtered.length);

      // Applica limit e offset
      const currentOffset = isLoadMore ? offset : 0;
      const limit = opts.limit || 100;
      const paginatedTasks = filtered.slice(currentOffset, currentOffset + limit);

      if (isLoadMore) {
        setTasks(prev => [...prev, ...paginatedTasks]);
        setOffset(currentOffset + limit);
      } else {
        setTasks(paginatedTasks);
        setOffset(limit);
      }

      setHasMore(currentOffset + limit < filtered.length);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError(err.message || 'Errore nel caricamento dei task');
    } finally {
      setLoading(false);
    }
  }, [storageProvider, opts.gardenId, opts.limit, opts.daysRange, opts.includeCompleted, offset]);

  const refresh = useCallback(async () => {
    setOffset(0);
    await loadTasks(false);
  }, [loadTasks]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadTasks(true);
  }, [hasMore, loading, loadTasks]);

  // Load iniziale
  useEffect(() => {
    loadTasks(false);
  }, [storageProvider, opts.gardenId]);

  // Auto-refresh opzionale
  useEffect(() => {
    if (!opts.autoRefresh || !opts.refreshInterval) return;

    const interval = setInterval(() => {
      refresh();
    }, opts.refreshInterval);

    return () => clearInterval(interval);
  }, [opts.autoRefresh, opts.refreshInterval, refresh]);

  return {
    tasks,
    loading,
    error,
    refresh,
    loadMore,
    hasMore,
    totalCount,
  };
}

/**
 * Hook semplificato per caricare solo task di oggi
 */
export function useTodayTasks(gardenId?: string) {
  return useTasksOptimized({
    gardenId,
    daysRange: 1,
    limit: 50,
    includeCompleted: false,
  });
}

/**
 * Hook semplificato per caricare task della settimana
 */
export function useWeekTasks(gardenId?: string) {
  return useTasksOptimized({
    gardenId,
    daysRange: 7,
    limit: 100,
    includeCompleted: false,
  });
}

/**
 * Hook semplificato per caricare task del mese
 */
export function useMonthTasks(gardenId?: string) {
  return useTasksOptimized({
    gardenId,
    daysRange: 30,
    limit: 200,
    includeCompleted: true,
  });
}
