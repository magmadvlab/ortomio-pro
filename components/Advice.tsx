
import React, { useState, useRef, useEffect } from 'react';
import { getTreatmentAdvice, diagnosePlantHealth } from '../services/geminiService';
import { TreatmentAdvice, Garden } from '../types';
import { useStorage } from '../packages/core/hooks/useStorage';
import { Agronomist, AgronomistConsultation } from '../types/agronomist';
import { Search, Loader2, ShieldCheck, Leaf, AlertCircle, Camera, Sparkles, Activity, CalendarClock, AlertTriangle, Bug, ClipboardList, X, UserCheck, Users, Mail, Phone, Plus, MessageSquare, Calendar } from 'lucide-react';
import { suggestPhytoProduct, PhytoRecommendation, checkTreatmentTiming, calculateSafetyInterval } from '../logic/phytoEngine';
import { getMasterSheet } from '../services/plantMasterService';
import { getWeatherForecast } from '../services/weatherService';
import ConsultationList from './agronomist/ConsultationList';
import ConsultationForm from './agronomist/ConsultationForm';
import AgronomistSearch from './agronomist/AgronomistSearch';
import AgronomistManager from './AgronomistManager';
import { getSupabaseClient } from '../config/supabase';

interface AdviceProps {
  onAddToJournal: (title: string, notes: string, date: string) => void;
  initialTab?: 'diagnosis' | 'consultations' | 'agronomists';
}

const Advice: React.FC<AdviceProps> = ({ onAddToJournal, initialTab = 'diagnosis' }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<TreatmentAdvice | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Agronomist section
  const { storageProvider } = useStorage();
  const [agronomists, setAgronomists] = useState<Agronomist[]>([]);
  const [showAgronomistModal, setShowAgronomistModal] = useState(false);
  const [loadingAgronomists, setLoadingAgronomists] = useState(false);
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'consultations' | 'agronomists'>(initialTab);
  
  // Update tab when initialTab changes (from URL params)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Consultations
  const [consultations, setConsultations] = useState<AgronomistConsultation[]>([]);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<AgronomistConsultation | null>(null);
  const [selectedAgronomistId, setSelectedAgronomistId] = useState<string | undefined>();

  // Phyto Engine - Prodotti concreti con dosaggi
  const [phytoRecommendations, setPhytoRecommendations] = useState<PhytoRecommendation[]>([]);
  const [loadingPhyto, setLoadingPhyto] = useState(false);
  const [garden, setGarden] = useState<Garden | null>(null);

  /**
   * FOTOCAMERA - Avvia fotocamera per scattare foto
   */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Preferisci camera posteriore
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Impossibile accedere alla fotocamera. Verifica i permessi o usa upload file.');
    }
  };

  /**
   * FOTOCAMERA - Chiudi fotocamera
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  /**
   * FOTOCAMERA - Scatta foto dalla camera
   */
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        stopCamera();
        setIsAnalyzingImage(true);
        setAdvice(null);
        setQuery("Analisi immagine in corso...");

        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64String = event.target?.result as string;
          const base64Data = base64String.split(',')[1];

          try {
            const result = await diagnosePlantHealth(base64Data);
            if (result) {
              setAdvice(result);
              setQuery(result.problem);
              setError(null);
            } else {
              setError("Impossibile diagnosticare dall'immagine. Prova con una foto più chiara o descrivi il problema.");
              setQuery("");
            }
          } catch (e: any) {
            console.error(e);
            const errorMsg = e?.message || "Errore sconosciuto";
            if (errorMsg.includes("API Key")) {
              setError("Chiave API non configurata. Configura VITE_GEMINI_API_KEY nel file .env per utilizzare questa funzionalità.");
            } else if (errorMsg.includes("401") || errorMsg.includes("403")) {
              setError("Chiave API non valida. Verifica la configurazione in .env");
            } else {
              setError(`Errore nell'analisi: ${errorMsg}`);
            }
            setQuery("");
          } finally {
            setIsAnalyzingImage(false);
          }
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.7);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Load garden
  useEffect(() => {
    const loadGarden = async () => {
      try {
        const gardens = await storageProvider.getGardens();
        if (gardens.length > 0) {
          setGarden(gardens[0]);
        }
      } catch (error) {
        console.error('Error loading garden:', error);
      }
    };
    loadGarden();
  }, [storageProvider]);

  // Get current user ID helper
  const getCurrentUserId = async (): Promise<string | null> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return localStorage.getItem('user_id') || null;
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return localStorage.getItem('user_id') || null;
      }
      return user.id;
    } catch (error) {
      console.error('Error getting current user:', error);
      return localStorage.getItem('user_id') || null;
    }
  };

  // Load agronomists
  useEffect(() => {
    const loadAgronomists = async () => {
      try {
        setLoadingAgronomists(true);
        const userId = await getCurrentUserId();
        if (!userId) {
          setAgronomists([]);
          return;
        }
        const loaded = await storageProvider.getAgronomists(userId);
        setAgronomists(loaded);
      } catch (error) {
        console.error('Error loading agronomists:', error);
      } finally {
        setLoadingAgronomists(false);
      }
    };
    loadAgronomists();
  }, [storageProvider]);

  // Load consultations
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          setConsultations([]);
          return;
        }
        const loaded = await storageProvider.getConsultations(userId, selectedAgronomistId);
        setConsultations(loaded);
      } catch (error) {
        console.error('Error loading consultations:', error);
      }
    };
    if (activeTab === 'consultations' || activeTab === 'agronomists') {
      loadConsultations();
    }
  }, [storageProvider, activeTab, selectedAgronomistId]);

  const handleCreateConsultation = async (consultation: Omit<AgronomistConsultation, 'id' | 'createdAt'>) => {
    try {
      await storageProvider.createConsultation(consultation);
      const userId = await getCurrentUserId();
      if (userId) {
        const loaded = await storageProvider.getConsultations(userId, selectedAgronomistId);
        setConsultations(loaded);
      }
      setShowConsultationForm(false);
      setEditingConsultation(null);
    } catch (error) {
      console.error('Error creating consultation:', error);
      alert('Errore nella creazione della consultazione');
    }
  };

  const handleSelectAgronomist = (agronomist: Agronomist) => {
    setSelectedAgronomistId(agronomist.id);
    setActiveTab('consultations');
  };

  // Quando riceviamo un TreatmentAdvice, convertiamo i prodotti generici in prodotti concreti con phytoEngine
  useEffect(() => {
    const convertToConcreteProducts = async () => {
      if (!advice || !advice.products || advice.products.length === 0 || !garden) {
        setPhytoRecommendations([]);
        return;
      }

      setLoadingPhyto(true);
      try {
        const recommendations: PhytoRecommendation[] = [];
        
        // Per ogni prodotto generico suggerito, trova prodotto concreto
        for (const productName of advice.products.slice(0, 3)) { // Limita a 3 prodotti
          // Estrai nome pianta dal problema (semplificato)
          const plantName = advice.problem.split(' ')[0]; // Esempio semplificato
          const masterSheet = await getMasterSheet(plantName);
          
          if (masterSheet) {
            // Ottieni previsioni meteo se disponibili
            let weatherForecast;
            if (garden.coordinates) {
              try {
                weatherForecast = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);
              } catch (e) {
                // Ignora errori meteo
              }
            }

	            const currentForecast = Array.isArray(weatherForecast) ? weatherForecast[0] : weatherForecast;

	            const phytoRec = await suggestPhytoProduct(
	              advice.problem,
	              masterSheet,
	              currentForecast ? {
	                tempMin: currentForecast.tempMin ?? currentForecast.temp_min,
	                tempMax: currentForecast.tempMax ?? currentForecast.temp_max,
	                precipitation: currentForecast.rainForecastMm ?? currentForecast.precipitation ?? 0,
	                wind: currentForecast.windSpeed ?? currentForecast.wind_speed
	              } : undefined,
	              undefined // userProfile - TODO: caricare da context
	            );

            if (phytoRec) {
              recommendations.push(phytoRec);
            }
          }
        }

        setPhytoRecommendations(recommendations);
      } catch (error) {
        console.error('Error converting to concrete products:', error);
      } finally {
        setLoadingPhyto(false);
      }
    };

    convertToConcreteProducts();
  }, [advice, garden]);

  /**
   * RICERCA TESTUALE - Diagnosi da Descrizione
   * 
   * Permette di descrivere il problema a parole e ricevere consigli.
   * 
   * INTEGRAZIONE GEMINI AI:
   * - Utilizza getTreatmentAdvice() che invia la query a Gemini 2.5 Flash
   * - L'AI analizza la descrizione e identifica:
   *   - Problema probabile (malattia, carenza, stress)
   *   - Cause possibili
   *   - Sintomi correlati
   *   - Trattamenti consigliati (prodotti, dosi, tempi)
   *   - Azioni immediate da intraprendere
   *   - Prevenzione futura
   * 
   * La risposta è strutturata in formato TreatmentAdvice con:
   * - problem: Nome del problema identificato
   * - severity: Gravità (Low, Medium, High, Critical)
   * - description: Descrizione dettagliata
   * - cause: Causa probabile
   * - symptoms: Array di sintomi osservati
   * - immediateAction: Cosa fare subito
   * - steps: Piano di trattamento passo-passo
   * - products: Prodotti consigliati
   * - organic: Se i prodotti sono biologici
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAdvice(null);
    setError(null);
    try {
      const result = await getTreatmentAdvice(query);
      if (result) {
        setAdvice(result);
      } else {
        setError("Nessun risultato trovato. Prova a descrivere il problema in modo più dettagliato.");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.message || "Errore sconosciuto";
      if (errorMsg.includes("API Key")) {
        setError("Chiave API non configurata. Configura VITE_GEMINI_API_KEY nel file .env per utilizzare questa funzionalità.");
      } else if (errorMsg.includes("401") || errorMsg.includes("403")) {
        setError("Chiave API non valida. Verifica la configurazione in .env");
      } else {
        setError(`Errore nella diagnosi: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * ANALISI IMMAGINE - Diagnosi da Foto
   * 
   * Permette di diagnosticare problemi delle piante caricando una foto.
   * 
   * PROCESSO:
   * 1. L'utente carica un'immagine (da file o fotocamera)
   * 2. L'immagine viene ridimensionata a max 800px per ottimizzare upload
   * 3. L'immagine viene convertita in base64
   * 4. Viene inviata a Gemini AI Vision (diagnosePlantHealth) per analisi
   * 5. L'AI identifica sintomi, possibili malattie, e suggerisce trattamenti
   * 
   * INTEGRAZIONE GEMINI AI:
   * - Utilizza Google Gemini 2.5 Flash con vision capabilities
   * - Analizza sintomi visibili (macchie, decolorazioni, deformazioni, etc.)
   * - Fornisce diagnosi strutturata con gravità, cause probabili, trattamenti
   * 
   * REQUISITI:
   * - VITE_GEMINI_API_KEY deve essere configurata nel file .env
   * - L'immagine deve essere chiara e mostrare chiaramente il problema
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzingImage(true);
      setAdvice(null);
      setQuery("Analisi immagine in corso...");

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          // Resize image for optimization
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          const base64Data = base64String.split(',')[1];
          
          try {
             const result = await diagnosePlantHealth(base64Data);
             if (result) {
                 setAdvice(result);
                 setQuery(result.problem); // Auto-fill query with diagnosis
                 setError(null);
             } else {
                 setError("Impossibile diagnosticare dall'immagine. Prova con una foto più chiara o descrivi il problema.");
                 setQuery("");
             }
          } catch (e: any) {
              console.error(e);
              const errorMsg = e?.message || "Errore sconosciuto";
              if (errorMsg.includes("API Key")) {
                setError("Chiave API non configurata. Configura VITE_GEMINI_API_KEY nel file .env per utilizzare questa funzionalità.");
              } else if (errorMsg.includes("401") || errorMsg.includes("403")) {
                setError("Chiave API non valida. Verifica la configurazione in .env");
              } else {
                setError(`Errore nell'analisi: ${errorMsg}`);
              }
              setQuery("");
          } finally {
              setIsAnalyzingImage(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const scheduleTreatment = () => {
    if (!advice) return;
    const today = new Date().toISOString().split('T')[0];
    onAddToJournal(
        `Trattamento: ${advice.problem}`, 
        `Gravità: ${advice.severity}.\nAzione Immediata: ${advice.immediateAction}\nSoluzione: ${advice.description}. Prodotti: ${advice.products?.join(', ')}`, 
        today
    );
  };

  /**
   * GRAVITÀ PROBLEMI - Indicatori di Severità
   * 
   * La gravità viene determinata da Gemini AI basandosi su:
   * - Estensione del problema (quante foglie/piante colpite)
   * - Velocità di progressione
   * - Impatto sulla produzione
   * - Rischio di diffusione ad altre piante
   * 
   * LIVELLI:
   * - Low (Bassa): Problema minore, monitoraggio consigliato
   * - Medium (Media): Richiede intervento, ma non urgente
   * - High (Alta): Intervento necessario entro pochi giorni
   * - Critical (Critico): Azione immediata richiesta, rischio perdita pianta
   * 
   * Il colore del badge riflette la gravità per identificazione rapida.
   */
  const getSeverityBadge = (level: string) => {
      switch(level) {
          case 'Low': return <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-3"><ShieldCheck size={14}/> Gravità Bassa</span>;
          case 'Medium': return <span className="bg-yellow-full max-w-sm text-yellow-full max-w-sm border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-3"><AlertTriangle size={14}/> Gravità Media</span>;
          case 'High': return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-3"><AlertTriangle size={14}/> Gravità Alta</span>;
          case 'Critical': return <span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-3"><AlertCircle size={14}/> Critico</span>;
          default: return null;
      }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-lg md:text-xl md:text-xl md:text-2xl font-bold text-green-800">Il Dottore dell'Orto</h1>
        <p className="text-green-600">Chiedi consiglio o scatta una foto per diagnosticare malattie.</p>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'diagnosis'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles className="inline mr-2" size={16} />
              Diagnosi AI
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'consultations'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="inline mr-2" size={16} />
              Consultazioni
            </button>
            <button
              onClick={() => setActiveTab('agronomists')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'agronomists'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline mr-2" size={16} />
              Agronomi
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content - Diagnosis */}
      {activeTab === 'diagnosis' && (
        <div>
          <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <div className="relative flex-1">
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Es: Foglie gialle, macchie..."
            className="w-full p-4 pr-12 rounded-xl border border-green-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none h-full"
            />
            <button 
                type="submit" 
                disabled={loading || isAnalyzingImage}
                className="absolute right-3 top-3/2 -translate-y-1/2 p-3 text-green-600 hover:text-green-800 disabled:opacity-50"
            >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            </button>
        </div>
        
        {!isCameraActive ? (
          <>
            <label className={`flex-shrink-0 w-14 h-full min-h-[56px] bg-green-600 text-white rounded-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors ${isAnalyzingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                onChange={handleImageUpload}
              />
              {isAnalyzingImage ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
            </label>
            <button
              type="button"
              onClick={startCamera}
              disabled={isAnalyzingImage}
              className={`flex-shrink-0 w-14 h-full min-h-[56px] bg-blue-600 text-white rounded-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors ${isAnalyzingImage ? 'opacity-50 pointer-events-none' : ''}`}
              title="Usa fotocamera"
            >
              <Camera size={24} />
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="flex-shrink-0 w-14 h-full min-h-[56px] bg-red-600 text-white rounded-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
              title="Chiudi fotocamera"
            >
              <X size={24} />
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-shrink-0 w-14 h-full min-h-[56px] bg-green-600 text-white rounded-xl shadow-md flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors"
              title="Scatta foto"
            >
              <Camera size={24} />
            </button>
          </div>
        )}
      </form>

          {isCameraActive && (
            <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-green-500">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto max-h-96 object-cover"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center gap-3"
                >
                  <Camera size={20} />
                  <span>Scatta Foto</span>
                </button>
              </div>
            </div>
          )}

          {advice && (
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-green-50 p-5 border-b border-green-100">
            <div className="flex justify-between items-start mb-2">
                 <h2 className="text-lg md:text-xl md:text-xl md:text-2xl font-bold text-green-900 flex items-center gap-3 leading-none">
                    {advice.problem}
                </h2>
                {getSeverityBadge(advice.severity)}
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mt-2 bg-white/50 p-3 rounded-lg border border-green-100">
                {advice.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                 {advice.cause && (
                     <div className="bg-white/60 p-3 rounded-lg border border-green-200 text-xs flex gap-3 items-start">
                         <div className="p-3 bg-green-100 rounded text-green-700 shrink-0"><AlertCircle size={12}/></div>
                         <div>
                             <span className="font-bold text-green-900 block uppercase text-[10px]">Causa Probabile</span>
                             <span className="text-green-800">{advice.cause}</span>
                         </div>
                     </div>
                 )}
                 {advice.symptoms && advice.symptoms.length > 0 && (
                     <div className="bg-white/60 p-3 rounded-lg border border-green-200 text-xs flex gap-3 items-start">
                         <div className="p-3 bg-green-100 rounded text-green-700 shrink-0"><Bug size={12}/></div>
                         <div>
                             <span className="font-bold text-green-900 block uppercase text-[10px]">Sintomi Osservati</span>
                             <div className="flex flex-wrap gap-3 mt-0.5">
                                 {advice.symptoms.map((s, i) => (
                                     <span key={i} className="bg-green-100 px-1.5 rounded text-[10px] text-green-800">{s}</span>
                                 ))}
                             </div>
                         </div>
                     </div>
                 )}
            </div>
          </div>
          
          <div className="p-5 space-y-6">
            
            {/* IMMEDIATE ACTION */}
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                 <h3 className="text-red-900 font-bold text-sm uppercase mb-2 flex items-center gap-3">
                    <Activity size={18} /> Azione Immediata
                </h3>
                <p className="text-red-800 font-medium">{advice.immediateAction}</p>
            </div>

            {/* STEPS */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-3">
                  <ClipboardList size={18} className="text-green-600"/> Piano di Trattamento
              </h3>
              <ul className="space-y-4">
                {advice.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-4 text-gray-700 text-sm group">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors rounded-full flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="leading-snug pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* LONG TERM */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <h3 className="text-blue-900 font-bold text-sm uppercase mb-2 flex items-center gap-3">
                    <CalendarClock size={18} /> Prevenzione Futura
                </h3>
                <p className="text-blue-800 text-sm">{advice.longTermCare}</p>
            </div>

            {/* Prodotti Generici da AI */}
            {advice.products && advice.products.length > 0 && phytoRecommendations.length === 0 && (
                <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-gray-500 font-bold text-xs uppercase mb-3 flex items-center gap-3">
                        <Leaf size={14} /> Prodotti Consigliati {advice.organic && '(Bio)'}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {advice.products.map((p, i) => (
                            <span key={i} className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold shadow-sm hover:border-green-300 transition-colors">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Prodotti Concreti con Dosaggi da Phyto Engine */}
            {phytoRecommendations.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-green-700 font-bold text-sm mb-3 flex items-center gap-3">
                        <Leaf size={16} /> Prodotti Specifici con Dosaggi
                        {loadingPhyto && <Loader2 size={14} className="animate-spin" />}
                    </h4>
                    <div className="space-y-3">
                        {phytoRecommendations.map((rec, idx) => (
                            <div key={idx} className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900">{rec.product.name}</h5>
                                        <p className="text-xs text-gray-600 mt-1">{rec.reason}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        rec.effectiveness === 'high' ? 'bg-green-100 text-green-800' :
                                        rec.effectiveness === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {rec.effectiveness === 'high' ? 'Alta' : rec.effectiveness === 'medium' ? 'Media' : 'Bassa'}
                                    </span>
                                </div>
                                <div className="mt-2 space-y-1 text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-700">Dosaggio:</span>
                                        <span className="text-gray-900">{rec.dosage.amount} {rec.dosage.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-700">Metodo:</span>
                                        <span className="text-gray-900 capitalize">{rec.method}</span>
                                    </div>
                                    {rec.warnings && rec.warnings.length > 0 && (
                                        <div className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-full max-w-sm">
                                            <p className="text-xs text-yellow-full max-w-sm font-medium">⚠️ Avvisi:</p>
                                            <ul className="text-xs text-yellow-full max-w-sm mt-1 space-y-1">
                                                {rec.warnings.map((w, i) => (
                                                    <li key={i}>• {w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={scheduleTreatment}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 transform active:scale-95"
            >
                <AlertCircle size={20} />
                Aggiungi Trattamento al Diario
            </button>
          </div>
        </div>
      )}

          {/* Consulenza Agronomica Professionale */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden mt-6">
        <div className="p-5">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
            <p className="text-blue-800 text-sm">
              {advice 
                ? "L'AI fornisce suggerimenti iniziali, ma per casi complessi ti consigliamo di contattare un agronomo professionista."
                : "Hai bisogno di una consulenza professionale? Contatta un agronomo certificato per ricevere supporto personalizzato."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Agronomo di Fiducia */}
            <div className="bg-white border border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-3">
                <UserCheck size={18} /> Agronomo di Fiducia
              </h4>
              {loadingAgronomists ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-green-600" />
                </div>
              ) : agronomists.length > 0 ? (
                <div className="space-y-2">
                  {agronomists.slice(0, 2).map((agr) => (
                    <div key={agr.id} className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="font-semibold text-sm text-green-900">{agr.name}</p>
                      {agr.specialization && agr.specialization.length > 0 && (
                        <p className="text-xs text-green-700 mt-1">
                          {agr.specialization.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAgronomistModal(true)}
                    className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
                  >
                    <Users size={16} /> Vedi tutti
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAgronomistModal(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
                >
                  <Plus size={16} /> Aggiungi Primo Agronomo
                </button>
              )}
            </div>

            {/* Agronomi OrtoMio */}
            <div className="bg-white border border-blue-200 rounded-xl p-4">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-3">
                <Users size={18} /> Agronomi OrtoMio
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Contatta agronomi certificati OrtoMio per consulenze professionali.
              </p>
              <button
                onClick={() => setShowAgronomistModal(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
              >
                <Mail size={16} /> Contatta Agronomo OrtoMio
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            OrtoMio collabora con agronomi professionisti per offrire il meglio di entrambi i mondi.
          </p>
          </div>
        </div>

          {!advice && !loading && !isAnalyzingImage && !error && (
              <div className="text-center py-10 opacity-50">
                  <Sparkles size={48} className="mx-auto mb-3 text-green-300" />
                  <p className="text-sm text-green-800">Usa l'AI per identificare problemi e ricevere cure personalizzate.</p>
              </div>
          )}
        </div>
      )}

      {/* Modal Selezione Agronomo */}
      {showAgronomistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAgronomistModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg md:text-lg md:text-xl font-bold text-green-900">Seleziona Agronomo</h3>
              <button
                onClick={() => setShowAgronomistModal(false)}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Agronomi di Fiducia */}
              <div>
                <h4 className="font-bold text-green-900 mb-3 flex items-center gap-3">
                  <UserCheck size={18} /> I Tuoi Agronomi di Fiducia
                </h4>
                {agronomists.length > 0 ? (
                  <div className="space-y-2">
                    {agronomists.map((agr) => (
                      <div key={agr.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-green-900">{agr.name}</p>
                            {agr.specialization && agr.specialization.length > 0 && (
                              <p className="text-xs text-green-700 mt-1">
                                Specializzazione: {agr.specialization.join(', ')}
                              </p>
                            )}
                            {agr.notes && (
                              <p className="text-xs text-gray-600 mt-1">{agr.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-3 ml-4">
                            {agr.email && (
                              <a
                                href={`mailto:${agr.email}?subject=Consulenza OrtoMio - ${advice?.problem || 'Problema Piante'}&body=${encodeURIComponent(`Ciao ${agr.name},\n\nHo bisogno di una consulenza riguardo:\n\nProblema: ${advice?.problem || query}\n\nGravità: ${advice?.severity || 'N/A'}\n\nDescrizione: ${advice?.description || query}\n\nGrazie!`)}`}
                                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                title="Invia Email"
                              >
                                <Mail size={16} />
                              </a>
                            )}
                            {agr.phone && (
                              <a
                                href={`tel:${agr.phone}`}
                                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                title="Chiama"
                              >
                                <Phone size={16} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-gray-600 mb-3">Nessun agronomo di fiducia salvato.</p>
                    <button
                      onClick={() => {
                        setShowAgronomistModal(false);
                        setActiveTab('agronomists');
                      }}
                      className="py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-3 mx-auto"
                    >
                      <Plus size={16} /> Aggiungi Agronomo
                    </button>
                  </div>
                )}
              </div>

              {/* Agronomi OrtoMio */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-3">
                  <Users size={18} /> Agronomi Certificati OrtoMio
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    Contatta un agronomo certificato OrtoMio per consulenze professionali.
                  </p>
                  <a
                    href="mailto:agronomi@ortomio.it?subject=Richiesta Consulenza"
                    className="block w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-3"
                  >
                    <Mail size={16} /> Contatta Agronomi OrtoMio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message - visibile in tutte le tab */}
      {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 font-medium flex items-center gap-3">
                  <AlertCircle size={16} className="text-red-600"/>
                  {error}
              </p>
          </div>
      )}

      {activeTab === 'consultations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {selectedAgronomistId && (
                <button
                  onClick={() => {
                    setSelectedAgronomistId(undefined);
                    const loadConsultations = async () => {
                      const userId = await getCurrentUserId();
                      if (userId) {
                        const loaded = await storageProvider.getConsultations(userId);
                        setConsultations(loaded);
                      }
                    };
                    loadConsultations();
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Rimuovi filtro
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setShowConsultationForm(true);
                setEditingConsultation(null);
              }}
              className="flex items-center gap-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Nuova Consultazione
            </button>
          </div>

          {showConsultationForm && (
            <div className="mb-6">
              <ConsultationForm
                agronomists={agronomists}
                consultation={editingConsultation || undefined}
                onSave={handleCreateConsultation}
                onCancel={() => {
                  setShowConsultationForm(false);
                  setEditingConsultation(null);
                }}
              />
            </div>
          )}

          <ConsultationList
            consultations={consultations}
            agronomists={agronomists}
            onEdit={(consultation) => {
              setEditingConsultation(consultation);
              setShowConsultationForm(true);
            }}
            onSelectAgronomist={handleSelectAgronomist}
          />
        </div>
      )}

      {activeTab === 'agronomists' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg md:text-lg md:text-xl font-bold text-gray-900 mb-4">Agronomi di Fiducia</h2>
            <AgronomistManager onSelectAgronomist={handleSelectAgronomist} />
          </div>

          <div>
            <h2 className="text-lg md:text-lg md:text-xl font-bold text-gray-900 mb-4">Cerca Agronomo</h2>
            <AgronomistSearch
              onSelectAgronomist={handleSelectAgronomist}
              existingAgronomists={agronomists}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Advice;
