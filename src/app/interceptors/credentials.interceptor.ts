import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth';

// Variáveis globais para controlar a fila de requisições
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('access_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/login') && !req.url.includes('/refresh-token')) {
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null); 

          return authService.refreshToken().pipe(
            switchMap((res: any) => {
              isRefreshing = false;
              refreshTokenSubject.next(res.access_token);
              
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${res.access_token}` }
              }));
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout(); 
              return throwError(() => err);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(newToken => newToken !== null),
            take(1),
            switchMap((newToken) => {
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            })
          );
        }
      }
      
      return throwError(() => error);
    })
  );
};