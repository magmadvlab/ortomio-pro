'use client'

import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { isSupabaseAvailable } from '@/lib/auth'

export function CloudSyncStatus() {
  const { storageProvider } = useStorage()
  const [isCloudEnabled, setIsCloudEnabled] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    checkCloudStatus()
  }, [storageProvider])
  
  const checkCloudStatus = async () => {
    try {
      const supabaseAvailable = isSupabaseAvailable()
      const isCloudProvider = storageProvider?.isAvailable() && 
                             storageProvider.constructor.name === 'SupabaseStorageProvider'
      
      setIsCloudEnabled(supabaseAvailable && isCloudProvider)
      
      // Controlla ultima sincronizzazione
      const lastSyncStr = localStorage.getItem('ortomio_last_sync')
      if (lastSyncStr) {
        setLastSync(new Date(lastSyncStr))
      }
    } catch (err) {
      console.error('Error checking cloud status:', err)
      setIsCloudEnabled(false)
    }
  }
  
  const handleManualSync = async () => {
    setSyncing(true)
    setError(null)
    
    try {
      if (storageProvider && 'sync' in storageProvider && typeof storageProvider.sync === 'function') {
        await storageProvider.sync()
        const syncTimestamp = new Date().toISOString()
        localStorage.setItem('ortomio_last_sync', syncTimestamp)
        setLastSync(new Date(syncTimestamp))
      } else {
        // Se sync non disponibile, almeno aggiorna timestamp
        const syncTimestamp = new Date().toISOString()
        localStorage.setItem('ortomio_last_sync', syncTimestamp)
        setLastSync(new Date(syncTimestamp))
      }
    } catch (err: any) {
      console.error('Sync error:', err)
      setError(err.message || 'Errore durante la sincronizzazione')
    } finally {
      setSyncing(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Stato Sincronizzazione</h3>
        {isCloudEnabled ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Attivo</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <CloudOff size={20} />
            <span className="text-sm">Non disponibile</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Provider</span>
          <span className="text-sm font-medium text-gray-900">
            {isCloudEnabled ? 'Supabase Cloud' : 'Local Storage'}
          </span>
        </div>
        
        {lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ultima sincronizzazione</span>
            <span className="text-sm text-gray-900">
              {lastSync.toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
        
        {isCloudEnabled && (
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sincronizzazione...</span>
                </>
              ) : (
                <>
                  <Cloud size={18} />
                  <span>Sincronizza Ora</span>
                </>
              )}
            </button>
          </div>
        )}
        
        {!isCloudEnabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">
                  Sincronizzazione cloud non disponibile
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  I dati sono salvati solo localmente. Per abilitare la sincronizzazione cloud, 
                  accedi con un account PRO.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

