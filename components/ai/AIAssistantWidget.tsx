/**
 * AI Assistant Widget
 * Floating AI assistant that provides contextual help throughout the platform
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Camera, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
import { ContextAwareAIService, AIAssistanceRequest } from '../../services/contextAwareAIService';
import { Garden, GardenTask, UserProfile } from '../../types';

interface AIAssistantWidgetProps {
  garden?: Garden;
  activeTasks?: GardenTask[];
  userProfile?: UserProfile;
  isVisible?: boolean;
  onToggle?: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'suggestion';
  content: string;
  timestamp: Date;
  imageData?: string;
  feedback?: 'helpful' | 'not_helpful';
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  garden,
  activeTasks = [],
  userProfile,
  isVisible = false,
  onToggle
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load contextual suggestions on mount
  useEffect(() => {
    if (isVisible && garden && activeTasks.length > 0) {
      loadSuggestions();
    }
  }, [isVisible, garden, activeTasks]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSuggestions = async () => {
    if (!garden) return;
    
    try {
      const contextualSuggestions = await ContextAwareAIService.getContextualSuggestions(
        garden.id,
        activeTasks,
        userProfile
      );
      setSuggestions(contextualSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (content: string, type: 'general' | 'image_analysis' = 'general', imageData?: string) => {
    if (!content.trim() && !imageData) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content || 'Analizza questa immagine',
      timestamp: new Date(),
      imageData
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowImageUpload(false);

    try {
      const request: AIAssistanceRequest = {
        type: imageData ? 'image_analysis' : 'general',
        input: content,
        imageData,
        context: {
          location: garden?.coordinates ? `${garden.coordinates.latitude},${garden.coordinates.longitude}` : undefined,
          urgency: 'medium'
        }
      };

      const response = await ContextAwareAIService.processRequest(
        request,
        userProfile?.id || 'anonymous',
        garden?.id,
        userProfile
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      sendMessage('Analizza questa foto del mio orto', 'image_analysis', imageData);
    };
    reader.readAsDataURL(file);
  };

  const provideFeedback = (messageId: string, feedback: 'helpful' | 'not_helpful') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));

    if (userProfile?.id) {
      ContextAwareAIService.provideFeedback(
        userProfile.id,
        messageId,
        feedback,
        garden?.id
      );
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50"
        aria-label="Apri assistente AI"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <MessageCircle size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Assistente AI</h3>
            <p className="text-xs text-gray-600">OrtoMio Expert</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Lightbulb size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Ciao! Sono qui per aiutarti con il tuo orto.</p>
            <p className="text-xs mt-1">Fai una domanda o carica una foto per iniziare.</p>
          </div>
        )}

        {/* Contextual Suggestions */}
        {messages.length === 0 && suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 mb-2">Suggerimenti per te:</p>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-800 transition-colors"
              >
                <Lightbulb size={14} className="inline mr-2" />
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.imageData && (
                <img
                  src={message.imageData}
                  alt="Uploaded"
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
              
              {/* Feedback buttons for AI messages */}
              {message.type === 'ai' && !message.feedback && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => provideFeedback(message.id, 'helpful')}
                    className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <CheckCircle size={12} />
                    Utile
                  </button>
                  <button
                    onClick={() => provideFeedback(message.id, 'not_helpful')}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    Non utile
                  </button>
                </div>
              )}
              
              {message.feedback && (
                <div className="text-xs mt-2 opacity-70">
                  Feedback: {message.feedback === 'helpful' ? '👍 Utile' : '👎 Non utile'}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Loader2 size={16} className="animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        {showImageUpload && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-sm"
            />
            <p className="text-xs text-blue-600 mt-1">
              Carica una foto per l'analisi AI
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowImageUpload(!showImageUpload);
              if (!showImageUpload) {
                fileInputRef.current?.click();
              }
            }}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Carica immagine"
          >
            <Camera size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage(input)}
            placeholder="Scrivi la tua domanda..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || (!input.trim())}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantWidget;