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
    stylers: [{ weight: 0.6 }, { color: '#1a3541' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#8e9a36' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#8e9a36' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#8e9a36' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#8e9a36' }, { lightness: '25' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#8e9a36' }, { lightness: '15' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#96c0ce' }],
  },
];

export default mapStyles;
