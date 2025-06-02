import { OpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { Pinecone } from '@pinecone-database/pinecone';
import { IDoc, IPineconeVector } from '@/types';

export const INDEX_NAME = 'test-houses';
const NAMESPACE = 'default';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const TOP_K = 10;
const MAX_TOKENS = 100;

export const verifyPineconeIndexExists = async (
  client: Pinecone,
  indexName: string
) => {
  const { indexes: existingIndexes } = await client.listIndexes();

  if (
    !existingIndexes ||
    !existingIndexes.some((index) => index.name === indexName)
  ) {
    throw new Error(
      `Index ${indexName} does not exist. Please create the index first.`
    );
  }

  console.log(`Index ${indexName} exists.`);
};

export const updatePinecodeIndex = async (
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
          id: doc.metadata.id,
          imageUrl: doc.metadata.imageUrl,
          pageContent: chunk.pageContent,
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

export const queryPineconeVectorStoreAndQueryLLM = async (
  client: Pinecone,
  indexName: string,
  query: string
) => {
  console.log('Querying Pinecone vector store...');

  const index = client.Index(indexName);
  console.log(`Index retrieved: ${indexName}`);

  const queryEmbedding = await new OpenAIEmbeddings({
    model: EMBEDDING_MODEL,
  }).embedQuery(query);

  const queryResponse = await index.namespace(NAMESPACE).query({
    topK: TOP_K,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  });

  if (queryResponse.matches.length === 0) {
    console.log('No matches found.');
    return [];
  }

  console.log(`Found ${queryResponse.matches.length} matches.`);

  const llm = new OpenAI({
    maxTokens: MAX_TOKENS,
  });
  const chain = loadQAStuffChain(llm);
  const concatenatedPageContent = queryResponse.matches
    .map((match) => match.metadata?.pageContent || '')
    .join(' ');

  const result = await chain.invoke({
    input_documents: [
      new Document({
        pageContent: concatenatedPageContent,
      }),
    ],
    question: `You are a helpful real-estate assistant. Be concise. Answer the user's query: ${query}`,
  });

  return result.text;
};
