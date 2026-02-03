'use client';

import React, { useState, useEffect } from 'react';

export default function SemenzaioPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula caricamento dati
    setTimeout(() => {
      setBatches([
        {
          id: '1',
          plantName: 'Pomodoro',
          variety: 'San Marzano',
          currentPhase: 'nursing',
          quantity: 20,
          survivingQuantity: 18,
          startDate: new Date(),
          notes: 'Batch di test'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento semenzaio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              🌱 Semenzaio OrtoMio Pro
            </h1>
            <p className="mt-2 text-gray-600">
              Gestisci i tuoi batch di semina e monitora la crescita delle piantine
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batch Attivi</p>
                <p className="text-2xl font-bold text-blue-600">{batches.length}</p>
              </div>
              <span className="text-2xl">🌱</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Piantine Totali</p>
                <p className="text-2xl font-bold text-green-600">
                  {batches.reduce((sum, b) => sum + b.survivingQuantity, 0)}
                </p>
              </div>
              <span className="text-2xl">🌿</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pronti</p>
                <p className="text-2xl font-bold text-orange-600">
                  {batches.filter(b => b.currentPhase === 'ready').length}
                </p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sopravvivenza</p>
                <p className="text-2xl font-bold text-purple-600">90%</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        {/* Lista Batch */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">I Tuoi Batch</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                + Nuovo Batch
              </button>
            </div>
          </div>

          <div className="p-6">
            {batches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{batch.plantName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        batch.currentPhase === 'ready' ? 'bg-green-100 text-green-800' :
                        batch.currentPhase === 'nursing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {batch.currentPhase === 'nursing' ? 'Crescita' :
                         batch.currentPhase === 'ready' ? 'Pronto' : 'Germinazione'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">Varietà: {batch.variety}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {batch.survivingQuantity}/{batch.quantity} piantine
                      </span>
                      <span className="text-gray-500">
                        {Math.round((batch.survivingQuantity / batch.quantity) * 100)}%
                      </span>
                    </div>
                    
                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(batch.survivingQuantity / batch.quantity) * 100}%` }}
                      />
                    </div>
                    
                    {batch.notes && (
                      <p className="text-xs text-gray-500 mt-2">{batch.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🌱</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun batch attivo</h3>
                <p className="text-gray-600 mb-4">Inizia creando il tuo primo batch di semenzaio</p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Crea Primo Batch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Guida rapida */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Sistema Semenzaio OrtoMio Pro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">1. Pianifica</h4>
              <p className="text-blue-700">Scegli se partire da seme o piantina con suggerimenti intelligenti</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">2. Monitora</h4>
              <p className="text-blue-700">Segui la crescita attraverso le fasi: germinazione → nursing → indurimento</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">3. Trapianta</h4>
              <p className="text-blue-700">Quando pronte, trapianta le piantine nel tuo giardino</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}