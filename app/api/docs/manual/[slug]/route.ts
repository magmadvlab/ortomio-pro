import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Security: only allow alphanumeric, hyphens, and numbers
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'docs', 'manual', `${slug}.md`);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Documentation not found' }, { status: 404 });
    }
    
    const content = readFileSync(filePath, 'utf-8');
    
    return NextResponse.json({ content, slug });
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}