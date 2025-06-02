import { NextResponse, NextRequest } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import {
  queryPineconeVectorStoreAndQueryLLM,
  INDEX_NAME,
} from '@/lib/pinecone';

export const POST = async (req: NextRequest) => {
  const { query } = (await req.json()) as { query: string };
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
  });

  try {
    const text = await queryPineconeVectorStoreAndQueryLLM(
      client,
      INDEX_NAME,
      query
    );

    return NextResponse.json({ data: text });
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return NextResponse.json(
      { error: 'Failed to query Pinecone' },
      { status: 500 }
    );
  }
};
