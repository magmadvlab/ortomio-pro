/**
 * Harvest Analytics Component
 * Displays economic value and savings from harvests
 * Pro Feature
 */

import React, { useState, useEffect } from 'react';
import { HarvestLogData, HarvestAnalytics as HarvestAnalyticsType } from '../types';
import { calculateHarvestAnalytics } from '../logic/harvestAnalyticsEngine';
import { useTier } from '../packages/core/hooks/useTier';
import { TrendingUp, DollarSign, Package, Star, Calendar, BarChart3 } from 'lucide-react';

interface HarvestAnalyticsProps {
  harvests: HarvestLogData[];
  gardenId?: string;
}

const HarvestAnalytics: React.FC<HarvestAnalyticsProps> = ({ harvests, gardenId }) => {
  const { can } = useTier();
  const [analytics, setAnalytics] = useState<HarvestAnalyticsType | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'month'>('all');

  useEffect(() => {
    if (!can('harvestAnalytics')) {
      return;
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (timeRange === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (timeRange === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const result = calculateHarvestAnalytics(harvests, startDate, endDate);
    setAnalytics(result);
  }, [harvests, timeRange]); // Rimossa 'can' dalle dipendenze - viene solo usata per controllo condizionale

  if (!can('harvestAnalytics')) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">Analisi resa economica disponibile solo in versione Pro</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
        <p className="text-gray-600">Calcolo in corso...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={20} className="text-green-600" />
          Analisi Resa Economica
        </h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'all' | 'year' | 'month')}
          className="text-sm border border-gray-300 rounded px-3 py-1"
        >
          <option value="all">Tutti i tempi</option>
          <option value="year">Ultimo anno</option>
          <option value="month">Ultimo mese</option>
        </select>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} className="text-green-600" />
            <span className="text-sm text-gray-600">Prodotto</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {analytics.totalKgProduced.toFixed(1)} kg
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-blue-600" />
            <span className="text-sm text-gray-600">Valore Mercato</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            €{analytics.marketValueEuro.toFixed(2)}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-purple-600" />
            <span className="text-sm text-gray-600">Risparmio Netto</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            €{analytics.netSavings.toFixed(2)}
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} className="text-yellow-600" />
            <span className="text-sm text-gray-600">Media Qualità</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            {analytics.avgRating.toFixed(1)}/5
          </div>
        </div>
      </div>

      {/* Costs Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-bold text-gray-800 mb-3">Costi Stimati</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Acqua:</span>
            <span className="font-bold ml-2">€{analytics.estimatedCosts.water.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Fertilizzante:</span>
            <span className="font-bold ml-2">€{analytics.estimatedCosts.fertilizer.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Semi:</span>
            <span className="font-bold ml-2">€{analytics.estimatedCosts.seeds.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* By Month */}
      {analytics.byMonth && analytics.byMonth.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar size={16} />
            Resa per Mese
          </h4>
          <div className="space-y-2">
            {analytics.byMonth.map((month) => {
              const monthNames = ['', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
              return (
                <div key={month.month} className="flex items-center justify-between bg-gray-50 rounded p-3">
                  <span className="font-medium">{monthNames[month.month]}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{month.kg.toFixed(1)} kg</span>
                    <span className="text-green-600 font-bold">€{month.value.toFixed(2)}</span>
                    <span className="text-gray-500">({month.harvests} raccolti)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* By Plant */}
      {analytics.byPlant && analytics.byPlant.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Resa per Pianta</h4>
          <div className="space-y-2">
            {analytics.byPlant.map((plant) => (
              <div key={plant.plantName} className="flex items-center justify-between bg-gray-50 rounded p-3">
                <span className="font-medium">{plant.plantName}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span>{plant.totalKg.toFixed(1)} kg</span>
                  <span className="text-green-600 font-bold">€{plant.value.toFixed(2)}</span>
                  <span className="text-gray-500">({plant.harvests} raccolti)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestAnalytics;

