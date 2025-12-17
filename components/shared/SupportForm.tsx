'use client';

/**
 * Support Form Component
 * Contact form for user support requests
 */

import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SupportFormData {
  name: string;
  email: string;
  type: 'bug' | 'question' | 'suggestion' | 'other';
  message: string;
  includeSystemInfo: boolean;
}

const SupportForm: React.FC = () => {
  const [formData, setFormData] = useState<SupportFormData>({
    name: '',
    email: '',
    type: 'question',
    message: '',
    includeSystemInfo: true,
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('includeSystemInfo', formData.includeSystemInfo.toString());
      
      if (screenshot) {
        formDataToSend.append('screenshot', screenshot);
      }

      if (formData.includeSystemInfo) {
        const systemInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timestamp: new Date().toISOString(),
        };
        formDataToSend.append('systemInfo', JSON.stringify(systemInfo));
      }

      const response = await fetch('/api/support/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          type: 'question',
          message: '',
          includeSystemInfo: true,
        });
        setScreenshot(null);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting support form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Nome *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo Richiesta *
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as SupportFormData['type'] })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          <option value="bug">Bug / Problema</option>
          <option value="question">Domanda</option>
          <option value="suggestion">Suggerimento</option>
          <option value="other">Altro</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
          Messaggio *
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="Descrivi il tuo problema, domanda o suggerimento..."
        />
      </div>

      <div>
        <label htmlFor="screenshot" className="block text-sm font-semibold text-gray-700 mb-2">
          Screenshot (opzionale, max 5MB)
        </label>
        <input
          type="file"
          id="screenshot"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size <= 5 * 1024 * 1024) {
              setScreenshot(file);
            } else if (file) {
              alert('Il file è troppo grande. Massimo 5MB.');
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
        {screenshot && (
          <p className="text-sm text-gray-600 mt-1">File selezionato: {screenshot.name}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeSystemInfo"
          checked={formData.includeSystemInfo}
          onChange={(e) => setFormData({ ...formData, includeSystemInfo: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor="includeSystemInfo" className="text-sm text-gray-700">
          Includi informazioni sistema (browser, risoluzione, etc.)
        </label>
      </div>

      {submitStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-green-800 font-medium">Messaggio inviato con successo! Ti risponderemo presto.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-800 font-medium">Errore nell'invio. Riprova più tardi.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Invio in corso...
          </>
        ) : (
          <>
            <Send size={20} />
            Invia Richiesta
          </>
        )}
      </button>
    </form>
  );
};

export default SupportForm;










