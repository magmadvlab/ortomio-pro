import React, { useState, useEffect } from 'react';
import { Satellite, CheckCircle, AlertCircle, Loader2, Wifi } from 'lucide-react';

interface SentinelHubStatusProps {
  onStatusChange?: (connected: boolean) => void;
}

const SentinelHubStatus: React.FC<SentinelHubStatusProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'simulated' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const response = await fetch('/api/ndvi/sentinel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bbox: {
            north: 42.0,
            south: 41.9,
            east: 12.6,
            west: 12.5
          },
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0],
          cloudCoverage: 20
        })
      });

      const data = await response.json();
      
      if (data.simulated) {
        setStatus('simulated');
        setErrorMessage(data.error || 'Credenziali non configurate');
        onStatusChange?.(false);
      } else if (data.success) {
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
      case 'simulated':
        return {
          icon: Wifi,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Modalità Demo',
          description: 'Usando dati simulati realistici'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Errore Connessione',
          description: 'Fallback a dati simulati'
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
          
          {errorMessage && status !== 'simulated' && (
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

      {/* Info aggiuntiva per modalità demo */}
      {status === 'simulated' && (
        <div className="mt-3 pt-3 border-t border-yellow-full max-w-sm">
          <div className="flex items-start gap-3">
            <Satellite className="w-4 h-4 text-yellow-full max-w-sm mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-full max-w-sm">
              <p className="font-medium mb-1">Modalità Demo Attiva</p>
              <p>I dati NDVI sono simulati ma realistici. Per dati satellitari reali, configura le credenziali Sentinel Hub nelle variabili d'ambiente.</p>
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