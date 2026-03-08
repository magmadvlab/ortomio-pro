/**
 * Global AI Chat - Chat AI Globale
 * Chat AI accessibile da tutta l'app per domande generali
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, MessageCircle, X, Sparkles, Lightbulb, Minimize2, Maximize2 } from 'lucide-react'
import { UI_LAYERS } from '@/components/shared/uiLayers'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: string[]
}

export default function GlobalAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Ciao! Sono l\'assistente AI di OrtoMio. Puoi chiedermi qualsiasi cosa sull\'agricoltura, giardinaggio, piante, malattie, trattamenti, pianificazione e molto altro!',
      timestamp: new Date(),
      suggestions: [
        'Come curare le piante malate?',
        'Quando seminare i pomodori?',
        'Come preparare il terreno?',
        'Quali piante coltivare in inverno?',
        'Come fare il compost?',
        'Problemi con i parassiti'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

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
      // Simula chiamata API AI
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiResponse = generateAIResponse(messageText)
      
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

  const generateAIResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase()
    
    // Risposte intelligenti basate sulla domanda
    if (lowerQuestion.includes('malat') || lowerQuestion.includes('malattie') || lowerQuestion.includes('fungh')) {
      return {
        content: `🌿 **Diagnosi e Cura Malattie delle Piante:**

**Malattie Comuni Invernali:**
• **Peronospora**: Macchie gialle su foglie → Trattare con rame
• **Oidio**: Patina bianca → Bicarbonato di potassio
• **Marciume radicale**: Eccesso acqua → Ridurre irrigazione
• **Ruggine**: Macchie arancioni → Fungicida specifico

**Prevenzione:**
• Rotazione colture ogni 3-4 anni
• Evitare ristagni d'acqua
• Distanziare bene le piante
• Trattamenti preventivi con rame in inverno

**Quando Intervenire:**
• Ai primi sintomi per efficacia massima
• Mattina presto o sera per evitare stress
• Mai su piante bagnate dalla pioggia`,
        suggestions: [
          'Come riconoscere la peronospora?',
          'Trattamenti naturali per funghi',
          'Prevenzione malattie in serra',
          'Quando usare il rame?'
        ]
      }
    }

    if (lowerQuestion.includes('pomodor') || lowerQuestion.includes('tomat')) {
      return {
        content: `🍅 **Guida Completa Pomodori - Gennaio 2026:**

**Calendario Semine:**
• **Ora (Gennaio)**: Semina in serra riscaldata
• **Febbraio**: Semina in semenzaio protetto
• **Marzo**: Trapianto in serra fredda
• **Aprile-Maggio**: Trapianto in pieno campo

**Varietà Consigliate:**
• **San Marzano**: Salse, conserve (indeterminato)
• **Cuore di Bue**: Insalate, grandi (indeterminato)
• **Ciliegino**: Continuo, resistente (indeterminato)
• **Roma**: Universale, produttivo (determinato)

**Cure Essenziali:**
• Temperatura minima: 15°C notturna
• Supporti alti (2m) per indeterminati
• Irrigazione regolare ma non eccessiva
• Potatura femminelle settimanale`,
        suggestions: [
          'Come potare i pomodori?',
          'Malattie comuni pomodori',
          'Varietà resistenti malattie',
          'Quando raccogliere pomodori?'
        ]
      }
    }

    if (lowerQuestion.includes('terreno') || lowerQuestion.includes('suolo') || lowerQuestion.includes('preparar')) {
      return {
        content: `🌱 **Preparazione Terreno - Gennaio 2026:**

**Lavorazioni Invernali:**
• **Vangatura profonda**: 30-40cm quando non gela
• **Incorporare letame**: 3-4 kg/m² ben maturo
• **Correzione pH**: Calce se acido, zolfo se basico
• **Drenaggio**: Aggiungere sabbia se argilloso

**Ammendanti Organici:**
• **Compost maturo**: 2-3 kg/m²
• **Letame bovino**: 4-5 kg/m² (autunno)
• **Humus di lombrico**: 1 kg/m² (sempre)
• **Cenere di legna**: 100g/m² (se pH basso)

**Test del Terreno:**
• **pH ideale**: 6.0-7.0 per la maggior parte
• **Drenaggio**: Scavare buca, riempire d'acqua
• **Struttura**: Pugno di terra umida deve sbriciolarsi`,
        suggestions: [
          'Come fare il compost?',
          'Test pH del terreno',
          'Migliorare terreno argilloso',
          'Quando concimare?'
        ]
      }
    }

    if (lowerQuestion.includes('inverno') || lowerQuestion.includes('gennaio') || lowerQuestion.includes('freddo')) {
      return {
        content: `❄️ **Coltivazioni Invernali - Gennaio 2026:**

**Cosa Seminare Ora:**
• **In serra**: Lattuga, spinaci, rucola, ravanelli
• **Semenzaio**: Pomodori, peperoni, melanzane (fine mese)
• **Pieno campo**: Fave, piselli (zone miti)
• **Aromatiche**: Prezzemolo, coriandolo (protetto)

**Protezioni dal Freddo:**
• **Tunnel**: Tessuto non tessuto su archetti
• **Pacciamatura**: Paglia, foglie secche
• **Serra fredda**: Per anticipare semine
• **Campane**: Bottiglie di plastica per singole piante

**Manutenzioni:**
• Potatura alberi da frutto (senza foglie)
• Pulizia attrezzi e serra
• Pianificazione rotazioni
• Ordine semi per primavera`,
        suggestions: [
          'Proteggere piante dal gelo',
          'Potatura alberi da frutto',
          'Serra fai da te',
          'Pianificare rotazioni'
        ]
      }
    }

    if (lowerQuestion.includes('parassit') || lowerQuestion.includes('insett') || lowerQuestion.includes('afid')) {
      return {
        content: `🐛 **Controllo Parassiti Naturale:**

**Parassiti Comuni Inverno:**
• **Afidi**: Sapone di Marsiglia diluito
• **Cocciniglia**: Alcool denaturato con cotton fioc
• **Lumache**: Trappole birra, cenere, gusci uovo
• **Topi**: Trappole, piante repellenti (menta)

**Trattamenti Naturali:**
• **Olio di Neem**: Insetticida naturale polivalente
• **Macerato ortica**: Afidi e rinforzo piante
• **Sapone molle**: Afidi, cocciniglie, acari
• **Bacillus thuringiensis**: Bruchi e larve

**Prevenzione:**
• Piante compagne repellenti (basilico, tagete)
• Biodiversità: attirare predatori naturali
• Controlli regolari settimanali
• Rimozione foglie malate`,
        suggestions: [
          'Ricetta macerato di ortica',
          'Piante che allontanano insetti',
          'Trappole naturali lumache',
          'Quando usare olio di Neem?'
        ]
      }
    }

    // Risposta generica intelligente
    return {
      content: `🤖 **Assistente AI OrtoMio:**

Ho analizzato la tua domanda "${question}" e sono qui per aiutarti con qualsiasi aspetto dell'agricoltura e giardinaggio!

**Posso aiutarti con:**
• 🌱 Semine e trapianti stagionali
• 🌿 Diagnosi malattie e parassiti
• 💧 Irrigazione e nutrizione
• 🌡️ Protezione dal freddo/caldo
• 📅 Pianificazione colture
• 🔄 Rotazioni e consociazioni
• 🧪 Preparazione terreno
• 🍅 Guide specifiche per ogni pianta

**Esempi di domande:**
"Come curare la peronospora del pomodoro?"
"Quando seminare le melanzane?"
"Come preparare il terreno per l'orto?"

Fai pure la tua domanda specifica!`,
      suggestions: [
        'Malattie delle piante',
        'Calendario semine',
        'Preparazione terreno',
        'Controllo parassiti',
        'Coltivazioni invernali',
        'Consigli per principianti'
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
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group animate-pulse"
        style={{ zIndex: UI_LAYERS.floatingChat }}
        title="Apri Chat AI - Fai qualsiasi domanda!"
      >
        <MessageCircle size={24} />
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
          <Bot size={12} />
        </div>
        <div className="absolute -top-12 right-0 bg-black text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Fai una domanda all'AI! 🤖
        </div>
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ${
      isMinimized 
        ? 'w-80 h-16' 
        : 'w-96 h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]'
      }`}
      style={{ zIndex: UI_LAYERS.floatingChat }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant OrtoMio</h3>
            {!isMinimized && <p className="text-xs opacity-90">Fai qualsiasi domanda sull'agricoltura!</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white transition-colors p-1"
            title={isMinimized ? "Espandi" : "Minimizza"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors p-1"
            title="Chiudi"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
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
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot size={16} className="text-green-600" />
                      <span className="text-xs font-medium text-green-600">AI OrtoMio</span>
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
                    <Bot size={16} className="text-green-600" />
                    <span className="text-xs font-medium text-green-600">AI OrtoMio</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 size={16} className="animate-spin text-green-600" />
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
                placeholder="Fai una domanda sull'agricoltura..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Sparkles size={12} />
              <span>AI OrtoMio • Premi Invio per inviare</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
