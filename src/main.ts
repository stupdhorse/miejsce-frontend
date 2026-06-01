import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/shared/services/auth.interceptor';
import { Observable } from 'rxjs';

export class CustomLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomLoader(http);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]) 
    ),
    provideTranslateService({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
}).catch(err => console.error(err));