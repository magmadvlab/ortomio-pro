'use client'

import PrescriptionMapsDashboard from '@/components/prescription/PrescriptionMapsDashboard'
import { useGarden } from '@/packages/core/hooks/useGarden'

export default function PrescriptionMapsPage() {
  const { activeGarden } = useGarden()

  if (!activeGarden) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Seleziona un orto per visualizzare le mappe di prescrizione</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🗺️ Prescription Maps</h1>
        <p className="text-gray-600 mt-1">Mappe di prescrizione per agricoltura di precisione</p>
      </div>
      <PrescriptionMapsDashboard gardenId={activeGarden.id} />
    </div>
  )
}
