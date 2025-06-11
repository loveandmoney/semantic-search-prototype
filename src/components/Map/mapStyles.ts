const landColor = '#adadad';
const waterColor = '#96c0ce';
const bordersColor = '#1a3541';

const mapStyles = [
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

export default mapStyles;
