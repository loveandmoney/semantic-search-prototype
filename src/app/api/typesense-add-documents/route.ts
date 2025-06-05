import { client } from '@/lib/typesense';
import { NextResponse } from 'next/server';
import housesData from '../../../../documents/houses.json';

export const POST = async () => {
  try {
    await client.collections('houses').documents().import(housesData.houses);

    return NextResponse.json({});
  } catch (error) {
    console.error('Failed to add typesense documents:', error);

    return NextResponse.json(
      { error: 'Failed to add typesense documents' },
      { status: 500 }
    );
  }
};
