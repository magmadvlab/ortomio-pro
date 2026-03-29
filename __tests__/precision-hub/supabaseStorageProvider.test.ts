import test from 'node:test'
import assert from 'node:assert/strict'

import { SupabaseStorageProvider } from '@/packages/storage-cloud/SupabaseStorageProvider'
import { StoragePersistenceError, StorageReadError } from '@/packages/core/storage/errors'

class MemoryStorage {
  private readonly store = new Map<string, string>()

  getItem(key: string) {
    return this.store.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.store.set(key, value)
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  clear() {
    this.store.clear()
  }
}

const createBaseDeviceInput = () => ({
  gardenId: 'garden-1',
  name: 'Valvola test',
  type: 'Valve' as const,
  provider: 'thingsboard' as const,
  deviceCategory: 'irrigation_valve' as const,
  connectionType: 'cloud' as const,
  scopeType: 'zone' as const,
  scopeId: 'zone-1',
  zoneId: 'zone-1',
  moisture: 42,
  isValveOpen: false,
  flowRateLpm: 12,
  sessionLiters: 0,
  targetLiters: 20,
  autoThreshold: 30,
  autoMode: false,
})

const createBaseDeviceRow = () => ({
  id: 'device-1',
  garden_id: 'garden-1',
  name: 'Valvola test',
  type: 'Valve',
  provider: 'thingsboard',
  device_category: 'irrigation_valve',
  connection_type: 'cloud',
  scope_type: 'zone',
  scope_id: 'zone-1',
  zone_id: 'zone-1',
  moisture: 42,
  is_valve_open: false,
  flow_rate_lpm: 12,
  session_liters: 0,
  target_liters: 20,
  auto_threshold: 30,
  auto_mode: false,
  created_at: '2026-03-20T10:00:00.000Z',
  updated_at: '2026-03-20T10:00:00.000Z',
})

const installLocalStorage = () => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
}

test.beforeEach(() => {
  installLocalStorage()
})

test('createDevice throws StoragePersistenceError and does not fallback to localStorage when cloud insert fails', async () => {
  const provider = new SupabaseStorageProvider() as SupabaseStorageProvider & { client: any }

  provider.client = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } }),
    },
    from: (table: string) => {
      assert.equal(table, 'smart_devices')
      return {
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'db down' } }),
          }),
        }),
      }
    },
  }

  await assert.rejects(
    provider.createDevice(createBaseDeviceInput()),
    (error: unknown) =>
      error instanceof StoragePersistenceError &&
      error.operation === 'createDevice' &&
      error.message.includes('non e stato salvato su Supabase')
  )

  assert.equal(globalThis.localStorage.getItem('ortoDevices'), null)
})

test('updateDevice throws StoragePersistenceError and does not fallback to localStorage when cloud update fails', async () => {
  const provider = new SupabaseStorageProvider() as SupabaseStorageProvider & { client: any }

  provider.client = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } }),
    },
    from: (table: string) => {
      assert.equal(table, 'smart_devices')
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: createBaseDeviceRow(), error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'write denied' } }),
            }),
          }),
        }),
      }
    },
  }

  await assert.rejects(
    provider.updateDevice('device-1', { autoMode: true }),
    (error: unknown) =>
      error instanceof StoragePersistenceError &&
      error.operation === 'updateDevice' &&
      error.message.includes('modifiche del device non sono state salvate')
  )

  assert.equal(globalThis.localStorage.getItem('ortoDevices'), null)
})

test('createSmartDeviceAutomationLog throws StoragePersistenceError and does not fallback to localStorage when cloud insert fails', async () => {
  const provider = new SupabaseStorageProvider() as SupabaseStorageProvider & { client: any }

  provider.client = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } }),
    },
    from: (table: string) => {
      assert.equal(table, 'smart_device_automation_logs')
      return {
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'audit table locked' } }),
          }),
        }),
      }
    },
  }

  await assert.rejects(
    provider.createSmartDeviceAutomationLog({
      gardenId: 'garden-1',
      deviceId: 'device-1',
      provider: 'thingsboard',
      eventType: 'decision',
      source: 'automation',
      eventAt: '2026-03-20T10:00:00.000Z',
      scopeType: 'zone',
      scopeId: 'zone-1',
      zoneId: 'zone-1',
      decision: 'hold',
      trigger: 'awaiting_data',
      confidence: 'medium',
      reason: 'Test log',
    }),
    (error: unknown) =>
      error instanceof StoragePersistenceError &&
      error.operation === 'createSmartDeviceAutomationLog' &&
      error.message.includes('log di automazione non e stato salvato')
  )

  assert.equal(globalThis.localStorage.getItem('ortoSmartDeviceAutomationLogs'), null)
})

test('getDevices throws StorageReadError and does not fallback to localStorage when cloud read fails', async () => {
  const provider = new SupabaseStorageProvider() as SupabaseStorageProvider & { client: any }
  globalThis.localStorage.setItem('ortoDevices', JSON.stringify([createBaseDeviceRow()]))

  provider.client = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } }),
    },
    from: (table: string) => {
      assert.equal(table, 'smart_devices')
      return {
        select: () => ({
          order: async () => ({ data: null, error: { message: 'read denied' } }),
        }),
      }
    },
  }

  await assert.rejects(
    provider.getDevices('garden-1'),
    (error: unknown) =>
      error instanceof StorageReadError &&
      error.operation === 'getDevices' &&
      error.message.includes('caricamento dei device smart')
  )
})

test('deleteDevice throws StoragePersistenceError and does not fallback to local deletion when cloud delete fails', async () => {
  const provider = new SupabaseStorageProvider() as SupabaseStorageProvider & { client: any }
  globalThis.localStorage.setItem('ortoDevices', JSON.stringify([createBaseDeviceRow()]))

  provider.client = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } }),
    },
    from: (table: string) => {
      assert.equal(table, 'smart_devices')
      return {
        delete: () => ({
          eq: async () => ({ error: { message: 'delete forbidden' } }),
        }),
      }
    },
  }

  await assert.rejects(
    provider.deleteDevice('device-1'),
    (error: unknown) =>
      error instanceof StoragePersistenceError &&
      error.operation === 'deleteDevice' &&
      error.message.includes('non e stato eliminato su Supabase')
  )

  assert.notEqual(globalThis.localStorage.getItem('ortoDevices'), null)
})
