import { NextResponse, NextRequest } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { EMBEDDING_MODEL, INDEX_NAME, NAMESPACE } from '@/lib/pinecone';
import { IPineconeVectorResponse } from '@/types';
import { OpenAIEmbeddings } from '@langchain/openai';

export const POST = async (req: NextRequest) => {
  const { query, results } = (await req.json()) as {
    query: string;
    results: number;
  };

  try {
    const topMatches = await vectorSearch(query, results);

    return NextResponse.json({ topMatches });
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return NextResponse.json(
      { error: 'Failed to query Pinecone' },
      { status: 500 }
    );
  }
};

const vectorSearch = async (
  query: string,
  results: number
): Promise<IPineconeVectorResponse[]> => {
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
  });

  const index = client.Index(INDEX_NAME);

  const queryEmbedding = await new OpenAIEmbeddings({
    model: EMBEDDING_MODEL,
  }).embedQuery(query);

  const queryResponse = (await index.namespace(NAMESPACE).query({
    topK: results,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  })) as { matches: unknown } as { matches: IPineconeVectorResponse[] };

  if (queryResponse.matches.length === 0) {
    console.log('No matches found.');
    return [];
  }

  return queryResponse.matches;
};
