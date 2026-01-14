'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import LocationSelector from '@/components/shared/LocationSelector';
import { 
  Search, 
  Map, 
  Droplets, 
  Sprout,
  MapPin,
  Calendar,
  User,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { ActionType, ActionContext } from './ActionButton';
import { Garden } from '@/types';

export interface InterventionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ActionType;
  context: ActionContext;
  garden: Garden;
  onInterventionCreated: (intervention: InterventionData) => void;
}

export interface InterventionData {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  zoneId?: string;
  zoneName?: string;
  scheduledDate: Date;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  sourceContext: ActionContext;
  parameters: Record<string, any>;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed';
  createdAt: Date;
}

const stepConfig = {
  scouting: [
    { id: 'details', title: 'Dettagli Scouting', icon: Search },
    { id: 'schedule', title: 'Pianificazione', icon: Calendar },
    { id: 'checklist', title: 'Checklist', icon: FileText },
    { id: 'review', title: 'Riepilogo', icon: CheckCircle }
  ],
  prescription: [
    { id: 'details', title: 'Tipo Intervento', icon: Map },
    { id: 'parameters', title: 'Parametri', icon: FileText },
    { id: 'schedule', title: 'Pianificazione', icon: Calendar },
    { id: 'review', title: 'Riepilogo', icon: CheckCircle }
  ],
  irrigation: [
    { id: 'details', title: 'Tipo Irrigazione', icon: Droplets },
    { id: 'parameters', title: 'Parametri Idrici', icon: FileText },
    { id: 'schedule', title: 'Pianificazione', icon: Calendar },
    { id: 'review', title: 'Riepilogo', icon: CheckCircle }
  ],
  treatment: [
    { id: 'details', title: 'Tipo Trattamento', icon: Sprout },
    { id: 'parameters', title: 'Prodotti e Dosi', icon: FileText },
    { id: 'schedule', title: 'Pianificazione', icon: Calendar },
    { id: 'review', title: 'Riepilogo', icon: CheckCircle }
  ]
};

const actionLabels = {
  scouting: 'Scouting Campo',
  prescription: 'Mappa Prescrizione',
  irrigation: 'Irrigazione',
  treatment: 'Trattamento'
};

export default function InterventionWizard({
  isOpen,
  onClose,
  actionType,
  context,
  garden,
  onInterventionCreated
}: InterventionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<InterventionData>>({
    type: actionType,
    priority: context.urgency || 'medium',
    zoneId: context.zoneId,
    zoneName: context.zoneName,
    sourceContext: context,
    status: 'draft',
    parameters: {}
  });

  const steps = stepConfig[actionType] || stepConfig.scouting;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setFormData({
        type: actionType,
        priority: context.urgency || 'medium',
        zoneId: context.zoneId,
        zoneName: context.zoneName,
        sourceContext: context,
        status: 'draft',
        parameters: {}
      });
    }
  }, [isOpen, actionType, context]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const intervention: InterventionData = {
      id: `intervention_${Date.now()}`,
      title: formData.title || `${actionLabels[actionType]} - ${context.zoneName || 'Zona'}`,
      description: formData.description || '',
      scheduledDate: formData.scheduledDate || new Date(),
      assignedTo: formData.assignedTo,
      createdAt: new Date(),
      ...formData
    } as InterventionData;

    onInterventionCreated(intervention);
    onClose();
  };

  const updateFormData = (updates: Partial<InterventionData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Titolo Intervento</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ title: e.target.value })}
                placeholder={`${actionLabels[actionType]} - ${context.zoneName || 'Zona'}`}
                className="mt-2"
              />
            </div>

              <div>
                <Label htmlFor="location">Localizzazione *</Label>
                <LocationSelector
                  garden={garden}
                  selectedZoneId={formData.zoneId}
                  selectedFieldRowId={formData.parameters?.fieldRowId}
                  selectedSectionId={formData.parameters?.sectionId}
                  onLocationChange={(location) => {
                    updateFormData({
                      zoneId: location.zoneId,
                      zoneName: location.zoneName,
                      parameters: {
                        ...formData.parameters,
                        fieldRowId: location.fieldRowId,
                        fieldRowName: location.fieldRowName,
                        sectionId: location.sectionId,
                        sectionName: location.sectionName,
                        fullLocationName: location.fullLocationName
                      }
                    })
                  }}
                  placeholder="Seleziona zona, filare o porzione..."
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Scegli dove eseguire l'operazione: zona intera, filare completo o porzione specifica
                </p>
              </div>

              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e: any) => updateFormData({ description: e.target.value })}
                  placeholder="Descrivi l'intervento da eseguire..."
                  className="mt-2"
                  rows={4}
                />
              </div>

            {actionType === 'scouting' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Obiettivi Scouting</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  {context.sourceType === 'ndvi' && (
                    <p>• Verificare stress vegetativo rilevato da satellite</p>
                  )}
                  {context.sourceType === 'drone' && (
                    <p>• Confermare anomalie identificate da analisi drone</p>
                  )}
                  {context.sourceType === 'iot' && (
                    <p>• Validare alert sensori IoT sul campo</p>
                  )}
                  <p>• Raccogliere campioni se necessario</p>
                  <p>• Documentare con foto georeferenziate</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'parameters':
        return (
          <div className="space-y-6">
            {actionType === 'prescription' && (
              <>
                <div>
                  <Label>Tipo Prescrizione</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {['Fertilizzazione', 'Semina', 'Trattamento', 'Irrigazione'].map((type) => (
                      <Button
                        key={type}
                        variant={formData.parameters?.prescriptionType === type ? 'default' : 'outline'}
                        onClick={() => updateFormData({ 
                          parameters: { ...formData.parameters, prescriptionType: type }
                        })}
                        className="h-12"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetRate">Dose Target (kg/ha o l/ha)</Label>
                  <Input
                    id="targetRate"
                    type="number"
                    value={formData.parameters?.targetRate || ''}
                    onChange={(e: any) => updateFormData({ 
                      parameters: { ...formData.parameters, targetRate: e.target.value }
                    })}
                    placeholder="Es. 150"
                    className="mt-2"
                  />
                </div>
              </>
            )}

            {actionType === 'irrigation' && (
              <>
                <div>
                  <Label htmlFor="waterAmount">Quantità Acqua (mm)</Label>
                  <Input
                    id="waterAmount"
                    type="number"
                    value={formData.parameters?.waterAmount || ''}
                    onChange={(e: any) => updateFormData({ 
                      parameters: { ...formData.parameters, waterAmount: e.target.value }
                    })}
                    placeholder="Es. 25"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Durata (minuti)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.parameters?.duration || ''}
                    onChange={(e: any) => updateFormData({ 
                      parameters: { ...formData.parameters, duration: e.target.value }
                    })}
                    placeholder="Es. 60"
                    className="mt-2"
                  />
                </div>
              </>
            )}

            {actionType === 'treatment' && (
              <>
                <div>
                  <Label htmlFor="product">Prodotto</Label>
                  <Input
                    id="product"
                    value={formData.parameters?.product || ''}
                    onChange={(e: any) => updateFormData({ 
                      parameters: { ...formData.parameters, product: e.target.value }
                    })}
                    placeholder="Nome del prodotto"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="dose">Dose (l/ha o kg/ha)</Label>
                  <Input
                    id="dose"
                    type="number"
                    value={formData.parameters?.dose || ''}
                    onChange={(e: any) => updateFormData({ 
                      parameters: { ...formData.parameters, dose: e.target.value }
                    })}
                    placeholder="Es. 2.5"
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="scheduledDate">Data Pianificata</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate ? 
                  new Date(formData.scheduledDate.getTime() - formData.scheduledDate.getTimezoneOffset() * 60000)
                    .toISOString().slice(0, 16) : ''
                }
                onChange={(e: any) => updateFormData({ 
                  scheduledDate: new Date(e.target.value)
                })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="assignedTo">Assegnato a</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo || ''}
                onChange={(e: any) => updateFormData({ assignedTo: e.target.value })}
                placeholder="Nome operatore"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Priorità</Label>
              <div className="flex gap-2 mt-2">
                {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                  <Button
                    key={priority}
                    variant={formData.priority === priority ? 'default' : 'outline'}
                    onClick={() => updateFormData({ priority })}
                    size="sm"
                  >
                    {priority === 'low' && 'Bassa'}
                    {priority === 'medium' && 'Media'}
                    {priority === 'high' && 'Alta'}
                    {priority === 'critical' && 'Critica'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Checklist Scouting</h4>
            <div className="space-y-3">
              {[
                'Verificare sintomi visibili su foglie',
                'Controllare presenza parassiti',
                'Valutare stress idrico',
                'Documentare con foto',
                'Raccogliere campioni se necessario',
                'Annotare condizioni meteo'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`checklist-${index}`}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`checklist-${index}`} className="text-sm">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Riepilogo Intervento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm text-gray-600">{actionLabels[actionType]}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Titolo</Label>
                  <p className="text-sm text-gray-600">
                    {formData.title || `${actionLabels[actionType]} - ${context.zoneName || 'Zona'}`}
                  </p>
                </div>

                {formData.description && (
                  <div>
                    <Label className="text-sm font-medium">Descrizione</Label>
                    <p className="text-sm text-gray-600">{formData.description}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Localizzazione</Label>
                  <p className="text-sm text-gray-600">
                    {formData.parameters?.fullLocationName || context.zoneName || 'Non specificata'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Data Pianificata</Label>
                  <p className="text-sm text-gray-600">
                    {formData.scheduledDate ? 
                      formData.scheduledDate.toLocaleString('it-IT') : 
                      'Non specificata'
                    }
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priorità</Label>
                  <Badge className={
                    formData.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    formData.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {formData.priority === 'low' && 'Bassa'}
                    {formData.priority === 'medium' && 'Media'}
                    {formData.priority === 'high' && 'Alta'}
                    {formData.priority === 'critical' && 'Critica'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Step non trovato</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Crea {actionLabels[actionType]}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                  ${isActive ? 'border-blue-600 bg-blue-600 text-white' : 
                    isCompleted ? 'border-green-600 bg-green-600 text-white' : 
                    'border-gray-300 bg-white text-gray-400'}
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          <h3 className="text-lg font-medium mb-4">
            {steps[currentStep].title}
          </h3>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Crea Intervento
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Avanti
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}