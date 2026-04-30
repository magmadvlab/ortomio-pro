/**
 * Integrated Smart Hub - Hub IoT Unificato
 * Integra dispositivi IoT tradizionali (sensori, valvole) con droni
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Wifi, 
  Droplets, 
  Activity, 
  Settings, 
  Power, 
  Bot, 
  Sparkles, 
  Loader2,
  Drone,
  Play,
  Plus,
  Calendar,
  Camera,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Eye,
  Map,
  MapPin
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { SmartDevice, SmartDeviceAutomationLog, Garden } from '@/types'
import ActionButton, { ActionContext } from '@/components/actions/ActionButton'
import InterventionWizard, { InterventionData } from '@/components/actions/InterventionWizard'
import { interventionService } from '@/services/interventionService'
import type { IrrigationScopeDiagnostics } from '@/services/irrigationScopeDiagnosticsService'
import type { SmartDeviceAutomationAnalytics } from '@/services/smartDeviceAutomationAnalyticsService'
import type { SensorReading } from '@/services/sensorDataService'

interface DroneFlightPlan {
  id: string
  name: string
  type: 'SURVEY' | 'MONITORING' | 'PRESCRIPTION' | 'EMERGENCY'
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  scheduledDate: string
  duration: number
  altitude: number
  waypoints: any[]
  results?: {
    imagesCapture: number
    dataSize: number
    batteryUsed: number
    analysis: {
      healthMap: { overallScore: number }
      diseaseDetection: any[]
      yieldEstimation: { totalEstimatedYield: number }
    }
  }
}

interface IntegratedSmartHubProps {
  devices: SmartDevice[]
  automationAnalytics: SmartDeviceAutomationAnalytics
  automationLogs: Record<string, SmartDeviceAutomationLog[]>
  scopeDiagnostics: Record<string, IrrigationScopeDiagnostics>
  sensorQualityReadings: Record<string, SensorReading>
  garden: Garden
  onToggleValve: (id: string, isOpen: boolean) => void
  onUpdateDeviceSettings: (id: string, settings: Partial<SmartDevice>) => void
  onApplyScopeAction: (
    action: SmartDeviceAutomationAnalytics['scopeActions'][number]
  ) => Promise<void>
  onRollbackScopeAction: (
    action: SmartDeviceAutomationAnalytics['appliedScopeActions'][number]
  ) => Promise<void>
  onAssociateDevice: (
    device: Omit<SmartDevice, 'id' | 'lastUpdate' | 'gardenId'>
  ) => Promise<SmartDevice>
  onAddDemoDevices: () => Promise<void>
}

interface DeviceAssociationForm {
  name: string
  provider: NonNullable<SmartDevice['provider']>
  deviceCategory: NonNullable<SmartDevice['deviceCategory']>
  connectionType: NonNullable<SmartDevice['connectionType']>
  externalDeviceId: string
  sensorId: string
  scopeType: NonNullable<SmartDevice['scopeType']>
  scopeId: string
}

const initialDeviceForm: DeviceAssociationForm = {
  name: '',
  provider: 'thingsboard',
  deviceCategory: 'moisture_sensor',
  connectionType: 'cloud',
  externalDeviceId: '',
  sensorId: '',
  scopeType: 'zone',
  scopeId: '',
}

export default function IntegratedSmartHub({ 
  devices, 
  automationAnalytics,
  automationLogs,
  scopeDiagnostics,
  sensorQualityReadings,
  garden, 
  onToggleValve, 
  onUpdateDeviceSettings,
  onApplyScopeAction,
  onRollbackScopeAction,
  onAssociateDevice,
  onAddDemoDevices,
}: IntegratedSmartHubProps) {
  const [activeTab, setActiveTab] = useState<'iot' | 'drones'>('iot')
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedHistoryScopeKey, setSelectedHistoryScopeKey] = useState<string | null>(null)
  
  // Drone state
  const [flightPlans, setFlightPlans] = useState<DroneFlightPlan[]>([])
  const [droneTab, setDroneTab] = useState<'flights' | 'results' | 'create'>('flights')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [droneError, setDroneError] = useState<string | null>(null)

  // Action Buttons state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<any>(null)
  const [actionContext, setActionContext] = useState<ActionContext | null>(null)

  // Device Association state
  const [showDeviceWizard, setShowDeviceWizard] = useState(false)
  const [associatingDevice, setAssociatingDevice] = useState(false)
  const [deviceForm, setDeviceForm] = useState<DeviceAssociationForm>(initialDeviceForm)
  const [associationError, setAssociationError] = useState<string | null>(null)
  const [addingDemoDevices, setAddingDemoDevices] = useState(false)
  const [applyingScopeActionId, setApplyingScopeActionId] = useState<string | null>(null)
  const [rollingBackScopeActionId, setRollingBackScopeActionId] = useState<string | null>(null)

  // Filter devices for current garden
  const gardenDevices = devices.filter(d => d.gardenId === garden.id)

  useEffect(() => {
    if (activeTab === 'drones') {
      loadFlightPlans()
    }
  }, [activeTab, garden.id])

  useEffect(() => {
    if (automationAnalytics.scopeHistory.length === 0) {
      setSelectedHistoryScopeKey(null)
      return
    }

    if (
      !selectedHistoryScopeKey ||
      !automationAnalytics.scopeHistory.some(scope => scope.scopeKey === selectedHistoryScopeKey)
    ) {
      setSelectedHistoryScopeKey(automationAnalytics.scopeHistory[0].scopeKey)
    }
  }, [automationAnalytics.scopeHistory, selectedHistoryScopeKey])

  const loadFlightPlans = async () => {
    try {
      setLoading(true)
      setDroneError(null)
      const response = await fetch(`/api/drone/flight-plans?gardenId=${encodeURIComponent(garden.id)}`)
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Impossibile caricare i piani drone')
      }

      setFlightPlans(payload.data || [])
    } catch (error) {
      console.error('Error loading flight plans:', error)
      setDroneError(error instanceof Error ? error.message : 'Errore caricamento piani drone')
    } finally {
      setLoading(false)
    }
  }

  const createAutomaticFlight = async () => {
    try {
      setCreating(true)
      setDroneError(null)
      const response = await fetch('/api/drone/auto-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gardenId: garden.id }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Impossibile creare il piano drone')
      }

      setFlightPlans(prev => [payload.data, ...prev])
      setDroneTab('flights')
    } catch (error) {
      console.error('Error creating flight:', error)
      setDroneError(error instanceof Error ? error.message : 'Errore creazione piano drone')
    } finally {
      setCreating(false)
    }
  }

  const executeFlightPlan = async (flightPlanId: string) => {
    try {
      setDroneError(null)
      setFlightPlans(prev => prev.map(plan => 
        plan.id === flightPlanId 
          ? { ...plan, status: 'IN_PROGRESS' as const }
          : plan
      ))

      const response = await fetch('/api/drone/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightPlanId }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Impossibile eseguire il piano drone')
      }

      setFlightPlans(prev => prev.map(plan =>
        plan.id === flightPlanId
          ? { ...plan, status: 'COMPLETED' as const, results: payload.data }
          : plan
      ))
    } catch (error) {
      console.error('Error executing flight:', error)
      setDroneError(error instanceof Error ? error.message : 'Errore esecuzione piano drone')
      setFlightPlans(prev => prev.map(plan =>
        plan.id === flightPlanId
          ? { ...plan, status: 'FAILED' as const }
          : plan
      ))
    }
  }

  const handleAnalyze = async (device: SmartDevice) => {
    setAnalyzingId(device.id)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const advice = `🌿 Analisi per ${device.name}: Umidità al ${device.moisture}%. ${
      device.moisture < 30 
        ? 'Irrigazione consigliata entro 2 ore.' 
        : device.moisture > 70 
        ? 'Terreno ben idratato, evitare irrigazione per 24h.' 
        : 'Livello ottimale, monitorare evoluzione.'
    }`
    
    setAiAdvice(prev => ({ ...prev, [device.id]: advice }))
    setAnalyzingId(null)
  }

  const CircularProgress = ({ value, color, size = 120 }: { value: number, color: string, size?: number }) => {
    const radius = size / 2 - 10
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference
    
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle cx={size/2} cy={size/2} r={radius} stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
          <circle 
            cx={size/2} cy={size/2} r={radius} 
            stroke={color} strokeWidth="8" fill="transparent" 
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl md:text-2xl font-bold text-gray-700">{Math.round(value)}%</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">Umidità</span>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100'
      case 'PLANNED': return 'text-yellow-600 bg-yellow-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} />
      case 'IN_PROGRESS': return <Clock size={16} />
      case 'PLANNED': return <Calendar size={16} />
      case 'FAILED': return <AlertTriangle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SURVEY': return <Map size={16} />
      case 'MONITORING': return <Eye size={16} />
      case 'PRESCRIPTION': return <BarChart3 size={16} />
      case 'EMERGENCY': return <AlertTriangle size={16} />
      default: return <Drone size={16} />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'SURVEY': return 'Ricognizione'
      case 'MONITORING': return 'Monitoraggio'
      case 'PRESCRIPTION': return 'Prescrizione'
      case 'EMERGENCY': return 'Emergenza'
      default: return type
    }
  }

  const handleActionSelected = (actionType: any, context: ActionContext) => {
    setSelectedAction(actionType)
    setActionContext(context)
    setWizardOpen(true)
  }

  const handleInterventionCreated = async (intervention: InterventionData) => {
    try {
      await interventionService.createIntervention({
        ...intervention,
        gardenId: garden.id
      })
      
      console.log('Intervento creato con successo:', intervention)
      // Ricarica i dati se necessario
      if (activeTab === 'drones') {
        loadFlightPlans()
      }
    } catch (error) {
      console.error('Errore nella creazione dell\'intervento:', error)
    }
  }

  const getUrgencyFromDevice = (device: SmartDevice): 'low' | 'medium' | 'high' | 'critical' => {
    if (device.moisture < 20) return 'critical'
    if (device.moisture < 30) return 'high'
    if (device.moisture < 50) return 'medium'
    return 'low'
  }

  const getSmartDeviceType = (category: DeviceAssociationForm['deviceCategory']): SmartDevice['type'] => {
    return category === 'irrigation_valve' ? 'Valve' : 'Sensor'
  }

  const getDefaultMoisture = (category: DeviceAssociationForm['deviceCategory']) => {
    switch (category) {
      case 'moisture_sensor':
        return 48
      case 'weather_station':
        return 55
      default:
        return 0
    }
  }

  const getDefaultFlowRate = (category: DeviceAssociationForm['deviceCategory']) => {
    return category === 'irrigation_valve' ? 16 : 0
  }

  const hasAgronomicScope = (device: SmartDevice) =>
    Boolean(device.scopeType && device.scopeId) ||
    Boolean(device.zoneId || device.fieldRowId || device.treeId || device.plantId)

  const resolveScopeFields = (scopeType: DeviceAssociationForm['scopeType'], scopeId: string) => {
    const normalizedScopeId = scopeId.trim()

    return {
      scopeType,
      scopeId: normalizedScopeId,
      zoneId: scopeType === 'zone' ? normalizedScopeId : undefined,
      fieldRowId: scopeType === 'field_row' ? normalizedScopeId : undefined,
      treeId: scopeType === 'tree' ? normalizedScopeId : undefined,
      plantId: scopeType === 'plant' ? normalizedScopeId : undefined,
    }
  }

  const resetDeviceWizard = () => {
    setDeviceForm(initialDeviceForm)
    setAssociationError(null)
    setShowDeviceWizard(false)
  }

  const handleAssociateDevice = async () => {
    try {
      setAssociatingDevice(true)
      setAssociationError(null)

      if (!deviceForm.name.trim()) {
        throw new Error('Inserisci un nome dispositivo')
      }

      if (
        (deviceForm.provider === 'thingsboard' || deviceForm.provider === 'tuya') &&
        !deviceForm.externalDeviceId.trim()
      ) {
        throw new Error('Per ThingsBoard o Tuya serve un Device ID esterno')
      }

      if (!deviceForm.scopeId.trim()) {
        throw new Error('Collega il dispositivo a zona, filare, albero o pianta')
      }

      const scopeBinding = resolveScopeFields(deviceForm.scopeType, deviceForm.scopeId)

      await onAssociateDevice({
        name: deviceForm.name.trim(),
        type: getSmartDeviceType(deviceForm.deviceCategory),
        provider: deviceForm.provider,
        deviceCategory: deviceForm.deviceCategory,
        connectionType: deviceForm.connectionType,
        externalDeviceId: deviceForm.externalDeviceId.trim() || undefined,
        sensorId: deviceForm.sensorId.trim() || undefined,
        ...scopeBinding,
        isOnline: deviceForm.provider === 'manual',
        lastTelemetryAt: undefined,
        metadata: {
          source: 'smart-hub',
          provider: deviceForm.provider,
          scopeType: scopeBinding.scopeType,
          scopeId: scopeBinding.scopeId,
        },
        moisture: getDefaultMoisture(deviceForm.deviceCategory),
        isValveOpen: false,
        flowRateLpm: getDefaultFlowRate(deviceForm.deviceCategory),
        sessionLiters: 0,
        targetLiters: deviceForm.deviceCategory === 'irrigation_valve' ? 20 : 0,
        autoThreshold: deviceForm.deviceCategory === 'moisture_sensor' ? 35 : 0,
        autoMode: deviceForm.deviceCategory === 'moisture_sensor',
      })

      resetDeviceWizard()
    } catch (error) {
      console.error('Error associating device:', error)
      setAssociationError(error instanceof Error ? error.message : 'Associazione dispositivo non riuscita')
    } finally {
      setAssociatingDevice(false)
    }
  }

  const handleAddDemoDevices = async () => {
    try {
      setAddingDemoDevices(true)
      setAssociationError(null)
      await onAddDemoDevices()
    } catch (error) {
      console.error('Error adding demo devices:', error)
      setAssociationError(error instanceof Error ? error.message : 'Impossibile creare i dispositivi demo')
    } finally {
      setAddingDemoDevices(false)
    }
  }

  const providerLabel = (provider?: SmartDevice['provider']) => {
    switch (provider) {
      case 'thingsboard':
        return 'ThingsBoard'
      case 'tuya':
        return 'Tuya'
      default:
        return 'Manuale'
    }
  }

  const categoryLabel = (category?: SmartDevice['deviceCategory']) => {
    switch (category) {
      case 'moisture_sensor':
        return 'Sensore umidita'
      case 'irrigation_valve':
        return 'Valvola irrigazione'
      case 'weather_station':
        return 'Stazione meteo'
      case 'ph_sensor':
        return 'Sensore pH'
      case 'ec_sensor':
        return 'Sensore EC'
      default:
        return 'Dispositivo IoT'
    }
  }

  const scopeTypeLabel = (scopeType?: SmartDevice['scopeType']) => {
    switch (scopeType) {
      case 'zone':
        return 'Zona'
      case 'field_row':
        return 'Filare'
      case 'tree':
        return 'Albero'
      case 'plant':
        return 'Pianta'
      default:
        return 'Scope'
    }
  }

  const scopeLabel = (device: SmartDevice) => {
    if (device.scopeType && device.scopeId) {
      return `${scopeTypeLabel(device.scopeType)}: ${device.scopeId}`
    }

    if (device.zoneId) return `Zona: ${device.zoneId}`
    if (device.fieldRowId) return `Filare: ${device.fieldRowId}`
    if (device.treeId) return `Albero: ${device.treeId}`
    if (device.plantId) return `Pianta: ${device.plantId}`

    return 'Scope non associato'
  }

  const getConfirmedValveLabel = (device: SmartDevice) => {
    if (device.lastConfirmedValveState === undefined) {
      return 'In attesa'
    }

    return device.lastConfirmedValveState ? 'APERTA' : 'CHIUSA'
  }

  const getConfirmedValveTone = (device: SmartDevice) => {
    if (device.lastConfirmedValveState === undefined) {
      return 'text-amber-600'
    }

    return device.lastConfirmedValveState ? 'text-emerald-600' : 'text-slate-500'
  }

  const formatTelemetryMetric = (value?: number, unit?: string) => {
    if (value === undefined || Number.isNaN(value)) {
      return '--'
    }

    return unit ? `${value.toFixed(1)} ${unit}` : value.toFixed(1)
  }

  const getCommandStatusLabel = (device: SmartDevice) => {
    switch (device.lastCommandStatus) {
      case 'pending':
        return 'In attesa'
      case 'confirmed':
        return 'Confermato'
      case 'timeout':
        return 'Timeout'
      case 'failed':
        return 'Fallito'
      default:
        return 'Idle'
    }
  }

  const getCommandStatusClasses = (device: SmartDevice) => {
    switch (device.lastCommandStatus) {
      case 'pending':
        return 'bg-amber-50 text-amber-700'
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700'
      case 'timeout':
      case 'failed':
        return 'bg-red-50 text-red-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const getIrrigationOutcomeLabel = (device: SmartDevice) => {
    switch (device.lastIrrigationOutcome) {
      case 'nominal':
        return 'Nominale'
      case 'warning':
        return 'Da verificare'
      case 'critical':
        return 'Critico'
      default:
        return 'In analisi'
    }
  }

  const getIrrigationOutcomeClasses = (device: SmartDevice) => {
    switch (device.lastIrrigationOutcome) {
      case 'nominal':
        return 'border-emerald-200 bg-emerald-50 text-emerald-800'
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-800'
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800'
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700'
    }
  }

  const getAutomationDecisionLabel = (device: SmartDevice) => {
    switch (device.lastAutomationDecision) {
      case 'open_now':
        return 'Apri ora'
      case 'close_now':
        return 'Chiudi ora'
      case 'manual_review':
        return 'Revisione manuale'
      case 'hold':
        return 'Hold'
      default:
        return 'Nessuna decisione'
    }
  }

  const getAutomationDecisionClasses = (device: SmartDevice) => {
    switch (device.lastAutomationDecision) {
      case 'open_now':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      case 'close_now':
        return 'border-amber-200 bg-amber-50 text-amber-800'
      case 'manual_review':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'hold':
        return 'border-slate-200 bg-slate-50 text-slate-700'
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700'
    }
  }

  const hasTelemetryAuditIssue = (device: SmartDevice) =>
    device.metadata?.auditIncomplete === true || device.metadata?.auditStatus === 'incomplete'

  const getTelemetryAuditRetryCount = (device: SmartDevice) => {
    const rawValue = device.metadata?.auditRetryCount
    if (typeof rawValue === 'number') {
      return rawValue
    }

    if (typeof rawValue === 'string') {
      const numericValue = Number(rawValue)
      return Number.isNaN(numericValue) ? undefined : numericValue
    }

    return undefined
  }

  const getAutomationTriggerLabel = (device: SmartDevice) => {
    switch (device.lastAutomationTrigger) {
      case 'water_stress':
        return 'Stress idrico'
      case 'heat_support':
        return 'Supporto termico'
      case 'fungal_block':
        return 'Blocco fungino'
      case 'target_reached':
        return 'Target raggiunto'
      case 'telemetry_block':
        return 'Blocco telemetria'
      case 'awaiting_data':
        return 'Dati mancanti'
      case 'stability_hold':
        return 'Stabilita'
      default:
        return 'Automazione'
    }
  }

  const getAutomationLogLabel = (log: SmartDeviceAutomationLog) => {
    switch (log.eventType) {
      case 'decision':
        return 'Decisione'
      case 'command_sent':
        return 'Comando inviato'
      case 'command_result':
        return 'Esito comando'
      case 'telemetry':
        return 'Telemetria'
      case 'outcome':
        return 'Outcome'
      default:
        return 'Evento'
    }
  }

  const getAutomationLogTone = (log: SmartDeviceAutomationLog) => {
    switch (log.eventType) {
      case 'decision':
        return 'bg-violet-50 text-violet-700'
      case 'command_sent':
        return 'bg-blue-50 text-blue-700'
      case 'command_result':
        return log.commandStatus === 'failed' || log.commandStatus === 'timeout'
          ? 'bg-red-50 text-red-700'
          : 'bg-emerald-50 text-emerald-700'
      case 'outcome':
        return log.irrigationOutcome === 'critical'
          ? 'bg-red-50 text-red-700'
          : log.irrigationOutcome === 'warning'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-emerald-50 text-emerald-700'
      default:
        return 'bg-slate-50 text-slate-700'
    }
  }

  const getAutomationLogSummary = (log: SmartDeviceAutomationLog) => {
    if (log.reason) {
      return log.reason
    }

    if (log.eventType === 'command_sent') {
      return log.commandedValveState ? 'Richiesta apertura inviata.' : 'Richiesta chiusura inviata.'
    }

    if (log.eventType === 'command_result') {
      return `Esito comando: ${log.commandStatus ?? 'n/d'}.`
    }

    if (log.eventType === 'outcome') {
      return `Outcome ciclo: ${log.irrigationOutcome ?? 'n/d'}.`
    }

    return 'Evento registrato.'
  }

  const getRecommendationClasses = (
    severity: NonNullable<SmartDeviceAutomationAnalytics['recommendations']>[number]['severity']
  ) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'medium':
        return 'border-amber-200 bg-amber-50 text-amber-800'
      default:
        return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    }
  }

  const getScopeActionClasses = (
    priority: NonNullable<SmartDeviceAutomationAnalytics['scopeActions']>[number]['priority']
  ) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'high':
        return 'border-amber-200 bg-amber-50 text-amber-800'
      case 'medium':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      default:
        return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    }
  }

  const getIrrigationDiagnostics = (device: SmartDevice) => {
    const diagnostics: string[] = []
    const effectiveFlow = device.flowRateActualLpm ?? 0
    const effectivePressure = device.linePressureBar ?? 0
    const moistureDelta = device.lastIrrigationDeltaMoisture ?? 0
    const targetReached = device.targetLiters > 0 && device.sessionLiters >= device.targetLiters

    if (device.lastConfirmedValveState && effectivePressure > 0 && effectivePressure < 0.8) {
      diagnostics.push('Pressione bassa: rischio distribuzione non uniforme')
    }

    if (device.lastConfirmedValveState && effectiveFlow <= 0.1) {
      diagnostics.push('Portata assente: verificare valvola, filtro o linea')
    }

    if (!device.lastConfirmedValveState && targetReached && moistureDelta < 3) {
      diagnostics.push('Umidita poco reattiva dopo irrigazione: possibile infiltrazione non efficace')
    }

    if (!device.lastConfirmedValveState && device.targetLiters > 0 && device.sessionLiters < device.targetLiters * 0.8) {
      diagnostics.push('Volume erogato inferiore al target impostato')
    }

    if (diagnostics.length === 0) {
      diagnostics.push('Ciclo irriguo coerente con i dati disponibili')
    }

    return diagnostics
  }

  const getScopeDiagnosticsStatusLabel = (diagnostics: IrrigationScopeDiagnostics) => {
    switch (diagnostics.status) {
      case 'critical':
        return 'Priorita alta'
      case 'warning':
        return 'Da verificare'
      default:
        return 'Nominale'
    }
  }

  const getScopeDiagnosticsStatusClasses = (diagnostics: IrrigationScopeDiagnostics) => {
    switch (diagnostics.status) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-800'
      default:
        return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    }
  }

  const getRiskTone = (riskLevel: IrrigationScopeDiagnostics['waterStress']) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-emerald-100 text-emerald-700'
    }
  }

  const onlineDevicesCount = gardenDevices.filter(device => device.isOnline).length
  const thingsBoardDevicesCount = gardenDevices.filter(device => device.provider === 'thingsboard').length
  const boundDevicesCount = gardenDevices.filter(device => hasAgronomicScope(device)).length
  const orphanDevicesCount = gardenDevices.length - boundDevicesCount
  const selectedScopeHistory =
    automationAnalytics.scopeHistory.find(scope => scope.scopeKey === selectedHistoryScopeKey) ??
    automationAnalytics.scopeHistory[0]
  const bestBenchmarkScope = automationAnalytics.benchmark.bestScope
  const benchmarkTopGaps = automationAnalytics.benchmark.topGaps
  const selectedScopeGap =
    selectedScopeHistory && bestBenchmarkScope
      ? benchmarkTopGaps.find(scope => scope.scopeKey === selectedScopeHistory.scopeKey)
      : undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Smart Hub Integrato</h1>
              <p className="text-gray-600">
                Controllo unificato IoT e droni per {garden.name}
              </p>
            </div>
          </div>

          {/* Integration Badge */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  🤖 Hub Intelligente Unificato
                </h3>
                <p className="text-sm text-blue-800">
                  Sensori IoT • Irrigazione automatica • Drone scaffold •
                  Computer vision • AI analysis • Controllo centralizzato
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Device registrati</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{gardenDevices.length}</p>
              <p className="mt-1 text-sm text-slate-600">Registry locale attivo per {garden.name}</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Binding agronomico</p>
              <p className="mt-2 text-2xl font-bold text-violet-900">{boundDevicesCount}</p>
              <p className="mt-1 text-sm text-violet-800">Device legati a zona, filare, albero o pianta</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Online adesso</p>
              <p className="mt-2 text-2xl font-bold text-emerald-900">{onlineDevicesCount}</p>
              <p className="mt-1 text-sm text-emerald-800">Stato letto dall'ultimo aggiornamento locale</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">ThingsBoard</p>
              <p className="mt-2 text-2xl font-bold text-blue-900">{thingsBoardDevicesCount}</p>
              <p className="mt-1 text-sm text-blue-800">Device pronti per binding telemetria e comandi</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('iot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'iot'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Wifi size={16} />
              Dispositivi IoT
            </button>
            <button
              onClick={() => setActiveTab('drones')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'drones'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Drone size={16} />
              Operazioni Drone
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'iot' && (
          <div className="space-y-6">
            {gardenDevices.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                  <Wifi size={48} className="text-gray-400"/>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-700 mb-2">Nessun Dispositivo IoT</h2>
                <p className="text-gray-500 mb-4">Collega sensori e valvole per il controllo automatico</p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <button
                    onClick={() => setShowDeviceWizard(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Associa Dispositivo
                  </button>
                  <button
                    onClick={handleAddDemoDevices}
                    disabled={addingDemoDevices}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {addingDemoDevices ? <Loader2 size={20} className="animate-spin" /> : <Bot size={20} />}
                    Modalità Demo
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100">
                  <p className="font-bold mb-1">💡 Dispositivi Supportati</p>
                  <p>Sensori umidità • Valvole irrigazione • Stazioni meteo • Sensori pH/EC • binding ThingsBoard</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Add Device Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Dispositivi IoT Associati</h2>
                  <button
                    onClick={() => setShowDeviceWizard(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Associa Dispositivo
                  </button>
                </div>

                {orphanDevicesCount > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Scope agronomico incompleto</p>
                    <p className="mt-1">
                      {orphanDevicesCount} device legacy non hanno ancora zona, filare, albero o pianta. Su questi device l’automazione rigorosa resta bloccata finché non vengono collegati a uno scope reale.
                    </p>
                  </div>
                )}

                {automationAnalytics.summary.totalEvents > 0 && (
                  <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Affidabilita automazione irrigua</h3>
                          <p className="text-xs text-slate-500">Misura se le regole automatiche stanno eseguendo bene.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {automationAnalytics.summary.totalEvents} eventi
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                          <p className="text-[10px] font-bold uppercase text-blue-500">Comandi auto</p>
                          <p className="mt-1 text-2xl font-bold text-blue-900">{automationAnalytics.summary.automatedCommands}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                          <p className="text-[10px] font-bold uppercase text-emerald-500">Outcome nominali</p>
                          <p className="mt-1 text-2xl font-bold text-emerald-900">
                            {automationAnalytics.summary.nominalOutcomeRate !== undefined
                              ? `${automationAnalytics.summary.nominalOutcomeRate.toFixed(0)}%`
                              : '--'}
                          </p>
                        </div>
                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                          <p className="text-[10px] font-bold uppercase text-amber-500">Timeout</p>
                          <p className="mt-1 text-2xl font-bold text-amber-900">{automationAnalytics.summary.commandTimeouts}</p>
                        </div>
                        <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
                          <p className="text-[10px] font-bold uppercase text-violet-500">Ack medio</p>
                          <p className="mt-1 text-2xl font-bold text-violet-900">
                            {automationAnalytics.summary.averageAckMs !== undefined
                              ? `${Math.round(automationAnalytics.summary.averageAckMs)} ms`
                              : '--'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Hotspot scope</h3>
                          <p className="text-xs text-slate-500">Zone o filari dove la risposta irrigua e peggiore.</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {automationAnalytics.hotspots.length === 0 ? (
                          <p className="text-sm text-slate-500">Nessun hotspot critico rilevato nello storico corrente.</p>
                        ) : (
                          automationAnalytics.hotspots.map(hotspot => (
                            <div key={hotspot.deviceId} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">{hotspot.deviceName}</p>
                                <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700">
                                  score {hotspot.severityScore}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{hotspot.scopeLabel}</p>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                                <span>timeout {hotspot.commandTimeouts}</span>
                                <span>warning {hotspot.warningOutcomes}</span>
                                <span>critical {hotspot.criticalOutcomes}</span>
                                {hotspot.averageAckMs !== undefined && <span>ack {Math.round(hotspot.averageAckMs)} ms</span>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {automationAnalytics.recommendations.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Suggerimenti sulle regole</h3>
                        <p className="text-xs text-slate-500">Correzioni consigliate in base a timeout, outcome e risposta del suolo.</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {automationAnalytics.recommendations.map(recommendation => (
                        <div
                          key={recommendation.id}
                          className={`rounded-xl border p-3 text-sm ${getRecommendationClasses(recommendation.severity)}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold">{recommendation.title}</p>
                            <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold">
                              {recommendation.severity}
                            </span>
                          </div>
                          {recommendation.scopeLabel && (
                            <p className="mt-2 text-[11px] uppercase tracking-wide opacity-70">
                              {recommendation.scopeLabel}
                            </p>
                          )}
                          <p className="mt-2 text-xs leading-5">
                            {recommendation.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(automationAnalytics.benchmark.bestScope || benchmarkTopGaps.length > 0) && (
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Benchmark operativo</h3>
                          <p className="text-xs text-slate-500">Lo scope migliore diventa il riferimento per tarare le altre regole.</p>
                        </div>
                      </div>
                      {automationAnalytics.benchmark.bestScope ? (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Scope benchmark</p>
                              <p className="mt-1 text-lg font-bold text-emerald-950">
                                {automationAnalytics.benchmark.bestScope.scopeLabel}
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700">
                              score {automationAnalytics.benchmark.bestScope.severityScore}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-emerald-800">
                            <span className="rounded-full bg-white px-2 py-1">
                              successo {automationAnalytics.benchmark.bestScope.nominalOutcomeRate?.toFixed(0) ?? '--'}%
                            </span>
                            <span className="rounded-full bg-white px-2 py-1">
                              delta medio {automationAnalytics.benchmark.bestScope.averageMoistureDelta?.toFixed(1) ?? '--'}%
                            </span>
                            <span className="rounded-full bg-white px-2 py-1">
                              target {automationAnalytics.benchmark.bestScope.totalTargetLiters.toFixed(1)} L
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-slate-500">Non ci sono ancora abbastanza outcome per definire uno scope benchmark.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Scope da recuperare</h3>
                          <p className="text-xs text-slate-500">Quelli che oggi si discostano di piu dal benchmark.</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {benchmarkTopGaps.length === 0 ? (
                          <p className="text-sm text-slate-500">Nessun gap materiale rispetto allo scope benchmark.</p>
                        ) : (
                          benchmarkTopGaps.map(scopeGap => (
                            <div key={scopeGap.scopeKey} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">{scopeGap.scopeLabel}</p>
                                <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700">
                                  gap {scopeGap.severityGap}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                                {scopeGap.nominalOutcomeGap !== undefined && (
                                  <span>successo -{scopeGap.nominalOutcomeGap.toFixed(0)} pp</span>
                                )}
                                {scopeGap.moistureDeltaGap !== undefined && (
                                  <span>delta suolo -{scopeGap.moistureDeltaGap.toFixed(1)}%</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {automationAnalytics.scopeActions.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Azioni consigliate per scope</h3>
                        <p className="text-xs text-slate-500">Priorita operative generate da benchmark, outcome e feedback del suolo.</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {automationAnalytics.scopeActions.map(actionItem => (
                        <div
                          key={actionItem.id}
                          className={`rounded-xl border p-3 text-sm ${getScopeActionClasses(actionItem.priority)}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold">{actionItem.title}</p>
                            <div className="flex items-center gap-2 text-[11px] font-semibold">
                              <span className="rounded-full bg-white/80 px-2 py-1">
                                {actionItem.priority}
                              </span>
                              <span className="rounded-full bg-white/80 px-2 py-1 uppercase">
                                {actionItem.category}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-[11px] uppercase tracking-wide opacity-70">
                            {actionItem.scopeLabel}
                          </p>
                          <p className="mt-2 text-xs leading-5">
                            {actionItem.action}
                          </p>
                          {actionItem.changes && actionItem.deviceIds.length > 0 && (
                            <button
                              onClick={async () => {
                                try {
                                  setApplyingScopeActionId(actionItem.id)
                                  await onApplyScopeAction(actionItem)
                                } finally {
                                  setApplyingScopeActionId(currentId =>
                                    currentId === actionItem.id ? null : currentId
                                  )
                                }
                              }}
                              disabled={applyingScopeActionId !== null}
                              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {applyingScopeActionId === actionItem.id && (
                                <Loader2 size={12} className="animate-spin" />
                              )}
                              Applica correzione
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {automationAnalytics.appliedScopeActions.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Correzioni applicate</h3>
                        <p className="text-xs text-slate-500">Storico recente con confronto prima/dopo e possibilità di rollback.</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {automationAnalytics.appliedScopeActions.map(appliedAction => (
                        <div key={appliedAction.executionId} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-900">{appliedAction.title}</p>
                                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getScopeActionClasses(appliedAction.priority)}`}>
                                  {appliedAction.priority}
                                </span>
                                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">
                                  {appliedAction.category}
                                </span>
                                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                                  appliedAction.rolledBack
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {appliedAction.rolledBack ? 'Rollback eseguito' : 'Attiva'}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{appliedAction.scopeLabel}</p>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {new Date(appliedAction.appliedAt).toLocaleString('it-IT')}
                              </p>
                            </div>
                            {!appliedAction.rolledBack && (
                              <button
                                onClick={async () => {
                                  try {
                                    setRollingBackScopeActionId(appliedAction.executionId)
                                    await onRollbackScopeAction(appliedAction)
                                  } finally {
                                    setRollingBackScopeActionId(currentId =>
                                      currentId === appliedAction.executionId ? null : currentId
                                    )
                                  }
                                }}
                                disabled={rollingBackScopeActionId !== null || applyingScopeActionId !== null}
                                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {rollingBackScopeActionId === appliedAction.executionId && (
                                  <Loader2 size={12} className="animate-spin" />
                                )}
                                Ripristina
                              </button>
                            )}
                          </div>
                          <div className="mt-3 grid gap-2 lg:grid-cols-2">
                            {appliedAction.deviceChanges.map(deviceChange => (
                              <div key={deviceChange.deviceId} className="rounded-lg bg-white p-3 text-xs text-slate-700">
                                <p className="font-semibold text-slate-900">{deviceChange.deviceName}</p>
                                <div className="mt-2 space-y-1">
                                  {(deviceChange.beforeTargetLiters !== undefined || deviceChange.afterTargetLiters !== undefined) && (
                                    <p>
                                      target: {deviceChange.beforeTargetLiters ?? '--'} L {'->'} {deviceChange.afterTargetLiters ?? '--'} L
                                    </p>
                                  )}
                                  {(deviceChange.beforeAutoThreshold !== undefined || deviceChange.afterAutoThreshold !== undefined) && (
                                    <p>
                                      soglia: {deviceChange.beforeAutoThreshold ?? '--'}% {'->'} {deviceChange.afterAutoThreshold ?? '--'}%
                                    </p>
                                  )}
                                  {(deviceChange.beforeAutoMode !== undefined || deviceChange.afterAutoMode !== undefined) && (
                                    <p>
                                      auto: {deviceChange.beforeAutoMode ? 'on' : 'off'} {'->'} {deviceChange.afterAutoMode ? 'on' : 'off'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScopeHistory && (
                  <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Scope storici</h3>
                          <p className="text-xs text-slate-500">Ultimi 7 giorni per zona o filare.</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {automationAnalytics.scopeHistory.map(scope => (
                          <button
                            key={scope.scopeKey}
                            onClick={() => setSelectedHistoryScopeKey(scope.scopeKey)}
                            className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                              scope.scopeKey === selectedScopeHistory.scopeKey
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">{scope.scopeLabel}</p>
                              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                                score {scope.severityScore}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              {scope.nominalOutcomeRate !== undefined && <span>successo {scope.nominalOutcomeRate.toFixed(0)}%</span>}
                              {scope.averageMoistureDelta !== undefined && <span>delta medio {scope.averageMoistureDelta.toFixed(1)}%</span>}
                              <span>target {scope.totalTargetLiters.toFixed(1)} L</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Trend storico per {selectedScopeHistory.scopeLabel}</h3>
                          <p className="text-xs text-slate-500">Confronto tra regole, volume target e outcome negli ultimi 7 giorni.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {selectedScopeGap && (
                            <span className="rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                              gap benchmark {selectedScopeGap.severityGap}
                            </span>
                          )}
                          <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                            successo {selectedScopeHistory.nominalOutcomeRate?.toFixed(0) ?? '--'}%
                          </span>
                          <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                            target {selectedScopeHistory.totalTargetLiters.toFixed(1)} L
                          </span>
                          <span className="rounded-full bg-violet-50 px-2 py-1 font-semibold text-violet-700">
                            delta medio {selectedScopeHistory.averageMoistureDelta?.toFixed(1) ?? '--'}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Regole e outcome
                          </p>
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={selectedScopeHistory.points}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="automatedCommands" name="Comandi auto" stroke="#2563eb" strokeWidth={2} />
                                <Line type="monotone" dataKey="nominalOutcomes" name="Nominali" stroke="#059669" strokeWidth={2} />
                                <Line type="monotone" dataKey="warningOutcomes" name="Warning" stroke="#d97706" strokeWidth={2} />
                                <Line type="monotone" dataKey="criticalOutcomes" name="Critici" stroke="#dc2626" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Volume target e risposta del suolo
                          </p>
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={selectedScopeHistory.points}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalTargetLiters" name="Target L" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="averageMoistureDelta" name="Delta umidita %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {gardenDevices.map(device => (
                  <div key={device.id} className={`bg-white rounded-2xl border transition-all shadow-sm ${device.isValveOpen ? 'border-blue-300 shadow-blue-100' : 'border-gray-200'}`}>
                    {/* Device Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.isValveOpen ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                          <Droplets size={20}/>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{device.name}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                              device.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Activity size={10} className={device.isOnline ? 'text-emerald-500' : 'text-gray-400'} />
                              {device.isOnline ? 'Online' : 'Offline'}
                            </span>
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                              {providerLabel(device.provider)}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                              {categoryLabel(device.deviceCategory)}
                            </span>
                            <span className={`rounded-full px-2 py-1 ${
                              hasAgronomicScope(device)
                                ? 'bg-violet-50 text-violet-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {scopeLabel(device)}
                            </span>
                            {hasTelemetryAuditIssue(device) && (
                              <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                                Audit telemetria incompleto
                              </span>
                            )}
                          </div>
                          {device.lastTelemetryAt && (
                            <p className="mt-1 text-[11px] text-gray-400">
                              Ultima telemetria: {new Date(device.lastTelemetryAt).toLocaleString('it-IT')}
                            </p>
                          )}
                          {hasTelemetryAuditIssue(device) && (
                            <p className="mt-1 text-[11px] text-amber-700">
                              Ultimo audit telemetrico non salvato completamente
                              {device.metadata?.auditFailureAt && ` (${new Date(String(device.metadata.auditFailureAt)).toLocaleString('it-IT')})`}
                              {getTelemetryAuditRetryCount(device) !== undefined && ` • retry ${getTelemetryAuditRetryCount(device)}`}
                            </p>
                          )}
                          {sensorQualityReadings[device.id] && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                              {sensorQualityReadings[device.id]?.data_quality_score !== undefined && (
                                <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                                  Qualita {Math.round(sensorQualityReadings[device.id]!.data_quality_score! * 100)}%
                                </span>
                              )}
                              {sensorQualityReadings[device.id]?.calibration_status && (
                                <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                  {sensorQualityReadings[device.id]?.calibration_status}
                                </span>
                              )}
                              {sensorQualityReadings[device.id]?.provider && (
                                <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                                  {sensorQualityReadings[device.id]?.provider}
                                </span>
                              )}
                            </div>
                          )}
                          {device.lastCommandStatus && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getCommandStatusClasses(device)}`}>
                                Comando: {getCommandStatusLabel(device)}
                              </span>
                              {device.lastCommandLatencyMs !== undefined && (
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                  Ack {Math.round(device.lastCommandLatencyMs)} ms
                                </span>
                              )}
                              {hasTelemetryAuditIssue(device) && (
                                <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                  Audit da riallineare
                                </span>
                              )}
                              {automationAnalytics.perDevice[device.id]?.nominalOutcomeRate !== undefined && (
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                  Successo {automationAnalytics.perDevice[device.id].nominalOutcomeRate?.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setEditingId(editingId === device.id ? null : device.id)}
                        className={`p-2 rounded-lg transition-colors ${editingId === device.id ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50'}`}
                      >
                        <Settings size={20}/>
                      </button>
                    </div>

                    {/* Dashboard Body */}
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-col md:flex-row items-center justify-between gap-6">
                        {/* Moisture Gauge */}
                        <div className="flex flex-col items-center">
                          <CircularProgress 
                            value={device.moisture} 
                            color={device.moisture < 30 ? '#ef4444' : device.moisture < 60 ? '#eab308' : '#3b82f6'} 
                          />
                          <button 
                            onClick={() => handleAnalyze(device)}
                            disabled={analyzingId === device.id}
                            className="mt-4 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full flex items-center gap-3 hover:bg-purple-100 transition-colors"
                          >
                            {analyzingId === device.id ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                            AI ANALISI
                          </button>
                        </div>

                        {/* Controls & Stats */}
                        <div className="flex-1 w-full space-y-4">
                          {/* Valve Control */}
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Comando Valvola</p>
                              <p className={`font-bold text-lg ${device.isValveOpen ? 'text-blue-600' : 'text-gray-400'}`}>
                                {device.isValveOpen ? 'APERTA' : 'CHIUSA'}
                              </p>
                              <p className={`mt-1 text-xs font-semibold ${getConfirmedValveTone(device)}`}>
                                Conferma: {getConfirmedValveLabel(device)}
                              </p>
                              {device.lastConfirmedValveAt && (
                                <p className="mt-1 text-[11px] text-gray-400">
                                  Ultima conferma: {new Date(device.lastConfirmedValveAt).toLocaleString('it-IT')}
                                </p>
                              )}
                            </div>
                            <button 
                              onClick={() => onToggleValve(device.id, !device.isValveOpen)}
                              disabled={device.lastCommandStatus === 'pending'}
                              className={`w-14 h-8 rounded-full transition-colors relative ${device.isValveOpen ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                              <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-sm ${device.isValveOpen ? 'translate-x-6' : 'translate-x-0'}`}>
                                <Power size={14} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${device.isValveOpen ? 'text-blue-600' : 'text-gray-400'}`}/>
                              </div>
                            </button>
                          </div>

                          {/* Flow Meter */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                              <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Portata Reale</p>
                              <p className="text-lg md:text-xl font-mono font-bold text-blue-900 leading-none">
                                {formatTelemetryMetric(device.flowRateActualLpm, 'L/min')}
                              </p>
                            </div>
                            <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-100">
                              <p className="text-[10px] font-bold text-cyan-500 uppercase mb-1">Pressione Linea</p>
                              <p className="text-lg md:text-xl font-mono font-bold text-cyan-900 leading-none">
                                {formatTelemetryMetric(device.linePressureBar, 'bar')}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Sessione</p>
                              <p className="text-lg md:text-xl font-mono font-bold text-gray-700 leading-none">
                                {device.sessionLiters.toFixed(1)} <span className="text-xs font-sans">L</span>
                              </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Auto-Stop</p>
                              <p className="text-lg md:text-xl font-mono font-bold text-slate-700 leading-none">
                                {device.targetLiters > 0 ? device.targetLiters : '∞'} <span className="text-xs font-sans">L</span>
                              </p>
                            </div>
                          </div>
                          {sensorQualityReadings[device.id] && (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold">Qualita ultimo segnale sensore</span>
                                <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold">
                                  {sensorQualityReadings[device.id]?.sensor_type}
                                </span>
                              </div>
                              <div className="mt-2 grid gap-2 md:grid-cols-4">
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Qualita</p>
                                  <p className="font-semibold">
                                    {sensorQualityReadings[device.id]?.data_quality_score !== undefined
                                      ? `${Math.round(sensorQualityReadings[device.id]!.data_quality_score! * 100)}%`
                                      : '--'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Batteria</p>
                                  <p className="font-semibold">
                                    {sensorQualityReadings[device.id]?.battery_level_percentage !== undefined
                                      ? `${Math.round(sensorQualityReadings[device.id]!.battery_level_percentage!)}%`
                                      : '--'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Segnale</p>
                                  <p className="font-semibold">
                                    {sensorQualityReadings[device.id]?.signal_strength !== undefined
                                      ? `${Math.round(sensorQualityReadings[device.id]!.signal_strength!)}%`
                                      : '--'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Calibrazione</p>
                                  <p className="font-semibold">
                                    {sensorQualityReadings[device.id]?.calibration_status ?? '--'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className={`rounded-xl border px-3 py-3 text-sm ${getIrrigationOutcomeClasses(device)}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold">Diagnostica irrigua chiusa</span>
                              <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold">
                                {getIrrigationOutcomeLabel(device)}
                              </span>
                            </div>
                            <div className="mt-2 grid gap-2 md:grid-cols-3">
                              <div>
                                <p className="text-[10px] uppercase opacity-70">Volume vs target</p>
                                <p className="font-semibold">
                                  {device.targetLiters > 0
                                    ? `${device.sessionLiters.toFixed(1)} / ${device.targetLiters.toFixed(1)} L`
                                    : `${device.sessionLiters.toFixed(1)} L`}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase opacity-70">Delta umidita</p>
                                <p className="font-semibold">
                                  {device.lastIrrigationDeltaMoisture !== undefined
                                    ? `${device.lastIrrigationDeltaMoisture.toFixed(1)}%`
                                    : '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase opacity-70">Chiusura ciclo</p>
                                <p className="font-semibold">
                                  {device.lastIrrigationCompletedAt
                                    ? new Date(device.lastIrrigationCompletedAt).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'In corso'}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 space-y-1">
                              {getIrrigationDiagnostics(device).map(diagnostic => (
                                <p key={diagnostic} className="text-xs">
                                  {diagnostic}
                                </p>
                              ))}
                            </div>
                          </div>
                          {scopeDiagnostics[device.id] && (
                            <div className={`rounded-xl border px-3 py-3 text-sm ${getScopeDiagnosticsStatusClasses(scopeDiagnostics[device.id])}`}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold">Diagnostica agronomica per scope</span>
                                <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold">
                                  {getScopeDiagnosticsStatusLabel(scopeDiagnostics[device.id])}
                                </span>
                              </div>
                              <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Scope</p>
                                  <p className="font-semibold">{scopeDiagnostics[device.id].scopeLabel}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Risoluzione</p>
                                  <p className="font-semibold">{scopeDiagnostics[device.id].resolutionLabel}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Gap aria-rugiada</p>
                                  <p className="font-semibold">
                                    {scopeDiagnostics[device.id].snapshot.dewPointGapC !== undefined
                                      ? `${scopeDiagnostics[device.id].snapshot.dewPointGapC?.toFixed(1)} C`
                                      : '--'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Tensione suolo</p>
                                  <p className="font-semibold">
                                    {scopeDiagnostics[device.id].snapshot.soilTensionKpa !== undefined
                                      ? `${scopeDiagnostics[device.id].snapshot.soilTensionKpa?.toFixed(0)} kPa`
                                      : '--'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getRiskTone(scopeDiagnostics[device.id].waterStress)}`}>
                                  Stress idrico: {scopeDiagnostics[device.id].waterStress}
                                </span>
                                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getRiskTone(scopeDiagnostics[device.id].heatStress)}`}>
                                  Stress termico: {scopeDiagnostics[device.id].heatStress}
                                </span>
                                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getRiskTone(scopeDiagnostics[device.id].fungalPressure)}`}>
                                  Pressione fungina: {scopeDiagnostics[device.id].fungalPressure}
                                </span>
                              </div>
                              <div className="mt-3 space-y-1">
                                {scopeDiagnostics[device.id].supportingSignals.slice(0, 3).map(signal => (
                                  <p key={signal} className="text-xs">
                                    {signal}
                                  </p>
                                ))}
                              </div>
                              <p className="mt-3 text-xs font-medium">
                                {scopeDiagnostics[device.id].recommendation}
                              </p>
                            </div>
                          )}
                          {device.lastAutomationDecision && (
                            <div className={`rounded-xl border px-3 py-3 text-sm ${getAutomationDecisionClasses(device)}`}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold">Audit automazione irrigua</span>
                                <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold">
                                  {getAutomationDecisionLabel(device)}
                                </span>
                              </div>
                              <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Trigger</p>
                                  <p className="font-semibold">{getAutomationTriggerLabel(device)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Confidenza</p>
                                  <p className="font-semibold">{device.lastAutomationConfidence ?? '--'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Target dinamico</p>
                                  <p className="font-semibold">
                                    {device.lastAutomationTargetLiters !== undefined
                                      ? `${device.lastAutomationTargetLiters.toFixed(1)} L`
                                      : '--'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase opacity-70">Ultima valutazione</p>
                                  <p className="font-semibold">
                                    {device.lastAutomationEvaluatedAt
                                      ? new Date(device.lastAutomationEvaluatedAt).toLocaleTimeString('it-IT', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : '--'}
                                  </p>
                                </div>
                              </div>
                              {device.lastAutomationReason && (
                                <p className="mt-3 text-xs font-medium">
                                  {device.lastAutomationReason}
                                </p>
                              )}
                            </div>
                          )}
                          {(automationLogs[device.id]?.length ?? 0) > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold">Storico decisione-esecuzione-outcome</span>
                                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                                  {automationLogs[device.id].length} eventi
                                </span>
                              </div>
                              <div className="mt-3 space-y-2">
                                {automationLogs[device.id].slice(0, 4).map(log => (
                                  <div key={log.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getAutomationLogTone(log)}`}>
                                          {getAutomationLogLabel(log)}
                                        </span>
                                        {log.commandStatus && (
                                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                            {log.commandStatus}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-500">
                                        {new Date(log.eventAt).toLocaleTimeString('it-IT', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-700">
                                      {getAutomationLogSummary(log)}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                                      {log.targetLiters !== undefined && <span>target {log.targetLiters.toFixed(1)} L</span>}
                                      {log.sessionLiters !== undefined && <span>sessione {log.sessionLiters.toFixed(1)} L</span>}
                                      {log.moisture !== undefined && <span>umidita {log.moisture.toFixed(1)}%</span>}
                                      {log.irrigationDeltaMoisture !== undefined && <span>delta {log.irrigationDeltaMoisture.toFixed(1)}%</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {device.lastCommandError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                              {device.lastCommandError}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Advice Result */}
                      {aiAdvice[device.id] && (
                        <div className="mt-4 bg-purple-50 p-3 rounded-xl border border-purple-100 text-sm text-purple-900 animate-in fade-in">
                          <span className="font-bold flex items-center gap-3 mb-1"><Bot size={14}/> Consiglio AI:</span>
                          {aiAdvice[device.id]}
                        </div>
                      )}

                      {/* Action Buttons per alert IoT critici */}
                      {device.moisture < 40 && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-red-900 mb-1">Alert Sensore IoT</h4>
                              <p className="text-sm text-red-800">
                                Umidità critica: {device.moisture}%. {device.moisture < 20 ? 'Intervento urgente richiesto!' : 'Monitoraggio necessario.'}
                              </p>
                            </div>
                            <ActionButton
                              sourceType="iot"
                              sourceData={{
                                device: device,
                                moisture: device.moisture,
                                sessionLiters: device.sessionLiters,
                                targetLiters: device.targetLiters,
                                autoThreshold: device.autoThreshold,
                                isValveOpen: device.isValveOpen
                              }}
                              zoneId={device.id}
                              zoneName={device.name}
                              urgency={getUrgencyFromDevice(device)}
                              onActionSelected={handleActionSelected}
                              size="sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Settings Drawer */}
                    {editingId === device.id && (
                      <div className="bg-gray-50 p-5 border-t border-gray-100 animate-in slide-in-from-top-3">
                        <h4 className="font-bold text-gray-700 text-sm uppercase mb-4 flex items-center gap-3">
                          <Settings size={16}/> Configurazione Automazione
                        </h4>
                        
                        <div className="space-y-4">
                          {/* Auto Start Threshold */}
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-xs font-bold text-gray-500">Soglia Avvio Automatico</label>
                              <span className="text-xs font-bold text-blue-600">{device.autoThreshold}% Umidità</span>
                            </div>
                            <input 
                              type="range" min="0" max="80" step="5"
                              value={device.autoThreshold}
                              onChange={(e) => onUpdateDeviceSettings(device.id, { autoThreshold: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Auto Stop Target */}
                          <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block">Target Acqua (Auto-Stop)</label>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => onUpdateDeviceSettings(device.id, { targetLiters: Math.max(0, device.targetLiters - 1) })}
                                className="w-8 h-8 rounded bg-white border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                              >-</button>
                              <div className="flex-1 text-center font-mono font-bold text-gray-800 bg-white border border-gray-200 py-1.5 rounded">
                                {device.targetLiters} Litri
                              </div>
                              <button 
                                onClick={() => onUpdateDeviceSettings(device.id, { targetLiters: device.targetLiters + 1 })}
                                className="w-8 h-8 rounded bg-white border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                              >+</button>
                            </div>
                          </div>

                          {/* Auto Mode */}
                          <div className="pt-2 flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={device.autoMode}
                              disabled={!hasAgronomicScope(device)}
                              onChange={(e) => onUpdateDeviceSettings(device.id, { autoMode: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm font-bold text-gray-700">
                              Abilita Modalità Automatica
                              {!hasAgronomicScope(device) ? ' (richiede scope agronomico)' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'drones' && (
          <div className="space-y-6">
            {/* Drone Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Operazioni Drone</h2>
                <p className="text-gray-600">Pianificazione e risultati simulati tramite scaffold API interno</p>
              </div>
              <button
                onClick={createAutomaticFlight}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus size={16} />
                )}
                Genera Piano
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              Modulo in beta: i piani sono mantenuti nello scaffold interno e l'esecuzione produce risultati simulati. Non invia comandi a droni reali, non registra telemetria fisica e non sostituisce autorizzazioni o procedure di volo.
            </div>

            {droneError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                {droneError}
              </div>
            )}

            {/* Drone Sub-tabs */}
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
              {[
                { id: 'flights', label: 'Piani di Volo', icon: Calendar },
                { id: 'results', label: 'Risultati', icon: BarChart3 },
                { id: 'create', label: 'Crea Volo', icon: Plus }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDroneTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    droneTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drone Content */}
            {droneTab === 'flights' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento piani di volo...</p>
                  </div>
                ) : flightPlans.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Drone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun Volo Programmato</h3>
                    <p className="text-gray-600 mb-4">Genera il primo piano di volo nello scaffold interno</p>
                    <button
                      onClick={createAutomaticFlight}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Genera Piano
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {flightPlans.map((plan) => (
                      <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(plan.type)}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                              <p className="text-sm text-gray-600">
                                {getTypeName(plan.type)} • {plan.duration} min • {plan.altitude}m
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                              {getStatusIcon(plan.status)}
                              {plan.status}
                            </div>
                            {plan.status === 'PLANNED' && (
                              <button
                                onClick={() => executeFlightPlan(plan.id)}
                                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Play size={16} />
                                Simula
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <strong>Programmato:</strong> {new Date(plan.scheduledDate).toLocaleString('it-IT')}
                        </div>

                        {plan.results && (
                          <div className="mt-4 grid md:grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-600">{plan.results.analysis.healthMap.overallScore}%</div>
                              <div className="text-xs text-gray-600">Salute</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{plan.results.imagesCapture}</div>
                              <div className="text-xs text-gray-600">Immagini</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{plan.results.analysis.yieldEstimation.totalEstimatedYield.toFixed(1)} kg</div>
                              <div className="text-xs text-gray-600">Resa Stimata</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {droneTab === 'results' && (
              <div className="space-y-4">
                {flightPlans.filter(plan => plan.results).length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun Risultato</h3>
                    <p className="text-gray-600">Simula un piano per vedere i risultati dello scaffold</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {flightPlans.filter(plan => plan.results).map((plan) => (
                      <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Camera className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Analisi: {plan.name}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(plan.scheduledDate).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              {plan.results?.analysis.healthMap.overallScore}%
                            </div>
                            <div className="text-gray-600">Salute</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {plan.results?.imagesCapture}
                            </div>
                            <div className="text-gray-600">Immagini</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600 mb-2">
                              {plan.results?.analysis.yieldEstimation.totalEstimatedYield.toFixed(1)} kg
                            </div>
                            <div className="text-gray-600">Resa</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600 mb-2">
                              {plan.results?.batteryUsed}%
                            </div>
                            <div className="text-gray-600">Batteria</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {droneTab === 'create' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Crea Nuovo Volo</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={createAutomaticFlight}
                    disabled={creating}
                    className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Piano Automatico</h4>
                    <p className="text-sm text-gray-600">
                      Lo scaffold determina un tipo di piano e waypoints indicativi
                    </p>
                  </button>

                  <div className="p-6 border-2 border-gray-200 rounded-lg opacity-60">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Volo Personalizzato</h4>
                    <p className="text-sm text-gray-600">
                      Crea waypoints specifici (Prossimamente)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Intervention Wizard */}
      {wizardOpen && selectedAction && actionContext && (
        <InterventionWizard
          isOpen={wizardOpen}
          onClose={() => {
            setWizardOpen(false)
            setSelectedAction(null)
            setActionContext(null)
          }}
          actionType={selectedAction}
          context={actionContext}
          garden={garden}
          onInterventionCreated={handleInterventionCreated}
        />
      )}

      {/* Device Association Wizard */}
      {showDeviceWizard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Associa Nuovo Dispositivo</h3>
              <p className="text-sm text-gray-600 mt-1">Configura un nuovo dispositivo IoT per il tuo giardino</p>
            </div>
            
            <div className="p-6 space-y-4">
              {associationError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {associationError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select
                  value={deviceForm.provider}
                  onChange={(e) => setDeviceForm(prev => ({ ...prev, provider: e.target.value as DeviceAssociationForm['provider'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="thingsboard">ThingsBoard</option>
                  <option value="tuya">Tuya</option>
                  <option value="manual">Manuale / locale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Dispositivo</label>
                <select
                  value={deviceForm.deviceCategory}
                  onChange={(e) => setDeviceForm(prev => ({ ...prev, deviceCategory: e.target.value as DeviceAssociationForm['deviceCategory'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="moisture_sensor">Sensore Umidità</option>
                  <option value="irrigation_valve">Valvola Irrigazione</option>
                  <option value="weather_station">Stazione Meteo</option>
                  <option value="ph_sensor">Sensore pH</option>
                  <option value="ec_sensor">Sensore EC</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Dispositivo</label>
                <input
                  type="text"
                  placeholder="Es: Sensore Zona A"
                  value={deviceForm.name}
                  onChange={(e) => setDeviceForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device ID esterno</label>
                <input
                  type="text"
                  placeholder="Es: tb-vigna-01"
                  value={deviceForm.externalDeviceId}
                  onChange={(e) => setDeviceForm(prev => ({ ...prev, externalDeviceId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope agronomico</label>
                <select
                  value={deviceForm.scopeType}
                  onChange={(e) => setDeviceForm(prev => ({ ...prev, scopeType: e.target.value as DeviceAssociationForm['scopeType'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="zone">Zona</option>
                  <option value="field_row">Filare</option>
                  <option value="tree">Albero</option>
                  <option value="plant">Pianta</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sensor ID</label>
                  <input
                    type="text"
                    placeholder="soil-row-01"
                    value={deviceForm.sensorId}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, sensorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {scopeTypeLabel(deviceForm.scopeType)} ID
                  </label>
                  <input
                    type="text"
                    placeholder={
                      deviceForm.scopeType === 'zone'
                        ? 'zona-nord'
                        : deviceForm.scopeType === 'field_row'
                        ? 'filare-01'
                        : deviceForm.scopeType === 'tree'
                        ? 'tree-012'
                        : 'plant-045'
                    }
                    value={deviceForm.scopeId}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, scopeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metodo Connessione</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="connection"
                      value="cloud"
                      checked={deviceForm.connectionType === 'cloud'}
                      onChange={(e) => setDeviceForm(prev => ({ ...prev, connectionType: e.target.value as DeviceAssociationForm['connectionType'] }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Cloud API</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="connection"
                      value="wifi"
                      checked={deviceForm.connectionType === 'wifi'}
                      onChange={(e) => setDeviceForm(prev => ({ ...prev, connectionType: e.target.value as DeviceAssociationForm['connectionType'] }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">WiFi</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="connection"
                      value="bluetooth"
                      checked={deviceForm.connectionType === 'bluetooth'}
                      onChange={(e) => setDeviceForm(prev => ({ ...prev, connectionType: e.target.value as DeviceAssociationForm['connectionType'] }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Bluetooth</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="connection"
                      value="zigbee"
                      checked={deviceForm.connectionType === 'zigbee'}
                      onChange={(e) => setDeviceForm(prev => ({ ...prev, connectionType: e.target.value as DeviceAssociationForm['connectionType'] }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Zigbee</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="connection"
                      value="lora"
                      checked={deviceForm.connectionType === 'lora'}
                      onChange={(e) => setDeviceForm(prev => ({ ...prev, connectionType: e.target.value as DeviceAssociationForm['connectionType'] }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">LoRa</span>
                  </label>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Binding rigoroso:</strong> ogni device nuovo viene legato a uno scope agronomico preciso.
                  Questo evita sensori orfani e prepara correlazioni affidabili tra telemetria, operazioni e risultati.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={resetDeviceWizard}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleAssociateDevice}
                disabled={associatingDevice}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {associatingDevice ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Associando...
                  </>
                ) : (
                  'Associa Dispositivo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
