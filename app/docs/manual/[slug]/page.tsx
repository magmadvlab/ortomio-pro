import { notFound } from 'next/navigation';
import { readFileSync, existsSync, readdirSync } from 'fs';
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

// Parse inline markdown (bold, italic, links, code)
function parseInlineMarkdown(text: string): React.ReactNode {
  // Skip lines that are just markdown links to other files (navigation)
  if (/^\[.*\]\(\.\/.*\.md\)$/.test(text.trim())) {
    return null; // Hide internal navigation links
  }

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Check for markdown link [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    // Check for bold **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Check for italic *text* (not bold)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    // Check for inline code `code`
    const codeMatch = remaining.match(/`([^`]+)`/);

    // Find the earliest match
    const matches = [
      linkMatch ? { type: 'link', match: linkMatch, index: remaining.indexOf(linkMatch[0]) } : null,
      boldMatch ? { type: 'bold', match: boldMatch, index: remaining.indexOf(boldMatch[0]) } : null,
      italicMatch ? { type: 'italic', match: italicMatch, index: remaining.indexOf(italicMatch[0]) } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: remaining.indexOf(codeMatch[0]) } : null,
    ].filter(m => m !== null) as { type: string; match: RegExpMatchArray; index: number }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    // Sort by index to get the earliest match
    matches.sort((a, b) => a.index - b.index);
    const earliest = matches[0];

    // Add text before the match
    if (earliest.index > 0) {
      parts.push(remaining.substring(0, earliest.index));
    }

    // Add the formatted element
    switch (earliest.type) {
      case 'link':
        // Skip internal .md links
        if (!earliest.match[2].endsWith('.md')) {
          parts.push(
            <a key={`link-${keyIndex++}`} href={earliest.match[2]} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {earliest.match[1]}
            </a>
          );
        }
        break;
      case 'bold':
        parts.push(<strong key={`bold-${keyIndex++}`} className="font-semibold text-gray-900">{earliest.match[1]}</strong>);
        break;
      case 'italic':
        parts.push(<em key={`italic-${keyIndex++}`} className="italic">{earliest.match[1]}</em>);
        break;
      case 'code':
        parts.push(<code key={`code-${keyIndex++}`} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">{earliest.match[1]}</code>);
        break;
    }

    remaining = remaining.substring(earliest.index + earliest.match[0].length);
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

function parseMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc list-inside space-y-1 mb-4 ml-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    // Skip horizontal rules
    if (line.trim() === '---' || line.trim() === '***') {
      flushList(index);
      elements.push(<hr key={index} className="my-6 border-gray-200" />);
      return;
    }

    // Skip navigation links like [← Torna all'Indice](./README.md)
    if (/^\[.*\]\(\.\/.*\.md\)$/.test(line.trim())) {
      return;
    }

    // Headers
    if (line.startsWith('# ')) {
      flushList(index);
      const headerText = line.substring(2);
      elements.push(
        <h1 key={index} className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
          {parseInlineMarkdown(headerText)}
        </h1>
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList(index);
      const headerText = line.substring(3);
      elements.push(
        <h2 key={index} className="text-xl sm:text-2xl font-semibold mb-3 text-gray-800 mt-8">
          {parseInlineMarkdown(headerText)}
        </h2>
      );
      return;
    }
    if (line.startsWith('### ')) {
      flushList(index);
      const headerText = line.substring(4);
      elements.push(
        <h3 key={index} className="text-lg sm:text-xl font-medium mb-2 text-gray-700 mt-6">
          {parseInlineMarkdown(headerText)}
        </h3>
      );
      return;
    }
    if (line.startsWith('#### ')) {
      flushList(index);
      const headerText = line.substring(5);
      elements.push(
        <h4 key={index} className="text-base sm:text-lg font-medium mb-2 text-gray-600 mt-4">
          {parseInlineMarkdown(headerText)}
        </h4>
      );
      return;
    }

    // List items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const itemText = line.substring(2);
      listItems.push(
        <li key={index} className="text-sm sm:text-base text-gray-700">
          {parseInlineMarkdown(itemText)}
        </li>
      );
      return;
    }

    // Nested list items
    if (line.startsWith('  - ') || line.startsWith('  * ')) {
      const itemText = line.substring(4);
      listItems.push(
        <li key={index} className="text-sm sm:text-base text-gray-600 ml-4">
          {parseInlineMarkdown(itemText)}
        </li>
      );
      return;
    }

    // Empty line
    if (line.trim() === '') {
      flushList(index);
      return;
    }

    // Regular paragraph
    flushList(index);
    const parsedLine = parseInlineMarkdown(line);
    if (parsedLine) {
      elements.push(
        <p key={index} className="mb-3 text-gray-700 leading-relaxed text-sm sm:text-base">
          {parsedLine}
        </p>
      );
    }
  });

  // Flush any remaining list
  flushList(lines.length);

  return elements;
}

async function DocContent({ slug }: { slug: string }) {
  const content = await getDocContent(slug);

  if (!content) {
    notFound();
  }

  const parsedContent = parseMarkdown(content);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header sticky con pulsante indietro e X per chiudere */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/app/help"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Torna al Manuale</span>
            <span className="sm:hidden">Indietro</span>
          </Link>

          {/* Pulsante X per chiudere */}
          <Link
            href="/app/help"
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Chiudi"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 pb-20">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
          <article className="max-w-none">
            {parsedContent}
          </article>
        </div>
      </div>

      {/* Bottom floating close button for mobile */}
      <div className="fixed bottom-4 right-4 sm:hidden">
        <Link
          href="/app/help"
          className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          aria-label="Chiudi e torna al manuale"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
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
    const files = readdirSync(docsDir);

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
