'use client'

import React, { useState } from 'react'
import { PlantMasterSheet } from '@/types'
import { Dialog } from '@/components/ui/Dialog'
import {
  X,
  Sprout,
  Droplets,
  Sun,
  Thermometer,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Leaf,
  Apple
} from 'lucide-react'

interface CropDetailModalProps {
  crop: PlantMasterSheet
  open: boolean
  onClose: () => void
}

export function CropDetailModal({ crop, open, onClose }: CropDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'germination' | 'seedling' | 'transplant' | 'care'>('germination')

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                  <Leaf size={32} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1">{crop.commonName}</h2>
                  {crop.scientificName && (
                    <p className="text-sm opacity-90 italic">{crop.scientificName}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {crop.family && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur">
                        {crop.family}
                      </span>
                    )}
                    {crop.nutrientCategory && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur">
                        {crop.nutrientCategory}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex px-6" aria-label="Tabs">
              {[
                { id: 'germination', label: 'Germinazione', icon: Sprout },
                { id: 'seedling', label: 'Semenzaio', icon: Sun },
                { id: 'transplant', label: 'Trapianto', icon: ArrowRight },
                { id: 'care', label: 'Cura', icon: Droplets }
              ].map((tab) => {
                const isActive = activeTab === tab.id
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors
                      ${isActive
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Germination Tab */}
            {activeTab === 'germination' && crop.germination && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fase di Germinazione</h3>

                <div className="grid md:grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Temperature */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Thermometer className="text-orange-600" size={20} />
                      <h4 className="font-semibold text-gray-900">Temperatura</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ideale:</span>
                        <span className="font-semibold">{crop.germination.idealTemp}</span>
                      </div>
                      {crop.germination.minTemp && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Minima:</span>
                          <span className="font-semibold">{crop.germination.minTemp}°C</span>
                        </div>
                      )}
                      {crop.germination.maxTemp && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Massima:</span>
                          <span className="font-semibold">{crop.germination.maxTemp}°C</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="text-blue-600" size={20} />
                      <h4 className="font-semibold text-gray-900">Tempistiche</h4>
                    </div>
                    <div className="space-y-2">
                      {crop.germination.emergenceDays && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Emergenza:</span>
                          <span className="font-semibold">
                            {crop.germination.emergenceDays.min}-{crop.germination.emergenceDays.max} giorni
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Profondità:</span>
                        <span className="font-semibold">{crop.germination.sowingDepth} cm</span>
                      </div>
                      {crop.germination.preSoak && (
                        <div className="flex items-center gap-3 text-sm text-blue-700">
                          <Info size={14} />
                          <span>Richiede ammollo preventivo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {crop.germination.coveringInstructions && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Istruzioni Copertura</h4>
                        <p className="text-sm text-gray-700">{crop.germination.coveringInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Moisture Check */}
                {crop.germination.soilMoistureCheck && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Droplets className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Controllo Umidità</h4>
                        <p className="text-sm text-gray-700">{crop.germination.soilMoistureCheck}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternative Method */}
                {crop.germination.alternativeMethod && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {crop.germination.alternativeMethod.name}
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                          {crop.germination.alternativeMethod.description}
                        </p>
                        <div className="space-y-1">
                          {crop.germination.alternativeMethod.instructions?.map((instruction, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="text-green-600 font-semibold">{idx + 1}.</span>
                              <span>{instruction}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seedling Tab */}
            {activeTab === 'seedling' && crop.seedlingCare && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cura del Semenzaio</h3>

                <div className="grid md:grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Light */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-full max-w-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Sun className="text-yellow-full max-w-sm" size={20} />
                      <h4 className="font-semibold text-gray-900">Luce</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">{crop.seedlingCare.lightNeeds}</p>
                      {crop.seedlingCare.lightHours && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ore al giorno:</span>
                          <span className="font-semibold">{crop.seedlingCare.lightHours}h</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Thermometer className="text-blue-600" size={20} />
                      <h4 className="font-semibold text-gray-900">Temperatura</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">{crop.seedlingCare.temperature}</p>
                    </div>
                  </div>
                </div>

                {/* Watering */}
                {crop.seedlingCare.watering && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Droplets className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Irrigazione</h4>
                        <p className="text-sm text-gray-700">{crop.seedlingCare.watering}</p>
                        {crop.seedlingCare.wateringTiming && (
                          <p className="text-xs text-gray-600 mt-2">{crop.seedlingCare.wateringTiming}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning */}
                {crop.seedlingCare.warning && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Attenzione</h4>
                        <p className="text-sm text-gray-700">{crop.seedlingCare.warning}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transplant Tab */}
            {activeTab === 'transplant' && crop.transplanting && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trapianto in Orto</h3>

                <div className="grid md:grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Timing */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="text-green-600" size={20} />
                      <h4 className="font-semibold text-gray-900">Quando</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">{crop.transplanting.when}</p>
                      {crop.transplanting.minTemp && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Temp min:</span>
                          <span className="font-semibold">{crop.transplanting.minTemp}°C</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spacing */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <ArrowRight className="text-purple-600" size={20} />
                      <h4 className="font-semibold text-gray-900">Spaziatura</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">{crop.transplanting.spacing}</p>
                    </div>
                  </div>
                </div>

                {/* Soil Requirements */}
                {crop.transplanting.soilRequirements && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <Leaf className="text-gray-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Terreno</h4>
                        <p className="text-sm text-gray-700">{crop.transplanting.soilRequirements}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bury Stem */}
                {crop.transplanting.buryStem && crop.transplanting.buryStemInstructions && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Interramento Fusto</h4>
                        <p className="text-sm text-gray-700">{crop.transplanting.buryStemInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Care Tab */}
            {activeTab === 'care' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cura e Manutenzione</h3>

                {/* Hardening */}
                {crop.hardening && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-start gap-3">
                      <Sun className="text-indigo-600 flex-shrink-0 mt-0.5" size={18} />
                      <div className="w-full">
                        <h4 className="font-semibold text-gray-900 mb-2">Acclimatamento</h4>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-gray-600">Durata:</span>
                          <span className="font-semibold">{crop.hardening.duration} giorni</span>
                        </div>
                        {crop.hardening.procedure && (
                          <div className="space-y-2 text-sm text-gray-700">
                            {Object.entries(crop.hardening.procedure).map(([key, value]) => (
                              key !== 'finalCheck' && (
                                <div key={key}>
                                  <span className="font-semibold">{key.replace('days', 'Giorni ')}: </span>
                                  <span>{value as string}</span>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Tools */}
                {crop.requiredTools && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Attrezzi Necessari</h4>
                    <div className="grid md:grid-cols-1 md:grid-cols-2 gap-3">
                      {crop.requiredTools.seedTray && (
                        <div className="flex items-center gap-3 text-sm">
                          <CheckCircle size={16} className="text-green-600" />
                          <span>Vassoio semenzaio</span>
                        </div>
                      )}
                      {crop.requiredTools.seedSoil && (
                        <div className="flex items-center gap-3 text-sm">
                          <CheckCircle size={16} className="text-green-600" />
                          <span>Terriccio da semina</span>
                        </div>
                      )}
                      {crop.requiredTools.heatingMat && (
                        <div className="flex items-center gap-3 text-sm">
                          <CheckCircle size={16} className="text-green-600" />
                          <span>Tappetino riscaldante</span>
                        </div>
                      )}
                      {crop.requiredTools.sprayer && (
                        <div className="flex items-center gap-3 text-sm">
                          <CheckCircle size={16} className="text-green-600" />
                          <span>Nebulizzatore</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
