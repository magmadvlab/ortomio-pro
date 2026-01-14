/**
 * Widget Dashboard per Sistema Irrigazione Intelligente
 * Mostra zone attive, prossime irrigazioni e controlli rapidi
 */

'use client'

import React, { useState } from 'react';
import { Garden, GardenTask } from '@/types';
import { 
  Droplets, 
  Plus, 
  Clock, 
  Zap,
  ChevronRight,
  Thermometer,
  Timer
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface IrrigationDashboardWidgetProps {
  garden: Garden;
  tasks: GardenTask[];
  onCreateTasks: (tasks: GardenTask[]) => Promise<void>;
  onUpdateTask: (task: GardenTask) => Promise<void>;
}

export default function IrrigationDashboardWidget({
  garden,
  tasks,
  onCreateTasks,
  onUpdateTask
}: IrrigationDashboardWidgetProps) {
  const [showWizard, setShowWizard] = useState(false);

  // Filtra task di irrigazione
  const irrigationTasks = tasks.filter(task => 
    task.taskType === 'Irrigation'
  );

  // Task in scadenza (oggi e domani)
  const upcomingTasks = irrigationTasks.filter(task => {
    if (!task.nextDueDate && !task.scheduledDate) return false;
    const dueDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.scheduledDate!);
    return isToday(dueDate) || isTomorrow(dueDate);
  });

  // Statistiche irrigazione
  const completedThisWeek = irrigationTasks.filter(task => 
    task.completed && task.completedAt && 
    new Date(task.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const handleCreateIrrigationPlan = () => {
    setShowWizard(true);
  };

  const handleTaskComplete = async (task: GardenTask) => {
    const updatedTask = {
      ...task,
      completed: true,
      completedAt: new Date().toISOString()
    };
    await onUpdateTask(updatedTask);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Sistema Irrigazione</h3>
            <p className="text-sm text-gray-600">Gestione intelligente dell'acqua</p>
          </div>
        </div>
        <button
          onClick={handleCreateIrrigationPlan}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Piano Irrigazione</span>
        </button>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{upcomingTasks.length}</div>
          <div className="text-xs text-blue-700">Prossime</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{completedThisWeek}</div>
          <div className="text-xs text-green-700">Settimana</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{irrigationTasks.length}</div>
          <div className="text-xs text-gray-700">Totali</div>
        </div>
      </div>

      {/* Prossime irrigazioni */}
      {upcomingTasks.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Prossime Irrigazioni
          </h4>
          <div className="space-y-2">
            {upcomingTasks.slice(0, 3).map((task) => {
              const dueDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.scheduledDate!);
              const isUrgent = isToday(dueDate);
              
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isUrgent 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      isUrgent ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">{task.plantName}</div>
                      <div className="text-sm text-gray-600">
                        {format(dueDate, 'dd MMM', { locale: it })}
                        {isUrgent && ' - Oggi!'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTaskComplete(task)}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Completa
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consigli intelligenti */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consiglio Intelligente</h4>
            <p className="text-sm text-blue-800 mb-3">
              Basandomi sui dati meteo, consiglio di irrigare nelle prime ore del mattino 
              per ridurre l'evaporazione e ottimizzare l'assorbimento.
            </p>
            <div className="flex items-center gap-4 text-xs text-blue-700">
              <div className="flex items-center gap-1">
                <Thermometer size={12} />
                <span>Temp. ottimale: 6-8°C</span>
              </div>
              <div className="flex items-center gap-1">
                <Timer size={12} />
                <span>Durata: 15-20 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accesso rapido */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Gestione avanzata</span>
          <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
            <span>Vai a Irrigazione</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Piano Irrigazione Intelligente</h2>
                <button
                  onClick={() => setShowWizard(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Wizard Irrigazione in Sviluppo
                </h3>
                <p className="text-gray-600 mb-6">
                  Il wizard per la creazione di piani di irrigazione intelligenti sarà disponibile a breve.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Funzionalità Previste:</h4>
                  <ul className="text-sm text-blue-800 space-y-1 text-left">
                    <li>• Analisi del terreno e fabbisogno idrico</li>
                    <li>• Integrazione con previsioni meteo</li>
                    <li>• Programmazione automatica zone</li>
                    <li>• Ottimizzazione consumi</li>
                    <li>• Monitoraggio umidità suolo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}