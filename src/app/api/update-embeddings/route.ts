import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import {
  INDEX_NAME,
  updatePinecodeIndex,
  verifyPineconeIndexExists,
} from '@/lib/pinecone';
import { promises as fs } from 'fs';
import path from 'path';
import { IDoc, IHouse } from '@/types';

export const POST = async () => {
  const filePath = path.join(process.cwd(), 'documents/houses.json');
  const jsonContent = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(jsonContent) as { houses: IHouse[] };

  const docs: IDoc[] = data.houses.map((house: IHouse) => {
    // Create a single string that includes all relevant fields
    const pageContent = `
      Name: ${house.name}
      Description: ${house.description}
      Price: ${house.price}
      Tags: ${house.tags.join(', ')}
    `;

    return {
      pageContent: pageContent.trim(),
      metadata: house,
    };
  });

  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
  });

  try {
    await verifyPineconeIndexExists(client, INDEX_NAME);
    await updatePinecodeIndex(client, INDEX_NAME, docs);

    return NextResponse.json({
      data: 'Index updated successfully',
    });
  } catch (error) {
    console.error('Error updating Pinecone index:', error);
    return NextResponse.json(
      { error: 'Failed to update Pinecone index' },
      { status: 500 }
    );
  }
};
