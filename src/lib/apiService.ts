const apiEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;

const endpoint = {
  query: `${apiEndpoint}/query`,
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
  async query({ query }: { query: string }) {
    if (!query) {
      throw new Error('Query cannot be empty');
    }

    const response = await fetch(endpoint.query, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });

    const json = await response.json();
    return json;
  },
};
