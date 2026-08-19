'use client'

/**
 * Le 21 chiavi di segnale che il Director può analizzare
 * (types/agronomicKernel.ts — AgronomicSignalKey). Sono i nomi reali
 * del kernel, non decorazione.
 */
const SIGNAL_KEYS = [
  'ndvi',
  'satellite_vigor',
  'weather_current',
  'weather_forecast',
  'leaf_wetness',
  'dew_point',
  'vpd',
  'rain_gauge_local',
  'soil_moisture_10cm',
  'soil_moisture_30cm',
  'soil_moisture_60cm',
  'soil_tension_kpa',
  'canopy_temperature',
  'flow_rate_actual',
  'line_pressure',
  'water_salinity',
  'water_ph',
  'water_bicarbonates',
  'phenology_observation',
  'quality_result',
  'operation_ledger',
] as const

function TapeContent({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {SIGNAL_KEYS.map((key) => (
        <span
          key={key}
          className="flex items-center gap-2 whitespace-nowrap px-4 font-mono text-[11px] text-ortomio-green-700"
        >
          <span className="h-1 w-1 rounded-full bg-ortomio-green-500" />
          {key}
        </span>
      ))}
    </div>
  )
}

export default function SignalTape() {
  return (
    <aside
      aria-label="Le chiavi di segnale analizzate dal sistema"
      className="overflow-hidden border-b border-ortomio-earth/30 bg-ortomio-green-50 py-2.5"
    >
      <div className="ortomio-tape">
        <TapeContent />
        <TapeContent hidden />
      </div>
    </aside>
  )
}
