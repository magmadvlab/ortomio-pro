import { SmartDevice } from '@/types'

type DeviceScopeType = NonNullable<SmartDevice['scopeType']>

const SCOPE_TYPE_TO_FIELD: Record<
  DeviceScopeType,
  keyof Pick<SmartDevice, 'zoneId' | 'fieldRowId' | 'treeId' | 'plantId'>
> = {
  zone: 'zoneId',
  field_row: 'fieldRowId',
  tree: 'treeId',
  plant: 'plantId',
}

const SCOPE_FIELD_ENTRIES: Array<
  [DeviceScopeType, keyof Pick<SmartDevice, 'zoneId' | 'fieldRowId' | 'treeId' | 'plantId'>]
> = [
  ['zone', 'zoneId'],
  ['field_row', 'fieldRowId'],
  ['tree', 'treeId'],
  ['plant', 'plantId'],
]

const SCOPE_FIELDS = new Set<keyof SmartDevice>([
  'scopeType',
  'scopeId',
  'zoneId',
  'fieldRowId',
  'treeId',
  'plantId',
])

export const hasAgronomicScope = (device: Partial<SmartDevice>) =>
  Boolean(device.scopeType && device.scopeId) ||
  Boolean(device.zoneId || device.fieldRowId || device.treeId || device.plantId)

export const touchesAgronomicScope = (device: Partial<SmartDevice>) =>
  Object.keys(device).some(key => SCOPE_FIELDS.has(key as keyof SmartDevice))

export const normalizeSmartDeviceScope = <T extends Partial<SmartDevice>>(device: T): T => {
  const normalizedDevice = { ...device }

  for (const [scopeType, fieldName] of SCOPE_FIELD_ENTRIES) {
    const fieldValue = normalizedDevice[fieldName]
    if (typeof fieldValue === 'string' && fieldValue.trim()) {
      if (!normalizedDevice.scopeType) {
        normalizedDevice.scopeType = scopeType
      }
      if (!normalizedDevice.scopeId) {
        normalizedDevice.scopeId = fieldValue.trim()
      }
      break
    }
  }

  if (typeof normalizedDevice.scopeId === 'string') {
    normalizedDevice.scopeId = normalizedDevice.scopeId.trim()
  }

  if (normalizedDevice.scopeType && normalizedDevice.scopeId) {
    const targetField = SCOPE_TYPE_TO_FIELD[normalizedDevice.scopeType]
    normalizedDevice[targetField] = normalizedDevice.scopeId

    for (const [, fieldName] of SCOPE_FIELD_ENTRIES) {
      if (fieldName !== targetField) {
        normalizedDevice[fieldName] = undefined
      }
    }
  }

  return normalizedDevice
}

export const validateSmartDeviceScope = <T extends Partial<SmartDevice>>(
  device: T,
  options: { requireScope?: boolean } = {}
) => {
  const normalizedDevice = normalizeSmartDeviceScope(device)
  const { requireScope = false } = options

  const boundFieldEntries = SCOPE_FIELD_ENTRIES.filter(([, fieldName]) => {
    const value = normalizedDevice[fieldName]
    return typeof value === 'string' && value.trim().length > 0
  })

  if (boundFieldEntries.length > 1) {
    throw new Error('Ogni device deve essere legato a un solo scope agronomico')
  }

  if (normalizedDevice.scopeType && !normalizedDevice.scopeId) {
    throw new Error('Lo scope agronomico richiede un identificativo')
  }

  if (normalizedDevice.scopeId && !normalizedDevice.scopeType) {
    throw new Error('Lo scope agronomico richiede un tipo di binding')
  }

  if (normalizedDevice.scopeType && normalizedDevice.scopeId) {
    const expectedField = SCOPE_TYPE_TO_FIELD[normalizedDevice.scopeType]
    const expectedValue = normalizedDevice[expectedField]
    if (expectedValue && expectedValue !== normalizedDevice.scopeId) {
      throw new Error('Il binding agronomico del device non e coerente')
    }
  }

  if (requireScope && !hasAgronomicScope(normalizedDevice)) {
    throw new Error('Ogni nuovo device deve essere associato a zona, filare, albero o pianta')
  }

  return normalizedDevice
}
