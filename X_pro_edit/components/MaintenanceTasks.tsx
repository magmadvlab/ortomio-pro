import React, { useState, useEffect } from 'react';
import { GardenTask, ProductCard } from '../types';
import { Droplets, Leaf, AlertTriangle, Calendar, X, Plus, Clock, Repeat, Lightbulb, Info, Sparkles, Loader2 } from 'lucide-react';
import {
  suggestFertilizer,
  suggestTreatment,
  calculateNextDate,
  ALL_FERTILIZERS,
  ALL_DISEASES,
  ALL_PRODUCTS
} from '../data/maintenanceSchedules';
import { generateProductCard, findOrCreateProductCard } from '../services/productCardService';
import ProductCardView from './ProductCardView';
import { useAuth } from '../hooks/useAuth';

interface MaintenanceTasksProps {
  tasks: GardenTask[];
  onAddTask: (task: Partial<GardenTask>) => Promise<void>;
  onUpdateTask: (task: GardenTask) => Promise<void>;
  productCards: ProductCard[];
  onAddProductCard: (card: Omit<ProductCard, 'id'>) => Promise<ProductCard>;
  onUpdateProductCard: (id: string, updates: Partial<ProductCard>) => Promise<ProductCard>;
  activeGardenId: string;
}

type TaskTypeSelection = 'Irrigazione' | 'Fertilizzazione' | 'Trattamento' | null;

interface FertilizationData {
  type: string; // Es. "Azoto", "Fosforo", "Compost", "NPK 10-10-10"
  dosage: string; // Es. "200g/m²", "1L/10L acqua"
  repeatDays?: number; // Ogni quanti giorni ripetere
}

interface TreatmentData {
  product: string; // Nome prodotto (es. "Bacillus thuringiensis", "Olio di Neem")
  disease: string; // Malattia/problema (es. "Afidi", "Oidio", "Peronospora")
  dosage: string; // Dosaggio
  repeatDays?: number; // Ogni quanti giorni ripetere
}

const MaintenanceTasks: React.FC<MaintenanceTasksProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  productCards,
  onAddProductCard,
  onUpdateProductCard,
  activeGardenId
}) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [selectedProductCard, setSelectedProductCard] = useState<ProductCard | null>(null);
  const [taskType, setTaskType] = useState<TaskTypeSelection>(null);
  const [selectedPlant, setSelectedPlant] = useState<GardenTask | null>(null);

  // AI Product Search State
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchType, setProductSearchType] = useState<'fertilizer' | 'treatment'>('fertilizer');
  const [productSearchContext, setProductSearchContext] = useState<{
    diseaseContext?: string;
    plantContext?: string;
  }>({});

  // Form states
  const [irrigationNotes, setIrrigationNotes] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

  const [fertilizationType, setFertilizationType] = useState('');
  const [fertilizationDosage, setFertilizationDosage] = useState('');
  const [fertilizationRepeat, setFertilizationRepeat] = useState('');
  const [fertilizerSuggestion, setFertilizerSuggestion] = useState<string | null>(null);

  const [treatmentProduct, setTreatmentProduct] = useState('');
  const [treatmentDisease, setTreatmentDisease] = useState('');
  const [treatmentDosage, setTreatmentDosage] = useState('');
  const [treatmentRepeat, setTreatmentRepeat] = useState('');
  const [treatmentSuggestion, setTreatmentSuggestion] = useState<string | null>(null);

  // Auto-suggest quando l'utente digita
  useEffect(() => {
    if (fertilizationType.length > 2) {
      const suggestion = suggestFertilizer(fertilizationType);
      if (suggestion) {
        const nextDate = calculateNextDate(suggestion, new Date(), selectedPlant?.season);
        setFertilizationRepeat(nextDate.daysUntil.toString());
        setFertilizerSuggestion(
          `💡 ${suggestion.description} Consigliato ogni ${nextDate.daysUntil} giorni${nextDate.seasonAdjusted ? ' (aggiustato per stagione)' : ''}.`
        );
      } else {
        setFertilizerSuggestion(null);
      }
    } else {
      setFertilizerSuggestion(null);
    }
  }, [fertilizationType, selectedPlant]);

  useEffect(() => {
    if (treatmentDisease.length > 2) {
      const suggestion = suggestTreatment(treatmentDisease);
      if (suggestion) {
        setTreatmentRepeat(suggestion.repeatDays.toString());
        setTreatmentProduct(suggestion.product);
        setTreatmentSuggestion(
          `💡 ${suggestion.description} (Max ${suggestion.maxApplications} applicazioni)`
        );
      } else {
        setTreatmentSuggestion(null);
      }
    } else {
      setTreatmentSuggestion(null);
    }
  }, [treatmentDisease]);

  // Piante attive per cui si possono fare manutenzioni
  const activePlants = tasks.filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant'));

  // Task di manutenzione recenti
  const maintenanceHistory = tasks.filter(t =>
    t.taskType === 'Fertilize' || t.taskType === 'Treatment' || t.notes?.includes('Irrigazione')
  ).slice(0, 10);

  // AI Product Search Functions
  const handleProductSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productSearchQuery.trim()) return;

    setGeneratingCard(true);
    try {
      const productCard = await findOrCreateProductCard(
        productSearchQuery,
        productSearchType,
        productCards,
        {
          userId: user?.id || 'current-user',
          gardenId: activeGardenId,
          diseaseContext: productSearchContext.diseaseContext,
          plantContext: productSearchContext.plantContext,
        }
      );

      // Save to database if it's new
      let finalCard = productCard;
      if (!productCards.find(c => c.id === productCard.id)) {
        finalCard = await onAddProductCard(productCard);
      }

      setSelectedProductCard(finalCard);
      setShowProductSearch(false);
    } catch (error) {
      console.error('Error generating product card:', error);
      alert('Errore durante la generazione della scheda prodotto. Riprova.');
    } finally {
      setGeneratingCard(false);
    }
  };

  const handleUseProduct = async (product: ProductCard) => {
    const today = new Date().toISOString().split('T')[0];
    const repeatDays = product.defaultRepeatDays || (product.type === 'fertilizer' ? 14 : 7);
    const nextDueDate = repeatDays > 0
      ? new Date(Date.now() + repeatDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    try {
      // Create task for this application
      await onAddTask({
        plantName: productSearchContext.plantContext || 'Orto generale',
        taskType: product.type === 'fertilizer' ? 'Fertilize' : 'Treatment',
        date: today,
        completed: true,
        season: new Date().getMonth() >= 3 && new Date().getMonth() <= 8 ? 'Summer' : 'Winter',
        fertilizerProductId: product.type === 'fertilizer' ? product.id : undefined,
        treatmentProductId: product.type === 'treatment' ? product.id : undefined,
        fertilizationData: product.type === 'fertilizer' ? {
          productCardId: product.id,
          type: product.name,
          dosage: product.recommendedDosage || '',
          repeatDays,
          applicationCount: 1,
          lastApplication: today,
        } : undefined,
        treatmentData: product.type === 'treatment' ? {
          productCardId: product.id,
          product: product.name,
          disease: productSearchContext.diseaseContext || 'Trattamento generale',
          dosage: product.recommendedDosage || '',
          repeatDays,
          applicationCount: 1,
          lastApplication: today,
        } : undefined,
        notes: `${product.type === 'fertilizer' ? '🌱' : '🛡️'} ${product.name}\nDosaggio: ${product.recommendedDosage}${repeatDays > 0 ? `\n🔄 Ripetere ogni ${repeatDays} giorni` : ''}${product.aiGenerated ? '\n✨ Scheda AI' : ''}`,
        nextDueDate,
      });

      // Update product usage statistics
      await onUpdateProductCard(product.id, {
        lastUsed: new Date().toISOString(),
        timesUsed: (product.timesUsed || 0) + 1,
      });

      // Reset state
      setSelectedProductCard(null);
      setProductSearchQuery('');
      setProductSearchContext({});

      alert(`✅ ${product.type === 'fertilizer' ? 'Fertilizzazione' : 'Trattamento'} registrato con successo!${nextDueDate ? `\nProssimo promemoria: ${new Date(nextDueDate).toLocaleDateString('it-IT')}` : ''}`);
    } catch (error) {
      console.error('Error using product:', error);
      alert('Errore durante la registrazione. Riprova.');
    }
  };

  const handleOpenForm = (type: TaskTypeSelection, plant: GardenTask) => {
    setTaskType(type);
    setSelectedPlant(plant);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setTaskType(null);
    setSelectedPlant(null);
    setIrrigationNotes('');
    setDurationMinutes('');
    setFertilizationType('');
    setFertilizationDosage('');
    setFertilizationRepeat('');
    setTreatmentProduct('');
    setTreatmentDisease('');
    setTreatmentDosage('');
    setTreatmentRepeat('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlant || !user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      if (taskType === 'Irrigazione') {
        // Irrigazione: task semplice, fine a se stesso
        const note = `💧 Irrigazione${durationMinutes ? ` (${durationMinutes} minuti)` : ''}${irrigationNotes ? ` - ${irrigationNotes}` : ''}`;

        await onUpdateTask({
          ...selectedPlant,
          notes: (selectedPlant.notes || '') + `\n${note} - ${new Date().toLocaleDateString('it-IT')}`,
          fertigationDate: today,
        });

        handleCloseForm();
        return;
      }

      if (taskType === 'Fertilizzazione') {
        setGeneratingCard(true);

        // Genera/cerca scheda AI per il fertilizzante
        let productCard: ProductCard | null = null;
        try {
          productCard = await findOrCreateProductCard(
            fertilizationType,
            'fertilizer',
            productCards,
            {
              userId: user.id,
              gardenId: activeGardenId,
              plantContext: selectedPlant.plantName,
            }
          );

          // Salva nel database se è nuova
          if (!productCards.find(c => c.id === productCard!.id)) {
            productCard = await onAddProductCard(productCard);
          }

          // Aggiorna usage counter
          await onUpdateProductCard(productCard.id, {
            lastUsed: new Date().toISOString(),
            timesUsed: (productCard.timesUsed || 0) + 1,
          });
        } catch (error) {
          console.warn('Errore generazione scheda prodotto:', error);
          // Continua comunque senza scheda
        }

        setGeneratingCard(false);

        const repeatDays = parseInt(fertilizationRepeat) || productCard?.defaultRepeatDays || 0;
        const nextDueDate = repeatDays > 0
          ? new Date(Date.now() + repeatDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined;

        await onAddTask({
          plantName: selectedPlant.plantName,
          variety: selectedPlant.variety,
          taskType: 'Fertilize',
          date: today,
          completed: true,
          season: selectedPlant.season,
          fertilizerProductId: productCard?.id,
          fertilizationData: {
            productCardId: productCard?.id,
            type: fertilizationType,
            dosage: fertilizationDosage || productCard?.recommendedDosage || '',
            repeatDays,
            applicationCount: 1,
            lastApplication: today,
          },
          notes: `🌱 Fertilizzante: ${fertilizationType}\nDosaggio: ${fertilizationDosage}${repeatDays > 0 ? `\n🔄 Ripetere ogni ${repeatDays} giorni` : ''}${productCard?.aiGenerated ? '\n✨ Scheda AI disponibile' : ''}`,
          nextDueDate,
        });

        // Aggiorna nota sulla pianta
        await onUpdateTask({
          ...selectedPlant,
          notes: (selectedPlant.notes || '') + `\n🌱 Fertilizzato con ${fertilizationType} (${fertilizationDosage}) - ${new Date().toLocaleDateString('it-IT')}`,
          fertigationDate: today,
        });

        handleCloseForm();
        return;
      }

      if (taskType === 'Trattamento') {
        setGeneratingCard(true);

        // Genera/cerca scheda AI per il trattamento
        let productCard: ProductCard | null = null;
        try {
          productCard = await findOrCreateProductCard(
            treatmentProduct,
            'treatment',
            productCards,
            {
              userId: user.id,
              gardenId: activeGardenId,
              diseaseContext: treatmentDisease,
              plantContext: selectedPlant.plantName,
            }
          );

          // Salva nel database se è nuova
          if (!productCards.find(c => c.id === productCard!.id)) {
            productCard = await onAddProductCard(productCard);
          }

          // Aggiorna usage counter
          await onUpdateProductCard(productCard.id, {
            lastUsed: new Date().toISOString(),
            timesUsed: (productCard.timesUsed || 0) + 1,
          });
        } catch (error) {
          console.warn('Errore generazione scheda prodotto:', error);
          // Continua comunque senza scheda
        }

        setGeneratingCard(false);

        const repeatDays = parseInt(treatmentRepeat) || productCard?.defaultRepeatDays || 0;
        const nextDueDate = repeatDays > 0
          ? new Date(Date.now() + repeatDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined;

        await onAddTask({
          plantName: selectedPlant.plantName,
          variety: selectedPlant.variety,
          taskType: 'Treatment',
          date: today,
          completed: true,
          season: selectedPlant.season,
          treatmentProductId: productCard?.id,
          treatmentData: {
            productCardId: productCard?.id,
            product: treatmentProduct,
            disease: treatmentDisease,
            dosage: treatmentDosage || productCard?.recommendedDosage || '',
            repeatDays,
            applicationCount: 1,
            lastApplication: today,
          },
          notes: `🛡️ Trattamento per: ${treatmentDisease}\nProdotto: ${treatmentProduct}\nDosaggio: ${treatmentDosage}${repeatDays > 0 ? `\n🔄 Ripetere ogni ${repeatDays} giorni` : ''}${productCard?.aiGenerated ? '\n✨ Scheda AI disponibile' : ''}`,
          nextDueDate,
        });

        // Aggiorna nota sulla pianta
        await onUpdateTask({
          ...selectedPlant,
          notes: (selectedPlant.notes || '') + `\n🛡️ Trattato per ${treatmentDisease} con ${treatmentProduct} - ${new Date().toLocaleDateString('it-IT')}`,
        });

        handleCloseForm();
        return;
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      alert('Errore durante il salvataggio. Riprova.');
      setGeneratingCard(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      <header>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
              <Leaf size={28} /> Manutenzione Orto
            </h1>
            <p className="text-green-600 text-sm">Irrigazione, fertilizzazione e trattamenti</p>
          </div>
          <button
            onClick={() => setShowProductSearch(!showProductSearch)}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <Sparkles size={18} />
            {showProductSearch ? 'Chiudi Ricerca AI' : 'Ricerca AI Prodotti'}
          </button>
        </div>
      </header>

      {/* AI PRODUCT SEARCH SECTION */}
      {showProductSearch && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Ricerca AI Prodotti</h2>
              <p className="text-gray-600 text-sm">
                Genera schede AI complete per fertilizzanti e trattamenti con dosaggi e promemoria automatici
              </p>
            </div>
          </div>

          <form onSubmit={handleProductSearch} className="space-y-4">
            {/* Product Type Selection */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setProductSearchType('fertilizer')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  productSearchType === 'fertilizer'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Leaf size={18} />
                Fertilizzante
              </button>
              <button
                type="button"
                onClick={() => setProductSearchType('treatment')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  productSearchType === 'treatment'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <AlertTriangle size={18} />
                Trattamento
              </button>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {productSearchType === 'fertilizer' ? 'Nome Fertilizzante' : 'Nome Prodotto/Principio Attivo'}
              </label>
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder={
                  productSearchType === 'fertilizer'
                    ? 'Es. NPK 10-10-10, Compost, Humus di lombrico...'
                    : 'Es. Bacillus thuringiensis, Olio di Neem, Sapone molle...'
                }
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Context Fields */}
            {productSearchType === 'treatment' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Problema/Malattia (Opzionale)
                </label>
                <input
                  type="text"
                  value={productSearchContext.diseaseContext || ''}
                  onChange={(e) => setProductSearchContext(prev => ({
                    ...prev,
                    diseaseContext: e.target.value
                  }))}
                  placeholder="Es. Afidi, Oidio, Peronospora, Cocciniglia..."
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Pianta Target (Opzionale)
              </label>
              <input
                type="text"
                value={productSearchContext.plantContext || ''}
                onChange={(e) => setProductSearchContext(prev => ({
                  ...prev,
                  plantContext: e.target.value
                }))}
                placeholder="Es. Pomodori, Lattuga, Orto generale..."
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-purple-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generatingCard}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                productSearchType === 'fertilizer'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {generatingCard ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  Generando scheda AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Genera Scheda AI
                </>
              )}
            </button>
          </form>

          {/* Recent Products Used */}
          {(() => {
            const recentProducts = productCards
              .filter(p => p.gardenId === activeGardenId || !p.gardenId)
              .sort((a, b) => new Date(b.lastUsed || b.createdAt).getTime() - new Date(a.lastUsed || a.createdAt).getTime())
              .slice(0, 4);

            if (recentProducts.length > 0) {
              return (
                <div className="mt-6 pt-6 border-t border-purple-200">
                  <p className="text-sm font-bold text-gray-700 mb-3">Prodotti Recenti</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentProducts.map(product => (
                      <ProductCardView
                        key={product.id}
                        product={product}
                        compact={true}
                        onUse={() => {
                          setSelectedProductCard(product);
                          setProductSearchContext({
                            plantContext: 'Orto generale'
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Info Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Come funziona:</strong> L'AI analizzerà il prodotto e genererà una scheda completa con dosaggi, 
              frequenze di applicazione, precauzioni e compatibilità. Potrai poi registrare l'applicazione e ricevere 
              promemoria automatici per i prossimi trattamenti.
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions per piante attive */}
      {activePlants.length > 0 ? (
        <div className="space-y-4">
          {activePlants.map(plant => (
            <div key={plant.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{plant.plantName}</h3>
                  <p className="text-xs text-gray-500">{plant.variety} • {plant.currentQuantity || 1} piante</p>
                </div>
                {plant.fertigationDate && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    Ultima manutenzione: {new Date(plant.fertigationDate).toLocaleDateString('it-IT')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleOpenForm('Irrigazione', plant)}
                  className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <Droplets size={20} className="text-blue-600 group-hover:text-blue-700" />
                  <span className="text-xs font-semibold text-blue-700">Irrigazione</span>
                </button>

                <button
                  onClick={() => handleOpenForm('Fertilizzazione', plant)}
                  className="flex flex-col items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <Leaf size={20} className="text-green-600 group-hover:text-green-700" />
                  <span className="text-xs font-semibold text-green-700">Fertilizza</span>
                </button>

                <button
                  onClick={() => handleOpenForm('Trattamento', plant)}
                  className="flex flex-col items-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors group"
                >
                  <AlertTriangle size={20} className="text-amber-600 group-hover:text-amber-700" />
                  <span className="text-xs font-semibold text-amber-700">Trattamento</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800 font-medium">Nessuna pianta attiva</p>
          <p className="text-xs text-blue-600 mt-1">Vai su <strong>Pianificatore</strong> per aggiungere piante.</p>
        </div>
      )}

      {/* Storico Manutenzioni */}
      {maintenanceHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-gray-600" />
            Storico Manutenzioni
          </h3>
          <div className="space-y-2">
            {maintenanceHistory.map((task, idx) => (
              <div key={idx} className="text-sm border-l-4 border-green-400 pl-3 py-2 bg-gray-50 rounded-r">
                <div className="font-semibold text-gray-800">
                  {task.plantName} {task.variety && `(${task.variety})`}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {task.taskType === 'Fertilize' && '🌱 Fertilizzazione'}
                  {task.taskType === 'Treatment' && '🛡️ Trattamento'}
                  {task.notes?.includes('Irrigazione') && '💧 Irrigazione'}
                  {' • '}
                  {new Date(task.date).toLocaleDateString('it-IT')}
                </div>
                {task.nextDueDate && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <Repeat size={12} />
                    Prossimo: {new Date(task.nextDueDate).toLocaleDateString('it-IT')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && selectedPlant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{taskType}</h3>
                <p className="text-sm text-gray-500">{selectedPlant.plantName} ({selectedPlant.variety})</p>
              </div>
              <button onClick={handleCloseForm}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {taskType === 'Irrigazione' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      💧 Registra un'irrigazione. Questa operazione aggiornerà solo le note della pianta.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Durata (minuti) - Opzionale</label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(e.target.value)}
                      placeholder="Es. 15"
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Note - Opzionale</label>
                    <textarea
                      value={irrigationNotes}
                      onChange={e => setIrrigationNotes(e.target.value)}
                      placeholder="Es. Irrigazione a goccia, terreno secco..."
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </>
              )}

              {taskType === 'Fertilizzazione' && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-800">
                      🌱 Il sistema analizzerà il fertilizzante e creerà reminder automatici se necessario.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo Fertilizzante *</label>
                    <input
                      required
                      type="text"
                      value={fertilizationType}
                      onChange={e => setFertilizationType(e.target.value)}
                      placeholder="Es. NPK 10-10-10, Compost, Humus di lombrico..."
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                      list="fertilizer-suggestions"
                    />
                    <datalist id="fertilizer-suggestions">
                      {ALL_FERTILIZERS.map((f, idx) => (
                        <option key={idx} value={f} />
                      ))}
                    </datalist>
                  </div>

                  {/* SUGGERIMENTO INTELLIGENTE */}
                  {fertilizerSuggestion && (
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 animate-in fade-in">
                      <div className="flex items-start gap-2">
                        <Lightbulb size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed">{fertilizerSuggestion}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Dosaggio *</label>
                    <input
                      required
                      type="text"
                      value={fertilizationDosage}
                      onChange={e => setFertilizationDosage(e.target.value)}
                      placeholder="Es. 200g/m², 1L/10L acqua, 5g/pianta..."
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                      <Repeat size={14} />
                      Ripeti ogni (giorni) - Opzionale
                    </label>
                    <input
                      type="number"
                      value={fertilizationRepeat}
                      onChange={e => setFertilizationRepeat(e.target.value)}
                      placeholder="Es. 14 (ogni 2 settimane)"
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Crea un reminder per la prossima fertilizzazione
                    </p>
                  </div>
                </>
              )}

              {taskType === 'Trattamento' && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      🛡️ Registra un trattamento per malattie o parassiti. Il sistema creerà reminder se necessario.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Problema/Malattia *</label>
                    <input
                      required
                      type="text"
                      value={treatmentDisease}
                      onChange={e => setTreatmentDisease(e.target.value)}
                      placeholder="Es. Afidi, Oidio, Peronospora, Cocciniglia..."
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                      list="disease-suggestions"
                    />
                    <datalist id="disease-suggestions">
                      {ALL_DISEASES.map((d, idx) => (
                        <option key={idx} value={d} />
                      ))}
                    </datalist>
                  </div>

                  {/* SUGGERIMENTO INTELLIGENTE */}
                  {treatmentSuggestion && (
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 animate-in fade-in">
                      <div className="flex items-start gap-2">
                        <Lightbulb size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed">{treatmentSuggestion}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Prodotto Usato *</label>
                    <input
                      required
                      type="text"
                      value={treatmentProduct}
                      onChange={e => setTreatmentProduct(e.target.value)}
                      placeholder="Es. Bacillus thuringiensis, Olio di Neem, Sapone molle..."
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                      list="product-suggestions"
                    />
                    <datalist id="product-suggestions">
                      {ALL_PRODUCTS.map((p, idx) => (
                        <option key={idx} value={p} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Dosaggio *</label>
                    <input
                      required
                      type="text"
                      value={treatmentDosage}
                      onChange={e => setTreatmentDosage(e.target.value)}
                      placeholder="Es. 10ml/L acqua, Nebulizzare 2-3 volte..."
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                      <Repeat size={14} />
                      Ripeti ogni (giorni) - Opzionale
                    </label>
                    <input
                      type="number"
                      value={treatmentRepeat}
                      onChange={e => setTreatmentRepeat(e.target.value)}
                      placeholder="Es. 7 (ripeti dopo 1 settimana)"
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Crea un reminder per il prossimo trattamento
                    </p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={generatingCard}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingCard ? (
                  <>
                    <Sparkles size={18} className="animate-spin" />
                    Generando scheda AI...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Registra {taskType}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Card Modal */}
      {selectedProductCard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {selectedProductCard.type === 'fertilizer' ? (
                  <Leaf size={24} className="text-green-600" />
                ) : (
                  <AlertTriangle size={24} className="text-amber-600" />
                )}
                Scheda Prodotto AI
              </h2>
              <button 
                onClick={() => setSelectedProductCard(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <ProductCardView
                product={selectedProductCard}
                onUse={handleUseProduct}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTasks;
