'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Zap, 
  Search, 
  Map, 
  Droplets, 
  Sprout,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface ActionButtonProps {
  sourceType: 'ndvi' | 'drone' | 'iot';
  sourceData: any;
  zoneId?: string;
  zoneName?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  onActionSelected: (actionType: ActionType, context: ActionContext) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export type ActionType = 'scouting' | 'prescription' | 'irrigation' | 'treatment';

export interface ActionContext {
  sourceType: 'ndvi' | 'drone' | 'iot';
  sourceData: any;
  zoneId?: string;
  zoneName?: string;
  timestamp: Date;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

const actionConfig = {
  scouting: {
    icon: Search,
    label: 'Scouting Campo',
    description: 'Verifica sul campo',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  prescription: {
    icon: Map,
    label: 'Mappa Prescrizione',
    description: 'Crea intervento zonale',
    color: 'bg-green-500 hover:bg-green-600'
  },
  irrigation: {
    icon: Droplets,
    label: 'Irrigazione',
    description: 'Gestione idrica',
    color: 'bg-cyan-500 hover:bg-cyan-600'
  },
  treatment: {
    icon: Sprout,
    label: 'Trattamento',
    description: 'Nutrizione/Fitosanitario',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
};

const urgencyConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Bassa' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Media' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
  critical: { color: 'bg-red-100 text-red-800', label: 'Critica' }
};

const sourceTypeLabels = {
  ndvi: 'NDVI Satellite',
  drone: 'Drone Analysis',
  iot: 'Smart Sensors'
};

export default function ActionButton({
  sourceType,
  sourceData,
  zoneId,
  zoneName,
  urgency = 'medium',
  onActionSelected,
  className = '',
  size = 'md'
}: ActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleActionSelect = (actionType: ActionType) => {
    const context: ActionContext = {
      sourceType,
      sourceData,
      zoneId,
      zoneName,
      timestamp: new Date(),
      urgency
    };

    onActionSelected(actionType, context);
    setIsOpen(false);
  };

  const getRecommendedActions = (): ActionType[] => {
    // Logica per raccomandare azioni basate sul tipo di sorgente
    switch (sourceType) {
      case 'ndvi':
        return ['scouting', 'prescription', 'treatment'];
      case 'drone':
        return ['scouting', 'prescription'];
      case 'iot':
        return ['irrigation', 'scouting'];
      default:
        return ['scouting'];
    }
  };

  const recommendedActions = getRecommendedActions();
  const buttonSizeClass = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }[size];

  const urgencyBadge = urgencyConfig[urgency];

  return (
    <div className={`relative ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="default"
            className={`${buttonSizeClass} bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Crea Intervento
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-80 p-4 bg-white border border-gray-200 shadow-xl rounded-lg"
        >
          {/* Header con info contesto */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {sourceTypeLabels[sourceType]}
              </span>
              <Badge className={urgencyBadge.color}>
                {urgencyBadge.label}
              </Badge>
            </div>
            {zoneName && (
              <p className="text-xs text-gray-600">
                Zona: {zoneName}
              </p>
            )}
            {sourceType === 'ndvi' && sourceData?.ndvi_value && (
              <p className="text-xs text-gray-600">
                NDVI: {sourceData.ndvi_value.toFixed(3)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Azioni Consigliate:
            </p>
            
            {recommendedActions.map((actionType) => {
              const config = actionConfig[actionType];
              const Icon = config.icon;
              
              return (
                <DropdownMenuItem
                  key={actionType}
                  onClick={() => handleActionSelect(actionType)}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`p-2 rounded-lg ${config.color} mr-3`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-600">
                      {config.description}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className="my-3" />

            {/* Azioni aggiuntive */}
            <p className="text-sm font-medium text-gray-700 mb-2">
              Altre Azioni:
            </p>
            
            {Object.entries(actionConfig)
              .filter(([actionType]) => !recommendedActions.includes(actionType as ActionType))
              .map(([actionType, config]) => {
                const Icon = config.icon;
                
                return (
                  <DropdownMenuItem
                    key={actionType}
                    onClick={() => handleActionSelect(actionType as ActionType)}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors opacity-75"
                  >
                    <div className={`p-1.5 rounded-lg ${config.color} mr-3`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {config.label}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
          </div>

          {/* Footer con info urgenza */}
          {urgency === 'critical' && (
            <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-xs text-red-700">
                Intervento urgente richiesto
              </span>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}