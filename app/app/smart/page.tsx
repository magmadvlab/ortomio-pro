'use client'

import { useState, useEffect } from 'react'
import IntegratedSmartHub from '@/components/smart/IntegratedSmartHub'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useStorage } from '@/packages/core/hooks/useStorage'

export default function SmartHubPage() {
  const { activeGarden } = useGarden()
  const storage = useStorage()
  const [devices, setDevices] = useState<any[]>([])

  useEffect(() => {
    if (activeGarden) {
      // Load devices from storage
      loadDevices()
    }
  }, [activeGarden])

  const loadDevices = async () => {
    // TODO: Implement device loading from storage
    setDevices([])
  }

  const handleToggleValve = async (id: string, isOpen: boolean) => {
    // TODO: Implement valve toggle
    console.log('Toggle valve:', id, isOpen)
  }

  const handleUpdateDeviceSettings = async (id: string, settings: any) => {
    // TODO: Implement device settings update
    console.log('Update device settings:', id, settings)
  }

  if (!activeGarden) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Seleziona un orto per visualizzare lo Smart Hub</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📡 Smart Hub</h1>
        <p className="text-gray-600 mt-1">Centro di controllo per dispositivi IoT e droni</p>
      </div>
      <IntegratedSmartHub 
        devices={devices}
        garden={activeGarden}
        onToggleValve={handleToggleValve}
        onUpdateDeviceSettings={handleUpdateDeviceSettings}
      />
    </div>
  )
}
