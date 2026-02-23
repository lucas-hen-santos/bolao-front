import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router'; // <--- 1. Importar withInMemoryScrolling
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { PageTitleStrategy } from './strategies/title.strategy';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // 2. Configurar o Router com Scroll
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // <--- Força ir para o topo na navegação
        anchorScrolling: 'enabled'        // <--- Permite links com âncora (ex: #regras) funcionarem
      })
    ),
    
    provideHttpClient(
      withFetch(), 
      withInterceptors([credentialsInterceptor])
    ),

    { provide: TitleStrategy, useClass: PageTitleStrategy },

    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};