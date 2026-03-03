import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResposta } from '@core/interfaces/api-resposta.interface';
import { Carta, Paginacao } from '@core/interfaces/cartas.interface';

@Injectable({
  providedIn: 'root'
})
export class CartasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/cartas';

  obterCartas(pagina: number = 1, porPagina: number = 20, filtros: any = {}): Observable<ApiResposta<{ cartas: Carta[], pagination: Paginacao }>> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('perPage', porPagina.toString());

    if (filtros.nome) {
      params = params.set('filters[name]', filtros.nome);
    }

    if (filtros.edicao) {
      params = params.set('filters[set]', filtros.edicao);
    }

    return this.http.get<ApiResposta<{ cartas: Carta[], pagination: Paginacao }>>(this.apiUrl, { params });
  }

  obterCarta(id: number): Observable<ApiResposta<{ carta: Carta }>> {
    return this.http.get<ApiResposta<{ carta: Carta }>>(`${this.apiUrl}/${id}`);
  }
}
