import { Carta } from './cartas.interface';

export type FormatoDeck = 'pauper' | 'commander';

export interface DeckCarta {
  quantidade: number;
  ehComandante: boolean;
  carta: Carta;
}

export interface Deck {
  id: number;
  nome: string;
  formato: FormatoDeck;
  usuarioId: number;
  cartas: {
    comandantes: DeckCarta[];
    terrenos: DeckCarta[];
    criaturas: DeckCarta[];
    instantes: DeckCarta[];
    feiticos: DeckCarta[];
    artefatos: DeckCarta[];
    encantamentos: DeckCarta[];
    planeswalkers: DeckCarta[];
    outros: DeckCarta[];
  };
  estatisticas: {
    totalCartas: number;
    valido: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
