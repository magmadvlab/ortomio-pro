/**
 * Wizard Intelligente per Trattamenti e Fertilizzanti
 * Integra: Ricerca AI → Scheda → Calcolo Quantità → Programmazione → Task
 */

'use client'

import React, { useState, useEffect } from 'react';
import { Garden, ProductCard, GardenTask } from '@/types';
import { useProductCards } from '@/hooks/useProductCards';
import { useAuth } from '@/packages/core/hooks/useAuth';
import { IntegratedTreatmentService, TreatmentRequest, TreatmentPlan } from '@/services/integratedTreatmentService';
import ProductCardView from '@/components/ProductCardView';
import { 
  Search, 
  Leaf, 
  Shield, 
  Calculator, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Target
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

interface SmartTreatmentWizardProps {
  garden: Garden;
  onCreateTasks: (tasks: GardenTask[]) => Promise<void>;
  onClose: () => void;
}

type WizardStep = 'search' | 'product' | 'area' | 'schedule' | 'review' | 'complete';

export default function SmartTreatmentWizard({ 
  garden, 
  onCreateTasks, 
  onClose 
}: SmartTreatmentWizardProps) {
  const { productCards, addProductCard, loading: cardsLoading } = useProductCards(garden.id);
  const { user } = useAuth();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [searchData, setSearchData] = useState({
    productName: '',
    type: 'fertilizer' as 'fertilizer' | 'treatment',
    diseaseContext: '',
    plantContext: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState<ProductCard | null>(null);
  
  const [areaData, setAreaData] = useState({
    type: 'field' as 'field' | 'rows' | 'individual_plants',
    fieldSize: 100,
    rowCount: 10,
    rowLength: 50,
    plantCount: 20
  });
  
  const [scheduleData, setScheduleData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    customFrequency: undefined as number | undefined,
    totalApplications: 3
  });
  
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);

  // Reset error when step changes
  useEffect(() => {
    setError(null);
  }, [currentStep]);

  const handleSearch = async () => {
    if (!searchData.productName.trim()) {
      setError('Inserisci il nome del prodotto');
      return;
    }

    if (!user) {
      setError('Devi essere autenticato per cercare un prodotto');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: TreatmentRequest = {
        productName: searchData.productName,
        type: searchData.type,
        diseaseContext: searchData.diseaseContext || undefined,
        plantContext: searchData.plantContext || undefined,
        garden,
        userId: user.id
      };

      // Genera o trova scheda prodotto
      const plan = await IntegratedTreatmentService.createTreatmentPlan(request, productCards);
      
      // Se la scheda è nuova, salvala
      if (plan.productCard.aiGenerated && !productCards.find(c => c.id === plan.productCard.id)) {
        await addProductCard(plan.productCard);
      }

      setSelectedProduct(plan.productCard);
      setCurrentStep('product');
    } catch (error: any) {
      console.error('Error searching product:', error);
      setError(error.message || 'Errore nella ricerca del prodotto');
    } finally {
      setLoading(false);
    }
  };

  const handleAreaNext = () => {
    setCurrentStep('schedule');
  };

  const handleScheduleNext = async () => {
    if (!selectedProduct) return;

    if (!user) {
      setError('Devi essere autenticato per programmare un trattamento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: TreatmentRequest = {
        productName: selectedProduct.name,
        type: selectedProduct.type,
        diseaseContext: searchData.diseaseContext || undefined,
        plantContext: searchData.plantContext || undefined,
        garden,
        userId: user.id,
        applicationArea: areaData,
        startDate: scheduleData.startDate,
        customFrequency: scheduleData.customFrequency,
        totalApplications: scheduleData.totalApplications
      };

      const plan = await IntegratedTreatmentService.createTreatmentPlan(request, productCards);
      setTreatmentPlan(plan);
      setCurrentStep('review');
    } catch (error: any) {
      console.error('Error creating treatment plan:', error);
      setError(error.message || 'Errore nella creazione del piano');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!treatmentPlan) return;

    setLoading(true);
    setError(null);

    try {
      await onCreateTasks(treatmentPlan.tasks);
      setCurrentStep('complete');
    } catch (error: any) {
      console.error('Error creating tasks:', error);
      setError(error.message || 'Errore nella creazione dei task');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'search', label: 'Ricerca', icon: Search },
      { id: 'product', label: 'Prodotto', icon: Sparkles },
      { id: 'area', label: 'Area', icon: MapPin },
      { id: 'schedule', label: 'Programma', icon: Calendar },
      { id: 'review', label: 'Revisione', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-center mb-6 md:mb-8 overflow-x-auto pb-2">
        <div className="flex items-center gap-1 md:gap-2 min-w-max px-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentIndex;
            
            return (
              <React.Fragment key={step.id}>
                <div className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm ${
                  isActive ? 'bg-green-100 text-green-700' :
                  isCompleted ? 'bg-gray-100 text-gray-600' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  <Icon size={14} className="md:w-4 md:h-4" />
                  <span className="font-medium hidden sm:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight size={14} className="mx-1 md:mx-2 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSearchStep = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ricerca Prodotto AI</h2>
        <p className="text-sm md:text-base text-gray-600">Trova il fertilizzante o trattamento perfetto per le tue esigenze</p>
      </div>

      {/* Tipo prodotto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo di prodotto</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSearchData(prev => ({ ...prev, type: 'fertilizer' }))}
            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
              searchData.type === 'fertilizer'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Leaf className="mx-auto mb-2" size={20} />
            <div className="font-medium text-sm md:text-base">Fertilizzante</div>
            <div className="text-xs text-gray-500">Nutrizione piante</div>
          </button>
          <button
            onClick={() => setSearchData(prev => ({ ...prev, type: 'treatment' }))}
            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
              searchData.type === 'treatment'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Shield className="mx-auto mb-2" size={20} />
            <div className="font-medium text-sm md:text-base">Trattamento</div>
            <div className="text-xs text-gray-500">Difesa fitosanitaria</div>
          </button>
        </div>
      </div>

      {/* Nome prodotto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome del prodotto *
        </label>
        <input
          type="text"
          value={searchData.productName}
          onChange={(e) => setSearchData(prev => ({ ...prev, productName: e.target.value }))}
          placeholder={searchData.type === 'fertilizer' ? 'es. NPK 10-10-10, Humus di lombrico' : 'es. Bacillus thuringiensis, Olio di neem'}
          className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Contesto pianta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pianta target (opzionale)
        </label>
        <input
          type="text"
          value={searchData.plantContext}
          onChange={(e) => setSearchData(prev => ({ ...prev, plantContext: e.target.value }))}
          placeholder="es. Pomodori, Rose, Olivi"
          className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Contesto malattia (solo per trattamenti) */}
      {searchData.type === 'treatment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problema da trattare (opzionale)
          </label>
          <input
            type="text"
            value={searchData.diseaseContext}
            onChange={(e) => setSearchData(prev => ({ ...prev, diseaseContext: e.target.value }))}
            placeholder="es. Afidi, Oidio, Peronospora"
            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={16} />
            <span className="font-medium text-sm md:text-base">Errore</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg text-sm md:text-base order-2 sm:order-1"
        >
          Annulla
        </button>
        <button
          onClick={handleSearch}
          disabled={loading || !searchData.productName.trim()}
          className="px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base order-1 sm:order-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generando scheda AI...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Genera Scheda AI
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderProductStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scheda Prodotto</h2>
        <p className="text-gray-600">Verifica le informazioni generate dall'AI</p>
      </div>

      {selectedProduct && (
        <ProductCardView 
          product={selectedProduct}
          onUse={() => setCurrentStep('area')}
        />
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('search')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Indietro
        </button>
        <button
          onClick={() => setCurrentStep('area')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
        >
          Continua
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderAreaStep = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Area di Applicazione</h2>
        <p className="text-sm md:text-base text-gray-600">Specifica l'area per calcolare le quantità precise</p>
      </div>

      {/* Tipo area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Tipo di applicazione</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setAreaData(prev => ({ ...prev, type: 'field' }))}
            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
              areaData.type === 'field'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Target className="mx-auto mb-2" size={20} />
            <div className="font-medium text-sm md:text-base">Campo</div>
            <div className="text-xs text-gray-500">Area in m²</div>
          </button>
          <button
            onClick={() => setAreaData(prev => ({ ...prev, type: 'rows' }))}
            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
              areaData.type === 'rows'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="mx-auto mb-2 text-xl md:text-2xl">🌱</div>
            <div className="font-medium text-sm md:text-base">Filari</div>
            <div className="text-xs text-gray-500">Numero x lunghezza</div>
          </button>
          <button
            onClick={() => setAreaData(prev => ({ ...prev, type: 'individual_plants' }))}
            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
              areaData.type === 'individual_plants'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="mx-auto mb-2 text-xl md:text-2xl">🪴</div>
            <div className="font-medium text-sm md:text-base">Piante</div>
            <div className="text-xs text-gray-500">Numero piante</div>
          </button>
        </div>
      </div>

      {/* Parametri area */}
      <div className="bg-gray-50 rounded-lg p-3 md:p-4">
        {areaData.type === 'field' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensione campo (m²)
            </label>
            <input
              type="number"
              value={areaData.fieldSize}
              onChange={(e) => setAreaData(prev => ({ ...prev, fieldSize: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        {areaData.type === 'rows' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero filari
              </label>
              <input
                type="number"
                value={areaData.rowCount}
                onChange={(e) => setAreaData(prev => ({ ...prev, rowCount: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lunghezza filari (m)
              </label>
              <input
                type="number"
                value={areaData.rowLength}
                onChange={(e) => setAreaData(prev => ({ ...prev, rowLength: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {areaData.type === 'individual_plants' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numero di piante
            </label>
            <input
              type="number"
              value={areaData.plantCount}
              onChange={(e) => setAreaData(prev => ({ ...prev, plantCount: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          onClick={() => setCurrentStep('product')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 border border-gray-300 rounded-lg text-sm md:text-base order-2 sm:order-1"
        >
          <ArrowLeft size={16} />
          Indietro
        </button>
        <button
          onClick={handleAreaNext}
          className="px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 text-sm md:text-base order-1 sm:order-2"
        >
          <Calculator size={16} />
          Calcola Quantità
        </button>
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Programmazione</h2>
        <p className="text-gray-600">Imposta date e frequenza delle applicazioni</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data prima applicazione
          </label>
          <input
            type="date"
            value={scheduleData.startDate}
            onChange={(e) => setScheduleData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numero di applicazioni
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={scheduleData.totalApplications}
            onChange={(e) => setScheduleData(prev => ({ ...prev, totalApplications: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Frequenza (giorni tra applicazioni)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="90"
            value={scheduleData.customFrequency || selectedProduct?.defaultRepeatDays || 14}
            onChange={(e) => setScheduleData(prev => ({ ...prev, customFrequency: parseInt(e.target.value) || undefined }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={() => setScheduleData(prev => ({ ...prev, customFrequency: undefined }))}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
          >
            Usa default AI ({selectedProduct?.defaultRepeatDays || 14} giorni)
          </button>
        </div>
      </div>

      {/* Anteprima calendario */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
          <Calendar size={16} />
          Anteprima Calendario
        </h3>
        <div className="space-y-2">
          {Array.from({ length: scheduleData.totalApplications }, (_, i) => {
            const date = addDays(new Date(scheduleData.startDate), i * (scheduleData.customFrequency || selectedProduct?.defaultRepeatDays || 14));
            return (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <span className="font-medium">
                  {format(date, 'EEEE d MMMM yyyy', { locale: it })}
                </span>
                <span className="text-gray-600">
                  - Applicazione {i + 1}/{scheduleData.totalApplications}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('area')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Indietro
        </button>
        <button
          onClick={handleScheduleNext}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Creando piano...
            </>
          ) : (
            <>
              <Clock size={16} />
              Crea Piano
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisione Piano</h2>
        <p className="text-gray-600">Controlla tutti i dettagli prima di confermare</p>
      </div>

      {treatmentPlan && (
        <div className="space-y-6">
          {/* Riepilogo prodotto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Prodotto Selezionato</h3>
            <div className="flex items-center gap-3">
              {treatmentPlan.productCard.type === 'fertilizer' ? 
                <Leaf className="text-green-600" size={20} /> : 
                <Shield className="text-amber-600" size={20} />
              }
              <div>
                <div className="font-medium">{treatmentPlan.productCard.name}</div>
                <div className="text-sm text-gray-600">{treatmentPlan.productCard.description}</div>
              </div>
            </div>
          </div>

          {/* Quantità totale */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Calculator size={16} />
              Quantità Calcolate
            </h3>
            <div className="text-lg font-bold text-blue-900">{treatmentPlan.totalQuantity}</div>
            <div className="text-sm text-blue-700 mt-1">
              {treatmentPlan.applicationSchedule.length} applicazioni programmate
            </div>
          </div>

          {/* Calendario applicazioni */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Calendario Applicazioni
            </h3>
            <div className="space-y-3">
              {treatmentPlan.applicationSchedule.map((app, index) => (
                <div key={app.taskId} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {format(new Date(app.date), 'EEEE d MMMM yyyy', { locale: it })}
                    </div>
                    <div className="text-sm text-gray-600">
                      Quantità: {app.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={16} />
                <span className="font-medium">Errore</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('schedule')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Indietro
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Creando task...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Conferma e Crea Task
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="text-green-600" size={32} />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Piano Creato con Successo!</h2>
        <p className="text-gray-600">
          {treatmentPlan?.tasks.length} task sono stati aggiunti al tuo calendario
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">Prossimi Passi</h3>
        <ul className="text-sm text-green-800 space-y-1 text-left">
          <li>• I task sono visibili nel calendario del Planner</li>
          <li>• Riceverai promemoria automatici per ogni applicazione</li>
          <li>• Le quantità sono già calcolate per ogni sessione</li>
          <li>• Controlla sempre le condizioni meteo prima dell'applicazione</li>
        </ul>
      </div>

      <button
        onClick={onClose}
        className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
      >
        Chiudi
      </button>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            {currentStep === 'search' && '🔍 Ricerca Prodotto AI'}
            {currentStep === 'product' && '📋 Scheda Prodotto'}
            {currentStep === 'area' && '📍 Area Applicazione'}
            {currentStep === 'schedule' && '📅 Programmazione'}
            {currentStep === 'review' && '✅ Revisione Piano'}
            {currentStep === 'complete' && '🎉 Completato'}
          </h1>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm border border-gray-200"
            aria-label="Chiudi"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {currentStep !== 'complete' && renderStepIndicator()}
            
            {currentStep === 'search' && renderSearchStep()}
            {currentStep === 'product' && renderProductStep()}
            {currentStep === 'area' && renderAreaStep()}
            {currentStep === 'schedule' && renderScheduleStep()}
            {currentStep === 'review' && renderReviewStep()}
            {currentStep === 'complete' && renderCompleteStep()}
          </div>
        </div>
      </div>
    </div>
  );
}