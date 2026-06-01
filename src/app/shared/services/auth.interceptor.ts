import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError, from } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginResponse } from '../../pages/user/login/models/login-response.model';

// Zmienne stanu poza funkcją (zachowują się jak singleton dla tego modułu)
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Wstrzykiwanie zależności funkcją inject()
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

// Funkcja pomocnicza do dodawania nagłówka
const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
};

// Logika obsługi błędu 401 i odświeżania tokena
const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Blokujemy kolejkę

    return from(authService.refreshToken()).pipe(
      switchMap((response: any) => {
        // Zakładamy, że response to LoginResponse lub obiekt zawierający token
        // Jeśli Twoje API zwraca token inaczej, dostosuj tę linię:
        const newToken = response.token || response; 

        isRefreshing = false;
        refreshTokenSubject.next(newToken);
        return next(addTokenHeader(request, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Jeśli odświeżanie już trwa, czekamy na nowy token
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        return next(addTokenHeader(request, token!));
      })
    );
  }
};