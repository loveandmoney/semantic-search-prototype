import { apiService } from '@/lib/apiService';
import {
  IGeoJsonFeatureWithBuildData,
  IGeoJsonFeatureCollectionWithBuildData,
} from '@/types';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const GET = async () => {
  try {
    const locations = await apiService.getSuburbBuildData();
    const { features } = await apiService.getRawGeoJson();

    const enrichedFeatures: IGeoJsonFeatureWithBuildData[] = [];

    for (const loc of locations) {
      if (loc.region === 'Out of build region') continue;

      const match = features.find(
        (f) =>
          f.properties.LOCALITY_NAME === loc.suburb &&
          f.properties.POSTCODE === loc.postcode
      );

      if (match) {
        enrichedFeatures.push({
          type: 'Feature',
          geometry: {
            ...match.geometry,
            coordinates: roundCoord(match.geometry.coordinates),
          },
          properties: {
            LOCALITY_NAME: loc.suburb,
            POSTCODE: loc.postcode,
            region: loc.region,
            region_feasibility: loc.region_feasibility,
          },
        });
      }
    }

    const geoJsonOutput: IGeoJsonFeatureCollectionWithBuildData = {
      type: 'FeatureCollection',
      features: enrichedFeatures,
    };

    console.log(`✅ Generated ${enrichedFeatures.length} enriched features`);

    const outputPath = path.join(process.cwd(), 'enriched-geojson.json');
    fs.writeFileSync(outputPath, JSON.stringify(geoJsonOutput, null, 2));

    return NextResponse.json({
      success: true,
      message: `Wrote ${enrichedFeatures.length} features to enriched-geojson.json`,
    });
  } catch (error) {
    console.error('❌ Failed to generate geojson data:', error);

    return NextResponse.json(
      { error: 'Failed to generate geojson data' },
      { status: 500 }
    );
  }
};

const roundCoord = (coord: any): any =>
  Array.isArray(coord)
    ? coord.map((c) =>
        Array.isArray(c) ? roundCoord(c) : +Number(c).toFixed(6)
      )
    : +Number(coord).toFixed(6);
