/**
 * Backup Settings Component
 * Gestione completa backup e sincronizzazione
 */

import React, { useState, useEffect } from 'react';
import { IStorageProvider } from '../packages/core/storage/interface';
import { Garden } from '../types';
import { 
  getBackupMetadata, 
  restoreBackup, 
  getLatestBackup,
  saveAutoBackup as triggerManualBackup 
} from '../services/autoBackupService';
import { detectCloudBackups, syncToCloud } from '../services/cloudSyncService';
import { exportGardenData } from '../services/exportService';
import { downloadExport } from '../services/exportService';
import { 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  FileText,
  Cloud,
  CloudOff,
  RefreshCw,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface BackupSettingsProps {
  garden: Garden;
  storage: IStorageProvider;
  onRestoreComplete?: (garden: Garden) => void;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({
  garden,
  storage,
  onRestoreComplete,
}) => {
  const [localBackups, setLocalBackups] = useState(getBackupMetadata());
  const [cloudBackups, setCloudBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
    checkCloudSync();
  }, [garden.id]);

  const loadBackups = () => {
    const backups = getBackupMetadata();
    const gardenBackups = backups.filter(b => b.gardenId === garden.id);
    setLocalBackups(gardenBackups);
  };

  const checkCloudSync = async () => {
    try {
      const backups = await detectCloudBackups();
      const gardenBackups = backups.filter(b => b.gardenId === garden.id);
      setCloudBackups(gardenBackups);
    } catch (error) {
      console.error('Error checking cloud sync:', error);
    }
  };

  const handleManualBackup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await triggerManualBackup(storage, garden.id);
      loadBackups();
      setSuccess('Backup salvato con successo!');
      
      // Sincronizza anche su cloud
      const exportData = await exportGardenData(garden.id, storage);
      const exportText = await exportData.text();
      const data = JSON.parse(exportText);
      await syncToCloud(data);
      setLastSync(new Date());
      await checkCloudSync();
    } catch (err: any) {
      setError(`Errore durante backup: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloudSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const exportData = await exportGardenData(garden.id, storage);
      const exportText = await exportData.text();
      const data = JSON.parse(exportText);
      await syncToCloud(data);
      setLastSync(new Date());
      await checkCloudSync();
      setSuccess('Sincronizzazione cloud completata!');
    } catch (err: any) {
      setError(`Errore durante sincronizzazione: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm('Sei sicuro di voler ripristinare questo backup? I dati attuali verranno sovrascritti.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await restoreBackup(backupId, storage);
      
      if (result.success) {
        setSuccess(
          `Ripristino completato! ${result.gardensRestored} giardino/i, ` +
          `${result.tasksRestored} task, ${result.harvestsRestored} raccolti, ` +
          `${result.seedsRestored} semi ripristinati.`
        );
        loadBackups();
        if (onRestoreComplete) {
          const gardens = await storage.getGardens();
          const restoredGarden = gardens.find(g => g.id === garden.id);
          if (restoredGarden) {
            onRestoreComplete(restoredGarden);
          }
        }
      } else {
        setError(`Errore durante ripristino: ${result.errors?.join(', ')}`);
      }
    } catch (err: any) {
      setError(`Errore durante ripristino: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await downloadExport(garden.id, storage);
      setSuccess('Export completato! File scaricato.');
    } catch (err: any) {
      setError(`Errore durante export: ${err.message}`);
    }
  };

  const latestBackup = localBackups.length > 0 
    ? localBackups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]
    : null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FileText size={20} className="text-blue-600" />
        Backup e Sincronizzazione
      </h3>

      <div className="space-y-4">
        {/* Status Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Ultimo Backup</span>
            {latestBackup ? (
              <span className="text-xs text-gray-500">
                {format(new Date(latestBackup.timestamp), 'dd/MM/yyyy HH:mm', { locale: it })}
              </span>
            ) : (
              <span className="text-xs text-gray-400">Mai</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Backup Locali</span>
            <span className="text-sm text-gray-600">{localBackups.length}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-gray-700">Backup Cloud</span>
            <div className="flex items-center gap-2">
              {cloudBackups.length > 0 ? (
                <>
                  <Cloud size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600">{cloudBackups.length}</span>
                </>
              ) : (
                <>
                  <CloudOff size={16} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Nessuno</span>
                </>
              )}
            </div>
          </div>
          {lastSync && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} />
                Ultima sincronizzazione: {format(lastSync, 'dd/MM/yyyy HH:mm', { locale: it })}
              </div>
            </div>
          )}
        </div>

        {/* Manual Backup Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Backup Manuale</h4>
              <p className="text-sm text-gray-600">
                Crea un backup completo del giardino "{garden.name}" ora.
              </p>
            </div>
            <button
              onClick={handleManualBackup}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Salvataggio...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Backup Ora</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cloud Sync Section */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Sincronizzazione Cloud</h4>
              <p className="text-sm text-gray-600">
                Sincronizza i tuoi dati su iCloud (iOS) o Google Drive (Android).
              </p>
            </div>
            <button
              onClick={handleCloudSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sincronizzazione...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Sincronizza</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Esporta Dati</h4>
              <p className="text-sm text-gray-600">
                Scarica un file JSON con tutti i dati del giardino.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download size={18} />
              <span>Esporta</span>
            </button>
          </div>
        </div>

        {/* Local Backups List */}
        {localBackups.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Backup Locali Disponibili</h4>
            <div className="space-y-2">
              {localBackups
                .sort((a, b) => 
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )
                .slice(0, 5)
                .map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {format(new Date(backup.timestamp), 'dd/MM/yyyy HH:mm', { locale: it })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(backup.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestore(backup.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      Ripristina
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Cloud Backups List */}
        {cloudBackups.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Cloud size={18} className="text-green-600" />
              Backup Cloud Disponibili
            </h4>
            <div className="space-y-2">
              {cloudBackups.slice(0, 5).map((backup, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {format(new Date(backup.timestamp), 'dd/MM/yyyy HH:mm', { locale: it })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {backup.source === 'icloud' ? 'iCloud' : backup.source === 'google_drive' ? 'Google Drive' : 'Locale'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default BackupSettings;













