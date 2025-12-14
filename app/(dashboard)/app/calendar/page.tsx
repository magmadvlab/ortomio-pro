/**
 * Calendar Page - Next.js Route
 * Vista principale calendario con integrazione task, meteo, luna
 */

'use client'

import React, { useState, useEffect } from 'react';
import CalendarAlmanac from '@/components/CalendarAlmanac';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { GardenTask, Garden } from '@/types';

export default function CalendarPage() {
  const { storageProvider } = useStorage();
  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const gardens = await storageProvider.getGardens();
        if (gardens.length > 0) {
          setGarden(gardens[0]);
          const gardenTasks = await storageProvider.getTasks(gardens[0].id);
          setTasks(gardenTasks);
        }
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [storageProvider]);

  const handleDateClick = (date: Date) => {
    // Navigate to journal or show tasks for that date
    console.log('Date clicked:', date);
  };

  const handleUpdateTask = async (task: GardenTask) => {
    try {
      await storageProvider.updateTask(task.id, task);
      // Reload tasks
      if (garden) {
        const updatedTasks = await storageProvider.getTasks(garden.id);
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CalendarAlmanac
        tasks={tasks}
        onDateClick={handleDateClick}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
}
