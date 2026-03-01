import { inject, Injectable } from '@angular/core';
import { ApiData } from '@core/interfaces/api-response';
import { AppConfig } from '../interfaces/app-config';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Config {
  private _config: AppConfig = {} as AppConfig;
  private api = inject(Api);

  async load() {
    try {
      const response = (await this.api.get<AppConfig>('config')) as ApiData<AppConfig>;
      this._config = response.data!;
      if (!this._config) {
        throw new Error('Dados ausentes');
      }
    } catch (error) {
      console.error('Erro ao carregar a configuração:', error);
    }
  }

  get version() {
    return this._config.version;
  }

  get config(): AppConfig {
    return this._config;
  }

  get envirionment() {
    return this._config.environment;
  }

  get isProduction() {
    return this._config.environment === 'production';
  }

  get isDevelopment() {
    return this._config.environment === 'development';
  }

  get isStaging() {
    return this._config.environment === 'staging';
  }
}
