import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import {
  EMBEDDING_MODEL,
  INDEX_NAME,
  NAMESPACE,
  verifyPineconeIndexExists,
} from '@/lib/pinecone';
import { promises as fs } from 'fs';
import path from 'path';
import { IDoc, IHouse, IPineconeVector } from '@/types';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';

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

const updatePinecodeIndex = async (
  client: Pinecone,
  indexName: string,
  documents: IDoc[]
) => {
  const index = client.Index(indexName);
  console.log(`Index retrieved: ${indexName}`);

  for (const doc of documents) {
    console.log(`Indexing document with ID: ${doc.metadata.id}`);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const chunks = await textSplitter.createDocuments([doc.pageContent]);
    console.log(`Number of chunks created: ${chunks.length}`);

    console.log(
      `Calling OpenAIEmbeddings to generate embeddings for ${chunks.length} chunks...`
    );
    const embeddingsArray = await new OpenAIEmbeddings({
      model: EMBEDDING_MODEL,
    }).embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' '))
    );

    console.log(`Embeddings generated for ${chunks.length} chunks.`);

    console.log(`Creating ${chunks.length} vectors array...`);

    const BATCH_SIZE = 100;
    let batch: IPineconeVector[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);

      const chunk = chunks[i];
      const vector = {
        id: `${doc.metadata.id}_${i}`,
        values: embeddingsArray[i],
        metadata: {
          pageContent: chunk.pageContent,
          ...doc.metadata,
        },
      };

      batch.push(vector);

      if (batch.length === BATCH_SIZE || i === chunks.length - 1) {
        console.log(`Upserting batch of ${batch.length} vectors...`);
        await index.namespace(NAMESPACE).upsert(batch);
        console.log(`Batch upserted successfully.`);
        batch = [];
      }
    }
  }
};
