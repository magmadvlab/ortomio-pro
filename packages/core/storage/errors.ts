export class StoragePersistenceError extends Error {
  readonly operation: string
  readonly storageMode: 'cloud'
  readonly causeMessage?: string

  constructor(operation: string, message: string, cause?: unknown) {
    super(message)
    this.name = 'StoragePersistenceError'
    this.operation = operation
    this.storageMode = 'cloud'
    this.causeMessage = cause instanceof Error ? cause.message : undefined
  }
}

export class StorageReadError extends Error {
  readonly operation: string
  readonly storageMode: 'cloud'
  readonly causeMessage?: string

  constructor(operation: string, message: string, cause?: unknown) {
    super(message)
    this.name = 'StorageReadError'
    this.operation = operation
    this.storageMode = 'cloud'
    this.causeMessage = cause instanceof Error ? cause.message : undefined
  }
}

export const isStoragePersistenceError = (error: unknown): error is StoragePersistenceError =>
  error instanceof StoragePersistenceError

export const isStorageReadError = (error: unknown): error is StorageReadError =>
  error instanceof StorageReadError
