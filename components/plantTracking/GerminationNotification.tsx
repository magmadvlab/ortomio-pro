/**
 * Germination Notification Widget
 * Mostra notifica quando una pianta entra in fase Germination
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Sprout, Camera, CheckCircle, X } from 'lucide-react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { useAuth } from '@/packages/core/hooks/useAuth';
import { checkGerminationStatus, confirmGermination } from '@/services/germinationTracker';
import { getMasterSheetSync } from '@/services/plantMasterService';
import { GardenTask } from '@/types';

interface GerminationNotificationProps {
  tasks: GardenTask[];
  onTaskUpdate?: (task: GardenTask) => void;
}

export const GerminationNotification: React.FC<GerminationNotificationProps> = ({
  tasks,
  onTaskUpdate
}) => {
  const { storageProvider } = useStorage();
  const { user } = useAuth();
  const [germinationChecks, setGerminationChecks] = useState<Array<{
    task: GardenTask;
    check: ReturnType<typeof checkGerminationStatus>;
  }>>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setGerminationChecks([]);
      return;
    }

    const checks: Array<{ task: GardenTask; check: ReturnType<typeof checkGerminationStatus> }> = [];

    for (const task of tasks) {
      // Solo task di semina non completati
      if (task.taskType !== 'Sowing' || task.completed) {
        continue;
      }

      const masterData = getMasterSheetSync(task.plantName);
      if (!masterData) {
        continue;
      }

      const check = checkGerminationStatus(task, masterData);
      if (check.shouldNotify && !dismissed.has(task.id)) {
        checks.push({ task, check });
      }
    }

    setGerminationChecks(checks);
  }, [tasks, dismissed]);

  const handleConfirmGermination = async (task: GardenTask) => {
    if (!storageProvider) return;

    try {
      const updatedTask = confirmGermination(task);
      await storageProvider.updateTask(task.id, updatedTask);
      
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }

      // Rimuovi dalla lista
      setDismissed(prev => new Set(prev).add(task.id));
    } catch (error) {
      console.error('Error confirming germination:', error);
      alert('Errore nel confermare la germinazione. Riprova.');
    }
  };

  const handleDismiss = (taskId: string) => {
    setDismissed(prev => new Set(prev).add(taskId));
  };

  const handleTakePhoto = (taskId: string) => {
    // Naviga al journal con taskId per scattare foto
    window.location.href = `/app/journal?taskId=${taskId}&action=photo`;
  };

  if (germinationChecks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {germinationChecks.map(({ task, check }) => (
        <div
          key={task.id}
          className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-green-100 rounded-full p-2">
                <Sprout size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  Germoglio rilevato: {check.plantName}
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  La pianta è entrata nella finestra di germinazione attesa ({check.daysSinceSowing} giorni dalla semina).
                </p>
                <div className="flex items-center gap-4 text-xs text-green-600">
                  <span>Finestra: {check.germinationWindowStart.toLocaleDateString('it-IT')} - {check.germinationWindowEnd.toLocaleDateString('it-IT')}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleTakePhoto(task.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Camera size={14} />
                    Scatta Foto
                  </button>
                  <button
                    onClick={() => handleConfirmGermination(task)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm"
                  >
                    <CheckCircle size={14} />
                    Ho visto il germoglio
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(task.id)}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GerminationNotification;




