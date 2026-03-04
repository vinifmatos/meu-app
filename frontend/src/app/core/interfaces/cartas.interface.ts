export interface Carta {
  id: number;
  scryfallId: string;
  oracleId: string;
  name: string;
  typeLine: string;
  manaCost: string;
  oracleText: string;
  power?: string;
  toughness?: string;
  colors: string[];
  colorIdentity: string[];
  colorIndicator?: string[];
  set: string;
  collectorNumber: string;
  lang: string;
  releasedAt: string;
  rarity: string;
  legalities: Record<string, string>;
  imageUris: {
    small: string;
    normal: string;
    large: string;
    png: string;
    artCrop: string;
    borderCrop: string;
  };
  faces: FaceCarta[];
}

export interface FaceCarta {
  id: number;
  face: 'front' | 'back';
  name: string;
  typeLine: string;
  manaCost: string;
  oracleText: string;
  power?: string;
  toughness?: string;
  colors: string[];
  imageUris: {
    small: string;
    normal: string;
  };
  illustrationId: string;
}

export interface Paginacao {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}
