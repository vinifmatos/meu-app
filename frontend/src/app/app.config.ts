import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  LOCALE_ID
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { pt_BR } from 'primelocale/js/pt_BR.js';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { routes } from './app.routes';
import { erroInterceptor } from '@core/interceptores/erro.interceptor';
import { ConfiguracaoService } from '@core/servicos/configuracao.service';
import { SimbolosService } from '@core/servicos/simbolos.service';

registerLocaleData(localePt, 'pt-BR');

const primengPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([erroInterceptor])),
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    ConfiguracaoService,
    SimbolosService,
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const config = inject(ConfiguracaoService);
        const simbolos = inject(SimbolosService);
        return async () => {
          await config.carregar();
          await simbolos.carregarSimbolos();
        };
      },
      multi: true,
    },
    provideAnimationsAsync(),
    providePrimeNG({
      translation: pt_BR,
      theme: {
        preset: primengPreset,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false,
        },
      },
    }),
    MessageService,
    ConfirmationService,
    DialogService,
  ],
};
