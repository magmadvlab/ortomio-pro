'use client';

import React, { useState, useEffect } from 'react';
import { ZoneFieldRowManager } from '../../../components/settings/ZoneFieldRowManager';
import { getSupabaseClient } from '../../../config/supabase';

export default function ZonesPage() {
  // Remove user dependency since we're using getSupabaseClient directly
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento gestione zone...</p>
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
              🗺️ Gestione Zone
            </h1>
            <p className="mt-2 text-gray-600">
              Organizza il tuo giardino in zone, filari e sezioni per una gestione ottimale
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ZoneFieldRowManager />
      </div>
    </div>
  );
}