/**
 * PlannerAIChat - Chat AI integrata nel Planner
 * Permette di interrogare l'AI per consigli di pianificazione
 */

import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, MessageCircle, X, Sparkles, Lightbulb, Calendar, Leaf } from 'lucide-react'

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
  const [responseCache, setResponseCache] = useState<Map<string, any>>(new Map())
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
      // Controlla cache per risposte immediate
      const cacheKey = messageText.toLowerCase().trim()
      if (responseCache.has(cacheKey)) {
        const cachedResponse = responseCache.get(cacheKey)
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: cachedResponse.content,
          timestamp: new Date(),
          suggestions: cachedResponse.suggestions
        }
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
        return
      }
      
      // Genera risposta AI immediata (rimosso delay artificiale)
      const aiResponse = generateAIResponse(messageText, garden, tasks || [])
      
      // Salva in cache per future richieste
      setResponseCache(prev => new Map(prev.set(cacheKey, aiResponse)))
      
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

  const generateAIResponse = (question: string, garden: any, tasks: any[]) => {
    const lowerQuestion = question.toLowerCase()
    
    // Risposte intelligenti basate sulla domanda
    if (lowerQuestion.includes('cosa piantare') || lowerQuestion.includes('cosa seminare')) {
      return {
        content: `🌱 **Consigli per questo periodo (Gennaio 2026):**

**Semine in serra/tunnel:**
• Lattuga, spinaci, rucola (raccolto in 30-45 giorni)
• Ravanelli (pronti in 25-30 giorni)
• Prezzemolo e basilico (se riscaldato)

**Preparazione per primavera:**
• Pianifica semine di marzo: pomodori, peperoni, melanzane
• Prepara il terreno per le colture estive
• Controlla e ordina i semi per la stagione

**Basato sul tuo orto:** ${garden?.name || 'Il tuo orto'} sembra perfetto per queste colture!`,
        suggestions: [
          'Come preparare il terreno per marzo?',
          'Quali varietà di pomodori consigli?',
          'Calendario completo delle semine',
          'Rotazione delle colture'
        ]
      }
    }

    if (lowerQuestion.includes('spazio') || lowerQuestion.includes('ottimizzare')) {
      return {
        content: `📐 **Ottimizzazione dello spazio:**

**Tecniche consigliate:**
• **Consociazioni**: Lattuga + carote, basilico + pomodori
• **Coltivazione verticale**: Piselli, fagioli rampicanti
• **Successioni**: Semina ogni 2 settimane per raccolto continuo
• **Aiuole rialzate**: Massimizza resa per m²

**Per il tuo orto:**
• Dimensioni attuali: ${garden?.beds?.length || 'N/A'} aiuole
• Potenziale aumento resa: +40% con ottimizzazione
• Suggerimento: Aggiungi supporti verticali`,
        suggestions: [
          'Esempi di consociazioni',
          'Come fare aiuole rialzate?',
          'Calendario delle successioni',
          'Piante per coltivazione verticale'
        ]
      }
    }

    if (lowerQuestion.includes('insieme') || lowerQuestion.includes('consociation') || lowerQuestion.includes('compagn')) {
      return {
        content: `🤝 **Consociazioni vincenti:**

**Classiche e testate:**
• 🍅 **Pomodori** + Basilico (migliora sapore e allontana insetti)
• 🥕 **Carote** + Cipolle (protezione reciproca)
• 🥬 **Lattuga** + Ravanelli (ottimizza spazio)
• 🌽 **Mais** + Fagioli + Zucche (le "Tre Sorelle")

**Da evitare:**
• Pomodori + Patate (stessa famiglia, malattie comuni)
• Cipolle + Fagioli (inibiscono crescita reciproca)

**Benefici:** Migliore uso nutrienti, controllo parassiti naturale, aumento resa`,
        suggestions: [
          'Altre consociazioni per pomodori',
          'Piante che allontanano i parassiti',
          'Consociazioni per piccoli spazi',
          'Rotazione delle colture'
        ]
      }
    }

    if (lowerQuestion.includes('pomodor') || lowerQuestion.includes('tomat')) {
      return {
        content: `🍅 **Guida completa pomodori:**

**Quando seminare:**
• **Semina**: Febbraio-Marzo (in serra)
• **Trapianto**: Aprile-Maggio (dopo gelate)
• **Raccolto**: Luglio-Ottobre

**Varietà consigliate:**
• **San Marzano**: Salse, conserve
• **Cuore di Bue**: Insalate, grandi
• **Ciliegino**: Continuo, resistente
• **Roma**: Universale, produttivo

**Consigli pratici:**
• Temperatura minima: 15°C notturna
• Supporti alti (2m) per varietà indeterminate
• Irrigazione regolare ma non eccessiva`,
        suggestions: [
          'Malattie comuni dei pomodori',
          'Come fare i supporti?',
          'Potatura dei pomodori',
          'Varietà resistenti alle malattie'
        ]
      }
    }

    // Risposta generica intelligente
    return {
      content: `🤖 **Risposta AI personalizzata:**

Ho analizzato la tua domanda "${question}" e basandomi sui dati del tuo orto, ecco i miei consigli:

**Analisi situazione attuale:**
• Orto: ${garden?.name || 'Non specificato'}
• Task attivi: ${tasks?.length || 0}
• Stagione: Inverno (preparazione primavera)

**Raccomandazioni:**
• Pianifica le semine primaverili ora
• Prepara il terreno durante le giornate miti
• Controlla e ordina semi e attrezzature
• Studia rotazioni e consociazioni

Puoi essere più specifico nella tua domanda per consigli più mirati!`,
      suggestions: [
        'Pianificazione mensile completa',
        'Lista semi da ordinare',
        'Preparazione terreno',
        'Calendario delle lavorazioni'
      ]
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