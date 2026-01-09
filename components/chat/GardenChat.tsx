/**
 * Garden Chat Component
 * Interfaccia chat naturale per interagire con OrtoMio
 */

import React, { useState, useRef, useEffect } from 'react';
import { Garden, UserProfile } from '../../types';
import {
  processUserInput,
  startConversation,
  ConversationState,
  ConversationResponse,
} from '../../logic/conversationEngine';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface GardenChatProps {
  garden: Garden;
  userProfile?: UserProfile;
  initialTopic?: 'planting' | 'harvest' | 'problem' | 'general' | 'harvest_log' | 'task_creation';
  onComplete?: (data: Record<string, any>) => void;
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

const GardenChat: React.FC<GardenChatProps> = ({
  garden,
  userProfile,
  initialTopic = 'general',
  onComplete,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>(
    startConversation(initialTopic, { garden }, 'intermediate')
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Messaggio iniziale
    const initialResponse = getInitialMessage(initialTopic, 'intermediate');
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: initialResponse,
        timestamp: new Date(),
      },
    ]);
  }, [initialTopic, userProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitialMessage = (
    topic: string,
    expertise?: 'beginner' | 'intermediate' | 'expert'
  ): string => {
    switch (topic) {
      case 'planting':
        return expertise === 'beginner'
          ? 'Ciao! Vuoi piantare qualcosa? Dimmi cosa vuoi piantare e ti guiderò passo passo.'
          : 'Cosa vuoi piantare?';
      case 'harvest':
        return expertise === 'beginner'
          ? 'Vuoi registrare un raccolto? Dimmi cosa hai raccolto e ti aiuto a registrarlo.'
          : 'Cosa hai raccolto?';
      case 'problem':
        return expertise === 'beginner'
          ? 'Hai un problema con le tue piante? Descrivi cosa vedi e ti aiuterò a risolverlo.'
          : 'Quale problema?';
      default:
        return expertise === 'beginner'
          ? 'Ciao! Sono qui per aiutarti con il tuo orto. Puoi dirmi cosa vuoi fare: piantare, raccogliere, o segnalare un problema.'
          : 'Come posso aiutarti?';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const { response, newState } = await processUserInput(
        input.trim(),
        conversationState,
        userProfile
      );

      setConversationState(newState);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Se la conversazione è completata, chiama callback
      if (response.canComplete && response.completedData && onComplete) {
        setTimeout(() => {
          onComplete(response.completedData || {});
        }, 500);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Mi dispiace, c\'è stato un errore. Puoi riprovare?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-green-600" />
          <h3 className="font-semibold text-gray-800">Assistente Orto</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Chiudi
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-green-600" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`text-xs px-2 py-1 rounded ${
                        message.role === 'assistant'
                          ? 'bg-white text-green-600 hover:bg-green-50'
                          : 'bg-green-700 text-white hover:bg-green-800'
                      } transition-colors`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-green-600" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 size={16} className="animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Premi Invio per inviare. Puoi parlare naturalmente, come con un amico.
        </p>
      </div>
    </div>
  );
};

export default GardenChat;

