import { NextRequest, NextResponse } from 'next/server'

type VerifyTierResult =
  | {
      error: string
      status: number
    }
  | {
      user: {
        id: string
      }
    }

type SupabaseQueryResult<T> = Promise<{
  data: T | null
  error: {
    message?: string
  } | null
}>

type SmartDeviceCommandRow = {
  id: string
  provider?: string | null
  external_device_id?: string | null
  garden_id: string
}

type GardenOwnershipRow = {
  id: string
}

interface SupabaseCommandClient {
  from(table: 'smart_devices'): {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => SupabaseQueryResult<SmartDeviceCommandRow>
      }
    }
  }
  from(table: 'gardens'): {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        eq: (nestedColumn: string, nestedValue: string) => {
          maybeSingle: () => SupabaseQueryResult<GardenOwnershipRow>
        }
      }
    }
  }
}

export type CommandRouteDependencies = {
  isSupabaseAvailableFn: () => boolean
  verifyTierFn: (request: NextRequest, requiredTiers: string[]) => Promise<VerifyTierResult>
  getSupabaseClientFn: () => SupabaseCommandClient
  sendThingsboardAttributesFn: (payload: Record<string, unknown>) => Promise<void>
}

export const createCommandPostHandler = (
  dependencies: CommandRouteDependencies
) => async (request: NextRequest) => {
  const {
    isSupabaseAvailableFn,
    verifyTierFn,
    getSupabaseClientFn,
    sendThingsboardAttributesFn,
  } = dependencies

  try {
    const body = await request.json()
    const { deviceId, desiredValveState } = body ?? {}

    if (!deviceId || typeof desiredValveState !== 'boolean') {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'Servono deviceId e desiredValveState boolean' },
        { status: 400 }
      )
    }

    if (!isSupabaseAvailableFn()) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'Supabase non configurato, comando simulato localmente',
      })
    }

    const result = await verifyTierFn(request, ['FREE', 'PRO'])
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const supabase = getSupabaseClientFn()
    const { user } = result

    const { data: deviceRow, error: deviceError } = await supabase
      .from('smart_devices')
      .select('id, provider, external_device_id, garden_id')
      .eq('id', deviceId)
      .single()

    if (deviceError || !deviceRow) {
      return NextResponse.json({ error: 'device_not_found' }, { status: 404 })
    }

    const { data: ownedGarden, error: gardenError } = await supabase
      .from('gardens')
      .select('id')
      .eq('id', deviceRow.garden_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (gardenError || !ownedGarden) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const provider = deviceRow.provider ?? 'manual'

    if (provider === 'thingsboard') {
      await sendThingsboardAttributesFn({
        commandType: 'valve_toggle',
        targetDeviceId: deviceRow.external_device_id ?? deviceRow.id,
        desiredValveState,
        issuedAt: new Date().toISOString(),
      })
    } else if (provider === 'tuya') {
      return NextResponse.json(
        { error: 'provider_not_supported', message: 'Dispatch diretto Tuya non ancora implementato in questa route' },
        { status: 501 }
      )
    }

    return NextResponse.json({
      success: true,
      provider,
      queued: provider !== 'manual',
      message:
        provider === 'thingsboard'
          ? 'Comando inviato a ThingsBoard, in attesa conferma telemetrica'
          : 'Comando registrato sul device locale',
    })
  } catch (error) {
    console.error('Errore invio comando IoT:', error)
    return NextResponse.json(
      { error: 'command_dispatch_failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
