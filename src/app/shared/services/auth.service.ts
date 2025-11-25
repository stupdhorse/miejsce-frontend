import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../../pages/user/login/models/login-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }
  baseURL = 'https://localhost:7185/api/Auth';

  createUser(formData: any) {
    return this.http.post(this.baseURL+'/register',formData);
  }

  SignInUser(data: { Username: string, Password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseURL}/login`, data)
      .pipe(
        tap(res => {
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('tokenExpiration', res.expiration);
        })
      );
  }

  getToken(): string|null{
    return sessionStorage.getItem('token');
  }

  refreshToken(): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.baseURL}/refresh-token`, {},{withCredentials: true})
    .pipe(
      tap(res => sessionStorage.setItem('token', res.token))
    );
}
  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpiration');
  }

}
