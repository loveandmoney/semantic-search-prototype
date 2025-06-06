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
