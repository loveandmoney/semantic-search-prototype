import { IPineconeVectorResponse } from '@/types';

const apiEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;

const endpoint = {
  query: `${apiEndpoint}/query`,
  vectorSearchRelevantHouses: `${apiEndpoint}/vector-search-relevant-houses`,
  updateEmbeddings: `${apiEndpoint}/update-embeddings`,
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
  async vectorSearchRelevantHouses({
    query,
    results = 3,
  }: {
    query: string;
    results?: number;
  }) {
    if (!query) {
      throw new Error('Query cannot be empty');
    }

    const response = await fetch(endpoint.vectorSearchRelevantHouses, {
      method: 'POST',
      body: JSON.stringify({ query, results }),
    });

    const json = (await response.json()) as {
      relevantHouses: IPineconeVectorResponse[];
    };
    return json;
  },
};
