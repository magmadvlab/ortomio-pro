import React, { useState } from 'react';
import { PlantMasterSheet, Garden } from '../types';
import { diagnoseFromPhoto, matchSymptoms, getTreatmentPlan, DiagnosisResult, TreatmentPlan } from '../logic/diseaseDiagnosisEngine';
import { getSeasonForDate } from '../utils/seasonalAdjustment';
import { Camera, Loader2, AlertTriangle, CheckCircle, Clock, FlaskConical, Shield, X, Upload, FileImage } from 'lucide-react';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';

interface DiseaseDiagnosisProps {
  plant: PlantMasterSheet;
  garden: Garden;
  weatherForecast?: any[];
}

const DiseaseDiagnosis: React.FC<DiseaseDiagnosisProps> = ({ plant, garden, weatherForecast }) => {
  const { can, isPro } = useTier();
  const [photo, setPhoto] = useState<string | null>(null);
  const [symptomsText, setSymptomsText] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

  // Protezione Pro: Diagnosi AI è feature Pro
  if (!can('diseaseDiagnosis')) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-red-200">
        <UpgradePrompt
          feature="Diagnosi Malattie con AI"
          variant="inline"
          onUpgrade={() => {
            // TODO: Implementare upgrade flow
            console.log('Upgrade to Pro');
          }}
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Versione Free:</strong> Puoi ancora descrivere i sintomi manualmente e ricevere suggerimenti base.
          </p>
          <p className="text-xs text-gray-500">
            La diagnosi automatica tramite foto e l'analisi AI avanzata sono disponibili in versione Pro.
          </p>
        </div>
      </div>
    );
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!photo && !symptomsText.trim()) {
      alert('Carica una foto o descrivi i sintomi');
      return;
    }

    setIsAnalyzing(true);
    try {
      let result: DiagnosisResult;

      if (photo) {
        // Analisi con foto
        const season = getSeasonForDate(new Date(), garden.coordinates?.latitude || 0);
        result = await diagnoseFromPhoto(photo, plant.commonName, {
          season,
          weather: weatherForecast,
          garden
        });
      } else {
        // Matching testuale
        const season = getSeasonForDate(new Date(), garden.coordinates?.latitude || 0);
        result = matchSymptoms(symptomsText, plant.commonName, season, weatherForecast);
      }

      setDiagnosisResult(result);
      
      if (result.recommendedTreatment) {
        const plan = getTreatmentPlan(
          result.recommendedTreatment.id,
          plant.commonName,
          result.recommendedTreatment.symptoms.severity
        );
        setTreatmentPlan(plan);
        setSelectedDisease(result.recommendedTreatment.id);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
      alert('Errore durante l\'analisi. Riprova.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectDisease = (diseaseId: string) => {
    setSelectedDisease(diseaseId);
    const plan = getTreatmentPlan(diseaseId, plant.commonName);
    setTreatmentPlan(plan);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      case 'Medium': return 'bg-yellow-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fungal': return 'bg-purple-100 text-purple-800';
      case 'Bacterial': return 'bg-red-100 text-red-800';
      case 'Viral': return 'bg-pink-100 text-pink-800';
      case 'Pest': return 'bg-orange-100 text-orange-800';
      case 'Deficiency': return 'bg-yellow-100 text-yellow-800';
      case 'Environmental': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-red-200">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical size={24} className="text-red-600" />
        <h3 className="text-xl font-bold text-gray-800">Diagnosi Malattie</h3>
      </div>

      {/* Upload Foto */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Camera size={16} className="inline mr-1" />
          Foto della Pianta
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Opzione 1: Scatta foto (mobile) */}
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors h-full flex flex-col items-center justify-center">
              <Camera size={24} className="mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">Scatta Foto</p>
              <p className="text-xs text-gray-400">Usa la fotocamera</p>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
          
          {/* Opzione 2: Carica file (desktop) */}
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors h-full flex flex-col items-center justify-center">
              <Upload size={24} className="mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">Carica Immagine</p>
              <p className="text-xs text-gray-400">Dal computer</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>
        
        {/* Preview foto caricata */}
        {photo && (
          <div className="mt-3 relative">
            <img src={photo} alt="Sintomi" className="max-h-48 mx-auto rounded-lg border-2 border-green-400" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
            >
              <X size={16} />
            </button>
            <p className="text-center text-sm text-green-600 mt-2 font-medium">✓ Foto caricata</p>
          </div>
        )}
      </div>

      {/* Descrizione Sintomi (Alternativa) */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Oppure descrivi i sintomi
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          rows={3}
          placeholder="Es: Foglie con macchie gialle, muffa grigia sulla pagina inferiore..."
          value={symptomsText}
          onChange={(e) => setSymptomsText(e.target.value)}
        />
      </div>

      {/* Bottone Analizza */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || (!photo && !symptomsText.trim())}
        className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analisi in corso...
          </>
        ) : (
          <>
            <FileImage size={18} />
            Analizza Sintomi
          </>
        )}
      </button>

      {/* Risultati Diagnosi */}
      {diagnosisResult && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1">
                <Shield size={18} className="text-blue-600" />
                <h4 className="font-bold text-blue-900">Risultati Analisi</h4>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${getUrgencyColor(diagnosisResult.urgency)}`}>
                {diagnosisResult.urgency.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-blue-800">
              Trovate {diagnosisResult.diagnoses.length} malattia/i possibile/i
            </p>
          </div>

          {/* Lista Malattie Probabili */}
          <div className="space-y-3">
            {diagnosisResult.diagnoses.map((diagnosis, idx) => (
              <div
                key={diagnosis.disease.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedDisease === diagnosis.disease.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleSelectDisease(diagnosis.disease.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-gray-800">{diagnosis.disease.nameIT}</h5>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getCategoryColor(diagnosis.disease.category)}`}>
                        {diagnosis.disease.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{diagnosis.reasoning}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Confidenza: {Math.round(diagnosis.confidence * 100)}%</span>
                      {diagnosis.matchedSymptoms.length > 0 && (
                        <span>• Sintomi: {diagnosis.matchedSymptoms.slice(0, 3).join(', ')}</span>
                      )}
                    </div>
                  </div>
                  {idx === 0 && (
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Match Contestuale */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs">
            <p className="font-semibold mb-2">Match Contestuale:</p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <span className={diagnosisResult.contextMatch.season ? 'text-green-600' : 'text-gray-400'}>
                {diagnosisResult.contextMatch.season ? '✓' : '✗'} Stagione
              </span>
              <span className={diagnosisResult.contextMatch.plant ? 'text-green-600' : 'text-gray-400'}>
                {diagnosisResult.contextMatch.plant ? '✓' : '✗'} Pianta
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Piano Trattamento */}
      {treatmentPlan && (
        <div className="mt-6 bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical size={20} className="text-orange-600" />
            <h4 className="font-bold text-orange-900">Piano Trattamento</h4>
            <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${getUrgencyColor(treatmentPlan.disease.treatment.urgency)}`}>
              {treatmentPlan.disease.treatment.urgency.toUpperCase()}
            </span>
          </div>

          {/* Timeline */}
          {treatmentPlan.timeline.immediate.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-600" />
                <h5 className="font-bold text-red-900">AZIONI IMMEDIATE (Oggi)</h5>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {treatmentPlan.timeline.immediate.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {treatmentPlan.timeline.shortTerm.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-orange-600" />
                <h5 className="font-bold text-orange-900">BREVE TERMINE (1-3 giorni)</h5>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
                {treatmentPlan.timeline.shortTerm.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {treatmentPlan.timeline.longTerm.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-blue-600" />
                <h5 className="font-bold text-blue-900">LUNGO TERMINE (1-2 settimane)</h5>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                {treatmentPlan.timeline.longTerm.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Trattamenti Organici */}
          <div className="mb-4">
            <h5 className="font-bold text-gray-800 mb-2">Trattamenti Biologici Consigliati:</h5>
            <div className="flex flex-wrap gap-2">
              {treatmentPlan.disease.treatment.organic.map((treatment, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  {treatment}
                </span>
              ))}
            </div>
          </div>

          {/* Follow-up */}
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Prossimo Controllo: {new Date(treatmentPlan.followUp.checkDate).toLocaleDateString('it-IT')}
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Miglioramento atteso: {treatmentPlan.followUp.expectedImprovement}
            </p>
            {treatmentPlan.followUp.warningSigns.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 mb-1">Segnali di Allarme:</p>
                <ul className="list-disc list-inside text-xs text-red-600">
                  {treatmentPlan.followUp.warningSigns.map((sign, idx) => (
                    <li key={idx}>{sign}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDiagnosis;

