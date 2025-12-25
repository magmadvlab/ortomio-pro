'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Calendar, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Photo {
  id: string
  url: string
  date: Date
  plantName?: string
  notes?: string
}

interface PhotoTimelineProps {
  photos: Photo[]
  plantName?: string
}

export function PhotoTimeline({ photos, plantName }: PhotoTimelineProps) {
  // Group photos by date
  const photosByDate = photos.reduce((acc, photo) => {
    const dateKey = format(photo.date, 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(photo)
    return acc
  }, {} as Record<string, Photo[]>)

  const sortedDates = Object.keys(photosByDate).sort().reverse()

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const datePhotos = photosByDate[dateKey]
        const date = new Date(dateKey)

        return (
          <Card key={dateKey} variant="default" className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-gray-400" size={18} />
              <h3 className="font-semibold text-gray-900">
                {format(date, 'EEEE d MMMM yyyy', { locale: it })}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {datePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                >
                  <img
                    src={photo.url}
                    alt={photo.notes || photo.plantName || 'Foto'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {photo.notes && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                      {photo.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )
      })}

      {photos.length === 0 && (
        <Card variant="default" className="p-8 text-center">
          <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-500">Nessuna foto ancora</p>
        </Card>
      )}
    </div>
  )
}

