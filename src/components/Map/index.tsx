'use client';

import React, { Dispatch, SetStateAction, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import mapStyles from './mapStyles';
import { apiService } from '@/lib/apiService';
import { ISuburbBuildData, TBuildRegion } from '@/types';

interface IProps {
  setSelectedSuburb: Dispatch<SetStateAction<ISuburbBuildData | null>>;
}

export const Map = ({ setSelectedSuburb }: IProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'],
  });

  const fetchAndSetGeoJsonData = async () => {
    if (!mapRef.current) return;

    const geoJsonData = await apiService.getEnrichedGeojson();

    mapRef.current.data.addGeoJson(geoJsonData);

    mapRef.current.data.setStyle((feature) => {
      const region = feature.getProperty('region') as TBuildRegion;
      const regionFeasibility = feature.getProperty(
        'region_feasibility'
      ) as string;

      const colors: Record<TBuildRegion, { fill: string; stroke: string }> = {
        'South East': { fill: '#FF5722', stroke: '#E64A19' },
        West: { fill: '#4CAF50', stroke: '#388E3C' },
        North: { fill: '#2196F3', stroke: '#1976D2' },
        Geelong: { fill: '#9C27B0', stroke: '#7B1FA2' },
        Gippsland: { fill: '#FFEB3B', stroke: '#FBC02D' },
        'Out of build region': { fill: '#BDBDBD', stroke: '#757575' },
      };

      const color = colors[region] || { fill: '#CCCCCC', stroke: '#999999' };

      return {
        fillColor: color.fill,
        strokeColor: color.stroke,
        strokeWeight: 1,
        fillOpacity: regionFeasibility ? 0.25 : 0.75,
      };
    });

    mapRef.current.data.addListener('click', (event) => {
      const postcode = event.feature.getProperty('POSTCODE');
      const suburb = event.feature.getProperty('LOCALITY_NAME');
      const region = event.feature.getProperty('region');
      const region_feasibility =
        event.feature.getProperty('region_feasibility');
      setSelectedSuburb({ postcode, region, region_feasibility, suburb });

      // Zoom into clicked feature
      const geometry = event.feature.getGeometry();
      const bounds = new google.maps.LatLngBounds();

      geometry?.forEachLatLng((latLng) => {
        bounds.extend(latLng);
      });

      mapRef.current?.fitBounds(bounds);
    });

    // Set bounds to show all features
    const bounds = new google.maps.LatLngBounds();
    geoJsonData.features
      .filter((feature) => feature.properties.region !== 'Out of build region')
      .forEach((feature) => {
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

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      {isLoaded && (
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
