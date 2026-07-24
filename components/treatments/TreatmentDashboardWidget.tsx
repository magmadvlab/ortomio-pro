/**
 * Widget Dashboard per Sistema Trattamenti AI
 * Mostra schede recenti, prossimi trattamenti e accesso rapido al wizard
 */

'use client'

import React, { useState } from 'react';
import { Garden, GardenTask, ProductCard } from '@/types';
import { useProductCards } from '@/hooks/useProductCards';
import ProductCardView from '@/components/ProductCardView';
import SmartTreatmentWizard from './SmartTreatmentWizard';
import { 
  Leaf, 
  Shield, 
  Plus, 
  Calendar, 
  Clock, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface TreatmentDashboardWidgetProps {
  garden: Garden;
  tasks: GardenTask[];
  onCreateTasks: (tasks: GardenTask[]) => Promise<void>;
  onUpdateTask: (task: GardenTask) => Promise<void>;
}

export default function TreatmentDashboardWidget({
  garden,
  tasks,
  onCreateTasks,
  onUpdateTask
}: TreatmentDashboardWidgetProps) {
  const { productCards, recentlyUsed, fertilizers, treatments, loading } = useProductCards(garden.id);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardProduct, setWizardProduct] = useState<ProductCard | null>(null);

  // Filtra task di trattamenti e fertilizzanti
  const treatmentTasks = (tasks || []).filter(task => 
    task.taskType === 'Treatment' || task.taskType === 'Fertilize'
  );

  // Task in scadenza (oggi e domani)
  const upcomingTasks = (treatmentTasks || []).filter(task => {
    if (task.completed) return false;
    const taskDate = parseISO(task.nextDueDate || task.date);
    return isToday(taskDate) || isTomorrow(taskDate);
  });

  // Statistiche
  const stats = {
    totalProducts: productCards.length,
    fertilizers: fertilizers.length,
    treatments: treatments.length,
    upcomingTasks: upcomingTasks.length,
    completedThisMonth: (treatmentTasks || []).filter(task => {
      if (!task.completed || !task.completedAt) return false;
      const completedDate = parseISO(task.completedAt);
      const now = new Date();
      return completedDate.getMonth() === now.getMonth() && 
             completedDate.getFullYear() === now.getFullYear();
    }).length
  };

  const handleUseProduct = (product: ProductCard) => {
    setWizardProduct(product);
    setShowWizard(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Trattamenti AI</h3>
              <p className="text-sm text-gray-600">Sistema intelligente fertilizzanti e trattamenti</p>
            </div>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            Nuovo Trattamento
          </button>
        </div>

        {/* Statistiche rapide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="text-green-600" size={16} />
              <span className="text-xs font-medium text-green-700">Fertilizzanti</span>
            </div>
            <div className="text-lg font-bold text-green-900">{stats.fertilizers}</div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="text-amber-600" size={16} />
              <span className="text-xs font-medium text-amber-700">Trattamenti</span>
            </div>
            <div className="text-lg font-bold text-amber-900">{stats.treatments}</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="text-blue-600" size={16} />
              <span className="text-xs font-medium text-blue-700">In Scadenza</span>
            </div>
            <div className="text-lg font-bold text-blue-900">{stats.upcomingTasks}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="text-purple-600" size={16} />
              <span className="text-xs font-medium text-purple-700">Questo Mese</span>
            </div>
            <div className="text-lg font-bold text-purple-900">{stats.completedThisMonth}</div>
          </div>
        </div>

        {/* Task in scadenza */}
        {upcomingTasks.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-orange-600" size={16} />
              <h4 className="font-medium text-orange-900">Trattamenti in Scadenza</h4>
            </div>
            <div className="space-y-2">
              {upcomingTasks.slice(0, 3).map(task => {
                const taskDate = parseISO(task.nextDueDate || task.date);
                const isTaskToday = isToday(taskDate);
                
                return (
                  <div key={task.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {task.taskType === 'Fertilize' ? 
                        <Leaf className="text-green-600" size={16} /> : 
                        <Shield className="text-amber-600" size={16} />
                      }
                      <div>
                        <div className="font-medium text-gray-900">{task.plantName}</div>
                        <div className="text-sm text-gray-600">
                          {task.taskType === 'Fertilize' ? 'Fertilizzazione' : 'Trattamento'}
                          {task.metadata?.productName && ` - ${task.metadata.productName}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        isTaskToday ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {isTaskToday ? 'Oggi' : 'Domani'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(taskDate, 'HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {upcomingTasks.length > 3 && (
              <div className="mt-3 text-center">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Vedi altri {upcomingTasks.length - 3} task
                </button>
              </div>
            )}
          </div>
        )}

        {/* Prodotti utilizzati di recente */}
        {recentlyUsed.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Utilizzati di Recente</h4>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                Vedi tutti
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentlyUsed.slice(0, 4).map(product => (
                <ProductCardView
                  key={product.id}
                  product={product}
                  compact={true}
                  onUse={handleUseProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stato vuoto */}
        {productCards.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-gray-400" size={24} />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Nessun Prodotto Ancora</h4>
            <p className="text-gray-600 text-sm mb-4">
              Inizia creando la tua prima scheda prodotto con l'AI
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Crea Prima Scheda
            </button>
          </div>
        )}

        {/* Link rapidi */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <button 
              onClick={() => setShowWizard(true)}
              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              <Plus size={14} />
              Nuovo Trattamento
            </button>
            <button className="text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1">
              <Calendar size={14} />
              Calendario Trattamenti
            </button>
          </div>
        </div>
      </div>

      {/* Modal Wizard */}
      {showWizard && (
        <SmartTreatmentWizard
          garden={garden}
          onCreateTasks={onCreateTasks}
          initialProduct={wizardProduct}
          onClose={() => {
            setShowWizard(false)
            setWizardProduct(null)
          }}
        />
      )}
    </>
  );
}
