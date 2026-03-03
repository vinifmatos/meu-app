import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../interfaces/app-configuracao.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoService {
  private readonly http = inject(HttpClient);
  private config: AppConfig | null = null;

  async carregar(): Promise<AppConfig | null> {
    try {
      this.config = await firstValueFrom(this.http.get<AppConfig>('/api/v1/config'));
      return this.config;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return null;
    }
  }

  get valor(): AppConfig | null {
    return this.config;
  }
}
