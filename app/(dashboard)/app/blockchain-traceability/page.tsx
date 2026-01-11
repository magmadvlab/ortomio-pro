'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Link, 
  Award, 
  QrCode, 
  Eye, 
  Plus,
  CheckCircle,
  Clock,
  Zap,
  Star,
  Globe,
  Coins
} from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'

interface TraceabilityChain {
  productId: string
  productName: string
  variety: string
  totalRecords: number
  startDate: string
  endDate?: string
  status: 'GROWING' | 'HARVESTED' | 'PROCESSED' | 'SOLD' | 'CONSUMED'
  records: BlockchainRecord[]
  nftCertificate?: NFTCertificate
}

interface BlockchainRecord {
  id: string
  transactionHash: string
  blockNumber: number
  timestamp: string
  type: 'SEED' | 'PLANT' | 'TREATMENT' | 'HARVEST' | 'PROCESSING' | 'SALE' | 'CERTIFICATION'
  verified: boolean
  immutable: boolean
}

interface NFTCertificate {
  tokenId: string
  contractAddress: string
  network: 'ETHEREUM' | 'POLYGON' | 'BSC'
  metadataUri: string
  ownerAddress: string
  mintDate: string
  imageUrl: string
}

export default function BlockchainTraceabilityPage() {
  const { activeGarden } = useGarden()
  const [loading, setLoading] = useState(true)
  const [chains, setChains] = useState<TraceabilityChain[]>([])
  const [activeTab, setActiveTab] = useState<'chains' | 'nft' | 'consumer'>('chains')
  const [selectedChain, setSelectedChain] = useState<TraceabilityChain | null>(null)

  useEffect(() => {
    if (activeGarden) {
      loadTraceabilityChains()
    }
  }, [activeGarden])

  const loadTraceabilityChains = async () => {
    if (!activeGarden) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/blockchain/traceability?gardenId=${activeGarden.id}`)
      const result = await response.json()
      
      if (result.success) {
        setChains(result.data)
      }
    } catch (error) {
      console.error('Error loading traceability chains:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNFTCertificate = async (productId: string) => {
    if (!activeGarden) return
    
    try {
      const certificateData = {
        productName: 'Pomodoro San Marzano',
        variety: 'San Marzano DOP',
        harvestDate: new Date().toISOString(),
        qualityScore: 95,
        certifications: ['Biologico', 'GlobalG.A.P.'],
        carbonNeutral: true,
        farmerName: 'Azienda Agricola Demo',
        gardenLocation: 'Campania, Italia'
      }

      const response = await fetch('/api/blockchain/nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, gardenId: activeGarden.id, certificateData })
      })
      
      const result = await response.json()
      if (result.success) {
        await loadTraceabilityChains()
      }
    } catch (error) {
      console.error('Error generating NFT certificate:', error)
    }
  }

  const createBlockchainRecord = async () => {
    if (!activeGarden) return
    
    try {
      const recordData = {
        variety: 'Pomodoro San Marzano',
        supplier: 'Semi Biologici Italia',
        batchNumber: 'BIO2026001',
        organicCertified: true,
        plantingDate: new Date().toISOString(),
        location: { latitude: 40.8518, longitude: 14.2681 },
        soilConditions: { ph: 6.8, organicMatter: 3.5 }
      }

      const response = await fetch('/api/blockchain/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SEED',
          gardenId: activeGarden.id,
          plantId: `plant_${Date.now()}`,
          data: recordData
        })
      })
      
      const result = await response.json()
      if (result.success) {
        await loadTraceabilityChains()
      }
    } catch (error) {
      console.error('Error creating blockchain record:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GROWING': return 'text-green-600 bg-green-100'
      case 'HARVESTED': return 'text-blue-600 bg-blue-100'
      case 'PROCESSED': return 'text-purple-600 bg-purple-100'
      case 'SOLD': return 'text-orange-600 bg-orange-100'
      case 'CONSUMED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'SEED': return '🌱'
      case 'PLANT': return '🌿'
      case 'TREATMENT': return '💊'
      case 'HARVEST': return '🌾'
      case 'PROCESSING': return '⚙️'
      case 'SALE': return '💰'
      case 'CERTIFICATION': return '🏆'
      default: return '📝'
    }
  }

  const getRecordTypeName = (type: string) => {
    switch (type) {
      case 'SEED': return 'Semina'
      case 'PLANT': return 'Crescita'
      case 'TREATMENT': return 'Trattamento'
      case 'HARVEST': return 'Raccolta'
      case 'PROCESSING': return 'Lavorazione'
      case 'SALE': return 'Vendita'
      case 'CERTIFICATION': return 'Certificazione'
      default: return type
    }
  }

  if (!activeGarden) {
    return (
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seleziona un Orto
          </h2>
          <p className="text-gray-600">
            Seleziona un orto per accedere alla tracciabilità blockchain
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento blockchain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tracciabilità Blockchain
                </h1>
                <p className="text-gray-600">
                  Tracciabilità immutabile per {activeGarden.name}
                </p>
              </div>
            </div>
            <button
              onClick={createBlockchainRecord}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Nuovo Record
            </button>
          </div>

          {/* Blockchain Badge */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">
                  🔗 Blockchain Traceability - Immutable Records
                </h3>
                <p className="text-sm text-green-800">
                  Seed-to-plate • NFT certificates • Smart contracts • 
                  Consumer transparency • Carbon footprint • Premium pricing +40%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
            {[
              { id: 'chains', label: 'Catene Tracciabilità', icon: Link },
              { id: 'nft', label: 'Certificati NFT', icon: Award },
              { id: 'consumer', label: 'App Consumatori', icon: QrCode }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Traceability Chains */}
          {activeTab === 'chains' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Catene di Tracciabilità</h2>
              
              {chains.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Link className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nessuna Catena Attiva</h3>
                  <p className="text-gray-600 mb-4">Crea il primo record blockchain per iniziare la tracciabilità</p>
                  <button
                    onClick={createBlockchainRecord}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Crea Primo Record
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {chains.map((chain) => (
                    <div key={chain.productId} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {chain.productName} - {chain.variety}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {chain.totalRecords} records • 
                              Iniziato: {new Date(chain.startDate).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(chain.status)}`}>
                            {chain.status}
                          </div>
                          {chain.nftCertificate && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                              <Star size={12} />
                              NFT
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Timeline Blockchain:</h4>
                        <div className="space-y-2">
                          {chain.records.slice(0, 3).map((record) => (
                            <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-lg">{getRecordTypeIcon(record.type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {getRecordTypeName(record.type)}
                                  </span>
                                  {record.verified && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {new Date(record.timestamp).toLocaleString('it-IT')} • 
                                  Block #{record.blockNumber}
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedChain(chain)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          ))}
                          {chain.records.length > 3 && (
                            <div className="text-center text-sm text-gray-500">
                              +{chain.records.length - 3} altri records...
                            </div>
                          )}
                        </div>
                      </div>

                      {!chain.nftCertificate && chain.status === 'HARVESTED' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => generateNFTCertificate(chain.productId)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Award size={16} />
                            Genera Certificato NFT
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NFT Certificates */}
          {activeTab === 'nft' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Certificati NFT</h2>
              
              {chains.filter(chain => chain.nftCertificate).length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Award className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun Certificato NFT</h3>
                  <p className="text-gray-600">I certificati NFT vengono generati automaticamente dopo la raccolta</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {chains
                    .filter(chain => chain.nftCertificate)
                    .map((chain) => (
                      <div key={chain.productId} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Award className="h-16 w-16 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">{chain.productName}</h3>
                            <p className="text-purple-100">{chain.variety}</p>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Certificato NFT</h4>
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                              <Coins size={12} />
                              {chain.nftCertificate?.network}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Token ID:</span>
                              <span className="font-mono">#{chain.nftCertificate?.tokenId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Mint Date:</span>
                              <span>{new Date(chain.nftCertificate?.mintDate || '').toLocaleDateString('it-IT')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Records:</span>
                              <span>{chain.totalRecords} verificati</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                              <Globe size={16} />
                              Visualizza su Blockchain
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Consumer App */}
          {activeTab === 'consumer' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">App Consumatori</h2>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Trasparenza Totale</h3>
                  <p className="text-gray-600">
                    I consumatori possono scansionare il QR code per vedere l'intera storia del prodotto
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Cosa Vedono i Consumatori:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Storia completa seed-to-plate
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Certificazioni biologiche e qualità
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Impronta carbonica e sostenibilità
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Informazioni azienda agricola
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Metodi di coltivazione utilizzati
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Vantaggi per l'Azienda:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        +40% premium pricing
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        Fiducia consumatori aumentata
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        Accesso mercati premium
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        Brand differentiation
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        Marketing automatico
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🌱 Esempio URL Consumatore:</h4>
                  <code className="text-sm text-green-800 bg-white px-2 py-1 rounded">
                    https://trace.ortomio.com/product/pomodoro-san-marzano-bio-2026
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Chain Modal */}
        {selectedChain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Timeline Completa - {selectedChain.productName}
                  </h3>
                  <button
                    onClick={() => setSelectedChain(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  {selectedChain.records.map((record) => (
                    <div key={record.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <span className="text-2xl">{getRecordTypeIcon(record.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {getRecordTypeName(record.type)}
                          </span>
                          {record.verified && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📅 {new Date(record.timestamp).toLocaleString('it-IT')}</div>
                          <div>🔗 Block #{record.blockNumber}</div>
                          <div className="font-mono text-xs">
                            Hash: {record.transactionHash.substring(0, 20)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}