import { client } from '@/lib/typesense';
import { NextResponse } from 'next/server';
import housesData from '../../../../documents/houses.json';
import { apiService } from '@/lib/apiService';

export const POST = async () => {
  try {
    const housesWithEmbeddings = await Promise.all(
      housesData.houses.map(async (house) => {
        const textContent = `
          Name: ${house.name}. 
          Description:${house.description}.
          Tags: ${house.tags.join(', ')}.
          Price: ${house.price}.
        `;

        const embedding = await apiService.openAiGenerateEmbedding({
          textContent,
        });

        return {
          ...house,
          embedding,
          textContent,
        };
      })
    );

    await client
      .collections('houses')
      .documents()
      .import(housesWithEmbeddings, { action: 'upsert' });

    return NextResponse.json({});
  } catch (error) {
    console.error('Failed to add typesense documents:', error);

    return NextResponse.json(
      { error: 'Failed to add typesense documents' },
      { status: 500 }
    );
  }
};
