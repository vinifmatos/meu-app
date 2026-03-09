import { Injectable, inject } from '@angular/core';
import { AppConfig } from '../interfaces/app-configuracao.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoService {
  private readonly api = inject(ApiService);
  private config: AppConfig | null = null;

  async carregar(): Promise<AppConfig | null> {
    try {
      const resposta = await this.api.get<AppConfig>('config');
      this.config = resposta.data;
      return this.config;
    } catch (erro) {
      console.error('Erro ao carregar configurações:', erro);
      return null;
    }
  }

  get valor(): AppConfig | null {
    return this.config;
  }
}
