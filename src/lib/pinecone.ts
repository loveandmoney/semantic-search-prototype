import { Pinecone } from '@pinecone-database/pinecone';

export const INDEX_NAME = 'test-houses';
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const NAMESPACE = 'default';
export const MAX_TOKENS = 100;

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
