export interface IHouse {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: string[];
}

export interface IHouseWithPageContent extends IHouse {
  pageContent: string;
}

export interface IDoc {
  pageContent: string;
  metadata: IHouse;
}

export interface IPineconeVector {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean | string[]>;
}

export interface IPineconeVectorResponse {
  id: string;
  values: number[];
  metadata: IHouseWithPageContent;
  score: number;
}

export interface IChatMessage {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

export interface IRagConversationMessage extends IChatMessage {
  _type: 'message';
}

export interface IRagVectorItem {
  id: string;
  metadata: IHouseWithPageContent;
  score: number;
}

export interface IRagConversationVectorItems {
  _type: 'vector_items';
  items: IRagVectorItem[];
}

export type TRagConversationItem =
  | IRagConversationMessage
  | IRagConversationVectorItems;

export interface IStreamInitiator {
  conversation: IChatMessage[];
  onContent: (chunk: string) => void;
  onComplete?: () => void;
}
