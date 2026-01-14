/**
 * ChallengeSection - Sezione Challenge separata dal calendario
 * Posizionata sotto il calendario in "Il Mio Orto"
 */

import React, { useState, useEffect } from 'react'
import { 
  Target, 
  Trophy, 
  CheckCircle, 
  Clock, 
  Star, 
  Zap, 
  Award,
  TrendingUp,
  Calendar,
  Plus,
  Flame
} from 'lucide-react'
import { GardenTask } from '@/types'
import { format, isToday, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

interface DailyChallenge {
  id: string
  date: string
  title: string
  description: string
  type: 'task' | 'photo' | 'harvest' | 'learning' | 'social'
  difficulty: 'easy' | 'medium' | 'hard'
  xp: number
  badge?: {
    emoji: string
    name: string
  }
  actions: {
    id: string
    description: string
    completed: boolean
    linkedTaskId?: string
  }[]
  completed: boolean
  completedAt?: string
}

interface ChallengeSectionProps {
  tasks?: GardenTask[]
  onTaskUpdate?: (task: GardenTask) => void
  onChallengeComplete?: (challenge: DailyChallenge) => void
}

export default function ChallengeSection({
  tasks = [],
  onTaskUpdate,
  onChallengeComplete
}: ChallengeSectionProps) {
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null)
  const [weekChallenges, setWeekChallenges] = useState<DailyChallenge[]>([])
  const [userStats, setUserStats] = useState({
    totalXP: 1250,
    streak: 7,
    completedToday: 2,
    weeklyTarget: 5,
    level: 12,
    nextLevelXP: 1500
  })

  useEffect(() => {
    generateTodayChallenge()
    generateWeekChallenges()
  }, [tasks])

  const generateTodayChallenge = () => {
    const today = new Date()
    const todayTasks = tasks.filter(t => {
      const taskDate = t.suggestedDate ? parseISO(t.suggestedDate) : parseISO(t.date)
      return isToday(taskDate)
    })

    // Genera challenge intelligente per oggi
    const challenge: DailyChallenge = {
      id: `today-${format(today, 'yyyy-MM-dd')}`,
      date: format(today, 'yyyy-MM-dd'),
      title: '🌱 Maestro del Giorno',
      description: 'Completa tutte le attività pianificate e documenta i progressi',
      type: 'task',
      difficulty: todayTasks.length > 3 ? 'hard' : todayTasks.length > 1 ? 'medium' : 'easy',
      xp: todayTasks.length > 3 ? 200 : todayTasks.length > 1 ? 150 : 100,
      badge: {
        emoji: '🏆',
        name: 'Giardiniere del Giorno'
      },
      actions: [
        {
          id: 'complete-tasks',
          description: `Completa ${todayTasks.length} task pianificati`,
          completed: todayTasks.every(t => t.completed)
        },
        {
          id: 'photo-progress',
          description: 'Scatta una foto dei progressi',
          completed: false
        },
        {
          id: 'log-notes',
          description: 'Aggiungi note sulle osservazioni',
          completed: false
        }
      ],
      completed: false
    }

    setTodayChallenge(challenge)
  }

  const generateWeekChallenges = () => {
    const challenges: DailyChallenge[] = [
      {
        id: 'week-planner',
        date: format(new Date(), 'yyyy-MM-dd'),
        title: '📋 Pianificatore Settimanale',
        description: 'Pianifica tutte le attività della settimana',
        type: 'task',
        difficulty: 'medium',
        xp: 150,
        actions: [
          { id: 'plan-week', description: 'Pianifica 7 giorni di attività', completed: false },
          { id: 'check-weather', description: 'Controlla previsioni meteo', completed: false }
        ],
        completed: false
      },
      {
        id: 'week-harvest',
        date: format(new Date(), 'yyyy-MM-dd'),
        title: '🥕 Raccoglitore Esperto',
        description: 'Raccogli e pesa tutti i prodotti maturi',
        type: 'harvest',
        difficulty: 'easy',
        xp: 100,
        actions: [
          { id: 'harvest-all', description: 'Raccogli tutti i prodotti maturi', completed: false },
          { id: 'weigh-produce', description: 'Pesa e registra il raccolto', completed: false }
        ],
        completed: false
      },
      {
        id: 'week-social',
        date: format(new Date(), 'yyyy-MM-dd'),
        title: '📸 Condivisore Social',
        description: 'Condividi i tuoi progressi con la community',
        type: 'social',
        difficulty: 'easy',
        xp: 75,
        actions: [
          { id: 'take-photos', description: 'Scatta 3 foto del tuo orto', completed: false },
          { id: 'share-progress', description: 'Condividi sui social', completed: false }
        ],
        completed: false
      }
    ]

    setWeekChallenges(challenges)
  }

  const handleChallengeActionComplete = (challengeId: string, actionId: string) => {
    // Aggiorna challenge giornaliera
    if (todayChallenge && todayChallenge.id === challengeId) {
      const updatedActions = todayChallenge.actions.map(action => 
        action.id === actionId ? { ...action, completed: true } : action
      )
      
      const allCompleted = updatedActions.every(action => action.completed)
      
      const updatedChallenge = {
        ...todayChallenge,
        actions: updatedActions,
        completed: allCompleted,
        completedAt: allCompleted ? new Date().toISOString() : undefined
      }

      setTodayChallenge(updatedChallenge)

      if (allCompleted && onChallengeComplete) {
        onChallengeComplete(updatedChallenge)
        // Aggiorna stats
        setUserStats(prev => ({
          ...prev,
          totalXP: prev.totalXP + updatedChallenge.xp,
          completedToday: prev.completedToday + 1
        }))
      }
    }

    // Aggiorna challenge settimanali
    setWeekChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        const updatedActions = challenge.actions.map(action => 
          action.id === actionId ? { ...action, completed: true } : action
        )
        
        const allCompleted = updatedActions.every(action => action.completed)
        
        return {
          ...challenge,
          actions: updatedActions,
          completed: allCompleted,
          completedAt: allCompleted ? new Date().toISOString() : undefined
        }
      }
      return challenge
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header Challenge */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              🎯 Challenge Giornaliere
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                Livello {userStats.level}
              </span>
            </h2>
            <p className="text-purple-100 mt-1">
              Completa le sfide per guadagnare XP e sbloccare badge speciali
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold">{userStats.totalXP} XP</div>
            <div className="text-sm text-purple-200">
              {userStats.nextLevelXP - userStats.totalXP} XP al prossimo livello
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-3 mb-4">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ 
              width: `${(userStats.totalXP / userStats.nextLevelXP) * 100}%` 
            }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Flame className="text-orange-300" size={20} />
              {userStats.streak}
            </div>
            <div className="text-xs text-purple-200">Giorni Consecutivi</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{userStats.completedToday}</div>
            <div className="text-xs text-purple-200">Completate Oggi</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{userStats.weeklyTarget}</div>
            <div className="text-xs text-purple-200">Obiettivo Settimanale</div>
          </div>
        </div>
      </div>

      {/* Challenge di Oggi */}
      {todayChallenge && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-purple-600" size={24} />
                Challenge di Oggi
              </h3>
              <p className="text-gray-600 mt-1">
                {format(new Date(), 'EEEE d MMMM', { locale: it })}
              </p>
            </div>
            
            {todayChallenge.completed ? (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full flex items-center gap-2">
                <CheckCircle size={16} />
                Completata!
              </div>
            ) : (
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full flex items-center gap-2">
                <Clock size={16} />
                In corso
              </div>
            )}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-purple-900">{todayChallenge.title}</h4>
                <p className="text-sm text-purple-700 mt-1">{todayChallenge.description}</p>
              </div>
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                +{todayChallenge.xp} XP
              </span>
            </div>
            
            <div className="space-y-2">
              {todayChallenge.actions.map(action => (
                <div
                  key={action.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${action.completed ? 'bg-green-100 border border-green-200' : 'bg-white border border-gray-200'}
                  `}
                >
                  <span className={`${action.completed ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                    {action.description}
                  </span>
                  {!action.completed ? (
                    <button
                      onClick={() => handleChallengeActionComplete(todayChallenge.id, action.id)}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                    >
                      Completa
                    </button>
                  ) : (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Challenge Settimanali */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-600" size={24} />
            Challenge Settimanali
          </h3>
          <span className="text-sm text-gray-600">
            {weekChallenges.filter(c => c.completed).length}/{weekChallenges.length} completate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weekChallenges.map(challenge => (
            <div
              key={challenge.id}
              className={`
                border-2 rounded-lg p-4 transition-all
                ${challenge.completed 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-purple-300'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-bold
                  ${challenge.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                  }
                `}>
                  +{challenge.xp} XP
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              
              <div className="space-y-2">
                {challenge.actions.map(action => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className={action.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                      {action.description}
                    </span>
                    {action.completed ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <button
                        onClick={() => handleChallengeActionComplete(challenge.id, action.id)}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Fai
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge Recenti */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="text-yellow-600" size={20} />
          Badge Sbloccati di Recente
        </h3>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {[
            { emoji: '🌱', name: 'Seminatore', desc: 'Prima semina completata' },
            { emoji: '💧', name: 'Irrigatore', desc: '7 giorni di irrigazione' },
            { emoji: '📸', name: 'Fotografo', desc: '10 foto caricate' },
            { emoji: '🏆', name: 'Campione', desc: '5 challenge completate' },
            { emoji: '🔥', name: 'Streak Master', desc: '7 giorni consecutivi' }
          ].map((badge, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-white border border-yellow-300 rounded-lg p-3 text-center min-w-[120px]"
            >
              <div className="text-2xl mb-1">{badge.emoji}</div>
              <div className="font-semibold text-sm text-gray-900">{badge.name}</div>
              <div className="text-xs text-gray-600">{badge.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}