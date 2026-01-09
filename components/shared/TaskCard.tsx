'use client'

import React, { useState } from 'react'
import { GardenTask, HarvestLogData, FertilizerApplicationLogDB } from '@/types'
import { CheckCircle2, Circle, Clock, MapPin, Calendar, MoreVertical, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { isPlantMature } from '@/utils/plantMaturityDetector'
import { QuickHarvestForm } from '@/components/harvest/QuickHarvestForm'
import { FertilizerApplicationModal } from '@/components/fertilizer/FertilizerApplicationModal'
import { useChallengeNotifications } from '@/hooks/useChallengeNotifications'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { AchievementNotification } from './AchievementNotification'

interface TaskCardProps {
  task: GardenTask
  onComplete: (id: string) => void
  onReschedule?: (id: string) => void
  onEdit?: (task: GardenTask) => void
  onDelete?: (id: string) => void
  onHarvest?: (harvestData: Omit<HarvestLogData, 'id' | 'gardenId'>) => void
  onFertilize?: (fertData: Omit<FertilizerApplicationLogDB, 'id' | 'createdAt'>) => void
  showSuggestions?: boolean
  compact?: boolean // Layout compatto per grid
}

export function TaskCard({
  task,
  onComplete,
  onReschedule,
  onEdit,
  onDelete,
  onHarvest,
  onFertilize,
  showSuggestions = false,
  compact = false
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [showHarvestPrompt, setShowHarvestPrompt] = useState(false)
  const [showFertilizerPrompt, setShowFertilizerPrompt] = useState(false)
  const [completedTask, setCompletedTask] = useState<GardenTask | null>(null)
  const { user } = useAuth()
  const { checkChallengeProgress, showChallengeNotification, hideNotification, activeNotification } = useChallengeNotifications()

  const handleComplete = async () => {
    // Completa il task
    await onComplete(task.id)
    
    // Crea task completato per verificare maturità
    const updatedTask = { ...task, completed: true }
    
    // Verifica achievement/challenge progress
    if (user?.id) {
      const actionType = 
        task.taskType === 'Sowing' ? 'sowing' :
        task.taskType === 'Harvest' ? 'harvest' :
        task.taskType === 'Treatment' ? 'treatment' :
        task.taskType === 'Fertilize' ? 'fertilize' :
        'task_complete'
      
      const challengeProgress = await checkChallengeProgress(
        actionType,
        user.id,
        { gardenId: task.gardenId }
      )
      
      if (challengeProgress) {
        showChallengeNotification(challengeProgress)
      }
    }
    
    // Se la pianta è matura, mostra prompt raccolto
    if (isPlantMature(updatedTask) && onHarvest) {
      setCompletedTask(updatedTask)
      setShowHarvestPrompt(true)
    }

    // NEW: Se task è Fertilize, mostra prompt fertilizzazione
    if (task.taskType === 'Fertilize' && onFertilize) {
      setCompletedTask(updatedTask)
      setShowFertilizerPrompt(true)
    }
  }

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'Sowing': 'Semina',
      'Transplant': 'Trapianto',
      'Fertilize': 'Concimazione',
      'Treatment': 'Trattamento',
      'Prune': 'Potatura',
      'Harvest': 'Raccolta',
      'Watering': 'Irrigazione'
    }
    return labels[type] || type
  }

  const getLocationLabel = (loc?: string) => {
    if (!loc) return null
    const labels: Record<string, string> = {
      'Pot': 'Vaso',
      'RaisedBed': 'Letto',
      'Tray': 'Vassoio',
      'Ground': 'Terra'
    }
    return labels[loc] || loc
  }

  const getTimeLabel = (date?: string) => {
    if (!date) return null
    try {
      const taskDate = parseISO(date)
      const now = new Date()
      const hoursDiff = Math.floor((taskDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      if (hoursDiff < 0) return 'Scaduto'
      if (hoursDiff === 0) return 'Adesso'
      if (hoursDiff < 24) return `Tra ${hoursDiff}h`
      return format(taskDate, 'HH:mm', { locale: it })
    } catch {
      return null
    }
  }

  const getWeatherSuggestion = () => {
    // Suggerimenti basati su tipo task e condizioni meteo
    if (task.taskType === 'Sowing') {
      return '🌱 Condizioni ottimali per seminare'
    }
    if (task.taskType === 'Transplant') {
      return '🌿 Buon momento per trapiantare'
    }
    if (task.taskType === 'Fertilize') {
      return '🌿 Fertilizza nelle ore più fresche della giornata'
    }
    if (task.taskType === 'Irrigation') {
      return '💧 Irriga al mattino presto o alla sera'
    }
    if (task.taskType === 'Pruning') {
      return '✂️ Pota in giornate asciutte per evitare malattie'
    }
    if (task.taskType === 'Harvest') {
      return '🛒 Raccogli nelle ore più fresche per mantenere la qualità'
    }
    if (task.taskType === 'Treatment') {
      return '🌿 Applica trattamenti nelle ore più fresche'
    }
    if (task.taskType === 'Prune') {
      return '✂️ Pota in giornate asciutte per evitare malattie'
    }
    // Fallback per task types non gestiti
    return '🌱 Segui le condizioni meteo per questa attività'
  }

  if (compact) {
    // Layout compatto per grid
    return (
      <div
        className={`bg-white rounded-xl border-2 p-4 transition-all ${
          task.completed
            ? 'border-green-200 bg-green-50 opacity-75'
            : 'border-gray-200 hover:border-green-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          {/* Checkbox */}
          <button
            onClick={handleComplete}
            className="mt-0.5 flex-shrink-0 p-0.5 hover:bg-gray-100 rounded transition-colors"
            aria-label={task.completed ? 'Segna come non completato' : 'Segna come completato'}
          >
            {task.completed ? (
              <CheckCircle2 size={22} className="text-green-600" strokeWidth={2} />
            ) : (
              <div className="w-[22px] h-[22px] border-2 border-gray-300 rounded-md hover:border-green-500 transition-colors" />
            )}
          </button>

          {/* Task Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">
              {task.plantName}
            </h3>
            <p className="text-xs text-gray-600">
              {getTaskTypeLabel(task.taskType)}
            </p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
          {task.nextDueDate && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {getTimeLabel(task.nextDueDate)}
            </span>
          )}
          {task.locationType && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {getLocationLabel(task.locationType)}
            </span>
          )}
        </div>

        {/* Tip */}
        {showSuggestions && !task.completed && getWeatherSuggestion() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
            <p className="text-xs text-green-700">
              {getWeatherSuggestion()}
            </p>
          </div>
        )}

        {/* Actions */}
        {!task.completed && (
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
            >
              ✓ Fatto
            </button>
            {onReschedule && (
              <button
                onClick={() => onReschedule(task.id)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                title="Rimanda"
              >
                ⏰
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Layout completo (default)
  return (
    <div
      className={`bg-white rounded-xl border-2 p-4 transition-all ${
        task.completed
          ? 'border-green-200 bg-green-50 opacity-75'
          : 'border-gray-200 hover:border-green-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox Grande Tap-Friendly */}
        <button
          onClick={handleComplete}
          className="mt-1 flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={task.completed ? 'Segna come non completato' : 'Segna come completato'}
        >
          {task.completed ? (
            <CheckCircle2 size={32} className="text-green-600" strokeWidth={2} />
          ) : (
            <Circle size={32} className="text-gray-400 hover:text-green-600 transition-colors" strokeWidth={2} />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {task.plantName}
                {task.variety && (
                  <span className="text-sm font-normal text-gray-600 ml-1">
                    ({task.variety})
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-700 font-medium">
                {getTaskTypeLabel(task.taskType)}
              </p>
            </div>

            {/* Actions Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Azioni"
              >
                <MoreVertical size={18} className="text-gray-500" />
              </button>
              
              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[160px]">
                    {onReschedule && !task.completed && (
                      <button
                        onClick={() => {
                          onReschedule(task.id)
                          setShowActions(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Clock size={16} />
                        Rimanda
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(task)
                          setShowActions(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        Modifica
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(task.id)
                          setShowActions(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <X size={16} />
                        Elimina
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info Contestuali Inline */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
            {task.nextDueDate && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span className="font-medium">{getTimeLabel(task.nextDueDate)}</span>
              </div>
            )}
            {task.date && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{format(parseISO(task.date), 'dd MMM yyyy', { locale: it })}</span>
              </div>
            )}
            {task.locationType && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{getLocationLabel(task.locationType)}</span>
              </div>
            )}
          </div>

          {/* Suggerimenti Smart */}
          {showSuggestions && !task.completed && getWeatherSuggestion() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-blue-700 font-medium">
                {getWeatherSuggestion()}
              </p>
            </div>
          )}

          {/* Note */}
          {task.notes && (
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
              {task.notes}
            </p>
          )}

          {/* Azioni Chiare */}
          {!task.completed && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Fatto
              </button>
              {onReschedule && (
                <button
                  onClick={() => onReschedule(task.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Clock size={16} />
                  Rimanda
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Harvest Prompt Modal */}
      {showHarvestPrompt && completedTask && onHarvest && (
        <QuickHarvestForm
          task={completedTask}
          onHarvest={(harvestData) => {
            onHarvest(harvestData)
            setShowHarvestPrompt(false)
            setCompletedTask(null)
          }}
          onSkip={() => {
            setShowHarvestPrompt(false)
            setCompletedTask(null)
          }}
        />
      )}

      {/* Fertilizer Application Modal */}
      {showFertilizerPrompt && completedTask && onFertilize && (
        <FertilizerApplicationModal
          task={completedTask}
          onApply={(fertData) => {
            onFertilize(fertData)
            setShowFertilizerPrompt(false)
            setCompletedTask(null)
          }}
          onSkip={() => {
            setShowFertilizerPrompt(false)
            setCompletedTask(null)
          }}
        />
      )}

      {/* Achievement Notification */}
      {activeNotification && (
        <AchievementNotification
          badge={{
            emoji: activeNotification.badge?.emoji || '🏆',
            name: activeNotification.badge?.name || activeNotification.title,
            description: activeNotification.message
          }}
          nextAchievement={activeNotification.isCompleted ? undefined : {
            name: activeNotification.title,
            progress: activeNotification.progress.current,
            target: activeNotification.progress.target
          }}
          onClose={hideNotification}
          autoClose={true}
          autoCloseDelay={5000}
        />
      )}
    </div>
  )
}

