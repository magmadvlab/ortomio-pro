/**
 * Prescription Maps Introduction Component
 * Guida introduttiva alle mappe prescrizione
 */

import React, { useState } from 'react';
import { Map, Target, Zap, TrendingDown, DollarSign, Leaf, CheckCircle, ArrowRight, X, Info } from 'lucide-react';

interface PrescriptionMapsIntroProps {
  onClose: () => void;
  onStartWizard: () => void;
}

const PrescriptionMapsIntro: React.FC<PrescriptionMapsIntroProps> = ({ onClose, onStartWizard }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Cos'è una Mappa Prescrizione?",
      icon: Map,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Una <strong>mappa prescrizione</strong> (o mappa a rateo variabile) è uno strumento fondamentale 
            del <strong>precision farming</strong> che ti permette di applicare input agricoli (fertilizzanti, 
            semi, acqua, trattamenti) in modo <strong>variabile</strong> all'interno del campo.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Esempio Pratico:</p>
                <p>
                  Invece di spargere 100 kg/ha di fertilizzante uniformemente su tutto il campo, 
                  la mappa prescrizione ti dice di applicare:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>80 kg/ha nelle zone più fertili</li>
                  <li>120 kg/ha nelle zone che necessitano più nutrimento</li>
                  <li>100 kg/ha nelle zone intermedie</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Con Mappa</span>
              </div>
              <p className="text-sm text-green-700">
                Applicazione precisa basata sulle reali necessità di ogni zona
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <X className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">Senza Mappa</span>
              </div>
              <p className="text-sm text-red-700">
                Applicazione uniforme che spreca risorse e danneggia l'ambiente
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Vantaggi delle Mappe Prescrizione",
      icon: TrendingDown,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Le mappe prescrizione offrono vantaggi concreti e misurabili:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-green-900">Risparmio Economico</h4>
              </div>
              <ul className="text-sm text-green-700 space-y-2">
                <li>• Riduzione costi input: 15-30%</li>
                <li>• ROI medio: 150-200%</li>
                <li>• Ammortamento: 1-2 stagioni</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Leaf className="w-6 h-6 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Sostenibilità</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Riduzione sprechi: 20-40%</li>
                <li>• Minore impatto ambientale</li>
                <li>• Conformità normative</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Precisione</h4>
              </div>
              <ul className="text-sm text-purple-700 space-y-2">
                <li>• Applicazione mirata</li>
                <li>• Riduzione sovrapposizioni</li>
                <li>• Ottimizzazione passaggi</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-orange-600" />
                <h4 className="font-semibold text-orange-900">Produttività</h4>
              </div>
              <ul className="text-sm text-orange-700 space-y-2">
                <li>• Aumento rese: 5-15%</li>
                <li>• Qualità uniforme</li>
                <li>• Riduzione stress colture</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Come Funziona OrtoMio",
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            OrtoMio genera mappe prescrizione analizzando automaticamente:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Dati NDVI Satellitari</h4>
                <p className="text-sm text-gray-600">
                  Immagini Sentinel-2 per valutare la salute della vegetazione
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Analisi Suolo</h4>
                <p className="text-sm text-gray-600">
                  Dati di fertilità, pH, tessitura e contenuto organico
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Storico Colturale</h4>
                <p className="text-sm text-gray-600">
                  Rese passate, trattamenti precedenti e rotazioni
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-orange-600">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Algoritmi AI</h4>
                <p className="text-sm text-gray-600">
                  Elaborazione intelligente per creare zone omogenee ottimali
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Risultato:</p>
                <p>
                  Una mappa con zone omogenee e dosaggi specifici, esportabile in formati 
                  compatibili con tutti i principali trattori e macchinari agricoli.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Formati di Export",
      icon: Target,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            OrtoMio esporta le mappe in formati standard compatibili con:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Formati Supportati</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Shapefile (.shp)</strong> - Standard GIS</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>KML/KMZ</strong> - Google Earth</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>ISO-XML</strong> - Standard ISOBUS</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>GeoJSON</strong> - Web mapping</span>
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Compatibilità</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• John Deere Operations Center</li>
                <li>• Climate FieldView</li>
                <li>• Trimble Ag Software</li>
                <li>• CNH AFS Connect</li>
                <li>• AGCO VarioDoc</li>
                <li>• Qualsiasi terminale ISOBUS</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Nota Importante:</p>
                <p>
                  Verifica sempre la compatibilità del formato con il tuo macchinario specifico. 
                  In caso di dubbi, contatta il supporto tecnico del produttore.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
              <p className="text-sm text-gray-500">
                Passo {currentStep + 1} di {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex items-center gap-3">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-green-600'
                      : index < currentStep
                      ? 'bg-green-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Indietro
                </button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-3"
                >
                  Avanti
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={onStartWizard}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-3 font-semibold"
                >
                  Crea Prima Mappa
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionMapsIntro;
