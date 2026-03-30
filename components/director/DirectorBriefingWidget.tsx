'use client'

/**
 * DIRECTOR BRIEFING WIDGET
 * 
 * Mostra il briefing giornaliero orchestrato dal Director Service
 * con azioni prioritizzate, meteo, insights agronomici e raccomandazioni.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Droplets,
  Sun,
  Moon,
  Zap,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react'
import { directorService, type DailyBriefing, type PrioritizedAction } from '@/services/directorService'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  formatAgronomicEconomicSummary,
  type AgronomicEconomicPrioritySummary,
} from '@/services/agronomicEconomicPriorityService'
import {
  humanizeAgronomicSignal,
  stripAgronomicQueueTaskMetadata,
} from '@/services/agronomicQueueTaskService'

interface DirectorBriefingWidgetProps {
  compact?: boolean
  maxActions?: number
}

export default function DirectorBriefingWidget({ 
  compact = false,
  maxActions = 5 
}: DirectorBriefingWidgetProps) {
  const { user } = useAuth()
  const { activeGarden } = useGarden()
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(!compact)

  useEffect(() => {
    if (user && activeGarden) {
      loadBriefing()
    }
  }, [user, activeGarden])

  const loadBriefing = async () => {
    if (!user || !activeGarden) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await directorService.getDailyBriefing(user.id, activeGarden.id)
      setBriefing(data)
    } catch (err) {
      console.error('Error loading briefing:', err)
      setError('Impossibile caricare il briefing')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Caricamento briefing...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !briefing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Briefing Giornaliero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'Nessun dato disponibile'}
          </p>
          <Button onClick={loadBriefing} variant="outline" size="sm" className="mt-4">
            Riprova
          </Button>
        </CardContent>
      </Card>
    )
  }

  const priorityColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'default'
      case 'MEDIUM': return 'secondary'
      case 'LOW': return 'outline'
      default: return 'secondary'
    }
  }

  const priorityIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />
      case 'HIGH': return <Zap className="h-4 w-4" />
      case 'MEDIUM': return <Clock className="h-4 w-4" />
      case 'LOW': return <Info className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const queueSourceLabel = (source: string) => {
    switch (source) {
      case 'health':
        return 'Salute'
      case 'irrigation':
        return 'Irrigazione'
      case 'prescription':
        return 'Prescription'
      case 'phenology':
        return 'Fenologia'
      case 'director':
      default:
        return 'Director'
    }
  }

  const queueFocusLabel = (focus: string) => {
    switch (focus) {
      case 'water':
        return 'Acqua'
      case 'nutrition':
        return 'Nutrizione'
      case 'quality':
        return 'Qualita'
      case 'health':
      default:
        return 'Salute'
    }
  }

  const urgencyTone = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'destructive'
      case 'next_cycle':
        return 'default'
      case 'monitor':
      default:
        return 'secondary'
    }
  }

  const getEconomicSummary = (value: Record<string, unknown> | undefined): AgronomicEconomicPrioritySummary | null => {
    if (!value || !('economicSummary' in value)) {
      return null
    }

    return (value.economicSummary as AgronomicEconomicPrioritySummary | null | undefined) || null
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Briefing Giornaliero
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {format(briefing.date, 'EEEE d MMMM yyyy', { locale: it })}
            </p>
          </div>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">{briefing.summary}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-background rounded border">
            <div className="text-2xl font-bold text-destructive">
              {briefing.stats.criticalCount}
            </div>
            <div className="text-xs text-muted-foreground">Critiche</div>
          </div>
          <div className="text-center p-2 bg-background rounded border">
            <div className="text-2xl font-bold text-orange-500">
              {briefing.stats.highCount}
            </div>
            <div className="text-xs text-muted-foreground">Prioritarie</div>
          </div>
          <div className="text-center p-2 bg-background rounded border">
            <div className="text-2xl font-bold text-primary">
              {briefing.stats.totalSuggestions}
            </div>
            <div className="text-xs text-muted-foreground">Totali</div>
          </div>
        </div>

        {expanded && (
          <>
            {/* Weather Summary */}
            {briefing.weatherSummary && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Meteo
                </h4>
                <div className="flex items-center gap-4 text-sm">
                  {briefing.weatherSummary.temp_min !== undefined && (
                    <span>
                      🌡️ {briefing.weatherSummary.temp_min}° - {briefing.weatherSummary.temp_max}°C
                    </span>
                  )}
                  {briefing.weatherSummary.precipitation_mm !== undefined && briefing.weatherSummary.precipitation_mm > 0 && (
                    <span>
                      <Droplets className="h-4 w-4 inline mr-1" />
                      {briefing.weatherSummary.precipitation_mm}mm
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Lunar Phase */}
            {briefing.lunarPhase?.phase && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Fase Lunare
                </h4>
                <p className="text-sm text-muted-foreground">
                  {briefing.lunarPhase.phase}
                  {briefing.lunarPhase.favorable_for && briefing.lunarPhase.favorable_for.length > 0 && (
                    <span className="ml-2">
                      • Favorevole per: {briefing.lunarPhase.favorable_for.join(', ')}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Critical Actions */}
            {briefing.criticalActions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Azioni Prioritarie
                </h4>
                <div className="space-y-2">
                  {briefing.criticalActions.slice(0, maxActions).map((action) => (
                    <div
                      key={action.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={priorityColor(action.type) as any}>
                              {priorityIcon(action.type)}
                              <span className="ml-1">{action.type}</span>
                            </Badge>
                            <span className="text-sm font-medium">{action.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                          {action.reasoning && (
                            <p className="text-xs text-muted-foreground italic">
                              💡 {action.reasoning}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {action.priorityScore}
                          </div>
                          <div className="text-xs text-muted-foreground">score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transversal Queue */}
            {briefing.transversalQueue.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Coda Trasversale
                </h4>
                <div className="space-y-2">
                  {briefing.transversalQueue.slice(0, maxActions).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg bg-background/70"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{queueSourceLabel(item.source)}</Badge>
                            <Badge variant="secondary">{queueFocusLabel(item.focus)}</Badge>
                            <Badge variant={urgencyTone(item.urgencyLabel) as any}>
                              {item.urgencyLabel === 'immediate'
                                ? 'Subito'
                                : item.urgencyLabel === 'next_cycle'
                                  ? 'Prossimo ciclo'
                                  : 'Monitorare'}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium">{stripAgronomicQueueTaskMetadata(item.title)}</div>
                          <p className="text-xs text-muted-foreground">
                            {stripAgronomicQueueTaskMetadata(item.description)}
                          </p>
                          {formatAgronomicEconomicSummary(getEconomicSummary(item.metadata)) && (
                            <p className="text-xs text-emerald-700">
                              ROI stimato: {formatAgronomicEconomicSummary(getEconomicSummary(item.metadata))}
                            </p>
                          )}
                          {item.missingSignals.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Segnali mancanti: {item.missingSignals.slice(0, 3).map(humanizeAgronomicSignal).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-primary">
                            {item.priorityScore}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            conf. {(item.priorityConfidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {briefing.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Raccomandazioni
                </h4>
                <ul className="space-y-1">
                  {briefing.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Agronomic Insights */}
            {briefing.agronomicInsights && Object.keys(briefing.agronomicInsights).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Dati Agronomici</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {briefing.agronomicInsights.gdd_base_10 !== undefined && (
                    <div className="p-2 bg-background rounded border">
                      <div className="text-muted-foreground">GDD Base 10</div>
                      <div className="font-semibold">{briefing.agronomicInsights.gdd_base_10.toFixed(1)}°</div>
                    </div>
                  )}
                  {briefing.agronomicInsights.water_stress_index !== undefined && (
                    <div className="p-2 bg-background rounded border">
                      <div className="text-muted-foreground">Stress Idrico</div>
                      <div className="font-semibold">{(briefing.agronomicInsights.water_stress_index * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {briefing.agronomicInsights.heat_stress_hours !== undefined && (
                    <div className="p-2 bg-background rounded border">
                      <div className="text-muted-foreground">Stress Termico</div>
                      <div className="font-semibold">{briefing.agronomicInsights.heat_stress_hours}h</div>
                    </div>
                  )}
                  {briefing.agronomicInsights.photoperiod_hours !== undefined && (
                    <div className="p-2 bg-background rounded border">
                      <div className="text-muted-foreground">Fotoperiodo</div>
                      <div className="font-semibold">{briefing.agronomicInsights.photoperiod_hours.toFixed(1)}h</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Refresh Button */}
        <Button 
          onClick={loadBriefing} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          Aggiorna Briefing
        </Button>
      </CardContent>
    </Card>
  )
}
