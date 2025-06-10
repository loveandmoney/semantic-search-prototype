'use client';

import React, { Dispatch, SetStateAction, useRef } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import mapStyles from './mapStyles';
import { apiService } from '@/lib/apiService';

interface IProps {
  scriptHasLoaded: boolean;
  setSelectedFeature: Dispatch<SetStateAction<string | null>>;
}

const Map = ({ scriptHasLoaded, setSelectedFeature }: IProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const fetchAndSetGeoJsonData = async () => {
    if (!mapRef.current) return;

    const geoJsonData = await apiService.geoJson();

    mapRef.current.data.addGeoJson(geoJsonData);

    mapRef.current.data.setStyle({
      fillColor: '#FF5722',
      strokeColor: '#FF5722',
      strokeWeight: 1,
      fillOpacity: 0.3,
    });

    mapRef.current.data.addListener('click', (event) => {
      console.log(event.feature);
      const name = event.feature.getProperty('LOCALITY_NAME');
      setSelectedFeature(name);
    });

    // Set bounds to show all features
    const bounds = new google.maps.LatLngBounds();
    geoJsonData.features.forEach((feature) => {
      const coords =
        feature.geometry.type === 'Polygon'
          ? feature.geometry.coordinates[0]
          : feature.geometry.coordinates[0][0];

      (coords as [number, number][]).forEach(([lng, lat]) => {
        bounds.extend(new google.maps.LatLng(lat, lng));
      });
    });

    mapRef.current.fitBounds(bounds);
  };

  const handleLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    setTimeout(() => {
      google.maps.event.trigger(map, 'resize');
    }, 50);

    fetchAndSetGeoJsonData();
  };

  if (!scriptHasLoaded) {
    return null;
  }

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
        />
      )}
    </div>
  );
};

export default Map;
