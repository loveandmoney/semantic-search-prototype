'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { Autocomplete, GoogleMap } from '@react-google-maps/api';
import { mapStyles } from './mapStyles';
import { ISuburbBuildData } from '@/types';
import { useBuildRegionMap } from './useBuildRegionMap';

interface IProps {
  setSelectedSuburb: Dispatch<SetStateAction<ISuburbBuildData | null>>;
}

export const BuildRegionMap = ({ setSelectedSuburb }: IProps) => {
  const {
    isLoaded,
    handleAutocompleteSelectPlace,
    handleLoadAutocomplete,
    handleLoadMap,
  } = useBuildRegionMap({ setSelectedSuburb });

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      {isLoaded && (
        <div className="relative w-full h-full">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            onLoad={handleLoadMap}
            zoom={4}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              styles: mapStyles,
              maxZoom: 15,
            }}
          />

          <div className="absolute top-4 left-4 w-[400px]">
            <Autocomplete
              onLoad={handleLoadAutocomplete}
              onPlaceChanged={handleAutocompleteSelectPlace}
              options={{
                componentRestrictions: { country: 'au' },
                bounds: new google.maps.LatLngBounds(
                  { lat: -39.2, lng: 140.8 }, // southwest of vic
                  { lat: -33.8, lng: 150.2 } // northeast of vic
                ),
                strictBounds: true, // force within bounds
              }}
            >
              <input
                type="text"
                placeholder="Enter address"
                className="w-full border p-2 rounded mb-4 bg-white"
              />
            </Autocomplete>
          </div>
        </div>
      )}
    </div>
  );
};
