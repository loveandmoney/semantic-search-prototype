import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Pinecone } from '@pinecone-database/pinecone';
import { IDoc, IPineconeVector } from '@/types';

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

// Use query to find relevant houses
// export const llmConversationalSearch = async (
//   query: string,
//   conversation: IConversationMessage[],
//   concatenatedHouseOptions: string
// ) => {
//   const mappedConversation = conversation.map((msg) => {
//     if (msg.role === 'user') return new HumanMessage(msg.content);
//     if (msg.role === 'assistant') return new AIMessage(msg.content);
//     return new SystemMessage(msg.content);
//   });

//   const systemInstruction = new SystemMessage(
//     `
//       You are a helpful real estate assistant.
//       From the provided property options, recommend the single best house that matches the user's query.
//       Respond in 1-2 sentences only.
//       Don't make stuff up, for example if they say they want wooden floors, only mention that the matching house has wooden floors if it actually is noted in the tags/options.
//     `
//   );

//   const chatPrompt = ChatPromptTemplate.fromMessages([
//     systemInstruction,
//     ...mappedConversation,
//     new HumanMessage(
//       `Here are some property options relevant to the query:\n${concatenatedHouseOptions}`
//     ),
//     new HumanMessage(query),
//   ]);

//   const llm = new OpenAI({
//     maxTokens: MAX_TOKENS,
//   });

//   const result = await chatPrompt.pipe(llm).invoke({});
//   return result;
// };
