'use client'

import React, { useState, useMemo } from 'react'
import { getAllMasterSheets } from '@/services/plantMasterService'
import { PlantMasterSheet } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, Search, Filter, Sprout, Apple, Grape, Leaf, X } from 'lucide-react'
import { CropDetailModal } from '@/components/guide/CropDetailModal'

export default function GuidePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCrop, setSelectedCrop] = useState<PlantMasterSheet | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Carica tutte le schede master
  const allCrops = getAllMasterSheets()

  // Estrai categorie uniche
  const categories = useMemo(() => {
    const cats = new Set<string>()
    allCrops.forEach(crop => {
      if (crop.family) cats.add(crop.family)
      if (crop.cropType) cats.add(crop.cropType)
    })
    return ['all', ...Array.from(cats).sort()]
  }, [allCrops])

  // Filtra colture
  const filteredCrops = useMemo(() => {
    return allCrops.filter(crop => {
      // Filtro ricerca
      const matchesSearch = searchQuery === '' ||
        crop.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.scientificName?.toLowerCase().includes(searchQuery.toLowerCase())

      // Filtro categoria
      const matchesCategory = selectedCategory === 'all' ||
        crop.family === selectedCategory ||
        crop.cropType === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [allCrops, searchQuery, selectedCategory])

  const handleCropClick = (crop: PlantMasterSheet) => {
    setSelectedCrop(crop)
    setShowDetailModal(true)
  }

  const getCategoryIcon = (category: string) => {
    if (category.includes('Fruit') || category === 'ExoticFruit') return <Apple size={16} />
    if (category.includes('Vine') || category === 'Vitaceae') return <Grape size={16} />
    if (category.includes('Solanaceae')) return <Sprout size={16} />
    return <Leaf size={16} />
  }

  const getCropIcon = (crop: PlantMasterSheet) => {
    if (crop.cropType === 'ExoticFruit') return <Apple size={28} className="text-orange-600" />
    if (crop.family === 'Solanaceae') return <Sprout size={28} className="text-green-600" />
    if (crop.cropType === 'Vine') return <Grape size={28} className="text-purple-600" />
    return <Leaf size={28} className="text-green-600" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Modern Header */}
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={32} className="text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guida Colture</h1>
              <p className="text-sm text-gray-600">Schede dettagliate per ogni coltura</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredCrops.length} colture disponibili
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca coltura..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tutte le categorie</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessuna coltura trovata</h3>
          <p className="text-gray-600">Prova a modificare i filtri di ricerca</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCrops.map((crop) => (
            <Card
              key={crop.id}
              className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              variant="elevated"
              onClick={() => handleCropClick(crop)}
            >
              {/* Card Header with Icon */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    {getCropIcon(crop)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {crop.commonName}
                    </h4>
                    {crop.scientificName && (
                      <p className="text-xs text-gray-600 italic">
                        {crop.scientificName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {crop.family && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          {crop.family}
                        </span>
                      )}
                      {crop.cropType && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {crop.cropType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="p-6 space-y-3">
                {crop.germination && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Germinazione</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {crop.germination.emergenceDays?.min}-{crop.germination.emergenceDays?.max} giorni
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Temp: {crop.germination.idealTemp}
                    </div>
                  </div>
                )}

                {crop.hardening && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Acclimatamento</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {crop.hardening.duration} giorni
                    </div>
                  </div>
                )}

                {crop.transplanting && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Trapianto</div>
                    <div className="text-sm font-semibold text-gray-900">
                      Min {crop.transplanting.minTemp}°C
                    </div>
                    {crop.transplanting.spacing && (
                      <div className="text-xs text-gray-600 mt-1">
                        Spaziatura: {crop.transplanting.spacing}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-6 pb-6">
                <Button
                  onClick={() => handleCropClick(crop)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Vedi scheda completa →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCrop && (
        <CropDetailModal
          crop={selectedCrop}
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedCrop(null)
          }}
        />
      )}
    </div>
  )
}
