import { NextRequest, NextResponse } from 'next/server';
import { fuzzySearchPlant } from '@/services/plantFuzzySearchService';
import { ArchetypeId } from '@/types/archetypes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, locale = 'it', archetypeId } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'query_required', message: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Valida archetypeId se fornito
    if (archetypeId && typeof archetypeId !== 'string') {
      return NextResponse.json(
        { error: 'invalid_archetype_id', message: 'archetypeId must be a string' },
        { status: 400 }
      );
    }

    const results = await fuzzySearchPlant(
      query,
      locale,
      archetypeId as ArchetypeId | undefined
    );

    return NextResponse.json({
      results,
      count: results.length,
      query,
      locale,
      archetypeId: archetypeId || null
    });
  } catch (error: any) {
    console.error('Plant search error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

