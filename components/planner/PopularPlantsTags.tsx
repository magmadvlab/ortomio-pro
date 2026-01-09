'use client'

import React from 'react'

interface PopularPlant {
  name: string
  emoji: string
  id?: string
}

interface PopularPlantsTagsProps {
  plants: PopularPlant[]
  selectedPlant?: string
  onSelect: (plantName: string) => void
}

export function PopularPlantsTags({ plants, selectedPlant, onSelect }: PopularPlantsTagsProps) {
  // Default popular plants se non forniti
  const defaultPlants: PopularPlant[] = [
    { name: 'Pomodoro', emoji: '🍅' },
    { name: 'Peperone', emoji: '🫑' },
    { name: 'Zucchina', emoji: '🥒' },
    { name: 'Melanzana', emoji: '🍆' },
    { name: 'Peperoncino', emoji: '🌶️' },
  ]

  const displayPlants = plants.length > 0 ? plants : defaultPlants

  return (
    <div className="mt-5">
      <div className="text-xs font-semibold text-gray-600 mb-3">
        Popolari in questo periodo:
      </div>
      <div className="flex flex-wrap gap-2">
        {displayPlants.map((plant) => {
          const isSelected = selectedPlant?.toLowerCase() === plant.name.toLowerCase()
          return (
            <button
              key={plant.name}
              onClick={() => onSelect(plant.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-ortomio-green-500 text-white border-2 border-ortomio-green-500 shadow-md'
                  : 'bg-ortomio-green-50 text-ortomio-green-700 border border-ortomio-green-200 hover:bg-ortomio-green-100 hover:border-ortomio-green-300'
              }`}
            >
              <span>{plant.emoji}</span>
              <span>{plant.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}







