'use client';

/**
 * Help Section Component
 * Renders markdown-like content for help sections
 */

import React from 'react';

interface HelpSectionProps {
  title: string;
  content: string | React.ReactNode;
  id?: string;
}

const HelpSection: React.FC<HelpSectionProps> = ({ title, content, id }) => {
  return (
    <section id={id} className="mb-8 scroll-mt-20">
      <h2 className="text-2xl font-bold text-green-900 mb-4 pb-2 border-b border-green-200">
        {title}
      </h2>
      <div className="prose prose-green max-w-none">
        {typeof content === 'string' ? (
          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
            {content}
          </div>
        ) : (
          content
        )}
      </div>
    </section>
  );
};

export default HelpSection;






