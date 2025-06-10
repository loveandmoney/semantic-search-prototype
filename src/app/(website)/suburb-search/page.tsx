'use client';

import Map from '@/components/Map';
import { LoadScript } from '@react-google-maps/api';
import clsx from 'clsx';
import { useState } from 'react';

export default function SuburbSearchPage() {
  const [scriptHasLoaded, setScriptHasLoaded] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  return (
    <main className={clsx('space-y-6 m-auto max-w-[1600px]')}>
      <h1 className="text-2xl font-bold">Suburb Search</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
            libraries={['places', 'geometry']}
            onLoad={() => setScriptHasLoaded(true)}
          >
            <div className="relative border aspect-[3/2]">
              <Map
                scriptHasLoaded={scriptHasLoaded}
                setSelectedFeature={setSelectedFeature}
              />
            </div>
          </LoadScript>
        </div>

        <div>
          <h2 className="font-bold text-2xl">{selectedFeature}</h2>
        </div>
      </div>
    </main>
  );
}
