export interface IHouse {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: string[];
}

export interface IHouseWithTextContent extends IHouse {
  textContent: string;
}

export interface ITypesenseVectorSearchHit<T> {
  document: T;
  vector_distance: number;
}

export interface IChatMessage {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

export interface IStreamInitiator {
  conversation: IChatMessage[];
  onContent: (chunk: string) => void;
  onComplete?: () => void;
}

export type TBuildRegion =
  | 'South East'
  | 'West'
  | 'North'
  | 'Geelong'
  | 'Gippsland'
  | 'Out of build region';

export interface ISuburbBuildData {
  suburb: string;
  postcode: string;
  region: TBuildRegion;
  region_feasibility: boolean;
}

export interface IGeopoint {
  lat: number;
  lng: number;
}

export interface IGeoJsonFeature {
  type: 'Feature';
  properties: {
    LOCALITY_NAME: string;
    POSTCODE: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface IGeoJsonFeatureWithBuildData {
  type: 'Feature';
  properties: {
    LOCALITY_NAME: string;
    POSTCODE: string;
    region: TBuildRegion;
    region_feasibility: boolean;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface IGeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: IGeoJsonFeature[];
}

export interface IGeoJsonFeatureCollectionWithBuildData {
  type: 'FeatureCollection';
  features: IGeoJsonFeatureWithBuildData[];
}
