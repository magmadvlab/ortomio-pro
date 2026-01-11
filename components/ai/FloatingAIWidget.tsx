'use client'

import React, { useState } from 'react'
import { Bot, Sparkles, X, MessageCircle } from 'lucide-react'
import AIPlanningWizard from './AIPlanningWizard'
import { useGarden } from '@/hooks/useGarden'

export default function FloatingAIWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const { currentGarden } = useGarden()

  const handlePlanGenerated = (plan: any) => {
    setShowWizard(false)
    setIsOpen(false)
    // Handle plan generated
  }

  return (
    <>
      {/* Floating AI Button */}
      <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        >
          <Bot className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      </div>

      {/* AI Menu Popup */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 lg:bottom-20">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Assistant
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowWizard(true)
                  setIsOpen(false)
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3"
              >
                <Bot className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-sm">AI Planning Wizard</div>
                  <div className="text-xs text-gray-500">Pianifica con l'AI</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  // Open AI chat
                  setIsOpen(false)
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3"
              >
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">AI Chat</div>
                  <div className="text-xs text-gray-500">Chiedi consigli</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Planning Wizard Modal */}
      {showWizard && currentGarden && (
        <AIPlanningWizard
          garden={currentGarden}
          onPlanGenerated={handlePlanGenerated}
          onClose={() => setShowWizard(false)}
        />
      )}
    </>
  )
}