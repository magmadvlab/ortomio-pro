'use client'

import { useEffect, useRef, useState } from 'react'
import IntegratedSmartHub from '@/components/smart/IntegratedSmartHub'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { SmartDevice, SmartDeviceAutomationLog } from '@/types'
import {
  getLatestSensorReadingBySensorId,
  type SensorReading,
  type SensorType,
} from '@/services/sensorDataService'
import {
  buildIrrigationScopeDiagnostics,
  type IrrigationScopeDiagnostics,
} from '@/services/irrigationScopeDiagnosticsService'
import {
  evaluateScopeIrrigationAutomation,
  type ScopeIrrigationAutomationDecision,
} from '@/services/scopeIrrigationAutomationService'
import {
  buildSmartDeviceAutomationAnalytics,
  type SmartDeviceAutomationAnalytics,
  type SmartDeviceAutomationAppliedScopeAction,
  type SmartDeviceAutomationScopeAction,
} from '@/services/smartDeviceAutomationAnalyticsService'
import { hasAgronomicScope } from '@/utils/smartDeviceScope'

const getUserFacingStorageError = (error: unknown, fallbackMessage: string) =>
  error instanceof Error && error.message.trim().length > 0
    ? error.message
    : fallbackMessage

function groupAutomationLogsByDevice(
  logs: SmartDeviceAutomationLog[]
): Record<string, SmartDeviceAutomationLog[]> {
  return logs.reduce<Record<string, SmartDeviceAutomationLog[]>>((accumulator, log) => {
    if (!accumulator[log.deviceId]) {
      accumulator[log.deviceId] = []
    }

    accumulator[log.deviceId].push(log)
    accumulator[log.deviceId].sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())
    accumulator[log.deviceId] = accumulator[log.deviceId].slice(0, 8)
    return accumulator
  }, {})
}

const SENSOR_DEVICE_SENSOR_TYPES: Partial<Record<NonNullable<SmartDevice['deviceCategory']>, SensorType[]>> = {
  moisture_sensor: ['moisture', 'soil_moisture_10cm', 'soil_moisture_30cm', 'soil_moisture_60cm'],
  weather_station: ['temperature_air', 'humidity_air', 'rain_gauge_local', 'wind'],
  ph_sensor: ['ph', 'water_ph'],
  ec_sensor: ['ec'],
  irrigation_valve: ['flow_rate_actual', 'line_pressure'],
}

async function loadLatestSensorQualityByDevice(
  gardenId: string,
  devices: SmartDevice[]
): Promise<Record<string, SensorReading>> {
  const sensorQualityEntries = await Promise.all(
    devices.map(async (device) => {
      const sensorTypes = device.deviceCategory
        ? SENSOR_DEVICE_SENSOR_TYPES[device.deviceCategory] ?? []
        : []

      if (!device.sensorId || sensorTypes.length === 0) {
        return null
      }

      const readings = await Promise.all(
        sensorTypes.map(sensorType =>
          getLatestSensorReadingBySensorId(gardenId, sensorType, device.sensorId as string, 48)
        )
      )

      const latestReading = readings
        .filter((reading): reading is SensorReading => Boolean(reading))
        .sort((left, right) => new Date(right.reading_date).getTime() - new Date(left.reading_date).getTime())[0]

      return latestReading ? ([device.id, latestReading] as const) : null
    })
  )

  return sensorQualityEntries.reduce<Record<string, SensorReading>>((accumulator, entry) => {
    if (entry) {
      accumulator[entry[0]] = entry[1]
    }
    return accumulator
  }, {})
}

export default function SmartHubPage() {
  const { activeGarden } = useGarden()
  const { storageProvider } = useStorage()
  const [devices, setDevices] = useState<SmartDevice[]>([])
  const [scopeDiagnostics, setScopeDiagnostics] = useState<Record<string, IrrigationScopeDiagnostics>>({})
  const [automationAnalytics, setAutomationAnalytics] = useState<SmartDeviceAutomationAnalytics>(
    buildSmartDeviceAutomationAnalytics([], [])
  )
  const [automationLogs, setAutomationLogs] = useState<Record<string, SmartDeviceAutomationLog[]>>({})
  const [sensorQualityReadings, setSensorQualityReadings] = useState<Record<string, SensorReading>>({})
  const [deviceError, setDeviceError] = useState<string | null>(null)
  const pendingCommandTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const automationLogFeedRef = useRef<SmartDeviceAutomationLog[]>([])
  const handleToggleValveRef = useRef<(
    id: string,
    isOpen: boolean,
    automationDecision?: ScopeIrrigationAutomationDecision
  ) => Promise<void>>(async () => {})
  const persistAutomationLogRef = useRef<(
    log: Omit<SmartDeviceAutomationLog, 'id' | 'createdAt'>
  ) => Promise<void>>(async () => {})
  const automationLocks = useRef<Record<string, string>>({})
  const hasCloudDevices = devices.some(device =>
    device.provider === 'thingsboard' || device.provider === 'tuya'
  )

  useEffect(() => {
    const commandTimeouts = pendingCommandTimeouts.current

    return () => {
      Object.values(commandTimeouts).forEach(timeoutId => clearTimeout(timeoutId))
    }
  }, [])

  useEffect(() => {
    if (!activeGarden) {
      setDevices([])
      setScopeDiagnostics({})
      setAutomationAnalytics(buildSmartDeviceAutomationAnalytics([], []))
      automationLogFeedRef.current = []
      setAutomationLogs({})
      automationLocks.current = {}
      return
    }

    const loadDevices = async () => {
      try {
        const savedDevices = await storageProvider.getDevices(activeGarden.id)
        setDevices(savedDevices)
        setDeviceError(null)
      } catch (error) {
        console.error('Errore nel caricamento dispositivi:', error)
        setDeviceError(getUserFacingStorageError(error, 'Impossibile caricare i dispositivi IoT associati'))
        setDevices([])
      }
    }

    loadDevices()
  }, [activeGarden, storageProvider])

  useEffect(() => {
    if (!activeGarden || !storageProvider.getSmartDeviceAutomationLogs) {
      setAutomationAnalytics(buildSmartDeviceAutomationAnalytics(devices, []))
      automationLogFeedRef.current = []
      setAutomationLogs({})
      return
    }

    void (async () => {
      try {
        const logs = await storageProvider.getSmartDeviceAutomationLogs?.(activeGarden.id)
        const nextLogs = logs ?? []
        automationLogFeedRef.current = nextLogs
        setAutomationAnalytics(buildSmartDeviceAutomationAnalytics(devices, nextLogs))
        setAutomationLogs(groupAutomationLogsByDevice(nextLogs))
      } catch (error) {
        console.error('Errore caricamento storico automazione smart device:', error)
        setAutomationAnalytics(buildSmartDeviceAutomationAnalytics(devices, []))
        automationLogFeedRef.current = []
        setAutomationLogs({})
      }
    })()
  }, [activeGarden, devices, storageProvider])

  const appendAutomationLogToState = (log: SmartDeviceAutomationLog) => {
    const nextLogs = [...automationLogFeedRef.current, log]
      .sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())
      .slice(0, 300)

    automationLogFeedRef.current = nextLogs
    setAutomationAnalytics(buildSmartDeviceAutomationAnalytics(devices, nextLogs))
    setAutomationLogs(groupAutomationLogsByDevice(nextLogs))
  }

  const persistAutomationLog = async (
    log: Omit<SmartDeviceAutomationLog, 'id' | 'createdAt'>
  ) => {
    if (!storageProvider.createSmartDeviceAutomationLog) {
      return
    }

    try {
      const createdLog = await storageProvider.createSmartDeviceAutomationLog(log)
      appendAutomationLogToState(createdLog)
    } catch (error) {
      console.error('Errore salvataggio storico automazione smart device:', error)
      setDeviceError(
        getUserFacingStorageError(error, 'Impossibile salvare il log di automazione del dispositivo')
      )
    }
  }

  persistAutomationLogRef.current = persistAutomationLog

  useEffect(() => {
    if (!activeGarden || devices.length === 0) {
      setScopeDiagnostics({})
      setSensorQualityReadings({})
      return
    }

    let isCancelled = false

    void (async () => {
      const [nextDiagnostics, nextSensorQualityReadings] = await Promise.allSettled([
        buildIrrigationScopeDiagnostics(activeGarden, devices),
        loadLatestSensorQualityByDevice(activeGarden.id, devices),
      ])

      if (isCancelled) {
        return
      }

      if (nextDiagnostics.status === 'fulfilled') {
        setScopeDiagnostics(nextDiagnostics.value)
      } else {
        console.error('Errore diagnostica irrigua per scope:', nextDiagnostics.reason)
        setScopeDiagnostics({})
      }

      if (nextSensorQualityReadings.status === 'fulfilled') {
        setSensorQualityReadings(nextSensorQualityReadings.value)
      } else {
        console.error('Errore caricamento qualità sensori smart hub:', nextSensorQualityReadings.reason)
        setSensorQualityReadings({})
        setDeviceError(currentError =>
          currentError ??
          'Qualita sensori temporaneamente non disponibile: la diagnostica irrigua resta visibile, ma i metadati ultimo segnale non sono stati caricati.'
        )
      }

      if (nextDiagnostics.status === 'fulfilled' && nextSensorQualityReadings.status === 'fulfilled') {
        setDeviceError(currentError =>
          currentError ===
          'Qualita sensori temporaneamente non disponibile: la diagnostica irrigua resta visibile, ma i metadati ultimo segnale non sono stati caricati.'
            ? null
            : currentError
        )
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [activeGarden, devices])

  useEffect(() => {
    if (!activeGarden || devices.length === 0) {
      automationLocks.current = {}
      return
    }

    const scopedValves = devices.filter(device =>
      device.gardenId === activeGarden.id &&
      device.deviceCategory === 'irrigation_valve' &&
      device.autoMode &&
      hasAgronomicScope(device)
    )

    if (scopedValves.length === 0) {
      return
    }

    const hasDecisionChanged = (
      device: SmartDevice,
      decision: ScopeIrrigationAutomationDecision
    ) =>
      device.lastAutomationDecision !== decision.action ||
      device.lastAutomationTrigger !== decision.trigger ||
      device.lastAutomationReason !== decision.reason ||
      device.lastAutomationConfidence !== decision.confidence ||
      (device.lastAutomationTargetLiters ?? undefined) !==
        (decision.recommendedTargetLiters ?? undefined)

    void (async () => {
      for (const device of scopedValves) {
        const decision = evaluateScopeIrrigationAutomation(device, scopeDiagnostics[device.id])
        const decisionKey = [
          decision.action,
          decision.trigger,
          decision.confidence,
          decision.recommendedTargetLiters ?? '',
          decision.reason,
        ].join('|')

        const shouldOpen = decision.action === 'open_now' && !device.isValveOpen
        const shouldClose = decision.action === 'close_now' && device.isValveOpen
        const shouldDispatch = (shouldOpen || shouldClose) && device.lastCommandStatus !== 'pending'

        if (shouldDispatch) {
          if (automationLocks.current[device.id] === decisionKey) {
            continue
          }

          automationLocks.current[device.id] = decisionKey
          await handleToggleValveRef.current(device.id, shouldOpen, decision)
          continue
        }

        if (
          !shouldDispatch &&
          (decision.action === 'hold' ||
            decision.action === 'manual_review' ||
            (decision.action === 'open_now' && device.isValveOpen) ||
            (decision.action === 'close_now' && !device.isValveOpen))
        ) {
          delete automationLocks.current[device.id]
        }

        if (!hasDecisionChanged(device, decision)) {
          continue
        }

        try {
          const updatedDevice = await storageProvider.updateDevice(device.id, {
            lastAutomationEvaluatedAt: new Date().toISOString(),
            lastAutomationDecision: decision.action,
            lastAutomationTrigger: decision.trigger,
            lastAutomationReason: decision.reason,
            lastAutomationConfidence: decision.confidence,
            lastAutomationTargetLiters: decision.recommendedTargetLiters,
          })

          setDevices(prev =>
            prev.map(currentDevice => currentDevice.id === device.id ? updatedDevice : currentDevice)
          )
          await persistAutomationLogRef.current({
            gardenId: device.gardenId,
            deviceId: device.id,
            provider: device.provider,
            eventType: 'decision',
            source: 'automation',
            eventAt: new Date().toISOString(),
            scopeType: device.scopeType,
            scopeId: device.scopeId,
            zoneId: device.zoneId,
            fieldRowId: device.fieldRowId,
            treeId: device.treeId,
            plantId: device.plantId,
            decision: decision.action,
            trigger: decision.trigger,
            confidence: decision.confidence,
            reason: decision.reason,
            targetLiters: decision.recommendedTargetLiters,
            sessionLiters: device.sessionLiters,
            moisture: device.moisture,
            irrigationDeltaMoisture: device.lastIrrigationDeltaMoisture,
            irrigationOutcome: device.lastIrrigationOutcome,
            flowRateActualLpm: device.flowRateActualLpm,
            linePressureBar: device.linePressureBar,
            metadata: {
              autoMode: device.autoMode,
            },
          })
        } catch (error) {
          console.error('Errore salvataggio audit automazione irrigua:', error)
        }
      }
    })().catch(error => {
      console.error('Errore esecuzione automazione irrigua scope-aware:', error)
    })
  }, [activeGarden, devices, scopeDiagnostics, storageProvider])

  useEffect(() => {
    if (!activeGarden) {
      return
    }

    if (!hasCloudDevices) {
      return
    }

    const intervalId = setInterval(() => {
      void (async () => {
        try {
          const refreshedDevices = await storageProvider.getDevices(activeGarden.id)
          setDevices(refreshedDevices)
          if (storageProvider.getSmartDeviceAutomationLogs) {
            const logs = await storageProvider.getSmartDeviceAutomationLogs(activeGarden.id)
            automationLogFeedRef.current = logs
            setAutomationAnalytics(buildSmartDeviceAutomationAnalytics(refreshedDevices, logs))
            setAutomationLogs(groupAutomationLogsByDevice(logs))
          }
        } catch (error) {
          console.error('Errore refresh device cloud:', error)
        }
      })()
    }, 8000)

    return () => {
      clearInterval(intervalId)
    }
  }, [activeGarden, hasCloudDevices, storageProvider])

  const handleToggleValve = async (
    id: string,
    isOpen: boolean,
    automationDecision?: ScopeIrrigationAutomationDecision
  ) => {
    try {
      const currentDevice = devices.find(device => device.id === id)
      if (!currentDevice) return
      const now = new Date().toISOString()
      const commandStartedAt = Date.now()
      const idempotencyKey = crypto.randomUUID()

      if (pendingCommandTimeouts.current[id]) {
        clearTimeout(pendingCommandTimeouts.current[id])
        delete pendingCommandTimeouts.current[id]
      }

      const updatedDevice = await storageProvider.updateDevice(id, {
        // Lo stato osservato cambia solo quando arriva un acknowledgement telemetrico.
        isValveOpen: currentDevice.isValveOpen,
        isOnline: currentDevice.isOnline,
        lastTelemetryAt: currentDevice.lastTelemetryAt,
        lastCommandAt: now,
        lastCommandStatus: 'pending',
        lastCommandedValveState: isOpen,
        lastCommandError: undefined,
        lastCommandLatencyMs: undefined,
        lastConfirmedValveState: currentDevice.lastConfirmedValveState,
        lastConfirmedValveAt: currentDevice.lastConfirmedValveAt,
        lastIrrigationStartedAt: currentDevice.lastIrrigationStartedAt,
        lastIrrigationCompletedAt: currentDevice.lastIrrigationCompletedAt,
        lastIrrigationBaselineMoisture: isOpen ? currentDevice.moisture : currentDevice.lastIrrigationBaselineMoisture,
        lastIrrigationDeltaMoisture: isOpen ? 0 : currentDevice.lastIrrigationDeltaMoisture,
        lastIrrigationOutcome: isOpen ? undefined : currentDevice.lastIrrigationOutcome,
        lastAutomationEvaluatedAt: automationDecision ? now : currentDevice.lastAutomationEvaluatedAt,
        lastAutomationDecision: automationDecision?.action ?? currentDevice.lastAutomationDecision,
        lastAutomationTrigger: automationDecision?.trigger ?? currentDevice.lastAutomationTrigger,
        lastAutomationReason: automationDecision?.reason ?? currentDevice.lastAutomationReason,
        lastAutomationConfidence: automationDecision?.confidence ?? currentDevice.lastAutomationConfidence,
        lastAutomationTargetLiters:
          automationDecision?.recommendedTargetLiters ?? currentDevice.lastAutomationTargetLiters,
        flowRateActualLpm: currentDevice.flowRateActualLpm,
        linePressureBar: currentDevice.linePressureBar,
        targetLiters:
          isOpen && automationDecision?.recommendedTargetLiters
            ? automationDecision.recommendedTargetLiters
            : currentDevice.targetLiters,
        sessionLiters: isOpen && !currentDevice.lastConfirmedValveState ? 0 : currentDevice.sessionLiters,
      })

      setDevices(prev => prev.map(device => device.id === id ? updatedDevice : device))
      setDeviceError(null)
      await persistAutomationLogRef.current({
        gardenId: currentDevice.gardenId,
        deviceId: currentDevice.id,
        provider: currentDevice.provider,
        eventType: 'command_sent',
        source: automationDecision ? 'automation' : 'manual',
        eventAt: now,
        scopeType: currentDevice.scopeType,
        scopeId: currentDevice.scopeId,
        zoneId: currentDevice.zoneId,
        fieldRowId: currentDevice.fieldRowId,
        treeId: currentDevice.treeId,
        plantId: currentDevice.plantId,
        decision: automationDecision?.action ?? currentDevice.lastAutomationDecision,
        trigger: automationDecision?.trigger ?? currentDevice.lastAutomationTrigger,
        confidence: automationDecision?.confidence ?? currentDevice.lastAutomationConfidence,
        reason: automationDecision?.reason,
        commandStatus: 'pending',
        commandedValveState: isOpen,
        confirmedValveState: currentDevice.lastConfirmedValveState,
        targetLiters:
          automationDecision?.recommendedTargetLiters ?? currentDevice.targetLiters,
        sessionLiters: currentDevice.sessionLiters,
        moisture: currentDevice.moisture,
        irrigationDeltaMoisture: currentDevice.lastIrrigationDeltaMoisture,
        irrigationOutcome: currentDevice.lastIrrigationOutcome,
        flowRateActualLpm: currentDevice.flowRateActualLpm,
        linePressureBar: currentDevice.linePressureBar,
      })

      const finalizeCommand = async (
        finalStatus: NonNullable<SmartDevice['lastCommandStatus']>,
        updates: Partial<SmartDevice>
      ) => {
        try {
          const finalizedDevice = await storageProvider.updateDevice(id, {
            ...updates,
            lastCommandStatus: finalStatus,
          })

          setDevices(prev => prev.map(device => device.id === id ? finalizedDevice : device))
          setDeviceError(null)
          await persistAutomationLogRef.current({
            gardenId: finalizedDevice.gardenId,
            deviceId: finalizedDevice.id,
            provider: finalizedDevice.provider,
            eventType:
              finalizedDevice.lastIrrigationOutcome && !finalizedDevice.lastConfirmedValveState
                ? 'outcome'
                : 'command_result',
            source: automationDecision ? 'automation' : 'manual',
            eventAt: finalizedDevice.lastConfirmedValveAt ?? finalizedDevice.lastTelemetryAt ?? new Date().toISOString(),
            scopeType: finalizedDevice.scopeType,
            scopeId: finalizedDevice.scopeId,
            zoneId: finalizedDevice.zoneId,
            fieldRowId: finalizedDevice.fieldRowId,
            treeId: finalizedDevice.treeId,
            plantId: finalizedDevice.plantId,
            decision: automationDecision?.action ?? finalizedDevice.lastAutomationDecision,
            trigger: automationDecision?.trigger ?? finalizedDevice.lastAutomationTrigger,
            confidence: automationDecision?.confidence ?? finalizedDevice.lastAutomationConfidence,
            reason: automationDecision?.reason ?? finalizedDevice.lastAutomationReason,
            commandStatus: finalStatus,
            commandedValveState: finalizedDevice.lastCommandedValveState,
            confirmedValveState: finalizedDevice.lastConfirmedValveState,
            targetLiters: finalizedDevice.targetLiters,
            sessionLiters: finalizedDevice.sessionLiters,
            moisture: finalizedDevice.moisture,
            irrigationDeltaMoisture: finalizedDevice.lastIrrigationDeltaMoisture,
            irrigationOutcome: finalizedDevice.lastIrrigationOutcome,
            flowRateActualLpm: finalizedDevice.flowRateActualLpm,
            linePressureBar: finalizedDevice.linePressureBar,
            metadata: {
              latencyMs: finalizedDevice.lastCommandLatencyMs ?? 0,
            },
          })
        } catch (error) {
          console.error('Errore nel finalizzare il comando valvola:', error)
          setDeviceError('Comando inviato ma impossibile registrare l\'esito')
        } finally {
          if (pendingCommandTimeouts.current[id]) {
            clearTimeout(pendingCommandTimeouts.current[id])
            delete pendingCommandTimeouts.current[id]
          }
        }
      }

      const commandResponse = await fetch('/api/iot/devices/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          deviceId: currentDevice.id,
          desiredValveState: isOpen,
          idempotencyKey,
        }),
      })

      const commandResult = await commandResponse.json().catch(() => null)
      if (!commandResponse.ok) {
        await finalizeCommand('failed', {
          lastCommandError:
            typeof commandResult?.message === 'string'
              ? commandResult.message
              : 'Invio comando cloud non riuscito',
          lastCommandLatencyMs: Date.now() - commandStartedAt,
        })
        return
      }

      pendingCommandTimeouts.current[id] = setTimeout(() => {
        void finalizeCommand('timeout', {
          lastCommandError: 'Nessuna conferma telemetrica ricevuta dal dispositivo',
          lastCommandLatencyMs: Date.now() - commandStartedAt,
        })
      }, 15000)
        } catch (error) {
          console.error('Errore nel cambio stato valvola:', error)
      setDeviceError(getUserFacingStorageError(error, 'Impossibile aggiornare lo stato della valvola'))
    }
  }

  handleToggleValveRef.current = handleToggleValve

  const handleUpdateDeviceSettings = async (id: string, settings: Partial<SmartDevice>) => {
    try {
      const currentDevice = devices.find(device => device.id === id)
      if (!currentDevice) {
        return
      }

      if (settings.autoMode === true && !hasAgronomicScope(currentDevice)) {
        setDeviceError('La modalità automatica richiede prima uno scope agronomico valido sul device')
        return
      }

      const updatedDevice = await storageProvider.updateDevice(id, {
        ...settings,
        lastTelemetryAt: new Date().toISOString(),
      })

      setDevices(prev => prev.map(device => device.id === id ? updatedDevice : device))
      setDeviceError(null)
    } catch (error) {
      console.error('Errore aggiornamento impostazioni dispositivo:', error)
      setDeviceError(getUserFacingStorageError(error, 'Impossibile salvare le impostazioni del dispositivo'))
    }
  }

  const getScopeActionTrigger = (
    actionItem: SmartDeviceAutomationScopeAction
  ): NonNullable<SmartDevice['lastAutomationTrigger']> => {
    switch (actionItem.category) {
      case 'connectivity':
        return 'telemetry_block'
      case 'hydraulics':
        return 'stability_hold'
      case 'rules':
        return 'awaiting_data'
      case 'benchmark':
        return 'stability_hold'
      default:
        return 'awaiting_data'
    }
  }

  const handleApplyScopeAction = async (actionItem: SmartDeviceAutomationScopeAction) => {
    if (!activeGarden || !actionItem.changes || actionItem.deviceIds.length === 0) {
      return
    }

    try {
      const scopedDevices = devices.filter(device => actionItem.deviceIds.includes(device.id))
      if (scopedDevices.length === 0) {
        return
      }

      const now = new Date().toISOString()
      const scopeActionExecutionId = `${actionItem.id}:${Date.now()}`
      const trigger = getScopeActionTrigger(actionItem)
      const updatedDevices = await Promise.all(
        scopedDevices.map(async currentDevice => {
          const nextTargetLiters =
            actionItem.changes?.targetLitersAbsolute !== undefined
              ? Math.max(0, Math.round(actionItem.changes.targetLitersAbsolute))
              : actionItem.changes?.targetLitersDelta !== undefined
              ? Math.max(0, currentDevice.targetLiters + actionItem.changes.targetLitersDelta)
              : currentDevice.targetLiters
          const nextAutoThreshold =
            actionItem.changes?.autoThresholdAbsolute !== undefined
              ? Math.min(80, Math.max(0, Math.round(actionItem.changes.autoThresholdAbsolute)))
              : actionItem.changes?.autoThresholdDelta !== undefined
              ? Math.min(80, Math.max(0, currentDevice.autoThreshold + actionItem.changes.autoThresholdDelta))
              : currentDevice.autoThreshold
          const nextAutoMode = actionItem.changes?.autoMode ?? currentDevice.autoMode

          const updatedDevice = await storageProvider.updateDevice(currentDevice.id, {
            targetLiters: nextTargetLiters,
            autoThreshold: nextAutoThreshold,
            autoMode: nextAutoMode,
            lastTelemetryAt: now,
            lastAutomationEvaluatedAt: now,
            lastAutomationDecision:
              actionItem.changes?.autoMode === false
                ? 'manual_review'
                : currentDevice.lastAutomationDecision,
            lastAutomationTrigger: trigger,
            lastAutomationReason: `Azione applicata: ${actionItem.title}. ${actionItem.action}`,
            lastAutomationConfidence: 'high',
            lastAutomationTargetLiters: nextTargetLiters,
          })

          await persistAutomationLogRef.current({
            gardenId: currentDevice.gardenId,
            deviceId: currentDevice.id,
            provider: currentDevice.provider,
            eventType: 'decision',
            source: 'manual',
            eventAt: now,
            scopeType: currentDevice.scopeType,
            scopeId: currentDevice.scopeId,
            zoneId: currentDevice.zoneId,
            fieldRowId: currentDevice.fieldRowId,
            treeId: currentDevice.treeId,
            plantId: currentDevice.plantId,
            decision:
              actionItem.changes?.autoMode === false
                ? 'manual_review'
                : updatedDevice.lastAutomationDecision,
            trigger,
            confidence: 'high',
            reason: `Azione applicata: ${actionItem.title}. ${actionItem.action}`,
            commandStatus: updatedDevice.lastCommandStatus,
            commandedValveState: updatedDevice.lastCommandedValveState,
            confirmedValveState: updatedDevice.lastConfirmedValveState,
            targetLiters: updatedDevice.targetLiters,
            sessionLiters: updatedDevice.sessionLiters,
            moisture: updatedDevice.moisture,
            irrigationDeltaMoisture: updatedDevice.lastIrrigationDeltaMoisture,
            irrigationOutcome: updatedDevice.lastIrrigationOutcome,
            flowRateActualLpm: updatedDevice.flowRateActualLpm,
            linePressureBar: updatedDevice.linePressureBar,
            metadata: {
              scopeActionMode: 'apply',
              scopeActionId: actionItem.id,
              scopeActionExecutionId,
              scopeActionTitle: actionItem.title,
              scopeActionPriority: actionItem.priority,
              scopeActionCategory: actionItem.category,
              beforeTargetLiters: currentDevice.targetLiters,
              afterTargetLiters: updatedDevice.targetLiters,
              beforeAutoThreshold: currentDevice.autoThreshold,
              afterAutoThreshold: updatedDevice.autoThreshold,
              beforeAutoMode: currentDevice.autoMode,
              afterAutoMode: updatedDevice.autoMode,
              autoMode: updatedDevice.autoMode,
              autoThreshold: updatedDevice.autoThreshold,
            },
          })

          return updatedDevice
        })
      )

      setDevices(prev =>
        prev.map(device => updatedDevices.find(updatedDevice => updatedDevice.id === device.id) ?? device)
      )
      setDeviceError(null)
    } catch (error) {
      console.error('Errore applicazione azione scope-aware:', error)
      setDeviceError(
        getUserFacingStorageError(error, 'Impossibile applicare la correzione proposta sullo scope selezionato')
      )
    }
  }

  const handleRollbackScopeAction = async (
    appliedAction: SmartDeviceAutomationAppliedScopeAction
  ) => {
    if (!activeGarden || appliedAction.rolledBack || appliedAction.deviceChanges.length === 0) {
      return
    }

    try {
      const now = new Date().toISOString()
      const rollbackExecutionId = `rollback:${appliedAction.executionId}:${Date.now()}`
      const updatedDevices = await Promise.all(
        appliedAction.deviceChanges.map(async deviceChange => {
          const currentDevice = devices.find(device => device.id === deviceChange.deviceId)
          if (!currentDevice) {
            return null
          }

          const revertedTargetLiters = deviceChange.beforeTargetLiters ?? currentDevice.targetLiters
          const revertedAutoThreshold = deviceChange.beforeAutoThreshold ?? currentDevice.autoThreshold
          const revertedAutoMode = deviceChange.beforeAutoMode ?? currentDevice.autoMode

          const updatedDevice = await storageProvider.updateDevice(currentDevice.id, {
            targetLiters: revertedTargetLiters,
            autoThreshold: revertedAutoThreshold,
            autoMode: revertedAutoMode,
            lastTelemetryAt: now,
            lastAutomationEvaluatedAt: now,
            lastAutomationDecision: revertedAutoMode ? currentDevice.lastAutomationDecision : 'manual_review',
            lastAutomationTrigger: 'stability_hold',
            lastAutomationReason: `Rollback correzione: ${appliedAction.title}. Ripristinati i valori precedenti.`,
            lastAutomationConfidence: 'high',
            lastAutomationTargetLiters: revertedTargetLiters,
          })

          await persistAutomationLogRef.current({
            gardenId: currentDevice.gardenId,
            deviceId: currentDevice.id,
            provider: currentDevice.provider,
            eventType: 'decision',
            source: 'manual',
            eventAt: now,
            scopeType: currentDevice.scopeType,
            scopeId: currentDevice.scopeId,
            zoneId: currentDevice.zoneId,
            fieldRowId: currentDevice.fieldRowId,
            treeId: currentDevice.treeId,
            plantId: currentDevice.plantId,
            decision: revertedAutoMode ? updatedDevice.lastAutomationDecision : 'manual_review',
            trigger: 'stability_hold',
            confidence: 'high',
            reason: `Rollback correzione: ${appliedAction.title}. Ripristinati i valori precedenti.`,
            commandStatus: updatedDevice.lastCommandStatus,
            commandedValveState: updatedDevice.lastCommandedValveState,
            confirmedValveState: updatedDevice.lastConfirmedValveState,
            targetLiters: updatedDevice.targetLiters,
            sessionLiters: updatedDevice.sessionLiters,
            moisture: updatedDevice.moisture,
            irrigationDeltaMoisture: updatedDevice.lastIrrigationDeltaMoisture,
            irrigationOutcome: updatedDevice.lastIrrigationOutcome,
            flowRateActualLpm: updatedDevice.flowRateActualLpm,
            linePressureBar: updatedDevice.linePressureBar,
            metadata: {
              scopeActionMode: 'rollback',
              scopeActionExecutionId: rollbackExecutionId,
              scopeActionRollbackOfExecutionId: appliedAction.executionId,
              scopeActionTitle: appliedAction.title,
              scopeActionPriority: appliedAction.priority,
              scopeActionCategory: appliedAction.category,
              beforeTargetLiters: currentDevice.targetLiters,
              afterTargetLiters: updatedDevice.targetLiters,
              beforeAutoThreshold: currentDevice.autoThreshold,
              afterAutoThreshold: updatedDevice.autoThreshold,
              beforeAutoMode: currentDevice.autoMode,
              afterAutoMode: updatedDevice.autoMode,
            },
          })

          return updatedDevice
        })
      )

      setDevices(prev =>
        prev.map(device => updatedDevices.find(updatedDevice => updatedDevice?.id === device.id) ?? device)
      )
      setDeviceError(null)
    } catch (error) {
      console.error('Errore rollback azione scope-aware:', error)
      setDeviceError(
        getUserFacingStorageError(error, 'Impossibile ripristinare i valori precedenti per lo scope selezionato')
      )
    }
  }

  const handleAssociateDevice = async (
    devicePayload: Omit<SmartDevice, 'id' | 'lastUpdate' | 'gardenId'>
  ) => {
    if (!activeGarden) {
      throw new Error('Nessun giardino attivo selezionato')
    }

    const createdDevice = await storageProvider.createDevice({
      ...devicePayload,
      gardenId: activeGarden.id,
    })

    setDevices(prev => [createdDevice, ...prev])
    setDeviceError(null)
    return createdDevice
  }

  const handleAddDemoDevices = async () => {
    if (!activeGarden) {
      throw new Error('Nessun giardino attivo selezionato')
    }

    const existingExternalIds = new Set(devices.map(device => device.externalDeviceId))
    const demoTimestamp = new Date().toISOString()
    const demoDevices: Array<Omit<SmartDevice, 'id' | 'lastUpdate'>> = [
      {
        gardenId: activeGarden.id,
        name: `Sensore ThingsBoard ${activeGarden.name}`,
        type: 'Sensor',
        provider: 'thingsboard',
        deviceCategory: 'moisture_sensor',
        connectionType: 'cloud',
        externalDeviceId: `tb-moisture-${activeGarden.id}`,
        sensorId: `soil-${activeGarden.id}`,
        scopeType: 'field_row',
        scopeId: `field-row-demo-${activeGarden.id}`,
        fieldRowId: `field-row-demo-${activeGarden.id}`,
        isOnline: true,
        lastTelemetryAt: demoTimestamp,
        lastCommandStatus: 'confirmed',
        lastConfirmedValveState: false,
        lastConfirmedValveAt: demoTimestamp,
        lastCommandLatencyMs: 900,
        lastIrrigationBaselineMoisture: 43,
        lastIrrigationDeltaMoisture: 0,
        lastIrrigationOutcome: 'nominal',
        flowRateActualLpm: 0,
        linePressureBar: 0,
        metadata: {
          source: 'demo',
          telemetry: 'thingsboard',
          note: 'Device demo pronto per collegamento reale',
        },
        moisture: 43,
        isValveOpen: false,
        flowRateLpm: 0,
        sessionLiters: 0,
        targetLiters: 0,
        autoThreshold: 35,
        autoMode: true,
      },
      {
        gardenId: activeGarden.id,
        name: `Valvola Zona Principale ${activeGarden.name}`,
        type: 'Valve',
        provider: 'thingsboard',
        deviceCategory: 'irrigation_valve',
        connectionType: 'cloud',
        externalDeviceId: `tb-valve-${activeGarden.id}`,
        scopeType: 'zone',
        scopeId: `main-zone-${activeGarden.id}`,
        zoneId: `main-zone-${activeGarden.id}`,
        isOnline: true,
        lastTelemetryAt: demoTimestamp,
        lastCommandStatus: 'confirmed',
        lastCommandedValveState: false,
        lastConfirmedValveState: false,
        lastConfirmedValveAt: demoTimestamp,
        lastCommandLatencyMs: 820,
        lastIrrigationBaselineMoisture: 58,
        lastIrrigationDeltaMoisture: 0,
        lastIrrigationOutcome: 'nominal',
        flowRateActualLpm: 0,
        linePressureBar: 1.8,
        metadata: {
          source: 'demo',
          telemetry: 'thingsboard',
          action: 'manual-toggle',
        },
        moisture: 58,
        isValveOpen: false,
        flowRateLpm: 18,
        sessionLiters: 0,
        targetLiters: 25,
        autoThreshold: 30,
        autoMode: false,
      },
    ]

    const missingDevices = demoDevices.filter(
      device => !device.externalDeviceId || !existingExternalIds.has(device.externalDeviceId)
    )

    if (missingDevices.length === 0) {
      setDeviceError('I dispositivi demo sono gia presenti in questo giardino')
      return
    }

    const createdDevices = await Promise.all(
      missingDevices.map(device => storageProvider.createDevice(device))
    )

    setDevices(prev => [...createdDevices, ...prev])
    setDeviceError(null)
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
      {deviceError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {deviceError}
        </div>
      )}
      <IntegratedSmartHub 
        devices={devices}
        automationAnalytics={automationAnalytics}
        automationLogs={automationLogs}
        scopeDiagnostics={scopeDiagnostics}
        sensorQualityReadings={sensorQualityReadings}
        garden={activeGarden}
        onToggleValve={handleToggleValve}
        onUpdateDeviceSettings={handleUpdateDeviceSettings}
        onApplyScopeAction={handleApplyScopeAction}
        onRollbackScopeAction={handleRollbackScopeAction}
        onAssociateDevice={handleAssociateDevice}
        onAddDemoDevices={handleAddDemoDevices}
      />
    </div>
  )
}
