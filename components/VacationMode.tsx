import React, { useState, useEffect } from 'react';
import { Garden, GardenTask, VacationPlan, VacationTask } from '../types';
import { generateVacationPlan, getDaysUntilDeparture, hasActiveVacation, hasUpcomingVacation } from '../logic/vacationEngine';
import { Calendar, CheckCircle, Clock, AlertTriangle, Shield, Droplets, ShoppingBasket, Shovel, X, Save, Plane } from 'lucide-react';

interface VacationModeProps {
  garden: Garden;
  tasks: GardenTask[];
  onUpdateGarden: (garden: Garden) => void;
}

const VacationMode: React.FC<VacationModeProps> = ({ garden, tasks, onUpdateGarden }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [plan, setPlan] = useState<VacationPlan | null>(garden.vacationMode || null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (garden.vacationMode) {
      setPlan(garden.vacationMode);
      setStartDate(garden.vacationMode.startDate.split('T')[0]);
      setEndDate(garden.vacationMode.endDate.split('T')[0]);
    }
  }, [garden]);

  const handleGeneratePlan = () => {
    if (!startDate || !endDate) {
      alert('Inserisci le date di partenza e ritorno');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      alert('La data di ritorno deve essere successiva alla data di partenza');
      return;
    }

    const newPlan = generateVacationPlan(garden, tasks, start, end);
    setPlan(newPlan);
    setIsCreating(false);
  };

  const handleSavePlan = () => {
    if (!plan) return;

    onUpdateGarden({
      ...garden,
      vacationMode: plan,
    });
  };

  const handleToggleTask = (taskId: string) => {
    if (!plan) return;

    const updatedPlan: VacationPlan = {
      ...plan,
      tasks: plan.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    };

    setPlan(updatedPlan);
  };

  const handleDeletePlan = () => {
    if (window.confirm('Sei sicuro di voler eliminare il piano di vacanza?')) {
      onUpdateGarden({
        ...garden,
        vacationMode: undefined,
      });
      setPlan(null);
      setStartDate('');
      setEndDate('');
    }
  };

  const getTaskIcon = (category: VacationTask['category']) => {
    switch (category) {
      case 'Harvest': return <ShoppingBasket size={18} />;
      case 'Watering': return <Droplets size={18} />;
      case 'Protection': return <Shield size={18} />;
      case 'Soil': return <Shovel size={18} />;
      default: return <AlertTriangle size={18} />;
    }
  };

  const getPriorityColor = (priority: VacationTask['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const daysUntil = plan ? getDaysUntilDeparture(new Date(plan.startDate)) : null;
  const isActive = plan ? hasActiveVacation(garden) : false;
  const isUpcoming = plan ? hasUpcomingVacation(garden) : false;
  const completedTasks = plan ? (plan.tasks || []).filter(t => t.completed).length : 0;
  const totalTasks = plan ? plan.tasks.length : 0;

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-800 flex items-center gap-3">
            <Plane size={28} />
            Modalità Vacanza
          </h1>
          <p className="text-blue-600 text-sm">Piano di sopravvivenza per le tue piante</p>
        </div>
        {plan && (
          <button
            onClick={handleDeletePlan}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 flex items-center gap-3"
          >
            <X size={18} />
            Elimina Piano
          </button>
        )}
      </header>

      {/* Status Banner */}
      {plan && (
        <div className={`rounded-2xl p-5 shadow-lg ${
          isActive 
            ? 'bg-green-50 border-2 border-green-300' 
            : isUpcoming 
            ? 'bg-blue-50 border-2 border-blue-300' 
            : 'bg-gray-50 border-2 border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">
                {isActive ? '🌴 Sei in vacanza!' : isUpcoming ? '⏰ Vacanza in arrivo' : '✅ Vacanza completata'}
              </h3>
              <p className="text-sm opacity-80">
                {isActive 
                  ? `Le tue piante sono in modalità sopravvivenza fino al ${new Date(plan.endDate).toLocaleDateString('it-IT')}`
                  : isUpcoming
                  ? `Parti tra ${daysUntil} ${daysUntil === 1 ? 'giorno' : 'giorni'} - Completa i task prima della partenza!`
                  : 'Tutte le attività sono state completate'}
              </p>
            </div>
            {isUpcoming && (
              <div className="text-right">
                <div className="text-3xl font-bold">{daysUntil}</div>
                <div className="text-xs opacity-70">giorni</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {!plan && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Imposta le date della vacanza</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Partenza</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Ritorno</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <button
              onClick={handleGeneratePlan}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md flex items-center justify-center gap-3"
            >
              <Calendar size={18} />
              Genera Piano di Sopravvivenza
            </button>
          </div>
        </div>
      )}

      {/* Survival Plan */}
      {plan && (
        <>
          {/* Progress */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800">Progresso Checklist</h3>
              <span className="text-sm font-bold text-blue-600">
                {completedTasks} / {totalTasks}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              />
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Task da Completare</h3>
            {plan.tasks.map(task => {
              const dueDate = new Date(task.dueDate);
              const isOverdue = dueDate < new Date() && !task.completed;
              
              return (
                <div
                  key={task.id}
                  className={`bg-white p-5 rounded-2xl shadow-sm border-2 ${
                    task.completed
                      ? 'border-green-200 bg-green-50/50'
                      : isOverdue
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.completed && <CheckCircle size={16} className="text-white" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(task.priority).split(' ')[0]}`}>
                            {getTaskIcon(task.category)}
                          </div>
                          <div>
                            <h4 className={`font-bold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {task.title}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <Calendar size={14} />
                          <span>Scadenza: {dueDate.toLocaleDateString('it-IT')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={14} />
                          <span>{task.estimatedTime}</span>
                        </div>
                      </div>
                      
                      {isOverdue && !task.completed && (
                        <div className="mt-2 text-xs text-red-600 font-bold flex items-center gap-3">
                          <AlertTriangle size={14} />
                          Scaduto! Completa al più presto
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSavePlan}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md flex items-center justify-center gap-3 mt-6"
          >
            <Save size={18} />
            Salva Piano di Vacanza
          </button>
        </>
      )}
    </div>
  );
};

export default VacationMode;





