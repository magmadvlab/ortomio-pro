import { notFound } from 'next/navigation';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Suspense } from 'react';
import Link from 'next/link';

interface DocPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getDocContent(slug: string) {
  try {
    // Security: only allow alphanumeric, hyphens, and numbers
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return null;
    }

    const filePath = join(process.cwd(), 'docs', 'manual', `${slug}.md`);

    if (!existsSync(filePath)) {
      return null;
    }

    const content = readFileSync(filePath, 'utf-8');

    return content;
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return null;
  }
}

function parseMarkdown(content: string) {
  // Simple markdown parsing for headers and basic formatting
  return content
    .split('\n')
    .map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl sm:text-2xl font-semibold mb-3 text-gray-800 mt-6">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg sm:text-xl font-medium mb-2 text-gray-700 mt-4">{line.substring(4)}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={index} className="text-base sm:text-lg font-medium mb-2 text-gray-600 mt-3">{line.substring(5)}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1 text-sm sm:text-base">{line.substring(2)}</li>;
      }
      if (line.startsWith('  - ')) {
        return <li key={index} className="ml-8 mb-1 text-sm sm:text-base text-gray-600">{line.substring(4)}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="mb-2 font-semibold text-gray-800 text-sm sm:text-base">{line.slice(2, -2)}</p>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2 text-gray-700 leading-relaxed text-sm sm:text-base">{line}</p>;
    });
}

async function DocContent({ slug }: { slug: string }) {
  const content = await getDocContent(slug);

  if (!content) {
    notFound();
  }

  const parsedContent = parseMarkdown(content);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con pulsante indietro - sticky su mobile */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:relative sm:bg-transparent sm:border-0 sm:py-0">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/app/help"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Torna al Manuale
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
          <div className="prose prose-sm sm:prose-lg max-w-none">
            {parsedContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento documentazione...</p>
        </div>
      </div>
    }>
      <DocContent slug={slug} />
    </Suspense>
  );
}

// Generate static params for all documentation files
export async function generateStaticParams() {
  try {
    const docsDir = join(process.cwd(), 'docs', 'manual');
    const files = require('fs').readdirSync(docsDir);
    
    return files
      .filter((file: string) => file.endsWith('.md') && file !== 'README.md')
      .map((file: string) => ({
        slug: file.replace('.md', '')
      }));
  } catch (error) {
    console.error('Error generating static params for docs:', error);
    return [];
  }
}