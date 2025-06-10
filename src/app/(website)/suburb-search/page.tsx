'use client';

import Map from '@/components/Map';
import { IGeopoint } from '@/types';
import { LoadScript } from '@react-google-maps/api';
import clsx from 'clsx';
import { useState } from 'react';

export default function SuburbSearchPage() {
  const [scriptHasLoaded, setScriptHasLoaded] = useState(false);

  const location: IGeopoint = {
    lat: -37.8136, // Default to Melbourne
    lng: 144.9631,
  };

  return (
    <main className={clsx('space-y-6 m-auto max-w-[600px]')}>
      <h1 className="text-2xl font-bold">Suburb Search</h1>

      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        libraries={['places', 'geometry']}
        onLoad={() => setScriptHasLoaded(true)}
      >
        <div className="relative border aspect-square">
          {scriptHasLoaded && (
            <Map
              key="google-map-loaded"
              locations={[{ address: '', location, name: '', url: '' }]}
              scriptHasLoaded
            />
          )}
        </div>
      </LoadScript>
    </main>
  );
}
