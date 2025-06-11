import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { IGeoJsonFeatureCollectionWithBuildData } from '@/types';

export const GET = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const filePath = path.join(
      process.cwd(),
      'src/app/api/get-enriched-geojson/enriched-geojson.json'
    );
    const fileData = await fs.readFile(filePath, 'utf-8');
    const geoJsonLookup = JSON.parse(
      fileData
    ) as IGeoJsonFeatureCollectionWithBuildData;

    return NextResponse.json(geoJsonLookup, { status: 200, headers });
  } catch (error) {
    console.error('Failed to get enriched geoJSON data:', error);

    return NextResponse.json(
      { error: 'Failed to get enriched geoJSON data' },
      { status: 500, headers }
    );
  }
};
