import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { ToastService } from '../services/toast';
import { environment } from '../../environments/environment';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const toast = inject(ToastService);

  return http.get<any>(`${environment.apiUrl}/users/me`).pipe(
    map((user) => {
      if (user && user.is_admin) {
        return true;
      } else {
        toast.show('Acesso negado. Área restrita.', 'error');
        router.navigate(['/dashboard']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};