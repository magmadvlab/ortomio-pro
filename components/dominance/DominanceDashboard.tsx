/**
 * Dominance Dashboard - INTERNAL USE ONLY
 * 
 * ⚠️  IMPORTANTE: Questo componente è per ANALISI STRATEGICA INTERNA
 * NON deve essere accessibile agli utenti finali dell'app.
 * 
 * Utilizzato per:
 * - Business intelligence interna
 * - Analisi competitive 
 * - Metriche strategiche aziendali
 * - Monitoraggio posizione mercato
 * 
 * Gli utenti vedono solo: AI Predictions, Drone Operations, Blockchain
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Brain, 
  Drone, 
  Shield, 
  Zap, 
  Globe, 
  Award,
  Target,
  Rocket,
  Crown,
  Star,
  BarChart3,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'

interface DominanceMetrics {
  aiPredictions: {
    accuracy: number
    predictions: number
    savings: number
  }
  droneOperations: {
    flights: number
    coverage: number
    insights: number
  }
  blockchainRecords: {
    totalRecords: number
    verified: number
    nftCertificates: number
  }
  certifications: {
    active: number
    compliance: number
    savings: number
  }
  marketPosition: {
    customers: number
    retention: number
    nps: number
  }
  competitiveAdvantage: {
    vsXFarm: number
    vsAgrivi: number
    vsEVineyard: number
  }
}

interface CompetitorComparison {
  feature: string
  ortomio: 'SUPERIOR' | 'EQUAL' | 'INFERIOR'
  xfarm: 'SUPERIOR' | 'EQUAL' | 'INFERIOR'
  agrivi: 'SUPERIOR' | 'EQUAL' | 'INFERIOR'
  evineyard: 'SUPERIOR' | 'EQUAL' | 'INFERIOR'
  advantage: string
}

export default function DominanceDashboard() {
  const [metrics, setMetrics] = useState<DominanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'drone' | 'blockchain' | 'competitive'>('overview')

  useEffect(() => {
    loadDominanceMetrics()
  }, [])

  const loadDominanceMetrics = async () => {
    try {
      setLoading(true)
      
      // INTERNAL USE ONLY - Mock data for strategic analysis
      // This component is for internal business intelligence, not user-facing
      const mockMetrics: DominanceMetrics = {
        aiPredictions: {
          accuracy: 94.5,
          predictions: 1247,
          savings: 15420
        },
        droneOperations: {
          flights: 89,
          coverage: 2340,
          insights: 567
        },
        blockchainRecords: {
          totalRecords: 5678,
          verified: 5678,
          nftCertificates: 234
        },
        certifications: {
          active: 6,
          compliance: 98.7,
          savings: 8900
        },
        marketPosition: {
          customers: 1250,
          retention: 94.2,
          nps: 72
        },
        competitiveAdvantage: {
          vsXFarm: 85,
          vsAgrivi: 92,
          vsEVineyard: 96
        }
      }
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Error loading dominance metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const competitorComparisons: CompetitorComparison[] = [
    {
      feature: 'Tracciabilità',
      ortomio: 'SUPERIOR',
      xfarm: 'INFERIOR',
      agrivi: 'INFERIOR',
      evineyard: 'INFERIOR',
      advantage: 'Pianta-per-pianta vs campo-per-campo'
    },
    {
      feature: 'AI Predittiva',
      ortomio: 'SUPERIOR',
      xfarm: 'INFERIOR',
      agrivi: 'INFERIOR',
      evineyard: 'INFERIOR',
      advantage: '94.5% accuratezza malattie, yield prediction ML'
    },
    {
      feature: 'Certificazioni',
      ortomio: 'SUPERIOR',
      xfarm: 'INFERIOR',
      agrivi: 'EQUAL',
      evineyard: 'INFERIOR',
      advantage: 'Automatizzate complete: HACCP + GlobalG.A.P. + Bio'
    },
    {
      feature: 'Mobile Experience',
      ortomio: 'SUPERIOR',
      xfarm: 'EQUAL',
      agrivi: 'INFERIOR',
      evineyard: 'INFERIOR',
      advantage: '86.7/100 mobile score, offline-first'
    },
    {
      feature: 'Blockchain',
      ortomio: 'SUPERIOR',
      xfarm: 'INFERIOR',
      agrivi: 'INFERIOR',
      evineyard: 'INFERIOR',
      advantage: 'Unico con tracciabilità immutabile + NFT'
    },
    {
      feature: 'Drone Integration',
      ortomio: 'SUPERIOR',
      xfarm: 'INFERIOR',
      agrivi: 'INFERIOR',
      evineyard: 'INFERIOR',
      advantage: 'API nativa + prescription maps automatiche'
    },
    {
      feature: 'Marketplace',
      ortomio: 'SUPERIOR',
      xfarm: 'INFERIOR',
      agrivi: 'INFERIOR',
      evineyard: 'INFERIOR',
      advantage: 'B2B2C integrato con pricing lotto-specifico benchmark-aware'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento metriche dominanza...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Errore Caricamento</h2>
            <p className="text-gray-600">Impossibile caricare le metriche di dominanza</p>
          </div>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Vantaggio Competitivo</p>
              <p className="text-3xl font-bold">91%</p>
              <p className="text-sm text-purple-100">vs Concorrenza</p>
            </div>
            <Crown className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">AI Accuracy</p>
              <p className="text-3xl font-bold">{metrics.aiPredictions.accuracy}%</p>
              <p className="text-sm text-green-100">Predizioni Malattie</p>
            </div>
            <Brain className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Blockchain Records</p>
              <p className="text-3xl font-bold">{metrics.blockchainRecords.totalRecords.toLocaleString()}</p>
              <p className="text-sm text-blue-100">100% Verificati</p>
            </div>
            <Shield className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Customer Retention</p>
              <p className="text-3xl font-bold">{metrics.marketPosition.retention}%</p>
              <p className="text-sm text-orange-100">NPS: {metrics.marketPosition.nps}</p>
            </div>
            <Users className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Competitive Advantage Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Vantaggio Competitivo</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">vs xFarm Technologies</span>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.competitiveAdvantage.vsXFarm}%` }}
                ></div>
              </div>
              <span className="font-bold text-green-600">{metrics.competitiveAdvantage.vsXFarm}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">vs Agrivi</span>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.competitiveAdvantage.vsAgrivi}%` }}
                ></div>
              </div>
              <span className="font-bold text-blue-600">{metrics.competitiveAdvantage.vsAgrivi}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">vs eVineyard</span>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.competitiveAdvantage.vsEVineyard}%` }}
                ></div>
              </div>
              <span className="font-bold text-purple-600">{metrics.competitiveAdvantage.vsEVineyard}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Differentiators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900">AI Predittiva</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Accuratezza</span>
              <span className="font-semibold text-purple-600">{metrics.aiPredictions.accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Predizioni</span>
              <span className="font-semibold">{metrics.aiPredictions.predictions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Risparmio</span>
              <span className="font-semibold text-green-600">€{metrics.aiPredictions.savings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Drone className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900">Drone Integration</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Voli Completati</span>
              <span className="font-semibold text-blue-600">{metrics.droneOperations.flights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Copertura</span>
              <span className="font-semibold">{metrics.droneOperations.coverage} ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Insights</span>
              <span className="font-semibold text-green-600">{metrics.droneOperations.insights}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900">Blockchain</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Records</span>
              <span className="font-semibold text-green-600">{metrics.blockchainRecords.totalRecords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Verificati</span>
              <span className="font-semibold">100%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">NFT Certificates</span>
              <span className="font-semibold text-purple-600">{metrics.blockchainRecords.nftCertificates}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Position */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Posizione di Mercato</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {metrics.marketPosition.customers.toLocaleString()}
            </div>
            <div className="text-gray-600">Clienti Attivi</div>
            <div className="text-sm text-green-600 mt-1">+45% vs Q4 2025</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {metrics.marketPosition.retention}%
            </div>
            <div className="text-gray-600">Retention Rate</div>
            <div className="text-sm text-green-600 mt-1">Industry: 78%</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.marketPosition.nps}
            </div>
            <div className="text-gray-600">Net Promoter Score</div>
            <div className="text-sm text-green-600 mt-1">Excellent (&gt;70)</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCompetitiveAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Analisi Competitiva Dettagliata</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Caratteristica</th>
                <th className="text-center py-3 px-4 font-semibold text-purple-600">OrtoMio</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">xFarm</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Agrivi</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">eVineyard</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Vantaggio OrtoMio</th>
              </tr>
            </thead>
            <tbody>
              {competitorComparisons.map((comparison, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">{comparison.feature}</td>
                  <td className="py-4 px-4 text-center">
                    {comparison.ortomio === 'SUPERIOR' && (
                      <div className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle size={16} />
                        <span className="font-semibold">Superior</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {comparison.xfarm === 'INFERIOR' && (
                      <div className="inline-flex items-center gap-1 text-red-500">
                        <AlertTriangle size={16} />
                        <span>Inferior</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {comparison.agrivi === 'INFERIOR' && (
                      <div className="inline-flex items-center gap-1 text-red-500">
                        <AlertTriangle size={16} />
                        <span>Inferior</span>
                      </div>
                    )}
                    {comparison.agrivi === 'EQUAL' && (
                      <div className="inline-flex items-center gap-1 text-yellow-500">
                        <Clock size={16} />
                        <span>Equal</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {comparison.evineyard === 'INFERIOR' && (
                      <div className="inline-flex items-center gap-1 text-red-500">
                        <AlertTriangle size={16} />
                        <span>Inferior</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{comparison.advantage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitive Moats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Moat Inattaccabili</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg mt-1">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Network Effects</h4>
                <p className="text-sm text-gray-600">Più farms = migliori dati = migliori AI = più farms</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg mt-1">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Data Moat</h4>
                <p className="text-sm text-gray-600">5+ anni di dati granulari pianta-per-pianta</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg mt-1">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Integration Complexity</h4>
                <p className="text-sm text-gray-600">Ecosistema di 50+ integrazioni</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg mt-1">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Switching Costs</h4>
                <p className="text-sm text-gray-600">Compliance e certificazioni integrate</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg mt-1">
                <Star className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Brand Trust</h4>
                <p className="text-sm text-gray-600">Certificazioni automatiche = fiducia assoluta</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg mt-1">
                <Globe className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Ecosystem Lock-in</h4>
                <p className="text-sm text-gray-600">Sistema nervoso centrale dell'azienda</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Dominanza Mercato
              </h1>
              <p className="text-gray-600">
                Monitoraggio strategico per leadership assoluta AgTech
              </p>
            </div>
          </div>

          {/* Strategic Badge */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">
                  🚀 Strategia Dominanza 2026 - In Esecuzione
                </h3>
                <p className="text-sm text-purple-100">
                  Target: Leader Assoluto AgTech • Unicorn Status • 91% Vantaggio Competitivo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
            {[
              { id: 'overview', label: 'Panoramica', icon: TrendingUp },
              { id: 'ai', label: 'AI Engine', icon: Brain },
              { id: 'drone', label: 'Drone Ops', icon: Drone },
              { id: 'blockchain', label: 'Blockchain', icon: Shield },
              { id: 'competitive', label: 'Analisi Competitiva', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'competitive' && renderCompetitiveAnalysis()}
        
        {/* Placeholder for other tabs */}
        {['ai', 'drone', 'blockchain'].includes(activeTab) && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
              {activeTab === 'ai' && <Brain className="h-12 w-12 text-gray-400" />}
              {activeTab === 'drone' && <Drone className="h-12 w-12 text-gray-400" />}
              {activeTab === 'blockchain' && <Shield className="h-12 w-12 text-gray-400" />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'ai' && 'AI Predictive Engine'}
              {activeTab === 'drone' && 'Drone Operations Center'}
              {activeTab === 'blockchain' && 'Blockchain Traceability'}
            </h3>
            <p className="text-gray-600">
              Dashboard dettagliata in sviluppo - Disponibile Q1 2026
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
