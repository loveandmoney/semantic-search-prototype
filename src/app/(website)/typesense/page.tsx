'use client';

import { HouseTile } from '@/components/HouseTile';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';
import { IHouse } from '@/types';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { SearchResponseHit } from 'typesense/lib/Typesense/Documents';

export default function TypesenseSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponseHit<IHouse>[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      try {
        const results = await apiService.typesenseSearchCollection({ query });
        setResults(results);
      } catch (error) {
        console.error('Error fetching Typesense results:', error);
        setResults([]);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <main className={clsx('space-y-6 m-auto max-w-[600px]')}>
      <h1 className="text-2xl font-bold">Typesense Search</h1>

      <Input
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

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
          <Button onClick={() => apiService.typesenseCreateCollection()}>Create Collection</Button>
          <Button onClick={() => apiService.typesenseAddDocuments()}>Add Documents</Button>
        </div>
      </div> */}
    </main>
  );
}
