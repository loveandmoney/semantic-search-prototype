import { NextResponse } from 'next/server';
import { locations } from './locations';

export const GET = async () => {
  return NextResponse.json(locations);
};
