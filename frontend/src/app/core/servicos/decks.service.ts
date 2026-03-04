import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/servicos/api.service';
import { Deck, FormatoDeck } from '@core/interfaces/decks.interface';

@Injectable({
  providedIn: 'root',
})
export class DecksService {
  private api = inject(ApiService);
  private readonly endpoint = 'decks';

  async listarDecks(apenasMeus: boolean = false): Promise<Deck[]> {
    const query = apenasMeus ? { meus: 'true' } : {};
    const resposta = await this.api.get<{ decks: Deck[] }>(this.endpoint, { query });
    return resposta.data?.decks ?? [];
  }

  async obterDeck(id: number): Promise<Deck | null> {
    const resposta = await this.api.get<{ deck: Deck }>(`${this.endpoint}/${id}`);
    return resposta.data?.deck ?? null;
  }

  async criarDeck(nome: string, formato: string): Promise<Deck | null> {
    const resposta = await this.api.post<{ deck: Deck }>(this.endpoint, {
      data: { deck: { nome, formato } }
    });
    return resposta.data?.deck ?? null;
  }

  async atualizarDeck(id: number, nome: string): Promise<Deck | null> {
    const resposta = await this.api.put<{ deck: Deck }>(`${this.endpoint}/${id}`, {
      data: { deck: { nome } }
    });
    return resposta.data?.deck ?? null;
  }

  async deletarDeck(id: number): Promise<void> {
    await this.api.delete(`${this.endpoint}/${id}`);
  }

  async atualizarCartasDeck(deckId: number, cartas: { carta_id: number, quantidade: number, eh_comandante: boolean }[]): Promise<Deck | null> {
    const resposta = await this.api.patch<{ deck: Deck }>(`${this.endpoint}/${deckId}`, {
      data: { deck: { cartas_attributes: cartas } }
    });
    return resposta.data?.deck ?? null;
  }

  async criarDeckComCartas(nome: string, formato: FormatoDeck, cartas: { carta_id: number, quantidade: number, eh_comandante: boolean }[]): Promise<Deck | null> {
    const resposta = await this.api.post<{ deck: Deck }>(this.endpoint, {
      data: { deck: { nome, formato, cartas_attributes: cartas } }
    });
    return resposta.data?.deck ?? null;
  }

  async adicionarCarta(deckId: number, cartaId: number, quantidade: number = 1, ehComandante: boolean = false): Promise<Deck | null> {
    const resposta = await this.api.post<{ deck: Deck }>(`${this.endpoint}/${deckId}/cartas`, {
      data: { deck_carta: { carta_id: cartaId, quantidade, eh_comandante: ehComandante } }
    });
    return resposta.data?.deck ?? null;
  }

  async removerCarta(deckId: number, cartaId: number, removerTudo: boolean = false): Promise<Deck | null> {
    const query = removerTudo ? { tudo: 'true' } : {};
    const resposta = await this.api.delete<{ deck: Deck }>(`${this.endpoint}/${deckId}/cartas/${cartaId}`, { query });
    return resposta.data?.deck ?? null;
  }

  async validarDeck(id: number): Promise<{ valido: boolean, erros: string[] }> {
    const resposta = await this.api.get<{ valido: boolean, erros: string[] }>(`${this.endpoint}/${id}/validar`);
    return resposta.data ?? { valido: false, erros: [] };
  }
}
