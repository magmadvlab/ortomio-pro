/**
 * Weather Widget Component
 * Displays 7-day weather forecast with alerts
 * Pro Feature
 */

import React, { useState, useEffect } from 'react';
import { WeatherForecast, WeatherAlert } from '../services/weatherService';
import { getWeatherForecast7Days, generateWeatherAlerts } from '../services/weatherService';
import { getCachedForecast, cacheForecast } from '../services/weatherCacheService';
import { useTier } from '../packages/core/hooks/useTier';
import { Cloud, CloudRain, Sun, Snowflake, ThermometerSun, Droplets, Wind, AlertTriangle, Loader2, Calendar } from 'lucide-react';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  activePlants?: Array<{ plantName: string; minTemp?: number }>;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  latitude,
  longitude,
  activePlants = [],
}) => {
  const { can } = useTier();
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!can('advancedWeather')) {
      setLoading(false);
      return;
    }

    loadForecast();
  }, [latitude, longitude, can]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first
      const cached = await getCachedForecast(latitude, longitude);
      if (cached && cached.length > 0) {
        setForecast(cached);
        const generatedAlerts = generateWeatherAlerts(cached, activePlants);
        setAlerts(generatedAlerts);
        setLoading(false);
        return;
      }

      // Fetch from API
      const data = await getWeatherForecast7Days(latitude, longitude);
      if (data.length > 0) {
        setForecast(data);
        await cacheForecast(latitude, longitude, data);
        const generatedAlerts = generateWeatherAlerts(data, activePlants);
        setAlerts(generatedAlerts);
      } else {
        setError('Impossibile caricare le previsioni meteo');
      }
    } catch (err) {
      console.error('Error loading weather forecast:', err);
      setError('Errore nel caricamento delle previsioni');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, tempMax?: number) => {
    if (tempMax !== undefined && tempMax < 0) {
      return <Snowflake size={20} className="text-blue-500" />;
    }
    if (code >= 61 && code <= 67) {
      return <CloudRain size={20} className="text-blue-500" />;
    }
    if (code >= 71 && code <= 77) {
      return <Snowflake size={20} className="text-gray-400" />;
    }
    if (code >= 80 && code <= 86) {
      return <CloudRain size={20} className="text-gray-500" />;
    }
    if (code === 0 || code === 1) {
      return <Sun size={20} className="text-yellow-500" />;
    }
    return <Cloud size={20} className="text-gray-400" />;
  };

  const getAlertIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'FROST':
        return <Snowflake size={18} className="text-blue-600" />;
      case 'HEATWAVE':
        return <ThermometerSun size={18} className="text-red-600" />;
      case 'HEAVYRAIN':
        return <CloudRain size={18} className="text-blue-600" />;
      case 'DROUGHT':
        return <Droplets size={18} className="text-orange-600" />;
      default:
        return <AlertTriangle size={18} />;
    }
  };

  const getAlertColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'HIGH':
        return 'bg-orange-50 border-orange-300 text-orange-900';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      case 'LOW':
        return 'bg-blue-50 border-blue-300 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900';
    }
  };

  if (!can('advancedWeather')) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">Previsioni meteo avanzate disponibili solo in versione Pro</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Loader2 className="animate-spin mx-auto mb-2 text-green-600" size={24} />
        <p className="text-gray-600">Caricamento previsioni...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Cloud size={20} className="text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Previsioni 7 Giorni</h3>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`${getAlertColor(alert.severity)} rounded-lg p-4 border-l-4`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="font-bold mb-1">{alert.message}</p>
                  {alert.actionRequired && alert.actionRequired.length > 0 && (
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      {alert.actionRequired.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forecast Grid */}
      <div className="grid grid-cols-7 gap-2">
        {forecast.slice(0, 7).map((day, idx) => {
          const date = day.date ? new Date(day.date) : new Date();
          date.setDate(date.getDate() + idx);
          const isToday = idx === 0;

          return (
            <div
              key={idx}
              className={`rounded-lg p-3 border ${
                isToday ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-xs font-bold text-gray-600 mb-2 text-center">
                {isToday ? 'Oggi' : date.toLocaleDateString('it-IT', { weekday: 'short' })}
              </div>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.code, day.tempMax)}
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-800">
                  {day.tempMax?.toFixed(0) || day.temp.toFixed(0)}°
                </div>
                <div className="text-xs text-gray-600">
                  {day.tempMin?.toFixed(0)}°
                </div>
                {day.rainForecastMm > 0 && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center justify-center gap-1">
                    <Droplets size={12} />
                    {day.rainForecastMm.toFixed(1)}mm
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Conditions */}
      {forecast.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ThermometerSun size={16} className="text-orange-500" />
              <span>Ora: {forecast[0].temp.toFixed(1)}°C</span>
            </div>
            {forecast[0].humidity && (
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-blue-500" />
                <span>Umidità: {forecast[0].humidity}%</span>
              </div>
            )}
            {forecast[0].windSpeed && (
              <div className="flex items-center gap-2">
                <Wind size={16} className="text-gray-500" />
                <span>Vento: {forecast[0].windSpeed.toFixed(0)} km/h</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;

