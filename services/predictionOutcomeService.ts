export type PredictionOutcomeMetrics = {
  predictedValue: Record<string, unknown>
  absoluteError?: number
  percentageError?: number
  brierScore?: number
  calibrationScore: number
}

const round = (value: number) => Number(value.toFixed(4))

export const calculatePredictionOutcomeMetrics = (
  output: Record<string, any>,
  outcomeType: 'yield' | 'disease' | 'resource' | 'other',
  observedValue: Record<string, unknown>
): PredictionOutcomeMetrics => {
  if (outcomeType === 'yield') {
    const prediction = (output.yieldPredictions ?? []).find((item: any) =>
      !observedValue.predictionItemId || item.id === observedValue.predictionItemId
    )
    const observed = Number(observedValue.yieldKgPerSqm)
    const predicted = Number(prediction?.expectedYield)
    if (!Number.isFinite(observed) || !Number.isFinite(predicted) || observed < 0 || predicted <= 0) {
      throw new Error('invalid_yield_outcome')
    }
    const absoluteError = Math.abs(observed - predicted)
    const percentageError = absoluteError / predicted
    return {
      predictedValue: { predictionItemId: prediction.id, yieldKgPerSqm: predicted },
      absoluteError: round(absoluteError),
      percentageError: round(percentageError),
      calibrationScore: round(Math.max(0, 1 - percentageError)),
    }
  }
  if (outcomeType === 'disease') {
    const prediction = (output.diseasePredicitions ?? []).find((item: any) =>
      item.id === observedValue.predictionItemId
    )
    if (!prediction || typeof observedValue.occurred !== 'boolean') throw new Error('invalid_disease_outcome')
    const probability = Number(prediction.probability)
    const brierScore = (probability - (observedValue.occurred ? 1 : 0)) ** 2
    return {
      predictedValue: { predictionItemId: prediction.id, probability },
      brierScore: round(brierScore),
      calibrationScore: round(Math.max(0, 1 - brierScore)),
    }
  }
  if (outcomeType === 'resource') {
    const prediction = (output.resourceOptimizations ?? []).find((item: any) =>
      item.id === observedValue.predictionItemId
    )
    const observed = Number(observedValue.actualUsage)
    const predicted = Number(prediction?.optimizedUsage)
    if (!Number.isFinite(observed) || !Number.isFinite(predicted) || observed < 0 || predicted < 0) {
      throw new Error('invalid_resource_outcome')
    }
    const absoluteError = Math.abs(observed - predicted)
    const percentageError = absoluteError / Math.max(1, predicted)
    return {
      predictedValue: { predictionItemId: prediction.id, optimizedUsage: predicted },
      absoluteError: round(absoluteError), percentageError: round(percentageError),
      calibrationScore: round(Math.max(0, 1 - percentageError)),
    }
  }
  return { predictedValue: {}, calibrationScore: 0.5 }
}
