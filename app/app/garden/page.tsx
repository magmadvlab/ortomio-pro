'use client'

import { GardenView } from '@/components/garden/GardenView'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useState, useEffect } from 'react'
import { Garden, GardenTask } from '@/types'

export default function GardenPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'operations' | 'planning' | 'monitoring' | 'plants' | 'compliance' | 'analytics' | 'structure'>('operations')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedGardens, loadedTasks] = await Promise.all([
          storageProvider.getGardens(),
          storageProvider.getTasks()
        ])
        setGardens(loadedGardens)
        setTasks(loadedTasks)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  const handleToggleTask = async (id: string) => {
    try {
      const task = (tasks || []).find(t => t.id === id)
      if (task) {
        const updatedTask = { ...task, completed: !task.completed }
        await storageProvider.updateTask(id, updatedTask)
        setTasks(prev => (prev || []).map(t => t.id === id ? updatedTask : t))
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleAddTask = async (taskData: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => {
    try {
      const newTask: GardenTask = {
        ...taskData,
        id: Date.now().toString(),
        completed: false,
        gardenId: gardens[0]?.id || ''
      }
      await storageProvider.createTask(newTask)
      setTasks(prev => [...prev, newTask])
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await storageProvider.deleteTask(id)
      setTasks(prev => (prev || []).filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleUpdateTask = async (updatedTask: GardenTask) => {
    try {
      await storageProvider.updateTask(updatedTask.id, updatedTask)
      setTasks(prev => (prev || []).map(t => t.id === updatedTask.id ? updatedTask : t))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (gardens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nessun orto trovato</h2>
          <p className="text-gray-600 mb-6">Crea il tuo primo orto per iniziare</p>
          <button 
            onClick={() => {
              // TODO: Implementare creazione orto
              console.log('Create garden')
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Crea il tuo orto
          </button>
        </div>
      </div>
    )
  }

  const defaultGarden = gardens[0]
  const gardenTasks = (tasks || []).filter(task => task.gardenId === defaultGarden.id)

  return (
    <div className="p-6">
      <GardenView
        garden={defaultGarden}
        tasks={gardenTasks}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  )
}