// components/farm/FarmCommandCenter.tsx
'use client'
import { useEffect, useState, useCallback } from 'react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { getFieldAlerts, clearFieldAlertsCache } from '@/services/fieldAlertService';
import { WeatherStrip } from './WeatherStrip';
import { FieldMapPanel } from './FieldMapPanel';
import { AlertPriorityList } from './AlertPriorityList';
import type { FieldAlert } from '@/types/fieldAlerts';
import type { Garden } from '@/types';

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

export function FarmCommandCenter() {
  const { storageProvider } = useStorage();
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [allAlerts, setAllAlerts] = useState<FieldAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | undefined>();
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);

  const loadAlerts = useCallback(async (gardenList: Garden[], forceRefresh = false, isCancelled?: () => boolean) => {
    if (forceRefresh) clearFieldAlertsCache();
    setLoading(true);
    try {
      const alertArrays = await Promise.all(
        gardenList.map(g => getFieldAlerts(g.id, SUPABASE_FUNCTIONS_URL))
      );
      const flat = alertArrays.flat();
      if (isCancelled?.()) return;
      setAllAlerts(flat);
      if (flat.length > 0) {
        const expires = flat.reduce((min, a) =>
          a.expiresAt < min ? a.expiresAt : min, flat[0].expiresAt
        );
        setNextRefresh(new Date(expires));
      } else {
        setNextRefresh(null);
      }
    } finally {
      if (!isCancelled?.()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!storageProvider) return;
    let cancelled = false;
    storageProvider.getGardens().then(gs => {
      if (cancelled) return;
      setGardens(gs);
      loadAlerts(gs, false, () => cancelled);
    });
    return () => { cancelled = true; };
  }, [storageProvider, loadAlerts]);

  const handleFieldSelect = (gardenId: string) => {
    setHighlightedId(gardenId);
    document.getElementById(`alert-${gardenId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const primaryGarden = gardens[0];
  const coords = primaryGarden?.coordinates;
  const getGardenName = (id: string) => gardens.find(g => g.id === id)?.name ?? id;

  if (loading && gardens.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-green-400">
        <span className="animate-pulse">Caricamento appezzamenti...</span>
      </div>
    );
  }

  if (!loading && gardens.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-green-400">
        <p className="text-sm">Nessun appezzamento configurato.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-green-950 text-green-100 rounded-xl overflow-hidden border border-green-800">

      {/* WeatherStrip */}
      {coords && (
        <WeatherStrip lat={coords.latitude} lon={coords.longitude} alerts={allAlerts} />
      )}

      {/* Main: map + list */}
      <div className="flex flex-1 min-h-0">
        <div className="w-2/5 border-r border-green-800">
          <FieldMapPanel gardens={gardens} alerts={allAlerts} onFieldSelect={handleFieldSelect} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <AlertPriorityList
            alerts={allAlerts}
            highlightedGardenId={highlightedId}
            getGardenName={getGardenName}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-green-900/50 text-[11px] text-gray-400 border-t border-green-800">
        <span>
          {loading ? 'Aggiornamento...' : nextRefresh
            ? `Prossimo ricalcolo: ${nextRefresh.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
            : 'Dati aggiornati'}
        </span>
        <button
          onClick={() => loadAlerts(gardens, true)}
          className="text-green-400 hover:text-green-200 transition-colors"
          disabled={loading}
        >
          ↻ Aggiorna ora
        </button>
      </div>
    </div>
  );
}
