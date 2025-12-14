'use client';

/**
 * Page Header Component
 * Provides consistent header with optional back and home buttons
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, showBack, showHome }) => {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-green-200 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {(showBack || showHome) && (
          <div className="flex gap-2">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                title="Indietro"
              >
                <ArrowLeft size={20} className="text-green-700" />
              </button>
            )}
            {showHome && (
              <button
                onClick={() => router.push('/app')}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                title="Home"
              >
                <Home size={20} className="text-green-700" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-green-900">{title}</h1>
          {subtitle && <p className="text-sm text-green-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;






