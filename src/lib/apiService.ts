import {
  IChatMessage,
  IGeoJsonFeatureCollection,
  IHouseWithTextContent,
  IStreamInitiator,
  ITypesenseVectorSearchHit,
} from '@/types';
import { handleStreamResponse } from './streamHandler';
import {
  SearchResponse,
  SearchResponseHit,
} from 'typesense/lib/Typesense/Documents';

const apiEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;

const endpoint = {
  openAiStream: `${apiEndpoint}/openai-stream`,
  openAi: `${apiEndpoint}/openai`,
  openAiGenerateEmbedding: `${apiEndpoint}/openai-generate-embedding`,
  typesenseCreateCollection: `${apiEndpoint}/typesense-create-collection`,
  typesenseAddDocuments: `${apiEndpoint}/typesense-add-documents`,
  typesenseSearchCollection: `${apiEndpoint}/typesense-search-collection`,
  typesenseVectorSearchCollection: `${apiEndpoint}/typesense-vector-search-collection`,
  geoJson: `${apiEndpoint}/geojson`,
};

export const apiService = {
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
  }): Promise<SearchResponseHit<IHouseWithTextContent>[]> {
    const response = await fetch(endpoint.typesenseSearchCollection, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to add Typesense documents');
    }

    const { results } = (await response.json()) as {
      results: SearchResponse<IHouseWithTextContent>;
    };

    return results.hits || [];
  },
  async typesenseVectorSearchCollection({
    query,
  }: {
    query: string;
  }): Promise<ITypesenseVectorSearchHit<IHouseWithTextContent>[]> {
    const response = await fetch(endpoint.typesenseVectorSearchCollection, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to perform vector search');
    }

    const { results } = (await response.json()) as {
      results: ITypesenseVectorSearchHit<IHouseWithTextContent>[];
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
  async geoJson(): Promise<IGeoJsonFeatureCollection> {
    const response = await fetch(endpoint.geoJson);

    if (!response.ok) {
      throw new Error('Failed to fetch GeoJSON');
    }

    return response.json();
  },
};
