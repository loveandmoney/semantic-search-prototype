import { IPineconeVectorResponse, IStreamInitiator } from '@/types';
import { handleStreamResponse } from './streamHandler';

const apiEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;

const endpoint = {
  vectorSearch: `${apiEndpoint}/vector-search`,
  updateEmbeddings: `${apiEndpoint}/update-embeddings`,
  openAiStream: `${apiEndpoint}/openai-stream`,
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
};
