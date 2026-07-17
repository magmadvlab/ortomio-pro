export type RetryableCommand = {
  id: string
  deviceId: string
  externalDeviceId?: string | null
  idempotencyKey: string
  desiredValveState: boolean
  attempts: number
  maxAttempts: number
}

export type RetryDecision =
  | { action: 'retry'; nextAttempt: number }
  | { action: 'dead_letter'; nextAttempt: number }

export const decideCommandRetry = (command: RetryableCommand): RetryDecision => {
  const nextAttempt = command.attempts + 1
  return nextAttempt > command.maxAttempts
    ? { action: 'dead_letter', nextAttempt }
    : { action: 'retry', nextAttempt }
}

export const buildThingsboardRetryPayload = (command: RetryableCommand, issuedAt: string) => ({
  commandType: 'valve_toggle',
  commandId: command.id,
  idempotencyKey: command.idempotencyKey,
  targetDeviceId: command.externalDeviceId ?? command.deviceId,
  desiredValveState: command.desiredValveState,
  issuedAt,
  retryAttempt: command.attempts + 1,
})
