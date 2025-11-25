import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError, from } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginResponse } from '../../pages/user/login/models/login-response.model';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    let authReq = req;

    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {

          if (!this.isRefreshing) {
            this.isRefreshing = true;

            return from(this.authService.refreshToken()).pipe(
              switchMap((loginresponse: LoginResponse) => {
                this.isRefreshing = false;

                const clonedRefresh = req.clone({
                  setHeaders: { Authorization: `Bearer ${loginresponse.token}` }
                });

                return next.handle(clonedRefresh);
              }),
              catchError(err => {
                this.isRefreshing = false;
                this.authService.logout();
                return throwError(() => err);
              })
            );
          }
        }

        return throwError(() => error);
      })
    );
  }
}
