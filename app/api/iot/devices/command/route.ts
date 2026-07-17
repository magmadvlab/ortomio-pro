import { getSupabaseClient, isSupabaseAvailable, verifyTier } from '@/lib/auth.server'
import { thingsboardService } from '@/services/thingsboardService'
import {
  createCommandPostHandler,
  type SmartCommandStore,
  type SmartDeviceCommandTarget,
} from './commandHandler'

const getClient = () => getSupabaseClient() as any

const commandStore: SmartCommandStore = {
  async findOwnedDevice(deviceId, userId) {
    const supabase = getClient()
    const { data: device, error } = await supabase
      .from('smart_devices')
      .select('id, provider, external_device_id, garden_id, organization_id, zone_id')
      .eq('id', deviceId)
      .single()
    if (error || !device) return null

    const { data: garden } = await supabase
      .from('gardens')
      .select('id')
      .eq('id', device.garden_id)
      .eq('user_id', userId)
      .maybeSingle()
    if (!garden) return null

    if (device.organization_id) {
      const [{ data: assignment }, { data: organization }, { data: membership }] = await Promise.all([
        supabase.from('garden_assignments').select('id').eq('organization_id', device.organization_id).eq('garden_id', device.garden_id).limit(1).maybeSingle(),
        supabase.from('organizations').select('id').eq('id', device.organization_id).eq('owner_id', userId).maybeSingle(),
        supabase.from('organization_members').select('id').eq('organization_id', device.organization_id).eq('user_id', userId).eq('status', 'Active').maybeSingle(),
      ])
      if (!assignment || (!organization && !membership)) return null
    }

    return {
      id: device.id,
      provider: device.provider ?? 'manual',
      externalDeviceId: device.external_device_id,
      gardenId: device.garden_id,
      organizationId: device.organization_id,
      zoneId: device.zone_id,
    } satisfies SmartDeviceCommandTarget
  },
  async findByIdempotency(deviceId, idempotencyKey) {
    const { data } = await getClient()
      .from('smart_device_commands')
      .select('id, status, desired_valve_state, idempotency_key')
      .eq('device_id', deviceId)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    return data ? {
      id: data.id,
      status: data.status,
      desiredValveState: data.desired_valve_state,
      idempotencyKey: data.idempotency_key,
    } : null
  },
  async createRequested(input) {
    const { data, error } = await getClient()
      .from('smart_device_commands')
      .insert({
        user_id: input.userId,
        garden_id: input.device.gardenId,
        organization_id: input.device.organizationId,
        zone_id: input.device.zoneId,
        device_id: input.device.id,
        provider: input.device.provider,
        desired_valve_state: input.desiredValveState,
        idempotency_key: input.idempotencyKey,
        status: 'requested',
        requested_at: input.requestedAt,
      })
      .select('id, status, desired_valve_state, idempotency_key')
      .single()
    if (error || !data) throw new Error(error?.message ?? 'command_persistence_failed')
    return {
      id: data.id,
      status: data.status,
      desiredValveState: data.desired_valve_state,
      idempotencyKey: data.idempotency_key,
    }
  },
  async markSent(commandId, sentAt, timeoutAt) {
    const { error } = await getClient().from('smart_device_commands').update({
      status: 'sent', sent_at: sentAt, timeout_at: timeoutAt, attempts: 1,
    }).eq('id', commandId)
    if (error) throw new Error(error.message)
  },
  async markFailed(commandId, failedAt, errorMessage) {
    const { error } = await getClient().from('smart_device_commands').update({
      status: 'failed', failed_at: failedAt, last_error: errorMessage, attempts: 1,
    }).eq('id', commandId)
    if (error) throw new Error(error.message)
  },
}

export const POST = createCommandPostHandler({
  isSupabaseAvailableFn: isSupabaseAvailable,
  verifyTierFn: (request, tiers) => verifyTier(request, tiers),
  commandStore,
  sendThingsboardAttributesFn: payload =>
    thingsboardService.sendAttributes(payload as Record<string, string | number | boolean | object>),
})
