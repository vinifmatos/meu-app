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
  private readonly baseUrl = '/api';
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

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value === null || value === undefined || value === '') return;

      if (value instanceof Date) {
        params = params.set(key, value.toJSON());
      } else if (Array.isArray(value)) {
        value.forEach((v) => {
          const finalValue = v instanceof Date ? v.toJSON() : v;
          params = params.append(`${key}[]`, finalValue);
        });
      } else if (typeof value === 'object') {
        Object.keys(value).forEach((subKey) => {
          const subValue = value[subKey];
          if (subValue !== null && subValue !== undefined) {
            const finalValue = subValue instanceof Date ? subValue.toJSON() : subValue;
            params = params.append(`${key}[${subKey}]`, finalValue);
          }
        });
      } else {
        params = params.set(key, value);
      }
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
