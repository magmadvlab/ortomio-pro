/**
 * Tillage Timing Alert Component
 * Alert quando terreno diventa "in tempera" per lavorazione
 */

import React, { useState, useEffect } from 'react';
import { Garden } from '../../types';
import { calculateTemperaTiming } from '../../logic/tillageEngine';
import { getSoilState } from '../../services/soilStateService';
import { Bell, Calendar, CheckCircle, Clock } from 'lucide-react';

interface TillageTimingAlertProps {
  garden: Garden;
  zoneId?: string;
  onWorkReady?: () => void;
}

const TillageTimingAlert: React.FC<TillageTimingAlertProps> = ({
  garden,
  zoneId,
  onWorkReady,
}) => {
  const [temperaInfo, setTemperaInfo] = useState<{
    isTempera: boolean;
    date?: Date;
    reason: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTemperaStatus();
    // Controlla ogni ora
    const interval = setInterval(checkTemperaStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [garden.id, zoneId]);

  const checkTemperaStatus = async () => {
    setLoading(true);
    try {
      const soilState = zoneId ? await getSoilState(garden.id, zoneId) : null;
      if (soilState?.lastRainDate) {
        const info = await calculateTemperaTiming(
          garden,
          soilState.lastRainDate,
          soilState.lastRainAmount || 0
        );
        setTemperaInfo(info);

        if (info.isTempera && onWorkReady) {
          onWorkReady();
        }
      }
    } catch (error) {
      console.error('Error checking tempera status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !temperaInfo) {
    return null;
  }

  if (temperaInfo.isTempera) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle size={20} className="text-green-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Bell size={16} className="text-green-600" />
            <h4 className="font-semibold text-green-800">Terreno in Tempera!</h4>
          </div>
          <p className="text-sm text-green-700 mb-2">{temperaInfo.reason}</p>
          <p className="text-xs text-green-600">
            Finestra ottimale per lavorazione. Esegui lavorazione pianificata.
          </p>
        </div>
      </div>
    );
  }

  // Calcola giorni rimanenti
  const daysRemaining = temperaInfo.date
    ? Math.ceil((temperaInfo.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Clock size={20} className="text-blue-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <Calendar size={16} className="text-blue-600" />
          <h4 className="font-semibold text-blue-800">Terreno Non Ancora in Tempera</h4>
        </div>
        <p className="text-sm text-blue-700 mb-2">{temperaInfo.reason}</p>
        {daysRemaining !== null && daysRemaining > 0 && (
          <p className="text-xs text-blue-600">
            Terreno sarà lavorabile tra circa <b>{daysRemaining} giorni</b>
            {temperaInfo.date && ` (${temperaInfo.date.toLocaleDateString('it-IT')})`}
          </p>
        )}
      </div>
    </div>
  );
};

export default TillageTimingAlert;

