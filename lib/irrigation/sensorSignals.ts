/** Only scoped, fresh, non-simulated measurements with known units are usable. */
export interface RecordedSensorSignal {
  sensor_type: string; value: unknown; unit: string; recorded_at: string;
  garden_id: string; irrigation_zone_id?: string | null; is_simulated?: boolean | null
}
const specifications: Record<string, { field: string; units: string[]; min: number; max: number }> = {
  soil_moisture_10cm: { field: 'soilMoisture10cm', units: ['%'], min: 0, max: 100 },
  soil_moisture_30cm: { field: 'soilMoisture30cm', units: ['%'], min: 0, max: 100 },
  soil_moisture_60cm: { field: 'soilMoisture60cm', units: ['%'], min: 0, max: 100 },
  soil_tension_kpa: { field: 'soilTensionKpa', units: ['kPa'], min: 0, max: 100000 },
  leaf_wetness: { field: 'leafWetness', units: ['%'], min: 0, max: 100 },
  dew_point: { field: 'dewPointCelsius', units: ['°C', 'C'], min: -100, max: 100 },
  vpd: { field: 'vpdKpa', units: ['kPa'], min: 0, max: 100 },
  canopy_temperature: { field: 'canopyTemperatureCelsius', units: ['°C', 'C'], min: -100, max: 100 },
  flow_rate_actual: { field: 'flowRateActual', units: ['L/h', 'l/h'], min: 0, max: 1e9 },
  line_pressure: { field: 'linePressure', units: ['bar'], min: 0, max: 1000 },
}
export function selectIrrigationSensorSignals(rows: RecordedSensorSignal[], scope: { gardenId: string; zoneId: string; asOf: Date }) {
  const values: Record<string, number> = {}
  const provenance: Record<string, { source: 'sensor_readings'; observedAt: string; unit: string }> = {}
  for (const row of [...rows].sort((a, b) => Date.parse(b.recorded_at) - Date.parse(a.recorded_at))) {
    const spec = specifications[row.sensor_type]
    const age = scope.asOf.getTime() - Date.parse(row.recorded_at)
    const value = typeof row.value === 'number' ? row.value : typeof row.value === 'string' && row.value.trim() ? Number(row.value) : NaN
    if (!spec || values[spec.field] !== undefined || row.garden_id !== scope.gardenId || row.irrigation_zone_id !== scope.zoneId || row.is_simulated !== false || !Number.isFinite(age) || age < 0 || age > 48 * 3600000 || !spec.units.includes(row.unit) || !Number.isFinite(value) || value < spec.min || value > spec.max) continue
    values[spec.field] = value
    provenance[spec.field] = { source: 'sensor_readings', observedAt: row.recorded_at, unit: row.unit }
  }
  return { ...values, sensorProvenance: provenance }
}
