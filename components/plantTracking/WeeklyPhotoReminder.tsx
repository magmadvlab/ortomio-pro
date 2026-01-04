/**
 * Weekly Photo Reminder Widget
 * Mostra reminder attivi per foto settimanali
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Calendar, CheckCircle } from 'lucide-react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { useAuth } from '@/packages/core/hooks/useAuth';
import { getPendingReminders } from '@/services/weeklyPhotoReminder';
import { getSupabaseClient } from '@/config/supabase';

interface WeeklyPhotoReminderProps {
  onTakePhoto?: (taskId: string) => void;
}

export const WeeklyPhotoReminder: React.FC<WeeklyPhotoReminderProps> = ({
  onTakePhoto
}) => {
  const { storageProvider } = useStorage();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReminders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const pending = await getPendingReminders(supabase, user.id);
        
        // Recupera informazioni task per ogni reminder
        const remindersWithTasks = await Promise.all(
          pending.map(async (reminder) => {
            const { data: task } = await supabase
              .from('garden_tasks')
              .select('plant_name, task_type')
              .eq('id', reminder.taskId)
              .single();
            
            return {
              ...reminder,
              plantName: task?.plant_name || 'Pianta',
              taskType: task?.task_type
            };
          })
        );

        setReminders(remindersWithTasks);
      } catch (error) {
        console.error('Error loading photo reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
    
    // Ricarica ogni ora
    const interval = setInterval(loadReminders, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleTakePhoto = (taskId: string) => {
    if (onTakePhoto) {
      onTakePhoto(taskId);
    } else {
      window.location.href = `/app/journal?taskId=${taskId}&action=photo`;
    }
  };

  if (loading) {
    return null;
  }

  if (reminders.length === 0) {
    return null;
  }

  const nextReminder = reminders[0];
  const reminderDate = new Date(nextReminder.nextReminderDate);
  const daysUntil = Math.ceil((reminderDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 rounded-full p-2">
          <Camera size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">
            Foto Settimanale Richiesta
          </h3>
          <p className="text-sm text-blue-700 mb-2">
            È il momento di scattare una foto di <strong>{nextReminder.plantName}</strong> per il tracking settimanale.
          </p>
          {nextReminder.lastPhotoDate && (
            <p className="text-xs text-blue-600 mb-2">
              Ultima foto: {new Date(nextReminder.lastPhotoDate).toLocaleDateString('it-IT')}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTakePhoto(nextReminder.taskId)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Camera size={14} />
              Scatta Foto Ora
            </button>
            {reminders.length > 1 && (
              <span className="text-xs text-blue-600">
                +{reminders.length - 1} altre piante
              </span>
            )}
          </div>
        </div>
      </div>
      
      {reminders.length > 1 && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-2">Altre piante che necessitano foto:</p>
          <div className="space-y-1">
            {reminders.slice(1, 4).map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between text-xs">
                <span className="text-blue-700">{reminder.plantName}</span>
                <button
                  onClick={() => handleTakePhoto(reminder.taskId)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Scatta foto
                </button>
              </div>
            ))}
            {reminders.length > 4 && (
              <p className="text-xs text-blue-500 mt-1">
                +{reminders.length - 4} altre...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPhotoReminder;







