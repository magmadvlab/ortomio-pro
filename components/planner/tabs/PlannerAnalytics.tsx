'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Target, Calendar, Leaf, Clock, Award, AlertTriangle } from 'lucide-react'

interface PlannerAnalyticsProps {
  garden: any
  tasks: any[]
  onAddToJournal: (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling', date?: string, taskType?: any, additionalData?: any) => void
  onUpdateTask: (task: any) => void
}

interface Analytics {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  completionRate: number
  plantVariety: number
  averageTasksPerWeek: number
  mostActivePlant: string
  upcomingDeadlines: number
  seasonalDistribution: Record<string, number>
  taskTypeDistribution: Record<string, number>
  monthlyProgress: Array<{ month: string; completed: number; total: number }>
}

export default function PlannerAnalytics({ garden, tasks }: PlannerAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    calculateAnalytics()
  }, [tasks, timeRange])

  const calculateAnalytics = () => {
    if (!tasks || tasks.length === 0) {
      setAnalytics(null)
      return
    }

    // Filtra tasks per periodo
    const now = new Date()
    const filterDate = new Date()
    
    switch (timeRange) {
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const filteredTasks = (tasks || []).filter(task => {
      if (!task.date) return true
      return new Date(task.date) >= filterDate
    })

    const totalTasks = filteredTasks.length
    const completedTasks = (filteredTasks || []).filter(task => task.completed).length
    const pendingTasks = totalTasks - completedTasks
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Varietà di piante
    const uniquePlants = new Set(filteredTasks.map(task => task.plantName).filter(Boolean))
    const plantVariety = uniquePlants.size

    // Media task per settimana
    const weeks = Math.max(1, Math.ceil((now.getTime() - filterDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    const averageTasksPerWeek = totalTasks / weeks

    // Pianta più attiva
    const plantCounts = filteredTasks.reduce((acc, task) => {
      if (task.plantName) {
        acc[task.plantName] = (acc[task.plantName] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    const mostActivePlant = Object.entries(plantCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Nessuna'

    // Scadenze imminenti (prossimi 7 giorni)
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)
    const upcomingDeadlines = (filteredTasks || []).filter(task => 
      task.date && !task.completed && new Date(task.date) <= nextWeek
    ).length

    // Distribuzione stagionale
    const seasonalDistribution = filteredTasks.reduce((acc, task) => {
      if (task.date) {
        const month = new Date(task.date).getMonth()
        const season = getSeason(month)
        acc[season] = (acc[season] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Distribuzione per tipo di task
    const taskTypeDistribution = filteredTasks.reduce((acc, task) => {
      const type = task.taskType || 'Altro'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Progresso mensile
    const monthlyProgress = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString('it-IT', { month: 'short' })
      
      const monthTasks = (filteredTasks || []).filter(task => {
        if (!task.date) return false
        const taskDate = new Date(task.date)
        return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear()
      })
      
      monthlyProgress.push({
        month: monthName,
        completed: (monthTasks || []).filter(t => t.completed).length,
        total: monthTasks.length
      })
    }

    setAnalytics({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      plantVariety,
      averageTasksPerWeek,
      mostActivePlant,
      upcomingDeadlines,
      seasonalDistribution,
      taskTypeDistribution,
      monthlyProgress
    })
  }

  const getSeason = (month: number): string => {
    if (month >= 2 && month <= 4) return 'Primavera'
    if (month >= 5 && month <= 7) return 'Estate'
    if (month >= 8 && month <= 10) return 'Autunno'
    return 'Inverno'
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100'
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <TrendingUp className="text-green-500" size={16} />
    if (value < threshold) return <TrendingDown className="text-red-500" size={16} />
    return <Target className="text-gray-500" size={16} />
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun dato disponibile</h3>
        <p className="text-gray-600">Aggiungi alcuni task al tuo piano per vedere le analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-purple-500" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Analytics del Planner</h2>
              <p className="text-gray-600">Analisi delle performance e tendenze del tuo orto</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'month', label: '1M' },
              { key: 'quarter', label: '3M' },
              { key: 'year', label: '1A' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-blue-500" size={20} />
            {getTrendIcon(analytics.completionRate, 70)}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.completionRate.toFixed(1)}%</h3>
          <p className="text-gray-600 text-sm">Tasso di Completamento</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analytics.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Leaf className="text-green-500" size={20} />
            {getTrendIcon(analytics.plantVariety, 5)}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.plantVariety}</h3>
          <p className="text-gray-600 text-sm">Varietà di Piante</p>
          <p className="text-xs text-gray-500 mt-1">Più attiva: {analytics.mostActivePlant}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-500" size={20} />
            {getTrendIcon(analytics.averageTasksPerWeek, 3)}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.averageTasksPerWeek.toFixed(1)}</h3>
          <p className="text-gray-600 text-sm">Task per Settimana</p>
          <p className="text-xs text-gray-500 mt-1">Media del periodo</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-red-500" size={20} />
            {analytics.upcomingDeadlines > 0 ? (
              <AlertTriangle className="text-red-500" size={16} />
            ) : (
              <Award className="text-green-500" size={16} />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.upcomingDeadlines}</h3>
          <p className="text-gray-600 text-sm">Scadenze Imminenti</p>
          <p className="text-xs text-gray-500 mt-1">Prossimi 7 giorni</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={16} />
            Progresso Mensile
          </h3>
          
          <div className="space-y-3">
            {analytics.monthlyProgress.map((month, index) => {
              const completionRate = month.total > 0 ? (month.completed / month.total) * 100 : 0
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 text-sm text-gray-600 font-medium">
                    {month.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {month.completed}/{month.total}
                      </span>
                      <span className="text-xs text-gray-500">
                        {completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Task Type Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} />
            Distribuzione per Tipo
          </h3>
          
          <div className="space-y-3">
            {Object.entries(analytics.taskTypeDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([type, count], index) => {
                const percentage = (count / analytics.totalTasks) * 100
                const colors = [
                  'bg-blue-500',
                  'bg-green-500', 
                  'bg-yellow-500',
                  'bg-purple-500',
                  'bg-red-500',
                  'bg-gray-500'
                ]
                
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{type}</span>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${colors[index]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Seasonal Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Leaf size={16} />
          Distribuzione Stagionale
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.seasonalDistribution).map(([season, count]) => {
            const percentage = (count / analytics.totalTasks) * 100
            const seasonColors = {
              'Primavera': 'bg-green-100 text-green-700 border-green-200',
              'Estate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
              'Autunno': 'bg-orange-100 text-orange-700 border-orange-200',
              'Inverno': 'bg-blue-100 text-blue-700 border-blue-200'
            }
            
            return (
              <div key={season} className={`border rounded-lg p-4 ${seasonColors[season as keyof typeof seasonColors]}`}>
                <h4 className="font-medium mb-2">{season}</h4>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm opacity-75">{percentage.toFixed(1)}% del totale</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Riepilogo Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(analytics.completionRate)}`}>
              {analytics.completionRate >= 80 ? '🏆 Eccellente' : 
               analytics.completionRate >= 60 ? '👍 Buono' : '⚠️ Da migliorare'}
            </div>
            <p className="text-gray-600 text-sm mt-2">Tasso di completamento</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.totalTasks}
            </div>
            <p className="text-gray-600 text-sm">Task totali nel periodo</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.pendingTasks}
            </div>
            <p className="text-gray-600 text-sm">Task ancora da completare</p>
          </div>
        </div>
      </div>
    </div>
  )
}