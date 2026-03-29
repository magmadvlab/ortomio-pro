import { getSupabaseClient, isSupabaseAvailable, verifyTier } from '@/lib/auth.server'
import { thingsboardService } from '@/services/thingsboardService'
import { createCommandPostHandler, type CommandRouteDependencies } from './commandHandler'

const getSupabaseClientFn: CommandRouteDependencies['getSupabaseClientFn'] = () =>
  getSupabaseClient() as unknown as Parameters<typeof createCommandPostHandler>[0]['getSupabaseClientFn'] extends () => infer T
    ? T
    : never

const verifyTierFn: CommandRouteDependencies['verifyTierFn'] = (request, requiredTiers) =>
  verifyTier(request, requiredTiers)

const sendThingsboardAttributesFn: CommandRouteDependencies['sendThingsboardAttributesFn'] = (payload) =>
  thingsboardService.sendAttributes(payload as Record<string, string | number | boolean | object>)

export const POST = createCommandPostHandler({
  isSupabaseAvailableFn: isSupabaseAvailable,
  verifyTierFn,
  getSupabaseClientFn,
  sendThingsboardAttributesFn,
})
