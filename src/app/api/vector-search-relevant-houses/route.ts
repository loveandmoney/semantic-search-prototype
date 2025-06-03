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
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
  });

  try {
    const relevantHouses = await vectorSearchRelevantHouses(
      client,
      INDEX_NAME,
      query,
      results
    );

    return NextResponse.json({ relevantHouses });
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return NextResponse.json(
      { error: 'Failed to query Pinecone' },
      { status: 500 }
    );
  }
};

const vectorSearchRelevantHouses = async (
  client: Pinecone,
  indexName: string,
  query: string,
  results: number
): Promise<IPineconeVectorResponse[]> => {
  const index = client.Index(indexName);

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
