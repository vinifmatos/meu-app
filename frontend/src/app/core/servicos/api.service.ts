import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResposta } from '../interfaces/api-resposta.interface';

export enum ApiVersao {
  V1 = 'v1',
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'api';
  private http = inject(HttpClient);

  private get headers() {
    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  // Utilitário para transformar objetos em HttpParams Rails-friendly
  private paraHttpParams(obj?: Record<string, any>): HttpParams {
    let params = new HttpParams();
    if (!obj) return params;

    const appendParam = (p: HttpParams, key: string, value: any): HttpParams => {
      if (value === null || value === undefined || value === '') return p;

      if (Array.isArray(value)) {
        value.forEach((v) => {
          p = appendParam(p, `${key}[]`, v);
        });
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        Object.keys(value).forEach((subKey) => {
          p = appendParam(p, `${key}[${subKey}]`, value[subKey]);
        });
      } else {
        const finalValue = value instanceof Date ? value.toJSON() : value;
        p = p.append(key, finalValue);
      }
      return p;
    };

    Object.keys(obj).forEach((key) => {
      params = appendParam(params, key, obj[key]);
    });

    return params;
  }

  private normalizarCaminho(path: string, versao: ApiVersao = ApiVersao.V1): string {
    if (path.startsWith(`${this.baseUrl}/`)) {
      return path;
    }

    const pathSemBarraInicial = path.startsWith('/') ? path.substring(1) : path;

    const pathSemVersao = pathSemBarraInicial.startsWith(`${versao}/`)
      ? pathSemBarraInicial.substring(`${versao}/`.length)
      : pathSemBarraInicial;

    return `${this.baseUrl}/${versao}/${pathSemVersao}`;
  }

  get<T>(
    path: string,
    opcoes: {
      query?: Record<string, any>;
      apiVersao?: ApiVersao;
    } = {},
  ) {
    const url = this.normalizarCaminho(path, opcoes.apiVersao);
    const params = this.paraHttpParams(opcoes.query);
    return firstValueFrom(this.http.get<ApiResposta<T>>(url, { params, headers: this.headers }));
  }

  post<T>(
    path: string,
    body: any,
    opcoes: {
      apiVersao?: ApiVersao;
    } = {},
  ) {
    const url = this.normalizarCaminho(path, opcoes.apiVersao);
    return firstValueFrom(this.http.post<ApiResposta<T>>(url, body, { headers: this.headers }));
  }

  put<T>(
    path: string,
    body: any,
    opcoes: {
      apiVersao?: ApiVersao;
    } = {},
  ) {
    const url = this.normalizarCaminho(path, opcoes.apiVersao);
    return firstValueFrom(this.http.put<ApiResposta<T>>(url, body, { headers: this.headers }));
  }

  patch<T>(
    path: string,
    body: any,
    opcoes: {
      apiVersao?: ApiVersao;
    } = {},
  ) {
    const url = this.normalizarCaminho(path, opcoes.apiVersao);
    return firstValueFrom(this.http.patch<ApiResposta<T>>(url, body, { headers: this.headers }));
  }

  delete<T>(
    path: string,
    opcoes: {
      query?: Record<string, any>;
      apiVersao?: ApiVersao;
    } = {},
  ) {
    const url = this.normalizarCaminho(path, opcoes.apiVersao);
    const params = this.paraHttpParams(opcoes.query);
    return firstValueFrom(this.http.delete<ApiResposta<T>>(url, { params, headers: this.headers }));
  }
}
