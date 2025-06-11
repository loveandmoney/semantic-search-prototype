'use client';

import { Button } from '@/components/ui/button';
import { apiService } from '@/lib/apiService';
import clsx from 'clsx';

export default function DangerZonePage() {
  return (
    <main className={clsx('space-y-6 m-auto max-w-[600px]')}>
      <h1 className="text-2xl font-bold">Danger Zone</h1>

      <p>Proceed with caution</p>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => apiService.typesenseCreateCollection()}>
          Create Collection
        </Button>
        <Button onClick={() => apiService.typesenseAddDocuments()}>
          Add Documents
        </Button>
        <Button onClick={() => apiService.generateEnrichedGeoJson()}>
          Generate GeoJson
        </Button>
      </div>
    </main>
  );
}
