import { client } from '@/lib/typesense';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
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
    const results = await client.collections('houses').documents().search({
      q: query,
      query_by: 'name,description,tags',
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Failed to search typesense collection:', error);

    return NextResponse.json(
      { error: 'Failed to search typesense collection' },
      { status: 500 }
    );
  }
};
