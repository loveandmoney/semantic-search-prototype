import { apiService } from '@/lib/apiService';
import { client } from '@/lib/typesense';
import { IHouse, ITypesenseVectorSearchHit } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  const NUMBER_OF_RESULTS = 3;

  const { query } = (await req.json()) as {
    query: string;
  };

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const queryEmbedding = await apiService.openAiGenerateEmbedding({
      textContent: query,
    });

    const { results } = await client.multiSearch.perform<[IHouse]>({
      searches: [
        {
          collection: 'houses',
          q: '*',
          exclude_fields: 'embedding',
          vector_query: `embedding:([${queryEmbedding.join(
            ','
          )}], k:${NUMBER_OF_RESULTS})`,
        },
      ],
    });

    const hits = (results[0].hits ||
      []) as unknown as ITypesenseVectorSearchHit<IHouse>[];

    return NextResponse.json({ results: hits });
  } catch (error) {
    console.error('Failed to perform vector search:', error);

    return NextResponse.json(
      { error: 'Failed to perform vector search' },
      { status: 500 }
    );
  }
};
