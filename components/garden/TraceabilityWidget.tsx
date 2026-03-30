/**
 * Traceability Widget - Integrato nel workflow operativo
 * Tracciabilità blockchain semplificata e user-friendly
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Link, 
  QrCode, 
  CheckCircle, 
  Eye,
  Award,
  Leaf,
  Package,
  Clock,
  Star
} from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import {
  buildAgronomicQualityLearningAdjustment,
  getAgronomicProfileLearningSnapshots,
  type AgronomicProfileLearningSnapshot,
} from '@/services/agronomicProfileLearningService'

interface TraceabilityRecord {
  id: string
  date: string
  type: 'semina' | 'crescita' | 'trattamento' | 'raccolto'
  description: string
  verified: boolean
  photos?: string[]
}

interface ProductTrace {
  id: string
  name: string
  variety: string
  status: 'crescita' | 'raccolto' | 'venduto'
  records: TraceabilityRecord[]
  qualityScore: number
  certifications: string[]
  qrCode?: string
  origin?: {
    type: 'seed' | 'nursery_seedling'
    cost: number
    date: string
    supplier?: string
    nursery?: string
  }
}

interface TraceabilityWidgetProps {
  garden: Garden
  tasks: GardenTask[]
  onRecordActivity: (activity: any) => void
}

export default function TraceabilityWidget({ garden, tasks, onRecordActivity }: TraceabilityWidgetProps) {
  const { storageProvider } = useStorage()
  const [products, setProducts] = useState<ProductTrace[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductTrace | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [autoTracking, setAutoTracking] = useState(true)
  const [qualitySnapshots, setQualitySnapshots] = useState<AgronomicProfileLearningSnapshot[]>([])

  useEffect(() => {
    loadProductTraces()
  }, [garden.id, tasks])

  useEffect(() => {
    const loadQualitySnapshots = async () => {
      if (!storageProvider?.getUserPreference) {
        setQualitySnapshots([])
        return
      }

      try {
        setQualitySnapshots(await getAgronomicProfileLearningSnapshots(storageProvider, garden.id))
      } catch (error) {
        console.error('Error loading traceability quality benchmarks:', error)
        setQualitySnapshots([])
      }
    }

    void loadQualitySnapshots()
  }, [garden.id, storageProvider])

  const loadProductTraces = async () => {
    // Genera tracce automaticamente dai task esistenti
    const mockProducts: ProductTrace[] = [
      {
        id: 'pomodoro_1',
        name: 'Pomodoro San Marzano',
        variety: 'San Marzano DOP',
        status: 'crescita',
        qualityScore: 92,
        certifications: ['Biologico', 'GlobalG.A.P.'],
        origin: {
          type: 'seed',
          cost: 0.45,
          date: '2026-01-05',
          supplier: 'Franchi Sementi Bio'
        },
        records: [
          {
            id: '1',
            date: '2026-01-05',
            type: 'semina',
            description: 'Semi biologici certificati piantati in aiuola A - Origine: Semina diretta',
            verified: true,
            photos: []
          },
          {
            id: '2',
            date: '2026-01-08',
            type: 'crescita',
            description: 'Prima irrigazione con sistema automatico',
            verified: true
          },
          {
            id: '3',
            date: '2026-01-10',
            type: 'trattamento',
            description: 'Fertilizzante organico applicato',
            verified: true
          }
        ]
      },
      {
        id: 'lattuga_1',
        name: 'Lattuga Romana',
        variety: 'Romana Verde',
        status: 'raccolto',
        qualityScore: 88,
        certifications: ['Biologico'],
        qrCode: 'QR_LATTUGA_2026001',
        origin: {
          type: 'nursery_seedling',
          cost: 2.20,
          date: '2025-12-15',
          nursery: 'Vivaio Verde Srl'
        },
        records: [
          {
            id: '4',
            date: '2025-12-15',
            type: 'semina',
            description: 'Piantine da vivaio trapiantate in serra - Origine: Vivaio Verde Srl',
            verified: true
          },
          {
            id: '5',
            date: '2026-01-09',
            type: 'raccolto',
            description: 'Raccolto 2.5 kg di lattuga fresca',
            verified: true
          }
        ]
      }
    ]
    
    setProducts(mockProducts)
  }

  const recordNewActivity = async (type: 'semina' | 'crescita' | 'trattamento' | 'raccolto', productId: string, description: string) => {
    const newRecord: TraceabilityRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type,
      description,
      verified: true
    }

    // Aggiorna il prodotto
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, records: [...product.records, newRecord] }
        : product
    ))

    // Notifica il parent component
    onRecordActivity({
      type: 'blockchain_record',
      productId,
      record: newRecord
    })
  }

  const generateQRCode = async (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const qrCode = `QR_${productId.toUpperCase()}_${Date.now()}`
    
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, qrCode } : p
    ))

    setShowQRModal(true)
    setSelectedProduct({ ...product, qrCode })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'crescita': return 'text-green-600 bg-green-100'
      case 'raccolto': return 'text-blue-600 bg-blue-100'
      case 'venduto': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'semina': return '🌱'
      case 'crescita': return '🌿'
      case 'trattamento': return '💧'
      case 'raccolto': return '🌾'
      default: return '📝'
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'semina': return 'Semina'
      case 'crescita': return 'Crescita'
      case 'trattamento': return 'Trattamento'
      case 'raccolto': return 'Raccolto'
      default: return type
    }
  }

  const getProductQualityBenchmark = (product: ProductTrace) => {
    const adjustment = buildAgronomicQualityLearningAdjustment(qualitySnapshots, { plantName: product.name })
    const targetScore = Math.round(adjustment.qualityTargetRating * 20)
    const alertFloorScore = Math.round(adjustment.qualityAlertFloorRating * 20)
    const gap = product.qualityScore - targetScore
    const status = product.qualityScore >= targetScore
      ? 'above_target'
      : product.qualityScore < alertFloorScore
        ? 'below_target'
        : 'watch'

    return {
      adjustment,
      targetScore,
      alertFloorScore,
      gap,
      status,
      badgeClassName: status === 'above_target'
        ? 'bg-green-100 text-green-700'
        : status === 'watch'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-700',
      badgeLabel: status === 'above_target'
        ? 'Sopra benchmark'
        : status === 'watch'
          ? 'In osservazione'
          : 'Sotto benchmark',
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con Auto-tracking */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">
                🔗 Tracciabilità Automatica
              </h3>
              <p className="text-sm text-green-800">
                Ogni operazione viene registrata automaticamente per la trasparenza totale
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-green-800">
              <input
                type="checkbox"
                checked={autoTracking}
                onChange={(e) => setAutoTracking(e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              Auto-tracking
            </label>
          </div>
        </div>
      </div>

      {/* Prodotti Tracciati */}
      <div className="grid gap-4">
        {products.map((product) => {
          const qualityBenchmark = getProductQualityBenchmark(product)

          return (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.variety}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status}
                </div>
                {product.qrCode && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                    <QrCode size={12} />
                    QR
                  </div>
                )}
              </div>
            </div>

            {/* Statistiche Rapide */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{product.qualityScore}%</div>
                <div className="text-xs text-gray-600">Qualità</div>
                <div className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${qualityBenchmark.badgeClassName}`}>
                  {qualityBenchmark.badgeLabel}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{product.records.length}</div>
                <div className="text-xs text-gray-600">Registrazioni</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{product.certifications.length}</div>
                <div className="text-xs text-gray-600">Certificazioni</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">
                  {product.origin?.type === 'seed' ? '🌰' : '🌱'}
                </div>
                <div className="text-xs text-gray-600">
                  {product.origin?.type === 'seed' ? 'Da Seme' : 'Da Vivaio'}
                </div>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Target sito</div>
                  <div className="font-semibold text-gray-900">{qualityBenchmark.targetScore}%</div>
                </div>
                <div>
                  <div className="text-gray-500">Soglia allerta</div>
                  <div className="font-semibold text-gray-900">{qualityBenchmark.alertFloorScore}%</div>
                </div>
                <div>
                  <div className="text-gray-500">Gap</div>
                  <div className={`font-semibold ${qualityBenchmark.gap >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {qualityBenchmark.gap >= 0 ? '+' : ''}{qualityBenchmark.gap}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Brix target</div>
                  <div className="font-semibold text-gray-900">{qualityBenchmark.adjustment.brixTarget}°</div>
                </div>
              </div>
            </div>

            {/* Origin Info */}
            {product.origin && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3 mb-4">
                <h5 className="text-sm font-medium text-indigo-900 mb-2 flex items-center gap-2">
                  {product.origin.type === 'seed' ? '🌰' : '🌱'} 
                  Origine: {product.origin.type === 'seed' ? 'Semina Diretta' : 'Trapianto Vivaio'}
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Costo iniziale:</span>
                    <span className="ml-1 font-medium text-indigo-700">€{product.origin.cost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data impianto:</span>
                    <span className="ml-1 font-medium text-indigo-700">
                      {new Date(product.origin.date).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  {product.origin.supplier && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Fornitore semi:</span>
                      <span className="ml-1 font-medium text-indigo-700">{product.origin.supplier}</span>
                    </div>
                  )}
                  {product.origin.nursery && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Vivaio:</span>
                      <span className="ml-1 font-medium text-indigo-700">{product.origin.nursery}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certificazioni */}
            {product.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.certifications.map((cert, idx) => (
                  <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    🏆 {cert}
                  </span>
                ))}
              </div>
            )}

            {/* Ultimi Record */}
            <div className="space-y-2 mb-4">
              <h5 className="text-sm font-medium text-gray-700">Ultime Attività:</h5>
              {product.records.slice(-2).map((record) => (
                <div key={record.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-lg">{getTypeIcon(record.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getTypeName(record.type)}
                      </span>
                      {record.verified && (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{record.description}</p>
                    <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Azioni */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProduct(product)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Eye size={14} />
                Vedi Tutto
              </button>
              {product.status === 'raccolto' && !product.qrCode && (
                <button
                  onClick={() => generateQRCode(product.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <QrCode size={14} />
                  Genera QR
                </button>
              )}
              {product.qrCode && (
                <button
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowQRModal(true)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <Package size={14} />
                  Condividi
                </button>
              )}
            </div>
          </div>
        )})}
      </div>

      {/* Vantaggi Tracciabilità */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-3">💰 Vantaggi della Tracciabilità</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-blue-800">+40% prezzo premium per prodotti tracciati</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-blue-800">Fiducia consumatori aumentata</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-blue-800">Accesso mercati premium</span>
            </div>
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-blue-500" />
              <span className="text-blue-800">Certificazioni automatiche</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Timeline Completa */}
      {selectedProduct && !showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {(() => {
                const qualityBenchmark = getProductQualityBenchmark(selectedProduct)

                return (
                  <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  📋 Storia Completa - {selectedProduct.name}
                </h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${qualityBenchmark.badgeClassName}`}>
                    {qualityBenchmark.badgeLabel}
                  </span>
                  <span className="text-sm text-gray-600">
                    Target {qualityBenchmark.targetScore}% • Soglia {qualityBenchmark.alertFloorScore}% • Gap {qualityBenchmark.gap >= 0 ? '+' : ''}{qualityBenchmark.gap}
                  </span>
                </div>
                {qualityBenchmark.adjustment.notes.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {qualityBenchmark.adjustment.notes.map((note, idx) => (
                      <p key={idx} className="text-sm text-gray-600">{note}</p>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {selectedProduct.records.map((record) => (
                  <div key={record.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    <span className="text-2xl">{getTypeIcon(record.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {getTypeName(record.type)}
                        </span>
                        {record.verified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                      <div className="text-xs text-gray-500">
                        📅 {new Date(record.date).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{selectedProduct.qualityScore}%</div>
                    <div className="text-sm text-gray-600">Punteggio Qualità</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{selectedProduct.records.length}</div>
                    <div className="text-sm text-gray-600">Registrazioni Verificate</div>
                  </div>
                </div>
              </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQRModal && selectedProduct?.qrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 text-center">
              {(() => {
                const qualityBenchmark = getProductQualityBenchmark(selectedProduct)

                return (
                  <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">QR Code Prodotto</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">QR Code</p>
                    <p className="text-xs text-gray-500 font-mono">{selectedProduct.qrCode}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><strong>Prodotto:</strong> {selectedProduct.name}</p>
                <p><strong>Varietà:</strong> {selectedProduct.variety}</p>
                <p><strong>Qualità:</strong> {selectedProduct.qualityScore}%</p>
                <p><strong>Benchmark sito:</strong> {qualityBenchmark.targetScore}% (soglia {qualityBenchmark.alertFloorScore}%)</p>
                <p><strong>Certificazioni:</strong> {selectedProduct.certifications.join(', ')}</p>
                {selectedProduct.origin && (
                  <>
                    <p><strong>Origine:</strong> {selectedProduct.origin.type === 'seed' ? '🌰 Semina Diretta' : '🌱 Trapianto Vivaio'}</p>
                    <p><strong>Costo iniziale:</strong> €{selectedProduct.origin.cost.toFixed(2)}</p>
                    <p><strong>Data impianto:</strong> {new Date(selectedProduct.origin.date).toLocaleDateString('it-IT')}</p>
                    {selectedProduct.origin.supplier && (
                      <p><strong>Fornitore semi:</strong> {selectedProduct.origin.supplier}</p>
                    )}
                    {selectedProduct.origin.nursery && (
                      <p><strong>Vivaio:</strong> {selectedProduct.origin.nursery}</p>
                    )}
                  </>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>🌐 URL Consumatori:</strong><br />
                  <code className="text-xs">trace.ortomio.com/{selectedProduct.id}</code>
                </p>
              </div>

              <button
                onClick={() => setShowQRModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Chiudi
              </button>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
