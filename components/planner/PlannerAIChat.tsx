/**
 * PlannerAIChat - Chat AI integrata nel Planner
 * Permette di interrogare l'AI per consigli di pianificazione
 */

import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, MessageCircle, X, Sparkles, Lightbulb, Calendar, Leaf } from 'lucide-react'
import { requestPlannerAIResponse } from '@/services/plannerAIChatService'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface PlannerAIChatProps {
  garden?: any
  tasks?: any[]
  isOpen: boolean
  onToggle: () => void
}

export default function PlannerAIChat({ garden, tasks, isOpen, onToggle }: PlannerAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [initialMessageLoaded, setInitialMessageLoaded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !initialMessageLoaded) {
      // Carica messaggio iniziale solo quando necessario
      setMessages([{
        id: '1',
        type: 'ai',
        content: '👋 Ciao! Sono il tuo assistente AI per la pianificazione dell\'orto. Puoi chiedermi consigli su cosa piantare, quando seminare, come ottimizzare lo spazio o qualsiasi altra domanda sulla pianificazione agricola.',
        timestamp: new Date(),
        suggestions: [
          'Cosa posso piantare questo mese?',
          'Come ottimizzare lo spazio nel mio orto?',
          'Quali piante stanno bene insieme?',
          'Quando seminare i pomodori?'
        ]
      }])
      setInitialMessageLoaded(true)
    }
  }, [isOpen, initialMessageLoaded])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim()
    if (!messageText || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const aiResponse = await requestPlannerAIResponse(messageText, { garden, tasks: tasks || [] })
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '❌ Mi dispiace, c\'è stato un errore. Riprova tra poco.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
        title="Apri Chat AI Planner"
      >
        <MessageCircle size={24} />
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          <Bot size={12} />
        </div>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold">AI Planner Assistant</h3>
            <p className="text-xs opacity-90">Consigli intelligenti per il tuo orto</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-white/80 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={16} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                </div>
              )}
              
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {message.suggestions && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <Lightbulb size={12} />
                    Domande suggerite:
                  </p>
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="block w-full text-left text-xs bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[80%]">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-purple-600" />
                <span className="text-xs font-medium text-purple-600">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Loader2 size={16} className="animate-spin text-purple-600" />
                <span className="text-sm">Sto pensando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Chiedi consigli per il tuo orto..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <Sparkles size={12} />
          <span>Powered by AI • Premi Invio per inviare</span>
        </div>
      </div>
    </div>
  )
}
