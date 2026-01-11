/**
 * Fertilizer Recommendation Component
 * Mostra suggerimenti fertilizzazione con dosaggi calcolati
 */

import React from 'react';
import { PlantMasterSheet, Garden } from '../../types';
import { NutrientAdvice } from '../../logic/nutrientEngine';
import { FertilizerRecommendation } from '../../logic/fertilizerEngine';
import { calculateFertilizerDosage, suggestFertilizerProduct } from '../../logic/fertilizerEngine';
import { AlertTriangle, CheckCircle, DollarSign, Calendar } from 'lucide-react';

interface FertilizerRecommendationProps {
  plant: PlantMasterSheet;
  nutrientAdvice: NutrientAdvice;
  garden: Garden;
  areaSqm?: number;
}

const FertilizerRecommendationView: React.FC<FertilizerRecommendationProps> = ({
  plant,
  nutrientAdvice,
  garden,
  areaSqm = 1,
}) => {
  if (!nutrientAdvice.shouldFertilize) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          {plant.commonName}: {nutrientAdvice.adviceBody}
        </p>
      </div>
    );
  }

  // Suggerisci prodotto
  const recommendation = suggestFertilizerProduct(
    nutrientAdvice.elementFocus,
    garden.soilType,
    'top_dressing'
  );

  if (!recommendation) {
    return (
      <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-4">
        <p className="text-sm text-yellow-full max-w-sm">Nessun prodotto disponibile per questo fabbisogno</p>
      </div>
    );
  }

  // Calcola dosaggio specifico
  const dosage = calculateFertilizerDosage(
    plant,
    nutrientAdvice,
    garden.soilType,
    recommendation.product,
    areaSqm
  );

  if (!dosage) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-800">{plant.commonName}</h4>
          <p className="text-sm text-gray-600 mt-1">{nutrientAdvice.adviceTitle}</p>
        </div>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
          {nutrientAdvice.elementFocus}
        </span>
      </div>

      {/* Prodotto Consigliato */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="font-medium text-gray-800">{dosage.product.name}</span>
        </div>
        <p className="text-xs text-gray-600">{dosage.reason}</p>
      </div>

      {/* Dosaggio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-600">Dosaggio</div>
          <div className="font-semibold text-gray-800">
            {dosage.dosage.amount} {dosage.dosage.unit}
            {dosage.dosage.perSqm && '/m²'}
          </div>
          {dosage.totalQuantityNeeded && areaSqm > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              Totale: {dosage.totalQuantityNeeded} {dosage.dosage.unit}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-gray-600">Metodo</div>
          <div className="font-semibold text-gray-800 capitalize">{dosage.method}</div>
        </div>
      </div>

      {/* Timing */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Calendar size={14} />
        <span>
          Applicare: {dosage.timing.toLocaleDateString('it-IT', { month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Costo */}
      {dosage.estimatedCost && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <DollarSign size={14} />
          <span>Costo stimato: €{dosage.estimatedCost.toFixed(2)}</span>
        </div>
      )}

      {/* Warnings */}
      {dosage.warnings && dosage.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-yellow-full max-w-sm mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-medium text-yellow-full max-w-sm mb-1">Avvertenze</div>
              <ul className="text-xs text-yellow-full max-w-sm space-y-1">
                {dosage.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerRecommendationView;

