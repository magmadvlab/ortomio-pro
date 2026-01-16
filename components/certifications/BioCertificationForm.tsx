/**
 * BIO Certification Form Component
 * Form strutturato per certificazione biologica EU 2018/848
 */

import React, { useState } from 'react';
import { Leaf, CheckCircle, AlertTriangle, FileText, Calendar, Users } from 'lucide-react';

interface BioCertificationFormProps {
  gardenId: string;
  onSave?: (data: BioCertificationData) => void;
}

interface BioCertificationData {
  // Dati azienda
  companyName: string;
  vatNumber: string;
  address: string;
  certificationBody: string;
  certificationNumber: string;
  certificationDate: string;
  expiryDate: string;
  
  // Produzione
  totalArea: number;
  organicArea: number;
  conversionArea: number;
  conventionalArea: number;
  
  // Pratiche
  usesChemicalFertilizers: boolean;
  usesSyntheticPesticides: boolean;
  usesGMO: boolean;
  hasBufferZones: boolean;
  bufferZoneWidth: number;
  
  // Tracciabilità
  hasTraceabilitySystem: boolean;
  separatesOrganicConventional: boolean;
  keepsProductionRecords: boolean;
  
  // Controlli
  lastInspectionDate: string;
  nextInspectionDate: string;
  nonConformities: string;
  correctiveActions: string;
}

const BioCertificationForm: React.FC<BioCertificationFormProps> = ({ gardenId, onSave }) => {
  const [formData, setFormData] = useState<BioCertificationData>({
    companyName: '',
    vatNumber: '',
    address: '',
    certificationBody: '',
    certificationNumber: '',
    certificationDate: '',
    expiryDate: '',
    totalArea: 0,
    organicArea: 0,
    conversionArea: 0,
    conventionalArea: 0,
    usesChemicalFertilizers: false,
    usesSyntheticPesticides: false,
    usesGMO: false,
    hasBufferZones: true,
    bufferZoneWidth: 5,
    hasTraceabilitySystem: true,
    separatesOrganicConventional: true,
    keepsProductionRecords: true,
    lastInspectionDate: '',
    nextInspectionDate: '',
    nonConformities: '',
    correctiveActions: ''
  });

  const [activeSection, setActiveSection] = useState<'company' | 'production' | 'practices' | 'traceability' | 'controls'>('company');
  const [complianceScore, setComplianceScore] = useState(0);

  const calculateCompliance = () => {
    let score = 0;
    let total = 0;

    // Company data (20%)
    if (formData.companyName) score += 4;
    if (formData.certificationBody) score += 4;
    if (formData.certificationNumber) score += 4;
    if (formData.certificationDate) score += 4;
    if (formData.expiryDate) score += 4;
    total += 20;

    // Production (20%)
    if (formData.totalArea > 0) score += 5;
    if (formData.organicArea > 0) score += 5;
    if (formData.hasBufferZones) score += 5;
    if (formData.bufferZoneWidth >= 3) score += 5;
    total += 20;

    // Practices (30%)
    if (!formData.usesChemicalFertilizers) score += 10;
    if (!formData.usesSyntheticPesticides) score += 10;
    if (!formData.usesGMO) score += 10;
    total += 30;

    // Traceability (20%)
    if (formData.hasTraceabilitySystem) score += 7;
    if (formData.separatesOrganicConventional) score += 7;
    if (formData.keepsProductionRecords) score += 6;
    total += 20;

    // Controls (10%)
    if (formData.lastInspectionDate) score += 5;
    if (formData.nextInspectionDate) score += 5;
    total += 10;

    return Math.round((score / total) * 100);
  };

  React.useEffect(() => {
    setComplianceScore(calculateCompliance());
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  const sections = [
    { id: 'company', label: 'Dati Azienda', icon: FileText },
    { id: 'production', label: 'Produzione', icon: Leaf },
    { id: 'practices', label: 'Pratiche', icon: CheckCircle },
    { id: 'traceability', label: 'Tracciabilità', icon: AlertTriangle },
    { id: 'controls', label: 'Controlli', icon: Calendar }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Certificazione Biologica EU 2018/848</h2>
              <p className="text-gray-600">Compila il form per verificare la conformità</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Conformità</p>
            <p className={`text-2xl font-bold ${
              complianceScore >= 80 ? 'text-green-600' :
              complianceScore >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {complianceScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              complianceScore >= 80 ? 'bg-green-600' :
              complianceScore >= 60 ? 'bg-yellow-600' :
              'bg-red-600'
            }`}
            style={{ width: `${complianceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 px-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeSection === section.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Company Section */}
        {activeSection === 'company' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dati Azienda</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Azienda *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partita IVA
                </label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organismo di Certificazione *
                </label>
                <select
                  value={formData.certificationBody}
                  onChange={(e) => setFormData({ ...formData, certificationBody: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Seleziona...</option>
                  <option value="ICEA">ICEA</option>
                  <option value="CCPB">CCPB</option>
                  <option value="Bioagricert">Bioagricert</option>
                  <option value="SUOLO E SALUTE">SUOLO E SALUTE</option>
                  <option value="BIOS">BIOS</option>
                  <option value="QCertificazioni">QCertificazioni</option>
                  <option value="altro">Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero Certificato
                </label>
                <input
                  type="text"
                  value={formData.certificationNumber}
                  onChange={(e) => setFormData({ ...formData, certificationNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Certificazione
                </label>
                <input
                  type="date"
                  value={formData.certificationDate}
                  onChange={(e) => setFormData({ ...formData, certificationDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Scadenza
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Production Section */}
        {activeSection === 'production' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Superfici di Produzione</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie Totale (ha) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalArea}
                  onChange={(e) => setFormData({ ...formData, totalArea: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie Biologica (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.organicArea}
                  onChange={(e) => setFormData({ ...formData, organicArea: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie in Conversione (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.conversionArea}
                  onChange={(e) => setFormData({ ...formData, conversionArea: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie Convenzionale (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.conventionalArea}
                  onChange={(e) => setFormData({ ...formData, conventionalArea: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Zone Tampone</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasBufferZones}
                    onChange={(e) => setFormData({ ...formData, hasBufferZones: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-blue-900">
                    Presenza di zone tampone tra biologico e convenzionale
                  </span>
                </label>

                {formData.hasBufferZones && (
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Larghezza Zone Tampone (m)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.bufferZoneWidth}
                      onChange={(e) => setFormData({ ...formData, bufferZoneWidth: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-blue-700 mt-1">
                      Minimo raccomandato: 3 metri
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Practices Section */}
        {activeSection === 'practices' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pratiche Agricole</h3>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3">Sostanze Vietate</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.usesChemicalFertilizers}
                      onChange={(e) => setFormData({ ...formData, usesChemicalFertilizers: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-red-900">
                      Utilizzo di fertilizzanti chimici di sintesi
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.usesSyntheticPesticides}
                      onChange={(e) => setFormData({ ...formData, usesSyntheticPesticides: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-red-900">
                      Utilizzo di pesticidi sintetici
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.usesGMO}
                      onChange={(e) => setFormData({ ...formData, usesGMO: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-red-900">
                      Utilizzo di OGM (Organismi Geneticamente Modificati)
                    </span>
                  </label>
                </div>
                <p className="text-xs text-red-700 mt-3">
                  ⚠️ Nessuna di queste pratiche deve essere utilizzata per la certificazione biologica
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Pratiche Consentite</h4>
                <ul className="text-sm text-green-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Fertilizzanti organici (compost, letame maturo, sovescio)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Prodotti fitosanitari di origine naturale (rame, zolfo, piretro)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Lotta biologica (insetti utili, feromoni)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Rotazione colturale e consociazioni</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Sementi e materiale riproduttivo biologico</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Traceability Section */}
        {activeSection === 'traceability' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracciabilità e Separazione</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Requisiti Obbligatori</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasTraceabilitySystem}
                      onChange={(e) => setFormData({ ...formData, hasTraceabilitySystem: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-blue-900">
                      Sistema di tracciabilità implementato (lotti, registri)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.separatesOrganicConventional}
                      onChange={(e) => setFormData({ ...formData, separatesOrganicConventional: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-blue-900">
                      Separazione fisica tra prodotti biologici e convenzionali
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.keepsProductionRecords}
                      onChange={(e) => setFormData({ ...formData, keepsProductionRecords: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-blue-900">
                      Registrazione di tutte le operazioni colturali
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Documenti Richiesti</h4>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <FileText size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Registro delle operazioni colturali</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Registro degli acquisti (input, sementi, materiali)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Registro delle vendite con codici lotto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Piano di gestione biologica annuale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Planimetrie con identificazione parcelle</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        {activeSection === 'controls' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Controlli e Ispezioni</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Ultima Ispezione
                </label>
                <input
                  type="date"
                  value={formData.lastInspectionDate}
                  onChange={(e) => setFormData({ ...formData, lastInspectionDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Prossima Ispezione
                </label>
                <input
                  type="date"
                  value={formData.nextInspectionDate}
                  onChange={(e) => setFormData({ ...formData, nextInspectionDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Non Conformità Rilevate
              </label>
              <textarea
                value={formData.nonConformities}
                onChange={(e) => setFormData({ ...formData, nonConformities: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Descrivi eventuali non conformità rilevate durante le ispezioni..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Azioni Correttive Implementate
              </label>
              <textarea
                value={formData.correctiveActions}
                onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Descrivi le azioni correttive implementate..."
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Frequenza Controlli</h4>
              <p className="text-sm text-green-800 mb-2">
                Secondo il Reg. EU 2018/848, l'organismo di certificazione deve effettuare:
              </p>
              <ul className="text-sm text-green-800 space-y-1 ml-4">
                <li>• Almeno 1 ispezione fisica annuale</li>
                <li>• Controlli a sorpresa (almeno 10% degli operatori)</li>
                <li>• Analisi di campioni quando necessario</li>
                <li>• Verifica documentale continua</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t mt-6">
          <button
            type="button"
            onClick={() => {
              const prevIndex = sections.findIndex(s => s.id === activeSection);
              if (prevIndex > 0) {
                setActiveSection(sections[prevIndex - 1].id as any);
              }
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={activeSection === 'company'}
          >
            ← Indietro
          </button>
          
          {activeSection !== 'controls' ? (
            <button
              type="button"
              onClick={() => {
                const nextIndex = sections.findIndex(s => s.id === activeSection);
                if (nextIndex < sections.length - 1) {
                  setActiveSection(sections[nextIndex + 1].id as any);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Avanti →
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Salva Certificazione
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BioCertificationForm;
