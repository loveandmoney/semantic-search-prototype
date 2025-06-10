'use client';

// ! Note
// This component needs to be wrapped with <LoadScript> to work

import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import mapStyles from './mapStyles';
import { IGeopoint } from '@/types';
import clsx from 'clsx';

export interface IPlace {
  name: string;
  address: string;
  location: IGeopoint;
  url: string;
}

interface IProps {
  locations: IPlace[];
  scriptHasLoaded: boolean;
  isDefaultView?: boolean;
}

const Map = ({ locations, scriptHasLoaded, isDefaultView }: IProps) => {
  const [selectedPlace, setSelectedPlace] = useState<IPlace | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onClickMarker = (place: IPlace) => {
    setSelectedPlace(place);
  };

  const setMapToDefaultView = () => {
    const DEFAULT_ZOOM = 4;

    mapRef.current?.setZoom(DEFAULT_ZOOM);
  };

  // Handle map centre and zoom
  useEffect(() => {
    if (!scriptHasLoaded || !mapRef.current) return;

    if (isDefaultView || !locations?.[0]) {
      setMapToDefaultView();
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      bounds.extend({
        lat: location.location.lat,
        lng: location.location.lng,
      });
    });

    mapRef.current.fitBounds(bounds);
  }, [scriptHasLoaded, locations, isDefaultView]);

  const handleLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    setTimeout(() => {
      google.maps.event.trigger(map, 'resize');
      if (locations.length) {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach((location) => {
          bounds.extend({
            lat: location.location.lat,
            lng: location.location.lng,
          });
        });
        map.fitBounds(bounds);
      }
    }, 50);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      {scriptHasLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          onLoad={handleLoad}
          zoom={4}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            styles: mapStyles,
            maxZoom: 15,
          }}
        >
          {selectedPlace && (
            <InfoWindow
              position={{
                lat: selectedPlace.location.lat,
                lng: selectedPlace.location.lng,
              }}
              options={{
                minWidth: 300,
                maxWidth: 300,
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="bg-green-600">
                <div className="w-full mb-2">LOGO</div>

                <h2 className={clsx('mb-4')}>{selectedPlace.name}</h2>
                <p className={clsx('mb-4')}>{selectedPlace.address}</p>
              </div>
            </InfoWindow>
          )}

          <Locations
            locations={locations}
            onClickMarker={onClickMarker}
            selectedPlace={selectedPlace}
          />
        </GoogleMap>
      )}
    </div>
  );
};

export default Map;

const Locations = ({
  locations,
  selectedPlace,
  onClickMarker,
}: {
  locations: IPlace[];
  selectedPlace: IPlace | null;
  onClickMarker: (place: IPlace) => void;
}) => {
  return (
    <>
      {locations.map((place) => (
        <div key={place.url}>
          {place !== selectedPlace && (
            <>
              <Marker
                position={place.location}
                icon={{
                  path: 'M19.5789 0C14.3863 0 9.4063 2.04612 5.73454 5.68823C2.06278 9.33034 0 14.2701 0 19.4208C0 26.9417 4.93325 34.2395 10.3425 39.9032C12.997 42.6826 15.6599 44.9579 17.6619 46.5392C18.4069 47.1277 19.0577 47.6179 19.5789 48C20.1002 47.6179 20.751 47.1277 21.496 46.5392C23.498 44.9579 26.1609 42.6826 28.8154 39.9032C34.2246 34.2395 39.1579 26.9417 39.1579 19.4208C39.1579 14.2701 37.0951 9.33034 33.4234 5.68823C29.7516 2.04612 24.7716 0 19.5789 0Z',
                  fillColor: '#FFF8EF',
                  fillOpacity: 1,
                  strokeWeight: 0,
                  anchor: new window.google.maps.Point(19.5, 47),
                  scale: 1.25,
                }}
                onClick={() => onClickMarker(place)}
              />
              <Marker
                position={place.location}
                clickable={false}
                icon={{
                  url: 'https://images.vexels.com/media/users/3/142789/isolated/preview/2bfb04ad814c4995f0c537c68db5cd0b-multicolor-swirls-circle-logo.png',
                  scaledSize: new window.google.maps.Size(48, 27),
                  anchor: new window.google.maps.Point(24, 46),
                }}
              />
            </>
          )}
        </div>
      ))}
    </>
  );
};
