'use client'

import React from 'react'
import Journal from '@/components/Journal'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'

export default function JournalPage() {
  const { storageProvider } = useStorage()
  const [tasks, setTasks] = React.useState<any[]>([])
  const [garden, setGarden] = React.useState<any>(null)
  
  React.useEffect(() => {
    const loadData = async () => {
      const gardens = await storageProvider.getGardens()
      if (gardens.length > 0) {
        setGarden(gardens[0])
        const gardenTasks = await storageProvider.getTasks(gardens[0].id)
        setTasks(gardenTasks)
      }
    }
    loadData()
  }, [storageProvider])
  
  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task) {
      await storageProvider.updateTask(id, { completed: !task.completed })
      const updatedTasks = await storageProvider.getTasks(garden?.id)
      setTasks(updatedTasks)
    }
  }
  
  const handleAddTask = async (task: any) => {
    await storageProvider.createTask({ ...task, gardenId: garden.id })
    const updatedTasks = await storageProvider.getTasks(garden?.id)
    setTasks(updatedTasks)
  }
  
  const handleDeleteTask = async (id: string) => {
    await storageProvider.deleteTask(id)
    const updatedTasks = await storageProvider.getTasks(garden?.id)
    setTasks(updatedTasks)
  }
  
  const handleUpdateTask = async (task: any) => {
    await storageProvider.updateTask(task.id, task)
    const updatedTasks = await storageProvider.getTasks(garden?.id)
    setTasks(updatedTasks)
  }
  
  if (!garden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen">
      <Journal
        tasks={tasks}
        garden={garden}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  )
}

