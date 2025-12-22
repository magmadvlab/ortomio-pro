'use client'

import React from 'react'
import Link from 'next/link'

interface RecipeCardProps {
  name: string
  difficulty?: 'facile' | 'media' | 'difficile'
  time?: string
  image?: string
  onClick?: () => void
}

export function RecipeCard({ name, difficulty = 'facile', time, image, onClick }: RecipeCardProps) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {image && (
        <div className="w-full h-48 bg-gray-200">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {difficulty && (
            <span className="capitalize">
              Difficoltà: {difficulty}
            </span>
          )}
          {time && <span>Tempo: {time}</span>}
        </div>
        <button className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm">
          Vedi ricetta →
        </button>
      </div>
    </div>
  )
}
















