import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';

export enum ApiVersion {
  V1 = 'v1',
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly baseUrl = '/api';
  private http = inject(HttpClient);

  private get headers() {
    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  // Utilitário para transformar objetos em HttpParams Rails-friendly
  private toHttpParams(obj?: Record<string, any>): HttpParams {
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
        // Para objetos aninhados: gera user[name]=João
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

  private normalizePath(path: string, version: ApiVersion = ApiVersion.V1): string {
    // Se o path já começar com o prefixo da API (ex: /api/...), use-o diretamente.
    if (path.startsWith(`${this.baseUrl}/`)) {
      return path;
    }

    // Garante que o path não tenha uma barra inicial.
    const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path;

    // Remove o prefixo de versão se ele foi incluído acidentalmente no path.
    const pathWithoutVersion = pathWithoutLeadingSlash.startsWith(`${version}/`)
      ? pathWithoutLeadingSlash.substring(`${version}/`.length)
      : pathWithoutLeadingSlash;

    return `${this.baseUrl}/${version}/${pathWithoutVersion}`;
  }

  get<T>(
    path: string,
    options: {
      query?: Record<string, any>;
      apiVersion?: ApiVersion;
    } = {},
  ) {
    const url = this.normalizePath(path, options.apiVersion);
    const params = this.toHttpParams(options.query);
    return firstValueFrom(this.http.get<ApiResponse<T>>(url, { params, headers: this.headers }));
  }

  post<T>(
    path: string,
    body: any,
    options: {
      apiVersion?: ApiVersion;
    } = {},
  ) {
    const url = this.normalizePath(path, options.apiVersion);
    return firstValueFrom(this.http.post<ApiResponse<T>>(url, body, { headers: this.headers }));
  }

  put<T>(
    path: string,
    body: any,
    options: {
      apiVersion?: ApiVersion;
    } = {},
  ) {
    const url = this.normalizePath(path, options.apiVersion);
    return firstValueFrom(this.http.put<ApiResponse<T>>(url, body, { headers: this.headers }));
  }

  patch<T>(
    path: string,
    body: any,
    options: {
      apiVersion?: ApiVersion;
    } = {},
  ) {
    const url = this.normalizePath(path, options.apiVersion);
    return firstValueFrom(this.http.patch<ApiResponse<T>>(url, body, { headers: this.headers }));
  }

  delete<T>(
    path: string,
    options: {
      apiVersion?: ApiVersion;
    } = {},
  ) {
    const url = this.normalizePath(path, options.apiVersion);
    return firstValueFrom(this.http.delete<ApiResponse<T>>(url, { headers: this.headers }));
  }
}
