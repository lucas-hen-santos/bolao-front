import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  // Verifica se o usuário está autenticado batendo no endpoint /me
  return http.get('/api/v1/users/me').pipe(
    map(() => {
      // Se deu sucesso (200), permite a navegação
      return true;
    }),
    catchError(() => {
      // Se deu erro (401), redireciona para login
      router.navigate(['/login']);
      return of(false);
    })
  );
};