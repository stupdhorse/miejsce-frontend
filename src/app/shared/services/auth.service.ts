import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse } from '../../pages/user/login/models/login-response.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseURL = 'http://localhost/api/Auth';

  private loggedIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn$(): Observable<boolean>{
    return this.loggedIn.asObservable();
  }

  constructor(private http: HttpClient, private router: Router) {
    this.loggedIn.next(this.isLoggedIn());
   }

  createUser(formData: any) {
    return this.http.post(this.baseURL + '/register', formData);
  }

  SignInUser(data: { Username: string, Password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseURL}/login`, data)
      .pipe(
        tap(res => {
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('tokenExpiration', res.expiration);
          this.loggedIn.next(true);
        })
      );
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    const expiration = sessionStorage.getItem('tokenExpiration');

    if (!token || !expiration) {
      return false;
    }

    const now = new Date();
    const expDate = new Date(expiration);

    if (isNaN(expDate.getTime()) || now > expDate) {
      this.logout(); 
      return false;
    }
    return true;
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseURL}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
            sessionStorage.setItem('token', res.token);
            sessionStorage.setItem('tokenExpiration', res.expiration); 
        })
      );
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpiration');
    this.loggedIn.next(false);
    this.router.navigate(['/user/login']);
  }

  getCurrentUserProfileId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.UserProfileId ? Number(payload.UserProfileId) : null;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }
}