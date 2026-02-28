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
import { Garden } from '../types';
import { Cloud, CloudRain, Sun, Snowflake, ThermometerSun, Droplets, Wind, AlertTriangle, Loader2, Calendar, MapPin, Sprout, TreePine, Grape } from 'lucide-react';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  activePlants?: Array<{ plantName: string; minTemp?: number }>;
  gardens?: Garden[]; // Array di tutti i giardini con coordinate
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  latitude,
  longitude,
  activePlants = [],
  gardens = [],
}) => {
  const { can } = useTier();
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);

  // Filtra solo i giardini che hanno coordinate
  const gardensWithCoordinates = gardens.filter(g => g.coordinates?.latitude && g.coordinates?.longitude);
  
  // Trova il giardino attualmente selezionato per il meteo
  const selectedGarden = selectedGardenId 
    ? gardensWithCoordinates.find(g => g.id === selectedGardenId)
    : gardensWithCoordinates.find(g => 
        g.coordinates?.latitude === latitude && g.coordinates?.longitude === longitude
      ) || gardensWithCoordinates[0];

  // Coordinate da usare per il meteo
  const weatherLat = selectedGarden?.coordinates?.latitude || latitude;
  const weatherLng = selectedGarden?.coordinates?.longitude || longitude;

  useEffect(() => {
    const hasAccess = can('advancedWeather');

    if (!hasAccess) {
      setLoading(false);
      return;
    }

    loadForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherLat, weatherLng]); // Usa le coordinate del giardino selezionato

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError(null);

      // Timeout di sicurezza per evitare loading infinito
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Timeout: impossibile caricare le previsioni meteo');
      }, 10000); // 10 secondi

      try {
        // Try cache first
        const cached = await getCachedForecast(weatherLat, weatherLng);
        if (cached && cached.length > 0) {
          clearTimeout(timeoutId);
          setForecast(cached);
          const generatedAlerts = generateWeatherAlerts(cached, activePlants);
          setAlerts(generatedAlerts);
          setLoading(false);
          return;
        }

        // Fetch from API
        const data = await getWeatherForecast7Days(weatherLat, weatherLng);
        clearTimeout(timeoutId);

        if (data && data.length > 0) {
          setForecast(data);
          await cacheForecast(weatherLat, weatherLng, data);
          const generatedAlerts = generateWeatherAlerts(data, activePlants);
          setAlerts(generatedAlerts);
        } else {
          setError('Nessun dato meteo disponibile');
        }
      } catch (innerErr) {
        clearTimeout(timeoutId);
        throw innerErr;
      }
    } catch (err) {
      console.error('Error loading weather forecast:', err);
      setError('Errore nel caricamento delle previsioni');
    } finally {
      setLoading(false);
    }
  };

  const getGardenIcon = (garden: Garden) => {
    // Determina l'icona in base al tipo di giardino
    const gardenName = garden.name.toLowerCase();
    const primaryCropLabel = garden.primaryCrop ? String(garden.primaryCrop) : '';
    if (primaryCropLabel.includes('Fruit') || gardenName.includes('frutteto')) {
      return <TreePine size={16} className="text-green-600" />;
    }
    if (gardenName.includes('vigna') || gardenName.includes('vite')) {
      return <Grape size={16} className="text-purple-600" />;
    }
    return <Sprout size={16} className="text-green-600" />;
  };

  const handleGardenSelect = (gardenId: string) => {
    setSelectedGardenId(gardenId);
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
      return <Sun size={20} className="text-yellow-full max-w-sm" />;
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
      <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-4 text-center">
        <p className="text-yellow-full max-w-sm">Previsioni meteo avanzate disponibili solo in versione Pro</p>
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Cloud size={20} className="text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-800">Previsioni 7 Giorni</h3>
            {selectedGarden && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin size={14} />
                <span>{selectedGarden.name}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Garden Selector */}
        {gardensWithCoordinates.length > 1 && (
          <select
            value={selectedGardenId || (selectedGarden?.id || '')}
            onChange={(e) => handleGardenSelect(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white"
          >
            {gardensWithCoordinates.map(garden => (
              <option key={garden.id} value={garden.id}>
                {garden.name}
              </option>
            ))}
          </select>
        )}
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
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {forecast.slice(0, 7).map((day, idx) => {
          // Usa la data reale dall'API invece di calcolarla
          const date = day.date ? new Date(day.date) : new Date();
          const today = new Date();
          const isToday = date.toDateString() === today.toDateString();

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
                  <div className="text-xs text-blue-600 mt-1 flex items-center justify-center gap-3">
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
            <div className="flex items-center gap-3">
              <ThermometerSun size={16} className="text-orange-500" />
              <span>Ora: {forecast[0].temp.toFixed(1)}°C</span>
            </div>
            {forecast[0].humidity && (
              <div className="flex items-center gap-3">
                <Droplets size={16} className="text-blue-500" />
                <span>Umidità: {forecast[0].humidity}%</span>
              </div>
            )}
            {forecast[0].windSpeed && (
              <div className="flex items-center gap-3">
                <Wind size={16} className="text-gray-500" />
                <span>Vento: {forecast[0].windSpeed.toFixed(0)} km/h</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Garden Location Selector */}
      {gardensWithCoordinates.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <MapPin size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600 font-medium">Meteo per:</p>
          </div>
          
          {/* Desktop: Bottoni */}
          <div className="hidden md:flex gap-3 flex-wrap">
            {gardensWithCoordinates.map(garden => (
              <button
                key={garden.id}
                onClick={() => handleGardenSelect(garden.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGarden?.id === garden.id
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {getGardenIcon(garden)}
                <span className="truncate max-w-24">{garden.name}</span>
              </button>
            ))}
          </div>
          
          {/* Mobile: Dropdown */}
          <div className="md:hidden">
            <select
              value={selectedGarden?.id || ''}
              onChange={(e) => handleGardenSelect(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {gardensWithCoordinates.map(garden => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Coordinate info */}
          {selectedGarden && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
              <MapPin size={12} />
              <span>
                {selectedGarden.coordinates?.latitude.toFixed(3)}, {selectedGarden.coordinates?.longitude.toFixed(3)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
