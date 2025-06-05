import { client } from '@/lib/typesense';
import { NextResponse } from 'next/server';

export const POST = async () => {
  try {
    await client.collections().create({
      name: 'houses',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'price', type: 'int32' },
        { name: 'tags', type: 'string[]', facet: true },
      ],
      default_sorting_field: 'price',
    });

    return NextResponse.json({});
  } catch (error) {
    console.error('Failed to create typesense collection:', error);

    return NextResponse.json(
      { error: 'Failed to create typesense collection' },
      { status: 500 }
    );
  }
};
