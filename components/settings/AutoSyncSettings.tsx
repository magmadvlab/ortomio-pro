'use client'

import React, { useState, useEffect, useRef } from 'react'
import { RefreshCw, Clock, ToggleLeft, ToggleRight } from 'lucide-react'

type SyncInterval = '5min' | '15min' | '30min' | '1hour' | 'disabled'

interface AutoSyncPreferences {
  enabled: boolean
  interval: SyncInterval
}

export function AutoSyncSettings() {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [syncInterval, setSyncInterval] = useState<SyncInterval>('30min')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Carica preferenze salvate
    const saved = localStorage.getItem('ortomio_auto_sync')
    if (saved) {
      try {
        const prefs: AutoSyncPreferences = JSON.parse(saved)
        setAutoSyncEnabled(prefs.enabled || false)
        setSyncInterval(prefs.interval || '30min')
      } catch (err) {
        console.error('Error loading auto sync preferences:', err)
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  
  useEffect(() => {
    // Setup/clear interval quando cambiano le preferenze
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (autoSyncEnabled && syncInterval !== 'disabled') {
      setupAutoSync(syncInterval)
    }
  }, [autoSyncEnabled, syncInterval])
  
  const handleToggleAutoSync = () => {
    const newValue = !autoSyncEnabled
    setAutoSyncEnabled(newValue)
    
    const prefs: AutoSyncPreferences = {
      enabled: newValue,
      interval: syncInterval,
    }
    
    localStorage.setItem('ortomio_auto_sync', JSON.stringify(prefs))
  }
  
  const handleIntervalChange = (interval: SyncInterval) => {
    setSyncInterval(interval)
    
    const prefs: AutoSyncPreferences = {
      enabled: autoSyncEnabled,
      interval,
    }
    
    localStorage.setItem('ortomio_auto_sync', JSON.stringify(prefs))
  }
  
  const setupAutoSync = (interval: SyncInterval) => {
    const intervals: Record<SyncInterval, number> = {
      '5min': 5 * 60 * 1000,
      '15min': 15 * 60 * 1000,
      '30min': 30 * 60 * 1000,
      '1hour': 60 * 60 * 1000,
      'disabled': 0,
    }
    
    const ms = intervals[interval]
    if (ms > 0) {
      // Emetti evento custom per trigger sync
      intervalRef.current = setInterval(() => {
        window.dispatchEvent(new CustomEvent('ortomio-auto-sync'))
      }, ms)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <RefreshCw size={20} />
            Sincronizzazione Automatica
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Sincronizza automaticamente i tuoi dati sul cloud
          </p>
        </div>
        <button
          onClick={handleToggleAutoSync}
          className={`flex items-center gap-2 transition-colors ${
            autoSyncEnabled ? 'text-green-600' : 'text-gray-400'
          }`}
          aria-label={autoSyncEnabled ? 'Disabilita sincronizzazione automatica' : 'Abilita sincronizzazione automatica'}
        >
          {autoSyncEnabled ? (
            <ToggleRight size={32} className="cursor-pointer" />
          ) : (
            <ToggleLeft size={32} className="cursor-pointer" />
          )}
        </button>
      </div>
      
      {autoSyncEnabled && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700">
            Intervallo di sincronizzazione
          </label>
          <select
            value={syncInterval}
            onChange={(e) => handleIntervalChange(e.target.value as SyncInterval)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="5min">Ogni 5 minuti</option>
            <option value="15min">Ogni 15 minuti</option>
            <option value="30min">Ogni 30 minuti</option>
            <option value="1hour">Ogni ora</option>
            <option value="disabled">Disabilitato</option>
          </select>
          
          <div className="flex items-start gap-2 text-xs text-gray-500 mt-2">
            <Clock size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              La sincronizzazione automatica avviene in background e non interferisce 
              con l'uso dell'app.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}






