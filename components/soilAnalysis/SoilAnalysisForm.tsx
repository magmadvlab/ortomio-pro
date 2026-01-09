/**
 * Soil Analysis Form Component
 * Form completo per inserimento e visualizzazione analisi suolo avanzata
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Save, TrendingUp, TrendingDown, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { SoilAnalysis, createSoilAnalysis, getSoilAnalyses, updateSoilAnalysis, deleteSoilAnalysis } from '@/services/soilAnalysisService';
import { getSupabaseClient } from '@/config/supabase';
import { GardenZone } from '@/services/zoneMappingService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SoilAnalysisFormProps {
  gardenId: string;
  zoneId?: string;
  zone?: GardenZone;
  onAnalysisCreated?: (analysis: SoilAnalysis) => void;
}

export const SoilAnalysisForm: React.FC<SoilAnalysisFormProps> = ({
  gardenId,
  zoneId,
  zone,
  onAnalysisCreated
}) => {
  const [analyses, setAnalyses] = useState<SoilAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<SoilAnalysis | null>(null);
  const [formData, setFormData] = useState<Partial<SoilAnalysis>>({
    analysisDate: new Date().toISOString().split('T')[0],
    analysisType: 'basic',
    zoneId: zoneId
  });

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (supabase && gardenId) {
      loadAnalyses();
    }
  }, [supabase, gardenId, zoneId]);

  const loadAnalyses = async () => {
    if (!supabase) return;
    try {
      const loaded = await getSoilAnalyses(supabase, {
        zoneId,
        gardenId,
        limit: 50
      });
      setAnalyses(loaded);
    } catch (error) {
      console.error('Error loading soil analyses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    try {
      if (editingAnalysis) {
        await updateSoilAnalysis(supabase, editingAnalysis.id, {
          ...formData,
          gardenId
        });
      } else {
        // Assicurati che analysisDate sia sempre definito
        if (!formData.analysisDate) {
          formData.analysisDate = new Date().toISOString().split('T')[0];
        }
        const newAnalysis = await createSoilAnalysis(supabase, {
          ...formData,
          gardenId,
          analysisDate: formData.analysisDate
        });
        if (onAnalysisCreated) {
          onAnalysisCreated(newAnalysis);
        }
      }
      await loadAnalyses();
      setShowForm(false);
      setEditingAnalysis(null);
      setFormData({
        analysisDate: new Date().toISOString().split('T')[0],
        analysisType: 'basic',
        zoneId: zoneId
      });
    } catch (error: any) {
      console.error('Error saving soil analysis:', error);
      alert(`Errore nel salvare l'analisi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (analysis: SoilAnalysis) => {
    setEditingAnalysis(analysis);
    setFormData({
      analysisDate: analysis.analysisDate,
      labName: analysis.labName,
      analysisType: analysis.analysisType,
      nitrogenN: analysis.nitrogenN,
      phosphorusP: analysis.phosphorusP,
      potassiumK: analysis.potassiumK,
      ironFe: analysis.ironFe,
      manganeseMn: analysis.manganeseMn,
      zincZn: analysis.zincZn,
      copperCu: analysis.copperCu,
      boronB: analysis.boronB,
      ph: analysis.ph,
      organicMatterPercent: analysis.organicMatterPercent,
      organicCarbonPercent: analysis.organicCarbonPercent,
      cec: analysis.cec,
      sandPercent: analysis.sandPercent,
      siltPercent: analysis.siltPercent,
      clayPercent: analysis.clayPercent,
      notes: analysis.notes,
      zoneId: analysis.zoneId
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Sei sicuro di voler eliminare questa analisi?')) return;

    try {
      await deleteSoilAnalysis(supabase, id);
      await loadAnalyses();
    } catch (error: any) {
      console.error('Error deleting analysis:', error);
      alert(`Errore nell'eliminare l'analisi: ${error.message}`);
    }
  };

  // Prepara dati per grafici trend
  const prepareTrendData = () => {
    const sorted = [...analyses].sort((a, b) => 
      new Date(a.analysisDate).getTime() - new Date(b.analysisDate).getTime()
    );
    
    return sorted.map(a => ({
      date: new Date(a.analysisDate).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
      nitrogen: a.nitrogenN || null,
      phosphorus: a.phosphorusP || null,
      potassium: a.potassiumK || null,
      ph: a.ph || null,
      organicMatter: a.organicMatterPercent || null
    }));
  };

  const trendData = prepareTrendData();
  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={24} />
            Analisi Suolo
            {zone && <span className="text-sm font-normal text-gray-600">- {zone.name}</span>}
          </h3>
          {latestAnalysis && (
            <p className="text-sm text-gray-600 mt-1">
              Ultima analisi: {new Date(latestAnalysis.analysisDate).toLocaleDateString('it-IT')}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAnalysis(null);
            setFormData({
              analysisDate: new Date().toISOString().split('T')[0],
              analysisType: 'basic',
              zoneId: zoneId
            });
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {showForm ? 'Annulla' : '+ Nuova Analisi'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Analisi *
              </label>
              <input
                type="date"
                required
                value={formData.analysisDate || ''}
                onChange={(e) => setFormData({ ...formData, analysisDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Analisi
              </label>
              <select
                value={formData.analysisType || 'basic'}
                onChange={(e) => setFormData({ ...formData, analysisType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="basic">Base</option>
                <option value="complete">Completa</option>
                <option value="professional">Professionale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Laboratorio (opzionale)
              </label>
              <input
                type="text"
                value={formData.labName || ''}
                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nome laboratorio"
              />
            </div>
          </div>

          {/* Macro-nutrienti */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-4">Macro-nutrienti (mg/kg)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Azoto (N)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.nitrogenN || ''}
                  onChange={(e) => setFormData({ ...formData, nitrogenN: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fosforo (P)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.phosphorusP || ''}
                  onChange={(e) => setFormData({ ...formData, phosphorusP: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Potassio (K)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.potassiumK || ''}
                  onChange={(e) => setFormData({ ...formData, potassiumK: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Micro-nutrienti */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-4">Micro-nutrienti (mg/kg)</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ferro (Fe)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ironFe || ''}
                  onChange={(e) => setFormData({ ...formData, ironFe: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manganese (Mn)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.manganeseMn || ''}
                  onChange={(e) => setFormData({ ...formData, manganeseMn: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zinco (Zn)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.zincZn || ''}
                  onChange={(e) => setFormData({ ...formData, zincZn: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rame (Cu)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.copperCu || ''}
                  onChange={(e) => setFormData({ ...formData, copperCu: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Boro (B)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.boronB || ''}
                  onChange={(e) => setFormData({ ...formData, boronB: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Proprietà fisico-chimiche */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-4">Proprietà Fisico-Chimiche</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  pH
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  value={formData.ph || ''}
                  onChange={(e) => setFormData({ ...formData, ph: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materia Organica (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.organicMatterPercent || ''}
                  onChange={(e) => setFormData({ ...formData, organicMatterPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carbonio Organico (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.organicCarbonPercent || ''}
                  onChange={(e) => setFormData({ ...formData, organicCarbonPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEC (meq/100g)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cec || ''}
                  onChange={(e) => setFormData({ ...formData, cec: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Texture */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-4">Texture (%)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sabbia (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sandPercent || ''}
                  onChange={(e) => setFormData({ ...formData, sandPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limo (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.siltPercent || ''}
                  onChange={(e) => setFormData({ ...formData, siltPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Argilla (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.clayPercent || ''}
                  onChange={(e) => setFormData({ ...formData, clayPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Note aggiuntive sull'analisi..."
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Save size={16} />
              {loading ? 'Salvataggio...' : editingAnalysis ? 'Aggiorna' : 'Salva Analisi'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAnalysis(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      )}

      {/* Latest Analysis Recommendations */}
      {latestAnalysis && latestAnalysis.recommendations && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} />
            Raccomandazioni
          </h4>
          {latestAnalysis.recommendations.deficiencies.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-yellow-800 mb-1">Carenze rilevate:</p>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {latestAnalysis.recommendations.deficiencies.map((def, i) => (
                  <li key={i}>{def}</li>
                ))}
              </ul>
            </div>
          )}
          {latestAnalysis.recommendations.suggestedFertilizers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">Fertilizzanti suggeriti:</p>
              <ul className="space-y-1">
                {latestAnalysis.recommendations.suggestedFertilizers.map((fert, i) => (
                  <li key={i} className="text-sm text-yellow-700">
                    <span className="font-medium">{fert.product}</span>: {fert.dosage} {fert.unit} - {fert.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Trend Charts */}
      {trendData.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4">Trend Nutrienti nel Tempo</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="nitrogen" stroke="#3b82f6" name="Azoto (N)" />
              <Line type="monotone" dataKey="phosphorus" stroke="#10b981" name="Fosforo (P)" />
              <Line type="monotone" dataKey="potassium" stroke="#f59e0b" name="Potassio (K)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Historical Analyses List */}
      {analyses.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4">Storico Analisi ({analyses.length})</h4>
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {new Date(analysis.analysisDate).toLocaleDateString('it-IT')}
                    </span>
                    {analysis.labName && (
                      <span className="text-sm text-gray-600">- {analysis.labName}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-x-4">
                    {analysis.nitrogenN && <span>N: {analysis.nitrogenN.toFixed(1)}</span>}
                    {analysis.phosphorusP && <span>P: {analysis.phosphorusP.toFixed(1)}</span>}
                    {analysis.potassiumK && <span>K: {analysis.potassiumK.toFixed(1)}</span>}
                    {analysis.ph && <span>pH: {analysis.ph.toFixed(1)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(analysis)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilAnalysisForm;

