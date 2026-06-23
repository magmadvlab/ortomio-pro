// components/farm/WeatherStrip.tsx
'use client'
import { useEffect, useState } from 'react';
import type { WeatherData } from '@/types/fieldAlerts';
import type { FieldAlert } from '@/types/fieldAlerts';

interface WeatherStripProps {
  lat: number
  lon: number
  alerts: FieldAlert[]
}

export function WeatherStrip({ lat, lon, alerts }: WeatherStripProps) {
  const [weather, setWeather] = useState<WeatherData['daily'] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,sunshine_duration',
      timezone: 'Europe/Rome',
      forecast_days: '1',
    });
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then(r => r.json())
      .then((d: WeatherData) => setWeather(d.daily))
      .catch(() => null);
  }, [lat, lon]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const todayIdx = 0;
  const tempMax = weather?.temperature_2m_max?.[todayIdx];
  const wind = weather?.windspeed_10m_max?.[todayIdx];
  const rainProb = weather?.precipitation_probability_max?.[todayIdx];
  const sunshine = weather?.sunshine_duration?.[todayIdx];
  const sunHours = sunshine ? (sunshine / 3600).toFixed(1) : null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-green-950 text-green-100 text-sm border-b border-green-800 flex-wrap">
      {tempMax != null && <span>🌡 {tempMax.toFixed(0)}°C</span>}
      {wind != null && <span>💨 {wind.toFixed(0)} km/h</span>}
      {rainProb != null && <span>💧 {rainProb}% pioggia</span>}
      {sunHours && <span>☀️ {sunHours}h sole</span>}
      <span className="ml-auto flex gap-2">
        {criticalCount > 0 && (
          <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
            {criticalCount} critico/i
          </span>
        )}
        {warningCount > 0 && (
          <span className="bg-amber-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
            {warningCount} attenzione
          </span>
        )}
        {criticalCount === 0 && warningCount === 0 && (
          <span className="bg-green-700 text-white rounded-full px-2 py-0.5 text-xs font-bold">
            Tutto OK
          </span>
        )}
      </span>
    </div>
  );
}
