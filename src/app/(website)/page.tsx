'use client';

import { HouseTile } from '@/components/HouseTile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';
import { IPineconeVectorResponse } from '@/types';
import { useState } from 'react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [relevantHouses, setRelevantHouses] = useState<
    IPineconeVectorResponse[]
  >([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuerySubmit();
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      return;
    }

    setRelevantHouses([]);
    setIsLoading(true);
    setSearchedQuery(query);

    try {
      const { results } = await apiService.vectorSearch({
        query,
      });
      setRelevantHouses(results);
    } catch (error) {
      console.error('Error sending query:', error);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const topHouse = relevantHouses[0];
  const otherHouses = relevantHouses.slice(1);

  return (
    <main className="space-y-6 max-w-[600px] m-auto">
      <h1 className="text-2xl font-bold">Semantic Search</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Describe your dream home"
          value={query}
          disabled={isLoading}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Button disabled={isLoading} onClick={handleQuerySubmit}>
          Ask AI
        </Button>
      </form>

      {!isLoading && searchedQuery && topHouse && (
        <div className="space-y-2">
          <h2 className="font-bold">
            Picked for you based on your search &quot;{searchedQuery}&quot;
          </h2>
          <HouseTile house={topHouse.metadata} matchScore={topHouse.score} />
        </div>
      )}

      {otherHouses?.[0] && (
        <div className="space-y-2">
          <h2 className="font-bold">You might also like</h2>
          <div className="grid grid-cols-2 gap-4">
            {otherHouses.map((house) => (
              <HouseTile
                key={house.id}
                house={house.metadata}
                matchScore={house.score}
              />
            ))}
          </div>
        </div>
      )}

      {isLoading && <div className="text-center text-gray-500">Loading...</div>}
    </main>
  );
}
