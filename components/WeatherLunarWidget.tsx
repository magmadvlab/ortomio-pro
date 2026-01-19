/**
 * Weather + Lunar Widget Component
 * Unified widget showing weather forecast and lunar phase with practical advice
 * Combines meteorological data with traditional lunar farming wisdom
 */

import React, { useState, useEffect } from 'react';
import { WeatherForecast, WeatherAlert, getWeatherForecast7Days, generateWeatherAlerts } from '@/services/weatherService';
import { getCachedForecast, cacheForecast } from '@/services/weatherCacheService';
import { calculateMoonPhase } from '@/logic/lunarCalendar';
import { useTier } from '@/packages/core/hooks/useTier';
import { Garden } from '../types';
import { 
  Cloud, CloudRain, Sun, Snowflake, ThermometerSun, Droplets, Wind, 
  AlertTriangle, Loader2, MapPin, Moon, Sprout, Lightbulb, Calendar
} from 'lucide-react';

interface WeatherLunarWidgetProps {
  latitude: number;
  longitude: number;
  activePlants?: Array<{ plantName: string; minTemp?: number }>;
  gardens?: Garden[];
}

interface LunarAdvice {
  phase: string;
  phaseIcon: string;
  description: string;
  goodFor: string[];
  avoidFor: string[];
  todayAdvice: string;
}

// Extended weather forecast interface for the widget
interface ExtendedWeatherForecast {
  date: string;
  temp: number;
  code: number;
  rainForecastMm: number;
  windSpeed: number;
  humidity: number;
}

const WeatherLunarWidget: React.FC<WeatherLunarWidgetProps> = ({
  latitude,
  longitude,
  activePlants = [],
  gardens = [],
}) => {
  const { can } = useTier();
  const [forecast, setForecast] = useState<ExtendedWeatherForecast[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [lunarAdvice, setLunarAdvice] = useState<LunarAdvice | null>(null);

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

  // Calcola consigli lunari
  const calculateLunarAdvice = (): LunarAdvice => {
    const moonPhase = calculateMoonPhase(new Date());
    
    switch (moonPhase.phase) {
      case 'WaxingCrescent':
      case 'WaxingGibbous':
        return {
          phase: 'Luna Crescente',
          phaseIcon: '🌒',
          description: 'Linfa verso l\'alto - Energia ascendente',
          goodFor: [
            'Semina ortaggi da frutto (pomodori, peperoni, zucchine)',
            'Semina legumi (fagioli, piselli, fave)',
            'Semina verdure a foglia per sviluppo vegetativo',
            'Raccolta di frutti e semi'
          ],
          avoidFor: [
            'Semina ortaggi da radice',
            'Trapianti delicati',
            'Potature importanti'
          ],
          todayAdvice: 'Ottimo momento per seminare pomodori, zucchine e fagioli!'
        };
        
      case 'WaningCrescent':
      case 'WaningGibbous':
        return {
          phase: 'Luna Calante',
          phaseIcon: '🌘',
          description: 'Linfa verso le radici - Energia discendente',
          goodFor: [
            'Semina ortaggi da radice (carote, cipolle, patate)',
            'Trapianti (favorisce radicamento)',
            'Semina verdure a cespo (lattughe, cavoli)',
            'Raccolta per conservazione (aglio, cipolle)'
          ],
          avoidFor: [
            'Semina ortaggi da frutto',
            'Raccolta di frutti freschi'
          ],
          todayAdvice: 'Perfetto per trapiantare e seminare carote, cipolle e lattughe!'
        };
        
      case 'Full':
        return {
          phase: 'Luna Piena',
          phaseIcon: '🌕',
          description: 'Massima vitalità - Energia al picco',
          goodFor: [
            'Raccolta di erbe aromatiche',
            'Raccolta per uso immediato',
            'Osservazione delle piante'
          ],
          avoidFor: [
            'Semine delicate',
            'Trapianti stressanti'
          ],
          todayAdvice: 'Momento ideale per raccogliere erbe aromatiche al massimo della potenza!'
        };
        
      case 'New':
      default:
        return {
          phase: 'Luna Nuova',
          phaseIcon: '🌑',
          description: 'Fase di riposo - Energia minima',
          goodFor: [
            'Preparazione del terreno',
            'Pulizia dell\'orto',
            'Pianificazione semine future'
          ],
          avoidFor: [
            'Semine importanti',
            'Trapianti'
          ],
          todayAdvice: 'Momento perfetto per preparare il terreno e pianificare!'
        };
    }
  };

  useEffect(() => {
    const hasAccess = can('advancedWeather');
    
    // Calcola sempre i consigli lunari
    setLunarAdvice(calculateLunarAdvice());

    if (!hasAccess) {
      setLoading(false);
      return;
    }

    loadForecast();
  }, [weatherLat, weatherLng]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError(null);

      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Timeout: impossibile caricare le previsioni meteo');
      }, 10000);

      try {
        // Try cache first
        const cached = await getCachedForecast(weatherLat, weatherLng);
        if (cached && cached.length > 0) {
          clearTimeout(timeoutId);
          // Transform cached data to match expected interface
          const transformedCached = cached.map(item => ({
            date: item.date,
            temp: item.tempMax || item.tempMin || 20,
            code: 0, // Default clear sky
            rainForecastMm: item.rainMm || 0,
            windSpeed: item.windSpeed || 0,
            humidity: item.humidity || 60
          }));
          setForecast(transformedCached);
          const generatedAlerts = generateWeatherAlerts(cached as any[], activePlants);
          setAlerts(generatedAlerts);
          setLoading(false);
          return;
        }

        // Fetch from API
        const data = await getWeatherForecast7Days(weatherLat, weatherLng);
        clearTimeout(timeoutId);

        if (data && data.length > 0) {
          // Transform the data to match expected interface
          const transformedData = data.map(item => ({
            date: item.date?.toISOString?.() || item.date,
            temp: item.temp_max || item.temp_min || 20,
            code: 0, // Default clear sky
            rainForecastMm: item.precipitation || 0,
            windSpeed: item.wind_speed || 0,
            humidity: item.humidity || 60
          }));
          
          setForecast(transformedData);
          await cacheForecast(weatherLat, weatherLng, transformedData);
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
      setError('Errore nel caricamento delle previsioni meteo');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherCondition = (code: number) => {
    // Weather codes from Open-Meteo API
    if (code === 0) return 'Sereno';
    if (code >= 1 && code <= 3) return 'Parzialmente nuvoloso';
    if (code >= 45 && code <= 48) return 'Nebbia';
    if (code >= 51 && code <= 55) return 'Pioggia leggera';
    if (code >= 56 && code <= 57) return 'Pioggia gelata';
    if (code >= 61 && code <= 65) return 'Pioggia';
    if (code >= 66 && code <= 67) return 'Pioggia gelata';
    if (code >= 71 && code <= 75) return 'Neve';
    if (code >= 77 && code <= 77) return 'Granelli di neve';
    if (code >= 80 && code <= 82) return 'Rovesci';
    if (code >= 85 && code <= 86) return 'Rovesci di neve';
    if (code >= 95 && code <= 99) return 'Temporale';
    return 'Variabile';
  };

  const getWeatherIcon = (code: number, temp: number) => {
    // Weather codes from Open-Meteo API
    // 0 = Clear sky, 1-3 = Partly cloudy, 45-48 = Fog, 51-67 = Rain, 71-77 = Snow, 80-99 = Showers/Thunderstorms
    if (code >= 51 && code <= 67) {
      return <CloudRain className="text-blue-500" size={24} />;
    }
    if (code >= 80 && code <= 99) {
      return <CloudRain className="text-blue-600" size={24} />;
    }
    if (code >= 71 && code <= 77) {
      return <Snowflake className="text-blue-300" size={24} />;
    }
    if (code >= 1 && code <= 48) {
      return <Cloud className="text-gray-500" size={24} />;
    }
    if (temp > 25) {
      return <ThermometerSun className="text-orange-500" size={24} />;
    }
    return <Sun className="text-yellow-full max-w-sm" size={24} />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Oggi';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Domani';
    }
    return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' });
  };

  // Combina consigli meteo e lunari
  const getCombinedAdvice = () => {
    if (!lunarAdvice) return [];
    
    const advice = [lunarAdvice.todayAdvice];
    
    // Aggiungi consigli meteo se disponibili
    if (forecast.length > 0) {
      const todayWeather = forecast[0];
      if (todayWeather.rainForecastMm > 5) {
        advice.push('⚠️ Pioggia prevista - rimanda irrigazioni');
      }
      if (todayWeather.temp < 5) {
        advice.push('🥶 Temperature basse - proteggi piante sensibili');
      }
      if (todayWeather.temp > 30) {
        advice.push('🌡️ Caldo intenso - irriga al mattino presto');
      }
    }
    
    return advice;
  };

  if (!can('advancedWeather')) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Moon className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Consigli Lunari</h3>
              <p className="text-sm text-gray-600">Tradizione contadina</p>
            </div>
          </div>
          <span className="text-xl md:text-2xl">{lunarAdvice?.phaseIcon}</span>
        </div>

        {lunarAdvice && (
          <div className="space-y-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{lunarAdvice.phaseIcon}</span>
                <span className="font-semibold text-gray-900">{lunarAdvice.phase}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{lunarAdvice.description}</p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="text-green-600" size={16} />
                  <span className="font-semibold text-green-800">Consiglio di oggi</span>
                </div>
                <p className="text-sm text-green-700">{lunarAdvice.todayAdvice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Sun className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Meteo & Luna</h3>
            <p className="text-sm text-gray-600">Previsioni e consigli</p>
          </div>
        </div>
        
        {/* Garden Selector */}
        {gardensWithCoordinates.length > 1 && (
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-gray-500" />
            <select
              value={selectedGarden?.id || ''}
              onChange={(e) => setSelectedGardenId(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
            >
              {gardensWithCoordinates.map(garden => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <span className="ml-2 text-gray-600">Caricamento...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={20} />
            <span className="text-red-800 font-medium">Errore Meteo</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Today's Weather + Lunar */}
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather Today */}
            {forecast.length > 0 && (
              <div className="bg-white/70 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">Oggi</span>
                  {getWeatherIcon(forecast[0].code, forecast[0].temp)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl md:text-2xl font-bold text-gray-900">
                      {Math.round(forecast[0].temp)}°C
                    </span>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <Droplets size={14} />
                        {forecast[0].rainForecastMm}mm
                      </div>
                      <div className="flex items-center gap-3">
                        <Wind size={14} />
                        {forecast[0].windSpeed} km/h
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{getWeatherCondition(forecast[0].code)}</p>
                </div>
              </div>
            )}

            {/* Lunar Phase */}
            {lunarAdvice && (
              <div className="bg-white/70 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">Fase Lunare</span>
                  <span className="text-xl md:text-2xl">{lunarAdvice.phaseIcon}</span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{lunarAdvice.phase}</p>
                  <p className="text-sm text-gray-600">{lunarAdvice.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Combined Advice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="text-green-600" size={20} />
              <span className="font-semibold text-green-800">Consigli di Oggi</span>
            </div>
            <div className="space-y-2">
              {getCombinedAdvice().map((advice, index) => (
                <p key={index} className="text-sm text-green-700 flex items-start gap-3">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>{advice}</span>
                </p>
              ))}
            </div>
          </div>

          {/* 7-Day Forecast */}
          {forecast.length > 1 && (
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-3">
                <Calendar size={18} />
                Prossimi Giorni
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {forecast.slice(1, 8).map((day, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-gray-600 mb-1">
                      {day.date ? formatDate(day.date) : 'N/A'}
                    </p>
                    <div className="flex justify-center mb-1">
                      {getWeatherIcon(day.code, day.temp)}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {Math.round(day.temp)}°
                    </p>
                    <p className="text-xs text-blue-600">
                      {day.rainForecastMm}mm
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className={`border rounded-lg p-3 ${
                  alert.severity === 'HIGH' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={
                      alert.severity === 'HIGH' ? 'text-red-600' :
                      alert.severity === 'MEDIUM' ? 'text-yellow-600' :
                      'text-blue-600'
                    } size={18} />
                    <span className={`font-medium ${
                      alert.severity === 'HIGH' ? 'text-red-800' :
                      alert.severity === 'MEDIUM' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.message}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    alert.severity === 'HIGH' ? 'text-red-700' :
                    alert.severity === 'MEDIUM' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherLunarWidget;