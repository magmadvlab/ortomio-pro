'use client'

import React, { useState, useEffect } from 'react'
import { 
  FlaskConical, 
  Leaf, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Package,
  BarChart3,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Beaker,
  Droplets,
  Target,
  Activity
} from 'lucide-react'
import { Garden } from '@/types'
import { 
  NutritionDashboardData,
  NutritionTreatment,
  NutritionSchedule,
  ProductInventory,
  EffectivenessAlert,
  FertilizerProduct,
  TreatmentProduct
} from '@/types/nutrition'
import { advancedNutritionService } from '@/services/advancedNutritionService'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

interface ProfessionalNutritionDashboardProps {
  garden: Garden
  onNavigateToProducts?: () => void
  onNavigateToTreatments?: () => void
  onNavigateToSchedules?: () => void
  onNavigateToAnalytics?: () => void
  onNavigateToInventory?: () => void
}

export default function ProfessionalNutritionDashboard({
  garden,
  onNavigateToProducts,
  onNavigateToTreatments,
  onNavigateToSchedules,
  onNavigateToAnalytics,
  onNavigateToInventory
}: ProfessionalNutritionDashboardProps) {
  const [dashboardData, setDashboardData] = useState<NutritionDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [garden.id])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await advancedNutritionService.getDashboardData(garden.id)
      setDashboardData(data)
    } catch (err) {
      console.error('Error loading nutrition dashboard data:', err)
      setError('Errore nel caricamento dei dati del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadDashboardData()
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'planned': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'postponed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTreatmentTypeIcon = (type: string) => {
    switch (type) {
      case 'fertilization': return <Leaf className="text-green-600" size={16} />
      case 'pest_control': return <Target className="text-red-600" size={16} />
      case 'disease_control': return <Beaker className="text-blue-600" size={16} />
      case 'weed_control': return <XCircle className="text-orange-600" size={16} />
      case 'growth_regulation': return <TrendingUp className="text-purple-600" size={16} />
      default: return <FlaskConical className="text-gray-600" size={16} />
    }
  }

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) return 'Oggi'
    if (isTomorrow(date)) return 'Domani'
    return format(date, 'dd MMM', { locale: it })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-48 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Errore nel caricamento</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <FlaskConical className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun dato disponibile</h3>
          <p className="text-gray-600">Inizia aggiungendo prodotti e trattamenti</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Nutrizione</h1>
              <p className="text-gray-600">Gestione professionale trattamenti e fertilizzazioni</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
            Aggiorna
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Treatments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.activeTreatments}</p>
              <p className="text-sm text-gray-600">Trattamenti Attivi</p>
            </div>
          </div>
        </div>

        {/* Scheduled Treatments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.scheduledTreatments}</p>
              <p className="text-sm text-gray-600">Programmati</p>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalProducts}</p>
              <p className="text-sm text-gray-600">Prodotti Totali</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              dashboardData.lowStockAlerts > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <AlertTriangle className={`${
                dashboardData.lowStockAlerts > 0 ? 'text-red-600' : 'text-green-600'
              }`} size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.lowStockAlerts}</p>
              <p className="text-sm text-gray-600">Alert Stock</p>
            </div>
          </div>
        </div>
      </div>

      {dashboardData.waterQualityInsight && (
        <div className={`rounded-xl border p-5 ${
          dashboardData.waterQualityInsight.qualityBand === 'critical'
            ? 'border-red-200 bg-red-50'
            : dashboardData.waterQualityInsight.qualityBand === 'caution'
              ? 'border-amber-200 bg-amber-50'
              : 'border-sky-200 bg-sky-50'
        }`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
              <Droplets className="text-sky-600" size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Qualita Acqua per Nutrizione</h2>
              <p className="text-sm text-gray-700 mt-1">
                Score medio {dashboardData.waterQualityInsight.averageQualityScore}/100
                {' · '}
                peggiore {dashboardData.waterQualityInsight.worstQualityScore}/100
                {' · '}
                zone monitorate {dashboardData.waterQualityInsight.monitoredZoneCount}/{dashboardData.waterQualityInsight.zoneCount}
              </p>
              {dashboardData.waterQualityInsight.sourceLabel && (
                <p className="text-sm text-gray-600 mt-1">
                  Fonte prevalente: {dashboardData.waterQualityInsight.sourceLabel}
                </p>
              )}
              {dashboardData.waterQualityInsight.riskFlags.length > 0 && (
                <p className="text-sm text-gray-700 mt-2">
                  Rischi principali: {dashboardData.waterQualityInsight.riskFlags.join(', ')}
                </p>
              )}
              {dashboardData.waterQualityInsight.hasFertigationExposure && (
                <p className="text-sm text-gray-700 mt-2">
                  La fertirrigazione e attiva: conviene usare questi vincoli nel dosaggio, nelle miscele e nel timing.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Organic Percentage */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-green-600">{dashboardData.quickStats.organicPercentage}%</p>
            <p className="text-sm text-gray-600">Biologico</p>
          </div>

          {/* Average Effectiveness */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-blue-600">{dashboardData.quickStats.averageEffectiveness}%</p>
            <p className="text-sm text-gray-600">Efficacia Media</p>
          </div>

          {/* Monthly Cost */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-purple-600">€{dashboardData.quickStats.monthlyCost}</p>
            <p className="text-sm text-gray-600">Costo Mensile</p>
          </div>

          {/* Treatment Frequency */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-orange-600">{dashboardData.quickStats.treatmentFrequency}</p>
            <p className="text-sm text-gray-600">Trattamenti/Mese</p>
          </div>
        </div>

        {dashboardData.adaptiveThresholds?.notes?.length ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">
              Target adattivo efficacia: {dashboardData.adaptiveThresholds.effectivenessTargetPercent}%
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Alert sotto {dashboardData.adaptiveThresholds.effectivenessAlertFloorPercent}% e follow-up oltre il {dashboardData.adaptiveThresholds.followUpRateThresholdPercent}%.
            </p>
            <p className="mt-2 text-sm text-amber-700">
              {dashboardData.adaptiveThresholds.notes.join(' ')}
            </p>
          </div>
        ) : null}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Treatments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trattamenti Recenti</h2>
            <button
              onClick={onNavigateToTreatments}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Vedi tutti
            </button>
          </div>

          {dashboardData.recentTreatments.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">Nessun trattamento recente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentTreatments.slice(0, 5).map((treatment) => (
                <div key={treatment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getTreatmentTypeIcon(treatment.treatmentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {treatment.productName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(treatment.actualApplicationDate || treatment.scheduledDate)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
                      {treatment.status === 'completed' ? 'Completato' :
                       treatment.status === 'in_progress' ? 'In corso' :
                       treatment.status === 'planned' ? 'Pianificato' :
                       treatment.status === 'cancelled' ? 'Annullato' :
                       'Posticipato'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onNavigateToTreatments}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Nuovo Trattamento
            </button>
          </div>
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Programmazioni</h2>
            <button
              onClick={onNavigateToSchedules}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Gestisci
            </button>
          </div>

          {dashboardData.upcomingSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">Nessuna programmazione attiva</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.upcomingSchedules.slice(0, 5).map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="text-blue-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {schedule.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {schedule.nextExecutionDate ? formatDate(schedule.nextExecutionDate) : 'Data non definita'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                    }`}>
                      {schedule.isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onNavigateToSchedules}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Nuova Programmazione
            </button>
          </div>
        </div>
      </div>

      {/* Alerts and Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stock Basso</h2>
            <button
              onClick={onNavigateToInventory}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Gestisci Inventario
            </button>
          </div>

          {dashboardData.lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
              <p className="text-green-600 text-sm font-medium">Tutti i prodotti sono disponibili</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.productId} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="text-red-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.productName}
                    </p>
                    <p className="text-xs text-red-600">
                      Stock: {product.currentStock} {product.stockUnit} (min: {product.minimumStock})
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                      Riordina
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Effectiveness Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Alert Efficacia</h2>
            <button
              onClick={onNavigateToAnalytics}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Analisi Completa
            </button>
          </div>

          {dashboardData.effectivenessAlerts.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-8 w-8 text-green-400 mb-2" />
              <p className="text-green-600 text-sm font-medium">Tutti i trattamenti sono efficaci</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.effectivenessAlerts.slice(0, 5).map((alert) => (
                <div key={alert.treatmentId} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-shrink-0">
                    <Eye className="text-yellow-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alert.productName}
                    </p>
                    <p className="text-xs text-yellow-600">
                      Efficacia: {alert.effectiveness}% (target: {alert.expectedEffectiveness}%)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{alert.recommendedAction}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                      Verifica
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onNavigateToProducts}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
          >
            <Package className="text-green-600" size={20} />
            <div>
              <p className="font-medium text-green-900">Gestisci Prodotti</p>
              <p className="text-sm text-green-700">Fertilizzanti e trattamenti</p>
            </div>
          </button>

          <button
            onClick={onNavigateToTreatments}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
          >
            <FlaskConical className="text-blue-600" size={20} />
            <div>
              <p className="font-medium text-blue-900">Nuovo Trattamento</p>
              <p className="text-sm text-blue-700">Applica fertilizzanti</p>
            </div>
          </button>

          <button
            onClick={onNavigateToSchedules}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
          >
            <Calendar className="text-purple-600" size={20} />
            <div>
              <p className="font-medium text-purple-900">Programmazioni</p>
              <p className="text-sm text-purple-700">Automatizza trattamenti</p>
            </div>
          </button>

          <button
            onClick={onNavigateToAnalytics}
            className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
          >
            <BarChart3 className="text-orange-600" size={20} />
            <div>
              <p className="font-medium text-orange-900">Analytics</p>
              <p className="text-sm text-orange-700">Analisi e report</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
