'use client'

import React, { useState, useEffect } from 'react'
import SmartHub from '@/components/SmartHub'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { SmartDevice, Garden } from '@/types'

export default function SmartPage() {
  const { storageProvider } = useStorage()
  const [devices, setDevices] = useState<SmartDevice[]>([])
  const [garden, setGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const gardens = await storageProvider.getGardens()
        if (gardens.length > 0) {
          setGarden(gardens[0])
          // Carica dispositivi IoT per il giardino
          const gardenDevices = await storageProvider.getDevices(gardens[0].id)
          setDevices(gardenDevices)
        }
      } catch (error) {
        console.error('Error loading smart devices:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  const handleToggleValve = async (id: string, isOpen: boolean) => {
    try {
      await storageProvider.updateDevice(id, { isValveOpen: isOpen, lastUpdate: new Date().toISOString() })
      // Aggiorna stato locale
      setDevices(prev => prev.map(d => 
        d.id === id ? { ...d, isValveOpen: isOpen, lastUpdate: new Date().toISOString() } : d
      ))
    } catch (error) {
      console.error('Error toggling valve:', error)
    }
  }

  const handleUpdateDeviceSettings = async (id: string, settings: Partial<SmartDevice>) => {
    try {
      await storageProvider.updateDevice(id, { ...settings, lastUpdate: new Date().toISOString() })
      // Aggiorna stato locale
      setDevices(prev => prev.map(d => 
        d.id === id ? { ...d, ...settings, lastUpdate: new Date().toISOString() } : d
      ))
    } catch (error) {
      console.error('Error updating device settings:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (!garden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nessun giardino trovato</p>
          <p className="text-sm text-gray-500">Crea un giardino per iniziare a usare Smart Hub</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SmartHub
        devices={devices}
        garden={garden}
        onToggleValve={handleToggleValve}
        onUpdateDeviceSettings={handleUpdateDeviceSettings}
      />
    </div>
  )
}
