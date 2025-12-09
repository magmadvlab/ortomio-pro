import React, { useState, useEffect } from 'react';
import { GardenTask, HarvestLogData, GrowingLocation, Garden } from '../types';
import { analyzePlantImage, checkHarvestReadiness } from '../services/geminiService';
import { calculateNutrientNeeds } from '../logic/nutrientEngine';
import { calculateHealthStrategy } from '../logic/healthEngine';
import { getMasterSheet } from '../services/plantMasterService';
import { calculatePlantDaysActive } from '../services/taskCalculationService';
import { checkLifecycleStatus, LifecycleAdvice } from '../logic/lifecycleEngine';
import { calculateMoonPhase, getMoonPhaseName, getMoonPhaseNameFromPhase, getMoonPhaseEmoji } from '../logic/lunarCalendar';
import { CheckCircle2, Circle, Calendar, Droplets, Shovel, Scissors, FlaskConical, Camera, Sparkles, Loader2, Sprout, X, PlusCircle, AlertCircle, Clock, Gauge, Scale, Star, ShoppingBasket, Snowflake, Sun, Box, Flower2, LayoutGrid, Users, History, Leaf, Shield, CheckCircle, XCircle, Moon } from 'lucide-react';

interface JournalProps {
  tasks: GardenTask[];
  garden?: Garden;
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: GardenTask) => void;
}

const Journal: React.FC<JournalProps> = ({ tasks, garden, onToggleTask, onAddTask, onDeleteTask, onUpdateTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [analyzingImg, setAnalyzingImg] = useState<string | null>(null);
  const [checkingBrixId, setCheckingBrixId] = useState<string | null>(null);
  
  // Lifecycle Coach State
  const [lifecycleAdvices, setLifecycleAdvices] = useState<Map<string, LifecycleAdvice>>(new Map());
  
  // Harvest Modal State
  const [harvestModalOpen, setHarvestModalOpen] = useState<string | null>(null);
  const [harvestData, setHarvestData] = useState<HarvestLogData>({
    quantity: 0,
    unit: 'kg',
    rating: 3,
    date: new Date().toISOString().split('T')[0]
  });

  // New task state
  const [newTask, setNewTask] = useState<{
    plantName: string;
    variety: string;
    taskType: GardenTask['taskType'];
    plantingMethod: GardenTask['plantingMethod'];
    date: string;
    notes: string;
    nextDueDate: string;
    season: 'Summer' | 'Winter';
    quantity: number;
    locationType: GrowingLocation;
  }>({
    plantName: '',
    variety: '',
    taskType: 'Sowing',
    plantingMethod: 'Seed',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    nextDueDate: '',
    season: 'Summer',
    quantity: 1,
    locationType: 'Ground'
  });

  // Auto-detect season based on date
  const detectSeason = (dateStr: string): 'Summer' | 'Winter' => {
    const month = new Date(dateStr).getMonth() + 1;
    return (month >= 4 && month <= 9) ? 'Summer' : 'Winter';
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'Sowing': return <Shovel size={18} className="text-brown-500" />;
      case 'Transplant': return <Sprout size={18} className="text-green-500" />;
      case 'Fertilize': return <FlaskConical size={18} className="text-purple-500" />;
      case 'Treatment': return <FlaskConical size={18} className="text-red-500" />;
      case 'Prune': return <Scissors size={18} className="text-orange-500" />;
      case 'Harvest': return <Gauge size={18} className="text-orange-600" />;
      default: return <Droplets size={18} className="text-blue-500" />;
    }
  };

  const getLocationIcon = (loc?: GrowingLocation) => {
    if (loc === 'Pot') return <Box size={14}/>;
    if (loc === 'RaisedBed') return <LayoutGrid size={14}/>;
    return <Flower2 size={14}/>;
  };

  const getLocationLabel = (loc?: GrowingLocation) => {
    if (loc === 'Pot') return 'Vaso';
    if (loc === 'RaisedBed') return 'Letto';
    return 'Terra';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      plantName: newTask.plantName,
      variety: newTask.variety,
      taskType: newTask.taskType,
      plantingMethod: (newTask.taskType === 'Sowing' || newTask.taskType === 'Transplant') ? newTask.plantingMethod : undefined,
      date: newTask.date,
      notes: newTask.notes,
      nextDueDate: newTask.nextDueDate || undefined,
      season: detectSeason(newTask.date),
      initialQuantity: newTask.quantity,
      currentQuantity: newTask.quantity,
      locationType: newTask.locationType
    });
    setIsAdding(false);
    setNewTask({ ...newTask, plantName: '', variety: '', notes: '', nextDueDate: '', quantity: 1 });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          
          const taskToUpdate = tasks.find(t => t.id === taskId);
          if (taskToUpdate) {
            const updatedImages = [...(taskToUpdate.images || []), base64String];
            onUpdateTask({ 
              ...taskToUpdate, 
              images: updatedImages,
              lastPhotoDate: new Date().toISOString()
            });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async (base64Img: string, taskId: string) => {
    setAnalyzingImg(base64Img);
    const result = await analyzePlantImage(base64Img.split(',')[1]);
    
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      const timestamp = new Date().toLocaleTimeString('it-IT', {day: 'numeric', month: 'numeric', hour: '2-digit', minute:'2-digit'});
      const newNote = `\n\n🤖 [AI Check ${timestamp}]: ${result}`;
      onUpdateTask({ ...taskToUpdate, notes: (taskToUpdate.notes || '') + newNote });
    }
    setAnalyzingImg(null);
  };

  const handleBrixCheck = async (taskId: string, brixStr: string) => {
    const brix = parseFloat(brixStr);
    if (isNaN(brix)) return;

    setCheckingBrixId(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const analysis = await checkHarvestReadiness(`${task.plantName} ${task.variety || ''}`, brix);
      onUpdateTask({
        ...task,
        recordedBrix: brix,
        harvestReadyAnalysis: analysis,
        notes: (task.notes || '') + `\n\n🔎 [Brix ${brix}°]: ${analysis}`
      });
    }
    setCheckingBrixId(null);
  };

  const updateStage = (taskId: string, newStage: GardenTask['stage']) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onUpdateTask({ ...task, stage: newStage });
    }
  };

  const updateQuantity = (taskId: string, newQty: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onUpdateTask({ ...task, currentQuantity: newQty });
    }
  };

  const openHarvestModal = (taskId: string) => {
    setHarvestModalOpen(taskId);
    setHarvestData({
      quantity: 0,
      unit: 'kg',
      rating: 3,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const submitHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestModalOpen) return;

    const task = tasks.find(t => t.id === harvestModalOpen);
    if (task) {
      const brixInfo = task.recordedBrix ? ` con ${task.recordedBrix}° Brix` : '';
      const harvestNote = `\n\n🎉 [Raccolto completato il ${new Date(harvestData.date).toLocaleDateString('it-IT')}]: ${harvestData.quantity}${harvestData.unit}. Qualità: ${harvestData.rating}/5. ${brixInfo}.`;
      
      const harvestPhoto = task.images && task.images.length > 0 ? task.images[task.images.length - 1] : undefined;
      
      const finalData = {
        ...harvestData,
        photo: harvestPhoto,
        brix: task.recordedBrix,
        id: crypto.randomUUID()
      };

      onUpdateTask({
        ...task,
        completed: true,
        notes: (task.notes || '') + harvestNote,
        finalHarvest: finalData
      });
    }
    setHarvestModalOpen(null);
  };

  // Calculate lifecycle advices for active planting tasks
  useEffect(() => {
    if (!garden) return;
    
    const activePlantingTasks = tasks.filter(t => 
      !t.completed && 
      (t.taskType === 'Sowing' || t.taskType === 'Transplant') &&
      t.gardenId === garden.id
    );
    
    if (activePlantingTasks.length === 0) {
      setLifecycleAdvices(new Map());
      return;
    }

    const advicesMap = new Map<string, LifecycleAdvice>();

    Promise.all(
      activePlantingTasks.map(async (task) => {
        const masterData = getMasterSheet(task.plantName);
        if (!masterData) return;

        try {
          const advice = await checkLifecycleStatus(task, masterData, garden);
          if (advice) {
            advicesMap.set(task.id, advice);
          }
        } catch (error) {
          console.error(`Error calculating lifecycle for ${task.plantName}:`, error);
        }
      })
    ).then(() => {
      setLifecycleAdvices(advicesMap);
    });
  }, [tasks, garden]);

  const handleLifecycleResponse = (task: GardenTask, response: boolean, advice: LifecycleAdvice) => {
    const updatedTask: GardenTask = {
      ...task,
      lifecycleState: advice.phase,
      userResponses: {
        ...task.userResponses,
        ...(advice.phase === 'Germination' && { germinationConfirmed: response }),
        ...(advice.phase === 'Transplanting' && { transplantReady: response }),
      }
    };

    // Se l'utente risponde "Sì" alla germinazione, passa a Nursing
    if (advice.phase === 'Germination' && response) {
      updatedTask.lifecycleState = 'Nursing';
    }

    // Se l'utente risponde "Sì" al trapianto, passa a Production
    if (advice.phase === 'Transplanting' && response) {
      updatedTask.lifecycleState = 'Production';
    }

    onUpdateTask(updatedTask);
  };

  const getLifecyclePhaseLabel = (phase?: string) => {
    const labels: Record<string, string> = {
      'Sowing': 'Semina',
      'Germination': 'Germinazione',
      'Nursing': 'Cura Piantina',
      'Hardening': 'Aclimatazione',
      'Transplanting': 'Trapianto',
      'Production': 'Produzione'
    };
    return labels[phase || ''] || phase || '—';
  };

  const isPhotoNeeded = (task: GardenTask) => {
    if (task.completed || task.taskType !== 'Sowing') return false;
    const last = task.lastPhotoDate ? new Date(task.lastPhotoDate) : new Date(task.date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 7;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return a.completed ? 1 : -1;
  });

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-6 sticky top-0 bg-green-50/95 backdrop-blur py-2 z-10">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Diario dell'Orto</h1>
          <p className="text-green-600 text-sm">Monitora le attività dell'orto attivo.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          {isAdding ? <X size={18}/> : <><PlusCircle size={18}/> Aggiungi</>}
        </button>
      </header>

      {/* Harvest Modal */}
      {harvestModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-orange-600 mb-2 flex items-center gap-2">
              <ShoppingBasket/> Registra Raccolto
            </h3>
            <p className="text-sm text-gray-500 mb-4">Chiudi il ciclo colturale di questa pianta.</p>
            <form onSubmit={submitHarvest} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Quantità</label>
                  <input 
                    type="number" step="0.1" required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={harvestData.quantity}
                    onChange={e => setHarvestData({...harvestData, quantity: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Unità</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                    value={harvestData.unit}
                    onChange={e => setHarvestData({...harvestData, unit: e.target.value as 'kg' | 'g' | 'units'})}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="units">pz</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qualità</label>
                <div className="flex justify-between">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setHarvestData({...harvestData, rating: s as 1|2|3|4|5})}>
                      <Star size={24} className={s <= harvestData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setHarvestModalOpen(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold">Annulla</button>
                <button type="submit" className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-bold">Salva & Chiudi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl border border-green-100 mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nuova Attività</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pianta</label>
                <input required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" 
                  value={newTask.plantName} onChange={e => setNewTask({...newTask, plantName: e.target.value})} placeholder="Es: Pomodoro" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Varietà</label>
                <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" 
                  value={newTask.variety} onChange={e => setNewTask({...newTask, variety: e.target.value})} placeholder="Es: Datterino" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo Azione</label>
                <select className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none" 
                  value={newTask.taskType} onChange={e => setNewTask({...newTask, taskType: e.target.value as GardenTask['taskType']})}>
                  <option value="Sowing">Semina</option>
                  <option value="Transplant">Trapianto</option>
                  <option value="Fertilize">Concimazione</option>
                  <option value="Treatment">Trattamento</option>
                  <option value="Prune">Potatura</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                <input type="date" required className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none" 
                  value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} />
              </div>
            </div>

            {(newTask.taskType === 'Sowing' || newTask.taskType === 'Transplant') && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Metodo di Partenza</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-colors ${newTask.plantingMethod === 'Seed' ? 'bg-orange-50 border-orange-200 text-orange-800 font-bold' : 'bg-white border-gray-200 text-gray-500'}`}>
                      <input type="radio" className="hidden" name="method" checked={newTask.plantingMethod === 'Seed'} onChange={() => setNewTask({...newTask, plantingMethod: 'Seed'})} />
                      🌰 Dal Seme
                    </label>
                    <label className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-colors ${newTask.plantingMethod === 'Seedling' ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-white border-gray-200 text-gray-500'}`}>
                      <input type="radio" className="hidden" name="method" checked={newTask.plantingMethod === 'Seedling'} onChange={() => setNewTask({...newTask, plantingMethod: 'Seedling'})} />
                      🌱 Da Piantina
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantità</label>
                    <input type="number" min="1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      value={newTask.quantity} onChange={e => setNewTask({...newTask, quantity: parseInt(e.target.value) || 1})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Posizione</label>
                    <select className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                      value={newTask.locationType} onChange={e => setNewTask({...newTask, locationType: e.target.value as GrowingLocation})}>
                      <option value="Ground">Piena Terra</option>
                      <option value="Pot">Vaso</option>
                      <option value="RaisedBed">Letto/Cassone</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Note / Osservazioni</label>
              <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-24 focus:ring-2 focus:ring-green-500 outline-none resize-none" 
                value={newTask.notes} onChange={e => setNewTask({...newTask, notes: e.target.value})} placeholder="Dettagli..." />
            </div>
            
            <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg mt-2">
              Salva nel Diario
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 font-medium">Il diario per questo orto è vuoto.</p>
            <p className="text-sm text-gray-400">Inizia aggiungendo la tua prima semina!</p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const photoNeeded = isPhotoNeeded(task);
            const isIndoor = task.notes?.toLowerCase().includes('indoor');
            
            return (
              <div key={task.id} className={`group relative flex flex-col p-5 rounded-2xl border transition-all duration-200 ${task.completed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-green-50 shadow-sm hover:shadow-md'}`}>
                <div className="flex items-start gap-4">
                  <button onClick={() => onToggleTask(task.id)} className="mt-1 flex-shrink-0 text-gray-300 hover:text-green-500 transition-colors">
                    {task.completed ? <CheckCircle2 size={26} className="text-green-500" /> : <Circle size={26} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold text-lg text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.plantName}
                          </h3>
                          {task.lifecycleState && (
                            <span className="text-xs font-bold uppercase bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {getLifecyclePhaseLabel(task.lifecycleState)}
                            </span>
                          )}
                        </div>
                        {task.variety && (
                          <p className="text-sm text-green-700 font-medium italic">Varietà: {task.variety}</p>
                        )}
                        {/* Lifecycle Coach Advice */}
                        {!task.completed && lifecycleAdvices.has(task.id) && (() => {
                          const advice = lifecycleAdvices.get(task.id)!;
                          if (advice.type === 'CHECK' && advice.actionYes && advice.actionNo) {
                            return (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-2">{advice.message}</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleLifecycleResponse(task, true, advice)}
                                    className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center justify-center gap-1"
                                  >
                                    <CheckCircle size={14} />
                                    Sì
                                  </button>
                                  <button
                                    onClick={() => handleLifecycleResponse(task, false, advice)}
                                    className="flex-1 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 flex items-center justify-center gap-1"
                                  >
                                    <XCircle size={14} />
                                    No
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1
                        ${task.taskType === 'Treatment' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}
                      `}>
                        {getIcon(task.taskType)}
                        {task.taskType}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
                      <Calendar size={12} /> 
                      {new Date(task.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}
                      {task.season && (
                        <span className={`flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded ${task.season === 'Summer' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                          {task.season === 'Summer' ? <Sun size={10}/> : <Snowflake size={10}/>} {task.season === 'Summer' ? 'Estivo' : 'Invernale'}
                        </span>
                      )}
                      {(task.taskType === 'Sowing' || task.taskType === 'Transplant') && (() => {
                        // Use saved moonPhase if available, otherwise calculate from taskDate
                        const moonName = task.moonPhase ? getMoonPhaseNameFromPhase(task.moonPhase) : getMoonPhaseName(new Date(task.date));
                        const moonEmoji = task.moonPhase ? getMoonPhaseEmoji(task.moonPhase) : (() => {
                          const taskDate = new Date(task.date);
                          const moonInfo = calculateMoonPhase(taskDate);
                          return moonInfo.isWaxing ? '🌒' : moonInfo.isWaning ? '🌘' : moonInfo.phase === 'Full' ? '🌕' : moonInfo.phase === 'New' ? '🌑' : '🌓';
                        })();
                        return (
                          <span className="flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                            <Moon size={10}/> {moonEmoji} {moonName}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Location and Quantity Tracking */}
                    {(task.taskType === 'Sowing' || task.taskType === 'Transplant') && (
                      <div className="mt-3 flex gap-2 items-center">
                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {getLocationIcon(task.locationType)} {getLocationLabel(task.locationType)}
                        </div>
                        
                        {!task.completed && (
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                            <Users size={12} className="text-green-600"/>
                            <span className="text-xs font-bold text-green-800">Vive:</span>
                            <input 
                              type="number" 
                              min="0"
                              className="w-8 text-xs text-center font-bold bg-white rounded border border-green-200"
                              value={task.currentQuantity ?? task.initialQuantity ?? 0}
                              onChange={(e) => updateQuantity(task.id, parseInt(e.target.value))}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-[10px] text-gray-400">/ {task.initialQuantity ?? '?'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isIndoor && !task.completed && (
                      <div className="mt-3 flex items-center justify-between bg-orange-50 p-2 rounded-lg border border-orange-100">
                        <span className="text-xs font-bold text-orange-800 uppercase">Stadio Indoor:</span>
                        <select 
                          className="bg-white text-xs border border-orange-200 rounded px-2 py-1 text-orange-900 font-medium"
                          value={task.stage || 'Germination'}
                          onChange={(e) => updateStage(task.id, e.target.value as GardenTask['stage'])}
                        >
                          <option value="Germination">Germinazione</option>
                          <option value="Vegetative">Crescita (Vegetativa)</option>
                          <option value="ReadyToTransplant">Pronta al Trapianto</option>
                        </select>
                      </div>
                    )}

                    {photoNeeded && (
                      <div className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 inline-block px-2 py-1 rounded border border-blue-100 animate-pulse">
                        <Clock size={12} /> Check-up settimanale richiesto
                      </div>
                    )}

                    {task.notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap border border-gray-100">
                        {task.notes}
                      </div>
                    )}
                    
                    {task.nextDueDate && (
                      <div className="mt-2 text-xs font-bold text-orange-600 flex items-center gap-1 bg-orange-50 inline-block px-2 py-1 rounded border border-orange-100">
                        ⏳ Prossimo: {new Date(task.nextDueDate).toLocaleDateString('it-IT')}
                      </div>
                    )}

                    {/* Nutrient Advice Section */}
                    {!task.completed && (task.taskType === 'Sowing' || task.taskType === 'Transplant') && (() => {
                      const masterSheet = getMasterSheet(task.plantName);
                      if (!masterSheet || !garden) return null;
                      
                      const daysActive = calculatePlantDaysActive(tasks, task.plantName, task.variety);
                      if (daysActive === null) return null;
                      
                      const advice = calculateNutrientNeeds(masterSheet, daysActive, garden.soilType);
                      if (!advice.shouldFertilize) return null;
                      
                      const elementColors = {
                        'N': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
                        'P': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
                        'K': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
                        'Micro': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
                        'None': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' }
                      };
                      
                      const colors = elementColors[advice.elementFocus] || elementColors['None'];
                      const elementLabels = { 'N': 'Azoto', 'P': 'Fosforo', 'K': 'Potassio', 'Micro': 'Micronutrienti', 'None': 'Nessuno' };
                      const phaseLabels = { 'Establishment': 'Radicazione', 'Vegetative': 'Vegetativa', 'Reproductive': 'Riproduttiva' };
                      
                      return (
                        <div className={`mt-3 p-4 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <FlaskConical size={18} className={colors.icon} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.badge}`}>
                                    {elementLabels[advice.elementFocus]}
                                  </span>
                                  <span className="text-[10px] text-gray-500 uppercase">
                                    {phaseLabels[advice.phase]}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    ({daysActive} giorni)
                                  </span>
                                </div>
                                <h4 className={`font-bold text-sm mt-1 ${colors.text}`}>
                                  {advice.adviceTitle}
                                </h4>
                              </div>
                            </div>
                          </div>
                          <p className={`text-sm ${colors.text} mb-2`}>
                            {advice.adviceBody}
                          </p>
                          {advice.soilNote && (
                            <div className={`mt-2 p-2 rounded-lg border ${colors.border} bg-white/50`}>
                              <p className="text-xs leading-relaxed">{advice.soilNote}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Health Protection Advice Section */}
                    {!task.completed && (task.taskType === 'Sowing' || task.taskType === 'Transplant') && (() => {
                      const masterSheet = getMasterSheet(task.plantName);
                      if (!masterSheet || !garden) return null;
                      
                      const daysActive = calculatePlantDaysActive(tasks, task.plantName, task.variety);
                      if (daysActive === null) return null;
                      
                      const healthAdvice = calculateHealthStrategy(masterSheet, daysActive);
                      if (!healthAdvice) return null;
                      
                      const priorityColors = {
                        'High': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-700', icon: 'text-red-600' },
                        'Medium': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-600' },
                        'Low': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-600' }
                      };
                      
                      const colors = priorityColors[healthAdvice.priority] || priorityColors['Low'];
                      const actionLabels = { 'Prevent': 'Prevenzione', 'Monitor': 'Monitoraggio' };
                      const seasonLabels = { 'Spring': 'Primavera', 'Summer': 'Estate', 'Autumn': 'Autunno', 'Winter': 'Inverno' };
                      
                      return (
                        <div className={`mt-3 p-4 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Shield size={18} className={colors.icon} />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.badge}`}>
                                    {actionLabels[healthAdvice.actionType]}
                                  </span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.badge}`}>
                                    {healthAdvice.priority} Priority
                                  </span>
                                  {healthAdvice.season && (
                                    <span className="text-[10px] text-gray-500 uppercase">
                                      {seasonLabels[healthAdvice.season]}
                                    </span>
                                  )}
                                </div>
                                <h4 className={`font-bold text-sm mt-1 ${colors.text}`}>
                                  {healthAdvice.productToUse}
                                </h4>
                              </div>
                            </div>
                          </div>
                          <p className={`text-sm ${colors.text} mb-2`}>
                            {healthAdvice.reason}
                          </p>
                          {healthAdvice.dosage && (
                            <div className={`mt-2 p-2 rounded-lg border ${colors.border} bg-white/50`}>
                              <p className="text-xs font-semibold mb-1">Dosaggio:</p>
                              <p className="text-xs">{healthAdvice.dosage}</p>
                            </div>
                          )}
                          {healthAdvice.applicationNotes && (
                            <div className={`mt-2 p-2 rounded-lg border ${colors.border} bg-white/50`}>
                              <p className="text-xs">{healthAdvice.applicationNotes}</p>
                            </div>
                          )}
                          {healthAdvice.nextTreatmentDate && (
                            <div className="mt-2 text-xs font-bold text-gray-600">
                              Prossimo trattamento consigliato: {new Date(healthAdvice.nextTreatmentDate).toLocaleDateString('it-IT')}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Harvest History Preview */}
                    {task.harvestHistory && task.harvestHistory.length > 0 && (
                      <div className="mt-2 pl-2 border-l-2 border-orange-200">
                        <p className="text-[10px] uppercase font-bold text-orange-400 mb-1 flex items-center gap-1">
                          <History size={10}/> Raccolti parziali
                        </p>
                        {task.harvestHistory.map(h => (
                          <div key={h.id} className="text-xs text-gray-600 flex justify-between">
                            <span>{new Date(h.date).toLocaleDateString('it-IT', {day: 'numeric', month: 'short'})}</span>
                            <span className="font-bold">{h.quantity}{h.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Harvest / Brix Section */}
                    {((task.taskType === 'Sowing' || task.taskType === 'Transplant') && !task.completed && !isIndoor) && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Gauge size={14} className="text-yellow-700"/>
                          <span className="text-xs font-bold text-yellow-800 uppercase">Controllo Maturazione</span>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            placeholder="Brix (es. 6.5)" 
                            className="w-24 text-sm p-1.5 rounded border border-yellow-200"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleBrixCheck(task.id, (e.target as HTMLInputElement).value);
                            }}
                            id={`brix-${task.id}`}
                          />
                          <button 
                            onClick={() => {
                              const el = document.getElementById(`brix-${task.id}`) as HTMLInputElement;
                              if (el) handleBrixCheck(task.id, el.value);
                            }}
                            disabled={checkingBrixId === task.id}
                            className="text-xs bg-yellow-600 text-white px-3 py-1.5 rounded font-bold hover:bg-yellow-700"
                          >
                            {checkingBrixId === task.id ? <Loader2 size={12} className="animate-spin"/> : 'Check'}
                          </button>
                        </div>
                        {task.harvestReadyAnalysis && (
                          <div className="mt-2 text-xs text-yellow-900 font-medium bg-white p-2 rounded border border-yellow-100">
                            💡 {task.harvestReadyAnalysis}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Image Gallery */}
                    {task.images && task.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Foto & Analisi</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {task.images.map((img, idx) => (
                            <div key={idx} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group/img">
                              <img src={img} alt="Plant" className="w-full h-full object-cover" />
                              {analyzingImg === img ? (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs">
                                  <Loader2 size={16} className="animate-spin mb-1"/>
                                  Analisi...
                                </div>
                              ) : (
                                <button 
                                  onClick={() => handleAnalyzeImage(img, task.id)}
                                  className="absolute bottom-0 inset-x-0 bg-green-600/90 text-white text-[10px] py-1.5 font-bold flex justify-center items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                                >
                                  <Sparkles size={10} />
                                  AI CHECK
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions Row */}
                    <div className="flex gap-3 mt-3 pt-3 border-t border-dashed border-gray-100 flex-wrap">
                      <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer px-3 py-1.5 rounded-lg transition-colors ${photoNeeded ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-green-50 text-green-600 hover:text-green-700'}`}>
                        <Camera size={14} />
                        {photoNeeded ? 'AGGIORNA PROGRESSI' : 'AGGIUNGI FOTO'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, task.id)}
                        />
                      </label>

                      {(!task.completed && (task.taskType === 'Sowing' || task.taskType === 'Transplant') && (task.harvestReadyAnalysis || task.recordedBrix)) && (
                        <button
                          onClick={() => openHarvestModal(task.id)}
                          className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors ml-auto"
                        >
                          <CheckCircle2 size={14} />
                          RACCOLTO FINALE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteTask(task.id)} 
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2"
                  aria-label="Delete"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Journal;
