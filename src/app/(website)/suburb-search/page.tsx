'use client';

import Map from '@/components/Map';
import { TBuildRegion } from '@/types';
import { useLoadScript } from '@react-google-maps/api';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const buildRegions: TBuildRegion[] = [
  'south-east',
  'west',
  'north',
  'geelong',
  'gippsland',
  'out-of-build-region',
];

export default function SuburbSearchPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [randomData, setRandomData] = useState<{
    region: TBuildRegion;
    feasibilityRequired: boolean;
  }>({ feasibilityRequired: false, region: 'south-east' });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'],
  });

  const getRandomData = (): {
    region: TBuildRegion;
    feasibilityRequired: boolean;
  } => {
    const region =
      buildRegions[Math.floor(Math.random() * buildRegions.length)];
    const feasibilityRequired = Math.random() < 0.5;
    return { region, feasibilityRequired };
  };

  useEffect(() => {
    setRandomData(getRandomData());
  }, [selectedFeature]);

  useEffect(() => {
    console.log('isLoaded:', isLoaded);
  }, [isLoaded]);

  return (
    <main className={clsx('space-y-6 m-auto max-w-[1600px]')}>
      <h1 className="text-2xl font-bold">Suburb Search</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="relative border aspect-[3/2]">
            <Map
              scriptHasLoaded={isLoaded}
              setSelectedFeature={setSelectedFeature}
            />
          </div>
        </div>

        {selectedFeature && (
          <div>
            <h2 className="font-bold text-2xl">{selectedFeature}</h2>
            <p>Region: {randomData.region}</p>
            <p>
              Feasibility Required:{' '}
              {randomData.feasibilityRequired ? 'true' : 'false'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
