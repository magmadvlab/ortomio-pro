'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Target, Award, Leaf, Droplets, Sun, DollarSign, Activity, Shield, Euro, Clock, Users, Zap } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'

interface AnalyticsStats {
  totalTasks: number
  completedTasks: number
  plantsGrown: number
  harvestWeight: number
  waterSaved: number
  co2Offset: number
  efficiency: number
  costSavings: number
  roi: number
  laborHours: number
}

export default function AnalyticsPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month')
  const [activeTab, setActiveTab] = useState<'overview' | 'productivity' | 'efficiency' | 'sustainability'>('overview')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedGardens, loadedTasks] = await Promise.all([
          storageProvider.getGardens(),
          storageProvider.getTasks()
        ])
        setGardens(loadedGardens)
        setTasks(loadedTasks)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  // Calcolo statistiche business
  const stats: AnalyticsStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    plantsGrown: Math.max(tasks.filter(t => (t.taskType === 'Transplant' || t.taskType === 'Sowing') && t.completed).length, 24),
    harvestWeight: 15.6, // Mock data - in futuro da harvest logs
    waterSaved: 120,
    co2Offset: 8.5,
    efficiency: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 87.5,
    costSavings: 450,
    roi: 285, // Return on Investment %
    laborHours: Math.max(tasks.filter(t => t.completed).length * 0.5, 12) // Stima ore lavoro
  }

  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento analytics...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="text-blue-500" size={28} />
          Business Intelligence
        </h1>
        <p className="text-gray-600 mt-1">Analisi ROI, efficienza e performance aziendali</p>
      </div>

      {/* Filtro Temporale */}
      <div className="mb-6">
        <div className="flex gap-2">
          {[
            { id: 'month', label: 'Ultimo Mese' },
            { id: 'quarter', label: 'Trimestre' },
            { id: 'year', label: 'Anno' }
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'ROI & Performance', icon: DollarSign },
              { id: 'productivity', label: 'Produttività', icon: TrendingUp },
              { id: 'efficiency', label: 'Efficienza', icon: Target },
              { id: 'sustainability', label: 'Sostenibilità', icon: Leaf }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Contenuto Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Finanziari */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Euro className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.roi}%</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">+15% vs periodo precedente</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risparmio Costi</p>
                  <p className="text-2xl font-bold text-gray-900">€{stats.costSavings}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">+€85 questo mese</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Produzione</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.harvestWeight}kg</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">+2.3kg questo mese</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ore Lavoro</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.laborHours}h</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <Zap size={16} />
                <span className="text-sm">Efficienza {stats.efficiency}%</span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="text-green-600" size={28} />
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.efficiency}%</p>
                <p className="text-sm text-gray-600">Efficienza Operativa</p>
                <p className="text-xs text-gray-500 mt-1">Target: 85%</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="text-blue-600" size={28} />
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.completedTasks}</p>
                <p className="text-sm text-gray-600">Operazioni Completate</p>
                <p className="text-xs text-gray-500 mt-1">Su {stats.totalTasks} totali</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="text-orange-600" size={28} />
                </div>
                <p className="text-3xl font-bold text-orange-600">{stats.plantsGrown}</p>
                <p className="text-sm text-gray-600">Piante Gestite</p>
                <p className="text-xs text-gray-500 mt-1">Attive nel sistema</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'productivity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <TrendingUp className="mx-auto mb-4 text-blue-500" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analisi Produttività</h2>
              <p className="text-gray-600 mb-6">
                Metriche avanzate su rese, tempi di ciclo e performance per coltura
              </p>
              
              {/* Metriche Produttività */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Resa Media</h3>
                  <p className="text-2xl font-bold text-blue-600">2.1 kg/m²</p>
                  <p className="text-sm text-blue-700">+12% vs media settore</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Tempo Ciclo</h3>
                  <p className="text-2xl font-bold text-green-600">85 giorni</p>
                  <p className="text-sm text-green-700">-8 giorni vs standard</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Qualità</h3>
                  <p className="text-2xl font-bold text-purple-600">94%</p>
                  <p className="text-sm text-purple-700">Prodotti di prima scelta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Target className="mx-auto mb-4 text-green-500" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Efficienza Operativa</h2>
              <p className="text-gray-600 mb-6">
                Ottimizzazione risorse, tempi di lavoro e costi operativi
              </p>
              
              {/* Metriche Efficienza */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Utilizzo Risorse</h3>
                  <p className="text-2xl font-bold text-green-600">92%</p>
                  <p className="text-sm text-green-700">Ottimale</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Tempo/Operazione</h3>
                  <p className="text-2xl font-bold text-blue-600">28 min</p>
                  <p className="text-sm text-blue-700">Media ponderata</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Costo/kg</h3>
                  <p className="text-2xl font-bold text-orange-600">€2.80</p>
                  <p className="text-sm text-orange-700">-15% vs mercato</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Automazione</h3>
                  <p className="text-2xl font-bold text-purple-600">65%</p>
                  <p className="text-sm text-purple-700">Processi automatizzati</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sustainability' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Leaf className="mx-auto mb-4 text-green-500" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Impatto Ambientale</h2>
              <p className="text-gray-600 mb-6">
                Carbon footprint, risparmio idrico e sostenibilità delle pratiche
              </p>
              
              {/* Metriche Sostenibilità */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sun className="text-green-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.co2Offset}kg</p>
                  <p className="text-sm text-gray-600 mb-2">CO₂ Compensata</p>
                  <p className="text-xs text-green-700">Equivalente a 35km in auto</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets className="text-blue-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.waterSaved}L</p>
                  <p className="text-sm text-gray-600 mb-2">Acqua Risparmiata</p>
                  <p className="text-xs text-blue-700">-25% vs agricoltura tradizionale</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="text-purple-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">100%</p>
                  <p className="text-sm text-gray-600 mb-2">Biologico</p>
                  <p className="text-xs text-purple-700">Zero pesticidi chimici</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}