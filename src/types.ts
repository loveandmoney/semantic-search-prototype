export interface IHouse {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: string[];
}

export interface IDoc {
  pageContent: string;
  metadata: {
    id: string;
    imageUrl: string;
  };
}

export interface IPineconeVector {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean | string[]>;
}

export interface IPineconeVectorResponse {
  id: string;
  values: number[];
  metadata: IHouse;
  score: number;
}
