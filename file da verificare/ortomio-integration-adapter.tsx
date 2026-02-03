'use client';

import React from 'react';

// Adapter per i componenti UI di OrtoMio
// Questo file mappa i componenti UI che abbiamo usato con quelli esistenti in OrtoMio

// Import dei componenti UI esistenti di OrtoMio
import Button from '/Users/magma/Downloads/ortomio-main/components/ui/Button';
import Card from '/Users/magma/Downloads/ortomio-main/components/ui/Card';
import Input from '/Users/magma/Downloads/ortomio-main/components/ui/Input';

// Adapter per Badge (se non esiste in OrtoMio)
export const Badge = ({ children, variant = 'default', className = '' }: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700',
    secondary: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Adapter per Progress (se non esiste in OrtoMio)
export const Progress = ({ value, className = '' }: {
  value: number;
  className?: string;
}) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// Adapter per Separator (se non esiste in OrtoMio)
export const Separator = ({ className = '' }: { className?: string }) => {
  return <hr className={`border-gray-200 ${className}`} />;
};

// Adapter per Tabs (se non esiste in OrtoMio)
export const Tabs = ({ children, defaultValue, value, onValueChange }: {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '');
  
  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className="tabs-container" data-active-tab={activeTab}>
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { activeTab, onTabChange: handleTabChange })
          : child
      )}
    </div>
  );
};

export const TabsList = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ children, value, activeTab, onTabChange }: {
  children: React.ReactNode;
  value: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}) => {
  const isActive = activeTab === value;
  
  return (
    <button
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
      onClick={() => onTabChange?.(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, value, activeTab }: {
  children: React.ReactNode;
  value: string;
  activeTab?: string;
}) => {
  if (activeTab !== value) return null;
  
  return <div className="mt-4">{children}</div>;
};

// Re-export dei componenti OrtoMio esistenti
export { Button, Card, Input };

// Adapter per CardHeader, CardContent, CardTitle (se Card non li include)
export const CardHeader = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`p-4 pb-2 ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = '', pt }: {
  children: React.ReactNode;
  className?: string;
  pt?: number;
}) => {
  const paddingClass = pt ? `pt-${pt}` : 'p-4';
  return <div className={`${paddingClass} ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
};