/**
 * Integrazione Sistema Trattamenti con Calendario
 * Mostra task di trattamenti e fertilizzanti nel calendario con informazioni prodotto
 */

'use client'

import React from 'react';
import { GardenTask, ProductCard } from '@/types';
import { useProductCards } from '@/hooks/useProductCards';
import { Leaf, Shield, Clock, AlertTriangle, Droplet, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface TreatmentCalendarIntegrationProps {
  tasks: GardenTask[];
  selectedDate: Date;
  onTaskUpdate: (task: GardenTask) => Promise<void>;
  onTaskComplete: (taskId: string) => Promise<void>;
}

export default function TreatmentCalendarIntegration({
  tasks,
  selectedDate,
  onTaskUpdate,
  onTaskComplete
}: TreatmentCalendarIntegrationProps) {
  const { productCards } = useProductCards();

  // Filtra task di trattamenti per la data selezionata
  const treatmentTasks = tasks.filter(task => {
    if (task.taskType !== 'Treatment' && task.taskType !== 'Fertilize') return false;
    
    const taskDate = parseISO(task.nextDueDate || task.date);
    return taskDate.toDateString() === selectedDate.toDateString();
  });

  if (treatmentTasks.length === 0) {
    return null;
  }

  const getProductCard = (taskId: string): ProductCard | undefined => {
    const task = treatmentTasks.find(t => t.id === taskId);
    if (!task?.metadata?.productCardId) return undefined;
    
    return productCards.find(card => card.id === task.metadata!.productCardId);
  };

  const getTaskIcon = (taskType: string) => {
    return taskType === 'Fertilize' ? 
      <Leaf className="text-green-600" size={16} /> : 
      <Shield className="text-amber-600" size={16} />;
  };

  const getTaskColor = (taskType: string) => {
    return taskType === 'Fertilize' ? 
      'border-green-200 bg-green-50' : 
      'border-amber-200 bg-amber-50';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-amber-500 rounded-full flex items-center justify-center">
          <Droplet className="text-white" size={12} />
        </div>
        <h3 className="font-medium text-gray-900">
          Trattamenti Programmati - {format(selectedDate, 'EEEE d MMMM', { locale: it })}
        </h3>
        <span className="text-sm text-gray-500">({treatmentTasks.length})</span>
      </div>

      {treatmentTasks.map(task => {
        const productCard = getProductCard(task.id);
        const isOverdue = new Date(task.nextDueDate || task.date) < new Date() && !task.completed;
        
        return (
          <div
            key={task.id}
            className={`border-2 rounded-xl p-4 ${getTaskColor(task.taskType)} ${
              isOverdue ? 'ring-2 ring-red-200' : ''
            }`}
          >
            {/* Header Task */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getTaskIcon(task.taskType)}
                <div>
                  <h4 className="font-medium text-gray-900">{task.plantName}</h4>
                  <p className="text-sm text-gray-600">
                    {task.taskType === 'Fertilize' ? 'Fertilizzazione' : 'Trattamento'}
                    {productCard && ` - ${productCard.name}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <AlertTriangle className="text-red-500" size={16} />
                )}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  task.completed ? 'bg-green-100 text-green-700' :
                  isOverdue ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {task.completed ? 'Completato' : isOverdue ? 'In Ritardo' : 'Programmato'}
                </span>
              </div>
            </div>

            {/* Informazioni Prodotto */}
            {productCard && (
              <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {productCard.type === 'fertilizer' ? 
                      <Leaf className="text-green-600" size={16} /> : 
                      <Shield className="text-amber-600" size={16} />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{productCard.name}</h5>
                      {productCard.organicCertified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          BIO
                        </span>
                      )}
                    </div>
                    
                    {productCard.description && (
                      <p className="text-sm text-gray-600 mb-2">{productCard.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {productCard.recommendedDosage && (
                        <div>
                          <span className="font-medium text-gray-700">Dosaggio:</span>
                          <span className="ml-1 text-gray-600">{productCard.recommendedDosage}</span>
                        </div>
                      )}
                      {productCard.applicationMethod && (
                        <div>
                          <span className="font-medium text-gray-700">Metodo:</span>
                          <span className="ml-1 text-gray-600">{productCard.applicationMethod}</span>
                        </div>
                      )}
                    </div>

                    {productCard.bestTime && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Clock className="text-purple-600" size={14} />
                        <span className="font-medium text-purple-700">Momento migliore:</span>
                        <span className="text-gray-600">{productCard.bestTime}</span>
                      </div>
                    )}

                    {productCard.precautions && productCard.precautions.length > 0 && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                          <div>
                            <p className="text-xs font-medium text-amber-800 mb-1">Precauzioni:</p>
                            <ul className="text-xs text-amber-700 space-y-0.5">
                              {productCard.precautions.slice(0, 2).map((precaution, idx) => (
                                <li key={idx}>• {precaution}</li>
                              ))}
                              {productCard.precautions.length > 2 && (
                                <li className="text-amber-600">• +{productCard.precautions.length - 2} altre...</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Note Task */}
            {task.notes && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 whitespace-pre-line">{task.notes}</p>
              </div>
            )}

            {/* Azioni */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                <span>
                  {format(parseISO(task.nextDueDate || task.date), 'HH:mm')}
                </span>
                {task.metadata?.applicationNumber && task.metadata?.totalApplications && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {task.metadata.applicationNumber}/{task.metadata.totalApplications}
                  </span>
                )}
              </div>

              {!task.completed && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onTaskComplete(task.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      task.taskType === 'Fertilize'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    Completa
                  </button>
                  <button
                    onClick={() => {
                      // Rimanda di un giorno
                      const newDate = new Date(task.nextDueDate || task.date);
                      newDate.setDate(newDate.getDate() + 1);
                      onTaskUpdate({
                        ...task,
                        nextDueDate: format(newDate, 'yyyy-MM-dd')
                      });
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Rimanda
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}