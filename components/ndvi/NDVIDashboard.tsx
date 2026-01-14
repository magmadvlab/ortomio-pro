import React, { useState, useEffect } from 'react';
import { Garden } from '../../types';
import { NDVISatelliteService, NDVIReading, NDVIZoneAnalysis } from '../../services/ndviSatelliteService';
import SentinelHubStatus from './SentinelHubStatus';
import NDVIMap from './NDVIMap';
import ActionButton, { ActionContext } from '../actions/ActionButton';
import InterventionWizard, { InterventionData } from '../actions/InterventionWizard';
import { interventionService } from '../../services/interventionService';
import { Satellite, TrendingUp, TrendingDown, Minus, AlertTriangle, Leaf, Droplets, Activity, RefreshCw, Calendar, MapPin } from 'lucide-react';

interface NDVIDashboardProps {
  garden: Garden;
}

const NDVIDashboard: React.FC<NDVIDashboardProps> = ({ garden }) => {
  const [loading, setLoading] = useState(true);
  const [ndviData, setNdviData] = useState<NDVIReading | null>(null);
  const [zones, setZones] = useState<NDVIZoneAnalysis[]>([]);
  const [trend, setTrend] = useState<Array<{ date: string; ndvi: number; health: string }>>([]);
  const [stressAreas, setStressAreas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'zones' | 'trend' | 'stress'>('overview');
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  
  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [actionContext, setActionContext] = useState<ActionContext | null>(null);

  useEffect(() => {
    loadNDVIData();
  }, [garden.id]);

  const loadNDVIData = async () => {
    setLoading(true);
    try {
      const [ndvi, zonesData, trendData, stressData] = await Promise.all([
        NDVISatelliteService.getLatestNDVI(garden),
        NDVISatelliteService.analyzeGardenZones(garden),
        NDVISatelliteService.getNDVITrend(garden, 60),
        NDVISatelliteService.detectStressAreas(garden)
      ]);

      setNdviData(ndvi);
      setZones(zonesData);
      setTrend(trendData);
      setStressAreas(stressData);
    } catch (error) {
      console.error('Errore caricamento dati NDVI:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-green-500 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNDVIColor = (ndvi: number) => {
    if (ndvi >= 0.8) return 'text-green-600';
    if (ndvi >= 0.6) return 'text-green-500';
    if (ndvi >= 0.4) return 'text-yellow-600';
    if (ndvi >= 0.2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = () => {
    if (trend.length < 2) return <Minus className="w-4 h-4" />;
    
    const recent = trend.slice(-3).reduce((sum, t) => sum + t.ndvi, 0) / 3;
    const older = trend.slice(0, 3).reduce((sum, t) => sum + t.ndvi, 0) / 3;
    
    if (recent > older + 0.05) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (recent < older - 0.05) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const handleActionSelected = (actionType: any, context: ActionContext) => {
    setSelectedAction(actionType);
    setActionContext(context);
    setWizardOpen(true);
  };

  const handleInterventionCreated = async (intervention: InterventionData) => {
    try {
      await interventionService.createIntervention({
        ...intervention,
        gardenId: garden.id
      });
      
      // Mostra notifica di successo
      console.log('Intervento creato con successo:', intervention);
      
      // Ricarica i dati se necessario
      loadNDVIData();
    } catch (error) {
      console.error('Errore nella creazione dell\'intervento:', error);
    }
  };

  const getUrgencyFromNDVI = (ndvi: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (ndvi < 0.3) return 'critical';
    if (ndvi < 0.5) return 'high';
    if (ndvi < 0.7) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Caricamento dati satellitari...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sentinel Hub Status */}
      <SentinelHubStatus onStatusChange={setApiConnected} />

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Satellite className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Analisi Satellitare NDVI</h2>
              <p className="text-sm text-gray-500">Monitoraggio vegetazione da satellite</p>
            </div>
          </div>
          <button
            onClick={loadNDVIData}
            className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Aggiorna
          </button>
        </div>

        {/* Overview Cards */}
        {ndviData && (
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">NDVI Medio</span>
                <Leaf className="w-4 h-4 text-gray-400" />
              </div>
              <div className={`text-2xl font-bold ${getNDVIColor(ndviData.ndvi_value)}`}>
                {ndviData.ndvi_value.toFixed(3)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Range: -1.0 a +1.0
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Salute Vegetazione</span>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <div className={`text-lg font-bold px-2 py-1 rounded border ${getHealthColor(ndviData.analysis.vegetation_health)}`}>
                {ndviData.analysis.vegetation_health.toUpperCase()}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Trend</span>
                {getTrendIcon()}
              </div>
              <div className="text-lg font-bold text-gray-700">
                {trend.length >= 2 ? (
                  trend.slice(-3).reduce((sum, t) => sum + t.ndvi, 0) / 3 > 
                  trend.slice(0, 3).reduce((sum, t) => sum + t.ndvi, 0) / 3 + 0.05 ? 'Miglioramento' :
                  trend.slice(-3).reduce((sum, t) => sum + t.ndvi, 0) / 3 < 
                  trend.slice(0, 3).reduce((sum, t) => sum + t.ndvi, 0) / 3 - 0.05 ? 'Peggioramento' : 'Stabile'
                ) : 'N/A'}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Ultimo Aggiornamento</span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-sm font-bold text-gray-700">
                {new Date(ndviData.date).toLocaleDateString('it-IT')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {ndviData.satellite_source.toUpperCase()} - {ndviData.resolution_meters}m
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Panoramica', icon: Activity },
              { id: 'map', label: 'Mappa NDVI', icon: MapPin },
              { id: 'zones', label: 'Zone', icon: MapPin },
              { id: 'trend', label: 'Trend Storico', icon: TrendingUp },
              { id: 'stress', label: 'Aree Stress', icon: AlertTriangle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && ndviData && (
            <div className="space-y-6">
              {/* Stress Indicators */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicatori di Stress</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${ndviData.analysis.stress_indicators.water_stress ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Droplets className={`w-5 h-5 ${ndviData.analysis.stress_indicators.water_stress ? 'text-red-600' : 'text-green-600'}`} />
                      <span className="font-medium">Stress Idrico</span>
                    </div>
                    <div className={`text-sm ${ndviData.analysis.stress_indicators.water_stress ? 'text-red-700' : 'text-green-700'}`}>
                      {ndviData.analysis.stress_indicators.water_stress ? 'Rilevato' : 'Non rilevato'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${ndviData.analysis.stress_indicators.nutrient_deficiency ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Leaf className={`w-5 h-5 ${ndviData.analysis.stress_indicators.nutrient_deficiency ? 'text-orange-600' : 'text-green-600'}`} />
                      <span className="font-medium">Carenza Nutrizionale</span>
                    </div>
                    <div className={`text-sm ${ndviData.analysis.stress_indicators.nutrient_deficiency ? 'text-orange-700' : 'text-green-700'}`}>
                      {ndviData.analysis.stress_indicators.nutrient_deficiency ? 'Possibile' : 'Non rilevata'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${ndviData.analysis.stress_indicators.disease_risk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${ndviData.analysis.stress_indicators.disease_risk ? 'text-red-600' : 'text-green-600'}`} />
                      <span className="font-medium">Rischio Malattie</span>
                    </div>
                    <div className={`text-sm ${ndviData.analysis.stress_indicators.disease_risk ? 'text-red-700' : 'text-green-700'}`}>
                      {ndviData.analysis.stress_indicators.disease_risk ? 'Elevato' : 'Basso'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Raccomandazioni</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {ndviData.analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3 text-blue-800">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Mappa NDVI Interattiva</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Satellite className="w-4 h-4" />
                  <span>Sentinel-2 • 10m • OrtoMio WMS</span>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <NDVIMap garden={garden} />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Come usare la mappa NDVI:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Colori caldi (rosso/arancio)</strong>: Zone con stress o problemi</li>
                      <li>• <strong>Colori freddi (verde)</strong>: Vegetazione sana e densa</li>
                      <li>• <strong>Controlli</strong>: Usa i pulsanti per zoom, opacità e reset vista</li>
                      <li>• <strong>Rettangolo blu</strong>: Confini del tuo garden</li>
                      <li>• <strong>Risoluzione</strong>: Ogni pixel = 10x10 metri reali</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zones Tab */}
          {activeTab === 'zones' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Analisi per Zone</h3>
              {zones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
                  {zones.map(zone => (
                    <div key={zone.zone_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{zone.zone_name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{zone.area_hectares.toFixed(2)} ha</span>
                          
                          {/* Action Button per zone con NDVI basso */}
                          {zone.avg_ndvi < 0.6 && (
                            <ActionButton
                              sourceType="ndvi"
                              sourceData={{
                                ndvi_value: zone.avg_ndvi,
                                min_ndvi: zone.min_ndvi,
                                max_ndvi: zone.max_ndvi,
                                health_distribution: zone.health_distribution,
                                area_hectares: zone.area_hectares
                              }}
                              zoneId={zone.zone_id}
                              zoneName={zone.zone_name}
                              urgency={getUrgencyFromNDVI(zone.avg_ndvi)}
                              onActionSelected={handleActionSelected}
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">NDVI Medio:</span>
                          <span className={`font-bold ${getNDVIColor(zone.avg_ndvi)}`}>
                            {zone.avg_ndvi.toFixed(3)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Range:</span>
                          <span className="text-sm font-mono">
                            {zone.min_ndvi.toFixed(3)} - {zone.max_ndvi.toFixed(3)}
                          </span>
                        </div>

                        {/* Health Distribution */}
                        <div>
                          <span className="text-sm text-gray-600 block mb-2">Distribuzione Salute:</span>
                          <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-600" style={{ width: `${zone.health_distribution.excellent}%` }}></div>
                            <div className="bg-green-400" style={{ width: `${zone.health_distribution.good}%` }}></div>
                            <div className="bg-yellow-full max-w-sm" style={{ width: `${zone.health_distribution.moderate}%` }}></div>
                            <div className="bg-orange-400" style={{ width: `${zone.health_distribution.poor}%` }}></div>
                            <div className="bg-red-500" style={{ width: `${zone.health_distribution.critical}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Eccellente</span>
                            <span>Critico</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessuna zona definita. L'analisi viene effettuata sull'intera area del garden.</p>
                </div>
              )}
            </div>
          )}

          {/* Trend Tab */}
          {activeTab === 'trend' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Trend Storico NDVI</h3>
              {trend.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="h-64 flex items-end justify-between gap-3">
                    {trend.map((point, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-full rounded-t ${getNDVIColor(point.ndvi).replace('text-', 'bg-')}`}
                          style={{ height: `${point.ndvi * 100}%`, minHeight: '4px' }}
                        ></div>
                        {index % 5 === 0 && (
                          <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                            {new Date(point.date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-4">
                    <span>NDVI: 0.0</span>
                    <span>1.0</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Dati storici non disponibili</p>
                </div>
              )}
            </div>
          )}

          {/* Stress Areas Tab */}
          {activeTab === 'stress' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Aree con Stress Rilevato</h3>
              {stressAreas.length > 0 ? (
                <div className="space-y-4">
                  {stressAreas.map((area, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-900">
                            Stress {area.stress_type === 'water' ? 'Idrico' : 
                                   area.stress_type === 'nutrient' ? 'Nutrizionale' : 
                                   area.stress_type === 'disease' ? 'Fitosanitario' : 'Sconosciuto'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            area.severity === 'high' ? 'bg-red-100 text-red-800' :
                            area.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {area.severity === 'high' ? 'Alto' : 
                             area.severity === 'medium' ? 'Medio' : 'Basso'}
                          </span>
                          
                          {/* Action Button per area di stress */}
                          <ActionButton
                            sourceType="ndvi"
                            sourceData={{
                              ndvi_value: area.avg_ndvi || 0.3,
                              stress_type: area.stress_type,
                              severity: area.severity,
                              affected_area_m2: area.affected_area_m2,
                              recommendations: area.recommendations
                            }}
                            zoneName={`Area Stress ${index + 1}`}
                            urgency={area.severity === 'high' ? 'critical' : 
                                    area.severity === 'medium' ? 'high' : 'medium'}
                            onActionSelected={handleActionSelected}
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Area interessata: </span>
                        <span className="font-medium">{(area.affected_area_m2 / 10000).toFixed(2)} ha</span>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-700 block mb-2">Raccomandazioni:</span>
                        <ul className="space-y-1">
                          {area.recommendations.map((rec: string, recIndex: number) => (
                            <li key={recIndex} className="flex items-start gap-3 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Leaf className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessuna area con stress rilevata. La vegetazione appare in buona salute.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Intervention Wizard */}
      {wizardOpen && selectedAction && actionContext && (
        <InterventionWizard
          isOpen={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setSelectedAction(null);
            setActionContext(null);
          }}
          actionType={selectedAction}
          context={actionContext}
          garden={garden}
          onInterventionCreated={handleInterventionCreated}
        />
      )}
    </div>
  );
};

export default NDVIDashboard;