import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const GET = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const filePath = path.join(
      process.cwd(),
      'src/app/api/get-raw-geojson/merged_regions.geojson'
    );
    const fileData = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(fileData);

    return NextResponse.json(json, { status: 200, headers });
  } catch (error) {
    console.error('Failed to get geoJSON data:', error);

    return NextResponse.json(
      { error: 'Failed to get geoJSON data' },
      { status: 500, headers }
    );
  }
};
