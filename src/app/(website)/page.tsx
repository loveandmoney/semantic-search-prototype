'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';
import { useState } from 'react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmbeddings = async () => {
    setIsLoading(true);

    try {
      const data = await apiService.updateEmbeddings();
      console.log(data);
    } catch (error) {
      console.error('Error creating index and embeddings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const json = await apiService.query({ query });
      setResult(json.data);
    } catch (error) {
      console.error('Error sending query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="space-y-4">
      <h1>Semantic Search</h1>
      <Input
        placeholder="Enter query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div>
        <Button disabled={isLoading} onClick={handleQuerySubmit}>
          Ask AI
        </Button>
      </div>

      {isLoading && <p>Loading...</p>}

      {result && <p>{result}</p>}

      <div>
        <Button disabled={isLoading} onClick={handleUpdateEmbeddings}>
          Update embeddings
        </Button>
      </div>
    </main>
  );
}
