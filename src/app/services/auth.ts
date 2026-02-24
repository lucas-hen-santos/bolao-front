import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, catchError, of } from 'rxjs'; // <-- of importado aqui
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(email: string, pass: string, rememberMe: boolean = false): Observable<any> {
    const body = new FormData();
    body.append('username', email);
    body.append('password', pass);
    body.append('remember_me', String(rememberMe)); 

    return this.http.post<any>(`${this.apiUrl}/login`, body).pipe(
      switchMap((res) => {
        // 1. Salva os tokens com segurança
        const token = res?.access_token || res?.token;
        if (token) {
          localStorage.setItem('access_token', token);
        }
        if (rememberMe && res?.refresh_token) {
          localStorage.setItem('refresh_token', res.refresh_token);
        }

        // 2. Busca o perfil
        return this.http.get<any>(`${environment.apiUrl}/users/me`).pipe(
          catchError((err) => {
            console.error("Erro na busca de perfil pós-login, forçando dashboard:", err);
            // Retorna um usuário falso comum para não disparar o erro no login.ts
            return of({ is_admin: false }); 
          })
        );
      }),
      tap((user) => {
        // 3. Roteamento garantido
        if (user && user.is_admin) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    return this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  register(name: string, email: string, pass: string): Observable<any> {
    const body = { full_name: name, email: email, password: pass };
    return this.http.post(`${environment.apiUrl}/users/`, body);
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