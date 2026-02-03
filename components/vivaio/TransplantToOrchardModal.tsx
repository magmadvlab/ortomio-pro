/**
 * Transplant to Orchard Modal
 * Modal per trapiantare dal vivaio all'orto con monitoraggio individuale
 */

import React, { useState, useEffect } from 'react'
import { SeedlingBatch } from '@/services/seedlingService'
import { Garden } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { transplantOrchestrationService, TransplantResult } from '@/services/transplantOrchestrationService'
import { 
  Sprout, 
  ArrowRight, 
  MapPin, 
  Calculator, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react'

interface TransplantToOrchardModalProps {
  isOpen: boolean
  onClose: () => void
  batch: SeedlingBatch
  garden: Garden
  onTransplantComplete: (result: TransplantResult) => void
}

export const TransplantToOrchardModal: React.FC<TransplantToOrchardModalProps> = ({
  isOpen,
  onClose,
  batch,
  garden,
  onTransplantComplete
}) => {
  const { storageProvider } = useStorage()
  
  // State
  const [fieldRows, setFieldRows] = useState<any[]>([])
  const [selectedFieldRow, setSelectedFieldRow] = useState<string>('')
  const [quantityToTransplant, setQuantityToTransplant] = useState(batch.survivingQuantity)
  const [plantSpacing, setPlantSpacing] = useState(50) // cm
  const [startingPosition, setStartingPosition] = useState(1)
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  
  // Calculated values
  const [calculatedPositions, setCalculatedPositions] = useState<number>(0)
  const [estimatedRowLength, setEstimatedRowLength] = useState<number>(0)
  
  useEffect(() => {
    if (isOpen) {
      loadFieldRows()
    }
  }, [isOpen, garden.id])
  
  useEffect(() => {
    calculatePlantPositions()
  }, [quantityToTransplant, plantSpacing, startingPosition])
  
  const loadFieldRows = async () => {
    try {
      console.log('🌾 TransplantModal: Caricamento filari per orto:', garden.name, garden.id)
      const rows = await storageProvider.getFieldRows?.(garden.id) || []
      console.log('🌾 TransplantModal: Filari caricati:', rows.length, rows.map(r => ({ id: r.id, name: r.name, cultivar: r.cultivar })))
      setFieldRows(rows)
      
      // Auto-select compatible row if available
      const compatibleRow = rows.find((row: any) => 
        row.cultivar?.toLowerCase().includes(batch.plantName.toLowerCase()) ||
        !row.cultivar // Empty row
      )
      if (compatibleRow) {
        console.log('🎯 TransplantModal: Filare compatibile trovato:', compatibleRow.name, compatibleRow.cultivar)
        setSelectedFieldRow(compatibleRow.id)
        if (compatibleRow.plant_spacing) {
          setPlantSpacing(compatibleRow.plant_spacing)
        }
      } else {
        console.log('⚠️ TransplantModal: Nessun filare compatibile trovato per:', batch.plantName)
      }
    } catch (error) {
      console.error('❌ TransplantModal: Errore caricamento filari:', error)
    }
  }
  
  const calculatePlantPositions = () => {
    setCalculating(true)
    
    // Calcola posizioni e lunghezza necessaria
    const positions = quantityToTransplant
    const lengthNeeded = (positions * plantSpacing) / 100 // metri
    
    setCalculatedPositions(positions)
    setEstimatedRowLength(lengthNeeded)
    
    setTimeout(() => setCalculating(false), 300)
  }
  
  const handleTransplant = async () => {
    if (!selectedFieldRow) {
      alert('Seleziona un filare di destinazione')
      return
    }
    
    console.log('🚀 TransplantModal: Inizio trapianto:', {
      batch: batch.plantName,
      quantity: quantityToTransplant,
      fieldRow: selectedFieldRow,
      spacing: plantSpacing
    })
    
    setLoading(true)
    
    try {
      // 1. Trova il filare selezionato
      const fieldRow = fieldRows.find(row => row.id === selectedFieldRow)
      if (!fieldRow) {
        throw new Error('Filare non trovato')
      }
      
      console.log('✅ TransplantModal: Filare trovato:', fieldRow.name, fieldRow)
      
      // 2. Pianifica trapianto
      console.log('📋 TransplantModal: Pianificazione trapianto...')
      const operation = await transplantOrchestrationService.planTransplant(
        batch,
        selectedFieldRow,
        garden.id,
        quantityToTransplant,
        plantSpacing,
        startingPosition
      )
      
      console.log('✅ TransplantModal: Operazione pianificata:', operation)
      
      // 3. Esegui trapianto
      console.log('🌱 TransplantModal: Esecuzione trapianto...')
      const result = await transplantOrchestrationService.executeTransplant(
        operation,
        batch,
        fieldRow
      )
      
      console.log('✅ TransplantModal: Trapianto eseguito:', result)
      
      if (result.success) {
        // 4. Salva piante nel database
        console.log('💾 TransplantModal: Salvataggio piante nel database...')
        for (const plant of result.plantsCreated) {
          await storageProvider.createIndividualPlant?.(plant)
          console.log('✅ TransplantModal: Pianta salvata:', plant.plantCode)
        }
        
        // 5. Aggiorna batch vivaio
        console.log('🔄 TransplantModal: Aggiornamento batch vivaio...')
        await transplantOrchestrationService.updateVivaioAfterTransplant(
          batch.id,
          quantityToTransplant
        )
        
        // 6. Aggiorna filare con nuova configurazione
        console.log('🔄 TransplantModal: Aggiornamento filare...')
        const updatedFieldRow = {
          ...fieldRow,
          cultivar: batch.plantName + (batch.variety ? ` ${batch.variety}` : ''),
          plant_spacing: plantSpacing,
          plant_count: (fieldRow.plant_count || 0) + quantityToTransplant,
          planted_date: operation.transplantDate,
          last_transplant: {
            date: operation.transplantDate,
            batchId: batch.id,
            quantity: quantityToTransplant,
            operationId: operation.id
          }
        }
        
        await storageProvider.updateFieldRow?.(selectedFieldRow, updatedFieldRow)
        console.log('✅ TransplantModal: Filare aggiornato:', updatedFieldRow)
        
        // 7. Callback con risultato
        onTransplantComplete(result)
        
        // 8. Messaggio di successo migliorato
        const successMessage = `✅ Trapianto completato con successo!\n\n` +
              `🌱 ${result.plantsCreated.length} piante create nell'orto\n` +
              `🤖 Orchestrator attivato per monitoraggio automatico\n` +
              `📍 Posizioni: ${startingPosition} → ${startingPosition + quantityToTransplant - 1}\n` +
              `🔍 Vai a "Ispeziona Piante" per monitoraggio individuale\n\n` +
              `💡 Le piante sono ora visibili nella pagina Piante con codici univoci!`
        
        alert(successMessage)
        console.log('🎉 TransplantModal: Trapianto completato con successo!')
        
        onClose()
      } else {
        throw new Error(result.errors?.join(', ') || 'Errore durante il trapianto')
      }
      
    } catch (error) {
      console.error('❌ TransplantModal: Errore trapianto:', error)
      alert(`❌ Errore durante il trapianto:\n${error instanceof Error ? error.message : 'Errore sconosciuto'}\n\nControlla la console per dettagli tecnici.`)
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  const selectedRow = fieldRows.find(row => row.id === selectedFieldRow)
  const canFitInRow = selectedRow ? 
    (estimatedRowLength <= selectedRow.length_meters) : true
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Sprout className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Trapianto Intelligente</h2>
                <p className="text-gray-600">Dal vivaio all'orto con monitoraggio individuale</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Batch Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">📦</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Batch Vivaio</h3>
                <p className="text-sm text-blue-700">
                  {batch.plantName} {batch.variety && `(${batch.variety})`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Piantine Vive</p>
                <p className="font-bold text-blue-900">{batch.survivingQuantity}</p>
              </div>
              <div>
                <p className="text-blue-600">Sopravvivenza</p>
                <p className="font-bold text-blue-900">{Math.round((batch.survivingQuantity / batch.quantity) * 100)}%</p>
              </div>
              <div>
                <p className="text-blue-600">Fase</p>
                <p className="font-bold text-blue-900">{batch.phase}</p>
              </div>
            </div>
          </div>
          
          {/* Field Row Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filare di Destinazione
            </label>
            <select
              value={selectedFieldRow}
              onChange={(e) => setSelectedFieldRow(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleziona filare...</option>
              {fieldRows.map(row => (
                <option key={row.id} value={row.id}>
                  {row.name} - {row.length_meters}m 
                  {row.cultivar && ` (${row.cultivar})`}
                  {!row.cultivar && ' (Libero)'}
                </option>
              ))}
            </select>
            
            {selectedRow && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>Lunghezza: {selectedRow.length_meters}m</span>
                  {selectedRow.cultivar && (
                    <>
                      <span>•</span>
                      <span>Coltura attuale: {selectedRow.cultivar}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Transplant Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantità da Trapiantare
              </label>
              <input
                type="number"
                min="1"
                max={batch.survivingQuantity}
                value={quantityToTransplant}
                onChange={(e) => setQuantityToTransplant(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spaziatura (cm)
              </label>
              <input
                type="number"
                min="10"
                max="200"
                step="5"
                value={plantSpacing}
                onChange={(e) => setPlantSpacing(parseInt(e.target.value) || 50)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posizione Iniziale
              </label>
              <input
                type="number"
                min="1"
                value={startingPosition}
                onChange={(e) => setStartingPosition(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          {/* Calculations */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Calculator className="text-green-600" size={20} />
              <h3 className="font-semibold text-green-900">Calcoli Automatici</h3>
              {calculating && <Loader2 className="animate-spin text-green-600" size={16} />}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-green-600">Posizioni</p>
                <p className="font-bold text-green-900">
                  {startingPosition} → {startingPosition + quantityToTransplant - 1}
                </p>
              </div>
              <div>
                <p className="text-green-600">Lunghezza Necessaria</p>
                <p className="font-bold text-green-900">{estimatedRowLength.toFixed(1)}m</p>
              </div>
              <div>
                <p className="text-green-600">Codici Pianta</p>
                <p className="font-bold text-green-900">
                  F{selectedRow?.rowNumber?.toString().padStart(2, '0') || '01'}-P{startingPosition.toString().padStart(3, '0')} → 
                  F{selectedRow?.rowNumber?.toString().padStart(2, '0') || '01'}-P{(startingPosition + quantityToTransplant - 1).toString().padStart(3, '0')}
                </p>
              </div>
              <div>
                <p className="text-green-600">Orchestrator</p>
                <p className="font-bold text-green-900 flex items-center gap-1">
                  <CheckCircle size={16} />
                  Attivato
                </p>
              </div>
            </div>
            
            {/* Validation */}
            {selectedRow && (
              <div className="mt-3 pt-3 border-t border-green-200">
                {canFitInRow ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={16} />
                    <span className="text-sm">✅ Le piante si adattano perfettamente al filare</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle size={16} />
                    <span className="text-sm">⚠️ Spazio insufficiente nel filare (serve {estimatedRowLength.toFixed(1)}m, disponibili {selectedRow.length_meters}m)</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Orchestrator Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">🤖</span>
              </div>
              <h3 className="font-semibold text-purple-900">Orchestrator Automatico</h3>
            </div>
            <p className="text-sm text-purple-800 mb-3">
              Ogni pianta trapiantata sarà automaticamente monitorata attraverso tutte le fasi di crescita:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
              <div>• Post-trapianto (7 giorni)</div>
              <div>• Crescita vegetativa (21 giorni)</div>
              <div>• Fioritura (14 giorni)</div>
              <div>• Fruttificazione (30 giorni)</div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            
            <button
              onClick={handleTransplant}
              disabled={!selectedFieldRow || !canFitInRow || loading || quantityToTransplant <= 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Trapiantando...
                </>
              ) : (
                <>
                  <ArrowRight size={16} />
                  Trapianta nell'Orto
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 text-center">
            <Link
              href="/app/plants?tab=plants"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
            >
              <Eye size={14} />
              Dopo il trapianto, vai al monitoraggio individuale
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransplantToOrchardModal