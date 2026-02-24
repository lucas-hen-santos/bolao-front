import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Busca o token diretamente do navegador
  const token = localStorage.getItem('access_token');

  // Se o token existir, clona a requisição e injeta o cabeçalho
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Se não houver token (ex: durante o próprio login), segue normalmente
  return next(req);
};