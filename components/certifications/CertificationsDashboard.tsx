/**
 * Certifications Dashboard Component
 * Dashboard principale per gestione certificazioni
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Shield, Leaf, Award, FileText, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import GlobalGapDashboard from '../compliance/GlobalGapDashboard';
import BioCertificationForm, { BioCertificationData } from './BioCertificationForm';
import { bioCertificationService, BioCertificationRecord } from '../../services/bioCertificationService';

interface CertificationsDashboardProps {
  gardenId: string;
}

type CertificationType = 'overview' | 'bio' | 'globalgap' | 'sqnpi' | 'grasp';

const CertificationsDashboard: React.FC<CertificationsDashboardProps> = ({ gardenId }) => {
  const [activeTab, setActiveTab] = useState<CertificationType>('overview');
  const [bioCertification, setBioCertification] = useState<BioCertificationRecord | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioSaving, setBioSaving] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [bioMessage, setBioMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!gardenId) return;

    let cancelled = false;

    const loadBioCertification = async () => {
      setBioLoading(true);
      setBioError(null);

      try {
        const existing = await bioCertificationService.getLatestByGarden(gardenId);
        if (!cancelled) {
          setBioCertification(existing);
        }
      } catch (error) {
        if (!cancelled) {
          setBioError(error instanceof Error ? error.message : 'Impossibile caricare la certificazione BIO');
        }
      } finally {
        if (!cancelled) {
          setBioLoading(false);
        }
      }
    };

    loadBioCertification();

    return () => {
      cancelled = true;
    };
  }, [gardenId]);

  const handleBioSave = useCallback(async (data: BioCertificationData) => {
    setBioSaving(true);
    setBioError(null);
    setBioMessage(null);

    try {
      const saved = await bioCertificationService.upsertForGarden(gardenId, data, bioCertification?.id);
      setBioCertification(saved);
      setBioMessage(`Certificazione BIO salvata nel database. Readiness: ${saved.readinessStatus || 'non calcolata'}.`);
    } catch (error) {
      setBioError(error instanceof Error ? error.message : 'Impossibile salvare la certificazione BIO');
    } finally {
      setBioSaving(false);
    }
  }, [bioCertification?.id, gardenId]);

  const certifications = useMemo(() => [
    {
      id: 'bio',
      name: 'Certificazione Biologica',
      description: 'EU 2018/848 - Produzione biologica',
      icon: Leaf,
      color: 'green',
      progress: bioCertification?.complianceScore || 0,
      status: bioCertification ? (bioCertification.status === 'approved' ? 'completed' : 'in_progress') : 'not_started',
      benefits: ['Accesso mercato BIO', 'Miglior posizionamento commerciale dei lotti conformi', 'Sostenibilità ambientale']
    },
    {
      id: 'globalgap',
      name: 'GlobalG.A.P. IFA',
      description: 'Standard internazionale GAP',
      icon: Shield,
      color: 'blue',
      progress: 45,
      status: 'in_progress',
      benefits: ['Export internazionale', 'GDO requirement', 'Sicurezza alimentare']
    },
    {
      id: 'sqnpi',
      name: 'SQNPI',
      description: 'Sistema Qualità Nazionale Produzione Integrata',
      icon: Award,
      color: 'purple',
      progress: 0,
      status: 'not_started',
      benefits: ['Marchio nazionale', 'Riduzione input', 'Sostenibilità']
    },
    {
      id: 'grasp',
      name: 'GRASP',
      description: 'Risk Assessment on Social Practice',
      icon: FileText,
      color: 'orange',
      progress: 0,
      status: 'not_started',
      benefits: ['Responsabilità sociale', 'Diritti lavoratori', 'Etica aziendale']
    }
  ], [bioCertification]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'not_started': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'Completata';
      case 'in_progress': return 'In Corso';
      case 'not_started': return 'Non Iniziata';
      default: return 'Sconosciuto';
    }
  }, []);

  const getColorClasses = useCallback((color: string, type: 'bg' | 'text' | 'progress') => {
    const colorMap = {
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        progress: 'bg-green-600'
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        progress: 'bg-blue-600'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        progress: 'bg-purple-600'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        progress: 'bg-orange-600'
      }
    };
    return colorMap[color as keyof typeof colorMap]?.[type] || 'bg-gray-100';
  }, []);

  const getCertificationCardClasses = useCallback((status: string) => {
    const baseClasses = 'border-2 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer';
    switch (status) {
      case 'completed': return `${baseClasses} border-green-300 bg-green-50`;
      case 'in_progress': return `${baseClasses} border-yellow-300 bg-yellow-50`;
      default: return `${baseClasses} border-gray-200 bg-white`;
    }
  }, []);

  const getTabClasses = useCallback((isActive: boolean) => {
    const baseClasses = 'flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap';
    return isActive 
      ? `${baseClasses} border-green-500 text-green-600`
      : `${baseClasses} border-transparent text-gray-500 hover:text-gray-700`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificazioni</h1>
            <p className="text-gray-600">Gestione certificazioni e compliance aziendale</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Certificazioni Attive</p>
                <p className="text-2xl font-bold text-green-700">
                  {certifications.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">In Corso</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {certifications.filter(c => c.status === 'in_progress').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Disponibili</p>
                <p className="text-2xl font-bold text-blue-700">
                  {certifications.length}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Progresso Medio</p>
                <p className="text-2xl font-bold text-purple-700">
                  {Math.round(certifications.reduce((acc, c) => acc + c.progress, 0) / certifications.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={getTabClasses(activeTab === 'overview')}
            >
              <Shield size={16} />
              Panoramica
            </button>
            {certifications.map((cert) => (
              <button
                key={cert.id}
                onClick={() => setActiveTab(cert.id as CertificationType)}
                className={getTabClasses(activeTab === cert.id)}
              >
                <cert.icon size={16} />
                {cert.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Certificazioni Disponibili</h2>
                <p className="text-gray-600 mb-6">
                  Seleziona una certificazione per iniziare il processo di compliance
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className={getCertificationCardClasses(cert.status)}
                    onClick={() => setActiveTab(cert.id as CertificationType)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={getColorClasses(cert.color, 'bg') + ' p-3 rounded-lg'}>
                          <cert.icon className={getColorClasses(cert.color, 'text') + ' h-6 w-6'} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                          <p className="text-sm text-gray-600">{cert.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cert.status)}`}>
                        {getStatusText(cert.status)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progresso</span>
                        <span>{cert.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={getColorClasses(cert.color, 'progress') + ' h-2 rounded-full transition-all duration-500'}
                          style={{ width: `${cert.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Vantaggi:</p>
                      <ul className="space-y-1">
                        {cert.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle size={14} className={getColorClasses(cert.color, 'text') + ' mt-0.5 flex-shrink-0'} />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BIO Tab */}
          {activeTab === 'bio' && (
            bioLoading ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                Caricamento certificazione BIO...
              </div>
            ) : (
              <BioCertificationForm
                gardenId={gardenId}
                initialData={bioCertification}
                isSaving={bioSaving}
                saveError={bioError}
                saveMessage={bioMessage}
                onSave={handleBioSave}
              />
            )
          )}

          {/* GlobalGAP Tab */}
          {activeTab === 'globalgap' && (
            <GlobalGapDashboard gardenId={gardenId} />
          )}

          {/* SQNPI Tab */}
          {activeTab === 'sqnpi' && (
            <div className="text-center py-12">
              <Award className="mx-auto h-16 w-16 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                SQNPI - In Sviluppo
              </h3>
              <p className="text-gray-600 mb-4">
                Il modulo per la certificazione SQNPI sarà disponibile a breve
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                <h4 className="font-semibold text-purple-900 mb-2">Cos'è SQNPI?</h4>
                <p className="text-sm text-purple-800 mb-3">
                  Il Sistema di Qualità Nazionale di Produzione Integrata è uno standard italiano
                  che certifica l'adozione di pratiche agricole sostenibili.
                </p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Riduzione uso pesticidi e fertilizzanti</li>
                  <li>• Tecniche agronomiche sostenibili</li>
                  <li>• Monitoraggio e registrazione operazioni</li>
                  <li>• Marchio riconosciuto a livello nazionale</li>
                </ul>
              </div>
            </div>
          )}

          {/* GRASP Tab */}
          {activeTab === 'grasp' && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                GRASP - In Sviluppo
              </h3>
              <p className="text-gray-600 mb-4">
                Il modulo per la certificazione GRASP sarà disponibile a breve
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                <h4 className="font-semibold text-orange-900 mb-2">Cos'è GRASP?</h4>
                <p className="text-sm text-orange-800 mb-3">
                  GRASP (GLOBALG.A.P. Risk Assessment on Social Practice) è un modulo aggiuntivo
                  che valuta le pratiche sociali in azienda.
                </p>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Diritti dei lavoratori</li>
                  <li>• Salute e sicurezza sul lavoro</li>
                  <li>• Condizioni di lavoro eque</li>
                  <li>• Responsabilità sociale d'impresa</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationsDashboard;
