export type ServiceError = {
  readonly _tag: 'ServiceError'
  readonly code: string
  readonly context: Record<string, unknown>
}

export function createServiceError(code: string, context: Record<string, unknown>): ServiceError {
  return { _tag: 'ServiceError', code, context }
}

export function isServiceError(value: unknown): value is ServiceError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as ServiceError)._tag === 'ServiceError'
  )
}

export function logServiceError(err: unknown, code: string, context: Record<string, unknown>): void {
  console.error(JSON.stringify(createServiceError(code, { ...context, error: String(err) })))
}
