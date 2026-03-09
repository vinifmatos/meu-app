import { Injectable } from '@angular/core';
import { Deck, DeckCarta } from '@core/interfaces/decks.interface';
import { Carta } from '@core/interfaces/cartas.interface';

export interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DecksValidadorService {
  validar(deck: Deck | null): ResultadoValidacao {
    const erros: string[] = [];

    if (!deck) return { valido: false, erros: ['Deck não carregado'] };

    const todasAsCartas: DeckCarta[] = Object.values(deck.cartas).flat();

    if (todasAsCartas.length === 0) {
      return { valido: false, erros: ['O deck não pode estar vazio'] };
    }

    switch (deck.formato) {
      case 'pauper':
        this.validarPauper(deck, todasAsCartas, erros);
        break;
      case 'commander':
        this.validarCommander(deck, todasAsCartas, erros);
        break;
    }

    this.validarLegalidadeFormato(deck, todasAsCartas, erros);

    return {
      valido: erros.length === 0,
      erros: erros,
    };
  }

  private validarPauper(deck: Deck, cartas: DeckCarta[], erros: string[]): void {
    const total = this.calcularTotal(cartas);
    if (total < 60) {
      erros.push(`Mínimo de 60 cartas para o formato Pauper (atual: ${total})`);
    }

    this.validarLimiteCopias(cartas, 4, erros);
  }

  private validarCommander(deck: Deck, cartas: DeckCarta[], erros: string[]): void {
    const total = this.calcularTotal(cartas);
    if (total !== 100) {
      erros.push(`O deck de Commander deve ter exatamente 100 cartas (atual: ${total})`);
    }

    const comandantes = deck.cartas.comandantes || [];
    if (comandantes.length === 0) {
      erros.push('O deck deve ter pelo menos um comandante');
    }

    this.validarLimiteCopias(cartas, 1, erros);

    if (comandantes.length > 0) {
      this.validarIdentidadeCor(comandantes, cartas, erros);
    }
  }

  private validarLimiteCopias(cartas: DeckCarta[], limite: number, erros: string[]): void {
    const contagem = new Map<string, { nome: string; total: number; basico: boolean }>();

    for (const dc of cartas) {
      const oracleId = dc.carta.oracleId;
      const atual = contagem.get(oracleId) || {
        nome: dc.carta.name,
        total: 0,
        basico: this.ehTerrenoBasico(dc.carta),
      };
      atual.total += dc.quantidade;
      contagem.set(oracleId, atual);
    }

    contagem.forEach((info) => {
      if (!info.basico && info.total > limite) {
        erros.push(`Limite excedido para '${info.nome}': máximo de ${limite} cópia(s)`);
      }
    });
  }

  private validarIdentidadeCor(
    comandantes: DeckCarta[],
    todas: DeckCarta[],
    erros: string[],
  ): void {
    const identidadeDeck = new Set<string>();
    comandantes.forEach((c) => {
      if (c.carta.colorIdentity) {
        c.carta.colorIdentity.forEach((cor) => identidadeDeck.add(cor));
      }
    });

    todas.forEach((dc) => {
      if (dc.carta.colorIdentity && dc.carta.colorIdentity.length > 0) {
        const foraDaIdentidade = dc.carta.colorIdentity.some((cor) => !identidadeDeck.has(cor));
        if (foraDaIdentidade) {
          erros.push(`A carta '${dc.carta.name}' possui cores fora da identidade do comandante`);
        }
      }
    });
  }

  private validarLegalidadeFormato(deck: Deck, cartas: DeckCarta[], erros: string[]): void {
    const formato = deck.formato;
    const oracleIdsVistos = new Set<string>();

    cartas.forEach((dc) => {
      if (oracleIdsVistos.has(dc.carta.oracleId)) return;
      oracleIdsVistos.add(dc.carta.oracleId);

      const status = dc.carta.legalities?.[formato];
      if (status !== 'legal' && status !== 'restricted') {
        const statusHuman = status ? status.replace(/_/g, ' ') : 'desconhecido';
        const capitalizedStatus = statusHuman.charAt(0).toUpperCase() + statusHuman.slice(1);
        erros.push(
          `A carta '${dc.carta.name}' não é permitida no formato ${this.capitalize(formato)} (Status: ${capitalizedStatus})`,
        );
      }
    });
  }

  obterLimiteCopias(formato: string, carta: Carta): number {
    if (this.ehTerrenoBasico(carta)) return 999;

    switch (formato) {
      case 'pauper':
        return 4;
      case 'commander':
        return 1;
      default:
        return 4;
    }
  }

  private ehTerrenoBasico(carta: Carta): boolean {
    const tl = carta.typeLine || '';
    return tl.includes('Basic') && tl.includes('Land');
  }

  private calcularTotal(cartas: DeckCarta[]): number {
    return cartas.reduce((acc, c) => acc + c.quantidade, 0);
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
