
import React, { useState } from 'react';
import { SmartDevice, Garden } from '../types';
import { analyzeSensorData } from '../services/geminiService';
import { Wifi, Droplets, Activity, Settings, Power, Bot, RefreshCw, AlertTriangle, Sparkles, Loader2, ThermometerSun } from 'lucide-react';

interface SmartHubProps {
  devices: SmartDevice[];
  onToggleValve: (id: string, isOpen: boolean) => void;
  onUpdateDeviceSettings: (id: string, settings: Partial<SmartDevice>) => void;
  garden: Garden;
}

/**
 * SmartHub Component
 * 
 * Gestisce il monitoraggio e controllo dei dispositivi IoT per l'irrigazione automatica.
 * 
 * FUNZIONALITÀ PRINCIPALI:
 * 1. Simulazione IoT: In modalità demo, i dispositivi vengono simulati automaticamente
 *    tramite il motore di simulazione in App.tsx che aggiorna umidità, flusso d'acqua
 *    e stato valvola ogni secondo basandosi su fisica realistica (evaporazione, bagnatura).
 * 
 * 2. Auto-Start/Auto-Stop: 
 *    - Auto-Start: Se la modalità automatica è abilitata e l'umidità scende sotto la soglia
 *      configurata (autoThreshold), la valvola si apre automaticamente.
 *    - Auto-Stop: Quando la valvola è aperta e il volume d'acqua erogato (sessionLiters)
 *      raggiunge il target configurato (targetLiters), la valvola si chiude automaticamente.
 * 
 * 3. AI Analisi: Il pulsante "AI ANALISI" utilizza Gemini AI per analizzare i dati del sensore
 *    (umidità, temperatura simulata) e fornire consigli personalizzati sull'irrigazione
 *    basati sulle condizioni del giardino.
 */
const SmartHub: React.FC<SmartHubProps> = ({ devices, onToggleValve, onUpdateDeviceSettings, garden }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter devices for current garden
  const gardenDevices = devices.filter(d => d.gardenId === garden.id);

  /**
   * Analizza i dati del sensore con AI
   * 
   * Utilizza Gemini AI per analizzare umidità e temperatura e fornire consigli
   * personalizzati sull'irrigazione. La temperatura è simulata in questa demo,
   * ma in un'app reale verrebbe letta da un sensore fisico.
   */
  const handleAnalyze = async (device: SmartDevice) => {
      setAnalyzingId(device.id);
      // Simulated temperature (would come from sensor in real app)
      const simTemp = 24 + Math.random() * 5; 
      const advice = await analyzeSensorData(device.moisture, simTemp, garden.name);
      setAiAdvice(prev => ({ ...prev, [device.id]: advice }));
      setAnalyzingId(null);
  };

  const CircularProgress = ({ value, color, size = 120 }: { value: number, color: string, size?: number }) => {
      const radius = size / 2 - 10;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (value / 100) * circumference;
      
      return (
          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
              <svg className="transform -rotate-90 w-full h-full">
                  <circle cx={size/2} cy={size/2} r={radius} stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx={size/2} cy={size/2} r={radius} 
                    stroke={color} strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
              </svg>
              <div className="absolute flex flex-col items-center">
                  <span className="text-xl md:text-2xl font-bold text-gray-700">{Math.round(value)}%</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Umidità</span>
              </div>
          </div>
      );
  };

  if (gardenDevices.length === 0) {
      return (
          <div className="p-8 text-center">
              <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                  <Wifi size={48} className="text-gray-400"/>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-700">Nessun Dispositivo</h2>
              <p className="text-gray-500 mt-2">Collega il tuo Arduino/ESP32 per vedere i dati in tempo reale qui.</p>
              <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100">
                  <p className="font-bold mb-1">💡 Modalità Demo Attiva</p>
                  <p>In questa demo, i dispositivi verranno simulati automaticamente.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-bold text-blue-900 flex items-center gap-3">
            <Wifi size={24} className="text-blue-600"/> Smart Hub IoT
        </h1>
        <p className="text-blue-600 text-sm">Monitoraggio e automazione sensori.</p>
      </header>

      <div className="space-y-6">
          {gardenDevices.map(device => (
              <div key={device.id} className={`bg-white rounded-2xl border transition-all shadow-sm ${device.isValveOpen ? 'border-blue-300 shadow-blue-100' : 'border-gray-200'}`}>
                  {/* DEVICE HEADER */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.isValveOpen ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                              <Droplets size={20}/>
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-800">{device.name}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-3">
                                  <Activity size={10} className="text-green-500"/> Online
                              </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                           <button 
                                onClick={() => setEditingId(editingId === device.id ? null : device.id)}
                                className={`p-2 rounded-lg transition-colors ${editingId === device.id ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50'}`}
                           >
                               <Settings size={20}/>
                           </button>
                      </div>
                  </div>

                  {/* DASHBOARD BODY */}
                  <div className="p-6">
                      <div className="flex flex-col sm:flex-col md:flex-row items-center justify-between gap-6">
                          {/* MOISTURE GAUGE */}
                          <div className="flex flex-col items-center">
                              <CircularProgress 
                                value={device.moisture} 
                                color={device.moisture < 30 ? '#ef4444' : device.moisture < 60 ? '#eab308' : '#3b82f6'} 
                              />
                              <button 
                                onClick={() => handleAnalyze(device)}
                                disabled={analyzingId === device.id}
                                className="mt-4 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full flex items-center gap-3 hover:bg-purple-100 transition-colors"
                              >
                                  {analyzingId === device.id ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                                  AI ANALISI
                              </button>
                          </div>

                          {/* CONTROLS & STATS */}
                          <div className="flex-1 w-full space-y-4">
                               {/* VALVE CONTROL */}
                               {/* 
                                 * Controllo manuale della valvola.
                                 * Toggle per aprire/chiudere manualmente. Se la modalità automatica è attiva,
                                 * la valvola può aprirsi automaticamente quando l'umidità scende sotto la soglia.
                                 * 
                                 * INTEGRAZIONE ZONE IRRIGUE:
                                 * Le zone irrigue possono essere associate a questa valvola tramite zone.valveId.
                                 * Quando una zona ha bisogno di irrigazione, il Director calcola i minuti necessari
                                 * e può controllare automaticamente questa valvola per la durata calcolata.
                                 */}
                               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                   <div>
                                       <p className="text-xs font-bold text-gray-500 uppercase mb-1">Stato Valvola</p>
                                       <p className={`font-bold text-lg ${device.isValveOpen ? 'text-blue-600' : 'text-gray-400'}`}>
                                           {device.isValveOpen ? 'APERTA' : 'CHIUSA'}
                                       </p>
                                   </div>
                                   <button 
                                        onClick={() => onToggleValve(device.id, !device.isValveOpen)}
                                        className={`w-14 h-8 rounded-full transition-colors relative ${device.isValveOpen ? 'bg-blue-600' : 'bg-gray-300'}`}
                                   >
                                       <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-sm ${device.isValveOpen ? 'translate-x-6' : 'translate-x-0'}`}>
                                            <Power size={14} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${device.isValveOpen ? 'text-blue-600' : 'text-gray-400'}`}/>
                                       </div>
                                   </button>
                               </div>

                               {/* FLOW METER */}
                               {/* 
                                 * Monitoraggio flusso d'acqua:
                                 * - Sessione: Litri erogati nella sessione corrente (si resetta quando la valvola si chiude)
                                 * - Target Auto-Stop: Volume massimo da erogare prima di chiudere automaticamente la valvola.
                                 *   Quando sessionLiters raggiunge targetLiters, la valvola si chiude automaticamente.
                                 */}
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                       <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Sessione</p>
                                       <p className="text-lg md:text-xl font-mono font-bold text-blue-900 leading-none">
                                           {device.sessionLiters.toFixed(1)} <span className="text-xs font-sans">L</span>
                                       </p>
                                   </div>
                                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                       <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Auto-Stop</p>
                                       <p className="text-lg md:text-xl font-mono font-bold text-gray-600 leading-none">
                                           {device.targetLiters > 0 ? device.targetLiters : '∞'} <span className="text-xs font-sans">L</span>
                                       </p>
                                   </div>
                               </div>
                          </div>
                      </div>

                      {/* AI ADVICE RESULT */}
                      {aiAdvice[device.id] && (
                          <div className="mt-4 bg-purple-50 p-3 rounded-xl border border-purple-100 text-sm text-purple-900 animate-in fade-in">
                              <span className="font-bold flex items-center gap-3 mb-1"><Bot size={14}/> Consiglio AI:</span>
                              {aiAdvice[device.id]}
                          </div>
                      )}
                  </div>

                  {/* SETTINGS DRAWER */}
                  {editingId === device.id && (
                      <div className="bg-gray-50 p-5 border-t border-gray-100 animate-in slide-in-from-top-3">
                          <h4 className="font-bold text-gray-700 text-sm uppercase mb-4 flex items-center gap-3">
                              <Settings size={16}/> Configurazione Automazione
                          </h4>
                          
                          <div className="space-y-4">
                               {/* Auto Start Threshold */}
                               {/* 
                                 * Soglia di umidità per avvio automatico.
                                 * Quando l'umidità scende sotto questo valore E la modalità automatica è attiva,
                                 * la valvola si apre automaticamente per irrigare.
                                 * Impostare a 0 disabilita l'auto-start.
                                 */}
                               <div>
                                   <div className="flex justify-between mb-2">
                                       <label className="text-xs font-bold text-gray-500">Soglia Avvio Automatico</label>
                                       <span className="text-xs font-bold text-blue-600">{device.autoThreshold}% Umidità</span>
                                   </div>
                                   <input 
                                        type="range" min="0" max="80" step="5"
                                        value={device.autoThreshold}
                                        onChange={(e) => onUpdateDeviceSettings(device.id, { autoThreshold: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                   />
                                   <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                       <span>0% (Disabilitato)</span>
                                       <span>80%</span>
                                   </div>
                               </div>

                               {/* Auto Stop Target */}
                               {/* 
                                 * Volume massimo di acqua da erogare prima di chiudere automaticamente la valvola.
                                 * Quando sessionLiters raggiunge questo valore, la valvola si chiude automaticamente
                                 * per prevenire sovra-irrigazione. Utile per controllare la quantità esatta di acqua.
                                 */}
                               <div>
                                   <label className="text-xs font-bold text-gray-500 mb-2 block">Target Acqua (Auto-Stop)</label>
                                   <div className="flex items-center gap-3">
                                       <button 
                                            onClick={() => onUpdateDeviceSettings(device.id, { targetLiters: Math.max(0, device.targetLiters - 1) })}
                                            className="w-8 h-8 rounded bg-white border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                                       >-</button>
                                       <div className="flex-1 text-center font-mono font-bold text-gray-800 bg-white border border-gray-200 py-1.5 rounded">
                                            {device.targetLiters} Litri
                                       </div>
                                       <button 
                                            onClick={() => onUpdateDeviceSettings(device.id, { targetLiters: device.targetLiters + 1 })}
                                            className="w-8 h-8 rounded bg-white border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                                       >+</button>
                                   </div>
                                   <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-3">
                                       <AlertTriangle size={10}/> Se la valvola è aperta, si chiuderà raggiunti i {device.targetLiters}L.
                                   </p>
                               </div>

                               {/* Modalità Automatica */}
                               {/* 
                                 * Abilita/disabilita la modalità automatica completa.
                                 * Quando attiva: la valvola si apre automaticamente quando l'umidità scende sotto autoThreshold
                                 * e si chiude quando sessionLiters raggiunge targetLiters.
                                 */}
                               <div className="pt-2 flex items-center gap-3">
                                   <input 
                                        type="checkbox" 
                                        checked={device.autoMode}
                                        onChange={(e) => onUpdateDeviceSettings(device.id, { autoMode: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                   />
                                   <span className="text-sm font-bold text-gray-700">Abilita Modalità Automatica</span>
                               </div>
                          </div>
                      </div>
                  )}
              </div>
          ))}
      </div>
    </div>
  );
};

export default SmartHub;
