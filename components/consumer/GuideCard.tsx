'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

interface GuideCardProps {
  title: string
  description: string
  category?: string
  icon?: React.ReactNode
  href?: string
}

export function GuideCard({ title, description, category, icon, href = '#' }: GuideCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {icon || <BookOpen className="text-green-600" size={24} />}
        </div>
        <div className="flex-1">
          {category && (
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {category}
            </span>
          )}
          <h3 className="font-semibold text-lg text-gray-900 mt-1 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  )
}






















