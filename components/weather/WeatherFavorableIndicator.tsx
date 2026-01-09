/**
 * Weather Favorable Indicator Component
 * Shows if weather conditions are favorable for garden work
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';
import { WeatherForecast } from '../../services/weatherService';
import { getWeatherForecast7Days } from '../../services/weatherService';
import { getCachedForecast } from '../../services/weatherCacheService';

interface WeatherFavorableIndicatorProps {
  latitude: number;
  longitude: number;
}

interface WeatherCondition {
  isFavorable: boolean;
  message: string;
  details: string[];
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const WeatherFavorableIndicator: React.FC<WeatherFavorableIndicatorProps> = ({
  latitude,
  longitude,
}) => {
  const [condition, setCondition] = useState<WeatherCondition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeatherCondition();
  }, [latitude, longitude]);

  const loadWeatherCondition = async () => {
    try {
      setLoading(true);

      // Try cache first
      let forecast = await getCachedForecast(latitude, longitude);
      
      // If no cache, fetch from API
      if (!forecast || forecast.length === 0) {
        forecast = await getWeatherForecast7Days(latitude, longitude);
      }

      if (forecast && forecast.length > 0) {
        const condition = analyzeWeatherConditions(forecast);
        setCondition(condition);
      }
    } catch (error) {
      console.error('Error loading weather condition:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeWeatherConditions = (forecast: WeatherForecast[]): WeatherCondition => {
    const today = forecast[0];
    const next3Days = forecast.slice(0, 3);

    // Check for favorable conditions
    const isTempGood = today.temp >= 10 && today.temp <= 30;
    const isNotTooHot = (today.tempMax || today.temp) <= 35;
    const isNotTooRain = today.rainForecastMm <= 5;
    const isNotFreezing = (today.tempMin || today.temp) > 2;

    const details: string[] = [];
    
    // Temperature analysis
    if (today.temp < 10) {
      details.push(`Temperatura bassa: ${today.temp.toFixed(1)}°C`);
    } else if (today.temp > 30) {
      details.push(`Temperatura alta: ${today.temp.toFixed(1)}°C`);
    } else {
      details.push(`Temperatura ideale: ${today.temp.toFixed(1)}°C`);
    }

    // Rain analysis
    if (today.rainForecastMm > 10) {
      details.push(`Pioggia intensa prevista: ${today.rainForecastMm.toFixed(1)}mm`);
    } else if (today.rainForecastMm > 0) {
      details.push(`Pioggia leggera: ${today.rainForecastMm.toFixed(1)}mm`);
    } else {
      details.push('Nessuna pioggia prevista');
    }

    // Next days outlook
    const nextDaysRain = next3Days.reduce((sum, day) => sum + (day.rainForecastMm || 0), 0);
    if (nextDaysRain > 20) {
      details.push('Prossimi giorni piovosi');
    }

    // Determine overall condition
    const favorableFactors = [isTempGood, isNotTooHot, isNotTooRain, isNotFreezing];
    const favorableCount = favorableFactors.filter(Boolean).length;

    if (favorableCount >= 3) {
      return {
        isFavorable: true,
        message: 'Meteo Favorevole',
        details,
        icon: <Sun size={20} className="text-green-600" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
      };
    } else if (favorableCount >= 2) {
      return {
        isFavorable: true,
        message: 'Meteo Accettabile',
        details,
        icon: <Cloud size={20} className="text-yellow-600" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
      };
    } else {
      return {
        isFavorable: false,
        message: 'Meteo Sfavorevole',
        details,
        icon: <CloudRain size={20} className="text-red-600" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
      };
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="animate-pulse bg-gray-300 rounded-full w-5 h-5"></div>
          <div className="animate-pulse bg-gray-300 rounded w-32 h-4"></div>
        </div>
      </div>
    );
  }

  if (!condition) {
    return null;
  }

  return (
    <div className={`${condition.bgColor} rounded-lg p-4 border border-gray-200`}>
      <div className="flex items-start gap-3">
        {condition.icon}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {condition.isFavorable ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <AlertTriangle size={16} className="text-red-600" />
            )}
            <h3 className={`font-bold ${condition.textColor}`}>
              {condition.message}
            </h3>
          </div>
          <div className={`text-sm ${condition.textColor} space-y-1`}>
            {condition.details.map((detail, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-current rounded-full"></span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
          {condition.isFavorable && (
            <p className={`text-xs mt-2 ${condition.textColor} font-medium`}>
              Tutti i task programmati compatibili con previsioni
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherFavorableIndicator;