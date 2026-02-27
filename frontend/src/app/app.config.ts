import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { Config } from './core/services/config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    Config,
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const config = inject(Config);
        return () => config.load();
      },
      multi: true,
    },
  ],
};
