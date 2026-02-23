import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`; // Prefixo /auth

  login(email: string, pass: string, rememberMe: boolean = false): Observable<any> {
    const body = new FormData();
    body.append('username', email);
    body.append('password', pass);
    body.append('remember_me', String(rememberMe)); 

    return this.http.post(`${this.apiUrl}/login`, body).pipe(
      // Nota: O endpoint /users/me fica em outro serviço, mas podemos chamar direto se preciso
      // ou idealmente usar o UserService. Aqui vou manter a chamada HTTP direta para simplificar
      switchMap(() => this.http.get<any>(`${environment.apiUrl}/users/me`)),
      tap((user) => {
        if (user.is_admin) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  register(name: string, email: string, pass: string): Observable<any> {
    const body = {
      full_name: name,
      email: email,
      password: pass
    };
    // Ajuste: register é em /users/ (post)
    return this.http.post(`${environment.apiUrl}/users/`, body);
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { 
      token: token, 
      new_password: newPassword 
    });
  }
}