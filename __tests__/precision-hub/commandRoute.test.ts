import test from 'node:test'
import assert from 'node:assert/strict'
import { createCommandPostHandler, type PersistedSmartCommand, type SmartCommandStore } from '@/app/api/iot/devices/command/commandHandler'

const createRequest = (body: unknown, key = 'command-key-0001') => new Request(
  'http://localhost/api/iot/devices/command',
  { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': key }, body: JSON.stringify(body) }
)

const createStore = (options?: { provider?: string; owned?: boolean }) => {
  const commands = new Map<string, PersistedSmartCommand>()
  const store: SmartCommandStore = {
    async findOwnedDevice(deviceId) {
      return options?.owned === false ? null : {
        id: deviceId, provider: options?.provider ?? 'thingsboard', externalDeviceId: 'tb-1', gardenId: 'garden-1', zoneId: 'zone-1',
      }
    },
    async findByIdempotency(deviceId, key) { return commands.get(`${deviceId}:${key}`) ?? null },
    async createRequested(input) {
      const command: PersistedSmartCommand = {
        id: `cmd-${commands.size + 1}`, status: 'requested', desiredValveState: input.desiredValveState, idempotencyKey: input.idempotencyKey,
      }
      commands.set(`${input.device.id}:${input.idempotencyKey}`, command)
      return command
    },
    async markSent(id) { for (const command of commands.values()) if (command.id === id) command.status = 'sent' },
    async markFailed(id) { for (const command of commands.values()) if (command.id === id) command.status = 'failed' },
  }
  return { store, commands }
}

const dependencies = (store: SmartCommandStore, dispatch: (payload: Record<string, unknown>) => Promise<void> = async () => {}) => ({
  isSupabaseAvailableFn: () => true,
  verifyTierFn: async () => ({ user: { id: 'user-1' } }) as const,
  commandStore: store,
  sendThingsboardAttributesFn: dispatch,
  nowFn: () => new Date('2026-07-17T10:00:00.000Z'),
})

test('command handler rejects missing fields and invalid idempotency keys', async () => {
  const { store } = createStore()
  const handler = createCommandPostHandler(dependencies(store))
  assert.equal((await handler(createRequest({ deviceId: 'device-1' }) as never)).status, 400)
  assert.equal((await handler(createRequest({ deviceId: 'device-1', desiredValveState: true }, 'short') as never)).status, 400)
})

test('command handler never simulates success without cloud persistence', async () => {
  const { store } = createStore()
  const handler = createCommandPostHandler({ ...dependencies(store), isSupabaseAvailableFn: () => false })
  const response = await handler(createRequest({ deviceId: 'device-1', desiredValveState: true }) as never)
  assert.equal(response.status, 503)
  assert.equal((await response.json()).error, 'cloud_persistence_unavailable')
})

test('ThingsBoard dispatch is persisted, accepted, but not acknowledged', async () => {
  const sent: Array<Record<string, unknown>> = []
  const { store } = createStore()
  const handler = createCommandPostHandler(dependencies(store, async payload => { sent.push(payload) }))
  const response = await handler(createRequest({ deviceId: 'device-1', desiredValveState: true }) as never)
  const payload = await response.json()
  assert.equal(response.status, 202)
  assert.equal(payload.status, 'sent')
  assert.equal(payload.acknowledged, false)
  assert.equal(sent.length, 1)
  assert.equal(sent[0]?.commandId, 'cmd-1')
})

test('duplicate idempotency key does not actuate twice', async () => {
  let dispatches = 0
  const { store } = createStore()
  const handler = createCommandPostHandler(dependencies(store, async () => { dispatches += 1 }))
  const body = { deviceId: 'device-1', desiredValveState: true }
  const first = await handler(createRequest(body, 'same-command-001') as never)
  const second = await handler(createRequest(body, 'same-command-001') as never)
  assert.equal(first.status, 202)
  assert.equal(second.status, 202)
  assert.equal((await second.json()).duplicate, true)
  assert.equal(dispatches, 1)
})

test('unsupported providers and foreign gardens are rejected before dispatch', async () => {
  let dispatches = 0
  const tuya = createStore({ provider: 'tuya' })
  const foreign = createStore({ owned: false })
  const dispatch = async () => { dispatches += 1 }
  assert.equal((await createCommandPostHandler(dependencies(tuya.store, dispatch))(
    createRequest({ deviceId: 'device-tuya', desiredValveState: false }) as never
  )).status, 501)
  assert.equal((await createCommandPostHandler(dependencies(foreign.store, dispatch))(
    createRequest({ deviceId: 'device-foreign', desiredValveState: true }) as never
  )).status, 404)
  assert.equal(dispatches, 0)
})
