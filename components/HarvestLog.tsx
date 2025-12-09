
import React, { useState } from 'react';
import { GardenTask, HarvestLogData, GrowingLocation, Recipe } from '../types';
import { ShoppingBasket, Star, Calendar, Camera, Scale, PlusCircle, Leaf, Snowflake, Sun, BarChart3, Box, Flower2, LayoutGrid, ArrowRight, X, ChefHat } from 'lucide-react';
import { getRecipesForHarvest } from '../services/recipeService';
import RecipeCard from './RecipeCard';

interface HarvestLogProps {
  tasks: GardenTask[];
  onAddHarvest: (plantName: string, data: HarvestLogData, season: 'Summer' | 'Winter') => void;
}

// Helper to update tasks in the parent - Need to be passed from parent ideally, 
// but for now we will rely on onAddHarvest to purely add logs. 
// However, the prompt requires linking. We might need a Refactor of Props in App.tsx to allow updating tasks here, 
// OR we simulate it by finding the task and updating it via a new prop.
// For this implementation, I'll update App.tsx to pass an updateTask handler to HarvestLog as well.

const HarvestLog: React.FC<HarvestLogProps & { onUpdateTask: (task: GardenTask) => void }> = ({ tasks, onAddHarvest, onUpdateTask }) => {
  const [filterSeason, setFilterSeason] = useState<'All' | 'Summer' | 'Winter'>('All');
  const [selectedTaskForHarvest, setSelectedTaskForHarvest] = useState<GardenTask | null>(null);
  
  // Harvest Form State
  const [harvestQty, setHarvestQty] = useState('');
  const [harvestUnit, setHarvestUnit] = useState<'kg' | 'g' | 'units'>('kg');
  const [harvestRating, setHarvestRating] = useState(3);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvestPhoto, setHarvestPhoto] = useState<string | null>(null);
  const [showRecipes, setShowRecipes] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Grouped Data for Statistics
  const activeTasks = tasks.filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant'));
  
  const getStatsByCrop = () => {
      const stats: Record<string, { totalYield: number, plants: number, location: GrowingLocation, variety: string }> = {};
      
      // Calculate from completed tasks + partial harvests of active tasks
      tasks.forEach(t => {
          if (t.taskType !== 'Sowing' && t.taskType !== 'Transplant') return; // Only count crop tasks
          if (filterSeason !== 'All' && t.season !== filterSeason) return;

          const key = `${t.plantName}-${t.variety || 'Gen'}`;
          
          if (!stats[key]) stats[key] = { totalYield: 0, plants: 0, location: t.locationType || 'Ground', variety: t.variety || '' };
          
          // Add Final Harvest
          if (t.finalHarvest) {
             let qty = t.finalHarvest.quantity;
             if (t.finalHarvest.unit === 'g') qty /= 1000;
             stats[key].totalYield += qty;
          }

          // Add Partial Harvests
          if (t.harvestHistory) {
              t.harvestHistory.forEach(h => {
                  let qty = h.quantity;
                  if (h.unit === 'g') qty /= 1000;
                  stats[key].totalYield += qty;
              });
          }

          // Count plants (Active use currentQuantity, Completed use initial or assume 1)
          stats[key].plants += (t.currentQuantity || t.initialQuantity || 1);
      });
      return stats;
  }

  const cropStats = getStatsByCrop();
  const totalYieldAll = Object.values(cropStats).reduce((acc, curr) => acc + curr.totalYield, 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const MAX_WIDTH = 600;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              setHarvestPhoto(canvas.toDataURL('image/jpeg', 0.7));
          }
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitHarvest = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTaskForHarvest) return;

      const newLog: HarvestLogData = {
          id: crypto.randomUUID(),
          quantity: parseFloat(harvestQty),
          unit: harvestUnit,
          rating: harvestRating as any,
          date: harvestDate,
          photo: harvestPhoto || undefined
      };

      // Fetch recipes for this harvest
      setLoadingRecipes(true);
      let fetchedRecipes: Recipe[] = [];
      try {
          fetchedRecipes = await getRecipesForHarvest(
              selectedTaskForHarvest.plantName,
              newLog.quantity,
              newLog.unit
          );
          newLog.suggestedRecipes = fetchedRecipes;
          setRecipes(fetchedRecipes);
          
          // Show recipes modal if we have recipes
          if (fetchedRecipes.length > 0) {
              setShowRecipes(true);
          }
      } catch (error) {
          console.error("Errore nel recupero delle ricette:", error);
      } finally {
          setLoadingRecipes(false);
      }

      // Update the task with partial harvest history
      const updatedHistory = [...(selectedTaskForHarvest.harvestHistory || []), newLog];
      
      onUpdateTask({
          ...selectedTaskForHarvest,
          harvestHistory: updatedHistory,
          // Optional: Add a note
          notes: (selectedTaskForHarvest.notes || '') + `\n🧺 Raccolto parziale: ${newLog.quantity}${newLog.unit} il ${new Date(newLog.date).toLocaleDateString('it-IT')}`
      });

      // Reset form (but keep modal open if recipes are showing)
      // Use fetchedRecipes instead of recipes since state updates are asynchronous
      if (fetchedRecipes.length === 0) {
          setSelectedTaskForHarvest(null);
      }
      // Reset all form fields to prevent stale data
      setHarvestQty('');
      setHarvestPhoto(null);
      setHarvestRating(3); // Reset to default
      setHarvestDate(new Date().toISOString().split('T')[0]); // Reset to today
  };

  const getLocationIcon = (loc?: GrowingLocation) => {
      if(loc === 'Pot') return <Box size={14}/>;
      if(loc === 'RaisedBed') return <LayoutGrid size={14}/>;
      return <Flower2 size={14}/>;
  }

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
                <ShoppingBasket size={28}/> Il Mio Raccolto
            </h1>
            <p className="text-orange-600 text-sm">Statistiche e registro produttività.</p>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="opacity-90 text-sm font-medium">Resa Totale (Stimata)</p>
                  <p className="text-4xl font-bold">{totalYieldAll.toFixed(1)} <span className="text-xl">kg</span></p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <BarChart3 size={24} />
              </div>
          </div>
          
          <div className="flex bg-black/10 p-1 rounded-xl">
              <button 
                onClick={() => setFilterSeason('All')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${filterSeason === 'All' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-100 hover:bg-white/10'}`}
              >
                  TUTTI
              </button>
              <button 
                onClick={() => setFilterSeason('Summer')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${filterSeason === 'Summer' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-100 hover:bg-white/10'}`}
              >
                  <Sun size={12}/> ESTIVO
              </button>
              <button 
                onClick={() => setFilterSeason('Winter')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${filterSeason === 'Winter' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-100 hover:bg-white/10'}`}
              >
                  <Snowflake size={12}/> INVERNALE
              </button>
          </div>
      </div>

      {/* Active Crop Quick Harvest */}
      <div>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <PlusCircle size={18} className="text-green-600"/> Aggiungi Raccolto a...
          </h2>
          {activeTasks.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nessuna coltura attiva disponibile.</p>
          ) : (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  {activeTasks.map(task => (
                      <button 
                        key={task.id}
                        onClick={() => setSelectedTaskForHarvest(task)}
                        className="flex-shrink-0 bg-white p-3 rounded-xl border border-green-100 shadow-sm w-40 text-left hover:border-green-300 transition-all"
                      >
                          <div className="flex justify-between items-start mb-2">
                              <div className="font-bold text-gray-800 truncate pr-2">{task.plantName}</div>
                              <div className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  {getLocationIcon(task.locationType)}
                              </div>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{task.variety}</p>
                          <div className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
                              <Leaf size={12}/> {task.currentQuantity} piante
                          </div>
                      </button>
                  ))}
              </div>
          )}
      </div>

      {/* Harvest Modal */}
      {selectedTaskForHarvest && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{selectedTaskForHarvest.plantName}</h3>
                        <p className="text-sm text-gray-500">{selectedTaskForHarvest.variety} • {new Date(selectedTaskForHarvest.date).toLocaleDateString('it-IT')}</p>
                      </div>
                      <button onClick={() => setSelectedTaskForHarvest(null)}><X size={20} className="text-gray-400"/></button>
                  </div>

                  <form onSubmit={handleSubmitHarvest} className="space-y-4">
                      <div className="flex gap-2">
                          <div className="flex-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Quantità</label>
                              <input 
                                required type="number" step="0.1" 
                                value={harvestQty} onChange={e => setHarvestQty(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                              />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Unità</label>
                              <select 
                                value={harvestUnit} onChange={e => setHarvestUnit(e.target.value as any)}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none"
                              >
                                  <option value="kg">kg</option>
                                  <option value="g">g</option>
                                  <option value="units">pz</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Qualità</label>
                          <div className="flex gap-2">
                              {[1,2,3,4,5].map(s => (
                                  <button key={s} type="button" onClick={() => setHarvestRating(s)} className={`p-1 ${harvestRating >= s ? 'text-yellow-400' : 'text-gray-200'}`}>
                                      <Star fill="currentColor" size={24}/>
                                  </button>
                              ))}
                          </div>
                      </div>
                      <label className="block w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:bg-gray-50">
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          {harvestPhoto ? <span className="text-green-600 font-bold text-sm">Foto caricata!</span> : <span className="text-gray-400 text-sm flex items-center justify-center gap-1"><Camera size={16}/> Aggiungi Foto</span>}
                      </label>
                      <button 
                        type="submit" 
                        disabled={loadingRecipes}
                        className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loadingRecipes ? (
                          <>Caricamento ricette...</>
                        ) : (
                          <>Registra Raccolto</>
                        )}
                      </button>
                  </form>
               </div>
          </div>
      )}

      {/* Recipes Modal */}
      {showRecipes && recipes.length > 0 && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                              <ChefHat size={24} className="text-orange-600" />
                              Ricette per {selectedTaskForHarvest?.plantName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">Dall'orto alla tavola: ricette tradizionali italiane</p>
                      </div>
                      <button 
                          onClick={() => {
                              setShowRecipes(false);
                              setSelectedTaskForHarvest(null);
                              setRecipes([]);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                      >
                          <X size={24} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      {recipes.map((recipe, idx) => (
                          <RecipeCard key={idx} recipe={recipe} />
                      ))}
                  </div>

                  <button
                      onClick={() => {
                          setShowRecipes(false);
                          setSelectedTaskForHarvest(null);
                          setRecipes([]);
                      }}
                      className="w-full mt-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                  >
                      Chiudi
                  </button>
              </div>
          </div>
      )}

      {/* Crop Statistics Cards */}
      <div>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-gray-600"/> Dettaglio Colture
          </h2>
          <div className="space-y-3">
              {Object.entries(cropStats).map(([key, stat]) => (
                  <div key={key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.totalYield > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                              <ShoppingBasket size={20}/>
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-800">{key.split('-')[0]}</h3>
                              <p className="text-xs text-gray-500">{stat.variety} • {stat.plants} piante</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{stat.totalYield.toFixed(1)} <span className="text-sm font-medium text-gray-500">kg</span></p>
                          <p className="text-[10px] text-gray-400">Media: {(stat.totalYield / (stat.plants || 1)).toFixed(2)} kg/pianta</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default HarvestLog;
