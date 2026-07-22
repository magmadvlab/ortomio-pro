import React, { useState } from 'react';
import { Garden } from '../types';
import { IStorageProvider } from '../packages/core/storage/interface';
import { downloadExport, exportGardenData } from '../services/exportService';
import { importGardenData, validateExportFile, ImportResult } from '../services/importService';
import { useAuth } from '../packages/core/hooks/useAuth';
import { Download, Upload, CheckCircle, AlertTriangle, Loader2, FileText } from 'lucide-react';

interface DataBackupProps {
  garden: Garden;
  storage: IStorageProvider;
  onImportComplete?: (garden: Garden) => void;
}

const DataBackup: React.FC<DataBackupProps> = ({
  garden,
  storage,
  onImportComplete,
}) => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);
      await downloadExport(garden.id, storage);
    } catch (err: any) {
      setError(`Errore durante export: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      setImportResult(null);

      if (!user) {
        setError('Devi essere autenticato per importare dati');
        return;
      }

      // Valida file prima di importare
      const validation = await validateExportFile(file);
      if (!validation.valid) {
        setError(validation.error || 'File non valido');
        return;
      }

      // Importa dati
      const result = await importGardenData(file, user.id, storage);

      setImportResult(result);

      if (result.success && result.importedGarden) {
        onImportComplete?.(result.importedGarden);
      }
    } catch (err: any) {
      setError(`Errore durante import: ${err.message}`);
    } finally {
      setImporting(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
        <FileText size={20} className="text-blue-600" />
        Backup e Ripristino Dati
      </h3>

      <div className="space-y-4">
        {/* Export Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Esporta Dati</h4>
              <p className="text-sm text-gray-600">
                Scarica un backup completo del giardino "{garden.name}" in formato JSON.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Esportazione...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Esporta</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Il file include: giardino, task, raccolti, inventario semi.
          </p>
        </div>

        {/* Import Section */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="mb-2">
            <h4 className="font-semibold text-gray-800 mb-1">Ripristina Dati</h4>
            <p className="text-sm text-gray-600">
              Importa dati da un file di backup. Verrà creato un nuovo giardino con i dati importati.
            </p>
          </div>
          <label className="flex items-center gap-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {importing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Importazione...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Seleziona File</span>
              </>
            )}
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Seleziona un file .json esportato da OrtoMio AI.
          </p>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`p-4 rounded-lg border-l-4 ${
            importResult.success
              ? 'bg-green-50 border-green-400'
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-start gap-3">
              {importResult.success ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <AlertTriangle size={20} className="text-red-600" />
              )}
              <div className="flex-1">
                {importResult.success ? (
                  <>
                    <p className="font-bold text-green-800 mb-2">Import Completato!</p>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Task importati: {importResult.tasksImported}</p>
                      <p>• Raccolti importati: {importResult.harvestsImported}</p>
                      <p>• Semi importati: {importResult.seedsImported}</p>
                    </div>
                    {importResult.importedGarden && (
                      <p className="text-sm text-green-700 mt-2">
                        Nuovo giardino creato: <span className="font-semibold">{importResult.importedGarden.name}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-bold text-red-800 mb-2">Errore durante Import</p>
                    {importResult.errors && (
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {importResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
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

export default DataBackup;

