import {
  IChatMessage,
  IHouse,
  IPineconeVectorResponse,
  IStreamInitiator,
} from '@/types';
import { handleStreamResponse } from './streamHandler';
import {
  SearchResponse,
  SearchResponseHit,
} from 'typesense/lib/Typesense/Documents';

const apiEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;

const endpoint = {
  vectorSearch: `${apiEndpoint}/vector-search`,
  updateEmbeddings: `${apiEndpoint}/update-embeddings`,
  openAiStream: `${apiEndpoint}/openai-stream`,
  openAi: `${apiEndpoint}/openai`,
  openAiGenerateEmbedding: `${apiEndpoint}/openai-generate-embedding`,
  typesenseCreateCollection: `${apiEndpoint}/typesense-create-collection`,
  typesenseAddDocuments: `${apiEndpoint}/typesense-add-documents`,
  typesenseSearchCollection: `${apiEndpoint}/typesense-search-collection`,
  typesenseVectorSearchCollection: `${apiEndpoint}/typesense-vector-search-collection`,
};

export const apiService = {
  async updateEmbeddings() {
    const response = await fetch(endpoint.updateEmbeddings, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Error creating index and embeddings');
    }

    const json = await response.json();
    return json;
  },
  async vectorSearch({
    query,
    results = 3,
  }: {
    query: string;
    results?: number;
  }) {
    if (!query) {
      throw new Error('Query cannot be empty');
    }

    const response = await fetch(endpoint.vectorSearch, {
      method: 'POST',
      body: JSON.stringify({ query, results }),
    });

    const json = (await response.json()) as {
      topMatches: IPineconeVectorResponse[];
    };
    return json;
  },
  async openAiStream({
    onContent,
    onComplete,
    conversation,
  }: IStreamInitiator) {
    console.log('openAiStream called with conversation:', conversation);

    const response = await fetch(endpoint.openAiStream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    await handleStreamResponse({ response, onContent, onComplete });
  },
  async openAi({
    conversation,
  }: {
    conversation: IChatMessage[];
  }): Promise<string> {
    const response = await fetch(endpoint.openAi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI response');
    }

    const data = await response.json();
    return data.content ?? '';
  },
  async typesenseCreateCollection(): Promise<void> {
    const response = await fetch(endpoint.typesenseCreateCollection, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create Typesense collection');
    }
  },
  async typesenseAddDocuments(): Promise<void> {
    const response = await fetch(endpoint.typesenseAddDocuments, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to add Typesense documents');
    }
  },
  async typesenseSearchCollection({
    query,
  }: {
    query: string;
  }): Promise<SearchResponseHit<IHouse>[]> {
    const response = await fetch(endpoint.typesenseSearchCollection, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to add Typesense documents');
    }

    const { results } = (await response.json()) as {
      results: SearchResponse<IHouse>;
    };

    return results.hits || [];
  },
  async typesenseVectorSearchCollection({
    query,
  }: {
    query: string;
  }): Promise<SearchResponseHit<IHouse>[]> {
    const response = await fetch(endpoint.typesenseVectorSearchCollection, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to perform vector search');
    }

    const { results } = (await response.json()) as {
      results: SearchResponseHit<IHouse>[];
    };

    return results;
  },
  async openAiGenerateEmbedding({
    textContent,
  }: {
    textContent: string;
  }): Promise<number[]> {
    const response = await fetch(endpoint.openAiGenerateEmbedding, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate OpenAI embedding');
    }

    const { embedding } = (await response.json()) as { embedding: number[] };

    return embedding;
  },
};
