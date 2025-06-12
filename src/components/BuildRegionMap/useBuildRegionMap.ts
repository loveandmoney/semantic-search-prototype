import {
  IGeoJsonFeatureWithBuildData,
  ISuburbBuildData,
  TBuildRegion,
} from '@/types';
import { useLoadScript } from '@react-google-maps/api';
import { Dispatch, SetStateAction, useRef } from 'react';
import { regionColors } from './mapStyles';
import { apiService } from '@/lib/apiService';

export const useBuildRegionMap = ({
  setSelectedSuburb,
}: {
  setSelectedSuburb: Dispatch<SetStateAction<ISuburbBuildData | null>>;
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'],
  });

  const featureIndexRef = useRef<Map<string, google.maps.Data.Feature>>(
    new Map()
  );
  const activeFeatureKeyRef = useRef<string | null>(null);

  const getFeatureKey = (feature: google.maps.Data.Feature) => {
    const suburb = feature.getProperty('LOCALITY_NAME') as string;
    const postcode = feature.getProperty('POSTCODE') as string;
    return `${suburb.toLowerCase()}|${postcode}`;
  };

  const setActiveFeature = (feature: google.maps.Data.Feature) => {
    const featureKey = getFeatureKey(feature);
    activeFeatureKeyRef.current = featureKey;
    mapRef.current?.data.setStyle(mapRef.current.data.getStyle());
  };

  const getMatchingItemFromFeatureIndex = ({
    postcode,
    suburb,
  }: {
    postcode: string;
    suburb: string;
  }) => {
    const indexKey = `${suburb.toLowerCase()}|${postcode}`;
    return featureIndexRef.current.get(indexKey) || null;
  };

  const styleFeature = (
    feature: google.maps.Data.Feature
  ): google.maps.Data.StyleOptions => {
    const featureKey = getFeatureKey(feature);
    const isActive = featureKey === activeFeatureKeyRef.current;

    const region = feature.getProperty('region') as TBuildRegion;
    const regionFeasibility = feature.getProperty(
      'region_feasibility'
    ) as string;

    const color = regionColors[region] || {
      fill: '#CCCCCC',
      fillActive: '#666666',
      stroke: '#999999',
    };

    return {
      fillColor: isActive ? color.fillActive : color.fill,
      strokeColor: color.stroke,
      fillOpacity: regionFeasibility ? 0.25 : 0.75,
      strokeWeight: 1,
    };
  };

  const addFeatureToIndex = (feature: google.maps.Data.Feature) => {
    const name = (feature.getProperty('LOCALITY_NAME') as string).toLowerCase();
    const code = feature.getProperty('POSTCODE');
    if (name && code) {
      featureIndexRef.current.set(`${name}|${code}`, feature);
    }
  };

  const handleClickFeature = (feature: google.maps.Data.Feature) => {
    const postcode = feature.getProperty('POSTCODE') as string;
    const suburb = feature.getProperty('LOCALITY_NAME') as string;
    const region = feature.getProperty('region') as TBuildRegion;
    const region_feasibility = feature.getProperty(
      'region_feasibility'
    ) as boolean;
    setSelectedSuburb({ postcode, region, region_feasibility, suburb });

    // Zoom into clicked feature
    const geometry = feature.getGeometry();
    const bounds = new google.maps.LatLngBounds();

    geometry?.forEachLatLng((latLng) => {
      bounds.extend(latLng);
    });

    mapRef.current?.fitBounds(bounds);

    setActiveFeature(feature);
  };

  const scaleMapToFitFeatures = (features: IGeoJsonFeatureWithBuildData[]) => {
    const bounds = new google.maps.LatLngBounds();
    features
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

    mapRef.current?.fitBounds(bounds);
  };

  const fetchAndSetGeoJsonData = async () => {
    if (!mapRef.current) return;

    const geoJsonData = await apiService.getEnrichedGeojson();

    const features = mapRef.current.data.addGeoJson(geoJsonData);
    features.forEach((feature) => addFeatureToIndex(feature));

    mapRef.current.data.setStyle((feature) => styleFeature(feature));

    mapRef.current.data.addListener('click', (event) => {
      handleClickFeature(event.feature);
    });

    scaleMapToFitFeatures(geoJsonData.features);
  };

  const handleLoadMap = (map: google.maps.Map) => {
    mapRef.current = map;

    setTimeout(() => {
      google.maps.event.trigger(map, 'resize');
    }, 50);

    fetchAndSetGeoJsonData();
  };

  const handleLoadAutocomplete = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    autocompleteRef.current = autocomplete;
  };

  const handleAutocompleteSelectPlace = () => {
    if (!autocompleteRef.current || !mapRef.current) return;
    const place = autocompleteRef.current.getPlace();

    if (!place || !place.address_components) return;

    const suburb = place.address_components.find((c) =>
      c.types.includes('locality')
    )?.long_name;

    const postcode = place.address_components.find((c) =>
      c.types.includes('postal_code')
    )?.long_name;

    if (!suburb || !postcode) {
      console.error('Suburb or postcode not found in address components');
      return;
    }

    const matchedFeature = getMatchingItemFromFeatureIndex({
      postcode,
      suburb,
    });

    if (!matchedFeature) {
      if (place.geometry?.location) {
        mapRef.current.setCenter(place.geometry.location);
        mapRef.current.setZoom(14);
      } else if (place.geometry?.viewport) {
        mapRef.current.fitBounds(place.geometry.viewport);
      }

      setSelectedSuburb({
        postcode,
        suburb,
        region: 'Out of build region',
        region_feasibility: false,
      });
      return;
    }

    const geometry = matchedFeature.getGeometry();
    const bounds = new google.maps.LatLngBounds();

    geometry?.forEachLatLng((latlng) => {
      bounds.extend(latlng);
    });

    mapRef.current.fitBounds(bounds);

    setSelectedSuburb({
      suburb,
      postcode,
      region: matchedFeature.getProperty('region') as TBuildRegion,
      region_feasibility: matchedFeature.getProperty(
        'region_feasibility'
      ) as boolean,
    });

    setActiveFeature(matchedFeature);
  };

  return {
    isLoaded,
    handleLoadMap,
    handleLoadAutocomplete,
    handleAutocompleteSelectPlace,
  };
};
