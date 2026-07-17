import { NextRequest, NextResponse } from 'next/server'

type VerifyTierResult =
  | { error: string; status: number }
  | { user: { id: string } }

export type SmartDeviceCommandTarget = {
  id: string
  provider: string
  externalDeviceId?: string | null
  gardenId: string
  organizationId?: string | null
  zoneId?: string | null
}

export type PersistedSmartCommand = {
  id: string
  status: 'requested' | 'sent' | 'acknowledged' | 'failed' | 'timed_out' | 'dead_letter'
  desiredValveState: boolean
  idempotencyKey: string
}

export interface SmartCommandStore {
  findOwnedDevice(deviceId: string, userId: string): Promise<SmartDeviceCommandTarget | null>
  findByIdempotency(deviceId: string, idempotencyKey: string): Promise<PersistedSmartCommand | null>
  createRequested(input: {
    userId: string
    device: SmartDeviceCommandTarget
    desiredValveState: boolean
    idempotencyKey: string
    requestedAt: string
  }): Promise<PersistedSmartCommand>
  markSent(commandId: string, sentAt: string, timeoutAt: string): Promise<void>
  markFailed(commandId: string, failedAt: string, error: string): Promise<void>
}

export type CommandRouteDependencies = {
  isSupabaseAvailableFn: () => boolean
  verifyTierFn: (request: NextRequest, requiredTiers: string[]) => Promise<VerifyTierResult>
  commandStore: SmartCommandStore
  sendThingsboardAttributesFn: (payload: Record<string, unknown>) => Promise<void>
  nowFn?: () => Date
}

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/

export const createCommandPostHandler = (dependencies: CommandRouteDependencies) =>
  async (request: NextRequest) => {
    const now = dependencies.nowFn?.() ?? new Date()

    try {
      const body = await request.json()
      const { deviceId, desiredValveState } = body ?? {}
      const idempotencyKey = request.headers.get('idempotency-key') ?? body?.idempotencyKey

      if (!deviceId || typeof desiredValveState !== 'boolean') {
        return NextResponse.json(
          { error: 'missing_required_fields', message: 'Servono deviceId e desiredValveState boolean' },
          { status: 400 }
        )
      }
      if (typeof idempotencyKey !== 'string' || !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
        return NextResponse.json(
          { error: 'invalid_idempotency_key', message: 'Serve una chiave idempotente valida (8-128 caratteri)' },
          { status: 400 }
        )
      }
      if (!dependencies.isSupabaseAvailableFn()) {
        return NextResponse.json(
          { error: 'cloud_persistence_unavailable', message: 'Comando non inviato: persistenza cloud non disponibile' },
          { status: 503 }
        )
      }

      const result = await dependencies.verifyTierFn(request, ['FREE', 'PRO'])
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: result.status })
      }

      const device = await dependencies.commandStore.findOwnedDevice(deviceId, result.user.id)
      if (!device) {
        return NextResponse.json({ error: 'device_not_found_or_forbidden' }, { status: 404 })
      }
      if (device.provider !== 'thingsboard') {
        return NextResponse.json(
          { error: 'provider_not_supported', message: `Dispatch ${device.provider || 'manual'} non abilitato` },
          { status: 501 }
        )
      }

      const existing = await dependencies.commandStore.findByIdempotency(device.id, idempotencyKey)
      if (existing) {
        return NextResponse.json({
          accepted: true,
          duplicate: true,
          acknowledged: existing.status === 'acknowledged',
          commandId: existing.id,
          status: existing.status,
        }, { status: 202 })
      }

      const requestedAt = now.toISOString()
      const command = await dependencies.commandStore.createRequested({
        userId: result.user.id,
        device,
        desiredValveState,
        idempotencyKey,
        requestedAt,
      })

      try {
        await dependencies.sendThingsboardAttributesFn({
          commandType: 'valve_toggle',
          commandId: command.id,
          idempotencyKey,
          targetDeviceId: device.externalDeviceId ?? device.id,
          desiredValveState,
          issuedAt: requestedAt,
        })
        await dependencies.commandStore.markSent(
          command.id,
          requestedAt,
          new Date(now.getTime() + 15_000).toISOString()
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown dispatch error'
        await dependencies.commandStore.markFailed(command.id, requestedAt, message)
        return NextResponse.json(
          { error: 'command_dispatch_failed', commandId: command.id, status: 'failed', message },
          { status: 502 }
        )
      }

      return NextResponse.json({
        accepted: true,
        acknowledged: false,
        commandId: command.id,
        provider: device.provider,
        status: 'sent',
        message: 'Comando inviato; esito operativo in attesa della telemetria del dispositivo.',
      }, { status: 202 })
    } catch (error) {
      console.error('Errore invio comando IoT:', error)
      return NextResponse.json(
        { error: 'command_request_failed', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }
