'use client';

import { Map } from '@/components/Map';
import { ISuburbBuildData } from '@/types';
import clsx from 'clsx';
import { useState } from 'react';

export default function SuburbSearchPage() {
  const [selectedSuburb, setSelectedSuburb] = useState<ISuburbBuildData | null>(
    null
  );

  return (
    <main className={clsx('space-y-6 m-auto max-w-[1600px]')}>
      <h1 className="text-2xl font-bold">Suburb Search</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="relative border aspect-[3/2]">
            <Map setSelectedSuburb={setSelectedSuburb} />
          </div>
        </div>

        {selectedSuburb && (
          <div>
            <h2 className="font-bold text-2xl">{selectedSuburb.suburb}</h2>

            <div>
              <p>Region: {selectedSuburb.region}</p>
              <p>
                Feasibility:{' '}
                {selectedSuburb.region_feasibility ? 'true' : 'false'}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
