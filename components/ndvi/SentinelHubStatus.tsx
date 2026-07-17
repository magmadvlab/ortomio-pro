import React, { useState, useEffect } from 'react';
import { Satellite, CheckCircle, AlertCircle, Loader2, Wifi } from 'lucide-react';
import type { Garden } from '@/types';

interface SentinelHubStatusProps {
  garden: Garden;
  onStatusChange?: (connected: boolean) => void;
}

const SentinelHubStatus: React.FC<SentinelHubStatusProps> = ({ garden, onStatusChange }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      if (!garden.coordinates) {
        setStatus('error');
        setErrorMessage('Coordinate del garden mancanti: impossibile richiedere un dato satellitare reale.');
        onStatusChange?.(false);
        return;
      }
      const response = await fetch('/api/ndvi/sentinel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gardenId: garden.id,
          bbox: {
            north: garden.coordinates.latitude + 0.001,
            south: garden.coordinates.latitude - 0.001,
            east: garden.coordinates.longitude + 0.001,
            west: garden.coordinates.longitude - 0.001
          },
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0],
          cloudCoverage: 20
        })
      });

      const data = await response.json();
      
      if (data.sourceKind !== 'real') {
        setStatus('error');
        setErrorMessage('Credenziali Sentinel Hub non configurate. Contatta l\'amministratore per abilitare i dati satellitari reali.');
        onStatusChange?.(false);
      } else if (data.status === 'available') {
        setStatus('connected');
        setErrorMessage('');
        onStatusChange?.(true);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Errore sconosciuto');
        onStatusChange?.(false);
      }
      
      setLastCheck(new Date());
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message);
      setLastCheck(new Date());
      onStatusChange?.(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Verifica connessione...',
          description: 'Test API Sentinel Hub in corso'
        };
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Connesso a Sentinel Hub',
          description: 'Dati satellitari reali disponibili'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Credenziali Non Configurate',
          description: 'Configura Sentinel Hub per dati reali'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Stato Sconosciuto',
          description: 'Riprova la connessione'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon 
            className={`w-5 h-5 ${config.color} ${status === 'checking' ? 'animate-spin' : ''}`} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-semibold ${config.color}`}>
              {config.label}
            </h4>
            {lastCheck && (
              <button
                onClick={checkConnection}
                className={`text-xs ${config.color} hover:underline`}
                disabled={status === 'checking'}
              >
                Ricontrolla
              </button>
            )}
          </div>
          
          <p className={`text-sm ${config.color.replace('600', '700')}`}>
            {config.description}
          </p>
          
          {errorMessage && status === 'error' && (
            <p className="text-xs text-red-600 mt-2 font-mono">
              {errorMessage}
            </p>
          )}
          
          {lastCheck && (
            <p className="text-xs text-gray-500 mt-2">
              Ultimo controllo: {lastCheck.toLocaleTimeString('it-IT')}
            </p>
          )}
        </div>
      </div>

      {/* Info aggiuntiva per errore configurazione */}
      {status === 'error' && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <div className="flex items-start gap-3">
            <Satellite className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-700">
              <p className="font-medium mb-1">Configurazione Richiesta</p>
              <p className="mb-2">Per abilitare i dati satellitari reali Sentinel-2, configura le seguenti variabili d'ambiente:</p>
              <ul className="list-disc list-inside space-y-1 font-mono text-[10px]">
                <li>SENTINEL_HUB_CLIENT_ID</li>
                <li>SENTINEL_HUB_CLIENT_SECRET</li>
              </ul>
              <p className="mt-2">Ottieni le credenziali gratuite su: <a href="https://www.sentinel-hub.com/" target="_blank" rel="noopener noreferrer" className="underline">sentinel-hub.com</a></p>
            </div>
          </div>
        </div>
      )}

      {/* Info aggiuntiva per connessione attiva */}
      {status === 'connected' && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="flex items-start gap-3">
            <Satellite className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-700">
              <p className="font-medium mb-1">Sentinel-2 ESA Attivo</p>
              <p>Risoluzione: 10m • Aggiornamento: ogni 5 giorni • Copertura: globale</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentinelHubStatus;
