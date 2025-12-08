
import React, { useState } from 'react';
import { getTreatmentAdvice, diagnosePlantHealth } from '../services/geminiService';
import { TreatmentAdvice } from '../types';
import { Search, Loader2, ShieldCheck, Leaf, AlertCircle, Camera, Sparkles, Activity, CalendarClock, AlertTriangle, Bug, ClipboardList } from 'lucide-react';

interface AdviceProps {
  onAddToJournal: (title: string, notes: string, date: string) => void;
}

const Advice: React.FC<AdviceProps> = ({ onAddToJournal }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<TreatmentAdvice | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const [error, setError] = useState<string | null>(null);

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

  const getSeverityBadge = (level: string) => {
      switch(level) {
          case 'Low': return <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1"><ShieldCheck size={14}/> Gravità Bassa</span>;
          case 'Medium': return <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1"><AlertTriangle size={14}/> Gravità Media</span>;
          case 'High': return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1"><AlertTriangle size={14}/> Gravità Alta</span>;
          case 'Critical': return <span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1"><AlertCircle size={14}/> Critico</span>;
          default: return null;
      }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-green-800">Il Dottore dell'Orto</h1>
        <p className="text-green-600">Chiedi consiglio o scatta una foto per diagnosticare malattie.</p>
      </header>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
            >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            </button>
        </div>
        
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
      </form>

      {advice && (
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-green-50 p-5 border-b border-green-100">
            <div className="flex justify-between items-start mb-2">
                 <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2 leading-none">
                    {advice.problem}
                </h2>
                {getSeverityBadge(advice.severity)}
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mt-2 bg-white/50 p-3 rounded-lg border border-green-100">
                {advice.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                 {advice.cause && (
                     <div className="bg-white/60 p-2 rounded-lg border border-green-200 text-xs flex gap-2 items-start">
                         <div className="p-1 bg-green-100 rounded text-green-700 shrink-0"><AlertCircle size={12}/></div>
                         <div>
                             <span className="font-bold text-green-900 block uppercase text-[10px]">Causa Probabile</span>
                             <span className="text-green-800">{advice.cause}</span>
                         </div>
                     </div>
                 )}
                 {advice.symptoms && advice.symptoms.length > 0 && (
                     <div className="bg-white/60 p-2 rounded-lg border border-green-200 text-xs flex gap-2 items-start">
                         <div className="p-1 bg-green-100 rounded text-green-700 shrink-0"><Bug size={12}/></div>
                         <div>
                             <span className="font-bold text-green-900 block uppercase text-[10px]">Sintomi Osservati</span>
                             <div className="flex flex-wrap gap-1 mt-0.5">
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
                 <h3 className="text-red-900 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                    <Activity size={18} /> Azione Immediata
                </h3>
                <p className="text-red-800 font-medium">{advice.immediateAction}</p>
            </div>

            {/* STEPS */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
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
                 <h3 className="text-blue-900 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                    <CalendarClock size={18} /> Prevenzione Futura
                </h3>
                <p className="text-blue-800 text-sm">{advice.longTermCare}</p>
            </div>

            {advice.products && advice.products.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-gray-500 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                        <Leaf size={14} /> Prodotti Consigliati {advice.organic && '(Bio)'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {advice.products.map((p, i) => (
                            <span key={i} className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold shadow-sm hover:border-green-300 transition-colors">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={scheduleTreatment}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 transform active:scale-95"
            >
                <AlertCircle size={20} />
                Aggiungi Trattamento al Diario
            </button>
          </div>
        </div>
      )}
      
      {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600"/>
                  {error}
              </p>
          </div>
      )}

      {!advice && !loading && !isAnalyzingImage && !error && (
          <div className="text-center py-10 opacity-50">
              <Sparkles size={48} className="mx-auto mb-3 text-green-300" />
              <p className="text-sm text-green-800">Usa l'AI per identificare problemi e ricevere cure personalizzate.</p>
          </div>
      )}
    </div>
  );
};

export default Advice;
