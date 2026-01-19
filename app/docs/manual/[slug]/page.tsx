import { notFound } from 'next/navigation';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface DocPageProps {
  params: {
    slug: string;
  };
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

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const content = await getDocContent(slug);
  
  if (!content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
              {content}
            </pre>
          </div>
        </div>
      </div>
    </div>
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