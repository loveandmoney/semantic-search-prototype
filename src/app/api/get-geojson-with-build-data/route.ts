import { apiService } from '@/lib/apiService';
import {
  IGeoJsonFeatureCollection,
  IGeoJsonFeatureWithBuildData,
} from '@/types';
import { NextResponse } from 'next/server';
import { locations } from './locations';

export const GET = async () => {
  console.log('FETCHING');

  try {
    const featuresWithBuildData: IGeoJsonFeatureWithBuildData[] = [];

    const { features } = await apiService.getRawGeoJson();
    console.log('Fetched features:', features.length);

    locations.forEach((location) => {
      const matchingFeature = features.find(
        (feature) =>
          feature.properties.LOCALITY_NAME === location.suburb &&
          feature.properties.POSTCODE === location.postcode
      );

      if (matchingFeature) {
        featuresWithBuildData.push({
          ...matchingFeature,
          properties: {
            ...matchingFeature.properties,
            region: location.region,
            region_feasibility: location.region_feasibility,
          },
        });
      }
    });

    console.log('featuresWithBuildData:', featuresWithBuildData.length);

    const geoJsonCollection: IGeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: featuresWithBuildData,
    };

    return NextResponse.json({ geoJsonCollection });
  } catch (error) {
    console.error('Failed to fetch geojson with build data:', error);

    return NextResponse.json(
      { error: 'Failed to fetch geojson with build data' },
      { status: 500 }
    );
  }
};
