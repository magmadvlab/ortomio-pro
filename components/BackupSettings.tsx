/**
 * Backup Settings Component
 * Gestione export dati - Backup automatico su Supabase
 */

import React, { useState } from 'react';
import { IStorageProvider } from '../packages/core/storage/interface';
import { Garden } from '../types';
import { exportGardenData, downloadExport } from '../services/exportService';
import { 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  FileText,
  Database,
  Shield
} from 'lucide-react';

interface BackupSettingsProps {
  garden: Garden;
  storage: IStorageProvider;
  onRestoreComplete?: (garden: Garden) => void;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({
  garden,
  storage,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await downloadExport(garden.id, storage);
      setSuccess('Export completato! File JSON scaricato con successo.');
    } catch (err: any) {
      setError(`Errore durante export: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
        <FileText size={20} className="text-blue-600" />
        Backup e Sicurezza Dati
      </h3>

      <div className="space-y-4">
        {/* Automatic Backup Info */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <Database size={20} className="text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Backup Automatico Attivo</h4>
              <p className="text-sm text-gray-600">
                Tutti i tuoi dati sono salvati automaticamente e in tempo reale su Supabase. 
                Non è necessario creare backup manuali.
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Sicurezza e Privacy</h4>
              <p className="text-sm text-gray-600">
                I tuoi dati sono protetti con crittografia end-to-end e backup ridondanti. 
                Accesso sicuro tramite autenticazione utente.
              </p>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Esporta Dati</h4>
              <p className="text-sm text-gray-600">
                Scarica un file JSON con tutti i dati del giardino "{garden.name}" per archivio personale.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Esportazione...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Esporta JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            💡 <strong>Nota:</strong> Con Supabase, i tuoi dati sono sempre sincronizzati e accessibili 
            da qualsiasi dispositivo. Non è necessaria sincronizzazione manuale con iCloud o Google Drive.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
