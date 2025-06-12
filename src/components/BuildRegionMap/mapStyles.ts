import { TBuildRegion } from '@/types';

const landColor = '#adadad';
const waterColor = '#96c0ce';
const bordersColor = '#1a3541';

export const mapStyles = [
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ weight: 0.6 }, { color: bordersColor }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: landColor }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: landColor }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: landColor }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: landColor }, { lightness: '25' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: landColor }, { lightness: '15' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: waterColor }],
  },
];

export const regionColors: Record<
  TBuildRegion,
  { fill: string; fillActive: string; stroke: string }
> = {
  'South East': {
    fill: '#FF5722',
    fillActive: '#b82f05',
    stroke: '#E64A19',
  },
  West: { fill: '#4CAF50', fillActive: '#2b762d', stroke: '#388E3C' },
  North: { fill: '#2196F3', fillActive: '#166bb1', stroke: '#1976D2' },
  Geelong: { fill: '#9C27B0', fillActive: '#62146f', stroke: '#7B1FA2' },
  Gippsland: {
    fill: '#FFEB3B',
    fillActive: '#a69923',
    stroke: '#FBC02D',
  },
  'Out of build region': {
    fill: '#BDBDBD',
    fillActive: '#BDBDBD',
    stroke: '#757575',
  },
};
