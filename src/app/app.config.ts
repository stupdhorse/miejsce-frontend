import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
// Importujemy funkcję, nie klasę
import { authInterceptor } from './shared/services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      // Teraz to zadziała poprawnie:
      withInterceptors([authInterceptor]) 
    )
  ]
};