'use client';

import { HouseTile } from '@/components/HouseTile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';
import { IHouse } from '@/types';
import clsx from 'clsx';
import { useState } from 'react';
import { SearchResponseHit } from 'typesense/lib/Typesense/Documents';

export default function TypesenseSearchPage() {
  const [searchType, setSearchType] = useState<'keyword' | 'vector'>('keyword');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponseHit<IHouse>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const keywordSearch = async () => {
    try {
      const results = await apiService.typesenseSearchCollection({
        query,
      });
      setResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const vectorSearch = async () => {
    try {
      const results = await apiService.typesenseVectorSearchCollection({
        query,
      });
      setResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    switch (searchType) {
      case 'keyword':
        keywordSearch();
        return; // code block

      case 'vector':
        vectorSearch();
        return;
    }
  };

  return (
    <main className={clsx('space-y-6 m-auto max-w-[600px]')}>
      <h1 className="text-2xl font-bold">Typesense Search</h1>

      <div className="flex gap-2">
        <Button
          onClick={() => setSearchType('keyword')}
          variant={searchType === 'keyword' ? 'default' : 'outline'}
        >
          Keyword
        </Button>
        <Button
          onClick={() => setSearchType('vector')}
          variant={searchType === 'vector' ? 'default' : 'outline'}
        >
          Vector
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Search"
          value={query}
          disabled={isLoading}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Button disabled={isLoading} onClick={handleSubmit}>
          Search
        </Button>
      </form>

      {results?.[0] && (
        <div className="space-y-2">
          <h2 className="font-bold text-lg">Results:</h2>

          <div className="grid grid-cols-3 gap-2">
            {results.map((hit) => (
              <HouseTile house={hit.document} key={hit.document.id} />
            ))}
          </div>
        </div>
      )}

      {/* <div className="space-y-2 p-3 rounded border mt-20">
        <p>Danger zone: proceed with caution</p>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => apiService.typesenseCreateCollection()}>
            Create Collection
          </Button>
          <Button onClick={() => apiService.typesenseAddDocuments()}>
            Add Documents
          </Button>
        </div>
      </div> */}
    </main>
  );
}
