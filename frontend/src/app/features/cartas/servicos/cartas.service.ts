import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { ApiResposta } from '@core/interfaces/api-resposta.interface';
import { Carta, Paginacao } from '@core/interfaces/cartas.interface';
import { ApiService } from '@core/servicos/api.service';

@Injectable({
  providedIn: 'root'
})
export class CartasService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'cartas';

  obterCartas(pagina: number = 1, porPagina: number = 20, filtros: any = {}): Observable<ApiResposta<{ cartas: Carta[], pagination: Paginacao }>> {
    const query: Record<string, any> = {
      page: pagina,
      perPage: porPagina,
      filters: {}
    };

    if (filtros.nome) {
      query['filters']['name'] = filtros.nome;
    }

    if (filtros.idioma) {
      query['filters']['lang'] = filtros.idioma;
    }

    if (filtros.oracleId) {
      query['filters']['oracle_id'] = filtros.oracleId;
    }

    if (filtros.edicao) {
      query['filters']['set'] = filtros.edicao;
    }

    return from(this.api.get<{ cartas: Carta[], pagination: Paginacao }>(this.endpoint, { query }));
  }

  obterCarta(id: number, idioma?: string): Observable<ApiResposta<{ carta: Carta, versoes: Carta[], idiomasDisponiveis: string[] }>> {
    const query = idioma ? { idioma } : {};
    return from(this.api.get<{ carta: Carta, versoes: Carta[], idiomasDisponiveis: string[] }>(`${this.endpoint}/${id}`, { query }));
  }
}
