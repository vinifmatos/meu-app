export interface Simbolo {
  symbol: string;
  english: string;
  representsMana: boolean;
  manaValue?: number;
  appearsInManaCosts: boolean;
  colors: string[];
  hybrid: boolean;
  phyrexian: boolean;
  svgUri?: string;
}
