'use client';

import { BuildRegionMap } from '@/components/BuildRegionMap';
import { Button } from '@/components/ui/button';
import { ISuburbBuildData } from '@/types';
import clsx from 'clsx';
import { useState } from 'react';

export default function SuburbSearchPage() {
  const [selectedSuburb, setSelectedSuburb] = useState<ISuburbBuildData | null>(
    null
  );

  const isOutOfBuildRegion = selectedSuburb?.region === 'Out of build region';

  return (
    <main className={clsx('space-y-6 m-auto max-w-[1600px]')}>
      <h1 className="text-2xl font-bold">Suburb Search</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="relative border aspect-[3/2]">
            <BuildRegionMap setSelectedSuburb={setSelectedSuburb} />
          </div>
        </div>

        {selectedSuburb && (
          <div>
            <h2 className="font-bold text-2xl">{selectedSuburb.suburb}</h2>

            {!isOutOfBuildRegion && (
              <div>
                <p>Region: {selectedSuburb.region}</p>
                <p>
                  Feasibility:{' '}
                  {selectedSuburb.region_feasibility ? 'true' : 'false'}
                </p>
              </div>
            )}

            {isOutOfBuildRegion && (
              <div className="space-y-3">
                <p>This suburb is not in a build region</p>
                <Button>Explore Products</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
