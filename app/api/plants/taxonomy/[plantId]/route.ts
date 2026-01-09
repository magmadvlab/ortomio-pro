import { NextRequest, NextResponse } from 'next/server';
import { getPlantTaxonomy } from '@/services/plantTaxonomyService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ plantId: string }> }
) {
  try {
    const { plantId } = await params;

    if (!plantId) {
      return NextResponse.json(
        { error: 'plant_id_required', message: 'plantId is required' },
        { status: 400 }
      );
    }

    const taxonomy = await getPlantTaxonomy(plantId);

    if (!taxonomy) {
      return NextResponse.json(
        { error: 'plant_not_found', message: `Plant '${plantId}' not found in taxonomy` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      taxonomy,
      plantId
    });
  } catch (error: any) {
    console.error('Plant taxonomy error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

